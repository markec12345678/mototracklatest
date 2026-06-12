'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MountainSnow, Download, RotateCcw, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMapStore, type RoutePoint, type MeasurePoint } from '@/lib/map-store'

interface ElevationPoint {
  distance: number
  elevation: number
  lat: number
  lng: number
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function getElevationColor(elevation: number, minElev: number, maxElev: number): string {
  if (maxElev === minElev) return '#22c55e'
  const t = (elevation - minElev) / (maxElev - minElev)
  if (t < 0.25) {
    const s = t / 0.25
    const r = Math.round(34 + s * (234 - 34))
    const g = Math.round(197 + s * (179 - 197))
    const b = Math.round(94 + s * (8 - 94))
    return `rgb(${r},${g},${b})`
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25
    const r = Math.round(234 + s * (249 - 234))
    const g = Math.round(179 - s * (179 - 115))
    const b = Math.round(8 + s * (22 - 8))
    return `rgb(${r},${g},${b})`
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25
    const r = Math.round(249 - s * (249 - 239))
    const g = Math.round(115 - s * (115 - 68))
    const b = Math.round(22 + s * (68 - 22))
    return `rgb(${r},${g},${b})`
  } else {
    const s = (t - 0.75) / 0.25
    const r = Math.round(239 + s * (255 - 239))
    const g = Math.round(68 + s * (255 - 68))
    const b = Math.round(68 + s * (255 - 68))
    return `rgb(${r},${g},${b})`
  }
}

export function TerrainProfile3D() {
  const terrainProfile3D = useMapStore((s) => s.terrainProfile3D)
  const setTerrainProfile3D = useMapStore((s) => s.setTerrainProfile3D)
  const terrainProfile3DOpen = useMapStore((s) => s.terrainProfile3DOpen)
  const setTerrainProfile3DOpen = useMapStore((s) => s.setTerrainProfile3DOpen)
  const toolMode = useMapStore((s) => s.toolMode)
  const measurePoints = useMapStore((s) => s.measurePoints)
  const routePoints = useMapStore((s) => s.routePoints)
  const routes = useMapStore((s) => s.routes)
  const elevationRouteId = useMapStore((s) => s.elevationRouteId)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [elevationData, setElevationData] = useState<ElevationPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDraggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const fetchedKeyRef = useRef('')

  const activeRoute = elevationRouteId
    ? routes.find((r) => r.id === elevationRouteId) ?? null
    : null

  const activePoints: (RoutePoint | MeasurePoint)[] = activeRoute
    ? activeRoute.points
    : toolMode === 'directions'
      ? routePoints
      : measurePoints

  const pointsKey =
    activePoints.length >= 2
      ? activePoints.map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`).join(';')
      : ''

  const fetchElevation = useCallback(async () => {
    if (activePoints.length < 2) {
      setElevationData([])
      return
    }
    if (pointsKey === fetchedKeyRef.current) return

    setLoading(true)
    setError(null)

    try {
      if (activeRoute && activeRoute.points.length > 2) {
        const res = await fetch('/api/elevation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinates: activeRoute.points.map((p) => ({
              lng: p.longitude,
              lat: p.latitude,
            })),
          }),
        })
        if (!res.ok) throw new Error('Failed to fetch elevation data')
        const data = await res.json()
        const points: ElevationPoint[] = (data.points || []).map(
          (p: { distance: number; elevation: number }, i: number) => ({
            distance: p.distance,
            elevation: p.elevation,
            lat: activeRoute.points[Math.min(i, activeRoute.points.length - 1)].latitude,
            lng: activeRoute.points[Math.min(i, activeRoute.points.length - 1)].longitude,
          })
        )
        setElevationData(points)
      } else {
        const pointsParam = activePoints
          .map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`)
          .join(';')
        const res = await fetch(`/api/elevation?points=${encodeURIComponent(pointsParam)}`)
        if (!res.ok) throw new Error('Failed to fetch elevation data')
        const data = await res.json()
        const elevations: number[] = data.elevations || []

