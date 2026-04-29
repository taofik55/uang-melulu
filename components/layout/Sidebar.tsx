"use client"

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

  return (
    <div className="h-full px-3 py-4 flex flex-col">
      <div className="px-2 pb-4">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-primary/15 text-primary grid place-items-center border border-border">
            <Wallet className="size-4" />
          </div>
          <div className="font-semibold">Uang Melulu</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
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
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-primary">UM</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium leading-tight">Kamu</div>
            <div className="text-xs text-muted-foreground">Demo</div>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}

