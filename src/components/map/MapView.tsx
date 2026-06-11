'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore, type LayerVisibility, getStyleUrl } from '@/lib/map-store'

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
      } else if (mode === 'directions') {
        useMapStore.getState().addRoutePoint({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        })
      } else {
        useMapStore.getState().setSelectedMarker(null)
      }
    })

    newMap.on('load', () => {
      markMapLoaded(true)
      // Expose main map reference for minimap
      ;(window as unknown as Record<string, unknown>).__mainMap = newMap
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

  // Cursor for tool modes
  useEffect(() => {
    if (!map.current) return

    const canvas = map.current.getCanvas()
    if (toolMode === 'mark' || toolMode === 'measure' || toolMode === 'directions') {
      canvas.style.cursor = 'crosshair'
    } else if (toolMode === 'draw') {
      canvas.style.cursor = 'crosshair'
    } else {
      canvas.style.cursor = ''
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
      // --- Terrain ---
      try {
        if (!map.current.getSource(terrainSourceId)) {
          map.current.addSource(terrainSourceId, {
            type: 'raster-dem',
            url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY || ''}`,
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
    return () => {
      delete (window as unknown as Record<string, unknown>).__mapFlyTo
      delete (window as unknown as Record<string, unknown>).__mapResetNorth
      delete (window as unknown as Record<string, unknown>).__mapExportImage
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
      {/* Map loading overlay */}
      {isMapLoading && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 map-loading-skeleton opacity-40" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="glass rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
              <span className="text-xs font-medium text-muted-foreground">Loading map…</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
