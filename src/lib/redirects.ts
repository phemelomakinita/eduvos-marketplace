export const NEXT_STORAGE_KEY = 'postLoginNext'

export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.includes('://')) return null
  return value
}
