"use client"

import { useMemo } from "react"
import { Plus } from "lucide-react"

import { Card } from "@/components/ui/card"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { TransactionRow } from "@/components/transaksi/TransactionRow"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useAccounts } from "@/lib/hooks/useAccounts"
import { useCategories } from "@/lib/hooks/useCategories"
import { groupByDate } from "@/lib/utils/date"
import { AddTransactionModal } from "@/components/transaksi/AddTransactionModal"
import { EditTransactionModal } from "@/components/transaksi/EditTransactionModal"
import { useTransfers } from "@/lib/hooks/useTransfers";
import type { TransactionType } from "@/lib/types/database"

export function TransactionList({
  type = "all",
  query = "",
}: {
  type?: "all" | TransactionType
  query?: string
}) {
  const { data, loading } = useTransactions()
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts])
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const normalizedQuery = query.trim().toLowerCase()

  const { data: transfers } = useTransfers();
  const transactionMap = useMemo(() => {
    const map = new Map<string, any>();
    data.forEach((t) => {
      map.set(t.id, t);
    });
    return map;
  }, [data]);

  const filtered = useMemo(() => {
    let rows = data

    if (type !== "all") {
      rows = rows.filter((t) => t.type === type)
    }

    if (!normalizedQuery) return rows

    return rows.filter((t) => {
      const accountName = accountMap.get(t.account_id) ?? ""
      const categoryName = t.category_id ? categoryMap.get(t.category_id)?.name ?? "" : ""
      const note = t.note ?? ""
      return (
        note.toLowerCase().includes(normalizedQuery) ||
        accountName.toLowerCase().includes(normalizedQuery) ||
        categoryName.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [data, type, normalizedQuery, accountMap, categoryMap])

  const grouped = useMemo(() => {
    const groups = groupByDate(filtered);
    const skipped = new Set<string>();
    return groups.map((g) => {
      const rows = g.data.filter((t) => {
        if (skipped.has(t.id)) return false;
        // Find any transfer involving this transaction
        const tr = transfers?.find(
          (tr) => tr.from_transaction_id === t.id || tr.to_transaction_id === t.id
        );
        if (tr) {
          // If this is the source transaction, attach destination label and skip the dest
          if (tr.from_transaction_id === t.id) {
            const toTx = transactionMap.get(tr.to_transaction_id);
            if (toTx) {
              const toAccount = accountMap.get(toTx.account_id);
              (t as any).toAccountLabel = toAccount;
              skipped.add(toTx.id);
            }
            return true;
          }
          // This is the destination transaction; skip it
          return false;
        }
        return true;
      });
      return { ...g, data: rows };
    });
  }, [filtered, transfers, transactionMap, accountMap]);

  return (
    <div className="space-y-3">
      <div className="hidden md:flex justify-end">
        <AddTransactionModal
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              <Plus className="size-4" />
              Tambah
            </button>
          }
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          <SkeletonCard variant="transaction" />
          <SkeletonCard variant="transaction" />
          <SkeletonCard variant="transaction" />
          <SkeletonCard variant="transaction" />
        </div>
      ) : grouped.length === 0 ? (
        <Card className="bg-card border-border p-6 text-center">
          <div className="font-semibold">Belum ada data</div>
          <div className="text-sm text-muted-foreground mt-1">
            {query.trim() || type !== "all" ? "Tidak ada transaksi yang cocok dengan filter." : "Belum ada transaksi. Yuk mulai catat!"}
          </div>
        </Card>
      ) : (
        grouped.map((g) => (
          <div key={g.label} className="space-y-2">
            <div className="sticky top-[118px] md:top-4 z-10 bg-background/80 backdrop-blur py-1">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-muted-foreground">{g.label}</div>
                <div className="text-xs text-muted-foreground tabular">{g.data.length} transaksi</div>
              </div>
            </div>
            <div className="space-y-2">
              {g.data.map((t) => (
                <EditTransactionModal
                  key={t.id}
                  transaction={t}
                  trigger={
                    <button
                      type="button"
                      className="w-full text-left focus:outline-none transition active:scale-[0.99] hover:opacity-90"
                    >
                      <TransactionRow
                        transaction={t}
                        accountLabel={accountMap.get(t.account_id)}
                        categoryLabel={t.category_id ? categoryMap.get(t.category_id)?.name : "Tanpa kategori"}
                        categoryIcon={t.category_id ? categoryMap.get(t.category_id)?.icon : "✨"}
                        toAccountLabel={(t as any).toAccountLabel}
                      />
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        ))
      )}

      <div className="md:hidden">
        <div className="fixed bottom-20 right-4 z-40">
          <AddTransactionModal
            trigger={
              <button
                type="button"
                className="size-12 rounded-full bg-primary text-primary-foreground shadow-lg grid place-items-center"
                aria-label="Tambah transaksi"
              >
                <Plus className="size-5" />
              </button>
            }
          />
        </div>
      </div>
    </div>
  )
}

