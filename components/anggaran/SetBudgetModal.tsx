"use client"

import * as React from "react"
import { toast } from "sonner"
import { startOfMonth, startOfWeek, startOfYear } from "date-fns"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CurrencyInput } from "@/components/shared/CurrencyInput"
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
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Pilih kategori…</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Jumlah</Label>
            <CurrencyInput value={amount} onValueChange={setAmount} />
          </div>

          <div className="space-y-2">
            <Label>Periode</Label>
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
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

