'use client'

import { useMemo } from 'react'
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
import { useMapStore, type OceanHeatContentState, type OceanHeatContentData } from '@/lib/map-store'
import { Thermometer as ThermometerIcon6, X, Flame, Droplets, TrendingUp, MapPin, Filter } from 'lucide-react'

const DEMO_BASINS: OceanHeatContentData[] = [
  {
    id: 'ohc-northatlantic',
    name: 'North Atlantic',
    lat: 45,
    lng: -30,
    heatContent: 850,
    temperature: 18,
    salinity: 35.5,
    trend: 3.2,
    stratification: 65,
    status: 'rapid_warming',
    description: 'Rapidly warming basin with significant heat accumulation',
  },
  {
    id: 'ohc-tropicalpacific',
    name: 'Tropical Pacific',
    lat: 0,
    lng: -160,
    heatContent: 1200,
    temperature: 28,
    salinity: 35.0,
    trend: 2.5,
    stratification: 80,
    status: 'warming',
    description: 'Major heat reservoir influenced by ENSO cycles',
  },
  {
    id: 'ohc-indian',
    name: 'Indian Ocean',
    lat: -10,
    lng: 75,
    heatContent: 950,
    temperature: 22,
    salinity: 35.2,
    trend: 4.0,
    stratification: 70,
    status: 'rapid_warming',
    description: 'Fastest warming ocean basin with increasing stratification',
  },
  {
    id: 'ohc-southern',
    name: 'Southern Ocean',
    lat: -55,
    lng: 0,
    heatContent: 500,
    temperature: 5,
    salinity: 34.5,
    trend: 1.5,
    stratification: 45,
    status: 'warming',
    description: 'Key heat sink absorbing significant global warming heat',
  },
  {
    id: 'ohc-arctic',
    name: 'Arctic Ocean',
    lat: 80,
    lng: 0,
    heatContent: 200,
    temperature: 2,
    salinity: 34.0,
    trend: 5.0,
    stratification: 35,
    status: 'extreme_warming',
    description: 'Extreme warming with accelerating ice loss and heat gain',
  },
  {
    id: 'ohc-mediterranean',
    name: 'Mediterranean',
    lat: 36,
    lng: 18,
    heatContent: 600,
    temperature: 20,
    salinity: 38.5,
    trend: 2.0,
    stratification: 75,
    status: 'warming',
    description: 'Semi-enclosed basin experiencing steady temperature rise',
  },
]

const STATUS_CONFIG: Record<
  OceanHeatContentData['status'],
  { label: string; color: string; bgClass: string }
