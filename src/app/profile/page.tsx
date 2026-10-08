// src/app/profile/page.tsx
import BackButton from '@/components/BackButton'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />
      <h1 className="text-base font-semibold text-gray-900 mb-2">My Profile</h1>
      <p className="text-xs text-gray-400">Coming soon.</p>
    </div>
  )
}