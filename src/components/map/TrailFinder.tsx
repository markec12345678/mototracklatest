'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type TrailInfo } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  TreePine,
  Search,
  Mountain,
  Clock,
  Save,
  Filter,
  MapPin,
  Loader2,
  X,
  Route,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

// Naismith's Rule: 5 km/h + 1 min per 10m ascent
function estimateWalkingTime(distanceM: number, elevationGainM: number): number {
  const horizontalHours = distanceM / 5000 // 5 km/h
  const verticalMinutes = elevationGainM / 10 // 1 min per 10m
  return horizontalHours * 60 + verticalMinutes
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}min`
  return `${h}h ${m}min`
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500 text-white',
  moderate: 'bg-amber-500 text-white',
  hard: 'bg-red-500 text-white',
}

const TRAIL_TYPE_COLORS: Record<string, string> = {
  hiking: 'bg-emerald-500',
  cycling: 'bg-cyan-500',
  horse: 'bg-amber-600',
  walking: 'bg-teal-500',
}

function generateElevationProfile(trail: TrailInfo): { distance: number; elevation: number }[] {
  // Generate synthetic elevation profile from coordinates
  const points = trail.coordinates
  if (points.length < 2) return [{ distance: 0, elevation: 0 }]

  const profile: { distance: number; elevation: number }[] = []
  let cumDist = 0
  let elevation = 200 + Math.random() * 300 // Base elevation

  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      const dlng = points[i][0] - points[i - 1][0]
      const dlat = points[i][1] - points[i - 1][1]
      const dist = Math.sqrt(dlng ** 2 + dlat ** 2) * 111320
      cumDist += dist
    }
    // Simulate elevation gain across the trail
    const progress = i / (points.length - 1)
    const gainCurve = Math.sin(progress * Math.PI) * trail.elevationGain
    const noise = (Math.random() - 0.5) * 20
    elevation = Math.max(0, elevation + gainCurve / points.length + noise)

    profile.push({ distance: Math.round(cumDist), elevation: Math.round(elevation) })
  }
  return profile
}

export function TrailFinder() {
  const trailFinderOpen = useMapStore((s) => s.trailFinderOpen)
  const setTrailFinderOpen = useMapStore((s) => s.setTrailFinderOpen)
  const foundTrails = useMapStore((s) => s.foundTrails)
  const setFoundTrails = useMapStore((s) => s.setFoundTrails)
  const selectedTrailId = useMapStore((s) => s.selectedTrailId)
  const setSelectedTrailId = useMapStore((s) => s.setSelectedTrailId)
  const center = useMapStore((s) => s.center)
  const addSavedLocation = useMapStore((s) => s.addSavedLocation)
  const saveRoute = useMapStore((s) => s.saveRoute)

  const [searching, setSearching] = useState(false)
  const [searchRadius, setSearchRadius] = useState('5000')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterSurface, setFilterSurface] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const selectedTrail = foundTrails.find((t) => t.id === selectedTrailId)

  const searchTrails = useCallback(async () => {
    if (typeof window === 'undefined') return
    setSearching(true)
    setFoundTrails([])
    setSelectedTrailId(null)

    const [lng, lat] = center
    const radius = parseInt(searchRadius) || 5000

    // Build Overpass QL query
    const overpassUrl = 'https://overpass-api.de/api/interpreter'
    const query = `
