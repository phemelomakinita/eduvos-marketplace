import { notFound } from 'next/navigation'
import EventForm from '@/components/EventForm'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function EditAdminEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase, user } = await requireAdmin()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') notFound()
  if (error) throw new Error(error.message)
  if (!event) notFound()

  return <EventForm userId={user.id} event={event} />
}
