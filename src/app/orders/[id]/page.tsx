import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ORDER_COLUMNS } from '@/lib/orders'
import type { Order } from '@/lib/types'
import OrderView from '@/components/OrderView'

export const dynamic = 'force-dynamic'

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: order } = await supabase.from('orders').select(ORDER_COLUMNS).eq('id', id).maybeSingle()
  if (!order) notFound()
  const o = order as unknown as Order
  const role = o.buyer_id === user.id ? 'buyer' : o.seller_id === user.id ? 'seller' : null
  if (!role) notFound()
  const otherId = role === 'buyer' ? o.seller_id : o.buyer_id
  const { data: other } = await supabase.from('profiles').select('id, full_name, campus, avatar_url').eq('id', otherId).single()
  let payment: { payshap_number: string; amount: number; reference: string } | null = null
  if (role === 'buyer' && (o.status === 'accepted' || o.status === 'paid')) {
    const { data } = await supabase.rpc('get_payment_details', { p_order_id: id })
    payment = data
  }
  let handoverCode: string | null = null
  if (role === 'buyer' && o.delivery_method === 'campus' && o.status === 'confirmed') {
    const { data } = await supabase.rpc('get_handover_code', { p_order_id: id })
    handoverCode = data
  }
  return <OrderView order={o} role={role} other={{ id: otherId, name: other?.full_name ?? 'Student', campus: other?.campus ?? null, avatarUrl: other?.avatar_url ?? null }} payment={payment} handoverCode={handoverCode} />
}
