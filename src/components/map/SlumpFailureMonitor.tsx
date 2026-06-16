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
import { useMapStore, type SlumpFailureState, type SlumpFailureData } from '@/lib/map-store'
import { AlertTriangle as AlertTriangleIcon3, X, Mountain, RotateCcw, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SlumpFailureData[] = [
  {
    id: 'sf-rotorua',
    name: 'Rotorua Rotational Slide',
    lat: -38.1367,
    lng: 176.2497,
    scarpHeight: 12,
    rotationAngle: 35,
    porePressure: 85,
    status: 'failing',
    description: 'Active rotational failure in New Zealand',
  },
  {
    id: 'sf-london',
    name: 'London Clay Scarp',
    lat: 51.5000,
    lng: -0.1000,
    scarpHeight: 6,
    rotationAngle: 18,
    porePressure: 62,
    status: 'creeping',
    description: 'Creeping rotational slump in London clay',
  },
  {
    id: 'sf-kansas',
    name: 'Kansas River Bluff',
    lat: 39.1000,
    lng: -94.6000,
    scarpHeight: 3,
    rotationAngle: 8,
    porePressure: 45,
    status: 'remodeling',
    description: 'Remodeling slump along river bluff',
  },
  {
    id: 'sf-bavaria',
    name: 'Bavarian Hillside',
    lat: 47.8000,
    lng: 12.0000,
    scarpHeight: 1,
    rotationAngle: 2,
    porePressure: 20,
    status: 'stabilized',
    description: 'Stabilized slump in Bavarian alpine foreland',
  },
]

const STATUS_COLORS: Record<SlumpFailureData['status'], { label: string; color: string; bgClass: string }> = {
  failing: { label: 'Failing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  creeping: { label: 'Creeping', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  remodeling: { label: 'Remodeling', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stabilized: { label: 'Stabilized', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: SlumpFailureData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SlumpFailureMonitor() {
  const state = useMapStore((s) => s.slumpFailure)
  const setState = useMapStore((s) => s.setSlumpFailure)

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
      return { totalSlumps: 0, avgScarpHeight: 0, avgPorePressure: 0, failingCount: 0 }
    }
    const avgScarpHeight = filteredItems.reduce((sum, e) => sum + e.scarpHeight, 0) / filteredItems.length
    const avgPorePressure = filteredItems.reduce((sum, e) => sum + e.porePressure, 0) / filteredItems.length
    const failingCount = filteredItems.filter((e) => e.status === 'failing').length
    return {
      totalSlumps: filteredItems.length,
      avgScarpHeight: Math.round(avgScarpHeight * 10) / 10,
      avgPorePressure: Math.round(avgPorePressure * 10) / 10,
      failingCount,
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
      properties: { id: e.id, name: e.name, status: e.status, scarpHeight: e.scarpHeight },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSlumpFailure({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SlumpFailureState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showScarpHeight', label: 'Scarp Height', icon: Mountain },
    { key: 'showRotationAngle', label: 'Rotation Angle', icon: RotateCcw },
    { key: 'showPorePressure', label: 'Pore Pressure', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-rose-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <AlertTriangleIcon3 className="h-4 w-4 text-red-400" />
              Slump Failure Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as SlumpFailureState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="failing">Failing</SelectItem>
                <SelectItem value="creeping">Creeping</SelectItem>
                <SelectItem value="remodeling">Remodeling</SelectItem>
                <SelectItem value="stabilized">Stabilized</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Slumps</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalSlumps}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Scarp Ht</div>
              <div className="text-sm font-semibold text-rose-400">{summary.avgScarpHeight}</div>
              <div className="text-[9px] text-red-400/60">m</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Pore Pr.</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgPorePressure}</div>
              <div className="text-[9px] text-red-400/60">kPa</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Failing</div>
              <div className="text-sm font-semibold text-red-400">{summary.failingCount}</div>
              <div className="text-[9px] text-red-400/60">slumps</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Slumps ({filteredItems.length})
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
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-red-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showScarpHeight && (
                          <div>
                            Scarp:{' '}
                            <span className="text-red-100 font-medium">{e.scarpHeight} m</span>
                          </div>
                        )}
                        {state.showRotationAngle && (
                          <div>
                            Rotation:{' '}
                            <span className="text-red-100 font-medium">{e.rotationAngle}°</span>
                          </div>
                        )}
                        {state.showPorePressure && (
                          <div>
                            Pore Pr.:{' '}
                            <span className="text-red-100 font-medium">{e.porePressure} kPa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No slumps match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Scarp Ht: </span>
                    <span className="font-medium text-rose-400">{activeItem.scarpHeight} m</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Rotation: </span>
                    <span className="font-medium text-red-400">{activeItem.rotationAngle}°</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Pore Pr.: </span>
                    <span className="font-medium text-orange-400">{activeItem.porePressure} kPa</span>
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
