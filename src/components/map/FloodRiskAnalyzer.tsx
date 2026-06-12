'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type FloodZone } from '@/lib/map-store'
import {
  Droplets,
  X,
  Waves,
  AlertTriangle,
  Shield,
  TrendingUp,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Route,
  Building,
  Users,
  ChevronRight,
  Mountain,
  BarChart3,
  Clock,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts'

// Demo data
const DEMO_FLOOD_ZONES: FloodZone[] = [
  {
    id: 'fz-1',
    name: 'Thames Valley Lowlands',
    latitude: 51.48,
    longitude: -0.31,
    riskLevel: 'high',
    floodDepth100yr: 2.4,
    floodDepth500yr: 4.1,
    area: 12.8,
    population: 45000,
    infrastructure: 8,
    elevation: 5.2,
    drainageClass: 'poor',
    historicalFloods: [
      { year: 1947, depth: 2.8, duration: 14 },
      { year: 1953, depth: 3.2, duration: 10 },
      { year: 2000, depth: 2.1, duration: 8 },
      { year: 2014, depth: 2.5, duration: 12 },
      { year: 2024, depth: 2.8, duration: 9 },
    ],
    coordinates: [[-0.35, 51.46], [-0.25, 51.50], [-0.20, 51.47], [-0.30, 51.44]],
  },
  {
    id: 'fz-2',
    name: 'Birmingham Urban Basin',
    latitude: 52.48,
    longitude: -1.89,
    riskLevel: 'moderate',
    floodDepth100yr: 1.2,
    floodDepth500yr: 2.5,
    area: 8.5,
    population: 78000,
    infrastructure: 12,
    elevation: 142,
    drainageClass: 'moderate',
    historicalFloods: [
      { year: 1998, depth: 1.0, duration: 5 },
      { year: 2007, depth: 1.5, duration: 7 },
      { year: 2012, depth: 1.1, duration: 4 },
      { year: 2020, depth: 1.8, duration: 6 },
    ],
    coordinates: [[-1.95, 52.46], [-1.82, 52.50], [-1.80, 52.47], [-1.93, 52.44]],
  },
  {
    id: 'fz-3',
    name: 'York Floodplain',
    latitude: 53.96,
    longitude: -1.08,
    riskLevel: 'very_high',
    floodDepth100yr: 3.5,
    floodDepth500yr: 5.2,
    area: 18.2,
    population: 32000,
    infrastructure: 6,
    elevation: 10.5,
    drainageClass: 'very_poor',
    historicalFloods: [
      { year: 1982, depth: 3.0, duration: 16 },
      { year: 2000, depth: 3.8, duration: 18 },
      { year: 2012, depth: 3.2, duration: 14 },
      { year: 2015, depth: 4.2, duration: 21 },
      { year: 2020, depth: 3.6, duration: 15 },
    ],
    coordinates: [[-1.15, 53.94], [-1.00, 53.98], [-0.95, 53.95], [-1.10, 53.92]],
  },
  {
    id: 'fz-4',
    name: 'Cornwall Coastal Zone',
    latitude: 50.37,
    longitude: -4.14,
    riskLevel: 'low',
    floodDepth100yr: 0.8,
    floodDepth500yr: 1.5,
    area: 3.2,
    population: 8500,
    infrastructure: 3,
    elevation: 28,
    drainageClass: 'good',
    historicalFloods: [
      { year: 2004, depth: 0.6, duration: 3 },
      { year: 2014, depth: 0.9, duration: 4 },
    ],
    coordinates: [[-4.20, 50.35], [-4.08, 50.39], [-4.04, 50.36], [-4.16, 50.33]],
  },
  {
    id: 'fz-5',
    name: 'Somerset Levels',
    latitude: 51.12,
    longitude: -2.80,
    riskLevel: 'high',
    floodDepth100yr: 2.0,
    floodDepth500yr: 3.8,
    area: 25.6,
    population: 15000,
    infrastructure: 5,
    elevation: 3.5,
    drainageClass: 'poor',
    historicalFloods: [
      { year: 1994, depth: 1.8, duration: 20 },
      { year: 2000, depth: 2.2, duration: 25 },
      { year: 2012, depth: 1.9, duration: 18 },
      { year: 2014, depth: 2.8, duration: 35 },
      { year: 2020, depth: 2.4, duration: 22 },
    ],
    coordinates: [[-2.90, 51.10], [-2.70, 51.14], [-2.65, 51.11], [-2.85, 51.08]],
  },
  {
    id: 'fz-6',
    name: 'Edinburgh Waterfront',
    latitude: 55.95,
    longitude: -3.18,
    riskLevel: 'minimal',
    floodDepth100yr: 0.3,
    floodDepth500yr: 0.7,
    area: 1.8,
    population: 4200,
    infrastructure: 2,
    elevation: 18,
    drainageClass: 'excellent',
    historicalFloods: [],
    coordinates: [[-3.24, 55.93], [-3.12, 55.97], [-3.08, 55.94], [-3.20, 55.91]],
  },
]

const RISK_LEVEL_CONFIG: Record<string, { color: string; bgColor: string; textColor: string; label: string }> = {
  minimal: { color: '#22c55e', bgColor: 'bg-green-500/10', textColor: 'text-green-600 dark:text-green-400', label: 'Minimal' },
  low: { color: '#84cc16', bgColor: 'bg-lime-500/10', textColor: 'text-lime-600 dark:text-lime-400', label: 'Low' },
  moderate: { color: '#eab308', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-600 dark:text-yellow-400', label: 'Moderate' },
  high: { color: '#f97316', bgColor: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400', label: 'High' },
  very_high: { color: '#ef4444', bgColor: 'bg-red-500/10', textColor: 'text-red-600 dark:text-red-400', label: 'Very High' },
}

const DRAINAGE_CONFIG: Record<string, { bgColor: string; textColor: string; label: string }> = {
  excellent: { bgColor: 'bg-green-500/10', textColor: 'text-green-600 dark:text-green-400', label: 'Excellent' },
  good: { bgColor: 'bg-teal-500/10', textColor: 'text-teal-600 dark:text-teal-400', label: 'Good' },
  moderate: { bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-600 dark:text-yellow-400', label: 'Moderate' },
  poor: { bgColor: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400', label: 'Poor' },
  very_poor: { bgColor: 'bg-red-500/10', textColor: 'text-red-600 dark:text-red-400', label: 'Very Poor' },
}

function getDepthColor(depth: number, maxDepth: number): string {
  const ratio = Math.min(depth / maxDepth, 1)
  if (ratio < 0.2) return '#22c55e'
  if (ratio < 0.4) return '#84cc16'
  if (ratio < 0.6) return '#eab308'
  if (ratio < 0.8) return '#f97316'
  return '#ef4444'
}

export function FloodRiskAnalyzer() {
  const floodRisk = useMapStore((s) => s.floodRisk)
  const setFloodRisk = useMapStore((s) => s.setFloodRisk)

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [animationStep, setAnimationStep] = useState(0)
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Use demo data if store is empty
  const zones = floodRisk.zones.length > 0 ? floodRisk.zones : DEMO_FLOOD_ZONES
  const isOpen = floodRisk.open
  const scenarioYear = floodRisk.scenarioYear

  const selectedZone = useMemo(() => {
    return zones.find((z) => z.id === selectedZoneId) || null
  }, [zones, selectedZoneId])

  const riskDistribution = useMemo(() => {
    const dist: Record<string, number> = { minimal: 0, low: 0, moderate: 0, high: 0, very_high: 0 }
    zones.forEach((z) => { dist[z.riskLevel]++ })
    return Object.entries(dist)
      .filter(([, count]) => count > 0)
      .map(([level, count]) => ({
        level: RISK_LEVEL_CONFIG[level]?.label || level,
        count,
        color: RISK_LEVEL_CONFIG[level]?.color || '#6b7280',
      }))
  }, [zones])

  const historicalChartData = useMemo(() => {
    if (!selectedZone) return []
    return selectedZone.historicalFloods.map((f) => ({
      year: f.year.toString(),
      depth: f.depth,
      duration: f.duration,
    }))
  }, [selectedZone])

  // Animation controls
  useEffect(() => {
    if (floodRisk.animationPlaying) {
      animationRef.current = setInterval(() => {
        setAnimationStep((prev) => (prev + 1) % 10)
      }, 800)
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current)
        animationRef.current = null
      }
    }
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
        animationRef.current = null
      }
    }
  }, [floodRisk.animationPlaying])

  const togglePanel = useCallback(() => {
    setFloodRisk({ open: !isOpen })
  }, [isOpen, setFloodRisk])

  const toggleAnimation = useCallback(() => {
    setFloodRisk({ animationPlaying: !floodRisk.animationPlaying })
  }, [floodRisk.animationPlaying, setFloodRisk])

  const resetAnimation = useCallback(() => {
    setFloodRisk({ animationPlaying: false })
    setAnimationStep(0)
  }, [setFloodRisk])

  if (typeof window === 'undefined') return null

  return (
    <>
      {/* Toggle button */}
      <motion.div
        className="fixed top-20 right-[12.5rem] z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={togglePanel}
          className={cn(
            'h-11 w-11 rounded-full shadow-lg transition-all duration-200',
            'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white'
          )}
          aria-label={isOpen ? 'Close flood risk analyzer' : 'Open flood risk analyzer'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Droplets className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-36 right-4 z-40 w-[400px] max-h-[75vh] flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-amber-500/10 to-red-500/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-md">
                  <Droplets className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Flood Risk Analyzer</h3>
                  <p className="text-[10px] text-muted-foreground">Flood risk assessment & simulation</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] font-normal">
                  {zones.length} zones
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={togglePanel}
                  aria-label="Close panel"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <Tabs defaultValue="zones" className="w-full flex-1 flex flex-col min-h-0">
              <div className="px-4 pt-2">
                <TabsList className="w-full h-8 text-xs">
                  <TabsTrigger value="zones" className="text-[11px] flex-1">Zones</TabsTrigger>
                  <TabsTrigger value="historical" className="text-[11px] flex-1">Historical</TabsTrigger>
                  <TabsTrigger value="simulation" className="text-[11px] flex-1">Simulation</TabsTrigger>
                  <TabsTrigger value="overlays" className="text-[11px] flex-1">Overlays</TabsTrigger>
                </TabsList>
              </div>

              {/* Zones Tab */}
              <TabsContent value="zones" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-3">
                    {/* Scenario Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Flood Scenario</Label>
                      <Select
                        value={scenarioYear.toString()}
                        onValueChange={(value) => setFloodRisk({ scenarioYear: parseInt(value) as 100 | 500 })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100" className="text-xs">
                            100-Year Flood (1% annual chance)
                          </SelectItem>
                          <SelectItem value="500" className="text-xs">
                            500-Year Flood (0.2% annual chance)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Risk Distribution */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Risk Distribution</Label>
                      <div className="h-24">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={riskDistribution}>
                            <XAxis dataKey="level" tick={{ fontSize: 8 }} />
                            <YAxis tick={{ fontSize: 8 }} allowDecimals={false} />
                            <RechartsTooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {riskDistribution.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <Separator />

                    {/* Zone List */}
                    <div className="space-y-2">
                      {zones.map((zone) => {
                        const isSelected = selectedZoneId === zone.id
                        const riskConfig = RISK_LEVEL_CONFIG[zone.riskLevel]
                        const drainageConfig = DRAINAGE_CONFIG[zone.drainageClass]
                        const floodDepth = scenarioYear === 100 ? zone.floodDepth100yr : zone.floodDepth500yr
                        const depthColor = getDepthColor(floodDepth, 6)
                        return (
                          <Card
                            key={zone.id}
                            className={cn(
                              'cursor-pointer transition-all hover:shadow-md',
                              isSelected ? 'ring-1 ring-primary' : ''
                            )}
                            onClick={() => setSelectedZoneId(isSelected ? null : zone.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <div
                                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: riskConfig.color + '20' }}
                                >
                                  <Waves className="h-4 w-4" style={{ color: riskConfig.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <span className="text-xs font-medium truncate">{zone.name}</span>
                                    <Badge className={cn('text-[9px] px-1.5 py-0 h-4', riskConfig.bgColor, riskConfig.textColor)} variant="outline">
                                      {riskConfig.label}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-0.5">
                                      <Droplets className="h-2.5 w-2.5" style={{ color: depthColor }} />
                                      {floodDepth}m depth
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      <Users className="h-2.5 w-2.5" />
                                      {zone.population.toLocaleString()}
                                    </span>
                                    <span>{zone.area} km²</span>
                                  </div>

                                  {/* Expanded Detail */}
                                  {isSelected && (
                                    <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
                                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">100yr Depth</span>
                                          <span className="font-mono">{zone.floodDepth100yr}m</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">500yr Depth</span>
                                          <span className="font-mono">{zone.floodDepth500yr}m</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">Elevation</span>
                                          <span className="font-mono">{zone.elevation}m</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">Area</span>
                                          <span className="font-mono">{zone.area} km²</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">Population</span>
                                          <span className="font-mono">{zone.population.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">Infrastructure</span>
                                          <span className="font-mono">
                                            <Building className="h-2.5 w-2.5 inline mr-0.5" />
                                            {zone.infrastructure}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-muted-foreground">Drainage:</span>
                                        <Badge className={cn('text-[9px] px-1.5 py-0 h-4', drainageConfig.bgColor, drainageConfig.textColor)} variant="outline">
                                          {drainageConfig.label}
                                        </Badge>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className={cn(
                                  'h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0',
                                  isSelected && 'rotate-90'
                                )} />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    {/* Risk Legend */}
                    <div className="pt-2">
                      <Label className="text-xs font-medium mb-2 block">Risk Level Scale</Label>
                      <div className="flex gap-1">
                        {Object.entries(RISK_LEVEL_CONFIG).map(([key, config]) => (
                          <div key={key} className="flex-1 text-center">
                            <div className="h-3 rounded-sm" style={{ backgroundColor: config.color }} />
                            <span className="text-[8px] text-muted-foreground mt-0.5 block">{config.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Depth Gradient */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Flood Depth Gradient</Label>
                      <div className="h-3 rounded-full overflow-hidden" style={{
                        background: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)'
                      }} />
                      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span>0m</span>
                        <span>3m</span>
                        <span>6m+</span>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Historical Tab */}
              <TabsContent value="historical" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-4">
                    {selectedZone ? (
                      <>
                        <div className="text-xs font-medium flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          {selectedZone.name} - Historical Floods
                        </div>

                        {selectedZone.historicalFloods.length > 0 ? (
                          <>
                            {/* Flood Timeline Chart */}
                            <div>
                              <Label className="text-xs font-medium mb-2 block">Flood Depth Over Time</Label>
                              <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={historicalChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                                    <YAxis tick={{ fontSize: 9 }} unit="m" />
                                    <RechartsTooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                                    <Area
                                      type="monotone"
                                      dataKey="depth"
                                      stroke="#f97316"
                                      fill="#f97316"
                                      fillOpacity={0.15}
                                      strokeWidth={2}
                                      name="Depth (m)"
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Duration Chart */}
                            <div>
                              <Label className="text-xs font-medium mb-2 block">Flood Duration</Label>
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={historicalChartData}>
                                    <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                                    <YAxis tick={{ fontSize: 9 }} unit="d" />
                                    <RechartsTooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                                    <Bar dataKey="duration" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Duration (days)" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Historical Events List */}
                            <div>
                              <Label className="text-xs font-medium mb-2 block">Event Details</Label>
                              <div className="space-y-1.5">
                                {selectedZone.historicalFloods.map((flood, i) => (
                                  <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-muted/30 text-[10px]">
                                    <span className="font-mono font-medium w-8">{flood.year}</span>
                                    <div className="h-1.5 rounded-full flex-1 bg-muted/50 overflow-hidden">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          backgroundColor: getDepthColor(flood.depth, 6),
                                          width: `${Math.min((flood.depth / 6) * 100, 100)}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="font-mono w-12 text-right">{flood.depth}m</span>
                                    <span className="text-muted-foreground w-12 text-right">{flood.duration}d</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Waves className="h-8 w-8 mb-2 opacity-30" />
                            <p className="text-xs">No historical flood data</p>
                            <p className="text-[10px]">This zone has minimal flood risk</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mb-2 opacity-30" />
                        <p className="text-xs">Select a flood zone to view history</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Simulation Tab */}
              <TabsContent value="simulation" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Flood Progression Simulation</Label>
                      <p className="text-[10px] text-muted-foreground mb-3">
                        Animated visualization of flood water rise and spread over time
                      </p>
                    </div>

                    {/* Animation Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={resetAnimation}
                        aria-label="Reset simulation"
                      >
                        <SkipBack className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          'h-8 w-8',
                          floodRisk.animationPlaying && 'bg-primary/10 text-primary'
                        )}
                        onClick={toggleAnimation}
                        aria-label={floodRisk.animationPlaying ? 'Pause simulation' : 'Play simulation'}
                      >
                        {floodRisk.animationPlaying ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setAnimationStep((prev) => (prev + 1) % 10)}
                        aria-label="Step forward"
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[10px] font-mono text-muted-foreground ml-2">
                        Step {animationStep + 1} / 10
                      </span>
                    </div>

                    {/* Simulation Visualization */}
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <div className="p-3">
                        {/* Water Level Indicator */}
                        <div className="space-y-3">
                          {zones.map((zone) => {
                            const maxDepth = scenarioYear === 100 ? zone.floodDepth100yr : zone.floodDepth500yr
                            const currentDepth = (maxDepth * animationStep) / 10
                            const riskConfig = RISK_LEVEL_CONFIG[zone.riskLevel]
                            return (
                              <div key={zone.id} className="space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="truncate max-w-[200px]">{zone.name}</span>
                                  <span className="font-mono" style={{ color: getDepthColor(currentDepth, 6) }}>
                                    {currentDepth.toFixed(1)}m / {maxDepth}m
                                  </span>
                                </div>
                                <div className="relative h-6 rounded-md bg-muted/30 overflow-hidden border border-border/30">
                                  {/* Water fill */}
                                  <motion.div
                                    className="absolute bottom-0 left-0 right-0 rounded-b-md"
                                    style={{
                                      backgroundColor: getDepthColor(currentDepth, 6) + '40',
                                      borderTop: `2px solid ${getDepthColor(currentDepth, 6)}`,
                                    }}
                                    animate={{ height: `${Math.min((currentDepth / 6) * 100, 100)}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                  />
                                  {/* Level markers */}
                                  <div className="absolute inset-0 flex items-end">
                                    <div className="w-full flex justify-between px-1 pb-0.5">
                                      {[1, 2, 3, 4, 5, 6].map((level) => (
                                        <div
                                          key={level}
                                          className="h-px w-2 bg-muted-foreground/20"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Simulation Time */}
                    <div className="text-center">
                      <p className="text-xs font-mono">
                        T+{animationStep * 3} hours
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {scenarioYear}-year flood scenario
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Overlays Tab */}
              <TabsContent value="overlays" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <Label className="text-xs font-medium mb-3 block">Map Overlays</Label>
                      <div className="space-y-3">
                        {[
                          { key: 'showZones' as const, label: 'Flood Zones', icon: Waves, desc: 'Flood zone boundaries' },
                          { key: 'showRiskOverlay' as const, label: 'Risk Overlay', icon: Shield, desc: 'Color-coded risk map' },
                          { key: 'showDepthOverlay' as const, label: 'Depth Overlay', icon: Droplets, desc: 'Flood depth visualization' },
                          { key: 'showDrainageMap' as const, label: 'Drainage Map', icon: BarChart3, desc: 'Drainage quality classes' },
                          { key: 'showHistoricalFloods' as const, label: 'Historical Floods', icon: Clock, desc: 'Past flood extents' },
                          { key: 'showEvacuationRoutes' as const, label: 'Evacuation Routes', icon: Route, desc: 'Emergency evacuation paths' },
                        ].map((overlay) => (
                          <div key={overlay.key} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <overlay.icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs font-medium">{overlay.label}</p>
                                <p className="text-[10px] text-muted-foreground">{overlay.desc}</p>
                              </div>
                            </div>
                            <Switch
                              checked={floodRisk[overlay.key]}
                              onCheckedChange={(checked) => setFloodRisk({ [overlay.key]: checked })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Drainage Quality Classification */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Drainage Quality</Label>
                      <div className="space-y-1.5">
                        {Object.entries(DRAINAGE_CONFIG).map(([key, config]) => {
                          const count = zones.filter((z) => z.drainageClass === key).length
                          return (
                            <div key={key} className="flex items-center gap-2 text-[10px]">
                              <Badge className={cn('text-[9px] px-1.5 py-0 h-4', config.bgColor, config.textColor)} variant="outline">
                                {config.label}
                              </Badge>
                              <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: zones.length > 0 ? `${(count / zones.length) * 100}%` : '0%',
                                    backgroundColor: key === 'excellent' ? '#22c55e' : key === 'good' ? '#14b8a6' : key === 'moderate' ? '#eab308' : key === 'poor' ? '#f97316' : '#ef4444',
                                  }}
                                />
                              </div>
                              <span className="text-muted-foreground w-6 text-right">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Summary Stats */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Summary</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Card className="bg-red-500/5 border-red-500/20">
                          <CardContent className="p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">High/Very High</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              {zones.filter((z) => z.riskLevel === 'high' || z.riskLevel === 'very_high').length}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-amber-500/5 border-amber-500/20">
                          <CardContent className="p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Total Pop. at Risk</p>
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                              {zones
                                .filter((z) => z.riskLevel !== 'minimal')
                                .reduce((sum, z) => sum + z.population, 0)
                                .toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-blue-500/5 border-blue-500/20">
                          <CardContent className="p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Total Area</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {zones.reduce((sum, z) => sum + z.area, 0).toFixed(1)}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-purple-500/5 border-purple-500/20">
                          <CardContent className="p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Critical Infra</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {zones.reduce((sum, z) => sum + z.infrastructure, 0)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
