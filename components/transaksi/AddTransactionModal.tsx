"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/shared/CurrencyInput"
import { CategoryPicker } from "@/components/shared/CategoryPicker"
import { SelectPopover } from "@/components/shared/SelectPopover"

import type { TransactionType, CategoryType } from "@/lib/types/database"
import { useAccounts } from "@/lib/hooks/useAccounts"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { emitDataChanged } from "@/lib/utils/events"

const schema = z.object({
  type: z.enum(["expense", "income", "transfer"]),
  amount: z.number().positive("Jumlah tidak boleh kosong"),
  transaction_date: z.string().min(1, "Tanggal wajib diisi"),
  account_id: z.string().min(1, "Akun wajib dipilih"),
  category_id: z.string().nullable(),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function typeToCategoryType(type: TransactionType): CategoryType {
  return type === "income" ? "income" : "expense"
}

export function AddTransactionModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const { data: accounts } = useAccounts()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      amount: 0,
      transaction_date: new Date().toISOString().slice(0, 10),
      account_id: "",
      category_id: null,
      note: "",
    },
  })

  const type = form.watch("type")
  const categoryType = typeToCategoryType(type)

  async function submit(values: FormValues) {
    if (values.type === "transfer") {
      toast.info("Mode transfer akan diaktifkan setelah form Dari/Ke akun selesai")
      return
    }

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

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: values.account_id,
        category_id: values.category_id,
        type: values.type,
        amount: values.amount,
        note: values.note || null,
        transaction_date: values.transaction_date,
      })
      if (error) {
        toast.error(error.message)
        return
      }

      emitDataChanged("transactions")
      emitDataChanged("accounts")
      setOpen(false)
      form.reset({
        ...values,
        amount: 0,
        note: "",
      })
      toast.success("Transaksi disimpan!")
    } catch {
      toast.error("Gagal simpan transaksi")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <Tabs value={type} onValueChange={(v) => form.setValue("type", v as TransactionType)}>
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">
                Pengeluaran
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-1">
                Pemasukan
              </TabsTrigger>
              <TabsTrigger value="transfer" className="flex-1">
                Transfer
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>Jumlah</Label>
            <CurrencyInput
              autoFocus
              value={form.watch("amount")}
              onValueChange={(v) => form.setValue("amount", v, { shouldValidate: true })}
            />
            {form.formState.errors.amount ? (
              <div className="text-sm text-accent-red">{form.formState.errors.amount.message}</div>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" {...form.register("transaction_date")} />
              {form.formState.errors.transaction_date ? (
                <div className="text-sm text-accent-red">{form.formState.errors.transaction_date.message}</div>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Akun</Label>
              <SelectPopover
                value={form.watch("account_id")}
                onChange={(id) => form.setValue("account_id", id, { shouldValidate: true })}
                placeholder="Pilih akun…"
                options={accounts.map((a) => ({ value: a.id, label: a.name, textValue: a.name }))}
              />
              {form.formState.errors.account_id ? (
                <div className="text-sm text-accent-red">{form.formState.errors.account_id.message}</div>
              ) : null}
            </div>
          </div>

          {type === "transfer" ? (
            <div className="rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground">
              Mode transfer (Dari/Ke akun) segera hadir. Untuk demo, gunakan transaksi biasa dulu.
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Kategori</Label>
              <CategoryPicker
                type={categoryType}
                value={form.watch("category_id")}
                onChange={(id) => form.setValue("category_id", id)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Catatan (opsional)</Label>
            <Input placeholder="Contoh: makan siang" {...form.register("note")} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

