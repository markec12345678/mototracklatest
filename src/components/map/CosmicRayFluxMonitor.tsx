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
import { useMapStore, type CosmicRayFluxState, type CosmicRayFluxData } from '@/lib/map-store'
import { Zap as ZapIcon4, X, Activity, Atom, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CosmicRayFluxData[] = [
  {
    id: 'cr-oulu',
    name: 'Oulu Station',
    lat: 65,
    lng: 25.5,
    neutronCount: 6500,
    muonFlux: 8000,
    solarModulation: 0.8,
    status: 'normal',
    description: 'Normal cosmic ray flux at Oulu neutron monitor',
  },
  {
    id: 'cr-mcmurdo',
    name: 'McMurdo Station',
    lat: -77.8,
    lng: 166.7,
    neutronCount: 300,
    muonFlux: 100,
    solarModulation: 1.2,
    status: 'depressed',
    description: 'Depressed cosmic ray flux during solar maximum',
  },
  {
    id: 'cr-thule',
    name: 'Thule Air Base',
    lat: 76.5,
    lng: -68.8,
    neutronCount: 7200,
    muonFlux: 7500,
    solarModulation: 0.5,
    status: 'forbush_decrease',
    description: 'Forbush decrease detected following CME shock',
  },
  {
    id: 'cr-lomnicki',
    name: 'Lomnicky Stit',
    lat: 49.2,
    lng: 20.2,
    neutronCount: 2000,
    muonFlux: 12000,
    solarModulation: 0.9,
    status: 'ground_level',
    description: 'Ground-level enhancement from solar proton event',
  },
]

const STATUS_COLORS: Record<CosmicRayFluxData['status'], { label: string; color: string; bgClass: string }> = {
  forbush_decrease: { label: 'Forbush Decrease', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  depressed: { label: 'Depressed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  ground_level: { label: 'Ground Level', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: CosmicRayFluxData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CosmicRayFluxMonitor() {
  const state = useMapStore((s) => s.cosmicRayFlux)
  const setState = useMapStore((s) => s.setCosmicRayFlux)

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
      return { totalStations: 0, avgNeutron: 0, avgMuon: 0, avgMod: 0 }
    }
    const avgNeutron = Math.round(filteredItems.reduce((sum, e) => sum + e.neutronCount, 0) / filteredItems.length)
    const avgMuon = Math.round(filteredItems.reduce((sum, e) => sum + e.muonFlux, 0) / filteredItems.length)
    const avgMod = (filteredItems.reduce((sum, e) => sum + e.solarModulation, 0) / filteredItems.length).toFixed(1)
    return { totalStations: filteredItems.length, avgNeutron, avgMuon, avgMod }
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
      properties: { id: e.id, name: e.name, status: e.status, neutronCount: e.neutronCount },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCosmicRayFlux({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CosmicRayFluxState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showNeutronCount', label: 'Neutron Count', icon: Activity },
    { key: 'showMuonFlux', label: 'Muon Flux', icon: Atom },
    { key: 'showSolarModulation', label: 'Solar Modulation', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-violet-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ZapIcon4 className="h-4 w-4 text-indigo-400" />
              Cosmic Ray Flux Monitor
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
                setState({ statusFilter: v as CosmicRayFluxState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="forbush_decrease">Forbush Decrease</SelectItem>
                <SelectItem value="depressed">Depressed</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="ground_level">Ground Level</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-indigo-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Stations</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalStations}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Neutron</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgNeutron}</div>
              <div className="text-[9px] text-slate-400/60">counts/min</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Muon</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgMuon}</div>
              <div className="text-[9px] text-slate-400/60">counts/min</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Mod</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgMod}</div>
              <div className="text-[9px] text-slate-400/60">GV</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Cosmic Ray Stations ({filteredItems.length})
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
                        {state.showNeutronCount && (
                          <div>
                            Neutrons:{' '}
                            <span className="text-slate-100 font-medium">{e.neutronCount}/min</span>
                          </div>
                        )}
                        {state.showMuonFlux && (
                          <div>
                            Muons:{' '}
                            <span className="text-slate-100 font-medium">{e.muonFlux}/min</span>
                          </div>
                        )}
                        {state.showSolarModulation && (
                          <div>
                            Modulation:{' '}
                            <span className="text-slate-100 font-medium">{e.solarModulation} GV</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No stations match the current filter.
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
                    <span className="text-slate-400/70">Neutrons: </span>
                    <span className="font-medium text-indigo-400">{activeItem.neutronCount}/min</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Muons: </span>
                    <span className="font-medium text-violet-400">{activeItem.muonFlux}/min</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Modulation: </span>
                    <span className="font-medium text-slate-200">{activeItem.solarModulation} GV</span>
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
