'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useMapStore, type ShadowBuilding } from '@/lib/map-store'
import { SunDim, Building2, Clock, Play, Pause, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

// ── Solar Position Algorithm (simplified) ──────────────────────────────

function toRad(deg: number) { return deg * Math.PI / 180 }
function toDeg(rad: number) { return rad * 180 / Math.PI }

function getJulianDay(dateStr: string): number {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.getTime() / 86400000 + 2440587.5
}

function calcSolarPosition(latitude: number, longitude: number, dateStr: string, hours: number) {
  const JD = getJulianDay(dateStr)
  const n = JD - 2451545.0 // days since J2000.0

  // Mean longitude (deg)
  const L = (280.460 + 0.9856474 * n) % 360
  // Mean anomaly (deg)
  const g = (357.528 + 0.9856003 * n) % 360
  // Ecliptic longitude (deg)
  const lambda = L + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2 * g))
  // Obliquity of ecliptic (deg)
  const epsilon = 23.439 - 0.0000004 * n
  // Right ascension
  const RA = toDeg(Math.atan2(Math.cos(toRad(epsilon)) * Math.sin(toRad(lambda)), Math.cos(toRad(lambda))))
  // Declination
  const declination = toDeg(Math.asin(Math.sin(toRad(epsilon)) * Math.sin(toRad(lambda))))

  // Hour angle
  const GMST = (280.46061837 + 360.98564736629 * n) % 360
  const LST = (GMST + longitude) % 360
  const HA = LST - RA

  // Altitude
  const sinAlt = Math.sin(toRad(latitude)) * Math.sin(toRad(declination)) +
    Math.cos(toRad(latitude)) * Math.cos(toRad(declination)) * Math.cos(toRad(HA + (hours - 12) * 15))
  const altitude = toDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))))

  // Azimuth
  const cosAz = (Math.sin(toRad(declination)) - Math.sin(toRad(latitude)) * Math.sin(toRad(altitude))) /
    (Math.cos(toRad(latitude)) * Math.cos(toRad(altitude)) + 1e-10)
  let azimuth = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))))
  const sinHA = Math.sin(toRad(HA + (hours - 12) * 15))
  if (sinHA > 0) azimuth = 360 - azimuth

  return { altitude, azimuth, declination }
}

function calcShadowLength(height: number, altitudeDeg: number): number {
  if (altitudeDeg <= 0) return Infinity
  return height / Math.tan(toRad(altitudeDeg))
}

function calcShadowBearing(azimuthDeg: number): number {
  // Shadow points opposite to the sun's azimuth
  return (azimuthDeg + 180) % 360
}

// ── Time utilities ──────────────────────────────────────

