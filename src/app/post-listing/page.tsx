// src/app/post-listing/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostListingForm from '@/components/PostListingForm'

export default async function PostListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  console.log('Fetching profile...')
  const { data: profile } = await supabase
    .from('profiles')
    .select('campus')
    .eq('id', user.id)
    .single()
  console.log('Profile fetched:', profile)

  console.log('Fetching business...')
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, is_paused')
    .eq('owner_id', user.id)
    .maybeSingle()
  console.log('Business fetched:', business)

  return <PostListingForm campus={profile?.campus || ''} business={business} storePaused={business?.is_paused ?? false} />
}
