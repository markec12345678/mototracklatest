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
import { useMapStore, type VectorHabitatRiskState, type VectorHabitatRiskData } from '@/lib/map-store'
import { Bug as BugIcon6, X, Activity, Thermometer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: VectorHabitatRiskData[] = [
  {
    id: 'vhr-amazon',
    name: 'Amazon Basin',
    lat: -3.500,
    lng: -60.000,
    habitatSuitability: 92,
    vectorDensity: 45,
    diseasePrevalence: 78,
    seasonalityIndex: 85,
    status: 'extreme',
    description: 'High vector habitat suitability in the Amazon Basin with year-round transmission',
  },
  {
    id: 'vhr-mekong',
    name: 'Mekong Delta',
    lat: 10.000,
    lng: 106.000,
    habitatSuitability: 78,
    vectorDensity: 32,
    diseasePrevalence: 62,
    seasonalityIndex: 72,
    status: 'high',
    description: 'Mekong Delta with seasonal peak in dengue and malaria vector activity',
  },
  {
    id: 'vhr-victoria',
    name: 'Lake Victoria',
    lat: -1.000,
    lng: 33.500,
    habitatSuitability: 65,
    vectorDensity: 28,
    diseasePrevalence: 55,
    seasonalityIndex: 68,
    status: 'moderate',
    description: 'Lake Victoria region with moderate malaria vector habitat risk during rainy seasons',
  },
  {
    id: 'vhr-caribbean',
    name: 'Caribbean',
    lat: 18.500,
    lng: -72.000,
    habitatSuitability: 42,
    vectorDensity: 15,
    diseasePrevalence: 30,
    seasonalityIndex: 45,
    status: 'low',
    description: 'Caribbean islands with seasonal Aedes mosquito activity during wet months',
  },
]

const STATUS_COLORS: Record<VectorHabitatRiskData['status'], { label: string; color: string; bgClass: string }> = {
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  high: { label: 'High', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  minimal: { label: 'Minimal', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
}

function TrendIcon({ status }: { status: VectorHabitatRiskData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VectorHabitatRiskMonitor() {
  const state = useMapStore((s) => s.vectorHabitatRisk)
  const setState = useMapStore((s) => s.setVectorHabitatRisk)

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
      return { totalZones: 0, avgRisk: 0, avgDensity: 0, avgSeason: 0 }
    }
    const avgRisk = filteredItems.reduce((sum, e) => sum + e.habitatSuitability, 0) / filteredItems.length
    const avgDensity = filteredItems.reduce((sum, e) => sum + e.vectorDensity, 0) / filteredItems.length
    const avgSeason = filteredItems.reduce((sum, e) => sum + e.seasonalityIndex, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgRisk: Math.round(avgRisk),
      avgDensity: Math.round(avgDensity),
      avgSeason: Math.round(avgSeason),
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
      properties: { id: e.id, name: e.name, status: e.status, habitatSuitability: e.habitatSuitability },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setVectorHabitatRisk({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VectorHabitatRiskState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showHabitatSuitability', label: 'Risk Index', icon: Activity },
    { key: 'showVectorDensity', label: 'Breeding Sites', icon: BugIcon6 },
    { key: 'showDiseasePrevalence', label: 'Species Count', icon: MapPin },
    { key: 'showSeasonalityIndex', label: 'Season Factor', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-amber-950/95 backdrop-blur-xl border border-orange-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <BugIcon6 className="h-4 w-4 text-orange-400" />
              Vector Habitat Risk Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-300 hover:text-orange-100 hover:bg-orange-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-orange-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-orange-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as VectorHabitatRiskState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-orange-200">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Risk Index</div>
              <div className="text-sm font-semibold text-orange-300">{summary.avgRisk}</div>
              <div className="text-[9px] text-orange-400/60">average</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Breeding Sites</div>
              <div className="text-sm font-semibold text-amber-300">{summary.avgDensity}</div>
              <div className="text-[9px] text-orange-400/60">per trap/night</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Season Factor</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgSeason}</div>
              <div className="text-[9px] text-orange-400/60">seasonality index</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Zones</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalZones}</div>
              <div className="text-[9px] text-orange-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
              Habitat Zones ({filteredItems.length})
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
                          ? 'border-orange-500/50 bg-orange-800/30'
                          : 'border-orange-700/30 hover:border-orange-500/30 hover:bg-orange-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-orange-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/60">
                        {state.showHabitatSuitability && (
                          <div>
                            Risk:{' '}
                            <span className="text-orange-100 font-medium">{e.habitatSuitability}</span>
                          </div>
                        )}
                        {state.showVectorDensity && (
                          <div>
                            Density:{' '}
                            <span className="text-orange-100 font-medium">{e.vectorDensity}/trap</span>
                          </div>
                        )}
                        {state.showDiseasePrevalence && (
                          <div>
                            Prevalence:{' '}
                            <span className="text-orange-100 font-medium">{e.diseasePrevalence}%</span>
                          </div>
                        )}
                        {state.showSeasonalityIndex && (
                          <div>
                            Season:{' '}
                            <span className="text-orange-100 font-medium">{e.seasonalityIndex}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-orange-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-orange-700/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-orange-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-orange-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-orange-400/70">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Risk: </span>
                    <span className="font-medium text-orange-300">{activeItem.habitatSuitability}</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Density: </span>
                    <span className="font-medium text-amber-300">{activeItem.vectorDensity}/trap</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Season: </span>
                    <span className="font-medium text-yellow-400">{activeItem.seasonalityIndex}</span>
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
