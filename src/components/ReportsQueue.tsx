'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export type AdminReport = {
  id: string
  target_type: 'listing' | 'store' | 'user' | 'message'
  listing_id: string | null
  business_id: string | null
  message_id: string | null
  seller_id: string | null
  reported_by: string
  reason: string | null
  note: string | null
  status: 'pending' | 'resolved'
  listing_title: string | null
  listing_photo_url: string | null
  business_name: string | null
  message_content: string | null
  reported_name: string | null
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
  resolution: 'removed' | 'message_deleted' | 'dismissed' | 'resolved' | null
}

export default function ReportsQueue({
  reports,
  names,
}: {
  reports: AdminReport[]
  names: Record<string, string>
}) {
  const [tab, setTab] = useState<'pending' | 'resolved'>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const pendingReports = reports.filter((report) => report.status === 'pending')
  const resolvedReports = reports.filter((report) => report.status === 'resolved')
  const visibleReports = tab === 'pending' ? pendingReports : resolvedReports

  async function resolveReport(
    report: AdminReport,
    action: 'remove_listing' | 'delete_message' | 'dismiss' | 'resolve'
  ) {
    if (action === 'remove_listing' && !confirm('Remove this listing? The seller will be notified.')) return
    if (action === 'delete_message' && !confirm('Delete this message?')) return

    setError('')
    setBusyId(report.id)
    const { error: rpcError } = await supabase.rpc('admin_resolve_report', {
      p_report_id: report.id,
      p_action: action,
    })
    setBusyId(null)

    if (rpcError) {
      setError(rpcError.message)
      return
    }

    router.refresh()
  }

  function formattedDate(value: string) {
    return new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
  }

  function viewHref(report: AdminReport) {
    if (report.target_type === 'listing' && report.listing_id) return `/listing/${report.listing_id}`
    if (report.target_type === 'store' && report.business_id) return `/store/${report.business_id}`
    if (report.target_type === 'user' && report.seller_id) return `/profile/${report.seller_id}`
    if (report.target_type === 'message' && report.message_id) return '/messages/educhat'
    return null
  }

  function resolutionLabel(resolution: AdminReport['resolution']) {
    if (resolution === 'removed') return 'Listing removed'
    if (resolution === 'message_deleted') return 'Message deleted'
    if (resolution === 'dismissed') return 'Dismissed'
    return 'Marked resolved'
  }

  return (
    <>
      <div className="flex border-b border-gray-200 mb-3">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`flex-1 text-sm py-2.5 border-b-2 ${tab === 'pending' ? 'font-semibold text-blue-700 border-blue-700' : 'text-gray-500 border-transparent'}`}
        >
          Pending ({pendingReports.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('resolved')}
          className={`flex-1 text-sm py-2.5 border-b-2 ${tab === 'resolved' ? 'font-semibold text-blue-700 border-blue-700' : 'text-gray-500 border-transparent'}`}
        >
          Resolved ({resolvedReports.length})
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      {visibleReports.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-12">
          {tab === 'pending' ? 'No pending reports.' : 'Nothing resolved yet.'}
        </p>
      ) : (
        visibleReports.map((report) => {
          const href = viewHref(report)
          const date = formattedDate(report.created_at)
          const targetLabel = report.target_type === 'store'
            ? 'Store'
            : report.target_type.charAt(0).toUpperCase() + report.target_type.slice(1)

          return (
            <article key={report.id} className="border border-gray-200 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">{targetLabel}</span>
                <span className="text-[10px] text-gray-500">{date}</span>
              </div>

              <div className="mt-2">
                {report.target_type === 'listing' && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                      {report.listing_photo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={report.listing_photo_url} alt={report.listing_title || 'Listing'} className="w-full h-full object-contain" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{report.listing_title || 'Listing'}</p>
                      <p className="text-[11px] text-gray-500">Seller: {names[report.seller_id || ''] || 'Student'}</p>
                    </div>
                  </div>
                )}
                {report.target_type === 'store' && (
                  <p className="text-sm font-semibold text-gray-900">{report.business_name || 'Store'}</p>
                )}
                {report.target_type === 'user' && (
                  <p className="text-sm font-semibold text-gray-900">{report.reported_name || 'Student'}</p>
                )}
                {report.target_type === 'message' && (
                  <>
                    <p className="text-sm text-gray-900 line-clamp-3">“{report.message_content || ''}”</p>
                    <p className="text-[11px] text-gray-500 mt-1">by {report.reported_name || 'Student'}</p>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-700 mt-2">
                <span className="font-medium">{report.reason}</span>{report.note ? ` · ${report.note}` : ''}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">Reported by {names[report.reported_by] || 'Student'}</p>

              {href && (
                <Link href={href} className="inline-block text-xs text-blue-700 font-medium mt-2">
                  View
                </Link>
              )}

              {report.status === 'resolved' ? (
                <p className="text-[11px] text-gray-500 mt-2">
                  {resolutionLabel(report.resolution)} · {formattedDate(report.resolved_at || report.created_at)}
                </p>
              ) : (
                <>
                  {report.target_type === 'listing' && !report.listing_id && (
                    <p className="text-[11px] text-gray-500 mt-3">Listing already removed</p>
                  )}
                  {report.target_type === 'message' && !report.message_id && (
                    <p className="text-[11px] text-gray-500 mt-3">Message already removed</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {report.target_type === 'listing' && report.listing_id && (
                      <button
                        type="button"
                        onClick={() => resolveReport(report, 'remove_listing')}
                        disabled={busyId !== null}
                        className="flex-1 rounded-md py-2 text-xs font-medium bg-red-600 text-white disabled:opacity-50"
                      >
                        Remove listing
                      </button>
                    )}
                    {report.target_type === 'message' && report.message_id && (
                      <button
                        type="button"
                        onClick={() => resolveReport(report, 'delete_message')}
                        disabled={busyId !== null}
                        className="flex-1 rounded-md py-2 text-xs font-medium bg-red-600 text-white disabled:opacity-50"
                      >
                        Delete message
                      </button>
                    )}
                    {(report.target_type === 'store' || report.target_type === 'user') && (
                      <button
                        type="button"
                        onClick={() => resolveReport(report, 'resolve')}
                        disabled={busyId !== null}
                        className="flex-1 rounded-md py-2 text-xs font-medium bg-blue-700 text-white disabled:opacity-50"
                      >
                        Mark resolved
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => resolveReport(report, 'dismiss')}
                      disabled={busyId !== null}
                      className="flex-1 rounded-md py-2 text-xs font-medium border border-gray-300 text-gray-800 disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </>
              )}
            </article>
          )
        })
      )}
    </>
  )
}
