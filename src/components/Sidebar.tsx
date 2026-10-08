'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* dimmed backdrop, click to close */}
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/30 z-40" />
      )}

      {/* slide-in panel from the right */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white z-50 flex flex-col
          transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex-1 py-4">
          <Link href="/profile" onClick={onClose} className="block px-5 py-4 text-sm text-gray-800 border-b border-gray-100">
            My Profile
          </Link>
          <Link href="/my-store" onClick={onClose} className="block px-5 py-4 text-sm text-gray-800 border-b border-gray-100">
            My Store
          </Link>
          <Link href="/my-listings" onClick={onClose} className="block px-5 py-4 text-sm text-gray-800 border-b border-gray-100">
            My Listings
          </Link>
          <Link href="/settings" onClick={onClose} className="block px-5 py-4 text-sm text-gray-800 border-b border-gray-100">
            Settings
          </Link>
        </div>

        <button onClick={handleLogout} className="border-t border-gray-200 px-5 py-4 text-left text-red-600 text-sm font-medium">
          Log out
        </button>
      </div>
    </>
  )
}