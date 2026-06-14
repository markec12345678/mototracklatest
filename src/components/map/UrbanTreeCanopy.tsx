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
import { useMapStore, type UrbanTreeCanopyData, type UrbanTreeCanopyState } from '@/lib/map-store'
import { TreePine as TreePineIcon4, X, Leaf, Thermometer, Wind, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: UrbanTreeCanopyData[] = [
  {
    id: 'utc-sg-central',
    name: 'Singapore Central',
    lat: 1.35,
    lng: 103.85,
    canopyCoverage: 47,
    treeDensity: 180,
    airQualityBenefit: 85,
    heatReduction: 3.5,
    biodiversityIndex: 0.72,
    status: 'excellent',
    description: 'Singapore - City in a Garden strategy',
  },
  {
    id: 'utc-nyc',
    name: 'New York City',
    lat: 40.75,
    lng: -73.95,
    canopyCoverage: 22,
    treeDensity: 65,
    airQualityBenefit: 45,
    heatReduction: 1.8,
    biodiversityIndex: 0.38,
    status: 'moderate',
    description: 'NYC - MillionTrees campaign',
  },
  {
    id: 'utc-london',
    name: 'London Boroughs',
    lat: 51.50,
    lng: -0.12,
    canopyCoverage: 28,
    treeDensity: 82,
    airQualityBenefit: 55,
    heatReduction: 2.2,
    biodiversityIndex: 0.45,
    status: 'good',
    description: 'UK - Urban Forest Plan',
  },
  {
    id: 'utc-tokyo',
    name: 'Tokyo Wards',
    lat: 35.68,
    lng: 139.70,
    canopyCoverage: 18,
    treeDensity: 48,
    airQualityBenefit: 35,
    heatReduction: 1.2,
    biodiversityIndex: 0.30,
    status: 'poor',
    description: 'Japan - Concrete city heat island',
  },
  {
    id: 'utc-melbourne',
    name: 'Melbourne',
    lat: -37.80,
    lng: 145.00,
    canopyCoverage: 25,
    treeDensity: 72,
    airQualityBenefit: 50,
    heatReduction: 2.0,
    biodiversityIndex: 0.52,
    status: 'good',
    description: 'Australia - Urban Forest Strategy',
  },
  {
    id: 'utc-detroit',
    name: 'Detroit Metro',
    lat: 42.35,
    lng: -83.05,
    canopyCoverage: 15,
    treeDensity: 32,
    airQualityBenefit: 22,
    heatReduction: 0.8,
    biodiversityIndex: 0.20,
    status: 'critical',
    description: 'Michigan - Vacant lot reforestation',
  },
]

const STATUS_CONFIG: Record<
  UrbanTreeCanopyData['status'],
  { label: string; color: string; bgClass: string }
> = {
  excellent: { label: 'Excellent', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  poor: { label: 'Poor', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function UrbanTreeCanopy() {
  const state = useMapStore((s) => s.urbanTreeCanopy)
  const setState = useMapStore.getState().setUrbanTreeCanopy

  // Initialize demo data on mount if zones array is empty
  useEffect(() => {
    if (useMapStore.getState().urbanTreeCanopy.zones.length === 0) {
      useMapStore.getState().setUrbanTreeCanopy({ zones: DEMO_ZONES })
    }
  }, [])

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.typeFilter !== 'all') {
        // Map zone type based on status/description for filtering
        // Since zones don't have an explicit type field, we derive it from the zone id
        // For demo purposes, we assign types based on the zone characteristics
      }
      return true
    }).filter((z) => {
      // Type filter logic: derive zone type from id patterns for demo
      const zoneType = getZoneType(z.id)
      if (state.typeFilter !== 'all' && zoneType !== state.typeFilter) return false
      return true
    })
  }, [zones, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgCanopyCoverage: 0, avgHeatReduction: 0, poorCriticalCount: 0 }
    }
    const avgCanopyCoverage = filteredZones.reduce((sum, z) => sum + z.canopyCoverage, 0) / filteredZones.length
    const avgHeatReduction = filteredZones.reduce((sum, z) => sum + z.heatReduction, 0) / filteredZones.length
    const poorCriticalCount = filteredZones.filter(
      (z) => z.status === 'poor' || z.status === 'critical'
    ).length
    return {
      avgCanopyCoverage: Math.round(avgCanopyCoverage * 10) / 10,
      avgHeatReduction: Math.round(avgHeatReduction * 10) / 10,
      poorCriticalCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof UrbanTreeCanopyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCanopyCoverage', label: 'Canopy Coverage', icon: Leaf },
    { key: 'showTreeDensity', label: 'Tree Density', icon: TreePineIcon4 },
    { key: 'showAirQualityBenefit', label: 'Air Quality Benefit', icon: Wind },
    { key: 'showHeatReduction', label: 'Heat Reduction', icon: Thermometer },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-emerald-800/30 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <TreePineIcon4 className="h-4 w-4 text-emerald-400" />
              Urban Tree Canopy
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
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-emerald-300/70 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Zone Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as UrbanTreeCanopyState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/30 text-emerald-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="park">Park</SelectItem>
                <SelectItem value="street">Street</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-700/20" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/70">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
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

          <Separator className="bg-emerald-700/20" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-700/20 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-300/60">Avg Canopy</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.avgCanopyCoverage}%</div>
              <div className="text-[9px] text-emerald-300/50">coverage</div>
            </div>
            <div className="rounded-lg border border-emerald-700/20 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-300/60">Avg Heat Red.</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.avgHeatReduction}°C</div>
              <div className="text-[9px] text-emerald-300/50">reduction</div>
            </div>
            <div className="rounded-lg border border-emerald-700/20 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-300/60">Poor/Critical</div>
              <div className="text-sm font-semibold text-red-400">{summary.poorCriticalCount}</div>
              <div className="text-[9px] text-emerald-300/50">zones</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/20" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/70">
              Tree Canopy Zones ({filteredZones.length})
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
                          ? 'border-emerald-500/50 bg-emerald-800/20'
                          : 'border-emerald-700/20 hover:border-emerald-600/30 hover:bg-emerald-800/10'
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
                        {state.showCanopyCoverage && (
                          <div>
                            Canopy:{' '}
                            <span className="text-emerald-100 font-medium">
                              {zone.canopyCoverage}%
                            </span>
                          </div>
                        )}
                        {state.showTreeDensity && (
                          <div>
                            Density:{' '}
                            <span className="text-emerald-100 font-medium">
                              {zone.treeDensity} trees/ha
                            </span>
                          </div>
                        )}
                        {state.showAirQualityBenefit && (
                          <div>
                            Air Qual.:{' '}
                            <span className="text-emerald-100 font-medium">
                              {zone.airQualityBenefit}%
                            </span>
                          </div>
                        )}
                        {state.showHeatReduction && (
                          <div>
                            Heat Red.:{' '}
                            <span className="text-emerald-100 font-medium">
                              {zone.heatReduction}°C
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-emerald-300/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-emerald-700/20" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-300/60">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeZone.lat.toFixed(2)}, {activeZone.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-300/60">Canopy: </span>
                    <span className="font-medium text-emerald-100">{activeZone.canopyCoverage}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-300/60">Density: </span>
                    <span className="font-medium text-emerald-100">{activeZone.treeDensity} trees/ha</span>
                  </div>
                  <div>
                    <span className="text-emerald-300/60">Air Quality: </span>
                    <span className="font-medium text-emerald-100">{activeZone.airQualityBenefit}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-300/60">Heat Red.: </span>
                    <span className="font-medium text-emerald-100">{activeZone.heatReduction}°C</span>
                  </div>
                  <div>
                    <span className="text-emerald-300/60">Biodiversity: </span>
                    <span className="font-medium text-emerald-100">{activeZone.biodiversityIndex.toFixed(2)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-emerald-300/60">Description: </span>
                    <span className="font-medium text-emerald-100">{activeZone.description}</span>
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

// Helper to derive zone type from id for demo filtering purposes
function getZoneType(id: string): 'park' | 'street' | 'residential' | 'industrial' {
  if (id.includes('central') || id.includes('sg')) return 'park'
  if (id.includes('nyc') || id.includes('tokyo')) return 'street'
  if (id.includes('london') || id.includes('melbourne')) return 'residential'
  if (id.includes('detroit')) return 'industrial'
  return 'park'
}
