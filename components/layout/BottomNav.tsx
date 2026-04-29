"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  BarChart3,
  HandCoins,
  Home,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Receipt,
  Settings,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { AddTransactionModal } from "@/components/transaksi/AddTransactionModal";

export function BottomNav() {
  const pathname = usePathname();
  const moreActive =
    pathname.startsWith("/pengaturan") ||
    pathname.startsWith("/anggaran") ||
    pathname.startsWith("/tabungan") ||
    pathname.startsWith("/pinjaman") ||
    pathname.startsWith("/investasi") ||
    pathname.startsWith("/keluarga");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="grid grid-cols-5 items-center">
          <NavItem
            href="/"
            label="Beranda"
            icon={Home}
            active={pathname === "/"}
          />
          <NavItem
            href="/transaksi"
            label="Transaksi"
            icon={Receipt}
            active={pathname.startsWith("/transaksi")}
          />

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

          <NavItem
            href="/laporan"
            label="Laporan"
            icon={BarChart3}
            active={pathname.startsWith("/laporan")}
          />
          <MoreMenu active={moreActive} />
        </div>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs text-muted-foreground",
        active && "text-primary",
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </Link>
  );
}

function MoreMenu({ active }: { active: boolean }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs text-muted-foreground",
            active && "text-primary",
          )}
          aria-label="Menu lainnya"
        >
          <MoreHorizontal className="size-4" />
          <span>Lainnya</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          side="top"
          sideOffset={12}
          className="z-50 min-w-[220px] rounded-xl border border-border bg-card p-1 shadow-md outline-none"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/anggaran"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <HandCoins className="size-4" />
              Anggaran
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/tabungan"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <PiggyBank className="size-4" />
              Tabungan
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/pinjaman"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <Wallet className="size-4" />
              Pinjaman
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/investasi"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <TrendingUp className="size-4" />
              Investasi
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/keluarga"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <Users className="size-4" />
              Keluarga
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
