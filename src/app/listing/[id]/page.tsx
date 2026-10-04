import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'
import Link from 'next/link'

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('*, businesses(name, is_verified)')
    .eq('id', params.id)
    .single()

  if (!listing) notFound()

  return (
    <div className="min-h-screen bg-white px-4 py-4 max-w-sm mx-auto">
      <BackButton />

      <div className="w-full h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        {listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photo_url} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" />
            <path d="M21 15l-5-5L5 19" />
          </svg>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-base font-semibold text-gray-900">{listing.title}</h1>
        {listing.businesses?.is_verified && (
          <span className="text-[9px] border border-gray-300 text-gray-600 px-1.5 py-0.5 rounded">✓ Hub Verified</span>
        )}
      </div>

      {listing.businesses?.name && (
        <p className="text-xs text-gray-500 mb-1">Sold by {listing.businesses.name}</p>
      )}

      <p className="text-xs text-gray-500 mb-3">{listing.category} · {listing.campus}</p>

      {listing.price && (
        <p className="text-lg font-bold text-gray-900 mb-3">R{listing.price}</p>
      )}

      {listing.description && (
        <p className="text-xs text-gray-700 leading-relaxed mb-5">{listing.description}</p>
      )}

      <Link
        href={`/buy/${listing.id}`}
        className="block w-full bg-blue-700 text-white text-center rounded-md py-2 text-sm font-medium mb-3"
      >
        Buy
      </Link>

      <div className="flex items-center justify-center gap-1 text-gray-500 text-xs py-2 border-t border-gray-100">
        <span>🚩</span>
        <span>Report this listing</span>
      </div>
    </div>
  )
}