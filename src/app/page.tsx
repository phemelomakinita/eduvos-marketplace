import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import LandingSearch from '@/components/LandingSearch'
import ListingCard from '@/components/ListingCard'
import CategoryIllustration from '@/components/CategoryIllustration'
import MarketplaceLogo from '@/components/MarketplaceLogo'
import { CATEGORIES, getCategoryToneClasses } from '@/lib/categories'
import { createClient } from '@/lib/supabase/server'
import { SquaresFour } from '@phosphor-icons/react/ssr'

export const metadata: Metadata = {
  title: 'Eduvos Marketplace | Your Campus. Your Marketplace.',
  description: 'Discover what your campus has to offer. Buy. Sell. Build Together.',
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/feed')

  const [listingResult, businessResult] = await Promise.all([
    supabase
      .from('listings')
      .select('id, user_id, business_id, title, category, price, description, photo_url, campus, created_at, businesses(is_verified, is_paused, name), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('businesses')
      .select('id, name, category, logo_url, is_verified, is_paused, profiles(campus)')
      .eq('is_verified', true)
      .eq('is_paused', false)
      .limit(4),
  ])

  const recentListings = (listingResult.data ?? []).filter((listing) => {
    const business = Array.isArray(listing.businesses) ? listing.businesses[0] : listing.businesses
    return !business?.is_paused
  }).slice(0, 4)
  const featuredBusinesses = businessResult.data ?? []
  const listingUnavailable = Boolean(listingResult.error)
  const businessesUnavailable = Boolean(businessResult.error)

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
          <Link href="/" aria-label="Eduvos Marketplace home" className="shrink-0">
            <MarketplaceLogo className="mb-0" />
          </Link>
          <nav aria-label="Account" className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link href="/login" className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">Log in</Link>
            <Link href="/signup" className="rounded-xl bg-brand px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-strong sm:px-4 sm:text-sm">Join the marketplace</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14">
          <p className="text-sm font-medium text-brand-strong">
            Your Campus. Your Marketplace.
          </p>
          <h1 className="mt-2 max-w-3xl text-[30px] font-bold leading-tight text-slate-950 sm:text-[32px]">
            Discover what your campus has to offer.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Find a good deal, support a student business, or turn your own hustle into something bigger.
          </p>
          <div className="mt-6 max-w-3xl">
            <LandingSearch />
          </div>
          <nav id="categories" aria-label="Browse marketplace categories" className="mt-6 flex gap-3 overflow-x-auto pb-2">
            <Link href="/login?next=%2Ffeed" className="flex min-w-20 shrink-0 flex-col items-center justify-center gap-1.5 border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
              <span className="flex h-12 w-12 items-center justify-center"><SquaresFour size={32} weight="regular" aria-hidden="true" /></span>
              All listings
            </Link>
            {CATEGORIES.map((category) => {
              const tone = getCategoryToneClasses(category.tone)
              return (
                <Link
                  key={category.value}
                  href={`/login?next=${encodeURIComponent(`/feed?category=${encodeURIComponent(category.value)}`)}`}
                  className={`flex min-w-20 shrink-0 flex-col items-center justify-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors duration-150 hover:border-blue-400 ${tone.soft}`}
                >
                  <CategoryIllustration category={category.value} className="h-12 w-12" />
                  {category.value}
                </Link>
              )
            })}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <section className="py-8 sm:py-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Recently added</h2>
            </div>
            <Link href="/login?next=%2Ffeed" className="shrink-0 text-xs font-semibold text-brand hover:text-brand-strong sm:text-sm">See all listings <span aria-hidden="true">→</span></Link>
          </div>
          {listingUnavailable ? (
            <p role="status" className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">Live listings aren&apos;t available right now. Sign in to explore your campus marketplace.</p>
          ) : recentListings.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {recentListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-800">Explore what your campus has to offer</p>
              <p className="mt-1 text-sm text-slate-500">Sign in to discover listings and connect with campus sellers.</p>
              <Link href="/signup" className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong">Join the marketplace</Link>
            </div>
          )}
        </section>

        <section className="border-t border-slate-200 py-8 sm:py-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Meet campus businesses</h2>
            </div>
            <Link href="/signup" className="shrink-0 text-xs font-semibold text-brand hover:text-brand-strong sm:text-sm">Build your store <span aria-hidden="true">→</span></Link>
          </div>
          {businessesUnavailable ? (
            <p role="status" className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">Campus businesses aren&apos;t available right now. Please check back soon.</p>
          ) : featuredBusinesses.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBusinesses.map((business) => (
                <Link key={business.id} href={`/login?next=${encodeURIComponent(`/store/${business.id}`)}`} className="flex min-h-24 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand/30 hover:bg-brand-soft">
                  {business.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={business.logo_url} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg font-semibold text-brand">{business.name[0]}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{business.name}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">{[business.category, (Array.isArray(business.profiles) ? business.profiles[0] : business.profiles)?.campus].filter(Boolean).join(' · ')}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-brand">
                      <span aria-hidden="true">✓</span> Hub verified
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">Verified campus businesses will be featured here. <Link href="/signup" className="font-semibold text-brand">Start your store</Link></p>
          )}
        </section>

        <section className="mb-10 border-y border-blue-100 bg-white px-1 py-7 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-medium text-blue-700">For student entrepreneurs</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Start selling on campus</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Set up your store and meet your first customers in the campus community.</p>
            </div>
            <Link href="/signup" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-strong">Start selling</Link>
          </div>
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500">
        Buy. Sell. Build Together.
      </footer>
    </main>
  )
}
