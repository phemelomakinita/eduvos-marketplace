import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditStoreForm from '@/components/EditStoreForm'

export const dynamic = 'force-dynamic'

export default async function EditStorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!business) redirect('/register-business')

  return <EditStoreForm business={business} />
}
