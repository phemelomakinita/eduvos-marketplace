import BackButton from '@/components/BackButton'

export default function MessagePage() {
  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton history label="Back" />
      <h1 className="text-base font-semibold text-gray-900 mb-2">Message</h1>
      <p className="text-xs text-gray-400">Chat is coming in the next step.</p>
    </div>
  )
}
