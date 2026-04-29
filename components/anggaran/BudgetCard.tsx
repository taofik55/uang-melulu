"use client"

import { ChevronDown } from "lucide-react"
import { addDays, endOfMonth, endOfYear, parseISO } from "date-fns"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatRupiah } from "@/lib/utils/currency"
import { useBudgets } from "@/lib/hooks/useBudgets"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useCategories } from "@/lib/hooks/useCategories"

export function BudgetCard() {
  const { data: budgets, loading } = useBudgets()
  const { data: tx } = useTransactions()
  const { data: categories } = useCategories()

  const items = budgets.map((b) => {
    const startDate = parseISO(b.start_date)
    const endDate = b.end_date
      ? parseISO(b.end_date)
      : b.period === "weekly"
        ? addDays(startDate, 6)
        : b.period === "yearly"
          ? endOfYear(startDate)
          : endOfMonth(startDate)
    const startIso = startDate.toISOString().slice(0, 10)
    const endIso = endDate.toISOString().slice(0, 10)

    const used = tx
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category_id === b.category_id &&
          t.transaction_date >= startIso &&
          t.transaction_date <= endIso
      )
      .reduce((sum, t) => sum + t.amount, 0)
    const category = categories.find((c) => c.id === b.category_id)
    return {
      id: b.id,
      name: category?.name ?? "Kategori",
      icon: category?.icon ?? "✨",
      total: b.amount,
      used,
    }
  })

  const totalBudget = items.reduce((s, b) => s + b.total, 0)
  const totalUsed = items.reduce((s, b) => s + b.used, 0)
  const pctTotal = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0

  return (
    <div className="space-y-3">
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
      </Card>

      {loading ? (
        <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Memuat anggaran…</Card>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Belum ada anggaran.</Card>
      ) : (
        items.map((b) => {
        const pct = Math.round((b.used / b.total) * 100)
        const tone = pct >= 90 ? "bg-accent-red" : pct >= 80 ? "bg-accent-amber" : "bg-primary"
        return (
          <Card key={b.id} className="bg-card border-border p-4">
            <button type="button" className="w-full text-left">
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
                  <div className="text-xs text-muted-foreground tabular">{pct}%</div>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={pct} indicatorClassName={tone} />
              </div>
            </button>
          </Card>
        )
      }))}
    </div>
  )
}

