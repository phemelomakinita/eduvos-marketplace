'use client'

import { useState } from 'react'

export default function BrandLogo({ brand, height = 20 }: { brand: 'payshap' | 'paxi'; height?: number }) {
  const [failed, setFailed] = useState(false)
  const name = brand === 'payshap' ? 'PayShap' : 'PAXI'
  if (failed) return <span className="border border-gray-300 rounded px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 flex-shrink-0">{name}</span>
  return <img src={brand === 'payshap' ? '/payshap-logo.png' : '/paxi-logo.png'} alt={name} style={{ height }} className="w-auto object-contain flex-shrink-0" onError={() => setFailed(true)} />
}
