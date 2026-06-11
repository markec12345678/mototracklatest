'use client'

import { useMapStore } from '@/lib/map-store'
import { Compass } from 'lucide-react'

export function CompassIndicator() {
  const { bearing } = useMapStore()

  if (bearing === 0) return null

  return (
    <button
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-xl border shadow-md text-xs text-muted-foreground hover:text-foreground hover:bg-background transition-all"
      onClick={() => {
        const map = (window as unknown as Record<string, unknown>).__mapResetNorth
        if (typeof map === 'function') map()
      }}
      title="Click to reset north"
    >
      <Compass
        className="h-3.5 w-3.5 text-primary transition-transform"
        style={{ transform: `rotate(${-bearing}deg)` }}
      />
      <span className="font-mono">{Math.round(((bearing % 360) + 360) % 360)}°</span>
    </button>
  )
}
