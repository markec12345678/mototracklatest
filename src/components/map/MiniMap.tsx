'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore, MAP_STYLES } from '@/lib/map-store'
import { Minimize2, Maximize2 } from 'lucide-react'

export function MiniMap() {
  const minimapContainer = useRef<HTMLDivElement>(null)
  const minimapRef = useRef<maplibregl.Map | null>(null)
  const [minimized, setMinimized] = useState(false)
  const isUpdatingFromMain = useRef(false)

  const center = useMapStore((s) => s.center)
  const zoom = useMapStore((s) => s.zoom)
  const currentStyle = useMapStore((s) => s.currentStyle)

  // Pick a matching minimap style (prefer positron for simplicity)
  const getMinimapStyle = useCallback(() => {
    const positron = MAP_STYLES.find((s) => s.id === 'positron')
    if (currentStyle.category === 'dark') {
      const dark = MAP_STYLES.find((s) => s.id === 'dark')
      return dark?.url || positron?.url || currentStyle.url
    }
    return positron?.url || currentStyle.url
  }, [currentStyle])

  // Initialize minimap
  useEffect(() => {
    if (!minimapContainer.current || minimapRef.current) return

    const miniMap = new maplibregl.Map({
      container: minimapContainer.current,
      style: getMinimapStyle(),
      center: [center[0], center[1]],
      zoom: Math.max(zoom - 5, 1),
      attributionControl: false,
      interactive: false,
      dragPan: false,
      scrollZoom: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      boxZoom: false,
      keyboard: false,
    })

    miniMap.on('load', () => {
      // Add viewport rectangle source and layer
      if (!miniMap.getSource('viewport-source')) {
        miniMap.addSource('viewport-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                ],
              ],
            },
          },
        })
      }

      if (!miniMap.getLayer('viewport-fill')) {
        miniMap.addLayer({
          id: 'viewport-fill',
          type: 'fill',
          source: 'viewport-source',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.12,
          },
        })
      }

      if (!miniMap.getLayer('viewport-border')) {
        miniMap.addLayer({
          id: 'viewport-border',
          type: 'line',
          source: 'viewport-source',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 1.5,
            'line-opacity': 0.6,
          },
        })
      }

      // Add center crosshair dot
      if (!miniMap.getSource('center-dot-source')) {
        miniMap.addSource('center-dot-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [center[0], center[1]],
            },
          },
        })
      }

      if (!miniMap.getLayer('center-dot')) {
        miniMap.addLayer({
          id: 'center-dot',
          type: 'circle',
          source: 'center-dot-source',
          paint: {
            'circle-radius': 3,
            'circle-color': '#3b82f6',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
          },
        })
      }
    })

    minimapRef.current = miniMap

    return () => {
      miniMap.remove()
      minimapRef.current = null
    }
  }, [])

  // Update minimap style when main map style changes
  useEffect(() => {
    if (!minimapRef.current) return
    minimapRef.current.setStyle(getMinimapStyle())
  }, [getMinimapStyle])

  // Sync minimap with main map center/zoom
  useEffect(() => {
    const miniMap = minimapRef.current
    if (!miniMap) return

    isUpdatingFromMain.current = true

    const miniZoom = Math.max(zoom - 5, 1)
    miniMap.jumpTo({
      center: [center[0], center[1]],
      zoom: miniZoom,
    })

    // Update center dot
    const centerSource = miniMap.getSource('center-dot-source') as maplibregl.GeoJSONSource | undefined
    if (centerSource) {
      centerSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [center[0], center[1]],
        },
      })
    }

    // Update viewport rectangle - calculate bounds from the main map
    const mainMap = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
    if (mainMap) {
      try {
        const bounds = mainMap.getBounds()
        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()
        const viewportData: GeoJSON.Feature = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [sw.lng, sw.lat],
                [ne.lng, sw.lat],
                [ne.lng, ne.lat],
                [sw.lng, ne.lat],
                [sw.lng, sw.lat],
              ],
            ],
          },
        }
        const vpSource = miniMap.getSource('viewport-source') as maplibregl.GeoJSONSource | undefined
        if (vpSource) {
          vpSource.setData(viewportData)
        }
      } catch {
        // Main map not ready yet
      }
    }

    // Use requestAnimationFrame to reset flag
    requestAnimationFrame(() => {
      isUpdatingFromMain.current = false
    })
  }, [center, zoom])

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="hidden md:flex absolute bottom-[88px] right-5 z-10 items-center gap-1.5 px-2.5 py-1.5 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-lg text-[10px] text-muted-foreground hover:text-foreground transition-all hover:scale-105"
        aria-label="Expand minimap"
      >
        <Maximize2 className="h-3 w-3" />
        Mini Map
      </button>
    )
  }

  return (
    <div className="hidden md:block absolute bottom-[88px] right-5 z-10">
      <div className="minimap-container relative">
        <div
          ref={minimapContainer}
          style={{
            width: '150px',
            height: '120px',
          }}
        />
        <button
          onClick={() => setMinimized(true)}
          className="absolute top-1 right-1 p-0.5 bg-background/80 backdrop-blur-sm rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground z-10"
          aria-label="Minimize minimap"
        >
          <Minimize2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  )
}
