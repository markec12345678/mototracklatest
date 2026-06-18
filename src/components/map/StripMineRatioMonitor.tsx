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
import { useMapStore, type StripMineRatioState, type StripMineRatioData } from '@/lib/map-store'
import { Container as ContainerIcon, X, TrendingUp, Mountain, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: StripMineRatioData[] = [
  {
    id: 'smr-bingham',
    name: 'Bingham Canyon',
    lat: 40.5200,
    lng: -112.1500,
    stripRatio: 2.8,
    overburdenDepth: 350,
    oreThickness: 120,
    status: 'favorable',
    description: 'Favorable strip ratio porphyry copper',
  },
  {
    id: 'smr-morenci',
    name: 'Morenci Mine',
    lat: 33.0800,
    lng: -109.3500,
    stripRatio: 4.5,
    overburdenDepth: 280,
    oreThickness: 62,
    status: 'marginal',
    description: 'Marginal strip ratio copper mine',
  },
  {
    id: 'smr-muscle',
    name: 'Muscle Shoals Coal',
    lat: 34.7500,
    lng: -87.6500,
    stripRatio: 8.2,
    overburdenDepth: 45,
    oreThickness: 5.5,
    status: 'high',
    description: 'High strip ratio coal operation',
  },
  {
    id: 'smr-dry',
    name: 'Dry Valley Phosphate',
    lat: 42.7000,
    lng: -111.3000,
    stripRatio: 15.0,
    overburdenDepth: 60,
    oreThickness: 4.0,
    status: 'uneconomic',
    description: 'Uneconomic strip ratio phosphate',
  },
]

const STATUS_COLORS: Record<StripMineRatioData['status'], { label: string; color: string; bgClass: string }> = {
  favorable: { label: 'Favorable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  marginal: { label: 'Marginal', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  uneconomic: { label: 'Uneconomic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: StripMineRatioData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function StripMineRatioMonitor() {
  const state = useMapStore((s) => s.stripMineRatio)
  const setState = useMapStore((s) => s.setStripMineRatio)

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
      return { totalPaths: 0, avgStripRatio: 0, avgOverburdenDepth: 0, highUneconomicCount: 0 }
    }
    const avgStripRatio = filteredItems.reduce((sum, e) => sum + e.stripRatio, 0) / filteredItems.length
    const avgOverburdenDepth = filteredItems.reduce((sum, e) => sum + e.overburdenDepth, 0) / filteredItems.length
    const highUneconomicCount = filteredItems.filter((e) => e.status === 'high' || e.status === 'uneconomic').length
    return {
      totalPaths: filteredItems.length,
      avgStripRatio: Math.round(avgStripRatio * 10) / 10,
      avgOverburdenDepth: Math.round(avgOverburdenDepth * 10) / 10,
      highUneconomicCount,
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
      properties: { id: e.id, name: e.name, status: e.status, stripRatio: e.stripRatio },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setStripMineRatio({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof StripMineRatioState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showStripRatio', label: 'Strip Ratio', icon: TrendingUp },
    { key: 'showOverburdenDepth', label: 'Overburden Depth', icon: Mountain },
    { key: 'showOreThickness', label: 'Ore Thickness', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-stone-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <ContainerIcon className="h-4 w-4 text-orange-400" />
              Strip Mine Ratio Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-300 hover:text-orange-100 hover:bg-orange-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-orange-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-orange-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as StripMineRatioState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="favorable">Favorable</SelectItem>
                <SelectItem value="marginal">Marginal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="uneconomic">Uneconomic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-orange-200">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-orange-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Strip Ratio</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgStripRatio}</div>
              <div className="text-[9px] text-orange-400/60">:1</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Overburden</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgOverburdenDepth}</div>
              <div className="text-[9px] text-orange-400/60">m</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">High+Uneconomic</div>
              <div className="text-sm font-semibold text-red-400">{summary.highUneconomicCount}</div>
              <div className="text-[9px] text-orange-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
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
                          ? 'border-orange-500/50 bg-orange-800/30'
                          : 'border-orange-700/30 hover:border-orange-500/30 hover:bg-orange-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-orange-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/60">
                        {state.showStripRatio && (
                          <div>
                            Strip Ratio:{' '}
                            <span className="text-orange-100 font-medium">{e.stripRatio} :1</span>
                          </div>
                        )}
                        {state.showOverburdenDepth && (
                          <div>
                            Overburden:{' '}
                            <span className="text-orange-100 font-medium">{e.overburdenDepth} m</span>
                          </div>
                        )}
                        {state.showOreThickness && (
                          <div>
                            Ore Thickness:{' '}
                            <span className="text-orange-100 font-medium">{e.oreThickness} m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-orange-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-orange-700/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-orange-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-orange-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-orange-400/70">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Strip Ratio: </span>
                    <span className="font-medium text-amber-400">{activeItem.stripRatio} :1</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Overburden: </span>
                    <span className="font-medium text-orange-400">{activeItem.overburdenDepth} m</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Ore Thickness: </span>
                    <span className="font-medium text-green-400">{activeItem.oreThickness} m</span>
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
