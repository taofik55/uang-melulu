"use client"



import * as React from "react"
import type { Transfer } from "@/lib/types/database"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { onDataChanged } from "@/lib/utils/events"

export function useTransfers() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<Transfer[]>([])
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
      .from("transfers")
      .select("id,from_transaction_id,to_transaction_id,amount")
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setData((rows ?? []) as Transfer[])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
    const off = onDataChanged((key) => {
      if (key === "transfers") fetchData()
    })
    return off
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
