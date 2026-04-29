"use client"

import Link from "next/link"
import { ReceiptText } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { TransactionRow } from "@/components/transaksi/TransactionRow"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useAccounts } from "@/lib/hooks/useAccounts"
import { useCategories } from "@/lib/hooks/useCategories"

export function RecentTransactions() {
  const { data, loading } = useTransactions()
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const recent = data.slice(0, 7)
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]))
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">Transaksi terbaru</div>
        <Link href="/transaksi" className="text-sm text-primary hover:underline">
          Lihat semua →
        </Link>
      </div>

      <div className="space-y-2">
        {loading ? (
          <>
            <SkeletonCard variant="transaction" />
            <SkeletonCard variant="transaction" />
            <SkeletonCard variant="transaction" />
          </>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Belum ada data"
            description="Belum ada transaksi. Yuk mulai catat!"
          />
        ) : (
          recent.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              accountLabel={accountMap.get(t.account_id)}
              categoryLabel={t.category_id ? categoryMap.get(t.category_id)?.name : "Tanpa kategori"}
              categoryIcon={t.category_id ? categoryMap.get(t.category_id)?.icon : "✨"}
            />
          ))
        )}
      </div>
    </div>
  )
}

