'use client'

import { Crosshair, MousePointer2 } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

export function CoordinatesDisplay() {
  const { center, zoom, bearing, pitch } = useMapStore()

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-lg text-[11px] text-muted-foreground font-mono">
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
    </div>
  )
}