> = {
  cooling: { label: 'Cooling', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  warming: { label: 'Warming', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rapid_warming: { label: 'Rapid Warming', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme_warming: { label: 'Extreme Warming', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function OceanHeatContentMonitor() {
  const state = useMapStore((s) => s.oceanHeatContent)
  const setState = useMapStore((s) => s.setOceanHeatContent)

  const basins = useMemo(
    () => (state.basins.length > 0 ? state.basins : DEMO_BASINS),
    [state.basins]
  )

  const filteredBasins = useMemo(() => {
    return basins.filter((b) => {
      if (state.depthFilter !== 'all') {
        const depthMap: Record<string, string[]> = {
          surface: ['ohc-tropicalpacific', 'ohc-mediterranean'],
          thermocline: ['ohc-northatlantic', 'ohc-indian'],
          intermediate: ['ohc-southern', 'ohc-northatlantic'],
          deep: ['ohc-arctic', 'ohc-southern'],
        }
        if (!depthMap[state.depthFilter]?.includes(b.id)) return false
      }
      return true
    })
  }, [basins, state.depthFilter])

  const summary = useMemo(() => {
    if (filteredBasins.length === 0) {
      return { avgHeatContent: 0, avgTrend: 0, warmingCount: 0 }
    }
    const avgHeatContent =
      filteredBasins.reduce((sum, b) => sum + b.heatContent, 0) / filteredBasins.length
    const avgTrend =
      filteredBasins.reduce((sum, b) => sum + b.trend, 0) / filteredBasins.length
    const warmingCount = filteredBasins.filter(
      (b) => b.status === 'warming' || b.status === 'rapid_warming' || b.status === 'extreme_warming'
    ).length
    return {
      avgHeatContent: Math.round(avgHeatContent),
      avgTrend: Math.round(avgTrend * 10) / 10,
      warmingCount,
    }
  }, [filteredBasins])

  const activeBasin = useMemo(
    () => basins.find((b) => b.id === state.activeBasinId) ?? null,
    [basins, state.activeBasinId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OceanHeatContentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showHeatContent', label: 'Heat Content', icon: Flame },
    { key: 'showTemperature', label: 'Temperature', icon: ThermometerIcon6 },
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
    { key: 'showTrend', label: 'Trend', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-orange-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg shadow-red-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <ThermometerIcon6 className="h-4 w-4 text-red-400" />
              Ocean Heat Content Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Depth Filter */}
          <div>
            <Label className="text-xs text-red-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Depth Layer
            </Label>
            <Select
              value={state.depthFilter}
              onValueChange={(v) =>
                setState({
                  depthFilter: v as OceanHeatContentState['depthFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depths</SelectItem>
                <SelectItem value="surface">Surface</SelectItem>
                <SelectItem value="thermocline">Thermocline</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="deep">Deep</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Avg Heat</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgHeatContent}</div>
              <div className="text-[9px] text-red-400">MJ/m²</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Avg Trend</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgTrend}</div>
              <div className="text-[9px] text-red-400">W/m²</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Warming</div>
              <div className="text-sm font-semibold text-red-200">{summary.warmingCount}</div>
              <div className="text-[9px] text-red-400">basins</div>
            </div>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Basin List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300">
              Ocean Basins ({filteredBasins.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredBasins.map((basin) => {
                  const isActive = state.activeBasinId === basin.id
                  const statusCfg = STATUS_CONFIG[basin.status]
                  return (
                    <div
                      key={basin.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/60 bg-red-800/30'
                          : 'border-red-800/30 hover:border-red-600/40 hover:bg-red-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeBasinId: isActive ? null : basin.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-red-100">{basin.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300">
                        {state.showHeatContent && (
                          <div>
                            Heat:{' '}
                            <span className="text-orange-400 font-medium">
                              {basin.heatContent} MJ/m²
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-red-100 font-medium">
                              {basin.temperature}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-red-100 font-medium">
                              {basin.salinity} PSU
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Trend:{' '}
                            <span className="text-amber-400 font-medium">
                              +{basin.trend} W/m²
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredBasins.length === 0 && (
                  <div className="text-center text-xs text-red-400 py-4">
                    No basins match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Basin Details */}
          {activeBasin && (
            <>
              <Separator className="bg-red-800/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeBasin.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeBasin.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeBasin.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeBasin.lat.toFixed(1)}, {activeBasin.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400">Heat Content: </span>
                    <span className="font-medium text-orange-400">{activeBasin.heatContent} MJ/m²</span>
                  </div>
                  <div>
                    <span className="text-red-400">Temperature: </span>
                    <span className="font-medium text-red-200">{activeBasin.temperature}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-red-400">Salinity: </span>
                    <span className="font-medium text-red-200">{activeBasin.salinity} PSU</span>
                  </div>
                  <div>
                    <span className="text-red-400">Trend: </span>
                    <span className="font-medium text-amber-400">+{activeBasin.trend} W/m²</span>
                  </div>
                  <div>
                    <span className="text-red-400">Stratification: </span>
                    <span className="font-medium text-red-200">{activeBasin.stratification}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-red-400">Description: </span>
                    <span className="font-medium text-red-200">{activeBasin.description}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
