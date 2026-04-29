"use client"

import * as React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { MoreVertical, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils/cn"
import { formatRupiah } from "@/lib/utils/currency"
import { useAccounts } from "@/lib/hooks/useAccounts"
import { AddAccountModal } from "@/components/dashboard/AddAccountModal"
import { Button } from "@/components/ui/button"
import { CurrencyInput } from "@/components/shared/CurrencyInput"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { emitDataChanged } from "@/lib/utils/events"
import type { Account } from "@/lib/types/database"

export function AccountPills() {
  const { data, loading } = useAccounts()
  const [editAccount, setEditAccount] = React.useState<Account | null>(null)
  const [deleteAccount, setDeleteAccount] = React.useState<Account | null>(null)
  const [balance, setBalance] = React.useState(0)

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
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="text-lg leading-none shrink-0">{a.icon ?? "💳"}</div>
                    <div className="text-sm font-medium truncate">{a.name}</div>
                  </div>

                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Aksi akun"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        side="bottom"
                        sideOffset={8}
                        className="z-50 min-w-[190px] rounded-xl border border-border bg-card p-1 shadow-md outline-none"
                      >
                        <DropdownMenu.Item
                          className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted"
                          onSelect={(e) => {
                            e.preventDefault()
                            setEditAccount(a)
                            setBalance(a.balance)
                          }}
                        >
                          Ubah saldo
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted text-accent-red"
                          onSelect={(e) => {
                            e.preventDefault()
                            setDeleteAccount(a)
                          }}
                        >
                          <Trash2 className="size-4" />
                          Hapus
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>

                <div className="mt-1 flex items-center justify-start">
                  <div className="text-sm tabular whitespace-nowrap">{formatRupiah(a.balance)}</div>
                </div>
              </div>
            ))}

        <AddAccountModal
          trigger={
            <button
              type="button"
              className="min-w-[210px] rounded-xl border border-dashed border-border bg-card px-3 py-2 text-left hover:bg-muted transition"
            >
              <div className="flex items-center gap-2 text-sm">
                <Plus className="size-4 text-primary" />
                <span className="font-medium">Tambah Akun</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Buat sumber dana baru</div>
            </button>
          }
        />
      </div>

      <Dialog
        open={Boolean(editAccount)}
        onOpenChange={(v) => {
          if (!v) setEditAccount(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah saldo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">
              <div className="font-medium">{editAccount?.name}</div>
              <div className="text-xs text-muted-foreground">Saldo saat ini: {editAccount ? formatRupiah(editAccount.balance) : ""}</div>
            </div>
            <CurrencyInput value={balance} onValueChange={setBalance} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditAccount(null)}>
                Batal
              </Button>
              <Button
                onClick={async () => {
                  const target = editAccount
                  if (!target) return
                  try {
                    const supabase = createSupabaseBrowserClient()
                    const { error } = await supabase.from("accounts").update({ balance }).eq("id", target.id)
                    if (error) {
                      toast.error(error.message)
                      return
                    }
                    emitDataChanged("accounts")
                    toast.success("Saldo diperbarui!")
                    setEditAccount(null)
                  } catch {
                    toast.error("Gagal memperbarui saldo")
                  }
                }}
              >
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteAccount)}
        onOpenChange={(v) => {
          if (!v) setDeleteAccount(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus akun</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Akun <span className="font-medium text-foreground">{deleteAccount?.name}</span> akan disembunyikan dari daftar akun.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteAccount(null)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  const target = deleteAccount
                  if (!target) return
                  try {
                    const supabase = createSupabaseBrowserClient()
                    const { error } = await supabase.from("accounts").update({ is_active: false }).eq("id", target.id)
                    if (error) {
                      toast.error(error.message)
                      return
                    }
                    emitDataChanged("accounts")
                    toast.success("Akun dihapus.")
                    setDeleteAccount(null)
                  } catch {
                    toast.error("Gagal menghapus akun")
                  }
                }}
              >
                Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

