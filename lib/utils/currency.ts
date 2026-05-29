export function formatRupiah(n: number) {
  const value = Number.isFinite(n) ? n : 0

  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} M`
  }

  if (value >= 100_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} Jt`
  }

  return `Rp ${value.toLocaleString("id-ID")}`
}

export function formatRupiahChart(n: number) {
  const value = Number.isFinite(n) ? n : 0

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} M`
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} Jt`
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} Rb`
  }

  return value.toLocaleString("id-ID")
}

export function parseRupiah(s: string) {
  const cleaned = s.replace(/[^0-9-]/g, "")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

