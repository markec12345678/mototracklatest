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
import { useMapStore, type IceCoreSample, type IceCoreDataState } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon6, Thermometer, Wind, Mountain, X, Filter } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const DEMO_SAMPLES: IceCoreSample[] = [
  {
    id: 'ic-vostok',
    name: 'Vostok Antarctica',
    depth: 3623,
    age: 420,
    co2Level: 284,
    temperature: -0.5,
    dustConcentration: 45,
    latitude: -78.47,
    longitude: 106.83,
  },
  {
    id: 'ic-epica',
    name: 'EPICA Dome C',
    depth: 3270,
    age: 800,
    co2Level: 278,
    temperature: -1.2,
    dustConcentration: 62,
    latitude: -75.10,
    longitude: 123.35,
  },
  {
    id: 'ic-gisp2',
    name: 'GISP2 Greenland',
    depth: 3053,
    age: 110,
    co2Level: 290,
    temperature: 0.8,
    dustConcentration: 18,
    latitude: 72.58,
    longitude: -38.45,
  },
  {
    id: 'ic-wais',
    name: 'WAIS Divide',
    depth: 3405,
    age: 68,
    co2Level: 312,
    temperature: 1.1,
    dustConcentration: 12,
    latitude: -79.47,
    longitude: -112.09,
  },
  {
    id: 'ic-lawdome',
    name: 'Law Dome Antarctica',
    depth: 1202,
    age: 90,
    co2Level: 281,
    temperature: -0.3,
    dustConcentration: 8,
    latitude: -66.77,
    longitude: 112.85,
  },
]

