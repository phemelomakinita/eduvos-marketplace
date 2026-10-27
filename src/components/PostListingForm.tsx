'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, getCategoryToneClasses } from '@/lib/categories'
import CategoryIcon from '@/components/CategoryIcon'
import BackButton from '@/components/BackButton'
import MarketplaceNavigation from '@/components/MarketplaceNavigation'

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

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type && !file.type.startsWith('image/')) {
      setError('Choose an image file for your listing photo.')
      e.target.value = ''
      setPhotoFile(null)
      setPhotoPreview(null)
      return
    }
    setError('')
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file)) // local preview before upload
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (price && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
      setError('Enter a valid price of zero or more.')
      return
    }
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
    <div className="min-h-dvh bg-white px-4 pb-28 pt-4 sm:px-6">
      <main className="mx-auto max-w-3xl">
        <BackButton />
        <div className="mb-5 mt-4">
          <p className="text-sm font-medium text-blue-700">Sell on campus</p>
          <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-950 sm:text-[32px]">Create a listing</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Add the essentials and your item will be ready for your campus community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-blue-100 bg-white p-4 sm:p-7">
          <label htmlFor="listing-photo" className={`group relative flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors duration-150 ${photoPreview ? 'border-blue-100 bg-slate-50' : 'border-blue-200 bg-blue-50/60 hover:bg-blue-50'}`}>
            {photoPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Listing photo preview" className="h-full w-full object-contain" />
                <span className="absolute bottom-3 rounded-md bg-slate-950/75 px-3 py-1.5 text-xs font-medium text-white">Tap to change photo</span>
              </>
            ) : (
              <>
                <span className="mb-2 flex h-12 w-12 items-center justify-center text-2xl text-blue-700" aria-hidden="true">＋</span>
                <span className="text-sm font-semibold text-slate-800">Add a product photo</span>
                <span className="mt-1 text-xs text-slate-500">A clear photo helps people see what you&apos;re selling.</span>
              </>
            )}
            <input id="listing-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label htmlFor="listing-title" className="block text-sm font-semibold text-slate-800 sm:col-span-2">
              Listing title <span className="text-blue-600">*</span>
              <input
                id="listing-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Intro to Programming textbook"
                className="mt-2 min-h-11 w-full rounded-lg border border-blue-100 bg-white px-4 text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label htmlFor="listing-category" className="block text-sm font-semibold text-slate-800">
              Category <span className="text-blue-600">*</span>
              <select
                id="listing-category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
              </select>
              {category && (
                <span className={`mt-2 inline-flex items-center gap-2 border px-2.5 py-1.5 text-xs font-medium ${getCategoryToneClasses(CATEGORIES.find((item) => item.value === category)?.tone ?? 'slate').soft}`}>
                  <CategoryIcon category={category} className="h-4 w-4" />
                  {category}
                </span>
              )}
            </label>

            <label htmlFor="listing-price" className="block text-sm font-semibold text-slate-800">
              Price
              <span className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <span className="mr-2 text-sm font-medium text-slate-400">R</span>
                <input
                  id="listing-price"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Leave blank for price on request"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                />
              </span>
            </label>

            <label htmlFor="listing-description" className="block text-sm font-semibold text-slate-800 sm:col-span-2">
              Description
              <textarea
                id="listing-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the condition, useful details, or how buyers can collect it."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-slate-800">Your campus</p>
              <p className="mt-0.5 text-sm text-slate-600">{campus || 'Campus not set on your profile'}</p>
            </div>
          </div>

          {business ? storePaused ? (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-[#102a56]">Your store is paused</p>
              <p className="mt-1 text-sm leading-5 text-slate-700">Resume it in <Link href="/my-store" className="font-semibold underline">My Store</Link> to post as your store. This listing will be posted as you.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Post as {business.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">Use your registered business identity.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={postAsBusiness}
                aria-label={`Post as ${business.name}`}
                onClick={() => setPostAsBusiness(!postAsBusiness)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${postAsBusiness ? 'bg-blue-700' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${postAsBusiness ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">
              Selling as a business?{' '}
              <Link href="/register-business" className="font-semibold text-blue-700 hover:text-blue-900">Register your business</Link>
            </p>
          )}

          {error && <p role="alert" className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Publishing listing...' : 'Publish listing'}
          </button>
          <p className="text-center text-xs text-slate-500">By publishing, you confirm this listing is accurate and appropriate for the marketplace.</p>
        </form>
      </main>
      <MarketplaceNavigation active="sell" />
    </div>
  )
}
