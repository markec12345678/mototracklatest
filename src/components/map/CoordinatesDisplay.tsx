'use client'

import { useState, useCallback } from 'react'
import { Crosshair, Copy, Check, ChevronRight } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { toDMS, toUTM, toMGRS } from '@/lib/coordinates-utils'

type CoordFormat = 'decimal' | 'dms' | 'utm' | 'mgrs'

const FORMAT_ORDER: CoordFormat[] = ['decimal', 'dms', 'utm', 'mgrs']
const FORMAT_LABELS: Record<CoordFormat, string> = {
  decimal: 'DD',
  dms: 'DMS',
  utm: 'UTM',
  mgrs: 'MGRS',
}

export function CoordinatesDisplay() {
  const { center, zoom, bearing, pitch } = useMapStore()
  const [copied, setCopied] = useState(false)
  const [formatIndex, setFormatIndex] = useState(0)
  const format = FORMAT_ORDER[formatIndex]

  const lng = center[0]
  const lat = center[1]

  const getFormattedCoords = useCallback(() => {
    switch (format) {
      case 'decimal':
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      case 'dms':
        return `${toDMS(lat, true)} ${toDMS(lng, false)}`
      case 'utm':
        return toUTM(lat, lng)
      case 'mgrs':
        return toMGRS(lat, lng)
      default:
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }, [format, lat, lng])

  const handleCopy = useCallback(() => {
    if (typeof navigator === 'undefined') return
    const text = getFormattedCoords()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [getFormattedCoords])

  const cycleFormat = useCallback(() => {
    setFormatIndex((prev) => (prev + 1) % FORMAT_ORDER.length)
  }, [])

  return (
    <div
      className="floating-panel flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-lg text-[11px] text-muted-foreground font-mono tabular-nums select-none hover:border-primary/30 hover:bg-background/95 transition-all duration-200"
      role="status"
      aria-live="polite"
      aria-label={`Coordinates: ${lng.toFixed(4)} longitude, ${lat.toFixed(4)} latitude, zoom ${zoom.toFixed(1)}`}
    >
      <Crosshair className="h-3 w-3 text-primary/60 shrink-0" />
      <span
        className="cursor-pointer hover:text-foreground transition-colors"
        onClick={cycleFormat}
        title="Click to change format"
      >
        {getFormattedCoords()}
      </span>
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
      <span className="w-px h-3 bg-border" />
      <button
        onClick={cycleFormat}
        className="flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-accent transition-colors text-amber-600 dark:text-amber-400 hover:text-foreground"
        aria-label="Cycle coordinate format"
        title={`Format: ${FORMAT_LABELS[format]} (click to change)`}
      >
        {FORMAT_LABELS[format]}
        <ChevronRight className="h-2.5 w-2.5" />
      </button>
      <button
        onClick={handleCopy}
        className="p-0.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
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