const AGE_CONFIG: Record<string, { label: string; bgClass: string }> = {
  holocene: { label: 'Holocene', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  pleistocene: { label: 'Pleistocene', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  pliocene: { label: 'Pliocene', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  miocene: { label: 'Miocene', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const CO2_VS_AGE_DATA = [
  { age: 0, co2: 280 },
  { age: 10, co2: 265 },
  { age: 20, co2: 235 },
  { age: 50, co2: 210 },
  { age: 100, co2: 260 },
  { age: 150, co2: 220 },
  { age: 200, co2: 195 },
  { age: 300, co2: 240 },
  { age: 400, co2: 205 },
  { age: 500, co2: 255 },
  { age: 600, co2: 215 },
  { age: 700, co2: 275 },
  { age: 800, co2: 230 },
]

const DEPTH_COMPARISON_DATA = DEMO_SAMPLES.map((s) => ({
  name: s.name.split(' ')[0],
  depth: s.depth,
}))

function getAgePeriod(age: number): string {
  if (age <= 11.7) return 'holocene'
  if (age <= 2588) return 'pleistocene'
  if (age <= 5333) return 'pliocene'
  return 'miocene'
}

export function IceCoreDataExplorer() {
  const iceCoreData = useMapStore((s) => s.iceCoreData)
  const setIceCoreData = useMapStore((s) => s.setIceCoreData)

  const [chartMode, setChartMode] = useState<'co2' | 'depth'>('co2')

  const samples = useMemo(
    () => (iceCoreData.samples && iceCoreData.samples.length > 0 ? iceCoreData.samples : DEMO_SAMPLES),
    [iceCoreData.samples]
  )

  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      if (iceCoreData.ageFilter !== 'all') {
        const period = getAgePeriod(s.age)
        if (period !== iceCoreData.ageFilter) return false
      }
      return true
    })
  }, [samples, iceCoreData.ageFilter])

  const summary = useMemo(() => {
    if (!filteredSamples || filteredSamples.length === 0) {
      return { deepestCore: 0, oldestSample: 0, maxCO2: 0 }
    }
    const deepestCore = Math.max(...filteredSamples.map((s) => s.depth))
    const oldestSample = Math.max(...filteredSamples.map((s) => s.age))
    const maxCO2 = Math.max(...filteredSamples.map((s) => s.co2Level))
    return { deepestCore, oldestSample, maxCO2 }
  }, [filteredSamples])

  const activeSample = useMemo(
    () => (samples && samples.length > 0 ? samples.find((s) => s.id === iceCoreData.activeSampleId) ?? null : null),
    [samples, iceCoreData.activeSampleId]
  )

  if (typeof window === 'undefined') return null
  if (!iceCoreData.open) return null

  const overlayToggles: { key: keyof IceCoreDataState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCO2', label: 'CO₂', icon: Thermometer },
    { key: 'showTemperature', label: 'Temp', icon: Thermometer },
    { key: 'showDust', label: 'Dust', icon: Wind },
    { key: 'showDepth', label: 'Depth', icon: Mountain },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SnowflakeIcon6 className="h-4 w-4 text-cyan-500" />
              Ice Core Data Explorer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIceCoreData({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Age Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Age Period
            </Label>
            <Select
              value={iceCoreData.ageFilter}
              onValueChange={(v) =>
                setIceCoreData({
                  ageFilter: v as IceCoreDataState['ageFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="holocene">Holocene (0–11.7 kyr)</SelectItem>
                <SelectItem value="pleistocene">Pleistocene (11.7–2588 kyr)</SelectItem>
                <SelectItem value="pliocene">Pliocene (2588–5333 kyr)</SelectItem>
                <SelectItem value="miocene">Miocene (5333–23003 kyr)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Deepest Core</div>
              <div className="text-sm font-semibold">{summary.deepestCore} m</div>
            </div>
            <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Oldest Sample</div>
              <div className="text-sm font-semibold">{summary.oldestSample} kyr</div>
            </div>
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Max CO₂</div>
              <div className="text-sm font-semibold">{summary.maxCO2} ppm</div>
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
                    checked={iceCoreData[t.key] as boolean}
                    onCheckedChange={(checked) => setIceCoreData({ [t.key]: checked })}
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
              variant={chartMode === 'co2' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('co2')}
            >
              CO₂ vs Age
            </Button>
            <Button
              variant={chartMode === 'depth' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('depth')}
            >
              Depth Comparison
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'co2' ? (
                <LineChart data={CO2_VS_AGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="age" tick={{ fontSize: 10 }} label={{ value: 'Age (kyr BP)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'CO₂ (ppm)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="co2" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} name="CO₂ (ppm)" />
                </LineChart>
              ) : (
                <BarChart data={DEPTH_COMPARISON_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'm', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="depth" fill="#8b5cf6" name="Depth (m)" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Sample List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Ice Core Sites ({filteredSamples.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredSamples && filteredSamples.length > 0) ? filteredSamples.map((sample) => {
                  const period = getAgePeriod(sample.age)
                  const ageCfg = AGE_CONFIG[period] || { label: period, bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' }
                  const isActive = activeSample?.id === sample.id
                  return (
                    <div
                      key={sample.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-border/50 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                      }`}
                      onClick={() => setIceCoreData({ activeSampleId: isActive ? null : sample.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{sample.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${ageCfg.bgClass}`}>
                          {ageCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {iceCoreData.showDepth && <span>{sample.depth} m</span>}
                        {iceCoreData.showCO2 && <span>{sample.co2Level} ppm</span>}
                        {iceCoreData.showTemperature && <span>{sample.temperature > 0 ? '+' : ''}{sample.temperature}°C</span>}
                        {iceCoreData.showDust && <span>Dust: {sample.dustConcentration} μg/L</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No samples match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Sample Detail */}
          {activeSample && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <SnowflakeIcon6 className="h-3.5 w-3.5 text-cyan-500" />
                  {activeSample.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Mountain className="h-3 w-3 text-purple-500" />
                    <span className="text-muted-foreground">Depth:</span>
                    <span className="font-medium">{activeSample.depth} m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-orange-500" />
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{activeSample.age} kyr BP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">CO₂:</span>
                    <span className="font-medium">{activeSample.co2Level} ppm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">Temp:</span>
                    <span className="font-medium">{activeSample.temperature > 0 ? '+' : ''}{activeSample.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3 text-stone-500" />
                    <span className="text-muted-foreground">Dust:</span>
                    <span className="font-medium">{activeSample.dustConcentration} μg/L</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">CO₂ Level</span>
                    <span className="text-[10px] font-medium">{activeSample.co2Level > 300 ? 'High' : activeSample.co2Level > 280 ? 'Moderate' : 'Low'}</span>
                  </div>
                  <Progress value={Math.min(100, (activeSample.co2Level / 420) * 100)} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeSample.latitude.toFixed(2)}°, {activeSample.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
