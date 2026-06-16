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
import { useMapStore, type SmartParkingCapacityState, type SmartParkingCapacityData } from '@/lib/map-store'
import { ParkingCircle as ParkingIcon, X, Car, Timer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SmartParkingCapacityData[] = [
  {
    id: 'sp-sf',
    name: 'San Francisco',
    lat: 37.775,
    lng: -122.419,
    occupancyRate: 98,
    availableSpots: 12,
    avgDuration: 145,
    turnoverRate: 2.8,
    status: 'full',
    description: 'Near-full occupancy in downtown SF with very limited availability',
  },
  {
    id: 'sp-amsterdam',
    name: 'Amsterdam Centraal',
    lat: 52.370,
    lng: 4.895,
    occupancyRate: 82,
    availableSpots: 145,
    avgDuration: 95,
    turnoverRate: 4.2,
    status: 'crowded',
    description: 'Crowded parking around central station with moderate availability',
  },
  {
    id: 'sp-tokyo',
    name: 'Tokyo Station',
    lat: 35.681,
    lng: 139.767,
    occupancyRate: 55,
    availableSpots: 380,
    avgDuration: 120,
    turnoverRate: 5.8,
    status: 'available',
    description: 'Good availability in multi-level parking structures near Tokyo Station',
  },
  {
    id: 'sp-london',
    name: 'London City',
    lat: 51.512,
    lng: -0.090,
    occupancyRate: 22,
    availableSpots: 820,
    avgDuration: 65,
    turnoverRate: 7.5,
    status: 'empty',
    description: 'Low occupancy in City of London with plenty of available spaces',
  },
]

const STATUS_COLORS: Record<SmartParkingCapacityData['status'], { label: string; color: string; bgClass: string }> = {
  full: { label: 'Full', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
  crowded: { label: 'Crowded', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  available: { label: 'Available', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  empty: { label: 'Empty', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: SmartParkingCapacityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SmartParkingCapacityMonitor() {
  const state = useMapStore((s) => s.smartParkingCapacity)
  const setState = useMapStore((s) => s.setSmartParkingCapacity)

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
      return { totalZones: 0, avgOccupancy: 0, avgSpots: 0, avgTurnover: 0 }
    }
    const avgOccupancy = filteredItems.reduce((sum, e) => sum + e.occupancyRate, 0) / filteredItems.length
    const avgSpots = filteredItems.reduce((sum, e) => sum + e.availableSpots, 0) / filteredItems.length
    const avgTurnover = filteredItems.reduce((sum, e) => sum + e.turnoverRate, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgOccupancy: Math.round(avgOccupancy),
      avgSpots: Math.round(avgSpots),
      avgTurnover: avgTurnover.toFixed(1),
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
      properties: { id: e.id, name: e.name, status: e.status, occupancyRate: e.occupancyRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSmartParkingCapacity({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SmartParkingCapacityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOccupancyRate', label: 'Occupancy Rate', icon: ParkingIcon },
    { key: 'showAvailableSpots', label: 'Available Spots', icon: Car },
    { key: 'showAvgDuration', label: 'Avg Duration', icon: Timer },
    { key: 'showTurnoverRate', label: 'Turnover Rate', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-blue-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ParkingIcon className="h-4 w-4 text-indigo-400" />
              Smart Parking Capacity Monitor
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
                setState({ statusFilter: v as SmartParkingCapacityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="crowded">Crowded</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="empty">Empty</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-indigo-600"
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
              <div className="text-[10px] text-slate-400/70">Avg Occupancy</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgOccupancy}%</div>
              <div className="text-[9px] text-slate-400/60">rate</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Spots</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgSpots}</div>
              <div className="text-[9px] text-slate-400/60">available</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Turnover</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgTurnover}</div>
              <div className="text-[9px] text-slate-400/60">per spot/day</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Parking Zones ({filteredItems.length})
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
                        {state.showOccupancyRate && (
                          <div>
                            Occupancy:{' '}
                            <span className="text-slate-100 font-medium">{e.occupancyRate}%</span>
                          </div>
                        )}
                        {state.showAvailableSpots && (
                          <div>
                            Spots:{' '}
                            <span className="text-slate-100 font-medium">{e.availableSpots}</span>
                          </div>
                        )}
                        {state.showAvgDuration && (
                          <div>
                            Avg Duration:{' '}
                            <span className="text-slate-100 font-medium">{e.avgDuration} min</span>
                          </div>
                        )}
                        {state.showTurnoverRate && (
                          <div>
                            Turnover:{' '}
                            <span className="text-slate-100 font-medium">{e.turnoverRate}/day</span>
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
                    <span className="text-slate-400/70">Occupancy: </span>
                    <span className="font-medium text-indigo-400">{activeItem.occupancyRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Available: </span>
                    <span className="font-medium text-blue-400">{activeItem.availableSpots} spots</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Turnover: </span>
                    <span className="font-medium text-slate-200">{activeItem.turnoverRate}/spot/day</span>
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
