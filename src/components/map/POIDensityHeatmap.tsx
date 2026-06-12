'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMapStore } from '@/lib/map-store'
import { Badge } from '@/components/ui/badge'
import { Flame, Filter } from 'lucide-react'

const HEATMAP_SOURCE_ID = 'poi-density-source'
const HEATMAP_LAYER_ID = 'poi-density-heatmap'

const COLOR_SCHEMES: Record<string, number[][]> = {
  thermal: [
    [0, 255, 0, 0, 0],
    [0.2, 255, 0, 0, 0.4],
    [0.4, 255, 165, 0, 0.6],
    [0.6, 255, 255, 0, 0.8],
    [0.8, 255, 100, 0, 0.9],
    [1, 255, 0, 0, 1],
  ],
  ocean: [
    [0, 0, 0, 255, 0],
    [0.2, 0, 100, 255, 0.3],
    [0.4, 0, 180, 255, 0.5],
    [0.6, 0, 255, 255, 0.7],
    [0.8, 100, 255, 255, 0.9],
    [1, 200, 255, 255, 1],
  ],
  forest: [
    [0, 0, 100, 0, 0],
    [0.2, 0, 150, 50, 0.3],
    [0.4, 34, 197, 94, 0.5],
    [0.6, 16, 185, 129, 0.7],
    [0.8, 52, 211, 153, 0.9],
    [1, 5, 150, 50, 1],
  ],
  purple: [
    [0, 100, 0, 200, 0],
    [0.2, 139, 92, 246, 0.3],
    [0.4, 168, 85, 247, 0.5],
    [0.6, 192, 132, 252, 0.7],
    [0.8, 216, 180, 254, 0.9],
    [1, 88, 28, 135, 1],
  ],
}

const COLOR_SCHEME_GRADIENTS: Record<string, string> = {
  thermal: 'from-red-500 to-yellow-500',
  ocean: 'from-blue-500 to-cyan-400',
  forest: 'from-green-600 to-emerald-400',
  purple: 'from-purple-700 to-violet-400',
}

/**
 * Map layer component - manages the MapLibre GL heatmap layer.
 * Render this in page.tsx (always mounted).
 */
export function POIDensityHeatmap() {
  const poiHeatmap = useMapStore((s) => s.poiHeatmap)
  const poiMarkers = useMapStore((s) => s.poiMarkers)
  const savedLocations = useMapStore((s) => s.savedLocations)
  const markers = useMapStore((s) => s.markers)

  // Combine POI markers and saved locations for heatmap data
  const heatmapPoints = useMemo(() => {
    const points: GeoJSON.Feature[] = []

    const filteredPois = poiHeatmap.categoryFilter
      ? poiMarkers.filter((p) => p.category === poiHeatmap.categoryFilter)
      : poiMarkers

    for (const poi of filteredPois) {
      points.push({
        type: 'Feature',
        properties: { category: poi.category, name: poi.name },
        geometry: {
          type: 'Point',
          coordinates: [poi.longitude, poi.latitude],
        },
      })
    }

    const filteredLocations = poiHeatmap.categoryFilter
      ? savedLocations.filter((l) => l.category === poiHeatmap.categoryFilter)
      : savedLocations

    for (const loc of filteredLocations) {
      points.push({
        type: 'Feature',
        properties: { category: loc.category, name: loc.name },
        geometry: {
          type: 'Point',
          coordinates: [loc.longitude, loc.latitude],
        },
      })
    }

    const filteredMarkers = poiHeatmap.categoryFilter
      ? markers.filter((m) => m.category === poiHeatmap.categoryFilter)
      : markers

    for (const marker of filteredMarkers) {
      points.push({
        type: 'Feature',
        properties: { category: marker.category, name: marker.name },
        geometry: {
          type: 'Point',
          coordinates: [marker.longitude, marker.latitude],
        },
      })
    }

    return points
  }, [poiMarkers, savedLocations, markers, poiHeatmap.categoryFilter])

  const geojson: GeoJSON.FeatureCollection = useMemo(() => ({
    type: 'FeatureCollection',
    features: heatmapPoints,
  }), [heatmapPoints])

  // Manage heatmap layer on map
  useEffect(() => {
    if (typeof window === 'undefined') return

    const map = (window as any).__mainMap
    if (!map) return

    const addHeatmapLayer = () => {
      if (!map.getSource(HEATMAP_SOURCE_ID)) {
        map.addSource(HEATMAP_SOURCE_ID, {
          type: 'geojson',
          data: geojson,
        })
      } else {
        (map.getSource(HEATMAP_SOURCE_ID) as any).setData(geojson)
      }

      if (!map.getLayer(HEATMAP_LAYER_ID)) {
        const colorStops = COLOR_SCHEMES[poiHeatmap.colorScheme] || COLOR_SCHEMES.thermal

        map.addLayer({
          id: HEATMAP_LAYER_ID,
          type: 'heatmap',
          source: HEATMAP_SOURCE_ID,
          paint: {
            'heatmap-weight': poiHeatmap.intensity,
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 0.5,
              9, 1,
              15, 2,
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              ...colorStops.flat(),
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, poiHeatmap.radius * 0.5,
              9, poiHeatmap.radius,
              15, poiHeatmap.radius * 2,
            ],
            'heatmap-opacity': 0.8,
          },
        })
      }
    }

    const removeHeatmapLayer = () => {
      if (map.getLayer(HEATMAP_LAYER_ID)) {
        map.removeLayer(HEATMAP_LAYER_ID)
      }
      if (map.getSource(HEATMAP_SOURCE_ID)) {
        map.removeSource(HEATMAP_SOURCE_ID)
      }
    }

    if (poiHeatmap.enabled && heatmapPoints.length > 0) {
      // Remove existing layer first to refresh with new settings
      removeHeatmapLayer()
      addHeatmapLayer()
    } else {
      removeHeatmapLayer()
    }

    return () => {
      // Cleanup effect handled by unmount effect below
    }
  }, [poiHeatmap, geojson, heatmapPoints.length])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window === 'undefined') return
      const map = (window as any).__mainMap
      if (!map) return
      if (map.getLayer(HEATMAP_LAYER_ID)) {
        map.removeLayer(HEATMAP_LAYER_ID)
      }
      if (map.getSource(HEATMAP_SOURCE_ID)) {
        map.removeSource(HEATMAP_SOURCE_ID)
      }
    }
  }, [])

  // This component is invisible - it only manages the map layer
  return null
}

