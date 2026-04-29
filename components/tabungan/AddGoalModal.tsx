"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { emitDataChanged } from "@/lib/utils/events";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function AddGoalModal() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("🎯");
  const [target, setTarget] = React.useState(0);
  const [date, setDate] = React.useState("");
  const [iconOpen, setIconOpen] = React.useState(false);

  const ICON_OPTIONS = [
    "💰",
    "🐷",
    "🏦",
    "🏠",
    "🚗",
    "🏍️",
    "✈️",
    "💍",
    "👶",
    "🎓",
    "💻",
    "🎁",
    "📈",
    "🏋️",
    "📷",
  ] as const;

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
                      "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    )}
                  >
                    <div className="grid grid-cols-4 gap-2">
                      {ICON_OPTIONS.map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={cn(
                            "grid size-10 place-items-center rounded-lg border border-border bg-background text-lg hover:bg-muted",
                            v === icon && "border-primary/60 bg-primary/10",
                          )}
                          onClick={() => {
                            setIcon(v);
                            setIconOpen(false);
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
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Liburan"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target</Label>
            <CurrencyInput value={target} onValueChange={setTarget} />
          </div>

          <div className="space-y-2">
            <Label>Tanggal target</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={async () => {
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

                  const { error } = await supabase
                    .from("savings_goals")
                    .insert({
                      user_id: user.id,
                      name,
                      icon,
                      target_amount: target,
                      current_amount: 0,
                      target_date: date || null,
                      is_completed: false,
                    });
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  emitDataChanged("savings");
                  setOpen(false);
                  toast.success("Target dibuat!");
                } catch {
                  toast.error("Gagal buat target");
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
  );
}
