import { BalanceTrend } from "@/components/laporan/BalanceTrend"
import { CategoryDonut } from "@/components/laporan/CategoryDonut"
import { IncomeExpenseChart } from "@/components/laporan/IncomeExpenseChart"
import { TopCategories } from "@/components/laporan/TopCategories"

export default function LaporanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Laporan</div>
          <div className="text-sm text-muted-foreground">Lihat pola pemasukan dan pengeluaran</div>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
          aria-disabled="true"
        >
          Export (segera hadir)
        </button>
      </div>

      <IncomeExpenseChart />
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryDonut />
        <BalanceTrend />
      </div>
      <TopCategories />
    </div>
  )
}

