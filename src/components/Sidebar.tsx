'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Sidebar({ open, onClose, unreadCount = 0 }: { open: boolean; onClose: () => void; unreadCount?: number }) {
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setLoggingOut(true)
    setLogoutError('')
    const { error } = await supabase.auth.signOut()
    if (error) {
      setLogoutError(`Couldn't log out: ${error.message}`)
      setLoggingOut(false)
      return
    }
    router.push('/login')
    router.refresh()
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
          <Link href="/profile" onClick={onClose} className="block border-b border-blue-100 px-5 py-4 text-sm text-slate-800 transition-colors duration-150 hover:bg-blue-50">
            My Profile
          </Link>
          <Link href="/notifications" onClick={onClose} className="flex items-center justify-between border-b border-blue-100 px-5 py-4 text-sm text-slate-800 transition-colors duration-150 hover:bg-blue-50">
            <span>Notifications</span>
            {unreadCount > 0 && <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </Link>
          <Link href="/my-store" onClick={onClose} className="block border-b border-blue-100 px-5 py-4 text-sm text-slate-800 transition-colors duration-150 hover:bg-blue-50">
            My Store
          </Link>
          <Link href="/my-listings" onClick={onClose} className="block border-b border-blue-100 px-5 py-4 text-sm text-slate-800 transition-colors duration-150 hover:bg-blue-50">
            My Listings
          </Link>
          <Link href="/settings" onClick={onClose} className="block border-b border-blue-100 px-5 py-4 text-sm text-slate-800 transition-colors duration-150 hover:bg-blue-50">
            Settings
          </Link>
        </div>

        <div className="border-t border-blue-100">
          {logoutError && <p role="alert" className="px-5 pt-3 text-xs text-blue-700">{logoutError}</p>}
          <button onClick={handleLogout} disabled={loggingOut} className="min-h-11 w-full px-5 py-4 text-left text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-50 disabled:opacity-50">
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </div>
    </>
  )
}
