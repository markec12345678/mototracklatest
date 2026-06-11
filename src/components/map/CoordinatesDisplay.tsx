'use client'

import { useState, useCallback } from 'react'
import { Crosshair, MousePointer2, Copy, Check } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

export function CoordinatesDisplay() {
  const { center, zoom, bearing, pitch } = useMapStore()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const text = `${center[1].toFixed(6)}, ${center[0].toFixed(6)}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [center])

  return (
    <div className="floating-panel flex items-center gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-lg text-[11px] text-muted-foreground font-mono tabular-nums">
      <MousePointer2 className="h-3 w-3 text-primary/60" />
      <span title="Longitude">{center[0].toFixed(4)}</span>
      <span className="w-px h-3 bg-border" />
      <span title="Latitude">{center[1].toFixed(4)}</span>
      <span className="w-px h-3 bg-border" />
      <span title="Zoom" className="text-primary/80 font-semibold">
        {zoom.toFixed(1)}z
      </span>
      {bearing !== 0 && (
        <>
          <span className="w-px h-3 bg-border" />
          <span title="Bearing">{bearing.toFixed(0)}°</span>
        </>
      )}
      {pitch !== 0 && (
        <>
          <span className="w-px h-3 bg-border" />
          <span title="Pitch">{pitch.toFixed(0)}°</span>
        </>
      )}
      <button
        onClick={handleCopy}
        className="ml-1 p-0.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Copy coordinates"
        title="Copy coordinates"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  )
}
