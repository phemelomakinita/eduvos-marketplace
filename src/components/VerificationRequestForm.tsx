'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/lib/types'

export default function VerificationRequestForm({ business }: { business: Business }) {
  const [studentNumber, setStudentNumber] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const label = business.is_verified
    ? 'Verified'
    : business.verification_status === 'pending'
      ? 'Pending review'
      : business.verification_status === 'rejected'
        ? 'Not approved'
        : 'Not requested'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const { error: requestError } = await supabase.rpc('request_hub_verification', {
      p_hub_student_number: studentNumber.trim(),
      p_note: note.trim() || null,
    })
    if (requestError) {
      setError(requestError.message)
      setLoading(false)
      return
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href="/my-store" label="Back to My Store" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-blue-700">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06" /><path d="M15 19l2 2l4 -4" /></svg>
        </div>
        <div><h1 className="text-base font-semibold text-gray-900">Hub Verification</h1><p className="text-xs text-gray-500">Status: {label}</p></div>
      </div>
      {business.is_verified ? (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-900">You&apos;re Hub Verified ✓</p>
          <p className="text-xs text-gray-600 mt-1">Your badge shows on your store and on every listing you post as the store.</p>
        </div>
      ) : business.verification_status === 'pending' ? (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-900">Request submitted</p>
          <p className="text-xs text-gray-600 mt-1">An admin is reviewing your request.</p>
          {business.hub_student_number && <p className="text-xs text-gray-500 mt-2">Hub student number: {business.hub_student_number}</p>}
        </div>
      ) : (
        <>
          {business.verification_status === 'rejected' && (
            <div className="border border-blue-200 bg-blue-50 rounded-xl px-3 py-2 mb-4">
              <p className="text-xs font-semibold text-blue-700">Your last request was not approved</p>
              <p className="text-xs text-blue-600 mt-0.5">{business.verification_rejection_reason || 'No reason given.'} You can apply again below.</p>
            </div>
          )}
          <p className="text-sm font-semibold text-gray-900 mb-2">What you get</p>
          <div className="border border-gray-200 rounded-xl p-3 mb-3 space-y-2">
            {['✓ Hub Verified badge on your store and every listing', 'Verified stores are shown first in the feed', 'More trust from buyers'].map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 text-xs text-gray-800">
                <svg width="14" height="14" className="text-blue-700 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5l10 -10" /></svg>
                {benefit}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border border-dashed border-gray-300 rounded-lg px-3 py-2 mb-4">
            <span className="text-xs text-gray-800">Verification fee</span><span className="text-xs font-semibold text-gray-900">Free during the pilot</span>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="block text-xs text-gray-600 mb-1">Incubation Hub student number</label>
            <input required minLength={3} maxLength={30} value={studentNumber} onChange={(event) => setStudentNumber(event.target.value)} placeholder="e.g. 2026123456" className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white" />
            <label className="block text-xs text-gray-600 mb-1">Tell us about your business (optional)</label>
            <textarea rows={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What do you sell and how long have you been running?" className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white resize-none" />
            {error && <p className="text-xs text-blue-600 mb-3">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50">{loading ? 'Submitting...' : 'Submit request'}</button>
            <p className="text-[10px] text-gray-500 text-center mt-2">An admin reviews your request. You&apos;ll see Pending, Verified or Not approved here.</p>
          </form>
        </>
      )}
    </div>
  )
}
