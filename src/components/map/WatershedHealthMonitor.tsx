'use client'

import { useMemo } from 'react'
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
import { useMapStore, type WatershedHealthState, type WatershedHealthData } from '@/lib/map-store'
import { Droplets as DropletsIcon4, X, Activity, Waves, Filter, Mountain, TreePine, Ship, Building2, AlertTriangle } from 'lucide-react'

interface WatershedBasin extends WatershedHealthData {
  basinType: 'mountain' | 'plain' | 'coastal' | 'urban'
}

const DEMO_BASINS: WatershedBasin[] = [
  {
    id: 'wh-amazon',
    name: 'Amazon Basin',
    lat: -3.0,
    lng: -60.0,
    waterQuality: 92,
    flowRate: 209000,
    sedimentLoad: 12,
    ecologicalHealth: 88,
    drainageArea: 6900000,
    status: 'pristine',
    description: 'The largest river basin in the world, spanning across South America with unparalleled biodiversity and pristine water systems.',
    basinType: 'plain',
  },
  {
    id: 'wh-mississippi',
    name: 'Mississippi Basin',
    lat: 38.0,
    lng: -90.0,
    waterQuality: 62,
    flowRate: 16700,
    sedimentLoad: 210,
    ecologicalHealth: 55,
    drainageArea: 3220000,
    status: 'moderate',
    description: 'Major North American drainage basin facing agricultural runoff challenges and ecosystem pressure from extensive farming.',
    basinType: 'plain',
  },
  {
    id: 'wh-ganges',
    name: 'Ganges Basin',
    lat: 25.0,
    lng: 85.0,
    waterQuality: 35,
    flowRate: 12000,
    sedimentLoad: 520,
    ecologicalHealth: 28,
    drainageArea: 1080000,
    status: 'critical',
    description: 'One of the most populated river basins, severely impacted by industrial discharge and untreated sewage.',
    basinType: 'mountain',
  },
  {
    id: 'wh-rhine',
    name: 'Rhine Basin',
    lat: 50.0,
    lng: 8.0,
    waterQuality: 78,
    flowRate: 2300,
    sedimentLoad: 45,
    ecologicalHealth: 72,
    drainageArea: 185000,
    status: 'good',
    description: 'European river basin that has seen significant ecological recovery after decades of restoration efforts.',
    basinType: 'mountain',
  },
  {
    id: 'wh-murray',
    name: 'Murray-Darling',
    lat: -34.0,
    lng: 144.0,
    waterQuality: 45,
    flowRate: 770,
    sedimentLoad: 180,
    ecologicalHealth: 38,
    drainageArea: 1060000,
    status: 'degraded',
    description: 'Australia\'s largest river system suffering from drought, over-extraction, and salinity issues.',
    basinType: 'plain',
  },
  {
    id: 'wh-danube',
    name: 'Danube Basin',
    lat: 48.0,
    lng: 18.0,
    waterQuality: 72,
    flowRate: 6500,
    sedimentLoad: 85,
    ecologicalHealth: 68,
    drainageArea: 817000,
    status: 'good',
    description: 'Europe\'s second-longest river, connecting 10 countries with ongoing international conservation coordination.',
    basinType: 'mountain',
  },
]

const STATUS_CONFIG: Record<
  WatershedHealthData['status'],
  { label: string; color: string; bgClass: string; dotClass: string }
> = {
  pristine: { label: 'Pristine', color: '#059669', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', dotClass: 'bg-emerald-500' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30', dotClass: 'bg-green-500' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', dotClass: 'bg-yellow-500' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30', dotClass: 'bg-orange-500' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30', dotClass: 'bg-red-500' },
}

const TYPE_CONFIG: Record<
  WatershedBasin['basinType'],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  mountain: { label: 'Mountain', icon: Mountain },
  plain: { label: 'Plain', icon: TreePine },
  coastal: { label: 'Coastal', icon: Ship },
  urban: { label: 'Urban', icon: Building2 },
}

