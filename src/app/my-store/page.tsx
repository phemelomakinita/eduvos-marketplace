import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MyStoreView from '@/components/MyStoreView'

export const dynamic = 'force-dynamic'

export default async function MyStorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*, profiles(campus)')
    .eq('owner_id', user.id)
    .maybeSingle()

  const { data: listings } = business
    ? await supabase
        .from('listings')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return <MyStoreView business={business} campus={business?.profiles?.campus ?? null} listings={listings || []} />
}