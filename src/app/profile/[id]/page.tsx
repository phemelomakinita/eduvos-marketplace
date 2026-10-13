import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Avatar from '@/components/Avatar'
import BackButton from '@/components/BackButton'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles')
    .select('id, full_name, campus, avatar_url, allow_messages, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()
  if (profile.id === user.id) redirect('/profile')

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton history label="Back" />
      <div className="flex flex-col items-center mb-5 mt-2">
        <Avatar name={profile.full_name} url={profile.avatar_url} size={84} />
        <h1 className="text-base font-semibold text-gray-900 mt-3">{profile.full_name}</h1>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0" />
          </svg>
          {profile.campus} campus
        </p>
        <p className="text-[11px] text-gray-500 mt-1">Member since {memberSince}</p>
      </div>
      {profile.allow_messages ? (
        <Link href={`/messages/with/${profile.id}`} className="block w-full bg-blue-700 text-white text-center rounded-md py-2 text-sm font-medium mb-4">Message</Link>
      ) : (
        <button disabled className="block w-full bg-gray-100 text-gray-400 rounded-md py-2 text-sm font-medium mb-4">Not accepting messages</button>
      )}
      <Link href={`/report-user/${profile.id}`} className="block text-center text-xs text-gray-500 py-3 border-t border-gray-100">🚩 Report user</Link>
    </div>
  )
}
