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
import { useMapStore, type ShorelineRetreatState, type ShorelineRetreatData } from '@/lib/map-store'
import { Map as MapIcon3, X, TrendingDown, Mountain, Waves, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: ShorelineRetreatData[] = [
  {
    id: 'sr-norfolk',
    name: 'Norfolk Coast Retreat',
    lat: 52.95,
    lng: 1.65,
    retreatRate: 2.5,
    cliffHeight: 25,
    waveEnergy: 45,
    status: 'rapid',
    description: 'Rapid cliff retreat on North Sea coast',
  },
  {
    id: 'sr-california',
    name: 'California Cliff Erosion',
    lat: 35.45,
    lng: -120.85,
    retreatRate: 0.8,
    cliffHeight: 40,
    waveEnergy: 35,
    status: 'moderate',
    description: 'Moderate retreat along Pacific coast',
  },
  {
    id: 'sr-dorset',
    name: 'Dorset Heritage Coast',
    lat: 50.6,
    lng: -2.4,
    retreatRate: 0.2,
    cliffHeight: 15,
    waveEnergy: 18,
    status: 'slow',
    description: 'Slow retreat on Jurassic coast',
  },
  {
    id: 'sr-istria',
    name: 'Istria Rocky Shore',
    lat: 45.2,
    lng: 13.7,
    retreatRate: -0.3,
    cliffHeight: 8,
    waveEnergy: 8,
    status: 'accreting',
    description: 'Shoreline accreting in sheltered bay',
  },
]

const STATUS_COLORS: Record<ShorelineRetreatData['status'], { label: string; color: string; bgClass: string }> = {
  rapid: { label: 'Rapid', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  slow: { label: 'Slow', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  accreting: { label: 'Accreting', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: ShorelineRetreatData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function ShorelineRetreatMonitor() {
  const state = useMapStore((s) => s.shorelineRetreat)
  const setState = useMapStore((s) => s.setShorelineRetreat)

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
      return { totalPaths: 0, avgRetreatRate: 0, avgCliffHeight: 0, rapidModerateCount: 0 }
    }
    const avgRetreatRate = filteredItems.reduce((sum, e) => sum + e.retreatRate, 0) / filteredItems.length
    const avgCliffHeight = filteredItems.reduce((sum, e) => sum + e.cliffHeight, 0) / filteredItems.length
    const rapidModerateCount = filteredItems.filter((e) => e.status === 'rapid' || e.status === 'moderate').length
    return {
      totalPaths: filteredItems.length,
      avgRetreatRate: Math.round(avgRetreatRate * 10) / 10,
      avgCliffHeight: Math.round(avgCliffHeight * 10) / 10,
      rapidModerateCount,
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
      properties: { id: e.id, name: e.name, status: e.status, retreatRate: e.retreatRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setShorelineRetreat({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ShorelineRetreatState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRetreatRate', label: 'Retreat Rate', icon: TrendingDown },
    { key: 'showCliffHeight', label: 'Cliff Height', icon: Mountain },
    { key: 'showWaveEnergy', label: 'Wave Energy', icon: Waves },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-emerald-950/95 backdrop-blur-xl border border-teal-700/30 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <MapIcon3 className="h-4 w-4 text-teal-400" />
              Shoreline Retreat Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as ShorelineRetreatState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="rapid">Rapid</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="accreting">Accreting</SelectItem>
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
              <div className="text-[10px] text-teal-400/70">Total Shorelines</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Retreat Rate</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgRetreatRate}</div>
              <div className="text-[9px] text-teal-400/60">m/yr</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Cliff Height</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgCliffHeight}</div>
              <div className="text-[9px] text-teal-400/60">m</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Rapid+Moderate</div>
              <div className="text-sm font-semibold text-red-400">{summary.rapidModerateCount}</div>
              <div className="text-[9px] text-teal-400/60">sections</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Shorelines ({filteredItems.length})
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
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-teal-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showRetreatRate && (
                          <div>
                            Retreat:{' '}
                            <span className="text-teal-100 font-medium">{e.retreatRate} m/yr</span>
                          </div>
                        )}
                        {state.showCliffHeight && (
                          <div>
                            Cliff:{' '}
                            <span className="text-teal-100 font-medium">{e.cliffHeight} m</span>
                          </div>
                        )}
                        {state.showWaveEnergy && (
                          <div>
                            Wave Energy:{' '}
                            <span className="text-teal-100 font-medium">{e.waveEnergy} kJ/m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No shorelines match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
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
                    <span className="text-teal-400/70">Retreat Rate: </span>
                    <span className="font-medium text-emerald-400">{activeItem.retreatRate} m/yr</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Cliff Height: </span>
                    <span className="font-medium text-teal-400">{activeItem.cliffHeight} m</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Wave Energy: </span>
                    <span className="font-medium text-red-400">{activeItem.waveEnergy} kJ/m</span>
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
