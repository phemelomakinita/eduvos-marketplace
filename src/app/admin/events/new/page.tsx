import EventForm from '@/components/EventForm'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function NewAdminEventPage() {
  const { supabase, user } = await requireAdmin()
  void supabase

  return <EventForm userId={user.id} />
}
