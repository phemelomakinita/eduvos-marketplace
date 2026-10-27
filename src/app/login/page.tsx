'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import MarketplaceLogo from '@/components/MarketplaceLogo'
import { safeNext, NEXT_STORAGE_KEY } from '@/lib/redirects'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // handles the actual sign-in call to Supabase
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setVerificationSent(false)
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })

    if (error) {
      if (error.code === 'email_not_confirmed' || error.message.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email before logging in. You can request another confirmation email below.')
        setNeedsVerification(true)
      } else if (error.code === 'invalid_credentials') {
        setError('That email and password combination was not recognized. Check your details or reset your password.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    const { data: profile, error: profileLookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle()
    if (profileLookupError) {
      setError(`You are signed in, but we couldn't check your student profile: ${profileLookupError.message}`)
      setLoading(false)
      return
    }
    if (!profile) {
      const { error: profileInsertError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: typeof data.user.user_metadata.full_name === 'string' ? data.user.user_metadata.full_name : null,
        campus: typeof data.user.user_metadata.campus === 'string' ? data.user.user_metadata.campus : null,
      })
      if (profileInsertError) {
        setError(`You are signed in, but we couldn't finish setting up your student profile: ${profileInsertError.message}`)
        setLoading(false)
        return
      }
    }

    let target: string | null = safeNext(new URLSearchParams(window.location.search).get('next'))
    try {
      if (!target) target = safeNext(window.localStorage.getItem(NEXT_STORAGE_KEY))
      window.localStorage.removeItem(NEXT_STORAGE_KEY)
    } catch {}
    router.push(target ?? '/feed')
    router.refresh()
  }

  async function resendVerification() {
    setError('')
    setLoading(true)
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    })
    if (resendError) {
      setError(resendError.message)
    } else {
      setVerificationSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <MarketplaceLogo />

        <form onSubmit={handleLogin}>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="example@vossie.net"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 min-h-12 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
          />

          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative mb-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-200 px-4 py-2 pr-20 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
            />
            <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 text-xs font-semibold text-brand">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="text-right mb-4">
            <Link href="/forgot-password" className="text-sm font-medium text-brand hover:text-brand-strong">
              Forgot password?
            </Link>
          </div>

          {error && <p role="alert" className="mb-3 text-sm text-blue-600">{error}</p>}
          {needsVerification && (
            <button type="button" onClick={resendVerification} disabled={loading || !email.trim()} className="mb-3 text-left text-sm font-semibold text-brand hover:text-brand-strong disabled:opacity-50">
              Resend verification email
            </button>
          )}
          {verificationSent && <p role="status" className="mb-3 text-sm text-green-700">If the address has an unverified account, a new confirmation email is on its way.</p>}

          <button
            type="submit"
            disabled={loading}
            className="mb-4 min-h-12 w-full rounded-xl bg-brand py-2 font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-brand hover:text-brand-strong"
              onClick={(e) => {
                const next = safeNext(new URLSearchParams(window.location.search).get('next'))
                if (next) { e.preventDefault(); router.push(`/signup?next=${encodeURIComponent(next)}`) }
              }}
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
