import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'
import MarketplaceNavigation from '@/components/MarketplaceNavigation'
import { CalendarCheck, MapPin } from '@phosphor-icons/react/ssr'

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
    <div className="min-h-dvh bg-background px-4 pb-28 pt-4 sm:px-6">
      <main className="mx-auto max-w-5xl">
        <BackButton />

        <section className="mb-7 mt-4 border-b border-blue-100 pb-6">
          <h1 className="text-[28px] font-bold tracking-tight text-[#102a56] sm:text-[32px]">Campus events</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            See what&apos;s happening across campus.
          </p>
          {!!events?.length && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-800">
              <CalendarCheck size={18} aria-hidden="true" />
              {events.length} upcoming {events.length === 1 ? 'event' : 'events'}
            </p>
          )}
        </section>

        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">Upcoming events</h2>
        </div>

        {!events?.length ? (
          <section className="border border-dashed border-blue-200 bg-white px-5 py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center text-blue-700">
              <CalendarCheck size={28} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">No events on the calendar just yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Check back soon for campus events, meetups, and things to do.</p>
          </section>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event, index) => {
              const eventDate = new Date(`${event.event_date}T00:00:00`)
              return (
                <article key={event.id} className="group overflow-hidden rounded-xl border border-blue-100 bg-white transition-colors duration-150 hover:border-blue-300">
                  {event.poster_url && (
                    <div className="flex aspect-[16/9] items-center justify-center overflow-hidden bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.poster_url} alt={`${event.title} event poster`} className="h-full w-full object-contain" />
                    </div>
                  )}
                  <div className="flex gap-4 p-4 sm:p-5">
                    <div className="flex h-[4.25rem] w-[4.25rem] shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                      <span className="text-xs font-semibold">
                        {eventDate.toLocaleDateString('en-ZA', { month: 'short' })}
                      </span>
                      <span className="font-heading text-2xl font-bold leading-7">
                        {eventDate.toLocaleDateString('en-ZA', { day: 'numeric' })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {index === 0 && (
                        <span className="mb-1 inline-flex bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">Coming up next</span>
                      )}
                      <h3 className="text-base font-semibold leading-snug text-slate-950">{event.title}</h3>
                      <p className="mt-1.5 text-xs font-medium text-slate-600">
                        {eventDate.toLocaleDateString('en-ZA', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      {event.campus && (
                        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <MapPin size={16} aria-hidden="true" />
                          {event.campus}
                        </span>
                      )}
                      {event.entry_fee != null && (
                        <p className="mt-2 text-sm font-semibold text-blue-800">
                          {Number(event.entry_fee) === 0 ? 'Free entry' : `R${Number(event.entry_fee).toFixed(2)} entry`}
                        </p>
                      )}
                    </div>
                  </div>
                  {event.description && (
                    <p className="border-t border-slate-100 px-4 py-3 text-sm leading-6 text-slate-600 sm:px-5">
                      {event.description}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </main>
      <MarketplaceNavigation active="events" />
    </div>
  )
}