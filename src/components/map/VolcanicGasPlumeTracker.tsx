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
import { useMapStore, type VolcanicGasPlumeState, type VolcanicGasPlumeData } from '@/lib/map-store'
import { CloudCog as CloudCogIcon2, X, Wind, ArrowUp, FlaskConical, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: VolcanicGasPlumeData[] = [
  {
    id: 'vg-holuhraun',
    name: 'Holuhraun Emission',
    lat: 64.9,
    lng: -16.8,
    so2Concentration: 35000,
    plumeHeight: 3000,
    gasType: 'SO2-dominant',
    status: 'emitting',
    description: 'Major SO2 emission from Icelandic eruption',
  },
  {
    id: 'vg-kilauea',
    name: 'Kīlauea Summit Plume',
    lat: 19.41,
    lng: -155.29,
    so2Concentration: 8000,
    plumeHeight: 1500,
    gasType: 'SO2/HCl',
    status: 'elevated',
    description: 'Elevated gas emission at Halemaʻumaʻu',
  },
  {
    id: 'vg-erta-ale',
    name: 'Erta Ale Plume',
    lat: 13.6,
    lng: 40.7,
    so2Concentration: 5000,
    plumeHeight: 800,
    gasType: 'SO2/CO2',
    status: 'declining',
    description: 'Declining emission from persistent lava lake',
  },
  {
    id: 'vg-eyjafjallajokull',
    name: 'Eyjafjallajökull Plume',
    lat: 63.6,
    lng: -19.6,
    so2Concentration: 200,
    plumeHeight: 200,
    gasType: 'Minor',
    status: 'quiet',
    description: 'Dormant plume since 2010 eruption',
  },
]

const STATUS_COLORS: Record<VolcanicGasPlumeData['status'], { label: string; color: string; bgClass: string }> = {
  emitting: { label: 'Emitting', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  elevated: { label: 'Elevated', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  declining: { label: 'Declining', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  quiet: { label: 'Quiet', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: VolcanicGasPlumeData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VolcanicGasPlumeTracker() {
  const state = useMapStore((s) => s.volcanicGasPlume)
  const setState = useMapStore((s) => s.setVolcanicGasPlume)

  const plumes = useMemo(
    () => (state.plumes.length > 0 ? state.plumes : SAMPLE_LOCATIONS),
    [state.plumes]
  )

  const filteredItems = useMemo(() => {
    return plumes.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [plumes, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalPlumes: 0, avgSO2: 0, avgPlumeHeight: 0, activeCount: 0 }
    }
    const avgSO2 = filteredItems.reduce((sum, s) => sum + s.so2Concentration, 0) / filteredItems.length
    const avgPlumeHeight = filteredItems.reduce((sum, s) => sum + s.plumeHeight, 0) / filteredItems.length
    const activeCount = filteredItems.filter((s) => s.status === 'emitting' || s.status === 'elevated').length
    return {
      totalPlumes: filteredItems.length,
      avgSO2: Math.round(avgSO2),
      avgPlumeHeight: Math.round(avgPlumeHeight),
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => plumes.find((s) => s.id === state.activePlumeId) ?? null,
    [plumes, state.activePlumeId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, so2Concentration: s.so2Concentration },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.plumes.length === 0) {
      useMapStore.getState().setVolcanicGasPlume({ plumes: SAMPLE_LOCATIONS })
    }
  }, [state.plumes.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicGasPlumeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSO2', label: 'SO2 Concentration', icon: Wind },
    { key: 'showPlumeHeight', label: 'Plume Height', icon: ArrowUp },
    { key: 'showGasType', label: 'Gas Type', icon: FlaskConical },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-950/95 to-violet-950/95 backdrop-blur-xl border border-purple-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-100">
              <CloudCogIcon2 className="h-4 w-4 text-purple-400" />
              Volcanic Gas Plume Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-purple-300 hover:text-purple-100 hover:bg-purple-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-purple-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-purple-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as VolcanicGasPlumeState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-purple-900/40 border-purple-700/40 text-purple-100 hover:bg-purple-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="emitting">Emitting</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="quiet">Quiet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-purple-200">
                  <Icon className="h-3 w-3 text-purple-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-purple-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Total Plumes</div>
              <div className="text-sm font-semibold text-purple-200">{summary.totalPlumes}</div>
              <div className="text-[9px] text-purple-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Avg SO2</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgSO2.toLocaleString()}</div>
              <div className="text-[9px] text-purple-400/60">t/day</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Avg Plume Height</div>
              <div className="text-sm font-semibold text-fuchsia-400">{summary.avgPlumeHeight.toLocaleString()}</div>
              <div className="text-[9px] text-purple-400/60">m</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Active Count</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeCount}</div>
              <div className="text-[9px] text-purple-400/60">plumes</div>
            </div>
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Plume List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300/80">
              Gas Plumes ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activePlumeId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-purple-500/50 bg-purple-800/30'
                          : 'border-purple-700/30 hover:border-purple-500/30 hover:bg-purple-800/20'
                      }`}
                      onClick={() =>
                        setState({ activePlumeId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-purple-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-purple-300/60">
                        {state.showSO2 && (
                          <div>
                            SO2:{' '}
                            <span className="text-purple-100 font-medium">{s.so2Concentration.toLocaleString()} t/day</span>
                          </div>
                        )}
                        {state.showPlumeHeight && (
                          <div>
                            Height:{' '}
                            <span className="text-purple-100 font-medium">{s.plumeHeight.toLocaleString()}m</span>
                          </div>
                        )}
                        {state.showGasType && (
                          <div>
                            Gas Type:{' '}
                            <span className="text-purple-100 font-medium">{s.gasType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-purple-400/50 py-4">
                    No plumes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Plume Details */}
          {activeItem && (
            <>
              <Separator className="bg-purple-700/30" />
              <div className="space-y-2 rounded-lg border border-purple-600/30 bg-purple-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-purple-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-purple-400/70">Coordinates: </span>
                    <span className="font-medium text-purple-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">SO2: </span>
                    <span className="font-medium text-violet-400">{activeItem.so2Concentration.toLocaleString()} t/day</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Plume Height: </span>
                    <span className="font-medium text-fuchsia-400">{activeItem.plumeHeight.toLocaleString()}m</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Gas Type: </span>
                    <span className="font-medium text-indigo-400">{activeItem.gasType}</span>
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
