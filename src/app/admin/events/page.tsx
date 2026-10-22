import Link from 'next/link'
import BackButton from '@/components/BackButton'
import AdminEventsList from '@/components/AdminEventsList'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const { supabase, user } = await requireAdmin()
  void user

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })

  if (error) throw new Error(error.message)

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href="/admin" label="Back to Admin" />
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base font-semibold text-gray-900">Events</h1>
        <Link href="/admin/events/new" className="text-xs text-blue-700 font-semibold">+ New</Link>
      </div>
      <AdminEventsList events={events ?? []} />
    </div>
  )
}
