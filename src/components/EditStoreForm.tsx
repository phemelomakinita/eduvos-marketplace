'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/categories'
import BackButton from '@/components/BackButton'
import type { Business } from '@/lib/types'

export default function EditStoreForm({ business }: { business: Business }) {
  const [name, setName] = useState(business.name)
  const [category, setCategory] = useState(business.category || '')
  const [description, setDescription] = useState(business.description || '')
  const [contactNumber, setContactNumber] = useState(business.contact_number || '')
  const [email, setEmail] = useState(business.email || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  function handleLogoChange(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setLogoFile(null)
      setLogoPreview(null)
      setError('Please choose an image under 5 MB.')
      return
    }
    setError('')
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
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

    let newLogoUrl: string | null = null
    if (logoFile) {
      const ext = logoFile.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('store-logos').upload(path, logoFile)
      if (uploadError) {
        setError(`Logo upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }
      newLogoUrl = supabase.storage.from('store-logos').getPublicUrl(path).data.publicUrl
    }

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        name,
        category,
        description: description || null,
        contact_number: contactNumber || null,
        email: email || null,
        ...(newLogoUrl ? { logo_url: newLogoUrl } : {}),
      })
      .eq('id', business.id)

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
      <BackButton href="/my-store" label="Back to My Store" />
      <h1 className="text-base font-semibold text-gray-900 mb-3">Edit store</h1>
      <form onSubmit={handleSubmit}>
        <label className="flex flex-col items-center mb-4 cursor-pointer">
          <div className="relative w-16 h-16">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {logoPreview || business.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview || business.logo_url || ''} alt={business.name} className="w-full h-full object-cover" />
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21l18 0" />
                  <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1l-2 -4h-14l-2 4" />
                  <path d="M5 21l0 -10.15" />
                  <path d="M19 21l0 -10.15" />
                  <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
                </svg>
              )}
            </div>
            <div className="absolute -right-0.5 -bottom-0.5 w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
                <path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
              </svg>
            </div>
          </div>
          <span className="text-xs text-blue-700 mt-1">Change logo</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoChange(e.target.files?.[0])} />
        </label>

        <label className="block text-xs text-gray-600 mb-1">Business name</label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white" />

        <label className="block text-xs text-gray-600 mb-1">Category</label>
        <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white">
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.value}</option>)}
        </select>

        <label className="block text-xs text-gray-600 mb-1">Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white resize-none" />

        <label className="block text-xs text-gray-600 mb-1">Contact number</label>
        <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white" />

        <label className="block text-xs text-gray-600 mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white" />
        <p className="text-[11px] text-gray-500 mb-4">Both contact fields are optional. Leave them blank to keep all contact inside in-app chat.</p>

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50">
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
