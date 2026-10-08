'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BackButton from '@/components/BackButton'
import type { Listing } from '@/lib/types'

export default function MyListingsView({ listings, hasStore }: { listings: Listing[]; hasStore: boolean }) {
  const [items, setItems] = useState(listings)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing?')) return
    setError('')

    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }

    setItems(items.filter((item) => item.id !== id))
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base font-semibold text-gray-900">My listings ({items.length})</h1>
        <Link href="/post-listing" className="text-xs text-blue-700 font-semibold">+ New</Link>
      </div>
      {hasStore && (
        <Link href="/my-store" className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 mb-3 bg-gray-50">
          <span className="text-xs text-gray-500">Listings posted as your store are in My Store</span>
          <svg className="text-gray-400 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </Link>
      )}
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center pt-20 gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">You haven&apos;t posted anything yet</p>
          <Link href="/post-listing" className="bg-blue-700 text-white rounded-md px-5 py-2 text-sm font-medium">Post a listing</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border border-gray-200 rounded-xl p-2">
              <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.photo_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.photo_url} alt={item.title} className="w-full h-full object-contain" />
                  </>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="10" r="1.5" />
                    <path d="M21 15l-5-5L5 19" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-500 truncate">{item.price ? `R${item.price}` : ''}{item.price && item.category ? ' · ' : ''}{item.category}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link href={`/edit-listing/${item.id}`} aria-label="Edit listing" className="text-gray-500 p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                    <path d="M13.5 6.5l4 4" />
                  </svg>
                </Link>
                <button type="button" onClick={() => handleDelete(item.id)} aria-label="Delete listing" className="text-red-600 p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7l16 0" />
                    <path d="M10 11l0 6" />
                    <path d="M14 11l0 6" />
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
