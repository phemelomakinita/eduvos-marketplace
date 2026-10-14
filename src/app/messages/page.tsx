import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MessagesView, { type InboxItem } from '@/components/MessagesView'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: convs } = await supabase.from('conversations').select('*')
    .not('last_message_at', 'is', null).order('last_message_at', { ascending: false })
  const conversations = convs ?? []
  const otherIds = [...new Set(conversations.map((conv) => conv.user_a === user.id ? conv.user_b : conv.user_a))]
  const { data: people } = otherIds.length
    ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', otherIds)
    : { data: [] }
  const { data: unreadRows } = await supabase.from('messages').select('conversation_id')
    .eq('recipient_id', user.id).is('read_at', null)

  const peopleById = new Map((people ?? []).map((person) => [person.id, person]))
  const unreadCounts = new Map<string, number>()
  for (const row of unreadRows ?? []) {
    unreadCounts.set(row.conversation_id, (unreadCounts.get(row.conversation_id) ?? 0) + 1)
  }
  const items: InboxItem[] = conversations.map((conv) => {
    const otherId = conv.user_a === user.id ? conv.user_b : conv.user_a
    const person = peopleById.get(otherId)
    return {
      id: conv.id,
      otherName: person?.full_name ?? 'Student',
      otherAvatarUrl: person?.avatar_url ?? null,
      listingTitle: conv.listing_title,
      preview: conv.last_message_preview ?? '',
      lastAt: conv.last_message_at!,
      unread: unreadCounts.get(conv.id) ?? 0,
    }
  })

  return <MessagesView userId={user.id} items={items} />
}
