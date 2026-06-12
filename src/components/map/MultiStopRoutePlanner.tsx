'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MultiStop, type MultiStopRoute } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  Waypoints,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Download,
  MapPin,
  Clock,
  Fuel,
  UtensilsCrossed,
  Camera,
  Navigation,
  Bike,
  Footprints,
  Car,
  Route,
  RotateCcw,
  Share2,
  ChevronRight,
} from 'lucide-react'

const STOP_TYPE_ICONS: Record<MultiStop['type'], React.ReactNode> = {
  start: <Navigation className="h-3.5 w-3.5" />,
  waypoint: <MapPin className="h-3.5 w-3.5" />,
  end: <Route className="h-3.5 w-3.5" />,
  fuel: <Fuel className="h-3.5 w-3.5" />,
  food: <UtensilsCrossed className="h-3.5 w-3.5" />,
  rest: <Clock className="h-3.5 w-3.5" />,
  scenic: <Camera className="h-3.5 w-3.5" />,
}

const STOP_TYPE_COLORS: Record<MultiStop['type'], string> = {
  start: 'bg-emerald-500 text-white',
  waypoint: 'bg-blue-500 text-white',
  end: 'bg-red-500 text-white',
  fuel: 'bg-amber-500 text-white',
  food: 'bg-orange-500 text-white',
  rest: 'bg-purple-500 text-white',
  scenic: 'bg-teal-500 text-white',
}

const MODE_ICONS: Record<string, React.ReactNode> = {
  driving: <Car className="h-4 w-4" />,
  cycling: <Bike className="h-4 w-4" />,
  walking: <Footprints className="h-4 w-4" />,
}

interface RouteResult {
  distance: number
  duration: number
  geometry: [number, number][]
  steps: {
    maneuver: { type: string; modifier?: string }
    name: string
    distance: number
    duration: number
  }[]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

// Haversine distance (pure function, outside component)
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
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(meters: number) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

function getManeuverIcon(type: string, modifier?: string) {
  if (type === 'arrive') return '🏁'
  if (type === 'depart') return '🚀'
  if (modifier?.includes('left')) return '↰'
  if (modifier?.includes('right')) return '↱'
  if (modifier?.includes('straight')) return '↑'
  if (type === 'roundabout') return '🔄'
  return '→'
}

// Draw route on map (uses window)
function addRouteToMap(coordinates: [number, number][], sourceId: string, layerId: string, color: string, width: number) {
  if (typeof window === 'undefined') return
  const map = (window as any).__mainMap
  if (!map) return

  // Remove existing layer/source
  if (map.getLayer(layerId)) map.removeLayer(layerId)
  if (map.getSource(sourceId)) map.removeSource(sourceId)

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
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': color,
      'line-width': width,
      'line-opacity': 0.8,
    },
  })
}

function removeRouteFromMap() {
  if (typeof window === 'undefined') return
  const map = (window as any).__mainMap
  if (!map) return

  for (const layerId of ['route-line', 'optimized-route-line']) {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
  }
  for (const sourceId of ['route-source', 'optimized-route-source']) {
    if (map.getSource(sourceId)) map.removeSource(sourceId)
  }
}