        let cumulativeDistance = 0
        const points: ElevationPoint[] = []
        for (let i = 0; i < elevations.length; i++) {
          if (i > 0) {
            const prev = activePoints[i - 1]
            const curr = activePoints[i]
            cumulativeDistance += haversineDistance(
              prev.latitude,
              prev.longitude,
              curr.latitude,
              curr.longitude
            )
          }
          points.push({
            distance: Math.round(cumulativeDistance * 100) / 100,
            elevation: elevations[i],
            lat: activePoints[i].latitude,
            lng: activePoints[i].longitude,
          })
        }
        setElevationData(points)
      }
      fetchedKeyRef.current = pointsKey
    } catch (err) {
      console.error('Terrain 3D elevation fetch error:', err)
      setError('Unable to fetch elevation data')
      setElevationData([])
    } finally {
      setLoading(false)
    }
  }, [activePoints, activeRoute, pointsKey])

  useEffect(() => {
    if (terrainProfile3DOpen && activePoints.length >= 2) {
      fetchElevation()
    }
  }, [terrainProfile3DOpen, activePoints.length, fetchElevation])

  // Canvas rendering
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = rect.height

    // Clear
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, W, H)

    if (elevationData.length < 2) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No elevation data available', W / 2, H / 2)
      return
    }

    const { rotationX, rotationY, zoom, waterLevel } = terrainProfile3D

    const minElev = Math.min(...elevationData.map((p) => p.elevation))
    const maxElev = Math.max(...elevationData.map((p) => p.elevation))
    const totalDist = elevationData[elevationData.length - 1].distance
    const elevRange = maxElev - minElev || 1
    const padding = elevRange * 0.1
    const minE = minElev - padding
    const maxE = maxElev + padding

    // 3D projection
    const cosRY = Math.cos((rotationY * Math.PI) / 180)
    const sinRY = Math.sin((rotationY * Math.PI) / 180)
    const cosRX = Math.cos((rotationX * Math.PI) / 180)
    const sinRX = Math.sin((rotationX * Math.PI) / 180)

    const project = (x: number, y: number, z: number) => {
      // Rotate around Y
      const x1 = x * cosRY - z * sinRY
      const z1 = x * sinRY + z * cosRY
      // Rotate around X
      const y1 = y * cosRX - z1 * sinRX
      const z2 = y * sinRX + z1 * cosRX

      const scale = zoom * 200 / (z2 + 400)
      return {
        sx: W / 2 + x1 * scale,
        sy: H / 2 - y1 * scale,
        z: z2,
      }
    }

    const normalizeX = (dist: number) => (dist / totalDist - 0.5) * 3
    const normalizeY = (elev: number) => ((elev - minE) / (maxE - minE) - 0.5) * 2
    const normalizeZ = (idx: number) => 0

    // Draw terrain surface as filled quads
    const step = Math.max(1, Math.floor(elevationData.length / 200))
    const rows = 15
    const rowStep = elevRange * 0.05

    // Collect faces with depth for painter's algorithm
    const faces: {
      points: { sx: number; sy: number; z: number }[]
      color: string
      avgZ: number
      isWater: boolean
    }[] = []

    for (let row = 0; row < rows; row++) {
      const rowElev = minE - row * rowStep
      const isWater = rowElev <= waterLevel

      for (let i = 0; i < elevationData.length - step; i += step) {
        const p1 = elevationData[i]
        const p2 = elevationData[Math.min(i + step, elevationData.length - 1)]

        const x1 = normalizeX(p1.distance)
        const x2 = normalizeX(p2.distance)
        const yTop1 = normalizeY(Math.max(p1.elevation, rowElev + rowStep))
        const yTop2 = normalizeY(Math.max(p2.elevation, rowElev + rowStep))
        const yBot1 = normalizeY(rowElev)
        const yBot2 = normalizeY(rowElev)
        const z1 = normalizeZ(i)
        const z2 = normalizeZ(i + step)

        const corners = [
          project(x1, yTop1, z1),
          project(x2, yTop2, z2),
          project(x2, yBot2, z2),
          project(x1, yBot1, z1),
        ]

        const avgZ = corners.reduce((sum, c) => sum + c.z, 0) / 4
        const avgElev = (p1.elevation + p2.elevation) / 2

        faces.push({
          points: corners,
          color: isWater
            ? 'rgba(56,189,248,0.3)'
            : getElevationColor(avgElev, minElev, maxElev),
          avgZ,
          isWater,
        })
      }
    }

    // Sort by depth (painter's algorithm)
    faces.sort((a, b) => b.avgZ - a.avgZ)

    // Draw faces
    for (const face of faces) {
      ctx.beginPath()
      ctx.moveTo(face.points[0].sx, face.points[0].sy)
      for (let k = 1; k < face.points.length; k++) {
        ctx.lineTo(face.points[k].sx, face.points[k].sy)
      }
      ctx.closePath()
      ctx.fillStyle = face.color
      ctx.fill()
      ctx.strokeStyle = face.isWater ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // Draw the route line on top of terrain
    if (elevationData.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2.5
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 6

      for (let i = 0; i < elevationData.length; i += step) {
        const p = elevationData[i]
        const x = normalizeX(p.distance)
        const y = normalizeY(p.elevation)
        const z = normalizeZ(i)
        const proj = project(x, y, z)
        if (i === 0) {
          ctx.moveTo(proj.sx, proj.sy)
        } else {
          ctx.lineTo(proj.sx, proj.sy)
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // Draw water level line
    if (waterLevel > minE) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(56,189,248,0.8)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      const wy = normalizeY(waterLevel)
      const proj1 = project(-1.5, wy, 0)
      const proj2 = project(1.5, wy, 0)
      ctx.moveTo(proj1.sx, proj1.sy)
      ctx.lineTo(proj2.sx, proj2.sy)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = 'rgba(56,189,248,0.8)'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`Water: ${waterLevel}m`, proj2.sx + 8, proj2.sy + 4)
    }

    // Axis labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px sans-serif'

    // Distance labels (X axis)
    ctx.textAlign = 'center'
    const distLabels = 5
    for (let i = 0; i <= distLabels; i++) {
      const d = (totalDist * i) / distLabels
      const label = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`
      const x = normalizeX(d)
      const proj = project(x, normalizeY(minE), 0)
      ctx.fillText(label, proj.sx, proj.sy + 18)
    }

    // Elevation labels (Y axis)
    ctx.textAlign = 'right'
    const elevLabels = 4
    for (let i = 0; i <= elevLabels; i++) {
      const e = minE + (elevRange + 2 * padding) * (i / elevLabels)
      const label = `${Math.round(e)}m`
      const y = normalizeY(e)
      const proj = project(normalizeX(0), y, 0)
      ctx.fillText(label, proj.sx - 12, proj.sy + 4)
    }

    // Title
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('3D Terrain Profile', W / 2, 20)
  }, [elevationData, terrainProfile3D])

  useEffect(() => {
    if (terrainProfile3DOpen && elevationData.length >= 2) {
      renderCanvas()
    }
  }, [terrainProfile3DOpen, elevationData, terrainProfile3D, renderCanvas])

  // Mouse interaction for rotation
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - lastMouseRef.current.x
      const dy = e.clientY - lastMouseRef.current.y
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
      setTerrainProfile3D({
        rotationY: terrainProfile3D.rotationY + dx * 0.5,
        rotationX: Math.max(-80, Math.min(0, terrainProfile3D.rotationX + dy * 0.5)),
      })
    },
    [terrainProfile3D, setTerrainProfile3D]
  )

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const newZoom = Math.max(0.3, Math.min(3, terrainProfile3D.zoom - e.deltaY * 0.001))
      setTerrainProfile3D({ zoom: newZoom })
    },
    [terrainProfile3D.zoom, setTerrainProfile3D]
  )

  const handleExportPNG = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'terrain-profile-3d.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  const handleReset = useCallback(() => {
    setTerrainProfile3D({
      rotationX: -30,
      rotationY: 45,
      zoom: 1,
    })
  }, [setTerrainProfile3D])

  const hasActivePath = activePoints.length >= 2

  return (
    <Dialog open={terrainProfile3DOpen} onOpenChange={setTerrainProfile3DOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MountainSnow className="h-5 w-5 text-emerald-500" />
            3D Terrain Profile
          </DialogTitle>
        </DialogHeader>

        {!hasActivePath ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MountainSnow className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground">
              Create a route or measurement first
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Use the Directions or Measure tool to create a path, then open this dialog
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Canvas */}
            <div className="relative rounded-lg overflow-hidden border border-border/50 bg-slate-900">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  <span className="ml-2 text-sm text-slate-300">Loading elevation data...</span>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="w-full cursor-grab active:cursor-grabbing"
                style={{ height: '400px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              />
            </div>

            {/* Controls */}
            <div className="space-y-3">
              {/* Water Level Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Water Level (Sea Level Rise)
                  </label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {terrainProfile3D.waterLevel}m
                  </span>
                </div>
                <Slider
                  value={[terrainProfile3D.waterLevel]}
                  min={0}
                  max={Math.max(500, Math.round((elevationData.length > 0 ? Math.max(...elevationData.map((p) => p.elevation)) : 500)))}
                  step={1}
                  onValueChange={([v]) => setTerrainProfile3D({ waterLevel: v })}
                  className="w-full"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleExportPNG}
                  disabled={loading || elevationData.length < 2}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export PNG
                </Button>
              </div>

              {/* Info */}
              {elevationData.length >= 2 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span>
                    Distance:{' '}
                    {elevationData[elevationData.length - 1].distance < 1
                      ? `${Math.round(elevationData[elevationData.length - 1].distance * 1000)}m`
                      : `${elevationData[elevationData.length - 1].distance.toFixed(1)}km`}
                  </span>
                  <span>
                    Min Elev: {Math.round(Math.min(...elevationData.map((p) => p.elevation)))}m
                  </span>
                  <span>
                    Max Elev: {Math.round(Math.max(...elevationData.map((p) => p.elevation)))}m
                  </span>
                  <span>
                    Gain:{' '}
                    {Math.round(
                      elevationData.reduce((gain, p, i) => {
                        if (i === 0) return 0
                        const diff = p.elevation - elevationData[i - 1].elevation
                        return gain + (diff > 0 ? diff : 0)
                      }, 0)
                    )}
                    m
                  </span>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground/60">
                Drag to rotate • Scroll to zoom
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
