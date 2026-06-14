'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type GeothermalSpringState, type GeothermalSpring } from '@/lib/map-store'
import { Flame, Droplets, Thermometer, Activity, X, Filter } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const DEMO_SPRINGS: GeothermalSpring[] = [
  {
    id: 'gs-yellowstone',
    name: 'Yellowstone Grand Prismatic',
    temperature: 93,
    ph: 7.2,
    flowRate: 45,
    mineralContent: 3.8,
    seismicActivity: 2.4,
    latitude: 44.525,
    longitude: -110.838,
  },
  {
    id: 'gs-bluelagoon',
    name: 'Iceland Blue Lagoon',
    temperature: 38,
    ph: 7.5,
    flowRate: 60,
    mineralContent: 12.5,
    seismicActivity: 1.1,
    latitude: 63.88,
    longitude: -22.45,
  },
  {
    id: 'gs-rotorua',
    name: 'Rotorua Geothermal Field',
    temperature: 72,
    ph: 6.8,
    flowRate: 32,
    mineralContent: 8.2,
    seismicActivity: 3.5,
    latitude: -38.14,
    longitude: 176.25,
  },
  {
    id: 'gs-pamukkale',
    name: 'Pamukkale Travertine Springs',
    temperature: 56,
    ph: 6.2,
    flowRate: 25,
    mineralContent: 15.4,
    seismicActivity: 0.8,
    latitude: 37.92,
    longitude: 29.12,
  },
  {
    id: 'gs-beppu',
    name: 'Beppu Hells Springs',
    temperature: 98,
    ph: 5.8,
    flowRate: 55,
    mineralContent: 6.7,
    seismicActivity: 4.2,
    latitude: 33.28,
    longitude: 131.5,
  },
]

const TEMP_FILTER_LABELS: Record<GeothermalSpringState['tempFilter'], string> = {
  all: 'All Temps',
  low: 'Low (0-50°C)',
  medium: 'Medium (50-80°C)',
  high: 'High (80-100°C)',
  extreme: 'Extreme (100+°C)',
}

const TEMP_MINERAL_DATA = [
  { temp: 20, mineral: 2.1 },
  { temp: 30, mineral: 4.5 },
  { temp: 40, mineral: 6.8 },
  { temp: 50, mineral: 8.2 },
  { temp: 60, mineral: 10.1 },
  { temp: 70, mineral: 9.3 },
  { temp: 80, mineral: 7.6 },
  { temp: 90, mineral: 5.4 },
  { temp: 100, mineral: 4.2 },
]

const FLOW_DATA = [
  { spring: 'Yellowstone', flow: 45 },
  { spring: 'Blue Lagoon', flow: 60 },
  { spring: 'Rotorua', flow: 32 },
  { spring: 'Pamukkale', flow: 25 },
  { spring: 'Beppu', flow: 55 },
]

function getTempCategory(temp: number): GeothermalSpringState['tempFilter'] {
  if (temp >= 100) return 'extreme'
  if (temp >= 80) return 'high'
  if (temp >= 50) return 'medium'
  return 'low'
}

