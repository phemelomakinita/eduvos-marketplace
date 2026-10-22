import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().slice(0, 10)
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .order('event_date', { ascending: true })

  if (error) throw new Error(error.message)

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />
      <h1 className="text-base font-semibold text-gray-900 mb-4">Upcoming Events</h1>

      {!events?.length ? (
        <p className="text-xs text-gray-400 text-center py-10">No upcoming events. Check back soon.</p>
      ) : (
        events?.map((event) => (
          <article key={event.id} className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
            {event.poster_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.poster_url} alt={event.title} className="w-full max-h-[28rem] object-contain bg-gray-50" />
            )}
            <div className="p-3">
              <p className="text-sm font-semibold text-gray-900">{event.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(`${event.event_date}T00:00:00`).toLocaleDateString('en-ZA', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <span className="inline-block bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full mt-2">{event.campus}</span>
              {event.description && <p className="text-xs text-gray-600 mt-2">{event.description}</p>}
            </div>
          </article>
        ))
      )}
    </div>
  )
}