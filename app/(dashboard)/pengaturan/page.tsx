"use client"

import * as React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Image as ImageIcon, Upload, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils/cn"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as AppUser } from "@/lib/types/database"
import { emitDataChanged } from "@/lib/utils/events"

export default function PengaturanPage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [profile, setProfile] = React.useState<AppUser | null>(null)
  const [email, setEmail] = React.useState<string | null>(null)
  const [avatarPreviewOpen, setAvatarPreviewOpen] = React.useState(false)

  const [fullName, setFullName] = React.useState("")
  const [username, setUsername] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    let mounted = true

    async function load() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (!mounted) return
        setLoading(false)
        return
      }

      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        if (!mounted) return
        setLoading(false)
        return
      }

      if (mounted) setEmail(user.email ?? null)

      const { data, error } = await supabase
        .from("users")
        .select("id,username,full_name,avatar_url,is_active,created_at,updated_at")
        .eq("id", user.id)
        .maybeSingle()

      if (!mounted) return
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      const p = (data ?? null) as AppUser | null
      setProfile(p)
      setFullName(p?.full_name ?? "")
      setUsername(p?.username ?? "")
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

  const displayName = profile?.full_name?.trim() || profile?.username || "Kamu"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Pengaturan</div>
        <div className="text-sm text-muted-foreground">Atur profil dan preferensi tampilan</div>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Memuat profil…</div>
          ) : !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
            <div className="text-sm text-muted-foreground">Supabase belum dikonfigurasi.</div>
          ) : !profile ? (
            <div className="text-sm text-muted-foreground">Kamu belum login.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button type="button" className="rounded-full" aria-label="Menu avatar">
                        <Avatar key={profile.avatar_url ?? "no-avatar"} className="size-10">
                          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={displayName} /> : null}
                          <AvatarFallback className="bg-primary/15 text-primary">{initials || "UM"}</AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        sideOffset={10}
                        align="start"
                        className="z-50 min-w-[220px] rounded-xl border border-border bg-card p-1 shadow-md outline-none"
                      >
                        <DropdownMenu.Item
                          className={cn(
                            "flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted",
                            !profile.avatar_url && "pointer-events-none opacity-50"
                          )}
                          onSelect={(e) => {
                            e.preventDefault()
                            if (!profile.avatar_url) return
                            setAvatarPreviewOpen(true)
                          }}
                        >
                          <ImageIcon className="size-4" />
                          Lihat avatar
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted"
                          onSelect={(e) => {
                            e.preventDefault()
                            fileInputRef.current?.click()
                          }}
                        >
                          <Upload className="size-4" />
                          Upload avatar
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          className={cn(
                            "flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted text-accent-red",
                            !profile.avatar_url && "pointer-events-none opacity-50"
                          )}
                          onSelect={async (e) => {
                            e.preventDefault()
                            if (!profile.avatar_url) return
                            try {
                              const supabase = createSupabaseBrowserClient()
                              const { error } = await supabase.from("users").update({ avatar_url: null }).eq("id", profile.id)
                              if (error) {
                                toast.error(error.message)
                                return
                              }
                              setProfile((p) => (p ? { ...p, avatar_url: null } : p))
                              emitDataChanged("profile")
                              toast.success("Avatar dihapus.")
                            } catch {
                              toast.error("Gagal menghapus avatar")
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                          Hapus avatar
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-tight truncate">{displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {email ?? (profile.username ? `@${profile.username}` : "")}
                    </div>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ""
                  if (!file || !profile) return

                  if (!file.type.startsWith("image/")) {
                    toast.error("File harus berupa gambar")
                    return
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Ukuran maksimal 5MB")
                    return
                  }

                  try {
                    const supabase = createSupabaseBrowserClient()
                    const {
                      data: { user },
                      error: userError,
                    } = await supabase.auth.getUser()
                    if (userError || !user) {
                      toast.error("Kamu belum login")
                      return
                    }

                    const ext = (file.name.split(".").pop() || "png").toLowerCase()
                    const path = `${user.id}/avatar.${ext}`
                    const { error: uploadError } = await supabase.storage
                      .from("avatars")
                      .upload(path, file, { upsert: true, contentType: file.type })
                    if (uploadError) {
                      toast.error(uploadError.message)
                      return
                    }

                    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
                    const nextUrl = data.publicUrl

                    const { error: updateError } = await supabase.from("users").update({ avatar_url: nextUrl }).eq("id", user.id)
                    if (updateError) {
                      toast.error(updateError.message)
                      return
                    }

                    setProfile((p) => (p ? { ...p, avatar_url: nextUrl } : p))
                    emitDataChanged("profile")
                    toast.success("Avatar diperbarui!")
                  } catch {
                    toast.error("Gagal upload avatar")
                  }
                }}
              />

              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label>Nama lengkap</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama lengkap" />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  disabled={saving || !username.trim()}
                  onClick={async () => {
                    if (!profile) return
                    const nextUsername = username.trim()
                    if (nextUsername.length < 3) {
                      toast.error("Username minimal 3 karakter")
                      return
                    }

                    setSaving(true)
                    try {
                      const supabase = createSupabaseBrowserClient()
                      const { error } = await supabase
                        .from("users")
                        .update({
                          full_name: fullName.trim() || null,
                          username: nextUsername,
                        })
                        .eq("id", profile.id)

                      if (error) {
                        toast.error(error.message)
                        return
                      }

                      setProfile((p) =>
                        p
                          ? {
                              ...p,
                              full_name: fullName.trim() || null,
                              username: nextUsername,
                            }
                          : p
                      )
                      toast.success("Profil diperbarui!")
                      emitDataChanged("profile")
                    } catch {
                      toast.error("Gagal memperbarui profil")
                    } finally {
                      setSaving(false)
                    }
                  }}
                >
                  {saving ? "Menyimpan…" : "Simpan"}
                </Button>
              </div>

              <Dialog open={avatarPreviewOpen} onOpenChange={setAvatarPreviewOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Avatar</DialogTitle>
                  </DialogHeader>
                  {profile.avatar_url ? (
                    <div className="flex justify-center">
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="max-h-[60dvh] w-auto rounded-xl border border-border bg-muted"
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Belum ada avatar.</div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Tampilan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Mode tema</div>
            <div className="text-sm text-muted-foreground">Mode gelap aktif secara default</div>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Separator />

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Zona Berbahaya</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            aria-disabled="true"
          >
            Hapus akun (segera hadir)
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

