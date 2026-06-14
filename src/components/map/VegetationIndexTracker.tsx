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
import { useMapStore, type VegetationIndexState, type VegetationZone } from '@/lib/map-store'
import { Leaf as LeafIcon, X, BarChart3, Activity, MapPin, Filter, Heart } from 'lucide-react'

const DEMO_ZONES: VegetationZone[] = [
  {
    id: 'vi-amazon',
    name: 'Amazon Rainforest',
    latitude: -3.47,
    longitude: -62.22,
    vegetationType: 'forest',
    ndvi: 0.82,
    evi: 0.58,
    lai: 6.8,
    fpar: 0.91,
    healthStatus: 'excellent',
  },
  {
    id: 'vi-sahel',
    name: 'Sahel Grassland',
    latitude: 13.50,
    longitude: 2.10,
    vegetationType: 'grassland',
    ndvi: 0.35,
    evi: 0.22,
    lai: 1.4,
    fpar: 0.42,
    healthStatus: 'moderate',
  },
  {
    id: 'vi-pantanal',
    name: 'Pantanal Wetland',
    latitude: -17.80,
    longitude: -56.70,
    vegetationType: 'wetland',
    ndvi: 0.71,
    evi: 0.45,
    lai: 4.2,
    fpar: 0.78,
    healthStatus: 'good',
  },
  {
    id: 'vi-cornbelt',
    name: 'US Corn Belt',
    latitude: 41.50,
    longitude: -89.00,
    vegetationType: 'agricultural',
    ndvi: 0.68,
    evi: 0.42,
    lai: 3.8,
    fpar: 0.72,
    healthStatus: 'good',
  },
  {
    id: 'vi-siberia',
    name: 'Siberian Tundra',
    latitude: 68.00,
    longitude: 95.00,
    vegetationType: 'tundra',
    ndvi: 0.18,
    evi: 0.09,
    lai: 0.6,
    fpar: 0.22,
    healthStatus: 'poor',
  },
  {
    id: 'vi-sonoran',
    name: 'Sonoran Desert',
    latitude: 32.00,
    longitude: -112.00,
    vegetationType: 'desert_scrub',
    ndvi: 0.08,
    evi: 0.04,
    lai: 0.3,
    fpar: 0.12,
    healthStatus: 'critical',
  },
]

const HEALTH_CONFIG: Record<
  VegetationZone['healthStatus'],
  { label: string; color: string; bgClass: string }
> = {
  excellent: { label: 'Excellent', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  poor: { label: 'Poor', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_CONFIG: Record<
  VegetationZone['vegetationType'],
  { label: string }
> = {
  forest: { label: 'Forest' },
  grassland: { label: 'Grassland' },
  wetland: { label: 'Wetland' },
  agricultural: { label: 'Agricultural' },
  tundra: { label: 'Tundra' },
  desert_scrub: { label: 'Desert Scrub' },
}

export function VegetationIndexTracker() {
  const state = useMapStore((s) => s.vegetationIndex)
  const setState = useMapStore((s) => s.setVegetationIndex)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.typeFilter !== 'all' && z.vegetationType !== state.typeFilter) return false
      return true
    })
  }, [zones, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgNDVI: 0, avgEVI: 0, poorCriticalCount: 0 }
    }
    const avgNDVI = filteredZones.reduce((sum, z) => sum + z.ndvi, 0) / filteredZones.length
    const avgEVI = filteredZones.reduce((sum, z) => sum + z.evi, 0) / filteredZones.length
    const poorCriticalCount = filteredZones.filter(
      (z) => z.healthStatus === 'poor' || z.healthStatus === 'critical'
    ).length
    return {
      avgNDVI: Math.round(avgNDVI * 100) / 100,
      avgEVI: Math.round(avgEVI * 100) / 100,
      poorCriticalCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VegetationIndexState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showNDVI', label: 'NDVI', icon: BarChart3 },
    { key: 'showEVI', label: 'EVI', icon: Activity },
    { key: 'showLAI', label: 'LAI', icon: LeafIcon },
    { key: 'showHealth', label: 'Health Status', icon: Heart },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <LeafIcon className="h-4 w-4 text-green-600" />
              Vegetation Index Tracker
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
              Vegetation Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as VegetationIndexState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="grassland">Grassland</SelectItem>
                <SelectItem value="wetland">Wetland</SelectItem>
                <SelectItem value="agricultural">Agricultural</SelectItem>
                <SelectItem value="tundra">Tundra</SelectItem>
                <SelectItem value="desert_scrub">Desert Scrub</SelectItem>
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
                  <Icon className="h-3 w-3 text-green-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg NDVI</div>
              <div className="text-sm font-semibold">{summary.avgNDVI.toFixed(2)}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg EVI</div>
              <div className="text-sm font-semibold text-green-600">{summary.avgEVI.toFixed(2)}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Poor+Critical</div>
              <div className="text-sm font-semibold text-red-600">{summary.poorCriticalCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Vegetation Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const healthCfg = HEALTH_CONFIG[zone.healthStatus]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-border/40 hover:border-green-500/20 hover:bg-green-500/5'
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
                            style={{ backgroundColor: healthCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${healthCfg.bgClass}`}
                        >
                          {healthCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showNDVI && (
                          <div>
                            NDVI:{' '}
                            <span className="text-foreground font-medium">
                              {zone.ndvi.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {state.showEVI && (
                          <div>
                            EVI:{' '}
                            <span className="text-foreground font-medium">
                              {zone.evi.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {state.showLAI && (
                          <div>
                            LAI:{' '}
                            <span className="text-foreground font-medium">
                              {zone.lai.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {state.showHealth && (
                          <div>
                            fPAR:{' '}
                            <span className="text-foreground font-medium">
                              {zone.fpar.toFixed(2)}
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
              <div className="space-y-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${HEALTH_CONFIG[activeZone.healthStatus].bgClass}`}
                  >
                    {HEALTH_CONFIG[activeZone.healthStatus].label}
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
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activeZone.vegetationType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">NDVI: </span>
                    <span className="font-medium">{activeZone.ndvi.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">EVI: </span>
                    <span className="font-medium">{activeZone.evi.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">LAI: </span>
                    <span className="font-medium">{activeZone.lai.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">fPAR: </span>
                    <span className="font-medium">{activeZone.fpar.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Health: </span>
                    <span className="font-medium">{HEALTH_CONFIG[activeZone.healthStatus].label}</span>
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
