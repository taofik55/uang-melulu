"use client"

import * as React from "react"

import { TransactionFilters } from "@/components/transaksi/TransactionFilters"
import { TransactionList } from "@/components/transaksi/TransactionList"

export default function TransaksiPage() {
  const [type, setType] = React.useState<React.ComponentProps<typeof TransactionFilters>["type"]>("all")
  const [query, setQuery] = React.useState("")

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Transaksi</div>
        <div className="text-sm text-muted-foreground">Pantau arus kas kamu dengan rapi</div>
      </div>
      <TransactionFilters type={type} onTypeChange={setType} query={query} onQueryChange={setQuery} />
      <TransactionList type={type} query={query} />
    </div>
  )
}

