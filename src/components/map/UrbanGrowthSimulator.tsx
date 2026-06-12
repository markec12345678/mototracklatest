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
import { useMapStore, type UrbanArea, type UrbanGrowthState } from '@/lib/map-store'
import {
  Building2,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Users,
  TrendingUp,
  MapPin,
  Timer,
  BarChart3,
  Layers,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell as RechartsCell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from 'recharts'

// Demo urban data
const DEMO_AREAS: UrbanArea[] = [
  {
    id: 'ua1',
    name: 'Metro City',
    latitude: 40.7128,
    longitude: -74.006,
    currentArea: 783,
    population: 8336817,
    density: 10640,
    growthRate: 0.24,
    yearEstablished: 1624,
    historicalBoundaries: [
      { year: 1850, area: 50, boundary: [] },
      { year: 1900, area: 200, boundary: [] },
      { year: 1950, area: 450, boundary: [] },
      { year: 2000, area: 650, boundary: [] },
      { year: 2024, area: 783, boundary: [] },
    ],
    landUseBreakdown: { residential: 42, commercial: 22, industrial: 12, green: 14, other: 10 },
    prediction2030: 820,
    prediction2050: 910,
  },
  {
    id: 'ua2',
    name: 'Tech Valley',
    latitude: 37.3861,
    longitude: -122.0839,
    currentArea: 310,
    population: 2019000,
    density: 6513,
    growthRate: 1.8,
    yearEstablished: 1777,
    historicalBoundaries: [
      { year: 1950, area: 30, boundary: [] },
      { year: 1970, area: 80, boundary: [] },
      { year: 1990, area: 150, boundary: [] },
      { year: 2000, area: 210, boundary: [] },
      { year: 2024, area: 310, boundary: [] },
    ],
    landUseBreakdown: { residential: 35, commercial: 30, industrial: 10, green: 15, other: 10 },
    prediction2030: 380,
    prediction2050: 520,
  },
  {
    id: 'ua3',
    name: 'Old Town',
    latitude: 51.5074,
    longitude: -0.1278,
    currentArea: 1572,
    population: 8982000,
    density: 5714,
    growthRate: 0.8,
    yearEstablished: 43,
    historicalBoundaries: [
      { year: 1600, area: 10, boundary: [] },
      { year: 1800, area: 100, boundary: [] },
      { year: 1900, area: 500, boundary: [] },
      { year: 1950, area: 1000, boundary: [] },
      { year: 2024, area: 1572, boundary: [] },
    ],
    landUseBreakdown: { residential: 38, commercial: 25, industrial: 8, green: 18, other: 11 },
    prediction2030: 1620,
    prediction2050: 1700,
  },
  {
    id: 'ua4',
    name: 'Sunrise City',
    latitude: 33.4484,
    longitude: -112.074,
    currentArea: 1334,
    population: 1608000,
    density: 1205,
    growthRate: 2.5,
    yearEstablished: 1868,
    historicalBoundaries: [
      { year: 1950, area: 50, boundary: [] },
      { year: 1970, area: 200, boundary: [] },
      { year: 1990, area: 500, boundary: [] },
      { year: 2000, area: 800, boundary: [] },
      { year: 2024, area: 1334, boundary: [] },
    ],
    landUseBreakdown: { residential: 50, commercial: 18, industrial: 12, green: 8, other: 12 },
    prediction2030: 1580,
    prediction2050: 2200,
  },
]

const LAND_USE_COLORS: Record<string, string> = {
  residential: '#3b82f6',
  commercial: '#f59e0b',
  industrial: '#6b7280',
  green: '#22c55e',
  other: '#a78bfa',
}

const LAND_USE_LABELS: Record<string, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
  green: 'Green Space',
  other: 'Other',
}

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export function UrbanGrowthSimulator() {
  const urbanGrowth = useMapStore((s) => s.urbanGrowth)
  const setUrbanGrowth = useMapStore((s) => s.setUrbanGrowth)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Use demo data if store is empty
  const areas = urbanGrowth.areas.length > 0 ? urbanGrowth.areas : DEMO_AREAS

  const activeArea = useMemo(() => {
    return expandedId ? areas.find(a => a.id === expandedId) : areas[0]
  }, [areas, expandedId])

  // Land use donut data
  const landUseData = useMemo(() => {
    if (!activeArea) return []
    return Object.entries(activeArea.landUseBreakdown).map(([key, value]) => ({
      name: LAND_USE_LABELS[key],
      value,
      color: LAND_USE_COLORS[key],
    }))
  }, [activeArea])

  // Growth rate line chart
  const growthChartData = useMemo(() => {
    if (!activeArea) return []
    const points = [...activeArea.historicalBoundaries]
    points.push({ year: 2030, area: activeArea.prediction2030, boundary: [] })
    points.push({ year: 2050, area: activeArea.prediction2050, boundary: [] })
    return points.map(p => ({
      year: p.year,
      area: p.area,
      isPrediction: p.year > new Date().getFullYear(),
    }))
  }, [activeArea])

  // Timeline playback
  useEffect(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = null
    }
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        const currentYear = urbanGrowth.timelineYear
        const maxYear = 2050
        const minYear = 1850
        const step = Math.max(1, Math.round(urbanGrowth.animationSpeed))
        const nextYear = currentYear + step
        if (nextYear > maxYear) {
          setUrbanGrowth({ timelineYear: minYear })
        } else {
          setUrbanGrowth({ timelineYear: nextYear })
        }
      }, 500 / urbanGrowth.animationSpeed)
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [isPlaying, urbanGrowth.animationSpeed, urbanGrowth.timelineYear, setUrbanGrowth])

  if (!urbanGrowth.open) return null

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
                <Building2 className="h-4 w-4 text-blue-500" />
                Urban Growth Simulator
                <Badge variant="outline" className="text-[10px] font-normal">
                  {areas.length} areas
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setUrbanGrowth({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Timeline Slider & Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3 w-3" /> Timeline Year
                  </Label>
                  <span className="text-sm font-bold tabular-nums text-blue-500">
                    {urbanGrowth.timelineYear}
                  </span>
                </div>
                <Slider
                  value={[urbanGrowth.timelineYear]}
                  onValueChange={([v]) => setUrbanGrowth({ timelineYear: v })}
                  min={1850}
                  max={2050}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>1850</span>
                  <span>1900</span>
                  <span>1950</span>
                  <span>2024</span>
                  <span>2050</span>
                </div>
                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setUrbanGrowth({ timelineYear: 1850 })}
                  >
                    <SkipBack className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={isPlaying ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setUrbanGrowth({ timelineYear: 2050 })}
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                  </Button>
                  <Separator orientation="vertical" className="h-5" />
                  <Label className="text-[10px] text-muted-foreground shrink-0">Speed</Label>
                  <Slider
                    value={[urbanGrowth.animationSpeed]}
                    onValueChange={([v]) => setUrbanGrowth({ animationSpeed: v })}
                    min={0.5}
                    max={5}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-medium tabular-nums w-6">{urbanGrowth.animationSpeed}x</span>
                </div>
              </div>

              <Separator />

              {/* Overlay Toggles */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Map Overlays
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={urbanGrowth.showHistoricalBoundaries}
                      onCheckedChange={(v) => setUrbanGrowth({ showHistoricalBoundaries: v })}
                    />
                    <span className="text-xs">Historical Bounds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={urbanGrowth.showPredictions}
                      onCheckedChange={(v) => setUrbanGrowth({ showPredictions: v })}
                    />
                    <span className="text-xs">Predictions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={urbanGrowth.showDensityHeatmap}
                      onCheckedChange={(v) => setUrbanGrowth({ showDensityHeatmap: v })}
                    />
                    <span className="text-xs">Density Heatmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={urbanGrowth.showLandUse}
                      onCheckedChange={(v) => setUrbanGrowth({ showLandUse: v })}
                    />
                    <span className="text-xs">Land Use</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Switch
                      checked={urbanGrowth.comparisonMode}
                      onCheckedChange={(v) => setUrbanGrowth({ comparisonMode: v })}
                    />
                    <span className="text-xs">Comparison Mode (overlay two periods)</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Land Use Donut Chart */}
              {activeArea && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" /> Land Use Breakdown — {activeArea.name}
                  </Label>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={140}>
                      <PieChart>
                        <Pie
                          data={landUseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {landUseData.map((entry, index) => (
                            <RechartsCell key={`lu-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--popover))',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '12px',
                          }}
                          formatter={(value: number) => [`${value}%`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 flex-1">
                      {landUseData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-1.5 text-[10px]">
                          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="text-muted-foreground">{entry.name}</span>
                          <span className="font-medium ml-auto">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Growth Rate Area Chart */}
              {activeArea && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Growth Over Time — {activeArea.name}
                  </Label>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={growthChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                      <XAxis dataKey="year" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--popover))',
                          color: 'hsl(var(--popover-foreground))',
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [`${value} km²`, 'Area']}
                      />
                      <Area
                        type="monotone"
                        dataKey="area"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.15}
                        strokeWidth={2}
                        strokeDasharray="0"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="w-6 h-0.5 bg-blue-500 inline-block" /> Historical
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-6 h-0.5 bg-blue-500 inline-block" style={{ borderTop: '2px dashed #3b82f6', height: 0 }} /> Predicted
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Urban Areas List */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Urban Areas</Label>
                {areas.map(area => {
                  const isExpanded = expandedId === area.id
                  const growthColor = area.growthRate > 2 ? 'text-green-600 dark:text-green-400' : area.growthRate > 1 ? 'text-teal-600 dark:text-teal-400' : area.growthRate > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                  return (
                    <div
                      key={area.id}
                      className="rounded-lg border border-border/50 p-2.5 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : area.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
                          <span className="text-xs font-medium truncate">{area.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-semibold ${growthColor}`}>
                            +{area.growthRate}%/yr
                          </span>
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
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Users className="h-2.5 w-2.5" /> Population
                            </span>
                            <span className="font-medium">{formatPopulation(area.population)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Density</span>
                            <span className="font-medium">{area.density.toLocaleString()}/km²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Area</span>
                            <span className="font-medium">{area.currentArea} km²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Growth Rate</span>
                            <span className="font-medium" style={{ color: area.growthRate > 2 ? '#22c55e' : '#eab308' }}>
                              +{area.growthRate}%/yr
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. 2030</span>
                            <span className="font-medium text-blue-500">{area.prediction2030} km²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. 2050</span>
                            <span className="font-medium text-blue-500">{area.prediction2050} km²</span>
                          </div>
                          <div className="col-span-2 flex justify-between">
                            <span className="text-muted-foreground">Established</span>
                            <span className="font-medium">{area.yearEstablished}</span>
                          </div>
                          <div className="col-span-2 mt-1">
                            <Label className="text-[9px] text-muted-foreground">Historical Boundaries</Label>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {area.historicalBoundaries.map((hb, i) => (
                                <Badge key={i} variant="outline" className="text-[8px] px-1.5 py-0">
                                  {hb.year}: {hb.area} km²
                                </Badge>
                              ))}
                            </div>
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
export function UrbanGrowthToggle() {
  const urbanGrowth = useMapStore((s) => s.urbanGrowth)
  const setUrbanGrowth = useMapStore((s) => s.setUrbanGrowth)

  return (
    <Button
      variant={urbanGrowth.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setUrbanGrowth({ open: !urbanGrowth.open })}
      title="Urban Growth Simulator"
    >
      <Building2 className="h-4 w-4" />
    </Button>
  )
}
