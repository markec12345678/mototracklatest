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
import { useMapStore, type CryoconiteGranuleState, type CryoconiteGranuleData } from '@/lib/map-store'
import { CircleDot as CircleDotIcon3, X, Circle, Leaf, Sun, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CryoconiteGranuleData[] = [
  {
    id: 'cg-greenland-w',
    name: 'Greenland Ice Sheet W',
    lat: 67.0,
    lng: -50.0,
    granuleDiameter: 2.5,
    organicContent: 18,
    albedoEffect: 3.2,
    status: 'forming',
    description: 'Active granule formation zone',
  },
  {
    id: 'cg-alaska',
    name: 'Alaska Juneau Granule',
    lat: 58.5,
    lng: -134.5,
    granuleDiameter: 3.8,
    organicContent: 25,
    albedoEffect: 5.5,
    status: 'active',
    description: 'Mature cryoconite ecosystem',
  },
  {
    id: 'cg-iceland',
    name: 'Iceland Vatnajökull',
    lat: 64.4,
    lng: -16.8,
    granuleDiameter: 1.5,
    organicContent: 12,
    albedoEffect: 8.0,
    status: 'melting',
    description: 'Accelerating melt from granules',
  },
  {
    id: 'cg-antarctic',
    name: 'Antarctic McMurdo',
    lat: -77.8,
    lng: 166.7,
    granuleDiameter: 0.8,
    organicContent: 8,
    albedoEffect: 1.5,
    status: 'deposited',
    description: 'Winter deposited granules',
  },
]

const STATUS_COLORS: Record<CryoconiteGranuleData['status'], { label: string; color: string; bgClass: string }> = {
  forming: { label: 'Forming', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  melting: { label: 'Melting', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  deposited: { label: 'Deposited', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: CryoconiteGranuleData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CryoconiteGranuleMonitor() {
  const state = useMapStore((s) => s.cryoconiteGranule)
  const setState = useMapStore((s) => s.setCryoconiteGranule)

  const items = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (state.statusFilter !== 'all' && item.status !== state.statusFilter) return false
      return true
    })
  }, [items, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgDiameter: 0, avgAlbedo: 0, formingActiveCount: 0 }
    }
    const avgDiameter = filteredItems.reduce((sum, item) => sum + item.granuleDiameter, 0) / filteredItems.length
    const avgAlbedo = filteredItems.reduce((sum, item) => sum + item.albedoEffect, 0) / filteredItems.length
    const formingActiveCount = filteredItems.filter((item) => item.status === 'forming' || item.status === 'active').length
    return {
      totalSites: filteredItems.length,
      avgDiameter: Math.round(avgDiameter * 100) / 100,
      avgAlbedo: Math.round(avgAlbedo * 100) / 100,
      formingActiveCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => items.find((item) => item.id === state.activeItemId) ?? null,
    [items, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.lng, item.lat] },
      properties: { id: item.id, name: item.name, status: item.status, granuleDiameter: item.granuleDiameter },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCryoconiteGranule({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CryoconiteGranuleState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showGranuleDiameter', label: 'Granule Diameter', icon: Circle },
    { key: 'showOrganicContent', label: 'Organic Content', icon: Leaf },
    { key: 'showAlbedoEffect', label: 'Albedo Effect', icon: Sun },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-zinc-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CircleDotIcon3 className="h-4 w-4 text-slate-400" />
              Cryoconite Granule
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
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as CryoconiteGranuleState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="forming">Forming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="melting">Melting</SelectItem>
                <SelectItem value="deposited">Deposited</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-slate-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalSites}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Diameter</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgDiameter}</div>
              <div className="text-[9px] text-slate-400/60">mm</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Albedo</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgAlbedo}</div>
              <div className="text-[9px] text-slate-400/60">%</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Forming+Active</div>
              <div className="text-sm font-semibold text-green-400">{summary.formingActiveCount}</div>
              <div className="text-[9px] text-slate-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Sites ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((item) => {
                  const isActive = state.activeItemId === item.id
                  const statusCfg = STATUS_COLORS[item.status]
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : item.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={item.status} />
                          <span className="text-xs font-medium text-slate-100">{item.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showGranuleDiameter && (
                          <div>
                            Diameter:{' '}
                            <span className="text-slate-100 font-medium">{item.granuleDiameter} mm</span>
                          </div>
                        )}
                        {state.showOrganicContent && (
                          <div>
                            Organic:{' '}
                            <span className="text-slate-100 font-medium">{item.organicContent}%</span>
                          </div>
                        )}
                        {state.showAlbedoEffect && (
                          <div>
                            Albedo:{' '}
                            <span className="text-cyan-400 font-medium">{item.albedoEffect}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No sites match the current filter.
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
                    <span className="text-slate-400/70">Diameter: </span>
                    <span className="font-medium text-cyan-400">{activeItem.granuleDiameter} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Organic: </span>
                    <span className="font-medium text-green-400">{activeItem.organicContent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Albedo: </span>
                    <span className="font-medium text-amber-400">{activeItem.albedoEffect}%</span>
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
