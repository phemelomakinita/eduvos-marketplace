import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'
import StoreHeader from '@/components/StoreHeader'

export const dynamic = 'force-dynamic'

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*, profiles(campus)')
    .eq('id', id)
    .single()
  if (!business) notFound()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('business_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton history label="Back" />
      <StoreHeader business={business} campus={business.profiles?.campus ?? null} />
      {business.is_paused ? (
        <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 text-center mt-4 mb-4">
          <p className="text-sm font-semibold text-gray-900">This store is temporarily closed</p>
          <p className="text-xs text-gray-500 mt-1">Check back soon.</p>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-900 mt-3 mb-2 pt-3 border-t border-gray-100">Listings ({listings?.length ?? 0})</p>
          {!listings?.length ? (
            <p className="text-xs text-gray-400 text-center py-8">No listings yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {listings.map((item) => (
                <Link key={item.id} href={`/listing/${item.id}`} className="block min-w-0 border border-gray-200 rounded-xl p-2">
                  <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                    {item.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.photo_url} alt={item.title} className="w-full h-full object-contain" />
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <circle cx="8.5" cy="10" r="1.5" />
                        <path d="M21 15l-5-5L5 19" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{item.price ? `R${item.price}` : item.category}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
      <Link href={`/report-store/${id}`} className="block text-center text-xs text-gray-500 py-3 border-t border-gray-100">🚩 Report store</Link>
    </div>
  )
}
