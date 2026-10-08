'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/categories'
import BackButton from '@/components/BackButton'
import type { Listing } from '@/lib/types'

export default function EditListingForm({ listing }: { listing: Listing }) {
  const [title, setTitle] = useState(listing.title)
  const [category, setCategory] = useState(listing.category || '')
  const [price, setPrice] = useState(listing.price?.toString() || '')
  const [description, setDescription] = useState(listing.description || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        title,
        category,
        price: price ? parseFloat(price) : null,
        description: description || null,
      })
      .eq('id', listing.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/my-store')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />
      <h1 className="text-base font-semibold text-gray-900 mb-4">Edit Listing</h1>

      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-gray-600 mb-1">Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        />

        <label className="block text-xs text-gray-600 mb-1">Category</label>
        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.emoji} {c.value}</option>
          ))}
        </select>

        <label className="block text-xs text-gray-600 mb-1">Price (leave blank for POA)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        />

        <label className="block text-xs text-gray-600 mb-1">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm text-gray-900 bg-white resize-none"
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}