export function MultiStopRoutePlanner() {
  const multiStopPlannerOpen = useMapStore((s) => s.multiStopPlannerOpen)
  const setMultiStopPlannerOpen = useMapStore((s) => s.setMultiStopPlannerOpen)
  const multiStopRoute = useMapStore((s) => s.multiStopRoute)
  const setMultiStopRoute = useMapStore((s) => s.setMultiStopRoute)
  const savedLocations = useMapStore((s) => s.savedLocations)

  const [localStops, setLocalStops] = useState<MultiStop[]>([])
  const [routeMode, setRouteMode] = useState<'driving' | 'cycling' | 'walking'>('driving')
  const [routeName, setRouteName] = useState('')
  const [avoidHighways, setAvoidHighways] = useState(false)
  const [avoidTolls, setAvoidTolls] = useState(false)
  const [avoidFerries, setAvoidFerries] = useState(false)
  const [optimizeMode, setOptimizeMode] = useState<'none' | 'shortest_distance' | 'shortest_time' | 'scenic'>('none')
  const [departureTime, setDepartureTime] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([])
  const [coordInput, setCoordInput] = useState({ lat: '', lng: '' })
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null)
  const [optimizedResult, setOptimizedResult] = useState<RouteResult | null>(null)
  const [originalDistance, setOriginalDistance] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState('')

  // Search locations using Nominatim
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      const data = await res.json()
      setSearchResults(data)
    } catch {
      toast.error('Search failed')
    }
  }, [searchQuery])

  // Add stop from search result
  const addStopFromSearch = useCallback((result: { display_name: string; lat: string; lon: string }) => {
    const newStop: MultiStop = {
      id: generateId(),
      name: result.display_name.split(',')[0],
      longitude: parseFloat(result.lon),
      latitude: parseFloat(result.lat),
      type: localStops.length === 0 ? 'start' : 'waypoint',
      duration: 0,
    }
    setLocalStops((prev) => [...prev, newStop])
    setSearchQuery('')
    setSearchResults([])
  }, [localStops.length])

  // Add stop from coordinates
  const addStopFromCoords = useCallback(() => {
    const lat = parseFloat(coordInput.lat)
    const lng = parseFloat(coordInput.lng)
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates')
      return
    }
    const newStop: MultiStop = {
      id: generateId(),
      name: `Point ${localStops.length + 1} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      longitude: lng,
      latitude: lat,
      type: localStops.length === 0 ? 'start' : 'waypoint',
      duration: 0,
    }
    setLocalStops((prev) => [...prev, newStop])
    setCoordInput({ lat: '', lng: '' })
  }, [coordInput, localStops.length])

  // Add stop from saved location
  const addStopFromSaved = useCallback(() => {
    const loc = savedLocations.find((l) => l.id === selectedLocationId)
    if (!loc) return
    const newStop: MultiStop = {
      id: generateId(),
      name: loc.name,
      longitude: loc.longitude,
      latitude: loc.latitude,
      type: localStops.length === 0 ? 'start' : 'waypoint',
      duration: 0,
    }
    setLocalStops((prev) => [...prev, newStop])
    setSelectedLocationId('')
  }, [selectedLocationId, savedLocations, localStops.length])

  // Add stop by clicking map
  const addStopFromMap = useCallback(() => {
    const map = (window as any).__mainMap
    if (!map) {
      toast.error('Map not available')
      return
    }
    toast.info('Click on the map to add a stop')
    const stopsLength = localStops.length
    const handler = (e: any) => {
      const coords = e.lngLat
      const newStop: MultiStop = {
        id: generateId(),
        name: `Map Point (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
        longitude: coords.lng,
        latitude: coords.lat,
        type: stopsLength === 0 ? 'start' : 'waypoint',
        duration: 0,
      }
      setLocalStops((prev) => [...prev, newStop])
      map.off('click', handler)
      toast.success('Stop added from map click')
    }
    map.once('click', handler)
  }, [localStops.length])

  // Remove stop
  const removeStop = useCallback((id: string) => {
    setLocalStops((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // Reorder stops
  const moveStop = useCallback((index: number, direction: 'up' | 'down') => {
    setLocalStops((prev) => {
      const arr = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= arr.length) return prev
      ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
      return arr
    })
  }, [])

  // Update stop type
  const updateStopType = useCallback((id: string, type: MultiStop['type']) => {
    setLocalStops((prev) => prev.map((s) => (s.id === id ? { ...s, type } : s)))
  }, [])

  // Update stop duration
  const updateStopDuration = useCallback((id: string, duration: number) => {
    setLocalStops((prev) => prev.map((s) => (s.id === id ? { ...s, duration } : s)))
  }, [])

  // Update stop name
  const updateStopName = useCallback((id: string, name: string) => {
    setLocalStops((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
  }, [])

  // TSP optimization - nearest neighbor heuristic
  const optimizeRoute = useCallback(async (stops: MultiStop[], mode: 'driving' | 'cycling' | 'walking', originalDist: number) => {
    if (stops.length <= 2) return null

    const startStop = stops.find((s) => s.type === 'start') || stops[0]
    const endStop = stops.find((s) => s.type === 'end')
    const waypoints = stops.filter(
      (s) => s.id !== startStop.id && (!endStop || s.id !== endStop.id)
    )

    // Nearest neighbor heuristic
    const optimized: MultiStop[] = [startStop]
    const remaining = [...waypoints]
    let current = startStop

    while (remaining.length > 0) {
      let nearestIdx = 0
      let nearestDist = Infinity
      for (let i = 0; i < remaining.length; i++) {
        const d = haversineDistance(
          current.latitude,
          current.longitude,
          remaining[i].latitude,
          remaining[i].longitude
        )
        if (d < nearestDist) {
          nearestDist = d
          nearestIdx = i
        }
      }
      current = remaining[nearestIdx]
      optimized.push(current)
      remaining.splice(nearestIdx, 1)
    }

    if (endStop) optimized.push(endStop)

    // Calculate optimized route
    const profile = mode === 'driving' ? 'car' : mode === 'cycling' ? 'bike' : 'foot'
    const coords = optimized.map((s) => `${s.longitude},${s.latitude}`).join(';')

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`
      )
      const data = await res.json()

      if (data.code === 'Ok' && data.routes?.length) {
        const route = data.routes[0]
        const optResult: RouteResult = {
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry.coordinates,
          steps: route.legs.flatMap((leg: any) =>
            leg.steps.map((step: any) => ({
              maneuver: step.maneuver,
              name: step.name || 'Unnamed road',
              distance: step.distance,
              duration: step.duration,
            }))
          ),
        }

        setOptimizedResult(optResult)
        setLocalStops(optimized)

        // Draw optimized route
        addRouteToMap(optResult.geometry, 'optimized-route-source', 'optimized-route-line', '#f59e0b', 3)

        return optResult
      }
    } catch {
      // Silently fail optimization
    }
    return null
  }, [])

  // Calculate route using OSRM
  const calculateRoute = useCallback(async () => {
    if (localStops.length < 2) {
      toast.error('Add at least 2 stops')
      return
    }
    setIsCalculating(true)

    const profile = routeMode === 'driving' ? 'car' : routeMode === 'cycling' ? 'bike' : 'foot'
    const coords = localStops.map((s) => `${s.longitude},${s.latitude}`).join(';')

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`
      )
      const data = await res.json()

      if (data.code !== 'Ok' || !data.routes?.length) {
        toast.error('Route calculation failed')
        setIsCalculating(false)
        return
      }

      const route = data.routes[0]
      const result: RouteResult = {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry.coordinates,
        steps: route.legs.flatMap((leg: any) =>
          leg.steps.map((step: any) => ({
            maneuver: step.maneuver,
            name: step.name || 'Unnamed road',
            distance: step.distance,
            duration: step.duration,
          }))
        ),
      }

      setRouteResult(result)
      setOriginalDistance(route.distance)

      // Draw route on map
      addRouteToMap(result.geometry, 'route-source', 'route-line', '#14b8a6', 4)

      // Optimize if requested
      if (optimizeMode !== 'none' && localStops.length > 2) {
        await optimizeRoute(localStops, routeMode, route.distance)
      }

      setIsCalculating(false)
      toast.success('Route calculated!')
    } catch {
      toast.error('Failed to calculate route')
      setIsCalculating(false)
    }
  }, [localStops, routeMode, optimizeMode, optimizeRoute])

  // Save route
  const saveRoute = useCallback(() => {
    if (localStops.length < 2) return
    const route: MultiStopRoute = {
      id: generateId(),
      name: routeName || `Route ${Date.now()}`,
      stops: localStops,
      mode: routeMode,
      optimized: optimizedResult !== null,
    }
    setMultiStopRoute(route)
    toast.success('Route saved!')
  }, [localStops, routeName, routeMode, optimizedResult, setMultiStopRoute])

  // Export as GPX
  const exportGPX = useCallback(() => {
    if (!routeResult) return
    const waypoints = localStops
      .map(
        (s) =>
          `  <wpt lat="${s.latitude}" lon="${s.longitude}"><name>${s.name}</name><type>${s.type}</type></wpt>`
      )
      .join('\n')
    const trackPoints = routeResult.geometry
      .map((c) => `        <trkpt lat="${c[1]}" lon="${c[0]}"></trkpt>`)
      .join('\n')

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MapLibre Explorer">
${waypoints}
  <trk><name>${routeName || 'Multi-Stop Route'}</name><trkseg>
${trackPoints}
  </trkseg></trk>
</gpx>`

    const blob = new Blob([gpx], { type: 'application/gpx+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${routeName || 'route'}.gpx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('GPX exported!')
  }, [routeResult, localStops, routeName])

  // Share via link
  const shareRoute = useCallback(() => {
    const stops = localStops.map((s) => `${s.latitude},${s.longitude}`).join('|')
    const url = `${window.location.origin}${window.location.pathname}?route=${encodeURIComponent(stops)}&mode=${routeMode}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }, [localStops, routeMode])

  // Reset
  const resetPlanner = useCallback(() => {
    setLocalStops([])
    setRouteName('')
    setRouteResult(null)
    setOptimizedResult(null)
    setOriginalDistance(null)
    setAvoidHighways(false)
    setAvoidTolls(false)
    setAvoidFerries(false)
    setOptimizeMode('none')
    setDepartureTime('')
    removeRouteFromMap()
  }, [])

  const improvementPercent =
    originalDistance && optimizedResult
      ? Math.max(0, ((originalDistance - optimizedResult.distance) / originalDistance) * 100)
      : null

  // Fuel cost estimation (for driving)
  const fuelCostEstimate =
    routeResult && routeMode === 'driving'
      ? ((routeResult.distance / 1000) * 0.08 * 1.5).toFixed(2) // ~8L/100km, $1.5/L
      : null

  // Calories estimation (for cycling/walking)
  const caloriesEstimate =
    routeResult && routeMode === 'cycling'
      ? Math.round((routeResult.duration / 3600) * 400) // ~400 cal/hr cycling
      : routeResult && routeMode === 'walking'
        ? Math.round((routeResult.duration / 3600) * 300) // ~300 cal/hr walking
        : null

  // Total stop duration
  const totalStopDuration = localStops.reduce((acc, s) => acc + s.duration, 0)

  return (
    <Dialog open={multiStopPlannerOpen} onOpenChange={(open) => {
      if (!open) removeRouteFromMap()
      setMultiStopPlannerOpen(open)
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Waypoints className="h-5 w-5 text-teal-500" />
            Multi-Stop Route Planner
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto max-h-[calc(90vh-60px)]">
          {/* Route Name & Mode */}
          <div className="flex gap-2">
            <Input
              placeholder="Route name..."
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="flex-1 h-9 text-sm"
            />
            <Select value={routeMode} onValueChange={(v) => setRouteMode(v as any)}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <div className="flex items-center gap-1.5">
                  {MODE_ICONS[routeMode]}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driving">🚗 Driving</SelectItem>
                <SelectItem value="cycling">🚴 Cycling</SelectItem>
                <SelectItem value="walking">🚶 Walking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Route Options */}
          <div className="flex flex-wrap gap-2 items-center">
            <Badge
              variant={avoidHighways ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setAvoidHighways(!avoidHighways)}
            >
              No Highways
            </Badge>
            <Badge
              variant={avoidTolls ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setAvoidTolls(!avoidTolls)}
            >
              No Tolls
            </Badge>
            <Badge
              variant={avoidFerries ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setAvoidFerries(!avoidFerries)}
            >
              No Ferries
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <Select value={optimizeMode} onValueChange={(v) => setOptimizeMode(v as any)}>
              <SelectTrigger className="w-40 h-7 text-xs">
                <SelectValue placeholder="Optimize" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Optimization</SelectItem>
                <SelectItem value="shortest_distance">Shortest Distance</SelectItem>
                <SelectItem value="shortest_time">Shortest Time</SelectItem>
                <SelectItem value="scenic">Scenic Route</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-44 h-7 text-xs"
              placeholder="Departure time"
            />
          </div>

          {/* Add Stops Section */}
          <div className="border rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Stops
            </div>

            {/* Search */}
            <div className="flex gap-1.5">
              <Input
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-8 text-xs"
              />
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleSearch}>
                Search
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-32 overflow-y-auto">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent border-b last:border-b-0 truncate"
                    onClick={() => addStopFromSearch(r)}
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}

            {/* Coordinates Input */}
            <div className="flex gap-1.5 items-center">
              <Input
                placeholder="Lat"
                value={coordInput.lat}
                onChange={(e) => setCoordInput({ ...coordInput, lat: e.target.value })}
                className="w-24 h-8 text-xs"
              />
              <Input
                placeholder="Lng"
                value={coordInput.lng}
                onChange={(e) => setCoordInput({ ...coordInput, lng: e.target.value })}
                className="w-24 h-8 text-xs"
              />
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addStopFromCoords}>
                Add
              </Button>
            </div>

            {/* Saved Locations */}
            {savedLocations.length > 0 && (
              <div className="flex gap-1.5 items-center">
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue placeholder="Select saved location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {savedLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addStopFromSaved}>
                  Add
                </Button>
              </div>
            )}

            {/* Click Map */}
            <Button size="sm" variant="outline" className="h-8 text-xs w-full" onClick={addStopFromMap}>
              <MapPin className="h-3.5 w-3.5 mr-1" /> Click on Map to Add Stop
            </Button>
          </div>

          {/* Stops List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Stops ({localStops.length})
              </span>
              {localStops.length > 0 && (
                <Button size="sm" variant="ghost" className="h-6 text-xs text-destructive" onClick={resetPlanner}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Clear All
                </Button>
              )}
            </div>

            <ScrollArea className="max-h-64">
              {localStops.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No stops added yet. Use the controls above to add stops.
                </div>
              ) : (
                <div className="space-y-1.5 pr-2">
                  {localStops.map((stop, index) => (
                    <div
                      key={stop.id}
                      className="flex items-center gap-2 border rounded-lg p-2 bg-card"
                    >
                      <Badge className={`${STOP_TYPE_COLORS[stop.type]} text-[10px] px-1.5 py-0 h-5 shrink-0`}>
                        {STOP_TYPE_ICONS[stop.type]}
                      </Badge>
                      <div className="flex-1 min-w-0 space-y-1">
                        <Input
                          value={stop.name}
                          onChange={(e) => updateStopName(stop.id, e.target.value)}
                          className="h-6 text-xs border-0 p-0 bg-transparent focus-visible:ring-0"
                        />
                        <div className="flex items-center gap-1.5">
                          <Select
                            value={stop.type}
                            onValueChange={(v) => updateStopType(stop.id, v as MultiStop['type'])}
                          >
                            <SelectTrigger className="h-5 text-[10px] w-20 border-0 p-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="start">Start</SelectItem>
                              <SelectItem value="waypoint">Waypoint</SelectItem>
                              <SelectItem value="end">End</SelectItem>
                              <SelectItem value="fuel">Fuel</SelectItem>
                              <SelectItem value="food">Food</SelectItem>
                              <SelectItem value="rest">Rest</SelectItem>
                              <SelectItem value="scenic">Scenic</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <Input
                              type="number"
                              min={0}
                              value={stop.duration}
                              onChange={(e) =>
                                updateStopDuration(stop.id, parseInt(e.target.value) || 0)
                              }
                              className="h-5 w-12 text-[10px] border-0 p-0 bg-transparent"
                              placeholder="min"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          disabled={index === 0}
                          onClick={() => moveStop(index, 'up')}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          disabled={index === localStops.length - 1}
                          onClick={() => moveStop(index, 'down')}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive shrink-0"
                        onClick={() => removeStop(stop.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Calculate Button */}
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            onClick={calculateRoute}
            disabled={localStops.length < 2 || isCalculating}
          >
            {isCalculating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calculating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Route className="h-4 w-4" /> Calculate Route
              </span>
            )}
          </Button>

          {/* Route Results */}
          {routeResult && (
            <div className="border rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-teal-600">
                    {formatDistance(routeResult.distance)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Total Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    {formatDuration(routeResult.duration + totalStopDuration * 60)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-600">{localStops.length}</div>
                  <div className="text-[10px] text-muted-foreground">Total Stops</div>
                </div>
              </div>

              {/* Optimization improvement */}
              {improvementPercent !== null && improvementPercent > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-md p-2 text-center">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">
                    Route optimized! <strong>{improvementPercent.toFixed(1)}% shorter</strong> than original
                  </span>
                </div>
              )}

              {/* Fuel / Calories */}
              <div className="flex gap-2 justify-center">
                {fuelCostEstimate && (
                  <Badge variant="secondary" className="text-xs">
                    <Fuel className="h-3 w-3 mr-1" /> Est. fuel: ${fuelCostEstimate}
                  </Badge>
                )}
                {caloriesEstimate && (
                  <Badge variant="secondary" className="text-xs">
                    🔥 Est. calories: {caloriesEstimate} kcal
                  </Badge>
                )}
              </div>

              {/* Original vs Optimized */}
              {optimizedResult && (
                <div className="flex gap-3 justify-center text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-4 rounded bg-teal-500" /> Original: {formatDistance(routeResult.distance)}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-4 rounded bg-amber-500" /> Optimized: {formatDistance(optimizedResult.distance)}
                  </div>
                </div>
              )}

              {/* Turn-by-turn directions */}
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => setShowDirections(!showDirections)}
                >
                  <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${showDirections ? 'rotate-90' : ''}`} />
                  Turn-by-turn Directions ({routeResult.steps.length} steps)
                </Button>
                {showDirections && (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-1 pr-2 mt-1">
                      {routeResult.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs p-1.5 rounded hover:bg-accent">
                          <span className="text-base shrink-0">
                            {getManeuverIcon(step.maneuver.type, step.maneuver.modifier)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{step.name}</div>
                            <div className="text-muted-foreground">
                              {formatDistance(step.distance)} · {formatDuration(step.duration)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {routeResult && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={saveRoute}>
                <Save className="h-3.5 w-3.5 mr-1" /> Save Route
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={exportGPX}>
                <Download className="h-3.5 w-3.5 mr-1" /> Export GPX
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={shareRoute}>
                <Share2 className="h-3.5 w-3.5 mr-1" /> Share Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
