import { AddInvestmentModal } from "@/components/investasi/AddInvestmentModal"
import { InvestmentCard } from "@/components/investasi/InvestmentCard"

export default function InvestasiPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Investasi</div>
          <div className="text-sm text-muted-foreground">Pantau modal dan nilai sekarang</div>
        </div>
        <AddInvestmentModal />
      </div>
      <InvestmentCard />
    </div>
  )
}

