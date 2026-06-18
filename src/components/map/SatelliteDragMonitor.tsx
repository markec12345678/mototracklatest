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
import { useMapStore, type SatelliteDragState, type SatelliteDragData } from '@/lib/map-store'
import { Satellite as SatelliteIcon2, X, ArrowDown, Wind, Mountain, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SatelliteDragData[] = [
  {
    id: 'sd-iss',
    name: 'ISS',
    lat: 0,
    lng: 0,
    orbitalDecay: 2,
    atmosphericDensity: 1e-11,
    altitude: 408,
    status: 'normal',
    description: 'Normal orbital decay rate for the ISS at 408 km',
  },
  {
    id: 'sd-starlink',
    name: 'Starlink Fleet',
    lat: 0,
    lng: 90,
    orbitalDecay: 8,
    atmosphericDensity: 5e-11,
    altitude: 550,
    status: 'elevated',
    description: 'Elevated drag on Starlink satellites from solar activity',
  },
  {
    id: 'sd-hubble',
    name: 'Hubble',
    lat: 0,
    lng: 180,
    orbitalDecay: 15,
    atmosphericDensity: 1e-10,
    altitude: 540,
    status: 'critical',
    description: 'Critical orbital decay rate on Hubble Space Telescope',
  },
  {
    id: 'sd-gps',
    name: 'GPS Constellation',
    lat: 0,
    lng: -90,
    orbitalDecay: 0.01,
    atmosphericDensity: 1e-14,
    altitude: 20200,
    status: 'low',
    description: 'Negligible drag on GPS satellites at MEO altitude',
  },
]

const STATUS_COLORS: Record<SatelliteDragData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  elevated: { label: 'Elevated', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: SatelliteDragData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SatelliteDragMonitor() {
  const state = useMapStore((s) => s.satelliteDrag)
  const setState = useMapStore((s) => s.setSatelliteDrag)

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
      return { totalSats: 0, avgDecay: 0, avgDensity: '0', avgAlt: 0 }
    }
    const avgDecay = (filteredItems.reduce((sum, e) => sum + e.orbitalDecay, 0) / filteredItems.length).toFixed(1)
    const avgDensity = (filteredItems.reduce((sum, e) => sum + Math.log10(e.atmosphericDensity), 0) / filteredItems.length).toFixed(0)
    const avgAlt = Math.round(filteredItems.reduce((sum, e) => sum + e.altitude, 0) / filteredItems.length)
    return { totalSats: filteredItems.length, avgDecay, avgDensity, avgAlt }
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
      properties: { id: e.id, name: e.name, status: e.status, orbitalDecay: e.orbitalDecay },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSatelliteDrag({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SatelliteDragState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOrbitalDecay', label: 'Orbital Decay', icon: ArrowDown },
    { key: 'showAtmosphericDensity', label: 'Atmospheric Density', icon: Wind },
    { key: 'showAltitude', label: 'Altitude', icon: Mountain },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-indigo-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <SatelliteIcon2 className="h-4 w-4 text-sky-400" />
              Satellite Drag Monitor
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
                setState({ statusFilter: v as SatelliteDragState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Satellites</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalSats}</div>
              <div className="text-[9px] text-slate-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Decay</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgDecay}</div>
              <div className="text-[9px] text-slate-400/60">m/day</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Density</div>
              <div className="text-sm font-semibold text-indigo-400">1e{summary.avgDensity}</div>
              <div className="text-[9px] text-slate-400/60">kg/m3</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Alt</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgAlt}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Satellites ({filteredItems.length})
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
                        {state.showOrbitalDecay && (
                          <div>
                            Decay:{' '}
                            <span className="text-slate-100 font-medium">{e.orbitalDecay} m/day</span>
                          </div>
                        )}
                        {state.showAtmosphericDensity && (
                          <div>
                            Density:{' '}
                            <span className="text-slate-100 font-medium">{e.atmosphericDensity.toExponential(0)} kg/m3</span>
                          </div>
                        )}
                        {state.showAltitude && (
                          <div>
                            Altitude:{' '}
                            <span className="text-slate-100 font-medium">{e.altitude} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No satellites match the current filter.
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
                    <span className="text-slate-400/70">Decay: </span>
                    <span className="font-medium text-sky-400">{activeItem.orbitalDecay} m/day</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Density: </span>
                    <span className="font-medium text-indigo-400">{activeItem.atmosphericDensity.toExponential(0)} kg/m3</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Altitude: </span>
                    <span className="font-medium text-slate-200">{activeItem.altitude} km</span>
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
