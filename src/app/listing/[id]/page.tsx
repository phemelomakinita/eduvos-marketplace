import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'

export const dynamic = 'force-dynamic'

// in Next.js 16, params is a Promise and must be awaited
export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // listing + the business it was posted under (if any) + the poster's profile
  const { data: listing } = await supabase
    .from('listings')
    .select('*, businesses(id, name, is_verified), profiles(full_name)')
    .eq('id', id)
    .single()

  if (!listing) notFound()

  const business = listing.businesses
  const sellerFirstName = listing.profiles?.full_name?.split(' ')[0] || 'Student'

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />

      {/* square photo, shown whole (object-contain = never cropped) */}
      <div className="w-full aspect-square bg-gray-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
        {listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photo_url} alt={listing.title} className="w-full h-full object-contain" />
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" />
            <path d="M21 15l-5-5L5 19" />
          </svg>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3 mb-0.5">
        <h1 className="text-lg font-semibold text-gray-900">{listing.title}</h1>
        {listing.price != null && (
          <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">R{listing.price}</p>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3">{listing.category} · {listing.campus}</p>

      {/* seller strip: business -> tappable to its store page, student -> plain info */}
      {business ? (
        <Link
          href={`/store/${business.id}`}
          className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 mb-3"
        >
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l18 0" />
              <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1l-2 -4h-14l-2 4" />
              <path d="M5 21l0 -10.15" />
              <path d="M19 21l0 -10.15" />
              <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{business.name}</p>
            <p className="text-xs text-gray-500">
              {business.is_verified ? '✓ Hub Verified · ' : ''}View store
            </p>
          </div>
          <span className="text-gray-400">›</span>
        </Link>
      ) : (
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-600">
            {sellerFirstName[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{sellerFirstName}</p>
            <p className="text-xs text-gray-500">Student seller · {listing.campus}</p>
          </div>
        </div>
      )}

      {listing.description && (
        <p className="text-sm text-gray-700 leading-relaxed mb-5">{listing.description}</p>
      )}

      {/* each button opens its own page (stubs for now) */}
      <Link
        href={`/buy/${listing.id}`}
        className="block w-full bg-blue-700 text-white text-center rounded-lg py-2.5 text-sm font-medium mb-2"
      >
        Buy product
      </Link>
      <Link
        href={`/message/${listing.id}`}
        className="block w-full border border-gray-300 text-gray-800 text-center rounded-lg py-2.5 text-sm font-medium mb-4"
      >
        Message seller
      </Link>
      <Link
        href={`/report/${listing.id}`}
        className="block text-center text-xs text-gray-500 py-3 border-t border-gray-100"
      >
        🚩 Report seller
      </Link>
    </div>
  )
}