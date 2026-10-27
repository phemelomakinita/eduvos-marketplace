'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MarketplaceLogo from '@/components/MarketplaceLogo'
import { safeNext, NEXT_STORAGE_KEY } from '@/lib/redirects'

// all 12 real Eduvos campus locations
const CAMPUSES = [
  'Bedfordview',
  'Vaal (Vanderbijlpark)',
  'Midrand',
  'Pretoria',
  'Potchefstroom',
  'Mbombela (Nelspruit)',
  'Durban (Umhlanga)',
  'East London',
  'Nelson Mandela Bay (Gqeberha)',
  'Tyger Valley (Bellville)',
  'Mowbray (Cape Town/Claremont)',
  'Bloemfontein',
]

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [campus, setCampus] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false) // shown after successful signup

  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail.endsWith('@vossie.net')) {
      setError('Use your valid Eduvos vossie.net email address.')
      return
    }
    if (password.length < 8 || !/[a-z]/i.test(password) || !/\d/.test(password)) {
      setError('Your password must be at least 8 characters and include a letter and a number.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: fullName.trim(), campus },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const next = safeNext(new URLSearchParams(window.location.search).get('next'))
    if (next) {
      try {
        window.localStorage.setItem(NEXT_STORAGE_KEY, next)
      } catch {
        setError('Your browser could not save the sign-in redirect. You can continue to the marketplace after signing in.')
      }
    }

    if (data.session && data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName.trim(),
        campus,
      })
      if (profileError && profileError.code !== '23505') {
        setError(`Your account was created, but we couldn't finish setting up your profile: ${profileError.message}`)
        setLoading(false)
        return
      }
      router.push(next ?? '/feed')
      router.refresh()
      return
    }

    if (!data.user) {
      setError('Your account request completed, but we could not retrieve your account details. Please try logging in.')
      setLoading(false)
      return
    }

    setCheckEmail(true)
    setLoading(false)
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-900 mb-2">Account created!</p>
          <p className="text-sm text-gray-600">
            If this address is eligible, we&apos;ve sent a confirmation link to <strong>{email}</strong>. Verify your email, then log in.
          </p>
          <Link href="/login" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong">
            Continue to log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <MarketplaceLogo />
        <h1 className="mb-5 text-xl font-semibold tracking-tight text-slate-950">Create your account</h1>

        <form onSubmit={handleSignup}>
          <label htmlFor="full-name" className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
          <input
            id="full-name"
            type="text"
            required
            autoComplete="name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mb-4 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
          />

          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Eduvos email address</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@vossie.net"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
          />
          <p className="-mt-3 mb-4 text-xs text-slate-500">Use your valid @vossie.net student email address.</p>

          <label htmlFor="campus" className="mb-1 block text-sm font-medium text-slate-700">Campus</label>
          <select
            id="campus"
            required
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="mb-4 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
          >
            <option value="">Select your campus</option>
            {CAMPUSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative mb-2">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="password-requirements"
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 pr-20 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
            />
            <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 text-xs font-semibold text-brand">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p id="password-requirements" className="mb-4 text-xs text-slate-500">Use at least 8 characters, including a letter and a number.</p>

          <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
          <div className="relative mb-4">
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 pr-20 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft-strong"
            />
            <button type="button" onClick={() => setShowConfirmPassword((shown) => !shown)} aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} className="absolute inset-y-0 right-3 text-xs font-semibold text-brand">
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && <p role="alert" className="mb-3 text-sm text-blue-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mb-4 min-h-12 w-full rounded-xl bg-brand py-2 font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand hover:text-brand-strong">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
