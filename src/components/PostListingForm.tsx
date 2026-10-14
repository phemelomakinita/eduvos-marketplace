'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/categories'
import BackButton from '@/components/BackButton'

export default function PostListingForm({
  campus,
  business,
  storePaused = false,
}: {
  campus: string
  business: { id: string; name: string } | null
  storePaused?: boolean
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [postAsBusiness, setPostAsBusiness] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file)) // local preview before upload
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    let photoUrl: string | null = null

    // upload photo first, if one was selected
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(filePath, photoFile)

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(filePath)

      photoUrl = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase.from('listings').insert({
      user_id: user.id,
      business_id: postAsBusiness && business ? business.id : null,
      title,
      category,
      price: price ? parseFloat(price) : null,
      description: description || null,
      campus,
      photo_url: photoUrl,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />
      <h1 className="text-base font-semibold text-gray-900 mb-4">New Listing</h1>

      {/* real photo upload, with live preview */}
      <label className="block w-full h-32 border border-dashed border-gray-300 rounded-lg mb-3 flex flex-col items-center justify-center text-gray-400 cursor-pointer overflow-hidden">
        {photoPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <>
            <span className="text-xl">📷</span>
            <span className="text-[10px] mt-1">Add a photo</span>
          </>
        )}
        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
      </label>

      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-gray-600 mb-1">Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Intro to Programming textbook"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        />

        <label className="block text-xs text-gray-600 mb-1">Category</label>
        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.emoji} {c.value}</option>
          ))}
        </select>

        <label className="block text-xs text-gray-600 mb-1">Price (leave blank for POA)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="R"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        />

        <label className="block text-xs text-gray-600 mb-1">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a bit of detail for buyers..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white resize-none"
        />

        {business ? storePaused ? (
          <div className="border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            <p className="text-xs font-semibold text-amber-800">Your store is paused</p>
            <p className="text-[10px] text-amber-700 mt-0.5">Resume it in <Link href="/my-store" className="underline">My Store</Link> to post as your store. This listing will be posted as you.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg px-3 py-2 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-900">Post as {business.name}</p>
              <p className="text-[10px] text-gray-500">Your registered business</p>
            </div>
            <button
              type="button"
              onClick={() => setPostAsBusiness(!postAsBusiness)}
              className={`w-8 h-5 rounded-full relative transition-colors ${postAsBusiness ? 'bg-blue-700' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${postAsBusiness ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-center text-gray-500 mb-4">
            Don&apos;t have a business yet?{' '}
            <Link href="/register-business" className="text-blue-700 font-medium">Register one</Link>
          </p>
        )}

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post listing'}
        </button>
      </form>
    </div>
  )
}
