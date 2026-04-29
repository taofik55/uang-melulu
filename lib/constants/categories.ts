import type { CategoryType } from "@/lib/types/database"

export const DEFAULT_CATEGORIES: Array<{
  id: string
  name: string
  type: CategoryType
  icon: string
  color: string
}> = [
  { id: "cat-income-gaji", name: "Gaji", type: "income", icon: "💼", color: "#22c55e" },
  { id: "cat-income-freelance", name: "Freelance", type: "income", icon: "💻", color: "#16a34a" },
  { id: "cat-income-investasi", name: "Investasi", type: "income", icon: "📈", color: "#15803d" },
  { id: "cat-income-hadiah", name: "Hadiah", type: "income", icon: "🎁", color: "#86efac" },
  { id: "cat-income-lain", name: "Lainnya (masuk)", type: "income", icon: "➕", color: "#bbf7d0" },
  { id: "cat-expense-makan", name: "Makanan & Minuman", type: "expense", icon: "🍜", color: "#ef4444" },
  { id: "cat-expense-transport", name: "Transportasi", type: "expense", icon: "🚗", color: "#f97316" },
  { id: "cat-expense-belanja", name: "Belanja", type: "expense", icon: "🛒", color: "#eab308" },
  { id: "cat-expense-kesehatan", name: "Kesehatan", type: "expense", icon: "💊", color: "#ec4899" },
  { id: "cat-expense-pendidikan", name: "Pendidikan", type: "expense", icon: "📚", color: "#8b5cf6" },
  { id: "cat-expense-hiburan", name: "Hiburan", type: "expense", icon: "🎮", color: "#06b6d4" },
  { id: "cat-expense-tagihan", name: "Tagihan & Utilitas", type: "expense", icon: "💡", color: "#64748b" },
  { id: "cat-expense-rumah", name: "Rumah", type: "expense", icon: "🏠", color: "#78716c" },
  { id: "cat-expense-pakaian", name: "Pakaian", type: "expense", icon: "👕", color: "#a78bfa" },
  { id: "cat-expense-donasi", name: "Donasi", type: "expense", icon: "❤️", color: "#fb7185" },
  { id: "cat-expense-lain", name: "Lainnya (keluar)", type: "expense", icon: "➖", color: "#d1d5db" },
]

