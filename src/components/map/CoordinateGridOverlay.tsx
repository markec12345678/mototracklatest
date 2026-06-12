'use client'

import { useEffect, useRef } from 'react'
import { Grid3x3 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMapStore, type CoordinateGridState } from '@/lib/map-store'
import { cn } from '@/lib/utils'

function generateGridGeoJSON(interval: number, showMinorGrid: boolean, latColor: string, lngColor: string) {
  const minorInterval = interval <= 5 ? 1 : interval <= 15 ? 5 : 10
  const majorInterval = interval >= 30 ? 90 : 30

  const latLines: GeoJSON.Feature[] = []
  const lngLines: GeoJSON.Feature[] = []
  const labelPoints: GeoJSON.Feature[] = []

  // Generate latitude lines (horizontal)
  for (let lat = -90; lat <= 90; lat += minorInterval) {
    if (!showMinorGrid && lat % interval !== 0) continue
    const isMajor = lat % majorInterval === 0 || lat === 0
    const coordinates: [number, number][] = []
    for (let lng = -180; lng <= 180; lng += 2) {
      coordinates.push([lng, lat])
    }
    latLines.push({
      type: 'Feature',
      properties: {
        degree: lat,
        isMajor,
        color: latColor,
        width: isMajor ? 2 : 0.8,
        opacity: isMajor ? 0.7 : 0.35,
      },
      geometry: {
        type: 'LineString',
        coordinates,
      },
    })
  }

  // Generate longitude lines (vertical)
  for (let lng = -180; lng <= 180; lng += minorInterval) {
    if (!showMinorGrid && lng % interval !== 0) continue
    const isMajor = lng % majorInterval === 0 || lng === 0
    const coordinates: [number, number][] = []
    for (let lat = -90; lat <= 90; lat += 2) {
      coordinates.push([lng, lat])
    }
    lngLines.push({
      type: 'Feature',
      properties: {
        degree: lng,
        isMajor,
        color: lngColor,
        width: isMajor ? 2 : 0.8,
        opacity: isMajor ? 0.7 : 0.35,
      },
      geometry: {
        type: 'LineString',
        coordinates,
      },
    })
  }

  // Generate label points at major intersections
  for (let lat = -90; lat <= 90; lat += interval) {
    for (let lng = -180; lng <= 180; lng += interval) {
      const latLabel = `${Math.abs(lat)}°${lat < 0 ? 'S' : lat > 0 ? 'N' : ''}`
      const lngLabel = `${Math.abs(lng)}°${lng < 0 ? 'W' : lng > 0 ? 'E' : ''}`
      labelPoints.push({
        type: 'Feature',
        properties: {
          label: `${latLabel}, ${lngLabel}`,
          lat,
          lng,
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      })
    }
  }

  return {
    latLines: { type: 'FeatureCollection', features: latLines } as GeoJSON.FeatureCollection,
    lngLines: { type: 'FeatureCollection', features: lngLines } as GeoJSON.FeatureCollection,
    labels: { type: 'FeatureCollection', features: labelPoints } as GeoJSON.FeatureCollection,
  }
}

const GRID_SOURCE_IDS = {
  latLines: 'coord-grid-lat-lines',
  lngLines: 'coord-grid-lng-lines',
  labels: 'coord-grid-labels',
}

const GRID_LAYER_IDS = {
  latLines: 'coord-grid-lat-lines-layer',
  lngLines: 'coord-grid-lng-lines-layer',
  labels: 'coord-grid-labels-layer',
}

function addGridLayers(map: maplibregl.Map, state: CoordinateGridState) {
  const { interval, showMinorGrid, showLabels, latColor, lngColor } = state
  const { latLines, lngLines, labels } = generateGridGeoJSON(interval, showMinorGrid, latColor, lngColor)

  // Remove existing sources/layers first
  removeGridLayers(map)

  // Add sources
  map.addSource(GRID_SOURCE_IDS.latLines, { type: 'geojson', data: latLines })
  map.addSource(GRID_SOURCE_IDS.lngLines, { type: 'geojson', data: lngLines })
  map.addSource(GRID_SOURCE_IDS.labels, { type: 'geojson', data: labels })

  // Add latitude lines layer
  map.addLayer({
    id: GRID_LAYER_IDS.latLines,
    type: 'line',
    source: GRID_SOURCE_IDS.latLines,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['get', 'width'],
      'line-opacity': ['get', 'opacity'],
    },
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
  })

  // Add longitude lines layer
  map.addLayer({
    id: GRID_LAYER_IDS.lngLines,
    type: 'line',
    source: GRID_SOURCE_IDS.lngLines,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['get', 'width'],
      'line-opacity': ['get', 'opacity'],
    },
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
  })

  // Add labels layer
  if (showLabels) {
    map.addLayer({
      id: GRID_LAYER_IDS.labels,
      type: 'symbol',
      source: GRID_SOURCE_IDS.labels,
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 10,
        'text-anchor': 'top-left',
        'text-offset': [0.3, 0.3],
        'text-allow-overlap': false,
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      },
      paint: {
        'text-color': '#555555',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    })
  }
}

