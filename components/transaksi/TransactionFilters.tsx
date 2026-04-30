"use client"

import { Search } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import type { TransactionType } from "@/lib/types/database"

export type TransactionFilterType = "all" | TransactionType

export function TransactionFilters({
  type,
  onTypeChange,
  query,
  onQueryChange,
}: {
  type: TransactionFilterType
  onTypeChange: (next: TransactionFilterType) => void
  query: string
  onQueryChange: (next: string) => void
}) {
  return (
    <Card className="bg-card border-border p-3 sticky top-16 md:top-0 z-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={type} onValueChange={(v) => onTypeChange(v as TransactionFilterType)} className="w-full md:w-auto">
          <TabsList className="w-full md:w-auto overflow-x-auto justify-start">
            <TabsTrigger className="shrink-0" value="all">
              Semua
            </TabsTrigger>
            <TabsTrigger className="shrink-0" value="income">
              Pemasukan
            </TabsTrigger>
            <TabsTrigger className="shrink-0" value="expense">
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger className="shrink-0" value="transfer">
              Transfer
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:max-w-xs">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Cari catatan…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
      </div>
    </Card>
  )
}

