"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/shared/CurrencyInput"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { emitDataChanged } from "@/lib/utils/events"

export function AddInvestmentModal() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState("mutual_fund")
  const [platform, setPlatform] = React.useState("")
  const [initial, setInitial] = React.useState(0)
  const [start, setStart] = React.useState("")
  const [note, setNote] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Tambah</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Investasi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Reksa Dana" />
          </div>
          <div className="space-y-2">
            <Label>Tipe</Label>
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="stocks">Saham</option>
              <option value="mutual_fund">Reksa Dana</option>
              <option value="crypto">Kripto</option>
              <option value="gold">Emas</option>
              <option value="deposit">Deposito</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Platform (opsional)</Label>
            <Input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="Contoh: Bibit" />
          </div>
          <div className="space-y-2">
            <Label>Modal awal</Label>
            <CurrencyInput value={initial} onValueChange={setInitial} />
          </div>
          <div className="space-y-2">
            <Label>Tanggal mulai</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Catatan (opsional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: top up bulanan" />
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

                  const { error } = await supabase.from("investments").insert({
                    user_id: user.id,
                    name,
                    type,
                    platform: platform || null,
                    initial_amount: initial,
                    current_value: initial,
                    start_date: start || new Date().toISOString().slice(0, 10),
                    note: note || null,
                  })
                  if (error) {
                    toast.error(error.message)
                    return
                  }
                  emitDataChanged("investments")
                  setOpen(false)
                  toast.success("Investasi disimpan!")
                } catch {
                  toast.error("Gagal simpan investasi")
                }
              }}
              disabled={!name}
            >
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