function formatArea(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

function formatFlowRate(n: number): string {
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function getQualityColor(value: number): string {
  if (value >= 80) return 'text-emerald-500'
  if (value >= 60) return 'text-green-500'
  if (value >= 40) return 'text-yellow-500'
  if (value >= 25) return 'text-orange-500'
  return 'text-red-500'
}

function getProgressColor(value: number): string {
  if (value >= 80) return '[&>div]:bg-emerald-500'
  if (value >= 60) return '[&>div]:bg-green-500'
  if (value >= 40) return '[&>div]:bg-yellow-500'
  if (value >= 25) return '[&>div]:bg-orange-500'
  return '[&>div]:bg-red-500'
}

export function WatershedHealthMonitor() {
  const state = useMapStore((s) => s.watershedHealth)
  const setState = useMapStore((s) => s.setWatershedHealth)

  const basins = useMemo(
    () => (state.basins.length > 0 ? (state.basins as WatershedBasin[]) : DEMO_BASINS),
    [state.basins]
  )

  const filteredBasins = useMemo(() => {
    return basins.filter((b) => {
      if (state.typeFilter !== 'all') {
        const basin = DEMO_BASINS.find((d) => d.id === b.id)
        if (basin && basin.basinType !== state.typeFilter) return false
        if (!basin && (b as WatershedBasin).basinType !== state.typeFilter) return false
      }
      return true
    })
  }, [basins, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredBasins.length === 0) {
      return { avgWaterQuality: 0, avgEcologicalHealth: 0, criticalCount: 0 }
    }
    const avgWaterQuality = filteredBasins.reduce((sum, b) => sum + b.waterQuality, 0) / filteredBasins.length
    const avgEcologicalHealth = filteredBasins.reduce((sum, b) => sum + b.ecologicalHealth, 0) / filteredBasins.length
    const criticalCount = filteredBasins.filter(
      (b) => b.status === 'degraded' || b.status === 'critical'
    ).length
    return {
      avgWaterQuality: Math.round(avgWaterQuality * 10) / 10,
      avgEcologicalHealth: Math.round(avgEcologicalHealth * 10) / 10,
      criticalCount,
    }
  }, [filteredBasins])

  const activeBasin = useMemo(
    () => basins.find((b) => b.id === state.activeBasinId) ?? null,
    [basins, state.activeBasinId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WatershedHealthState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterQuality', label: 'Water Quality', icon: DropletsIcon4 },
    { key: 'showFlowRate', label: 'Flow Rate', icon: Waves },
    { key: 'showSedimentLoad', label: 'Sediment Load', icon: Activity },
    { key: 'showEcologicalHealth', label: 'Ecological Health', icon: TreePine },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[440px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-teal-950/95 to-blue-950/95 backdrop-blur-xl border border-teal-800/30 rounded-xl shadow-lg shadow-teal-900/20 overflow-hidden text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <DropletsIcon4 className="h-4 w-4 text-teal-400" />
              Watershed Health Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-white hover:bg-teal-800/50"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-teal-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Basin Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as WatershedHealthState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mountain">Mountain</SelectItem>
                <SelectItem value="plain">Plain</SelectItem>
                <SelectItem value="coastal">Coastal</SelectItem>
                <SelectItem value="urban">Urban</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-teal-900/40 border border-teal-700/30 p-2 text-center">
              <div className="text-xs text-teal-300/70 mb-1">Avg Quality</div>
              <div className={`text-lg font-bold ${getQualityColor(summary.avgWaterQuality)}`}>
                {summary.avgWaterQuality}
              </div>
              <Progress value={summary.avgWaterQuality} className={`h-1 mt-1 bg-teal-800/50 ${getProgressColor(summary.avgWaterQuality)}`} />
            </div>
            <div className="rounded-lg bg-teal-900/40 border border-teal-700/30 p-2 text-center">
              <div className="text-xs text-teal-300/70 mb-1">Avg Eco Health</div>
              <div className={`text-lg font-bold ${getQualityColor(summary.avgEcologicalHealth)}`}>
                {summary.avgEcologicalHealth}
              </div>
              <Progress value={summary.avgEcologicalHealth} className={`h-1 mt-1 bg-teal-800/50 ${getProgressColor(summary.avgEcologicalHealth)}`} />
            </div>
            <div className="rounded-lg bg-teal-900/40 border border-teal-700/30 p-2 text-center">
              <div className="text-xs text-teal-300/70 mb-1">At Risk</div>
              <div className={`text-lg font-bold ${summary.criticalCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {summary.criticalCount}
              </div>
              <div className="text-[10px] text-teal-300/50 mt-1">degraded+critical</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Basin List */}
          <ScrollArea className="max-h-96">
            <div className="space-y-2 pr-1">
              {filteredBasins.map((basin) => {
                const demoBasin = DEMO_BASINS.find((d) => d.id === basin.id)
                const basinType = demoBasin?.basinType ?? (basin as WatershedBasin).basinType
                const statusCfg = STATUS_CONFIG[basin.status]
                const typeCfg = basinType ? TYPE_CONFIG[basinType] : null
                const TypeIcon = typeCfg?.icon ?? DropletsIcon4
                const isActive = state.activeBasinId === basin.id

                return (
                  <div
                    key={basin.id}
                    className={`rounded-lg border p-3 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-800/50 border-teal-500/60 ring-1 ring-teal-500/30'
                        : 'bg-teal-900/30 border-teal-700/30 hover:bg-teal-800/40 hover:border-teal-600/40'
                    }`}
                    onClick={() => setState({ activeBasinId: isActive ? null : basin.id })}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-800/60 flex items-center justify-center">
                          <TypeIcon className="h-4 w-4 text-teal-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-teal-100 truncate">{basin.name}</div>
                          <div className="text-[10px] text-teal-400/60">
                            {basin.lat.toFixed(1)}, {basin.lng.toFixed(1)}
                            {typeCfg && ` \u00B7 ${typeCfg.label}`}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`flex-shrink-0 text-[10px] px-1.5 py-0 ${statusCfg.bgClass}`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusCfg.dotClass} mr-1`} />
                        {statusCfg.label}
                      </Badge>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2.5">
                      {state.showWaterQuality && (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-teal-400/70 flex items-center gap-1">
                              <DropletsIcon4 className="h-2.5 w-2.5" />
                              Water Quality
                            </span>
                            <span className={`text-xs font-medium ${getQualityColor(basin.waterQuality)}`}>
                              {basin.waterQuality}
                            </span>
                          </div>
                          <Progress value={basin.waterQuality} className={`h-1 bg-teal-800/40 ${getProgressColor(basin.waterQuality)}`} />
                        </div>
                      )}

                      {state.showFlowRate && (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-teal-400/70 flex items-center gap-1">
                              <Waves className="h-2.5 w-2.5" />
                              Flow Rate
                            </span>
                            <span className="text-xs font-medium text-teal-200">
                              {formatFlowRate(basin.flowRate)} m³/s
                            </span>
                          </div>
                          <Progress
                            value={Math.min(100, (basin.flowRate / 209000) * 100)}
                            className="h-1 bg-teal-800/40 [&>div]:bg-cyan-500"
                          />
                        </div>
                      )}

                      {state.showSedimentLoad && (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-teal-400/70 flex items-center gap-1">
                              <Activity className="h-2.5 w-2.5" />
                              Sediment Load
                            </span>
                            <span className={`text-xs font-medium ${basin.sedimentLoad > 200 ? 'text-orange-400' : basin.sedimentLoad > 100 ? 'text-yellow-400' : 'text-teal-300'}`}>
                              {basin.sedimentLoad}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(100, (basin.sedimentLoad / 520) * 100)}
                            className={`h-1 bg-teal-800/40 ${basin.sedimentLoad > 200 ? '[&>div]:bg-orange-500' : basin.sedimentLoad > 100 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-teal-500'}`}
                          />
                        </div>
                      )}

                      {state.showEcologicalHealth && (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-teal-400/70 flex items-center gap-1">
                              <TreePine className="h-2.5 w-2.5" />
                              Eco Health
                            </span>
                            <span className={`text-xs font-medium ${getQualityColor(basin.ecologicalHealth)}`}>
                              {basin.ecologicalHealth}
                            </span>
                          </div>
                          <Progress value={basin.ecologicalHealth} className={`h-1 bg-teal-800/40 ${getProgressColor(basin.ecologicalHealth)}`} />
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isActive && (
                      <div className="mt-3 pt-2.5 border-t border-teal-700/30 space-y-2">
                        <p className="text-xs text-teal-300/70 leading-relaxed">
                          {basin.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md bg-teal-900/50 border border-teal-700/20 px-2 py-1.5">
                            <div className="text-[10px] text-teal-400/60">Drainage Area</div>
                            <div className="text-xs font-medium text-teal-200">
                              {formatArea(basin.drainageArea)} km²
                            </div>
                          </div>
                          <div className="rounded-md bg-teal-900/50 border border-teal-700/20 px-2 py-1.5">
                            <div className="text-[10px] text-teal-400/60">Flow Rate</div>
                            <div className="text-xs font-medium text-teal-200">
                              {basin.flowRate.toLocaleString()} m³/s
                            </div>
                          </div>
                          <div className="rounded-md bg-teal-900/50 border border-teal-700/20 px-2 py-1.5">
                            <div className="text-[10px] text-teal-400/60">Sediment Load</div>
                            <div className="text-xs font-medium text-teal-200">
                              {basin.sedimentLoad} mg/L
                            </div>
                          </div>
                          <div className="rounded-md bg-teal-900/50 border border-teal-700/20 px-2 py-1.5">
                            <div className="text-[10px] text-teal-400/60">Health Index</div>
                            <div className={`text-xs font-medium ${getQualityColor(basin.ecologicalHealth)}`}>
                              {basin.ecologicalHealth}/100
                            </div>
                          </div>
                        </div>
                        {(basin.status === 'critical' || basin.status === 'degraded') && (
                          <div className="flex items-center gap-1.5 rounded-md bg-red-900/20 border border-red-500/20 px-2 py-1.5">
                            <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0" />
                            <span className="text-[10px] text-red-300/80">
                              {basin.status === 'critical'
                                ? 'Critical condition — Immediate intervention required'
                                : 'Degraded ecosystem — Restoration measures recommended'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredBasins.length === 0 && (
                <div className="text-center py-6 text-teal-400/50 text-xs">
                  No basins match the selected filter.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
