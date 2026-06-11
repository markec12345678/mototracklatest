'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/lib/map-store'

/**
 * Buildings3DLayer - Adds interactive 3D building visualization to the map.
 *
 * When buildings3DEnabled is true:
 * - Adds 3D building extrusion layer with height-based gradient coloring
 * - Enables 3D terrain and pitches the map to 60 degrees
 * - Supports clicking on buildings to select them and show info
 */
export function Buildings3DLayer() {
  const buildings3DEnabled = useMapStore((s) => s.buildings3DEnabled)
  const setSelectedBuilding = useMapStore((s) => s.setSelectedBuilding)
  const toolMode = useMapStore((s) => s.toolMode)
  const terrainExaggeration = useMapStore((s) => s.terrainExaggeration)
  const buildingExtrusion = useMapStore((s) => s.buildingExtrusion)
  const prevEnabledRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mainMap = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
    if (!mainMap) return

    const buildingLayerId = '3d-buildings-explorer'
    const buildingHighlightLayerId = '3d-buildings-highlight'
    const terrainSourceId = 'terrain-3d-source'

    if (buildings3DEnabled && !prevEnabledRef.current) {
      // Pitch the map to 60° for 3D view
      if (mainMap.getPitch() < 30) {
        mainMap.easeTo({ pitch: 60, duration: 800 })
      }

      // Enable buildingExtrusion as well so terrain and base 3D buildings are on
      if (!buildingExtrusion) {
        useMapStore.getState().setBuildingExtrusion(true)
      }

      // Also enable terrain
      try {
        if (!mainMap.getSource(terrainSourceId)) {
          mainMap.addSource(terrainSourceId, {
            type: 'raster-dem',
            url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY || ''}`,
          })
        }
        mainMap.setTerrain({
          source: terrainSourceId,
          exaggeration: terrainExaggeration,
        })
      } catch {
        // Terrain may not be available
      }

      // Add 3D buildings layer with height-based gradient if not present
      const style = mainMap.getStyle()
      const sources = style?.sources || {}
      if (sources['openmaptiles'] && !mainMap.getLayer(buildingLayerId)) {
        const isDark = document.documentElement.classList.contains('dark')

        mainMap.addLayer({
          id: buildingLayerId,
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'render_height'],
              0, isDark ? '#555' : '#c8c8c8',
              50, isDark ? '#777' : '#a0a0a0',
              100, isDark ? '#999' : '#808080',
              200, isDark ? '#bbb' : '#606060',
              400, isDark ? '#ddd' : '#404040',
            ],
            'fill-extrusion-height': ['get', 'render_height'],
            'fill-extrusion-base': ['get', 'render_min_height'],
            'fill-extrusion-opacity': isDark ? 0.6 : 0.75,
          },
        })

        // Add highlight layer for selected building
        if (!mainMap.getLayer(buildingHighlightLayerId)) {
          mainMap.addLayer({
            id: buildingHighlightLayerId,
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': '#10b981',
              'fill-extrusion-height': ['get', 'render_height'],
              'fill-extrusion-base': ['get', 'render_min_height'],
              'fill-extrusion-opacity': 0.9,
            },
            filter: ['==', ['get', 'id'], ''],
          })
        }
      }
    }

    if (!buildings3DEnabled && prevEnabledRef.current) {
      // Reset pitch when disabling
      if (mainMap.getPitch() > 0) {
        mainMap.easeTo({ pitch: 0, duration: 600 })
      }

      // Remove the explorer building layer
      if (mainMap.getLayer(buildingLayerId)) {
        mainMap.removeLayer(buildingLayerId)
      }
      if (mainMap.getLayer(buildingHighlightLayerId)) {
        mainMap.removeLayer(buildingHighlightLayerId)
      }

      // Clear selected building
      setSelectedBuilding(null)
    }

    prevEnabledRef.current = buildings3DEnabled

    return () => {
      // Cleanup on unmount
      if (mainMap) {
        try {
          if (mainMap.getLayer(buildingLayerId)) mainMap.removeLayer(buildingLayerId)
          if (mainMap.getLayer(buildingHighlightLayerId)) mainMap.removeLayer(buildingHighlightLayerId)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [buildings3DEnabled, buildingExtrusion, terrainExaggeration])

  // Handle building click for selection
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!buildings3DEnabled) return

    const mainMap = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
    if (!mainMap) return

    const buildingLayerId = '3d-buildings-explorer'
    const buildingHighlightLayerId = '3d-buildings-highlight'

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (toolMode !== 'navigate') return
      if (!mainMap.getLayer(buildingLayerId)) return

      const features = mainMap.queryRenderedFeatures(e.point, { layers: [buildingLayerId] })
      if (features.length === 0) {
        // Deselect
        setSelectedBuilding(null)
        if (mainMap.getLayer(buildingHighlightLayerId)) {
          mainMap.setFilter(buildingHighlightLayerId, ['==', ['get', 'id'], ''])
        }
        return
      }

      const feature = features[0]
      const props = feature.properties || {}
      const height = Number(props.render_height || props.height || 0)
      const minHeight = Number(props.render_min_height || props.min_height || 0)
      const name = props.name || 'Unknown Building'
      const buildingClass = String(props.class || props.building || 'building').replace(/_/g, ' ')
      const id = String(props.id || `building-${Date.now()}`)
      const levels = Math.max(1, Math.round((height - minHeight) / 3))

      // Determine building type from OSM class
      const typeMap: Record<string, string> = {
        residential: 'Residential',
        commercial: 'Commercial',
        industrial: 'Industrial',
        office: 'Office',
        retail: 'Retail',
        warehouse: 'Warehouse',
        religious: 'Religious',
        civic: 'Civic',
        hospital: 'Healthcare',
        school: 'Education',
        university: 'Education',
        hotel: 'Hospitality',
        apartments: 'Residential',
        house: 'Residential',
        detached: 'Residential',
        semidetached_house: 'Residential',
        terrace: 'Residential',
        construction: 'Under Construction',
      }
      const buildingType = typeMap[buildingClass.toLowerCase()] || buildingClass.charAt(0).toUpperCase() + buildingClass.slice(1)

      setSelectedBuilding({
        id,
        name,
        height,
        coordinates: [e.lngLat.lng, e.lngLat.lat],
        type: buildingType,
        levels,
      })

      // Highlight the building
      if (mainMap.getLayer(buildingHighlightLayerId)) {
        mainMap.setFilter(buildingHighlightLayerId, ['==', ['get', 'id'], id])
      }
    }

    const handleCursorEnter = () => {
      if (toolMode === 'navigate') mainMap.getCanvas().style.cursor = 'pointer'
    }
    const handleCursorLeave = () => {
      if (toolMode === 'navigate') mainMap.getCanvas().style.cursor = ''
    }

    if (mainMap.getLayer(buildingLayerId)) {
      mainMap.on('click', buildingLayerId, handleClick)
      mainMap.on('mouseenter', buildingLayerId, handleCursorEnter)
      mainMap.on('mouseleave', buildingLayerId, handleCursorLeave)
    }

    return () => {
      if (mainMap) {
        try {
          mainMap.off('click', buildingLayerId, handleClick)
          mainMap.off('mouseenter', buildingLayerId, handleCursorEnter)
          mainMap.off('mouseleave', buildingLayerId, handleCursorLeave)
        } catch {
          // Ignore
        }
      }
    }
  }, [buildings3DEnabled, toolMode, setSelectedBuilding])

  // This component doesn't render any UI - it manages map layers
  return null
}
