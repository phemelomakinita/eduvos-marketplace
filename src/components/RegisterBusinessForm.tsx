// src/components/RegisterBusinessForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/categories'
import BackButton from '@/components/BackButton'

export default function RegisterBusinessForm() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

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

    const { error: insertError } = await supabase.from('businesses').insert({
      owner_id: user.id,
      name,
      category,
      description: description || null,
      contact_number: contactNumber || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/post-listing')
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />

      <h1 className="text-base font-semibold text-gray-900 mb-1">Register a Business</h1>
      <p className="text-xs text-gray-500 mb-4">Create a profile for your business. You&apos;ll be able to post multiple listings under it.</p>

      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-gray-600 mb-1">Business name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nandi's Braids"
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

        <label className="block text-xs text-gray-600 mb-1">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What do you offer?"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white resize-none"
        />

        <label className="block text-xs text-gray-600 mb-1">Contact number</label>
        <input
          type="text"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="071 234 5678"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm text-gray-900 bg-white"
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register business'}
        </button>
      </form>
    </div>
  )
}