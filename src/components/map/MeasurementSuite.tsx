'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MeasurementResult } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  Triangle,
  Ruler,
  Circle,
  Copy,
  Save,
  History,
  ArrowRightLeft,
  Trash2,
  MapPin,
  Play,
  Square,
  RotateCcw,
} from 'lucide-react'

// Haversine distance in meters
function haversineDistance(p1: [number, number], p2: [number, number]): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(p2[1] - p1[1])
  const dLng = toRad(p2[0] - p1[0])
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1[1])) * Math.cos(toRad(p2[1])) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Area of polygon (shoelace) in m²
function polygonArea(points: [number, number][]): number {
  if (points.length < 3) return 0
  let area = 0
  const n = points.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += points[i][0] * points[j][1]
    area -= points[j][0] * points[i][1]
  }
  // Convert degree² to m² (approximate)
  const lat = points.reduce((s, p) => s + p[1], 0) / n
  const mPerDegLat = 111320
  const mPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180)
  area = Math.abs(area) / 2
  return area * mPerDegLat * mPerDegLng
}

// Angle between three points (at point[1])
function angleBetweenPoints(p1: [number, number], p2: [number, number], p3: [number, number]): number {
  const v1 = [p1[0] - p2[0], p1[1] - p2[1]]
  const v2 = [p3[0] - p2[0], p3[1] - p2[1]]
  const dot = v1[0] * v2[0] + v1[1] * v2[1]
  const mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2)
  const mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2)
  if (mag1 === 0 || mag2 === 0) return 0
  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)))
  return (Math.acos(cosAngle) * 180) / Math.PI
}

function formatDistance(meters: number, system: 'metric' | 'imperial'): string {
  if (system === 'imperial') {
    const ft = meters * 3.28084
    if (ft < 5280) return `${ft.toFixed(1)} ft`
    return `${(ft / 5280).toFixed(2)} mi`
  }
  if (meters < 1000) return `${meters.toFixed(1)} m`
  return `${(meters / 1000).toFixed(2)} km`
}

function formatArea(m2: number, system: 'metric' | 'imperial'): string {
  if (system === 'imperial') {
    const acres = m2 / 4046.86
    if (acres < 1) return `${(m2 * 10.7639).toFixed(1)} ft²`
    return `${acres.toFixed(2)} acre`
  }
  if (m2 < 10000) return `${m2.toFixed(1)} m²`
  if (m2 < 1000000) return `${(m2 / 10000).toFixed(2)} ha`
  return `${(m2 / 1000000).toFixed(2)} km²`
}

function getUnitLabel(type: string, system: 'metric' | 'imperial'): string {
  if (type === 'distance' || type === 'perimeter') return system === 'imperial' ? (system === 'imperial' ? 'ft/mi' : 'ft/mi') : 'm/km'
  if (type === 'area' || type === 'circle') return system === 'imperial' ? 'ft²/acre' : 'm²/ha/km²'
  if (type === 'angle') return 'degrees'
  return ''
}

const MODE_INFO: Record<string, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
  distance: { label: 'Distance', icon: <Ruler className="h-4 w-4" />, color: 'bg-amber-500', desc: 'Click points to measure total & segment distances' },
  area: { label: 'Area', icon: <Triangle className="h-4 w-4" />, color: 'bg-emerald-500', desc: 'Click points to define a polygon area' },
  angle: { label: 'Angle', icon: <Triangle className="h-4 w-4" />, color: 'bg-violet-500', desc: 'Click 3 points to measure angle at center point' },
  circle: { label: 'Circle', icon: <Circle className="h-4 w-4" />, color: 'bg-cyan-500', desc: 'Click center, then edge to set radius' },
  perimeter: { label: 'Perimeter', icon: <Ruler className="h-4 w-4" />, color: 'bg-orange-500', desc: 'Click points to measure perimeter of any shape' },
}

