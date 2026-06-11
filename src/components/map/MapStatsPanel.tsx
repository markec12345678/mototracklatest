'use client'

import { useMapStore } from '@/lib/map-store'
import { MapPin, Layers, ZoomIn } from 'lucide-react'

export function MapStatsPanel() {
  const { savedLocations, zoom, currentStyle } = useMapStore()

  const stats = [
    {
      icon: <MapPin className="h-3 w-3" />,
      label: 'Places',
      value: savedLocations.length,
      color: 'text-emerald-500',
    },
    {
      icon: <Layers className="h-3 w-3" />,
      label: 'Style',
      value: currentStyle.name,
      color: 'text-amber-500',
    },
    {
      icon: <ZoomIn className="h-3 w-3" />,
      label: 'Zoom',
      value: zoom.toFixed(1),
      color: 'text-cyan-500',
    },
  ]

  return (
    <div className="floating-panel flex items-center gap-3 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-lg">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="flex items-center gap-1.5 group transition-transform hover:scale-105"
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
