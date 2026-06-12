'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useMapStore, type ContourLine, type ContourData } from '@/lib/map-store'
import { Mountain, Loader2, Eye, EyeOff, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

// Marching squares lookup for contour generation
// Each entry maps cell index (based on 4 corners) to edge pairs
const MARCHING_SQUARES: Record<number, [number, number][]> = {
  0: [],
  1: [[3, 0]],
  2: [[0, 1]],
  3: [[3, 1]],
  4: [[1, 2]],
  5: [[3, 0], [1, 2]],
  6: [[0, 2]],
  7: [[3, 2]],
  8: [[3, 2]],
  9: [[0, 2]],
  10: [[0, 1], [3, 2]],
  11: [[1, 2]],
  12: [[3, 1]],
  13: [[0, 1]],
  14: [[3, 0]],
  15: [],
}

function interpolate(
  p1: [number, number, number],
  p2: [number, number, number],
  threshold: number
): [number, number] {
  const t = (threshold - p1[2]) / (p2[2] - p1[2])
  return [
    p1[0] + t * (p2[0] - p1[0]),
    p1[1] + t * (p2[1] - p1[1]),
  ]
}

function generateContourLines(
  grid: number[][],
  lngs: number[],
  lats: number[],
  levels: number[]
): ContourLine[] {
  const lines: ContourLine[] = []
  const rows = grid.length
  const cols = grid[0].length

  for (const level of levels) {
    const segments: [number, number][][] = []

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const tl: [number, number, number] = [lngs[c], lats[r], grid[r][c]]
        const tr: [number, number, number] = [lngs[c + 1], lats[r], grid[r][c + 1]]
        const br: [number, number, number] = [lngs[c + 1], lats[r + 1], grid[r + 1][c + 1]]
        const bl: [number, number, number] = [lngs[c], lats[r + 1], grid[r + 1][c]]

        let cellIndex = 0
        if (tl[2] >= level) cellIndex |= 8
        if (tr[2] >= level) cellIndex |= 4
        if (br[2] >= level) cellIndex |= 2
        if (bl[2] >= level) cellIndex |= 1

        const edges = MARCHING_SQUARES[cellIndex]
        if (edges.length === 0) continue

        // Edge midpoints: 0=top, 1=right, 2=bottom, 3=left
        const edgePoints: [number, number][] = [
          interpolate(tl, tr, level),  // top
          interpolate(tr, br, level),  // right
          interpolate(bl, br, level),  // bottom
          interpolate(tl, bl, level),  // left
        ]

        for (const [e1, e2] of edges) {
          segments.push([edgePoints[e1], edgePoints[e2]])
        }
      }
    }

    // Connect segments into polylines (simple greedy approach)
    if (segments.length > 0) {
      const connected: [number, number][][] = []
      const used = new Set<number>()

      for (let i = 0; i < segments.length; i++) {
        if (used.has(i)) continue
        const chain: [number, number][] = [segments[i][0], segments[i][1]]
        used.add(i)

        let changed = true
        while (changed) {
          changed = false
          for (let j = 0; j < segments.length; j++) {
            if (used.has(j)) continue
            const last = chain[chain.length - 1]
            const first = chain[0]

            if (Math.abs(segments[j][0][0] - last[0]) < 1e-10 && Math.abs(segments[j][0][1] - last[1]) < 1e-10) {
              chain.push(segments[j][1])
              used.add(j)
              changed = true
            } else if (Math.abs(segments[j][1][0] - last[0]) < 1e-10 && Math.abs(segments[j][1][1] - last[1]) < 1e-10) {
              chain.push(segments[j][0])
              used.add(j)
              changed = true
            } else if (Math.abs(segments[j][0][0] - first[0]) < 1e-10 && Math.abs(segments[j][0][1] - first[1]) < 1e-10) {
              chain.unshift(segments[j][1])
              used.add(j)
              changed = true
            } else if (Math.abs(segments[j][1][0] - first[0]) < 1e-10 && Math.abs(segments[j][1][1] - first[1]) < 1e-10) {
              chain.unshift(segments[j][0])
              used.add(j)
              changed = true
            }
          }
        }

        connected.push(chain)
      }

      // Merge all connected polylines for this level into one ContourLine
      const allCoords: [number, number][] = []
      for (const polyline of connected) {
        if (allCoords.length > 0) {
          // Add a small gap indicator - just skip, they'll render as separate line segments in GeoJSON
        }
        allCoords.push(...polyline)
      }

      if (allCoords.length >= 2) {
        lines.push({ elevation: level, coordinates: allCoords })
      }
    }
  }

  return lines
}

