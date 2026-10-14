import BackButton from '@/components/BackButton'

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href="/my-store" label="Back to My Store" />
      <h1 className="text-base font-semibold text-gray-900 mb-2">Wallet</h1>
      <p className="text-xs text-gray-400">Wallet is coming soon.</p>
    </div>
  )
}
