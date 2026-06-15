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
import { useMapStore, type MethaneHydrateStabilityState, type MethaneHydrateStabilityData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon9, X, Thermometer, Gauge, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: MethaneHydrateStabilityData[] = [
  {
    id: 'mhs-nankai',
    name: 'Nankai Trough Zone',
    lat: 33.0,
    lng: 137.0,
    stability: 'transitional',
    temperature: 15,
    pressure: 30,
    depth: 1200,
    methaneConcentration: 85,
    description: 'Active margin hydrate stability zone',
  },
  {
    id: 'mhs-blake',
    name: 'Blake Ridge Deep',
    lat: 32.0,
    lng: -75.0,
    stability: 'stable',
    temperature: 4,
    pressure: 40,
    depth: 2500,
    methaneConcentration: 50,
    description: 'Passive margin stable hydrate',
  },
  {
    id: 'mhs-cascadia',
    name: 'Cascadia Front',
    lat: 44.5,
    lng: -125.0,
    stability: 'dissociating',
    temperature: 6,
    pressure: 25,
    depth: 800,
    methaneConcentration: 120,
    description: 'Warming-driven dissociation zone',
  },
  {
    id: 'mhs-svalbard',
    name: 'Svalbard Margin',
    lat: 78.0,
    lng: 12.0,
    stability: 'unstable',
    temperature: 3,
    pressure: 20,
    depth: 600,
    methaneConcentration: 95,
    description: 'Arctic warming-impacted stability',
  },
]

const STATUS_COLORS: Record<MethaneHydrateStabilityData['stability'], { label: string; color: string; bgClass: string }> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  transitional: { label: 'Transitional', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  unstable: { label: 'Unstable', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  dissociating: { label: 'Dissociating', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ stability }: { stability: MethaneHydrateStabilityData['stability'] }) {
  const cfg = STATUS_COLORS[stability]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MethaneHydrateStabilityMonitor() {
  const state = useMapStore((s) => s.methaneHydrateStability)
  const setState = useMapStore((s) => s.setMethaneHydrateStability)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : SAMPLE_LOCATIONS),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.stabilityFilter !== 'all' && z.stability !== state.stabilityFilter) return false
      return true
    })
  }, [zones, state.stabilityFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalZones: 0, avgTemperature: 0, avgPressure: 0, stabilityStatus: 'N/A' }
    }
    const avgTemperature = filteredZones.reduce((sum, z) => sum + z.temperature, 0) / filteredZones.length
    const avgPressure = filteredZones.reduce((sum, z) => sum + z.pressure, 0) / filteredZones.length
    const unstableCount = filteredZones.filter((z) => z.stability === 'unstable' || z.stability === 'dissociating').length
    const stabilityStatus = unstableCount > 0 ? `${unstableCount} at risk` : 'All stable'
    return {
      totalZones: filteredZones.length,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgPressure: Math.round(avgPressure * 10) / 10,
      stabilityStatus,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredZones.map((z) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [z.lng, z.lat] },
      properties: { id: z.id, name: z.name, stability: z.stability, temperature: z.temperature },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.zones.length === 0) {
      useMapStore.getState().setMethaneHydrateStability({ zones: SAMPLE_LOCATIONS })
    }
  }, [state.zones.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MethaneHydrateStabilityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showStability', label: 'Stability', icon: AlertTriangle },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showPressure', label: 'Pressure', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-blue-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <SnowflakeIcon9 className="h-4 w-4 text-cyan-400" />
              Methane Hydrate Stability Monitor
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
          {/* Stability Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Stability Level
            </Label>
            <Select
              value={state.stabilityFilter}
              onValueChange={(v) =>
                setState({ stabilityFilter: v as MethaneHydrateStabilityState['stabilityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stabilities</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="transitional">Transitional</SelectItem>
                <SelectItem value="unstable">Unstable</SelectItem>
                <SelectItem value="dissociating">Dissociating</SelectItem>
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
              <div className="text-[10px] text-cyan-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalZones}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-cyan-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Pressure</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgPressure}</div>
              <div className="text-[9px] text-cyan-400/60">MPa</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Stability Status</div>
              <div className="text-sm font-semibold text-red-400">{summary.stabilityStatus}</div>
              <div className="text-[9px] text-cyan-400/60">rating</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Hydrate Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_COLORS[zone.stability]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeZoneId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon stability={zone.stability} />
                          <span className="text-xs font-medium text-cyan-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-cyan-100 font-medium">{zone.temperature}°C</span>
                          </div>
                        )}
                        {state.showPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-cyan-100 font-medium">{zone.pressure}MPa</span>
                          </div>
                        )}
                        <div>
                          Depth:{' '}
                          <span className="text-cyan-100 font-medium">{zone.depth}m</span>
                        </div>
                        <div>
                          CH₄:{' '}
                          <span className="text-cyan-100 font-medium">{zone.methaneConcentration}mmol/L</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeZone.stability].bgClass}`}
                  >
                    {STATUS_COLORS[activeZone.stability].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Temperature: </span>
                    <span className="font-medium text-orange-400">{activeZone.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Pressure: </span>
                    <span className="font-medium text-blue-400">{activeZone.pressure}MPa</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Depth: </span>
                    <span className="font-medium text-cyan-200">{activeZone.depth}m</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">CH₄: </span>
                    <span className="font-medium text-green-400">{activeZone.methaneConcentration}mmol/L</span>
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
