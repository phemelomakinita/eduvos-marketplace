import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'
import Avatar from '@/components/Avatar'
import MarketplaceNavigation from '@/components/MarketplaceNavigation'
import { Image as ImageIcon, Info, SealCheck } from '@phosphor-icons/react/ssr'

export const dynamic = 'force-dynamic'

// in Next.js 16, params is a Promise and must be awaited
export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`/listing/${id}`)}`)

  // listing + the business it was posted under (if any) + the poster's profile
  const { data: listing } = await supabase
    .from('listings')
    .select('*, businesses(id, name, is_verified, logo_url), profiles(full_name, avatar_url, campus, created_at)')
    .eq('id', id)
    .single()

  if (!listing) notFound()

  const business = listing.businesses
  const sellerName = listing.profiles?.full_name || 'Campus seller'
  const memberSince = listing.profiles?.created_at
    ? new Date(listing.profiles.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-dvh bg-white px-4 pb-28 pt-4 sm:px-6">
      <main className="mx-auto max-w-5xl">
        <BackButton />
        <div className="mt-4 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="flex aspect-square max-h-[680px] items-center justify-center overflow-hidden rounded-xl border border-blue-100 bg-white p-4">
            {listing.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.photo_url} alt={listing.title} className="h-full w-full object-contain" />
            ) : (
              <ImageIcon size={44} className="text-slate-400" aria-hidden="true" />
            )}
          </div>

          <section className="min-w-0 rounded-xl border border-blue-100 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              {listing.category && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">{listing.category}</span>}
              {listing.campus && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{listing.campus}</span>}
            </div>
            <h1 className="mt-4 text-[28px] font-bold tracking-tight text-slate-950 sm:text-[32px]">{listing.title}</h1>
            <p className="listing-price mt-3 text-2xl font-bold tracking-tight text-blue-800">
              {listing.price != null ? `R${listing.price.toLocaleString('en-ZA')}` : 'Price on request'}
            </p>

            <div className="my-6 h-px bg-slate-100" />
            <h2 className="text-sm font-semibold text-slate-900">About this item</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {listing.description || 'Contact the seller to find out more about this item.'}
            </p>

            <div className="my-6 h-px bg-slate-100" />
            <h2 className="text-sm font-semibold text-slate-900">Seller</h2>
            <Link
              href={business ? `/store/${business.id}` : `/profile/${listing.user_id}`}
              className="mt-3 flex items-center gap-3 rounded-lg border border-blue-100 p-3 transition-colors duration-150 hover:border-blue-300 hover:bg-blue-50"
            >
              {business ? (
                business.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={business.logo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-800">{business.name[0]}</span>
                )
              ) : (
                <Avatar name={sellerName} url={listing.profiles?.avatar_url ?? null} size={48} />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900">{business?.name ?? sellerName}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {business
                    ? business.is_verified ? 'Hub verified business · View store' : 'Campus business · View store'
                    : `${listing.profiles?.campus ?? listing.campus ?? 'Eduvos'} campus · View seller profile`}
                </span>
              </span>
              {business?.is_verified && (
                <span className="inline-flex shrink-0 items-center gap-1 bg-brand-soft px-2 py-1 text-xs font-semibold text-brand-strong">
                  <SealCheck size={14} weight="fill" aria-hidden="true" /> Verified
                </span>
              )}
              <span aria-hidden="true" className="text-slate-400">›</span>
            </Link>
            {memberSince && !business && <p className="mt-2 text-xs text-slate-500">Member since {memberSince}</p>}

            <div className="mt-5 flex gap-3 rounded-lg bg-blue-50 p-4 text-slate-800">
              <Info size={16} className="shrink-0 text-blue-700" aria-hidden="true" />
              <p className="text-xs leading-5">For an in-person exchange, arrange to meet in a public place on campus.</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {listing.price != null ? (
                <Link href={`/buy/${listing.id}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                  Buy product
                </Link>
              ) : (
                <Link href={`/message/${listing.id}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                  Ask about this item
                </Link>
              )}
              <Link href={`/message/${listing.id}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                Message seller
              </Link>
            </div>
            <Link href={`/report/${listing.id}`} className="mt-5 block text-center text-xs font-medium text-slate-500 hover:text-blue-700">Report this listing</Link>
          </section>
        </div>
      </main>
      <MarketplaceNavigation />
    </div>
  )
}