function formatTime(hours: number): string {
  const h = Math.floor(hours) % 24
  const m = Math.floor((hours % 1) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function getGoldenBlueHours(latitude: number, longitude: number, dateStr: string) {
  // Calculate golden/blue hour by scanning the day
  let goldenStart = -1, goldenEnd = -1
  let blueStart = -1, blueEnd = -1
  let solarNoon = 12

  let maxAlt = -90
  for (let h = 0; h <= 24; h += 0.1) {
    const { altitude } = calcSolarPosition(latitude, longitude, dateStr, h)
    if (altitude > maxAlt) {
      maxAlt = altitude
      solarNoon = h
    }
  }

  // Golden hour: altitude between -4 and 6
  for (let h = 0; h <= 24; h += 0.05) {
    const { altitude } = calcSolarPosition(latitude, longitude, dateStr, h)
    if (altitude >= -4 && altitude <= 6) {
      if (goldenStart < 0) goldenStart = h
      goldenEnd = h
    }
  }

  // Blue hour: altitude between -6 and -4
  for (let h = 0; h <= 24; h += 0.05) {
    const { altitude } = calcSolarPosition(latitude, longitude, dateStr, h)
    if (altitude >= -6 && altitude < -4) {
      if (blueStart < 0) blueStart = h
      blueEnd = h
    }
  }

  return { goldenStart, goldenEnd, blueStart, blueEnd, solarNoon }
}

// ── Map interaction ──────────────────────────────────────

function addShadowToMap(
  building: ShadowBuilding,
  altitude: number,
  azimuth: number,
  sourceId: string
) {
  if (typeof window === 'undefined') return
  const map = (window as any).__mainMap
  if (!map) return

  const shadowLength = calcShadowLength(building.height, altitude)
  if (!isFinite(shadowLength) || shadowLength <= 0) {
    // Remove shadow if sun is below horizon
    if (map.getLayer(sourceId + '-fill')) map.removeLayer(sourceId + '-fill')
    if (map.getLayer(sourceId + '-stroke')) map.removeLayer(sourceId + '-stroke')
    if (map.getSource(sourceId)) map.removeSource(sourceId)
    return
  }

  const bearing = calcShadowBearing(azimuth)
  // Approximate meters to degrees at given latitude
  const metersPerDegLat = 111320
  const metersPerDegLng = 111320 * Math.cos(toRad(building.latitude))
  const dLat = (shadowLength * Math.cos(toRad(bearing))) / metersPerDegLat
  const dLng = (shadowLength * Math.sin(toRad(bearing))) / metersPerDegLng

  // Building width approximation (small)
  const bw = Math.min(building.height * 0.3, 10) / metersPerDegLng
  const bh = Math.min(building.height * 0.3, 10) / metersPerDegLat

  // Create shadow polygon: building rectangle projected in shadow direction
  const lng = building.longitude
  const lat = building.latitude
  const halfW = bw / 2
  const halfH = bh / 2

  const polygon = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[
        [lng - halfW, lat - halfH],
        [lng + halfW, lat - halfH],
        [lng + halfW + dLng, lat - halfH + dLat],
        [lng - halfW + dLng, lat - halfH + dLat],
        [lng - halfW + dLng, lat + halfH + dLat],
        [lng + halfW + dLng, lat + halfH + dLat],
        [lng + halfW, lat + halfH],
        [lng - halfW, lat + halfH],
        [lng - halfW, lat - halfH],
      ]],
    },
  }

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, { type: 'geojson', data: polygon })
  } else {
    (map.getSource(sourceId) as any).setData(polygon)
  }

  if (!map.getLayer(sourceId + '-fill')) {
    map.addLayer({
      id: sourceId + '-fill',
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#000000',
        'fill-opacity': 0.2,
      },
    })
  }

  if (!map.getLayer(sourceId + '-stroke')) {
    map.addLayer({
      id: sourceId + '-stroke',
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#000000',
        'line-width': 1,
        'line-opacity': 0.4,
      },
    })
  }
}

function removeShadowFromMap(sourceId: string) {
  if (typeof window === 'undefined') return
  const map = (window as any).__mainMap
  if (!map) return
  try {
    if (map.getLayer(sourceId + '-fill')) map.removeLayer(sourceId + '-fill')
    if (map.getLayer(sourceId + '-stroke')) map.removeLayer(sourceId + '-stroke')
    if (map.getSource(sourceId)) map.removeSource(sourceId)
  } catch {
    // ignore
  }
}

function addBuildingMarker(building: ShadowBuilding) {
  if (typeof window === 'undefined') return
  const map = (window as any).__mainMap
  if (!map) return

  const markerId = `shadow-building-${building.id}`
  const el = document.createElement('div')
  el.className = 'shadow-building-marker'
  el.innerHTML = `
    <div style="width:24px;height:32px;position:relative;display:flex;align-items:center;justify-content:center;">
      <svg width="24" height="32" viewBox="0 0 24 32">
        <rect x="4" y="8" width="16" height="22" rx="2" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
        <rect x="7" y="12" width="4" height="4" rx="0.5" fill="#94a3b8"/>
        <rect x="13" y="12" width="4" height="4" rx="0.5" fill="#94a3b8"/>
        <rect x="7" y="19" width="4" height="4" rx="0.5" fill="#94a3b8"/>
        <rect x="13" y="19" width="4" height="4" rx="0.5" fill="#94a3b8"/>
        <polygon points="3,9 12,2 21,9" fill="#475569" stroke="#334155" stroke-width="1"/>
      </svg>
    </div>
    <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:9px;white-space:nowrap;color:#334155;font-weight:600;background:rgba(255,255,255,0.85);padding:1px 4px;border-radius:3px;">${building.name}</div>
  `

  const marker = new (window as any).maplibregl.Marker({ element: el })
    .setLngLat([building.longitude, building.latitude])
    .addTo(map)

  ;(window as any)[markerId] = marker
}

