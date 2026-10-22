import BackButton from '@/components/BackButton'
import ReportsQueue, { type AdminReport } from '@/components/ReportsQueue'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin()

  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (reportsError) throw new Error(reportsError.message)

  const reportRows = (reports ?? []) as AdminReport[]
  const profileIds = Array.from(new Set(
    reportRows.flatMap((report) => [report.reported_by, report.seller_id].filter((id): id is string => Boolean(id)))
  ))
  const { data: profiles, error: profilesError } = profileIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', profileIds)
    : { data: [], error: null }

  if (profilesError) throw new Error(profilesError.message)

  const names: Record<string, string> = {}
  for (const id of profileIds) {
    names[id] = 'Student'
  }
  for (const profile of profiles ?? []) {
    names[profile.id] = profile.full_name || 'Student'
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href="/admin" label="Back to Admin" />
      <ReportsQueue reports={reportRows} names={names} />
    </div>
  )
}
