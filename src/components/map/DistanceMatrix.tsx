'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  GitBranch,
  Plus,
  Trash2,
  MapPin,
  Download,
  Loader2,
  Crosshair,
  Car,
  Ruler,
} from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MatrixPoint {
  id: string
  name: string
  latitude: number
  longitude: number
}

interface DistanceResult {
  from: string
  to: string
  haversineKm: number
  drivingKm: number | null
  drivingMin: number | null
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

async function fetchDrivingDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): Promise<{ distanceKm: number; durationMin: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      return {
        distanceKm: route.distance / 1000,
        durationMin: route.duration / 60,
      }
    }
    return null
  } catch {
    return null
  }
}

interface DistanceMatrixProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DistanceMatrix({ open, onOpenChange }: DistanceMatrixProps) {
  const savedLocations = useMapStore((s) => s.savedLocations)
  const center = useMapStore((s) => s.center)

  const [points, setPoints] = useState<MatrixPoint[]>([])
  const [useDriving, setUseDriving] = useState(false)
  const [drivingLoading, setDrivingLoading] = useState(false)
  const [drivingResults, setDrivingResults] = useState<Map<string, { km: number; min: number }>>(new Map())
  const [addMode, setAddMode] = useState<'saved' | 'manual' | 'map'>('saved')
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [manualName, setManualName] = useState('')

