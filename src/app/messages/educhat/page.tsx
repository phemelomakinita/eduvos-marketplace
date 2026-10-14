import { redirect } from 'next/navigation'
import EduchatRoom from '@/components/EduchatRoom'
import { createClient } from '@/lib/supabase/server'
import type { EduchatMessage } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EduchatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
  const { data: recent } = await supabase.from('educhat_messages')
    .select('*, profiles(full_name, campus, avatar_url)')
    .order('created_at', { ascending: false }).limit(50)
  const initialMessages = ((recent ?? []).reverse()) as EduchatMessage[]

  return <EduchatRoom userId={user.id} memberCount={count ?? 0} initialMessages={initialMessages} />
}
