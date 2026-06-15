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
import { useMapStore, type IcePenitentMonitorState, type IcePenitentMonitorData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon11, X, Thermometer, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IcePenitentMonitorData[] = [
  {
    id: 'ip-andes',
    name: 'Andes Penitentes',
    lat: -32.65,
    lng: -70.0167,
    spikeHeight: 4.2,
    formationDensity: 18,
    surfaceTemperature: -8,
    status: 'forming',
    description: 'High-altitude nieves penitentes',
  },
  {
    id: 'ip-himalaya',
    name: 'Himalaya Ice Spikes',
    lat: 27.9881,
    lng: 86.925,
    spikeHeight: 3.5,
    formationDensity: 12,
    surfaceTemperature: -15,
    status: 'stable',
    description: 'Everest region penitentes',
  },
  {
    id: 'ip-dryvalleys',
    name: 'Dry Valleys Penitents',
    lat: -77.6167,
    lng: 162.6667,
    spikeHeight: 2.1,
    formationDensity: 8,
    surfaceTemperature: -2,
    status: 'melting',
    description: 'Antarctic ice spike fields',
  },
  {
    id: 'ip-aconcagua',
    name: 'Aconcagua Ice Field',
    lat: -32.6533,
    lng: -70.01,
    spikeHeight: 1.8,
    formationDensity: 5,
    surfaceTemperature: 1,
    status: 'degraded',
    description: 'Penitent degradation zone',
  },
]

const STATUS_COLORS: Record<IcePenitentMonitorData['status'], { label: string; color: string; bgClass: string }> = {
  forming: { label: 'Forming', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  melting: { label: 'Melting', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: IcePenitentMonitorData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IcePenitentMonitor() {
  const state = useMapStore((s) => s.icePenitentMonitor)
  const setState = useMapStore((s) => s.setIcePenitentMonitor)

  const formations = useMemo(
    () => (state.formations.length > 0 ? state.formations : SAMPLE_LOCATIONS),
    [state.formations]
  )

  const filteredItems = useMemo(() => {
    return formations.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [formations, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgSpikeHeight: 0, avgDensity: 0, formingStableCount: 0 }
    }
    const avgSpikeHeight = filteredItems.reduce((sum, e) => sum + e.spikeHeight, 0) / filteredItems.length
    const avgDensity = filteredItems.reduce((sum, e) => sum + e.formationDensity, 0) / filteredItems.length
    const formingStableCount = filteredItems.filter((e) => e.status === 'forming' || e.status === 'stable').length
    return {
      totalSites: filteredItems.length,
      avgSpikeHeight,
      avgDensity,
      formingStableCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => formations.find((e) => e.id === state.activeFormationId) ?? null,
    [formations, state.activeFormationId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, spikeHeight: e.spikeHeight },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.formations.length === 0) {
      useMapStore.getState().setIcePenitentMonitor({ formations: SAMPLE_LOCATIONS })
    }
  }, [state.formations.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IcePenitentMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSpikeHeight', label: 'Spike Height', icon: Layers },
    { key: 'showFormationDensity', label: 'Formation Density', icon: Filter },
    { key: 'showSurfaceTemperature', label: 'Surface Temperature', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-slate-950/95 backdrop-blur-xl border border-sky-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <SnowflakeIcon11 className="h-4 w-4 text-sky-400" />
              Ice Penitent Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-sky-100 hover:bg-sky-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sky-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-sky-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as IcePenitentMonitorState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="forming">Forming</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="melting">Melting</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-200">
                  <Icon className="h-3 w-3 text-sky-400" />
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

          <Separator className="bg-sky-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalSites}</div>
              <div className="text-[9px] text-sky-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Spike Height</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgSpikeHeight.toFixed(1)}</div>
              <div className="text-[9px] text-sky-400/60">m</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Density</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgDensity.toFixed(1)}</div>
              <div className="text-[9px] text-sky-400/60">per/m²</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Forming+Stable</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.formingStableCount}</div>
              <div className="text-[9px] text-sky-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Formation List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">
              Formations ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeFormationId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-800/30'
                          : 'border-sky-700/30 hover:border-sky-500/30 hover:bg-sky-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeFormationId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-sky-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300/60">
                        {state.showSpikeHeight && (
                          <div>
                            Spike Height:{' '}
                            <span className="text-sky-100 font-medium">{e.spikeHeight} m</span>
                          </div>
                        )}
                        {state.showFormationDensity && (
                          <div>
                            Density:{' '}
                            <span className="text-sky-100 font-medium">{e.formationDensity} per/m²</span>
                          </div>
                        )}
                        {state.showSurfaceTemperature && (
                          <div>
                            Surface Temp:{' '}
                            <span className="text-sky-100 font-medium">{e.surfaceTemperature} °C</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-sky-400/50 py-4">
                    No formations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Formation Details */}
          {activeItem && (
            <>
              <Separator className="bg-sky-700/30" />
              <div className="space-y-2 rounded-lg border border-sky-600/30 bg-sky-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-sky-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400/70">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Spike Height: </span>
                    <span className="font-medium text-cyan-400">{activeItem.spikeHeight} m</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Density: </span>
                    <span className="font-medium text-blue-400">{activeItem.formationDensity} per/m²</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Surface Temp: </span>
                    <span className="font-medium text-sky-400">{activeItem.surfaceTemperature} °C</span>
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
