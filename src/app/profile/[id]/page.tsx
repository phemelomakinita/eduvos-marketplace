import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Avatar from '@/components/Avatar'
import BackButton from '@/components/BackButton'
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import MarketplaceNavigation from '@/components/MarketplaceNavigation'

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`/profile/${id}`)}`)

  const { data: profile } = await supabase.from('profiles')
    .select('id, full_name, campus, avatar_url, allow_messages, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()
  if (profile.id === user.id) redirect('/profile')

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
  const { data: listings } = await supabase.from('listings')
    .select('*, businesses(is_verified, is_paused, name), profiles(full_name)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
  const visibleListings = (listings ?? []).filter((listing) => !listing.businesses?.is_paused)

  return (
    <div className="min-h-dvh bg-slate-50 px-4 pb-28 pt-4 sm:px-6">
      <main className="mx-auto max-w-5xl">
        <BackButton history label="Back" />
        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
            <Avatar name={profile.full_name} url={profile.avatar_url} size={96} />
            <div className="mt-4 sm:mt-0">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-800">Eduvos Marketplace member</span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{profile.full_name || 'Campus seller'}</h1>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-500 sm:justify-start">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                  <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0" />
                </svg>
                {profile.campus || 'Campus'} campus
                <span aria-hidden="true">·</span>
                Member since {memberSince}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
            {profile.allow_messages ? (
              <Link href={`/messages/with/${profile.id}`} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Message seller</Link>
            ) : (
              <button disabled className="min-h-12 flex-1 rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-400">Not accepting messages</button>
            )}
            <Link href={`/report-user/${profile.id}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700">Report seller</Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Listings from this seller</h2>
              <p className="mt-1 text-sm text-slate-500">Items they have shared with their campus community.</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-slate-500">{visibleListings.length} items</span>
          </div>
          {!visibleListings.length ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">This seller has no listings right now.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </section>
      </main>
      <MarketplaceNavigation />
    </div>
  )
}
