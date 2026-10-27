import type { Order } from '@/lib/types'

export const ORDER_COLUMNS = 'id, code, listing_id, listing_title, listing_photo_url, item_price, buyer_id, seller_id, business_id, business_name, delivery_method, paxi_point, delivery_fee, total, status, paxi_tracking, created_at, updated_at, accepted_at, paid_at, confirmed_at, sent_at, completed_at'

export function formatRand(n: number): string {
  return 'R' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function statusChip(status: Order['status'], role: 'buyer' | 'seller', method: Order['delivery_method']): { label: string; className: string } {
  const base = 'text-xs font-medium px-2.5 py-1 rounded-md'
  const values: Record<Order['status'], [string, string]> = {
    requested: ['Waiting', 'bg-slate-100 text-slate-700'],
    accepted: role === 'buyer' ? ['Pay now', 'bg-blue-600 text-white'] : ['Waiting for payment', 'bg-slate-100 text-slate-700'],
    paid: role === 'buyer' ? ['Waiting for seller', 'bg-slate-100 text-slate-700'] : ['Confirm payment', 'bg-blue-600 text-white'],
    confirmed: role === 'buyer' ? (method === 'campus' ? ['Meet up', 'bg-blue-600 text-white'] : ['Being prepared', 'bg-slate-100 text-slate-700']) : (method === 'campus' ? ['Hand over', 'bg-blue-600 text-white'] : ['Send it', 'bg-blue-600 text-white']),
    sent: role === 'buyer' ? ['On its way', 'bg-blue-600 text-white'] : ['Sent', 'bg-slate-100 text-slate-700'],
    completed: ['Completed', 'bg-blue-50 text-blue-800'],
    declined: ['Declined', 'bg-slate-100 text-slate-700'],
    cancelled: ['Cancelled', 'bg-slate-100 text-slate-700'],
  }
  const [label, color] = values[status]
  return { label, className: `${base} ${color}` }
}
