"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/utils/currency"
import { useInvestments } from "@/lib/hooks/useInvestments"

export function InvestmentCard() {
  const { data: investments, loading } = useInvestments()
  const totalInitial = investments.reduce((s, i) => s + i.initial_amount, 0)
  const totalCurrent = investments.reduce((s, i) => s + i.current_value, 0)
  const pnl = totalCurrent - totalInitial
  const pnlPct = totalInitial > 0 ? (pnl / totalInitial) * 100 : 0

  const [openId, setOpenId] = React.useState<string | null>(null)

  if (loading) {
    return <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Memuat investasi…</Card>
  }

  if (investments.length === 0) {
    return <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Belum ada investasi.</Card>
  }

  return (
    <div className="space-y-3">
      <Card className="bg-card border-border p-4">
        <div className="text-sm text-muted-foreground">Ringkasan</div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div className="text-xl font-semibold tabular">
            {formatRupiah(totalInitial)} → {formatRupiah(totalCurrent)}
          </div>
          <div className={"text-sm tabular font-semibold " + (pnl >= 0 ? "text-accent-green" : "text-accent-red")}>
            {pnl >= 0 ? "+" : "-"}
            {formatRupiah(Math.abs(pnl))} ({pnlPct.toFixed(1)}%)
          </div>
        </div>
      </Card>

      {investments.map((i) => {
        const expanded = openId === i.id
        const pnlItem = i.current_value - i.initial_amount
        const pnlItemPct = i.initial_amount > 0 ? (pnlItem / i.initial_amount) * 100 : 0
        return (
          <Card key={i.id} className="bg-card border-border p-4">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setOpenId((v) => (v === i.id ? null : i.id))}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{i.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {i.platform ?? "Tanpa platform"}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground tabular">
                    {formatRupiah(i.initial_amount)} → {formatRupiah(i.current_value)}
                  </div>
                  <div className={"mt-1 text-xs tabular " + (pnlItem >= 0 ? "text-accent-green" : "text-accent-red")}>
                    {pnlItem >= 0 ? "+" : "-"}
                    {formatRupiah(Math.abs(pnlItem))} ({pnlItemPct.toFixed(1)}%)
                  </div>
                </div>
                <ChevronDown className={"size-4 text-muted-foreground transition " + (expanded ? "rotate-180" : "")} />
              </div>
            </button>
            {expanded ? (
              <div className="mt-4 rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground">
                Tabel transaksi investasi segera hadir.
              </div>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}

