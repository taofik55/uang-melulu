export function formatRupiah(n: number) {
  const value = Number.isFinite(n) ? n : 0
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value)
  return `Rp ${formatted}`
}

export function parseRupiah(s: string) {
  const cleaned = s.replace(/[^0-9-]/g, "")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

