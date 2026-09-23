import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic' // always fetch fresh, never cache this page

export default async function FeedPage() {
  const supabase = await createClient()

  // check who's logged in — if nobody, bounce back to login
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // pull their profile row to get the name we saved at signup
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // just take the first name of the full name
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="max-w-sm mx-auto">
        <p className="text-sm font-semibold text-gray-900">
          Welcome, {firstName}
        </p>
      </div>
    </div>
  )
}