'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type PendingBusiness = {
  id: string
  owner_id: string
  name: string
  category: string | null
  logo_url: string | null
  hub_student_number: string | null
  verification_note: string | null
  verification_requested_at: string | null
}

type ReviewedBusiness = {
  id: string
  owner_id: string
  name: string
  verification_status: 'approved' | 'rejected'
  verification_reviewed_at: string | null
  verification_rejection_reason: string | null
}

export default function VerificationQueue({
  pending,
  reviewed,
  owners,
}: {
  pending: PendingBusiness[]
  reviewed: ReviewedBusiness[]
  owners: Record<string, string>
}) {
  const [tab, setTab] = useState<'pending' | 'reviewed'>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  function formattedDate(value: string | null) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
  }

  async function reviewBusiness(businessId: string, approve: boolean, rejectionReason?: string) {
    setError('')
    setBusyId(businessId)
    const { error: rpcError } = await supabase.rpc('review_verification', {
      p_business_id: businessId,
      p_approve: approve,
      ...(rejectionReason ? { p_reason: rejectionReason } : {}),
    })
    setBusyId(null)

    if (rpcError) {
      setError(rpcError.message)
      return
    }

    setRejectId(null)
    setReason('')
    router.refresh()
  }

  return (
    <>
      <div className="flex border-b border-gray-200 mb-3">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`flex-1 text-sm py-2.5 border-b-2 ${tab === 'pending' ? 'font-semibold text-blue-700 border-blue-700' : 'text-gray-500 border-transparent'}`}
        >
          Pending ({pending.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('reviewed')}
          className={`flex-1 text-sm py-2.5 border-b-2 ${tab === 'reviewed' ? 'font-semibold text-blue-700 border-blue-700' : 'text-gray-500 border-transparent'}`}
        >
          Reviewed ({reviewed.length})
        </button>
      </div>

      {error && <p className="text-xs text-blue-600 mb-3">{error}</p>}

      {tab === 'pending' ? (
        pending.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-12">No pending verification requests.</p>
        ) : (
          pending.map((business) => (
            <article key={business.id} className="border border-gray-200 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-3">
                {business.logo_url ? (
                  <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-semibold">
                    {business.name.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{business.name}</p>
                  <p className="text-[11px] text-gray-500">{business.category || 'Business'} · Owner: {owners[business.owner_id] || 'Student'}</p>
                </div>
              </div>

              <p className="text-xs text-gray-900 mt-2">
                Hub student number: <span className="font-semibold">{business.hub_student_number || '—'}</span>
              </p>
              {business.verification_note && (
                <p className="text-xs text-gray-600 mt-1">{business.verification_note}</p>
              )}
              <p className="text-[11px] text-gray-500 mt-1">Requested {formattedDate(business.verification_requested_at)}</p>
              <Link href={`/store/${business.id}`} className="inline-block text-xs text-blue-700 font-medium mt-2">
                View store
              </Link>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => reviewBusiness(business.id, true)}
                  disabled={busyId !== null}
                  className="flex-1 rounded-md py-2 text-xs font-medium bg-blue-700 text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectId(rejectId === business.id ? null : business.id)
                    setReason('')
                    setError('')
                  }}
                  disabled={busyId !== null}
                  className="flex-1 rounded-md py-2 text-xs font-medium border border-blue-300 text-blue-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
              {rejectId === business.id && (
                <div className="mt-3">
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Reason for the owner (required)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => reviewBusiness(business.id, false, reason.trim())}
                    disabled={busyId !== null || reason.trim().length < 3}
                    className="w-full rounded-md py-2 text-xs font-medium bg-blue-600 text-white disabled:opacity-50"
                  >
                    Confirm rejection
                  </button>
                </div>
              )}
            </article>
          ))
        )
      ) : reviewed.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-12">No reviewed requests yet.</p>
      ) : (
        reviewed.map((business) => (
          <article key={business.id} className="border border-gray-200 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">{business.name}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${business.verification_status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-700'}`}>
                {business.verification_status === 'approved' ? 'Verified' : 'Not approved'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Reviewed {formattedDate(business.verification_reviewed_at)}</p>
            {business.verification_status === 'rejected' && business.verification_rejection_reason && (
              <p className="text-xs text-gray-600 mt-2">{business.verification_rejection_reason}</p>
            )}
          </article>
        ))
      )}
    </>
  )
}
