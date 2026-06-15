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
import { useMapStore, type SubmarineGroundwaterState, type SubmarineGroundwaterData } from '@/lib/map-store'
import { Droplet as DropletIcon5, X, Layers, Activity, Droplets, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: SubmarineGroundwaterData[] = [
  {
    id: 'sg-yucatan',
    name: 'Yucatan Springs',
    lat: 21.5,
    lng: -87.0,
    flowRate: 450,
    salinity: 2,
    nutrientLoad: 0.8,
    dischargeType: 'karst',
    temperature: 25,
    description: 'Major karst groundwater discharge zone',
  },
  {
    id: 'sg-hawaiian',
    name: 'Hawaiian Seeps',
    lat: 19.5,
    lng: -155.5,
    flowRate: 120,
    salinity: 15,
    nutrientLoad: 0.3,
    dischargeType: 'volcanic',
    temperature: 30,
    description: 'Volcanic island submarine springs',
  },
  {
    id: 'sg-sicily',
    name: 'Sicily Vent',
    lat: 37.0,
    lng: 15.3,
    flowRate: 200,
    salinity: 8,
    nutrientLoad: 0.5,
    dischargeType: 'coastal',
    temperature: 18,
    description: 'Coastal aquifer discharge',
  },
  {
    id: 'sg-okinawa',
    name: 'Okinawa Pool',
    lat: 26.5,
    lng: 127.8,
    flowRate: 350,
    salinity: 5,
    nutrientLoad: 0.6,
    dischargeType: 'offshore',
    temperature: 22,
    description: 'Deep offshore groundwater upwelling',
  },
]

const STATUS_COLORS: Record<SubmarineGroundwaterData['dischargeType'], { label: string; color: string; bgClass: string }> = {
  karst: { label: 'Karst', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  volcanic: { label: 'Volcanic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  coastal: { label: 'Coastal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  offshore: { label: 'Offshore', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

function TrendIcon({ dischargeType }: { dischargeType: SubmarineGroundwaterData['dischargeType'] }) {
  const cfg = STATUS_COLORS[dischargeType]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SubmarineGroundwaterMonitor() {
  const state = useMapStore((s) => s.submarineGroundwater)
  const setState = useMapStore((s) => s.setSubmarineGroundwater)

  const discharges = useMemo(
    () => (state.discharges.length > 0 ? state.discharges : SAMPLE_LOCATIONS),
    [state.discharges]
  )

  const filteredDischarges = useMemo(() => {
    return discharges.filter((d) => {
      if (state.typeFilter !== 'all' && d.dischargeType !== state.typeFilter) return false
      return true
    })
  }, [discharges, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredDischarges.length === 0) {
      return { totalDischarges: 0, avgFlowRate: 0, avgSalinity: 0, avgNutrientLoad: 0 }
    }
    const avgFlowRate = filteredDischarges.reduce((sum, d) => sum + d.flowRate, 0) / filteredDischarges.length
    const avgSalinity = filteredDischarges.reduce((sum, d) => sum + d.salinity, 0) / filteredDischarges.length
    const avgNutrientLoad = filteredDischarges.reduce((sum, d) => sum + d.nutrientLoad, 0) / filteredDischarges.length
    return {
      totalDischarges: filteredDischarges.length,
      avgFlowRate: Math.round(avgFlowRate * 10) / 10,
      avgSalinity: Math.round(avgSalinity * 10) / 10,
      avgNutrientLoad: Math.round(avgNutrientLoad * 100) / 100,
    }
  }, [filteredDischarges])

  const activeDischarge = useMemo(
    () => discharges.find((d) => d.id === state.activeDischargeId) ?? null,
    [discharges, state.activeDischargeId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredDischarges.map((d) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] },
      properties: { id: d.id, name: d.name, dischargeType: d.dischargeType, flowRate: d.flowRate },
    })),
  }), [filteredDischarges])

  useEffect(() => {
    if (state.discharges.length === 0) {
      useMapStore.getState().setSubmarineGroundwater({ discharges: SAMPLE_LOCATIONS })
    }
  }, [state.discharges.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubmarineGroundwaterState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowRate', label: 'Flow Rate', icon: Activity },
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
    { key: 'showNutrients', label: 'Nutrient Load', icon: AlertTriangle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-slate-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <DropletIcon5 className="h-4 w-4 text-cyan-400" />
              Submarine Groundwater Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Discharge Type Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Discharge Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({ typeFilter: v as SubmarineGroundwaterState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="karst">Karst</SelectItem>
                <SelectItem value="volcanic">Volcanic</SelectItem>
                <SelectItem value="coastal">Coastal</SelectItem>
                <SelectItem value="offshore">Offshore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Discharges</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalDischarges}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Flow Rate</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgFlowRate}</div>
              <div className="text-[9px] text-cyan-400/60">m³/day</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Salinity</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgSalinity}</div>
              <div className="text-[9px] text-cyan-400/60">PSU</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Nutrient Load</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgNutrientLoad}</div>
              <div className="text-[9px] text-cyan-400/60">mg/L</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Discharge List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Discharges ({filteredDischarges.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredDischarges.map((discharge) => {
                  const isActive = state.activeDischargeId === discharge.id
                  const statusCfg = STATUS_COLORS[discharge.dischargeType]
                  return (
                    <div
                      key={discharge.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeDischargeId: isActive ? null : discharge.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon dischargeType={discharge.dischargeType} />
                          <span className="text-xs font-medium text-cyan-100">{discharge.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showFlowRate && (
                          <div>
                            Flow Rate:{' '}
                            <span className="text-cyan-100 font-medium">{discharge.flowRate}m³/day</span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-cyan-100 font-medium">{discharge.salinity}PSU</span>
                          </div>
                        )}
                        {state.showNutrients && (
                          <div>
                            Nutrients:{' '}
                            <span className="text-cyan-100 font-medium">{discharge.nutrientLoad}mg/L</span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Temp:{' '}
                            <span className="text-cyan-100 font-medium">{discharge.temperature}°C</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredDischarges.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No discharges match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Discharge Details */}
          {activeDischarge && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeDischarge.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeDischarge.dischargeType].bgClass}`}
                  >
                    {STATUS_COLORS[activeDischarge.dischargeType].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeDischarge.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeDischarge.lat.toFixed(1)}, {activeDischarge.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Flow Rate: </span>
                    <span className="font-medium text-cyan-100">{activeDischarge.flowRate}m³/day</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Salinity: </span>
                    <span className="font-medium text-blue-400">{activeDischarge.salinity}PSU</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Nutrients: </span>
                    <span className="font-medium text-cyan-100">{activeDischarge.nutrientLoad}mg/L</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Temperature: </span>
                    <span className="font-medium text-cyan-100">{activeDischarge.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Type: </span>
                    <span className="font-medium text-cyan-100">{activeDischarge.dischargeType}</span>
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
