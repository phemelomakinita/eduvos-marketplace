import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReportForm from '@/components/ReportForm'

export const dynamic = 'force-dynamic'

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing, error } = await supabase
    .from('listings')
    .select('title, user_id')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') notFound()
  if (error) throw new Error(error.message)
  if (!listing) notFound()
  if (listing.user_id === user.id) redirect(`/listing/${id}`)

  return (
    <ReportForm
      kind="listing"
      targetId={id}
      heading="Report seller"
      subject={listing.title}
      backHref={`/listing/${id}`}
    />
  )
}