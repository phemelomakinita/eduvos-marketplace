// src/app/profile/page.tsx
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles')
    .select('full_name, campus, avatar_url, allow_messages')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/feed')

  return (
    <ProfileForm
      userId={user.id}
      email={user.email ?? ''}
      fullName={profile.full_name ?? ''}
      initialCampus={profile.campus ?? ''}
      initialAvatarUrl={profile.avatar_url}
      initialAllowMessages={profile.allow_messages}
    />
  )
}
