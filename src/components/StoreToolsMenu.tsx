'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/lib/types'

export default function StoreToolsMenu({
  business,
  open,
  onClose,
}: {
  business: Business
  open: boolean
  onClose: () => void
}) {
  const [confirmPause, setConfirmPause] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  async function pauseStore() {
    setBusy(true)
    const { error: updateError } = await supabase.from('businesses').update({ is_paused: true }).eq('id', business.id)
    if (updateError) {
      setError(updateError.message)
      setBusy(false)
      return
    }
    setBusy(false)
    setConfirmPause(false)
    onClose()
    router.refresh()
  }

  async function resumeStore() {
    setBusy(true)
    const { error: updateError } = await supabase.from('businesses').update({ is_paused: false }).eq('id', business.id)
    if (updateError) {
      setError(updateError.message)
      setBusy(false)
      return
    }
    setBusy(false)
    onClose()
    router.refresh()
  }

  const verificationSubtitle = business.is_verified
    ? '✓ Hub Verified'
    : business.verification_status === 'pending'
      ? 'Request under review'
      : business.verification_status === 'rejected'
        ? 'Not approved. Tap to see why'
        : 'Get the ✓ Hub Verified badge'

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/30 z-40" />}
      <div className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white z-50 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo_url} alt={business.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-700 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">{business.name.trim().charAt(0).toUpperCase()}</div>
          )}
          <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{business.name}</p><p className="text-[10px] text-gray-500">Store tools</p></div>
        </div>
        <div className="flex-1">
          <Link href="/my-store/verification" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
            <svg width="20" height="20" className="text-gray-800 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06" /><path d="M15 19l2 2l4 -4" /></svg>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900">Request Hub Verification</p><p className="text-[10px] text-gray-500 mt-0.5">{verificationSubtitle}</p></div>
          </Link>
          <Link href="/my-store/share" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
            <svg width="20" height="20" className="text-gray-800 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M7 17l0 .01" /><path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M7 7l0 .01" /><path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M17 7l0 .01" /><path d="M14 14l3 0" /><path d="M20 14l0 .01" /><path d="M14 14l0 3" /><path d="M14 20l3 0" /><path d="M17 17l3 0" /><path d="M20 17l0 3" /></svg>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900">Copy Business Profile</p><p className="text-[10px] text-gray-500 mt-0.5">QR code and link to share</p></div>
          </Link>
          <Link href="/my-store/earnings" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
            <svg width="20" height="20" className="text-gray-800 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" /><path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" /></svg>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900">Earnings</p><p className="text-[10px] text-gray-500 mt-0.5">Your sales and income</p></div>
          </Link>
        </div>
        {business.is_paused ? (
          <button type="button" onClick={resumeStore} disabled={busy} className="flex items-center gap-3 px-4 py-4 border-t border-gray-200 text-left w-full">
            <svg width="20" height="20" className="text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 4v16l13 -8z" /></svg>
            <span><span className="block text-sm font-semibold text-amber-700">Resume business account</span><span className="block text-[10px] text-gray-500">Show your store in the feed again</span></span>
          </button>
        ) : (
          <button type="button" onClick={() => { setError(''); setConfirmPause(true) }} className="flex items-center gap-3 px-4 py-4 border-t border-gray-200 text-left w-full">
            <svg width="20" height="20" className="text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /></svg>
            <span><span className="block text-sm font-semibold text-amber-700">Pause business account</span><span className="block text-[10px] text-gray-500">Temporarily hide your store</span></span>
          </button>
        )}
      </div>
      {confirmPause && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-start justify-center px-4 pt-24">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Pause {business.name}?</h2>
            <p className="text-xs text-gray-500 mb-2">While paused:</p>
            <ul className="text-xs text-gray-800 space-y-1.5 mb-4 list-disc pl-4">
              <li>Your store and listings are hidden from the feed and search</li>
              <li>Your store page shows &quot;temporarily closed&quot;</li>
              <li>You can&apos;t post new listings as the store</li>
              <li>Existing chats keep working. Resume any time.</li>
            </ul>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <button type="button" onClick={pauseStore} disabled={busy} className="w-full bg-amber-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50 mb-2">{busy ? 'Pausing...' : 'Pause store'}</button>
            <button type="button" onClick={() => setConfirmPause(false)} className="w-full border border-gray-300 text-gray-800 rounded-md py-2 text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
