'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/lib/map-store'

const ANNOTATIONS_SOURCE_ID = 'annotations-source'
const ANNOTATIONS_CIRCLE_LAYER_ID = 'annotations-circle-layer'
const ANNOTATIONS_LABEL_LAYER_ID = 'annotations-label-layer'
const ANNOTATIONS_CLUSTER_LAYER_ID = 'annotations-cluster-layer'
const ANNOTATIONS_CLUSTER_COUNT_LAYER_ID = 'annotations-cluster-count-layer'

// Derive annotation type from text content for symbol differentiation
function inferAnnotationType(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('warning') || lower.includes('⚠') || lower.includes('danger') || lower.includes('caution')) return 'warning'
  if (lower.includes('info') || lower.includes('ℹ') || lower.includes('note') || lower.includes('tip')) return 'info'
  if (lower.includes('★') || lower.includes('star') || lower.includes('favorite') || lower.includes('favourite')) return 'star'
  if (lower.includes('♥') || lower.includes('❤') || lower.includes('heart') || lower.includes('love')) return 'heart'
  if (lower.includes('🚩') || lower.includes('flag') || lower.includes('mark')) return 'flag'
  return 'text'
}

// Color map for annotation types
const TYPE_COLORS: Record<string, string> = {
  text: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  star: '#eab308',
  heart: '#ec4899',
  flag: '#ef4444',
}

function removeAnnotationLayers(map: maplibregl.Map) {
  const layerIds = [
    ANNOTATIONS_CLUSTER_COUNT_LAYER_ID,
    ANNOTATIONS_CLUSTER_LAYER_ID,
    ANNOTATIONS_LABEL_LAYER_ID,
    ANNOTATIONS_CIRCLE_LAYER_ID,
  ]
  for (const id of layerIds) {
    if (map.getLayer(id)) {
      map.removeLayer(id)
    }
  }
  if (map.getSource(ANNOTATIONS_SOURCE_ID)) {
    map.removeSource(ANNOTATIONS_SOURCE_ID)
  }
}

function buildGeoJSON(annotations: ReturnType<typeof useMapStore.getState>['annotations']): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: annotations.map((annotation) => {
      const annotationType = inferAnnotationType(annotation.text)
      return {
        type: 'Feature' as const,
        properties: {
          id: annotation.id,
          text: annotation.text,
          color: annotation.color || TYPE_COLORS[annotationType],
          fontSize: annotation.fontSize,
          rotation: annotation.rotation,
          annotationType,
          createdAt: annotation.createdAt,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [annotation.longitude, annotation.latitude],
        },
      }
    }),
  }
}

function addAnnotationLayers(map: maplibregl.Map, geojson: GeoJSON.FeatureCollection) {
  // Remove existing layers/sources first
  removeAnnotationLayers(map)

  // Find the first symbol layer to insert before, so labels appear on top
  const layers = map.getStyle().layers
  let firstSymbolId: string | undefined
  for (const layer of layers) {
    if (layer.type === 'symbol') {
      firstSymbolId = layer.id
      break
    }
  }

  // Add clustered GeoJSON source
  map.addSource(ANNOTATIONS_SOURCE_ID, {
    type: 'geojson',
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 40,
  })

  // Cluster circle layer - shown when annotations are clustered
  map.addLayer(
    {
      id: ANNOTATIONS_CLUSTER_LAYER_ID,
      type: 'circle',
      source: ANNOTATIONS_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#10b981',
          5,
          '#f59e0b',
          10,
          '#ef4444',
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          16,
          5,
          20,
          10,
          24,
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': 'rgba(255, 255, 255, 0.7)',
        'circle-opacity': 0.85,
      },
    },
    firstSymbolId
  )

  // Cluster count label layer
  map.addLayer(
    {
      id: ANNOTATIONS_CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: ANNOTATIONS_SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
      },
    },
    firstSymbolId
  )

  // Individual annotation circle layer
  map.addLayer(
    {
      id: ANNOTATIONS_CIRCLE_LAYER_ID,
      type: 'circle',
      source: ANNOTATIONS_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 4,
          10, 6,
          14, 8,
          18, 10,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(255, 255, 255, 0.8)',
        'circle-opacity': 0.9,
      },
    },
    firstSymbolId
  )

  // Annotation text label layer
  map.addLayer(
    {
      id: ANNOTATIONS_LABEL_LAYER_ID,
      type: 'symbol',
      source: ANNOTATIONS_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'text'],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 0,
          10, 10,
          14, 12,
          18, 14,
        ],
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-max-width': 10,
        'text-optional': true,
      },
      paint: {
        'text-color': ['get', 'color'],
        'text-halo-width': 1.5,
        'text-halo-color': 'rgba(255, 255, 255, 0.9)',
      },
    },
    firstSymbolId
  )
}

