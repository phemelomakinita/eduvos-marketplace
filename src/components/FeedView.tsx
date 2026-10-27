'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CATEGORIES, getCategoryToneClasses } from '@/lib/categories'
import { CAMPUSES } from '@/lib/campuses'
import CategoryIllustration from '@/components/CategoryIllustration'
import ListingCard from '@/components/ListingCard'
import MarketplaceNavigation from '@/components/MarketplaceNavigation'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/types'
import { List, MagnifyingGlass, ShieldCheck, SlidersHorizontal, SquaresFour } from '@phosphor-icons/react/ssr'

type FeedListing = Omit<Listing, 'businesses'> & {
  businesses?: {
    is_verified?: boolean | null
    is_paused?: boolean | null
    name?: string | null
  } | {
    is_verified?: boolean | null
    is_paused?: boolean | null
    name?: string | null
  }[] | null
  profiles?: { full_name?: string | null } | null
}

export default function FeedView({
  firstName,
  listings,
  userId,
  unreadCount,
  isAdmin = false,
  initialSearch = '',
  initialCategory = 'All',
}: {
  firstName: string
  listings: FeedListing[]
  userId: string
  unreadCount: number
  isAdmin?: boolean
  initialSearch?: string
  initialCategory?: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>(() =>
    initialCategory === 'All' || CATEGORIES.some((category) => category.value === initialCategory)
      ? initialCategory
      : 'All',
  )
  const [search, setSearch] = useState(initialSearch)
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest')
  const [campus, setCampus] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const channel = supabase.channel(`feed-notifications-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => router.refresh())
      .subscribe()
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') router.refresh()
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [supabase, router, userId])

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const minimum = minPrice === '' ? null : Number(minPrice)
    const maximum = maxPrice === '' ? null : Number(maxPrice)
    const matches = listings.filter((item) => {
      const business = Array.isArray(item.businesses) ? item.businesses[0] : item.businesses
      const searchable = [item.title, item.description, item.category, item.campus, business?.name]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()

      return (!query || searchable.includes(query))
        && (activeCategory === 'All' || item.category === activeCategory)
        && (!campus || item.campus === campus)
        && (!verifiedOnly || Boolean(business?.is_verified))
        && (minimum === null || (item.price !== null && item.price >= minimum))
        && (maximum === null || (item.price !== null && item.price <= maximum))
    })

    return matches.sort((first, second) => {
      if (sort === 'price-asc' || sort === 'price-desc') {
        if (first.price === null && second.price === null) return 0
        if (first.price === null) return 1
        if (second.price === null) return -1
        return sort === 'price-asc' ? first.price - second.price : second.price - first.price
      }
      return new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
    })
  }, [listings, search, activeCategory, campus, verifiedOnly, minPrice, maxPrice, sort])

  const activeFilterCount = Number(Boolean(campus)) + Number(verifiedOnly) + Number(Boolean(minPrice)) + Number(Boolean(maxPrice))
  const activeCategoryDetails = CATEGORIES.find((category) => category.value === activeCategory)
  const feedBackground = activeCategoryDetails
    ? getCategoryToneClasses(activeCategoryDetails.tone).canvas
    : 'bg-white'

  function clearFilters() {
    setSearch('')
    setActiveCategory('All')
    setCampus('')
    setMinPrice('')
    setMaxPrice('')
    setVerifiedOnly(false)
    setSort('newest')
  }

  return (
    <div className={`flex h-dvh w-full max-w-full flex-col overflow-x-hidden transition-colors duration-150 ${feedBackground}`}>

      {/* TOP BAR — fixed */}
      <div className="flex-shrink-0 border-b border-blue-100 bg-white px-4 py-3">
        <div className="relative mx-auto flex w-full max-w-5xl items-center justify-between">
          <span className="text-sm font-medium tracking-tight text-slate-900 sm:text-base">Welcome, {firstName}</span>
          {isAdmin && (
            <Link href="/admin" className="absolute left-1/2 inline-flex min-h-9 -translate-x-1/2 items-center gap-1.5 border border-blue-200 px-3 text-xs font-medium text-blue-800 transition-colors duration-150 hover:bg-blue-50">
              <ShieldCheck size={16} aria-hidden="true" />
              Admin
            </Link>
          )}
          <button onClick={() => setSidebarOpen(true)} aria-label={`Menu${unreadCount > 0 ? `, ${unreadCount} unread notifications` : ''}`} className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
            <List size={24} aria-hidden="true" />
            {unreadCount > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600" />}
          </button>
        </div>
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={unreadCount} />

      {/* SCROLLABLE CONTENT */}
      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 pb-24 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">

        <div className="mb-4 flex min-h-12 items-center gap-3 rounded-lg border border-blue-100 bg-white px-4 py-2 text-slate-400 transition-colors duration-150 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <MagnifyingGlass size={20} aria-hidden="true" />
          <label htmlFor="feed-search" className="sr-only">Search listings</label>
          <input
            id="feed-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, categories, campus..."
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
          />
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
            className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-semibold text-blue-800 transition-colors duration-150 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </button>
        </div>

        {filtersOpen && (
          <div className="mb-5 grid gap-4 rounded-xl border border-blue-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-medium text-slate-700">
              Campus
              <select value={campus} onChange={(event) => setCampus(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800">
                <option value="">All campuses</option>
                {CAMPUSES.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-700">
              Sort by
              <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800">
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
            <fieldset className="text-xs font-medium text-slate-700">
              <legend>Price range (R)</legend>
              <div className="mt-1.5 flex gap-2">
                <input type="number" min="0" inputMode="decimal" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} aria-label="Minimum price" placeholder="Min" className="w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal" />
                <input type="number" min="0" inputMode="decimal" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} aria-label="Maximum price" placeholder="Max" className="w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal" />
              </div>
            </fieldset>
            <div className="flex items-end justify-between gap-3">
              <label className="flex min-h-10 items-center gap-2 text-xs font-medium text-slate-700">
                <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-blue-700" />
                Verified sellers only
              </label>
              <button type="button" onClick={clearFilters} className="min-h-10 text-xs font-semibold text-blue-700 hover:text-blue-900">Clear all</button>
            </div>
          </div>
        )}

        <nav aria-label="Browse by category" className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('All')}
            aria-pressed={activeCategory === 'All'}
            className={`flex items-center gap-2 whitespace-nowrap border px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
              activeCategory === 'All' ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-100 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            <SquaresFour size={16} weight={activeCategory === 'All' ? 'fill' : 'regular'} aria-hidden="true" />
            All listings
          </button>
          {CATEGORIES.map((c) => {
            const tone = getCategoryToneClasses(c.tone)
            const selected = activeCategory === c.value
            return (
              <button
                key={c.value}
                onClick={() => setActiveCategory(c.value)}
                aria-pressed={selected}
                className={`flex min-w-20 flex-col items-center gap-1 border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                  selected ? 'border-blue-500 bg-white text-blue-900 ring-1 ring-blue-200' : `border-blue-100 bg-white text-slate-700 hover:border-blue-300 ${tone.soft.split(' ')[0]}`
                }`}
              >
                <CategoryIllustration category={c.value} className="h-10 w-10" />
                {c.value}
              </button>
            )
          })}
        </nav>

        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Discover</h1>
            <p className="mt-1 text-sm text-slate-500">Find something great from your campus community.</p>
          </div>
          <span className="shrink-0 text-xs font-medium text-slate-400">{filtered.length} {filtered.length === 1 ? 'listing' : 'listings'}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
  {filtered.length === 0 && (
    <div className="col-span-full rounded-xl border border-dashed border-blue-200 bg-white px-4 py-12 text-center">
      <p className="text-sm font-semibold text-slate-800">No listings match those filters</p>
      <p className="mt-1 text-sm text-slate-500">Try another search or clear the filters.</p>
      <button type="button" onClick={clearFilters} className="mt-4 min-h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Clear filters</button>
    </div>
  )}
  {filtered.map((item) => <ListingCard key={item.id} listing={item} />)}
</div>
          </div>

        </div>

      <MarketplaceNavigation active="discover" />

    </div>
  )
}
