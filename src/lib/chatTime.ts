export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function dayLabel(iso: string): string {
  const date = new Date(iso)
  const daysAgo = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000)
  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

export function inboxTime(iso: string): string {
  const date = new Date(iso)
  const age = Date.now() - date.getTime()
  if (age < 60000) return 'now'
  if (age < 3600000) return `${Math.floor(age / 60000)}m`
  const daysAgo = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000)
  if (daysAgo === 0) return formatClock(iso)
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo <= 6) return date.toLocaleDateString('en-ZA', { weekday: 'short' })
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}
