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
import { useMapStore, type PumiceRaftDriftState, type PumiceRaftDriftData } from '@/lib/map-store'
import { Ship as ShipIcon4, X, Wind, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: PumiceRaftDriftData[] = [
  {
    id: 'pr-tonga',
    name: 'Tonga Pumice Raft',
    lat: -21.1833,
    lng: -175.3833,
    raftArea: 250,
    driftSpeed: 3.2,
    pumiceDensity: 450,
    status: 'drifting',
    description: 'Hunga Tonga eruption raft',
  },
  {
    id: 'pr-havre',
    name: 'Havre Pumice Raft',
    lat: -31.1167,
    lng: -178.9167,
    raftArea: 180,
    driftSpeed: 1.8,
    pumiceDensity: 520,
    status: 'dispersing',
    description: '2012 submarine eruption',
  },
  {
    id: 'pr-fiji',
    name: 'Fiji Pumice Beach',
    lat: -17.7134,
    lng: 178.065,
    raftArea: 45,
    driftSpeed: 0.5,
    pumiceDensity: 680,
    status: 'beaching',
    description: 'Pumice washing ashore',
  },
  {
    id: 'pr-kermadec',
    name: 'Kermadec Pumice',
    lat: -29.2667,
    lng: -177.9167,
    raftArea: 30,
    driftSpeed: 0.2,
    pumiceDensity: 850,
    status: 'sinking',
    description: 'Waterlogged pumice sinking',
  },
]

const STATUS_COLORS: Record<PumiceRaftDriftData['status'], { label: string; color: string; bgClass: string }> = {
  drifting: { label: 'Drifting', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  dispersing: { label: 'Dispersing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  beaching: { label: 'Beaching', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  sinking: { label: 'Sinking', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: PumiceRaftDriftData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PumiceRaftDriftTracker() {
  const state = useMapStore((s) => s.pumiceRaftDrift)
  const setState = useMapStore((s) => s.setPumiceRaftDrift)

  const rafts = useMemo(
    () => (state.rafts.length > 0 ? state.rafts : SAMPLE_LOCATIONS),
    [state.rafts]
  )

  const filteredItems = useMemo(() => {
    return rafts.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [rafts, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalRafts: 0, totalArea: 0, avgDriftSpeed: 0, driftingDispersingCount: 0 }
    }
    const totalArea = filteredItems.reduce((sum, e) => sum + e.raftArea, 0)
    const avgDriftSpeed = filteredItems.reduce((sum, e) => sum + e.driftSpeed, 0) / filteredItems.length
    const driftingDispersingCount = filteredItems.filter((e) => e.status === 'drifting' || e.status === 'dispersing').length
    return {
      totalRafts: filteredItems.length,
      totalArea,
      avgDriftSpeed,
      driftingDispersingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => rafts.find((e) => e.id === state.activeRaftId) ?? null,
    [rafts, state.activeRaftId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, raftArea: e.raftArea },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.rafts.length === 0) {
      useMapStore.getState().setPumiceRaftDrift({ rafts: SAMPLE_LOCATIONS })
    }
  }, [state.rafts.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PumiceRaftDriftState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRaftArea', label: 'Raft Area', icon: Layers },
    { key: 'showDriftSpeed', label: 'Drift Speed', icon: Wind },
    { key: 'showPumiceDensity', label: 'Pumice Density', icon: Filter },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-amber-950/95 backdrop-blur-xl border border-stone-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <ShipIcon4 className="h-4 w-4 text-amber-400" />
              Pumice Raft Drift
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
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as PumiceRaftDriftState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="drifting">Drifting</SelectItem>
                <SelectItem value="dispersing">Dispersing</SelectItem>
                <SelectItem value="beaching">Beaching</SelectItem>
                <SelectItem value="sinking">Sinking</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Total Rafts</div>
              <div className="text-sm font-semibold text-stone-200">{summary.totalRafts}</div>
              <div className="text-[9px] text-stone-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Total Area</div>
              <div className="text-sm font-semibold text-amber-400">{summary.totalArea.toLocaleString()}</div>
              <div className="text-[9px] text-stone-400/60">km²</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Drift Speed</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgDriftSpeed.toFixed(1)}</div>
              <div className="text-[9px] text-stone-400/60">km/h</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Drifting+Dispersing</div>
              <div className="text-sm font-semibold text-amber-400">{summary.driftingDispersingCount}</div>
              <div className="text-[9px] text-stone-400/60">rafts</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Raft List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">
              Rafts ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeRaftId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-stone-700/30 hover:border-amber-500/30 hover:bg-stone-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeRaftId: isActive ? null : e.id })
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
                        {state.showRaftArea && (
                          <div>
                            Area:{' '}
                            <span className="text-stone-100 font-medium">{e.raftArea.toLocaleString()} km²</span>
                          </div>
                        )}
                        {state.showDriftSpeed && (
                          <div>
                            Drift Speed:{' '}
                            <span className="text-stone-100 font-medium">{e.driftSpeed} km/h</span>
                          </div>
                        )}
                        {state.showPumiceDensity && (
                          <div>
                            Density:{' '}
                            <span className="text-stone-100 font-medium">{e.pumiceDensity} kg/m³</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-stone-400/50 py-4">
                    No rafts match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Raft Details */}
          {activeItem && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
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
                    <span className="text-stone-400/70">Raft Area: </span>
                    <span className="font-medium text-amber-400">{activeItem.raftArea.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Drift Speed: </span>
                    <span className="font-medium text-blue-400">{activeItem.driftSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Density: </span>
                    <span className="font-medium text-amber-400">{activeItem.pumiceDensity} kg/m³</span>
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
