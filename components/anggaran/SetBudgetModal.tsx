"use client"

import * as React from "react"
import { toast } from "sonner"
import { startOfMonth, startOfWeek, startOfYear } from "date-fns"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CurrencyInput } from "@/components/shared/CurrencyInput"
import { SelectPopover } from "@/components/shared/SelectPopover"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useCategories } from "@/lib/hooks/useCategories"
import { emitDataChanged } from "@/lib/utils/events"
import type { BudgetPeriod } from "@/lib/types/database"

export function SetBudgetModal() {
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState(0)
  const [period, setPeriod] = React.useState<BudgetPeriod>("monthly")
  const [categoryId, setCategoryId] = React.useState("")

  const { data: categories } = useCategories()
  const expenseCategories = categories.filter((c) => c.type === "expense")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Atur Anggaran</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atur Anggaran</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <SelectPopover
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Pilih kategori…"
              options={expenseCategories.map((c) => ({
                value: c.id,
                label: (
                  <span className="flex items-center gap-2">
                    <span className="text-base">{c.icon ?? "✨"}</span>
                    <span className="truncate">{c.name}</span>
                  </span>
                ),
                textValue: c.name,
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Jumlah</Label>
            <CurrencyInput value={amount} onValueChange={setAmount} />
          </div>

          <div className="space-y-2">
            <Label>Periode</Label>
            <SelectPopover
              value={period}
              onChange={(v) => setPeriod(v as BudgetPeriod)}
              placeholder="Pilih periode…"
              options={[
                { value: "weekly", label: "Mingguan" },
                { value: "monthly", label: "Bulanan" },
                { value: "yearly", label: "Tahunan" },
              ]}
            />
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

                  const now = new Date()
                  const start =
                    period === "weekly"
                      ? startOfWeek(now, { weekStartsOn: 1 }).toISOString().slice(0, 10)
                      : period === "yearly"
                        ? startOfYear(now).toISOString().slice(0, 10)
                        : startOfMonth(now).toISOString().slice(0, 10)
                  const { error } = await supabase.from("budgets").upsert(
                    {
                      user_id: user.id,
                      category_id: categoryId,
                      amount,
                      period,
                      start_date: start,
                      end_date: null,
                    },
                    { onConflict: "user_id,category_id,period,start_date" }
                  )
                  if (error) {
                    toast.error(error.message)
                    return
                  }
                  emitDataChanged("budgets")
                  setOpen(false)
                  toast.success("Anggaran diperbarui!")
                } catch {
                  toast.error("Gagal simpan anggaran")
                }
              }}
              disabled={!categoryId || amount <= 0}
            >
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

