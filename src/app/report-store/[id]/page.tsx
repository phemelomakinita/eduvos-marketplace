import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReportForm from '@/components/ReportForm'

export const dynamic = 'force-dynamic'

export default async function ReportStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business, error } = await supabase
    .from('businesses')
    .select('name, owner_id')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') notFound()
  if (error) throw new Error(error.message)
  if (!business) notFound()
  if (business.owner_id === user.id) redirect(`/store/${id}`)

  return (
    <ReportForm
      kind="store"
      targetId={id}
      heading="Report store"
      subject={business.name}
      backHref={`/store/${id}`}
    />
  )
}
