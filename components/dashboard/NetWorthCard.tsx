"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/utils/currency"
import { useAccounts } from "@/lib/hooks/useAccounts"
import { useTransactions } from "@/lib/hooks/useTransactions"

export function NetWorthCard() {
  const { data: accounts, loading: loadingAccounts } = useAccounts()
  const { data: tx, loading: loadingTx } = useTransactions()

  const start = React.useMemo(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  }, [])
  const txThisMonth = React.useMemo(() => tx.filter((t) => t.transaction_date >= start), [tx, start])

  const total = React.useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  )
  const incomeThisMonth = React.useMemo(
    () => txThisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [txThisMonth]
  )
  const expenseThisMonth = React.useMemo(
    () => txThisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [txThisMonth]
  )

  const [hidden, setHidden] = React.useState(false)
  const [animated, setAnimated] = React.useState(0)

  React.useEffect(() => {
    if (loadingAccounts) return
    let raf = 0
    const start = performance.now()
    const duration = 850
    const from = 0
    const to = total

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimated(Math.round(from + (to - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [loadingAccounts, total])

  const loading = loadingAccounts || loadingTx

  return (
    <Card className="bg-card border-border p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Total saldo</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="border-l-4 border-primary pl-3">
              <div className="text-3xl md:text-4xl font-light tabular">
                {loading ? "…" : hidden ? "••••••" : formatRupiah(animated)}
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setHidden((v) => !v)}
              aria-label={hidden ? "Tampilkan saldo" : "Sembunyikan saldo"}
            >
              {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full bg-muted px-3 py-1">
              <span className="text-accent-green">Pemasukan</span>{" "}
              <span className="tabular">{loading ? "…" : formatRupiah(incomeThisMonth)}</span>
            </div>
            <div className="rounded-full bg-muted px-3 py-1">
              <span className="text-accent-red">Pengeluaran</span>{" "}
              <span className="tabular">{loading ? "…" : formatRupiah(expenseThisMonth)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

