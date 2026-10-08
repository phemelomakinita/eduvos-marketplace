'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({
  href = '/feed',
  label = 'Back to feed',
  history = false,
}: {
  href?: string
  label?: string
  history?: boolean
}) {
  const router = useRouter()
  return (
    <button
      onClick={() => history ? router.back() : router.push(href)}
      aria-label="Back to feed"
      className="flex items-center gap-1 text-gray-600 mb-4"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 14l-4-4l4-4" />
        <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
      </svg>
      <span className="text-sm">{label}</span>
    </button>
  )
}