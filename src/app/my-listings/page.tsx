import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MyListingsView from '@/components/MyListingsView'

export const dynamic = 'force-dynamic'

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .is('business_id', null)
    .order('created_at', { ascending: false })

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  return <MyListingsView listings={listings || []} hasStore={!!business} />
}
