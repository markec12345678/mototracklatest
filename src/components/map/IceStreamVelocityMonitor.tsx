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
import { useMapStore, type IceStreamVelocityState, type IceStreamVelocityData } from '@/lib/map-store'
import { ArrowUpFromLine as ArrowUpIcon4, X, Gauge, Mountain, Zap, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IceStreamVelocityData[] = [
  {
    id: 'is-pineisland',
    name: 'Pine Island Glacier',
    lat: -75.25,
    lng: -100.0,
    flowVelocity: 3500,
    iceThickness: 2100,
    basalShearStress: 120,
    status: 'accelerating',
    description: 'Fastest thinning glacier',
  },
  {
    id: 'is-thwaites',
    name: 'Thwaites Glacier',
    lat: -75.5,
    lng: -107.0,
    flowVelocity: 2800,
    iceThickness: 1800,
    basalShearStress: 95,
    status: 'accelerating',
    description: 'Doomsday glacier',
  },
  {
    id: 'is-whillans',
    name: 'Whillans Ice Stream',
    lat: -84.0,
    lng: -160.0,
    flowVelocity: 400,
    iceThickness: 950,
    basalShearStress: 30,
    status: 'stable',
    description: 'Sticky-spot ice stream',
  },
  {
    id: 'is-kamb',
    name: 'Kamb Ice Stream',
    lat: -82.0,
    lng: -155.0,
    flowVelocity: 10,
    iceThickness: 800,
    basalShearStress: 5,
    status: 'stagnant',
    description: 'Stagnated ice stream',
  },
]

const STATUS_COLORS: Record<IceStreamVelocityData['status'], { label: string; color: string; bgClass: string }> = {
  accelerating: { label: 'Accelerating', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  decelerating: { label: 'Decelerating', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stagnant: { label: 'Stagnant', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: IceStreamVelocityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IceStreamVelocityMonitor() {
  const state = useMapStore((s) => s.iceStreamVelocity)
  const setState = useMapStore((s) => s.setIceStreamVelocity)

  const items = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return items.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [items, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalStreams: 0, avgVelocity: 0, avgThickness: 0, acceleratingCount: 0 }
    }
    const avgVelocity = filteredItems.reduce((sum, e) => sum + e.flowVelocity, 0) / filteredItems.length
    const avgThickness = filteredItems.reduce((sum, e) => sum + e.iceThickness, 0) / filteredItems.length
    const acceleratingCount = filteredItems.filter((e) => e.status === 'accelerating').length
    return {
      totalStreams: filteredItems.length,
      avgVelocity: Math.round(avgVelocity),
      avgThickness: Math.round(avgThickness),
      acceleratingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => items.find((e) => e.id === state.activeItemId) ?? null,
    [items, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, flowVelocity: e.flowVelocity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setIceStreamVelocity({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IceStreamVelocityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowVelocity', label: 'Flow Velocity', icon: Gauge },
    { key: 'showIceThickness', label: 'Ice Thickness', icon: Mountain },
    { key: 'showBasalShearStress', label: 'Basal Shear Stress', icon: Zap },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-sky-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <ArrowUpIcon4 className="h-4 w-4 text-sky-400" />
              Ice Stream Velocity
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-sky-100 hover:bg-sky-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sky-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-sky-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as IceStreamVelocityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="accelerating">Accelerating</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="decelerating">Decelerating</SelectItem>
                <SelectItem value="stagnant">Stagnant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-200">
                  <Icon className="h-3 w-3 text-sky-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Total Streams</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalStreams}</div>
              <div className="text-[9px] text-sky-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Velocity</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgVelocity.toLocaleString()}</div>
              <div className="text-[9px] text-sky-400/60">m/yr</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Thickness</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgThickness.toLocaleString()}</div>
              <div className="text-[9px] text-sky-400/60">m</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Accelerating</div>
              <div className="text-sm font-semibold text-red-400">{summary.acceleratingCount}</div>
              <div className="text-[9px] text-sky-400/60">streams</div>
            </div>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">
              Locations ({filteredItems.length})
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
                          ? 'border-sky-500/50 bg-sky-800/30'
                          : 'border-sky-700/30 hover:border-sky-500/30 hover:bg-sky-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-sky-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300/60">
                        {state.showFlowVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-sky-100 font-medium">{e.flowVelocity.toLocaleString()} m/yr</span>
                          </div>
                        )}
                        {state.showIceThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-sky-100 font-medium">{e.iceThickness.toLocaleString()} m</span>
                          </div>
                        )}
                        {state.showBasalShearStress && (
                          <div>
                            Shear:{' '}
                            <span className="text-sky-100 font-medium">{e.basalShearStress} kPa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-sky-400/50 py-4">
                    No locations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-sky-700/30" />
              <div className="space-y-2 rounded-lg border border-sky-600/30 bg-sky-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-sky-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400/70">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Velocity: </span>
                    <span className="font-medium text-blue-400">{activeItem.flowVelocity.toLocaleString()} m/yr</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Thickness: </span>
                    <span className="font-medium text-cyan-400">{activeItem.iceThickness.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Shear Stress: </span>
                    <span className="font-medium text-sky-400">{activeItem.basalShearStress} kPa</span>
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
