'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Avatar from '@/components/Avatar'
import BackButton from '@/components/BackButton'
import MessagesTabs from '@/components/MessagesTabs'
import MarketplaceNavigation from '@/components/MarketplaceNavigation'
import { createClient } from '@/lib/supabase/client'
import { dayLabel, formatClock } from '@/lib/chatTime'
import type { EduchatMessage } from '@/lib/types'

export default function EduchatRoom({
  userId,
  memberCount,
  initialMessages,
}: {
  userId: string
  memberCount: number
  initialMessages: EduchatMessage[]
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [reportId, setReportId] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)

  const addMessage = useCallback((msg: EduchatMessage) => {
    setMessages((current) => {
      if (current.some((message) => message.id === msg.id)) return current
      return [...current, msg].sort((a, b) => a.created_at.localeCompare(b.created_at)).slice(-300)
    })
  }, [])

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('educhat_messages')
      .select('*, profiles(full_name, campus, avatar_url)')
      .order('created_at', { ascending: false }).limit(50)
    setMessages(((data ?? []).reverse()) as EduchatMessage[])
  }, [supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [])

  useEffect(() => {
    if (stickToBottom.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase.channel('educhat-room')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'educhat_messages',
      }, async (payload) => {
        const id = payload.new.id
        if (typeof id !== 'string') return
        const { data } = await supabase.from('educhat_messages')
          .select('*, profiles(full_name, campus, avatar_url)').eq('id', id).single()
        if (data) addMessage(data as EduchatMessage)
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'educhat_messages',
      }, (payload) => {
        const id = payload.old.id
        if (typeof id === 'string') setMessages((current) => current.filter((message) => message.id !== id))
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void refetch()
      })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refetch()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      void supabase.removeChannel(channel)
    }
  }, [addMessage, refetch, supabase])

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setError('')

    try {
      const { data, error: sendError } = await supabase.from('educhat_messages')
        .insert({ user_id: userId, content })
        .select('*, profiles(full_name, campus, avatar_url)').single()

      if (sendError) {
        setError(sendError.message.includes('Slow down')
          ? 'Slow down: please wait a moment before sending again.'
          : 'Message not sent. Please try again.')
      } else if (data) {
        stickToBottom.current = true
        addMessage(data as EduchatMessage)
        setText('')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-50 pb-16">
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-4 pt-3">
        <div className="mx-auto max-w-3xl">
          <BackButton />
          <div className="pb-3 pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Campus community</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Educhat</h1>
            <p className="mt-1 text-xs text-slate-500">Meet students and share ideas across Eduvos.</p>
          </div>
          <MessagesTabs active="educhat" />
        </div>
      </div>
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Campus-wide conversation</p>
          <p className="text-xs text-slate-500">Be kind and keep it welcoming.</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-800">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
          </svg>
          {memberCount} members
        </span>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const element = event.currentTarget
          stickToBottom.current = (element.scrollHeight - element.scrollTop - element.clientHeight) < 120
        }}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {messages.length === 0 ? (
          <div className="my-auto rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" />
              </svg>
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-900">Start the campus conversation</h2>
            <p className="mt-1 text-sm text-slate-500">Share a thought, ask a question, or say hello.</p>
          </div>
        ) : messages.map((m, index) => {
          const previous = messages[index - 1]
          const newDay = !previous || new Date(previous.created_at).toDateString() !== new Date(m.created_at).toDateString()
          const fullName = m.profiles?.full_name
          const firstName = fullName?.trim().split(/\s+/)[0] || 'Student'

          return (
            <div key={m.id} className="contents">
              {newDay && (
                <p className="my-2 self-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-500 shadow-sm">
                  {dayLabel(m.created_at)}
                </p>
              )}
              {m.user_id === userId ? (
                <div className="max-w-[82%] self-end sm:max-w-[70%]">
                  <div className="rounded-2xl rounded-br-sm bg-blue-700 px-4 py-2.5 text-white">
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{m.content}</p>
                  </div>
                  <p className="mt-1 text-right text-[10px] text-slate-400">{formatClock(m.created_at)}</p>
                </div>
              ) : (
                <div className="flex max-w-[88%] items-start gap-2.5 sm:max-w-[75%]">
                  <Link href={`/profile/${m.user_id}`}><Avatar name={fullName ?? null} url={m.profiles?.avatar_url ?? null} size={28} /></Link>
                  <div className="min-w-0">
                    <p className="mb-1 text-[11px]">
                      <Link href={`/profile/${m.user_id}`} className="font-semibold text-blue-800 hover:underline">{firstName}</Link>
                      {m.profiles?.campus && <span className="text-slate-500"> · {m.profiles.campus}</span>}
                    </p>
                    <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{m.content}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <p className="text-[10px] text-slate-400">{formatClock(m.created_at)}</p>
                      <button
                        type="button"
                        onClick={() => setReportId(reportId === m.id ? null : m.id)}
                        aria-expanded={reportId === m.id}
                        className="text-[10px] font-medium text-slate-400 hover:text-slate-700"
                      >
                        {reportId === m.id ? 'Hide options' : 'More'}
                      </button>
                    </div>
                    {reportId === m.id && <Link href={`/report-message/${m.id}`} className="mt-1 inline-flex rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100">Report message</Link>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
        </div>
      </div>
      <div className="flex-shrink-0 border-t border-slate-200 bg-white px-3 pt-2 sm:px-4">
        {error && <p role="alert" className="mx-auto mb-2 max-w-3xl rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">{error}</p>}
        <form onSubmit={handleSend} className="mx-auto flex max-w-3xl items-end gap-2 pb-2">
          <label htmlFor="educhat-message" className="sr-only">Message everyone</label>
          <textarea
            id="educhat-message"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={1000}
            rows={1}
            placeholder="Message your campus..."
            className="max-h-32 min-h-11 min-w-0 flex-1 resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
          <button type="submit" disabled={sending || !text.trim()} aria-label={sending ? 'Sending message' : 'Send message'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 14l11 -11" /><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
            </svg>
          </button>
        </form>
      </div>
      <MarketplaceNavigation active="messages" />
    </div>
  )
}
