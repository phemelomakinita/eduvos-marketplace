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
    .select('*, businesses(is_paused, is_verified)')
    .order('created_at', { ascending: false })

  const visible = (listings || [])
    .filter((l) => !l.businesses?.is_paused)
    .sort((a, b) => (b.businesses?.is_verified ? 1 : 0) - (a.businesses?.is_verified ? 1 : 0))

  return <FeedView firstName={firstName} listings={visible} />
}
