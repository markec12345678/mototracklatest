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
import { useMapStore, type OceanDeoxygenationState, type OceanDeoxygenationData } from '@/lib/map-store'
import { Droplets as DropletsIcon10, X, Activity, Layers, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: OceanDeoxygenationData[] = [
  {
    id: 'od-etp',
    name: 'Eastern Tropical Pacific',
    lat: 10.0,
    lng: -100.0,
    oxygenLevel: 20,
    affectedArea: 500000,
    marineImpact: 0.85,
    severity: 'severe',
    depthRange: '100-500m',
    description: 'Major oxygen minimum zone',
  },
  {
    id: 'od-arabian',
    name: 'Arabian Sea OMZ',
    lat: 18.0,
    lng: 65.0,
    oxygenLevel: 5,
    affectedArea: 300000,
    marineImpact: 0.92,
    severity: 'anoxic',
    depthRange: '150-800m',
    description: 'Intense anoxic zone with denitrification',
  },
  {
    id: 'od-baltic',
    name: 'Baltic Deep',
    lat: 57.0,
    lng: 18.0,
    oxygenLevel: 30,
    affectedArea: 80000,
    marineImpact: 0.65,
    severity: 'moderate',
    depthRange: '60-200m',
    description: 'Seasonal hypoxia in semi-enclosed sea',
  },
  {
    id: 'od-gulf',
    name: 'Gulf of Mexico Dead Zone',
    lat: 29.0,
    lng: -90.0,
    oxygenLevel: 15,
    affectedArea: 15000,
    marineImpact: 0.78,
    severity: 'severe',
    depthRange: '5-30m',
    description: 'Nutrient-driven coastal dead zone',
  },
]

const STATUS_COLORS: Record<OceanDeoxygenationData['severity'], { label: string; color: string; bgClass: string }> = {
  mild: { label: 'Mild', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  anoxic: { label: 'Anoxic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ severity }: { severity: OceanDeoxygenationData['severity'] }) {
  const cfg = STATUS_COLORS[severity]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function OceanDeoxygenationMonitor() {
  const state = useMapStore((s) => s.oceanDeoxygenation)
  const setState = useMapStore((s) => s.setOceanDeoxygenation)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : SAMPLE_LOCATIONS),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.severityFilter !== 'all' && z.severity !== state.severityFilter) return false
      return true
    })
  }, [zones, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalZones: 0, avgOxygen: 0, totalArea: 0, marineImpactIndex: 0 }
    }
    const avgOxygen = filteredZones.reduce((sum, z) => sum + z.oxygenLevel, 0) / filteredZones.length
    const totalArea = filteredZones.reduce((sum, z) => sum + z.affectedArea, 0)
    const marineImpactIndex = filteredZones.reduce((sum, z) => sum + z.marineImpact, 0) / filteredZones.length
    return {
      totalZones: filteredZones.length,
      avgOxygen: Math.round(avgOxygen * 10) / 10,
      totalArea,
      marineImpactIndex: Math.round(marineImpactIndex * 100) / 100,
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
      properties: { id: z.id, name: z.name, severity: z.severity, oxygenLevel: z.oxygenLevel },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.zones.length === 0) {
      useMapStore.getState().setOceanDeoxygenation({ zones: SAMPLE_LOCATIONS })
    }
  }, [state.zones.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OceanDeoxygenationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOxygen', label: 'Oxygen Level', icon: DropletsIcon10 },
    { key: 'showArea', label: 'Affected Area', icon: Layers },
    { key: 'showImpact', label: 'Marine Impact', icon: AlertTriangle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-emerald-950/95 backdrop-blur-xl border border-teal-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <DropletsIcon10 className="h-4 w-4 text-teal-400" />
              Ocean Deoxygenation Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-teal-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({ severityFilter: v as OceanDeoxygenationState['severityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="anoxic">Anoxic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalZones}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Oxygen</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgOxygen}</div>
              <div className="text-[9px] text-teal-400/60">μmol/kg</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Total Area</div>
              <div className="text-sm font-semibold text-orange-400">{(summary.totalArea / 1000).toFixed(0)}k</div>
              <div className="text-[9px] text-teal-400/60">km²</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Marine Impact</div>
              <div className="text-sm font-semibold text-red-400">{summary.marineImpactIndex}</div>
              <div className="text-[9px] text-teal-400/60">index</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Deoxygenation Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_COLORS[zone.severity]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeZoneId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon severity={zone.severity} />
                          <span className="text-xs font-medium text-teal-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showOxygen && (
                          <div>
                            O₂ Level:{' '}
                            <span className="text-teal-100 font-medium">{zone.oxygenLevel}μmol/kg</span>
                          </div>
                        )}
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-teal-100 font-medium">{(zone.affectedArea / 1000).toFixed(0)}k km²</span>
                          </div>
                        )}
                        {state.showImpact && (
                          <div>
                            Marine Impact:{' '}
                            <span className="text-teal-100 font-medium">{zone.marineImpact}</span>
                          </div>
                        )}
                        <div>
                          Depth:{' '}
                          <span className="text-teal-100 font-medium">{zone.depthRange}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-teal-700/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeZone.severity].bgClass}`}
                  >
                    {STATUS_COLORS[activeZone.severity].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-teal-300/60 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400/70">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">O₂ Level: </span>
                    <span className="font-medium text-blue-400">{activeZone.oxygenLevel}μmol/kg</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Affected Area: </span>
                    <span className="font-medium text-orange-400">{(activeZone.affectedArea / 1000).toFixed(0)}k km²</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Marine Impact: </span>
                    <span className="font-medium text-red-400">{activeZone.marineImpact}</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Depth Range: </span>
                    <span className="font-medium text-teal-200">{activeZone.depthRange}</span>
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