export function MeasurementSuite() {
  const measurementSuiteOpen = useMapStore((s) => s.measurementSuiteOpen)
  const setMeasurementSuiteOpen = useMapStore((s) => s.setMeasurementSuiteOpen)
  const measurementSuite = useMapStore((s) => s.measurementSuite)
  const setMeasurementSuite = useMapStore((s) => s.setMeasurementSuite)
  const addMeasurementResult = useMapStore((s) => s.addMeasurementResult)
  const clearMeasurementResults = useMapStore((s) => s.clearMeasurementResults)
  const addSavedLocation = useMapStore((s) => s.addSavedLocation)
  const addAnnotation = useMapStore((s) => s.addAnnotation)

  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([])
  const [circleCenter, setCircleCenter] = useState<[number, number] | null>(null)
  const [circleRadius, setCircleRadius] = useState<number>(0)
  const mapClickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)

  const { mode, unitSystem, results, activeMode } = measurementSuite

  // Compute live measurement value
  const liveValue = useCallback(() => {
    if (currentPoints.length === 0) return null
    if (mode === 'distance' || mode === 'perimeter') {
      let total = 0
      for (let i = 1; i < currentPoints.length; i++) {
        total += haversineDistance(currentPoints[i - 1], currentPoints[i])
      }
      if (mode === 'perimeter' && currentPoints.length > 2) {
        total += haversineDistance(currentPoints[currentPoints.length - 1], currentPoints[0])
      }
      return total
    }
    if (mode === 'area') {
      if (currentPoints.length < 3) return null
      return polygonArea(currentPoints)
    }
    if (mode === 'angle') {
      if (currentPoints.length < 3) return null
      return angleBetweenPoints(currentPoints[0], currentPoints[1], currentPoints[2])
    }
    if (mode === 'circle') {
      if (!circleCenter || circleRadius === 0) return null
      return circleRadius
    }
    return null
  }, [currentPoints, mode, circleCenter, circleRadius])

  // Segment distances for distance mode
  const segmentDistances = useCallback(() => {
    const dists: number[] = []
    for (let i = 1; i < currentPoints.length; i++) {
      dists.push(haversineDistance(currentPoints[i - 1], currentPoints[i]))
    }
    return dists
  }, [currentPoints])

  // Handle map click for measurement
  useEffect(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap as maplibregl.Map | undefined
    if (!map) return

    // Remove old handler
    if (mapClickHandlerRef.current) {
      map.off('click', mapClickHandlerRef.current)
      mapClickHandlerRef.current = null
    }

    if (!activeMode) return

    const handler = (e: maplibregl.MapMouseEvent) => {
      const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat]

      if (mode === 'circle') {
        if (!circleCenter) {
          setCircleCenter(pt)
        } else {
          const radius = haversineDistance(circleCenter, pt)
          setCircleRadius(radius)
        }
        return
      }

      if (mode === 'angle' && currentPoints.length >= 3) {
        // Reset for new angle
        setCurrentPoints([pt])
        return
      }

      setCurrentPoints((prev) => [...prev, pt])
    }

    map.on('click', handler)
    mapClickHandlerRef.current = handler

    return () => {
      if (mapClickHandlerRef.current) {
        map.off('click', mapClickHandlerRef.current)
        mapClickHandlerRef.current = null
      }
    }
  }, [activeMode, mode, circleCenter, currentPoints.length])

  // Draw measurement on map
  useEffect(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap as maplibregl.Map | undefined
    if (!map) return

    const sourceId = 'measurement-suite-source'
    const layerId = 'measurement-suite-layer'
    const pointLayerId = 'measurement-suite-points'

    // Remove old layers/sources
    if (map.getLayer(layerId)) map.removeLayer(layerId)
    if (map.getLayer(pointLayerId)) map.removeLayer(pointLayerId)
    if (map.getSource(sourceId)) map.removeSource(sourceId)

    if (!activeMode || currentPoints.length === 0) return

    let geojson: GeoJSON.FeatureCollection

    if (mode === 'circle' && circleCenter) {
      // Generate circle polygon
      const points: [number, number][] = []
      const n = 64
      for (let i = 0; i <= n; i++) {
        const angle = (2 * Math.PI * i) / n
        const lat = circleCenter[1] + (circleRadius * Math.cos(angle)) / 111320
        const lng = circleCenter[0] + (circleRadius * Math.sin(angle)) / (111320 * Math.cos((circleCenter[1] * Math.PI) / 180))
        points.push([lng, lat])
      }
      geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Polygon', coordinates: [points] },
          },
          {
            type: 'Feature',
            properties: { isPoint: true },
            geometry: { type: 'Point', coordinates: circleCenter },
          },
        ],
      }
    } else if (mode === 'area' && currentPoints.length >= 3) {
      geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Polygon', coordinates: [[...currentPoints, currentPoints[0]]] },
          },
          {
            type: 'Feature',
            properties: { isPoint: true },
            geometry: { type: 'MultiPoint', coordinates: currentPoints },
          },
        ],
      }
    } else {
      // Line for distance/perimeter/angle
      const lineCoords = mode === 'perimeter' && currentPoints.length > 2
        ? [...currentPoints, currentPoints[0]]
        : currentPoints
      geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: lineCoords },
          },
          {
            type: 'Feature',
            properties: { isPoint: true },
            geometry: { type: 'MultiPoint', coordinates: currentPoints },
          },
        ],
      }
    }

    map.addSource(sourceId, { type: 'geojson', data: geojson })

    const isAreaMode = mode === 'area' || mode === 'circle'
    map.addLayer({
      id: layerId,
      type: isAreaMode ? 'fill' : 'line',
      source: sourceId,
      filter: ['!=', ['get', 'isPoint'], true],
      paint: isAreaMode
        ? {
            'fill-color': '#10b981',
            'fill-opacity': 0.25,
          }
        : {
            'line-color': '#10b981',
            'line-width': 3,
            'line-dasharray': [2, 1],
          },
    })

    map.addLayer({
      id: pointLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['==', ['get', 'isPoint'], true],
      paint: {
        'circle-radius': 5,
        'circle-color': '#10b981',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getLayer(pointLayerId)) map.removeLayer(pointLayerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    }
  }, [activeMode, currentPoints, mode, circleCenter, circleRadius])

  const toggleActive = useCallback(() => {
    if (activeMode) {
      setMeasurementSuite({ activeMode: false })
      setCurrentPoints([])
      setCircleCenter(null)
      setCircleRadius(0)
    } else {
      setMeasurementSuite({ activeMode: true })
    }
  }, [activeMode, setMeasurementSuite])

  const finishMeasurement = useCallback(() => {
    const value = liveValue()
    if (value === null || currentPoints.length === 0) {
      toast.error('No measurement to save')
      return
    }

    let displayValue = value
    let unit = ''
    if (mode === 'distance' || mode === 'perimeter') {
      unit = unitSystem === 'imperial' ? (value * 3.28084 < 5280 ? 'ft' : 'mi') : (value < 1000 ? 'm' : 'km')
      if (unit === 'km') displayValue = value / 1000
      else if (unit === 'mi') displayValue = (value * 3.28084) / 5280
      else if (unit === 'ft') displayValue = value * 3.28084
    } else if (mode === 'area' || mode === 'circle') {
      unit = unitSystem === 'imperial' ? 'acre' : (value < 10000 ? 'm²' : value < 1000000 ? 'ha' : 'km²')
      if (unit === 'ha') displayValue = value / 10000
      else if (unit === 'km²') displayValue = value / 1000000
      else if (unit === 'acre') displayValue = value / 4046.86
    } else if (mode === 'angle') {
      unit = '°'
    }

    const result: MeasurementResult = {
      id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: mode,
      value: displayValue,
      unit,
      points: mode === 'circle' && circleCenter ? [circleCenter] : [...currentPoints],
      timestamp: Date.now(),
    }

    addMeasurementResult(result)
    setCurrentPoints([])
    setCircleCenter(null)
    setCircleRadius(0)
    toast.success('Measurement saved')
  }, [liveValue, currentPoints, mode, unitSystem, circleCenter, addMeasurementResult])

  const resetCurrent = useCallback(() => {
    setCurrentPoints([])
    setCircleCenter(null)
    setCircleRadius(0)
  }, [])

  const copyResult = useCallback((result: MeasurementResult) => {
    const text = `${result.type}: ${result.value.toFixed(2)} ${result.unit}`
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy')
    })
  }, [])

  const saveAsLocation = useCallback((result: MeasurementResult) => {
    if (result.points.length === 0) return
    const [lng, lat] = result.points[0]
    addSavedLocation({
      id: `loc-${Date.now()}`,
      name: `${result.type} measurement`,
      description: `${result.value.toFixed(2)} ${result.unit}`,
      latitude: lat,
      longitude: lng,
      category: 'measurement',
      color: '#10b981',
      icon: 'Ruler',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    toast.success('Saved as location')
  }, [addSavedLocation])

  const saveAsAnnotation = useCallback((result: MeasurementResult) => {
    if (result.points.length === 0) return
    const [lng, lat] = result.points[0]
    addAnnotation({
      id: `ann-${Date.now()}`,
      longitude: lng,
      latitude: lat,
      text: `${result.type}: ${result.value.toFixed(2)} ${result.unit}`,
      fontSize: 14,
      color: '#10b981',
      rotation: 0,
      createdAt: new Date().toISOString(),
    })
    toast.success('Saved as annotation')
  }, [addAnnotation])

  const val = liveValue()

  return (
    <Dialog open={measurementSuiteOpen} onOpenChange={setMeasurementSuiteOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Triangle className="h-5 w-5 text-emerald-500" />
            Measurement Suite
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="measure" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="measure">Measure</TabsTrigger>
            <TabsTrigger value="results">
              Results
              {results.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-[10px] px-1.5">
                  {results.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="measure" className="flex-1 overflow-auto mt-2">
            <div className="space-y-4">
              {/* Mode selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Measurement Mode</label>
                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(MODE_INFO).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setMeasurementSuite({ mode: key as MeasurementSuiteState['mode'] })
                        resetCurrent()
                      }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                        mode === key
                          ? `${info.color} text-white shadow-md`
                          : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {info.icon}
                      <span className="text-[9px] font-medium">{info.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">{MODE_INFO[mode]?.desc}</p>
              </div>

              {/* Unit system toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Unit System</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() =>
                    setMeasurementSuite({ unitSystem: unitSystem === 'metric' ? 'imperial' : 'metric' })
                  }
                >
                  <ArrowRightLeft className="h-3 w-3" />
                  {unitSystem === 'metric' ? 'Metric' : 'Imperial'}
                </Button>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2">
                <Button
                  className={`flex-1 gap-2 ${activeMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                  onClick={toggleActive}
                >
                  {activeMode ? (
                    <>
                      <Square className="h-4 w-4" /> Stop Measuring
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Start Measuring
                    </>
                  )}
                </Button>
                {activeMode && (
                  <Button variant="outline" size="icon" onClick={resetCurrent} title="Reset points">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Live measurement display */}
              {activeMode && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Live Measurement</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {currentPoints.length} point{currentPoints.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {val !== null ? (
                    <div className="text-2xl font-bold tabular-nums">
                      {mode === 'distance' || mode === 'perimeter'
                        ? formatDistance(val, unitSystem)
                        : mode === 'area'
                        ? formatArea(val, unitSystem)
                        : mode === 'angle'
                        ? `${val.toFixed(1)}°`
                        : mode === 'circle'
                        ? `${formatDistance(val, unitSystem)} radius`
                        : ''}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {mode === 'circle' && circleCenter
                        ? 'Click to set radius...'
                        : 'Click on the map to add points...'}
                    </div>
                  )}

                  {/* Circle additional info */}
                  {mode === 'circle' && circleRadius > 0 && (
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Circumference: {formatDistance(2 * Math.PI * circleRadius, unitSystem)}</span>
                      <span>Area: {formatArea(Math.PI * circleRadius ** 2, unitSystem)}</span>
                    </div>
                  )}

                  {/* Segment distances for distance mode */}
                  {mode === 'distance' && segmentDistances().length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground">Segments</span>
                      {segmentDistances().map((d, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Seg {i + 1}</span>
                          <span className="tabular-nums">{formatDistance(d, unitSystem)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Finish button */}
                  {(val !== null || (mode === 'circle' && circleRadius > 0)) && (
                    <Button size="sm" className="w-full mt-2 gap-1.5" onClick={finishMeasurement}>
                      <Save className="h-3.5 w-3.5" />
                      Save Measurement
                    </Button>
                  )}
                </div>
              )}

              {/* Point coordinates reference */}
              {activeMode && currentPoints.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Coordinates
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {currentPoints.map((pt, i) => (
                      <div key={i} className="flex justify-between text-[11px] bg-muted/30 rounded px-2 py-1">
                        <span className="text-muted-foreground">P{i + 1}</span>
                        <span className="tabular-nums font-mono">
                          {pt[1].toFixed(6)}, {pt[0].toFixed(6)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Circle center reference */}
              {activeMode && mode === 'circle' && circleCenter && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Circle className="h-3 w-3" /> Circle Center
                  </span>
                  <div className="text-[11px] bg-muted/30 rounded px-2 py-1 tabular-nums font-mono">
                    {circleCenter[1].toFixed(6)}, {circleCenter[0].toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 overflow-auto mt-2">
            <ScrollArea className="max-h-96">
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No measurements saved yet.
                  <br />
                  <span className="text-xs">Start measuring and save results.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{results.length} result{results.length !== 1 ? 's' : ''}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-red-500 hover:text-red-600 gap-1"
                      onClick={() => {
                        clearMeasurementResults()
                        toast.success('All results cleared')
                      }}
                    >
                      <Trash2 className="h-3 w-3" /> Clear All
                    </Button>
                  </div>
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="bg-muted/30 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`${MODE_INFO[r.type]?.color} text-white text-[10px]`}>
                            {r.type}
                          </Badge>
                          <span className="text-lg font-bold tabular-nums">
                            {r.value.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">{r.unit}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs gap-1"
                          onClick={() => copyResult(r)}
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs gap-1"
                          onClick={() => saveAsLocation(r)}
                        >
                          <MapPin className="h-3 w-3" /> Location
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs gap-1"
                          onClick={() => saveAsAnnotation(r)}
                        >
                          <Save className="h-3 w-3" /> Annotate
                        </Button>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(r.timestamp).toLocaleString()} · {r.points.length} point{r.points.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-auto mt-2">
            <ScrollArea className="max-h-96">
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No measurement history.
                </div>
              ) : (
                <div className="space-y-1">
                  {[...results].reverse().map((r, idx) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/50 text-xs"
                    >
                      <div className={`w-2 h-2 rounded-full ${MODE_INFO[r.type]?.color}`} />
                      <span className="font-medium capitalize">{r.type}</span>
                      <span className="tabular-nums">
                        {r.value.toFixed(2)} {r.unit}
                      </span>
                      <span className="ml-auto text-muted-foreground text-[10px]">
                        {idx === 0 ? 'just now' : `${idx + 1} ago`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

type MeasurementSuiteState = {
  mode: 'distance' | 'area' | 'angle' | 'circle' | 'perimeter'
  unitSystem: 'metric' | 'imperial'
  results: MeasurementResult[]
  activeMode: boolean
}
