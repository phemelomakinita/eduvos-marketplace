'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import { createClient } from '@/lib/supabase/client'
import { inboxTime } from '@/lib/chatTime'
import type { AppNotification } from '@/lib/types'

const COLUMNS = 'id, kind, role, title, body, order_id, read_at, created_at'

export default function NotificationsView({ userId, initial }: { userId: string; initial: AppNotification[] }) {
  const [items, setItems] = useState(initial)
  const [filter, setFilter] = useState<'all' | 'sale' | 'purchase'>('all')
  const [error, setError] = useState('')
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  function merge(list: AppNotification[]) {
    setItems((prev) => {
      const ids = new Set(prev.map((item) => item.id))
      return [...prev, ...list.filter((item) => !ids.has(item.id))]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 100)
    })
  }

  const refetch = useCallback(async () => {
    const { data, error: fetchError } = await supabase.from('notifications')
      .select(COLUMNS).order('created_at', { ascending: false }).limit(60)
    if (!fetchError) setItems((data ?? []) as AppNotification[])
  }, [supabase])

  function iconFor(kind: string) {
    if (kind === 'order_request') return <><path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304z" /><path d="M9 11v-5a3 3 0 0 1 6 0v5" /></>
    if (['order_paid', 'payment_confirmed', 'payment_missing'].includes(kind)) return <><path d="M7 9m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M14 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 9v-2a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h2" /></>
    if (['order_accepted', 'order_completed'].includes(kind)) return <><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></>
    if (kind === 'order_sent') return <><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5" /><path d="M3 9l4 0" /></>
    if (['order_declined', 'order_cancelled'].includes(kind)) return <><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M10 10l4 4m0 -4l-4 4" /></>
    return <><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></>
  }

  async function open(n: AppNotification) {
    if (!n.read_at) {
      const now = new Date().toISOString()
      setItems((prev) => prev.map((item) => item.id === n.id ? { ...item, read_at: now } : item))
      await supabase.from('notifications').update({ read_at: now }).eq('id', n.id)
    }
    if (n.order_id) router.push(`/orders/${n.order_id}`)
  }

  async function markAll() {
    const now = new Date().toISOString()
    const { error: updateError } = await supabase.from('notifications').update({ read_at: now }).eq('user_id', userId).is('read_at', null)
    if (updateError) setError('Could not mark all as read. Please try again.')
    else {
      setError('')
      setItems((prev) => prev.map((item) => item.read_at ? item : { ...item, read_at: now }))
      router.refresh()
    }
  }

  useEffect(() => {
    const channel = supabase.channel(`notifications-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => merge([payload.new as AppNotification]))
      .subscribe((status) => { if (status === 'SUBSCRIBED') refetch() })
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') refetch()
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [supabase, userId, refetch])

  const unread = items.filter((item) => !item.read_at).length
  const shown = items.filter((item) => filter === 'all' || item.role === filter)
  return <div className="min-h-screen bg-white">
    <div className="px-4 pt-4"><BackButton /></div>
    <div className="flex items-center justify-between px-4 mb-3"><h1 className="text-base font-semibold text-gray-900">Notifications</h1>{unread > 0 && <button type="button" onClick={markAll} className="text-xs text-blue-700 font-medium">Mark all as read</button>}</div>
    <div className="flex gap-1.5 px-4 mb-2">{([['all', 'All'], ['sale', 'Sales'], ['purchase', 'Purchases']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`text-[10px] px-3 py-1.5 rounded-md ${filter === value ? 'bg-blue-700 text-white' : 'border border-gray-200 text-gray-600'}`}>{label}</button>)}</div>
    {error && <p className="text-xs text-blue-600 px-4 mb-2">{error}</p>}
    {shown.length === 0 ? <p className="text-xs text-gray-400 text-center px-6 py-12">{filter === 'all' ? 'No notifications yet. Updates about your sales and purchases will show up here.' : 'Nothing here yet.'}</p> : shown.map((n) => <button type="button" key={n.id} onClick={() => open(n)} className={`flex w-full items-start gap-3 px-4 py-3 border-b border-gray-100 text-left ${n.read_at ? 'bg-white' : 'bg-gray-50'}`}><div className={`w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ${n.read_at ? 'text-gray-500' : 'text-blue-700'}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{iconFor(n.kind)}</svg></div><div className="flex-1 min-w-0"><p className={`text-sm ${n.read_at ? 'text-gray-800' : 'font-semibold text-gray-900'}`}>{n.title}</p><p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p></div><div className="flex flex-col items-end gap-1.5 flex-shrink-0"><span className="text-[10px] text-gray-500">{inboxTime(n.created_at)}</span>{!n.read_at && <span className="w-2 h-2 rounded-full bg-blue-700" />}</div></button>)}
  </div>
}
