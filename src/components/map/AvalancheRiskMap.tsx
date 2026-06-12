'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { useMapStore, type AvalancheZone, type AvalancheRiskState } from '@/lib/map-store'
import {
  X,
  Mountain,
  Wind,
  Thermometer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Clock,
  ArrowUp,
  Gauge,
  RefreshCw,
  BarChart3,
  Info,
  Compass,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'

// Demo avalanche zones
const DEMO_ZONES: AvalancheZone[] = [
  {
    id: 'az1',
    name: 'Chamonix Nord',
    latitude: 45.924,
    longitude: 6.869,
    riskLevel: 'high',
    elevation: 2800,
    aspect: 'N',
    slopeAngle: 38,
    snowDepth: 185,
    snowStability: 'poor',
    recentAvalanches: 3,
    temperature: -8,
    windSpeed: 45,
    windDirection: 315,
    lastAssessment: '2024-12-15',
    coordinates: [],
  },
  {
    id: 'az2',
    name: 'Zermatt West',
    latitude: 46.02,
    longitude: 7.749,
    riskLevel: 'considerable',
    elevation: 3100,
    aspect: 'W',
    slopeAngle: 34,
    snowDepth: 220,
    snowStability: 'fair',
    recentAvalanches: 1,
    temperature: -12,
    windSpeed: 30,
    windDirection: 270,
    lastAssessment: '2024-12-15',
    coordinates: [],
  },
  {
    id: 'az3',
    name: 'St. Anton South',
    latitude: 47.13,
    longitude: 10.269,
    riskLevel: 'moderate',
    elevation: 2400,
    aspect: 'S',
    slopeAngle: 30,
    snowDepth: 140,
    snowStability: 'fair',
    recentAvalanches: 0,
    temperature: -4,
    windSpeed: 15,
    windDirection: 180,
    lastAssessment: '2024-12-14',
    coordinates: [],
  },
  {
    id: 'az4',
    name: 'Whistler Peak',
    latitude: 50.058,
    longitude: -122.952,
    riskLevel: 'low',
    elevation: 2000,
    aspect: 'SE',
    slopeAngle: 25,
    snowDepth: 110,
    snowStability: 'good',
    recentAvalanches: 0,
    temperature: -2,
    windSpeed: 10,
    windDirection: 135,
    lastAssessment: '2024-12-15',
    coordinates: [],
  },
  {
    id: 'az5',
    name: 'Alta Wind Gate',
    latitude: 40.589,
    longitude: -111.639,
    riskLevel: 'extreme',
    elevation: 3200,
    aspect: 'NE',
    slopeAngle: 42,
    snowDepth: 280,
    snowStability: 'very_poor',
    recentAvalanches: 7,
    temperature: -15,
    windSpeed: 65,
    windDirection: 45,
    lastAssessment: '2024-12-15',
    coordinates: [],
  },
]

const RISK_COLORS: Record<AvalancheZone['riskLevel'], { bg: string; text: string; hex: string }> = {
  low: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', hex: '#22c55e' },
  moderate: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', hex: '#eab308' },
  considerable: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', hex: '#f97316' },
  high: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', hex: '#ef4444' },
  extreme: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', hex: '#a855f7' },
}

const STABILITY_COLORS: Record<AvalancheZone['snowStability'], { bg: string; text: string }> = {
  good: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  fair: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
  poor: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  very_poor: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
}

export function AvalancheRiskMap() {
  const avalancheRisk = useMapStore((s) => s.avalancheRisk)
  const setAvalancheRisk = useMapStore((s) => s.setAvalancheRisk)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Use demo data if store is empty
  const zones = avalancheRisk.zones.length > 0 ? avalancheRisk.zones : DEMO_ZONES

  // Wind rose data
  const windRoseData = useMemo(() => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return directions.map((dir) => {
      const matchingZones = zones.filter((z) => z.aspect === dir)
      const avgSpeed = matchingZones.length > 0
        ? matchingZones.reduce((s, z) => s + z.windSpeed, 0) / matchingZones.length
        : Math.floor(Math.random() * 30 + 5)
      return { direction: dir, windSpeed: +avgSpeed.toFixed(1), zones: matchingZones.length }
    })
  }, [zones])

  // Risk timeline data (7-day forecast demo)
  const riskTimelineData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const riskMap: Record<string, number> = { low: 1, moderate: 2, considerable: 3, high: 4, extreme: 5 }
    return days.map((day, i) => ({
      day,
      current: riskMap[zones[i % zones.length]?.riskLevel ?? 'low'],
      forecast: Math.min(5, Math.max(1, riskMap[zones[i % zones.length]?.riskLevel ?? 'low'] + (Math.random() > 0.5 ? 1 : -1))),
    }))
  }, [zones])

  const forecastDates = useMemo(() => {
    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }, [])

  if (!avalancheRisk.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-4 top-16 z-[40] w-[420px] max-h-[calc(100vh-5rem)]"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Avalanche Risk Map</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {zones.length} zones
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setAvalancheRisk({ open: false })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pb-4">
            {/* Overlay toggles */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showRiskOverlay' as const, label: 'Risk Overlay', icon: AlertTriangle },
                  { key: 'showAspectMap' as const, label: 'Aspect Map', icon: Compass },
                  { key: 'showSlopeAngles' as const, label: 'Slope Angles', icon: Gauge },
                  { key: 'showWindRose' as const, label: 'Wind Rose', icon: Wind },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={avalancheRisk[key]}
                      onCheckedChange={(checked) => setAvalancheRisk({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Forecast date selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Forecast Date</p>
              </div>
              <Select
                value={avalancheRisk.forecastDate}
                onValueChange={(value) => setAvalancheRisk({ forecastDate: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {forecastDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Wind Rose */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wind Rose</p>
                {avalancheRisk.comparisonMode && (
                  <Badge variant="secondary" className="text-[10px]">Comparison</Badge>
                )}
              </div>
              <div className="h-52 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={windRoseData}>
                    <PolarGrid strokeDasharray="3 3" opacity={0.3} />
                    <PolarAngleAxis dataKey="direction" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fontSize: 8 }} />
                    <Radar
                      name="Wind Speed (km/h)"
                      dataKey="windSpeed"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk Timeline</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setAvalancheRisk({ comparisonMode: !avalancheRisk.comparisonMode })}
                >
                  {avalancheRisk.comparisonMode ? 'Hide' : 'Compare'}
                </Button>
              </div>
              <div className="h-28 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTimelineData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    {avalancheRisk.comparisonMode && (
                      <>
                        <Line type="monotone" dataKey="forecast" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                      </>
                    )}
                    <Line type="monotone" dataKey="current" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Zone list */}
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2">
                {zones.map((zone) => {
                  const isExpanded = expandedId === zone.id
                  const riskStyle = RISK_COLORS[zone.riskLevel]
                  const stabilityStyle = STABILITY_COLORS[zone.snowStability]

                  return (
                    <div
                      key={zone.id}
                      className="rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : zone.id)}
                    >
                      <div className="flex items-center justify-between p-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mountain className="h-4 w-4 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{zone.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {zone.elevation}m · {zone.aspect} · {zone.slopeAngle}°
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={`${riskStyle.bg} ${riskStyle.text} text-[9px] border-0 capitalize`}>
                            {zone.riskLevel}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
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
                            <div className="px-2.5 pb-2.5 space-y-2">
                              <Separator />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <ArrowUp className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Slope:</span>
                                  <span className="font-medium">{zone.slopeAngle}°</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Gauge className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Snow:</span>
                                  <span className="font-medium">{zone.snowDepth} cm</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Thermometer className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Temp:</span>
                                  <span className="font-medium">{zone.temperature}°C</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Wind className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Wind:</span>
                                  <span className="font-medium">{zone.windSpeed} km/h</span>
                                </div>
                                <div className="flex items-center gap-1.5 col-span-2">
                                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Stability:</span>
                                  <Badge className={`${stabilityStyle.bg} ${stabilityStyle.text} text-[9px] border-0 capitalize`}>
                                    {zone.snowStability.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Recent:</span>
                                  <span className="font-medium">{zone.recentAvalanches} events</span>
                                </div>
                              </div>
                              {/* Snow stability gradient bar */}
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">Snow Stability Indicator</p>
                                <div className="h-2 rounded-full overflow-hidden bg-muted">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${zone.snowStability === 'good' ? 85 : zone.snowStability === 'fair' ? 55 : zone.snowStability === 'poor' ? 30 : 10}%`,
                                      background: `linear-gradient(to right, #ef4444, #eab308, #22c55e)`,
                                    }}
                                  />
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


