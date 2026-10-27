import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'
import StoreHeader from '@/components/StoreHeader'
import ListingCard from '@/components/ListingCard'
import MarketplaceNavigation from '@/components/MarketplaceNavigation'

export const dynamic = 'force-dynamic'

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`/store/${id}`)}`)

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
    <div className="min-h-dvh bg-white px-4 pb-28 pt-4 sm:px-6">
      <main className="mx-auto max-w-5xl">
        <BackButton history label="Back" />
        <section className="mt-4 rounded-xl border border-blue-100 bg-white p-5 sm:p-7">
          <StoreHeader business={business} campus={business.profiles?.campus ?? null} />
        </section>
        {business.is_paused ? (
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-[#102a56]">This store is temporarily closed</p>
            <p className="mt-1 text-sm text-slate-600">Check back soon for new listings.</p>
          </div>
        ) : (
          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Store listings</h2>
                <p className="mt-1 text-sm text-slate-500">Browse products from this campus business.</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-500">{listings?.length ?? 0} items</span>
            </div>
            {!listings?.length ? (
              <p className="rounded-xl border border-dashed border-blue-200 bg-white px-4 py-10 text-center text-sm text-slate-500">No listings yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {listings.map((item) => <ListingCard key={item.id} listing={{ ...item, businesses: { name: business.name, is_verified: business.is_verified } }} />)}
              </div>
            )}
          </section>
        )}
        <Link href={`/report-store/${id}`} className="mt-7 block border-t border-blue-100 py-4 text-center text-xs font-medium text-slate-500 hover:text-blue-800">Report this store</Link>
      </main>
      <MarketplaceNavigation />
    </div>
  )
}
