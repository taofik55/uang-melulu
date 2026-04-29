"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, MoreHorizontal, Plus, Receipt } from "lucide-react"

import { cn } from "@/lib/utils/cn"
import { AddTransactionModal } from "@/components/transaksi/AddTransactionModal"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="grid grid-cols-5 items-center">
          <NavItem href="/" label="Beranda" icon={Home} active={pathname === "/"} />
          <NavItem href="/transaksi" label="Transaksi" icon={Receipt} active={pathname.startsWith("/transaksi")} />

          <div className="flex justify-center">
            <AddTransactionModal
              trigger={
                <button
                  type="button"
                  className="size-12 rounded-full bg-primary text-primary-foreground shadow-lg grid place-items-center"
                  aria-label="Tambah transaksi"
                >
                  <Plus className="size-5" />
                </button>
              }
            />
          </div>

          <NavItem href="/laporan" label="Laporan" icon={BarChart3} active={pathname.startsWith("/laporan")} />
          <NavItem href="/pengaturan" label="Lainnya" icon={MoreHorizontal} active={pathname.startsWith("/pengaturan")} />
        </div>
      </div>
    </div>
  )
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof Home
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs text-muted-foreground",
        active && "text-primary"
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </Link>
  )
}

