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
import { useMapStore, type AtmosphericRiverState, type AtmosphericRiver } from '@/lib/map-store'
import { CloudRain as CloudRainIcon3, X, Gauge, Wind, MapPin, Filter, AlertTriangle } from 'lucide-react'

const DEMO_RIVERS: AtmosphericRiver[] = [
  {
    id: 'ar-pineapple',
    name: 'Pineapple Express Pacific',
    latitude: 35.0,
    longitude: -140.0,
    category: 'cat4_extreme',
    moistureFlux: 850,
    windSpeed: 45,
    width: 400,
    length: 3200,
    precipitationRate: 32,
    floodRisk: 'extreme',
  },
  {
    id: 'ar-amazon',
    name: 'Amazon Moisture Corridor',
    latitude: -3.0,
    longitude: -55.0,
    category: 'cat3_strong',
    moistureFlux: 720,
    windSpeed: 28,
    width: 500,
    length: 2800,
    precipitationRate: 24,
    floodRisk: 'high',
  },
  {
    id: 'ar-south-asian',
    name: 'South Asian Monsoon',
    latitude: 20.0,
    longitude: 85.0,
    category: 'cat5_exceptional',
    moistureFlux: 1100,
    windSpeed: 52,
    width: 600,
    length: 4500,
    precipitationRate: 48,
    floodRisk: 'extreme',
  },
  {
    id: 'ar-west-africa',
    name: 'West Africa Convective',
    latitude: 8.0,
    longitude: -5.0,
    category: 'cat2_moderate',
    moistureFlux: 480,
    windSpeed: 22,
    width: 250,
    length: 1800,
    precipitationRate: 15,
    floodRisk: 'moderate',
  },
  {
    id: 'ar-european',
    name: 'European Winter Storm',
    latitude: 52.0,
    longitude: -10.0,
    category: 'cat3_strong',
    moistureFlux: 620,
    windSpeed: 38,
    width: 350,
    length: 2500,
    precipitationRate: 20,
    floodRisk: 'high',
  },
  {
    id: 'ar-east-asian',
    name: 'East Asian Plume',
    latitude: 30.0,
    longitude: 130.0,
    category: 'cat1_weak',
    moistureFlux: 320,
    windSpeed: 15,
    width: 200,
    length: 1200,
    precipitationRate: 8,
    floodRisk: 'low',
  },
]

const CATEGORY_CONFIG: Record<
  AtmosphericRiver['category'],
  { label: string; color: string; bgClass: string }
