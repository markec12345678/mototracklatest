'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMapStore, type ToolMode } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  X,
  Navigation,
  MapPin,
  Ruler,
  Crosshair,
  Pencil,
  Mountain,
  Cloud,
  CircleDot,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react'

const TOOL_CONFIG: Record<ToolMode, { icon: React.ReactNode; label: string; description: string }> = {
  navigate: {
    icon: <Navigation className="h-3.5 w-3.5" />,
    label: 'Navigate',
    description: 'Pan & explore the map',
  },
  mark: {
    icon: <MapPin className="h-3.5 w-3.5" />,
    label: 'Drop Pin',
    description: 'Click to save locations',
  },
  measure: {
    icon: <Ruler className="h-3.5 w-3.5" />,
    label: 'Measure',
    description: 'Click points to measure distance',
  },
  directions: {
    icon: <Crosshair className="h-3.5 w-3.5" />,
    label: 'Directions',
    description: 'Create route between points',
  },
  draw: {
    icon: <Pencil className="h-3.5 w-3.5" />,
    label: 'Draw',
    description: 'Freehand drawing on map',
  },
}

const MARKER_LEGEND = [
  { color: 'bg-blue-500', border: 'border-blue-400', label: 'Saved Locations', key: 'saved' },
  { color: 'bg-amber-500', border: 'border-amber-400', label: 'Measurements', key: 'measure' },
  { color: 'bg-cyan-500', border: 'border-cyan-400', label: 'Routes', key: 'routes' },
  { color: 'bg-green-500', border: 'border-green-400', label: 'Drawings', key: 'drawings' },
] as const

const LAYER_LABELS: Record<string, string> = {
  water: 'Water',
  roads: 'Roads',
  buildings: 'Buildings',
  parks: 'Parks',
  labels: 'Labels',
}

export function MapLegend() {
  const [isOpen, setIsOpen] = useState(false)
  const currentStyle = useMapStore((s) => s.currentStyle)
  const toolMode = useMapStore((s) => s.toolMode)
  const terrainEnabled = useMapStore((s) => s.terrainEnabled)
  const weatherEnabled = useMapStore((s) => s.weatherEnabled)
  const clusteringEnabled = useMapStore((s) => s.clusteringEnabled)
  const layerVisibility = useMapStore((s) => s.layerVisibility)
  const savedLocations = useMapStore((s) => s.savedLocations)
  const routes = useMapStore((s) => s.routes)
  const drawings = useMapStore((s) => s.drawings)
  const measurePoints = useMapStore((s) => s.measurePoints)

  const toolConfig = TOOL_CONFIG[toolMode]
  const activeOverlays = [
    terrainEnabled && { icon: <Mountain className="h-3 w-3" />, label: '3D Terrain' },
    weatherEnabled && { icon: <Cloud className="h-3 w-3" />, label: 'Weather' },
    clusteringEnabled && savedLocations.length > 5 && { icon: <CircleDot className="h-3 w-3" />, label: 'Clustering' },
  ].filter(Boolean) as { icon: React.ReactNode; label: string }[]

  const hasContent = savedLocations.length > 0 || routes.length > 0 || drawings.length > 0 || measurePoints.length > 0 || activeOverlays.length > 0

  return (
    <div className="hidden md:block absolute bottom-[220px] right-5 z-10">
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'glass-card flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 text-muted-foreground hover:text-foreground',
          isOpen && 'mb-2'
        )}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close legend' : 'Open legend'}
        title="Map Legend"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium">Legend</span>
        <ChevronRight className={cn('h-3 w-3 transition-transform duration-200', isOpen && 'rotate-90')} />
      </motion.button>

      {/* Legend panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="glass-card rounded-xl shadow-xl overflow-hidden w-56"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
              <span className="text-[11px] font-semibold text-foreground">Map Legend</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close legend"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="px-3 py-2 space-y-3 max-h-72 overflow-y-auto">
              {/* Map style */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Map Style</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{currentStyle.preview.emoji}</span>
                  <span className="text-[11px] font-medium text-foreground">{currentStyle.name}</span>
                  <span className="text-[9px] text-muted-foreground">({currentStyle.provider})</span>
                </div>
              </div>

              {/* Active tool */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Active Tool</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500">{toolConfig.icon}</span>
                  <span className="text-[11px] font-medium text-foreground">{toolConfig.label}</span>
                  <span className="text-[9px] text-muted-foreground">- {toolConfig.description}</span>
                </div>
              </div>

              {/* Active overlays */}
              {activeOverlays.length > 0 && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Overlays</div>
                  <div className="space-y-1">
                    {activeOverlays.map((overlay) => (
                      <div key={overlay.label} className="flex items-center gap-1.5">
                        <span className="text-amber-500">{overlay.icon}</span>
                        <span className="text-[11px] text-foreground">{overlay.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer visibility */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Layers</div>
                <div className="space-y-0.5">
                  {Object.entries(layerVisibility).map(([key, visible]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      {visible ? (
                        <Eye className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-muted-foreground/50" />
                      )}
                      <span className={cn('text-[11px]', visible ? 'text-foreground' : 'text-muted-foreground/50 line-through')}>
                        {LAYER_LABELS[key] || key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marker color legend */}
              {hasContent && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Markers</div>
                  <div className="space-y-1">
                    {MARKER_LEGEND.map((item) => {
                      let count = 0
                      if (item.key === 'saved') count = savedLocations.length
                      if (item.key === 'measure') count = measurePoints.length
                      if (item.key === 'routes') count = routes.length
                      if (item.key === 'drawings') count = drawings.length
                      if (count === 0) return null
                      return (
                        <div key={item.key} className="flex items-center gap-1.5">
                          <span className={cn('h-2.5 w-2.5 rounded-full border', item.color, item.border)} />
                          <span className="text-[11px] text-foreground flex-1">{item.label}</span>
                          <span className="text-[9px] text-muted-foreground tabular-nums">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
