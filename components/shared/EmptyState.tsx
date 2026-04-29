"use client"

import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <Card className="bg-card border-border p-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="size-11 rounded-2xl bg-primary/15 text-primary grid place-items-center border border-border">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </div>
    </Card>
  )
}

