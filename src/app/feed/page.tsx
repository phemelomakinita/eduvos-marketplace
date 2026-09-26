import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeedView from '@/components/FeedView'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  // real listings, newest first
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  return <FeedView firstName={firstName} listings={listings || []} />
}