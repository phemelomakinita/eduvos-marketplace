'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import MarketplaceLogo from '@/components/MarketplaceLogo'

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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false) // shown after successful signup

  const supabase = createClient()

    async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, campus },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // profile row is created automatically by the database trigger —
    // nothing else to do here except confirm success to the user
    setLoading(false)
    setCheckEmail(true)
  }

    if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm border border-gray-200 rounded-xl p-6 bg-white text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-900 mb-2">Account created!</p>
          <p className="text-sm text-gray-600">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Verify your email, then log in.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm border border-gray-200 rounded-xl p-6 bg-white">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-md border-2 border-blue-700 flex items-center justify-center bg-blue-50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l18 0" />
              <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1l-2 -4h-14l-2 4" />
              <path d="M5 21l0 -10.15" />
              <path d="M19 21l0 -10.15" />
              <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">Create Account</span>
        </div>

        <form onSubmit={handleSignup}>
          <label className="block text-sm text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm text-gray-900 bg-white"
          />

          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            placeholder="example@vossie.net"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm text-gray-900 bg-white"
          />

          <label className="block text-sm text-gray-700 mb-1">Campus</label>
          <select
            required
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm text-gray-900 bg-white"
          >
            <option value="">Select your campus</option>
            {CAMPUSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="block text-sm text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm text-gray-900 bg-white"
          />

          <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm text-gray-900 bg-white"
          />

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a5f] text-white rounded-md py-2 font-medium mb-4 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-700 font-medium">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}