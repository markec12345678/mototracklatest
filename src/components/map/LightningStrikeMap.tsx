'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type LightningStrike } from '@/lib/map-store'
import {
  X,
  Zap,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  BarChart3,
  MapPin,
} from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

// Demo lightning strike data
const DEMO_STRIKES: LightningStrike[] = [
  { id: 'ls1', latitude: 35.22, longitude: -98.44, timestamp: Date.now() - 1200000, intensity: 28, type: 'cloud_to_ground', peakCurrent: -32 },
  { id: 'ls2', latitude: 36.15, longitude: -95.99, timestamp: Date.now() - 3600000, intensity: 45, type: 'cloud_to_ground', peakCurrent: -48 },
  { id: 'ls3', latitude: 34.05, longitude: -97.32, timestamp: Date.now() - 5400000, intensity: 12, type: 'cloud_to_cloud', peakCurrent: 8 },
  { id: 'ls4', latitude: 35.47, longitude: -97.52, timestamp: Date.now() - 7200000, intensity: 67, type: 'positive', peakCurrent: 125 },
  { id: 'ls5', latitude: 36.73, longitude: -99.98, timestamp: Date.now() - 10800000, intensity: 33, type: 'cloud_to_ground', peakCurrent: -28 },
  { id: 'ls6', latitude: 34.88, longitude: -96.11, timestamp: Date.now() - 14400000, intensity: 19, type: 'cloud_to_cloud', peakCurrent: 15 },
  { id: 'ls7', latitude: 35.91, longitude: -98.41, timestamp: Date.now() - 18000000, intensity: 52, type: 'cloud_to_ground', peakCurrent: -55 },
  { id: 'ls8', latitude: 36.33, longitude: -97.15, timestamp: Date.now() - 21600000, intensity: 8, type: 'cloud_to_cloud', peakCurrent: 5 },
  { id: 'ls9', latitude: 34.57, longitude: -99.84, timestamp: Date.now() - 28800000, intensity: 78, type: 'positive', peakCurrent: 198 },
  { id: 'ls10', latitude: 35.68, longitude: -96.79, timestamp: Date.now() - 36000000, intensity: 41, type: 'cloud_to_ground', peakCurrent: -38 },
  { id: 'ls11', latitude: 36.41, longitude: -98.72, timestamp: Date.now() - 43200000, intensity: 15, type: 'cloud_to_cloud', peakCurrent: 11 },
  { id: 'ls12', latitude: 34.22, longitude: -97.93, timestamp: Date.now() - 50400000, intensity: 56, type: 'cloud_to_ground', peakCurrent: -62 },
  { id: 'ls13', latitude: 35.39, longitude: -99.15, timestamp: Date.now() - 57600000, intensity: 91, type: 'positive', peakCurrent: 245 },
  { id: 'ls14', latitude: 36.58, longitude: -96.35, timestamp: Date.now() - 64800000, intensity: 22, type: 'cloud_to_cloud', peakCurrent: 18 },
  { id: 'ls15', latitude: 34.95, longitude: -98.56, timestamp: Date.now() - 72000000, intensity: 37, type: 'cloud_to_ground', peakCurrent: -41 },
]

const TYPE_COLORS: Record<LightningStrike['type'], { bg: string; text: string; label: string; chart: string }> = {
  cloud_to_ground: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', label: 'CG', chart: '#eab308' },
  cloud_to_cloud: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', label: 'CC', chart: '#a855f7' },
  positive: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: '+CG', chart: '#f59e0b' },
}

const TIME_RANGES: { value: LightningState_timeRange; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
]

type LightningState_timeRange = '1h' | '6h' | '24h' | '7d'

