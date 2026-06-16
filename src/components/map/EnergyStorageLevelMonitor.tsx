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
import { useMapStore, type EnergyStorageLevelState, type EnergyStorageLevelData } from '@/lib/map-store'
import { BatteryMedium as BatteryIcon, X, Zap, Gauge, BarChart3, RotateCw, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: EnergyStorageLevelData[] = [
  {
    id: 'es-hornsdale',
    name: 'Hornsdale AU',
    lat: -33.100,
    lng: 138.000,
    storageCapacity: 150,
    chargeLevel: 78,
    dischargeRate: 100,
    roundTripEfficiency: 90,
    status: 'charged',
    description: 'Tesla big battery in South Australia frequency regulation',
  },
  {
    id: 'es-mosslanding',
    name: 'Moss Landing CA',
    lat: 36.800,
    lng: -121.760,
    storageCapacity: 400,
    chargeLevel: 55,
    dischargeRate: 200,
    roundTripEfficiency: 88,
    status: 'charged',
    description: 'Largest lithium-ion battery storage in the world',
  },
  {
    id: 'es-ukfleet',
    name: 'UK Battery Fleet',
    lat: 52.000,
    lng: -1.000,
    storageCapacity: 250,
    chargeLevel: 35,
    dischargeRate: 150,
    roundTripEfficiency: 86,
    status: 'low',
    description: 'Distributed battery storage fleet across Great Britain',
  },
  {
    id: 'es-china',
    name: 'China Storage',
    lat: 31.200,
    lng: 121.500,
    storageCapacity: 500,
    chargeLevel: 92,
    dischargeRate: 250,
    roundTripEfficiency: 91,
    status: 'full',
    description: 'Massive grid-scale battery deployment in Shanghai region',
  },
]

const STATUS_COLORS: Record<EnergyStorageLevelData['status'], { label: string; color: string; bgClass: string }> = {
  depleted: { label: 'Depleted', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  low: { label: 'Low', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  charged: { label: 'Charged', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  full: { label: 'Full', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

function TrendIcon({ status }: { status: EnergyStorageLevelData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function EnergyStorageLevelMonitor() {
  const state = useMapStore((s) => s.energyStorageLevel)
  const setState = useMapStore((s) => s.setEnergyStorageLevel)

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
      return { totalBatteries: 0, avgCharge: 0, avgCapacity: 0, avgEfficiency: 0 }
    }
    const avgCharge = filteredItems.reduce((sum, e) => sum + e.chargeLevel, 0) / filteredItems.length
    const avgCapacity = filteredItems.reduce((sum, e) => sum + e.storageCapacity, 0) / filteredItems.length
    const avgEfficiency = filteredItems.reduce((sum, e) => sum + e.roundTripEfficiency, 0) / filteredItems.length
    return {
      totalBatteries: filteredItems.length,
      avgCharge: Math.round(avgCharge),
      avgCapacity: Math.round(avgCapacity),
      avgEfficiency: Math.round(avgEfficiency),
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
      properties: { id: e.id, name: e.name, status: e.status, chargeLevel: e.chargeLevel },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setEnergyStorageLevel({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof EnergyStorageLevelState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showChargeLevel', label: 'Charge %', icon: Gauge },
    { key: 'showStorageCapacity', label: 'Capacity MWh', icon: Zap },
    { key: 'showDischargeRate', label: 'Charge Rate', icon: BarChart3 },
    { key: 'showRoundTripEfficiency', label: 'Cycle Count', icon: RotateCw },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-lime-950/95 to-green-950/95 backdrop-blur-xl border border-lime-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-lime-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-lime-100">
              <BatteryIcon className="h-4 w-4 text-lime-400" />
              Energy Storage Level Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-lime-300 hover:text-lime-100 hover:bg-lime-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-lime-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-lime-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Charge Level
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as EnergyStorageLevelState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-lime-900/40 border-lime-700/40 text-lime-100 hover:bg-lime-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="charged">Charged</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-lime-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lime-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-lime-200">
                  <Icon className="h-3 w-3 text-lime-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-lime-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-lime-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Charge %</div>
              <div className="text-sm font-semibold text-lime-300">{summary.avgCharge}%</div>
              <div className="text-[9px] text-lime-400/60">average</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Capacity</div>
              <div className="text-sm font-semibold text-green-300">{summary.avgCapacity}</div>
              <div className="text-[9px] text-lime-400/60">MWh avg</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Efficiency</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgEfficiency}%</div>
              <div className="text-[9px] text-lime-400/60">round trip avg</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Batteries</div>
              <div className="text-sm font-semibold text-lime-200">{summary.totalBatteries}</div>
              <div className="text-[9px] text-lime-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-lime-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lime-300/80">
              Storage Facilities ({filteredItems.length})
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
                          ? 'border-lime-500/50 bg-lime-800/30'
                          : 'border-lime-700/30 hover:border-lime-500/30 hover:bg-lime-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-lime-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-lime-300/60">
                        {state.showChargeLevel && (
                          <div>
                            Charge:{' '}
                            <span className="text-lime-100 font-medium">{e.chargeLevel}%</span>
                          </div>
                        )}
                        {state.showStorageCapacity && (
                          <div>
                            Capacity:{' '}
                            <span className="text-lime-100 font-medium">{e.storageCapacity} MWh</span>
                          </div>
                        )}
                        {state.showDischargeRate && (
                          <div>
                            Charge Rate:{' '}
                            <span className="text-lime-100 font-medium">{e.dischargeRate} MW</span>
                          </div>
                        )}
                        {state.showRoundTripEfficiency && (
                          <div>
                            Efficiency:{' '}
                            <span className="text-lime-100 font-medium">{e.roundTripEfficiency}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-lime-400/50 py-4">
                    No facilities match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-lime-700/30" />
              <div className="space-y-2 rounded-lg border border-lime-600/30 bg-lime-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-lime-400" />
                  <span className="text-xs font-semibold text-lime-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-lime-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-lime-400/70">Coordinates: </span>
                    <span className="font-medium text-lime-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-lime-400/70">Charge: </span>
                    <span className="font-medium text-lime-300">{activeItem.chargeLevel}%</span>
                  </div>
                  <div>
                    <span className="text-lime-400/70">Capacity: </span>
                    <span className="font-medium text-green-300">{activeItem.storageCapacity} MWh</span>
                  </div>
                  <div>
                    <span className="text-lime-400/70">Rate: </span>
                    <span className="font-medium text-emerald-400">{activeItem.dischargeRate} MW</span>
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
