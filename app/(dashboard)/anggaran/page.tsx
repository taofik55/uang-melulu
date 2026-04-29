import { BudgetCard } from "@/components/anggaran/BudgetCard"
import { SetBudgetModal } from "@/components/anggaran/SetBudgetModal"

export default function AnggaranPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Anggaran</div>
          <div className="text-sm text-muted-foreground">Biar pengeluaran tetap aman</div>
        </div>
        <SetBudgetModal />
      </div>
      <BudgetCard />
    </div>
  )
}