  // Calculate haversine matrix
  const matrix = useMemo(() => {
    const results: DistanceResult[] = []
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue
        const from = points[i]
        const to = points[j]
        const haversineKm = haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude)
        const key = `${from.id}-${to.id}`
        const driving = drivingResults.get(key)
        results.push({
          from: from.name,
          to: to.name,
          haversineKm,
          drivingKm: driving?.km ?? null,
          drivingMin: driving?.min ?? null,
        })
      }
    }
    return results
  }, [points, drivingResults])

  // Get flat list of distances for min/max highlighting
  const allHaversineDistances = useMemo(() => {
    return matrix.map((m) => m.haversineKm)
  }, [matrix])

  const minDist = allHaversineDistances.length > 0 ? Math.min(...allHaversineDistances) : null
  const maxDist = allHaversineDistances.length > 0 ? Math.max(...allHaversineDistances) : null

  const addPoint = useCallback((point: MatrixPoint) => {
    setPoints((prev) => {
      if (prev.some((p) => p.id === point.id)) return prev
      return [...prev, point]
    })
  }, [])

  const removePoint = useCallback((id: string) => {
    setPoints((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addMapCenter = useCallback(() => {
    const id = `map-center-${Date.now()}`
    addPoint({
      id,
      name: `Map Center (${center[1].toFixed(3)}, ${center[0].toFixed(3)})`,
      latitude: center[1],
      longitude: center[0],
    })
    toast.success('Map center added as point')
  }, [center, addPoint])

  const addManualPoint = useCallback(() => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates')
      return
    }
    const id = `manual-${Date.now()}`
    addPoint({
      id,
      name: manualName || `Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      latitude: lat,
      longitude: lng,
    })
    setManualLat('')
    setManualLng('')
    setManualName('')
    toast.success('Manual point added')
  }, [manualLat, manualLng, manualName, addPoint])

  const fetchAllDrivingDistances = useCallback(async () => {
    if (points.length < 2) return
    setDrivingLoading(true)
    const newResults = new Map<string, { km: number; min: number }>()

    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue
        const from = points[i]
        const to = points[j]
        const key = `${from.id}-${to.id}`
        const result = await fetchDrivingDistance(from.latitude, from.longitude, to.latitude, to.longitude)
        if (result) {
          newResults.set(key, result)
        }
      }
    }

    setDrivingResults(newResults)
    setDrivingLoading(false)
    toast.success(`Driving distances calculated for ${points.length} points`)
  }, [points])

  const exportCsv = useCallback(() => {
    if (matrix.length === 0) return
    const headers = ['From', 'To', 'Straight-line (km)']
    if (useDriving) {
      headers.push('Driving (km)', 'Driving (min)')
    }
    const rows = matrix.map((m) => {
      const row = [m.from, m.to, m.haversineKm.toFixed(2)]
      if (useDriving) {
        row.push(m.drivingKm?.toFixed(2) ?? '', m.drivingMin?.toFixed(1) ?? '')
      }
      return row.join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'distance-matrix.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }, [matrix, useDriving])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <GitBranch className="h-4 w-4 text-emerald-500" />
            Distance Matrix Calculator
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Calculate distances between multiple locations using straight-line or driving routes.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-3">
          {/* Add points section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">Add Locations ({points.length} added)</p>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1"
                  onClick={addMapCenter}
                >
                  <Crosshair className="h-3 w-3" />
                  Map Center
                </Button>
              </div>
            </div>

            {/* Add from saved locations */}
            <div className="flex gap-2">
              <Select
                onValueChange={(val) => {
                  const loc = savedLocations.find((l) => l.id === val)
                  if (loc) {
                    addPoint({
                      id: loc.id,
                      name: loc.name,
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                    })
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Add from saved locations..." />
                </SelectTrigger>
                <SelectContent>
                  {savedLocations.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">No saved locations</div>
                  ) : (
                    savedLocations
                      .filter((loc) => !points.some((p) => p.id === loc.id))
                      .map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            {loc.name}
                          </div>
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Manual coordinates */}
            <div className="flex gap-1.5 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="w-20">
                <Input
                  placeholder="Lat"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="h-7 text-xs"
                  type="number"
                  step="0.001"
                />
              </div>
              <div className="w-20">
                <Input
                  placeholder="Lng"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="h-7 text-xs"
                  type="number"
                  step="0.001"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] gap-1 shrink-0"
                onClick={addManualPoint}
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </div>

          {/* Points list */}
          {points.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {points.map((point) => (
                <Badge
                  key={point.id}
                  variant="secondary"
                  className="text-[10px] gap-1 pr-1"
                >
                  <MapPin className="h-2.5 w-2.5" />
                  {point.name}
                  <button
                    onClick={() => removePoint(point.id)}
                    className="ml-0.5 hover:text-destructive transition-colors"
                    aria-label={`Remove ${point.name}`}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={useDriving}
                onCheckedChange={setUseDriving}
                id="driving-toggle"
              />
              <label htmlFor="driving-toggle" className="text-xs cursor-pointer flex items-center gap-1">
                <Car className="h-3 w-3" />
                Driving distance (OSRM)
              </label>
            </div>
            <div className="flex gap-1.5">
              {useDriving && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1"
                  onClick={fetchAllDrivingDistances}
                  disabled={drivingLoading || points.length < 2}
                >
                  {drivingLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Car className="h-3 w-3" />
                  )}
                  Calculate
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] gap-1"
                onClick={exportCsv}
                disabled={matrix.length === 0}
              >
                <Download className="h-3 w-3" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Matrix table */}
          {points.length >= 2 ? (
            <ScrollArea className="max-h-[300px] rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] h-8">From → To</TableHead>
                    {points.map((p) => (
                      <TableHead key={p.id} className="text-[10px] h-8 min-w-[60px] text-center">
                        <span className="truncate block max-w-[70px]" title={p.name}>{p.name}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {points.map((fromPt) => (
                    <TableRow key={fromPt.id}>
                      <TableCell className="text-[10px] font-medium min-w-[70px]">
                        <span className="truncate block max-w-[70px]" title={fromPt.name}>{fromPt.name}</span>
                      </TableCell>
                      {points.map((toPt) => {
                        if (fromPt.id === toPt.id) {
                          return (
                            <TableCell key={toPt.id} className="text-[10px] text-center text-muted-foreground">
                              —
                            </TableCell>
                          )
                        }
                        const dist = haversineDistance(fromPt.latitude, fromPt.longitude, toPt.latitude, toPt.longitude)
                        const key = `${fromPt.id}-${toPt.id}`
                        const driving = drivingResults.get(key)
                        const isMin = dist === minDist && minDist !== null
                        const isMax = dist === maxDist && maxDist !== null

                        return (
                          <TableCell
                            key={toPt.id}
                            className={cn(
                              'text-[10px] text-center tabular-nums',
                              isMin && 'bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400',
                              isMax && 'bg-orange-500/10 font-semibold text-orange-700 dark:text-orange-400',
                            )}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="flex items-center gap-0.5">
                                <Ruler className="h-2 w-2 text-muted-foreground" />
                                {dist.toFixed(1)} km
                              </div>
                              {useDriving && driving && (
                                <div className="flex items-center gap-0.5 text-muted-foreground">
                                  <Car className="h-2 w-2" />
                                  {driving.km.toFixed(1)} km · {driving.min.toFixed(0)} min
                                </div>
                              )}
                            </div>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <GitBranch className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs">Add at least 2 locations to calculate distances</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
