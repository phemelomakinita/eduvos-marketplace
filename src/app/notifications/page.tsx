import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AppNotification } from '@/lib/types'
import NotificationsView from '@/components/NotificationsView'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data } = await supabase.from('notifications')
    .select('id, kind, role, title, body, order_id, read_at, created_at')
    .order('created_at', { ascending: false }).limit(60)
  return <NotificationsView userId={user.id} initial={(data ?? []) as AppNotification[]} />
}
