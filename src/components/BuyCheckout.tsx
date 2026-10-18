'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import BrandLogo from '@/components/BrandLogo'
import { createClient } from '@/lib/supabase/client'
import { formatRand } from '@/lib/orders'

export default function BuyCheckout({ listingId, title, price, photoUrl, campus, sellerName }: { listingId: string; title: string; price: number; photoUrl: string | null; campus: string | null; sellerName: string }) {
  const [method, setMethod] = useState<'campus' | 'paxi'>('campus')
  const [paxiPoint, setPaxiPoint] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  async function submit() {
    if (method === 'paxi' && paxiPoint.trim().length < 3) { setError('Enter the PAXI point you want to collect from.'); return }
    setLoading(true); setError('')
    const { data, error: rpcError } = await supabase.rpc('create_order', { p_listing_id: listingId, p_delivery_method: method, p_paxi_point: method === 'paxi' ? paxiPoint.trim() : null })
    if (rpcError) { setError(rpcError.message); setLoading(false); return }
    router.push(`/orders/${data}`)
  }
  return <div className="min-h-screen bg-white px-4 py-4">
    <BackButton history label="Back" />
    <h1 className="text-base font-semibold text-gray-900 mb-3">Checkout</h1>
    <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-2 mb-4">
      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">{photoUrl ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={photoUrl} alt={title} className="w-full h-full object-contain" /></> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M21 15l-5-5L5 19" /></svg>}</div>
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{title}</p><p className="text-[10px] text-gray-500 truncate">Sold by {sellerName.trim().split(/\s+/)[0]} · {campus}</p></div><span className="text-sm font-semibold text-gray-900">{formatRand(price)}</span>
    </div>
    <p className="text-xs font-semibold text-gray-900 mb-2">How do you want to get it?</p>
    {(['campus', 'paxi'] as const).map((value) => <button key={value} type="button" onClick={() => setMethod(value)} className={`w-full text-left rounded-xl p-3 mb-2 ${method === value ? 'border-2 border-blue-700' : 'border border-gray-200'}`}><div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-900">{value === 'campus' ? 'Meet on campus' : 'PAXI (PEP store)'}</span>{value === 'paxi' && <BrandLogo brand="paxi" height={16} />}</div><p className="text-[11px] text-gray-500 mt-0.5">{value === 'campus' ? 'Free. Meet in a public spot and show your code.' : 'The seller drops the parcel at a PEP. You collect at the PAXI point you choose.'}</p></button>)}
    {method === 'paxi' && <div className="mb-3"><label className="block text-xs text-gray-600 mb-1">Your PAXI point (code or store)</label><input value={paxiPoint} onChange={(event) => setPaxiPoint(event.target.value)} placeholder="e.g. PEP Potchefstroom" className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white" /><p className="text-[10px] text-gray-500 -mt-2">The seller confirms the delivery fee when they accept. It depends on bag size and speed.</p></div>}
    <p className="text-xs font-semibold text-gray-900 mt-3 mb-2">How will you pay?</p><div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 mb-4"><BrandLogo brand="payshap" height={20} /><p className="text-[11px] text-gray-500 leading-snug">You pay the seller directly from your banking app. We never hold your money.</p></div>
    <div className="flex justify-between text-xs text-gray-800 mb-1"><span>Item</span><span>{formatRand(price)}</span></div><div className="flex justify-between text-xs text-gray-500 mb-4"><span>Delivery</span><span>{method === 'campus' ? 'Free' : 'Set by seller'}</span></div>
    {error && <p className="text-xs text-red-600 mb-3">{error}</p>}<button type="button" onClick={submit} disabled={loading} className="w-full bg-blue-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50">{loading ? 'Sending...' : 'Send order request'}</button><p className="text-[10px] text-gray-500 text-center mt-2">The seller must accept before you pay.</p>
  </div>
}
