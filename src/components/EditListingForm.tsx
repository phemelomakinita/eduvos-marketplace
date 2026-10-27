'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/categories'
import { getCategoryToneClasses } from '@/lib/categories'
import CategoryIcon from '@/components/CategoryIcon'
import BackButton from '@/components/BackButton'
import type { Listing } from '@/lib/types'

export default function EditListingForm({ listing }: { listing: Listing }) {
  const backHref = listing.business_id ? '/my-store' : '/my-listings'
  const backLabel = listing.business_id ? 'Back to My Store' : 'Back to My Listings'
  const [title, setTitle] = useState(listing.title)
  const [category, setCategory] = useState(listing.category || '')
  const [price, setPrice] = useState(listing.price?.toString() || '')
  const [description, setDescription] = useState(listing.description || '')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  function handlePhotoChange(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setPhotoFile(null)
      setPhotoPreview(null)
      setError('Please choose an image under 5 MB.')
      return
    }
    setError('')
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Enter a listing title.')
      return
    }
    if (!CATEGORIES.some((item) => item.value === category)) {
      setError('Select a valid category.')
      return
    }
    if (price && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
      setError('Enter a valid price of zero or more.')
      return
    }
    setLoading(true)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== listing.user_id) {
      setError(authError?.message ?? 'You must be signed in as the owner of this listing.')
      setLoading(false)
      return
    }

    let newPhotoUrl: string | null = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('listing-photos').upload(path, photoFile)
      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }
      newPhotoUrl = supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl
    }

    const { data, error: updateError } = await supabase
      .from('listings')
      .update({
        title: title.trim(),
        category,
        price: price ? parseFloat(price) : null,
        description: description.trim() || null,
        ...(newPhotoUrl ? { photo_url: newPhotoUrl } : {}),
      })
      .eq('id', listing.id)
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle()

    if (updateError || !data) {
      setError(updateError?.message ?? 'This listing could not be updated. It may no longer belong to your account.')
      setLoading(false)
      return
    }

    router.push(backHref)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href={backHref} label={backLabel} />
      <h1 className="text-base font-semibold text-gray-900 mb-4">Edit Listing</h1>

      <label className="relative block w-full aspect-square bg-gray-50 rounded-xl overflow-hidden cursor-pointer">
        {photoPreview || listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreview || listing.photo_url || ''} alt={listing.title} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" />
              <path d="M21 15l-5-5L5 19" />
            </svg>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-xs py-2 flex items-center justify-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
            <path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
          </svg>
          Change photo
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e.target.files?.[0])} />
      </label>
      <p className="text-[10px] text-gray-500 text-center mt-1 mb-3">Tap the photo to replace it</p>

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
            <option key={c.value} value={c.value}>{c.value}</option>
          ))}
        </select>
        {category && (
          <span className={`mb-3 inline-flex items-center gap-2 border px-2.5 py-1.5 text-xs font-medium ${getCategoryToneClasses(CATEGORIES.find((item) => item.value === category)?.tone ?? 'slate').soft}`}>
            <CategoryIcon category={category} className="h-4 w-4" />
            {category}
          </span>
        )}

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

        {error && <p className="text-xs text-blue-600 mb-3">{error}</p>}

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