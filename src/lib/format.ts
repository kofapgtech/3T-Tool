export function formatCurrency(value: number | null | undefined, opts?: { maximumFractionDigits?: number }) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: opts?.maximumFractionDigits ?? 0,
  }).format(value)
}

export function formatCompactCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number | null | undefined, opts?: { maximumFractionDigits?: number }) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: opts?.maximumFractionDigits ?? 1,
  }).format(value)
}

export function formatNumber(value: number | null | undefined, opts?: { maximumFractionDigits?: number }) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: opts?.maximumFractionDigits ?? 1,
  }).format(value)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export function formatRelativeDays(value: string | null | undefined) {
  if (!value) return '—'
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
