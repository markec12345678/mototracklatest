'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type SeismicEvent, type SeismicActivityState } from '@/lib/map-store'
import {
  Activity,
  X,
  AlertTriangle,
  Waves,
  RefreshCw,
  Loader2,
  Globe,
  ChevronDown,
  ChevronUp,
  Zap,
  Timer,
  BarChart3,
} from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  ZAxis,
} from 'recharts'

// Demo seismic data
const DEMO_EVENTS: SeismicEvent[] = [
  {
    id: 'se1',
    latitude: 35.68,
    longitude: 139.69,
    magnitude: 5.4,
    depth: 35,
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    location: 'Tokyo, Japan',
    type: 'earthquake',
    felt: true,
    tsunami: false,
    significance: 480,
  },
  {
    id: 'se2',
    latitude: -33.44,
    longitude: -70.65,
    magnitude: 7.1,
    depth: 60,
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    location: 'Santiago, Chile',
    type: 'earthquake',
    felt: true,
    tsunami: true,
    significance: 890,
  },
  {
    id: 'se3',
    latitude: 37.77,
    longitude: -122.42,
    magnitude: 3.2,
    depth: 12,
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    location: 'San Francisco, CA',
    type: 'earthquake',
    felt: true,
    tsunami: false,
    significance: 210,
  },
  {
    id: 'se4',
    latitude: 28.61,
    longitude: 77.21,
    magnitude: 4.8,
    depth: 25,
    time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    location: 'New Delhi, India',
    type: 'earthquake',
    felt: true,
    tsunami: false,
    significance: 370,
  },
  {
    id: 'se5',
    latitude: 38.32,
    longitude: 142.37,
    magnitude: 6.2,
    depth: 40,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    location: 'Miyagi, Japan',
    type: 'earthquake',
    felt: true,
    tsunami: true,
    significance: 720,
  },
  {
    id: 'se6',
    latitude: 61.22,
    longitude: -149.89,
    magnitude: 2.1,
    depth: 8,
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    location: 'Anchorage, AK',
    type: 'earthquake',
    felt: false,
    tsunami: false,
    significance: 80,
  },
  {
    id: 'se7',
    latitude: 40.71,
    longitude: -74.01,
    magnitude: 1.5,
    depth: 5,
    time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    location: 'New York, NY',
    type: 'explosion',
    felt: false,
    tsunami: false,
    significance: 30,
  },
  {
    id: 'se8',
    latitude: -8.35,
    longitude: 115.17,
    magnitude: 5.8,
    depth: 70,
    time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    location: 'Bali, Indonesia',
    type: 'earthquake',
    felt: true,
    tsunami: false,
    significance: 540,
  },
  {
    id: 'se9',
    latitude: 19.43,
    longitude: -155.29,
    magnitude: 4.1,
    depth: 15,
    time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    location: 'Hawaii',
    type: 'volcanic',
    felt: true,
    tsunami: false,
    significance: 290,
  },
  {
    id: 'se10',
    latitude: 36.17,
    longitude: -115.14,
    magnitude: 8.0,
    depth: 15,
    time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    location: 'Las Vegas, NV',
    type: 'earthquake',
    felt: true,
    tsunami: false,
    significance: 950,
  },
]

const TIME_RANGE_LABELS: Record<string, string> = {
  hour: 'Past Hour',
  day: 'Past Day',
  week: 'Past Week',
  month: 'Past Month',
  year: 'Past Year',
}

function getMagnitudeColor(mag: number): string {
  if (mag < 3) return '#22c55e'
  if (mag < 5) return '#eab308'
  if (mag < 7) return '#f97316'
  return '#ef4444'
}

function getMagnitudeStyle(mag: number): { bg: string; color: string; label: string } {
  if (mag < 3) return { bg: 'bg-green-500/10', color: 'text-green-600 dark:text-green-400', label: 'Minor' }
  if (mag < 5) return { bg: 'bg-yellow-500/10', color: 'text-yellow-600 dark:text-yellow-400', label: 'Light' }
  if (mag < 7) return { bg: 'bg-orange-500/10', color: 'text-orange-600 dark:text-orange-400', label: 'Strong' }
  return { bg: 'bg-red-500/10', color: 'text-red-600 dark:text-red-400', label: 'Major' }
}

