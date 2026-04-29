"use client"

import Link from "next/link"
import { Wallet } from "lucide-react"

import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TopBar() {
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
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/15 text-primary">UM</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}

