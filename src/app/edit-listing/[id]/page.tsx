import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditListingForm from '@/components/EditListingForm'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (!listing) notFound()
  if (listing.user_id !== user.id) redirect('/feed')

  return <EditListingForm listing={listing} />
}