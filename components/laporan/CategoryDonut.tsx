"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card } from "@/components/ui/card"
import { formatRupiah } from "@/lib/utils/currency"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useCategories } from "@/lib/hooks/useCategories"

export function CategoryDonut() {
  const { data: tx } = useTransactions()
  const { data: categories } = useCategories()

  const start = new Date()
  start.setDate(1)
  const startIso = start.toISOString().slice(0, 10)

  const expenses = tx.filter((t) => t.type === "expense" && t.transaction_date >= startIso && t.category_id)
  const byCategory = new Map<string, number>()
  for (const t of expenses) {
    if (!t.category_id) continue
    byCategory.set(t.category_id, (byCategory.get(t.category_id) ?? 0) + t.amount)
  }

  const palette = ["#ef4444", "#f97316", "#eab308", "#06b6d4", "#8b5cf6", "#22c55e", "#0ea5e9", "#f43f5e"]
  const data = Array.from(byCategory.entries())
    .map(([categoryId, value], idx) => {
      const c = categories.find((x) => x.id === categoryId)
      return {
        name: c?.name ?? "Kategori",
        value,
        color: c?.color ?? palette[idx % palette.length],
        icon: c?.icon ?? "✨",
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card className="bg-card border-border p-4">
      <div className="text-sm font-semibold">Pengeluaran per Kategori</div>
      <div className="mt-4 grid gap-4 md:grid-cols-5">
        <div className="h-56 md:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background-card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                }}
                formatter={(value: number) => formatRupiah(value)}
              />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="-mt-36 text-center pointer-events-none">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-semibold tabular">{formatRupiah(total)}</div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-2">
          {data.map((d) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
            return (
              <div key={d.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-lg leading-none">{d.icon}</div>
                  <div className="text-sm font-medium truncate">{d.name}</div>
                </div>
                <div className="text-sm tabular text-muted-foreground">
                  {formatRupiah(d.value)} ({pct}%)
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

