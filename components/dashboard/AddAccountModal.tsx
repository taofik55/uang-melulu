"use client"

import * as React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CurrencyInput } from "@/components/shared/CurrencyInput"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils/cn"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { emitDataChanged } from "@/lib/utils/events"
import type { AccountType } from "@/lib/types/database"

const ICON_OPTIONS = ["💳", "🏦", "💵", "📱", "🧾", "🪙", "💰", "🏧"] as const

export function AddAccountModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState<AccountType>("bank")
  const [icon, setIcon] = React.useState<(typeof ICON_OPTIONS)[number]>("💳")
  const [iconOpen, setIconOpen] = React.useState(false)
  const [balance, setBalance] = React.useState(0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Akun</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            <div className="space-y-2">
              <Label>Ikon</Label>
              <DropdownMenu.Root open={iconOpen} onOpenChange={setIconOpen}>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-center text-sm hover:bg-muted"
                    aria-label="Pilih ikon akun"
                  >
                    <span className="text-lg leading-none">{icon}</span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    sideOffset={10}
                    align="start"
                    className={cn(
                      "z-50 rounded-xl border border-border bg-card p-2 shadow-md outline-none",
                      "data-[state=open]:animate-in data-[state=closed]:animate-out"
                    )}
                  >
                    <div className="grid grid-cols-4 gap-2">
                      {ICON_OPTIONS.map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={cn(
                            "grid size-10 place-items-center rounded-lg border border-border bg-background text-lg hover:bg-muted",
                            v === icon && "border-primary/60 bg-primary/10"
                          )}
                          onClick={() => {
                            setIcon(v)
                            setIconOpen(false)
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
            <div className="col-span-4 space-y-2">
              <Label>Nama</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: BCA / Cash" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipe</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "bank" ? "default" : "secondary"}
                onClick={() => setType("bank")}
              >
                Bank
              </Button>
              <Button
                type="button"
                variant={type === "e_wallet" ? "default" : "secondary"}
                onClick={() => setType("e_wallet")}
              >
                E-Wallet
              </Button>
              <Button
                type="button"
                variant={type === "cash" ? "default" : "secondary"}
                onClick={() => setType("cash")}
              >
                Cash
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Saldo awal</Label>
            <CurrencyInput value={balance} onValueChange={setBalance} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={async () => {
                try {
                  const supabase = createSupabaseBrowserClient()
                  const {
                    data: { user },
                    error: userError,
                  } = await supabase.auth.getUser()
                  if (userError || !user) {
                    toast.error("Kamu belum login")
                    return
                  }

                  const { error } = await supabase.from("accounts").insert({
                    user_id: user.id,
                    name: name.trim(),
                    type,
                    balance,
                    currency: "IDR",
                    icon,
                    is_active: true,
                  })
                  if (error) {
                    toast.error(error.message)
                    return
                  }

                  emitDataChanged("accounts")
                  setOpen(false)
                  setName("")
                  setType("bank")
                  setIcon("💳")
                  setBalance(0)
                  toast.success("Akun dibuat!")
                } catch {
                  toast.error("Gagal buat akun")
                }
              }}
              disabled={!name.trim()}
            >
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

