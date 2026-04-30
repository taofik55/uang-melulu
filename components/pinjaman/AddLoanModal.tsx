"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/shared/CurrencyInput"
import { SelectPopover } from "@/components/shared/SelectPopover"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { emitDataChanged } from "@/lib/utils/events"

export function AddLoanModal() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [direction, setDirection] = React.useState("borrowed")
  const [amount, setAmount] = React.useState(0)
  const [due, setDue] = React.useState("")
  const [note, setNote] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Tambah</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pinjaman</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama kontak</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Siti" />
          </div>

          <div className="space-y-2">
            <Label>Arah</Label>
            <SelectPopover
              value={direction}
              onChange={setDirection}
              placeholder="Pilih arah…"
              options={[
                { value: "lent", label: "Dipinjamkan" },
                { value: "borrowed", label: "Berhutang" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label>Jumlah</Label>
            <CurrencyInput value={amount} onValueChange={setAmount} />
          </div>

          <div className="space-y-2">
            <Label>Jatuh tempo</Label>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Catatan (opsional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: cicil 2x" />
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

                  const { error } = await supabase.from("loans").insert({
                    user_id: user.id,
                    contact_name: name,
                    direction,
                    original_amount: amount,
                    remaining_amount: amount,
                    due_date: due || null,
                    note: note || null,
                    is_settled: false,
                  })
                  if (error) {
                    toast.error(error.message)
                    return
                  }
                  emitDataChanged("loans")
                  setOpen(false)
                  toast.success("Pinjaman disimpan!")
                } catch {
                  toast.error("Gagal simpan pinjaman")
                }
              }}
              disabled={!name || amount <= 0}
            >
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

