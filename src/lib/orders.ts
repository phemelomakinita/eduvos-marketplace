import type { Order } from '@/lib/types'

export const ORDER_COLUMNS = 'id, code, listing_id, listing_title, listing_photo_url, item_price, buyer_id, seller_id, business_id, business_name, delivery_method, paxi_point, delivery_fee, total, status, paxi_tracking, created_at, updated_at, accepted_at, paid_at, confirmed_at, sent_at, completed_at'

export function formatRand(n: number): string {
  return 'R' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function statusChip(status: Order['status'], role: 'buyer' | 'seller', method: Order['delivery_method']): { label: string; className: string } {
  const base = 'text-[10px] font-medium px-2.5 py-1 rounded-full'
  const values: Record<Order['status'], [string, string]> = {
    requested: ['Waiting', 'bg-gray-100 text-gray-700'],
    accepted: role === 'buyer' ? ['Pay now', 'bg-blue-700 text-white'] : ['Waiting for payment', 'bg-gray-100 text-gray-700'],
    paid: role === 'buyer' ? ['Waiting for seller', 'bg-gray-100 text-gray-700'] : ['Confirm payment', 'bg-amber-700 text-white'],
    confirmed: role === 'buyer' ? (method === 'campus' ? ['Meet up', 'bg-blue-700 text-white'] : ['Being prepared', 'bg-gray-100 text-gray-700']) : (method === 'campus' ? ['Hand over', 'bg-amber-700 text-white'] : ['Send it', 'bg-amber-700 text-white']),
    sent: role === 'buyer' ? ['On its way', 'bg-blue-700 text-white'] : ['Sent', 'bg-gray-100 text-gray-700'],
    completed: ['Completed', 'bg-green-100 text-green-800'],
    declined: ['Declined', 'bg-red-100 text-red-700'],
    cancelled: ['Cancelled', 'bg-red-100 text-red-700'],
  }
  const [label, color] = values[status]
  return { label, className: `${base} ${color}` }
}
