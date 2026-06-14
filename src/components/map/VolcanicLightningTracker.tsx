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
import { useMapStore, type VolcanicLightningState, type VolcanicLightning } from '@/lib/map-store'
import { Zap, Cloud, Mountain, Activity, X, Filter, Clock } from 'lucide-react'
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

const DEMO_STRIKES: VolcanicLightning[] = [
  {
    id: 'vl-eyja',
    volcanoName: 'Eyjafjallajökull',
    strikeCount: 1280,
    frequency: 42,
    ashCloudHeight: 9.1,
    eruptionIntensity: 4,
    lastStrike: '2010-04-15T14:32:00Z',
    latitude: 63.63,
    longitude: -19.62,
  },
  {
    id: 'vl-sakurajima',
    volcanoName: 'Sakurajima',
    strikeCount: 845,
    frequency: 28,
    ashCloudHeight: 5.2,
    eruptionIntensity: 3,
    lastStrike: '2024-06-10T08:15:00Z',
    latitude: 31.59,
    longitude: 130.66,
  },
  {
    id: 'vl-taal',
    volcanoName: 'Taal',
    strikeCount: 2150,
    frequency: 65,
    ashCloudHeight: 14.5,
    eruptionIntensity: 4,
    lastStrike: '2020-01-12T21:45:00Z',
    latitude: 14.01,
    longitude: 120.99,
  },
  {
    id: 'vl-hungatonga',
    volcanoName: 'Hunga Tonga',
    strikeCount: 4200,
    frequency: 120,
    ashCloudHeight: 39.0,
    eruptionIntensity: 5,
    lastStrike: '2022-01-15T04:28:00Z',
    latitude: -20.54,
    longitude: -175.38,
  },
  {
    id: 'vl-calbuco',
    volcanoName: 'Calbuco',
    strikeCount: 620,
    frequency: 18,
    ashCloudHeight: 7.8,
    eruptionIntensity: 3,
    lastStrike: '2015-04-22T18:05:00Z',
    latitude: -41.33,
    longitude: -72.62,
  },
]

const STRIKE_COUNT_DATA = [
  { volcano: 'Eyjafjall.', strikes: 1280 },
  { volcano: 'Sakurajima', strikes: 845 },
  { volcano: 'Taal', strikes: 2150 },
  { volcano: 'Hunga Tonga', strikes: 4200 },
  { volcano: 'Calbuco', strikes: 620 },
]

const FREQUENCY_TIME_DATA = [
  { hour: '0h', eyja: 15, sakura: 8, taal: 25 },
  { hour: '2h', eyja: 22, sakura: 12, taal: 35 },
  { hour: '4h', eyja: 35, sakura: 18, taal: 48 },
  { hour: '6h', eyja: 42, sakura: 28, taal: 65 },
  { hour: '8h', eyja: 38, sakura: 22, taal: 55 },
  { hour: '10h', eyja: 28, sakura: 15, taal: 40 },
  { hour: '12h', eyja: 20, sakura: 10, taal: 30 },
]

function getIntensityCategory(strike: VolcanicLightning): VolcanicLightningState['intensityFilter'] {
  if (strike.eruptionIntensity >= 5 || strike.frequency >= 100) return 'extreme'
  if (strike.eruptionIntensity >= 4 || strike.frequency >= 40) return 'high'
  if (strike.eruptionIntensity >= 3 || strike.frequency >= 20) return 'moderate'
  return 'low'
}

