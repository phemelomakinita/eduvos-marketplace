'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BackButton from '@/components/BackButton'

const CAMPUSES = [
  'Bedfordview',
  'Vaal (Vanderbijlpark)',
  'Midrand',
  'Pretoria',
  'Potchefstroom',
  'Mbombela (Nelspruit)',
  'Durban (Umhlanga)',
  'East London',
  'Nelson Mandela Bay (Gqeberha)',
  'Tyger Valley (Bellville)',
  'Mowbray (Cape Town/Claremont)',
  'Bloemfontein',
]

type AdminEvent = {
  id: string
  posted_by: string
  title: string
  description: string | null
  event_date: string
  campus: string
  poster_url: string | null
  created_at: string
}

export default function EventForm({
  userId,
  event,
}: {
  userId: string
  event?: AdminEvent
}) {
  const [title, setTitle] = useState(event?.title || '')
  const [eventDate, setEventDate] = useState(event?.event_date || '')
  const [campus, setCampus] = useState(event?.campus || '')
  const [description, setDescription] = useState(event?.description || '')
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  function handlePosterChange(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size >= 5 * 1024 * 1024) {
      setPosterFile(null)
      setPosterPreview(null)
      setError('Please choose an image under 5 MB.')
      return
    }

    setError('')
    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setError('')

    if (!event && !posterFile) {
      setError('Please choose an event poster.')
      return
    }

    setLoading(true)
    let posterUrl: string | null = null

    if (posterFile) {
      const ext = posterFile.name.split('.').pop() || 'jpg'
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('event-posters').upload(path, posterFile)

      if (uploadError) {
        setError(uploadError.message)
        setLoading(false)
        return
      }

      posterUrl = supabase.storage.from('event-posters').getPublicUrl(path).data.publicUrl
    }

    const eventFields = {
      title,
      description: description || null,
      event_date: eventDate,
      campus,
    }
    const result = event
      ? await supabase.from('events').update({
          ...eventFields,
          ...(posterUrl ? { poster_url: posterUrl } : {}),
        }).eq('id', event.id)
      : await supabase.from('events').insert({
          posted_by: userId,
          ...eventFields,
          poster_url: posterUrl,
        })

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    router.push('/admin/events')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href="/admin/events" label="Back to Events" />
      <h1 className="text-base font-semibold text-gray-900 mb-4">{event ? 'Edit event' : 'New event'}</h1>

      <form onSubmit={handleSubmit}>
        <label className="relative block w-full aspect-[4/5] bg-gray-50 border border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer mb-3">
          {posterPreview || event?.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterPreview || event?.poster_url || ''} alt="Event poster preview" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Add poster</div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-xs py-2 text-center">Change poster</div>
          <input type="file" accept="image/*" className="hidden" onChange={(inputEvent) => handlePosterChange(inputEvent.target.files?.[0])} />
        </label>

        <label className="block text-xs text-gray-600 mb-1" htmlFor="event-title">Title</label>
        <input
          id="event-title"
          type="text"
          required
          maxLength={100}
          value={title}
          onChange={(inputEvent) => setTitle(inputEvent.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        />

        <label className="block text-xs text-gray-600 mb-1" htmlFor="event-date">Date</label>
        <input
          id="event-date"
          type="date"
          required
          value={eventDate}
          onChange={(inputEvent) => setEventDate(inputEvent.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        />

        <label className="block text-xs text-gray-600 mb-1" htmlFor="event-campus">Campus</label>
        <select
          id="event-campus"
          required
          value={campus}
          onChange={(inputEvent) => setCampus(inputEvent.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        >
          <option value="" disabled>Select campus</option>
          <option value="All campuses">All campuses</option>
          {CAMPUSES.map((campusName) => (
            <option key={campusName} value={campusName}>{campusName}</option>
          ))}
        </select>

        <label className="block text-xs text-gray-600 mb-1" htmlFor="event-description">Description</label>
        <textarea
          id="event-description"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(inputEvent) => setDescription(inputEvent.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white"
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : event ? 'Save changes' : 'Post event'}
        </button>
      </form>
    </div>
  )
}
