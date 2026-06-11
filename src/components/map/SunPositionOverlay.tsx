'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/lib/map-store'

/**
 * Solar calculation utilities (client-side for terminator polygon generation)
 */
const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

function toDays(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5 - 2451545
}

function solarMeanAnomaly(days: number): number {
  return DEG_TO_RAD * (357.5291 + 0.98560028 * days)
}

function eclipticLongitude(M: number): number {
  const C = DEG_TO_RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  const P = DEG_TO_RAD * 102.9372
  return M + C + P + Math.PI
}

function getSolarDecAndRA(date: Date): { dec: number; ra: number } {
  const days = toDays(date)
  const M = solarMeanAnomaly(days)
  const L = eclipticLongitude(M)
  const dec = Math.asin(Math.sin(L) * Math.sin(DEG_TO_RAD * 23.4397))
  const ra = Math.atan2(Math.sin(L) * Math.cos(DEG_TO_RAD * 23.4397), Math.cos(L))
  return { dec, ra }
}

function getSubsolarPoint(date: Date): { lat: number; lng: number } {
  const { dec } = getSolarDecAndRA(date)
  const fractionalHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const lng = (12 - fractionalHours) * 15
  return {
    lat: dec * RAD_TO_DEG,
    lng: ((lng + 180) % 360) - 180,
  }
}

function getHourAngle(date: Date, lngRad: number): number {
  const days = toDays(date)
  const { ra } = getSolarDecAndRA(date)
  const theta = DEG_TO_RAD * (280.16 + 360.9856235 * days) + lngRad
  return theta - ra
}

/**
 * Calculate the latitude where the sun is at a given altitude for a specific longitude.
 * sin(alt) = sin(lat)*sin(dec) + cos(lat)*cos(dec)*cos(H)
 * Rewrite as: A*sin(lat) + B*cos(lat) = sin(alt)
 * where A = sin(dec), B = cos(dec)*cos(H)
 * Solution: lat = asin(sin(alt) / sqrt(A²+B²)) - atan2(B, A)
 */
function getLatitudeAtAltitude(altitude: number, dec: number, H: number): number | null {
  const a = Math.sin(altitude * DEG_TO_RAD)
  const A = Math.sin(dec)
  const B = Math.cos(dec) * Math.cos(H)
  const R = Math.sqrt(A * A + B * B)

  if (R < 1e-10) return null

  const ratio = a / R
  if (ratio < -1 || ratio > 1) return null

  return (Math.asin(ratio) - Math.atan2(B, A)) * RAD_TO_DEG
}

/**
 * Generate the terminator polygon (night side of Earth)
 */
function generateTerminatorPolygon(date: Date): GeoJSON.Feature {
  const subsolar = getSubsolarPoint(date)
  const { dec } = getSolarDecAndRA(date)

  const terminatorPoints: [number, number][] = []

  for (let lngDeg = -180; lngDeg <= 180; lngDeg += 1) {
    const lngRad = lngDeg * DEG_TO_RAD
    const H = getHourAngle(date, lngRad)

    const tanDec = Math.tan(dec)
    if (Math.abs(tanDec) < 1e-10) {
      terminatorPoints.push([lngDeg, 0])
    } else {
      const termLat = Math.atan(-Math.cos(H) / tanDec) * RAD_TO_DEG
      terminatorPoints.push([lngDeg, termLat])
    }
  }

  // Determine which pole is in darkness
  const northIsDark = subsolar.lat < 0

  // Build the night polygon
  const polygonCoords: [number, number][] = []

  for (const point of terminatorPoints) {
    polygonCoords.push(point)
  }

  if (northIsDark) {
    polygonCoords.push([180, 90])
    polygonCoords.push([-180, 90])
  } else {
    polygonCoords.push([180, -90])
    polygonCoords.push([-180, -90])
  }

  polygonCoords.push(polygonCoords[0])

  return {
    type: 'Feature',
    properties: { type: 'night' },
    geometry: {
      type: 'Polygon',
      coordinates: [polygonCoords],
    },
  }
}

/**
 * Generate twilight band polygon between two sun altitude angles
 */
