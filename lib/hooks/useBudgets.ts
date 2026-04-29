"use client"

import * as React from "react"
import type { Budget } from "@/lib/types/database"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { onDataChanged } from "@/lib/utils/events"

export function useBudgets() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<Budget[]>([])
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
      .from("budgets")
      .select("id,user_id,category_id,amount,period,start_date,end_date")
      .order("start_date", { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setData((rows ?? []) as Budget[])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
    const off = onDataChanged((key) => {
      if (key === "budgets" || key === "transactions" || key === "categories") fetchData()
    })
    return off
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

