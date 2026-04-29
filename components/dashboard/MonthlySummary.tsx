"use client"

import { TrendingDown, TrendingUp } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatRupiah } from "@/lib/utils/currency"
import { useTransactions } from "@/lib/hooks/useTransactions"

export function MonthlySummary() {
  const { data, loading } = useTransactions()

  const start = new Date()
  start.setDate(1)
  const startIso = start.toISOString().slice(0, 10)
  const inMonth = data.filter((t) => t.transaction_date >= startIso)

  const income = inMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const expense = inMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const total = income + expense
  const ratio = total > 0 ? Math.round((expense / total) * 100) : 0

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card className="bg-card border-border p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Pemasukan bulan ini</div>
            <div className="mt-2 text-xl font-semibold tabular text-primary">
              {loading ? "…" : formatRupiah(income)}
            </div>
          </div>
          <div className="size-10 rounded-2xl bg-primary/15 text-primary grid place-items-center border border-border">
            <TrendingUp className="size-4" />
          </div>
        </div>
      </Card>

      <Card className="bg-card border-border p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Pengeluaran bulan ini</div>
            <div className="mt-2 text-xl font-semibold tabular text-accent-red">
              {loading ? "…" : formatRupiah(expense)}
            </div>
          </div>
          <div className="size-10 rounded-2xl bg-accent-red/15 text-accent-red grid place-items-center border border-border">
            <TrendingDown className="size-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Rasio pengeluaran</span>
            <span className="tabular">{loading ? "…" : `${ratio}%`}</span>
          </div>
          <Progress value={loading ? 0 : ratio} className="mt-2" />
        </div>
      </Card>
    </div>
  )
}

