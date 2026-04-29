"use client"

import { AlertTriangle } from "lucide-react"
import { addDays, endOfMonth, endOfYear, parseISO } from "date-fns"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatRupiah } from "@/lib/utils/currency"
import { useBudgets } from "@/lib/hooks/useBudgets"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useCategories } from "@/lib/hooks/useCategories"

export function BudgetAlerts() {
  const { data: budgets } = useBudgets()
  const { data: tx } = useTransactions()
  const { data: categories } = useCategories()

  const alerts = budgets
    .map((b) => {
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
        icon: category?.icon ?? "✨",
        name: category?.name ?? "Kategori",
        used,
        total: b.amount,
      }
    })
    .filter((b) => b.total > 0 && b.used / b.total >= 0.7)

  if (alerts.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-sm text-muted-foreground">Peringatan anggaran</div>
        <AlertTriangle className="size-4 text-accent-amber" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {alerts.map((b) => {
          const pct = Math.round((b.used / b.total) * 100)
          const tone = pct >= 90 ? "bg-accent-red" : pct >= 80 ? "bg-accent-amber" : "bg-primary"
          return (
            <Card key={b.id} className="min-w-[260px] bg-card border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-xl leading-none">{b.icon}</div>
                  <div>
                    <div className="text-sm font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground tabular">
                      {formatRupiah(b.used)} / {formatRupiah(b.total)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground tabular">{pct}%</div>
              </div>
              <div className="mt-3">
                <Progress value={pct} className="h-2" indicatorClassName={tone} />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

