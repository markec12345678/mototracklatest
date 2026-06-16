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
import { useMapStore, type SoilMoistureFieldState, type SoilMoistureFieldData } from '@/lib/map-store'
import { Droplets as DropletsIcon19, X, Activity, TrendingDown, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SoilMoistureFieldData[] = [
  {
    id: 'smf-sahel',
    name: 'Sahel Zone',
    lat: 13.500,
    lng: 2.100,
    moisturePercent: 18,
    fieldCapacity: 35,
    wiltingPoint: 12,
    availableWater: 22,
    status: 'drought',
    description: 'Severe moisture deficit in sub-Saharan agricultural belt',
  },
  {
    id: 'smf-murray',
    name: 'Murray-Darling Basin',
    lat: -33.870,
    lng: 148.250,
    moisturePercent: 32,
    fieldCapacity: 45,
    wiltingPoint: 15,
    availableWater: 45,
    status: 'dry',
    description: 'Below-average soil moisture in Australian grain growing region',
  },
  {
    id: 'smf-greatplains',
    name: 'Great Plains',
    lat: 39.100,
    lng: -96.600,
    moisturePercent: 58,
    fieldCapacity: 50,
    wiltingPoint: 14,
    availableWater: 88,
    status: 'adequate',
    description: 'Adequate soil moisture for winter wheat establishment',
  },
  {
    id: 'smf-ganges',
    name: 'Ganges Basin',
    lat: 25.300,
    lng: 83.000,
    moisturePercent: 82,
    fieldCapacity: 48,
    wiltingPoint: 18,
    availableWater: 112,
    status: 'saturated',
    description: 'Waterlogged fields after monsoon flooding in rice paddies',
  },
]

const STATUS_COLORS: Record<SoilMoistureFieldData['status'], { label: string; color: string; bgClass: string }> = {
  drought: { label: 'Drought', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  dry: { label: 'Dry', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  adequate: { label: 'Adequate', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  saturated: { label: 'Saturated', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: SoilMoistureFieldData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SoilMoistureFieldMonitor() {
  const state = useMapStore((s) => s.soilMoistureField)
  const setState = useMapStore((s) => s.setSoilMoistureField)

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
      return { totalZones: 0, avgMoisture: 0, avgCapacity: 0, avgAvailable: 0 }
    }
    const avgMoisture = filteredItems.reduce((sum, e) => sum + e.moisturePercent, 0) / filteredItems.length
    const avgCapacity = filteredItems.reduce((sum, e) => sum + e.fieldCapacity, 0) / filteredItems.length
    const avgAvailable = filteredItems.reduce((sum, e) => sum + e.availableWater, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgMoisture: Math.round(avgMoisture),
      avgCapacity: Math.round(avgCapacity),
      avgAvailable: Math.round(avgAvailable),
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
      properties: { id: e.id, name: e.name, status: e.status, moisturePercent: e.moisturePercent },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSoilMoistureField({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SoilMoistureFieldState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMoisturePercent', label: 'Moisture %', icon: Activity },
    { key: 'showFieldCapacity', label: 'Field Capacity', icon: TrendingDown },
    { key: 'showWiltingPoint', label: 'Wilting Point', icon: DropletsIcon19 },
    { key: 'showAvailableWater', label: 'Available Water', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <DropletsIcon19 className="h-4 w-4 text-amber-400" />
              Soil Moisture Field Monitor
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
                setState({ statusFilter: v as SoilMoistureFieldState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="drought">Drought</SelectItem>
                <SelectItem value="dry">Dry</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
                <SelectItem value="saturated">Saturated</SelectItem>
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
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Moisture</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgMoisture}%</div>
              <div className="text-[9px] text-slate-400/60">volumetric</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Capacity</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgCapacity}%</div>
              <div className="text-[9px] text-slate-400/60">field</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Available</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgAvailable}mm</div>
              <div className="text-[9px] text-slate-400/60">water</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Field Zones ({filteredItems.length})
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
                        {state.showMoisturePercent && (
                          <div>
                            Moisture: <span className="text-slate-100 font-medium">{e.moisturePercent}%</span>
                          </div>
                        )}
                        {state.showFieldCapacity && (
                          <div>
                            Capacity: <span className="text-slate-100 font-medium">{e.fieldCapacity}%</span>
                          </div>
                        )}
                        {state.showWiltingPoint && (
                          <div>
                            Wilting: <span className="text-slate-100 font-medium">{e.wiltingPoint}%</span>
                          </div>
                        )}
                        {state.showAvailableWater && (
                          <div>
                            Available: <span className="text-slate-100 font-medium">{e.availableWater}mm</span>
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
                    <span className="text-slate-400/70">Moisture: </span>
                    <span className="font-medium text-amber-400">{activeItem.moisturePercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Capacity: </span>
                    <span className="font-medium text-yellow-400">{activeItem.fieldCapacity}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Available: </span>
                    <span className="font-medium text-slate-200">{activeItem.availableWater}mm</span>
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
