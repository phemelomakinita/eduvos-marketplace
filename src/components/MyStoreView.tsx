'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BackButton from '@/components/BackButton'
import type { Business, Listing } from '@/lib/types'

export default function MyStoreView({
  business,
  listings,
}: {
  business: Business | null
  listings: Listing[]
}) {
  const [items, setItems] = useState(listings)
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
      <div className="min-h-screen bg-white px-4 py-4 max-w-sm mx-auto">
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
    <div className="min-h-screen bg-white px-4 py-4 max-w-sm mx-auto">
      <BackButton />

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-base font-semibold text-gray-900">{business.name}</h1>
          {business.is_verified && (
            <span className="text-[9px] border border-gray-300 text-gray-600 px-1.5 py-0.5 rounded">
              ✓ Hub Verified
            </span>
          )}
          {!business.is_verified && (
            <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
              Pending approval
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{business.category} · {business.description}</p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900">Your listings</p>
        <Link href="/post-listing" className="text-xs text-blue-700 font-medium">+ New listing</Link>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-8">No listings yet under this business.</p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
              {item.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-300 text-lg">📷</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
              <p className="text-xs text-gray-500">
                {item.price ? `R${item.price}` : item.category} · {item.campus}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href={`/edit-listing/${item.id}`} className="text-xs text-blue-700 font-medium">Edit</Link>
              <button onClick={() => handleDelete(item.id)} className="text-xs text-red-600 font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}