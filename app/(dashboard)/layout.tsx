import type { ReactNode } from "react"

import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { TopBar } from "@/components/layout/TopBar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="md:flex md:min-h-dvh">
        <aside className="hidden md:sticky md:top-0 md:block md:h-dvh md:w-[240px] md:border-r md:border-border md:bg-card">
          <Sidebar />
        </aside>

        <div className="flex min-h-dvh flex-1 flex-col">
          <div className="md:hidden">
            <TopBar />
          </div>

          <main className="flex-1 px-4 pb-24 pt-4 md:pb-8 md:pt-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>

          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  )
}

