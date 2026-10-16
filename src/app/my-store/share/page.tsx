import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ShareStoreCard from '@/components/ShareStoreCard'

export const dynamic = 'force-dynamic'

export default async function ShareStorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!business) redirect('/register-business')

  return <ShareStoreCard business={business} />
}
