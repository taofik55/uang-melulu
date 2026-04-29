"use client"

import { CheckCircle2 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/utils/currency"
import { sisaHari } from "@/lib/utils/date"
import { useSavings } from "@/lib/hooks/useSavings"

function Ring({ value }: { value: number }) {
  const r = 18
  const c = 2 * Math.PI * r
  const dash = (value / 100) * c
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 24 24)"
      />
    </svg>
  )
}

export function GoalCard() {
  const { data: goals, loading } = useSavings()

  if (loading) {
    return <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Memuat target…</Card>
  }

  if (goals.length === 0) {
    return <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Belum ada target tabungan.</Card>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((g) => {
        const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100))
        const done = pct >= 100
        return (
          <Card key={g.id} className="bg-card border-border p-4 relative overflow-hidden">
            {done ? (
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-xs text-primary">
                Lunas <CheckCircle2 className="size-3" />
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl leading-none">{g.icon ?? "🎯"}</div>
                <div className="mt-2 text-sm font-semibold">{g.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{g.target_date ? sisaHari(g.target_date) : ""}</div>
              </div>
              <Ring value={pct} />
            </div>
            <div className="mt-4 text-sm tabular">
              {formatRupiah(g.current_amount)}{" "}
              <span className="text-muted-foreground">/ {formatRupiah(g.target_amount)}</span>
            </div>
            <div className="mt-4">
              <Button className="w-full" variant={done ? "secondary" : "default"}>
                + Setor
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

