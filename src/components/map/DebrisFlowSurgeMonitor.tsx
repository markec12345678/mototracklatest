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
import { useMapStore, type DebrisFlowSurgeState, type DebrisFlowSurgeData } from '@/lib/map-store'
import { Waves as WavesIcon19, X, Droplets, Wind, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: DebrisFlowSurgeData[] = [
  {
    id: 'df-jiangjia',
    name: 'Jiangjia Ravine',
    lat: 26.3500,
    lng: 103.1000,
    surgeVolume: 85000,
    flowVelocity: 12.5,
    sedimentConcentration: 78,
    status: 'surging',
    description: 'Active debris flow ravine in Yunnan',
  },
  {
    id: 'df-glacier',
    name: 'Glacier Creek Debris',
    lat: 61.1167,
    lng: -146.0833,
    surgeVolume: 42000,
    flowVelocity: 6.8,
    sedimentConcentration: 55,
    status: 'flowing',
    description: 'Glacial debris flow channel',
  },
  {
    id: 'df-stava',
    name: 'Stava Valley',
    lat: 46.3333,
    lng: 11.5000,
    surgeVolume: 28000,
    flowVelocity: 3.2,
    sedimentConcentration: 40,
    status: 'waning',
    description: 'Post-event waning debris flow',
  },
  {
    id: 'df-kawagebo',
    name: 'Kawagebo Fan',
    lat: 28.4333,
    lng: 98.7833,
    surgeVolume: 15000,
    flowVelocity: 0.5,
    sedimentConcentration: 15,
    status: 'deposited',
    description: 'Deposited debris fan monitored',
  },
]

const STATUS_COLORS: Record<DebrisFlowSurgeData['status'], { label: string; color: string; bgClass: string }> = {
  surging: { label: 'Surging', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  flowing: { label: 'Flowing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  waning: { label: 'Waning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  deposited: { label: 'Deposited', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: DebrisFlowSurgeData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function DebrisFlowSurgeMonitor() {
  const state = useMapStore((s) => s.debrisFlowSurge)
  const setState = useMapStore((s) => s.setDebrisFlowSurge)

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
      return { totalFlows: 0, avgSurgeVolume: 0, avgFlowVelocity: 0, surgingCount: 0 }
    }
    const avgSurgeVolume = filteredItems.reduce((sum, e) => sum + e.surgeVolume, 0) / filteredItems.length
    const avgFlowVelocity = filteredItems.reduce((sum, e) => sum + e.flowVelocity, 0) / filteredItems.length
    const surgingCount = filteredItems.filter((e) => e.status === 'surging').length
    return {
      totalFlows: filteredItems.length,
      avgSurgeVolume: Math.round(avgSurgeVolume * 10) / 10,
      avgFlowVelocity: Math.round(avgFlowVelocity * 10) / 10,
      surgingCount,
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
      properties: { id: e.id, name: e.name, status: e.status, surgeVolume: e.surgeVolume },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setDebrisFlowSurge({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DebrisFlowSurgeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSurgeVolume', label: 'Surge Volume', icon: Droplets },
    { key: 'showFlowVelocity', label: 'Flow Velocity', icon: Wind },
    { key: 'showSedimentConcentration', label: 'Sediment Conc.', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-neutral-950/95 backdrop-blur-xl border border-stone-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <WavesIcon19 className="h-4 w-4 text-stone-400" />
              Debris Flow Surge Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-300 hover:text-stone-100 hover:bg-stone-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-stone-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-stone-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as DebrisFlowSurgeState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="surging">Surging</SelectItem>
                <SelectItem value="flowing">Flowing</SelectItem>
                <SelectItem value="waning">Waning</SelectItem>
                <SelectItem value="deposited">Deposited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-200">
                  <Icon className="h-3 w-3 text-stone-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-stone-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Total Flows</div>
              <div className="text-sm font-semibold text-stone-200">{summary.totalFlows}</div>
              <div className="text-[9px] text-stone-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Surge Vol</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgSurgeVolume}</div>
              <div className="text-[9px] text-stone-400/60">m3</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Velocity</div>
              <div className="text-sm font-semibold text-stone-400">{summary.avgFlowVelocity}</div>
              <div className="text-[9px] text-stone-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Surging</div>
              <div className="text-sm font-semibold text-red-400">{summary.surgingCount}</div>
              <div className="text-[9px] text-stone-400/60">flows</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">
              Flows ({filteredItems.length})
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
                          ? 'border-stone-500/50 bg-stone-800/30'
                          : 'border-stone-700/30 hover:border-stone-500/30 hover:bg-stone-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-stone-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300/60">
                        {state.showSurgeVolume && (
                          <div>
                            Surge Vol:{' '}
                            <span className="text-stone-100 font-medium">{e.surgeVolume} m3</span>
                          </div>
                        )}
                        {state.showFlowVelocity && (
                          <div>
                            Flow Vel:{' '}
                            <span className="text-stone-100 font-medium">{e.flowVelocity} m/s</span>
                          </div>
                        )}
                        {state.showSedimentConcentration && (
                          <div>
                            Sediment:{' '}
                            <span className="text-stone-100 font-medium">{e.sedimentConcentration}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-stone-400/50 py-4">
                    No flows match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-stone-600/30 bg-stone-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-stone-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400/70">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Surge Vol: </span>
                    <span className="font-medium text-orange-400">{activeItem.surgeVolume} m3</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Flow Vel: </span>
                    <span className="font-medium text-stone-400">{activeItem.flowVelocity} m/s</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Sediment: </span>
                    <span className="font-medium text-red-400">{activeItem.sedimentConcentration}%</span>
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
