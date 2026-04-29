"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/utils/currency"
import { sisaHari } from "@/lib/utils/date"
import { useLoans } from "@/lib/hooks/useLoans"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")
}

export function LoanCard() {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const { data: loans, loading } = useLoans()

  if (loading) {
    return <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Memuat pinjaman…</Card>
  }

  if (loans.length === 0) {
    return <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Belum ada data pinjaman.</Card>
  }

  return (
    <div className="space-y-3">
      {loans.map((l) => {
        const settled = l.remaining_amount <= 0
        const overdue = !settled && l.due_date ? sisaHari(l.due_date).startsWith("Terlambat") : false
        const badge = settled ? (
          <Badge className="bg-primary/15 text-primary border border-border" variant="secondary">
            Lunas
          </Badge>
        ) : overdue ? (
          <Badge className="bg-accent-red/15 text-accent-red border border-border" variant="secondary">
            Overdue
          </Badge>
        ) : (
          <Badge className="bg-accent-amber/15 text-accent-amber border border-border" variant="secondary">
            Aktif
          </Badge>
        )

        const expanded = openId === l.id

        return (
          <Card key={l.id} className="bg-card border-border p-4">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setOpenId((v) => (v === l.id ? null : l.id))}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/15 text-primary grid place-items-center border border-border text-sm font-semibold">
                    {initials(l.contact_name)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{l.contact_name}</div>
                    <div className="text-xs text-muted-foreground tabular">
                      {formatRupiah(l.original_amount)} → {formatRupiah(l.remaining_amount)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{l.due_date ? sisaHari(l.due_date) : ""}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {badge}
                  <ChevronDown className={"size-4 text-muted-foreground transition " + (expanded ? "rotate-180" : "")} />
                </div>
              </div>
            </button>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {l.direction === "borrowed" ? "Kamu berhutang" : "Kamu meminjamkan"}
              </div>
              <Button variant="secondary">Catat Pembayaran</Button>
            </div>

            {expanded ? (
              <div className="mt-4 rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground">
                Riwayat pembayaran segera hadir.
              </div>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}

