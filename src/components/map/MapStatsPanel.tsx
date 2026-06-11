'use client'

import { useMapStore } from '@/lib/map-store'
import { MapPin, Layers, ZoomIn, Compass, RotateCw } from 'lucide-react'
import { toast } from 'sonner'

function getBearingDirection(bearing: number): string {
  // Normalize bearing to 0-360
  const normalized = ((bearing % 360) + 360) % 360
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(normalized / 22.5) % 16
  return dirs[index]
}

function formatCoordinate(value: number, posChar: string, negChar: string): string {
  const abs = Math.abs(value)
  const char = value >= 0 ? posChar : negChar
  const degrees = Math.floor(abs)
  const minutes = Math.floor((abs - degrees) * 60)
  return `${degrees}°${minutes.toString().padStart(2, '0')}'${char}`
}

export function MapStatsPanel() {
  const { savedLocations, zoom, currentStyle, bearing, pitch, center } = useMapStore()

  const handleCopyStat = (label: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success(`${label} copied: ${value}`)
    }).catch(() => {
      // Fallback
      toast.success(`${label}: ${value}`)
    })
  }

  const stats = [
    {
      icon: <MapPin className="h-3 w-3" />,
      label: 'Places',
      value: savedLocations.length.toString(),
      color: 'text-emerald-500',
      copyValue: `${savedLocations.length} saved locations`,
      visible: true,
    },
    {
      icon: <Layers className="h-3 w-3" />,
      label: 'Style',
      value: currentStyle.name,
      color: 'text-amber-500',
      copyValue: currentStyle.name,
      visible: true,
    },
    {
      icon: <ZoomIn className="h-3 w-3" />,
      label: 'Zoom',
      value: zoom.toFixed(1),
      color: 'text-cyan-500',
      copyValue: `Zoom: ${zoom.toFixed(2)}`,
      visible: true,
    },
    {
      icon: <Compass className="h-3 w-3" />,
      label: 'Bearing',
      value: `${getBearingDirection(bearing)} ${Math.abs(bearing).toFixed(0)}°`,
      color: 'text-rose-500',
      copyValue: `Bearing: ${bearing.toFixed(1)}° (${getBearingDirection(bearing)})`,
      visible: bearing !== 0,
    },
    {
      icon: <RotateCw className="h-3 w-3" />,
      label: 'Pitch',
      value: `${pitch.toFixed(0)}° tilt`,
      color: 'text-violet-500',
      copyValue: `Pitch: ${pitch.toFixed(1)}°`,
      visible: pitch > 0,
    },
  ].filter((stat) => stat.visible)

  const coordStr = `${formatCoordinate(center[1], 'N', 'S')} ${formatCoordinate(center[0], 'E', 'W')}`

  return (
    <div className="map-control-glass floating-panel flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="stat-item flex items-center gap-1 sm:gap-1.5 group cursor-pointer"
          onClick={() => handleCopyStat(stat.label, stat.copyValue)}
          title={`Click to copy ${stat.label}`}
        >
          <span className={stat.color}>{stat.icon}</span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">{stat.label}</span>
          <span className="text-[10px] sm:text-[11px] font-semibold tabular-nums">{stat.value}</span>
          {i < stats.length - 1 && (
            <span className="w-px h-3 bg-border ml-1 sm:ml-1.5 transition-all group-hover:h-4 group-hover:bg-primary/30" />
          )}
        </div>
      ))}
      {/* Coordinates - compact display */}
      <div
        className="stat-item flex items-center gap-1 cursor-pointer"
        onClick={() => handleCopyStat('Coordinates', `${center[1].toFixed(6)}, ${center[0].toFixed(6)}`)}
        title="Click to copy coordinates"
      >
        <span className="w-px h-3 bg-border ml-1" />
        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono tabular-nums">{coordStr}</span>
      </div>
    </div>
  )
}
