'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/categories'
import Sidebar from '@/components/Sidebar'
import type { Listing } from '@/lib/types'

export default function FeedView({
  firstName,
  listings,
}: {
  firstName: string
  listings: Listing[]
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const filtered =
    activeCategory === 'All'
      ? listings
      : listings.filter((l) => l.category === activeCategory)

  return (
    <div className="h-screen flex flex-col bg-white">

      {/* TOP BAR — fixed */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Welcome, {firstName}</span>
        <button onClick={() => setSidebarOpen(true)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-3">

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

        <div className="flex flex-wrap gap-1.5">
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 w-full text-center py-8">No listings yet in this category.</p>
          )}
          {filtered.map((item) => (
            <div key={item.id} className="w-[calc(50%-3px)] border border-gray-200 rounded-lg p-1.5">
              <div className="w-full h-[58px] bg-gray-50 rounded-md flex items-center justify-center mb-1.5 overflow-hidden">
                {item.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="10" r="1.5" />
                    <path d="M21 15l-5-5L5 19" />
                  </svg>
                )}
              </div>
              <p className="text-[11px] font-semibold text-gray-900 leading-tight">{item.title}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">
                {item.price ? `R${item.price}` : item.category} · {item.campus}
              </p>
            </div>
          ))}
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