const INTENSITY_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cloud_to_ground', label: 'CG' },
  { value: 'cloud_to_cloud', label: 'CC' },
  { value: 'positive', label: '+CG' },
]

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function LightningStrikeMap() {
  const lightning = useMapStore((s) => s.lightning)
  const setLightning = useMapStore((s) => s.setLightning)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (typeof window === 'undefined') return null
  if (!lightning.open) return null

  const strikes = lightning.strikes.length > 0 ? lightning.strikes : DEMO_STRIKES

  // Filter strikes based on time range and intensity filter
  const timeRangeMs: Record<string, number> = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
    '7d': 604800000,
  }

  const filteredStrikes = strikes.filter((s) => {
    const inTimeRange = Date.now() - s.timestamp <= (timeRangeMs[lightning.timeRange] || 86400000)
    const matchesIntensity = lightning.intensityFilter === 'all' || s.type === lightning.intensityFilter
    return inTimeRange && matchesIntensity
  })

  // Scatter chart data: strike intensity over time
  const scatterData = filteredStrikes.map((s) => ({
    time: formatTimeAgo(s.timestamp),
    timestamp: s.timestamp,
    intensity: s.intensity,
    type: s.type,
  }))

  // Bar chart data: strike count by type
  const barData = [
    { name: 'CG', count: filteredStrikes.filter((s) => s.type === 'cloud_to_ground').length, color: '#eab308' },
    { name: 'CC', count: filteredStrikes.filter((s) => s.type === 'cloud_to_cloud').length, color: '#a855f7' },
    { name: '+CG', count: filteredStrikes.filter((s) => s.type === 'positive').length, color: '#f59e0b' },
  ]

  const totalStrikes = filteredStrikes.length

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-16 right-4 z-30 w-[380px] max-h-[80vh] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-background/90 border shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Lightning Strike Map
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {totalStrikes} strikes
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLightning({ open: false })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Alert banner */}
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2.5 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{totalStrikes}</span>
                <span className="text-muted-foreground"> strikes detected in </span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{lightning.timeRange}</span>
              </div>
            </div>

            {/* Time range selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Range</p>
              <div className="flex gap-1">
                {TIME_RANGES.map((tr) => (
                  <Button
                    key={tr.value}
                    variant={lightning.timeRange === tr.value ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-7 flex-1"
                    onClick={() => setLightning({ timeRange: tr.value })}
                  >
                    {tr.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Intensity filter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type Filter</p>
              <div className="flex flex-wrap gap-1">
                {INTENSITY_FILTERS.map((f) => (
                  <Badge
                    key={f.value}
                    variant={lightning.intensityFilter === f.value ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setLightning({ intensityFilter: f.value as any })}
                  >
                    {f.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Overlay toggles */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showStrikes' as const, label: 'Strikes', icon: Zap },
                  { key: 'showDensityMap' as const, label: 'Density Map', icon: BarChart3 },
                  { key: 'showStormTracks' as const, label: 'Storm Tracks', icon: TrendingUp },
                  { key: 'showAlertZones' as const, label: 'Alert Zones', icon: AlertTriangle },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={lightning[key]}
                      onCheckedChange={(checked) => setLightning({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Scatter chart: strike intensity over time */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Strike Intensity Over Time</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 8 }}
                      tickFormatter={(v) => formatTimeAgo(v)}
                      type="number"
                      domain={['dataMin', 'dataMax']}
                    />
                    <YAxis tick={{ fontSize: 8 }} label={{ value: 'kA', angle: -90, position: 'insideLeft', fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'intensity') return [`${value} kA`, 'Intensity']
                        return [value, name]
                      }}
                    />
                    <Scatter data={scatterData} fill="#eab308">
                      {scatterData.map((entry, index) => (
                        <Cell key={index} fill={TYPE_COLORS[entry.type as LightningStrike['type']]?.chart || '#eab308'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart: strike count by type */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Strikes by Type</p>
              <div className="h-24 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Strike list */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {filteredStrikes.map((strike) => {
                  const typeStyle = TYPE_COLORS[strike.type]
                  const isExpanded = expandedId === strike.id

                  return (
                    <div
                      key={strike.id}
                      className="rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : strike.id)}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Zap className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">
                              {strike.intensity} kA · {strike.peakCurrent > 0 ? '+' : ''}{strike.peakCurrent} kA
                            </p>
                            <p className="text-[10px] text-muted-foreground">{formatTimeAgo(strike.timestamp)}</p>
                          </div>
                        </div>
                        <Badge className={`${typeStyle.bg} ${typeStyle.text} text-[9px] border-0`}>
                          {typeStyle.label}
                        </Badge>
                      </div>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 pb-2 space-y-1.5">
                              <Separator />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Lat:</span>
                                  <span className="font-medium">{strike.latitude.toFixed(3)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Lon:</span>
                                  <span className="font-medium">{strike.longitude.toFixed(3)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Zap className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Intensity:</span>
                                  <span className="font-medium">{strike.intensity} kA</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Peak:</span>
                                  <span className="font-medium">{strike.peakCurrent} kA</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Time:</span>
                                  <span className="font-medium">{new Date(strike.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Type:</span>
                                  <Badge className={`${typeStyle.bg} ${typeStyle.text} text-[9px] border-0`}>{typeStyle.label}</Badge>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
