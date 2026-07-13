"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { CategoryPicker } from "@/components/shared/CategoryPicker";
import { SelectPopover } from "@/components/shared/SelectPopover";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

import type { TransactionType, CategoryType } from "@/lib/types/database";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { emitDataChanged } from "@/lib/utils/events";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const schema = z.object({
  type: z.enum(["expense", "income", "transfer"]),
  amount: z.number().positive("Jumlah tidak boleh kosong"),
  transaction_date: z.string().min(1, "Tanggal wajib diisi"),
  account_id: z.string().min(1, "Akun wajib dipilih"),
  to_account_id: z.string().optional(),
  category_id: z.string().nullable(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function typeToCategoryType(type: TransactionType): CategoryType {
  return type === "income" ? "income" : "expense";
}

export function AddTransactionModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { data: accounts } = useAccounts();
  const formId = React.useId();

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
  });

  const type = form.watch("type");
  const categoryType = typeToCategoryType(type);

  async function submit(values: FormValues) {
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Kamu belum login");
        return;
      }

      if (type === "transfer") {
        const fromTx = {
          user_id: user.id,
          account_id: values.account_id,
          category_id: null,
          type: "transfer" as const,
          amount: values.amount,
          note: values.note || null,
          transaction_date: values.transaction_date,
        };
        const toTx = {
          user_id: user.id,
          account_id: values.to_account_id,
          category_id: null,
          type: "transfer" as const,
          amount: values.amount,
          note: values.note || null,
          transaction_date: values.transaction_date,
        };
        const { data: inserted, error: insertError } = await supabase
          .from("transactions")
          .insert([fromTx, toTx])
          .select();
        if (insertError) {
          toast.error(insertError.message);
          return;
        }
        const [fromInserted, toInserted] = inserted;
        const { error: transferError } = await supabase
          .from("transfers")
          .insert({
            from_transaction_id: fromInserted.id,
            to_transaction_id: toInserted.id,
            amount: values.amount,
          });
        if (transferError) {
          toast.error(transferError.message);
          return;
        }
      } else {
        const { error } = await supabase.from("transactions").insert({
          user_id: user.id,
          account_id: values.account_id,
          category_id: values.category_id,
          type: values.type,
          amount: values.amount,
          note: values.note || null,
          transaction_date: values.transaction_date,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
      }

      emitDataChanged("transactions");
      emitDataChanged("accounts");
      emitDataChanged("budgets");
      if (type === "transfer") emitDataChanged("transfers");
      setOpen(false);
      form.reset({
        ...values,
        amount: 0,
        note: "",
      });
      toast.success("Transaksi disimpan!");
    } catch {
      toast.error("Gagal simpan transaksi");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-[calc(100vw-1rem)] sm:max-w-lg flex flex-col max-h-[90dvh] md:max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1">
          <form
            id={formId}
            className="space-y-4 py-4"
            onSubmit={form.handleSubmit(submit)}
          >
            <Tabs
              value={type}
              onValueChange={(v) => form.setValue("type", v as TransactionType)}
            >
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
                onValueChange={(v) =>
                  form.setValue("amount", v, { shouldValidate: true })
                }
              />
              {form.formState.errors.amount ? (
                <div className="text-sm text-accent-red">
                  {form.formState.errors.amount.message}
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors",
                        "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      )}
                    >
                      <span className="truncate">
                        {form.watch("transaction_date")
                          ? format(
                              parseISO(form.watch("transaction_date")),
                              "d MMM yyyy",
                              {
                                locale: idLocale,
                              },
                            )
                          : "Pilih tanggal…"}
                      </span>
                      <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={
                        form.watch("transaction_date")
                          ? parseISO(form.watch("transaction_date"))
                          : undefined
                      }
                      locale={idLocale}
                      weekStartsOn={1}
                      onSelect={(d) => {
                        if (!d) return;
                        form.setValue(
                          "transaction_date",
                          format(d, "yyyy-MM-dd"),
                          { shouldValidate: true },
                        );
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.transaction_date ? (
                  <div className="text-sm text-accent-red">
                    {form.formState.errors.transaction_date.message}
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Akun</Label>
                <SelectPopover
                  value={form.watch("account_id")}
                  onChange={(id) =>
                    form.setValue("account_id", id, { shouldValidate: true })
                  }
                  placeholder="Pilih akun…"
                  options={accounts.map((a) => ({
                    value: a.id,
                    label: a.name,
                    textValue: a.name,
                  }))}
                />
                {type === "transfer" && (
                  <div className="space-y-2">
                    <Label>Ke Akun</Label>
                    <SelectPopover
                      value={form.watch("to_account_id") ?? ""}
                      onChange={(id) => form.setValue("to_account_id", id)}
                      placeholder="Pilih akun tujuan…"
                      options={accounts
                        .filter((a) => a.id !== form.watch("account_id"))
                        .map((a) => ({
                          value: a.id,
                          label: a.name,
                          textValue: a.name,
                        }))}
                    />
                  </div>
                )}
                {form.formState.errors.account_id ? (
                  <div className="text-sm text-accent-red">
                    {form.formState.errors.account_id.message}
                  </div>
                ) : null}
              </div>
            </div>

            {type !== "transfer" && (
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
              <Input
                placeholder="Contoh: tarik tunai"
                {...form.register("note")}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button type="submit" form={formId}>
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
