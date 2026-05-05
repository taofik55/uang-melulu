"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, UI } from "react-day-picker"

import { cn } from "@/lib/utils/cn"

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        [UI.Months]: "flex flex-col gap-4",
        [UI.Month]: "space-y-3",
        [UI.MonthCaption]: "flex items-center justify-between px-1",
        [UI.CaptionLabel]: "text-sm font-medium",
        [UI.Nav]: "flex items-center gap-1",
        [UI.PreviousMonthButton]:
          "grid size-8 place-items-center rounded-md border border-border bg-background text-foreground hover:bg-muted",
        [UI.NextMonthButton]:
          "grid size-8 place-items-center rounded-md border border-border bg-background text-foreground hover:bg-muted",
        [UI.MonthGrid]: "w-full border-collapse",
        [UI.Weekday]: "w-9 p-0 py-1 text-center text-xs font-medium text-muted-foreground",
        [UI.Day]: "p-0 text-center",
        [UI.DayButton]: "grid size-9 place-items-center rounded-md text-sm hover:bg-muted",
        selected: "bg-primary text-primary-foreground",
        today: "border border-border",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-40",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft {...iconProps} className={cn("size-4", iconProps.className)} />
          ) : orientation === "right" ? (
            <ChevronRight {...iconProps} className={cn("size-4", iconProps.className)} />
          ) : orientation === "down" ? (
            <ChevronDown {...iconProps} className={cn("size-4", iconProps.className)} />
          ) : (
            <ChevronRight {...iconProps} className={cn("size-4", iconProps.className)} />
          ),
      }}
      {...props}
    />
  )
}
