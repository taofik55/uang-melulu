"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Wallet } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User as AppUser } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";
import { onDataChanged } from "@/lib/utils/events";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  HandCoins,
  Home,
  PiggyBank,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = React.useState<AppUser | null>(null);
  const mountedRef = React.useRef(true);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const fetchProfile = React.useCallback(async () => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      if (mountedRef.current) setProfile(null);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      if (mountedRef.current) setProfile(null);
      return;
    }

    const { data } = await supabase
      .from("users")
      .select(
        "id,username,full_name,avatar_url,is_active,created_at,updated_at",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (mountedRef.current) setProfile((data ?? null) as AppUser | null);
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    fetchProfile().catch(() => {});
    const off = onDataChanged((key) => {
      if (key === "profile") fetchProfile();
    });
    return () => {
      mountedRef.current = false;
      off();
    };
  }, [fetchProfile]);

  const displayName = profile?.full_name?.trim() || profile?.username || "Kamu";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 grid grid-cols-3 items-center">
        <div className="flex items-center justify-start">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-xl border border-border hover:bg-muted"
            aria-label="Buka menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-center">
          <Link
            href="/"
            aria-label="Beranda"
            className="inline-flex items-center"
          >
            <Image
              src="/uang-melulu.png"
              alt="Uang Melulu"
              width={160}
              height={40}
              priority
              className="h-7 w-auto"
            />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="rounded-full"
                aria-label="Menu akun"
              >
                <Avatar
                  key={profile?.avatar_url ?? "no-avatar"}
                  className="size-9"
                >
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-primary/15 text-primary">
                    {initials || "UM"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={10}
                align="end"
                className={cn(
                  "z-50 min-w-[210px] rounded-xl border border-border bg-card p-1 shadow-md outline-none",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out",
                )}
              >
                <div className="px-3 py-2">
                  <div className="text-sm font-medium leading-tight">
                    {displayName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {profile?.username ? `@${profile.username}` : ""}
                  </div>
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
                    e.preventDefault();
                    const supabase = createSupabaseBrowserClient();
                    await supabase.auth.signOut();
                    router.replace("/login");
                  }}
                >
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <DialogPrimitive.Root
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={cn(
              "fixed inset-0 z-40 bg-black/60 transition-opacity",
              "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
            )}
          />
          <DialogPrimitive.Content
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] border-r border-border bg-card shadow-2xl outline-none",
              "rounded-r-2xl",
              "transition-transform duration-300 ease-out",
              "data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full",
            )}
          >
            <div className="flex h-dvh flex-col">
              <div className="flex h-16 items-center gap-2 border-b border-border px-4">
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-xl border border-border hover:bg-muted"
                  aria-label="Tutup menu"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Menu className="size-4" />
                </button>
                <div className="text-sm font-semibold">Menu</div>
              </div>

              <div className="flex items-center justify-center">
                <Image
                  src="/uang-melulu.png"
                  alt="Uang Melulu"
                  width={160}
                  height={40}
                  priority
                  className="h-auto w-1/3"
                />
              </div>

              <div className="mt-4 flex-1 overflow-y-auto px-2 pb-4">
                <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                  Navigasi
                </div>
                <nav className="space-y-1">
                  <MobileNavItem
                    href="/"
                    label="Beranda"
                    icon={Home}
                    active={pathname === "/"}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                  <MobileNavItem
                    href="/transaksi"
                    label="Transaksi"
                    icon={CreditCard}
                    active={pathname.startsWith("/transaksi")}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                  <MobileNavItem
                    href="/anggaran"
                    label="Anggaran"
                    icon={HandCoins}
                    active={pathname.startsWith("/anggaran")}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                  <MobileNavItem
                    href="/tabungan"
                    label="Tabungan"
                    icon={PiggyBank}
                    active={pathname.startsWith("/tabungan")}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                  <MobileNavItem
                    href="/pinjaman"
                    label="Pinjaman"
                    icon={Wallet}
                    active={pathname.startsWith("/pinjaman")}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                  <MobileNavItem
                    href="/investasi"
                    label="Investasi"
                    icon={TrendingUp}
                    active={pathname.startsWith("/investasi")}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                  <MobileNavItem
                    href="/keluarga"
                    label="Keluarga"
                    icon={Users}
                    active={pathname.startsWith("/keluarga")}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                  <MobileNavItem
                    href="/laporan"
                    label="Laporan"
                    icon={BarChart3}
                    active={pathname.startsWith("/laporan")}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                  <MobileNavItem
                    href="/pengaturan"
                    label="Pengaturan"
                    icon={Settings}
                    active={pathname.startsWith("/pengaturan")}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                </nav>
              </div>

              <div className="px-3 pb-6 pt-3">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-left hover:bg-muted"
                      aria-label="Menu akun"
                    >
                      <Avatar key={profile?.avatar_url ?? "no-avatar"} className="size-9">
                        {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={displayName} /> : null}
                        <AvatarFallback className="bg-primary/15 text-primary">{initials || "UM"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-tight truncate">{displayName}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {profile?.username ? `@${profile.username}` : ""}
                        </div>
                      </div>
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      side="top"
                      align="start"
                      sideOffset={10}
                      className="z-50 min-w-[220px] rounded-xl border border-border bg-card p-1 shadow-md outline-none"
                    >
                      <DropdownMenu.Item
                        className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted text-accent-red"
                        onSelect={async (e) => {
                          e.preventDefault()
                          setMobileNavOpen(false)
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
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

function MobileNavItem({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Wallet;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-muted",
        active && "bg-primary/15 text-primary",
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </Link>
  );
}
