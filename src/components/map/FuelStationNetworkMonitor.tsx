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
import { useMapStore, type FuelStationNetworkState, type FuelStationNetworkData } from '@/lib/map-store'
import { Fuel as FuelIcon, X, MapPin, DollarSign, Gauge, Zap } from 'lucide-react'

const SAMPLE_LOCATIONS: FuelStationNetworkData[] = [
  {
    id: 'fsn-usinterstate',
    name: 'US Interstate Net',
    lat: 39.000,
    lng: -95.000,
    fuelPrice: 3.45,
    availability: 92,
    stationCount: 4500,
    avgWaitTime: 4,
    status: 'available',
    description: 'US interstate highway fuel network with wide availability and stable pricing',
  },
  {
    id: 'fsn-euautobahn',
    name: 'EU Autobahn',
    lat: 50.000,
    lng: 10.000,
    fuelPrice: 5.82,
    availability: 78,
    stationCount: 2800,
    avgWaitTime: 6,
    status: 'limited',
    description: 'European autobahn network with higher fuel costs and moderate availability',
  },
  {
    id: 'fsn-chinaexpress',
    name: 'China Expressway',
    lat: 34.000,
    lng: 108.000,
    fuelPrice: 4.15,
    availability: 85,
    stationCount: 5200,
    avgWaitTime: 5,
    status: 'available',
    description: 'Chinese expressway fuel stations with growing EV charging infrastructure',
  },
  {
    id: 'fsn-outback',
    name: 'Outback Australia',
    lat: -25.000,
    lng: 133.000,
    fuelPrice: 6.90,
    availability: 45,
    stationCount: 320,
    avgWaitTime: 12,
    status: 'scarce',
    description: 'Remote Australian Outback with limited fuel availability and premium pricing',
  },
]

const STATUS_COLORS: Record<FuelStationNetworkData['status'], { label: string; color: string; bgClass: string }> = {
  available: { label: 'Available', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  limited: { label: 'Limited', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  scarce: { label: 'Scarce', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  shortage: { label: 'Shortage', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: FuelStationNetworkData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function FuelStationNetworkMonitor() {
  const state = useMapStore((s) => s.fuelStationNetwork)
  const setState = useMapStore((s) => s.setFuelStationNetwork)

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
      return { totalStations: 0, avgPrice: 0, avgAvailability: 0, avgEVChargers: 0 }
    }
    const totalStations = filteredItems.reduce((sum, e) => sum + e.stationCount, 0)
    const avgPrice = filteredItems.reduce((sum, e) => sum + e.fuelPrice, 0) / filteredItems.length
    const avgAvailability = filteredItems.reduce((sum, e) => sum + e.availability, 0) / filteredItems.length
    return {
      totalStations: (totalStations / 1000).toFixed(1),
      avgPrice: avgPrice.toFixed(2),
      avgAvailability: Math.round(avgAvailability),
      avgEVChargers: Math.round(totalStations * 0.08),
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
      properties: { id: e.id, name: e.name, status: e.status, fuelPrice: e.fuelPrice },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setFuelStationNetwork({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof FuelStationNetworkState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFuelPrice', label: 'Avg Price', icon: DollarSign },
    { key: 'showAvailability', label: 'Availability %', icon: Gauge },
    { key: 'showStationCount', label: 'Station Count', icon: MapPin },
    { key: 'showAvgWaitTime', label: 'EV Chargers', icon: Zap },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <FuelIcon className="h-4 w-4 text-amber-400" />
              Fuel Station Network
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
              <FuelIcon className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as FuelStationNetworkState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
                <SelectItem value="scarce">Scarce</SelectItem>
                <SelectItem value="shortage">Shortage</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Station Count</div>
              <div className="text-sm font-semibold text-amber-400">{summary.totalStations}k</div>
              <div className="text-[9px] text-slate-400/60">stations</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Price</div>
              <div className="text-sm font-semibold text-yellow-400">${summary.avgPrice}</div>
              <div className="text-[9px] text-slate-400/60">per gallon</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Availability %</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgAvailability}%</div>
              <div className="text-[9px] text-slate-400/60">fuel access</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">EV Chargers</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgEVChargers}</div>
              <div className="text-[9px] text-slate-400/60">estimated</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Fuel Networks ({filteredItems.length})
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
                        {state.showFuelPrice && (
                          <div>
                            Price:{' '}
                            <span className="text-slate-100 font-medium">${e.fuelPrice.toFixed(2)}/gal</span>
                          </div>
                        )}
                        {state.showAvailability && (
                          <div>
                            Availability:{' '}
                            <span className="text-slate-100 font-medium">{e.availability}%</span>
                          </div>
                        )}
                        {state.showStationCount && (
                          <div>
                            Stations:{' '}
                            <span className="text-slate-100 font-medium">{e.stationCount.toLocaleString()}</span>
                          </div>
                        )}
                        {state.showAvgWaitTime && (
                          <div>
                            Wait:{' '}
                            <span className="text-slate-100 font-medium">{e.avgWaitTime} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No networks match the current filter.
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
                  <FuelIcon className="h-3.5 w-3.5 text-slate-400" />
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
                    <span className="text-slate-400/70">Price: </span>
                    <span className="font-medium text-amber-400">${activeItem.fuelPrice.toFixed(2)}/gal</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Availability: </span>
                    <span className="font-medium text-green-400">{activeItem.availability}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Stations: </span>
                    <span className="font-medium text-yellow-400">{activeItem.stationCount.toLocaleString()}</span>
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