> = {
  cat1_weak: { label: 'Cat 1 - Weak', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  cat2_moderate: { label: 'Cat 2 - Moderate', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  cat3_strong: { label: 'Cat 3 - Strong', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  cat4_extreme: { label: 'Cat 4 - Extreme', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  cat5_exceptional: { label: 'Cat 5 - Exceptional', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const FLOOD_RISK_CONFIG: Record<
  AtmosphericRiver['floodRisk'],
  { label: string; color: string; bgClass: string }
> = {
  minimal: { label: 'Minimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function AtmosphericRiverTracker() {
  const state = useMapStore((s) => s.atmosphericRiver)
  const setState = useMapStore((s) => s.setAtmosphericRiver)

  const rivers = useMemo(
    () => (state.rivers.length > 0 ? state.rivers : DEMO_RIVERS),
    [state.rivers]
  )

  const filteredRivers = useMemo(() => {
    return rivers.filter((r) => {
      if (state.categoryFilter !== 'all' && r.category !== state.categoryFilter) return false
      return true
    })
  }, [rivers, state.categoryFilter])

  const summary = useMemo(() => {
    if (filteredRivers.length === 0) {
      return { avgMoistureFlux: 0, avgWindSpeed: 0, highExtremeCount: 0 }
    }
    const avgMoistureFlux = filteredRivers.reduce((sum, r) => sum + r.moistureFlux, 0) / filteredRivers.length
    const avgWindSpeed = filteredRivers.reduce((sum, r) => sum + r.windSpeed, 0) / filteredRivers.length
    const highExtremeCount = filteredRivers.filter(
      (r) => r.floodRisk === 'high' || r.floodRisk === 'extreme'
    ).length
    return {
      avgMoistureFlux: Math.round(avgMoistureFlux),
      avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
      highExtremeCount,
    }
  }, [filteredRivers])

  const activeRiver = useMemo(
    () => rivers.find((r) => r.id === state.activeRiverId) ?? null,
    [rivers, state.activeRiverId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AtmosphericRiverState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMoistureFlux', label: 'Moisture Flux', icon: Gauge },
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showDimensions', label: 'Dimensions', icon: MapPin },
    { key: 'showFloodRisk', label: 'Flood Risk', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudRainIcon3 className="h-4 w-4 text-blue-600" />
              Atmospheric River Tracker
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
          {/* Category Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              AR Category
            </Label>
            <Select
              value={state.categoryFilter}
              onValueChange={(v) =>
                setState({
                  categoryFilter: v as AtmosphericRiverState['categoryFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cat1_weak">Cat 1 - Weak</SelectItem>
                <SelectItem value="cat2_moderate">Cat 2 - Moderate</SelectItem>
                <SelectItem value="cat3_strong">Cat 3 - Strong</SelectItem>
                <SelectItem value="cat4_extreme">Cat 4 - Extreme</SelectItem>
                <SelectItem value="cat5_exceptional">Cat 5 - Exceptional</SelectItem>
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
                  <Icon className="h-3 w-3 text-blue-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Moisture Flux</div>
              <div className="text-sm font-semibold">{summary.avgMoistureFlux}</div>
              <div className="text-[9px] text-muted-foreground">kg/m/s</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Wind Speed</div>
              <div className="text-sm font-semibold text-blue-600">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-muted-foreground">m/s</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Extreme</div>
              <div className="text-sm font-semibold text-red-600">{summary.highExtremeCount}</div>
              <div className="text-[9px] text-muted-foreground">rivers</div>
            </div>
          </div>

          <Separator />

          {/* River List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Atmospheric Rivers ({filteredRivers.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredRivers.map((river) => {
                  const isActive = state.activeRiverId === river.id
                  const catCfg = CATEGORY_CONFIG[river.category]
                  return (
                    <div
                      key={river.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-500/5'
                          : 'border-border/40 hover:border-blue-500/20 hover:bg-blue-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeRiverId: isActive ? null : river.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: catCfg.color }}
                          />
                          <span className="text-xs font-medium">{river.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${catCfg.bgClass}`}
                        >
                          {catCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showMoistureFlux && (
                          <div>
                            Flux:{' '}
                            <span className="text-foreground font-medium">
                              {river.moistureFlux} kg/m/s
                            </span>
                          </div>
                        )}
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-foreground font-medium">
                              {river.windSpeed} m/s
                            </span>
                          </div>
                        )}
                        {state.showDimensions && (
                          <div>
                            Size:{' '}
                            <span className="text-foreground font-medium">
                              {river.width}×{river.length} km
                            </span>
                          </div>
                        )}
                        {state.showFloodRisk && (
                          <div>
                            Flood:{' '}
                            <span className="text-foreground font-medium">
                              {FLOOD_RISK_CONFIG[river.floodRisk].label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRivers.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No rivers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active River Details */}
          {activeRiver && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-semibold">{activeRiver.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${CATEGORY_CONFIG[activeRiver.category].bgClass}`}
                  >
                    {CATEGORY_CONFIG[activeRiver.category].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeRiver.latitude.toFixed(2)}, {activeRiver.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category: </span>
                    <span className="font-medium">{CATEGORY_CONFIG[activeRiver.category].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Moisture Flux: </span>
                    <span className="font-medium">{activeRiver.moistureFlux} kg/m/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Speed: </span>
                    <span className="font-medium">{activeRiver.windSpeed} m/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Width: </span>
                    <span className="font-medium">{activeRiver.width} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Length: </span>
                    <span className="font-medium">{activeRiver.length} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Precip. Rate: </span>
                    <span className="font-medium">{activeRiver.precipitationRate} mm/hr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flood Risk: </span>
                    <span className="font-medium">{FLOOD_RISK_CONFIG[activeRiver.floodRisk].label}</span>
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