function generateTwilightBand(date: Date, innerAngle: number, outerAngle: number): GeoJSON.Feature {
  const { dec } = getSolarDecAndRA(date)

  const outerPoints: [number, number][] = []
  const innerPoints: [number, number][] = []

  for (let lngDeg = -180; lngDeg <= 180; lngDeg += 1) {
    const lngRad = lngDeg * DEG_TO_RAD
    const H = getHourAngle(date, lngRad)

    const outerLat = getLatitudeAtAltitude(outerAngle, dec, H)
    const innerLat = getLatitudeAtAltitude(innerAngle, dec, H)

    if (outerLat !== null) outerPoints.push([lngDeg, outerLat])
    if (innerLat !== null) innerPoints.push([lngDeg, innerLat])
  }

  if (outerPoints.length < 2 || innerPoints.length < 2) {
    return {
      type: 'Feature',
      properties: { type: 'twilight', innerAngle, outerAngle },
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [0, 0], [0, 0]]] },
    }
  }

  const polygonCoords: [number, number][] = [
    ...outerPoints,
    ...innerPoints.reverse(),
    outerPoints[0],
  ]

  return {
    type: 'Feature',
    properties: { type: 'twilight', innerAngle, outerAngle },
    geometry: { type: 'Polygon', coordinates: [polygonCoords] },
  }
}

function generateSubsolarPoint(date: Date): GeoJSON.Feature {
  const subsolar = getSubsolarPoint(date)
  return {
    type: 'Feature',
    properties: { type: 'subsolar', lat: subsolar.lat, lng: subsolar.lng },
    geometry: { type: 'Point', coordinates: [subsolar.lng, subsolar.lat] },
  }
}

const SOURCE_IDS = {
  night: 'sun-night-source',
  golden: 'sun-golden-source',
  blue: 'sun-blue-source',
  subsolar: 'sun-subsolar-source',
}

const LAYER_IDS = {
  night: 'sun-night-layer',
  golden: 'sun-golden-layer',
  blue: 'sun-blue-layer',
  subsolar: 'sun-subsolar-layer',
  subsolarGlow: 'sun-subsolar-glow-layer',
}

function removeSunLayers(map: maplibregl.Map) {
  try {
    if (map.getLayer(LAYER_IDS.subsolar)) map.removeLayer(LAYER_IDS.subsolar)
    if (map.getLayer(LAYER_IDS.subsolarGlow)) map.removeLayer(LAYER_IDS.subsolarGlow)
    if (map.getLayer(LAYER_IDS.blue)) map.removeLayer(LAYER_IDS.blue)
    if (map.getLayer(LAYER_IDS.golden)) map.removeLayer(LAYER_IDS.golden)
    if (map.getLayer(LAYER_IDS.night)) map.removeLayer(LAYER_IDS.night)
    if (map.getSource(SOURCE_IDS.subsolar)) map.removeSource(SOURCE_IDS.subsolar)
    if (map.getSource(SOURCE_IDS.blue)) map.removeSource(SOURCE_IDS.blue)
    if (map.getSource(SOURCE_IDS.golden)) map.removeSource(SOURCE_IDS.golden)
    if (map.getSource(SOURCE_IDS.night)) map.removeSource(SOURCE_IDS.night)
  } catch {
    // Silently handle cleanup errors
  }
}

function addSunLayers(map: maplibregl.Map) {
  if (!map || !useMapStore.getState().sunPositionEnabled) return

  const now = new Date()

  // Night side polygon
  if (!map.getSource(SOURCE_IDS.night)) {
    map.addSource(SOURCE_IDS.night, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [generateTerminatorPolygon(now)] },
    })
  }
  if (!map.getLayer(LAYER_IDS.night)) {
    map.addLayer({
      id: LAYER_IDS.night,
      type: 'fill',
      source: SOURCE_IDS.night,
      paint: { 'fill-color': '#0a0a1a', 'fill-opacity': 0.18 },
    })
  }

  // Golden hour band
  if (!map.getSource(SOURCE_IDS.golden)) {
    map.addSource(SOURCE_IDS.golden, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [generateTwilightBand(now, -4, 6)] },
    })
  }
  if (!map.getLayer(LAYER_IDS.golden)) {
    map.addLayer({
      id: LAYER_IDS.golden,
      type: 'fill',
      source: SOURCE_IDS.golden,
      paint: { 'fill-color': '#f59e0b', 'fill-opacity': 0.08 },
    })
  }

  // Blue hour band
  if (!map.getSource(SOURCE_IDS.blue)) {
    map.addSource(SOURCE_IDS.blue, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [generateTwilightBand(now, -6, -4)] },
    })
  }
  if (!map.getLayer(LAYER_IDS.blue)) {
    map.addLayer({
      id: LAYER_IDS.blue,
      type: 'fill',
      source: SOURCE_IDS.blue,
      paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.06 },
    })
  }

  // Subsolar point
  if (!map.getSource(SOURCE_IDS.subsolar)) {
    map.addSource(SOURCE_IDS.subsolar, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [generateSubsolarPoint(now)] },
    })
  }
  if (!map.getLayer(LAYER_IDS.subsolarGlow)) {
    map.addLayer({
      id: LAYER_IDS.subsolarGlow,
      type: 'circle',
      source: SOURCE_IDS.subsolar,
      paint: { 'circle-radius': 18, 'circle-color': '#fbbf24', 'circle-opacity': 0.15, 'circle-blur': 0.8 },
    })
  }
  if (!map.getLayer(LAYER_IDS.subsolar)) {
    map.addLayer({
      id: LAYER_IDS.subsolar,
      type: 'circle',
      source: SOURCE_IDS.subsolar,
      paint: { 'circle-radius': 8, 'circle-color': '#fbbf24', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-opacity': 0.9 },
    })
  }
}

