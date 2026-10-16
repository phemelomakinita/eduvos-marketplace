'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useRef, useState, useSyncExternalStore } from 'react'
import BackButton from '@/components/BackButton'
import type { Business } from '@/lib/types'

export default function ShareStoreCard({ business }: { business: Business }) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)
  const origin = useSyncExternalStore(() => () => {}, () => window.location.origin, () => '')
  const url = origin ? `${origin}/store/${business.id}` : ''

  async function handleCopy() {
    setError('')
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy automatically. Press and hold the link above to copy it.')
    }
  }

  function handleDownload() {
    setError('')
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 720
      canvas.height = 860
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setError('Could not create the image. Try again.')
        return
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 720, 860)
      ctx.drawImage(img, 80, 60, 560, 560)
      let size = 40
      ctx.textAlign = 'center'
      ctx.fillStyle = '#111111'
      while (size > 20) {
        ctx.font = `bold ${size}px Arial`
        if (ctx.measureText(business.name).width <= 640) break
        size -= 2
      }
      ctx.font = `bold ${size}px Arial`
      ctx.fillText(business.name, 360, 710)
      ctx.font = '26px Arial'
      ctx.fillStyle = '#555555'
      ctx.fillText('Scan to visit us on Eduvos Marketplace', 360, 765)
      const slug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'store'
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `${slug}-qr.png`
      a.click()
    }
    img.onerror = () => setError('Could not create the image. Try again.')
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
  }

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <BackButton href="/my-store" label="Back to My Store" />
      <h1 className="text-base font-semibold text-gray-900">Share your store</h1>
      <p className="text-xs text-gray-500 mt-0.5 mb-4">Put this on a poster, a table, or your socials</p>
      <div className="border border-gray-200 rounded-2xl p-5 flex flex-col items-center mb-3 bg-white">
        <div ref={qrRef} className="relative bg-white p-3 rounded-xl">
          {url ? <QRCodeSVG value={url} size={176} level="H" bgColor="#ffffff" fgColor="#111111" /> : <div style={{ width: 176, height: 176 }} />}
          {url && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-9 h-9 rounded-full overflow-hidden border-[3px] border-white bg-blue-700 text-white text-xs font-semibold flex items-center justify-center">
              {business.logo_url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={business.logo_url} className="w-full h-full object-cover" alt="" />
                </>
              ) : business.name.charAt(0).toUpperCase()}
            </div>
          </div>}
        </div>
        <p className="text-sm font-semibold text-gray-900 mt-3 text-center">{business.name}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">Scan to visit us on Eduvos Marketplace</p>
      </div>
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 mb-3">
        <svg width="14" height="14" className="text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
        </svg>
        <span className="text-xs text-gray-600 truncate select-all">{url}</span>
      </div>
      <div className="flex gap-2 mb-3">
        <button type="button" onClick={handleCopy} disabled={!url} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 text-white rounded-md py-2 text-xs font-medium disabled:opacity-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
          </svg>
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
        <button type="button" onClick={handleDownload} disabled={!url} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-800 rounded-md py-2 text-xs font-medium disabled:opacity-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" />
          </svg>
          Download QR
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <p className="text-[10px] text-gray-500 text-center">New students who scan this are asked to sign up first, then land on your store.</p>
    </div>
  )
}
