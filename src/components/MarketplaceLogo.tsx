// Reusable store icon + wordmark, used on both auth screens
export default function MarketplaceLogo({ className = 'mb-6' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <svg
          width="26"
          height="26"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12 8 5l5 4m6 0 5-4 3 7v4a11 11 0 0 1-22 0v-4Z" />
          <path d="M8 16a4 4 0 0 1 8 0 4 4 0 0 1 8 0" />
          <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
          <circle cx="20" cy="15" r="1" fill="currentColor" stroke="none" />
          <path d="m14 19 2-2 2 2-2 2-2-2Z" fill="currentColor" stroke="none" />
          <path d="M12 27h8m-4-4v4" />
        </svg>
      </div>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight text-slate-950 sm:text-base">Eduvos Marketplace</span>
        <span className="mt-0.5 block text-[10px] font-medium tracking-wide text-slate-500">Your Campus. Your Marketplace.</span>
      </span>
    </div>
  )
}