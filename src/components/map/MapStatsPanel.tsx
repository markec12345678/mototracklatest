'use client'

import { useMapStore } from '@/lib/map-store'
import { MapPin, Layers, ZoomIn, Compass, RotateCw } from 'lucide-react'

function getBearingDirection(bearing: number): string {
  // Normalize bearing to 0-360
  const normalized = ((bearing % 360) + 360) % 360
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(normalized / 22.5) % 16
  return dirs[index]
}

export function MapStatsPanel() {
  const { savedLocations, zoom, currentStyle, bearing, pitch } = useMapStore()

  const stats = [
    {
      icon: <MapPin className="h-3 w-3" />,
      label: 'Places',
      value: savedLocations.length,
      color: 'text-emerald-500',
      visible: true,
    },
    {
      icon: <Layers className="h-3 w-3" />,
      label: 'Style',
      value: currentStyle.name,
      color: 'text-amber-500',
      visible: true,
    },
    {
      icon: <ZoomIn className="h-3 w-3" />,
      label: 'Zoom',
      value: zoom.toFixed(1),
      color: 'text-cyan-500',
      visible: true,
    },
    {
      icon: <Compass className="h-3 w-3" />,
      label: 'Bearing',
      value: `${getBearingDirection(bearing)} ${Math.abs(bearing).toFixed(0)}°`,
      color: 'text-rose-500',
      visible: bearing !== 0,
    },
    {
      icon: <RotateCw className="h-3 w-3" />,
      label: 'Pitch',
      value: `${pitch.toFixed(0)}° tilt`,
      color: 'text-violet-500',
      visible: pitch > 0,
    },
  ].filter((stat) => stat.visible)

  return (
    <div className="map-control-glass floating-panel flex items-center gap-2 px-3 py-1.5 rounded-xl">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="stat-item flex items-center gap-1.5 group"
        >
          <span className={stat.color}>{stat.icon}</span>
          <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          <span className="text-[11px] font-semibold tabular-nums">{stat.value}</span>
          {i < stats.length - 1 && (
            <span className="w-px h-3 bg-border ml-1.5 transition-all group-hover:h-4 group-hover:bg-primary/30" />
          )}
        </div>
      ))}
    </div>
  )
}