function removeGridLayers(map: maplibregl.Map) {
  for (const layerId of Object.values(GRID_LAYER_IDS)) {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId)
    }
  }
  for (const sourceId of Object.values(GRID_SOURCE_IDS)) {
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  }
}

export function CoordinateGridOverlay() {
  const coordinateGrid = useMapStore((s) => s.coordinateGrid)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const map = (window as any).__mainMap as maplibregl.Map | undefined
    if (!map) return

    const applyGrid = () => {
      if (!map || !map.getStyle()) return

      if (coordinateGrid.enabled) {
        addGridLayers(map, coordinateGrid)
      } else {
        removeGridLayers(map)
      }
    }

    if (map.isStyleLoaded()) {
      applyGrid()
    } else {
      map.once('load', applyGrid)
    }

    return () => {
      if (typeof window === 'undefined') return
      const currentMap = (window as any).__mainMap as maplibregl.Map | undefined
      if (currentMap) {
        removeGridLayers(currentMap)
      }
    }
  }, [
    coordinateGrid.enabled,
    coordinateGrid.interval,
    coordinateGrid.showLabels,
    coordinateGrid.showMinorGrid,
    coordinateGrid.latColor,
    coordinateGrid.lngColor,
  ])

  return null
}

export function CoordinateGridControls() {
  const coordinateGrid = useMapStore((s) => s.coordinateGrid)
  const setCoordinateGrid = useMapStore((s) => s.setCoordinateGrid)

  return (
    <div className="space-y-1.5">
      {/* Coordinate Grid Toggle */}
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200',
          coordinateGrid.enabled
            ? 'bg-background border-border/50 shadow-sm'
            : 'border-dashed text-muted-foreground hover:border-border'
        )}
      >
        <Grid3x3 className="h-4 w-4 text-teal-500" />
        <div className="flex-1">
          <p className="text-sm">Coordinate Grid</p>
          <p className="text-[10px] text-muted-foreground/70">
            Lat/Lng graticule overlay
          </p>
        </div>
        <Switch
          checked={coordinateGrid.enabled}
          onCheckedChange={(checked) => setCoordinateGrid({ enabled: checked })}
          aria-label="Toggle coordinate grid"
        />
      </div>

      {/* Grid Settings - shown when enabled */}
      {coordinateGrid.enabled && (
        <div className="ml-2 pl-3 border-l-2 border-teal-500/30 space-y-2 py-1">
          {/* Interval */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Interval</span>
            <Select
              value={String(coordinateGrid.interval)}
              onValueChange={(val) => setCoordinateGrid({ interval: Number(val) })}
            >
              <SelectTrigger className="w-20 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1°</SelectItem>
                <SelectItem value="5">5°</SelectItem>
                <SelectItem value="10">10°</SelectItem>
                <SelectItem value="15">15°</SelectItem>
                <SelectItem value="30">30°</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Labels */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Labels</span>
            <Switch
              checked={coordinateGrid.showLabels}
              onCheckedChange={(checked) => setCoordinateGrid({ showLabels: checked })}
              aria-label="Toggle grid labels"
              className="scale-75"
            />
          </div>

          {/* Show Minor Grid */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Minor grid</span>
            <Switch
              checked={coordinateGrid.showMinorGrid}
              onCheckedChange={(checked) => setCoordinateGrid({ showMinorGrid: checked })}
              aria-label="Toggle minor grid lines"
              className="scale-75"
            />
          </div>

          {/* Color pickers */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex-1">Lat color</span>
            <input
              type="color"
              value={coordinateGrid.latColor}
              onChange={(e) => setCoordinateGrid({ latColor: e.target.value })}
              className="h-6 w-6 rounded border cursor-pointer"
              aria-label="Latitude line color"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex-1">Lng color</span>
            <input
              type="color"
              value={coordinateGrid.lngColor}
              onChange={(e) => setCoordinateGrid({ lngColor: e.target.value })}
              className="h-6 w-6 rounded border cursor-pointer"
              aria-label="Longitude line color"
            />
          </div>
        </div>
      )}
    </div>
  )
}
