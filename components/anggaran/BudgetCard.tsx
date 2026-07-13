"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { addDays, endOfMonth, endOfYear, parseISO, format, startOfMonth, setMonth as dfSetMonth, setYear as dfSetYear } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SelectPopover } from "@/components/shared/SelectPopover"
import { formatRupiah } from "@/lib/utils/currency"
import { useBudgets } from "@/lib/hooks/useBudgets"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useCategories } from "@/lib/hooks/useCategories"
import type { Transaction } from "@/lib/types/database"

const MONTH_OPTIONS = [
  { value: "0", label: "Januari" },
  { value: "1", label: "Februari" },
  { value: "2", label: "Maret" },
  { value: "3", label: "April" },
  { value: "4", label: "Mei" },
  { value: "5", label: "Juni" },
  { value: "6", label: "Juli" },
  { value: "7", label: "Agustus" },
  { value: "8", label: "September" },
  { value: "9", label: "Oktober" },
  { value: "10", label: "November" },
  { value: "11", label: "Desember" },
]

function getYearOptions() {
  const currentYear = new Date().getFullYear()
  const years: { value: string; label: string }[] = []
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    years.push({ value: String(y), label: String(y) })
  }
  return years
}

export function BudgetCard() {
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(() => startOfMonth(new Date()))
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const { data: budgets, loading } = useBudgets()
  const { data: tx } = useTransactions()
  const { data: categories } = useCategories()

  // 1. Calculate start and end of selected month in local timezone (no UTC shift)
  const monthStartStr = format(startOfMonth(selectedMonth), "yyyy-MM-dd")
  const monthEndStr = format(endOfMonth(selectedMonth), "yyyy-MM-dd")

  // 2. Filter budgets that overlap with the selected month
  const activeBudgets = budgets.filter((b) => {
    const bStart = parseISO(b.start_date)
    const bEnd = b.end_date
      ? parseISO(b.end_date)
      : b.period === "weekly"
        ? addDays(bStart, 6)
        : b.period === "yearly"
          ? endOfYear(bStart)
          : endOfMonth(bStart)

    // Use format() to stay in local timezone
    const bStartStr = format(bStart, "yyyy-MM-dd")
    const bEndStr = format(bEnd, "yyyy-MM-dd")

    // Overlap: budget active if its range overlaps with selected month
    return bStartStr <= monthEndStr && bEndStr >= monthStartStr
  })

  // 3. Map active budgets to UI display (include matched transactions for expand)
  const items = activeBudgets.map((b) => {
    const startDate = parseISO(b.start_date)
    const endDate = b.end_date
      ? parseISO(b.end_date)
      : b.period === "weekly"
        ? addDays(startDate, 6)
        : b.period === "yearly"
          ? endOfYear(startDate)
          : endOfMonth(startDate)

    // Timezone-safe formatting
    const startIso = format(startDate, "yyyy-MM-dd")
    const endIso = format(endDate, "yyyy-MM-dd")

    // Restrict transactions to both the budget range AND the selected month window
    const targetStart = startIso > monthStartStr ? startIso : monthStartStr
    const targetEnd = endIso < monthEndStr ? endIso : monthEndStr

    const matchedTx = tx.filter(
      (t) =>
        t.type === "expense" &&
        t.category_id === b.category_id &&
        t.transaction_date >= targetStart &&
        t.transaction_date <= targetEnd
    )

    const used = matchedTx.reduce((sum, t) => sum + t.amount, 0)

    const category = categories.find((c) => c.id === b.category_id)
    return {
      id: b.id,
      categoryId: b.category_id,
      name: category?.name ?? "Kategori",
      icon: category?.icon ?? "✨",
      total: b.amount,
      used,
      transactions: matchedTx,
    }
  })

  const totalBudget = items.reduce((s, b) => s + b.total, 0)
  const totalUsed = items.reduce((s, b) => s + b.used, 0)
  const pctTotal = totalBudget > 0 ? Math.min(Math.round((totalUsed / totalBudget) * 100), 100) : 0

  const isCurrentMonth = format(selectedMonth, "yyyy-MM") === format(new Date(), "yyyy-MM")

  const selectedMonthIndex = selectedMonth.getMonth()
  const selectedYear = selectedMonth.getFullYear()

  return (
    <div className="space-y-4">
      {/* Year + Month Selector */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SelectPopover
            value={String(selectedMonthIndex)}
            onChange={(v) => {
              setSelectedMonth((prev) => startOfMonth(dfSetMonth(prev, Number(v))))
            }}
            placeholder="Bulan"
            options={MONTH_OPTIONS}
          />
        </div>
        <div className="w-28">
          <SelectPopover
            value={String(selectedYear)}
            onChange={(v) => {
              setSelectedMonth((prev) => startOfMonth(dfSetYear(prev, Number(v))))
            }}
            placeholder="Tahun"
            options={getYearOptions()}
          />
        </div>
      </div>

      {/* Main Budget Summary Card */}
      <Card className="bg-card border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total dianggarkan</div>
            <div className="mt-1 text-xl font-semibold tabular">{formatRupiah(totalBudget)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Terpakai</div>
            <div className="mt-1 text-xl font-semibold tabular text-accent-red">{formatRupiah(totalUsed)}</div>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={pctTotal} />
        </div>
        {!isCurrentMonth && items.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {pctTotal > 100
              ? `⚠️ Melebihi anggaran (${pctTotal}%)`
              : `✅ Dalam anggaran (${pctTotal}%)`}
          </div>
        )}
      </Card>

      {/* Category Budget Breakdown */}
      {loading ? (
        <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Memuat anggaran…</Card>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border p-4 text-sm text-muted-foreground text-center">
          Tidak ada anggaran aktif untuk bulan ini.
        </Card>
      ) : (
        items.map((b) => {
          const pct = b.total > 0 ? Math.round((b.used / b.total) * 100) : 0
          const tone = pct >= 100 ? "bg-accent-red" : pct >= 80 ? "bg-accent-amber" : "bg-primary"
          const isExpanded = expandedId === b.id
          return (
            <Card key={b.id} className="bg-card border-border overflow-hidden">
              <button
                type="button"
                className="w-full text-left p-4"
                onClick={() => setExpandedId(isExpanded ? null : b.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="text-xl leading-none">{b.icon}</div>
                    <div>
                      <div className="text-sm font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground tabular">
                        {formatRupiah(b.used)} dari {formatRupiah(b.total)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs tabular ${pct >= 100 ? "text-accent-red font-semibold" : "text-muted-foreground"}`}>{pct}%</div>
                    {isExpanded
                      ? <ChevronUp className="size-4 text-muted-foreground transition-transform" />
                      : <ChevronDown className="size-4 text-muted-foreground transition-transform" />
                    }
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={Math.min(pct, 100)} indicatorClassName={tone} />
                </div>
              </button>

              {/* Expanded transaction list */}
              {isExpanded && (
                <TransactionList
                  transactions={b.transactions}
                />
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}

/* ─── Transaction list inside expanded budget card ─── */

function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="px-4 pb-4 pt-1">
        <div className="border-t border-border" />
        <div className="pt-3 text-xs text-muted-foreground text-center">Belum ada transaksi di kategori ini.</div>
      </div>
    )
  }

  // Sort by date desc, then by created_at desc
  const sorted = [...transactions].sort((a, b) => {
    if (a.transaction_date !== b.transaction_date) return b.transaction_date.localeCompare(a.transaction_date)
    return b.created_at.localeCompare(a.created_at)
  })

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="border-t border-border" />
      <div className="pt-3 space-y-2">
        {sorted.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{t.note || "Tanpa catatan"}</div>
              <div className="text-[11px] text-muted-foreground tabular">
                {format(parseISO(t.transaction_date), "d MMM yyyy", { locale: idLocale })}
              </div>
            </div>
            <div className="text-xs font-medium tabular text-accent-red shrink-0">
              -{formatRupiah(t.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