export function VolcanicLightningTracker() {
  const volcanicLightning = useMapStore((s) => s.volcanicLightning)
  const setVolcanicLightning = useMapStore((s) => s.setVolcanicLightning)

  const [chartMode, setChartMode] = useState<'strikeCount' | 'frequency'>('strikeCount')

  const strikes = useMemo(
    () => (volcanicLightning.strikes && volcanicLightning.strikes.length > 0 ? volcanicLightning.strikes : DEMO_STRIKES),
    [volcanicLightning.strikes]
  )

  const filteredStrikes = useMemo(() => {
    return strikes.filter((s) => {
      if (volcanicLightning.intensityFilter !== 'all' && getIntensityCategory(s) !== volcanicLightning.intensityFilter) return false
      return true
    })
  }, [strikes, volcanicLightning.intensityFilter])

  const summary = useMemo(() => {
    if (!filteredStrikes || filteredStrikes.length === 0) {
      return { totalStrikes: 0, avgFrequency: 0, maxAshHeight: 0 }
    }
    const totalStrikes = filteredStrikes.reduce((s, f) => s + f.strikeCount, 0)
    const avgFrequency = Math.round((filteredStrikes.reduce((s, f) => s + f.frequency, 0) / filteredStrikes.length) * 10) / 10
    const maxAshHeight = Math.round(filteredStrikes.reduce((max, f) => Math.max(max, f.ashCloudHeight), 0) * 10) / 10
    return { totalStrikes, avgFrequency, maxAshHeight }
  }, [filteredStrikes])

  const activeStrike = useMemo(
    () => (strikes && strikes.length > 0 ? strikes.find((s) => s.id === volcanicLightning.activeStrikeId) ?? null : null),
    [strikes, volcanicLightning.activeStrikeId]
  )

  if (typeof window === 'undefined') return null
  if (!volcanicLightning.open) return null

  const overlayToggles: { key: keyof VolcanicLightningState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFrequency', label: 'Frequency', icon: Activity },
    { key: 'showAshHeight', label: 'Ash Height', icon: Cloud },
    { key: 'showEruptionIntensity', label: 'VEI', icon: Mountain },
    { key: 'showStrikeCount', label: 'Strikes', icon: Zap },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-500" />
              Volcanic Lightning Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setVolcanicLightning({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Intensity Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Eruption Intensity
            </Label>
            <Select
              value={volcanicLightning.intensityFilter}
              onValueChange={(v) =>
                setVolcanicLightning({
                  intensityFilter: v as VolcanicLightningState['intensityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intensities</SelectItem>
                <SelectItem value="low">Low (VEI 1-2)</SelectItem>
                <SelectItem value="moderate">Moderate (VEI 3)</SelectItem>
                <SelectItem value="high">High (VEI 4)</SelectItem>
                <SelectItem value="extreme">Extreme (VEI 5+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Total Strikes</div>
              <div className="text-sm font-semibold">{summary.totalStrikes.toLocaleString()}</div>
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Freq</div>
              <div className="text-sm font-semibold">{summary.avgFrequency}/min</div>
            </div>
            <div className="rounded-lg bg-stone-500/5 border border-stone-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Max Ash</div>
              <div className="text-sm font-semibold">{summary.maxAshHeight} km</div>
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
                    checked={volcanicLightning[t.key] as boolean}
                    onCheckedChange={(checked) => setVolcanicLightning({ [t.key]: checked })}
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
              variant={chartMode === 'strikeCount' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('strikeCount')}
            >
              Strike Counts
            </Button>
            <Button
              variant={chartMode === 'frequency' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('frequency')}
            >
              Frequency Over Time
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'strikeCount' ? (
                <BarChart data={STRIKE_COUNT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="volcano" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="strikes" fill="#8b5cf6" name="Strike Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={FREQUENCY_TIME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="eyja" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} name="Eyjafjallajökull" />
                  <Area type="monotone" dataKey="sakura" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} name="Sakurajima" />
                  <Area type="monotone" dataKey="taal" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} name="Taal" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Strike List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Volcanic Lightning Events ({filteredStrikes.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredStrikes && filteredStrikes.length > 0) ? filteredStrikes.map((strike) => {
                  const intCat = getIntensityCategory(strike)
                  const intBgClass =
                    intCat === 'extreme' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                    intCat === 'high' ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' :
                    intCat === 'moderate' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                    'bg-green-500/10 text-green-600 border-green-500/30'
                  const isActive = activeStrike?.id === strike.id
                  return (
                    <div
                      key={strike.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-violet-500/50 bg-violet-500/5' : 'border-border/50 hover:border-violet-500/30 hover:bg-violet-500/5'
                      }`}
                      onClick={() => setVolcanicLightning({ activeStrikeId: isActive ? null : strike.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{strike.volcanoName}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${intBgClass}`}>
                          VEI {strike.eruptionIntensity}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {volcanicLightning.showStrikeCount && <span>{strike.strikeCount.toLocaleString()} strikes</span>}
                        {volcanicLightning.showFrequency && <span>{strike.frequency}/min</span>}
                        {volcanicLightning.showAshHeight && <span>Ash: {strike.ashCloudHeight} km</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No events match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Strike Detail */}
          {activeStrike && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-violet-500" />
                  {activeStrike.volcanoName}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-violet-600" />
                    <span className="text-muted-foreground">Strikes:</span>
                    <span className="font-medium">{activeStrike.strikeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{activeStrike.frequency}/min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Cloud className="h-3 w-3 text-stone-500" />
                    <span className="text-muted-foreground">Ash Height:</span>
                    <span className="font-medium">{activeStrike.ashCloudHeight} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mountain className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">VEI:</span>
                    <span className="font-medium">{activeStrike.eruptionIntensity}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Eruption Intensity</span>
                    <span className="text-[10px] font-medium">{activeStrike.eruptionIntensity >= 5 ? 'Extreme' : activeStrike.eruptionIntensity >= 4 ? 'High' : activeStrike.eruptionIntensity >= 3 ? 'Moderate' : 'Low'}</span>
                  </div>
                  <Progress value={Math.min(100, (activeStrike.eruptionIntensity / 8) * 100)} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Last: {new Date(activeStrike.lastStrike).toLocaleString()} | Location: {activeStrike.latitude.toFixed(2)}°, {activeStrike.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
