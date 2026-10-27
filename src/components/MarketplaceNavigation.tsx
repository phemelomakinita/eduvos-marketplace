import Link from 'next/link'
import { CalendarBlank, ChatCircle, SquaresFour, Plus } from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'

type NavigationItem = 'discover' | 'messages' | 'events' | 'sell'

const items: { id: NavigationItem; href: string; label: string; icon: Icon }[] = [
  { id: 'discover', href: '/feed', label: 'Discover', icon: SquaresFour },
  { id: 'messages', href: '/messages', label: 'Messages', icon: ChatCircle },
  { id: 'sell', href: '/post-listing', label: 'Sell', icon: Plus },
  { id: 'events', href: '/events', label: 'Events', icon: CalendarBlank },
]

export default function MarketplaceNavigation({ active }: { active?: NavigationItem }) {
  return (
    <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-blue-100 bg-white px-3 pt-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      <div className="mx-auto grid w-full max-w-xl grid-cols-4">
        {items.map((item) => {
          const selected = active === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={selected ? 'page' : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                selected ? 'font-semibold text-blue-700' : 'font-medium text-slate-500 hover:text-blue-800'
              }`}
            >
              <item.icon size={24} weight={selected ? 'fill' : 'regular'} aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
