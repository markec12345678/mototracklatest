'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/lib/map-store'

const HEATMAP_SOURCE_ID = 'heatmap-markers-source'
const HEATMAP_LAYER_ID = 'heatmap-markers-layer'

function removeHeatmapLayers(map: maplibregl.Map) {
  if (map.getLayer(HEATMAP_LAYER_ID)) {
    map.removeLayer(HEATMAP_LAYER_ID)
  }
  if (map.getSource(HEATMAP_SOURCE_ID)) {
    map.removeSource(HEATMAP_SOURCE_ID)
  }
}

function addHeatmapLayers(map: maplibregl.Map, geojson: GeoJSON.FeatureCollection, intensity: number, radius: number) {
  // Remove existing layers/sources first
  removeHeatmapLayers(map)

  // Add GeoJSON source
  map.addSource(HEATMAP_SOURCE_ID, {
    type: 'geojson',
    data: geojson,
  })

  // Find the first symbol layer to insert before, so labels appear on top
  const layers = map.getStyle().layers
  let firstSymbolId: string | undefined
  for (const layer of layers) {
    if (layer.type === 'symbol') {
      firstSymbolId = layer.id
      break
    }
  }

  // Add heatmap layer
  map.addLayer(
    {
      id: HEATMAP_LAYER_ID,
      type: 'heatmap',
      source: HEATMAP_SOURCE_ID,
      paint: {
        // Weight: all markers contribute equally
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'mag'],
          0, 0.5,
          1, 2,
        ],
        // Intensity from store
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, intensity * 0.5,
          9, intensity,
          15, intensity * 1.5,
        ],
        // Color gradient: transparent → blue → cyan → green → yellow → red
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 0, 255, 0)',
          0.2, 'rgb(0, 0, 255)',
          0.4, 'rgb(0, 255, 255)',
          0.6, 'rgb(0, 255, 0)',
          0.8, 'rgb(255, 255, 0)',
          1, 'rgb(255, 0, 0)',
        ],
        // Radius from store
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, radius * 0.5,
          9, radius,
          15, radius * 2,
        ],
        // Opacity
        'heatmap-opacity': 0.7,
      },
    },
    firstSymbolId
  )
}

export function HeatmapLayer() {
  const heatmapEnabled = useMapStore((s) => s.heatmapEnabled)
  const heatmapIntensity = useMapStore((s) => s.heatmapIntensity)
  const heatmapRadius = useMapStore((s) => s.heatmapRadius)
  const markers = useMapStore((s) => s.markers)
  const poiMarkers = useMapStore((s) => s.poiMarkers)

  const cleanupRef = useRef<(() => void) | null>(null)

  // Build GeoJSON from markers + POI markers
  const buildGeoJSON = useCallback(() => {
    const features: GeoJSON.Feature[] = []

    // Add user markers
    for (const marker of markers) {
      features.push({
        type: 'Feature',
        properties: { mag: 1 },
        geometry: {
          type: 'Point',
          coordinates: [marker.longitude, marker.latitude],
        },
      })
    }

    // Add POI markers
    for (const poi of poiMarkers) {
      features.push({
        type: 'Feature',
        properties: { mag: 1 },
        geometry: {
          type: 'Point',
          coordinates: [poi.longitude, poi.latitude],
        },
      })
    }

    return {
      type: 'FeatureCollection' as const,
      features,
    }
  }, [markers, poiMarkers])

  // Add/remove heatmap layer when enabled changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (!map) return

    if (heatmapEnabled) {
      const geojson = buildGeoJSON()

      const addWhenReady = () => {
        addHeatmapLayers(map, geojson, heatmapIntensity, heatmapRadius)
      }

      if (!map.isStyleLoaded()) {
        map.once('style.load', addWhenReady)
        cleanupRef.current = () => {
          map.off('style.load', addWhenReady)
        }
      } else {
        addWhenReady()
        cleanupRef.current = null
      }
    } else {
      // Remove heatmap layers when disabled
      if (map.isStyleLoaded()) {
        removeHeatmapLayers(map)
      }
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [heatmapEnabled, buildGeoJSON, heatmapIntensity, heatmapRadius])

  // Update heatmap source data when markers change
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!heatmapEnabled) return

    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (!map || !map.isStyleLoaded()) return

    const source = map.getSource(HEATMAP_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (source) {
      const geojson = buildGeoJSON()
      source.setData(geojson)
    }
  }, [markers, poiMarkers, heatmapEnabled, buildGeoJSON])

  // Update heatmap paint properties when intensity/radius change
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!heatmapEnabled) return

    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (!map || !map.isStyleLoaded()) return

    if (map.getLayer(HEATMAP_LAYER_ID)) {
      map.setPaintProperty(HEATMAP_LAYER_ID, 'heatmap-intensity', [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, heatmapIntensity * 0.5,
        9, heatmapIntensity,
        15, heatmapIntensity * 1.5,
      ])
      map.setPaintProperty(HEATMAP_LAYER_ID, 'heatmap-radius', [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, heatmapRadius * 0.5,
        9, heatmapRadius,
        15, heatmapRadius * 2,
      ])
    }
  }, [heatmapIntensity, heatmapRadius, heatmapEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window === 'undefined') return
      const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
      if (map && map.isStyleLoaded()) {
        removeHeatmapLayers(map)
      }
    }
  }, [])

  return null
}
