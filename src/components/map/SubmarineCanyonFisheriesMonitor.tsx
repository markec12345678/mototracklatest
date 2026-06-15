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
import { useMapStore, type SubmarineCanyonFisheriesState, type SubmarineCanyonFisheriesData } from '@/lib/map-store'
import { Fish as FishIcon5, X, Anchor, Weight, MapPin, Filter, Fish } from 'lucide-react'

const SAMPLE_LOCATIONS: SubmarineCanyonFisheriesData[] = [
  {
    id: 'sf-monterey',
    name: 'Monterey Canyon Fishery',
    lat: 36.8,
    lng: -122.0,
    depth: 1500,
    fishSpecies: 'Rockfish/Sablefish',
    catchVolume: 450,
    status: 'productive',
    description: 'Deep-water rockfish fishery in Monterey Canyon',
  },
  {
    id: 'sf-hudson',
    name: 'Hudson Canyon Fishery',
    lat: 39.5,
    lng: -72.0,
    depth: 800,
    fishSpecies: 'Squid/Flounder',
    catchVolume: 320,
    status: 'recovering',
    description: 'Recovering fishery after quota restrictions',
  },
  {
    id: 'sf-zambezi',
    name: 'Zambezi Canyon Fishery',
    lat: -22.0,
    lng: 36.0,
    depth: 2200,
    fishSpecies: 'Deep-sea Shrimp',
    catchVolume: 85,
    status: 'depleted',
    description: 'Overexploited deep-sea shrimp fishery',
  },
  {
    id: 'sf-kaikoura',
    name: 'Kaikōura Canyon Fishery',
    lat: -42.4,
    lng: 173.7,
    depth: 1200,
    fishSpecies: 'Hāpuku/Ling',
    catchVolume: 280,
    status: 'protected',
    description: 'Marine reserve with limited fishing zones',
  },
]

const STATUS_COLORS: Record<SubmarineCanyonFisheriesData['status'], { label: string; color: string; bgClass: string }> = {
  productive: { label: 'Productive', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  depleted: { label: 'Depleted', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  recovering: { label: 'Recovering', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  protected: { label: 'Protected', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: SubmarineCanyonFisheriesData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SubmarineCanyonFisheriesMonitor() {
  const state = useMapStore((s) => s.submarineCanyonFisheries)
  const setState = useMapStore((s) => s.setSubmarineCanyonFisheries)

  const fisheries = useMemo(
    () => (state.fisheries.length > 0 ? state.fisheries : SAMPLE_LOCATIONS),
    [state.fisheries]
  )

  const filteredItems = useMemo(() => {
    return fisheries.filter((f) => {
      if (state.statusFilter !== 'all' && f.status !== state.statusFilter) return false
      return true
    })
  }, [fisheries, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalFisheries: 0, avgDepth: 0, totalCatch: 0, productiveCount: 0 }
    }
    const avgDepth = filteredItems.reduce((sum, f) => sum + f.depth, 0) / filteredItems.length
    const totalCatch = filteredItems.reduce((sum, f) => sum + f.catchVolume, 0)
    const productiveCount = filteredItems.filter((f) => f.status === 'productive').length
    return {
      totalFisheries: filteredItems.length,
      avgDepth: Math.round(avgDepth * 10) / 10,
      totalCatch: Math.round(totalCatch),
      productiveCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => fisheries.find((f) => f.id === state.activeFisheryId) ?? null,
    [fisheries, state.activeFisheryId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((f) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
      properties: { id: f.id, name: f.name, status: f.status, depth: f.depth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.fisheries.length === 0) {
      useMapStore.getState().setSubmarineCanyonFisheries({ fisheries: SAMPLE_LOCATIONS })
    }
  }, [state.fisheries.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubmarineCanyonFisheriesState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: Anchor },
    { key: 'showCatchVolume', label: 'Catch Volume', icon: Weight },
    { key: 'showFishSpecies', label: 'Fish Species', icon: Fish },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-cyan-950/95 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <FishIcon5 className="h-4 w-4 text-teal-400" />
              Submarine Canyon Fisheries Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-teal-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SubmarineCanyonFisheriesState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="productive">Productive</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
                <SelectItem value="protected">Protected</SelectItem>
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

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Total Fisheries</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalFisheries}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgDepth}</div>
              <div className="text-[9px] text-teal-400/60">m</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Total Catch</div>
              <div className="text-sm font-semibold text-green-400">{summary.totalCatch}</div>
              <div className="text-[9px] text-teal-400/60">tons</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Productive Count</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.productiveCount}</div>
              <div className="text-[9px] text-teal-400/60">fisheries</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Fishery List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Fisheries ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((f) => {
                  const isActive = state.activeFisheryId === f.id
                  const statusCfg = STATUS_COLORS[f.status]
                  return (
                    <div
                      key={f.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeFisheryId: isActive ? null : f.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={f.status} />
                          <span className="text-xs font-medium text-teal-100">{f.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-teal-100 font-medium">{f.depth} m</span>
                          </div>
                        )}
                        {state.showCatchVolume && (
                          <div>
                            Catch:{' '}
                            <span className="text-teal-100 font-medium">{f.catchVolume} tons</span>
                          </div>
                        )}
                        {state.showFishSpecies && (
                          <div>
                            Species:{' '}
                            <span className="text-teal-100 font-medium">{f.fishSpecies}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No fisheries match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Fishery Details */}
          {activeItem && (
            <>
              <Separator className="bg-teal-700/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-teal-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400/70">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Depth: </span>
                    <span className="font-medium text-cyan-400">{activeItem.depth} m</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Catch Volume: </span>
                    <span className="font-medium text-green-400">{activeItem.catchVolume} tons</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Fish Species: </span>
                    <span className="font-medium text-teal-200">{activeItem.fishSpecies}</span>
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
