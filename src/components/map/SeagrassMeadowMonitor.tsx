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
import { useMapStore, type SeagrassMeadowState, type SeagrassMeadow } from '@/lib/map-store'
import { TreePine, X, Gauge, MapPin, Filter, Leaf, Droplets } from 'lucide-react'

const DEMO_MEADOWS: SeagrassMeadow[] = [
  {
    id: 'sg-posidonia-med',
    name: 'Posidonia Meadows Mediterranean',
    lat: 40.0,
    lng: 3.5,
    area: 450,
    shootDensity: 580,
    carbonStock: 12.8,
    canopyHeight: 55,
    epiphyteLoad: 15,
    waterClarity: 18.5,
    speciesType: 'posidonia',
    healthStatus: 'excellent',
  },
  {
    id: 'sg-shark-bay',
    name: 'Shark Bay Australia',
    lat: -25.5,
    lng: 113.5,
    area: 1200,
    shootDensity: 620,
    carbonStock: 14.2,
    canopyHeight: 60,
    epiphyteLoad: 10,
    waterClarity: 22.0,
    speciesType: 'posidonia',
    healthStatus: 'excellent',
  },
  {
    id: 'sg-chesapeake',
    name: 'Chesapeake Bay Eelgrass',
    lat: 37.5,
    lng: -76.0,
    area: 85,
    shootDensity: 220,
    carbonStock: 5.4,
    canopyHeight: 30,
    epiphyteLoad: 55,
    waterClarity: 6.5,
    speciesType: 'zostera',
    healthStatus: 'moderate',
  },
  {
    id: 'sg-florida-keys',
    name: 'Florida Keys Turtle Grass',
    lat: 24.9,
    lng: -80.5,
    area: 320,
    shootDensity: 410,
    carbonStock: 9.6,
    canopyHeight: 45,
    epiphyteLoad: 25,
    waterClarity: 14.0,
    speciesType: 'thalassia',
    healthStatus: 'good',
  },
  {
    id: 'sg-cape-cod',
    name: 'Cape Cod Eelgrass',
    lat: 41.5,
    lng: -70.0,
    area: 42,
    shootDensity: 140,
    carbonStock: 3.1,
    canopyHeight: 22,
    epiphyteLoad: 72,
    waterClarity: 4.5,
    speciesType: 'zostera',
    healthStatus: 'declining',
  },
  {
    id: 'sg-cymodocea-spain',
    name: 'Mediterranean Cymodocea Spain',
    lat: 39.5,
    lng: 2.5,
    area: 95,
    shootDensity: 380,
    carbonStock: 8.3,
    canopyHeight: 38,
    epiphyteLoad: 30,
    waterClarity: 12.0,
    speciesType: 'cymodocea',
    healthStatus: 'good',
  },
]

const HEALTH_CONFIG: Record<
  SeagrassMeadow['healthStatus'],
  { label: string; color: string; bgClass: string }
