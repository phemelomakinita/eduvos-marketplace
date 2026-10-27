'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import MarketplaceLogo from '@/components/MarketplaceLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail.endsWith('@vossie.net')) {
      setError('Enter your Eduvos vossie.net account email address.')
      return
    }
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <MarketplaceLogo />
        {sent ? (
          <>
            <h1 className="mb-2 text-xl font-semibold tracking-tight text-slate-950">Check your email</h1>
            <p role="status" className="text-sm leading-6 text-slate-600">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            </p>
            <Link href="/login" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong">
              Back to log in
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-xl font-semibold tracking-tight text-slate-950">Reset your password</h1>
            <p className="mb-5 text-sm leading-6 text-slate-600">Enter your account email and we&apos;ll send you a secure reset link.</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mb-4 min-h-12 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
              />
              {error && <p role="alert" className="mb-3 text-sm text-blue-600">{error}</p>}
              <button type="submit" disabled={loading} className="mb-4 min-h-12 w-full rounded-xl bg-brand py-2 font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-50">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <p className="text-center text-sm text-slate-600">
              Remembered your password? <Link href="/login" className="font-semibold text-brand hover:text-brand-strong">Log in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
