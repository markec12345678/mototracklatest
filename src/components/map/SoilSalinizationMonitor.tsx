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
import { useMapStore, type SoilSalinizationState, type SoilSalinizationData } from '@/lib/map-store'
import { Leaf as LeafIcon6, X, Layers, Activity, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: SoilSalinizationData[] = [
  {
    id: 'ss-murray',
    name: 'Murray-Darling',
    lat: -34.0,
    lng: 145.0,
    salinityLevel: 15,
    cropYieldLoss: 30,
    affectedArea: 50000,
    severity: 'severe',
    irrigationType: 'flood',
    description: 'Dryland salinity in Australian basin',
  },
  {
    id: 'ss-indus',
    name: 'Indus Valley',
    lat: 27.0,
    lng: 68.0,
    salinityLevel: 20,
    cropYieldLoss: 45,
    affectedArea: 80000,
    severity: 'very_severe',
    irrigationType: 'flood',
    description: 'Ancient irrigation-induced salinization',
  },
  {
    id: 'ss-central',
    name: 'Central Valley',
    lat: 37.0,
    lng: -120.5,
    salinityLevel: 8,
    cropYieldLoss: 15,
    affectedArea: 20000,
    severity: 'moderate',
    irrigationType: 'drip',
    description: 'Agricultural drainage problem area',
  },
  {
    id: 'ss-euphrates',
    name: 'Euphrates Plain',
    lat: 34.0,
    lng: 44.0,
    salinityLevel: 12,
    cropYieldLoss: 25,
    affectedArea: 35000,
    severity: 'severe',
    irrigationType: 'sprinkler',
    description: 'Mesopotamian plain salinization',
  },
]

const STATUS_COLORS: Record<SoilSalinizationData['severity'], { label: string; color: string; bgClass: string }> = {
  slight: { label: 'Slight', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_severe: { label: 'Very Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ severity }: { severity: SoilSalinizationData['severity'] }) {
  const cfg = STATUS_COLORS[severity]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SoilSalinizationMonitor() {
  const state = useMapStore((s) => s.soilSalinization)
  const setState = useMapStore((s) => s.setSoilSalinization)

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
      return { totalZones: 0, avgSalinity: 0, totalAffectedArea: 0, avgYieldLoss: 0 }
    }
    const avgSalinity = filteredZones.reduce((sum, z) => sum + z.salinityLevel, 0) / filteredZones.length
    const totalAffectedArea = filteredZones.reduce((sum, z) => sum + z.affectedArea, 0)
    const avgYieldLoss = filteredZones.reduce((sum, z) => sum + z.cropYieldLoss, 0) / filteredZones.length
    return {
      totalZones: filteredZones.length,
      avgSalinity: Math.round(avgSalinity * 10) / 10,
      totalAffectedArea,
      avgYieldLoss: Math.round(avgYieldLoss * 10) / 10,
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
      properties: { id: z.id, name: z.name, severity: z.severity, salinityLevel: z.salinityLevel },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.zones.length === 0) {
      useMapStore.getState().setSoilSalinization({ zones: SAMPLE_LOCATIONS })
    }
  }, [state.zones.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SoilSalinizationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSalinity', label: 'Salinity Level', icon: Layers },
    { key: 'showCropImpact', label: 'Crop Impact', icon: AlertTriangle },
    { key: 'showArea', label: 'Affected Area', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-stone-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <LeafIcon6 className="h-4 w-4 text-emerald-400" />
              Soil Salinization Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-emerald-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({ severityFilter: v as SoilSalinizationState['severityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="slight">Slight</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="very_severe">Very Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
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

          <Separator className="bg-emerald-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalZones}</div>
              <div className="text-[9px] text-emerald-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Salinity</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgSalinity}</div>
              <div className="text-[9px] text-emerald-400/60">dS/m</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Total Affected Area</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalAffectedArea.toLocaleString()}</div>
              <div className="text-[9px] text-emerald-400/60">km²</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Yield Loss</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgYieldLoss}%</div>
              <div className="text-[9px] text-emerald-400/60">crop impact</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
              Salinization Zones ({filteredZones.length})
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
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/30 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeZoneId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon severity={zone.severity} />
                          <span className="text-xs font-medium text-emerald-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/60">
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-emerald-100 font-medium">{zone.salinityLevel} dS/m</span>
                          </div>
                        )}
                        {state.showCropImpact && (
                          <div>
                            Yield Loss:{' '}
                            <span className="text-emerald-100 font-medium">{zone.cropYieldLoss}%</span>
                          </div>
                        )}
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-emerald-100 font-medium">{zone.affectedArea.toLocaleString()}km²</span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Irrigation:{' '}
                            <span className="text-emerald-100 font-medium">{zone.irrigationType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-emerald-700/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeZone.severity].bgClass}`}
                  >
                    {STATUS_COLORS[activeZone.severity].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-emerald-300/60 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400/70">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Salinity: </span>
                    <span className="font-medium text-orange-400">{activeZone.salinityLevel} dS/m</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Yield Loss: </span>
                    <span className="font-medium text-red-400">{activeZone.cropYieldLoss}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Affected Area: </span>
                    <span className="font-medium text-emerald-100">{activeZone.affectedArea.toLocaleString()}km²</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Irrigation: </span>
                    <span className="font-medium text-emerald-100">{activeZone.irrigationType}</span>
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
