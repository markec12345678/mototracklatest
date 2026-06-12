'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Square,
  FastForward,
  Navigation,
  MapPin,
  Clock,
  Route,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type MapRoute } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180)
  const x = Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon)
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360
}

function interpolatePoint(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  t: number
): { latitude: number; longitude: number } {
  return {
    latitude: lat1 + (lat2 - lat1) * t,
    longitude: lng1 + (lng2 - lng1) * t,
  }
}

function getRouteCoordinates(route: MapRoute): [number, number][] {
  if (route.points.length < 2) return []
  return route.points.map((p) => [p.longitude, p.latitude] as [number, number])
}

export function GPSSimulator() {
  const gpsSimulation = useMapStore((s) => s.gpsSimulation)
  const setGpsSimulation = useMapStore((s) => s.setGpsSimulation)
  const resetGpsSimulation = useMapStore((s) => s.resetGpsSimulation)
  const routes = useMapStore((s) => s.routes)
  const routePoints = useMapStore((s) => s.routePoints)

  const [isOpen, setIsOpen] = useState(false)
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // Get available routes for simulation
  const availableRoutes = useMemo(() => {
    const rts = [...routes]
    // Also add current route if it has points
    if (routePoints.length >= 2) {
      rts.push({
        id: 'current-route',
        name: 'Current Route',
        color: '#3b82f6',
        points: routePoints,
        distance: null,
        duration: null,
      })
    }
    return rts
  }, [routes, routePoints])

  // Calculate total route distance
  const routeDistance = useMemo(() => {
    const route = availableRoutes.find((r) => r.id === gpsSimulation.routeId)
    if (!route || route.points.length < 2) return 0
    let dist = 0
    for (let i = 1; i < route.points.length; i++) {
      const prev = route.points[i - 1]
      const curr = route.points[i]
      dist += haversineDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
    }
    return dist
  }, [availableRoutes, gpsSimulation.routeId])

  // Use ref for animate callback to avoid circular dependency
  const animateRef = useRef<(timestamp: number) => void>(() => {})

  // Simulation animation loop
  const animate = useCallback((timestamp: number) => {
    const sim = useMapStore.getState().gpsSimulation
    if (!sim.isPlaying) return

    const delta = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0
    lastTimeRef.current = timestamp

    const route = availableRoutes.find((r) => r.id === sim.routeId)
    if (!route || route.points.length < 2) return

    // Speed: base 50 km/h, multiplied by speed multiplier
    const speedMs = (50 / 3.6) * sim.speedMultiplier
    const distanceStep = speedMs * delta
    const totalDist = routeDistance

    if (totalDist === 0) return

    const progressStep = distanceStep / totalDist
    const newProgress = Math.min(sim.progress + progressStep, 1)

    // Calculate current position along route
    const targetDist = newProgress * totalDist
    let accumulatedDist = 0
    let currentPos = { latitude: route.points[0].latitude, longitude: route.points[0].longitude }
    let heading = 0

    for (let i = 1; i < route.points.length; i++) {
      const prev = route.points[i - 1]
      const curr = route.points[i]
      const segDist = haversineDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)

      if (accumulatedDist + segDist >= targetDist) {
        const t = segDist > 0 ? (targetDist - accumulatedDist) / segDist : 0
        currentPos = interpolatePoint(prev.latitude, prev.longitude, curr.latitude, curr.longitude, t)
        heading = bearing(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
        break
      }
      accumulatedDist += segDist
    }

    // If we reached the end
    if (newProgress >= 1) {
      const lastPt = route.points[route.points.length - 1]
      currentPos = { latitude: lastPt.latitude, longitude: lastPt.longitude }
    }

    const distanceRemaining = (1 - newProgress) * totalDist
    const eta = speedMs > 0 ? distanceRemaining / speedMs : 0

    setGpsSimulation({
      progress: newProgress,
      currentPosition: { longitude: currentPos.longitude, latitude: currentPos.latitude, heading },
      distanceRemaining,
      eta,
    })

    // Move map to follow
    if (typeof window !== 'undefined' && newProgress < 1) {
      const map = (window as unknown as Record<string, unknown>).__mainMap as { easeTo?: (opts: { center: [number, number]; duration?: number }) => void } | undefined
      if (map?.easeTo) {
        map.easeTo({
          center: [currentPos.longitude, currentPos.latitude],
          duration: 0,
        })
      }
    }

    if (newProgress >= 1) {
      setGpsSimulation({ isPlaying: false })
      toast.success('Simulation complete!')
      return
    }

    animFrameRef.current = requestAnimationFrame(animateRef.current)
  }, [availableRoutes, routeDistance, setGpsSimulation])

  // Keep ref in sync
  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  useEffect(() => {
    if (gpsSimulation.isPlaying) {
      lastTimeRef.current = 0
      animFrameRef.current = requestAnimationFrame(animateRef.current)
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [gpsSimulation.isPlaying])

  const handlePlay = useCallback(() => {
    if (!gpsSimulation.routeId) {
      if (availableRoutes.length > 0) {
        setGpsSimulation({ routeId: availableRoutes[0].id, isPlaying: true, progress: 0 })
      } else {
        toast.error('No route available for simulation')
      }
      return
    }
    if (gpsSimulation.progress >= 1) {
      setGpsSimulation({ progress: 0, isPlaying: true })
    } else {
      setGpsSimulation({ isPlaying: true })
    }
  }, [gpsSimulation, availableRoutes, setGpsSimulation])

  const handlePause = useCallback(() => {
    setGpsSimulation({ isPlaying: false })
  }, [setGpsSimulation])

  const handleStop = useCallback(() => {
    resetGpsSimulation()
  }, [resetGpsSimulation])

  const handleSpeedChange = useCallback((value: string) => {
    setGpsSimulation({ speedMultiplier: parseInt(value, 10) })
  }, [setGpsSimulation])

  const handleRouteSelect = useCallback((routeId: string) => {
    setGpsSimulation({ routeId, progress: 0, currentPosition: null, distanceRemaining: 0, eta: 0 })
  }, [setGpsSimulation])

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
    return `${Math.round(meters)} m`
  }

  const formatEta = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  return (
    <>
      {/* Simulated Position Marker on Map */}
      {gpsSimulation.currentPosition && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%)`,
          }}
        >
          <div className="relative">
            {/* Pulsing blue dot */}
            <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
            <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-pulse" />
            {/* Heading indicator */}
            <div
              className="absolute w-1 h-6 bg-blue-500 rounded-full origin-bottom"
              style={{
                left: '50%',
                bottom: '50%',
                transform: `translateX(-50%) rotate(${gpsSimulation.currentPosition.heading}deg)`,
              }}
            />
            {/* Center dot */}
            <div className="relative h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-lg shadow-blue-500/50" />
          </div>
        </div>
      )}

      {/* Floating Control Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 md:bottom-16 md:left-auto md:right-20 md:translate-x-0"
          >
            <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 w-80 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Navigation className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">GPS Simulation</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {gpsSimulation.isPlaying ? 'Simulating...' : gpsSimulation.progress > 0 ? 'Paused' : 'Ready'}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Route Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Route</label>
                <Select
                  value={gpsSimulation.routeId || ''}
                  onValueChange={handleRouteSelect}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select a route..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: route.color }} />
                          {route.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress value={gpsSimulation.progress * 100} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{formatDistance(gpsSimulation.progress * routeDistance)}</span>
                  <span>{formatDistance(routeDistance)}</span>
                </div>
              </div>

              {/* Transport Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={handleStop}
                  disabled={gpsSimulation.progress === 0 && !gpsSimulation.isPlaying}
                >
                  <Square className="h-3.5 w-3.5" />
                </Button>

                {gpsSimulation.isPlaying ? (
                  <Button
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handlePause}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handlePlay}
                  >
                    <Play className="h-4 w-4 ml-0.5" />
                  </Button>
                )}

                {/* Speed Multiplier */}
                <Select value={String(gpsSimulation.speedMultiplier)} onValueChange={handleSpeedChange}>
                  <SelectTrigger className="h-9 w-16 text-xs">
                    <FastForward className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="5">5x</SelectItem>
                    <SelectItem value="10">10x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-accent/30 p-2">
                  <Route className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
                  <div className="text-xs font-medium">{formatDistance(gpsSimulation.distanceRemaining)}</div>
                  <div className="text-[9px] text-muted-foreground">Remaining</div>
                </div>
                <div className="rounded-lg bg-accent/30 p-2">
                  <Clock className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
                  <div className="text-xs font-medium">{formatEta(gpsSimulation.eta)}</div>
                  <div className="text-[9px] text-muted-foreground">ETA</div>
                </div>
                <div className="rounded-lg bg-accent/30 p-2">
                  <MapPin className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
                  <div className="text-xs font-medium">{Math.round(gpsSimulation.progress * 100)}%</div>
                  <div className="text-[9px] text-muted-foreground">Progress</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button when panel is closed */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 md:bottom-16 md:left-auto md:right-20 md:translate-x-0"
        >
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'h-9 gap-2 backdrop-blur-md shadow-lg',
              gpsSimulation.isPlaying && 'bg-blue-500/10 border-blue-500/50 text-blue-600'
            )}
            onClick={() => setIsOpen(true)}
          >
            <Navigation className="h-3.5 w-3.5" />
            GPS Sim
            {gpsSimulation.isPlaying && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-blue-500 text-white">
                {gpsSimulation.speedMultiplier}x
              </Badge>
            )}
          </Button>
        </motion.div>
      )}
    </>
  )
}
