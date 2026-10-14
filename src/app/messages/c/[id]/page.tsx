import { notFound, redirect } from 'next/navigation'
import ChatThread from '@/components/ChatThread'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conv } = await supabase.from('conversations').select('*').eq('id', id).single()
  if (!conv) notFound()
  const otherId = conv.user_a === user.id ? conv.user_b : conv.user_a
  const { data: other } = await supabase.from('profiles').select('id, full_name, campus, avatar_url').eq('id', otherId).single()
  if (!other) notFound()
  const { data: recent } = await supabase.from('messages').select('*').eq('conversation_id', id)
    .order('created_at', { ascending: false }).limit(200)
  const initialMessages = (recent ?? []).reverse()
  let listingExists = false
  if (conv.listing_id) {
    const { data: listing } = await supabase.from('listings').select('id').eq('id', conv.listing_id).maybeSingle()
    listingExists = !!listing
  }

  return (
    <ChatThread
      conversationId={conv.id}
      userId={user.id}
      other={{ id: other.id, name: other.full_name ?? 'Student', campus: other.campus, avatarUrl: other.avatar_url }}
      listing={conv.listing_title ? { id: conv.listing_id, title: conv.listing_title, photoUrl: conv.listing_photo_url, price: conv.listing_price, exists: listingExists } : null}
      initialMessages={initialMessages}
    />
  )
}
