'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import BackButton from '@/components/BackButton'
import { createClient } from '@/lib/supabase/client'
import { inboxTime } from '@/lib/chatTime'
import MessagesTabs from '@/components/MessagesTabs'
import MarketplaceNavigation from '@/components/MarketplaceNavigation'
import { ChatCircle, CaretRight } from '@phosphor-icons/react/ssr'

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
    <div className="min-h-dvh bg-background px-4 pb-24 pt-4 sm:px-6">
      <main className="mx-auto max-w-3xl">
        <BackButton />
        <header className="mb-5 mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Keep the conversation going</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Messages</h1>
          <p className="mt-1 text-sm text-slate-500">Connect with sellers and your campus community.</p>
        </header>
        <MessagesTabs active="messages" />
        <section aria-label="Direct message conversations" className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {items.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center text-blue-700">
                <ChatCircle size={28} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-slate-900">Your inbox is ready</h2>
              <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-slate-500">Message a seller from any listing to start a conversation.</p>
              <Link href="/feed" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700">Explore listings</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <Link key={item.id} href={`/messages/c/${item.id}`} className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-slate-50 focus-visible:bg-blue-50 focus-visible:outline-none sm:px-5">
                  <span className="relative shrink-0">
                    <Avatar name={item.otherName} url={item.otherAvatarUrl} size={48} />
                    {item.unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className={`truncate text-sm ${item.unread > 0 ? 'font-semibold text-slate-950' : 'font-medium text-slate-800'}`}>{item.otherName}</span>
                      <time dateTime={item.lastAt} className={`shrink-0 text-[11px] ${item.unread > 0 ? 'font-semibold text-blue-700' : 'text-slate-400'}`}>{inboxTime(item.lastAt)}</time>
                    </span>
                    {item.listingTitle && <span className="mt-0.5 block truncate text-xs font-medium text-blue-700">Re: {item.listingTitle}</span>}
                    <span className={`mt-1 block truncate text-xs ${item.unread > 0 ? 'font-medium text-slate-700' : 'text-slate-500'}`}>{item.preview || 'Start the conversation...'}</span>
                  </span>
                  {item.unread > 0 && <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 px-1.5 text-[10px] font-semibold text-white">{item.unread > 99 ? '99+' : item.unread}</span>}
                  <CaretRight size={16} className="shrink-0 text-slate-300" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <MarketplaceNavigation active="messages" />
    </div>
  )
}
