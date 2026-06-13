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
import { useMapStore, type FjordEcosystemState, type FjordSystem } from '@/lib/map-store'
import { Mountain, Fish, Droplets, Leaf, X, Filter } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

const DEMO_FJORDS: FjordSystem[] = [
  {
    id: 'fj-sognefjord',
    name: 'Sognefjord',
    stratification: 0.72,
    oxygenLevel: 6.8,
    biodiversity: 0.85,
    glacialInput: 45.2,
    healthScore: 78,
    latitude: 61.2,
    longitude: 6.8,
  },
  {
    id: 'fj-milford',
    name: 'Milford Sound',
    stratification: 0.58,
    oxygenLevel: 7.2,
    biodiversity: 0.91,
    glacialInput: 62.5,
    healthScore: 85,
    latitude: -44.67,
    longitude: 167.93,
  },
  {
    id: 'fj-illaussaq',
    name: 'Illorsuit Fjord',
    stratification: 0.45,
    oxygenLevel: 8.1,
    biodiversity: 0.62,
    glacialInput: 120.8,
    healthScore: 68,
    latitude: 71.2,
    longitude: -53.5,
  },
  {
    id: 'fj-queen',
    name: 'Queen Charlotte Sound',
    stratification: 0.65,
    oxygenLevel: 5.4,
    biodiversity: 0.78,
    glacialInput: 18.3,
    healthScore: 62,
    latitude: -41.1,
    longitude: 174.3,
  },
  {
    id: 'fj-hardanger',
    name: 'Hardangerfjord',
    stratification: 0.68,
    oxygenLevel: 4.8,
    biodiversity: 0.72,
    glacialInput: 35.8,
    healthScore: 55,
    latitude: 60.3,
    longitude: 6.7,
  },
  {
    id: 'fj-kangerluarsunngorliq',
    name: 'Kangerdlugssuaq Fjord',
    stratification: 0.38,
    oxygenLevel: 8.5,
    biodiversity: 0.48,
    glacialInput: 210.5,
    healthScore: 72,
    latitude: 68.5,
    longitude: -32.0,
  },
]

