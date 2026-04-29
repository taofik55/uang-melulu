import { AccountPills } from "@/components/dashboard/AccountPills"
import { BudgetAlerts } from "@/components/dashboard/BudgetAlerts"
import { MonthlySummary } from "@/components/dashboard/MonthlySummary"
import { NetWorthCard } from "@/components/dashboard/NetWorthCard"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <NetWorthCard />
      <AccountPills />
      <MonthlySummary />
      <RecentTransactions />
      <BudgetAlerts />
    </div>
  )
}

