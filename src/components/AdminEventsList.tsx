'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type AdminEvent = {
  id: string
  title: string
  event_date: string
  campus: string
  poster_url: string | null
}

export default function AdminEventsList({ events }: { events: AdminEvent[] }) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const today = new Date().toISOString().slice(0, 10)

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return

    setError('')
    setBusyId(id)
    const { error: deleteError } = await supabase.from('events').delete().eq('id', id)
    setBusyId(null)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    router.refresh()
  }

  if (events.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-12">No events yet.</p>
  }

  return (
    <>
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      {events.map((event) => (
        <div key={event.id} className="flex items-center gap-3 border border-gray-200 rounded-xl p-2 mb-2">
          <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
            {event.poster_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.poster_url} alt={event.title} className="w-full h-full object-contain" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
            <p className="text-xs text-gray-500">
              {new Date(`${event.event_date}T00:00:00`).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })} · {event.campus}
            </p>
            {event.event_date < today && (
              <span className="inline-block bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full mt-1">Past</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={`/admin/events/${event.id}/edit`} aria-label="Edit event" className="text-gray-500 p-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                <path d="M13.5 6.5l4 4" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => deleteEvent(event.id)}
              disabled={busyId !== null}
              aria-label="Delete event"
              className="text-red-600 p-1 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7l16 0" />
                <path d="M10 11l0 6" />
                <path d="M14 11l0 6" />
                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </>
  )
}
