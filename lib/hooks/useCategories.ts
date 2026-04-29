"use client"

import * as React from "react"
import type { Category } from "@/lib/types/database"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { onDataChanged } from "@/lib/utils/events"

export function useCategories() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<Category[]>([])
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
      .from("categories")
      .select("id,user_id,name,type,icon,color,parent_id,is_default")
      .order("is_default", { ascending: false })
      .order("name", { ascending: true })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setData((rows ?? []) as Category[])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    let mounted = true
    fetchData().catch(() => {
      if (!mounted) return
      setError("Gagal memuat kategori")
      setLoading(false)
    })
    const off = onDataChanged((key) => {
      if (key === "categories") fetchData()
    })
    return () => {
      mounted = false
      off()
    }
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

