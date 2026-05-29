import { AccountPills } from "@/components/dashboard/AccountPills"
import { BudgetAlerts } from "@/components/dashboard/BudgetAlerts"
import { MonthlySummary } from "@/components/dashboard/MonthlySummary"
import { NetWorthCard } from "@/components/dashboard/NetWorthCard"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { AddTransactionModal } from "@/components/transaksi/AddTransactionModal"
import { Plus } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <NetWorthCard />
      <AccountPills />
      <MonthlySummary />
      <RecentTransactions />
      <BudgetAlerts />

      {/* Floating Action Button (FAB) */}
      <AddTransactionModal
        trigger={
          <button
            type="button"
            className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/95 hover:shadow-primary/30 transition-all duration-200 hover:scale-110 active:scale-95 md:bottom-8 md:right-8"
            aria-label="Tambah transaksi"
          >
            <Plus className="size-6" />
          </button>
        }
      />
    </div>
  )
}

