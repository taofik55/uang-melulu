"use client"

import { Search } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export function TransactionFilters() {
  return (
    <Card className="bg-card border-border p-3 sticky top-14 md:top-0 z-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs defaultValue="all" className="w-full md:w-auto">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:max-w-xs">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input className="pl-9" placeholder="Cari catatan…" />
        </div>
      </div>
    </Card>
  )
}

