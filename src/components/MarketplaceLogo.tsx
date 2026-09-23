// Reusable store icon + wordmark, used on both auth screens
export default function MarketplaceLogo() {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="w-10 h-10 rounded-md border-2 border-blue-700 flex items-center justify-center bg-blue-50">
        {/* store/stall icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21l18 0" />
          <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1l-2 -4h-14l-2 4" />
          <path d="M5 21l0 -10.15" />
          <path d="M19 21l0 -10.15" />
          <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
        </svg>
      </div>
      <span className="text-lg font-semibold text-gray-900">Eduvos Marketplace</span>
    </div>
  )
}