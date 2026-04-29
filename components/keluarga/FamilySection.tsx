"use client"

import * as React from "react"
import { Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export function FamilySection() {
  const [loading, setLoading] = React.useState(true)
  const [group, setGroup] = React.useState<{ id: string; name: string; role: "owner" | "member" } | null>(null)
  const [members, setMembers] = React.useState<Array<{ id: string; name: string; role: string }>>([])

  React.useEffect(() => {
    let mounted = true
    async function load() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (!mounted) return
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        if (!mounted) return
        setGroup(null)
        setMembers([])
        setLoading(false)
        return
      }

      const { data: myMemberships } = await supabase
        .from("family_members")
        .select("role,family_group_id,family_groups(name)")
        .eq("user_id", user.id)
        .limit(1)

      const m = myMemberships?.[0] as unknown as
        | { role: "owner" | "member"; family_group_id: string; family_groups: { name: string } | null }
        | undefined
      if (!m?.family_group_id) {
        if (!mounted) return
        setGroup(null)
        setMembers([])
        setLoading(false)
        return
      }

      if (!mounted) return
      setGroup({ id: m.family_group_id, name: m.family_groups?.name ?? "Grup", role: m.role })

      const { data: memberRows } = await supabase
        .from("family_members")
        .select("id,role,user_id,users(username,full_name)")
        .eq("family_group_id", m.family_group_id)

      const mapped =
        (memberRows ?? []).map((row: any) => {
          const displayName = row.users?.full_name ?? row.users?.username ?? String(row.user_id).slice(0, 8)
          const roleLabel = row.role === "owner" ? "Pemilik" : "Anggota"
          return { id: row.id, name: displayName, role: roleLabel }
        }) ?? []

      if (!mounted) return
      setMembers(mapped)
      setLoading(false)
    }

    load().catch(() => {
      if (!mounted) return
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Memuat keluarga…</Card>
  }

  if (!group) {
    return (
      <EmptyState
        icon={Users}
        title="Belum ada grup"
        description="Belum ada data. Yuk mulai catat!"
        actionLabel="Buat grup"
        onAction={() => {}}
      />
    )
  }

  return (
    <div className="space-y-3">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{group.name}</CardTitle>
            <Badge variant="secondary" className="bg-primary/15 text-primary border border-border">
              {group.role === "owner" ? "Pemilik" : "Anggota"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Ringkasan grup.</CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Anggota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/15 text-primary grid place-items-center border border-border font-semibold">
                  {m.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </div>
              </div>
              <Button variant="secondary">Lihat transaksi</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Undang anggota</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm"
            placeholder="Email anggota"
          />
          <Button>Undang</Button>
        </CardContent>
      </Card>
    </div>
  )
}

