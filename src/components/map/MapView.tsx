'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore } from '@/lib/map-store'

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markerRefs = useRef<Map<string, maplibregl.Marker>>(new Map())
  const mapLoadedRef = useRef(false)
  const [mapLoadedVersion, setMapLoadedVersion] = useState(0)

  // Use refs for values needed in map event handlers to avoid stale closures
  const toolModeRef = useRef(useMapStore.getState().toolMode)
  const selectedMarkerRef = useRef(useMapStore.getState().selectedMarker)

  // Keep refs in sync
  useEffect(() => {
    const unsub = useMapStore.subscribe((state) => {
      toolModeRef.current = state.toolMode
      selectedMarkerRef.current = state.selectedMarker
    })
    return unsub
  }, [])

  const currentStyle = useMapStore((s) => s.currentStyle)
  const markers = useMapStore((s) => s.markers)
  const selectedMarker = useMapStore((s) => s.selectedMarker)
  const measurePoints = useMapStore((s) => s.measurePoints)

  const markMapLoaded = useCallback((loaded: boolean) => {
    mapLoadedRef.current = loaded
    setMapLoadedVersion((v) => v + 1)
  }, [])

  // Initialize map (only once)
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: currentStyle.url,
      center: [14.5058, 46.0569],
      zoom: 5,
      attributionControl: false,
    })

    newMap.addControl(new maplibregl.NavigationControl(), 'bottom-right')
    newMap.addControl(new maplibregl.ScaleControl(), 'bottom-left')
    newMap.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    )

    newMap.on('move', () => {
      const center = newMap.getCenter()
      useMapStore.getState().setCenter([center.lng, center.lat])
    })

    newMap.on('zoom', () => {
      useMapStore.getState().setZoom(newMap.getZoom())
    })

    newMap.on('rotate', () => {
      useMapStore.getState().setBearing(newMap.getBearing())
    })

    newMap.on('pitch', () => {
      useMapStore.getState().setPitch(newMap.getPitch())
    })

    newMap.on('click', (e) => {
      const mode = toolModeRef.current
      if (mode === 'mark') {
        const id = `marker-${Date.now()}`
        useMapStore.getState().addMarker({
          id,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          name: `Pin at ${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}`,
          color: '#ef4444',
          category: 'general',
        })
      } else if (mode === 'measure') {
        useMapStore.getState().addMeasurePoint({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        })
      } else {
        useMapStore.getState().setSelectedMarker(null)
      }
    })

    newMap.on('load', () => {
      markMapLoaded(true)
    })

    newMap.on('styledataloading', () => {
      mapLoadedRef.current = false
    })

    newMap.on('styledata', () => {
      if (newMap.isStyleLoaded()) {
        markMapLoaded(true)
      }
    })

    map.current = newMap

    return () => {
      newMap.remove()
      map.current = null
      mapLoadedRef.current = false
    }
  }, [markMapLoaded])

  // Update map style
  useEffect(() => {
    if (!map.current) return
    mapLoadedRef.current = false
    map.current.setStyle(currentStyle.url)
  }, [currentStyle])

  // Sync markers
  useEffect(() => {
    if (!map.current) return

    const existingIds = new Set(markerRefs.current.keys())
    const newMarkerIds = new Set(markers.map((m) => m.id))

    // Remove markers that no longer exist
    existingIds.forEach((id) => {
      if (!newMarkerIds.has(id)) {
        const marker = markerRefs.current.get(id)
        if (marker) {
          marker.remove()
          markerRefs.current.delete(id)
        }
      }
    })

    // Add new markers
    markers.forEach((m) => {
      if (!markerRefs.current.has(m.id)) {
        const el = document.createElement('div')
        el.className = 'custom-marker'
        el.innerHTML = `
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="${m.color}"/>
            <circle cx="16" cy="15" r="6" fill="white"/>
          </svg>
        `
        el.style.cursor = 'pointer'
        el.style.filter =
          selectedMarker === m.id
            ? 'drop-shadow(0 0 6px rgba(0,0,0,0.5))'
            : 'none'
        el.style.transform = selectedMarker === m.id ? 'scale(1.2)' : 'scale(1)'
        el.style.transition = 'transform 0.2s, filter 0.2s'

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([m.longitude, m.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 25, closeButton: true }).setHTML(
              `<div style="padding: 8px; min-width: 150px;">
                <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${m.name}</h3>
                ${
                  m.description
                    ? `<p style="font-size: 12px; color: #666; margin-bottom: 4px;">${m.description}</p>`
                    : ''
                }
                <p style="font-size: 11px; color: #999;">📍 ${m.latitude.toFixed(
                  4
                )}, ${m.longitude.toFixed(4)}</p>
              </div>`
            )
          )
          .addTo(map.current!)

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          useMapStore.getState().setSelectedMarker(m.id)
        })

        markerRefs.current.set(m.id, marker)
      } else {
        // Update existing marker if selected state changed
        const existing = markerRefs.current.get(m.id)
        if (existing) {
          const el = existing.getElement()
          el.style.filter =
            selectedMarker === m.id
              ? 'drop-shadow(0 0 6px rgba(0,0,0,0.5))'
              : 'none'
          el.style.transform = selectedMarker === m.id ? 'scale(1.2)' : 'scale(1)'
        }
      }
    })
  }, [markers, selectedMarker])

  // Sync measurement line
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const sourceId = 'measure-source'
    const layerId = 'measure-layer'
    const pointLayerId = 'measure-points-layer'

    if (!map.current.getSource(sourceId)) {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
    }

    if (!map.current.getLayer(layerId)) {
      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#ef4444',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      })
    }

    if (!map.current.getLayer(pointLayerId)) {
      map.current.addLayer({
        id: pointLayerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 6,
          'circle-color': '#ef4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
        filter: ['==', '$type', 'Point'],
      })
    }

    const features: GeoJSON.Feature[] = measurePoints.map((p) => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude],
      },
    }))

    if (measurePoints.length > 1) {
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: measurePoints.map((p) => [p.longitude, p.latitude]),
        },
      })
    }

    const source = map.current.getSource(sourceId) as maplibregl.GeoJSONSource
    source.setData({
      type: 'FeatureCollection',
      features,
    })
  }, [measurePoints, mapLoadedVersion])

  const flyToLocation = useCallback(
    (longitude: number, latitude: number, zoom?: number) => {
      if (!map.current) return
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom || 14,
        duration: 2000,
      })
    },
    []
  )

  // Expose flyToLocation and resetNorth through window for other components
  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__mapFlyTo = flyToLocation
    ;(window as unknown as Record<string, unknown>).__mapResetNorth = () => {
      if (map.current) {
        map.current.easeTo({ bearing: 0, duration: 500 })
      }
    }
    return () => {
      delete (window as unknown as Record<string, unknown>).__mapFlyTo
      delete (window as unknown as Record<string, unknown>).__mapResetNorth
    }
  }, [flyToLocation])

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}
