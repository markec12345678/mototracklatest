'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell as RechartsCell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useMapStore,
  type PollutionSource,
  type PollutionTrackerState,
} from '@/lib/map-store'
import {
  X,
  Factory,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  AlertTriangle,
  Wind,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Filter,
  Gauge,
  Waves,
  Zap,
  Cloud,
  Shield,
  Timer,
} from 'lucide-react'

// Demo data
const DEMO_SOURCES: PollutionSource[] = [
  {
    id: 'pol1',
    name: 'Riverside Steel Plant',
    latitude: 40.7128,
    longitude: -74.006,
    type: 'industrial',
    pollutants: ['PM2.5', 'SO2', 'NO2', 'CO'],
    aqi: 156,
    aqiLevel: 'unhealthy',
    pm25: 55.4,
    pm10: 82.1,
    no2: 45.2,
    so2: 22.8,
    co: 1.2,
    o3: 38.5,
    emissionRate: 4500,
    radius: 2000,
    lastReading: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    trend: 'stable',
  },
  {
    id: 'pol2',
    name: 'Metro Highway Junction',
    latitude: 34.0522,
    longitude: -118.2437,
    type: 'vehicle',
    pollutants: ['PM2.5', 'NO2', 'CO'],
    aqi: 112,
    aqiLevel: 'unhealthy_sensitive',
    pm25: 38.2,
    pm10: 55.0,
    no2: 62.5,
    so2: 8.4,
    co: 2.1,
    o3: 45.2,
    emissionRate: 2800,
    radius: 1500,
    lastReading: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    trend: 'worsening',
  },
  {
    id: 'pol3',
    name: 'Green Valley Farms',
    latitude: 41.8781,
    longitude: -87.6298,
    type: 'agricultural',
    pollutants: ['PM10', 'NH3', 'NO2'],
    aqi: 72,
    aqiLevel: 'moderate',
    pm25: 18.5,
    pm10: 65.3,
    no2: 22.1,
    so2: 4.2,
    co: 0.5,
    o3: 52.8,
    emissionRate: 1200,
    radius: 3000,
    lastReading: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    trend: 'improving',
  },
  {
    id: 'pol4',
    name: 'Harbor District',
    latitude: 51.5074,
    longitude: -0.1278,
    type: 'maritime',
    pollutants: ['PM2.5', 'SO2', 'NO2'],
    aqi: 89,
    aqiLevel: 'moderate',
    pm25: 28.3,
    pm10: 48.7,
    no2: 38.9,
    so2: 15.6,
    co: 0.8,
    o3: 42.1,
    emissionRate: 3200,
    radius: 2500,
    lastReading: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    trend: 'stable',
  },
  {
    id: 'pol5',
    name: 'Coal Power Station',
    latitude: 35.6762,
    longitude: 139.6503,
    type: 'energy',
    pollutants: ['PM2.5', 'SO2', 'NO2', 'CO', 'O3'],
    aqi: 210,
    aqiLevel: 'very_unhealthy',
    pm25: 82.6,
    pm10: 120.4,
    no2: 68.3,
    so2: 45.2,
    co: 3.5,
    o3: 65.4,
    emissionRate: 6800,
    radius: 5000,
    lastReading: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    trend: 'worsening',
  },
  {
    id: 'pol6',
    name: 'Saharan Dust Front',
    latitude: 36.8065,
    longitude: 10.1815,
    type: 'natural',
    pollutants: ['PM10', 'PM2.5'],
    aqi: 95,
    aqiLevel: 'moderate',
    pm25: 32.1,
    pm10: 145.6,
    no2: 12.3,
    so2: 3.8,
    co: 0.3,
    o3: 55.2,
    emissionRate: 800,
    radius: 15000,
    lastReading: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    trend: 'improving',
  },
]

const AQI_COLORS: Record<string, string> = {
  good: 'bg-green-500/10 text-green-600 dark:text-green-400',
  moderate: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  unhealthy_sensitive: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  unhealthy: 'bg-red-500/10 text-red-600 dark:text-red-400',
  very_unhealthy: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  hazardous: 'bg-rose-900/10 text-rose-700 dark:text-rose-400',
}

const AQI_BAR_COLORS: Record<string, string> = {
  good: '#22c55e',
  moderate: '#eab308',
  unhealthy_sensitive: '#f97316',
  unhealthy: '#ef4444',
  very_unhealthy: '#a855f7',
  hazardous: '#7f1d1d',
}