export function MapAnnotationsLayer() {
  const annotations = useMapStore((s) => s.annotations)
  const setSelectedMarker = useMapStore((s) => s.setSelectedMarker)

  const cleanupRef = useRef<(() => void) | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)

  // Handle click on annotation features
  const handleMapClick = useCallback(
    (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      const props = feature.properties
      if (!props) return

      // Only handle clicks on individual annotations (not clusters)
      if (props.point_count !== undefined) return

      const annotationId = props.id as string
      if (annotationId) {
        setSelectedMarker(annotationId)
      }
    },
    [setSelectedMarker]
  )

  // Handle hover for tooltips
  const handleMouseEnter = useCallback(
    (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      const props = feature.properties
      if (!props || props.point_count !== undefined) return

      const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
      if (!map) return

      // Remove existing popup
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }

      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number]
      const text = props.text || ''
      const annotationType = props.annotationType || 'text'

      const typeLabel = annotationType.charAt(0).toUpperCase() + annotationType.slice(1)

      popupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        className: 'annotation-tooltip',
      })
        .setLngLat(coordinates)
        .setHTML(
          `<div style="font-size:12px;padding:2px 4px;">
            <div style="font-weight:600;margin-bottom:2px;">${text}</div>
            <div style="font-size:10px;opacity:0.7;">${typeLabel}</div>
          </div>`
        )
        .addTo(map)

      map.getCanvas().style.cursor = 'pointer'
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove()
      popupRef.current = null
    }
    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (map) {
      map.getCanvas().style.cursor = ''
    }
  }, [])

  // Add/remove annotation layers
  useEffect(() => {
    if (typeof window === 'undefined') return

    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (!map) return

    if (annotations.length > 0) {
      const geojson = buildGeoJSON(annotations)

      const addWhenReady = () => {
        addAnnotationLayers(map, geojson)

        // Set up event handlers
        map.on('click', ANNOTATIONS_CIRCLE_LAYER_ID, handleMapClick)
        map.on('click', ANNOTATIONS_LABEL_LAYER_ID, handleMapClick)
        map.on('mouseenter', ANNOTATIONS_CIRCLE_LAYER_ID, handleMouseEnter)
        map.on('mouseenter', ANNOTATIONS_LABEL_LAYER_ID, handleMouseEnter)
        map.on('mouseleave', ANNOTATIONS_CIRCLE_LAYER_ID, handleMouseLeave)
        map.on('mouseleave', ANNOTATIONS_LABEL_LAYER_ID, handleMouseLeave)
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
      // Remove annotation layers when no annotations
      if (map.isStyleLoaded()) {
        // Remove event handlers first
        map.off('click', ANNOTATIONS_CIRCLE_LAYER_ID, handleMapClick)
        map.off('click', ANNOTATIONS_LABEL_LAYER_ID, handleMapClick)
        map.off('mouseenter', ANNOTATIONS_CIRCLE_LAYER_ID, handleMouseEnter)
        map.off('mouseenter', ANNOTATIONS_LABEL_LAYER_ID, handleMouseEnter)
        map.off('mouseleave', ANNOTATIONS_CIRCLE_LAYER_ID, handleMouseLeave)
        map.off('mouseleave', ANNOTATIONS_LABEL_LAYER_ID, handleMouseLeave)
        removeAnnotationLayers(map)
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
  }, [annotations, handleMapClick, handleMouseEnter, handleMouseLeave])

  // Update annotation source data when annotations change
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (annotations.length === 0) return

    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (!map || !map.isStyleLoaded()) return

    const source = map.getSource(ANNOTATIONS_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (source) {
      const geojson = buildGeoJSON(annotations)
      source.setData(geojson)
    }
  }, [annotations])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window === 'undefined') return
      const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
      if (map && map.isStyleLoaded()) {
        map.off('click', ANNOTATIONS_CIRCLE_LAYER_ID, handleMapClick)
        map.off('click', ANNOTATIONS_LABEL_LAYER_ID, handleMapClick)
        map.off('mouseenter', ANNOTATIONS_CIRCLE_LAYER_ID, handleMouseEnter)
        map.off('mouseenter', ANNOTATIONS_LABEL_LAYER_ID, handleMouseEnter)
        map.off('mouseleave', ANNOTATIONS_CIRCLE_LAYER_ID, handleMouseLeave)
        map.off('mouseleave', ANNOTATIONS_LABEL_LAYER_ID, handleMouseLeave)
        if (popupRef.current) {
          popupRef.current.remove()
          popupRef.current = null
        }
        removeAnnotationLayers(map)
      }
    }
  }, [])

  return null
}
