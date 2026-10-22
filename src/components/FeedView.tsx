'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/lib/categories'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/types'

type FeedListing = Listing & {
  businesses?: { is_verified?: boolean | null } | null
}

export default function FeedView({
  firstName,
  listings,
  userId,
  unreadCount,
  isAdmin = false,
}: {
  firstName: string
  listings: FeedListing[]
  userId: string
  unreadCount: number
  isAdmin?: boolean
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const channel = supabase.channel(`feed-notifications-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => router.refresh())
      .subscribe()
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') router.refresh()
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [supabase, router, userId])

  const filtered =
    activeCategory === 'All'
      ? listings
      : listings.filter((l) => l.category === activeCategory)

  const getBusinessVerified = (item: Listing) => {
    const source = item.businesses
    if (!source) return false
    if (Array.isArray(source)) return Boolean(source[0]?.is_verified)
    return Boolean(source.is_verified)
  }

  return (
    <div className="h-dvh w-full max-w-full overflow-x-hidden flex flex-col bg-white">

      {/* TOP BAR — fixed */}
      <div className="relative flex-shrink-0 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Welcome, {firstName}</span>
        {isAdmin && (
          <Link href="/admin" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 border border-blue-700 text-blue-700 rounded-full px-3 py-1 text-[11px] font-semibold">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06" />
              <path d="M15 19l2 2l4 -4" />
            </svg>
            Admin
          </Link>
        )}
        <button onClick={() => setSidebarOpen(true)} aria-label={`Menu${unreadCount > 0 ? `, ${unreadCount} unread notifications` : ''}`} className="relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
          {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white" />}
        </button>
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={unreadCount} />

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-4 py-3">

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <span className="text-xs text-gray-500">Search listings...</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
          <button
            onClick={() => setActiveCategory('All')}
            className={`text-[10px] px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeCategory === 'All' ? 'bg-blue-700 text-white' : 'border border-gray-200 text-gray-600'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveCategory(c.value)}
              className={`text-[10px] px-2.5 py-1.5 rounded-md whitespace-nowrap ${
                activeCategory === c.value ? 'bg-blue-700 text-white' : 'border border-gray-200 text-gray-600'
              }`}
            >
              {c.emoji} {c.value}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
  {filtered.length === 0 && (
    <p className="col-span-2 text-xs text-gray-400 text-center py-8">No listings yet in this category.</p>
  )}
  {filtered.map((item) => {
    const isVerified = getBusinessVerified(item)

    return (
      <Link
        key={item.id}
        href={`/listing/${item.id}`}
        className="block min-w-0 border border-gray-200 rounded-xl p-2"
      >
        <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden relative">
          {item.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.photo_url} alt={item.title} className="w-full h-full object-contain" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" />
              <path d="M21 15l-5-5L5 19" />
            </svg>
          )}
          {isVerified && (
            <span
              aria-label="Hub Verified"
              className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-white/95 text-blue-700 text-[9px] font-semibold rounded-full pl-1 pr-1.5 py-0.5 shadow-sm"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5l10 -10" />
              </svg>
              Verified
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{item.title}</p>
          {isVerified && (
            <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[9px] font-medium text-gray-700">
              Verified
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {item.price ? `R${item.price}` : item.category} · {item.campus}
        </p>
      </Link>
    )
  })}
</div>

      </div>

      {/* BOTTOM NAV — fixed */}
      <div className="flex-shrink-0 border-t border-gray-200 px-8 py-2 flex items-center justify-between">
        <Link href="/messages" aria-label="Messages">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        </Link>

        <Link
          href="/post-listing"
          aria-label="Post a listing"
          className="w-[42px] h-[42px] bg-blue-700 rounded-full flex items-center justify-center -mt-5 shadow-lg text-white text-xl"
        >
          +
        </Link>

        <Link href="/events" aria-label="Events">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </Link>
      </div>

    </div>
  )
}
