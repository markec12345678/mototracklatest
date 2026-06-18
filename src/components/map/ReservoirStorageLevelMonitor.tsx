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
import { useMapStore, type ReservoirStorageLevelState, type ReservoirStorageLevelData } from '@/lib/map-store'
import { Gauge as GaugeIcon3, X, ArrowDown, ArrowUpFromLine, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: ReservoirStorageLevelData[] = [
  {
    id: 'rsl-hoover',
    name: 'Lake Mead / Hoover',
    lat: 36.0000,
    lng: -114.5000,
    storageLevel: 35,
    inflowRate: 450,
    outflowRate: 600,
    status: 'low',
    description: 'Historically low reservoir levels',
  },
  {
    id: 'rsl-threegorges',
    name: 'Three Gorges Dam',
    lat: 30.8000,
    lng: 111.0000,
    storageLevel: 95,
    inflowRate: 25000,
    outflowRate: 22000,
    status: 'full',
    description: 'Near full capacity in wet season',
  },
  {
    id: 'rsl-aswan',
    name: 'Lake Nasser / Aswan',
    lat: 23.0000,
    lng: 33.0000,
    storageLevel: 72,
    inflowRate: 3200,
    outflowRate: 2800,
    status: 'adequate',
    description: 'Adequate storage for Egypt water needs',
  },
  {
    id: 'rsl-itaipu',
    name: 'Itaipu Reservoir',
    lat: -25.4000,
    lng: -54.6000,
    storageLevel: 102,
    inflowRate: 12000,
    outflowRate: 11500,
    status: 'overflow',
    description: 'Spillway active due to heavy rains',
  },
]

const STATUS_COLORS: Record<ReservoirStorageLevelData['status'], { label: string; color: string; bgClass: string }> = {
  overflow: { label: 'Overflow', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-600 border-red-600/30' },
  full: { label: 'Full', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  adequate: { label: 'Adequate', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
}

function TrendIcon({ status }: { status: ReservoirStorageLevelData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function ReservoirStorageLevelMonitor() {
  const state = useMapStore((s) => s.reservoirStorageLevel)
  const setState = useMapStore((s) => s.setReservoirStorageLevel)

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
      return { totalPaths: 0, avgStorageLevel: 0, avgInflowRate: 0, avgOutflowRate: 0 }
    }
    const avgStorageLevel = filteredItems.reduce((sum, e) => sum + e.storageLevel, 0) / filteredItems.length
    const avgInflowRate = filteredItems.reduce((sum, e) => sum + e.inflowRate, 0) / filteredItems.length
    const avgOutflowRate = filteredItems.reduce((sum, e) => sum + e.outflowRate, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgStorageLevel: Math.round(avgStorageLevel * 100) / 100,
      avgInflowRate: Math.round(avgInflowRate * 100) / 100,
      avgOutflowRate: Math.round(avgOutflowRate * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, storageLevel: e.storageLevel },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setReservoirStorageLevel({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ReservoirStorageLevelState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showStorageLevel', label: 'Storage Level', icon: GaugeIcon3 },
    { key: 'showInflowRate', label: 'Inflow Rate', icon: ArrowDown },
    { key: 'showOutflowRate', label: 'Outflow Rate', icon: ArrowUpFromLine },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-green-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <GaugeIcon3 className="h-4 w-4 text-teal-400" />
              Reservoir Storage Level Monitor
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
                setState({ statusFilter: v as ReservoirStorageLevelState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="overflow">Overflow</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
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
              <div className="text-[10px] text-slate-400/70">Total Reservoirs</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Storage</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgStorageLevel}</div>
              <div className="text-[9px] text-slate-400/60">%</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Inflow</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgInflowRate}</div>
              <div className="text-[9px] text-slate-400/60">m3/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Outflow</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgOutflowRate}</div>
              <div className="text-[9px] text-slate-400/60">m3/s</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Reservoirs ({filteredItems.length})
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
                        {state.showStorageLevel && (
                          <div>
                            Storage:{' '}
                            <span className="text-slate-100 font-medium">{e.storageLevel}%</span>
                          </div>
                        )}
                        {state.showInflowRate && (
                          <div>
                            Inflow:{' '}
                            <span className="text-slate-100 font-medium">{e.inflowRate} m3/s</span>
                          </div>
                        )}
                        {state.showOutflowRate && (
                          <div>
                            Outflow:{' '}
                            <span className="text-slate-100 font-medium">{e.outflowRate} m3/s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No reservoirs match the current filter.
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
                    <span className="text-slate-400/70">Storage: </span>
                    <span className="font-medium text-teal-400">{activeItem.storageLevel}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Inflow: </span>
                    <span className="font-medium text-green-400">{activeItem.inflowRate} m3/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Outflow: </span>
                    <span className="font-medium text-slate-400">{activeItem.outflowRate} m3/s</span>
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
