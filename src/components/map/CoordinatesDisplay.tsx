'use client'

import { useMapStore, MAP_STYLES } from '@/lib/map-store'

export function CoordinatesDisplay() {
  const { center, zoom, bearing, pitch } = useMapStore()

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-lg border shadow-sm text-xs text-muted-foreground font-mono">
      <span title="Longitude">Lng: {center[0].toFixed(4)}</span>
      <span className="w-px h-3 bg-border" />
      <span title="Latitude">Lat: {center[1].toFixed(4)}</span>
      <span className="w-px h-3 bg-border" />
      <span title="Zoom">Z: {zoom.toFixed(1)}</span>
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
