'use client'

import { useMemo } from 'react'
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
import { useMapStore, type SubsurfaceFluidState, type FluidFlowZone } from '@/lib/map-store'
import { Droplets as DropletsIcon6, X, Gauge, Thermometer, MapPin, Filter, AlertTriangle } from 'lucide-react'

const DEMO_ZONES: FluidFlowZone[] = [
  {
    id: 'sf-ogallala',
    name: 'Ogallala Aquifer USA',
    latitude: 36.5,
    longitude: -101.0,
    fluidType: 'groundwater',
    flowRate: 3.2,
    pressure: 12.5,
    temperature: 18,
    depth: 45,
    contaminationRisk: 'moderate',
  },
  {
    id: 'sf-great-artesian',
    name: 'Great Artesian Basin Australia',
    latitude: -24.0,
    longitude: 143.0,
    fluidType: 'groundwater',
    flowRate: 2.8,
    pressure: 18.3,
    temperature: 45,
    depth: 300,
    contaminationRisk: 'low',
  },
  {
    id: 'sf-guarani',
    name: 'Guarani Aquifer Brazil',
    latitude: -23.0,
    longitude: -49.0,
    fluidType: 'groundwater',
    flowRate: 4.1,
    pressure: 15.7,
    temperature: 35,
    depth: 180,
    contaminationRisk: 'none',
  },
  {
    id: 'sf-nubian',
    name: 'Nubian Sandstone Libya',
    latitude: 24.0,
    longitude: 15.0,
    fluidType: 'petroleum',
    flowRate: 1.5,
    pressure: 22.4,
    temperature: 62,
    depth: 1200,
    contaminationRisk: 'high',
  },
  {
    id: 'sf-paris-basin',
    name: 'Paris Basin France',
    latitude: 48.5,
    longitude: 2.5,
    fluidType: 'hydrothermal',
    flowRate: 2.1,
    pressure: 14.8,
    temperature: 72,
    depth: 500,
    contaminationRisk: 'moderate',
  },
  {
    id: 'sf-iceland-geo',
    name: 'Icelandic Geothermal',
    latitude: 64.0,
    longitude: -19.5,
    fluidType: 'geothermal_brine',
    flowRate: 5.6,
    pressure: 25.1,
    temperature: 180,
    depth: 800,
    contaminationRisk: 'critical',
  },
]

const CONTAMINATION_CONFIG: Record<
  FluidFlowZone['contaminationRisk'],
  { label: string; color: string; bgClass: string }
> = {
  none: { label: 'None', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_CONFIG: Record<
  FluidFlowZone['fluidType'],
  { label: string; unit: string }
> = {
  groundwater: { label: 'Groundwater', unit: 'L/s' },
  hydrothermal: { label: 'Hydrothermal', unit: 'L/s' },
  magmatic: { label: 'Magmatic', unit: 'L/s' },
  petroleum: { label: 'Petroleum', unit: 'L/s' },
  geothermal_brine: { label: 'Geothermal Brine', unit: 'L/s' },
}

export function SubsurfaceFluidFlowMonitor() {
  const state = useMapStore((s) => s.subsurfaceFluid)
  const setState = useMapStore((s) => s.setSubsurfaceFluid)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.typeFilter !== 'all' && z.fluidType !== state.typeFilter) return false
      return true
    })
  }, [zones, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgFlowRate: 0, avgPressure: 0, highCriticalCount: 0 }
    }
    const avgFlowRate = filteredZones.reduce((sum, z) => sum + z.flowRate, 0) / filteredZones.length
    const avgPressure = filteredZones.reduce((sum, z) => sum + z.pressure, 0) / filteredZones.length
    const highCriticalCount = filteredZones.filter(
      (z) => z.contaminationRisk === 'high' || z.contaminationRisk === 'critical'
    ).length
    return {
      avgFlowRate: Math.round(avgFlowRate * 10) / 10,
      avgPressure: Math.round(avgPressure * 10) / 10,
      highCriticalCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubsurfaceFluidState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowRate', label: 'Flow Rate', icon: Gauge },
    { key: 'showPressure', label: 'Pressure', icon: AlertTriangle },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showContamination', label: 'Contamination Risk', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DropletsIcon6 className="h-4 w-4 text-amber-600" />
              Subsurface Fluid Flow Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Fluid Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SubsurfaceFluidState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="groundwater">Groundwater</SelectItem>
                <SelectItem value="hydrothermal">Hydrothermal</SelectItem>
                <SelectItem value="magmatic">Magmatic</SelectItem>
                <SelectItem value="petroleum">Petroleum</SelectItem>
                <SelectItem value="geothermal_brine">Geothermal Brine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-amber-600" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Flow Rate</div>
              <div className="text-sm font-semibold">{summary.avgFlowRate}</div>
              <div className="text-[9px] text-muted-foreground">L/s</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Pressure</div>
              <div className="text-sm font-semibold text-amber-600">{summary.avgPressure}</div>
              <div className="text-[9px] text-muted-foreground">MPa</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Critical</div>
              <div className="text-sm font-semibold text-red-600">{summary.highCriticalCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Fluid Flow Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const contamCfg = CONTAMINATION_CONFIG[zone.contaminationRisk]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: contamCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${contamCfg.bgClass}`}
                        >
                          {contamCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showFlowRate && (
                          <div>
                            Flow:{' '}
                            <span className="text-foreground font-medium">
                              {zone.flowRate.toFixed(1)} L/s
                            </span>
                          </div>
                        )}
                        {state.showPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-foreground font-medium">
                              {zone.pressure.toFixed(1)} MPa
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {zone.temperature}°C
                            </span>
                          </div>
                        )}
                        {state.showContamination && (
                          <div>
                            Risk:{' '}
                            <span className="text-foreground font-medium">
                              {contamCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${CONTAMINATION_CONFIG[activeZone.contaminationRisk].bgClass}`}
                  >
                    {CONTAMINATION_CONFIG[activeZone.contaminationRisk].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeZone.latitude.toFixed(2)}, {activeZone.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fluid Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activeZone.fluidType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flow Rate: </span>
                    <span className="font-medium">{activeZone.flowRate.toFixed(1)} L/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pressure: </span>
                    <span className="font-medium">{activeZone.pressure.toFixed(1)} MPa</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeZone.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeZone.depth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contamination: </span>
                    <span className="font-medium">{CONTAMINATION_CONFIG[activeZone.contaminationRisk].label}</span>
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
