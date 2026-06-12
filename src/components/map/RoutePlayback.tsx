'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useMapStore, type MapRoute } from '@/lib/map-store'
import {
  Play,
  Pause,
  Square,
  FastForward,
  Navigation,
  Eye,
  EyeOff,
} from 'lucide-react'

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

function getRouteSegments(route: MapRoute): { distances: number[]; total: number } {
  const distances: number[] = [0]
  let total = 0
  for (let i = 1; i < route.points.length; i++) {
    const d = haversineDistance(
      route.points[i - 1].latitude,
      route.points[i - 1].longitude,
      route.points[i].latitude,
      route.points[i].longitude
    )
    total += d
    distances.push(total)
  }
  return { distances, total }
}

function interpolatePosition(
  route: MapRoute,
  distances: number[],
  totalDistance: number,
  progress: number
): { longitude: number; latitude: number; heading: number } {
  if (route.points.length === 0) {
    return { longitude: 0, latitude: 0, heading: 0 }
  }
  if (route.points.length === 1) {
    return {
      longitude: route.points[0].longitude,
      latitude: route.points[0].latitude,
      heading: 0,
    }
  }

  const targetDist = progress * totalDistance
  let segIdx = 0
  for (let i = 1; i < distances.length; i++) {
    if (distances[i] >= targetDist) {
      segIdx = i - 1
      break
    }
    if (i === distances.length - 1) {
      segIdx = i - 1
    }
  }

  const segStart = distances[segIdx]
  const segEnd = distances[segIdx + 1] ?? distances[segIdx]
  const segLength = segEnd - segStart
  const segProgress = segLength > 0 ? (targetDist - segStart) / segLength : 0

  const p1 = route.points[segIdx]
  const p2 = route.points[Math.min(segIdx + 1, route.points.length - 1)]

  const lat = p1.latitude + (p2.latitude - p1.latitude) * segProgress
  const lng = p1.longitude + (p2.longitude - p1.longitude) * segProgress
  const heading = calculateBearing(p1.latitude, p1.longitude, p2.latitude, p2.longitude)

  return { longitude: lng, latitude: lat, heading }
}

