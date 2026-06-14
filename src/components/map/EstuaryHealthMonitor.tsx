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
import { useMapStore, type EstuaryHealthState, type EstuaryHealth } from '@/lib/map-store'
import { Waves as WavesIcon10, X, Droplets, Fish, MapPin, Filter, Heart } from 'lucide-react'

const DEMO_ESTUARIES: EstuaryHealth[] = [
  {
    id: 'eh-chesapeake',
    name: 'Chesapeake Bay',
    lat: 37.5,
    lng: -76.4,
    area: 11600,
    salinityGradient: 18.5,
    nutrientLevel: 3.8,
    dissolvedOxygen: 5.2,
    chlorophyllConcentration: 22.5,
    fishBiodiversity: 0.58,
    sedimentLoad: 45.0,
    estuaryType: 'drowned_river',
    healthStatus: 'moderate',
  },
  {
    id: 'eh-thames',
    name: 'Thames Estuary',
    lat: 51.5,
    lng: 0.5,
    area: 880,
    salinityGradient: 12.3,
    nutrientLevel: 2.1,
    dissolvedOxygen: 7.8,
    chlorophyllConcentration: 8.4,
    fishBiodiversity: 0.65,
    sedimentLoad: 28.0,
    estuaryType: 'drowned_river',
    healthStatus: 'good',
  },
  {
    id: 'eh-ganges',
    name: 'Ganges Delta',
    lat: 22.0,
    lng: 89.0,
    area: 105600,
    salinityGradient: 22.1,
    nutrientLevel: 6.2,
    dissolvedOxygen: 3.8,
    chlorophyllConcentration: 38.7,
    fishBiodiversity: 0.71,
    sedimentLoad: 95.0,
    estuaryType: 'delta_front',
    healthStatus: 'degraded',
  },
  {
    id: 'eh-sfbay',
    name: 'San Francisco Bay',
    lat: 37.8,
    lng: -122.4,
    area: 4000,
    salinityGradient: 15.7,
    nutrientLevel: 1.9,
    dissolvedOxygen: 8.1,
    chlorophyllConcentration: 6.2,
    fishBiodiversity: 0.62,
    sedimentLoad: 18.0,
    estuaryType: 'tectonic',
    healthStatus: 'good',
  },
  {
    id: 'eh-amazon',
    name: 'Amazon Estuary',
    lat: -0.5,
    lng: -49.0,
    area: 325000,
    salinityGradient: 28.4,
    nutrientLevel: 1.2,
    dissolvedOxygen: 9.5,
    chlorophyllConcentration: 4.1,
    fishBiodiversity: 0.89,
    sedimentLoad: 120.0,
    estuaryType: 'delta_front',
    healthStatus: 'excellent',
  },
  {
    id: 'eh-elbe',
    name: 'Elbe Estuary',
    lat: 53.9,
    lng: 9.5,
    area: 780,
    salinityGradient: 10.8,
    nutrientLevel: 3.2,
    dissolvedOxygen: 6.0,
    chlorophyllConcentration: 15.3,
    fishBiodiversity: 0.52,
    sedimentLoad: 35.0,
    estuaryType: 'drowned_river',
    healthStatus: 'moderate',
  },
]

const HEALTH_CONFIG: Record<
  EstuaryHealth['healthStatus'],
  { label: string; color: string; bgClass: string }
