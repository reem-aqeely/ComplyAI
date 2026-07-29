const arabicNumberFormatter = new Intl.NumberFormat('ar-SA')
const arabicDateFormatter = new Intl.DateTimeFormat('ar-SA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
const arabicDateTimeFormatter = new Intl.DateTimeFormat('ar-SA', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatNumber(value: number): string {
  return arabicNumberFormatter.format(value)
}

export function formatPercent(value: number): string {
  return `${arabicNumberFormatter.format(Math.round(value))}٪`
}

export function formatDate(iso: string): string {
  return arabicDateFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return arabicDateTimeFormatter.format(new Date(iso))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`
  const kb = bytes / 1024
  if (kb < 1024) return `${arabicNumberFormatter.format(Math.round(kb))} ك.ب`
  const mb = kb / 1024
  return `${new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 1 }).format(mb)} م.ب`
}
