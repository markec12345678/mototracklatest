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
import { useMapStore, type MethaneCraterState, type MethaneCraterData } from '@/lib/map-store'
import { Flame as FlameIcon15, X, Circle, Ruler, Wind, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MethaneCraterData[] = [
  {
    id: 'mc-yamal',
    name: 'Yamal Crater',
    lat: 70.5,
    lng: 68.0,
    diameter: 60,
    depth: 52,
    methaneConcentration: 9500,
    status: 'growing',
    description: 'Rapidly expanding permafrost methane crater in Siberia',
  },
  {
    id: 'mc-bovanenkovo',
    name: 'Bovanenkovo Crater',
    lat: 71.2,
    lng: 70.5,
    diameter: 40,
    depth: 35,
    methaneConcentration: 6200,
    status: 'stable',
    description: 'Stabilized methane eruption crater on Yamal Peninsula',
  },
  {
    id: 'mc-antipayuta',
    name: 'Antipayuta Vent',
    lat: 69.0,
    lng: 72.0,
    diameter: 25,
    depth: 20,
    methaneConcentration: 15000,
    status: 'erupting',
    description: 'Active methane eruption with high gas concentration',
  },
  {
    id: 'mc-nunavut',
    name: 'Nunavut Pingo',
    lat: 69.5,
    lng: -95.0,
    diameter: 15,
    depth: 10,
    methaneConcentration: 3500,
    status: 'dormant',
    description: 'Dormant pingo-like feature in Canadian Arctic',
  },
]

const STATUS_COLORS: Record<MethaneCraterData['status'], { label: string; color: string; bgClass: string }> = {
  growing: { label: 'Growing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  erupting: { label: 'Erupting', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  dormant: { label: 'Dormant', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: MethaneCraterData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MethaneCraterMonitor() {
  const state = useMapStore((s) => s.methaneCrater)
  const setState = useMapStore((s) => s.setMethaneCrater)

  const craters = useMemo(
    () => (state.craters.length > 0 ? state.craters : SAMPLE_LOCATIONS),
    [state.craters]
  )

  const filteredItems = useMemo(() => {
    return craters.filter((c) => {
      if (state.statusFilter !== 'all' && c.status !== state.statusFilter) return false
      return true
    })
  }, [craters, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalCraters: 0, avgDiameter: 0, maxCH4: 0, eruptingCount: 0 }
    }
    const avgDiameter = filteredItems.reduce((sum, c) => sum + c.diameter, 0) / filteredItems.length
    const maxCH4 = Math.max(...filteredItems.map((c) => c.methaneConcentration))
    const eruptingCount = filteredItems.filter((c) => c.status === 'erupting').length
    return {
      totalCraters: filteredItems.length,
      avgDiameter: Math.round(avgDiameter),
      maxCH4,
      eruptingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => craters.find((c) => c.id === state.activeCraterId) ?? null,
    [craters, state.activeCraterId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { id: c.id, name: c.name, status: c.status, diameter: c.diameter },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.craters.length === 0) {
      useMapStore.getState().setMethaneCrater({ craters: SAMPLE_LOCATIONS })
    }
  }, [state.craters.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MethaneCraterState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDiameter', label: 'Diameter', icon: Circle },
    { key: 'showDepth', label: 'Depth', icon: Ruler },
    { key: 'showMethaneConcentration', label: 'CH4 Concentration', icon: Wind },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-lime-950/95 to-amber-950/95 backdrop-blur-xl border border-lime-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-lime-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-lime-100">
              <FlameIcon15 className="h-4 w-4 text-lime-400" />
              Methane Crater Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-lime-300 hover:text-lime-100 hover:bg-lime-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-lime-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-lime-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as MethaneCraterState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-lime-900/40 border-lime-700/40 text-lime-100 hover:bg-lime-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="growing">Growing</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="erupting">Erupting</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-lime-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lime-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-lime-200">
                  <Icon className="h-3 w-3 text-lime-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-lime-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-lime-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Total Craters</div>
              <div className="text-sm font-semibold text-lime-200">{summary.totalCraters}</div>
              <div className="text-[9px] text-lime-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Avg Diameter</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgDiameter}</div>
              <div className="text-[9px] text-lime-400/60">m</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Max CH4</div>
              <div className="text-sm font-semibold text-red-400">{summary.maxCH4.toLocaleString()}</div>
              <div className="text-[9px] text-lime-400/60">ppm</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Erupting Count</div>
              <div className="text-sm font-semibold text-red-400">{summary.eruptingCount}</div>
              <div className="text-[9px] text-lime-400/60">craters</div>
            </div>
          </div>

          <Separator className="bg-lime-700/30" />

          {/* Crater List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lime-300/80">
              Craters ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((c) => {
                  const isActive = state.activeCraterId === c.id
                  const statusCfg = STATUS_COLORS[c.status]
                  return (
                    <div
                      key={c.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-lime-500/50 bg-lime-800/30'
                          : 'border-lime-700/30 hover:border-lime-500/30 hover:bg-lime-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeCraterId: isActive ? null : c.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={c.status} />
                          <span className="text-xs font-medium text-lime-100">{c.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-lime-300/60">
                        {state.showDiameter && (
                          <div>
                            Diameter:{' '}
                            <span className="text-lime-100 font-medium">{c.diameter}m</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-lime-100 font-medium">{c.depth}m</span>
                          </div>
                        )}
                        {state.showMethaneConcentration && (
                          <div>
                            CH4:{' '}
                            <span className="text-lime-100 font-medium">{c.methaneConcentration.toLocaleString()} ppm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-lime-400/50 py-4">
                    No craters match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Crater Details */}
          {activeItem && (
            <>
              <Separator className="bg-lime-700/30" />
              <div className="space-y-2 rounded-lg border border-lime-600/30 bg-lime-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-lime-400" />
                  <span className="text-xs font-semibold text-lime-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-lime-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-lime-400/70">Coordinates: </span>
                    <span className="font-medium text-lime-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-lime-400/70">Diameter: </span>
                    <span className="font-medium text-amber-400">{activeItem.diameter}m</span>
                  </div>
                  <div>
                    <span className="text-lime-400/70">Depth: </span>
                    <span className="font-medium text-green-400">{activeItem.depth}m</span>
                  </div>
                  <div>
                    <span className="text-lime-400/70">CH4: </span>
                    <span className="font-medium text-red-400">{activeItem.methaneConcentration.toLocaleString()} ppm</span>
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
