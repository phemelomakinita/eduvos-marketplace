import Link from 'next/link'
import BackButton from '@/components/BackButton'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { supabase, name } = await requireAdmin()
  const today = new Date().toISOString().slice(0, 10)

  const [reportsResult, verificationsResult, eventsResult] = await Promise.all([
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('events').select('id', { count: 'exact', head: true }).gte('event_date', today),
  ])

  const pendingReports = reportsResult.count
  const pendingVerifications = verificationsResult.count
  const upcomingEvents = eventsResult.count
  const countErrors = [
    reportsResult.error?.message,
    verificationsResult.error?.message,
    eventsResult.error?.message,
  ].filter((message): message is string => Boolean(message))

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />
      <h1 className="text-base font-semibold text-gray-900">Admin</h1>
      <p className="text-xs text-gray-500 mb-4">Signed in as {name}</p>

      {countErrors.map((message, index) => (
        <p key={`${index}-${message}`} className="text-xs text-red-600 mb-3">{message}</p>
      ))}

      <Link href="/admin/reports" className="flex items-center justify-between border border-gray-200 rounded-xl p-4 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Reports</p>
          <p className="text-[11px] text-gray-500">Listings, stores, users and messages</p>
        </div>
        <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${pendingReports !== null && pendingReports > 0 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          {pendingReports ?? '—'}
        </span>
      </Link>

      <Link href="/admin/verifications" className="flex items-center justify-between border border-gray-200 rounded-xl p-4 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Hub verification</p>
          <p className="text-[11px] text-gray-500">Requests from student businesses</p>
        </div>
        <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${pendingVerifications !== null && pendingVerifications > 0 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          {pendingVerifications ?? '—'}
        </span>
      </Link>

      <Link href="/admin/events" className="flex items-center justify-between border border-gray-200 rounded-xl p-4 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Events</p>
          <p className="text-[11px] text-gray-500">Upcoming events and posters</p>
        </div>
        <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-gray-100 text-gray-700">
          {upcomingEvents ?? '—'}
        </span>
      </Link>

      <Link href="/admin/events/new" className="block w-full text-center bg-blue-700 text-white rounded-md py-2 text-sm font-medium mt-2">
        Post an event
      </Link>
    </div>
  )
}
