"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { addDays, format, parseISO, startOfWeek } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import { Card } from "@/components/ui/card"
import { formatRupiah } from "@/lib/utils/currency"
import { useTransactions } from "@/lib/hooks/useTransactions"

export function IncomeExpenseChart() {
  const { data: tx } = useTransactions()

  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  const data = Array.from({ length: 7 }).map((_, idx) => {
    const d = addDays(start, idx)
    const iso = format(d, "yyyy-MM-dd")
    const income = tx
      .filter((t) => t.type === "income" && t.transaction_date === iso)
      .reduce((s, t) => s + t.amount, 0)
    const expense = tx
      .filter((t) => t.type === "expense" && t.transaction_date === iso)
      .reduce((s, t) => s + t.amount, 0)
    return {
      label: format(parseISO(iso), "EEE", { locale: idLocale }),
      income,
      expense,
    }
  })

  return (
    <Card className="bg-card border-border p-4">
      <div className="text-sm font-semibold">Pemasukan vs Pengeluaran</div>
      <div className="text-sm text-muted-foreground">Periode: minggu ini</div>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 6, right: 6 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
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
            <Bar dataKey="income" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="hsl(var(--accent-red))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

