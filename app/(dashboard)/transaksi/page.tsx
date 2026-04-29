import { TransactionFilters } from "@/components/transaksi/TransactionFilters"
import { TransactionList } from "@/components/transaksi/TransactionList"

export default function TransaksiPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Transaksi</div>
        <div className="text-sm text-muted-foreground">Pantau arus kas kamu dengan rapi</div>
      </div>
      <TransactionFilters />
      <TransactionList />
    </div>
  )
}