export function SunPositionOverlay() {
  const sunPositionEnabled = useMapStore((s) => s.sunPositionEnabled)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)

  const updateSunData = useCallback(() => {
    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (!map) return

    const now = new Date()

    const nightSource = map.getSource(SOURCE_IDS.night) as maplibregl.GeoJSONSource | undefined
    if (nightSource) nightSource.setData({ type: 'FeatureCollection', features: [generateTerminatorPolygon(now)] })

    const goldenSource = map.getSource(SOURCE_IDS.golden) as maplibregl.GeoJSONSource | undefined
    if (goldenSource) goldenSource.setData({ type: 'FeatureCollection', features: [generateTwilightBand(now, -4, 6)] })

    const blueSource = map.getSource(SOURCE_IDS.blue) as maplibregl.GeoJSONSource | undefined
    if (blueSource) blueSource.setData({ type: 'FeatureCollection', features: [generateTwilightBand(now, -6, -4)] })

    const subsolarSource = map.getSource(SOURCE_IDS.subsolar) as maplibregl.GeoJSONSource | undefined
    if (subsolarSource) subsolarSource.setData({ type: 'FeatureCollection', features: [generateSubsolarPoint(now)] })
  }, [])

  const handleMouseMove = useCallback((e: maplibregl.MapMouseEvent) => {
    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (!map) return

    const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_IDS.subsolar] })
    if (features.length > 0) {
      const coords = features[0].geometry as GeoJSON.Point
      const props = features[0].properties
      map.getCanvas().style.cursor = 'pointer'
      if (!popupRef.current) {
        popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 15, className: 'sun-popup' })
      }
      popupRef.current
        .setLngLat(coords.coordinates as [number, number])
        .setHTML(
          `<div style="padding:6px 10px;font-size:12px;font-family:system-ui;">
            <div style="font-weight:600;margin-bottom:4px;">☀️ Subsolar Point</div>
            <div style="color:#666;font-size:11px;">Lat: ${props?.lat?.toFixed(2)}° | Lng: ${props?.lng?.toFixed(2)}°</div>
          </div>`
        )
        .addTo(map)
    } else {
      map.getCanvas().style.cursor = ''
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (!map || !sunPositionEnabled) return

    const addLayersWhenReady = () => {
      addSunLayers(map)
      map.on('mousemove', handleMouseMove)
      intervalRef.current = setInterval(updateSunData, 60000)
    }

    if (!map.isStyleLoaded()) {
      const onStyleLoad = () => { addLayersWhenReady() }
      map.once('style.load', onStyleLoad)
      return () => {
        map.off('style.load', onStyleLoad)
      }
    }

    addLayersWhenReady()

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }
      const currentMap = (window as unknown as Record<string, maplibregl.Map>).__mainMap
      if (currentMap) {
        currentMap.off('mousemove', handleMouseMove)
        removeSunLayers(currentMap)
      }
    }
  }, [sunPositionEnabled, handleMouseMove, updateSunData])

  // Handle the case when overlay is disabled
  useEffect(() => {
    if (sunPositionEnabled) return

    const map = (window as unknown as Record<string, maplibregl.Map>).__mainMap
    if (!map) return

    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }
    map.off('mousemove', handleMouseMove)
    removeSunLayers(map)
  }, [sunPositionEnabled, handleMouseMove])

  return null
}
