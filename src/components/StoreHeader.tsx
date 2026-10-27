import type { Business } from '@/lib/types'
import { Envelope, Phone, SealCheck, Storefront } from '@phosphor-icons/react/ssr'

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
      <div className="mb-4 flex items-center gap-4">
        <div className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl${business.logo_url ? '' : ' flex items-center justify-center bg-blue-50'}`}>
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <Storefront size={30} className="text-brand" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{business.name}</h1>
          {details && <p className="mt-1 text-sm text-slate-500">{details}</p>}
          {business.is_verified ? (
            <span className="mt-2 inline-flex items-center gap-1 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-strong">
              <SealCheck size={16} weight="fill" aria-hidden="true" /> Hub verified
            </span>
          ) : showPending ? (
            business.verification_status === 'pending' ? (
              <span className="mt-2 inline-flex bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">Verification pending</span>
            ) : business.verification_status === 'rejected' ? (
              <span className="mt-2 inline-flex bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Not approved</span>
            ) : (
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Not verified</span>
            )
          ) : null}
        </div>
      </div>
      {business.description && <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-600">{business.description}</p>}
      {business.contact_number && (
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
          <Phone size={16} aria-hidden="true" />
          {business.contact_number}
        </div>
      )}
      {business.email && (
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
          <Envelope size={16} aria-hidden="true" />
          {business.email}
        </div>
      )}
    </>
  )
}