> = {
  excellent: { label: 'Excellent', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const ESTUARY_TYPE_LABELS: Record<EstuaryHealth['estuaryType'], string> = {
  drowned_river: 'Drowned River',
  bar_built: 'Bar-Built',
  tectonic: 'Tectonic',
  fjord: 'Fjord',
  delta_front: 'Delta Front',
}

export function EstuaryHealthMonitor() {
  const state = useMapStore((s) => s.estuaryHealth)
  const setState = useMapStore((s) => s.setEstuaryHealth)

  const estuaries = useMemo(
    () => (state.estuaries && state.estuaries.length > 0 ? state.estuaries : DEMO_ESTUARIES),
    [state.estuaries]
  )

  const filteredEstuaries = useMemo(() => {
    return estuaries.filter((e) => {
      if (state.typeFilter !== 'all' && e.estuaryType !== state.typeFilter) return false
      return true
    })
  }, [estuaries, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredEstuaries.length === 0) {
      return { avgDissolvedOxygen: 0, avgFishBiodiversity: 0, criticalCount: 0 }
    }
    const avgDissolvedOxygen = filteredEstuaries.reduce((sum, e) => sum + e.dissolvedOxygen, 0) / filteredEstuaries.length
    const avgFishBiodiversity = filteredEstuaries.reduce((sum, e) => sum + e.fishBiodiversity, 0) / filteredEstuaries.length
    const criticalCount = filteredEstuaries.filter(
      (e) => e.healthStatus === 'degraded' || e.healthStatus === 'critical'
    ).length
    return {
      avgDissolvedOxygen: Math.round(avgDissolvedOxygen * 10) / 10,
      avgFishBiodiversity: Math.round(avgFishBiodiversity * 100) / 100,
      criticalCount,
    }
  }, [filteredEstuaries])

  const activeEstuary = useMemo(
    () => estuaries.find((e) => e.id === state.activeEstuaryId) ?? null,
    [estuaries, state.activeEstuaryId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof EstuaryHealthState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showNutrientLevel', label: 'Nutrient Level', icon: Droplets },
    { key: 'showDissolvedOxygen', label: 'Dissolved Oxygen', icon: Heart },
    { key: 'showFishBiodiversity', label: 'Fish Biodiversity', icon: Fish },
    { key: 'showHealthStatus', label: 'Health Status', icon: WavesIcon10 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WavesIcon10 className="h-4 w-4 text-teal-600" />
              Estuary Health Monitor
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
          {/* Estuary Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Estuary Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as EstuaryHealthState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Estuary Types</SelectItem>
                <SelectItem value="drowned_river">Drowned River</SelectItem>
                <SelectItem value="bar_built">Bar-Built</SelectItem>
                <SelectItem value="tectonic">Tectonic</SelectItem>
                <SelectItem value="fjord">Fjord</SelectItem>
                <SelectItem value="delta_front">Delta Front</SelectItem>
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
                  <Icon className="h-3 w-3 text-teal-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Dissolved O₂</div>
              <div className="text-sm font-semibold text-teal-600">{summary.avgDissolvedOxygen}</div>
              <div className="text-[9px] text-muted-foreground">mg/L</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Fish Biodiv.</div>
              <div className="text-sm font-semibold text-green-600">{summary.avgFishBiodiversity}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Degraded+</div>
              <div className="text-sm font-semibold text-orange-600">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">estuaries</div>
            </div>
          </div>

          <Separator />

          {/* Estuary List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Estuaries ({filteredEstuaries.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEstuaries.map((estuary) => {
                  const isActive = state.activeEstuaryId === estuary.id
                  const healthCfg = HEALTH_CONFIG[estuary.healthStatus]
                  return (
                    <div
                      key={estuary.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeEstuaryId: isActive ? null : estuary.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: healthCfg.color }}
                          />
                          <span className="text-xs font-medium">{estuary.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${healthCfg.bgClass}`}
                        >
                          {healthCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showNutrientLevel && (
                          <div>
                            Nutrients: <span className="text-foreground font-medium">{estuary.nutrientLevel} mg/L</span>
                          </div>
                        )}
                        {state.showDissolvedOxygen && (
                          <div>
                            Dissolved O₂: <span className="text-foreground font-medium">{estuary.dissolvedOxygen} mg/L</span>
                          </div>
                        )}
                        {state.showFishBiodiversity && (
                          <div>
                            Fish Biodiv.: <span className="text-foreground font-medium">{(estuary.fishBiodiversity * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {state.showHealthStatus && (
                          <div>
                            Area: <span className="text-foreground font-medium">{estuary.area.toLocaleString()} km²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEstuaries.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No estuaries match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Estuary Details */}
          {activeEstuary && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-xs font-semibold">{activeEstuary.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${HEALTH_CONFIG[activeEstuary.healthStatus].bgClass}`}
                  >
                    {HEALTH_CONFIG[activeEstuary.healthStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeEstuary.lat.toFixed(2)}, {activeEstuary.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estuary Type: </span>
                    <span className="font-medium">{ESTUARY_TYPE_LABELS[activeEstuary.estuaryType]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeEstuary.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salinity Gradient: </span>
                    <span className="font-medium">{activeEstuary.salinityGradient} PSU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dissolved O₂: </span>
                    <span className="font-medium">{activeEstuary.dissolvedOxygen} mg/L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nutrient Level: </span>
                    <span className="font-medium">{activeEstuary.nutrientLevel} mg/L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chlorophyll: </span>
                    <span className="font-medium">{activeEstuary.chlorophyllConcentration} μg/L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fish Biodiversity: </span>
                    <span className="font-medium">{(activeEstuary.fishBiodiversity * 100).toFixed(0)}%</span>
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