export function GeothermalSpringMonitor() {
  const geothermalSpring = useMapStore((s) => s.geothermalSpring)
  const setGeothermalSpring = useMapStore((s) => s.setGeothermalSpring)

  const [chartMode, setChartMode] = useState<'tempMineral' | 'flow'>('tempMineral')

  const springs = useMemo(
    () => (geothermalSpring.springs && geothermalSpring.springs.length > 0 ? geothermalSpring.springs : DEMO_SPRINGS),
    [geothermalSpring.springs]
  )

  const filteredSprings = useMemo(() => {
    return springs.filter((s) => {
      if (geothermalSpring.tempFilter !== 'all' && getTempCategory(s.temperature) !== geothermalSpring.tempFilter) return false
      return true
    })
  }, [springs, geothermalSpring.tempFilter])

  const summary = useMemo(() => {
    if (!filteredSprings || filteredSprings.length === 0) {
      return { avgTemp: 0, avgFlow: 0, avgSeismic: 0 }
    }
    const avgTemp = Math.round(filteredSprings.reduce((s, f) => s + f.temperature, 0) / filteredSprings.length)
    const avgFlow = Math.round((filteredSprings.reduce((s, f) => s + f.flowRate, 0) / filteredSprings.length) * 10) / 10
    const avgSeismic = Math.round((filteredSprings.reduce((s, f) => s + f.seismicActivity, 0) / filteredSprings.length) * 10) / 10
    return { avgTemp, avgFlow, avgSeismic }
  }, [filteredSprings])

  const activeSpring = useMemo(
    () => (springs && springs.length > 0 ? springs.find((s) => s.id === geothermalSpring.activeSpringId) ?? null : null),
    [springs, geothermalSpring.activeSpringId]
  )

  if (typeof window === 'undefined') return null
  if (!geothermalSpring.open) return null

  const overlayToggles: { key: keyof GeothermalSpringState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showFlowRate', label: 'Flow Rate', icon: Droplets },
    { key: 'showMineralContent', label: 'Minerals', icon: Activity },
    { key: 'showSeismicActivity', label: 'Seismic', icon: Flame },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Geothermal Spring Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGeothermalSpring({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Temp Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Temperature Range
            </Label>
            <Select
              value={geothermalSpring.tempFilter}
              onValueChange={(v) =>
                setGeothermalSpring({
                  tempFilter: v as GeothermalSpringState['tempFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Temps</SelectItem>
                <SelectItem value="low">Low (0-50°C)</SelectItem>
                <SelectItem value="medium">Medium (50-80°C)</SelectItem>
                <SelectItem value="high">High (80-100°C)</SelectItem>
                <SelectItem value="extreme">Extreme (100+°C)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Temp</div>
              <div className="text-sm font-semibold">{summary.avgTemp}°C</div>
            </div>
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Flow</div>
              <div className="text-sm font-semibold">{summary.avgFlow} L/s</div>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Seismic</div>
              <div className="text-sm font-semibold">{summary.avgSeismic}</div>
            </div>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Display Options</Label>
            <div className="flex flex-wrap gap-2">
              {overlayToggles.map((t) => (
                <div key={t.key} className="flex items-center gap-1.5">
                  <Switch
                    checked={geothermalSpring[t.key] as boolean}
                    onCheckedChange={(checked) => setGeothermalSpring({ [t.key]: checked })}
                    className="scale-75"
                  />
                  <Label className="text-[10px] flex items-center gap-0.5">
                    <t.icon className="h-3 w-3" />
                    {t.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Chart Mode Toggle */}
          <div className="flex gap-1">
            <Button
              variant={chartMode === 'tempMineral' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('tempMineral')}
            >
              Temp vs Minerals
            </Button>
            <Button
              variant={chartMode === 'flow' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('flow')}
            >
              Flow Rates
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'tempMineral' ? (
                <AreaChart data={TEMP_MINERAL_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="temp" tick={{ fontSize: 10 }} label={{ value: 'Temp (°C)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="mineral" stroke="#f97316" fill="#f97316" fillOpacity={0.15} name="Mineral Content (g/L)" />
                </AreaChart>
              ) : (
                <BarChart data={FLOW_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="spring" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'L/s', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="flow" fill="#3b82f6" name="Flow Rate" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Spring List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Geothermal Springs ({filteredSprings.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredSprings && filteredSprings.length > 0) ? filteredSprings.map((spring) => {
                  const tempCat = getTempCategory(spring.temperature)
                  const tempBgClass =
                    tempCat === 'extreme' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                    tempCat === 'high' ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' :
                    tempCat === 'medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                    'bg-green-500/10 text-green-600 border-green-500/30'
                  const isActive = activeSpring?.id === spring.id
                  return (
                    <div
                      key={spring.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-orange-500/50 bg-orange-500/5' : 'border-border/50 hover:border-orange-500/30 hover:bg-orange-500/5'
                      }`}
                      onClick={() => setGeothermalSpring({ activeSpringId: isActive ? null : spring.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{spring.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${tempBgClass}`}>
                          {spring.temperature}°C
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {geothermalSpring.showTemperature && <span>{spring.temperature}°C</span>}
                        {geothermalSpring.showFlowRate && <span>{spring.flowRate} L/s</span>}
                        {geothermalSpring.showMineralContent && <span>{spring.mineralContent} g/L</span>}
                        {geothermalSpring.showSeismicActivity && <span>Seismic: {spring.seismicActivity}</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No springs match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Spring Detail */}
          {activeSpring && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {activeSpring.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-orange-600" />
                    <span className="text-muted-foreground">Temp:</span>
                    <span className="font-medium">{activeSpring.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Flow:</span>
                    <span className="font-medium">{activeSpring.flowRate} L/s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Mineral:</span>
                    <span className="font-medium">{activeSpring.mineralContent} g/L</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">Seismic:</span>
                    <span className="font-medium">{activeSpring.seismicActivity} Richter</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Thermal Output</span>
                    <span className="text-[10px] font-medium">{activeSpring.temperature > 80 ? 'High' : activeSpring.temperature > 50 ? 'Medium' : 'Low'}</span>
                  </div>
                  <Progress value={Math.min(100, (activeSpring.temperature / 100) * 100)} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  pH: {activeSpring.ph} | Location: {activeSpring.latitude.toFixed(2)}°, {activeSpring.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