const TYPE_COLORS: Record<string, string> = {
  industrial: 'bg-red-500',
  vehicle: 'bg-amber-500',
  agricultural: 'bg-green-500',
  residential: 'bg-blue-500',
  natural: 'bg-stone-500',
  maritime: 'bg-cyan-500',
  energy: 'bg-purple-500',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  industrial: <Factory className="h-3 w-3" />,
  vehicle: <Zap className="h-3 w-3" />,
  agricultural: <Waves className="h-3 w-3" />,
  residential: <Shield className="h-3 w-3" />,
  natural: <Cloud className="h-3 w-3" />,
  maritime: <Waves className="h-3 w-3" />,
  energy: <Zap className="h-3 w-3" />,
}

const SOURCE_TYPES: PollutionSource['type'][] = ['industrial', 'vehicle', 'agricultural', 'residential', 'natural', 'maritime', 'energy']
const AQI_LEVELS: PollutionSource['aqiLevel'][] = ['good', 'moderate', 'unhealthy_sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']

const RADAR_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#7f1d1d']

export function PollutionTracker() {
  const { pollutionTracker, setPollutionTracker } = useMapStore()
  const [showFilters, setShowFilters] = useState(false)
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sources = pollutionTracker.sources.length > 0 ? pollutionTracker.sources : DEMO_SOURCES
  const state = pollutionTracker

  // Auto-refresh
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (state.autoRefresh) {
      refreshRef.current = setInterval(() => {
        // Simulate a refresh by updating lastReading timestamps
      }, 30000)
    }
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current)
    }
  }, [state.autoRefresh])

  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      if (state.filterType.length > 0 && !state.filterType.includes(source.type)) return false
      if (state.filterAQILevel.length > 0 && !state.filterAQILevel.includes(source.aqiLevel)) return false
      return true
    })
  }, [sources, state.filterType, state.filterAQILevel])

  // AQI Gauge data
  const avgAQI = useMemo(() => {
    if (filteredSources.length === 0) return 0
    return Math.round(filteredSources.reduce((sum, s) => sum + s.aqi, 0) / filteredSources.length)
  }, [filteredSources])

  const aqiGaugeData = useMemo(() => {
    return [
      { name: 'AQI', value: avgAQI, fill: AQI_BAR_COLORS[filteredSources[0]?.aqiLevel || 'moderate'] || '#eab308' },
    ]
  }, [avgAQI, filteredSources])

  // Radar chart data (pollutant breakdown)
  const radarData = useMemo(() => {
    if (filteredSources.length === 0) return []
    const activeSource = state.activeSourceId
      ? filteredSources.find((s) => s.id === state.activeSourceId)
      : filteredSources[0]
    if (!activeSource) return []
    return [
      { pollutant: 'PM2.5', value: Math.min(activeSource.pm25 / 150 * 100, 100), raw: activeSource.pm25 },
      { pollutant: 'PM10', value: Math.min(activeSource.pm10 / 200 * 100, 100), raw: activeSource.pm10 },
      { pollutant: 'NO2', value: Math.min(activeSource.no2 / 100 * 100, 100), raw: activeSource.no2 },
      { pollutant: 'SO2', value: Math.min(activeSource.so2 / 100 * 100, 100), raw: activeSource.so2 },
      { pollutant: 'CO', value: Math.min(activeSource.co / 5 * 100, 100), raw: activeSource.co },
      { pollutant: 'O3', value: Math.min(activeSource.o3 / 100 * 100, 100), raw: activeSource.o3 },
    ]
  }, [filteredSources, state.activeSourceId])

  const toggleFilter = useCallback(
    (filterKey: 'filterType' | 'filterAQILevel', value: string) => {
      const current = state[filterKey]
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      setPollutionTracker({ [filterKey]: next })
    },
    [state, setPollutionTracker]
  )

  const getAQILabel = (aqi: number): string => {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy (Sensitive)'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#22c55e'
    if (aqi <= 100) return '#eab308'
    if (aqi <= 150) return '#f97316'
    if (aqi <= 200) return '#ef4444'
    if (aqi <= 300) return '#a855f7'
    return '#7f1d1d'
  }

  if (!state.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed top-4 right-4 z-50 w-[420px] max-h-[calc(100vh-2rem)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            <h2 className="text-sm font-semibold">Pollution Tracker</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredSources.length} sources
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPollutionTracker({ open: false })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-4">
            {/* Average AQI */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Average AQI</p>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-3xl font-bold"
                        style={{ color: getAQIColor(avgAQI) }}
                      >
                        {avgAQI}
                      </span>
                      <span className="text-xs text-muted-foreground">{getAQILabel(avgAQI)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Auto-refresh</Label>
                    <Switch
                      checked={state.autoRefresh}
                      onCheckedChange={(checked) => setPollutionTracker({ autoRefresh: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overlay Toggles */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Eye className="h-3.5 w-3.5" />
                  Overlays
                </div>
                {[
                  { key: 'showAQIOverlay' as const, label: 'AQI Overlay' },
                  { key: 'showPM25' as const, label: 'PM2.5' },
                  { key: 'showDispersion' as const, label: 'Dispersion Model' },
                  { key: 'showTrends' as const, label: 'Trends' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-xs">{label}</Label>
                    <Switch
                      checked={state[key]}
                      onCheckedChange={(checked) => setPollutionTracker({ [key]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3">
                <button
                  className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                  </div>
                  {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3 mt-2"
                    >
                      <div>
                        <p className="text-xs font-medium mb-1.5">Source Type</p>
                        <div className="flex flex-wrap gap-1">
                          {SOURCE_TYPES.map((type) => (
                            <Badge
                              key={type}
                              variant={state.filterType.includes(type) ? 'default' : 'outline'}
                              className="cursor-pointer text-xs capitalize"
                              onClick={() => toggleFilter('filterType', type)}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1.5">AQI Level</p>
                        <div className="flex flex-wrap gap-1">
                          {AQI_LEVELS.map((level) => (
                            <Badge
                              key={level}
                              variant={state.filterAQILevel.includes(level) ? 'default' : 'outline'}
                              className={`cursor-pointer text-xs ${AQI_COLORS[level]}`}
                              onClick={() => toggleFilter('filterAQILevel', level)}
                            >
                              {level.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-3">
              {/* Radar chart */}
              <Card className="bg-transparent border-border/30">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    Pollutants
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={140}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="pollutant" tick={{ fontSize: 9 }} />
                      <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                      <Radar name="Level" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* AQI distribution */}
              <Card className="bg-transparent border-border/30">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    AQI Dist.
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart
                      data={filteredSources.map((s) => ({
                        name: s.name.split(' ')[0],
                        aqi: s.aqi,
                        fill: getAQIColor(s.aqi),
                      }))}
                    >
                      <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                      <YAxis tick={{ fontSize: 8 }} domain={[0, 500]} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
                        {filteredSources.map((s, index) => (
                          <RechartsCell key={`cell-${index}`} fill={getAQIColor(s.aqi)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Separator className="opacity-50" />

            {/* Sources List */}
            <div className="space-y-2">
              {filteredSources.map((source) => (
                <Card
                  key={source.id}
                  className={`bg-transparent border-border/30 cursor-pointer transition-colors hover:border-border/60 ${
                    state.activeSourceId === source.id ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() =>
                    setPollutionTracker({
                      activeSourceId: state.activeSourceId === source.id ? null : source.id,
                    })
                  }
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm font-medium truncate">{source.name}</span>
                          {source.trend === 'improving' && (
                            <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                          )}
                          {source.trend === 'worsening' && (
                            <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          <Badge className={`${TYPE_COLORS[source.type]} text-white text-[10px] px-1.5 py-0 capitalize`}>
                            {source.type}
                          </Badge>
                          <Badge className={`${AQI_COLORS[source.aqiLevel]} text-[10px] px-1.5 py-0`}>
                            AQI {source.aqi}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className="text-lg font-bold"
                          style={{ color: getAQIColor(source.aqi) }}
                        >
                          {source.aqi}
                        </span>
                      </div>
                    </div>
                    <AnimatePresence>
                      {state.activeSourceId === source.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <Separator className="my-2 opacity-50" />
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">PM2.5</span>
                              <p className="font-medium">{source.pm25} μg/m³</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">PM10</span>
                              <p className="font-medium">{source.pm10} μg/m³</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">NO2</span>
                              <p className="font-medium">{source.no2} ppb</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">SO2</span>
                              <p className="font-medium">{source.so2} ppb</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">CO</span>
                              <p className="font-medium">{source.co} ppm</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">O3</span>
                              <p className="font-medium">{source.o3} ppb</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Factory className="h-3 w-3" />
                              <span>{source.emissionRate} t/yr</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span>{new Date(source.lastReading).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  )
}
