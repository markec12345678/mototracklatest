'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Route,
  ArrowRightLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { toast } from 'sonner'

interface WaypointOptimizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WaypointOptimizer({ open, onOpenChange }: WaypointOptimizerProps) {
  const routePoints = useMapStore((s) => s.routePoints)
  const setRoutePoints = useMapStore((s) => s.setRoutePoints)
  const optimizedWaypointOrder = useMapStore((s) => s.optimizedWaypointOrder)
  const setOptimizedWaypointOrder = useMapStore((s) => s.setOptimizedWaypointOrder)

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationMethod, setOptimizationMethod] = useState<'nearest' | '2opt'>('nearest')
  const [totalDistanceBefore, setTotalDistanceBefore] = useState<number | null>(null)
  const [totalDistanceAfter, setTotalDistanceAfter] = useState<number | null>(null)

  const hasEnoughPoints = routePoints.length >= 3

  // Calculate total distance for a given order
  const calculateTotalDistance = useCallback((points: typeof routePoints, order: number[]) => {
    let total = 0
    for (let i = 0; i < order.length - 1; i++) {
      const p1 = points[order[i]]
      const p2 = points[order[i + 1]]
      if (p1 && p2) {
        // Haversine distance
        const R = 6371000
        const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180
        const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((p1.latitude * Math.PI) / 180) *
          Math.cos((p2.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2
        total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      }
    }
    return total
  }, [])

  // Nearest neighbor heuristic
  const nearestNeighbor = useCallback((points: typeof routePoints): number[] => {
    const n = points.length
    const visited = new Set<number>()
    const order: number[] = [0] // Start from first point
    visited.add(0)

    while (visited.size < n) {
      const current = order[order.length - 1]
      let nearest = -1
      let nearestDist = Infinity

      for (let i = 0; i < n; i++) {
        if (visited.has(i)) continue
        const p1 = points[current]
        const p2 = points[i]
        if (!p1 || !p2) continue
        const dx = p2.longitude - p1.longitude
        const dy = p2.latitude - p1.latitude
        const dist = dx * dx + dy * dy
        if (dist < nearestDist) {
          nearestDist = dist
          nearest = i
        }
      }

      if (nearest >= 0) {
        order.push(nearest)
        visited.add(nearest)
      }
    }

    return order
  }, [])

  // 2-opt improvement
  const twoOptImprove = useCallback((points: typeof routePoints, initialOrder: number[]): number[] => {
    let order = [...initialOrder]
    let improved = true
    let iterations = 0
    const maxIterations = 100

    while (improved && iterations < maxIterations) {
      improved = false
      iterations++

      for (let i = 1; i < order.length - 1; i++) {
        for (let j = i + 1; j < order.length; j++) {
          const newOrder = [...order]
          // Reverse the segment between i and j
          let left = i
          let right = j
          while (left < right) {
            ;[newOrder[left], newOrder[right]] = [newOrder[right], newOrder[left]]
            left++
            right--
          }

          const oldDist = calculateTotalDistance(points, order)
          const newDist = calculateTotalDistance(points, newOrder)

          if (newDist < oldDist) {
            order = newOrder
            improved = true
          }
        }
      }
    }

    return order
  }, [calculateTotalDistance])

  const handleOptimize = useCallback(async () => {
    if (!hasEnoughPoints) return

    setIsOptimizing(true)
    try {
      // Simulate async work
      await new Promise((resolve) => setTimeout(resolve, 300))

      const originalOrder = routePoints.map((_, i) => i)
      const beforeDistance = calculateTotalDistance(routePoints, originalOrder)
      setTotalDistanceBefore(beforeDistance)

      let optimizedOrder: number[]

      if (optimizationMethod === 'nearest') {
        optimizedOrder = nearestNeighbor(routePoints)
      } else {
        // 2-opt: start with nearest neighbor, then improve
        const nnOrder = nearestNeighbor(routePoints)
        optimizedOrder = twoOptImprove(routePoints, nnOrder)
      }

      const afterDistance = calculateTotalDistance(routePoints, optimizedOrder)
      setTotalDistanceAfter(afterDistance)
      setOptimizedWaypointOrder(optimizedOrder)

      const improvement = ((beforeDistance - afterDistance) / beforeDistance) * 100
      toast.success(`Route optimized! ${improvement.toFixed(1)}% shorter`)
    } catch (err) {
      toast.error(`Optimization failed: ${(err as Error).message}`)
    } finally {
      setIsOptimizing(false)
    }
  }, [routePoints, optimizationMethod, hasEnoughPoints, calculateTotalDistance, nearestNeighbor, twoOptImprove, setOptimizedWaypointOrder])

  const handleApplyOptimizedOrder = useCallback(() => {
    if (!optimizedWaypointOrder) return

    const newPoints = optimizedWaypointOrder
      .map((i) => routePoints[i])
      .filter(Boolean)
    setRoutePoints(newPoints)
    setOptimizedWaypointOrder(null)
    setTotalDistanceBefore(null)
    setTotalDistanceAfter(null)
    toast.success('Waypoint order updated')
    onOpenChange(false)
  }, [optimizedWaypointOrder, routePoints, setRoutePoints, setOptimizedWaypointOrder, onOpenChange])

  const handleReset = useCallback(() => {
    setOptimizedWaypointOrder(null)
    setTotalDistanceBefore(null)
    setTotalDistanceAfter(null)
  }, [setOptimizedWaypointOrder])

  const improvementPercent = useMemo(() => {
    if (totalDistanceBefore && totalDistanceAfter) {
      return ((totalDistanceBefore - totalDistanceAfter) / totalDistanceBefore) * 100
    }
    return null
  }, [totalDistanceBefore, totalDistanceAfter])

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${Math.round(meters)} m`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-emerald-600" />
            Waypoint Optimizer
          </DialogTitle>
          <DialogDescription>
            Optimize waypoint order for the shortest route path.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current waypoints */}
          <div className="rounded-xl border bg-muted/30 p-3">
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">
              Current Waypoints ({routePoints.length})
            </Label>
            {routePoints.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No waypoints added yet. Add waypoints in Directions mode first.
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {routePoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs py-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {optimizedWaypointOrder ? optimizedWaypointOrder.indexOf(index) + 1 : index + 1}
                    </div>
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{point.name || `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`}</span>
                    {optimizedWaypointOrder && optimizedWaypointOrder[index] !== index && (
                      <ArrowRightLeft className="h-3 w-3 text-amber-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Method selector */}
          <div className="space-y-2">
            <Label className="text-sm">Optimization Method</Label>
            <Select value={optimizationMethod} onValueChange={(v) => setOptimizationMethod(v as 'nearest' | '2opt')}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nearest">Nearest Neighbor (Fast)</SelectItem>
                <SelectItem value="2opt">2-Opt Improvement (Better)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {optimizationMethod === 'nearest'
                ? 'Greedy algorithm that always moves to the closest unvisited point. Fast but may not find the optimal route.'
                : 'Starts with nearest neighbor, then iteratively improves by reversing segments. Slower but produces better results.'}
            </p>
          </div>

          {/* Results */}
          {totalDistanceBefore !== null && totalDistanceAfter !== null && (
            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Original distance</span>
                <span className="text-sm font-mono">{formatDistance(totalDistanceBefore)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Optimized distance</span>
                <span className="text-sm font-mono font-bold text-emerald-600">{formatDistance(totalDistanceAfter)}</span>
              </div>
              {improvementPercent !== null && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Improvement</span>
                  <Badge className={`text-xs ${improvementPercent > 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                    {improvementPercent > 0 ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {improvementPercent.toFixed(1)}% shorter
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Already optimal
                      </>
                    )}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleOptimize}
              disabled={!hasEnoughPoints || isOptimizing}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Optimize Route
                </>
              )}
            </Button>
            {optimizedWaypointOrder && (
              <Button
                variant="outline"
                onClick={handleApplyOptimizedOrder}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                Apply Order
              </Button>
            )}
            {optimizedWaypointOrder && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="shrink-0"
              >
                Reset
              </Button>
            )}
          </div>

          {!hasEnoughPoints && routePoints.length > 0 && (
            <p className="text-xs text-amber-600 text-center">
              Add at least 3 waypoints to optimize the route.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
