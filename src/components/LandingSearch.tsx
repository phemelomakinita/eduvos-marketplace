'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react/ssr'

export default function LandingSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const feedUrl = `/feed${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`
    router.push(`/login?next=${encodeURIComponent(feedUrl)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-blue-100 bg-white p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <MagnifyingGlass size={20} className="ml-2 shrink-0 text-slate-400" aria-hidden="true" />
      <label htmlFor="landing-search" className="sr-only">Search the marketplace</label>
      <input
        id="landing-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="What are you looking for?"
        className="min-h-11 min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
      />
      <button type="submit" className="min-h-11 shrink-0 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        Search
      </button>
    </form>
  )
}
