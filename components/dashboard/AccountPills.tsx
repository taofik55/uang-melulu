"use client"

import { Plus } from "lucide-react"

import { cn } from "@/lib/utils/cn"
import { formatRupiah } from "@/lib/utils/currency"
import { useAccounts } from "@/lib/hooks/useAccounts"

export function AccountPills() {
  const { data, loading } = useAccounts()

  return (
    <div>
      <div className="text-sm text-muted-foreground mb-2">Akun</div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 min-w-[190px] rounded-xl border border-border bg-card animate-pulse" />
            ))
          : data.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "min-w-[210px] rounded-xl border bg-card px-3 py-2",
                  a.type === "bank" && "border-primary/40",
                  a.type === "e_wallet" && "border-accent-amber/60",
                  a.type === "cash" && "border-border"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="text-lg leading-none">{a.icon ?? "💳"}</div>
                    <div className="text-sm font-medium">{a.name}</div>
                  </div>
                  <div className="text-sm tabular">{formatRupiah(a.balance)}</div>
                </div>
              </div>
            ))}

        <button
          type="button"
          className="min-w-[210px] rounded-xl border border-dashed border-border bg-card px-3 py-2 text-left hover:bg-muted transition"
        >
          <div className="flex items-center gap-2 text-sm">
            <Plus className="size-4 text-primary" />
            <span className="font-medium">Tambah Akun</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Segera hadir</div>
        </button>
      </div>
    </div>
  )
}

