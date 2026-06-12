'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/lib/map-store'

function generateId(): string {
  return `drawn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function DrawingLayer() {
  const drawingTool = useMapStore((s) => s.drawingTool)
  const drawingColor = useMapStore((s) => s.drawingColor)
  const drawingLineWidth = useMapStore((s) => s.drawingLineWidth)
  const drawnFeatures = useMapStore((s) => s.drawnFeatures)
  const addDrawnFeature = useMapStore((s) => s.addDrawnFeature)
  const removeDrawnFeature = useMapStore((s) => s.removeDrawnFeature)
  const setToolMode = useMapStore((s) => s.setToolMode)

  const mapRef = useRef<maplibregl.Map | null>(null)
  const drawingStateRef = useRef<{
    points: number[][] // [lng, lat] pairs
    isDragging: boolean
    startLngLat: { lng: number; lat: number } | null
    currentLngLat: { lng: number; lat: number } | null
  }>({
    points: [],
    isDragging: false,
    startLngLat: null,
    currentLngLat: null,
  })

  // Get map instance
  useEffect(() => {
    if (typeof window === 'undefined') return

    const getMap = () => {
      const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
      if (map) {
        mapRef.current = map
        return true
      }
      return false
    }

    if (!getMap()) {
      const handler = () => getMap()
      window.addEventListener('map-ready', handler)
      return () => window.removeEventListener('map-ready', handler)
    }
  }, [])

  // Render drawn features on the map
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove existing layers/sources
    const prefix = 'drawn-features'
    const existingLayers = map.getStyle().layers?.filter((l) => l.id.startsWith(prefix)) || []
    existingLayers.forEach((layer) => {
      if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    })

    // Remove existing sources
    const existingSources = Object.keys(map.getStyle().sources || {}).filter((s) => s.startsWith(prefix))
    existingSources.forEach((source) => {
      if (map.getSource(source)) map.removeSource(source)
    })

    // Add each drawn feature
    drawnFeatures.forEach((feature, index) => {
      const sourceId = `${prefix}-src-${index}`
      const layerId = `${prefix}-layer-${index}`

      let geojson: GeoJSON.Feature

      if (feature.type === 'point') {
        geojson = {
          type: 'Feature',
          properties: { color: feature.color, id: feature.id },
          geometry: {
            type: 'Point',
            coordinates: feature.coordinates[0],
          },
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
          })
        }

        // Circle layer for points
        const circleLayerId = `${layerId}-circle`
        if (!map.getLayer(circleLayerId)) {
          map.addLayer({
            id: circleLayerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': Math.max(4, feature.lineWidth + 2),
              'circle-color': feature.color,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          })
        }
      } else if (feature.type === 'line') {
        geojson = {
          type: 'Feature',
          properties: { color: feature.color, lineWidth: feature.lineWidth, id: feature.id },
          geometry: {
            type: 'LineString',
            coordinates: feature.coordinates as number[][],
          },
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
          })
        }

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': feature.color,
              'line-width': feature.lineWidth,
              'line-cap': 'round',
              'line-join': 'round',
            },
          })
        }
      } else if (feature.type === 'polygon') {
        geojson = {
          type: 'Feature',
          properties: { color: feature.color, lineWidth: feature.lineWidth, id: feature.id },
          geometry: {
            type: 'Polygon',
            coordinates: [feature.coordinates as number[][]],
          },
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
          })
        }

        // Fill layer
        const fillLayerId = `${layerId}-fill`
        if (!map.getLayer(fillLayerId)) {
          map.addLayer({
            id: fillLayerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': feature.color,
              'fill-opacity': 0.3,
            },
          })
        }

        // Outline layer
        const outlineLayerId = `${layerId}-outline`
        if (!map.getLayer(outlineLayerId)) {
          map.addLayer({
            id: outlineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': feature.color,
              'line-width': feature.lineWidth,
              'line-cap': 'round',
              'line-join': 'round',
            },
          })
        }
      } else if (feature.type === 'circle') {
        const center = feature.coordinates[0]
        const edge = feature.coordinates.length > 1 ? feature.coordinates[1] : null

        if (edge) {
          // Calculate radius in meters using Haversine
          const R = 6371000
          const dLat = ((edge[1] - center[1]) * Math.PI) / 180
          const dLon = ((edge[0] - center[0]) * Math.PI) / 180
          const a = Math.sin(dLat / 2) ** 2 +
            Math.cos((center[1] * Math.PI) / 180) * Math.cos((edge[1] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
          const radius = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

          // Generate circle points
          const points: number[][] = []
          const steps = 64
          for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * 2 * Math.PI
            const dLatR = (radius / R) * Math.cos(angle)
            const dLonR = (radius / R) * Math.sin(angle) / Math.cos((center[1] * Math.PI) / 180)
            points.push([
              center[0] + (dLonR * 180) / Math.PI,
              center[1] + (dLatR * 180) / Math.PI,
            ])
          }

          geojson = {
            type: 'Feature',
            properties: { color: feature.color, lineWidth: feature.lineWidth, id: feature.id },
            geometry: {
              type: 'Polygon',
              coordinates: [points],
            },
          }
        } else {
          geojson = {
            type: 'Feature',
            properties: { color: feature.color, id: feature.id },
            geometry: {
              type: 'Point',
              coordinates: center,
            },
          }
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
          })
        }

        if (feature.coordinates.length > 1) {
          const fillLayerId = `${layerId}-fill`
          if (!map.getLayer(fillLayerId)) {
            map.addLayer({
              id: fillLayerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': feature.color,
                'fill-opacity': 0.2,
              },
            })
          }
          const outlineLayerId = `${layerId}-outline`
          if (!map.getLayer(outlineLayerId)) {
            map.addLayer({
              id: outlineLayerId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': feature.color,
                'line-width': feature.lineWidth,
              },
            })
          }
        } else {
          const circleLayerId = `${layerId}-circle`
          if (!map.getLayer(circleLayerId)) {
            map.addLayer({
              id: circleLayerId,
              type: 'circle',
              source: sourceId,
              paint: {
                'circle-radius': Math.max(4, feature.lineWidth + 2),
                'circle-color': feature.color,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
              },
            })
          }
        }
      } else if (feature.type === 'rectangle') {
        const p1 = feature.coordinates[0]
        const p2 = feature.coordinates.length > 1 ? feature.coordinates[1] : p1

        const rectCoords: number[][] = [
          [p1[0], p1[1]],
          [p2[0], p1[1]],
          [p2[0], p2[1]],
          [p1[0], p2[1]],
          [p1[0], p1[1]], // close
        ]

        geojson = {
          type: 'Feature',
          properties: { color: feature.color, lineWidth: feature.lineWidth, id: feature.id },
          geometry: {
            type: 'Polygon',
            coordinates: [rectCoords],
          },
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
          })
        }

        const fillLayerId = `${layerId}-fill`
        if (!map.getLayer(fillLayerId)) {
          map.addLayer({
            id: fillLayerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': feature.color,
              'fill-opacity': 0.2,
            },
          })
        }
        const outlineLayerId = `${layerId}-outline`
        if (!map.getLayer(outlineLayerId)) {
          map.addLayer({
            id: outlineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': feature.color,
              'line-width': feature.lineWidth,
            },
          })
        }
      } else if (feature.type === 'freehand') {
        geojson = {
          type: 'Feature',
          properties: { color: feature.color, lineWidth: feature.lineWidth, id: feature.id },
          geometry: {
            type: 'LineString',
            coordinates: feature.coordinates as number[][],
          },
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
          })
        }

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': feature.color,
              'line-width': feature.lineWidth,
              'line-cap': 'round',
              'line-join': 'round',
            },
          })
        }
      }
    })
  }, [drawnFeatures])

  // Handle drawing interactions
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (drawingTool === 'none') return

    const canvas = map.getCanvas()
    canvas.style.cursor = 'crosshair'

    const state = drawingStateRef.current

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const lngLat = e.lngLat

      if (drawingTool === 'point') {
        addDrawnFeature({
          id: generateId(),
          type: 'point',
          coordinates: [[lngLat.lng, lngLat.lat]],
          color: drawingColor,
          lineWidth: drawingLineWidth,
        })
      } else if (drawingTool === 'line' || drawingTool === 'polygon') {
        state.points.push([lngLat.lng, lngLat.lat])

        // Update preview
        updatePreview(map, state.points, drawingTool, drawingColor, drawingLineWidth)
      }
    }

    const handleDblClick = (e: maplibregl.MapMouseEvent & { preventDefault: () => void }) => {
      e.preventDefault()

      if (drawingTool === 'line' && state.points.length >= 2) {
        addDrawnFeature({
          id: generateId(),
          type: 'line',
          coordinates: [...state.points],
          color: drawingColor,
          lineWidth: drawingLineWidth,
        })
        state.points = []
        clearPreview(map)
      } else if (drawingTool === 'polygon' && state.points.length >= 3) {
        addDrawnFeature({
          id: generateId(),
          type: 'polygon',
          coordinates: [...state.points],
          color: drawingColor,
          lineWidth: drawingLineWidth,
        })
        state.points = []
        clearPreview(map)
      }
    }

    const handleMouseDown = (e: maplibregl.MapMouseEvent) => {
      if (drawingTool === 'circle' || drawingTool === 'rectangle') {
        state.isDragging = true
        state.startLngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat }
        state.currentLngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat }
        // Disable map dragging while drawing
        map.dragPan.disable()
      } else if (drawingTool === 'freehand') {
        state.isDragging = true
        state.points = [[e.lngLat.lng, e.lngLat.lat]]
        map.dragPan.disable()
      }
    }

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (!state.isDragging) return

      if (drawingTool === 'circle' || drawingTool === 'rectangle') {
        state.currentLngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat }
        updateDragPreview(map, state.startLngLat!, state.currentLngLat, drawingTool, drawingColor, drawingLineWidth)
      } else if (drawingTool === 'freehand') {
        state.points.push([e.lngLat.lng, e.lngLat.lat])
        updatePreview(map, state.points, 'freehand', drawingColor, drawingLineWidth)
      }
    }

    const handleMouseUp = () => {
      if (!state.isDragging) return

      if (drawingTool === 'circle' && state.startLngLat && state.currentLngLat) {
        addDrawnFeature({
          id: generateId(),
          type: 'circle',
          coordinates: [
            [state.startLngLat.lng, state.startLngLat.lat],
            [state.currentLngLat.lng, state.currentLngLat.lat],
          ],
          color: drawingColor,
          lineWidth: drawingLineWidth,
        })
      } else if (drawingTool === 'rectangle' && state.startLngLat && state.currentLngLat) {
        addDrawnFeature({
          id: generateId(),
          type: 'rectangle',
          coordinates: [
            [state.startLngLat.lng, state.startLngLat.lat],
            [state.currentLngLat.lng, state.currentLngLat.lat],
          ],
          color: drawingColor,
          lineWidth: drawingLineWidth,
        })
      } else if (drawingTool === 'freehand' && state.points.length >= 2) {
        addDrawnFeature({
          id: generateId(),
          type: 'freehand',
          coordinates: [...state.points],
          color: drawingColor,
          lineWidth: drawingLineWidth,
        })
      }

      state.isDragging = false
      state.startLngLat = null
      state.currentLngLat = null
      state.points = []
      map.dragPan.enable()
      clearPreview(map)
      clearDragPreview(map)
    }

    const handleRightClick = (e: maplibregl.MapMouseEvent & { preventDefault: () => void }) => {
      e.preventDefault()

      // Check if clicking on an existing feature to delete it
      const features = map.queryRenderedFeatures(e.point, {
        layers: drawnFeatures.flatMap((_, i) => {
          const prefix = 'drawn-features'
          const possibleLayers = [
            `${prefix}-layer-${i}`,
            `${prefix}-layer-${i}-circle`,
            `${prefix}-layer-${i}-fill`,
            `${prefix}-layer-${i}-outline`,
          ]
          return possibleLayers.filter((id) => map.getLayer(id))
        }),
      })

      if (features.length > 0) {
        const feature = features[0]
        const featureId = feature.properties?.id || feature.source?.split('-').slice(-1)[0]
        if (featureId) {
          const idx = parseInt(String(featureId), 10)
          if (!isNaN(idx) && idx < drawnFeatures.length) {
            removeDrawnFeature(drawnFeatures[idx].id)
          } else {
            // Try matching by id property
            const match = drawnFeatures.find((f) => f.id === featureId)
            if (match) removeDrawnFeature(match.id)
          }
        }
      }
    }

    // Add event listeners
    map.on('click', handleClick)
    map.on('dblclick', handleDblClick)
    map.on('mousedown', handleMouseDown)
    map.on('mousemove', handleMouseMove)
    map.on('mouseup', handleMouseUp)
    map.on('contextmenu', handleRightClick)

    return () => {
      canvas.style.cursor = ''
      map.off('click', handleClick)
      map.off('dblclick', handleDblClick)
      map.off('mousedown', handleMouseDown)
      map.off('mousemove', handleMouseMove)
      map.off('mouseup', handleMouseUp)
      map.off('contextmenu', handleRightClick)
      map.dragPan.enable()
      clearPreview(map)
      clearDragPreview(map)
      // Reset state
      state.points = []
      state.isDragging = false
      state.startLngLat = null
      state.currentLngLat = null
    }
  }, [drawingTool, drawingColor, drawingLineWidth, addDrawnFeature, removeDrawnFeature, drawnFeatures])

  return null
}

// Preview helper for line/polygon/freehand drawing
function updatePreview(
  map: maplibregl.Map,
  points: number[][],
  tool: string,
  color: string,
  lineWidth: number,
) {
  const previewId = 'draw-preview'
  const previewLayerId = 'draw-preview-layer'

  // Remove existing preview
  if (map.getLayer(previewLayerId)) map.removeLayer(previewLayerId)
  if (map.getSource(previewId)) map.removeSource(previewId)

  if (points.length < 2 && tool !== 'point') return

  let geometry: GeoJSON.Geometry
  if (tool === 'polygon' && points.length >= 3) {
    geometry = {
      type: 'Polygon',
      coordinates: [[...points, points[0]]],
    }
  } else {
    geometry = {
      type: 'LineString',
      coordinates: points,
    }
  }

  map.addSource(previewId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry,
    },
  })

  if (tool === 'polygon' && points.length >= 3) {
    const fillId = 'draw-preview-fill'
    if (map.getLayer(fillId)) map.removeLayer(fillId)
    map.addLayer({
      id: fillId,
      type: 'fill',
      source: previewId,
      paint: {
        'fill-color': color,
        'fill-opacity': 0.15,
      },
    })
  }

  map.addLayer({
    id: previewLayerId,
    type: 'line',
    source: previewId,
    paint: {
      'line-color': color,
      'line-width': lineWidth,
      'line-dasharray': [2, 2],
      'line-cap': 'round',
      'line-join': 'round',
    },
  })
}

// Preview helper for circle/rectangle drag drawing
function updateDragPreview(
  map: maplibregl.Map,
  start: { lng: number; lat: number },
  current: { lng: number; lat: number },
  tool: string,
  color: string,
  lineWidth: number,
) {
  const previewId = 'draw-drag-preview'
  const previewLayerId = 'draw-drag-preview-layer'

  // Remove existing preview
  if (map.getLayer(previewLayerId)) map.removeLayer(previewLayerId)
  const fillId = 'draw-drag-preview-fill'
  if (map.getLayer(fillId)) map.removeLayer(fillId)
  if (map.getSource(previewId)) map.removeSource(previewId)

  let coordinates: number[][]

  if (tool === 'circle') {
    const R = 6371000
    const dLat = ((current.lat - start.lat) * Math.PI) / 180
    const dLon = ((current.lng - start.lng) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((start.lat * Math.PI) / 180) * Math.cos((current.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
    const radius = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    coordinates = []
    const steps = 64
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI
      const dLatR = (radius / R) * Math.cos(angle)
      const dLonR = (radius / R) * Math.sin(angle) / Math.cos((start.lat * Math.PI) / 180)
      coordinates.push([
        start.lng + (dLonR * 180) / Math.PI,
        start.lat + (dLatR * 180) / Math.PI,
      ])
    }
  } else {
    // Rectangle
    coordinates = [
      [start.lng, start.lat],
      [current.lng, start.lat],
      [current.lng, current.lat],
      [start.lng, current.lat],
      [start.lng, start.lat],
    ]
  }

  map.addSource(previewId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
    },
  })

  map.addLayer({
    id: fillId,
    type: 'fill',
    source: previewId,
    paint: {
      'fill-color': color,
      'fill-opacity': 0.15,
    },
  })

  map.addLayer({
    id: previewLayerId,
    type: 'line',
    source: previewId,
    paint: {
      'line-color': color,
      'line-width': lineWidth,
      'line-dasharray': [2, 2],
    },
  })
}

function clearPreview(map: maplibregl.Map) {
  const previewId = 'draw-preview'
  const previewLayerId = 'draw-preview-layer'
  const fillId = 'draw-preview-fill'

  if (map.getLayer(fillId)) map.removeLayer(fillId)
  if (map.getLayer(previewLayerId)) map.removeLayer(previewLayerId)
  if (map.getSource(previewId)) map.removeSource(previewId)
}

function clearDragPreview(map: maplibregl.Map) {
  const previewId = 'draw-drag-preview'
  const previewLayerId = 'draw-drag-preview-layer'
  const fillId = 'draw-drag-preview-fill'

  if (map.getLayer(fillId)) map.removeLayer(fillId)
  if (map.getLayer(previewLayerId)) map.removeLayer(previewLayerId)
  if (map.getSource(previewId)) map.removeSource(previewId)
}
