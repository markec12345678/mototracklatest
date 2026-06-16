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
import { useMapStore, type MagnetopauseStandoffState, type MagnetopauseStandoffData } from '@/lib/map-store'
import { Shield as ShieldIcon4, X, ArrowDown, Wind, Magnet, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MagnetopauseStandoffData[] = [
  {
    id: 'ms-dayside',
    name: 'Dayside Magnetopause',
    lat: 0,
    lng: 0,
    standoffDistance: 8,
    solarWindPressure: 3,
    magneticFieldBz: -5,
    status: 'normal',
    description: 'Typical dayside magnetopause under quiet solar wind conditions',
  },
  {
    id: 'ms-storm',
    name: 'Storm Compression',
    lat: 0,
    lng: 90,
    standoffDistance: 5.5,
    solarWindPressure: 15,
    magneticFieldBz: -25,
    status: 'compressed',
    description: 'Compressed magnetopause during geomagnetic storm',
  },
  {
    id: 'ms-cme',
    name: 'CME Impact Zone',
    lat: 0,
    lng: 180,
    standoffDistance: 4.2,
    solarWindPressure: 28,
    magneticFieldBz: -40,
    status: 'eroded',
    description: 'Severely eroded magnetopause during CME arrival',
  },
  {
    id: 'ms-quiet',
    name: 'Quiet Expansion',
    lat: 0,
    lng: -90,
    standoffDistance: 11,
    solarWindPressure: 1.5,
    magneticFieldBz: 2,
    status: 'expanded',
    description: 'Expanded magnetopause under low solar wind pressure',
  },
]

const STATUS_COLORS: Record<MagnetopauseStandoffData['status'], { label: string; color: string; bgClass: string }> = {
  compressed: { label: 'Compressed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  normal: { label: 'Normal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  expanded: { label: 'Expanded', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  eroded: { label: 'Eroded', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
}

function TrendIcon({ status }: { status: MagnetopauseStandoffData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MagnetopauseStandoffMonitor() {
  const state = useMapStore((s) => s.magnetopauseStandoff)
  const setState = useMapStore((s) => s.setMagnetopauseStandoff)

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
      return { totalZones: 0, avgDistance: 0, avgPressure: 0, avgBz: 0 }
    }
    const avgDistance = filteredItems.reduce((sum, e) => sum + e.standoffDistance, 0) / filteredItems.length
    const avgPressure = filteredItems.reduce((sum, e) => sum + e.solarWindPressure, 0) / filteredItems.length
    const avgBz = filteredItems.reduce((sum, e) => sum + e.magneticFieldBz, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgDistance: avgDistance.toFixed(1),
      avgPressure: avgPressure.toFixed(1),
      avgBz: avgBz.toFixed(1),
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
      properties: { id: e.id, name: e.name, status: e.status, standoffDistance: e.standoffDistance },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setMagnetopauseStandoff({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MagnetopauseStandoffState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showStandoffDistance', label: 'Standoff Distance', icon: ArrowDown },
    { key: 'showSolarWindPressure', label: 'Solar Wind Pressure', icon: Wind },
    { key: 'showMagneticFieldBz', label: 'Magnetic Field Bz', icon: Magnet },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-purple-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ShieldIcon4 className="h-4 w-4 text-purple-400" />
              Magnetopause Standoff Monitor
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
                setState({ statusFilter: v as MagnetopauseStandoffState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="compressed">Compressed</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="expanded">Expanded</SelectItem>
                <SelectItem value="eroded">Eroded</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-purple-600"
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
              <div className="text-[10px] text-slate-400/70">Avg Distance</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgDistance}</div>
              <div className="text-[9px] text-slate-400/60">Re</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Pressure</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgPressure}</div>
              <div className="text-[9px] text-slate-400/60">nPa</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Bz</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgBz}</div>
              <div className="text-[9px] text-slate-400/60">nT</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Magnetopause Zones ({filteredItems.length})
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
                        {state.showStandoffDistance && (
                          <div>
                            Distance:{' '}
                            <span className="text-slate-100 font-medium">{e.standoffDistance} Re</span>
                          </div>
                        )}
                        {state.showSolarWindPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-slate-100 font-medium">{e.solarWindPressure} nPa</span>
                          </div>
                        )}
                        {state.showMagneticFieldBz && (
                          <div>
                            Bz:{' '}
                            <span className="text-slate-100 font-medium">{e.magneticFieldBz} nT</span>
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
                    <span className="text-slate-400/70">Distance: </span>
                    <span className="font-medium text-purple-400">{activeItem.standoffDistance} Re</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Pressure: </span>
                    <span className="font-medium text-slate-200">{activeItem.solarWindPressure} nPa</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Bz: </span>
                    <span className="font-medium text-slate-400">{activeItem.magneticFieldBz} nT</span>
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
