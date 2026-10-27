'use client'

import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import BackButton from '@/components/BackButton'
import { CAMPUSES } from '@/lib/campuses'
import { createClient } from '@/lib/supabase/client'

export default function ProfileForm({
  userId,
  email,
  fullName,
  initialCampus,
  initialAvatarUrl,
  initialAllowMessages,
  initialPayshap,
}: {
  userId: string
  email: string
  fullName: string
  initialCampus: string
  initialAvatarUrl: string | null
  initialAllowMessages: boolean
  initialPayshap: string
}) {
  const [campus, setCampus] = useState(initialCampus)
  const [allowMessages, setAllowMessages] = useState(initialAllowMessages)
  const [payshap, setPayshap] = useState(initialPayshap)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setSaved(false)

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Please choose an image under 5 MB.')
      setPhotoFile(null)
      setPhotoPreview(null)
      event.target.value = ''
      return
    }
    setError('')
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    let normalise = payshap.replace(/\D/g, '')
    if (normalise.startsWith('27') && normalise.length === 11) normalise = '0' + normalise.slice(2)
    if (normalise !== '' && !/^0\d{9}$/.test(normalise)) {
      setError('Enter a valid 10-digit cellphone number, for example 071 234 5678.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    let newUrl: string | null = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop() || 'jpg'
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, photoFile)
      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }
      newUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
    }

    const { error: updateError } = await supabase.from('profiles').update({
      campus,
      allow_messages: allowMessages,
      ...(newUrl ? { avatar_url: newUrl } : {}),
    }).eq('id', userId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    const initialNormalise = initialPayshap.replace(/\D/g, '')
    if (normalise !== initialNormalise) {
      const { error: payoutError } = normalise === ''
        ? await supabase.from('payout_details').delete().eq('user_id', userId)
        : await supabase.from('payout_details').upsert({ user_id: userId, payshap_number: normalise, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (payoutError) {
        setError(payoutError.message)
        setLoading(false)
        return
      }
      setPayshap(normalise)
    }

    setSaved(true)
    setPhotoFile(null)
    setLoading(false)
    router.refresh()
  }

  const firstName = fullName.trim().split(/\s+/)[0] || ''

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />
      <h1 className="text-base font-semibold text-gray-900 mb-4">My Profile</h1>
      <form onSubmit={saveProfile}>
        <label className="flex flex-col items-center mb-4 cursor-pointer">
          <div className="relative w-[84px] h-[84px]">
            <Avatar name={fullName} url={photoPreview || initialAvatarUrl} size={84} />
            <div className="absolute right-0 bottom-0 w-6 h-6 rounded-full bg-blue-700 text-white border-2 border-white flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
                <path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
              </svg>
            </div>
          </div>
          <span className="text-xs text-blue-700 mt-2">Change photo</span>
          <input type="file" accept="image/*" className="hidden" onChange={selectPhoto} />
        </label>

        <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" />
            <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
            <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
          </svg>
          Full name
        </label>
        <input disabled value={fullName} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white opacity-60" />

        <label className="block text-xs text-gray-600 mb-1" htmlFor="campus">Campus</label>
        <select id="campus" required value={campus} onChange={(event) => { setCampus(event.target.value); setSaved(false) }} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white">
          <option value="">Select your campus</option>
          {CAMPUSES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" />
            <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
            <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
          </svg>
          Email
        </label>
        <input disabled value={email} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white opacity-60" />

        <div className="pt-3 mt-1 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-2">Messaging</p>
          <div className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl p-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-900">Allow messages from other students</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">When off, nobody can start a chat from Educhat or your profile. Buyers can still message you about your listings.</p>
            </div>
            <button type="button" role="switch" aria-checked={allowMessages} onClick={() => { setAllowMessages(!allowMessages); setSaved(false) }} className={`w-9 h-5 rounded-full relative flex-shrink-0 transition-colors ${allowMessages ? 'bg-blue-700' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${allowMessages ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="pt-3 mt-1 border-t border-gray-100 mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Get paid</p>
          <label className="block text-xs text-gray-600 mb-1" htmlFor="payshap">PayShap number</label>
          <input id="payshap" type="tel" inputMode="numeric" value={payshap} onChange={(event) => { setPayshap(event.target.value); setSaved(false) }} placeholder="071 234 5678" className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white" />
          <p className="text-[10px] text-gray-500 -mt-2 mb-4 leading-snug">The cellphone number linked to your bank account (your ShapID). Buyers only see it after you accept their order. Needed to receive orders.</p>
        </div>

        <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-3 py-2 mb-4">
          <Avatar name={fullName} url={photoPreview || initialAvatarUrl} size={28} />
          <div>
            <p className="text-xs"><span className="font-semibold text-gray-900">{firstName}</span> <span className="text-gray-500">· {campus || 'Campus'}</span></p>
            <p className="text-[10px] text-gray-500">How you appear in Educhat</p>
          </div>
        </div>
        {error && <p className="mb-3 text-sm text-blue-900" role="alert">{error}</p>}
        {saved && <p className="mb-3 text-sm text-blue-800" role="status">Saved.</p>}
        <button type="submit" disabled={loading} className="min-h-11 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
