"use client"

import * as React from "react"
import type { Loan } from "@/lib/types/database"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { onDataChanged } from "@/lib/utils/events"

export function useLoans() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<Loan[]>([])
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
      .from("loans")
      .select("id,user_id,contact_name,direction,original_amount,remaining_amount,due_date,note,is_settled,created_at")
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setData((rows ?? []) as Loan[])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
    const off = onDataChanged((key) => {
      if (key === "loans") fetchData()
    })
    return off
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