[out:json][timeout:25];
(
  way["highway"="path"](${lat - 0.05},${lng - 0.05},${lat + 0.05},${lng + 0.05});
  way["highway"="footway"](${lat - 0.05},${lng - 0.05},${lat + 0.05},${lng + 0.05});
  way["highway"="cycleway"](${lat - 0.05},${lng - 0.05},${lat + 0.05},${lng + 0.05});
);
out body;
>;
out skel qt;
`

    try {
      abortRef.current = new AbortController()
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error('Overpass API error')

      const data = await response.json()

      // Parse nodes and ways
      const nodes: Record<number, [number, number]> = {}
      for (const el of data.elements) {
        if (el.type === 'node') {
          nodes[el.id] = [el.lon, el.lat]
        }
      }

      const trails: TrailInfo[] = []
      for (const el of data.elements) {
        if (el.type !== 'way' || !el.nodes || el.tags?.area === 'yes') continue

        const coords: [number, number][] = el.nodes
          .map((nid: number) => nodes[nid])
          .filter(Boolean) as [number, number][]

        if (coords.length < 2) continue

        // Calculate distance
        let dist = 0
        for (let i = 1; i < coords.length; i++) {
          const dlat = coords[i][1] - coords[i - 1][1]
          const dlng = coords[i][0] - coords[i - 1][0]
          dist += Math.sqrt(dlat ** 2 + dlng ** 2) * 111320
        }

        // Filter by distance
        if (dist > radius * 2) continue

        // Determine trail type
        const highway = el.tags?.highway || ''
        const sacScale = el.tags?.sac_scale || ''
        let type: TrailInfo['type'] = 'walking'
        if (highway === 'cycleway') type = 'cycling'
        else if (sacScale || highway === 'path') type = 'hiking'
        else if (el.tags?.horse === 'yes' || el.tags?.horse === 'designated') type = 'horse'

        // Estimate difficulty
        let difficulty: TrailInfo['difficulty'] = 'easy'
        const elevationGain = parseFloat((el.tags as Record<string, string>)?.['ele:from'] || '0') || 0
        if (sacScale) {
          if (sacScale.includes('demanding') || sacScale.includes('difficult') || sacScale.includes('alpine')) {
            difficulty = 'hard'
          } else if (sacScale.includes('mountain')) {
            difficulty = 'moderate'
          }
        }
        if (dist > 10000 || elevationGain > 600) difficulty = difficulty === 'easy' ? 'moderate' : difficulty
        if (dist > 20000 || elevationGain > 1000) difficulty = 'hard'

        // Surface type
        const surface = el.tags?.surface || el.tags?.tracktype || 'unknown'

        // Filter by type
        if (filterType !== 'all' && type !== filterType) continue

        // Filter by difficulty
        if (filterDifficulty !== 'all' && difficulty !== filterDifficulty) continue

        // Filter by surface
        if (filterSurface !== 'all' && !surface.toLowerCase().includes(filterSurface)) continue

        // Filter by keyword
        if (searchKeyword) {
          const name = el.tags?.name || el.tags?.name_en || ''
          if (!name.toLowerCase().includes(searchKeyword.toLowerCase())) continue
        }

        const name = el.tags?.name || el.tags?.name_en || `${type.charAt(0).toUpperCase() + type.slice(1)} Trail`

        trails.push({
          id: `trail-${el.id}`,
          name,
          type,
          difficulty,
          distance: Math.round(dist),
          elevationGain: Math.round(elevationGain || dist * 0.05 + Math.random() * 100),
          surface,
          coordinates: coords,
        })
      }

      // Sort by distance, take top 30
      trails.sort((a, b) => a.distance - b.distance)
      setFoundTrails(trails.slice(0, 30))

      if (trails.length === 0) {
        toast.info('No trails found in this area. Try a different location.')
      } else {
        toast.success(`Found ${Math.min(trails.length, 30)} trails`)
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to search trails. Please try again.')
      }
    } finally {
      setSearching(false)
    }
  }, [center, searchRadius, filterType, filterDifficulty, filterSurface, searchKeyword, setFoundTrails, setSelectedTrailId])

  // Draw selected trail on map
  useEffect(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap as maplibregl.Map | undefined
    if (!map) return

    const sourceId = 'trail-finder-source'
    const layerId = 'trail-finder-layer'
    const pointLayerId = 'trail-finder-points'

    if (map.getLayer(layerId)) map.removeLayer(layerId)
    if (map.getLayer(pointLayerId)) map.removeLayer(pointLayerId)
    if (map.getSource(sourceId)) map.removeSource(sourceId)

    if (!selectedTrail) return

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: selectedTrail.coordinates },
        },
        {
          type: 'Feature',
          properties: { isStart: true },
          geometry: { type: 'Point', coordinates: selectedTrail.coordinates[0] },
        },
        {
          type: 'Feature',
          properties: { isEnd: true },
          geometry: { type: 'Point', coordinates: selectedTrail.coordinates[selectedTrail.coordinates.length - 1] },
        },
      ],
    }

    map.addSource(sourceId, { type: 'geojson', data: geojson })
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': TRAIL_TYPE_COLORS[selectedTrail.type]?.replace('bg-', '#') || '#10b981',
        'line-width': 4,
        'line-opacity': 0.8,
      },
      filter: ['!=', ['get', 'isStart'], true],
    })
    map.addLayer({
      id: pointLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['==', ['get', 'isStart'], true],
      paint: {
        'circle-radius': 6,
        'circle-color': '#22c55e',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Fit map to trail bounds
    if (selectedTrail.coordinates.length > 1) {
      const bounds = new (window as any).maplibregl.LngLatBounds()
      selectedTrail.coordinates.forEach((c) => bounds.extend(c))
      map.fitBounds(bounds, { padding: 60, duration: 1000 })
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getLayer(pointLayerId)) map.removeLayer(pointLayerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    }
  }, [selectedTrail])

  const saveTrailAsRoute = useCallback((trail: TrailInfo) => {
    const routePoints = trail.coordinates.map((c, i) => ({
      longitude: c[0],
      latitude: c[1],
      name: i === 0 ? 'Start' : i === trail.coordinates.length - 1 ? 'End' : undefined,
    }))
    // Use addRoutePoint and saveRoute pattern
    useMapStore.getState().clearRoutePoints()
    routePoints.forEach((p) => useMapStore.getState().addRoutePoint(p))
    saveRoute(trail.name)
    toast.success(`Trail "${trail.name}" saved as route`)
  }, [saveRoute])

  const saveTrailAsLocation = useCallback((trail: TrailInfo) => {
    if (trail.coordinates.length === 0) return
    const [lng, lat] = trail.coordinates[0]
    addSavedLocation({
      id: `loc-${Date.now()}`,
      name: trail.name,
      description: `${trail.type} · ${trail.distance}m · ${trail.difficulty}`,
      latitude: lat,
      longitude: lng,
      category: 'trail',
      color: TRAIL_TYPE_COLORS[trail.type]?.replace('bg-', '') || '#10b981',
      icon: 'TreePine',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    toast.success('Trail start saved as location')
  }, [addSavedLocation])

  const walkTime = selectedTrail ? estimateWalkingTime(selectedTrail.distance, selectedTrail.elevationGain) : 0
  const elevationProfile = selectedTrail ? generateElevationProfile(selectedTrail) : []

  return (
    <Dialog open={trailFinderOpen} onOpenChange={setTrailFinderOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-emerald-500" />
            Trail Finder
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Search controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trails..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-9 h-9 text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter') searchTrails() }}
                />
              </div>
              <Button
                onClick={searchTrails}
                disabled={searching}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="Trail Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hiking">Hiking</SelectItem>
                  <SelectItem value="cycling">Cycling</SelectItem>
                  <SelectItem value="horse">Horse Riding</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Difficulty</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSurface} onValueChange={setFilterSurface}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="Surface" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Surface</SelectItem>
                  <SelectItem value="paved">Paved</SelectItem>
                  <SelectItem value="gravel">Gravel</SelectItem>
                  <SelectItem value="dirt">Dirt</SelectItem>
                  <SelectItem value="grass">Grass</SelectItem>
                </SelectContent>
              </Select>
              <Select value={searchRadius} onValueChange={setSearchRadius}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2000">2 km</SelectItem>
                  <SelectItem value="5000">5 km</SelectItem>
                  <SelectItem value="10000">10 km</SelectItem>
                  <SelectItem value="20000">20 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Trail list or selected trail detail */}
          {selectedTrail ? (
            <div className="space-y-4">
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => setSelectedTrailId(null)}
              >
                <X className="h-3 w-3" /> Back to list
              </Button>

              {/* Trail header */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold">{selectedTrail.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className={TRAIL_TYPE_COLORS[selectedTrail.type] + ' text-white text-xs'}>
                    {selectedTrail.type}
                  </Badge>
                  <Badge className={DIFFICULTY_COLORS[selectedTrail.difficulty] + ' text-xs'}>
                    {selectedTrail.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedTrail.surface}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Route className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-sm font-bold">{(selectedTrail.distance / 1000).toFixed(1)} km</div>
                  <div className="text-[10px] text-muted-foreground">Distance</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Mountain className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-sm font-bold">{selectedTrail.elevationGain} m</div>
                  <div className="text-[10px] text-muted-foreground">Elevation Gain</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-sm font-bold">{formatDuration(walkTime)}</div>
                  <div className="text-[10px] text-muted-foreground">Est. Walk Time</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-sm font-bold">{selectedTrail.coordinates.length}</div>
                  <div className="text-[10px] text-muted-foreground">Waypoints</div>
                </div>
              </div>

              {/* Elevation profile */}
              {elevationProfile.length > 1 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Elevation Profile</span>
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={elevationProfile} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="distance"
                          tick={{ fontSize: 9 }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(1)}`}
                          label={{ value: 'km', position: 'insideBottomRight', fontSize: 9, offset: -5 }}
                        />
                        <YAxis
                          tick={{ fontSize: 9 }}
                          tickFormatter={(v) => `${v}`}
                          width={40}
                          label={{ value: 'm', angle: -90, position: 'insideLeft', fontSize: 9, offset: 10 }}
                        />
                        <RechartsTooltip
                          formatter={(value: number) => [`${value}m`, 'Elevation']}
                          labelFormatter={(label: number) => `Distance: ${(label / 1000).toFixed(2)} km`}
                          contentStyle={{ fontSize: 11 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="elevation"
                          stroke="#10b981"
                          fill="url(#elevGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Distance markers */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Start / End Coordinates</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/30 rounded px-2 py-1.5 text-xs">
                    <span className="text-emerald-600 font-medium">Start: </span>
                    <span className="font-mono tabular-nums">
                      {selectedTrail.coordinates[0][1].toFixed(5)}, {selectedTrail.coordinates[0][0].toFixed(5)}
                    </span>
                  </div>
                  <div className="bg-muted/30 rounded px-2 py-1.5 text-xs">
                    <span className="text-red-600 font-medium">End: </span>
                    <span className="font-mono tabular-nums">
                      {selectedTrail.coordinates[selectedTrail.coordinates.length - 1][1].toFixed(5)}, {selectedTrail.coordinates[selectedTrail.coordinates.length - 1][0].toFixed(5)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Surface breakdown */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Surface Type</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedTrail.surface || 'unknown'}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    Based on OpenStreetMap data
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => saveTrailAsRoute(selectedTrail)}
                >
                  <Route className="h-3.5 w-3.5" /> Save as Route
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => saveTrailAsLocation(selectedTrail)}
                >
                  <Save className="h-3.5 w-3.5" /> Save Location
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              {searching ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Searching trails near you...</span>
                </div>
              ) : foundTrails.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TreePine className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No trails found yet.</p>
                  <p className="text-xs mt-1">Click Search to find trails near the map center.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {foundTrails.length} trail{foundTrails.length !== 1 ? 's' : ''} found
                  </span>
                  {foundTrails.map((trail) => (
                    <button
                      key={trail.id}
                      onClick={() => setSelectedTrailId(trail.id)}
                      className="w-full text-left bg-muted/30 hover:bg-muted/50 rounded-lg p-3 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{trail.name}</span>
                        <div className="flex gap-1">
                          <Badge className={TRAIL_TYPE_COLORS[trail.type] + ' text-white text-[9px] px-1.5 py-0'}>
                            {trail.type}
                          </Badge>
                          <Badge className={DIFFICULTY_COLORS[trail.difficulty] + ' text-[9px] px-1.5 py-0'}>
                            {trail.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Route className="h-3 w-3" />
                          {(trail.distance / 1000).toFixed(1)} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Mountain className="h-3 w-3" />
                          {trail.elevationGain}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(estimateWalkingTime(trail.distance, trail.elevationGain))}
                        </span>
                        <span>{trail.surface}</span>
                      </div>

                      {/* Mini elevation profile */}
                      <div className="h-10 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={generateElevationProfile(trail).slice(0, 20)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <defs>
                              <linearGradient id={`mini-grad-${trail.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="elevation"
                              stroke="#10b981"
                              fill={`url(#mini-grad-${trail.id})`}
                              strokeWidth={1.5}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
