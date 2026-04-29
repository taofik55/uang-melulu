"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns"

import { Card } from "@/components/ui/card"
import { formatRupiah } from "@/lib/utils/currency"
import { useAccounts } from "@/lib/hooks/useAccounts"
import { useTransactions } from "@/lib/hooks/useTransactions"

export function BalanceTrend() {
  const { data: accounts } = useAccounts()
  const { data: tx } = useTransactions()

  if (accounts.length === 0) {
    return (
      <Card className="bg-card border-border p-4">
        <div className="text-sm font-semibold">Tren Saldo Akun</div>
        <div className="mt-4 text-sm text-muted-foreground">Belum ada akun.</div>
      </Card>
    )
  }

  const colors = ["hsl(var(--primary))", "hsl(var(--accent-amber))", "hsl(var(--accent-green))", "hsl(var(--accent-red))"]

  const data = Array.from({ length: 4 }).map((_, idx) => {
    const start = startOfWeek(subWeeks(new Date(), 3 - idx), { weekStartsOn: 1 })
    const end = endOfWeek(start, { weekStartsOn: 1 })
    const startIso = format(start, "yyyy-MM-dd")
    const endIso = format(end, "yyyy-MM-dd")

    const row: Record<string, number | string> = { label: `M${idx + 1}` }
    for (const a of accounts) {
      const net = tx
        .filter((t) => t.account_id === a.id && t.transaction_date >= startIso && t.transaction_date <= endIso)
        .reduce((sum, t) => sum + (t.type === "income" ? t.amount : t.type === "expense" ? -t.amount : 0), 0)
      row[a.name] = net
    }
    return row
  })

  return (
    <Card className="bg-card border-border p-4">
      <div className="text-sm font-semibold">Tren Arus Kas Akun</div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 6, right: 6 }}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={48} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background-card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
              }}
              formatter={(value: number) => formatRupiah(value)}
            />
            {accounts.map((a, i) => (
              <Line
                key={a.id}
                type="monotone"
                dataKey={a.name}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
