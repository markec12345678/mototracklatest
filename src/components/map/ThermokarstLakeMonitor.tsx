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
import { useMapStore, type ThermokarstLakeState, type ThermokarstLake } from '@/lib/map-store'
import { Droplets, Flame, TrendingUp, ShieldAlert, X, Filter } from 'lucide-react'
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

const DEMO_LAKES: ThermokarstLake[] = [
  {
    id: 'tk-pechora',
    name: 'Pechora Thermokarst Lake',
    expansionRate: 2.8,
    methaneEmission: 45.2,
    shorelineErosion: 1.5,
    area: 12.4,
    riskLevel: 'high',
    latitude: 67.5,
    longitude: 55.2,
  },
  {
    id: 'tk-yakutia',
    name: 'Yakutia Thaw Lake',
    expansionRate: 4.1,
    methaneEmission: 82.7,
    shorelineErosion: 3.2,
    area: 8.6,
    riskLevel: 'critical',
    latitude: 62.0,
    longitude: 129.7,
  },
  {
    id: 'tk-tuktoyaktuk',
    name: 'Tuktoyaktuk Coast Lake',
    expansionRate: 1.2,
    methaneEmission: 18.3,
    shorelineErosion: 0.8,
    area: 25.1,
    riskLevel: 'medium',
    latitude: 69.4,
    longitude: -133.0,
  },
  {
    id: 'tk-batagay',
    name: 'Batagay Thaw Lake',
    expansionRate: 3.5,
    methaneEmission: 56.8,
    shorelineErosion: 2.1,
    area: 5.3,
    riskLevel: 'high',
    latitude: 67.5,
    longitude: 134.4,
  },
  {
    id: 'tk-nunavik',
    name: 'Nunavik Permafrost Lake',
    expansionRate: 0.6,
    methaneEmission: 9.4,
    shorelineErosion: 0.3,
    area: 31.2,
    riskLevel: 'low',
    latitude: 58.5,
    longitude: -72.0,
  },
]

