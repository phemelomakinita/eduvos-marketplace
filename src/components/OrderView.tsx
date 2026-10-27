'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import Avatar from '@/components/Avatar'
import BrandLogo from '@/components/BrandLogo'
import { createClient } from '@/lib/supabase/client'
import { formatRand, statusChip } from '@/lib/orders'
import type { Order } from '@/lib/types'
import { Copy, Info } from '@phosphor-icons/react/ssr'

type Payment = { payshap_number: string; amount: number; reference: string }
type Props = { order: Order; role: 'buyer' | 'seller'; other: { id: string; name: string; campus: string | null; avatarUrl: string | null }; payment: Payment | null; handoverCode: string | null }

export default function OrderView({ order, role, other, payment, handoverCode }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'' | 'number' | 'reference'>('')
  const [fee, setFee] = useState('')
  const [tracking, setTracking] = useState('')
  const [code, setCode] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const first = other.name.trim().split(/\s+/)[0] || 'Student'
  useEffect(() => {
    function refreshWhenVisible() { if (document.visibilityState === 'visible') router.refresh() }
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => document.removeEventListener('visibilitychange', refreshWhenVisible)
  }, [router])
  async function run(fn: () => PromiseLike<{ error: { message: string } | null }>) {
    setBusy(true); setError('')
    const result = await fn()
    if (result.error) { setError(result.error.message); setBusy(false); return }
    setBusy(false); router.refresh()
  }
  async function copy(value: string, which: 'number' | 'reference') {
    try { await navigator.clipboard.writeText(value); setCopied(which); setTimeout(() => setCopied(''), 2000) } catch { setError('Could not copy to clipboard.') }
  }
  async function completeHandover() {
    setBusy(true); setError('')
    const { data, error: rpcError } = await supabase.rpc('complete_with_code', { p_order_id: order.id, p_code: code.trim() })
    if (rpcError) setError(rpcError.message)
    else if (data === 'ok') { router.refresh(); return }
    else if (data === 'wrong_code') setError('That code is not correct. Check it with the buyer.')
    else if (data === 'locked') setError('Too many wrong codes. Ask the buyer to tap "I\'ve received it" in the app.')
    setBusy(false)
  }
  const chip = statusChip(order.status, role, order.delivery_method)
  const button = (label: string, fn: () => void, secondary = false) => <button type="button" disabled={busy} onClick={fn} className={`min-h-11 w-full rounded-lg text-sm font-medium disabled:opacity-50 ${secondary ? 'border border-blue-200 text-gray-800' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{label}</button>
  const completedNotice = <div className="rounded-lg border border-blue-100 bg-blue-50 p-3"><p className="text-sm font-semibold text-blue-900">Order completed</p></div>
  return <div className="min-h-screen bg-white px-4 py-4">
    <BackButton />
    <div className="flex items-center justify-between mb-3"><h1 className="text-base font-semibold text-gray-900">Order {order.code}</h1><span className={chip.className}>{chip.label}</span></div>
    {!['declined', 'cancelled'].includes(order.status) && <div className="flex justify-between mb-4">{(['Request', 'Accepted', 'Paid', 'Confirmed', 'Done'] as const).map((label, index) => { const current = ({ requested: 1, accepted: 2, paid: 3, confirmed: 4, sent: 4, completed: 5 } as Record<string, number>)[order.status] ?? 1; const state = index + 1 < current ? 'done' : index + 1 === current ? 'current' : 'future'; return <div key={label} className="flex-1 text-center"><div className={`mx-auto mb-1 w-[14px] h-[14px] rounded-full ${state === 'done' ? 'bg-blue-700' : state === 'current' ? 'border-[3px] border-blue-700' : 'bg-gray-200'}`} /><span className={`text-[9px] text-gray-500 ${state === 'current' ? 'font-semibold text-gray-900' : ''}`}>{label}</span></div> })}</div>}
    <div className="border border-gray-200 rounded-xl p-3 mb-4"><div className="flex items-center gap-2"><Avatar name={other.name} url={other.avatarUrl} size={32} /><div><p className="text-sm font-semibold text-gray-900">{order.listing_title}</p><p className="text-[11px] text-gray-500">{role === 'buyer' ? 'Sold by' : 'Buyer:'} {other.name}{other.campus ? ` · ${other.campus}` : ''}</p></div></div><p className="text-[11px] text-gray-500 mt-2">{order.delivery_method === 'campus' ? 'Meet on campus' : `PAXI to ${order.paxi_point}`}</p><div className="flex justify-between text-xs mt-2"><span>Item</span><span>{formatRand(order.item_price)}</span></div><div className="flex justify-between text-xs mt-2"><span>Delivery</span><span>{order.delivery_method === 'campus' ? 'Free' : order.status === 'requested' ? 'To be set by seller' : formatRand(order.delivery_fee)}</span></div><div className="flex justify-between text-xs mt-2 font-semibold text-gray-900"><span>Total</span><span>{order.status === 'requested' && order.delivery_method === 'paxi' ? `${formatRand(order.item_price)} + delivery` : formatRand(order.total)}</span></div></div>
    {['declined', 'cancelled'].includes(order.status) && <div className="mb-4 rounded-lg border border-blue-100 bg-slate-50 p-3"><p className="text-sm text-slate-700">This order was {order.status}.</p></div>}
    {error && <p className="mb-3 text-sm text-blue-900" role="alert">{error}</p>}
    {role === 'buyer' && order.status === 'requested' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs text-gray-700 mb-3">Waiting for {first} to accept your order.</p>{button('Cancel order', () => run(() => supabase.rpc('cancel_order', { p_order_id: order.id })), true)}</div>}
    {role === 'buyer' && order.status === 'accepted' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><div className="flex items-center justify-between mb-3"><p className="text-xs font-semibold text-gray-900">Pay with PayShap</p><BrandLogo brand="payshap" height={18} /></div>{payment ? <><div className="space-y-2 mb-3"><div className="flex justify-between items-center"><div><p className="text-[10px] text-gray-500">Pay to</p><p className="text-sm font-semibold">{payment.payshap_number}</p></div><button type="button" onClick={() => copy(payment.payshap_number, 'number')} className="text-gray-500 p-1" aria-label="Copy number"><Copy size={18} aria-hidden="true" />{copied === 'number' ? 'Copied' : ''}</button></div><div className="flex justify-between text-xs"><span>Amount</span><span className="font-semibold">{formatRand(payment.amount)}</span></div><div className="flex justify-between items-center"><div><p className="text-[10px] text-gray-500">Reference</p><p className="text-xs">{payment.reference}</p></div><button type="button" onClick={() => copy(payment.reference, 'reference')} className="text-gray-500 p-1" aria-label="Copy reference"><Copy size={18} aria-hidden="true" />{copied === 'reference' ? 'Copied' : ''}</button></div></div></> : <p className="text-xs text-gray-600 mb-3">Payment details are not available right now.</p>}<p className="text-[11px] text-gray-700 leading-relaxed mb-3">1. Open your banking app and choose PayShap<br />2. Pay the number above with this reference<br />3. Come back and tap &quot;I&apos;ve paid&quot;</p><div className="flex gap-2 border border-blue-100 bg-blue-50 rounded-lg p-2 mb-3"><Info size={16} className="flex-shrink-0 text-blue-700" aria-hidden="true" /><p className="text-[10px] text-blue-800 leading-snug">PayShap payments can&apos;t be reversed. Only pay after the seller accepts, and keep chatting inside the app.</p></div><div className="space-y-2">{button("I've paid", () => run(() => supabase.rpc('mark_paid', { p_order_id: order.id })))}{button('Cancel order', () => run(() => supabase.rpc('cancel_order', { p_order_id: order.id })), true)}</div></div>}
    {role === 'buyer' && order.status === 'paid' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs text-gray-700">You said you paid {formatRand(order.total)}. Waiting for {first} to confirm they received it.</p>{payment && <p className="text-[10px] text-gray-500 mt-2">Reference {payment.reference}</p>}</div>}
    {role === 'buyer' && order.status === 'confirmed' && order.delivery_method === 'campus' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs font-semibold text-gray-900">Your handover code</p><p className="text-3xl font-bold tracking-[0.3em] text-gray-900 my-2">{handoverCode}</p><p className="text-[11px] text-gray-500 mb-3">Meet {first} in a public spot on campus and show this code. Only share it when you have the item.</p>{button("I've received it", () => run(() => supabase.rpc('confirm_received', { p_order_id: order.id })))}</div>}
    {role === 'buyer' && order.status === 'confirmed' && order.delivery_method === 'paxi' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs text-gray-700">{first} has your payment and is preparing your parcel.</p></div>}
    {role === 'buyer' && order.status === 'sent' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs font-semibold text-gray-900">On its way</p><p className="text-[10px] text-gray-500 mt-2">PAXI tracking number</p><p className="text-sm font-semibold select-all mb-1">{order.paxi_tracking}</p><a href="https://www.paxi.co.za/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 font-medium">Track on PAXI</a><p className="text-[10px] text-gray-500 my-2">You collect at {order.paxi_point} with the PIN PAXI sends you by SMS.</p>{button("I've received it", () => run(() => supabase.rpc('confirm_received', { p_order_id: order.id })))}</div>}
    {role === 'buyer' && order.status === 'completed' && completedNotice}
    {role === 'seller' && order.status === 'requested' && <div className="border border-gray-200 rounded-xl p-3 mb-3">{order.delivery_method === 'paxi' && <><label className="block text-xs text-gray-600 mb-1">Your PAXI delivery fee (R)</label><input type="number" min={0} max={1000} step="0.01" value={fee} onChange={(event) => setFee(event.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white" /><p className="text-xs text-gray-700 mb-3">Buyer pays {formatRand(order.item_price + (parseFloat(fee) || 0))}</p><p className="text-[10px] text-gray-500 mb-3">Buy a PAXI bag at PEP and enter what it costs. It depends on bag size and speed.</p></>}<div className="space-y-2">{button('Accept order', () => run(() => supabase.rpc('accept_order', { p_order_id: order.id, p_delivery_fee: order.delivery_method === 'paxi' ? parseFloat(fee) || 0 : 0 })))}{button('Decline', () => run(() => supabase.rpc('decline_order', { p_order_id: order.id })), true)}</div></div>}
    {role === 'seller' && order.status === 'accepted' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs text-gray-700">Waiting for {first} to pay {formatRand(order.total)} with PayShap.</p></div>}
    {role === 'seller' && order.status === 'paid' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs font-semibold text-gray-900 mb-2">1. Confirm the payment</p><p className="text-xs text-gray-700 mb-3 leading-relaxed">{first} says they paid <b>{formatRand(order.total)}</b> with reference <b>{order.code}</b>. Check your banking app before you continue.</p><div className="space-y-2">{button("I've received the money", () => run(() => supabase.rpc('confirm_payment', { p_order_id: order.id })))}{button('Not received yet', () => run(() => supabase.rpc('payment_not_received', { p_order_id: order.id })), true)}</div></div>}
    {role === 'seller' && order.status === 'confirmed' && order.delivery_method === 'paxi' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs text-blue-800 mb-3">✓ Payment confirmed</p><p className="text-xs font-semibold text-gray-900 mb-2">2. Send it</p><p className="text-[11px] text-gray-600 mb-2">Deliver to: {order.paxi_point}</p><label className="block text-xs text-gray-600 mb-1">PAXI tracking number (from your receipt)</label><input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="e.g. 123456789012" className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white" /><button type="button" disabled={busy} onClick={() => run(() => supabase.rpc('mark_sent', { p_order_id: order.id, p_tracking: tracking.trim() }))} className="w-full bg-blue-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50">Mark as sent</button><p className="text-[10px] text-gray-500 mt-2 leading-snug">Buy a PAXI bag at PEP, pack the item, drop the parcel and use the tracking number on your receipt. Parcels are covered for loss up to R500, so consider extra cover for pricier items.</p></div>}
    {role === 'seller' && order.status === 'confirmed' && order.delivery_method === 'campus' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs text-blue-800 mb-3">✓ Payment confirmed</p><p className="text-xs font-semibold text-gray-900 mb-2">2. Hand it over</p><label className="block text-xs text-gray-600 mb-1">Buyer&apos;s 4-digit code</label><input inputMode="numeric" maxLength={4} value={code} onChange={(event) => setCode(event.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm text-gray-900 bg-white" />{button('Complete handover', () => completeHandover())}</div>}
    {role === 'seller' && order.status === 'sent' && <div className="border border-gray-200 rounded-xl p-3 mb-3"><p className="text-xs text-gray-700">Sent with PAXI tracking {order.paxi_tracking}. Waiting for {first} to confirm they received it.</p></div>}
    {role === 'seller' && order.status === 'completed' && completedNotice}
    {role === 'buyer' && order.listing_id ? <Link href={`/message/${order.listing_id}`} className="block text-center text-xs text-blue-700 font-medium py-3">Message seller</Link> : role === 'seller' ? <Link href="/messages" className="block text-center text-xs text-blue-700 font-medium py-3">Open your messages</Link> : null}
  </div>
}
