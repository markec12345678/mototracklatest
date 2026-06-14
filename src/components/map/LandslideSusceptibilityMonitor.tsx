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
import { useMapStore, type LandslideSusceptibilityState, type LandslideSusceptibilityData } from '@/lib/map-store'
import { Triangle as TriangleIcon2, X, Mountain, Droplets, TreePine, CloudRain, MapPin, Filter } from 'lucide-react'

interface DemoZone extends LandslideSusceptibilityData {
  riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
}

const DEMO_ZONES: DemoZone[] = [
  {
    id: 'ls-himalaya',
    name: 'Himalaya Nepal',
    lat: 28,
    lng: 84,
    slopeAngle: 45,
    soilMoisture: 75,
    vegetation: 25,
    rainfall: 280,
    population: 50000,
    status: 'very_high',
    description: 'Steep terrain with heavy monsoon rainfall and low vegetation cover',
    riskLevel: 'very_high',
  },
  {
    id: 'ls-italian-alps',
    name: 'Italian Alps',
    lat: 46,
    lng: 11,
    slopeAngle: 35,
    soilMoisture: 55,
    vegetation: 60,
    rainfall: 180,
    population: 15000,
    status: 'moderate',
    description: 'Alpine slopes with moderate rainfall and good vegetation',
    riskLevel: 'moderate',
  },
  {
    id: 'ls-california',
    name: 'California Coast',
    lat: 35,
    lng: -120,
    slopeAngle: 30,
    soilMoisture: 40,
    vegetation: 45,
    rainfall: 120,
    population: 80000,
    status: 'high',
    description: 'Coastal cliffs with wildfire-damaged vegetation and moderate rainfall',
    riskLevel: 'high',
  },
  {
    id: 'ls-japan',
    name: 'Japanese Mountains',
    lat: 35,
    lng: 137,
    slopeAngle: 40,
    soilMoisture: 65,
    vegetation: 50,
    rainfall: 220,
    population: 120000,
    status: 'very_high',
    description: 'Tectonically active mountains with typhoon rainfall exposure',
    riskLevel: 'very_high',
  },
  {
    id: 'ls-norway',
    name: 'Norwegian Fjords',
    lat: 61,
    lng: 6,
    slopeAngle: 50,
    soilMoisture: 35,
    vegetation: 70,
    rainfall: 90,
    population: 5000,
    status: 'low',
    description: 'Steep fjord walls with low rainfall and dense vegetation',
    riskLevel: 'low',
  },
  {
    id: 'ls-andes',
    name: 'Andes Colombia',
    lat: 5,
    lng: -74,
    slopeAngle: 38,
    soilMoisture: 70,
    vegetation: 40,
    rainfall: 250,
    population: 30000,
    status: 'high',
    description: 'Tropical mountain slopes with high rainfall and soil moisture',
    riskLevel: 'high',
  },
]

const STATUS_CONFIG: Record<
  LandslideSusceptibilityData['status'],
  { label: string; color: string; bgClass: string }
> = {
  very_low: { label: 'Very Low', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  low: { label: 'Low', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_high: { label: 'Very High', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const RISK_LABELS: Record<DemoZone['riskLevel'], string> = {
  very_low: 'Very Low',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
}

export function LandslideSusceptibilityMonitor() {
  const state = useMapStore((s) => s.landslideSusceptibility)
  const setState = useMapStore((s) => s.setLandslideSusceptibility)

  const zones = useMemo(
    () => (state.zones.length > 0 ? (state.zones as DemoZone[]) : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.riskFilter !== 'all' && z.status !== state.riskFilter) return false
      return true
    })
  }, [zones, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgSlopeAngle: 0, avgSoilMoisture: 0, highRiskCount: 0 }
    }
    const avgSlopeAngle =
      filteredZones.reduce((sum, z) => sum + z.slopeAngle, 0) / filteredZones.length
    const avgSoilMoisture =
      filteredZones.reduce((sum, z) => sum + z.soilMoisture, 0) / filteredZones.length
    const highRiskCount = filteredZones.filter(
      (z) => z.status === 'high' || z.status === 'very_high'
    ).length
    return {
      avgSlopeAngle: Math.round(avgSlopeAngle * 10) / 10,
      avgSoilMoisture: Math.round(avgSoilMoisture * 10) / 10,
      highRiskCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LandslideSusceptibilityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSlopeAngle', label: 'Slope Angle', icon: Mountain },
    { key: 'showSoilMoisture', label: 'Soil Moisture', icon: Droplets },
    { key: 'showVegetation', label: 'Vegetation', icon: TreePine },
    { key: 'showRainfall', label: 'Rainfall', icon: CloudRain },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-amber-950/80 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg shadow-amber-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <TriangleIcon2 className="h-4 w-4 text-amber-400" />
              Landslide Susceptibility Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-amber-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({
                  riskFilter: v as LandslideSusceptibilityState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="very_low">Very Low</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
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

          <Separator className="bg-amber-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Slope</div>
              <div className="text-sm font-semibold text-amber-200">{summary.avgSlopeAngle}</div>
              <div className="text-[9px] text-amber-400">degrees</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Moisture</div>
              <div className="text-sm font-semibold text-amber-300">{summary.avgSoilMoisture}</div>
              <div className="text-[9px] text-amber-400">%</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">High Risk</div>
              <div className="text-sm font-semibold text-red-400">{summary.highRiskCount}</div>
              <div className="text-[9px] text-amber-400">zones</div>
            </div>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">
              Susceptibility Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_CONFIG[zone.status]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/60 bg-amber-800/30'
                          : 'border-amber-800/30 hover:border-amber-600/40 hover:bg-amber-900/20'
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
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-amber-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300">
                        {state.showSlopeAngle && (
                          <div>
                            Slope:{' '}
                            <span className="text-amber-100 font-medium">
                              {zone.slopeAngle}&deg;
                            </span>
                          </div>
                        )}
                        {state.showSoilMoisture && (
                          <div>
                            Moisture:{' '}
                            <span className="text-amber-100 font-medium">
                              {zone.soilMoisture}%
                            </span>
                          </div>
                        )}
                        {state.showVegetation && (
                          <div>
                            Vegetation:{' '}
                            <span className="text-amber-100 font-medium">
                              {zone.vegetation}%
                            </span>
                          </div>
                        )}
                        {state.showRainfall && (
                          <div>
                            Rainfall:{' '}
                            <span className="text-amber-100 font-medium">
                              {zone.rainfall} mm
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-amber-400 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-amber-800/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400">Slope Angle: </span>
                    <span className="font-medium text-amber-200">{activeZone.slopeAngle}&deg;</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Soil Moisture: </span>
                    <span className="font-medium text-amber-200">{activeZone.soilMoisture}%</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Vegetation: </span>
                    <span className="font-medium text-amber-200">{activeZone.vegetation}%</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Rainfall: </span>
                    <span className="font-medium text-amber-200">{activeZone.rainfall} mm</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Population: </span>
                    <span className="font-medium text-amber-200">{activeZone.population.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-amber-400">Risk Level: </span>
                    <span className="font-medium text-amber-200">
                      {(activeZone as DemoZone).riskLevel ? RISK_LABELS[(activeZone as DemoZone).riskLevel] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-amber-400">Description: </span>
                    <span className="font-medium text-amber-200">{activeZone.description}</span>
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
