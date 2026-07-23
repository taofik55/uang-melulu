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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { emitDataChanged } from "@/lib/utils/events";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { SelectPopover } from "@/components/shared/SelectPopover";
import type { SavingsGoal } from "@/lib/types/database";

interface EditGoalModalProps {
  goal: SavingsGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGoalModal({ goal, open, onOpenChange }: EditGoalModalProps) {
  const [name, setName] = React.useState(goal.name);
  const [icon, setIcon] = React.useState(goal.icon || "🎯");
  const [hasTarget, setHasTarget] = React.useState(goal.target_amount !== null);
  const [target, setTarget] = React.useState(goal.target_amount || 0);
  const [date, setDate] = React.useState(goal.target_date || "");
  const [importFromAccount, setImportFromAccount] = React.useState(!!goal.account_id);
  const [accountId, setAccountId] = React.useState(goal.account_id || "");
  const [iconOpen, setIconOpen] = React.useState(false);

  const { data: accounts } = useAccounts();

  React.useEffect(() => {
    setName(goal.name);
    setIcon(goal.icon || "🎯");
    setHasTarget(goal.target_amount !== null);
    setTarget(goal.target_amount || 0);
    setDate(goal.target_date || "");
    setImportFromAccount(!!goal.account_id);
    setAccountId(goal.account_id || "");
  }, [goal, open]);

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

  const isSaveDisabled =
    !name ||
    (hasTarget ? target <= 0 : importFromAccount ? !accountId : false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Target Tabungan</DialogTitle>
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
            <Label>Tipe Tabungan</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={hasTarget ? "default" : "ghost"}
                onClick={() => {
                  setHasTarget(true);
                  setImportFromAccount(false);
                }}
                className="w-full"
              >
                Dengan Target
              </Button>
              <Button
                type="button"
                variant={!hasTarget ? "default" : "ghost"}
                onClick={() => setHasTarget(false)}
                className="w-full"
              >
                Tanpa Target
              </Button>
            </div>
          </div>

          {hasTarget ? (
            <>
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
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Hubungkan dengan Rekening</Label>
                  <div className="text-xs text-muted-foreground">
                    Saldo tabungan akan mengikuti saldo rekening terpilih
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="size-5 rounded border-border text-primary focus:ring-primary accent-primary"
                  checked={importFromAccount}
                  onChange={(e) => setImportFromAccount(e.target.checked)}
                />
              </div>

              {importFromAccount && (
                <div className="space-y-2">
                  <Label>Pilih Rekening</Label>
                  <SelectPopover
                    value={accountId}
                    onChange={setAccountId}
                    placeholder="Pilih rekening..."
                    options={accounts.map((acc) => ({
                      value: acc.id,
                      label: (
                        <span className="flex items-center gap-2">
                          <span>{acc.icon || "💳"}</span>
                          <span>{acc.name}</span>
                        </span>
                      ),
                    }))}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              onClick={async () => {
                try {
                  const supabase = createSupabaseBrowserClient();
                  const { error } = await supabase
                    .from("savings_goals")
                    .update({
                      name,
                      icon,
                      target_amount: hasTarget ? target : null,
                      target_date: hasTarget && date ? date : null,
                      account_id: (!hasTarget && importFromAccount) ? accountId : null,
                    })
                    .eq("id", goal.id);

                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  emitDataChanged("savings");
                  onOpenChange(false);
                  toast.success("Target diperbarui!");
                } catch {
                  toast.error("Gagal memperbarui target");
                }
              }}
              disabled={isSaveDisabled}
            >
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
