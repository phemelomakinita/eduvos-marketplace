import Link from 'next/link'

export default function MessagesTabs({ active }: { active: 'messages' | 'educhat' }) {
  return (
    <div className="flex border-b border-gray-200">
      <Link href="/messages" className={`flex-1 text-center text-sm py-2.5 border-b-2 ${active === 'messages' ? 'font-semibold text-blue-700 border-blue-700' : 'text-gray-500 border-transparent'}`}>
        My Messages
      </Link>
      <Link href="/messages/educhat" className={`flex-1 text-center text-sm py-2.5 border-b-2 ${active === 'educhat' ? 'font-semibold text-blue-700 border-blue-700' : 'text-gray-500 border-transparent'}`}>
        Educhat
      </Link>
    </div>
  )
}
