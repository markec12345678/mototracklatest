'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useMapStore, type SpatialAnalysisResult } from '@/lib/map-store'
import { Hexagon, Circle, Triangle, Crosshair, Ruler, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function SpatialAnalysisPanel() {
  const markers = useMapStore((s) => s.markers)
  const drawnFeatures = useMapStore((s) => s.drawnFeatures)
  const spatialResults = useMapStore((s) => s.spatialResults)
  const addSpatialResult = useMapStore((s) => s.addSpatialResult)
  const clearSpatialResults = useMapStore((s) => s.clearSpatialResults)
  const removeSpatialResult = useMapStore((s) => s.removeSpatialResult)

  const [analysisType, setAnalysisType] = useState<'buffer' | 'area' | 'centroid' | 'distance'>('buffer')
  const [bufferDistance, setBufferDistance] = useState('500')
  const [selectedPoint, setSelectedPoint] = useState('0')

  const handleBuffer = useCallback(() => {
    const idx = parseInt(selectedPoint)
    const marker = markers[idx]
    if (!marker) {
      toast.error('Select a valid marker point')
      return
    }
    const dist = parseFloat(bufferDistance)
    if (isNaN(dist) || dist <= 0) {
      toast.error('Enter a valid distance')
      return
    }

    // Create a circle approximation as GeoJSON polygon
    const points: [number, number][] = []
    const segments = 64
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI
      const dx = (dist / 111320) * Math.cos(angle)
      const dy = (dist / 110540) * Math.sin(angle)
      points.push([marker.longitude + dx, marker.latitude + dy])
    }
    points.push(points[0])

    const result: SpatialAnalysisResult = {
      id: `buffer-${Date.now()}`,
      type: 'buffer',
      label: `Buffer: ${dist}m around ${marker.name}`,
      value: `${dist}m radius`,
      geometry: {
        type: 'Polygon',
        coordinates: [points],
      },
      color: '#3b82f6',
    }

    addSpatialResult(result)
    toast.success(`Buffer zone created (${dist}m)`)
  }, [markers, selectedPoint, bufferDistance, addSpatialResult])

  const handleArea = useCallback(() => {
    const polygons = drawnFeatures.filter((f) => f.type === 'polygon')
    if (polygons.length === 0) {
      toast.error('Draw a polygon first to calculate area')
      return
    }

    const polygon = polygons[0]
    const coords = polygon.coordinates as number[][]
    if (coords.length < 3) return

    // Shoelace formula for area
    let area = 0
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length
      const xi = coords[i][0] * 111320 // approximate meters per degree longitude
      const yi = coords[i][1] * 110540 // approximate meters per degree latitude
      const xj = coords[j][0] * 111320
      const yj = coords[j][1] * 110540
      area += xi * yj
      area -= xj * yi
    }
    area = Math.abs(area / 2)

    const result: SpatialAnalysisResult = {
      id: `area-${Date.now()}`,
      type: 'area',
      label: `Area of ${polygon.name || 'polygon'}`,
      value: area > 1000000 ? `${(area / 1000000).toFixed(2)} km²` : `${area.toFixed(0)} m²`,
      color: '#10b981',
    }

    addSpatialResult(result)
    toast.success(`Area calculated: ${result.value}`)
  }, [drawnFeatures, addSpatialResult])

  const handleCentroid = useCallback(() => {
    const polygons = drawnFeatures.filter((f) => f.type === 'polygon')
    if (polygons.length === 0) {
      toast.error('Draw a polygon first to find centroid')
      return
    }

    const coords = polygons[0].coordinates as number[][]
    if (coords.length < 3) return

    let cx = 0, cy = 0
    for (const c of coords) {
      cx += c[0]
      cy += c[1]
    }
    cx /= coords.length
    cy /= coords.length

    const result: SpatialAnalysisResult = {
      id: `centroid-${Date.now()}`,
      type: 'centroid',
      label: `Centroid of ${polygons[0].name || 'polygon'}`,
      value: `${cy.toFixed(6)}, ${cx.toFixed(6)}`,
      geometry: {
        type: 'Point',
        coordinates: [cx, cy],
      },
      color: '#f59e0b',
    }

    addSpatialResult(result)
    toast.success('Centroid found')
  }, [drawnFeatures, addSpatialResult])

  const handleDistance = useCallback(() => {
    if (markers.length < 2) {
      toast.error('Need at least 2 markers for distance calculation')
      return
    }

    const m1 = markers[0]
    const m2 = markers[1]

    // Haversine formula
    const R = 6371000
    const dLat = ((m2.latitude - m1.latitude) * Math.PI) / 180
    const dLon = ((m2.longitude - m1.longitude) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((m1.latitude * Math.PI) / 180) *
        Math.cos((m2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const dist = R * c

    const result: SpatialAnalysisResult = {
      id: `distance-${Date.now()}`,
      type: 'distance-from-line',
      label: `Distance: ${m1.name} → ${m2.name}`,
      value: dist > 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist.toFixed(0)} m`,
      geometry: {
        type: 'LineString',
        coordinates: [
          [m1.longitude, m1.latitude],
          [m2.longitude, m2.latitude],
        ],
      },
      color: '#ef4444',
    }

    addSpatialResult(result)
    toast.success(`Distance: ${result.value}`)
  }, [markers, addSpatialResult])

  const handleAnalyze = useCallback(() => {
    switch (analysisType) {
      case 'buffer':
        handleBuffer()
        break
      case 'area':
        handleArea()
        break
      case 'centroid':
        handleCentroid()
        break
      case 'distance':
        handleDistance()
        break
    }
  }, [analysisType, handleBuffer, handleArea, handleCentroid, handleDistance])

  const TYPE_ICONS: Record<string, React.ReactNode> = {
    buffer: <Circle className="h-3.5 w-3.5" />,
    area: <Triangle className="h-3.5 w-3.5" />,
    centroid: <Crosshair className="h-3.5 w-3.5" />,
    'distance-from-line': <Ruler className="h-3.5 w-3.5" />,
  }

  return (
    <Card className="border-border/40 bg-background/60 backdrop-blur-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Hexagon className="h-3.5 w-3.5 text-primary" />
            Spatial Analysis
          </CardTitle>
          {spatialResults.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-muted-foreground hover:text-destructive"
              onClick={clearSpatialResults}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        {/* Analysis type selector */}
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground">Analysis Type</Label>
          <Select value={analysisType} onValueChange={(v) => setAnalysisType(v as typeof analysisType)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buffer">Buffer Zone</SelectItem>
              <SelectItem value="area">Area Calculator</SelectItem>
              <SelectItem value="centroid">Centroid Finder</SelectItem>
              <SelectItem value="distance">Distance Between Points</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buffer-specific inputs */}
        {analysisType === 'buffer' && (
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">Buffer Distance (meters)</Label>
            <Input
              type="number"
              value={bufferDistance}
              onChange={(e) => setBufferDistance(e.target.value)}
              className="h-8 text-xs"
              placeholder="500"
            />
            {markers.length > 0 && (
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Around Point</Label>
                <Select value={selectedPoint} onValueChange={setSelectedPoint}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {markers.map((m, i) => (
                      <SelectItem key={m.id} value={String(i)}>
                        {m.name || `Point ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <Button size="sm" className="w-full h-8 text-xs gap-1.5" onClick={handleAnalyze}>
          <Hexagon className="h-3.5 w-3.5" />
          Run Analysis
        </Button>

        {/* Results */}
        {spatialResults.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground">Results</span>
            {spatialResults.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border px-2 py-1.5 bg-background/50"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span style={{ color: r.color }}>{TYPE_ICONS[r.type] || <Circle className="h-3 w-3" />}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] truncate">{r.label}</p>
                    <Badge variant="secondary" className="text-[9px] h-4">{r.value}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeSpatialResult(r.id)}
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {spatialResults.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-2">
            Run an analysis to see results here
          </p>
        )}
      </CardContent>
    </Card>
  )
}
