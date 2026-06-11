'use client'

import { useState, useCallback } from 'react'
import { Crosshair, MousePointer2, Copy, Check } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

/** Convert decimal degrees to DMS string */
function toDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal)
  const deg = Math.floor(abs)
  const minFloat = (abs - deg) * 60
  const min = Math.floor(minFloat)
  const sec = ((minFloat - min) * 60).toFixed(1)
  const dir = isLat
    ? decimal >= 0 ? 'N' : 'S'
    : decimal >= 0 ? 'E' : 'W'
  return `${deg}°${min}'${sec}"${dir}`
}

/** Calculate UTM zone from longitude */
function getUtmZone(lng: number): number {
  return Math.floor((lng + 180) / 6) + 1
}

export function CoordinatesDisplay() {
  const { center, zoom, bearing, pitch } = useMapStore()
  const [copied, setCopied] = useState(false)
  const [copiedDms, setCopiedDms] = useState(false)

  const lng = center[0]
  const lat = center[1]
  const utmZone = getUtmZone(lng)
  const showUtm = zoom >= 10

  const handleCopy = useCallback(() => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [lat, lng])

  const handleCopyDms = useCallback(() => {
    const text = `${toDMS(lat, true)}, ${toDMS(lng, false)}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedDms(true)
      setTimeout(() => setCopiedDms(false), 1500)
    })
  }, [lat, lng])

  return (
    <div className="floating-panel flex items-center gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-lg text-[11px] text-muted-foreground font-mono tabular-nums">
      <MousePointer2 className="h-3 w-3 text-primary/60" />
      <span title="Longitude">{lng.toFixed(4)}</span>
      <span className="w-px h-3 bg-border" />
      <span title="Latitude">{lat.toFixed(4)}</span>
      <span className="w-px h-3 bg-border" />
      <span title="Zoom" className="text-primary/80 font-semibold">
        {zoom.toFixed(1)}z
      </span>
      {showUtm && (
        <>
          <span className="w-px h-3 bg-border" />
          <span title="UTM Zone" className="text-amber-600 dark:text-amber-400 font-semibold">
            UTM {utmZone}
          </span>
        </>
      )}
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
        aria-label="Copy coordinates as decimal"
        title="Copy as decimal"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
      <button
        onClick={handleCopyDms}
        className="p-0.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Copy coordinates as DMS"
        title="Copy as DMS"
      >
        {copiedDms ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Crosshair className="h-3 w-3" />
        )}
      </button>
    </div>
  )
}