// Color gradient from green (low) -> yellow (mid) -> red (high)
function getContourColor(elevation: number, minElev: number, maxElev: number): string {
  const t = maxElev > minElev ? (elevation - minElev) / (maxElev - minElev) : 0.5
  if (t < 0.5) {
    // Green to Yellow
    const r = Math.round(255 * (t * 2))
    return `rgb(${r}, 200, 50)`
  } else {
    // Yellow to Red
    const g = Math.round(200 * (1 - (t - 0.5) * 2))
    return `rgb(255, ${g}, 50)`
  }
}

export function ContourGenerator() {
  const contourData = useMapStore((s) => s.contourData)
  const setContourData = useMapStore((s) => s.setContourData)
  const clearContourData = useMapStore((s) => s.clearContourData)
  const contourGeneratorOpen = useMapStore((s) => s.contourGeneratorOpen)
  const setContourGeneratorOpen = useMapStore((s) => s.setContourGeneratorOpen)
  const center = useMapStore((s) => s.center)

  const [levels, setLevels] = useState(10)
  const [interval, setIntervalValue] = useState(100)
  const [useCurrentCenter, setUseCurrentCenter] = useState(true)
  const [customLat, setCustomLat] = useState('')
  const [customLng, setCustomLng] = useState('')
  const [loading, setLoading] = useState(false)

  // Render contour lines on map
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!contourData || !contourData.visible) {
      // Remove contour layers
      const map = (window as any).__mainMap as maplibregl.Map | undefined
      if (!map) return

      const sourceId = 'contour-source'
      const lineLayerId = 'contour-lines'
      const labelLayerId = 'contour-labels'

      if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId)
      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
      return
    }

    const map = (window as any).__mainMap as maplibregl.Map | undefined
    if (!map) return

    const sourceId = 'contour-source'
    const lineLayerId = 'contour-lines'
    const labelLayerId = 'contour-labels'

    // Build GeoJSON FeatureCollection
    const elevations = contourData.lines.map((l) => l.elevation)
    const minElev = Math.min(...elevations)
    const maxElev = Math.max(...elevations)

    const features = contourData.lines.map((line) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: line.coordinates,
      },
      properties: {
        elevation: line.elevation,
        color: getContourColor(line.elevation, minElev, maxElev),
      },
    }))

    const geojson = {
      type: 'FeatureCollection' as const,
      features,
    }

    // Add or update source
    if (map.getSource(sourceId)) {
      ;(map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson)
    } else {
      map.addSource(sourceId, { type: 'geojson', data: geojson })
    }

    // Add or update line layer
    if (!map.getLayer(lineLayerId)) {
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.8,
        },
      })
    }

    // Add or update symbol layer for elevation labels
    if (!map.getLayer(labelLayerId)) {
      map.addLayer({
        id: labelLayerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'symbol-placement': 'line',
          'text-field': ['concat', ['number-format', ['get', 'elevation'], {}], 'm'],
          'text-size': 11,
          'text-allow-overlap': false,
          'text-pitch-alignment': 'map',
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      })
    }

    return () => {
      if (typeof window === 'undefined') return
      const m = (window as any).__mainMap as maplibregl.Map | undefined
      if (!m) return
      if (m.getLayer(labelLayerId)) m.removeLayer(labelLayerId)
      if (m.getLayer(lineLayerId)) m.removeLayer(lineLayerId)
      if (m.getSource(sourceId)) m.removeSource(sourceId)
    }
  }, [contourData])

  const handleGenerate = useCallback(async () => {
    if (typeof window === 'undefined') return

    const lat = useCurrentCenter ? center[1] : parseFloat(customLat)
    const lng = useCurrentCenter ? center[0] : parseFloat(customLng)

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please enter valid coordinates')
      return
    }

    setLoading(true)

    try {
      // Generate grid of points around center
      const gridSize = 15 // 15x15 grid
      const spread = 0.05 // ~5.5km in each direction
      const lngs: number[] = []
      const lats: number[] = []

      for (let i = 0; i < gridSize; i++) {
        lngs.push(lng - spread + (2 * spread * i) / (gridSize - 1))
        lats.push(lat - spread + (2 * spread * i) / (gridSize - 1))
      }

      // Fetch elevation data from Open-Meteo API for each grid point
      const elevationGrid: number[][] = Array.from({ length: gridSize }, () =>
        Array(gridSize).fill(0)
      )

      // Batch requests - Open-Meteo supports multiple coordinates
      const batchSize = 20
      const allPoints: { r: number; c: number; lat: number; lng: number }[] = []

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          allPoints.push({ r, c, lat: lats[r], lng: lngs[c] })
        }
      }

      for (let i = 0; i < allPoints.length; i += batchSize) {
        const batch = allPoints.slice(i, i + batchSize)
        const params = batch
          .map((p) => `${p.lat},${p.lng}`)
          .join('&coordinates=')

        const url = `https://api.open-meteo.com/v1/elevation?coordinates=${params}`

        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error('API request failed')
          const data = await res.json()

          if (data.elevation && Array.isArray(data.elevation)) {
            batch.forEach((p, idx) => {
              if (data.elevation[idx] !== undefined) {
                elevationGrid[p.r][p.c] = data.elevation[idx]
              }
            })
          }
        } catch (err) {
          // If batch fails, try individual requests
          for (const p of batch) {
            try {
              const singleUrl = `https://api.open-meteo.com/v1/elevation?coordinates=${p.lat},${p.lng}`
              const res = await fetch(singleUrl)
              if (res.ok) {
                const data = await res.json()
                if (data.elevation?.[0] !== undefined) {
                  elevationGrid[p.r][p.c] = data.elevation[0]
                }
              }
            } catch {
              // Skip this point, use 0
            }
          }
        }
      }

      // Determine elevation range and generate contour levels
      const flatElevations = elevationGrid.flat().filter((e) => e > 0)
      if (flatElevations.length === 0) {
        toast.error('No elevation data available for this area')
        setLoading(false)
        return
      }

      const minElev = Math.floor(Math.min(...flatElevations) / interval) * interval
      const maxElev = Math.ceil(Math.max(...flatElevations) / interval) * interval

      const contourLevels: number[] = []
      const actualLevels = Math.min(levels, Math.floor((maxElev - minElev) / interval))
      for (let i = 1; i <= actualLevels; i++) {
        contourLevels.push(minElev + i * interval)
      }

      if (contourLevels.length === 0) {
        toast.info('No contour lines needed for this flat terrain')
        setLoading(false)
        return
      }

      // Generate contour lines using marching squares
      const lines = generateContourLines(elevationGrid, lngs, lats, contourLevels)

      if (lines.length === 0) {
        toast.info('Could not generate contour lines for this area')
        setLoading(false)
        return
      }

      setContourData({
        center: [lng, lat],
        lines,
        visible: true,
      })

      toast.success(`Generated ${lines.length} contour lines`)
    } catch (err) {
      toast.error('Failed to generate contour lines')
    } finally {
      setLoading(false)
    }
  }, [useCurrentCenter, center, customLat, customLng, levels, interval, setContourData])

  const handleToggleVisibility = useCallback(() => {
    if (!contourData) return
    setContourData({ ...contourData, visible: !contourData.visible })
  }, [contourData, setContourData])

  const handleClear = useCallback(() => {
    clearContourData()
    toast.success('Contour lines cleared')
  }, [clearContourData])

  return (
    <Dialog open={contourGeneratorOpen} onOpenChange={setContourGeneratorOpen}>
      <DialogContent className="sm:max-w-[420px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-emerald-500" />
            Contour / Isoline Generator
          </DialogTitle>
          <DialogDescription>
            Generate contour lines from elevation data. Select a center point and configure the contour parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Center point */}
          <div className="space-y-3">
            <Label className="text-xs font-medium">Center Point</Label>
            <div className="flex items-center gap-2">
              <Button
                variant={useCurrentCenter ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setUseCurrentCenter(true)}
              >
                Use Map Center
              </Button>
              <Button
                variant={!useCurrentCenter ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setUseCurrentCenter(false)}
              >
                Custom
              </Button>
            </div>
            {useCurrentCenter ? (
              <p className="text-xs text-muted-foreground">
                Using current map center: {center[1].toFixed(4)}, {center[0].toFixed(4)}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Latitude</Label>
                  <Input
                    type="number"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="46.0569"
                    className="h-8 text-xs"
                    step="0.0001"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Longitude</Label>
                  <Input
                    type="number"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    placeholder="14.5058"
                    className="h-8 text-xs"
                    step="0.0001"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contour levels */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Number of Contour Levels: {levels}</Label>
            <Slider
              value={[levels]}
              onValueChange={(v) => setLevels(v[0])}
              min={5}
              max={20}
              step={1}
              className="py-1"
            />
          </div>

          {/* Interval */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Interval: {interval}m</Label>
            <Slider
              value={[interval]}
              onValueChange={(v) => setIntervalValue(v[0])}
              min={10}
              max={500}
              step={10}
              className="py-1"
            />
          </div>

          {/* Generate button */}
          <Button
            className="w-full h-10 text-sm gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching Elevation Data...
              </>
            ) : (
              <>
                <Mountain className="h-4 w-4" />
                Generate Contour Lines
              </>
            )}
          </Button>

          {/* Current contour data */}
          {contourData && (
            <div className="space-y-3 border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Generated Contours</Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleToggleVisibility}
                    title={contourData.visible ? 'Hide contours' : 'Show contours'}
                  >
                    {contourData.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={handleClear}
                    title="Clear contours"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Center: {contourData.center[1].toFixed(4)}, {contourData.center[0].toFixed(4)}
                </p>
                <p>Lines: {contourData.lines.length}</p>
                {contourData.lines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contourData.lines.slice(0, 8).map((line, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border"
                        style={{
                          borderColor: getContourColor(
                            line.elevation,
                            Math.min(...contourData.lines.map((l) => l.elevation)),
                            Math.max(...contourData.lines.map((l) => l.elevation))
                          ),
                          color: getContourColor(
                            line.elevation,
                            Math.min(...contourData.lines.map((l) => l.elevation)),
                            Math.max(...contourData.lines.map((l) => l.elevation))
                          ),
                        }}
                      >
                        {Math.round(line.elevation)}m
                      </span>
                    ))}
                    {contourData.lines.length > 8 && (
                      <span className="text-muted-foreground text-[10px]">
                        +{contourData.lines.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              {!contourData.visible && (
                <p className="text-xs text-amber-500 font-medium">Contours are hidden</p>
              )}
            </div>
          )}

          {/* Color legend */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Color Legend</Label>
            <div className="flex items-center gap-1">
              <div className="h-3 flex-1 rounded-full" style={{ background: 'linear-gradient(to right, rgb(0, 200, 50), rgb(255, 200, 50), rgb(255, 0, 50))' }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Low Elevation</span>
              <span>Mid</span>
              <span>High Elevation</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