function removeBuildingMarker(buildingId: string) {
  const markerId = `shadow-building-${buildingId}`
  const marker = (window as any)[markerId]
  if (marker) {
    marker.remove()
    delete (window as any)[markerId]
  }
}

// ── Component ──────────────────────────────────────

export function SunShadowCalculator() {
  const sunShadowOpen = useMapStore((s) => s.sunShadowOpen)
  const setSunShadowOpen = useMapStore((s) => s.setSunShadowOpen)
  const sunShadowState = useMapStore((s) => s.sunShadowState)
  const setSunShadowState = useMapStore((s) => s.setSunShadowState)
  const center = useMapStore((s) => s.center)

  const [placingBuilding, setPlacingBuilding] = useState(false)
  const [newBuildingName, setNewBuildingName] = useState('')
  const [newBuildingHeight, setNewBuildingHeight] = useState(30)
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { buildings, selectedTime, selectedDate, isAnimating, animationSpeed } = sunShadowState
  const latitude = center[1]
  const longitude = center[0]

  const sunPos = calcSolarPosition(latitude, longitude, selectedDate, selectedTime)
  const shadowBearing = calcShadowBearing(sunPos.azimuth)
  const isDaytime = sunPos.altitude > 0

  const { goldenStart, goldenEnd, blueStart, blueEnd, solarNoon } =
    getGoldenBlueHours(latitude, longitude, selectedDate)

  // Update shadows on map when state changes
  useEffect(() => {
    if (!sunShadowOpen) return
    buildings.forEach((b) => {
      addShadowToMap(b, sunPos.altitude, sunPos.azimuth, `shadow-${b.id}`)
    })
    return () => {
      buildings.forEach((b) => {
        removeShadowFromMap(`shadow-${b.id}`)
      })
    }
  }, [sunShadowOpen, buildings, selectedTime, selectedDate, sunPos.altitude, sunPos.azimuth])

  // Add/remove building markers
  useEffect(() => {
    if (!sunShadowOpen) return
    buildings.forEach((b) => {
      const markerId = `shadow-building-${b.id}`
      if (!(window as any)[markerId]) {
        addBuildingMarker(b)
      }
    })
    return () => {
      buildings.forEach((b) => {
        removeBuildingMarker(b.id)
      })
    }
  }, [sunShadowOpen, buildings])

  // Animation
  useEffect(() => {
    if (isAnimating && sunShadowOpen) {
      animationRef.current = setInterval(() => {
        setSunShadowState({
          selectedTime: ((sunShadowState.selectedTime + 0.1 * animationSpeed) % 24),
        })
      }, 100)
    }
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isAnimating, sunShadowOpen, animationSpeed, setSunShadowState, sunShadowState.selectedTime])

  // Map click handler for building placement
  useEffect(() => {
    if (!placingBuilding || !sunShadowOpen) return
    const map = (window as any).__mainMap
    if (!map) return

    const handleClick = (e: any) => {
      const { lng, lat } = e.lngLat
      const id = `b-${Date.now()}`
      const name = newBuildingName.trim() || `Building ${buildings.length + 1}`
      const newBuilding: ShadowBuilding = {
        id,
        longitude: lng,
        latitude: lat,
        height: newBuildingHeight,
        name,
      }
      setSunShadowState({ buildings: [...buildings, newBuilding] })
      setPlacingBuilding(false)
      setNewBuildingName('')
      toast.success(`Placed "${name}" on the map`)
    }

    map.on('click', handleClick)
    map.getCanvas().style.cursor = 'crosshair'
    return () => {
      map.off('click', handleClick)
      map.getCanvas().style.cursor = ''
    }
  }, [placingBuilding, sunShadowOpen, newBuildingName, newBuildingHeight, buildings, setSunShadowState])

  const handleRemoveBuilding = useCallback((id: string) => {
    removeBuildingMarker(id)
    removeShadowFromMap(`shadow-${id}`)
    setSunShadowState({ buildings: buildings.filter((b) => b.id !== id) })
  }, [buildings, setSunShadowState])

  const handleClearAll = useCallback(() => {
    buildings.forEach((b) => {
      removeBuildingMarker(b.id)
      removeShadowFromMap(`shadow-${b.id}`)
    })
    setSunShadowState({ buildings: [] })
    toast.success('All buildings cleared')
  }, [buildings, setSunShadowState])

  // Sun path data for the arc diagram
  const sunPathPoints: { time: number; alt: number; az: number }[] = []
  for (let h = 0; h <= 24; h += 0.5) {
    const pos = calcSolarPosition(latitude, longitude, selectedDate, h)
    sunPathPoints.push({ time: h, alt: pos.altitude, az: pos.azimuth })
  }

  return (
    <Dialog open={sunShadowOpen} onOpenChange={setSunShadowOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SunDim className="h-5 w-5 text-amber-500" />
            Sun Shadow Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate and visualize sun shadow directions on the map
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Sun Position */}
          <div className="space-y-3 p-3 rounded-lg bg-muted/50 border">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <SunDim className="h-4 w-4 text-amber-500" />
              Sun Position
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Altitude:</span>{' '}
                <span className="font-mono font-semibold">{sunPos.altitude.toFixed(1)}°</span>
                {!isDaytime && <span className="text-red-500 ml-1">(below horizon)</span>}
              </div>
              <div>
                <span className="text-muted-foreground">Azimuth:</span>{' '}
                <span className="font-mono font-semibold">{sunPos.azimuth.toFixed(1)}°</span>
              </div>
              <div>
                <span className="text-muted-foreground">Declination:</span>{' '}
                <span className="font-mono">{sunPos.declination.toFixed(1)}°</span>
              </div>
              <div>
                <span className="text-muted-foreground">Solar Noon:</span>{' '}
                <span className="font-mono">{formatTime(solarNoon)}</span>
              </div>
            </div>
            {(goldenStart >= 0 || blueStart >= 0) && (
              <div className="grid grid-cols-2 gap-3 text-xs mt-2 pt-2 border-t">
                {goldenStart >= 0 && (
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-muted-foreground">Golden Hour:</span>{' '}
                    <span className="font-mono">{formatTime(goldenStart)} - {formatTime(goldenEnd)}</span>
                  </div>
                )}
                {blueStart >= 0 && (
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-muted-foreground">Blue Hour:</span>{' '}
                    <span className="font-mono">{formatTime(blueStart)} - {formatTime(blueEnd)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sun Path Arc */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <h4 className="text-sm font-semibold mb-2">Sun Path (Today)</h4>
            <div className="relative w-full h-32 bg-gradient-to-b from-sky-200 to-orange-100 dark:from-slate-800 dark:to-slate-700 rounded-lg overflow-hidden">
              <svg viewBox="0 0 240 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Horizon line */}
                <line x1="0" y1="100" x2="240" y2="100" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,2" />
                <text x="5" y="98" fontSize="7" fill="#64748b">0°</text>
                <text x="5" y="52" fontSize="7" fill="#64748b">45°</text>
                <line x1="0" y1="52" x2="240" y2="52" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2,4" />
                {/* Sun path */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  points={sunPathPoints
                    .filter((p) => p.alt > -10)
                    .map((p) => {
                      const x = (p.time / 24) * 240
                      const y = 100 - Math.max(0, p.alt) * (90 / 100)
                      return `${x},${y}`
                    })
                    .join(' ')}
                />
                {/* Current sun position */}
                {isDaytime && (
                  <circle
                    cx={(selectedTime / 24) * 240}
                    cy={100 - sunPos.altitude * (90 / 100)}
                    r="5"
                    fill="#f59e0b"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                )}
                {/* Time labels */}
                <text x="10" y="115" fontSize="7" fill="#64748b">6:00</text>
                <text x="60" y="115" fontSize="7" fill="#64748b">9:00</text>
                <text x="110" y="115" fontSize="7" fill="#64748b">12:00</text>
                <text x="160" y="115" fontSize="7" fill="#64748b">15:00</text>
                <text x="210" y="115" fontSize="7" fill="#64748b">18:00</text>
              </svg>
            </div>
          </div>

          {/* Time & Date Controls */}
          <div className="space-y-3 p-3 rounded-lg bg-muted/50 border">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Time & Date
            </h4>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Time: {formatTime(selectedTime)}
              </Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[selectedTime]}
                  onValueChange={([v]) => setSunShadowState({ selectedTime: v })}
                  min={0}
                  max={24}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs font-mono w-12 text-right">{formatTime(selectedTime)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSunShadowState({ selectedDate: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isAnimating ? 'destructive' : 'default'}
                className="h-8 text-xs gap-1"
                onClick={() => setSunShadowState({ isAnimating: !isAnimating })}
              >
                {isAnimating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isAnimating ? 'Pause' : 'Play'}
              </Button>
              <Label className="text-xs text-muted-foreground">Speed:</Label>
              <Slider
                value={[animationSpeed]}
                onValueChange={([v]) => setSunShadowState({ animationSpeed: v })}
                min={0.5}
                max={5}
                step={0.5}
                className="flex-1"
              />
              <span className="text-xs font-mono">{animationSpeed}x</span>
            </div>
            {/* Quick time buttons */}
            <div className="flex flex-wrap gap-1">
              {[6, 8, 10, 12, 14, 16, 18, 20].map((h) => (
                <Button
                  key={h}
                  size="sm"
                  variant={Math.floor(selectedTime) === h ? 'default' : 'outline'}
                  className="h-7 text-[10px] px-2"
                  onClick={() => setSunShadowState({ selectedTime: h })}
                >
                  {formatTime(h)}
                </Button>
              ))}
            </div>
          </div>

          {/* Shadow Analysis */}
          {buildings.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                Shadow Analysis
              </h4>
              {buildings.map((b) => {
                const shadowLen = calcShadowLength(b.height, sunPos.altitude)
                return (
                  <div key={b.id} className="text-xs space-y-1 p-2 bg-background rounded border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{b.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleRemoveBuilding(b.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-muted-foreground">
                      <span>Height: {b.height}m</span>
                      <span>Shadow: {isFinite(shadowLen) ? `${shadowLen.toFixed(1)}m` : '∞ (night)'}</span>
                      <span>Bearing: {isDaytime ? `${shadowBearing.toFixed(1)}°` : 'N/A'}</span>
                      <span>Angle: {isDaytime ? `${(90 - sunPos.altitude).toFixed(1)}°` : 'N/A'}</span>
                    </div>
                  </div>
                )
              })}
              <Button
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs text-red-500 hover:text-red-600"
                onClick={handleClearAll}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All Buildings
              </Button>
            </div>
          )}

          {/* Add Building */}
          <div className="p-3 rounded-lg bg-muted/50 border space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-500" />
              Place Building
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={newBuildingName}
                  onChange={(e) => setNewBuildingName(e.target.value)}
                  placeholder="Building name..."
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Height (m)</Label>
                <Input
                  type="number"
                  value={newBuildingHeight}
                  onChange={(e) => setNewBuildingHeight(Number(e.target.value) || 10)}
                  min={1}
                  max={1000}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <Button
              size="sm"
              variant={placingBuilding ? 'destructive' : 'default'}
              className="w-full h-8 text-xs gap-1"
              onClick={() => {
                if (placingBuilding) {
                  setPlacingBuilding(false)
                } else {
                  setPlacingBuilding(true)
                  toast.info('Click on the map to place a building')
                }
              }}
            >
              {placingBuilding ? (
                <>Cancel Placement</>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Click Map to Place
                </>
              )}
            </Button>
            {placingBuilding && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center animate-pulse">
                Click anywhere on the map to place the building...
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
