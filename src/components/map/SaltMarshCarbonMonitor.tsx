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
import { useMapStore, type SaltMarshCarbonState, type SaltMarshCarbonData } from '@/lib/map-store'
import { Leaf as LeafIcon7, X, TrendingUp, TreePine, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SaltMarshCarbonData[] = [
  {
    id: 'sm-sapelo',
    name: 'Sapelo Island Marsh',
    lat: 31.4,
    lng: -81.1833,
    carbonStock: 85,
    accretionRate: 3.2,
    vegetationCover: 92,
    status: 'sequestering',
    description: 'Pristine salt marsh carbon sink',
  },
  {
    id: 'sm-wash',
    name: 'The Wash Marsh',
    lat: 52.9167,
    lng: 0.25,
    carbonStock: 62,
    accretionRate: 2.1,
    vegetationCover: 78,
    status: 'stable',
    description: 'English east coast marsh',
  },
  {
    id: 'sm-venice',
    name: 'Venice Lagoon Marsh',
    lat: 45.4167,
    lng: 12.3333,
    carbonStock: 35,
    accretionRate: 0.8,
    vegetationCover: 45,
    status: 'emitting',
    description: 'Degraded lagoon marsh system',
  },
  {
    id: 'sm-yangtze',
    name: 'Yangtze Delta Marsh',
    lat: 31.3333,
    lng: 121.8333,
    carbonStock: 28,
    accretionRate: -0.5,
    vegetationCover: 30,
    status: 'eroding',
    description: 'Rapidly eroding delta marsh',
  },
]

const STATUS_COLORS: Record<SaltMarshCarbonData['status'], { label: string; color: string; bgClass: string }> = {
  sequestering: { label: 'Sequestering', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  emitting: { label: 'Emitting', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  eroding: { label: 'Eroding', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: SaltMarshCarbonData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SaltMarshCarbonMonitor() {
  const state = useMapStore((s) => s.saltMarshCarbon)
  const setState = useMapStore((s) => s.setSaltMarshCarbon)

  const items = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return items.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [items, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgCarbon: 0, avgAccretion: 0, sequesteringCount: 0 }
    }
    const avgCarbon = Math.round(filteredItems.reduce((sum, e) => sum + e.carbonStock, 0) / filteredItems.length)
    const avgAccretion = +(filteredItems.reduce((sum, e) => sum + e.accretionRate, 0) / filteredItems.length).toFixed(1)
    const sequesteringCount = filteredItems.filter((e) => e.status === 'sequestering').length
    return {
      totalSites: filteredItems.length,
      avgCarbon,
      avgAccretion,
      sequesteringCount,
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
      properties: { id: e.id, name: e.name, status: e.status, carbonStock: e.carbonStock },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSaltMarshCarbon({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SaltMarshCarbonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: LeafIcon7 },
    { key: 'showAccretionRate', label: 'Accretion Rate', icon: TrendingUp },
    { key: 'showVegetationCover', label: 'Vegetation Cover', icon: TreePine },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <LeafIcon7 className="h-4 w-4 text-emerald-400" />
              Salt Marsh Carbon
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-emerald-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SaltMarshCarbonState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sequestering">Sequestering</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="emitting">Emitting</SelectItem>
                <SelectItem value="eroding">Eroding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalSites}</div>
              <div className="text-[9px] text-emerald-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Carbon</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgCarbon}</div>
              <div className="text-[9px] text-emerald-400/60">tC/ha</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Accretion</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgAccretion}</div>
              <div className="text-[9px] text-emerald-400/60">mm/yr</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Sequestering</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.sequesteringCount}</div>
              <div className="text-[9px] text-emerald-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
              Sites ({filteredItems.length})
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
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/30 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-emerald-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/60">
                        {state.showCarbonStock && (
                          <div>
                            Carbon:{' '}
                            <span className="text-emerald-100 font-medium">{e.carbonStock} tC/ha</span>
                          </div>
                        )}
                        {state.showAccretionRate && (
                          <div>
                            Accretion:{' '}
                            <span className="text-emerald-100 font-medium">{e.accretionRate} mm/yr</span>
                          </div>
                        )}
                        {state.showVegetationCover && (
                          <div>
                            Vegetation:{' '}
                            <span className="text-emerald-100 font-medium">{e.vegetationCover}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-emerald-700/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-emerald-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400/70">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Carbon Stock: </span>
                    <span className="font-medium text-green-400">{activeItem.carbonStock} tC/ha</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Accretion: </span>
                    <span className="font-medium text-orange-400">{activeItem.accretionRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Vegetation: </span>
                    <span className="font-medium text-emerald-400">{activeItem.vegetationCover}%</span>
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
