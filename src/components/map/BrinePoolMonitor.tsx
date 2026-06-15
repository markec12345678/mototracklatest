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
import { useMapStore, type BrinePoolState, type BrinePoolData } from '@/lib/map-store'
import { Droplets as DropletsIcon9, X, Layers, Activity, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: BrinePoolData[] = [
  {
    id: 'bp-orca',
    name: 'Orca Basin',
    lat: 27.0,
    lng: -91.0,
    salinity: 250,
    poolDepth: 50,
    biodiversityIndex: 0.15,
    activity: 'active',
    seafloorDepth: 2400,
    description: 'Gulf of Mexico hypersaline basin',
  },
  {
    id: 'bp-tyro',
    name: 'Tyro Basin',
    lat: 34.5,
    lng: 26.0,
    salinity: 300,
    poolDepth: 80,
    biodiversityIndex: 0.08,
    activity: 'dormant',
    seafloorDepth: 3500,
    description: 'Mediterranean anoxic brine lake',
  },
  {
    id: 'bp-urania',
    name: 'Urania Basin',
    lat: 35.2,
    lng: 22.0,
    salinity: 280,
    poolDepth: 60,
    biodiversityIndex: 0.12,
    activity: 'active',
    seafloorDepth: 3500,
    description: 'Eastern Mediterranean deep brine',
  },
  {
    id: 'bp-shaban',
    name: 'Shaban Deep',
    lat: 24.5,
    lng: 36.0,
    salinity: 320,
    poolDepth: 100,
    biodiversityIndex: 0.05,
    activity: 'fossil',
    seafloorDepth: 1500,
    description: 'Red Sea fossil brine pool',
  },
]

const STATUS_COLORS: Record<BrinePoolData['activity'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  dormant: { label: 'Dormant', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  fossil: { label: 'Fossil', color: '#94a3b8', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  forming: { label: 'Forming', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ activity }: { activity: BrinePoolData['activity'] }) {
  const cfg = STATUS_COLORS[activity]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function BrinePoolMonitor() {
  const state = useMapStore((s) => s.brinePool)
  const setState = useMapStore((s) => s.setBrinePool)

  const pools = useMemo(
    () => (state.pools.length > 0 ? state.pools : SAMPLE_LOCATIONS),
    [state.pools]
  )

  const filteredPools = useMemo(() => {
    return pools.filter((p) => {
      if (state.activityFilter !== 'all' && p.activity !== state.activityFilter) return false
      return true
    })
  }, [pools, state.activityFilter])

  const summary = useMemo(() => {
    if (filteredPools.length === 0) {
      return { totalPools: 0, avgSalinity: 0, avgPoolDepth: 0, avgBiodiversity: 0 }
    }
    const avgSalinity = filteredPools.reduce((sum, p) => sum + p.salinity, 0) / filteredPools.length
    const avgPoolDepth = filteredPools.reduce((sum, p) => sum + p.poolDepth, 0) / filteredPools.length
    const avgBiodiversity = filteredPools.reduce((sum, p) => sum + p.biodiversityIndex, 0) / filteredPools.length
    return {
      totalPools: filteredPools.length,
      avgSalinity: Math.round(avgSalinity * 10) / 10,
      avgPoolDepth: Math.round(avgPoolDepth * 10) / 10,
      avgBiodiversity: Math.round(avgBiodiversity * 100) / 100,
    }
  }, [filteredPools])

  const activePool = useMemo(
    () => pools.find((p) => p.id === state.activePoolId) ?? null,
    [pools, state.activePoolId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredPools.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      properties: { id: p.id, name: p.name, activity: p.activity, salinity: p.salinity },
    })),
  }), [filteredPools])

  useEffect(() => {
    if (state.pools.length === 0) {
      useMapStore.getState().setBrinePool({ pools: SAMPLE_LOCATIONS })
    }
  }, [state.pools.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof BrinePoolState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSalinity', label: 'Salinity', icon: Layers },
    { key: 'showDepth', label: 'Pool Depth', icon: Activity },
    { key: 'showBiology', label: 'Biodiversity Index', icon: AlertTriangle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-indigo-950/95 backdrop-blur-xl border border-violet-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <DropletsIcon9 className="h-4 w-4 text-violet-400" />
              Brine Pool Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-300 hover:text-violet-100 hover:bg-violet-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-violet-100">
          {/* Activity Filter */}
          <div>
            <Label className="text-xs text-violet-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Activity Status
            </Label>
            <Select
              value={state.activityFilter}
              onValueChange={(v) =>
                setState({ activityFilter: v as BrinePoolState['activityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="fossil">Fossil</SelectItem>
                <SelectItem value="forming">Forming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-violet-200">
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Total Pools</div>
              <div className="text-sm font-semibold text-violet-200">{summary.totalPools}</div>
              <div className="text-[9px] text-violet-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Salinity</div>
              <div className="text-sm font-semibold text-violet-200">{summary.avgSalinity}</div>
              <div className="text-[9px] text-violet-400/60">PSU</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Pool Depth</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgPoolDepth}</div>
              <div className="text-[9px] text-violet-400/60">meters</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Biodiversity Index</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgBiodiversity}</div>
              <div className="text-[9px] text-violet-400/60">average</div>
            </div>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Pool List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">
              Pools ({filteredPools.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPools.map((pool) => {
                  const isActive = state.activePoolId === pool.id
                  const statusCfg = STATUS_COLORS[pool.activity]
                  return (
                    <div
                      key={pool.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-800/30'
                          : 'border-violet-700/30 hover:border-violet-500/30 hover:bg-violet-800/20'
                      }`}
                      onClick={() =>
                        setState({ activePoolId: isActive ? null : pool.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon activity={pool.activity} />
                          <span className="text-xs font-medium text-violet-100">{pool.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300/60">
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-violet-100 font-medium">{pool.salinity}PSU</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Pool Depth:{' '}
                            <span className="text-violet-100 font-medium">{pool.poolDepth}m</span>
                          </div>
                        )}
                        {state.showBiology && (
                          <div>
                            Biodiversity:{' '}
                            <span className="text-violet-100 font-medium">{pool.biodiversityIndex}</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Seafloor:{' '}
                            <span className="text-violet-100 font-medium">{pool.seafloorDepth}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPools.length === 0 && (
                  <div className="text-center text-xs text-violet-400/50 py-4">
                    No pools match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Pool Details */}
          {activePool && (
            <>
              <Separator className="bg-violet-700/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activePool.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activePool.activity].bgClass}`}
                  >
                    {STATUS_COLORS[activePool.activity].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300/60 italic">{activePool.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400/70">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activePool.lat.toFixed(1)}, {activePool.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Salinity: </span>
                    <span className="font-medium text-violet-100">{activePool.salinity}PSU</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Pool Depth: </span>
                    <span className="font-medium text-blue-400">{activePool.poolDepth}m</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Biodiversity: </span>
                    <span className="font-medium text-green-400">{activePool.biodiversityIndex}</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Seafloor: </span>
                    <span className="font-medium text-orange-400">{activePool.seafloorDepth}m</span>
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
