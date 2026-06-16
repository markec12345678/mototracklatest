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
import { useMapStore, type LogisticsDepotStatusState, type LogisticsDepotStatusData } from '@/lib/map-store'
import { Warehouse as WarehouseIcon, X, Package, Truck, ArrowDownUp, Clock } from 'lucide-react'

const SAMPLE_LOCATIONS: LogisticsDepotStatusData[] = [
  {
    id: 'lds-memphis',
    name: 'Memphis FedEx',
    lat: 35.040,
    lng: -89.980,
    warehouseCapacity: 88,
    outboundShipments: 45000,
    inboundShipments: 42000,
    avgProcessingTime: 2.4,
    status: 'busy',
    description: 'FedEx Memphis Superhub processing peak overnight sort volume',
  },
  {
    id: 'lds-louisville',
    name: 'Louisville UPS',
    lat: 38.130,
    lng: -85.730,
    warehouseCapacity: 92,
    outboundShipments: 38000,
    inboundShipments: 36000,
    avgProcessingTime: 2.1,
    status: 'busy',
    description: 'UPS Worldport automated hub at near-maximum throughput capacity',
  },
  {
    id: 'lds-dubai',
    name: 'Dubai Logistics',
    lat: 25.000,
    lng: 55.300,
    warehouseCapacity: 72,
    outboundShipments: 22000,
    inboundShipments: 25000,
    avgProcessingTime: 3.2,
    status: 'operational',
    description: 'Dubai Logistics City hub serving Middle East and Africa corridor',
  },
  {
    id: 'lds-singapore',
    name: 'Singapore Hub',
    lat: 1.350,
    lng: 103.990,
    warehouseCapacity: 65,
    outboundShipments: 18000,
    inboundShipments: 16000,
    avgProcessingTime: 1.8,
    status: 'operational',
    description: 'Singapore Changi Airfreight hub with efficient cross-dock operations',
  },
]

const STATUS_COLORS: Record<LogisticsDepotStatusData['status'], { label: string; color: string; bgClass: string }> = {
  operational: { label: 'Operational', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  busy: { label: 'Busy', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  overloaded: { label: 'Overloaded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  offline: { label: 'Offline', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
}

function TrendIcon({ status }: { status: LogisticsDepotStatusData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function LogisticsDepotStatusMonitor() {
  const state = useMapStore((s) => s.logisticsDepotStatus)
  const setState = useMapStore((s) => s.setLogisticsDepotStatus)

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
      return { totalThroughput: 0, avgSortRate: 0, avgDeliveryPct: 0, totalBacklog: 0 }
    }
    const totalOutbound = filteredItems.reduce((sum, e) => sum + e.outboundShipments, 0)
    const totalInbound = filteredItems.reduce((sum, e) => sum + e.inboundShipments, 0)
    const avgSortRate = filteredItems.reduce((sum, e) => sum + e.avgProcessingTime, 0) / filteredItems.length
    const avgCapacity = filteredItems.reduce((sum, e) => sum + e.warehouseCapacity, 0) / filteredItems.length
    return {
      totalThroughput: ((totalOutbound + totalInbound) / 1000).toFixed(0),
      avgSortRate: avgSortRate.toFixed(1),
      avgDeliveryPct: Math.round(100 - avgCapacity + 100),
      totalBacklog: ((totalInbound - totalOutbound) / 1000).toFixed(1),
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
      properties: { id: e.id, name: e.name, status: e.status, warehouseCapacity: e.warehouseCapacity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setLogisticsDepotStatus({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LogisticsDepotStatusState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWarehouseCapacity', label: 'Throughput', icon: Package },
    { key: 'showOutboundShipments', label: 'Sort Rate', icon: Truck },
    { key: 'showInboundShipments', label: 'Delivery %', icon: ArrowDownUp },
    { key: 'showAvgProcessingTime', label: 'Backlog', icon: Clock },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <WarehouseIcon className="h-4 w-4 text-emerald-400" />
              Logistics Depot Status
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
              <Package className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as LogisticsDepotStatusState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="overloaded">Overloaded</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Throughput</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.totalThroughput}k</div>
              <div className="text-[9px] text-slate-400/60">packages/day</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Sort Rate</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgSortRate}h</div>
              <div className="text-[9px] text-slate-400/60">avg processing</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Delivery %</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgDeliveryPct}%</div>
              <div className="text-[9px] text-slate-400/60">efficiency</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Backlog</div>
              <div className="text-sm font-semibold text-amber-400">{summary.totalBacklog}k</div>
              <div className="text-[9px] text-slate-400/60">pending items</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Logistics Depots ({filteredItems.length})
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
                        {state.showWarehouseCapacity && (
                          <div>
                            Capacity:{' '}
                            <span className="text-slate-100 font-medium">{e.warehouseCapacity}%</span>
                          </div>
                        )}
                        {state.showOutboundShipments && (
                          <div>
                            Outbound:{' '}
                            <span className="text-slate-100 font-medium">{(e.outboundShipments / 1000).toFixed(0)}k</span>
                          </div>
                        )}
                        {state.showInboundShipments && (
                          <div>
                            Inbound:{' '}
                            <span className="text-slate-100 font-medium">{(e.inboundShipments / 1000).toFixed(0)}k</span>
                          </div>
                        )}
                        {state.showAvgProcessingTime && (
                          <div>
                            Process:{' '}
                            <span className="text-slate-100 font-medium">{e.avgProcessingTime}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No depots match the current filter.
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
                  <WarehouseIcon className="h-3.5 w-3.5 text-slate-400" />
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
                    <span className="text-slate-400/70">Capacity: </span>
                    <span className="font-medium text-emerald-400">{activeItem.warehouseCapacity}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Outbound: </span>
                    <span className="font-medium text-green-400">{(activeItem.outboundShipments / 1000).toFixed(0)}k</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Process: </span>
                    <span className="font-medium text-teal-400">{activeItem.avgProcessingTime}h</span>
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