export function RoutePlayback() {
  const routePlaybackOpen = useMapStore((s) => s.routePlaybackOpen)
  const setRoutePlaybackOpen = useMapStore((s) => s.setRoutePlaybackOpen)
  const routePlayback = useMapStore((s) => s.routePlayback)
  const setRoutePlayback = useMapStore((s) => s.setRoutePlayback)
  const routes = useMapStore((s) => s.routes)

  const animFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const markerRef = useRef<any>(null)
  const markerElRef = useRef<HTMLElement | null>(null)
  const routeLayerAddedRef = useRef<string | null>(null)
  const [currentPos, setCurrentPos] = useState<{
    longitude: number
    latitude: number
    heading: number
  } | null>(null)
  const [routeInfo, setRouteInfo] = useState<{
    distanceTraveled: number
    distanceRemaining: number
    eta: number
    currentSpeed: number
  }>({ distanceTraveled: 0, distanceRemaining: 0, eta: 0, currentSpeed: 0 })

  const selectedRoute = routes.find((r) => r.id === routePlayback.routeId)

  const segmentDataRef = useRef<{ distances: number[]; total: number } | null>(null)

  const getSegmentData = useCallback((route: MapRoute) => {
    if (!segmentDataRef.current || segmentDataRef.current.total === 0) {
      segmentDataRef.current = getRouteSegments(route)
    }
    return segmentDataRef.current
  }, [])

  // Reset segment data when route changes
  useEffect(() => {
    segmentDataRef.current = null
  }, [routePlayback.routeId])

  // Create/update marker on map
  useEffect(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map || !currentPos) return

    if (!markerRef.current) {
      const el = document.createElement('div')
      el.style.width = '32px'
      el.style.height = '32px'
      el.style.transition = 'none'
      el.innerHTML = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#10b981" stroke="white" stroke-width="2"/>
        <path d="M16 6 L22 20 L16 17 L10 20 Z" fill="white"/>
      </svg>`
      el.style.cursor = 'pointer'
      markerElRef.current = el

      const maplibregl = (window as any).maplibregl
      if (maplibregl) {
        markerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([currentPos.longitude, currentPos.latitude])
          .addTo(map)
      }
    } else {
      markerRef.current.setLngLat([currentPos.longitude, currentPos.latitude])
    }

    // Rotate the inner SVG element for heading
    if (markerElRef.current) {
      const svg = markerElRef.current.querySelector('svg')
      if (svg) {
        svg.style.transform = `rotate(${currentPos.heading}deg)`
      }
    }

    // Follow camera
    if (routePlayback.followCamera && routePlayback.isPlaying) {
      map.easeTo({
        center: [currentPos.longitude, currentPos.latitude],
        bearing: currentPos.heading,
        duration: 200,
      })
    }
  }, [currentPos, routePlayback.followCamera, routePlayback.isPlaying])

  // Draw route path on map
  useEffect(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map || !selectedRoute || selectedRoute.points.length < 2) return

    const sourceId = 'route-playback-source'
    const layerId = 'route-playback-layer'

    // Remove previous route layer if route changed
    if (routeLayerAddedRef.current && routeLayerAddedRef.current !== selectedRoute.id) {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore cleanup errors
      }
    }

    const coordinates = selectedRoute.points.map(
      (p) => [p.longitude, p.latitude] as [number, number]
    )

    try {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates,
            },
            properties: {},
          },
        })
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#10b981',
            'line-width': 4,
            'line-opacity': 0.8,
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
        })
      } else {
        map.getSource(sourceId).setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates,
          },
          properties: {},
        })
      }
    } catch {
      // ignore map style errors
    }

    routeLayerAddedRef.current = selectedRoute.id

    return () => {
      if (typeof window === 'undefined') return
      const m = (window as any).__mainMap
      if (m) {
        try {
          if (m.getLayer(layerId)) m.removeLayer(layerId)
          if (m.getSource(sourceId)) m.removeSource(sourceId)
        } catch {
          // ignore cleanup errors
        }
      }
      routeLayerAddedRef.current = null
    }
  }, [selectedRoute])

  // Animation loop
  useEffect(() => {
    if (!routePlayback.isPlaying || !selectedRoute || selectedRoute.points.length < 2) return

    const { distances, total } = getSegmentData(selectedRoute)
    if (total === 0) return

    const BASE_SPEED = 30 // meters per second at 1x
    const speed = BASE_SPEED * routePlayback.speed

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }
      const delta = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      const distIncrement = speed * delta
      const progressIncrement = distIncrement / total

      const currentProgress = useMapStore.getState().routePlayback.progress
      const newProgress = Math.min(currentProgress + progressIncrement, 1)
      setRoutePlayback({ progress: newProgress })

      const pos = interpolatePosition(selectedRoute, distances, total, newProgress)
      setCurrentPos(pos)

      const distTraveled = newProgress * total
      const distRemaining = total - distTraveled
      const eta = speed > 0 ? distRemaining / speed : 0

      setRouteInfo({
        distanceTraveled: distTraveled,
        distanceRemaining: distRemaining,
        eta,
        currentSpeed: speed * 3.6,
      })

      if (newProgress >= 1) {
        setRoutePlayback({ isPlaying: false, progress: 1 })
        lastTimeRef.current = null
        return
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      lastTimeRef.current = null
    }
  }, [routePlayback.isPlaying, routePlayback.speed, selectedRoute, getSegmentData, setRoutePlayback])

  // Cleanup marker on close
  useEffect(() => {
    if (!routePlaybackOpen && markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
      markerElRef.current = null
      // Defer setState to avoid calling setState synchronously within an effect
      const timer = setTimeout(() => setCurrentPos(null), 0)
      return () => clearTimeout(timer)
    }
  }, [routePlaybackOpen])

  // Update position when progress slider changes manually (when not playing)
  useEffect(() => {
    if (routePlayback.isPlaying || !selectedRoute || selectedRoute.points.length < 2) return
    const { distances, total } = getSegmentData(selectedRoute)
    if (total === 0) return
    const pos = interpolatePosition(selectedRoute, distances, total, routePlayback.progress)
    setCurrentPos(pos)
  }, [routePlayback.progress, routePlayback.isPlaying, selectedRoute, getSegmentData])

  const handlePlay = useCallback(() => {
    if (!routePlayback.routeId) return
    if (routePlayback.progress >= 1) {
      setRoutePlayback({ isPlaying: true, progress: 0 })
    } else {
      setRoutePlayback({ isPlaying: true })
    }
  }, [routePlayback.routeId, routePlayback.progress, setRoutePlayback])

  const handlePause = useCallback(() => {
    setRoutePlayback({ isPlaying: false })
  }, [setRoutePlayback])

  const handleStop = useCallback(() => {
    setRoutePlayback({ isPlaying: false, progress: 0 })
    setCurrentPos(null)
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
      markerElRef.current = null
    }
    setRouteInfo({ distanceTraveled: 0, distanceRemaining: 0, eta: 0, currentSpeed: 0 })
  }, [setRoutePlayback])

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
    return `${Math.round(meters)} m`
  }

  const formatTime = (seconds: number): string => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      return `${h}h ${m}m`
    }
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}m ${s}s`
  }

  const speedOptions = [0.5, 1, 2, 4, 8]

  return (
    <Dialog open={routePlaybackOpen} onOpenChange={setRoutePlaybackOpen}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Navigation className="h-4 w-4 text-emerald-500" />
            Route Playback
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Route selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Select Route</label>
            <Select
              value={routePlayback.routeId ?? ''}
              onValueChange={(v) => {
                setRoutePlayback({ routeId: v, progress: 0, isPlaying: false })
                segmentDataRef.current = null
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Choose a route..." />
              </SelectTrigger>
              <SelectContent>
                {routes.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    No routes saved
                  </SelectItem>
                ) : (
                  routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.points.length} pts)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{(routePlayback.progress * 100).toFixed(1)}%</span>
            </div>
            <Slider
              value={[routePlayback.progress * 100]}
              onValueChange={([v]) => setRoutePlayback({ progress: v / 100 })}
              min={0}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={routePlayback.isPlaying ? handlePause : handlePlay}
              disabled={!routePlayback.routeId || routes.length === 0}
              aria-label={routePlayback.isPlaying ? 'Pause' : 'Play'}
            >
              {routePlayback.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handleStop}
              disabled={!routePlayback.routeId}
              aria-label="Stop"
            >
              <Square className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <div className="flex items-center gap-1">
              <FastForward className="h-3.5 w-3.5 text-muted-foreground" />
              {speedOptions.map((s) => (
                <Button
                  key={s}
                  variant={routePlayback.speed === s ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 px-2 text-xs rounded-md ${
                    routePlayback.speed === s
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : ''
                  }`}
                  onClick={() => setRoutePlayback({ speed: s })}
                >
                  {s}x
                </Button>
              ))}
            </div>
          </div>

          {/* Follow camera toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Follow Camera</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1.5 text-xs"
              onClick={() => setRoutePlayback({ followCamera: !routePlayback.followCamera })}
            >
              {routePlayback.followCamera ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-emerald-500" />
                  On
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  Off
                </>
              )}
            </Button>
          </div>

          {/* Route info stats */}
          {selectedRoute && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Current Speed
                </div>
                <div className="text-sm font-bold mt-0.5">
                  {routePlayback.isPlaying
                    ? `${routeInfo.currentSpeed.toFixed(0)} km/h`
                    : '-- km/h'}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Traveled
                </div>
                <div className="text-sm font-bold mt-0.5">
                  {formatDistance(routeInfo.distanceTraveled)}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Remaining
                </div>
                <div className="text-sm font-bold mt-0.5">
                  {formatDistance(routeInfo.distanceRemaining)}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  ETA
                </div>
                <div className="text-sm font-bold mt-0.5">
                  {routePlayback.isPlaying ? formatTime(routeInfo.eta) : '--'}
                </div>
              </div>
            </div>
          )}

          {/* Route summary */}
          {selectedRoute && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
              <Badge variant="secondary" className="text-[10px] h-5">
                {selectedRoute.points.length} points
              </Badge>
              {selectedRoute.distance != null && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {formatDistance(selectedRoute.distance)}
                </Badge>
              )}
              {selectedRoute.duration != null && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {formatTime(selectedRoute.duration)}
                </Badge>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
