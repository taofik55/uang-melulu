"use client"

import { Card } from "@/components/ui/card"
import { formatRupiah } from "@/lib/utils/currency"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useCategories } from "@/lib/hooks/useCategories"

export function TopCategories() {
  const { data: tx } = useTransactions()
  const { data: categories } = useCategories()

  const start = new Date()
  start.setDate(1)
  const startIso = start.toISOString().slice(0, 10)

  const byCategory = new Map<string, number>()
  for (const t of tx) {
    if (t.type !== "expense") continue
    if (t.transaction_date < startIso) continue
    const key = t.category_id ?? "none"
    byCategory.set(key, (byCategory.get(key) ?? 0) + t.amount)
  }

  const data = Array.from(byCategory.entries())
    .map(([categoryId, value]) => {
      const c = categoryId === "none" ? null : categories.find((x) => x.id === categoryId)
      return { name: c?.name ?? "Tanpa kategori", value, icon: c?.icon ?? "✨" }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border p-4">
        <div className="text-sm font-semibold">Top Kategori Pengeluaran</div>
        <div className="mt-4 text-sm text-muted-foreground">Belum ada data pengeluaran bulan ini.</div>
      </Card>
    )
  }

  const max = Math.max(...data.map((d) => d.value))

  return (
    <Card className="bg-card border-border p-4">
      <div className="text-sm font-semibold">Top Kategori Pengeluaran</div>
      <div className="mt-4 space-y-3">
        {data.map((d) => {
          const pct = max > 0 ? Math.round((d.value / max) * 100) : 0
          return (
            <div key={d.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-lg leading-none">{d.icon}</div>
                  <div className="text-sm font-medium truncate">{d.name}</div>
                </div>
                <div className="text-sm tabular text-muted-foreground">{formatRupiah(d.value)}</div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

