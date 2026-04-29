import { AddLoanModal } from "@/components/pinjaman/AddLoanModal"
import { LoanCard } from "@/components/pinjaman/LoanCard"

export default function PinjamanPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Pinjaman</div>
          <div className="text-sm text-muted-foreground">Kelola piutang dan hutang</div>
        </div>
        <AddLoanModal />
      </div>
      <LoanCard />
    </div>
  )
}

