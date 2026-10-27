'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MarketplaceLogo from '@/components/MarketplaceLogo'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password.length < 8 || !/[a-z]/i.test(password) || !/\d/.test(password)) {
      setError('Your password must be at least 8 characters and include a letter and a number.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  async function handleContinue() {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(`Your password was changed, but we couldn't safely end the recovery session: ${signOutError.message}`)
      return
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <MarketplaceLogo />
        {success ? (
          <>
            <h1 className="mb-2 text-xl font-semibold tracking-tight text-slate-950">Password updated</h1>
            <p className="mb-5 text-sm leading-6 text-slate-600">Your password has been changed. Log in with your new password to continue.</p>
            {error && <p role="alert" className="mb-3 text-sm text-blue-600">{error}</p>}
            <button type="button" onClick={handleContinue} className="min-h-12 w-full rounded-xl bg-brand py-2 font-semibold text-white hover:bg-brand-strong">Continue to log in</button>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-xl font-semibold tracking-tight text-slate-950">Choose a new password</h1>
            <p className="mb-5 text-sm leading-6 text-slate-600">Use at least 8 characters, including a letter and a number.</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">New password</label>
              <div className="relative mb-4">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 px-4 py-2 pr-20 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
                />
                <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 text-xs font-semibold text-brand">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mb-4 min-h-12 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
              />
              {error && <p role="alert" className="mb-3 text-sm text-blue-600">{error}</p>}
              <button type="submit" disabled={loading} className="mb-4 min-h-12 w-full rounded-xl bg-brand py-2 font-semibold text-white hover:bg-brand-strong disabled:opacity-50">
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
            <p className="text-center text-sm text-slate-600"><Link href="/login" className="font-semibold text-brand hover:text-brand-strong">Back to log in</Link></p>
          </>
        )}
      </div>
    </main>
  )
}
