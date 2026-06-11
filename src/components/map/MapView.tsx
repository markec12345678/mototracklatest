'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore, type LayerVisibility, getStyleUrl } from '@/lib/map-store'
import { toast } from 'sonner'
import { MapContextMenu, type ContextMenuPosition } from '@/components/map/MapContextMenu'
import { MapAnnotations } from '@/components/map/MapAnnotations'

// Inject pulsing dot CSS animation
if (typeof document !== 'undefined' && !document.getElementById('geolocation-pulse-style')) {
  const style = document.createElement('style')
  style.id = 'geolocation-pulse-style'
  style.textContent = `
    @keyframes geolocation-pulse {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
      70% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }
    .geolocation-dot {
      width: 16px;
      height: 16px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
      animation: geolocation-pulse 2s ease-out infinite;
    }
  `
  document.head.appendChild(style)
}

// Layer matching patterns
const LAYER_PATTERNS: Record<keyof LayerVisibility, string[]> = {
  water: ['water'],
  roads: ['road'],
  buildings: ['building'],
  parks: ['park', 'landuse'],
  labels: ['label', 'place'],
}

function getLayerCategory(layerId: string): keyof LayerVisibility | null {
  const lowerId = layerId.toLowerCase()
  for (const [category, patterns] of Object.entries(LAYER_PATTERNS)) {
    if (patterns.some((pattern) => lowerId.includes(pattern))) {
      return category as keyof LayerVisibility
    }
  }
  return null
}

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markerRefs = useRef<Map<string, maplibregl.Marker>>(new Map())
  const mapLoadedRef = useRef(false)
  const geolocationMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [mapLoadedVersion, setMapLoadedVersion] = useState(0)
  const [osrmRoute, setOsrmRoute] = useState<[number, number][] | null>(null)
  const [tilesLoading, setTilesLoading] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition | null>(null)

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
  const routePoints = useMapStore((s) => s.routePoints)
  const routes = useMapStore((s) => s.routes)
  const geolocation = useMapStore((s) => s.geolocation)
  const layerVisibility = useMapStore((s) => s.layerVisibility)
  const clusteringEnabled = useMapStore((s) => s.clusteringEnabled)
  const buildingExtrusion = useMapStore((s) => s.buildingExtrusion)
  const terrainExaggeration = useMapStore((s) => s.terrainExaggeration)
  const toolMode = useMapStore((s) => s.toolMode)
  const drawings = useMapStore((s) => s.drawings)
  const currentDrawing = useMapStore((s) => s.currentDrawing)
  const drawColor = useMapStore((s) => s.drawColor)
  const drawWidth = useMapStore((s) => s.drawWidth)
  const weatherEnabled = useMapStore((s) => s.weatherEnabled)
  const trafficEnabled = useMapStore((s) => s.trafficEnabled)
  const earthquakesEnabled = useMapStore((s) => s.earthquakesEnabled)
  const isochroneEnabled = useMapStore((s) => s.isochroneEnabled)
  const isochroneMinutes = useMapStore((s) => s.isochroneMinutes)
  const isochroneMode = useMapStore((s) => s.isochroneMode)
  const center = useMapStore((s) => s.center)
  const poiMarkers = useMapStore((s) => s.poiMarkers)
  const areaPoints = useMapStore((s) => s.areaPoints)
  const heatmapEnabled = useMapStore((s) => s.heatmapEnabled)
  const customTileSources = useMapStore((s) => s.customTileSources)
  const savedLocations = useMapStore((s) => s.savedLocations)
  const routeProfile = useMapStore((s) => s.routeProfile)
  const highlightedStepIndex = useMapStore((s) => s.highlightedStepIndex)
  const routeSteps = useMapStore((s) => s.routeSteps)

  // Ref for throttling drawing point addition
  const lastDrawTimeRef = useRef(0)
  const isDrawingRef = useRef(false)

  const markMapLoaded = useCallback((loaded: boolean) => {
    mapLoadedRef.current = loaded
    setMapLoadedVersion((v) => v + 1)
  }, [])

  // Initialize map (only once)
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: getStyleUrl(currentStyle),
      center: [14.5058, 46.0569],
      zoom: 5,
      attributionControl: false,
      preserveDrawingBuffer: true,
    })

    newMap.addControl(new maplibregl.NavigationControl(), 'bottom-right')
    newMap.addControl(new maplibregl.ScaleControl(), 'bottom-left')
    newMap.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    )

    // Error handling: fall back if MapTiler style fails
    newMap.on('error', () => {
      const style = useMapStore.getState().currentStyle
      if (style.fallbackUrl) {
        console.warn(`Map style "${style.name}" failed to load, using fallback`)
        try {
          const currentStyleUrl = newMap.getStyle()?.name
          // Only fallback if we haven't already fallen back
          if (currentStyleUrl !== style.fallbackUrl) {
            newMap.setStyle(style.fallbackUrl)
          }
        } catch { /* ignore */ }
      }
    })

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
      // Close context menu on any left-click
      setContextMenuPos(null)

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
        useMapStore.getState().pushNotification({ type: 'location', icon: 'pin', message: `Pin dropped at ${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}` })
      } else if (mode === 'measure') {
        useMapStore.getState().addMeasurePoint({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        })
      } else if (mode === 'directions') {
        useMapStore.getState().addRoutePoint({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        })
      } else if (mode === 'area') {
        useMapStore.getState().addAreaPoint({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        })
      } else if (mode === 'annotate') {
        const text = prompt('Enter annotation text:')
        if (text && text.trim()) {
          useMapStore.getState().addAnnotation({
            id: `annotation-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat,
            text: text.trim(),
            fontSize: 16,
            color: 'white',
            rotation: 0,
            createdAt: new Date().toISOString(),
          })
          useMapStore.getState().pushNotification({ type: 'general', icon: '📝', message: `Annotation added: "${text.trim()}"` })
        }
      } else {
        useMapStore.getState().setSelectedMarker(null)
      }
    })

    // Right-click context menu
    newMap.on('contextmenu', (e) => {
      e.preventDefault()
      setContextMenuPos({
        x: e.point.x,
        y: e.point.y,
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
      })
    })

    // Close context menu on map move/zoom
    newMap.on('movestart', () => setContextMenuPos(null))
    newMap.on('zoomstart', () => setContextMenuPos(null))

    newMap.on('load', () => {
      markMapLoaded(true)
      // Expose main map reference for minimap
      ;(window as unknown as Record<string, unknown>).__mainMap = newMap
      // Notify page that map is ready
      window.dispatchEvent(new Event('map-ready'))
    })

    // Tile loading indicator events
    newMap.on('dataloading', () => setTilesLoading(true))
    newMap.on('idle', () => setTilesLoading(false))

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
      delete (window as unknown as Record<string, unknown>).__mainMap
    }
  }, [markMapLoaded])

  // Update map style
  useEffect(() => {
    if (!map.current) return
    mapLoadedRef.current = false
    map.current.setStyle(getStyleUrl(currentStyle))
  }, [currentStyle])

  // Sync markers (with clustering support)
  useEffect(() => {
    if (!map.current) return

    const useClustering = clusteringEnabled && markers.length > 5

    // If using clustering, remove individual markers and add GeoJSON source/layers
    if (useClustering) {
      // Remove all individual markers
      markerRefs.current.forEach((marker) => marker.remove())
      markerRefs.current.clear()

      const clusterSourceId = 'markers-cluster-source'
      const clusterCircleLayerId = 'markers-cluster-circle'
      const clusterCountLayerId = 'markers-cluster-count'
      const unclusteredLayerId = 'markers-unclustered'

      // Remove existing layers/sources if they exist
      if (map.current.getLayer(clusterCountLayerId)) map.current.removeLayer(clusterCountLayerId)
      if (map.current.getLayer(clusterCircleLayerId)) map.current.removeLayer(clusterCircleLayerId)
      if (map.current.getLayer(unclusteredLayerId)) map.current.removeLayer(unclusteredLayerId)
      if (map.current.getSource(clusterSourceId)) map.current.removeSource(clusterSourceId)

      const features: GeoJSON.Feature[] = markers.map((m) => ({
        type: 'Feature',
        properties: {
          id: m.id,
          name: m.name,
          description: m.description || '',
          color: m.color,
          category: m.category,
          selected: selectedMarker === m.id,
        },
        geometry: {
          type: 'Point',
          coordinates: [m.longitude, m.latitude],
        },
      }))

      map.current.addSource(clusterSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features,
        },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      })

      // Cluster circles with size based on point_count
      map.current.addLayer({
        id: clusterCircleLayerId,
        type: 'circle',
        source: clusterSourceId,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#22c55e',
            10,
            '#f59e0b',
            50,
            '#ef4444',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10,
            24,
            50,
            30,
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Cluster count labels
      map.current.addLayer({
        id: clusterCountLayerId,
        type: 'symbol',
        source: clusterSourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold'],
          'text-size': 13,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      // Unclustered individual points
      map.current.addLayer({
        id: unclusteredLayerId,
        type: 'circle',
        source: clusterSourceId,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Click handler for clusters - zoom into them
      map.current.on('click', clusterCircleLayerId, (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: [clusterCircleLayerId],
        })
        const clusterId = features[0]?.properties?.cluster_id
        if (clusterId !== undefined) {
          const source = map.current!.getSource(clusterSourceId) as maplibregl.GeoJSONSource
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return
            const geometry = features[0].geometry as GeoJSON.Point
            map.current!.easeTo({
              center: geometry.coordinates as [number, number],
              zoom,
            })
          })
        }
      })

      // Click handler for unclustered points - show popup
      map.current.on('click', unclusteredLayerId, (e) => {
        const feature = e.features?.[0]
        if (!feature) return
        const props = feature.properties || {}
        const coords = (feature.geometry as GeoJSON.Point).coordinates

        new maplibregl.Popup({ offset: 15, closeButton: true })
          .setLngLat(coords as [number, number])
          .setHTML(
            `<div style="padding: 8px; min-width: 150px;">
              <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${props.name || 'Pin'}</h3>
              ${props.description ? `<p style="font-size: 12px; color: #666; margin-bottom: 4px;">${props.description}</p>` : ''}
              <p style="font-size: 11px; color: #999;">📍 ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}</p>
            </div>`
          )
          .addTo(map.current!)

        if (props.id) {
          useMapStore.getState().setSelectedMarker(props.id as string)
        }
      })

      // Change cursor on hover
      map.current.on('mouseenter', clusterCircleLayerId, () => {
        map.current!.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', clusterCircleLayerId, () => {
        map.current!.getCanvas().style.cursor = ''
      })
      map.current.on('mouseenter', unclusteredLayerId, () => {
        map.current!.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', unclusteredLayerId, () => {
        map.current!.getCanvas().style.cursor = ''
      })
    } else {
      // Not using clustering - clean up cluster layers if they exist, then use individual markers
      const clusterSourceId = 'markers-cluster-source'
      const clusterCircleLayerId = 'markers-cluster-circle'
      const clusterCountLayerId = 'markers-cluster-count'
      const unclusteredLayerId = 'markers-unclustered'

      if (map.current.getLayer(clusterCountLayerId)) map.current.removeLayer(clusterCountLayerId)
      if (map.current.getLayer(clusterCircleLayerId)) map.current.removeLayer(clusterCircleLayerId)
      if (map.current.getLayer(unclusteredLayerId)) map.current.removeLayer(unclusteredLayerId)
      if (map.current.getSource(clusterSourceId)) map.current.removeSource(clusterSourceId)

      // Individual marker management
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

          const currentToolMode = useMapStore.getState().toolMode
          const marker = new maplibregl.Marker({
            element: el,
            draggable: currentToolMode === 'navigate',
          })
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

          // Handle marker drag
          marker.on('dragend', () => {
            const lngLat = marker.getLngLat()
            // Update the marker position in the store
            const currentMarkers = useMapStore.getState().markers
            const updatedMarkers = currentMarkers.map((mk) =>
              mk.id === m.id
                ? { ...mk, longitude: lngLat.lng, latitude: lngLat.lat }
                : mk
            )
            useMapStore.getState().setMarkers(updatedMarkers)

            // Also update saved locations if exists
            const currentLocations = useMapStore.getState().savedLocations
            const updatedLocations = currentLocations.map((loc) =>
              loc.id === m.id
                ? { ...loc, longitude: lngLat.lng, latitude: lngLat.lat, updatedAt: new Date().toISOString() }
                : loc
            )
            useMapStore.getState().setSavedLocations(updatedLocations)

            toast.success('Marker position updated')
          })

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
    }

    // Cleanup function for cluster event handlers
    return () => {
      if (map.current) {
        map.current.off('click', 'markers-cluster-circle')
        map.current.off('click', 'markers-unclustered')
        map.current.off('mouseenter', 'markers-cluster-circle')
        map.current.off('mouseleave', 'markers-cluster-circle')
        map.current.off('mouseenter', 'markers-unclustered')
        map.current.off('mouseleave', 'markers-unclustered')
      }
    }
  }, [markers, selectedMarker, clusteringEnabled])

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

    const textLayerId = 'measure-distance-label'
    if (!map.current.getLayer(textLayerId)) {
      map.current.addLayer({
        id: textLayerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': '',
          'text-size': 12,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular'],
        },
        paint: {
          'text-color': '#ef4444',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
        filter: ['==', '$type', 'Point'],
      })
    }

    // Calculate total distance using Haversine formula
    let totalDist = 0
    for (let i = 1; i < measurePoints.length; i++) {
      const p1 = measurePoints[i - 1]
      const p2 = measurePoints[i]
      const R = 6371
      const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180
      const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((p1.latitude * Math.PI) / 180) *
          Math.cos((p2.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      totalDist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }

    // Format distance for display
    const distanceLabel =
      totalDist >= 1
        ? `${totalDist.toFixed(2)} km`
        : `${(totalDist * 1000).toFixed(0)} m`

    const features: GeoJSON.Feature[] = measurePoints.map((p, idx) => ({
      type: 'Feature',
      properties:
        measurePoints.length > 1 && idx === Math.floor(measurePoints.length / 2)
          ? { distance: distanceLabel }
          : {},
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

    // Update the text-field on the distance label layer
    if (map.current.getLayer(textLayerId)) {
      map.current.setLayoutProperty(
        textLayerId,
        'text-field',
        measurePoints.length > 1 ? ['get', 'distance'] : ''
      )
    }

    // Update store with measured distance
    useMapStore.getState().setMeasureDistance(measurePoints.length > 1 ? totalDist : null)
  }, [measurePoints, mapLoadedVersion])

  // Sync area measurement polygon
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const fillSourceId = 'area-fill-source'
    const fillLayerId = 'area-fill-layer'
    const strokeLayerId = 'area-stroke-layer'
    const pointLayerId = 'area-points-layer'

    // Add fill source
    if (!map.current.getSource(fillSourceId)) {
      map.current.addSource(fillSourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }

    // Add fill layer (semi-transparent polygon)
    if (!map.current.getLayer(fillLayerId)) {
      map.current.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: fillSourceId,
        paint: {
          'fill-color': '#8b5cf6',
          'fill-opacity': 0.15,
        },
        filter: ['==', '$type', 'Polygon'],
      })
    }

    // Add stroke layer
    if (!map.current.getLayer(strokeLayerId)) {
      map.current.addLayer({
        id: strokeLayerId,
        type: 'line',
        source: fillSourceId,
        paint: {
          'line-color': '#8b5cf6',
          'line-width': 2,
          'line-dasharray': [3, 2],
        },
        filter: ['==', '$type', 'Polygon'],
      })
    }

    // Add points layer
    if (!map.current.getLayer(pointLayerId)) {
      map.current.addLayer({
        id: pointLayerId,
        type: 'circle',
        source: fillSourceId,
        paint: {
          'circle-radius': 5,
          'circle-color': '#8b5cf6',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
        filter: ['==', '$type', 'Point'],
      })
    }

    const features: GeoJSON.Feature[] = areaPoints.map((p) => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
    }))

    if (areaPoints.length >= 3) {
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[...areaPoints.map((p) => [p.longitude, p.latitude]), [areaPoints[0].longitude, areaPoints[0].latitude]]],
        },
      })
    } else if (areaPoints.length === 2) {
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: areaPoints.map((p) => [p.longitude, p.latitude]),
        },
      })
    }

    const source = map.current.getSource(fillSourceId) as maplibregl.GeoJSONSource
    source.setData({ type: 'FeatureCollection', features })

    // Calculate area using Shoelace formula (spherical approximation)
    if (areaPoints.length >= 3) {
      const R = 6371000
      const rad = areaPoints.map((p) => ({
        lat: (p.latitude * Math.PI) / 180,
        lng: (p.longitude * Math.PI) / 180,
      }))
      let sum = 0
      for (let i = 0; i < rad.length; i++) {
        const j = (i + 1) % rad.length
        sum += (rad[j].lng - rad[i].lng) * (2 + Math.sin(rad[i].lat) + Math.sin(rad[j].lat))
      }
      const area = Math.abs((sum * R * R) / 2)
      useMapStore.getState().setAreaResult(area)
    } else {
      useMapStore.getState().setAreaResult(null)
    }
  }, [areaPoints, mapLoadedVersion])

  // Sync route drawing lines and points
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const currentColor = useMapStore.getState().currentRouteColor

    const sourceId = 'route-source'
    const lineLayerId = 'route-line'
    const pointLayerId = 'route-points'

    // Add source if not exists
    if (!map.current.getSource(sourceId)) {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
    }

    // Add line layer if not exists
    if (!map.current.getLayer(lineLayerId)) {
      map.current.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': currentColor,
          'line-width': 4,
          'line-dasharray': [2, 2],
        },
        filter: ['==', '$type', 'LineString'],
      })
    } else {
      // Update color
      map.current.setPaintProperty(lineLayerId, 'line-color', currentColor)
    }

    // Add point layer if not exists
    if (!map.current.getLayer(pointLayerId)) {
      map.current.addLayer({
        id: pointLayerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 7,
          'circle-color': currentColor,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
        filter: ['==', '$type', 'Point'],
      })
    } else {
      map.current.setPaintProperty(pointLayerId, 'circle-color', currentColor)
    }

    // Add route number labels on top of route points
    const routeNumberLayerId = 'route-numbers'
    if (!map.current.getLayer(routeNumberLayerId)) {
      map.current.addLayer({
        id: routeNumberLayerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['to-string', ['get', 'index']],
          'text-size': 11,
          'text-font': ['Open Sans Bold'],
        },
        paint: {
          'text-color': '#ffffff',
        },
        filter: ['==', '$type', 'Point'],
      })
    }

    const features: GeoJSON.Feature[] = routePoints.map((p, idx) => ({
      type: 'Feature',
      properties: { index: idx },
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude],
      },
    }))

    if (routePoints.length > 1) {
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routePoints.map((p) => [p.longitude, p.latitude]),
        },
      })
    }

    const source = map.current.getSource(sourceId) as maplibregl.GeoJSONSource
    source.setData({
      type: 'FeatureCollection',
      features,
    })

    // Render saved routes
    routes.forEach((route) => {
      const rSourceId = `route-source-${route.id}`
      const rLineLayerId = `route-line-${route.id}`
      const rPointLayerId = `route-points-${route.id}`

      if (!map.current!.getSource(rSourceId)) {
        map.current!.addSource(rSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        })
      }

      if (!map.current!.getLayer(rLineLayerId)) {
        map.current!.addLayer({
          id: rLineLayerId,
          type: 'line',
          source: rSourceId,
          paint: {
            'line-color': route.color,
            'line-width': 4,
            'line-dasharray': [2, 2],
          },
          filter: ['==', '$type', 'LineString'],
        })
      }

      if (!map.current!.getLayer(rPointLayerId)) {
        map.current!.addLayer({
          id: rPointLayerId,
          type: 'circle',
          source: rSourceId,
          paint: {
            'circle-radius': 7,
            'circle-color': route.color,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
          filter: ['==', '$type', 'Point'],
        })
      }

      const rFeatures: GeoJSON.Feature[] = route.points.map((p, idx) => ({
        type: 'Feature',
        properties: { index: idx },
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude],
        },
      }))

      if (route.points.length > 1) {
        rFeatures.push({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.points.map((p) => [p.longitude, p.latitude]),
          },
        })
      }

      const rSource = map.current!.getSource(rSourceId) as maplibregl.GeoJSONSource
      rSource.setData({
        type: 'FeatureCollection',
        features: rFeatures,
      })
    })

    // Cleanup: remove sources/layers for deleted routes
    const currentRouteIds = new Set(routes.map((r) => r.id))
    const style = map.current.getStyle()
    if (style?.layers) {
      for (const layer of style.layers) {
        const match = layer.id.match(/^route-(?:source|line|points)-(.+)$/)
        if (match && !currentRouteIds.has(match[1])) {
          if (map.current!.getLayer(layer.id)) map.current!.removeLayer(layer.id)
          const srcId = `route-source-${match[1]}`
          if (map.current!.getSource(srcId)) map.current!.removeSource(srcId)
        }
      }
    }

    return () => {
      if (map.current) {
        if (map.current.getLayer(pointLayerId)) map.current.removeLayer(pointLayerId)
        if (map.current.getLayer(lineLayerId)) map.current.removeLayer(lineLayerId)
        if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)
        routes.forEach((route) => {
          const rSourceId = `route-source-${route.id}`
          const rLineLayerId = `route-line-${route.id}`
          const rPointLayerId = `route-points-${route.id}`
          if (map.current!.getLayer(rPointLayerId)) map.current!.removeLayer(rPointLayerId)
          if (map.current!.getLayer(rLineLayerId)) map.current!.removeLayer(rLineLayerId)
          if (map.current!.getSource(rSourceId)) map.current!.removeSource(rSourceId)
        })
      }
    }
  }, [routePoints, routes, mapLoadedVersion])

  // Waypoint label helper (A, B, C, D, ...)
  const getWaypointLabel = (idx: number): string => {
    if (idx < 26) return String.fromCharCode(65 + idx) // A-Z
    return String(idx + 1)
  }

  // Draggable route point markers with waypoint labels (in directions mode)
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return
    if (toolMode !== 'directions') return

    const routeMarkerRefs: maplibregl.Marker[] = []
    const addWaypointMarkerRefs: maplibregl.Marker[] = []
    const currentColor = useMapStore.getState().currentRouteColor

    routePoints.forEach((point, idx) => {
      const el = document.createElement('div')
      el.className = 'route-point-marker'
      el.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${currentColor};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        color: white;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        position: relative;
        z-index: 10;
      `
      el.textContent = getWaypointLabel(idx)

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.25)'
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      })

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map.current!)

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        useMapStore.getState().updateRoutePoint(idx, {
          longitude: lngLat.lng,
          latitude: lngLat.lat,
          name: useMapStore.getState().routePoints[idx]?.name,
        })
      })

      routeMarkerRefs.push(marker)
    })

    // Add "Add Waypoint" buttons between existing waypoints
    if (routePoints.length >= 2) {
      for (let i = 0; i < routePoints.length - 1; i++) {
        const p1 = routePoints[i]
        const p2 = routePoints[i + 1]
        const midLng = (p1.longitude + p2.longitude) / 2
        const midLat = (p1.latitude + p2.latitude) / 2

        const addEl = document.createElement('div')
        addEl.className = 'add-waypoint-btn'
        addEl.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid ${currentColor};
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          color: ${currentColor};
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          z-index: 9;
        `
        addEl.textContent = '+'

        addEl.addEventListener('mouseenter', () => {
          addEl.style.transform = 'scale(1.3)'
          addEl.style.boxShadow = '0 3px 8px rgba(0,0,0,0.3)'
        })
        addEl.addEventListener('mouseleave', () => {
          addEl.style.transform = 'scale(1)'
          addEl.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)'
        })

        const insertIndex = i + 1
        addEl.addEventListener('click', (e) => {
          e.stopPropagation()
          const m = map.current!
          const lngLat = m.unproject([
            addEl.getBoundingClientRect().left + 10 - m.getContainer().getBoundingClientRect().left,
            addEl.getBoundingClientRect().top + 10 - m.getContainer().getBoundingClientRect().top,
          ])
          useMapStore.getState().insertRoutePoint(insertIndex, {
            longitude: lngLat.lng,
            latitude: lngLat.lat,
          })
        })

        const addMarker = new maplibregl.Marker({ element: addEl, draggable: false })
          .setLngLat([midLng, midLat])
          .addTo(map.current!)

        addWaypointMarkerRefs.push(addMarker)
      }
    }

    return () => {
      for (const m of routeMarkerRefs) {
        m.remove()
      }
      for (const m of addWaypointMarkerRefs) {
        m.remove()
      }
    }
  }, [routePoints, toolMode, mapLoadedVersion])

  // OSRM routing: fetch real road-following route when in directions mode
  useEffect(() => {
    if (toolMode !== 'directions' || routePoints.length < 2) {
      setOsrmRoute(null)
      useMapStore.getState().setOsmrData(null, null)
      useMapStore.getState().setRouteSteps([])
      return
    }

    let cancelled = false
    const coords = routePoints.map((p) => `${p.longitude},${p.latitude}`).join(';')
    const profile = useMapStore.getState().routeProfile

    fetch(`/api/directions?coordinates=${coords}&profile=${profile}`)
      .then((res) => {
        if (!res.ok) throw new Error('OSRM fetch failed')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          const coordinates: [number, number][] = route.geometry.coordinates
          setOsrmRoute(coordinates)

          // OSRM returns distance in meters and duration in seconds
          const distanceKm = route.distance / 1000
          const durationSec = route.duration
          useMapStore.getState().setOsmrData(distanceKm, durationSec)

          // Parse turn-by-turn steps from OSRM response
          const steps: import('@/lib/map-store').RouteStep[] = []
          if (route.legs) {
            for (const leg of route.legs) {
              if (leg.steps) {
                for (const step of leg.steps) {
                  steps.push({
                    maneuver: {
                      type: step.maneuver?.type || '',
                      modifier: step.maneuver?.modifier || undefined,
                      location: step.maneuver?.location || [0, 0],
                    },
                    name: step.name || '',
                    distance: step.distance || 0,
                    duration: step.duration || 0,
                    geometry: step.geometry || { type: 'LineString', coordinates: [] },
                  })
                }
              }
            }
          }
          useMapStore.getState().setRouteSteps(steps)

          // Format and show notification
          const profileEmoji = profile === 'driving' ? '🚗' : profile === 'cycling' ? '🚴' : '🚶'
          const distStr = distanceKm < 1
            ? `${Math.round(route.distance)} m`
            : `${distanceKm.toFixed(1)} km`
          const durStr = durationSec < 60
            ? `${Math.round(durationSec)} sec`
            : durationSec < 3600
              ? `${Math.floor(durationSec / 60)} min ${Math.round(durationSec % 60)} sec`
              : `${Math.floor(durationSec / 3600)} hr ${Math.floor((durationSec % 3600) / 60)} min`
          useMapStore.getState().pushNotification({
            type: 'route',
            icon: profileEmoji,
            message: `Route: ${distStr} · ${durStr}`,
          })
        } else {
          setOsrmRoute(null)
          useMapStore.getState().setOsmrData(null, null)
          useMapStore.getState().setRouteSteps([])
        }
      })
      .catch((err) => {
        console.error('OSRM routing error:', err)
        if (!cancelled) {
          setOsrmRoute(null)
          useMapStore.getState().setOsmrData(null, null)
          useMapStore.getState().setRouteSteps([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [toolMode, routePoints, routeProfile])

  // Render OSRM route on the map
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const sourceId = 'osrm-route-source'
    const layerId = 'osrm-route-layer'

    if (!osrmRoute || osrmRoute.length < 2) {
      // Remove OSRM route layers if no route
      if (map.current.getLayer(layerId)) map.current.removeLayer(layerId)
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)
      return
    }

    // Add or update OSRM route source
    if (!map.current.getSource(sourceId)) {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: osrmRoute,
          },
        },
      })
    } else {
      const source = map.current.getSource(sourceId) as maplibregl.GeoJSONSource
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: osrmRoute,
        },
      })
    }

    // Add or update OSRM route layer
    if (!map.current.getLayer(layerId)) {
      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      })
    }

    return () => {
      if (map.current) {
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId)
        if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)
      }
    }
  }, [osrmRoute, mapLoadedVersion])

  // Highlight step segment on the map
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const sourceId = 'highlighted-step-source'
    const layerId = 'highlighted-step-layer'

    // Remove existing highlighted step layer/source
    if (map.current.getLayer(layerId)) map.current.removeLayer(layerId)
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)

    if (highlightedStepIndex === null || !routeSteps[highlightedStepIndex]) return

    const step = routeSteps[highlightedStepIndex]
    const coords = step.geometry?.coordinates
    if (!coords || coords.length < 2) return

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      },
    })

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#f59e0b',
        'line-width': 6,
        'line-opacity': 0.9,
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
    })

    return () => {
      if (map.current) {
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId)
        if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)
      }
    }
  }, [highlightedStepIndex, routeSteps, mapLoadedVersion])

  // Geolocation marker with accuracy circle
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const accuracySourceId = 'geolocation-accuracy-source'
    const accuracyLayerId = 'geolocation-accuracy-layer'

    // Clean up previous geolocation marker
    if (geolocationMarkerRef.current) {
      geolocationMarkerRef.current.remove()
      geolocationMarkerRef.current = null
    }

    if (!geolocation) {
      // Remove accuracy layers if geolocation is cleared
      if (map.current.getLayer(accuracyLayerId)) {
        map.current.removeLayer(accuracyLayerId)
      }
      if (map.current.getSource(accuracySourceId)) {
        map.current.removeSource(accuracySourceId)
      }
      return
    }

    const { longitude, latitude, accuracy } = geolocation

    // Add accuracy circle source and layer
    if (map.current.getSource(accuracySourceId)) {
      const source = map.current.getSource(accuracySourceId) as maplibregl.GeoJSONSource
      source.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          },
        ],
      })
    } else {
      map.current.addSource(accuracySourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
            },
          ],
        },
      })
    }

    if (map.current.getLayer(accuracyLayerId)) {
      map.current.removeLayer(accuracyLayerId)
    }
    map.current.addLayer({
      id: accuracyLayerId,
      type: 'circle',
      source: accuracySourceId,
      paint: {
        'circle-radius': {
          stops: [
            [0, 0],
            [20, accuracy / 2],
          ],
          base: 2,
        },
        'circle-color': 'rgba(59, 130, 246, 0.15)',
        'circle-stroke-color': 'rgba(59, 130, 246, 0.3)',
        'circle-stroke-width': 1,
      },
    })

    // Add pulsing dot marker at user location
    const dotEl = document.createElement('div')
    dotEl.className = 'geolocation-dot'

    const geoMarker = new maplibregl.Marker({ element: dotEl })
      .setLngLat([longitude, latitude])
      .addTo(map.current)

    geolocationMarkerRef.current = geoMarker

    return () => {
      if (geolocationMarkerRef.current) {
        geolocationMarkerRef.current.remove()
        geolocationMarkerRef.current = null
      }
      if (map.current) {
        if (map.current.getLayer(accuracyLayerId)) {
          map.current.removeLayer(accuracyLayerId)
        }
        if (map.current.getSource(accuracySourceId)) {
          map.current.removeSource(accuracySourceId)
        }
      }
    }
  }, [geolocation, mapLoadedVersion])

  // Sync layer visibility with map
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const style = map.current.getStyle()
    if (!style || !style.layers) return

    for (const layer of style.layers) {
      const category = getLayerCategory(layer.id)
      if (category !== null) {
        const visible = layerVisibility[category] ? 'visible' : 'none'
        try {
          map.current.setLayoutProperty(layer.id, 'visibility', visible)
        } catch {
          // Layer may have been removed
        }
      }
    }
  }, [layerVisibility, mapLoadedVersion])

  // Cursor for tool modes (use mousemove to override MapLibre's cursor reset)
  useEffect(() => {
    if (!map.current) return

    const canvas = map.current.getCanvas()
    const setCursor = () => {
      if (toolMode === 'mark' || toolMode === 'measure' || toolMode === 'directions' || toolMode === 'area') {
        canvas.style.cursor = 'crosshair'
      } else if (toolMode === 'draw') {
        canvas.style.cursor = 'crosshair'
      } else {
        canvas.style.cursor = ''
      }
    }

    // Set immediately
    setCursor()

    // Also set on mousemove to counteract MapLibre's cursor resets
    const handleMouseMove = () => setCursor()
    map.current.on('mousemove', handleMouseMove)

    return () => {
      if (map.current) {
        map.current.off('mousemove', handleMouseMove)
        canvas.style.cursor = ''
      }
    }
  }, [toolMode, mapLoadedVersion])

  // Drawing interaction - mousedown/mousemove/mouseup for freehand drawing
  useEffect(() => {
    if (!map.current) return

    const handleMouseDown = (e: maplibregl.MapMouseEvent) => {
      if (toolModeRef.current !== 'draw') return
      // Only respond to left click
      if (e.originalEvent.button !== 0) return
      e.preventDefault()
      isDrawingRef.current = true
      useMapStore.getState().setCurrentDrawing([[e.lngLat.lng, e.lngLat.lat]])
      useMapStore.getState().isDrawing = true
    }

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (!isDrawingRef.current || toolModeRef.current !== 'draw') return
      const now = Date.now()
      if (now - lastDrawTimeRef.current < 30) return // Throttle to ~30ms
      lastDrawTimeRef.current = now
      useMapStore.getState().addDrawingPoint([e.lngLat.lng, e.lngLat.lat])
    }

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      useMapStore.getState().finishDrawing()
      useMapStore.getState().pushNotification({ type: 'drawing', icon: 'pencil', message: 'Drawing saved' })
    }

    // Disable map drag when in draw mode
    if (toolMode === 'draw') {
      map.current.dragPan.disable()
    } else {
      map.current.dragPan.enable()
    }

    map.current.on('mousedown', handleMouseDown)
    map.current.on('mousemove', handleMouseMove)
    map.current.on('mouseup', handleMouseUp)

    return () => {
      if (map.current) {
        map.current.off('mousedown', handleMouseDown)
        map.current.off('mousemove', handleMouseMove)
        map.current.off('mouseup', handleMouseUp)
        map.current.dragPan.enable()
      }
    }
  }, [toolMode, mapLoadedVersion])

  // Render current drawing line
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const sourceId = 'draw-current-source'
    const layerId = 'draw-current-line'

    if (!currentDrawing || currentDrawing.length < 2) {
      // Remove if exists
      if (map.current.getLayer(layerId)) map.current.removeLayer(layerId)
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)
      return
    }

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
          'line-color': drawColor,
          'line-width': drawWidth,
          'line-opacity': 0.8,
          'line-cap': 'round',
          'line-join': 'round',
        },
      })
    } else {
      map.current.setPaintProperty(layerId, 'line-color', drawColor)
      map.current.setPaintProperty(layerId, 'line-width', drawWidth)
    }

    const source = map.current.getSource(sourceId) as maplibregl.GeoJSONSource
    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: currentDrawing,
          },
        },
      ],
    })

    return () => {
      if (map.current) {
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId)
        if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)
      }
    }
  }, [currentDrawing, drawColor, drawWidth, mapLoadedVersion])

  // Render saved drawings
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    // Render each saved drawing as its own source/layer
    drawings.forEach((drawing) => {
      const dSourceId = `draw-source-${drawing.id}`
      const dLayerId = `draw-line-${drawing.id}`

      if (!map.current!.getSource(dSourceId)) {
        map.current!.addSource(dSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        })
      }

      if (!map.current!.getLayer(dLayerId)) {
        map.current!.addLayer({
          id: dLayerId,
          type: 'line',
          source: dSourceId,
          paint: {
            'line-color': drawing.color,
            'line-width': drawing.width,
            'line-opacity': 0.85,
            'line-cap': 'round',
            'line-join': 'round',
          },
        })
      } else {
        map.current!.setPaintProperty(dLayerId, 'line-color', drawing.color)
        map.current!.setPaintProperty(dLayerId, 'line-width', drawing.width)
      }

      if (drawing.points.length >= 2) {
        const dSource = map.current!.getSource(dSourceId) as maplibregl.GeoJSONSource
        dSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: drawing.points,
              },
            },
          ],
        })
      }
    })

    // Cleanup: remove sources/layers for deleted drawings
    const currentDrawingIds = new Set(drawings.map((d) => d.id))
    const style = map.current.getStyle()
    if (style?.layers) {
      for (const layer of style.layers) {
        const match = layer.id.match(/^draw-line-(drawing-.+)$/) || layer.id.match(/^draw-source-(drawing-.+)$/)
        if (match) {
          const drawId = match[1]
          if (!currentDrawingIds.has(drawId)) {
            const layerId = `draw-line-${drawId}`
            const srcId = `draw-source-${drawId}`
            if (map.current!.getLayer(layerId)) map.current!.removeLayer(layerId)
            if (map.current!.getSource(srcId)) map.current!.removeSource(srcId)
          }
        }
      }
    }

    return () => {
      if (map.current) {
        drawings.forEach((drawing) => {
          const dSourceId = `draw-source-${drawing.id}`
          const dLayerId = `draw-line-${drawing.id}`
          if (map.current!.getLayer(dLayerId)) map.current!.removeLayer(dLayerId)
          if (map.current!.getSource(dSourceId)) map.current!.removeSource(dSourceId)
        })
      }
    }
  }, [drawings, mapLoadedVersion])

  // 3D Buildings + Terrain
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const buildingLayerId = '3d-buildings'
    const terrainSourceId = 'terrain-source'

    if (buildingExtrusion) {
      // Set pitch to 60° for 3D view
      if (map.current.getPitch() < 30) {
        map.current.easeTo({ pitch: 60, duration: 800 })
      }

      // --- Terrain ---
      try {
        if (!map.current.getSource(terrainSourceId)) {
          map.current.addSource(terrainSourceId, {
            type: 'raster-dem',
            url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY || ''}`,
          })
        }
        map.current.setTerrain({
          source: terrainSourceId,
          exaggeration: terrainExaggeration,
        })
      } catch {
        // Terrain source may not be available for all styles
      }

      // --- 3D Buildings ---
      const style = map.current.getStyle()
      const sources = style?.sources || {}
      if (sources['openmaptiles']) {
        // Don't add if already present
        if (!map.current.getLayer(buildingLayerId)) {
          // Detect dark mode
          const isDark = document.documentElement.classList.contains('dark')

          map.current.addLayer({
            id: buildingLayerId,
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': isDark ? '#666' : '#ddd',
              'fill-extrusion-height': ['get', 'render_height'],
              'fill-extrusion-base': ['get', 'render_min_height'],
              'fill-extrusion-opacity': isDark ? 0.5 : 0.7,
            },
          })
        }
      }
    } else {
      // Reset pitch when disabling 3D
      if (map.current.getPitch() > 0) {
        map.current.easeTo({ pitch: 0, duration: 600 })
      }

      // Remove terrain
      try {
        map.current.setTerrain(null)
      } catch {
        // Ignore if terrain not set
      }
      try {
        if (map.current.getSource(terrainSourceId)) {
          map.current.removeSource(terrainSourceId)
        }
      } catch {
        // Ignore
      }

      // Remove the 3D buildings layer when disabled
      if (map.current.getLayer(buildingLayerId)) {
        map.current.removeLayer(buildingLayerId)
      }
    }
  }, [buildingExtrusion, terrainExaggeration, mapLoadedVersion])

  // Update terrain exaggeration when it changes (while enabled)
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current || !buildingExtrusion) return
    try {
      map.current.setTerrain({
        source: 'terrain-source',
        exaggeration: terrainExaggeration,
      })
    } catch {
      // Terrain not available
    }
  }, [terrainExaggeration, buildingExtrusion, mapLoadedVersion])

  // Building info popup on 3D building click
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current || !buildingExtrusion) return

    const buildingLayerId = '3d-buildings'
    if (!map.current.getLayer(buildingLayerId)) return

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (toolMode !== 'navigate') return
      const features = map.current!.queryRenderedFeatures(e.point, { layers: [buildingLayerId] })
      if (features.length === 0) return

      const feature = features[0]
      const props = feature.properties || {}
      const height = props.render_height || props.height || 'N/A'
      const minHeight = props.render_min_height || props.min_height || 0
      const name = props.name || ''
      const buildingClass = props.class || props.building || 'building'

      const html = `
        <div style="font-family: system-ui, sans-serif; min-width: 160px;">
          ${name ? `<div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${name}</div>` : ''}
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 11px; color: #888;">
              Type: <span style="color: #333; font-weight: 500;">${String(buildingClass).replace(/_/g, ' ')}</span>
            </div>
            <div style="font-size: 11px; color: #888;">
              Height: <span style="color: #333; font-weight: 500;">${height}m</span>
            </div>
            ${minHeight > 0 ? `<div style="font-size: 11px; color: #888;">
              Base: <span style="color: #333; font-weight: 500;">${minHeight}m</span>
            </div>` : ''}
            ${Number(height) > 0 && Number(minHeight) > 0 ? `<div style="font-size: 11px; color: #888;">
              Floors: <span style="color: #333; font-weight: 500;">~${Math.round((Number(height) - Number(minHeight)) / 3)}</span>
            </div>` : ''}
          </div>
        </div>
      `

      new maplibregl.Popup({ offset: 15, closeButton: true, maxWidth: '240px' })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map.current!)
    }

    map.current.on('click', buildingLayerId, handleClick)
    const cursorEnter = () => { if (toolMode === 'navigate') map.current!.getCanvas().style.cursor = 'pointer' }
    const cursorLeave = () => { if (toolMode === 'navigate') map.current!.getCanvas().style.cursor = '' }
    map.current.on('mouseenter', buildingLayerId, cursorEnter)
    map.current.on('mouseleave', buildingLayerId, cursorLeave)

    return () => {
      if (map.current) {
        map.current.off('click', buildingLayerId, handleClick)
        map.current.off('mouseenter', buildingLayerId, cursorEnter)
        map.current.off('mouseleave', buildingLayerId, cursorLeave)
      }
    }
  }, [buildingExtrusion, toolMode, mapLoadedVersion])

  // Weather overlay
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const weatherSourceId = 'weather-overlay-source'
    const weatherLayerId = 'weather-overlay-layer'

    if (weatherEnabled) {
      if (!map.current!.getSource(weatherSourceId)) {
        map.current!.addSource(weatherSourceId, {
          type: 'raster',
          url: `https://api.maptiler.com/tiles/weather-overlay/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY || ''}`,
          tileSize: 256,
        })
      }
      if (!map.current!.getLayer(weatherLayerId)) {
        map.current!.addLayer({
          id: weatherLayerId,
          type: 'raster',
          source: weatherSourceId,
          paint: {
            'raster-opacity': 0.6,
          },
        })
      }
    } else {
      // Remove weather overlay
      if (map.current!.getLayer(weatherLayerId)) {
        map.current!.removeLayer(weatherLayerId)
      }
      if (map.current!.getSource(weatherSourceId)) {
        map.current!.removeSource(weatherSourceId)
      }
    }
  }, [weatherEnabled, mapLoadedVersion])

  // Traffic overlay
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const trafficSourceId = 'traffic-source'
    const trafficLayerId = 'traffic-layer'

    if (trafficEnabled) {
      if (!map.current!.getSource(trafficSourceId)) {
        map.current!.addSource(trafficSourceId, {
          type: 'raster',
          url: `https://api.maptiler.com/tiles/traffic-flow/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY || ''}`,
          tileSize: 256,
        })
      }
      if (!map.current!.getLayer(trafficLayerId)) {
        map.current!.addLayer({
          id: trafficLayerId,
          type: 'raster',
          source: trafficSourceId,
          paint: {
            'raster-opacity': 0.7,
          },
        })
      }
    } else {
      if (map.current!.getLayer(trafficLayerId)) {
        map.current!.removeLayer(trafficLayerId)
      }
      if (map.current!.getSource(trafficSourceId)) {
        map.current!.removeSource(trafficSourceId)
      }
    }
  }, [trafficEnabled, mapLoadedVersion])

  // Custom tile sources overlay
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const m = map.current
    const sourcePrefix = 'custom-tile-source-'
    const layerPrefix = 'custom-tile-layer-'

    // Track current custom source IDs
    const currentIds = new Set(customTileSources.map((s) => s.id))

    // Remove sources/layers that no longer exist in the store
    const style = m.getStyle()
    if (style) {
      const existingLayerIds = style.layers?.map((l) => l.id) || []
      const existingSourceIds = Object.keys(style.sources || {})

      for (const layerId of existingLayerIds) {
        if (layerId.startsWith(layerPrefix)) {
          const sourceId = sourcePrefix + layerId.slice(layerPrefix.length)
          if (!currentIds.has(layerId.slice(layerPrefix.length))) {
            m.removeLayer(layerId)
          }
        }
      }
      for (const srcId of existingSourceIds) {
        if (srcId.startsWith(sourcePrefix)) {
          const id = srcId.slice(sourcePrefix.length)
          if (!currentIds.has(id)) {
            m.removeSource(srcId)
          }
        }
      }
    }

    // Add or update custom tile sources
    for (const source of customTileSources) {
      const sourceId = sourcePrefix + source.id
      const layerId = layerPrefix + source.id

      if (source.type === 'raster') {
        // Add raster source if not exists
        if (!m.getSource(sourceId)) {
          try {
            m.addSource(sourceId, {
              type: 'raster',
              tiles: [source.url],
              tileSize: 256,
              attribution: source.attribution || '',
              minzoom: source.minZoom,
              maxzoom: source.maxZoom,
            } as maplibregl.RasterSourceSpecification)
          } catch (e) {
            console.warn(`Failed to add custom raster source "${source.name}":`, e)
            continue
          }
        }
        // Add raster layer if not exists
        if (!m.getLayer(layerId)) {
          try {
            m.addLayer({
              id: layerId,
              type: 'raster',
              source: sourceId,
              paint: {
                'raster-opacity': source.visible ? 1 : 0,
              },
            } as maplibregl.LayerSpecification)
          } catch (e) {
            console.warn(`Failed to add custom raster layer "${source.name}":`, e)
          }
        } else {
          // Update visibility
          try {
            m.setPaintProperty(layerId, 'raster-opacity', source.visible ? 1 : 0)
          } catch { /* ignore */ }
        }
      } else if (source.type === 'vector') {
        // Add vector source if not exists
        if (!m.getSource(sourceId)) {
          try {
            m.addSource(sourceId, {
              type: 'vector',
              url: source.url,
            } as maplibregl.VectorSourceSpecification)
          } catch (e) {
            console.warn(`Failed to add custom vector source "${source.name}":`, e)
            continue
          }
        }
        // For vector sources, we add a simple fill layer as a basic visualization
        // Users can customize this further
        const fillLayerId = layerPrefix + source.id + '-fill'
        if (!m.getLayer(fillLayerId)) {
          try {
            m.addLayer({
              id: fillLayerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': '#3388ff',
                'fill-opacity': source.visible ? 0.3 : 0,
              },
            } as maplibregl.LayerSpecification)
          } catch (e) {
            console.warn(`Failed to add custom vector layer "${source.name}":`, e)
          }
        } else {
          try {
            m.setPaintProperty(fillLayerId, 'fill-opacity', source.visible ? 0.3 : 0)
          } catch { /* ignore */ }
        }
      }
    }
  }, [customTileSources, mapLoadedVersion])

  // Earthquakes overlay
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const sourceId = 'earthquakes-source'
    const circlesLayerId = 'earthquakes-circles'
    const labelsLayerId = 'earthquakes-labels'

    let intervalId: ReturnType<typeof setInterval> | null = null

    const fetchAndRender = async () => {
      try {
        const res = await fetch(
          'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
        )
        if (!res.ok) return
        const geojson = await res.json()

        if (!map.current) return

        // Add or update source
        if (!map.current.getSource(sourceId)) {
          map.current.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
          })
        } else {
          ;(map.current.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson)
        }

        // Add circles layer
        if (!map.current.getLayer(circlesLayerId)) {
          map.current.addLayer({
            id: circlesLayerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                1, 3,
                3, 8,
                5, 15,
                7, 25,
              ],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                2, '#22c55e',
                4, '#eab308',
                6, '#f97316',
                8, '#ef4444',
              ],
              'circle-opacity': 0.7,
            },
          })
        }

        // Add labels layer
        if (!map.current.getLayer(labelsLayerId)) {
          map.current.addLayer({
            id: labelsLayerId,
            type: 'symbol',
            source: sourceId,
            layout: {
              'text-field': ['concat', 'M', ['to-string', ['get', 'mag']]],
              'text-size': 11,
              'text-anchor': 'top',
              'text-offset': [0, 0.8],
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#000000',
              'text-halo-width': 1.5,
            },
          })
        }
      } catch {
        // Silently handle fetch errors
      }
    }

    if (earthquakesEnabled) {
      fetchAndRender()
      // Refresh every 5 minutes
      intervalId = setInterval(fetchAndRender, 5 * 60 * 1000)

      // Click handler for earthquake popups
      const handleClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapboxGeoJSONFeature[] }) => {
        if (!map.current) return
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: [circlesLayerId],
        })
        if (!features.length) return

        const feature = features[0]
        const props = feature.properties
        if (!props) return

        const mag = props.mag ?? 'N/A'
        const place = props.place ?? 'Unknown location'
        const time = props.time ? new Date(props.time).toLocaleString() : 'N/A'
        const depth = props.depth ?? 'N/A'

        const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice()
        // Ensure popup appears on top of clicked point
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        new maplibregl.Popup({ offset: 12, closeButton: true })
          .setLngLat(coordinates as [number, number])
          .setHTML(
            `<div style="font-family:system-ui;font-size:13px;line-height:1.5">
              <strong style="font-size:14px">${place}</strong><br/>
              <span>Magnitude: <strong>${mag}</strong></span><br/>
              <span>Time: ${time}</span><br/>
              <span>Depth: ${depth} km</span>
            </div>`
          )
          .addTo(map.current)
      }

      map.current.on('click', handleClick)

      // Change cursor on hover
      const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
        if (!map.current) return
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: [circlesLayerId],
        })
        map.current.getCanvas().style.cursor = features.length ? 'pointer' : ''
      }

      map.current.on('mousemove', handleMouseMove)

      return () => {
        if (intervalId) clearInterval(intervalId)
        if (map.current) {
          map.current.off('click', handleClick)
          map.current.off('mousemove', handleMouseMove)
        }
      }
    } else {
      // Remove earthquakes overlay
      if (map.current.getLayer(labelsLayerId)) {
        map.current.removeLayer(labelsLayerId)
      }
      if (map.current.getLayer(circlesLayerId)) {
        map.current.removeLayer(circlesLayerId)
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId)
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [earthquakesEnabled, mapLoadedVersion])

  // Isochrone visualization
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const currentMap = map.current

    if (isochroneEnabled) {
      // Fetch isochrone data
      const [lng, lat] = center

      fetch(`/api/isochrone?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&minutes=${isochroneMinutes}&mode=${isochroneMode}`)
        .then(res => res.json())
        .then(data => {
          if (!data.rings || !map.current) return

          // Remove existing isochrone layers/sources
          if (map.current.getLayer('isochrone-fill')) map.current.removeLayer('isochrone-fill')
          if (map.current.getLayer('isochrone-line')) map.current.removeLayer('isochrone-line')
          if (map.current.getSource('isochrone')) map.current.removeSource('isochrone')

          // Create a GeoJSON FeatureCollection with all rings
          const features = data.rings.map((ring: { minutes: number; geometry: { type: string; coordinates: number[][][] } }, i: number) => ({
            type: 'Feature',
            properties: {
              minutes: ring.minutes,
              color: i === 0 ? '#10b981' : i === 1 ? '#14b8a6' : i === 2 ? '#06b6d4' : '#0ea5e9',
              opacity: 0.15 + i * 0.05,
            },
            geometry: ring.geometry,
          })).reverse() // Draw outer rings first

          map.current.addSource('isochrone', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features },
          })

          map.current.addLayer({
            id: 'isochrone-fill',
            type: 'fill',
            source: 'isochrone',
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': ['get', 'opacity'],
            },
          })

          map.current.addLayer({
            id: 'isochrone-line',
            type: 'line',
            source: 'isochrone',
            paint: {
              'line-color': ['get', 'color'],
              'line-width': 2,
              'line-opacity': 0.8,
            },
          })
        })
        .catch(err => console.error('Isochrone fetch error:', err))
    } else {
      // Remove isochrone layers when disabled
      if (currentMap.getLayer('isochrone-fill')) currentMap.removeLayer('isochrone-fill')
      if (currentMap.getLayer('isochrone-line')) currentMap.removeLayer('isochrone-line')
      if (currentMap.getSource('isochrone')) currentMap.removeSource('isochrone')
    }

    return () => {
      if (currentMap) {
        try {
          if (currentMap.getLayer('isochrone-fill')) currentMap.removeLayer('isochrone-fill')
          if (currentMap.getLayer('isochrone-line')) currentMap.removeLayer('isochrone-line')
          if (currentMap.getSource('isochrone')) currentMap.removeSource('isochrone')
        } catch { /* ignore cleanup errors */ }
      }
    }
  }, [isochroneEnabled, isochroneMinutes, isochroneMode, center, mapLoadedVersion])

  // POI Markers (temporary markers for nearby search) - with category-specific colors
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const poiMarkerRefs: maplibregl.Marker[] = []

    // Category-specific color mapping
    const categoryColors: Record<string, string> = {
      eating_out: 'rgba(239, 68, 68, 0.9)',      // red
      cafe: 'rgba(245, 158, 11, 0.9)',            // amber
      accommodation: 'rgba(139, 92, 246, 0.9)',    // purple
      activity: 'rgba(34, 197, 94, 0.9)',          // green
      tourism: 'rgba(249, 115, 22, 0.9)',          // orange
      commercial: 'rgba(14, 165, 233, 0.9)',       // sky
      healthcare: 'rgba(244, 63, 94, 0.9)',        // rose
      fuel: 'rgba(202, 138, 4, 0.9)',              // yellow
      parking: 'rgba(59, 130, 246, 0.9)',          // blue
      banking: 'rgba(5, 150, 105, 0.9)',           // emerald
      education: 'rgba(99, 102, 241, 0.9)',        // indigo
      entertainment: 'rgba(236, 72, 153, 0.9)',    // pink
      public_transport: 'rgba(20, 184, 166, 0.9)', // teal
      sports: 'rgba(132, 204, 22, 0.9)',           // lime
      drinking_water: 'rgba(6, 182, 212, 0.9)',    // cyan
      toilets: 'rgba(107, 114, 128, 0.9)',         // gray
    }

    for (const poi of poiMarkers) {
      const bgColor = categoryColors[poi.category] || 'rgba(16, 185, 129, 0.9)'

      // Create marker element with tooltip
      const container = document.createElement('div')
      container.style.position = 'relative'

      const el = document.createElement('div')
      el.className = 'poi-marker'
      el.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: ${bgColor};
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 13px;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      `
      el.textContent = poi.icon

      // Hover tooltip for POI name
      const tooltip = document.createElement('div')
      tooltip.style.cssText = `
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.85);
        color: white;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease;
        z-index: 10;
        font-family: system-ui, sans-serif;
      `
      tooltip.textContent = poi.name

      // Distance sub-label
      if (poi.distance !== null) {
        const distLabel = poi.distance < 1000 ? `${poi.distance}m` : `${(poi.distance / 1000).toFixed(1)}km`
        tooltip.textContent = `${poi.name} · ${distLabel}`
      }

      container.appendChild(el)
      container.appendChild(tooltip)

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
        tooltip.style.opacity = '1'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        tooltip.style.opacity = '0'
      })
      el.addEventListener('click', () => {
        const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
        if (flyTo) flyTo(poi.longitude, poi.latitude, 17)
      })

      const marker = new maplibregl.Marker({ element: container })
        .setLngLat([poi.longitude, poi.latitude])
        .addTo(map.current!)

      poiMarkerRefs.push(marker)
    }

    return () => {
      for (const m of poiMarkerRefs) {
        m.remove()
      }
    }
  }, [poiMarkers, mapLoadedVersion])

  // Heatmap visualization for markers and saved locations
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const heatmapSourceId = 'heatmap-source'
    const heatmapLayerId = 'heatmap-layer'

    if (heatmapEnabled) {
      const state = useMapStore.getState()
      // Combine markers and saved locations into heatmap points
      const points = [
        ...state.markers.map((m) => [m.longitude, m.latitude]),
        ...state.savedLocations.map((l) => [l.longitude, l.latitude]),
      ]

      if (points.length === 0) return

      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: points.map((p) => ({
          type: 'Feature',
          properties: { intensity: 1 },
          geometry: { type: 'Point', coordinates: p as [number, number] },
        })),
      }

      if (!map.current.getSource(heatmapSourceId)) {
        map.current.addSource(heatmapSourceId, {
          type: 'geojson',
          data: geojson,
        })
      } else {
        ;(map.current.getSource(heatmapSourceId) as maplibregl.GeoJSONSource).setData(geojson)
      }

      if (!map.current.getLayer(heatmapLayerId)) {
        map.current.addLayer({
          id: heatmapLayerId,
          type: 'heatmap',
          source: heatmapSourceId,
          paint: {
            'heatmap-weight': ['get', 'intensity'],
            'heatmap-intensity': 1.5,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 0, 0)',
              0.2, 'rgba(0, 255, 128, 0.3)',
              0.4, 'rgba(16, 185, 129, 0.5)',
              0.6, 'rgba(245, 158, 11, 0.6)',
              0.8, 'rgba(239, 68, 68, 0.7)',
              1, 'rgba(220, 38, 38, 0.9)',
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 15,
              10, 30,
              15, 45,
            ],
            'heatmap-opacity': 0.8,
          },
        })
      }
    } else {
      // Remove heatmap
      if (map.current.getLayer(heatmapLayerId)) {
        map.current.removeLayer(heatmapLayerId)
      }
      if (map.current.getSource(heatmapSourceId)) {
        map.current.removeSource(heatmapSourceId)
      }
    }

    return () => {
      if (map.current) {
        if (map.current.getLayer(heatmapLayerId)) {
          try { map.current.removeLayer(heatmapLayerId) } catch { /* ignore */ }
        }
        if (map.current.getSource(heatmapSourceId)) {
          try { map.current.removeSource(heatmapSourceId) } catch { /* ignore */ }
        }
      }
    }
  }, [heatmapEnabled, markers, savedLocations, mapLoadedVersion])

  // Draw geofences on map
  const geofences = useMapStore((s) => s.geofences)
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return

    const GEOFENCE_PREFIX = 'geofence-'

    // Remove existing geofence layers/sources
    const existingLayers = map.current.getStyle()?.layers || []
    for (const layer of existingLayers) {
      if (layer.id.startsWith(GEOFENCE_PREFIX)) {
        try { map.current.removeLayer(layer.id) } catch { /* ignore */ }
      }
    }
    const existingSources = Object.keys(map.current.getStyle()?.sources || {})
    for (const sourceId of existingSources) {
      if (sourceId.startsWith(GEOFENCE_PREFIX)) {
        try { map.current.removeSource(sourceId) } catch { /* ignore */ }
      }
    }

    // Draw each active geofence
    for (const geofence of geofences) {
      if (!geofence.isActive) continue

      const sourceId = `${GEOFENCE_PREFIX}src-${geofence.id}`
      const fillLayerId = `${GEOFENCE_PREFIX}fill-${geofence.id}`
      const strokeLayerId = `${GEOFENCE_PREFIX}stroke-${geofence.id}`
      const labelLayerId = `${GEOFENCE_PREFIX}label-${geofence.id}`

      // Create circle polygon
      const points = 64
      const coords: [number, number][] = []
      const distanceX = geofence.radius / (111320 * Math.cos((geofence.latitude * Math.PI) / 180))
      const distanceY = geofence.radius / 110550

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI
        const x = geofence.longitude + distanceX * Math.cos(angle)
        const y = geofence.latitude + distanceY * Math.sin(angle)
        coords.push([x, y])
      }

      const circleGeojson: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: { name: geofence.name },
        geometry: { type: 'Polygon', coordinates: [coords] },
      }

      const labelGeojson: GeoJSON.Feature<GeoJSON.Point> = {
        type: 'Feature',
        properties: { name: geofence.name },
        geometry: { type: 'Point', coordinates: [geofence.longitude, geofence.latitude] },
      }

      try {
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: circleGeojson,
        })

        map.current.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': geofence.color,
            'fill-opacity': 0.1,
          },
        })

        map.current.addLayer({
          id: strokeLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': geofence.color,
            'line-width': 2,
            'line-opacity': 0.6,
          },
        })

        // Add label source and layer
        const labelSourceId = `${GEOFENCE_PREFIX}label-src-${geofence.id}`
        map.current.addSource(labelSourceId, { type: 'geojson', data: labelGeojson })
        map.current.addLayer({
          id: labelLayerId,
          type: 'symbol',
          source: labelSourceId,
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': geofence.color,
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5,
          },
        })
      } catch { /* ignore errors when layers already exist */ }
    }
  }, [geofences, mapLoadedVersion])

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
    // Export map as image
    ;(window as unknown as Record<string, () => void>).__mapExportImage = () => {
      if (!map.current) return
      const canvas = map.current.getCanvas()
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `map-export-${Date.now()}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Screenshot function that returns a promise with data URL
    ;(window as unknown as Record<string, () => Promise<string | null>>).__mapScreenshot = () => {
      if (!map.current) return Promise.resolve(null)
      return new Promise<string>((resolve) => {
        map.current!.once('render', () => {
          const canvas = map.current!.getCanvas()
          resolve(canvas.toDataURL('image/png'))
        })
        map.current!.triggerRepaint()
      })
    }

    return () => {
      delete (window as unknown as Record<string, unknown>).__mapFlyTo
      delete (window as unknown as Record<string, unknown>).__mapResetNorth
      delete (window as unknown as Record<string, unknown>).__mapExportImage
      delete (window as unknown as Record<string, unknown>).__mapScreenshot
    }
  }, [flyToLocation])

  const isMapLoading = !mapLoadedRef.current && mapLoadedVersion > 0

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
      {/* Context Menu */}
      <MapContextMenu
        position={contextMenuPos}
        onClose={() => setContextMenuPos(null)}
        onAddToSavedLocations={(lat, lng) => {
          window.dispatchEvent(new CustomEvent('map-add-saved-location', { detail: { lat, lng } }))
        }}
      />

      {/* Map Annotations */}
      <MapAnnotations />

      {/* Tile loading indicator */}
      {tilesLoading && (
        <div className="absolute top-0 left-0 right-0 z-10 h-0.5 bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-loading-bar" style={{ width: '60%' }} />
        </div>
      )}
      {/* Map loading overlay */}
      {isMapLoading && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 map-loading-skeleton opacity-40" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
              <div className="map-style-spinner" />
              <span className="text-xs font-medium text-muted-foreground">Loading map…</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
