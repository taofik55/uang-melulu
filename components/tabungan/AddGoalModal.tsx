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

export function AddGoalModal() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [icon, setIcon] = React.useState("🎯")
  const [target, setTarget] = React.useState(0)
  const [date, setDate] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Tambah Target</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Target Tabungan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Ikon</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Nama</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Liburan" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target</Label>
            <CurrencyInput value={target} onValueChange={setTarget} />
          </div>

          <div className="space-y-2">
            <Label>Tanggal target</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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

                  const { error } = await supabase.from("savings_goals").insert({
                    user_id: user.id,
                    name,
                    icon,
                    target_amount: target,
                    current_amount: 0,
                    target_date: date || null,
                    is_completed: false,
                  })
                  if (error) {
                    toast.error(error.message)
                    return
                  }
                  emitDataChanged("savings")
                  setOpen(false)
                  toast.success("Target dibuat!")
                } catch {
                  toast.error("Gagal buat target")
                }
              }}
              disabled={!name || target <= 0}
            >
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

