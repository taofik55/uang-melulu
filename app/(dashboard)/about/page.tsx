"use client"

import Link from "next/link"
import {
  FaGithub,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa"
import { Sparkles, Code2, Coffee, Gamepad2, ExternalLink } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/* ─── data ─────────────────────────────────────────────────── */
const SOCIALS = [
  {
    href: "https://github.com/taofikrsudrajat",
    label: "GitHub",
    username: "@taofikrsudrajat",
    icon: FaGithub,
    color: "from-zinc-500/20 to-zinc-600/10 hover:from-zinc-500/30 hover:to-zinc-600/20",
    ring: "hover:ring-zinc-500/30",
    iconColor: "text-foreground",
  },
  {
    href: "https://instagram.com/taofikrakhman",
    label: "Instagram",
    username: "@taofikrakhman",
    icon: FaInstagram,
    color: "from-pink-500/20 to-fuchsia-600/10 hover:from-pink-500/30 hover:to-fuchsia-600/20",
    ring: "hover:ring-pink-500/30",
    iconColor: "text-pink-500",
  },
  {
    href: "https://facebook.com/taofikrsudrajat",
    label: "Facebook",
    username: "/taofikrsudrajat",
    icon: FaFacebook,
    color: "from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20",
    ring: "hover:ring-blue-500/30",
    iconColor: "text-blue-500",
  },
  {
    href: "https://linkedin.com/in/taofikrsudrajat",
    label: "LinkedIn",
    username: "/taofikrsudrajat",
    icon: FaLinkedin,
    color: "from-sky-500/20 to-sky-700/10 hover:from-sky-500/30 hover:to-sky-700/20",
    ring: "hover:ring-sky-500/30",
    iconColor: "text-sky-500",
  },
]

const TAGS = [
  { label: "Frontend Engineer", icon: Code2 },
  { label: "Coffee Enthusiast", icon: Coffee },
  { label: "Gamer", icon: Gamepad2 },
]

const TECH_STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "Radix UI",
  "Supabase",
]

/* ─── page ──────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="space-y-4">
      {/* page title */}
      <div>
        <div className="text-lg font-semibold">Tentang Developer</div>
        <div className="text-sm text-muted-foreground">
          Orang di balik layar Uang Melulu
        </div>
      </div>

      {/* ── PROFILE CARD ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* gradient banner */}
        <div className="relative h-28 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 opacity-90" />
          {/* bokeh circles */}
          <div className="absolute -left-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-4 -bottom-4 size-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute left-1/2 top-2 size-20 rounded-full bg-pink-300/20 blur-2xl" />
          {/* sparkle accent */}
          <Sparkles className="absolute right-5 top-4 size-5 text-white/50" />
          <Sparkles className="absolute left-8 bottom-3 size-3 text-white/30" />
        </div>

        {/* avatar + identity */}
        <div className="px-5 pb-5">
          {/* avatar — overlaps banner */}
          <div className="-mt-10 mb-3 flex items-end justify-between">
            <div className="relative">
              <div className="rounded-full p-[3px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 shadow-lg">
                <Avatar className="size-20 ring-2 ring-card">
                  <AvatarImage src="/me.jpg" alt="Taofik Rakhman Sudrajat" />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-xl font-bold">
                    TR
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* online dot */}
              <span className="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-500 ring-2 ring-card shadow-sm" />
            </div>
          </div>

          {/* name & username */}
          <div className="space-y-0.5 mb-3">
            <h1 className="text-xl font-bold leading-tight">
              Taofik Rakhman Sudrajat
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              @taofikrakhman
            </p>
          </div>

          {/* tag chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {TAGS.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                <Icon className="size-3" />
                {label}
              </span>
            ))}
          </div>

          {/* bio */}
          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-violet-500/50 pl-3">
            Terima kasih sudah pakai Uang Melulu!{" "}
            Kalau suka project ini, kasih ⭐ di GitHub ya — itu motivasi
            terbesar buat terus develop.
          </p>
        </div>
      </div>

      {/* ── SOCIAL LINKS ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Temukan saya di
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
          {SOCIALS.map(({ href, label, username, icon: Icon, color, ring, iconColor }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex items-center gap-3 rounded-xl bg-gradient-to-r ${color} p-3.5 ring-1 ring-border ${ring} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm shadow-sm">
                <Icon className={`size-4 ${iconColor} transition-transform duration-200 group-hover:scale-110`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold leading-tight">{label}</div>
                <div className="text-xs text-muted-foreground truncate">{username}</div>
              </div>
              <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/50 transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── BUILT WITH ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Dibuat dengan
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* ── FOOTER VERSION ───────────────────────────────────── */}
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground/60">
          Uang Melulu • v1.0.0 • 2025 – {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
