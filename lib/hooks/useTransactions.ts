"use client"

import * as React from "react"
import type { Transaction, TransactionType } from "@/lib/types/database"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { onDataChanged } from "@/lib/utils/events"

type TransactionsOptions = {
  limit?: number
  type?: TransactionType | "all"
  accountId?: string | "all"
  categoryId?: string | "all"
  from?: string
  to?: string
  search?: string
}

export function useTransactions(options?: TransactionsOptions) {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<Transaction[]>([])
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Supabase belum dikonfigurasi")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createSupabaseBrowserClient()
    let query = supabase
      .from("transactions")
      .select("id,user_id,account_id,category_id,type,amount,note,transaction_date,attachment_url,created_at")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })

    if (options?.type && options.type !== "all") query = query.eq("type", options.type)
    if (options?.accountId && options.accountId !== "all") query = query.eq("account_id", options.accountId)
    if (options?.categoryId && options.categoryId !== "all") query = query.eq("category_id", options.categoryId)
    if (options?.from) query = query.gte("transaction_date", options.from)
    if (options?.to) query = query.lte("transaction_date", options.to)
    if (options?.search) query = query.ilike("note", `%${options.search}%`)
    if (options?.limit) query = query.limit(options.limit)

    const { data: rows, error } = await query
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setData((rows ?? []) as Transaction[])
    setLoading(false)
  }, [
    options?.accountId,
    options?.categoryId,
    options?.from,
    options?.limit,
    options?.search,
    options?.to,
    options?.type,
  ])

  React.useEffect(() => {
    fetchData()
    const off = onDataChanged((key) => {
      if (key === "transactions" || key === "accounts" || key === "categories") fetchData()
    })
    return off
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

