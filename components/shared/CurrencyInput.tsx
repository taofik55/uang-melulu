"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { formatRupiah, parseRupiah } from "@/lib/utils/currency"

export function CurrencyInput({
  value,
  onValueChange,
  placeholder,
  className,
  autoFocus,
}: {
  value: number
  onValueChange: (v: number) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}) {
  const [raw, setRaw] = React.useState(value ? formatRupiah(value) : "")

  React.useEffect(() => {
    setRaw(value ? formatRupiah(value) : "")
  }, [value])

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">Rp</div>
      <Input
        autoFocus={autoFocus}
        inputMode="numeric"
        placeholder={placeholder ?? "0"}
        className="pl-10 tabular"
        value={raw.replace(/^Rp\s?/, "")}
        onChange={(e) => {
          const next = `Rp ${e.target.value}`
          setRaw(next)
          onValueChange(parseRupiah(next))
        }}
        onBlur={() => setRaw(value ? formatRupiah(value) : "")}
      />
    </div>
  )
}

