"use client"

import * as React from "react"
import { CheckCircle2, MoreVertical, Edit2, Trash2, Link } from "lucide-react"
import { toast } from "sonner"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/utils/currency"
import { sisaHari } from "@/lib/utils/date"
import { useSavings } from "@/lib/hooks/useSavings"
import { useAccounts } from "@/lib/hooks/useAccounts"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { emitDataChanged } from "@/lib/utils/events"
import { EditGoalModal } from "@/components/tabungan/EditGoalModal"
import { cn } from "@/lib/utils/cn"
import type { SavingsGoal } from "@/lib/types/database"

function Ring({ value }: { value: number }) {
  const r = 18
  const c = 2 * Math.PI * r
  const dash = (value / 100) * c
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 24 24)"
      />
    </svg>
  )
}

export function GoalCard() {
  const { data: goals, loading: loadingSavings } = useSavings()
  const { data: accounts, loading: loadingAccounts } = useAccounts()
  const [editingGoal, setEditingGoal] = React.useState<SavingsGoal | null>(null)

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus tabungan ini?")) return
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from("savings_goals").delete().eq("id", id)
      if (error) {
        toast.error(error.message)
        return
      }
      emitDataChanged("savings")
      toast.success("Tabungan berhasil dihapus")
    } catch {
      toast.error("Gagal menghapus tabungan")
    }
  }

  if (loadingSavings || loadingAccounts) {
    return <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Memuat target…</Card>
  }

  if (goals.length === 0) {
    return <Card className="bg-card border-border p-4 text-sm text-muted-foreground">Belum ada target tabungan.</Card>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((g) => {
        // Resolve balance if linked to an account
        const linkedAccount = g.account_id ? accounts.find((a) => a.id === g.account_id) : null
        const currentAmount = linkedAccount ? linkedAccount.balance : g.current_amount

        const hasTarget = g.target_amount !== null && g.target_amount > 0
        const pct = hasTarget ? Math.min(100, Math.round((currentAmount / (g.target_amount || 1)) * 100)) : 0
        const done = hasTarget && pct >= 100

        return (
          <Card key={g.id} className="bg-card border-border p-4 relative overflow-hidden flex flex-col justify-between min-h-[170px]">
            <div>
              {done ? (
                <div className="absolute right-12 top-3.5 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                  Lunas <CheckCircle2 className="size-3" />
                </div>
              ) : null}

              {/* Dropdown Menu for Edit and Delete */}
              <div className="absolute right-3 top-3">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground outline-none">
                      <MoreVertical className="size-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      sideOffset={5}
                      className={cn(
                        "z-50 rounded-xl border border-border bg-card p-1 shadow-md outline-none min-w-[120px]",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out"
                      )}
                    >
                      <DropdownMenu.Item
                        onClick={() => setEditingGoal(g)}
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg cursor-pointer outline-none hover:bg-muted focus:bg-muted"
                      >
                        <Edit2 className="size-3.5" />
                        Ubah
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => handleDelete(g.id)}
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg cursor-pointer outline-none hover:bg-red-500/10 focus:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="size-3.5" />
                        Hapus
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-2xl leading-none">{g.icon ?? "🎯"}</div>
                  <div className="mt-2 text-sm font-semibold pr-8">{g.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {hasTarget && g.target_date ? sisaHari(g.target_date) : ""}
                    {!hasTarget && (
                      <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Tanpa Target
                      </span>
                    )}
                  </div>
                </div>
                {hasTarget ? <Ring value={pct} /> : null}
              </div>
            </div>

            <div>
              <div className="mt-4 text-sm tabular">
                {formatRupiah(currentAmount)}{" "}
                {hasTarget && (
                  <span className="text-muted-foreground">/ {formatRupiah(g.target_amount || 0)}</span>
                )}
              </div>
              <div className="mt-4">
                {g.account_id ? (
                  <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded-md flex items-center justify-center gap-1.5 bg-muted/10">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tersinkronisasi dengan {linkedAccount?.name || "Rekening"}
                  </div>
                ) : (
                  <Button className="w-full" variant={done ? "secondary" : "default"}>
                    + Setor
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )
      })}

      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
        />
      )}
    </div>
  )
}
