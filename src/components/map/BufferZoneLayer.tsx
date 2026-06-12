'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/lib/map-store'

/**
 * Renders buffer zone results from spatial analysis as GeoJSON circles/polygons on the map.
 */
export function BufferZoneLayer() {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const spatialResults = useMapStore((s) => s.spatialResults)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkMap = () => {
      const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
      if (map && map.getStyle()) {
        mapRef.current = map
        return true
      }
      return false
    }

    if (!checkMap()) {
      const interval = setInterval(() => {
        if (checkMap()) clearInterval(interval)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getStyle()) return

    // Remove old layers/sources
    const existingLayers = map.getStyle().layers || []
    for (const layer of existingLayers) {
      if (layer.id.startsWith('spatial-')) {
        try { map.removeLayer(layer.id) } catch { /* ignore */ }
      }
    }
    for (const id of (map.getStyle().sources ? Object.keys(map.getStyle().sources!) : [])) {
      if (id.startsWith('spatial-')) {
        try { map.removeSource(id) } catch { /* ignore */ }
      }
    }

    // Add spatial analysis results
    const bufferResults = spatialResults.filter((r) => r.geometry)

    for (const result of bufferResults) {
      const sourceId = `spatial-${result.id}`
      const layerId = `spatial-${result.id}-fill`
      const lineLayerId = `spatial-${result.id}-line`

      try {
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { color: result.color },
              geometry: result.geometry!,
            },
          })
        }

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': result.color,
              'fill-opacity': 0.25,
            },
          })
        }

        if (!map.getLayer(lineLayerId)) {
          map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': result.color,
              'line-width': 2,
              'line-opacity': 0.8,
            },
          })
        }
      } catch {
        // Layer may already exist or map not ready
      }
    }

    return () => {
      // Cleanup is handled at the top of the effect
    }
  }, [spatialResults])

  return null
}
