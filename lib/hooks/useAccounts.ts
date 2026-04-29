"use client"

import * as React from "react"
import type { Account } from "@/lib/types/database"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { onDataChanged } from "@/lib/utils/events"

export function useAccounts() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<Account[]>([])
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
    const { data: rows, error } = await supabase
      .from("accounts")
      .select("id,user_id,name,type,balance,currency,icon,is_active,created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setData((rows ?? []) as Account[])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
    const off = onDataChanged((key) => {
      if (key === "accounts" || key === "transactions") fetchData()
    })
    return off
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

