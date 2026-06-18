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
import { useMapStore, type FertilizerRunoffState, type FertilizerRunoffData } from '@/lib/map-store'
import { FlaskConical as FlaskConicalIcon4, X, Activity, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: FertilizerRunoffData[] = [
  {
    id: 'fr-mississippi',
    name: 'Mississippi Basin',
    lat: 38.000,
    lng: -90.000,
    nitrogenLoad: 145,
    phosphorusLoad: 28,
    nitrateLevel: 12.8,
    eutrophicationIndex: 78,
    status: 'severe',
    description: 'High nutrient loading from Corn Belt contributing to Gulf dead zone',
  },
  {
    id: 'fr-baltic',
    name: 'Baltic Catchment',
    lat: 58.000,
    lng: 18.000,
    nitrogenLoad: 95,
    phosphorusLoad: 18,
    nitrateLevel: 8.2,
    eutrophicationIndex: 62,
    status: 'elevated',
    description: 'Agricultural runoff from Baltic Sea watershed causing algal blooms',
  },
  {
    id: 'fr-yangtze',
    name: 'Yangtze Delta',
    lat: 31.200,
    lng: 121.500,
    nitrogenLoad: 68,
    phosphorusLoad: 12,
    nitrateLevel: 5.5,
    eutrophicationIndex: 45,
    status: 'moderate',
    description: 'Rice paddy and aquaculture runoff in East China coastal zone',
  },
  {
    id: 'fr-gbr',
    name: 'GBR Catchment',
    lat: -18.300,
    lng: 146.500,
    nitrogenLoad: 22,
    phosphorusLoad: 4.5,
    nitrateLevel: 2.1,
    eutrophicationIndex: 18,
    status: 'low',
    description: 'Sugar cane and grazing runoff managed under Reef 2050 Plan',
  },
]

const STATUS_COLORS: Record<FertilizerRunoffData['status'], { label: string; color: string; bgClass: string }> = {
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  elevated: { label: 'Elevated', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: FertilizerRunoffData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function FertilizerRunoffMonitor() {
  const state = useMapStore((s) => s.fertilizerRunoff)
  const setState = useMapStore((s) => s.setFertilizerRunoff)

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
      return { totalZones: 0, avgN: 0, avgP: 0, avgEutro: 0 }
    }
    const avgN = filteredItems.reduce((sum, e) => sum + e.nitrogenLoad, 0) / filteredItems.length
    const avgP = filteredItems.reduce((sum, e) => sum + e.phosphorusLoad, 0) / filteredItems.length
    const avgEutro = filteredItems.reduce((sum, e) => sum + e.eutrophicationIndex, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgN: Math.round(avgN),
      avgP: avgP.toFixed(1),
      avgEutro: Math.round(avgEutro),
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
      properties: { id: e.id, name: e.name, status: e.status, eutrophicationIndex: e.eutrophicationIndex },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setFertilizerRunoff({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof FertilizerRunoffState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showNitrogenLoad', label: 'N Load', icon: Activity },
    { key: 'showPhosphorusLoad', label: 'P Load', icon: TrendingUp },
    { key: 'showNitrateLevel', label: 'Nitrate Level', icon: FlaskConicalIcon4 },
    { key: 'showEutrophicationIndex', label: 'Eutrophication', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-green-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <FlaskConicalIcon4 className="h-4 w-4 text-teal-400" />
              Fertilizer Runoff Monitor
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
                setState({ statusFilter: v as FertilizerRunoffState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-teal-600"
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
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg N Load</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgN}</div>
              <div className="text-[9px] text-slate-400/60">kg/ha/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg P Load</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgP}</div>
              <div className="text-[9px] text-slate-400/60">kg/ha/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Eutrophication</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgEutro}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Runoff Zones ({filteredItems.length})
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
                        {state.showNitrogenLoad && (
                          <div>
                            N Load: <span className="text-slate-100 font-medium">{e.nitrogenLoad} kg/ha/yr</span>
                          </div>
                        )}
                        {state.showPhosphorusLoad && (
                          <div>
                            P Load: <span className="text-slate-100 font-medium">{e.phosphorusLoad} kg/ha/yr</span>
                          </div>
                        )}
                        {state.showNitrateLevel && (
                          <div>
                            Nitrate: <span className="text-slate-100 font-medium">{e.nitrateLevel} mg/L</span>
                          </div>
                        )}
                        {state.showEutrophicationIndex && (
                          <div>
                            Eutro: <span className="text-slate-100 font-medium">{e.eutrophicationIndex}</span>
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
                    <span className="text-slate-400/70">N Load: </span>
                    <span className="font-medium text-teal-400">{activeItem.nitrogenLoad} kg/ha/yr</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">P Load: </span>
                    <span className="font-medium text-green-400">{activeItem.phosphorusLoad} kg/ha/yr</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Eutro: </span>
                    <span className="font-medium text-slate-200">{activeItem.eutrophicationIndex}</span>
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
