import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReportForm from '@/components/ReportForm'

export const dynamic = 'force-dynamic'

export default async function ReportUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (id === user.id) redirect('/profile')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') notFound()
  if (error) throw new Error(error.message)
  if (!profile) notFound()

  return (
    <ReportForm
      kind="user"
      targetId={id}
      heading="Report user"
      subject={profile.full_name ?? 'Student'}
      backHref={`/profile/${id}`}
    />
  )
}
