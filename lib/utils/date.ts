import { format, isToday, isYesterday, parseISO, differenceInCalendarDays } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export function formatTanggal(isoOrDate: string | Date) {
  const date = typeof isoOrDate === "string" ? parseISO(isoOrDate) : isoOrDate
  return format(date, "d MMM yyyy", { locale: idLocale })
}

export function sisaHari(isoOrDate: string | Date) {
  const date = typeof isoOrDate === "string" ? parseISO(isoOrDate) : isoOrDate
  const diff = differenceInCalendarDays(date, new Date())
  if (diff === 0) return "Hari ini"
  if (diff > 0) return `${diff} hari lagi`
  return `Terlambat ${Math.abs(diff)} hari`
}

export function groupByDate<T extends { transaction_date: string }>(items: T[]) {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const date = parseISO(item.transaction_date)
    let label = formatTanggal(date)

    if (isToday(date)) label = "Hari ini"
    else if (isYesterday(date)) label = "Kemarin"

    const arr = groups.get(label) ?? []
    arr.push(item)
    groups.set(label, arr)
  }

  return Array.from(groups.entries()).map(([label, data]) => ({ label, data }))
}

