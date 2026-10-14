'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import BackButton from '@/components/BackButton'
import { createClient } from '@/lib/supabase/client'
import { inboxTime } from '@/lib/chatTime'
import MessagesTabs from '@/components/MessagesTabs'

export type InboxItem = {
  id: string
  otherName: string
  otherAvatarUrl: string | null
  listingTitle: string | null
  preview: string
  lastAt: string
  unread: number
}

export default function MessagesView({ userId, items }: { userId: string; items: InboxItem[] }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  useEffect(() => {
    const channel = supabase.channel(`inbox-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}`,
      }, () => router.refresh())
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [router, supabase, userId])

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 pt-4"><BackButton /></div>
      <MessagesTabs active="messages" />
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 text-center px-6 py-12">No conversations yet. Tap Message seller on a listing to start one.</p>
      ) : items.map((item) => (
        <Link key={item.id} href={`/messages/c/${item.id}`} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Avatar name={item.otherName} url={item.otherAvatarUrl} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.otherName}</p>
            {item.listingTitle && <p className="text-[10px] text-blue-700 truncate">Re: {item.listingTitle}</p>}
            <p className={`text-xs truncate ${item.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{item.preview}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] text-gray-500">{inboxTime(item.lastAt)}</span>
            {item.unread > 0 && <span className="text-[10px] bg-blue-700 text-white rounded-full px-1.5 py-0.5">{item.unread}</span>}
          </div>
        </Link>
      ))}
    </div>
  )
}
