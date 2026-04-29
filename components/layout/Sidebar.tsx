"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CreditCard,
  Home,
  PiggyBank,
  Settings,
  Users,
  Wallet,
  TrendingUp,
  HandCoins,
} from "lucide-react"

import { cn } from "@/lib/utils/cn"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as AppUser } from "@/lib/types/database"
import { onDataChanged } from "@/lib/utils/events"

const nav = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/transaksi", label: "Transaksi", icon: CreditCard },
  { href: "/anggaran", label: "Anggaran", icon: HandCoins },
  { href: "/tabungan", label: "Tabungan", icon: PiggyBank },
  { href: "/pinjaman", label: "Pinjaman", icon: Wallet },
  { href: "/investasi", label: "Investasi", icon: TrendingUp },
  { href: "/keluarga", label: "Keluarga", icon: Users },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [profile, setProfile] = React.useState<AppUser | null>(null)
  const [profileLoading, setProfileLoading] = React.useState(true)
  const mountedRef = React.useRef(true)

  const fetchProfile = React.useCallback(async () => {
    if (mountedRef.current) setProfileLoading(true)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      if (mountedRef.current) setProfile(null)
      if (mountedRef.current) setProfileLoading(false)
      return
    }

    const supabase = createSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      if (mountedRef.current) setProfile(null)
      if (mountedRef.current) setProfileLoading(false)
      return
    }

    const { data } = await supabase
      .from("users")
      .select("id,username,full_name,avatar_url,is_active,created_at,updated_at")
      .eq("id", user.id)
      .maybeSingle()

    if (mountedRef.current) setProfile((data ?? null) as AppUser | null)
    if (mountedRef.current) setProfileLoading(false)
  }, [])

  React.useEffect(() => {
    mountedRef.current = true
    fetchProfile().catch(() => {})
    const off = onDataChanged((key) => {
      if (key === "profile") fetchProfile()
    })
    return () => {
      mountedRef.current = false
      off()
    }
  }, [fetchProfile])

  const displayName = profile?.full_name?.trim() || profile?.username || "Kamu"
  const subtitle = profile?.username ? `@${profile.username}` : "Akun"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")

  return (
    <div className="h-dvh min-h-dvh px-3 py-4 flex flex-col min-h-0">
      <div className="px-2 pb-4">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-primary/15 text-primary grid place-items-center border border-border">
            <Wallet className="size-4" />
          </div>
          <div className="font-semibold">Uang Melulu</div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto pr-1">
        {nav.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-muted",
                active && "bg-primary/15 text-primary"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-border flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          {profileLoading ? (
            <>
              <div className="size-8 rounded-full bg-muted border border-border animate-pulse" />
              <div className="text-sm space-y-1">
                <div className="h-3 w-20 rounded bg-muted border border-border animate-pulse" />
                <div className="h-3 w-14 rounded bg-muted border border-border animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <Avatar key={profile?.avatar_url ?? "no-avatar"} className="size-8">
                {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={displayName} /> : null}
                <AvatarFallback className="bg-primary/15 text-primary">{initials || "UM"}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium leading-tight">{displayName}</div>
                <div className="text-xs text-muted-foreground">{subtitle}</div>
              </div>
            </>
          )}
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}

