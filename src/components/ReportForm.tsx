'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BackButton from '@/components/BackButton'

const reasons = ['Spam', 'Inappropriate content', 'Fraud or scam', 'Harassment', 'Other']

export default function ReportForm({
  kind,
  targetId,
  heading,
  subject,
  backHref,
}: {
  kind: 'listing' | 'store' | 'user' | 'message'
  targetId: string
  heading: string
  subject: string
  backHref: string
}) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    const payload = {
      target_type: kind,
      reported_by: user.id,
      reason,
      note: note.trim() || null,
      ...(kind === 'listing' ? { listing_id: targetId } : {}),
      ...(kind === 'store' ? { business_id: targetId } : {}),
      ...(kind === 'user' ? { seller_id: targetId } : {}),
      ...(kind === 'message' ? { message_id: targetId } : {}),
    }
    const { error: insertError } = await supabase.from('reports').insert(payload)

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white px-4 py-4">
        <div className="pt-16 text-center">
          <p className="text-base font-semibold text-gray-900">Report sent</p>
          <p className="text-xs text-gray-500 mt-1 mb-5">Thank you. An admin will review it.</p>
          <Link href="/feed" className="inline-block bg-blue-700 text-white rounded-md px-5 py-2 text-sm font-medium">
            Back to feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href={backHref} label="Back" />
      <h1 className="text-base font-semibold text-gray-900 mb-1">{heading}</h1>
      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{subject}</p>

      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-gray-600 mb-1" htmlFor="report-reason">Reason</label>
        <select
          id="report-reason"
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        >
          <option value="">Select a reason</option>
          {reasons.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <label className="block text-xs text-gray-600 mb-1" htmlFor="report-note">Details (optional)</label>
        <textarea
          id="report-note"
          rows={3}
          maxLength={500}
          placeholder="Add details (optional)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send report'}
        </button>
        <p className="text-[10px] text-gray-500 text-center mt-2">
          An admin will review your report. Thank you for keeping the marketplace safe.
        </p>
      </form>
    </div>
  )
}
