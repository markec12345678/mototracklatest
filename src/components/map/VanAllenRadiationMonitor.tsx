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
import { useMapStore, type VanAllenRadiationState, type VanAllenRadiationData } from '@/lib/map-store'
import { Radio as RadioIcon3, X, Zap, CircleDot, ArrowDown, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: VanAllenRadiationData[] = [
  {
    id: 'va-inner',
    name: 'Inner Belt',
    lat: 0,
    lng: 0,
    protonFlux: 1e5,
    electronFlux: 1e6,
    beltAltitude: 3000,
    status: 'normal',
    description: 'Stable inner radiation belt at 3000 km altitude',
  },
  {
    id: 'va-outer',
    name: 'Outer Belt',
    lat: 0,
    lng: 90,
    protonFlux: 1e3,
    electronFlux: 1e8,
    beltAltitude: 20000,
    status: 'enhanced',
    description: 'Enhanced outer belt electron flux from recent injection',
  },
  {
    id: 'va-slot',
    name: 'Slot Region',
    lat: 0,
    lng: 180,
    protonFlux: 1e1,
    electronFlux: 1e2,
    beltAltitude: 8000,
    status: 'depleted',
    description: 'Depleted slot region between inner and outer belts',
  },
  {
    id: 'va-saa',
    name: 'South Atlantic Anomaly',
    lat: -30,
    lng: -45,
    protonFlux: 1e6,
    electronFlux: 1e7,
    beltAltitude: 400,
    status: 'elevated',
    description: 'Elevated radiation in the SAA at low altitude',
  },
]

const STATUS_COLORS: Record<VanAllenRadiationData['status'], { label: string; color: string; bgClass: string }> = {
  enhanced: { label: 'Enhanced', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  elevated: { label: 'Elevated', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  normal: { label: 'Normal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  depleted: { label: 'Depleted', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: VanAllenRadiationData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VanAllenRadiationMonitor() {
  const state = useMapStore((s) => s.vanAllenRadiation)
  const setState = useMapStore((s) => s.setVanAllenRadiation)

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
      return { totalZones: 0, avgProton: '0', avgElectron: '0', avgAlt: 0 }
    }
    const avgAlt = filteredItems.reduce((sum, e) => sum + e.beltAltitude, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgProton: (filteredItems.reduce((sum, e) => sum + Math.log10(e.protonFlux), 0) / filteredItems.length).toFixed(1),
      avgElectron: (filteredItems.reduce((sum, e) => sum + Math.log10(e.electronFlux), 0) / filteredItems.length).toFixed(1),
      avgAlt: Math.round(avgAlt),
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
      properties: { id: e.id, name: e.name, status: e.status, beltAltitude: e.beltAltitude },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setVanAllenRadiation({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VanAllenRadiationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showProtonFlux', label: 'Proton Flux', icon: Zap },
    { key: 'showElectronFlux', label: 'Electron Flux', icon: CircleDot },
    { key: 'showBeltAltitude', label: 'Belt Altitude', icon: ArrowDown },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-red-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <RadioIcon3 className="h-4 w-4 text-violet-400" />
              Van Allen Radiation Monitor
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
                setState({ statusFilter: v as VanAllenRadiationState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="enhanced">Enhanced</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Proton</div>
              <div className="text-sm font-semibold text-violet-400">1e{summary.avgProton}</div>
              <div className="text-[9px] text-slate-400/60">/cm2/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Electron</div>
              <div className="text-sm font-semibold text-red-400">1e{summary.avgElectron}</div>
              <div className="text-[9px] text-slate-400/60">/cm2/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Altitude</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgAlt}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Radiation Zones ({filteredItems.length})
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
                        {state.showProtonFlux && (
                          <div>
                            Protons:{' '}
                            <span className="text-slate-100 font-medium">{e.protonFlux.toExponential(0)}/cm2/s</span>
                          </div>
                        )}
                        {state.showElectronFlux && (
                          <div>
                            Electrons:{' '}
                            <span className="text-slate-100 font-medium">{e.electronFlux.toExponential(0)}/cm2/s</span>
                          </div>
                        )}
                        {state.showBeltAltitude && (
                          <div>
                            Altitude:{' '}
                            <span className="text-slate-100 font-medium">{e.beltAltitude} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No zones match the current filter.
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
                    <span className="text-slate-400/70">Proton Flux: </span>
                    <span className="font-medium text-violet-400">{activeItem.protonFlux.toExponential(0)}/cm2/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Electron Flux: </span>
                    <span className="font-medium text-red-400">{activeItem.electronFlux.toExponential(0)}/cm2/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Altitude: </span>
                    <span className="font-medium text-slate-200">{activeItem.beltAltitude} km</span>
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
