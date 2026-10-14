import { redirect } from 'next/navigation'
import BackButton from '@/components/BackButton'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DirectMessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conversationId, error } = await supabase.rpc('start_conversation', { p_other_user: id })
  if (conversationId && !error) redirect(`/messages/c/${conversationId}`)

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton history label="Back" />
      <h1 className="text-base font-semibold text-gray-900 mb-2">Message</h1>
      <p className="text-sm text-gray-600">{error?.message ?? 'Could not start this chat.'}</p>
    </div>
  )
}
