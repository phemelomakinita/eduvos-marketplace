import Link from 'next/link'
import type { Listing } from '@/lib/types'
import CategoryIcon from '@/components/CategoryIcon'
import { getCategory, getCategoryToneClasses } from '@/lib/categories'
import { SealCheck, Image as ImageIcon } from '@phosphor-icons/react/ssr'

type ListingCardItem = Omit<Listing, 'businesses'> & {
  businesses?: {
    is_verified?: boolean | null
    is_paused?: boolean | null
    name?: string | null
  } | {
    is_verified?: boolean | null
    is_paused?: boolean | null
    name?: string | null
  }[] | null
  profiles?: { full_name?: string | null } | { full_name?: string | null }[] | null
}

export default function ListingCard({ listing }: { listing: ListingCardItem }) {
  const business = Array.isArray(listing.businesses) ? listing.businesses[0] : listing.businesses
  const profile = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles
  const category = getCategory(listing.category)
  const categoryTone = category ? getCategoryToneClasses(category.tone) : null

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block min-w-0 overflow-hidden rounded-xl border border-blue-100 bg-white p-2.5 transition-colors duration-150 hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:p-3"
    >
      <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50">
        {listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photo_url} alt={listing.title} className="h-full w-full object-contain" />
        ) : (
          <ImageIcon size={28} weight="regular" className="text-slate-400" aria-hidden="true" />
        )}
        {business?.is_verified && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-blue-800">
            <SealCheck size={14} weight="fill" aria-hidden="true" />
            Verified
          </span>
        )}
        {listing.category && categoryTone && (
          <span className={`absolute right-2 top-2 inline-flex max-w-[65%] items-center gap-1.5 truncate border px-2 py-1 text-[10px] font-semibold ${categoryTone.soft}`}>
            <CategoryIcon category={listing.category} className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{listing.category}</span>
          </span>
        )}
      </div>
      <div className="flex min-h-14 flex-col justify-between">
        <p className="font-heading truncate text-sm font-semibold leading-snug text-slate-900">{listing.title}</p>
        <p className="listing-price mt-1 text-base font-semibold text-brand-strong">
          {listing.price != null ? `R${listing.price.toLocaleString('en-ZA')}` : 'Price on request'}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {[business?.name || profile?.full_name?.split(' ')[0], listing.campus].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}
