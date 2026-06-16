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
import { useMapStore, type BaseflowIndexState, type BaseflowIndexData } from '@/lib/map-store'
import { Droplets as DropletsIcon18, X, Gauge, Waves, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: BaseflowIndexData[] = [
  {
    id: 'bfi-chalk',
    name: 'Chalk Stream Baseflow',
    lat: 51.3000,
    lng: -1.5000,
    baseflowRatio: 0.92,
    totalFlow: 3.5,
    groundwaterContribution: 92,
    status: 'groundwater_dominated',
    description: 'Classic groundwater-fed chalk stream',
  },
  {
    id: 'bfi-temperate',
    name: 'Temperate Mixed Flow',
    lat: 48.0000,
    lng: 7.5000,
    baseflowRatio: 0.55,
    totalFlow: 12,
    groundwaterContribution: 55,
    status: 'mixed',
    description: 'Mixed baseflow and runoff river',
  },
  {
    id: 'bfi-tropical',
    name: 'Tropical Runoff River',
    lat: -5.0000,
    lng: 30.0000,
    baseflowRatio: 0.15,
    totalFlow: 850,
    groundwaterContribution: 15,
    status: 'runoff_dominated',
    description: 'Runoff-dominated tropical stream',
  },
  {
    id: 'bfi-wadi',
    name: 'Arid Wadi System',
    lat: 28.0000,
    lng: 35.0000,
    baseflowRatio: 0.02,
    totalFlow: 0.1,
    groundwaterContribution: 2,
    status: 'intermittent',
    description: 'Intermittent desert wadi flow',
  },
]

const STATUS_COLORS: Record<BaseflowIndexData['status'], { label: string; color: string; bgClass: string }> = {
  groundwater_dominated: { label: 'GW Dominated', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  mixed: { label: 'Mixed', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  runoff_dominated: { label: 'Runoff Dominated', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  intermittent: { label: 'Intermittent', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: BaseflowIndexData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function BaseflowIndexMonitor() {
  const state = useMapStore((s) => s.baseflowIndex)
  const setState = useMapStore((s) => s.setBaseflowIndex)

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
      return { totalPaths: 0, avgBaseflowRatio: 0, avgTotalFlow: 0, avgGroundwaterContribution: 0 }
    }
    const avgBaseflowRatio = filteredItems.reduce((sum, e) => sum + e.baseflowRatio, 0) / filteredItems.length
    const avgTotalFlow = filteredItems.reduce((sum, e) => sum + e.totalFlow, 0) / filteredItems.length
    const avgGroundwaterContribution = filteredItems.reduce((sum, e) => sum + e.groundwaterContribution, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgBaseflowRatio: Math.round(avgBaseflowRatio * 100) / 100,
      avgTotalFlow: Math.round(avgTotalFlow * 100) / 100,
      avgGroundwaterContribution: Math.round(avgGroundwaterContribution * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, baseflowRatio: e.baseflowRatio },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setBaseflowIndex({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof BaseflowIndexState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showBaseflowRatio', label: 'Baseflow Ratio', icon: Gauge },
    { key: 'showTotalFlow', label: 'Total Flow', icon: Waves },
    { key: 'showGroundwaterContribution', label: 'GW Contribution', icon: DropletsIcon18 },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-sky-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <DropletsIcon18 className="h-4 w-4 text-indigo-400" />
              Baseflow Index Monitor
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
                setState({ statusFilter: v as BaseflowIndexState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="groundwater_dominated">GW Dominated</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="runoff_dominated">Runoff Dominated</SelectItem>
                <SelectItem value="intermittent">Intermittent</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-indigo-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Stations</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg BFI</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgBaseflowRatio}</div>
              <div className="text-[9px] text-slate-400/60">ratio</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Flow</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgTotalFlow}</div>
              <div className="text-[9px] text-slate-400/60">m3/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg GW %</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgGroundwaterContribution}</div>
              <div className="text-[9px] text-slate-400/60">%</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Stations ({filteredItems.length})
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
                        {state.showBaseflowRatio && (
                          <div>
                            BFI:{' '}
                            <span className="text-slate-100 font-medium">{e.baseflowRatio}</span>
                          </div>
                        )}
                        {state.showTotalFlow && (
                          <div>
                            Flow:{' '}
                            <span className="text-slate-100 font-medium">{e.totalFlow} m3/s</span>
                          </div>
                        )}
                        {state.showGroundwaterContribution && (
                          <div>
                            GW %:{' '}
                            <span className="text-slate-100 font-medium">{e.groundwaterContribution}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No stations match the current filter.
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
                    <span className="text-slate-400/70">BFI: </span>
                    <span className="font-medium text-indigo-400">{activeItem.baseflowRatio}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Flow: </span>
                    <span className="font-medium text-sky-400">{activeItem.totalFlow} m3/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">GW %: </span>
                    <span className="font-medium text-slate-400">{activeItem.groundwaterContribution}%</span>
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
