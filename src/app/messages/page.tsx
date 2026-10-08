'use client'

import { useState } from 'react'
import BackButton from '@/components/BackButton'

export default function MessagesPage() {
  const [tab, setTab] = useState<'messages' | 'educhat'>('messages')

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton />

      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setTab('messages')}
          className={`flex-1 text-sm font-medium py-2 border-b-2 ${
            tab === 'messages' ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500'
          }`}
        >
          My Messages
        </button>
        <button
          onClick={() => setTab('educhat')}
          className={`flex-1 text-sm font-medium py-2 border-b-2 ${
            tab === 'educhat' ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500'
          }`}
        >
          Educhat
        </button>
      </div>

      {tab === 'messages' ? (
        <p className="text-xs text-gray-400 text-center py-10">
          Seller conversations will appear here — coming soon.
        </p>
      ) : (
        <p className="text-xs text-gray-400 text-center py-10">
          Campus-wide chat — coming soon (Supabase realtime).
        </p>
      )}
    </div>
  )
}