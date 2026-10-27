import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'
import { ORDER_COLUMNS, formatRand, statusChip } from '@/lib/orders'
import type { Order } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id, name').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/register-business')

  const { data: rows } = await supabase.from('orders').select(ORDER_COLUMNS)
    .eq('seller_id', user.id).eq('business_id', business.id)
    .order('created_at', { ascending: false }).limit(100)
  const orders = (rows ?? []) as unknown as Order[]
  const buyerIds = Array.from(new Set(orders.map((order) => order.buyer_id)))
  const { data: buyers } = buyerIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', buyerIds)
    : { data: [] as { id: string; full_name: string | null }[] }
  const buyerNames = new Map((buyers ?? []).map((buyer) => [buyer.id, buyer.full_name?.trim().split(/\s+/)[0] || 'Student']))
  const completed = orders.filter((order) => order.status === 'completed')
  const earned = completed.reduce((sum, order) => sum + order.item_price, 0)
  const openOrders = orders.filter((order) => ['accepted', 'paid', 'confirmed', 'sent'].includes(order.status))
  const openValue = openOrders.reduce((sum, order) => sum + order.item_price, 0)
  const needsAction = orders.filter((order) => ['requested', 'paid', 'confirmed'].includes(order.status)).length

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href="/my-store" label="Back to My Store" />
      <h1 className="text-base font-semibold text-gray-900 mb-3">Earnings</h1>
      <div className="flex items-start gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-4">
        <svg width="14" height="14" className="text-gray-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
        <span className="text-xs text-gray-600 leading-snug">Payments go straight from buyers to your bank through PayShap. This page tracks your sales. We don&apos;t hold any money.</span>
      </div>
      <div className="border border-gray-200 rounded-2xl p-4 mb-3">
        <p className="text-[11px] text-gray-500">Earned from sales</p>
        <p className="text-2xl font-semibold text-gray-900 mt-0.5">{formatRand(earned)}</p>
        <p className="text-[11px] text-gray-500 mt-1">{completed.length} completed {completed.length === 1 ? 'order' : 'orders'}</p>
      </div>
      <div className="flex gap-2 mb-2">
        <div className="flex-1 border border-gray-200 rounded-xl p-3"><p className="text-[10px] text-gray-500">In progress</p><p className="text-sm font-semibold text-gray-900 mt-0.5">{formatRand(openValue)}</p><p className="text-[10px] text-gray-500">{openOrders.length} open</p></div>
        <div className="flex-1 border border-gray-200 rounded-xl p-3"><p className="text-[10px] text-gray-500">Needs your action</p><p className={`text-sm font-semibold mt-0.5 ${needsAction > 0 ? 'text-blue-700' : 'text-gray-900'}`}>{needsAction}</p><p className="text-[10px] text-gray-500">{needsAction === 1 ? 'order waiting for you' : 'orders waiting for you'}</p></div>
      </div>
      <p className="text-[10px] text-gray-500 mb-5">Delivery fees you collect for PAXI aren&apos;t counted here.</p>
      <p className="text-sm font-semibold text-gray-900 mb-2">Recent sales</p>
      {orders.length === 0 ? <p className="text-xs text-gray-400 text-center py-8">No sales yet. When someone orders from your store, it will show here.</p> : <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">{orders.map((order) => {
        const chip = statusChip(order.status, 'seller', order.delivery_method)
        return <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center gap-3 px-3 py-2.5"><div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 truncate">{order.listing_title}</p><p className="text-[10px] text-gray-500 truncate">{buyerNames.get(order.buyer_id) ?? 'Student'} · {new Date(order.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</p></div><div className="flex flex-col items-end gap-1 flex-shrink-0"><span className="text-xs font-semibold text-gray-900">{formatRand(order.item_price)}</span><span className={chip.className}>{chip.label}</span></div></Link>
      })}</div>}
    </div>
  )
}
