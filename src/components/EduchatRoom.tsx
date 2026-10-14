'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Avatar from '@/components/Avatar'
import BackButton from '@/components/BackButton'
import MessagesTabs from '@/components/MessagesTabs'
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
    <div className="h-dvh flex flex-col bg-white">
      <div className="flex-shrink-0 px-4 pt-4"><BackButton /></div>
      <MessagesTabs active="educhat" />
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">Educhat</p>
          <p className="text-[10px] text-gray-500">All Eduvos campuses</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 rounded-full px-2.5 py-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
          </svg>
          {memberCount} members
        </span>
      </div>
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const element = event.currentTarget
          stickToBottom.current = (element.scrollHeight - element.scrollTop - element.clientHeight) < 120
        }}
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
      >
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-10">No messages yet. Start the conversation!</p>
        ) : messages.map((m, index) => {
          const previous = messages[index - 1]
          const newDay = !previous || new Date(previous.created_at).toDateString() !== new Date(m.created_at).toDateString()
          const fullName = m.profiles?.full_name
          const firstName = fullName?.trim().split(/\s+/)[0] || 'Student'

          return (
            <div key={m.id} className="contents">
              {newDay && <p className="text-[10px] text-gray-500 text-center">{dayLabel(m.created_at)}</p>}
              {m.user_id === userId ? (
                <div className="self-end max-w-[78%]">
                  <div className="bg-blue-700 text-white rounded-2xl rounded-br-sm px-3 py-2">
                    <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                  <p className="text-[9px] text-gray-500 text-right mt-0.5">{formatClock(m.created_at)}</p>
                </div>
              ) : (
                <div className="flex gap-2 items-start max-w-[85%]">
                  <Link href={`/profile/${m.user_id}`}><Avatar name={fullName ?? null} url={m.profiles?.avatar_url ?? null} size={28} /></Link>
                  <div className="min-w-0">
                    <p className="text-[11px] mb-0.5">
                      <Link href={`/profile/${m.user_id}`} className="font-semibold text-blue-700">{firstName}</Link>
                      <span className="text-gray-500"> · {m.profiles?.campus ?? ''}</span>
                    </p>
                    <div onClick={() => setReportId(reportId === m.id ? null : m.id)} className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 cursor-pointer">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-0.5">{formatClock(m.created_at)}</p>
                    {reportId === m.id && <Link href={`/report-message/${m.id}`} className="inline-block text-[11px] text-gray-500 mt-1">🚩 Report message</Link>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      {error && <p className="flex-shrink-0 text-xs text-red-600 px-4 pb-1">{error}</p>}
      <form onSubmit={handleSend} className="flex-shrink-0 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={1000}
          placeholder="Message everyone..."
          className="flex-1 min-w-0 border border-gray-300 rounded-full px-4 py-2 text-base text-gray-900 bg-white"
        />
        <button type="submit" disabled={sending || !text.trim()} aria-label="Send" className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 14l11 -11" /><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
          </svg>
        </button>
      </form>
    </div>
  )
}