const HEALTH_CONFIG: Record<string, { label: string; color: string; bgClass: string }> = {
  excellent: { label: 'Excellent', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  good: { label: 'Good', color: '#84cc16', bgClass: 'bg-lime-500/10 text-lime-600 border-lime-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  poor: { label: 'Poor', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function getHealthCategory(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 65) return 'good'
  if (score >= 45) return 'moderate'
  return 'poor'
}

const STRATIFICATION_DATA = [
  { month: 'Jan', surface: 3, mid: 5, deep: 7 },
  { month: 'Feb', surface: 2.5, mid: 4.5, deep: 7 },
  { month: 'Mar', surface: 2, mid: 4, deep: 7 },
  { month: 'Apr', surface: 4, mid: 5, deep: 7 },
  { month: 'May', surface: 8, mid: 6, deep: 7 },
  { month: 'Jun', surface: 12, mid: 8, deep: 7 },
  { month: 'Jul', surface: 15, mid: 10, deep: 7 },
  { month: 'Aug', surface: 14, mid: 10, deep: 7 },
  { month: 'Sep', surface: 11, mid: 9, deep: 7 },
  { month: 'Oct', surface: 8, mid: 7, deep: 7 },
  { month: 'Nov', surface: 5, mid: 6, deep: 7 },
  { month: 'Dec', surface: 3.5, mid: 5.5, deep: 7 },
]

export function FjordEcosystemMonitor() {
  const fjordEcosystem = useMapStore((s) => s.fjordEcosystem)
  const setFjordEcosystem = useMapStore((s) => s.setFjordEcosystem)

  const [chartMode, setChartMode] = useState<'stratification' | 'radar'>('stratification')

  const fjords = useMemo(
    () => (fjordEcosystem.fjords && fjordEcosystem.fjords.length > 0 ? fjordEcosystem.fjords : DEMO_FJORDS),
    [fjordEcosystem.fjords]
  )

  const filteredFjords = useMemo(() => {
    return fjords.filter((f) => {
      if (fjordEcosystem.healthFilter !== 'all') {
        const category = getHealthCategory(f.healthScore)
        if (category !== fjordEcosystem.healthFilter) return false
      }
      return true
    })
  }, [fjords, fjordEcosystem.healthFilter])

  const summary = useMemo(() => {
    if (!filteredFjords || filteredFjords.length === 0) {
      return { avgHealth: 0, avgOxygen: 0, avgBio: 0, excellentCount: 0 }
    }
    const avgHealth = Math.round(filteredFjords.reduce((s, f) => s + f.healthScore, 0) / filteredFjords.length)
    const avgOxygen = Math.round((filteredFjords.reduce((s, f) => s + f.oxygenLevel, 0) / filteredFjords.length) * 10) / 10
    const avgBio = Math.round((filteredFjords.reduce((s, f) => s + f.biodiversity, 0) / filteredFjords.length) * 100) / 100
    const excellentCount = filteredFjords.filter((f) => f.healthScore >= 80).length
    return { avgHealth, avgOxygen, avgBio, excellentCount }
  }, [filteredFjords])

  const activeFjord = useMemo(
    () => (fjords && fjords.length > 0 ? fjords.find((f) => f.id === fjordEcosystem.activeFjordId) ?? null : null),
    [fjords, fjordEcosystem.activeFjordId]
  )

  const radarData = useMemo(() => {
    if (!activeFjord) return []
    return [
      { metric: 'Stratification', value: activeFjord.stratification * 100, fullMark: 100 },
      { metric: 'Oxygen', value: (activeFjord.oxygenLevel / 10) * 100, fullMark: 100 },
      { metric: 'Biodiversity', value: activeFjord.biodiversity * 100, fullMark: 100 },
      { metric: 'Glacial Input', value: Math.min(100, (activeFjord.glacialInput / 250) * 100), fullMark: 100 },
      { metric: 'Health', value: activeFjord.healthScore, fullMark: 100 },
    ]
  }, [activeFjord])

  if (typeof window === 'undefined') return null
  if (!fjordEcosystem.open) return null

  const overlayToggles: { key: keyof FjordEcosystemState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showStratification', label: 'Stratification', icon: Mountain },
    { key: 'showOxygenLevel', label: 'Oxygen', icon: Droplets },
    { key: 'showBiodiversity', label: 'Biodiversity', icon: Fish },
    { key: 'showGlacialInput', label: 'Glacial Input', icon: Mountain },
    { key: 'showHealthScore', label: 'Health', icon: Leaf },
  ]

  const healthProgressColor = activeFjord
    ? activeFjord.healthScore >= 80 ? 'bg-green-500' : activeFjord.healthScore >= 65 ? 'bg-lime-500' : activeFjord.healthScore >= 45 ? 'bg-yellow-500' : 'bg-red-500'
    : ''

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mountain className="h-4 w-4 text-emerald-500" />
              Fjord Ecosystem Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setFjordEcosystem({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Health Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Health Status
            </Label>
            <Select
              value={fjordEcosystem.healthFilter}
              onValueChange={(v) =>
                setFjordEcosystem({
                  healthFilter: v as FjordEcosystemState['healthFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health Levels</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Health</div>
              <div className="text-sm font-semibold">{summary.avgHealth}/100</div>
            </div>
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg O₂</div>
              <div className="text-sm font-semibold">{summary.avgOxygen} mg/L</div>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Biodiversity</div>
              <div className="text-sm font-semibold">{summary.avgBio}</div>
            </div>
            <div className="rounded-lg bg-lime-500/5 border border-lime-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Excellent</div>
              <div className="text-sm font-semibold">{summary.excellentCount}</div>
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
                    checked={fjordEcosystem[t.key] as boolean}
                    onCheckedChange={(checked) => setFjordEcosystem({ [t.key]: checked })}
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
              variant={chartMode === 'stratification' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('stratification')}
            >
              Stratification
            </Button>
            <Button
              variant={chartMode === 'radar' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('radar')}
            >
              Health Radar
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'stratification' ? (
                <AreaChart data={STRATIFICATION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="surface" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Surface" />
                  <Area type="monotone" dataKey="mid" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.2} name="Mid-depth" />
                  <Area type="monotone" dataKey="deep" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} name="Deep" />
                </AreaChart>
              ) : (
                radarData.length > 0 ? (
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                    <Radar name="Health Indicators" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                  </RadarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    Select a fjord to view health radar
                  </div>
                )
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Fjord List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Fjord Systems ({filteredFjords.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredFjords && filteredFjords.length > 0) ? filteredFjords.map((fjord) => {
                  const healthCat = getHealthCategory(fjord.healthScore)
                  const healthCfg = HEALTH_CONFIG[healthCat]
                  const isActive = activeFjord?.id === fjord.id
                  return (
                    <div
                      key={fjord.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                      }`}
                      onClick={() => setFjordEcosystem({ activeFjordId: isActive ? null : fjord.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{fjord.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${healthCfg.bgClass}`}>
                          {healthCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {fjordEcosystem.showHealthScore && <span>Health: {fjord.healthScore}</span>}
                        {fjordEcosystem.showOxygenLevel && <span>O₂: {fjord.oxygenLevel}</span>}
                        {fjordEcosystem.showBiodiversity && <span>Bio: {fjord.biodiversity}</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No fjords match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Fjord Detail + Ecosystem Health Score */}
          {activeFjord && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Mountain className="h-3.5 w-3.5 text-emerald-500" />
                  {activeFjord.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Mountain className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Stratification:</span>
                    <span className="font-medium">{(activeFjord.stratification * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-cyan-500" />
                    <span className="text-muted-foreground">O₂ Level:</span>
                    <span className="font-medium">{activeFjord.oxygenLevel} mg/L</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fish className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Biodiversity:</span>
                    <span className="font-medium">{activeFjord.biodiversity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Leaf className="h-3 w-3 text-emerald-500" />
                    <span className="text-muted-foreground">Glacial Input:</span>
                    <span className="font-medium">{activeFjord.glacialInput} m³/s</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      Ecosystem Health Score
                    </span>
                    <span className="text-[10px] font-semibold">{activeFjord.healthScore}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${healthProgressColor}`}
                      style={{ width: `${activeFjord.healthScore}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeFjord.latitude.toFixed(2)}°, {activeFjord.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
