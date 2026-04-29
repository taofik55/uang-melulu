import { cn } from "@/lib/utils/cn"

export function SkeletonCard({
  variant,
  className,
}: {
  variant: "transaction" | "card" | "chart"
  className?: string
}) {
  if (variant === "transaction") {
    return (
      <div className={cn("flex items-center gap-3 rounded-lg border border-border bg-card p-3", className)}>
        <div className="size-10 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto" />
          <div className="h-3 w-14 bg-muted animate-pulse rounded ml-auto" />
        </div>
      </div>
    )
  }

  if (variant === "chart") {
    return <div className={cn("h-64 rounded-xl border border-border bg-card animate-pulse", className)} />
  }

  return <div className={cn("h-28 rounded-xl border border-border bg-card animate-pulse", className)} />
}