const TYPE_ICONS: Record<string, string> = {
  earthquake: '🌍',
  explosion: '💥',
  quarry: '⛏️',
  volcanic: '🌋',
}

export function SeismicActivityMap() {
  const seismicActivity = useMapStore((s) => s.seismicActivity)
  const setSeismicActivity = useMapStore((s) => s.setSeismicActivity)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Use demo data if store is empty
  const events = seismicActivity.events.length > 0 ? seismicActivity.events : DEMO_EVENTS

  const filteredEvents = useMemo(() => {
    let list = events
    if (seismicActivity.filterMinMagnitude > 0) {
      list = list.filter(e => e.magnitude >= seismicActivity.filterMinMagnitude)
    }
    if (seismicActivity.filterType.length > 0) {
      list = list.filter(e => seismicActivity.filterType.includes(e.type))
    }
    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }, [events, seismicActivity.filterMinMagnitude, seismicActivity.filterType])

  const scatterData = useMemo(() => {
    return filteredEvents.map(e => ({
      depth: e.depth,
      magnitude: e.magnitude,
      color: getMagnitudeColor(e.magnitude),
      name: e.location,
    }))
  }, [filteredEvents])

  const fetchUSGS = useCallback(async () => {
    if (typeof window === 'undefined') return
    setLoading(true)
    try {
      const timeRange = seismicActivity.filterTimeRange
      const minMag = seismicActivity.filterMinMagnitude
      const magLevel = minMag <= 2.5 ? '2.5' : minMag <= 4.5 ? '4.5' : 'significant'
      const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${timeRange}_${magLevel}.geojson`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const parsed: SeismicEvent[] = (data.features || []).map((f: any, i: number) => ({
        id: f.id || `usgs-${i}`,
        latitude: f.geometry?.coordinates?.[1] ?? 0,
        longitude: f.geometry?.coordinates?.[0] ?? 0,
        magnitude: f.properties?.mag ?? 0,
        depth: f.geometry?.coordinates?.[2] ?? 0,
        time: new Date(f.properties?.time ?? Date.now()).toISOString(),
        location: f.properties?.place || 'Unknown',
        type: (['earthquake', 'explosion', 'quarry', 'volcanic'].includes(f.properties?.type)
          ? f.properties.type
          : 'earthquake') as SeismicEvent['type'],
        felt: f.properties?.felt !== null && f.properties?.felt > 0,
        tsunami: f.properties?.tsunami === 1,
        significance: f.properties?.sig ?? 0,
      }))
      setSeismicActivity({ events: parsed, lastFetchTime: Date.now() })
    } catch {
      // Silently fail - demo data will still be shown
    } finally {
      setLoading(false)
    }
  }, [seismicActivity.filterTimeRange, seismicActivity.filterMinMagnitude, setSeismicActivity])

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current)
      autoRefreshRef.current = null
    }
    if (seismicActivity.autoRefresh) {
      autoRefreshRef.current = setInterval(fetchUSGS, 60000)
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current)
    }
  }, [seismicActivity.autoRefresh, fetchUSGS])

  const toggleFilterType = useCallback((type: string) => {
    const current = seismicActivity.filterType
    const next = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    setSeismicActivity({ filterType: next })
  }, [seismicActivity.filterType, setSeismicActivity])

  if (!seismicActivity.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25 }}
        className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Seismic Activity
                <Badge variant="outline" className="text-[10px] font-normal">
                  {filteredEvents.length} events
                </Badge>
                {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSeismicActivity({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Filters */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Min Magnitude</Label>
                    <span className="text-xs font-semibold tabular-nums">{seismicActivity.filterMinMagnitude.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[seismicActivity.filterMinMagnitude]}
                    onValueChange={([v]) => setSeismicActivity({ filterMinMagnitude: v })}
                    min={0}
                    max={9}
                    step={0.5}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Time Range</Label>
                  <Select
                    value={seismicActivity.filterTimeRange}
                    onValueChange={(v) => setSeismicActivity({ filterTimeRange: v as SeismicActivityState['filterTimeRange'] })}
                  >
                    <SelectTrigger className="h-7 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIME_RANGE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Event Type</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['earthquake', 'explosion', 'quarry', 'volcanic'] as const).map(type => (
                      <Badge
                        key={type}
                        variant={seismicActivity.filterType.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer text-[10px] capitalize transition-colors"
                        onClick={() => toggleFilterType(type)}
                      >
                        {TYPE_ICONS[type]} {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Overlay Toggles */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Map Overlays
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={seismicActivity.showShakeMap}
                      onCheckedChange={(v) => setSeismicActivity({ showShakeMap: v })}
                    />
                    <span className="text-xs">Shake Map</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={seismicActivity.showFaultLines}
                      onCheckedChange={(v) => setSeismicActivity({ showFaultLines: v })}
                    />
                    <span className="text-xs">Fault Lines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={seismicActivity.showPlateBoundaries}
                      onCheckedChange={(v) => setSeismicActivity({ showPlateBoundaries: v })}
                    />
                    <span className="text-xs">Plate Boundaries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={seismicActivity.autoRefresh}
                      onCheckedChange={(v) => setSeismicActivity({ autoRefresh: v })}
                    />
                    <span className="text-xs">Auto-refresh (60s)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs gap-1"
                  onClick={fetchUSGS}
                  disabled={loading}
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  Fetch USGS Data
                </Button>
              </div>

              <Separator />

              {/* Depth/Magnitude Scatter */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> Depth vs Magnitude
                </Label>
                <ResponsiveContainer width="100%" height={160}>
                  <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis
                      dataKey="depth"
                      type="number"
                      name="Depth"
                      unit=" km"
                      tick={{ fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      reversed
                    />
                    <YAxis
                      dataKey="magnitude"
                      type="number"
                      name="Magnitude"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ZAxis range={[40, 200]} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'Magnitude' ? value.toFixed(1) : `${value} km`,
                        name,
                      ]}
                    />
                    <Scatter data={scatterData} fill="#8884d8">
                      {scatterData.map((entry, index) => (
                        <Cell key={`sc-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Magnitude Legend */}
              <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> &lt;3</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> 3-5</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> 5-7</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &gt;7</div>
              </div>

              <Separator />

              {/* Earthquake List */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Recent Events</Label>
                {filteredEvents.map(event => {
                  const magStyle = getMagnitudeStyle(event.magnitude)
                  const isExpanded = expandedId === event.id
                  const timeAgo = (() => {
                    const diff = Date.now() - new Date(event.time).getTime()
                    const mins = Math.floor(diff / 60000)
                    if (mins < 60) return `${mins}m ago`
                    const hrs = Math.floor(mins / 60)
                    if (hrs < 24) return `${hrs}h ago`
                    return `${Math.floor(hrs / 24)}d ago`
                  })()
                  return (
                    <div
                      key={event.id}
                      className="rounded-lg border border-border/50 p-2.5 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{
                              backgroundColor: getMagnitudeColor(event.magnitude),
                              width: `${Math.max(24, event.magnitude * 4)}px`,
                              height: `${Math.max(24, event.magnitude * 4)}px`,
                            }}
                          >
                            {event.magnitude.toFixed(1)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{event.location}</div>
                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                              <span>{timeAgo}</span>
                              <span>{event.depth} km deep</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {event.tsunami && (
                            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-0 text-[9px] px-1.5 py-0 gap-0.5">
                              <Waves className="h-2.5 w-2.5" /> Tsunami
                            </Badge>
                          )}
                          <Badge className={`${magStyle.bg} ${magStyle.color} border-0 text-[9px] px-1.5 py-0`}>
                            {magStyle.label}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-medium capitalize">{TYPE_ICONS[event.type]} {event.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Significance</span>
                            <span className="font-medium">{event.significance}/1000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Felt Reports</span>
                            <span className="font-medium">{event.felt ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coordinates</span>
                            <span className="font-medium">{event.latitude.toFixed(2)}°, {event.longitude.toFixed(2)}°</span>
                          </div>
                          <div className="col-span-2 flex justify-between">
                            <span className="text-muted-foreground">Time</span>
                            <span className="font-medium">{new Date(event.time).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Toggle button for the map toolbar
export function SeismicActivityToggle() {
  const seismicActivity = useMapStore((s) => s.seismicActivity)
  const setSeismicActivity = useMapStore((s) => s.setSeismicActivity)

  return (
    <Button
      variant={seismicActivity.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setSeismicActivity({ open: !seismicActivity.open })}
      title="Seismic Activity"
    >
      <Activity className="h-4 w-4" />
    </Button>
  )
}
