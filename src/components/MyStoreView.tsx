'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StoreHeader from '@/components/StoreHeader'
import StoreToolsMenu from '@/components/StoreToolsMenu'
import type { AppNotification, Business, Listing, Order } from '@/lib/types'
import { formatRand, statusChip } from '@/lib/orders'
import { CATEGORIES } from '@/lib/categories'
import {
  ArrowUpRight,
  Bell,
  ChartBar,
  ChatCircle,
  Eye,
  Gear,
  MagnifyingGlass,
  Package,
  Plus,
  Receipt,
  SealCheck,
  Storefront,
  Trash,
  WarningCircle,
} from '@phosphor-icons/react/ssr'

type StoreOrder = Order & { buyer_name: string }
export type StoreConversation = {
  id: string
  otherName: string
  listingTitle: string | null
  preview: string
  lastAt: string
  unread: number
}
type StoreStats = {
  listings: number | null
  openOrders: number | null
  completedOrders: number | null
  completedOrderValue: number | null
  unreadSaleNotifications: number | null
}
type Tab = 'Overview' | 'Products' | 'Orders' | 'Messages' | 'Analytics' | 'Store settings'

const tabs: { label: Tab; icon: typeof Storefront }[] = [
  { label: 'Overview', icon: Storefront },
  { label: 'Products', icon: Package },
  { label: 'Orders', icon: Receipt },
  { label: 'Messages', icon: ChatCircle },
  { label: 'Analytics', icon: ChartBar },
  { label: 'Store settings', icon: Gear },
]

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function paymentLabel(status: Order['status']) {
  if (status === 'requested') return 'Order request'
  if (status === 'accepted') return 'Awaiting buyer payment'
  if (status === 'paid') return 'Buyer reported payment'
  if (['confirmed', 'sent', 'completed'].includes(status)) return 'Seller confirmed payment'
  return 'No payment due'
}

function fulfillmentLabel(status: Order['status'], method: Order['delivery_method']) {
  if (status === 'requested') return 'Awaiting seller response'
  if (status === 'accepted') return 'Awaiting buyer payment'
  if (status === 'paid') return 'Payment needs seller confirmation'
  if (status === 'confirmed') return method === 'campus' ? 'Ready to arrange campus meetup' : 'Parcel being prepared'
  if (status === 'sent') return 'Dispatched'
  if (status === 'completed') return 'Fulfilled'
  if (status === 'declined') return 'Declined'
  return 'Cancelled'
}

function orderGroup(status: Order['status']): 'action' | 'progress' | 'complete' | 'closed' {
  if (status === 'requested' || status === 'paid') return 'action'
  if (['accepted', 'confirmed', 'sent'].includes(status)) return 'progress'
  if (status === 'completed') return 'complete'
  return 'closed'
}

function VerificationStatus({ business }: { business: Business }) {
  if (business.is_verified || business.verification_status === 'approved') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><SealCheck size={16} weight="fill" /> Hub verified</span>
  }
  if (business.verification_status === 'pending') {
    return <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">Verification pending</span>
  }
  if (business.verification_status === 'rejected') {
    return <span className="inline-flex rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800">Verification not approved</span>
  }
  return <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">Not verified</span>
}

