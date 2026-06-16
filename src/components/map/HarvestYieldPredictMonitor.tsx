'use client'

import { useEffect, useMemo } from 'react'
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
import { useMapStore, type HarvestYieldPredictState, type HarvestYieldPredictData } from '@/lib/map-store'
import { Wheat as WheatIcon, X, Activity, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: HarvestYieldPredictData[] = [
  {
    id: 'hyp-usmidwest',
    name: 'US Midwest',
    lat: 41.500,
    lng: -88.500,
    yieldForecast: 11.2,
    areaHarvested: 35.8,
    productionEst: 400.5,
    yieldGap: 12,
    status: 'record',
    description: 'Exceptional corn and soybean yields expected across Corn Belt',
  },
  {
    id: 'hyp-ukraine',
    name: 'Ukraine Breadbasket',
    lat: 49.000,
    lng: 32.000,
    yieldForecast: 6.8,
    areaHarvested: 22.4,
    productionEst: 152.3,
    yieldGap: 28,
    status: 'average',
    description: 'Wheat harvest near historical average despite conflict disruptions',
  },
  {
    id: 'hyp-argentina',
    name: 'Argentina Pampas',
    lat: -34.000,
    lng: -62.000,
    yieldForecast: 4.5,
    areaHarvested: 18.2,
    productionEst: 81.9,
    yieldGap: 35,
    status: 'below',
    description: 'Drought-reduced soybean and corn yields in Pampas region',
  },
  {
    id: 'hyp-thailand',
    name: 'Thailand Rice',
    lat: 15.000,
    lng: 100.500,
    yieldForecast: 2.1,
    areaHarvested: 10.5,
    productionEst: 22.1,
    yieldGap: 48,
    status: 'failed',
    description: 'Severe flooding devastated main rice crop in Chao Phraya basin',
  },
]

const STATUS_COLORS: Record<HarvestYieldPredictData['status'], { label: string; color: string; bgClass: string }> = {
  failed: { label: 'Failed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  below: { label: 'Below', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  average: { label: 'Average', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  record: { label: 'Record', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: HarvestYieldPredictData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HarvestYieldPredictMonitor() {
  const state = useMapStore((s) => s.harvestYieldPredict)
  const setState = useMapStore((s) => s.setHarvestYieldPredict)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalZones: 0, avgYield: 0, totalArea: 0, avgGap: 0 }
    }
    const avgYield = filteredItems.reduce((sum, e) => sum + e.yieldForecast, 0) / filteredItems.length
    const totalArea = filteredItems.reduce((sum, e) => sum + e.areaHarvested, 0)
    const avgGap = filteredItems.reduce((sum, e) => sum + e.yieldGap, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgYield: avgYield.toFixed(1),
      totalArea: totalArea.toFixed(1),
      avgGap: Math.round(avgGap),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, yieldForecast: e.yieldForecast },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setHarvestYieldPredict({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HarvestYieldPredictState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showYieldForecast', label: 'Yield Forecast', icon: Activity },
    { key: 'showAreaHarvested', label: 'Area Harvested', icon: TrendingUp },
    { key: 'showProductionEst', label: 'Production Est', icon: WheatIcon },
    { key: 'showYieldGap', label: 'Yield Gap', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-yellow-950/95 to-amber-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <WheatIcon className="h-4 w-4 text-yellow-400" />
              Harvest Yield Predict Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as HarvestYieldPredictState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="below">Below</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="record">Record</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-yellow-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">forecast</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Yield</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgYield}</div>
              <div className="text-[9px] text-slate-400/60">t/ha</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Area</div>
              <div className="text-sm font-semibold text-amber-400">{summary.totalArea}M ha</div>
              <div className="text-[9px] text-slate-400/60">harvested</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Yield Gap</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgGap}%</div>
              <div className="text-[9px] text-slate-400/60">avg</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Harvest Zones ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-slate-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showYieldForecast && (
                          <div>
                            Yield: <span className="text-slate-100 font-medium">{e.yieldForecast} t/ha</span>
                          </div>
                        )}
                        {state.showAreaHarvested && (
                          <div>
                            Area: <span className="text-slate-100 font-medium">{e.areaHarvested}M ha</span>
                          </div>
                        )}
                        {state.showProductionEst && (
                          <div>
                            Production: <span className="text-slate-100 font-medium">{e.productionEst}M t</span>
                          </div>
                        )}
                        {state.showYieldGap && (
                          <div>
                            Gap: <span className="text-slate-100 font-medium">{e.yieldGap}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Yield: </span>
                    <span className="font-medium text-yellow-400">{activeItem.yieldForecast} t/ha</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Area: </span>
                    <span className="font-medium text-amber-400">{activeItem.areaHarvested}M ha</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Gap: </span>
                    <span className="font-medium text-slate-200">{activeItem.yieldGap}%</span>
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
