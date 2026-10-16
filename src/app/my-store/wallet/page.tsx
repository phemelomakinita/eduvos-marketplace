import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/BackButton'

export const dynamic = 'force-dynamic'

const BALANCE = 'R1,250.00'
const ESCROW = 'R480.00'
const EARNED = 'R3,920.00'
const ACTIVITY = [
  { title: 'Winter Jacket', note: 'Held in escrow', amount: '+R180', negative: false },
  { title: 'Sneakers', note: 'Released', amount: '+R209', negative: false },
  { title: 'Platform fee', note: '5% on Sneakers', amount: '-R11', negative: true },
]

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!business) redirect('/register-business')

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href="/my-store" label="Back to My Store" />
      <h1 className="text-base font-semibold text-gray-900 mb-3">Wallet</h1>
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-4">
        <svg width="14" height="14" className="text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" />
        </svg>
        <span className="text-xs text-gray-600">Demo data. No real money moves.</span>
      </div>
      <div className="border border-gray-200 rounded-2xl p-4 mb-3">
        <p className="text-[11px] text-gray-500">Available balance</p>
        <p className="text-2xl font-semibold text-gray-900 mt-0.5">{BALANCE}</p>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 border border-gray-200 rounded-xl p-3">
          <p className="text-[10px] text-gray-500">In escrow</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{ESCROW}</p>
        </div>
        <div className="flex-1 border border-gray-200 rounded-xl p-3">
          <p className="text-[10px] text-gray-500">Total earned</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{EARNED}</p>
        </div>
      </div>
      <button disabled className="w-full bg-gray-100 text-gray-400 rounded-md py-2 text-sm font-medium mb-5">Withdraw (coming soon)</button>
      <p className="text-sm font-semibold text-gray-900 mb-2">Recent activity</p>
      <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
        {ACTIVITY.map(({ title, note, amount, negative }) => (
          <div key={title} className="flex items-center justify-between px-3 py-2.5">
            <div>
              <p className="text-xs text-gray-900">{title}</p>
              <p className="text-[10px] text-gray-500">{note}</p>
            </div>
            <span className={`text-xs font-semibold ${negative ? 'text-red-600' : 'text-gray-900'}`}>{amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
