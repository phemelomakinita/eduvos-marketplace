import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReportForm from '@/components/ReportForm'

export const dynamic = 'force-dynamic'

export default async function ReportMessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: message, error } = await supabase
    .from('educhat_messages')
    .select('content, user_id')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') notFound()
  if (error) throw new Error(error.message)
  if (!message) notFound()
  if (message.user_id === user.id) redirect('/messages/educhat')

  return (
    <ReportForm
      kind="message"
      targetId={id}
      heading="Report message"
      subject={message.content}
      backHref="/messages/educhat"
    />
  )
}
