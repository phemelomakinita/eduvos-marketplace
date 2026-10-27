import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ORDER_COLUMNS } from '@/lib/orders'
import type { AppNotification, Business, Listing, Order } from '@/lib/types'
import MyStoreView, { type StoreConversation } from '@/components/MyStoreView'

export const dynamic = 'force-dynamic'

const DATA_PAGE_SIZE = 500

export default async function MyStorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: businessData, error: businessError } = await supabase
    .from('businesses')
    .select('*, profiles(campus)')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (businessError) {
    return <MyStoreView business={null} campus={null} listings={[]} orders={[]} conversations={[]} notifications={[]} unreadMessageCount={0} stats={null} loadError={`We couldn't load your store: ${businessError.message}`} />
  }

  const business = businessData as (Business & { profiles: { campus: string | null } | null }) | null
  if (!business) {
    return <MyStoreView business={null} campus={null} listings={[]} orders={[]} conversations={[]} notifications={[]} unreadMessageCount={0} stats={null} />
  }

  const [
    listingsResult,
    listingsCountResult,
    ordersResult,
    openCountResult,
    completedCountResult,
    completedSalesResult,
    conversationsResult,
    notificationResult,
    unreadSaleNotificationsResult,
    unreadMessagesResult,
  ] = await Promise.all([
    supabase.from('listings').select('*').eq('business_id', business.id).eq('user_id', user.id).order('created_at', { ascending: false }).range(0, DATA_PAGE_SIZE - 1),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('business_id', business.id).eq('user_id', user.id),
    supabase.from('orders').select(ORDER_COLUMNS).eq('seller_id', user.id).eq('business_id', business.id).order('created_at', { ascending: false }).range(0, DATA_PAGE_SIZE - 1),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('seller_id', user.id).eq('business_id', business.id).in('status', ['requested', 'accepted', 'paid', 'confirmed', 'sent']),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('seller_id', user.id).eq('business_id', business.id).eq('status', 'completed'),
    supabase.from('orders').select('item_price').eq('seller_id', user.id).eq('business_id', business.id).eq('status', 'completed').range(0, DATA_PAGE_SIZE - 1),
    supabase.from('conversations').select('id, user_a, user_b, listing_title, last_message_at, last_message_preview').or(`user_a.eq.${user.id},user_b.eq.${user.id}`).not('last_message_at', 'is', null).order('last_message_at', { ascending: false }).limit(8),
    supabase.from('notifications').select('id, kind, role, title, body, order_id, read_at, created_at').eq('user_id', user.id).eq('role', 'sale').order('created_at', { ascending: false }).limit(5),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('role', 'sale').is('read_at', null),
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('recipient_id', user.id).is('read_at', null),
  ])

  const listingRows = [...(listingsResult.data ?? [])]
  let listingError = listingsResult.error?.message ?? null
  if (!listingError && listingRows.length === DATA_PAGE_SIZE) {
    for (let from = DATA_PAGE_SIZE; ; from += DATA_PAGE_SIZE) {
      const { data, error } = await supabase.from('listings').select('*')
        .eq('business_id', business.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, from + DATA_PAGE_SIZE - 1)
      if (error) {
        listingError = error.message
        break
      }
      listingRows.push(...(data ?? []))
      if (!data || data.length < DATA_PAGE_SIZE) break
    }
  }

  const orderRows = [...(ordersResult.data ?? [])]
  let orderError = ordersResult.error?.message ?? null
  if (!orderError && orderRows.length === DATA_PAGE_SIZE) {
    for (let from = DATA_PAGE_SIZE; ; from += DATA_PAGE_SIZE) {
      const { data, error } = await supabase.from('orders').select(ORDER_COLUMNS)
        .eq('seller_id', user.id)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .range(from, from + DATA_PAGE_SIZE - 1)
      if (error) {
        orderError = error.message
        break
      }
      orderRows.push(...(data ?? []))
      if (!data || data.length < DATA_PAGE_SIZE) break
    }
  }

  let completedOrderValue = (completedSalesResult.data ?? []).reduce((sum, order) => sum + Number(order.item_price ?? 0), 0)
  let completedSalesError = completedSalesResult.error?.message ?? null
  if (!completedSalesError && completedSalesResult.data?.length === DATA_PAGE_SIZE) {
    for (let from = DATA_PAGE_SIZE; ; from += DATA_PAGE_SIZE) {
      const { data, error } = await supabase
        .from('orders')
        .select('item_price')
        .eq('seller_id', user.id)
        .eq('business_id', business.id)
        .eq('status', 'completed')
        .range(from, from + DATA_PAGE_SIZE - 1)
      if (error) {
        completedSalesError = error.message
        break
      }
      completedOrderValue += (data ?? []).reduce((sum, order) => sum + Number(order.item_price ?? 0), 0)
      if (!data || data.length < DATA_PAGE_SIZE) break
    }
  }

  const orders = orderRows as unknown as Order[]
  const buyerIds = Array.from(new Set(orders.map((order) => order.buyer_id)))
  const buyerBatches = await Promise.all(Array.from({ length: Math.ceil(buyerIds.length / 200) }, (_, index) =>
    supabase.from('profiles').select('id, full_name').in('id', buyerIds.slice(index * 200, (index + 1) * 200))))
  const buyerLookupError = buyerBatches.find((batch) => batch.error)?.error?.message ?? null
  const buyerNames = new Map(buyerBatches.flatMap(({ data }) => (data ?? []).map((buyer) => [buyer.id, buyer.full_name ?? 'Student'] as const)))

  const conversations = conversationsResult.data ?? []
  const conversationOtherIds = Array.from(new Set(conversations.map((conversation) => conversation.user_a === user.id ? conversation.user_b : conversation.user_a)))
  const { data: people, error: peopleError } = conversationOtherIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', conversationOtherIds)
    : { data: [] as { id: string; full_name: string | null }[], error: null }
  const personNames = new Map((people ?? []).map((person) => [person.id, person.full_name ?? 'Student']))
  const conversationIds = conversations.map((conversation) => conversation.id)
  const { data: unreadRows, error: unreadRowsError } = conversationIds.length
    ? await supabase.from('messages').select('conversation_id').eq('recipient_id', user.id).is('read_at', null).in('conversation_id', conversationIds)
    : { data: [] as { conversation_id: string }[], error: null }
  const unreadByConversation = new Map<string, number>()
  for (const row of unreadRows ?? []) unreadByConversation.set(row.conversation_id, (unreadByConversation.get(row.conversation_id) ?? 0) + 1)
  const recentConversations: StoreConversation[] = conversations.map((conversation) => {
    const otherId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a
    return {
      id: conversation.id,
      otherName: personNames.get(otherId) ?? 'Student',
      listingTitle: conversation.listing_title,
      preview: conversation.last_message_preview ?? '',
      lastAt: conversation.last_message_at ?? '',
      unread: unreadByConversation.get(conversation.id) ?? 0,
    }
  })

  const dashboardError = [listingError, listingsCountResult.error?.message, orderError, buyerLookupError, peopleError?.message, conversationsResult.error?.message, notificationResult.error?.message, unreadSaleNotificationsResult.error?.message, unreadMessagesResult.error?.message, unreadRowsError?.message, openCountResult.error?.message, completedCountResult.error?.message, completedSalesError].filter(Boolean).join(' ')
  const stats = {
    listings: listingsCountResult.count,
    openOrders: openCountResult.count,
    completedOrders: completedCountResult.count,
    completedOrderValue: completedSalesError ? null : completedOrderValue,
    unreadSaleNotifications: unreadSaleNotificationsResult.error ? null : unreadSaleNotificationsResult.count,
  }

  const notifications = (notificationResult.data ?? []) as AppNotification[]
  const listings = listingRows as Listing[]
  const enrichedOrders = orders.map((order) => ({ ...order, buyer_name: buyerNames.get(order.buyer_id) ?? 'Student' }))

  return (
    <MyStoreView
      business={business}
      campus={business.profiles?.campus ?? null}
      listings={listings}
      orders={enrichedOrders}
      conversations={recentConversations}
      notifications={notifications}
      unreadMessageCount={unreadMessagesResult.error ? null : unreadMessagesResult.count ?? 0}
      stats={stats}
      loadError={dashboardError || null}
    />
  )
}
