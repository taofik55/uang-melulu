"use client"

import * as React from "react"
import type { SavingsGoal } from "@/lib/types/database"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { onDataChanged } from "@/lib/utils/events"

export function useSavings() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<SavingsGoal[]>([])
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
      .from("savings_goals")
      .select("id,user_id,name,target_amount,current_amount,target_date,icon,is_completed,created_at")
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setData((rows ?? []) as SavingsGoal[])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
    const off = onDataChanged((key) => {
      if (key === "savings") fetchData()
    })
    return off
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

