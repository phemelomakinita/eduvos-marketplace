'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BackButton from '@/components/BackButton'
import StoreHeader from '@/components/StoreHeader'
import StoreToolsMenu from '@/components/StoreToolsMenu'
import type { Business, Listing } from '@/lib/types'

export default function MyStoreView({
  business,
  campus,
  listings,
}: {
  business: Business | null
  campus: string | null
  listings: Listing[]
}) {
  const [items, setItems] = useState(listings)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing?')) return

    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (!error) {
      setItems(items.filter((item) => item.id !== id))
      router.refresh()
    }
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-white px-4 py-4">
        <BackButton />
        <h1 className="text-base font-semibold text-gray-900 mb-2">My Store</h1>
        <p className="text-xs text-gray-500 mb-4">You haven&apos;t registered a business yet.</p>
        <Link href="/register-business" className="text-sm text-blue-700 font-medium">
          Register a business →
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4 relative">
      <BackButton />
      <button type="button" onClick={() => setMenuOpen(true)} aria-label="Store tools" aria-expanded={menuOpen} className={`absolute right-3 top-3 w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 ${menuOpen ? 'text-gray-900' : 'text-gray-500 active:text-gray-900'}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        </svg>
      </button>
      <StoreToolsMenu business={business} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <StoreHeader business={business} campus={campus} showPending />
      {business.is_paused && (
        <div className="flex items-center justify-between gap-3 border border-amber-200 bg-amber-50 rounded-xl px-3 py-2 mb-4">
          <div><p className="text-xs font-semibold text-amber-800">Your store is paused</p><p className="text-[10px] text-amber-700">Hidden from the feed until you resume.</p></div>
          <button type="button" onClick={resumeStore} className="text-xs font-semibold text-amber-800 border border-amber-300 rounded-md px-3 py-1.5 flex-shrink-0">Resume</button>
        </div>
      )}
      <div className="flex gap-2 mb-4">
        <Link href="/edit-store" className="flex-1 text-center border border-gray-300 text-gray-800 rounded-md py-2 text-xs font-medium">Edit store</Link>
        <Link href={`/store/${business.id}`} className="flex-1 text-center border border-gray-300 text-gray-800 rounded-md py-2 text-xs font-medium">View public store</Link>
      </div>
      <div className="flex items-center justify-between pt-3 mb-2 border-t border-gray-100">
        <p className="text-sm font-semibold text-gray-900">Your listings ({items.length})</p>
        <Link href="/post-listing" className="text-xs text-blue-700 font-semibold">+ New</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">No listings yet under this store.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border border-gray-200 rounded-xl p-2">
              <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photo_url} alt={item.title} className="w-full h-full object-contain" />
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

  async function resumeStore() {
    if (!business) return
    const { error } = await supabase.from('businesses').update({ is_paused: false }).eq('id', business.id)
    if (!error) router.refresh()
  }
}
