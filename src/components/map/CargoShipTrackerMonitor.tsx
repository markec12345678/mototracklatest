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
import { useMapStore, type CargoShipTrackerState, type CargoShipTrackerData } from '@/lib/map-store'
import { Container as ContainerIcon2, X, Navigation, Gauge, Clock, Package } from 'lucide-react'

const SAMPLE_LOCATIONS: CargoShipTrackerData[] = [
  {
    id: 'cst-pacific',
    name: 'Pacific Route',
    lat: 30.000,
    lng: -150.000,
    cargoCapacity: 12000,
    currentLoad: 10500,
    speed: 18,
    etaHours: 96,
    status: 'transit',
    description: 'Major Pacific container route with high-volume vessel traffic eastbound',
  },
  {
    id: 'cst-suez',
    name: 'Suez Canal',
    lat: 30.000,
    lng: 32.550,
    cargoCapacity: 8000,
    currentLoad: 7800,
    speed: 8,
    etaHours: 12,
    status: 'transit',
    description: 'Suez Canal convoy transit with regulated speed and convoy schedule',
  },
  {
    id: 'cst-malacca',
    name: 'Malacca Strait',
    lat: 2.500,
    lng: 101.500,
    cargoCapacity: 14000,
    currentLoad: 11200,
    speed: 14,
    etaHours: 24,
    status: 'transit',
    description: 'Strait of Malacca congested shipping lane with traffic separation scheme',
  },
  {
    id: 'cst-atlantic',
    name: 'Atlantic Cross',
    lat: 35.000,
    lng: -40.000,
    cargoCapacity: 10000,
    currentLoad: 6500,
    speed: 20,
    etaHours: 72,
    status: 'transit',
    description: 'Trans-Atlantic route with favorable currents and moderate weather',
  },
]

const STATUS_COLORS: Record<CargoShipTrackerData['status'], { label: string; color: string; bgClass: string }> = {
  docked: { label: 'Docked', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  loading: { label: 'Loading', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  transit: { label: 'In Transit', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  anchored: { label: 'Anchored', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
}

function TrendIcon({ status }: { status: CargoShipTrackerData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CargoShipTrackerMonitor() {
  const state = useMapStore((s) => s.cargoShipTracker)
  const setState = useMapStore((s) => s.setCargoShipTracker)

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
      return { totalVessels: 0, avgSpeed: 0, avgEtaDeviation: 0, totalTEU: 0 }
    }
    const avgSpeed = filteredItems.reduce((sum, e) => sum + e.speed, 0) / filteredItems.length
    const avgEtaDeviation = filteredItems.reduce((sum, e) => sum + e.etaHours, 0) / filteredItems.length
    const totalTEU = filteredItems.reduce((sum, e) => sum + e.currentLoad, 0)
    return {
      totalVessels: filteredItems.length,
      avgSpeed: avgSpeed.toFixed(1),
      avgEtaDeviation: avgEtaDeviation.toFixed(0),
      totalTEU: (totalTEU / 1000).toFixed(1),
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
      properties: { id: e.id, name: e.name, status: e.status, speed: e.speed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCargoShipTracker({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CargoShipTrackerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCargoCapacity', label: 'Cargo Capacity', icon: Package },
    { key: 'showCurrentLoad', label: 'Current Load', icon: ContainerIcon2 },
    { key: 'showSpeed', label: 'Avg Speed', icon: Gauge },
    { key: 'showEtaHours', label: 'ETA Deviation', icon: Clock },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ContainerIcon2 className="h-4 w-4 text-blue-400" />
              Cargo Ship Tracker
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
              <Navigation className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as CargoShipTrackerState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="docked">Docked</SelectItem>
                <SelectItem value="loading">Loading</SelectItem>
                <SelectItem value="transit">In Transit</SelectItem>
                <SelectItem value="anchored">Anchored</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Vessels Tracked</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalVessels}</div>
              <div className="text-[9px] text-slate-400/60">active</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Speed</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgSpeed}</div>
              <div className="text-[9px] text-slate-400/60">knots</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">ETA Deviation</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgEtaDeviation}h</div>
              <div className="text-[9px] text-slate-400/60">avg hours</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Cargo TEU</div>
              <div className="text-sm font-semibold text-sky-400">{summary.totalTEU}k</div>
              <div className="text-[9px] text-slate-400/60">in transit</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Shipping Routes ({filteredItems.length})
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
                        {state.showCargoCapacity && (
                          <div>
                            Capacity:{' '}
                            <span className="text-slate-100 font-medium">{(e.cargoCapacity / 1000).toFixed(0)}k TEU</span>
                          </div>
                        )}
                        {state.showCurrentLoad && (
                          <div>
                            Load:{' '}
                            <span className="text-slate-100 font-medium">{(e.currentLoad / 1000).toFixed(1)}k TEU</span>
                          </div>
                        )}
                        {state.showSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-slate-100 font-medium">{e.speed} kts</span>
                          </div>
                        )}
                        {state.showEtaHours && (
                          <div>
                            ETA:{' '}
                            <span className="text-slate-100 font-medium">{e.etaHours} hrs</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No routes match the current filter.
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
                  <Navigation className="h-3.5 w-3.5 text-slate-400" />
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
                    <span className="text-slate-400/70">Load: </span>
                    <span className="font-medium text-blue-400">{(activeItem.currentLoad / 1000).toFixed(1)}k TEU</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Speed: </span>
                    <span className="font-medium text-indigo-400">{activeItem.speed} kts</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">ETA: </span>
                    <span className="font-medium text-sky-400">{activeItem.etaHours} hrs</span>
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