/**
 * Sidebar UI controls for the POI Density Heatmap.
 * Render this in the MapSidebar Layers tab.
 */
export function POIDensityHeatmapSidebar() {
  const poiHeatmap = useMapStore((s) => s.poiHeatmap)
  const setPOIHeatmap = useMapStore((s) => s.setPOIHeatmap)
  const poiMarkers = useMapStore((s) => s.poiMarkers)
  const savedLocations = useMapStore((s) => s.savedLocations)
  const markers = useMapStore((s) => s.markers)

  const [statsExpanded, setStatsExpanded] = useState(false)

  // Compute heatmap points for statistics (same logic as layer component)
  const heatmapPoints = useMemo(() => {
    const points: GeoJSON.Feature[] = []

    const filteredPois = poiHeatmap.categoryFilter
      ? poiMarkers.filter((p) => p.category === poiHeatmap.categoryFilter)
      : poiMarkers

    for (const poi of filteredPois) {
      points.push({
        type: 'Feature',
        properties: { category: poi.category, name: poi.name },
        geometry: { type: 'Point', coordinates: [poi.longitude, poi.latitude] },
      })
    }

    const filteredLocations = poiHeatmap.categoryFilter
      ? savedLocations.filter((l) => l.category === poiHeatmap.categoryFilter)
      : savedLocations

    for (const loc of filteredLocations) {
      points.push({
        type: 'Feature',
        properties: { category: loc.category, name: loc.name },
        geometry: { type: 'Point', coordinates: [loc.longitude, loc.latitude] },
      })
    }

    const filteredMarkers = poiHeatmap.categoryFilter
      ? markers.filter((m) => m.category === poiHeatmap.categoryFilter)
      : markers

    for (const marker of filteredMarkers) {
      points.push({
        type: 'Feature',
        properties: { category: marker.category, name: marker.name },
        geometry: { type: 'Point', coordinates: [marker.longitude, marker.latitude] },
      })
    }

    return points
  }, [poiMarkers, savedLocations, markers, poiHeatmap.categoryFilter])

  // Compute density statistics
  const densityStats = useMemo(() => {
    if (heatmapPoints.length === 0) {
      return { min: 0, max: 0, avg: 0, hotspots: 0, coverageArea: 0 }
    }

    const gridSize = 0.01
    const gridCounts: Record<string, number> = {}

    for (const point of heatmapPoints) {
      if (point.geometry.type === 'Point') {
        const coords = (point.geometry as GeoJSON.Point).coordinates
        const gridKey = `${Math.floor(coords[0] / gridSize)},${Math.floor(coords[1] / gridSize)}`
        gridCounts[gridKey] = (gridCounts[gridKey] || 0) + 1
      }
    }

    const counts = Object.values(gridCounts)
    const min = Math.min(...counts)
    const max = Math.max(...counts)
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length
    const hotspots = counts.filter((c) => c >= 3).length
    const coverageArea = counts.length * 1.23

    return { min, max, avg: Math.round(avg * 10) / 10, hotspots, coverageArea: Math.round(coverageArea * 10) / 10 }
  }, [heatmapPoints])

  // Categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>()
    for (const poi of poiMarkers) cats.add(poi.category)
    for (const loc of savedLocations) cats.add(loc.category)
    for (const m of markers) cats.add(m.category)
    return Array.from(cats).sort()
  }, [poiMarkers, savedLocations, markers])

  return (
    <div className="space-y-3">
      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">POI Density Heatmap</span>
        </div>
        <button
          onClick={() => setPOIHeatmap({ enabled: !poiHeatmap.enabled })}
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors duration-200',
            poiHeatmap.enabled ? 'bg-emerald-500' : 'bg-muted'
          )}
          role="switch"
          aria-checked={poiHeatmap.enabled}
          aria-label="Toggle POI density heatmap"
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
              poiHeatmap.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>

      {poiHeatmap.enabled && (
        <div className="space-y-3 pt-1">
          {/* Radius slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Radius</label>
              <span className="text-xs font-medium tabular-nums">{poiHeatmap.radius}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={1}
              value={poiHeatmap.radius}
              onChange={(e) => setPOIHeatmap({ radius: Number(e.target.value) })}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-emerald-500"
              aria-label="Heatmap radius"
            />
          </div>

          {/* Intensity slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Intensity</label>
              <span className="text-xs font-medium tabular-nums">{poiHeatmap.intensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.1}
              value={poiHeatmap.intensity}
              onChange={(e) => setPOIHeatmap({ intensity: Number(e.target.value) })}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-emerald-500"
              aria-label="Heatmap intensity"
            />
          </div>

          {/* Color scheme */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Color Scheme</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(COLOR_SCHEMES) as Array<keyof typeof COLOR_SCHEMES>).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => setPOIHeatmap({ colorScheme: scheme })}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all',
                    poiHeatmap.colorScheme === scheme
                      ? 'border-emerald-500/50 bg-emerald-500/10 font-medium'
                      : 'border-border/50 hover:border-border hover:bg-accent/30'
                  )}
                >
                  <div className={cn('h-3 w-3 rounded-full bg-gradient-to-r', COLOR_SCHEME_GRADIENTS[scheme])} />
                  {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <label className="text-xs text-muted-foreground">Category Filter</label>
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setPOIHeatmap({ categoryFilter: null })}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                    poiHeatmap.categoryFilter === null
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'border-border/50 text-muted-foreground hover:border-border'
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPOIHeatmap({ categoryFilter: cat })}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                      poiHeatmap.categoryFilter === cat
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium'
                        : 'border-border/50 text-muted-foreground hover:border-border'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Density Statistics */}
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => setStatsExpanded(!statsExpanded)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium hover:bg-accent/30 transition-colors"
              aria-expanded={statsExpanded}
            >
              <span>Density Statistics</span>
              <span className="text-muted-foreground">{statsExpanded ? '▲' : '▼'}</span>
            </button>
            {statsExpanded && (
              <div className="px-3 pb-2 space-y-1.5 border-t border-border/30">
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-[10px] text-muted-foreground">Points</span>
                  <span className="text-[10px] font-medium tabular-nums">{heatmapPoints.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Min density</span>
                  <span className="text-[10px] font-medium tabular-nums">{densityStats.min}/cell</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Max density</span>
                  <span className="text-[10px] font-medium tabular-nums">{densityStats.max}/cell</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Avg density</span>
                  <span className="text-[10px] font-medium tabular-nums">{densityStats.avg}/cell</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Hot spots (3+/cell)</span>
                  <Badge variant="secondary" className="text-[9px] px-1.5 h-4">
                    {densityStats.hotspots}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Coverage area</span>
                  <span className="text-[10px] font-medium tabular-nums">{densityStats.coverageArea} km²</span>
                </div>
              </div>
            )}
          </div>

          {heatmapPoints.length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center py-2">
              No POI data available. Search for nearby places or add locations to see the heatmap.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
