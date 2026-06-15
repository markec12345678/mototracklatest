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
import { useMapStore, type SubglacialWaterSystemState, type SubglacialWaterSystemData } from '@/lib/map-store'
import { Droplets as DropletsIcon15, X, Gauge, Waves, Circle, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SubglacialWaterSystemData[] = [
  {
    id: 'sw-antarctic-w4',
    name: 'Whillans Subglacial Lake',
    lat: -84.0,
    lng: -160.0,
    waterPressure: 4.5,
    flowRate: 50,
    channelDiameter: 2.5,
    status: 'active',
    description: 'Active drainage cycle lake',
  },
  {
    id: 'sw-greenland-grl',
    name: 'Greenland Subglacial',
    lat: 72.0,
    lng: -38.0,
    waterPressure: 8.2,
    flowRate: 120,
    channelDiameter: 4.0,
    status: 'drainage',
    description: 'Active jökulhlaup drainage',
  },
  {
    id: 'sw-vostok',
    name: 'Lake Vostok System',
    lat: -77.5,
    lng: 105.0,
    waterPressure: 25.0,
    flowRate: 5,
    channelDiameter: 8.0,
    status: 'pressure_building',
    description: 'Deep subglacial pressure zone',
  },
  {
    id: 'sw-ellsworth',
    name: 'Lake Ellsworth',
    lat: -79.0,
    lng: -85.0,
    waterPressure: 12.0,
    flowRate: 0.5,
    channelDiameter: 1.5,
    status: 'quiescent',
    description: 'Dormant subglacial lake',
  },
]

const STATUS_COLORS: Record<SubglacialWaterSystemData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  drainage: { label: 'Drainage', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  pressure_building: { label: 'Pressure Building', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  quiescent: { label: 'Quiescent', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: SubglacialWaterSystemData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SubglacialWaterSystemMonitor() {
  const state = useMapStore((s) => s.subglacialWaterSystem)
  const setState = useMapStore((s) => s.setSubglacialWaterSystem)

  const items = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (state.statusFilter !== 'all' && item.status !== state.statusFilter) return false
      return true
    })
  }, [items, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSystems: 0, avgPressure: 0, avgFlow: 0, activeDrainageCount: 0 }
    }
    const avgPressure = filteredItems.reduce((sum, item) => sum + item.waterPressure, 0) / filteredItems.length
    const avgFlow = filteredItems.reduce((sum, item) => sum + item.flowRate, 0) / filteredItems.length
    const activeDrainageCount = filteredItems.filter((item) => item.status === 'active' || item.status === 'drainage').length
    return {
      totalSystems: filteredItems.length,
      avgPressure: Math.round(avgPressure * 100) / 100,
      avgFlow: Math.round(avgFlow * 100) / 100,
      activeDrainageCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => items.find((item) => item.id === state.activeItemId) ?? null,
    [items, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.lng, item.lat] },
      properties: { id: item.id, name: item.name, status: item.status, waterPressure: item.waterPressure },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSubglacialWaterSystem({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubglacialWaterSystemState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterPressure', label: 'Water Pressure', icon: Gauge },
    { key: 'showFlowRate', label: 'Flow Rate', icon: Waves },
    { key: 'showChannelDiameter', label: 'Channel Diameter', icon: Circle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <DropletsIcon15 className="h-4 w-4 text-blue-400" />
              Subglacial Water System
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-blue-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SubglacialWaterSystemState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="drainage">Drainage</SelectItem>
                <SelectItem value="pressure_building">Pressure Building</SelectItem>
                <SelectItem value="quiescent">Quiescent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
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

          <Separator className="bg-blue-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Systems</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalSystems}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Pressure</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgPressure}</div>
              <div className="text-[9px] text-blue-400/60">MPa</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Flow</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgFlow}</div>
              <div className="text-[9px] text-blue-400/60">m³/s</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Active+Drainage</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeDrainageCount}</div>
              <div className="text-[9px] text-blue-400/60">systems</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Systems ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((item) => {
                  const isActive = state.activeItemId === item.id
                  const statusCfg = STATUS_COLORS[item.status]
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : item.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={item.status} />
                          <span className="text-xs font-medium text-blue-100">{item.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showWaterPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-blue-100 font-medium">{item.waterPressure} MPa</span>
                          </div>
                        )}
                        {state.showFlowRate && (
                          <div>
                            Flow:{' '}
                            <span className="text-blue-100 font-medium">{item.flowRate} m³/s</span>
                          </div>
                        )}
                        {state.showChannelDiameter && (
                          <div>
                            Diameter:{' '}
                            <span className="text-cyan-400 font-medium">{item.channelDiameter} m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No systems match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-blue-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400/70">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Pressure: </span>
                    <span className="font-medium text-orange-400">{activeItem.waterPressure} MPa</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Flow Rate: </span>
                    <span className="font-medium text-cyan-400">{activeItem.flowRate} m³/s</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Diameter: </span>
                    <span className="font-medium text-indigo-400">{activeItem.channelDiameter} m</span>
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
