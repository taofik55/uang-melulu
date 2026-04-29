"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wallet } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as AppUser } from "@/lib/types/database"
import { cn } from "@/lib/utils/cn"

export function TopBar() {
  const router = useRouter()
  const [profile, setProfile] = React.useState<AppUser | null>(null)

  React.useEffect(() => {
    let mounted = true
    async function load() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return
      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("users")
        .select("id,username,full_name,avatar_url,is_active,created_at,updated_at")
        .eq("id", user.id)
        .maybeSingle()

      if (!mounted) return
      setProfile((data ?? null) as AppUser | null)
    }

    load().catch(() => {})
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
    <div className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-primary/15 text-primary grid place-items-center border border-border">
            <Wallet className="size-4" />
          </div>
          <div className="font-semibold">Uang Melulu</div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="rounded-full" aria-label="Menu akun">
                <Avatar className="size-9">
                  {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={displayName} /> : null}
                  <AvatarFallback className="bg-primary/15 text-primary">{initials || "UM"}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={10}
                align="end"
                className={cn(
                  "z-50 min-w-[210px] rounded-xl border border-border bg-card p-1 shadow-md outline-none",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out"
                )}
              >
                <div className="px-3 py-2">
                  <div className="text-sm font-medium leading-tight">{displayName}</div>
                  <div className="text-xs text-muted-foreground">{profile?.username ? `@${profile.username}` : ""}</div>
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />

                <DropdownMenu.Item asChild>
                  <Link
                    href="/pengaturan"
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted"
                  >
                    Pengaturan
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted text-accent-red"
                  onSelect={async (e) => {
                    e.preventDefault()
                    const supabase = createSupabaseBrowserClient()
                    await supabase.auth.signOut()
                    router.replace("/login")
                  }}
                >
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  )
}

