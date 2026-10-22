import BackButton from '@/components/BackButton'
import VerificationQueue from '@/components/VerificationQueue'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AdminVerificationsPage() {
  const { supabase } = await requireAdmin()

  const [pendingResult, reviewedResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, owner_id, name, category, logo_url, hub_student_number, verification_note, verification_requested_at')
      .eq('verification_status', 'pending')
      .order('verification_requested_at', { ascending: true }),
    supabase
      .from('businesses')
      .select('id, owner_id, name, verification_status, verification_reviewed_at, verification_rejection_reason')
      .in('verification_status', ['approved', 'rejected'])
      .not('verification_reviewed_at', 'is', null)
      .order('verification_reviewed_at', { ascending: false })
      .limit(20),
  ])

  if (pendingResult.error) throw new Error(pendingResult.error.message)
  if (reviewedResult.error) throw new Error(reviewedResult.error.message)

  const pending = pendingResult.data ?? []
  const reviewed = reviewedResult.data ?? []
  const ownerIds = Array.from(new Set([...pending, ...reviewed].map((business) => business.owner_id)))
  const { data: profiles, error: profilesError } = ownerIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', ownerIds)
    : { data: [], error: null }

  if (profilesError) throw new Error(profilesError.message)

  const owners: Record<string, string> = {}
  for (const id of ownerIds) {
    owners[id] = 'Student'
  }
  for (const profile of profiles ?? []) {
    owners[profile.id] = profile.full_name || 'Student'
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href="/admin" label="Back to Admin" />
      <VerificationQueue pending={pending} reviewed={reviewed} owners={owners} />
    </div>
  )
}
