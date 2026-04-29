"use client"

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react"

import type { Transaction } from "@/lib/types/database"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/utils/currency"
import { formatTanggal } from "@/lib/utils/date"

export function TransactionRow({
  transaction,
  categoryLabel,
  categoryIcon,
  accountLabel,
}: {
  transaction: Transaction
  categoryLabel?: string
  categoryIcon?: string | null
  accountLabel?: string
}) {
  const icon = categoryIcon ?? "✨"
  const label = categoryLabel ?? "Tanpa kategori"

  const amountColor =
    transaction.type === "income"
      ? "text-accent-green"
      : transaction.type === "expense"
        ? "text-accent-red"
        : "text-foreground"

  const Icon =
    transaction.type === "income" ? ArrowUpRight : transaction.type === "expense" ? ArrowDownLeft : ArrowLeftRight

  return (
    <Card className="bg-card border-border p-3">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted grid place-items-center border border-border">
          <span className="text-lg leading-none">{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{label}</div>
              <div className="text-xs text-muted-foreground truncate">{transaction.note ?? "Tanpa catatan"}</div>
            </div>
            <div className="text-right">
              <div className={"text-sm font-semibold tabular " + amountColor}>
                {transaction.type === "expense" ? "-" : transaction.type === "income" ? "+" : ""}
                {formatRupiah(transaction.amount)}
              </div>
              <div className="text-xs text-muted-foreground">{formatTanggal(transaction.transaction_date)}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {accountLabel ?? "Akun"}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon className="size-3" />
              <span>
                {transaction.type === "income" ? "Pemasukan" : transaction.type === "expense" ? "Pengeluaran" : "Transfer"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

