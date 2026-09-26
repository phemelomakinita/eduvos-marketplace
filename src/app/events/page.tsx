import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  return (
    <div className="min-h-screen bg-white px-4 py-4 max-w-sm mx-auto">
      <BackButton />
      <h1 className="text-base font-semibold text-gray-900 mb-4">Upcoming Events</h1>

      {(!events || events.length === 0) && (
        <p className="text-xs text-gray-400 text-center py-10">No events posted yet — check back soon.</p>
      )}

      <div className="flex flex-col gap-2">
        {events?.map((event) => (
          <div key={event.id} className="border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-900">{event.title}</p>
            <p className="text-xs text-gray-500 mt-1">{event.event_date} · {event.campus}</p>
            {event.description && <p className="text-xs text-gray-600 mt-2">{event.description}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}