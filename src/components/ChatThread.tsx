'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import { createClient } from '@/lib/supabase/client'
import { dayLabel, formatClock } from '@/lib/chatTime'
import type { Message } from '@/lib/types'

type ChatThreadProps = {
  conversationId: string
  userId: string
  other: { id: string; name: string; campus: string | null; avatarUrl: string | null }
  listing: { id: string | null; title: string; photoUrl: string | null; price: number | null; exists: boolean } | null
  initialMessages: Message[]
}

export default function ChatThread({ conversationId, userId, other, listing, initialMessages }: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const supabase = useMemo(() => createClient(), [])
  const bottomRef = useRef<HTMLDivElement>(null)

  const addMessages = useCallback((incoming: Message[]) => {
    setMessages((current) => {
      const byId = new Map(current.map((message) => [message.id, message]))
      incoming.forEach((message) => byId.set(message.id, message))
      return [...byId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at))
    })
  }, [])

  const markRead = useCallback(async () => {
    await supabase.from('messages').update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId).eq('recipient_id', userId).is('read_at', null)
  }, [conversationId, supabase, userId])

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId)
      .order('created_at', { ascending: false }).limit(200)
    addMessages((data ?? []).reverse() as Message[])
    await markRead()
  }, [addMessages, conversationId, markRead, supabase])

  useEffect(() => {
    void markRead()
    const channel = supabase.channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const message = payload.new as Message
        addMessages([message])
        if (message.recipient_id === userId && document.visibilityState === 'visible') void markRead()
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void refetch()
      })
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refetch()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void supabase.removeChannel(channel)
    }
  }, [addMessages, conversationId, markRead, refetch, supabase, userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setError('')
    const { data, error: sendError } = await supabase.from('messages')
      .insert({ conversation_id: conversationId, sender_id: userId, recipient_id: other.id, content })
      .select().single()
    if (sendError) {
      setError('Message not sent. Please try again.')
    } else if (data) {
      addMessages([data as Message])
      setText('')
    }
    setSending(false)
  }

  const listingCard = listing && (
    <div className="flex-shrink-0 mx-4 mt-2 flex items-center gap-2 border border-gray-200 rounded-xl p-2">
      {listing.exists && listing.id ? (
        <Link href={`/listing/${listing.id}`} className="contents">
          <ListingContents listing={listing} />
        </Link>
      ) : <ListingContents listing={listing} />}
    </div>
  )

  return (
    <div className="h-dvh flex flex-col bg-white">
      <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/messages" aria-label="Back to messages" className="text-gray-700">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 14l-4-4l4-4" /><path d="M5 10h11a4 4 0 1 1 0 8h-1" /></svg>
        </Link>
        <Link href={`/profile/${other.id}`} className="flex items-center gap-2 min-w-0">
          <Avatar name={other.name} url={other.avatarUrl} size={32} />
          <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{other.name}</p><p className="text-[10px] text-gray-500 truncate">{other.campus}</p></div>
        </Link>
      </div>
      {listingCard}
      <p className="flex-shrink-0 text-[10px] text-gray-500 text-center mt-2">🔒 Keep chat and payment inside the app</p>
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-10">Say hello 👋</p>
        ) : messages.map((message, index) => {
          const mine = message.sender_id === userId
          const firstOfDay = index === 0 || dayLabel(messages[index - 1].created_at) !== dayLabel(message.created_at)
          return (
            <div key={message.id} className="contents">
              {firstOfDay && <p className="text-[10px] text-gray-500 text-center my-1">{dayLabel(message.created_at)}</p>}
              <div className={`${mine ? 'self-end max-w-[75%] bg-blue-700 text-white rounded-2xl rounded-br-sm px-3 py-2' : 'self-start max-w-[75%] bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm px-3 py-2'}`}>
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <p className={`text-[9px] mt-0.5 ${mine ? 'text-right text-white/70' : 'text-gray-500'}`}>{formatClock(message.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      {error && <p className="flex-shrink-0 text-xs text-red-600 px-4 pb-1">{error}</p>}
      <form onSubmit={handleSend} className="flex-shrink-0 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
        <input value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} placeholder="Type a message..." className="flex-1 min-w-0 border border-gray-300 rounded-full px-4 py-2 text-base text-gray-900 bg-white" />
        <button type="submit" disabled={sending || !text.trim()} aria-label="Send" className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M10 14l11 -11" /><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" /></svg>
        </button>
      </form>
    </div>
  )
}

function ListingContents({ listing }: { listing: NonNullable<ChatThreadProps['listing']> }) {
  return (
    <>
      <div className="w-9 h-9 rounded-md bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
        {listing.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photoUrl} alt={listing.title} className="w-full h-full object-contain" />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 truncate">{listing.title}</p><p className="text-[10px] text-gray-500">{listing.price != null ? `R${listing.price}` : ''}{!listing.exists ? ' · Listing removed' : ''}</p></div>
      {listing.exists && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M9 6l6 6l-6 6" /></svg>}
    </>
  )
}
