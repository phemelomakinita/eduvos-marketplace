import Link from 'next/link'

export default function MessagesTabs({ active }: { active: 'messages' | 'educhat' }) {
  return (
    <nav aria-label="Messaging sections" className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
      <Link href="/messages" aria-current={active === 'messages' ? 'page' : undefined} className={`rounded-xl px-3 py-2.5 text-center text-sm transition-colors ${active === 'messages' ? 'bg-white font-semibold text-blue-800 shadow-sm' : 'font-medium text-slate-500 hover:text-slate-800'}`}>
        Direct messages
      </Link>
      <Link href="/messages/educhat" aria-current={active === 'educhat' ? 'page' : undefined} className={`rounded-xl px-3 py-2.5 text-center text-sm transition-colors ${active === 'educhat' ? 'bg-white font-semibold text-blue-800 shadow-sm' : 'font-medium text-slate-500 hover:text-slate-800'}`}>
        Campus chat
      </Link>
    </nav>
  )
}
