import type { ReactNode } from 'react'
import { getCategory } from '@/lib/categories'

const illustrations: Record<string, ReactNode> = {
  book: (
    <>
      <path d="M25 35c0-5 5-10 12-10h22c6 0 11 5 11 11v30c0 7-7 12-15 12H25V35Z" fill="#F4B740" />
      <path d="M25 35v32c0 7 7 12 15 12h19c6 0 11-5 11-11V35H25Z" fill="#F7C86A" opacity="0.6" />
      <path d="M51 25h14c7 0 12 5 12 12v31c0 7-5 12-12 12H51V25Z" fill="#D88A3A" />
      <path d="M63 29h10v32H63V29Z" fill="#E9A34D" />
      <path d="M27 39h16M27 47h16M27 55h16M27 63h12" stroke="#FBF4D7" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 35h7M56 43h7M56 51h7M56 59h7" stroke="#F6EAD8" strokeWidth="2" strokeLinecap="round" />
      <path d="M37 25h25c6 0 11 5 11 11v4H35v-4c0-6 5-11 11-11Z" fill="#B86B27" />
      <path d="M31 22c0-6 5-11 11-11h9c8 0 15 7 15 15v6H31v-10Z" fill="#8A4A20" />
    </>
  ),
  food: (
    <>
      <path d="M22 65c0-6 5-11 11-11h32c7 0 12 5 12 11v5H22v-5Z" fill="#F59E0B" />
      <path d="M27 45c0-7 7-13 15-13h12c8 0 15 6 15 13v8H27v-8Z" fill="#FBBF24" />
      <path d="M30 41h32c4 0 8 3 8 8v10H22V49c0-5 4-8 8-8Z" fill="#FDE68A" />
      <path d="M31 45h30l4 8H27l4-8Z" fill="#FDE68A" />
      <path d="M33 39h24l-2-7c-1-4-4-7-8-7s-7 3-8 7l-6 7Z" fill="#F9C74C" />
      <path d="M23 54h34l-4 9H27l-4-9Z" fill="#F59E0B" />
      <path d="M48 36c0 0 8-4 10-1 2 3 0 10-4 12l-8 6-4-3 6-14Z" fill="#65A30D" />
      <path d="M24 58l8 4 6-4 6 4 6-4 8 4 6-4 8 4v9H24v-9Z" fill="#D97706" />
      <path d="M60 36h6v14h-6z" fill="#FCD34D" />
      <path d="M68 38h4v11h-4z" fill="#FDE68A" />
      <path d="M20 57h8v15h-8z" fill="#FACC15" />
      <path d="M18 70h12v4H18z" fill="#F59E0B" />
      <path d="M65 66l8-11 8 11" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M71 62v10" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
      <circle cx="71" cy="58" r="4" fill="#FBBF24" />
      <path d="M60 63c0-2 2-4 4-4h5c3 0 5 2 5 4v3h-14v-3Z" fill="#FDE68A" />
      <path d="M32 46c2-8 6-11 12-11 6 0 11 4 12 11" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 55l5 6 5-6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  tools: (
    <>
      <path d="M20 63L44 44l18 10-22 18-20-9Z" fill="#F0FDFA" />
      <path d="M20 63v11l22 18V73L20 63Z" fill="#99F6E4" />
      <path d="M44 44v11l18 10v-11L44 44Z" fill="#5EEAD4" />
      <path d="M28 27l14-7 10 9-13 8-11-10Z" fill="#1F2937" />
      <path d="M45 18l12 10 7-12-13-7-6 9Z" fill="#F59E0B" />
      <path d="M55 18l7 7-8 12-7-6 8-13Z" fill="#FBBF24" />
      <path d="M51 40l11 8-3 3-12-8 4-3Z" fill="#0F172A" />
      <path d="M57 60l14-11 8 7-16 14-6-10Z" fill="#F59E0B" />
      <path d="M76 51l7 5-5 6-7-5 5-6Z" fill="#EA580C" />
      <path d="M66 69l10-9 4 5-10 9-4-5Z" fill="#F97316" />
      <path d="M32 34l8 7-5 5-8-7 5-5Z" fill="#94A3B8" />
    </>
  ),
  shirt: (
    <>
      <path d="m34 27 9-5h10l9 5 12 7-7 12-7-4v24H36V42l-7 4-7-12 12-7Z" fill="#FB7185" />
      <path d="m36 42-7 4-7-12 12-7 8 8v31h-6V42Z" fill="#F43F5E" />
      <path d="M43 22c0 5 2 8 5 8s5-3 5-8" fill="none" stroke="#BE123C" strokeWidth="2" />
      <path d="M36 37h24" stroke="#FDA4AF" strokeWidth="2" />
    </>
  ),
  device: (
    <>
      <rect x="28" y="18" width="40" height="58" rx="8" fill="#111827" />
      <rect x="31" y="21" width="34" height="52" rx="6" fill="#E2E8F0" />
      <path d="M35 30h26v26H35z" fill="#38BDF8" />
      <path d="M39 41h18" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
      <path d="M39 47h12" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="63" r="2.5" fill="#64748B" />
      <path d="M40 70h16" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  art: (
    <>
      <path d="M25 62c0-15 10-27 23-27 16 0 29 12 29 28 0 7-2 13-7 18H32c-5-5-7-11-7-19Z" fill="#F3E8FF" />
      <path d="M31 31c0-10 8-18 18-18s18 8 18 18c0 8-5 15-12 17v13H44V48c-7-2-13-9-13-17Z" fill="#A78BFA" />
      <path d="M39 22l10 14-10 14-10-14 10-14Z" fill="#F8FAFC" />
      <circle cx="39" cy="36" r="5" fill="#F59E0B" />
      <circle cx="29" cy="46" r="5" fill="#EF4444" />
      <circle cx="49" cy="46" r="5" fill="#10B981" />
      <circle cx="22" cy="58" r="5" fill="#F97316" />
      <circle cx="56" cy="58" r="5" fill="#3B82F6" />
      <path d="M34 56c3 8 8 12 14 12 8 0 14-6 18-16" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  box: (
    <>
      <path d="m23 35 26-14 27 14-27 15-26-15Z" fill="#DBEAFE" />
      <path d="M23 35v30l26 14V50L23 35Z" fill="#60A5FA" />
      <path d="M49 50v29l27-15V35L49 50Z" fill="#93C5FD" />
      <path d="m36 28 27 14M49 50v29" stroke="#2563EB" strokeWidth="2" />
      <path d="m43 24 13 7v14l-13-7V24Z" fill="#F97316" />
    </>
  ),
}

export default function CategoryIllustration({
  category,
  className = 'h-16 w-16',
}: {
  category: string
  className?: string
}) {
  const illustration = illustrations[getCategory(category)?.icon ?? '']
  if (!illustration) return null

  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="49" cy="78" rx="27" ry="7" fill="#64748B" opacity=".12" />
      {illustration}
    </svg>
  )
}
