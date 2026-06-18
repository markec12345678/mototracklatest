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
import { useMapStore, type HadleyCellCirculationState, type HadleyCellCirculationData } from '@/lib/map-store'
import { RotateCcw as RotateCcwIcon3, X, RotateCcw, ArrowUpFromLine, Mountain, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: HadleyCellCirculationData[] = [
  {
    id: 'hc-northern',
    name: 'Northern Hadley Cell',
    lat: 10.0000,
    lng: 0.0000,
    circulationStrength: 180,
    updraftVelocity: 2.5,
    outflowHeight: 14,
    status: 'intensified',
    description: 'Intensified northern winter cell',
  },
  {
    id: 'hc-southern',
    name: 'Southern Hadley Cell',
    lat: -15.0000,
    lng: 30.0000,
    circulationStrength: 140,
    updraftVelocity: 1.8,
    outflowHeight: 13,
    status: 'normal',
    description: 'Normal southern hemisphere cell',
  },
  {
    id: 'hc-pacific',
    name: 'Pacific Walker Cell',
    lat: 0.0000,
    lng: 160.0000,
    circulationStrength: 60,
    updraftVelocity: 0.8,
    outflowHeight: 10,
    status: 'weakened',
    description: 'Weakened Walker circulation',
  },
  {
    id: 'hc-expanding',
    name: 'Hadley Cell Edge',
    lat: 35.0000,
    lng: -60.0000,
    circulationStrength: 100,
    updraftVelocity: 0.3,
    outflowHeight: 12,
    status: 'expanding',
    description: 'Poleward-expanding subtropical edge',
  },
]

const STATUS_COLORS: Record<HadleyCellCirculationData['status'], { label: string; color: string; bgClass: string }> = {
  intensified: { label: 'Intensified', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  weakened: { label: 'Weakened', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  expanding: { label: 'Expanding', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: HadleyCellCirculationData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HadleyCellCirculationMonitor() {
  const state = useMapStore((s) => s.hadleyCellCirculation)
  const setState = useMapStore((s) => s.setHadleyCellCirculation)

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
      return { totalPaths: 0, avgCirculationStrength: 0, avgUpdraftVelocity: 0, avgOutflowHeight: 0 }
    }
    const avgCirculationStrength = filteredItems.reduce((sum, e) => sum + e.circulationStrength, 0) / filteredItems.length
    const avgUpdraftVelocity = filteredItems.reduce((sum, e) => sum + e.updraftVelocity, 0) / filteredItems.length
    const avgOutflowHeight = filteredItems.reduce((sum, e) => sum + e.outflowHeight, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgCirculationStrength: Math.round(avgCirculationStrength * 100) / 100,
      avgUpdraftVelocity: Math.round(avgUpdraftVelocity * 100) / 100,
      avgOutflowHeight: Math.round(avgOutflowHeight * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, circulationStrength: e.circulationStrength },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setHadleyCellCirculation({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HadleyCellCirculationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCirculationStrength', label: 'Circulation Strength', icon: RotateCcw },
    { key: 'showUpdraftVelocity', label: 'Updraft Velocity', icon: ArrowUpFromLine },
    { key: 'showOutflowHeight', label: 'Outflow Height', icon: Mountain },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-amber-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <RotateCcwIcon3 className="h-4 w-4 text-orange-400" />
              Hadley Cell Circulation Monitor
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
                setState({ statusFilter: v as HadleyCellCirculationState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intensified">Intensified</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="weakened">Weakened</SelectItem>
                <SelectItem value="expanding">Expanding</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Cells</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Strength</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgCirculationStrength}</div>
              <div className="text-[9px] text-slate-400/60">Sv</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Updraft</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgUpdraftVelocity}</div>
              <div className="text-[9px] text-slate-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Outflow Ht</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgOutflowHeight}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Cells ({filteredItems.length})
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
                        {state.showCirculationStrength && (
                          <div>
                            Strength:{' '}
                            <span className="text-slate-100 font-medium">{e.circulationStrength} Sv</span>
                          </div>
                        )}
                        {state.showUpdraftVelocity && (
                          <div>
                            Updraft:{' '}
                            <span className="text-slate-100 font-medium">{e.updraftVelocity} m/s</span>
                          </div>
                        )}
                        {state.showOutflowHeight && (
                          <div>
                            Outflow Ht:{' '}
                            <span className="text-slate-100 font-medium">{e.outflowHeight} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No cells match the current filter.
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
                    <span className="text-slate-400/70">Strength: </span>
                    <span className="font-medium text-orange-400">{activeItem.circulationStrength} Sv</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Updraft: </span>
                    <span className="font-medium text-amber-400">{activeItem.updraftVelocity} m/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Outflow Ht: </span>
                    <span className="font-medium text-slate-400">{activeItem.outflowHeight} km</span>
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