export default function MyStoreView({
  business,
  campus,
  listings,
  orders,
  conversations,
  notifications,
  unreadMessageCount,
  stats,
  loadError = null,
}: {
  business: Business | null
  campus: string | null
  listings: Listing[]
  orders: StoreOrder[]
  conversations: StoreConversation[]
  notifications: AppNotification[]
  unreadMessageCount: number | null
  stats: StoreStats | null
  loadError?: string | null
}) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [items, setItems] = useState(listings)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [productStatusFilter, setProductStatusFilter] = useState('All visibility')
  const [orderFilter, setOrderFilter] = useState('All orders')
  const [orderSearch, setOrderSearch] = useState('')
  const [visibleOrderCount, setVisibleOrderCount] = useState(20)
  const [deleteError, setDeleteError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const openCount = stats?.openOrders
  const completedCount = stats?.completedOrders
  const visibleListingCount = business && !business.is_paused ? stats?.listings : 0
  const completedSales = stats?.completedOrderValue
  const unreadSales = stats?.unreadSaleNotifications
  const completedOrders = useMemo(() => orders.filter((order) => order.status === 'completed'), [orders])
  const mostOrdered = useMemo(() => {
    const counts = new Map<string, number>()
    for (const order of completedOrders) counts.set(order.listing_title, (counts.get(order.listing_title) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null
  }, [completedOrders])

  const filteredListings = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.trim().toLowerCase())
    const matchesCategory = categoryFilter === 'All categories' || item.category === categoryFilter
    const matchesVisibility = productStatusFilter === 'All visibility' ||
      (productStatusFilter === 'Visible' && !business?.is_paused) ||
      (productStatusFilter === 'Hidden (store paused)' && business?.is_paused)
    return matchesSearch && matchesCategory && matchesVisibility
  })
  const filteredOrders = orders.filter((order) => {
    const matchesGroup = orderFilter === 'All orders' || orderGroup(order.status) === orderFilter
    const needle = orderSearch.trim().toLowerCase()
    const matchesSearch = !needle || [order.code, order.listing_title, order.buyer_name].some((value) => value.toLowerCase().includes(needle))
    return matchesGroup && matchesSearch
  })

  async function handleDelete(item: Listing) {
    if (!business || !window.confirm(`Delete “${item.title}”? This action cannot be undone.`)) return
    setDeleteError('')
    setDeletingId(item.id)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== business.owner_id) {
      setDeleteError(authError?.message ?? 'Please sign in as the owner of this store to delete a listing.')
      setDeletingId(null)
      return
    }
    const { data, error } = await supabase.from('listings')
      .delete()
      .eq('id', item.id)
      .eq('user_id', user.id)
      .eq('business_id', business.id)
      .select('id')
      .maybeSingle()
    if (error || !data) {
      setDeleteError(error?.message ?? 'This listing could not be deleted. It may no longer belong to this store or may be part of an order.')
      setDeletingId(null)
      return
    }
    setItems((current) => current.filter((listing) => listing.id !== item.id))
    setDeletingId(null)
    router.refresh()
  }

  if (!business) {
    return (
      <main className="min-h-dvh bg-slate-50 px-4 py-10 sm:px-8">
        <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Storefront size={34} weight="duotone" /></span>
          <p className="mt-5 text-sm font-semibold text-blue-700">Eduvos Marketplace seller tools</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{loadError ? 'Your store could not load' : 'Your store starts here'}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">{loadError ? 'Please try again later. Your store data was not available, so no seller statistics are shown.' : 'Create your student business profile to publish listings, manage orders, and connect with buyers in your campus community.'}</p>
          {loadError ? <p role="alert" className="mt-4 text-sm text-rose-700">{loadError}</p> : (
            <Link href="/register-business" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">
              Create your store <ArrowUpRight size={18} />
            </Link>
          )}
        </section>
      </main>
    )
  }

  const tabNav = (mobile = false) => (
    <nav role="tablist" aria-label="Store dashboard" className={mobile ? 'flex gap-2 overflow-x-auto pb-2 lg:hidden' : 'hidden space-y-1 lg:block'}>
      {tabs.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={activeTab === label}
          aria-controls="store-section"
          onClick={() => setActiveTab(label)}
          className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${mobile ? '' : 'w-full'} ${activeTab === label ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-800'}`}
        >
          <Icon size={19} weight={activeTab === label ? 'fill' : 'regular'} aria-hidden="true" />
          {label}
          {label === 'Messages' && unreadMessageCount != null && unreadMessageCount > 0 && <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${activeTab === label ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>{unreadMessageCount}</span>}
        </button>
      ))}
    </nav>
  )

  const orderCard = (order: StoreOrder) => {
    const chip = statusChip(order.status, 'seller', order.delivery_method)
    return (
      <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order {order.code}</p>
            <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">{order.listing_title}</h3>
            <p className="mt-1 text-xs text-slate-500">Buyer: {order.buyer_name} · {dateLabel(order.created_at)}</p>
          </div>
          <span className={chip.className}>{chip.label}</span>
        </div>
        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 text-xs sm:grid-cols-2 xl:grid-cols-4">
          <div><p className="text-slate-500">Order value</p><p className="mt-1 font-semibold text-slate-900">{order.status === 'requested' && order.delivery_method === 'paxi' ? `${formatRand(order.item_price)} + delivery` : formatRand(order.total)}</p></div>
          <div><p className="text-slate-500">Payment</p><p className="mt-1 font-medium text-slate-800">{paymentLabel(order.status)}</p></div>
          <div><p className="text-slate-500">Fulfilment</p><p className="mt-1 font-medium text-slate-800">{fulfillmentLabel(order.status, order.delivery_method)}</p></div>
          <div><p className="text-slate-500">Delivery</p><p className="mt-1 font-medium text-slate-800">{order.delivery_method === 'campus' ? 'Meet on campus' : `PAXI · ${order.paxi_point || 'point not set'}`}</p></div>
        </div>
        {order.paxi_tracking && <p className="mt-2 text-xs text-slate-600">PAXI tracking: <span className="font-semibold">{order.paxi_tracking}</span></p>}
        <Link href={`/orders/${order.id}`} className="mt-4 inline-flex min-h-10 items-center gap-1 rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-800 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          View order and available actions <ArrowUpRight size={15} />
        </Link>
      </article>
    )
  }

  return (
    <main className="min-h-dvh bg-slate-50 pb-10 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Seller dashboard</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">My Store</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/store/${business.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-800 sm:px-4 sm:text-sm">
              <Eye size={17} /> <span className="hidden sm:inline">View My Public Store</span><span className="sm:hidden">Preview</span>
            </Link>
            <Link href="/post-listing" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-700 px-3 text-xs font-semibold text-white hover:bg-blue-800 sm:px-4 sm:text-sm">
              <Plus size={17} weight="bold" /> Add listing
            </Link>
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open store tools" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              <Gear size={19} />
            </button>
          </div>
        </div>
        <StoreToolsMenu business={business} open={menuOpen} onClose={() => setMenuOpen(false)} />

        {loadError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{loadError}</p>}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <StoreHeader business={business} campus={campus} showPending />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <VerificationStatus business={business} />
              {business.is_paused && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">Store paused · listings hidden</span>}
            </div>
            {business.verification_status === 'rejected' && business.verification_rejection_reason && <p className="w-full text-xs text-rose-700">{business.verification_rejection_reason}</p>}
            <Link href="/my-store/verification" className="text-xs font-semibold text-blue-800 hover:underline">{business.is_verified ? 'Verification details' : 'Manage verification'} →</Link>
          </div>
        </section>

        {tabNav(true)}
        <div className="mt-3 gap-5 lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="sticky top-4 hidden h-fit rounded-2xl border border-slate-200 bg-white p-3 lg:block">
            <p className="mb-3 px-3 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Manage your store</p>
            {tabNav()}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Link href="/my-store/earnings" className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-800"><ChartBar size={19} /> Earnings details</Link>
            </div>
          </aside>

          <div id="store-section" role="tabpanel" aria-label={activeTab} className="min-w-0">
            {activeTab === 'Overview' && (
              <section aria-labelledby="overview-heading">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div><h2 id="overview-heading" className="text-lg font-bold text-slate-950">Store overview</h2><p className="mt-1 text-sm text-slate-500">A snapshot of your listings, orders, and buyer activity.</p></div>
                  <Link href={`/store/${business.id}`} className="hidden items-center gap-1 text-sm font-semibold text-blue-800 hover:underline sm:inline-flex">View public store <ArrowUpRight size={16} /></Link>
                </div>
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  <Metric label="Visible listings" value={visibleListingCount == null ? '—' : String(visibleListingCount)} detail={business.is_paused ? 'Store is paused' : 'Available in marketplace'} icon={Package} />
                  <Metric label="Open orders" value={openCount == null ? '—' : String(openCount)} detail="Awaiting fulfilment or action" icon={Receipt} />
                  <Metric label="Completed orders" value={completedCount == null ? '—' : String(completedCount)} detail="Completed in the order workflow" icon={SealCheck} />
                  <Metric label="Completed item value" value={completedSales == null ? '—' : formatRand(completedSales)} detail="Order records, not verified bank receipts" icon={ChartBar} />
                </div>
                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-slate-950">Recent orders</h3><p className="mt-1 text-xs text-slate-500">Use the order page for permitted fulfilment actions.</p></div><button type="button" onClick={() => setActiveTab('Orders')} className="text-xs font-semibold text-blue-800 hover:underline">All orders</button></div>
                    {orders.length ? <div className="space-y-3">{orders.slice(0, 4).map(orderCard)}</div> : <EmptyState title="No orders yet" body="When a buyer orders from your store, their order and fulfilment details will appear here." action="Manage products" href="#products" onAction={() => setActiveTab('Products')} />}
                  </section>
                  <div className="space-y-5">
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-slate-950">Recent messages</h3><button type="button" onClick={() => setActiveTab('Messages')} className="text-xs font-semibold text-blue-800 hover:underline">Inbox</button></div>
                      {conversations.length ? <div className="divide-y divide-slate-100">{conversations.slice(0, 4).map((conversation) => (
                        <Link key={conversation.id} href={`/messages/c/${conversation.id}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-800">{conversation.otherName.trim().charAt(0).toUpperCase()}</span>
                          <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-slate-900">{conversation.otherName}</span>{conversation.unread > 0 && <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-bold text-white">{conversation.unread}</span>}</span><span className="mt-1 block truncate text-xs text-slate-500">{conversation.listingTitle ? `${conversation.listingTitle} · ` : ''}{conversation.preview}</span></span>
                        </Link>
                      ))}</div> : <p className="py-4 text-sm text-slate-500">No customer conversations yet.</p>}
                      {unreadMessageCount != null && unreadMessageCount > 0 && <p className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900"><ChatCircle size={16} /> {unreadMessageCount} unread message{unreadMessageCount === 1 ? '' : 's'}</p>}
                    </section>
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-slate-950">Needs your attention</h3><Bell size={18} className="text-slate-400" /></div>
                      <div className="space-y-2">
                        {(openCount ?? 0) > 0 && <button type="button" onClick={() => { setOrderFilter('action'); setActiveTab('Orders') }} className="flex w-full items-start gap-2 rounded-xl bg-amber-50 p-3 text-left text-xs text-amber-900"><WarningCircle size={16} className="mt-0.5 shrink-0" /><span><strong>{openCount} open order{openCount === 1 ? '' : 's'}</strong><br />Review requests and buyer payment updates.</span></button>}
                        {!business.is_verified && business.verification_status !== 'pending' && <Link href="/my-store/verification" className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-900"><SealCheck size={16} className="mt-0.5 shrink-0" /><span><strong>Store verification</strong><br />Review your status or submit a request.</span></Link>}
                        {(unreadSales ?? 0) > 0 && <div className="rounded-xl bg-slate-50 p-3">
                          <Link href="/notifications" className="flex items-start gap-2 text-xs text-slate-800"><Bell size={16} className="mt-0.5 shrink-0" /><span><strong>{unreadSales} unread sale notification{unreadSales === 1 ? '' : 's'}</strong><br />Open notifications for recent updates.</span></Link>
                          {notifications.filter((notification) => !notification.read_at).slice(0, 3).map((notification) => (
                            <Link key={notification.id} href={notification.order_id ? `/orders/${notification.order_id}` : '/notifications'} className="mt-3 block border-t border-slate-200 pt-2 text-xs hover:text-blue-800">
                              <span className="block font-semibold">{notification.title}</span><span className="mt-0.5 block text-slate-500">{notification.body}</span>
                            </Link>
                          ))}
                        </div>}
                        {(openCount ?? 0) === 0 && (business.is_verified || business.verification_status === 'pending') && (unreadSales ?? 0) === 0 && <p className="text-sm text-slate-500">You&apos;re all caught up. We&apos;ll show order and store tasks here.</p>}
                      </div>
                    </section>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Products' && (
              <section aria-labelledby="products-heading">
                <SectionHeading id="products-heading" title="Products and services" description="Manage your existing store listings. Inventory quantities and per-listing moderation states are not stored by this marketplace." action={<Link href="/post-listing" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"><Plus size={17} /> Add listing</Link>} />
                <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_180px_190px]">
                  <label className="relative"><span className="sr-only">Search products</span><MagnifyingGlass size={18} className="absolute left-3 top-3 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by listing name" className="min-h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                  <label><span className="sr-only">Filter by category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option>All categories</option>{CATEGORIES.map((category) => <option key={category.value}>{category.value}</option>)}</select></label>
                  <label><span className="sr-only">Filter by visibility</span><select value={productStatusFilter} onChange={(event) => setProductStatusFilter(event.target.value)} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option>All visibility</option><option>Visible</option><option>Hidden (store paused)</option></select></label>
                </div>
                {deleteError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{deleteError}</p>}
                {!items.length ? <EmptyState title="Add your first product or service" body="Create a listing to start showing buyers what your campus business offers." action="Create a listing" href="/post-listing" /> :
                  filteredListings.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredListings.map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <Link href={`/listing/${item.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                        <div className="aspect-[4/3] bg-slate-50">
                          {item.photo_url ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.photo_url} alt={item.title} className="h-full w-full object-contain" />
                            </>
                          ) : <div className="flex h-full items-center justify-center text-slate-300"><Package size={42} /></div>}
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate font-semibold text-slate-900">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{item.category || 'Uncategorised'}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${business.is_paused ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-800'}`}>{business.is_paused ? 'Store paused' : 'Visible'}</span></div>
                        <p className="mt-3 text-lg font-bold text-slate-950">{item.price == null ? 'Price on request' : formatRand(item.price)}</p>
                        <div className="mt-4 flex gap-2">
                          <Link href={`/edit-listing/${item.id}`} className="flex min-h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50">Edit</Link>
                          <Link href={`/listing/${item.id}`} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50"><Eye size={15} /> Preview</Link>
                          <button type="button" onClick={() => handleDelete(item)} disabled={deletingId === item.id} aria-label={`Delete ${item.title}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"><Trash size={17} /></button>
                        </div>
                      </div>
                    </article>
                  ))}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">No listings match those search and filter choices.</p>}
              </section>
            )}

            {activeTab === 'Orders' && (
              <section aria-labelledby="orders-heading">
                <SectionHeading id="orders-heading" title="Orders" description="Payment progress and fulfilment are shown separately. Use an order to take actions allowed by the existing order workflow." />
                <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[200px_minmax(0,1fr)]">
                  <label><span className="sr-only">Filter orders</span><select value={orderFilter} onChange={(event) => { setOrderFilter(event.target.value); setVisibleOrderCount(20) }} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option>All orders</option><option value="action">Needs action</option><option value="progress">In progress</option><option value="complete">Completed</option><option value="closed">Cancelled or declined</option></select></label>
                  <label className="relative"><span className="sr-only">Search orders</span><MagnifyingGlass size={18} className="absolute left-3 top-3 text-slate-400" /><input value={orderSearch} onChange={(event) => { setOrderSearch(event.target.value); setVisibleOrderCount(20) }} placeholder="Search reference, product, or buyer" className="min-h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                </div>
                {filteredOrders.length ? <div className="space-y-3">{filteredOrders.slice(0, visibleOrderCount).map(orderCard)}{filteredOrders.length > visibleOrderCount && <button type="button" onClick={() => setVisibleOrderCount((count) => count + 20)} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-blue-800 hover:bg-blue-50">Show more orders</button>}</div> : <EmptyState title="No matching orders" body={orders.length ? 'Try another order status or search term.' : 'New purchases from your store will appear here. You can keep your listings up to date while you wait.'} action="Manage products" href="#products" onAction={() => setActiveTab('Products')} />}
              </section>
            )}

            {activeTab === 'Messages' && (
              <section aria-labelledby="messages-heading">
                <SectionHeading id="messages-heading" title="Customer messages" description={`${unreadMessageCount == null ? 'Unread message count unavailable' : `${unreadMessageCount} unread message${unreadMessageCount === 1 ? '' : 's'}`} across your inbox. Continue conversations in the existing marketplace chat.`} action={<Link href="/messages" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Open inbox <ArrowUpRight size={16} /></Link>} />
                {conversations.length ? <div className="space-y-3">{conversations.map((conversation) => (
                  <Link key={conversation.id} href={`/messages/c/${conversation.id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-800">{conversation.otherName.trim().charAt(0).toUpperCase()}</span>
                    <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-slate-900">{conversation.otherName}</span><span className="text-xs text-slate-500">{conversation.lastAt ? dateLabel(conversation.lastAt) : ''}</span></span><span className="mt-1 block truncate text-xs text-slate-500">{conversation.listingTitle ? `${conversation.listingTitle} · ` : ''}{conversation.preview}</span></span>
                    {conversation.unread > 0 && <span className="rounded-full bg-blue-700 px-2.5 py-1 text-xs font-bold text-white">{conversation.unread} new</span>}
                  </Link>
                ))}</div> : <EmptyState title="No customer messages yet" body="Conversations about your listings will appear here. Keep your listing details clear to help buyers get in touch." action="View listings" href="#products" onAction={() => setActiveTab('Products')} />}
              </section>
            )}

            {activeTab === 'Analytics' && (
              <section aria-labelledby="analytics-heading">
                <SectionHeading id="analytics-heading" title="Sales analytics" description="These figures summarize order records. Payment confirmations are part of the existing order process; the marketplace does not verify bank receipts." action={<Link href="/my-store/earnings" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Earnings details <ArrowUpRight size={16} /></Link>} />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <Metric label="Completed order count" value={completedCount == null ? '—' : String(completedCount)} detail="All completed orders for this store" icon={Receipt} />
                  <Metric label="Completed item value" value={completedSales == null ? '—' : formatRand(completedSales)} detail="Sum of completed order item prices; excludes PAXI delivery fees" icon={ChartBar} />
                  <Metric label="Open orders" value={openCount == null ? '—' : String(openCount)} detail="Requested, accepted, paid, confirmed, or sent" icon={WarningCircle} />
                </div>
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-semibold text-slate-950">Recent completed sales</h3>
                    <p className="mt-1 text-xs text-slate-500">Shown from the latest orders available on this dashboard.</p>
                    {completedOrders.length ? <div className="mt-4 divide-y divide-slate-100">{completedOrders.slice(0, 8).map((order) => <div key={order.id} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{order.listing_title}</p><p className="mt-1 text-xs text-slate-500">{dateLabel(order.completed_at ?? order.created_at)} · Order {order.code}</p></div><p className="shrink-0 text-sm font-semibold text-slate-900">{formatRand(order.item_price)}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-500">Completed orders will show here when a sale is fulfilled.</p>}
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-semibold text-slate-950">Most frequently ordered</h3>
                    <p className="mt-1 text-xs text-slate-500">Based on completed orders for each listing, not units sold.</p>
                    {mostOrdered ? <div className="mt-5 rounded-xl bg-blue-50 p-4"><p className="text-sm font-semibold text-blue-950">{mostOrdered[0]}</p><p className="mt-1 text-xs text-blue-800">{mostOrdered[1]} completed order{mostOrdered[1] === 1 ? '' : 's'}</p></div> : <p className="mt-4 text-sm text-slate-500">There isn&apos;t enough completed order history to show a frequent listing yet.</p>}
                    <p className="mt-4 text-xs leading-5 text-slate-500">Profit is not shown because product costs are not recorded. Completed order value is not a bank statement or proof of funds received.</p>
                  </section>
                </div>
              </section>
            )}

            {activeTab === 'Store settings' && (
              <section aria-labelledby="settings-heading">
                <SectionHeading id="settings-heading" title="Store settings" description="Update your public store information, trust status, and visibility." />
                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-semibold text-slate-950">Public store profile</h3>
                    <p className="mt-1 text-sm text-slate-500">Edit your name, logo, description, category, email, and contact number. No cover image or store policies are configured in the current store model.</p>
                    <div className="mt-4 flex flex-wrap gap-2"><Link href="/edit-store" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"><Gear size={16} /> Edit store details</Link><Link href={`/store/${business.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"><Eye size={16} /> Preview public store</Link></div>
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-semibold text-slate-950">Store trust and verification</h3>
                    <div className="mt-3"><VerificationStatus business={business} /></div>
                    {business.verification_status === 'rejected' && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{business.verification_rejection_reason || 'Your request was not approved. You can review the request and feedback.'}</p>}
                    <p className="mt-3 text-sm text-slate-500">Only marketplace administrators can approve verification. Editing store details does not change this status.</p>
                    <Link href="/my-store/verification" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Manage verification <ArrowUpRight size={16} /></Link>
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
                    <h3 className="font-semibold text-slate-950">Visibility</h3>
                    <p className="mt-1 text-sm text-slate-500">{business.is_paused ? 'Your store is paused and its listings are hidden from marketplace search.' : 'Your store and listings are visible to marketplace users.'} Existing conversations remain available while paused.</p>
                    <button type="button" onClick={() => setMenuOpen(true)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Open visibility controls <ArrowUpRight size={16} /></button>
                  </section>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Storefront }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-slate-500">{label}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><Icon size={19} /></span></div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p>
    </article>
  )
}

function SectionHeading({ id, title, description, action }: { id: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 id={id} className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">{description}</p></div>{action}</div>
}

function EmptyState({ title, body, action, href, onAction }: { title: string; body: string; action: string; href: string; onAction?: () => void }) {
  const className = 'mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-xs font-semibold text-blue-800 hover:bg-blue-50'
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Storefront size={24} /></span>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">{body}</p>
      {onAction ? <button type="button" onClick={onAction} className={className}>{action} <ArrowUpRight size={15} /></button> : <Link href={href} className={className}>{action} <ArrowUpRight size={15} /></Link>}
    </div>
  )
}
