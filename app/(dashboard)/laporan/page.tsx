"use client"

import * as React from "react"
import { BalanceTrend } from "@/components/laporan/BalanceTrend"
import { CategoryDonut } from "@/components/laporan/CategoryDonut"
import { IncomeExpenseChart } from "@/components/laporan/IncomeExpenseChart"
import { TopCategories } from "@/components/laporan/TopCategories"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useCategories } from "@/lib/hooks/useCategories"
import { useAccounts } from "@/lib/hooks/useAccounts"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LaporanPage() {
  const { data: tx, loading: txLoading } = useTransactions()
  const { data: categories, loading: catLoading } = useCategories()
  const { data: accounts, loading: accLoading } = useAccounts()
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async () => {
    if (txLoading || catLoading || accLoading) {
      toast.info("Sedang memuat data terbaru, silakan tunggu...")
      return
    }

    if (!tx || tx.length === 0) {
      toast.error("Tidak ada data transaksi untuk diekspor")
      return
    }

    try {
      setIsExporting(true)
      
      const accountMap = new Map(accounts.map((a) => [a.id, a.name]))
      const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

      const headers = ["ID Transaksi", "Tanggal", "Tipe", "Jumlah", "Kategori", "Akun", "Catatan", "Tanggal Dibuat"]
      
      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return ""
        const str = String(val)
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      const rows = tx.map((t) => {
        const date = t.transaction_date || ""
        const typeLabel = t.type === "income" ? "Pemasukan" : t.type === "expense" ? "Pengeluaran" : "Transfer"
        const amount = t.amount
        const categoryName = t.category_id ? (categoryMap.get(t.category_id) || "Tanpa Kategori") : "Tanpa Kategori"
        const accountName = t.account_id ? (accountMap.get(t.account_id) || "Akun Tidak Dikenal") : "Semua Akun"
        const note = t.note || ""
        const createdAt = t.created_at ? new Date(t.created_at).toLocaleString("id-ID") : ""

        return [
          escapeCSV(t.id),
          escapeCSV(date),
          escapeCSV(typeLabel),
          escapeCSV(amount),
          escapeCSV(categoryName),
          escapeCSV(accountName),
          escapeCSV(note),
          escapeCSV(createdAt)
        ]
      })

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      
      const formattedDate = new Date().toISOString().slice(0, 10)
      link.setAttribute("href", url)
      link.setAttribute("download", `laporan_transaksi_${formattedDate}.csv`)
      link.style.visibility = "hidden"
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Laporan berhasil diekspor!")
    } catch (err: any) {
      toast.error(`Gagal mengekspor data: ${err?.message || "Kesalahan tidak dikenal"}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Laporan</div>
          <div className="text-sm text-muted-foreground">Lihat pola pemasukan dan pengeluaran</div>
        </div>
        <button
          type="button"
          disabled={isExporting}
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Export CSV
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