> = {
  excellent: { label: 'Excellent', color: '#059669', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  declining: { label: 'Declining', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SPECIES_CONFIG: Record<
  SeagrassMeadow['speciesType'],
  { label: string }
> = {
  posidonia: { label: 'Posidonia' },
  zostera: { label: 'Zostera' },
  thalassia: { label: 'Thalassia' },
  cymodocea: { label: 'Cymodocea' },
  halodule: { label: 'Halodule' },
  mixed: { label: 'Mixed' },
}

export function SeagrassMeadowMonitor() {
  const state = useMapStore((s) => s.seagrassMeadow)
  const setState = useMapStore((s) => s.setSeagrassMeadow)

  const meadows = useMemo(
    () => (state.meadows && state.meadows.length > 0 ? state.meadows : DEMO_MEADOWS),
    [state.meadows]
  )

  const filteredMeadows = useMemo(() => {
    return meadows.filter((m) => {
      if (state.speciesFilter !== 'all' && m.speciesType !== state.speciesFilter) return false
      return true
    })
  }, [meadows, state.speciesFilter])

  const summary = useMemo(() => {
    if (filteredMeadows.length === 0) {
      return { avgShootDensity: 0, avgCarbonStock: 0, decliningCriticalCount: 0 }
    }
    const avgShootDensity = filteredMeadows.reduce((sum, m) => sum + m.shootDensity, 0) / filteredMeadows.length
    const avgCarbonStock = filteredMeadows.reduce((sum, m) => sum + m.carbonStock, 0) / filteredMeadows.length
    const decliningCriticalCount = filteredMeadows.filter(
      (m) => m.healthStatus === 'declining' || m.healthStatus === 'critical'
    ).length
    return {
      avgShootDensity: Math.round(avgShootDensity),
      avgCarbonStock: Math.round(avgCarbonStock * 10) / 10,
      decliningCriticalCount,
    }
  }, [filteredMeadows])

  const activeMeadow = useMemo(
    () => meadows.find((m) => m.id === state.activeMeadowId) ?? null,
    [meadows, state.activeMeadowId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeagrassMeadowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showShootDensity', label: 'Shoot Density', icon: Leaf },
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Gauge },
    { key: 'showWaterClarity', label: 'Water Clarity', icon: Droplets },
    { key: 'showHealthStatus', label: 'Health Status', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TreePine className="h-4 w-4 text-emerald-600" />
              Seagrass Meadow Monitor
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
          {/* Species Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Species Type
            </Label>
            <Select
              value={state.speciesFilter}
              onValueChange={(v) =>
                setState({
                  speciesFilter: v as SeagrassMeadowState['speciesFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                <SelectItem value="posidonia">Posidonia</SelectItem>
                <SelectItem value="zostera">Zostera</SelectItem>
                <SelectItem value="thalassia">Thalassia</SelectItem>
                <SelectItem value="cymodocea">Cymodocea</SelectItem>
                <SelectItem value="halodule">Halodule</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
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
                  <Icon className="h-3 w-3 text-emerald-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Shoot Density</div>
              <div className="text-sm font-semibold">{summary.avgShootDensity}</div>
              <div className="text-[9px] text-muted-foreground">shoots/m²</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Carbon Stock</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.avgCarbonStock}</div>
              <div className="text-[9px] text-muted-foreground">t CO₂/ha</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Declining/Critical</div>
              <div className="text-sm font-semibold text-orange-600">{summary.decliningCriticalCount}</div>
              <div className="text-[9px] text-muted-foreground">meadows</div>
            </div>
          </div>

          <Separator />

          {/* Meadow List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Seagrass Meadows ({filteredMeadows.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredMeadows.map((meadow) => {
                  const isActive = state.activeMeadowId === meadow.id
                  const healthCfg = HEALTH_CONFIG[meadow.healthStatus]
                  return (
                    <div
                      key={meadow.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-600/50 bg-emerald-500/5'
                          : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeMeadowId: isActive ? null : meadow.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: healthCfg.color }}
                          />
                          <span className="text-xs font-medium">{meadow.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${healthCfg.bgClass}`}
                        >
                          {healthCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showShootDensity && (
                          <div>
                            Shoot Density:{' '}
                            <span className="text-foreground font-medium">
                              {meadow.shootDensity} /m²
                            </span>
                          </div>
                        )}
                        {state.showCarbonStock && (
                          <div>
                            Carbon Stock:{' '}
                            <span className="text-foreground font-medium">
                              {meadow.carbonStock} t CO₂/ha
                            </span>
                          </div>
                        )}
                        {state.showWaterClarity && (
                          <div>
                            Water Clarity:{' '}
                            <span className="text-foreground font-medium">
                              {meadow.waterClarity} m Secchi
                            </span>
                          </div>
                        )}
                        {state.showHealthStatus && (
                          <div>
                            Health:{' '}
                            <span className="text-foreground font-medium">
                              {healthCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredMeadows.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No meadows match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Meadow Details */}
          {activeMeadow && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-emerald-600/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold">{activeMeadow.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${HEALTH_CONFIG[activeMeadow.healthStatus].bgClass}`}
                  >
                    {HEALTH_CONFIG[activeMeadow.healthStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeMeadow.lat.toFixed(2)}, {activeMeadow.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Species: </span>
                    <span className="font-medium">{SPECIES_CONFIG[activeMeadow.speciesType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeMeadow.area} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Shoot Density: </span>
                    <span className="font-medium">{activeMeadow.shootDensity} /m²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon Stock: </span>
                    <span className="font-medium">{activeMeadow.carbonStock} t CO₂/ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Canopy Height: </span>
                    <span className="font-medium">{activeMeadow.canopyHeight} cm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Epiphyte Load: </span>
                    <span className="font-medium">{activeMeadow.epiphyteLoad}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Clarity: </span>
                    <span className="font-medium">{activeMeadow.waterClarity} m Secchi</span>
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
