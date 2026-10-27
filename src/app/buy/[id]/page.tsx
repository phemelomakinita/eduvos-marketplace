import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'
import BuyCheckout from '@/components/BuyCheckout'

export const dynamic = 'force-dynamic'

export default async function BuyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: elig } = await supabase.rpc('check_order_eligibility', { p_listing_id: id })
  const check = elig as { ok: boolean; reason?: string; existing_order_id?: string } | null
  if (check?.existing_order_id) redirect(`/orders/${check.existing_order_id}`)
  if (!check?.ok) return <div className="min-h-screen bg-white px-4 py-4"><BackButton history label="Back" /><h1 className="mb-3 text-[28px] font-semibold text-[#102a56]">Buy product</h1><div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4"><p className="text-sm text-slate-700">{check?.reason ?? 'This item can\'t be bought through the app right now.'}</p></div><Link href={`/message/${id}`} className="block min-h-11 w-full rounded-lg border border-blue-200 py-2.5 text-center text-sm font-medium text-slate-800">Message seller</Link></div>
  const { data: listing } = await supabase.from('listings').select('id, title, price, photo_url, campus, profiles(full_name)').eq('id', id).single()
  if (!listing) notFound()
  const profile = listing.profiles as unknown as { full_name: string | null } | null
  return <BuyCheckout listingId={listing.id} title={listing.title} price={listing.price ?? 0} photoUrl={listing.photo_url} campus={listing.campus} sellerName={profile?.full_name ?? 'Student'} />
}
