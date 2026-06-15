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
import { useMapStore, type SubsidenceHazardState, type SubsidenceHazardData } from '@/lib/map-store'
import { ArrowDown as ArrowDownIcon4, X, Layers, Activity, AlertTriangle, MapPin, Filter, TrendingDown } from 'lucide-react'

const SAMPLE_LOCATIONS: SubsidenceHazardData[] = [
  {
    id: 'sh-jakarta',
    name: 'Jakarta Basin',
    lat: -6.2,
    lng: 106.8,
    subsidenceRate: 25,
    totalSubsidence: 4,
    infrastructureRisk: 0.95,
    cause: 'groundwater',
    risk: 'critical',
    description: 'Fastest sinking city in the world',
  },
  {
    id: 'sh-mexico-city',
    name: 'Mexico City',
    lat: 19.4,
    lng: -99.1,
    subsidenceRate: 20,
    totalSubsidence: 9,
    infrastructureRisk: 0.88,
    cause: 'groundwater',
    risk: 'critical',
    description: 'Historic lakebed subsidence',
  },
  {
    id: 'sh-san-joaquin',
    name: 'San Joaquin Valley',
    lat: 36.5,
    lng: -120.0,
    subsidenceRate: 5,
    totalSubsidence: 8.5,
    infrastructureRisk: 0.72,
    cause: 'groundwater',
    risk: 'high',
    description: 'Agricultural groundwater depletion zone',
  },
  {
    id: 'sh-north-sea',
    name: 'North Sea Gas',
    lat: 53.5,
    lng: 4.0,
    subsidenceRate: 2,
    totalSubsidence: 0.5,
    infrastructureRisk: 0.45,
    cause: 'oil_extraction',
    risk: 'moderate',
    description: 'Gas extraction induced subsidence',
  },
]

const STATUS_COLORS: Record<SubsidenceHazardData['risk'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const CAUSE_LABELS: Record<SubsidenceHazardData['cause'], string> = {
  groundwater: 'Groundwater',
  mining: 'Mining',
  oil_extraction: 'Oil Extraction',
  natural_compaction: 'Natural Compaction',
}

function TrendIcon({ risk }: { risk: SubsidenceHazardData['risk'] }) {
  const cfg = STATUS_COLORS[risk]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SubsidenceHazardMonitor() {
  const state = useMapStore((s) => s.subsidenceHazard)
  const setState = useMapStore((s) => s.setSubsidenceHazard)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : SAMPLE_LOCATIONS),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.riskFilter !== 'all' && z.risk !== state.riskFilter) return false
      return true
    })
  }, [zones, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalZones: 0, avgSubsidenceRate: 0, maxTotalSubsidence: 0, infraRisk: 0 }
    }
    const avgSubsidenceRate = filteredZones.reduce((sum, z) => sum + z.subsidenceRate, 0) / filteredZones.length
    const maxTotalSubsidence = Math.max(...filteredZones.map((z) => z.totalSubsidence))
    const infraRisk = filteredZones.reduce((sum, z) => sum + z.infrastructureRisk, 0) / filteredZones.length
    return {
      totalZones: filteredZones.length,
      avgSubsidenceRate: Math.round(avgSubsidenceRate * 10) / 10,
      maxTotalSubsidence,
      infraRisk: Math.round(infraRisk * 100) / 100,
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
      properties: { id: z.id, name: z.name, risk: z.risk, subsidenceRate: z.subsidenceRate },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.zones.length === 0) {
      useMapStore.getState().setSubsidenceHazard({ zones: SAMPLE_LOCATIONS })
    }
  }, [state.zones.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubsidenceHazardState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRate', label: 'Subsidence Rate', icon: TrendingDown },
    { key: 'showRisk', label: 'Risk Level', icon: AlertTriangle },
    { key: 'showInfrastructure', label: 'Infrastructure Risk', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-950/95 to-stone-950/95 backdrop-blur-xl border border-rose-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-rose-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-100">
              <ArrowDownIcon4 className="h-4 w-4 text-rose-400" />
              Subsidence Hazard Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-300 hover:text-rose-100 hover:bg-rose-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-rose-100">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-rose-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({ riskFilter: v as SubsidenceHazardState['riskFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-rose-900/40 border-rose-700/40 text-rose-100 hover:bg-rose-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rose-200">
                  <Icon className="h-3 w-3 text-rose-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-rose-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-rose-200">{summary.totalZones}</div>
              <div className="text-[9px] text-rose-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Avg Subsidence Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgSubsidenceRate}</div>
              <div className="text-[9px] text-rose-400/60">cm/yr</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Max Total Subsidence</div>
              <div className="text-sm font-semibold text-rose-200">{summary.maxTotalSubsidence}</div>
              <div className="text-[9px] text-rose-400/60">meters</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Infrastructure Risk</div>
              <div className="text-sm font-semibold text-orange-400">{(summary.infraRisk * 100).toFixed(0)}%</div>
              <div className="text-[9px] text-rose-400/60">avg index</div>
            </div>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">
              Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_COLORS[zone.risk]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-800/30'
                          : 'border-rose-700/30 hover:border-rose-500/30 hover:bg-rose-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeZoneId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon risk={zone.risk} />
                          <span className="text-xs font-medium text-rose-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-rose-300/60">
                        {state.showRate && (
                          <div>
                            Rate:{' '}
                            <span className="text-rose-100 font-medium">{zone.subsidenceRate}cm/yr</span>
                          </div>
                        )}
                        {state.showRisk && (
                          <div>
                            Total:{' '}
                            <span className="text-rose-100 font-medium">{zone.totalSubsidence}m</span>
                          </div>
                        )}
                        {state.showInfrastructure && (
                          <div>
                            Infra Risk:{' '}
                            <span className="text-orange-400 font-medium">{(zone.infrastructureRisk * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        <div>
                          Cause:{' '}
                          <span className="text-rose-100 font-medium">{CAUSE_LABELS[zone.cause]}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-rose-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-rose-700/30" />
              <div className="space-y-2 rounded-lg border border-rose-600/30 bg-rose-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeZone.risk].bgClass}`}
                  >
                    {STATUS_COLORS[activeZone.risk].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-rose-300/60 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-rose-400/70">Coordinates: </span>
                    <span className="font-medium text-rose-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Subsidence Rate: </span>
                    <span className="font-medium text-orange-400">{activeZone.subsidenceRate}cm/yr</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Total Subsidence: </span>
                    <span className="font-medium text-rose-100">{activeZone.totalSubsidence}m</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Infrastructure Risk: </span>
                    <span className="font-medium text-orange-400">{(activeZone.infrastructureRisk * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Cause: </span>
                    <span className="font-medium text-rose-100">{CAUSE_LABELS[activeZone.cause]}</span>
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
