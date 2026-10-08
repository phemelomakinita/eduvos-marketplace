import BackButton from '@/components/BackButton'

export default function BuyPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />
      <h1 className="text-base font-semibold text-gray-900 mb-2">Buy product</h1>
      <p className="text-xs text-gray-400">Checkout is coming soon.</p>
    </div>
  )
}