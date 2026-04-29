"use client"

import * as React from "react"
import type { Investment } from "@/lib/types/database"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { onDataChanged } from "@/lib/utils/events"

export function useInvestments() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<Investment[]>([])
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
      .from("investments")
      .select("id,user_id,name,type,initial_amount,current_value,start_date,platform,note,created_at")
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setData((rows ?? []) as Investment[])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
    const off = onDataChanged((key) => {
      if (key === "investments") fetchData()
    })
    return off
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

