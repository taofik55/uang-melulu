"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "next-themes"

export function Toaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      theme={theme === "light" ? "light" : "dark"}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "bg-card text-foreground border border-border",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-foreground",
        },
      }}
    />
  )
}

