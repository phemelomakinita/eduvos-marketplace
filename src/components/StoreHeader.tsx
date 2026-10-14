import type { Business } from '@/lib/types'

export default function StoreHeader({
  business,
  campus,
  showPending = false,
}: {
  business: Business
  campus: string | null
  showPending?: boolean
}) {
  const details = [business.category, campus].filter(Boolean).join(' · ')

  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-16 h-16 rounded-full flex-shrink-0 overflow-hidden${business.logo_url ? '' : ' bg-gray-100 flex items-center justify-center'}`}>
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l18 0" />
              <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1l-2 -4h-14l-2 4" />
              <path d="M5 21l0 -10.15" />
              <path d="M19 21l0 -10.15" />
              <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-gray-900">{business.name}</h1>
          {details && <p className="text-xs text-gray-500 mt-0.5">{details}</p>}
          {business.is_verified ? (
            <span className="inline-block mt-1.5 text-[9px] border border-gray-300 text-gray-600 px-1.5 py-0.5 rounded">✓ Hub Verified</span>
          ) : showPending ? (
            business.verification_status === 'pending' ? (
              <span className="inline-block mt-1.5 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Verification pending</span>
            ) : business.verification_status === 'rejected' ? (
              <span className="inline-block mt-1.5 text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Not approved</span>
            ) : (
              <span className="inline-block mt-1.5 text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Not verified</span>
            )
          ) : null}
        </div>
      </div>
      {business.description && <p className="text-sm text-gray-800 leading-relaxed mb-2">{business.description}</p>}
      {business.contact_number && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
          </svg>
          {business.contact_number}
        </div>
      )}
      {business.email && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
            <path d="M3 7l9 6l9 -6" />
          </svg>
          {business.email}
        </div>
      )}
    </>
  )
}