const RISK_CONFIG: Record<
  ThermokarstLake['riskLevel'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  medium: { label: 'Medium', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const AREA_CHANGE_DATA = [
  { year: '2018', pechora: 10.2, yakutia: 6.1, tuktoyaktuk: 24.5 },
  { year: '2019', pechora: 10.8, yakutia: 6.7, tuktoyaktuk: 24.8 },
  { year: '2020', pechora: 11.1, yakutia: 7.2, tuktoyaktuk: 25.0 },
  { year: '2021', pechora: 11.6, yakutia: 7.8, tuktoyaktuk: 25.1 },
  { year: '2022', pechora: 12.0, yakutia: 8.3, tuktoyaktuk: 25.1 },
  { year: '2023', pechora: 12.4, yakutia: 8.6, tuktoyaktuk: 25.1 },
]

const METHANE_EMISSION_DATA = [
  { month: 'Jan', emission: 12 },
  { month: 'Feb', emission: 14 },
  { month: 'Mar', emission: 18 },
  { month: 'Apr', emission: 28 },
  { month: 'May', emission: 52 },
  { month: 'Jun', emission: 78 },
  { month: 'Jul', emission: 92 },
  { month: 'Aug', emission: 85 },
  { month: 'Sep', emission: 58 },
  { month: 'Oct', emission: 32 },
  { month: 'Nov', emission: 18 },
  { month: 'Dec', emission: 13 },
]

export function ThermokarstLakeMonitor() {
  const thermokarstLake = useMapStore((s) => s.thermokarstLake)
  const setThermokarstLake = useMapStore((s) => s.setThermokarstLake)

  const [chartMode, setChartMode] = useState<'area' | 'methane'>('area')

  const lakes = useMemo(
    () => (thermokarstLake.lakes && thermokarstLake.lakes.length > 0 ? thermokarstLake.lakes : DEMO_LAKES),
    [thermokarstLake.lakes]
  )

  const filteredLakes = useMemo(() => {
    return lakes.filter((l) => {
      if (thermokarstLake.riskFilter !== 'all' && l.riskLevel !== thermokarstLake.riskFilter) return false
      return true
    })
  }, [lakes, thermokarstLake.riskFilter])

  const summary = useMemo(() => {
    if (!filteredLakes || filteredLakes.length === 0) {
      return { avgExpansion: 0, totalMethane: 0, criticalCount: 0, totalArea: 0 }
    }
    const avgExpansion = Math.round((filteredLakes.reduce((s, l) => s + l.expansionRate, 0) / filteredLakes.length) * 10) / 10
    const totalMethane = Math.round(filteredLakes.reduce((s, l) => s + l.methaneEmission, 0) * 10) / 10
    const criticalCount = filteredLakes.filter((l) => l.riskLevel === 'critical' || l.riskLevel === 'high').length
    const totalArea = Math.round(filteredLakes.reduce((s, l) => s + l.area, 0) * 10) / 10
    return { avgExpansion, totalMethane, criticalCount, totalArea }
  }, [filteredLakes])

  const activeLake = useMemo(
    () => (lakes && lakes.length > 0 ? lakes.find((l) => l.id === thermokarstLake.activeLakeId) ?? null : null),
    [lakes, thermokarstLake.activeLakeId]
  )

  if (typeof window === 'undefined') return null
  if (!thermokarstLake.open) return null

  const overlayToggles: { key: keyof ThermokarstLakeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showExpansionRate', label: 'Expansion', icon: TrendingUp },
    { key: 'showMethaneEmission', label: 'Methane', icon: Flame },
    { key: 'showShorelineErosion', label: 'Erosion', icon: ShieldAlert },
    { key: 'showArea', label: 'Area', icon: Droplets },
  ]

  const riskProgressValue = activeLake
    ? activeLake.riskLevel === 'low' ? 25 : activeLake.riskLevel === 'medium' ? 50 : activeLake.riskLevel === 'high' ? 75 : 100
    : 0

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-amber-500" />
              Thermokarst Lake Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setThermokarstLake({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={thermokarstLake.riskFilter}
              onValueChange={(v) =>
                setThermokarstLake({
                  riskFilter: v as ThermokarstLakeState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Expansion</div>
              <div className="text-sm font-semibold">{summary.avgExpansion} m/yr</div>
            </div>
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Total CH₄</div>
              <div className="text-sm font-semibold">{summary.totalMethane} t/yr</div>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">High/Critical</div>
              <div className="text-sm font-semibold">{summary.criticalCount}</div>
            </div>
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Total Area</div>
              <div className="text-sm font-semibold">{summary.totalArea} km²</div>
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
                    checked={thermokarstLake[t.key] as boolean}
                    onCheckedChange={(checked) => setThermokarstLake({ [t.key]: checked })}
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
              variant={chartMode === 'area' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('area')}
            >
              Area Change
            </Button>
            <Button
              variant={chartMode === 'methane' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('methane')}
            >
              CH₄ Emissions
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={AREA_CHANGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'km²', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="pechora" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Pechora" />
                  <Area type="monotone" dataKey="yakutia" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Yakutia" />
                  <Area type="monotone" dataKey="tuktoyaktuk" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} name="Tuktoyaktuk" />
                </AreaChart>
              ) : (
                <BarChart data={METHANE_EMISSION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 't CH₄', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="emission" fill="#f97316" radius={[4, 4, 0, 0]} name="CH₄ Emission" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Lake List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Thermokarst Lakes ({filteredLakes.length})
            </Label>
            <ScrollArea className="max-h-44">
              <div className="space-y-1.5">
                {(filteredLakes && filteredLakes.length > 0) ? filteredLakes.map((lake) => {
                  const riskCfg = RISK_CONFIG[lake.riskLevel]
                  const isActive = activeLake?.id === lake.id
                  return (
                    <div
                      key={lake.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5'
                      }`}
                      onClick={() => setThermokarstLake({ activeLakeId: isActive ? null : lake.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{lake.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${riskCfg.bgClass}`}>
                          {riskCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {thermokarstLake.showExpansionRate && <span>+{lake.expansionRate} m/yr</span>}
                        {thermokarstLake.showMethaneEmission && <span>CH₄: {lake.methaneEmission} t/yr</span>}
                        {thermokarstLake.showShorelineErosion && <span>Erosion: {lake.shorelineErosion} m/yr</span>}
                        {thermokarstLake.showArea && <span>Area: {lake.area} km²</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No lakes match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Lake Detail + Risk Assessment */}
          {activeLake && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-amber-500" />
                  {activeLake.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-600" />
                    <span className="text-muted-foreground">Expansion:</span>
                    <span className="font-medium">{activeLake.expansionRate} m/yr</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-muted-foreground">CH₄:</span>
                    <span className="font-medium">{activeLake.methaneEmission} t/yr</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">Erosion:</span>
                    <span className="font-medium">{activeLake.shorelineErosion} m/yr</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-cyan-500" />
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-medium">{activeLake.area} km²</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Infrastructure Risk</span>
                    <span className="text-[10px] font-medium">{RISK_CONFIG[activeLake.riskLevel].label}</span>
                  </div>
                  <Progress value={riskProgressValue} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeLake.latitude.toFixed(2)}°, {activeLake.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
