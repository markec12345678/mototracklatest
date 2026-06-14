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
import { useMapStore, type UrbanHeatIslandProfilerState, type HeatIslandZone } from '@/lib/map-store'
import { Thermometer as ThermometerIcon2, X, Gauge, TreePine, Building2, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: HeatIslandZone[] = [
  {
    id: 'uhi-tokyo',
    name: 'Tokyo Central',
    latitude: 35.68,
    longitude: 139.69,
    temperatureDelta: 7.2,
    landCoverType: 'dense_urban',
    surfaceAlbedo: 0.12,
    vegetationIndex: 0.08,
    buildingDensity: 92,
    imperviousSurface: 95,
    coolingEffect: 0.3,
    severity: 'extreme',
  },
  {
    id: 'uhi-phoenix',
    name: 'Phoenix Metro',
    latitude: 33.45,
    longitude: -112.07,
    temperatureDelta: 5.8,
    landCoverType: 'commercial',
    surfaceAlbedo: 0.18,
    vegetationIndex: 0.12,
    buildingDensity: 68,
    imperviousSurface: 82,
    coolingEffect: 0.5,
    severity: 'severe',
  },
  {
    id: 'uhi-manhattan',
    name: 'Manhattan NYC',
    latitude: 40.78,
    longitude: -73.97,
    temperatureDelta: 4.5,
    landCoverType: 'dense_urban',
    surfaceAlbedo: 0.14,
    vegetationIndex: 0.15,
    buildingDensity: 88,
    imperviousSurface: 90,
    coolingEffect: 0.6,
    severity: 'severe',
  },
  {
    id: 'uhi-paris',
    name: 'Paris Central',
    latitude: 48.86,
    longitude: 2.35,
    temperatureDelta: 3.8,
    landCoverType: 'residential',
    surfaceAlbedo: 0.16,
    vegetationIndex: 0.22,
    buildingDensity: 72,
    imperviousSurface: 78,
    coolingEffect: 1.1,
    severity: 'moderate',
  },
  {
    id: 'uhi-delhi',
    name: 'Delhi Core',
    latitude: 28.61,
    longitude: 77.21,
    temperatureDelta: 6.1,
    landCoverType: 'industrial',
    surfaceAlbedo: 0.15,
    vegetationIndex: 0.10,
    buildingDensity: 78,
    imperviousSurface: 88,
    coolingEffect: 0.4,
    severity: 'extreme',
  },
  {
    id: 'uhi-melbourne',
    name: 'Melbourne CBD',
    latitude: -37.81,
    longitude: 144.96,
    temperatureDelta: 2.9,
    landCoverType: 'suburban',
    surfaceAlbedo: 0.20,
    vegetationIndex: 0.28,
    buildingDensity: 55,
    imperviousSurface: 65,
    coolingEffect: 1.5,
    severity: 'mild',
  },
]

const SEVERITY_CONFIG: Record<
  HeatIslandZone['severity'],
  { label: string; color: string; bgClass: string }
> = {
  minimal: { label: 'Minimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  mild: { label: 'Mild', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const LAND_COVER_CONFIG: Record<
  HeatIslandZone['landCoverType'],
  { label: string }
> = {
  dense_urban: { label: 'Dense Urban' },
  commercial: { label: 'Commercial' },
  industrial: { label: 'Industrial' },
  residential: { label: 'Residential' },
  suburban: { label: 'Suburban' },
  green_space: { label: 'Green Space' },
}

export function UrbanHeatIslandProfiler() {
  const state = useMapStore((s) => s.urbanHeatIslandProfiler)
  const setState = useMapStore((s) => s.setUrbanHeatIslandProfiler)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
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
      return { avgTempDelta: 0, avgVegIndex: 0, highSeverityCount: 0 }
    }
    const avgTempDelta =
      filteredZones.reduce((sum, z) => sum + z.temperatureDelta, 0) / filteredZones.length
    const avgVegIndex =
      filteredZones.reduce((sum, z) => sum + z.vegetationIndex, 0) / filteredZones.length
    const highSeverityCount = filteredZones.filter(
      (z) => z.severity === 'severe' || z.severity === 'extreme'
    ).length
    return {
      avgTempDelta: Math.round(avgTempDelta * 10) / 10,
      avgVegIndex: Math.round(avgVegIndex * 100) / 100,
      highSeverityCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof UrbanHeatIslandProfilerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperatureDelta', label: 'Temperature Delta', icon: Gauge },
    { key: 'showVegetationIndex', label: 'Vegetation Index', icon: TreePine },
    { key: 'showBuildingDensity', label: 'Building Density', icon: Building2 },
    { key: 'showSeverity', label: 'Severity', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ThermometerIcon2 className="h-4 w-4 text-red-600" />
              Urban Heat Island Profiler
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
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as UrbanHeatIslandProfilerState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
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
                  <Icon className="h-3 w-3 text-red-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Temp Δ</div>
              <div className="text-sm font-semibold text-red-600">+{summary.avgTempDelta}°C</div>
              <div className="text-[9px] text-muted-foreground">above rural</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Veg Index</div>
              <div className="text-sm font-semibold">{summary.avgVegIndex}</div>
              <div className="text-[9px] text-muted-foreground">NDVI</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Severe/Extreme</div>
              <div className="text-sm font-semibold text-orange-600">{summary.highSeverityCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Heat Island Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const severityCfg = SEVERITY_CONFIG[zone.severity]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-border/40 hover:border-red-500/20 hover:bg-red-500/5'
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
                            style={{ backgroundColor: severityCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${severityCfg.bgClass}`}
                        >
                          {severityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showTemperatureDelta && (
                          <div>
                            Temp Δ:{' '}
                            <span className="text-foreground font-medium">
                              +{zone.temperatureDelta}°C
                            </span>
                          </div>
                        )}
                        {state.showVegetationIndex && (
                          <div>
                            Veg Index:{' '}
                            <span className="text-foreground font-medium">
                              {zone.vegetationIndex}
                            </span>
                          </div>
                        )}
                        {state.showBuildingDensity && (
                          <div>
                            Building:{' '}
                            <span className="text-foreground font-medium">
                              {zone.buildingDensity}%
                            </span>
                          </div>
                        )}
                        {state.showSeverity && (
                          <div>
                            Land Cover:{' '}
                            <span className="text-foreground font-medium">
                              {LAND_COVER_CONFIG[zone.landCoverType].label}
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
              <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SEVERITY_CONFIG[activeZone.severity].bgClass}`}
                  >
                    {SEVERITY_CONFIG[activeZone.severity].label}
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
                    <span className="text-muted-foreground">Temp Delta: </span>
                    <span className="font-medium text-red-600">+{activeZone.temperatureDelta}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Land Cover: </span>
                    <span className="font-medium">
                      {LAND_COVER_CONFIG[activeZone.landCoverType].label}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Surface Albedo: </span>
                    <span className="font-medium">{activeZone.surfaceAlbedo}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vegetation Index: </span>
                    <span className="font-medium">{activeZone.vegetationIndex}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Building Density: </span>
                    <span className="font-medium">{activeZone.buildingDensity}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impervious Surface: </span>
                    <span className="font-medium">{activeZone.imperviousSurface}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cooling Effect: </span>
                    <span className="font-medium">{activeZone.coolingEffect}°C</span>
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
