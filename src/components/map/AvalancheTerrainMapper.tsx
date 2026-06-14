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
import { useMapStore, type AvalancheTerrainState, type AvalancheTerrain } from '@/lib/map-store'
import { Mountain as MountainIcon4, X, Triangle, Activity, ShieldAlert, Trees, MapPin, Filter } from 'lucide-react'

const DEMO_TERRAINS: AvalancheTerrain[] = [
  {
    id: 'av-alps',
    name: 'French Alps — Chamonix',
    latitude: 45.92,
    longitude: 6.87,
    slopeAngle: 42,
    aspect: 'NW',
    elevation: 3200,
    terrainType: 'alpine',
    avalancheFrequency: 18,
    dangerRating: 'high',
    vegetationDensity: 'sparse',
  },
  {
    id: 'av-rockies',
    name: 'Colorado Rockies — Aspen',
    latitude: 39.19,
    longitude: -106.82,
    slopeAngle: 38,
    aspect: 'NE',
    elevation: 3700,
    terrainType: 'alpine',
    avalancheFrequency: 14,
    dangerRating: 'considerable',
    vegetationDensity: 'moderate',
  },
  {
    id: 'av-himalayas',
    name: 'Himalayas — Khumbu',
    latitude: 27.99,
    longitude: 86.93,
    slopeAngle: 48,
    aspect: 'S',
    elevation: 5500,
    terrainType: 'glaciated',
    avalancheFrequency: 25,
    dangerRating: 'extreme',
    vegetationDensity: 'barren',
  },
  {
    id: 'av-scandinavia',
    name: 'Norwegian Fjords — Tromsø',
    latitude: 69.65,
    longitude: 18.96,
    slopeAngle: 35,
    aspect: 'W',
    elevation: 1400,
    terrainType: 'treeline',
    avalancheFrequency: 10,
    dangerRating: 'moderate',
    vegetationDensity: 'moderate',
  },
  {
    id: 'av-caucasus',
    name: 'Caucasus — Elbrus Region',
    latitude: 43.35,
    longitude: 42.45,
    slopeAngle: 40,
    aspect: 'SE',
    elevation: 4100,
    terrainType: 'glaciated',
    avalancheFrequency: 16,
    dangerRating: 'high',
    vegetationDensity: 'sparse',
  },
  {
    id: 'av-cascades',
    name: 'Cascades — Mt. Rainier',
    latitude: 46.85,
    longitude: -121.76,
    slopeAngle: 36,
    aspect: 'E',
    elevation: 2800,
    terrainType: 'below_treeline',
    avalancheFrequency: 8,
    dangerRating: 'low',
    vegetationDensity: 'dense',
  },
]

const DANGER_CONFIG: Record<
  AvalancheTerrain['dangerRating'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  considerable: { label: 'Considerable', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function AvalancheTerrainMapper() {
  const state = useMapStore((s) => s.avalancheTerrain)
  const setState = useMapStore((s) => s.setAvalancheTerrain)

  const terrains = useMemo(
    () => (state.terrains.length > 0 ? state.terrains : DEMO_TERRAINS),
    [state.terrains]
  )

  const filteredTerrains = useMemo(() => {
    return terrains.filter((t) => {
      if (state.dangerFilter !== 'all' && t.dangerRating !== state.dangerFilter) return false
      return true
    })
  }, [terrains, state.dangerFilter])

  const summary = useMemo(() => {
    if (filteredTerrains.length === 0) {
      return { avgSlope: 0, totalFrequency: 0, considerableCount: 0 }
    }
    const avgSlope = filteredTerrains.reduce((sum, t) => sum + t.slopeAngle, 0) / filteredTerrains.length
    const totalFrequency = filteredTerrains.reduce((sum, t) => sum + t.avalancheFrequency, 0)
    const considerableCount = filteredTerrains.filter(
      (t) => t.dangerRating === 'considerable' || t.dangerRating === 'high' || t.dangerRating === 'extreme'
    ).length
    return {
      avgSlope: Math.round(avgSlope * 10) / 10,
      totalFrequency,
      considerableCount,
    }
  }, [filteredTerrains])

  const activeTerrain = useMemo(
    () => terrains.find((t) => t.id === state.activeTerrainId) ?? null,
    [terrains, state.activeTerrainId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AvalancheTerrainState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSlopeAngle', label: 'Slope Angle', icon: Triangle },
    { key: 'showAvalancheFrequency', label: 'Avalanche Frequency', icon: Activity },
    { key: 'showDangerRating', label: 'Danger Rating', icon: ShieldAlert },
    { key: 'showVegetationDensity', label: 'Vegetation Density', icon: Trees },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MountainIcon4 className="h-4 w-4 text-amber-600" />
              Avalanche Terrain Mapper
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
          {/* Danger Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Danger Rating
            </Label>
            <Select
              value={state.dangerFilter}
              onValueChange={(v) =>
                setState({
                  dangerFilter: v as AvalancheTerrainState['dangerFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="considerable">Considerable</SelectItem>
                <SelectItem value="high">High</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Slope</div>
              <div className="text-sm font-semibold">{summary.avgSlope}°</div>
              <div className="text-[9px] text-muted-foreground">angle</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Avalanches</div>
              <div className="text-sm font-semibold text-amber-600">{summary.totalFrequency}</div>
              <div className="text-[9px] text-muted-foreground">per year</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Considerable+</div>
              <div className="text-sm font-semibold text-red-500">{summary.considerableCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Terrain List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Avalanche Terrains ({filteredTerrains.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredTerrains.map((terrain) => {
                  const isActive = state.activeTerrainId === terrain.id
                  const dangerCfg = DANGER_CONFIG[terrain.dangerRating]
                  return (
                    <div
                      key={terrain.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeTerrainId: isActive ? null : terrain.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: dangerCfg.color }}
                          />
                          <span className="text-xs font-medium">{terrain.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${dangerCfg.bgClass}`}
                        >
                          {dangerCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showSlopeAngle && (
                          <div>
                            Slope:{' '}
                            <span className="text-foreground font-medium">
                              {terrain.slopeAngle}°
                            </span>
                          </div>
                        )}
                        {state.showAvalancheFrequency && (
                          <div>
                            Frequency:{' '}
                            <span className="text-foreground font-medium">
                              {terrain.avalancheFrequency}/yr
                            </span>
                          </div>
                        )}
                        {state.showDangerRating && (
                          <div>
                            Elevation:{' '}
                            <span className="text-foreground font-medium">
                              {terrain.elevation} m
                            </span>
                          </div>
                        )}
                        {state.showVegetationDensity && (
                          <div>
                            Vegetation:{' '}
                            <span className="text-foreground font-medium">
                              {terrain.vegetationDensity}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredTerrains.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No terrains match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Terrain Details */}
          {activeTerrain && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold">{activeTerrain.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${DANGER_CONFIG[activeTerrain.dangerRating].bgClass}`}
                  >
                    {DANGER_CONFIG[activeTerrain.dangerRating].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeTerrain.latitude.toFixed(2)}, {activeTerrain.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Slope Angle: </span>
                    <span className="font-medium">{activeTerrain.slopeAngle}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aspect: </span>
                    <span className="font-medium">{activeTerrain.aspect}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Elevation: </span>
                    <span className="font-medium">{activeTerrain.elevation} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Terrain Type: </span>
                    <span className="font-medium">{activeTerrain.terrainType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequency: </span>
                    <span className="font-medium">{activeTerrain.avalancheFrequency}/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vegetation: </span>
                    <span className="font-medium">{activeTerrain.vegetationDensity}</span>
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
