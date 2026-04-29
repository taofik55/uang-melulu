"use client"

import * as React from "react"

import { cn } from "@/lib/utils/cn"
import type { CategoryType } from "@/lib/types/database"
import { useCategories } from "@/lib/hooks/useCategories"

export function CategoryPicker({
  type,
  value,
  onChange,
}: {
  type: CategoryType
  value: string | null
  onChange: (id: string | null) => void
}) {
  const { data } = useCategories()
  const categories = React.useMemo(() => data.filter((c) => c.type === type), [data, type])

  return (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((c) => {
        const selected = value === c.id
        return (
          <button
            key={c.id}
            type="button"
            className={cn(
              "rounded-xl border border-border bg-card px-2 py-2 text-left hover:bg-muted transition",
              selected && "bg-primary/15 border-primary"
            )}
            onClick={() => onChange(c.id)}
          >
            <div className="text-lg leading-none">{c.icon}</div>
            <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.name}</div>
          </button>
        )
      })}
      <button
        type="button"
        className={cn(
          "rounded-xl border border-dashed border-border bg-card px-2 py-2 text-left hover:bg-muted transition",
          value === null && "bg-primary/15 border-primary"
        )}
        onClick={() => onChange(null)}
      >
        <div className="text-lg leading-none">✨</div>
        <div className="mt-1 text-xs text-muted-foreground">Tanpa kategori</div>
      </button>
    </div>
  )
}

