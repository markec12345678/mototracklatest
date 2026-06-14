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
import { useMapStore, type ContinentalDriftState, type TectonicPlateBoundary } from '@/lib/map-store'
import { Globe as GlobeIcon3, X, Move, Activity, Waves, Shield, MapPin, Filter } from 'lucide-react'

const DEMO_BOUNDARIES: TectonicPlateBoundary[] = [
  {
    id: 'cd-midatlantic',
    name: 'Mid-Atlantic Ridge',
    latitude: 35.00,
    longitude: -35.00,
    boundaryType: 'divergent',
    movementRate: 25,
    movementDirection: 90,
    stressAccumulation: 42,
    seismicGap: 15,
    volcanicActivity: 68,
    plateName: 'North American / Eurasian',
    riskLevel: 'moderate',
  },
  {
    id: 'cd-himalayas',
    name: 'Himalayan Collision Zone',
    latitude: 28.50,
    longitude: 84.50,
    boundaryType: 'convergent',
    movementRate: 45,
    movementDirection: 10,
    stressAccumulation: 92,
    seismicGap: 78,
    volcanicActivity: 12,
    plateName: 'Indian / Eurasian',
    riskLevel: 'extreme',
  },
  {
    id: 'cd-sanandreas',
    name: 'San Andreas Fault',
    latitude: 36.00,
    longitude: -120.50,
    boundaryType: 'transform',
    movementRate: 35,
    movementDirection: 320,
    stressAccumulation: 85,
    seismicGap: 62,
    volcanicActivity: 8,
    plateName: 'Pacific / North American',
    riskLevel: 'very_high',
  },
  {
    id: 'cd-afar',
    name: 'Afar Triple Junction',
    latitude: 11.50,
    longitude: 41.00,
    boundaryType: 'triple_junction',
    movementRate: 18,
    movementDirection: 135,
    stressAccumulation: 55,
    seismicGap: 28,
    volcanicActivity: 88,
    plateName: 'African / Somali / Arabian',
    riskLevel: 'high',
  },
  {
    id: 'cd-nazca',
    name: 'Peru-Chile Trench',
    latitude: -15.00,
    longitude: -75.00,
    boundaryType: 'convergent',
    movementRate: 80,
    movementDirection: 85,
    stressAccumulation: 78,
    seismicGap: 48,
    volcanicActivity: 72,
    plateName: 'Nazca / South American',
    riskLevel: 'very_high',
  },
  {
    id: 'cd-iceland',
    name: 'Iceland Divergent Zone',
    latitude: 64.50,
    longitude: -18.50,
    boundaryType: 'divergent',
    movementRate: 20,
    movementDirection: 95,
    stressAccumulation: 35,
    seismicGap: 12,
    volcanicActivity: 82,
    plateName: 'North American / Eurasian',
    riskLevel: 'low',
  },
]

const BOUNDARY_TYPE_CONFIG: Record<
  TectonicPlateBoundary['boundaryType'],
  { label: string; color: string }
> = {
  divergent: { label: 'Divergent', color: '#22c55e' },
  convergent: { label: 'Convergent', color: '#ef4444' },
  transform: { label: 'Transform', color: '#f97316' },
  triple_junction: { label: 'Triple Junction', color: '#8b5cf6' },
}

const RISK_LEVEL_CONFIG: Record<
  TectonicPlateBoundary['riskLevel'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  high: { label: 'High', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  very_high: { label: 'Very High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function ContinentalDriftMonitor() {
  const state = useMapStore((s) => s.continentalDrift)
  const setState = useMapStore((s) => s.setContinentalDrift)

  const boundaries = useMemo(
    () => (state.boundaries.length > 0 ? state.boundaries : DEMO_BOUNDARIES),
    [state.boundaries]
  )

  const filteredBoundaries = useMemo(() => {
    return boundaries.filter((b) => {
      if (state.boundaryFilter !== 'all' && b.boundaryType !== state.boundaryFilter) return false
      return true
    })
  }, [boundaries, state.boundaryFilter])

  const summary = useMemo(() => {
    if (filteredBoundaries.length === 0) {
      return { avgMovement: 0, avgStress: 0, extremeCount: 0 }
    }
    const avgMovement = filteredBoundaries.reduce((sum, b) => sum + b.movementRate, 0) / filteredBoundaries.length
    const avgStress = filteredBoundaries.reduce((sum, b) => sum + b.stressAccumulation, 0) / filteredBoundaries.length
    const extremeCount = filteredBoundaries.filter(
      (b) => b.riskLevel === 'very_high' || b.riskLevel === 'extreme'
    ).length
    return {
      avgMovement: Math.round(avgMovement * 10) / 10,
      avgStress: Math.round(avgStress * 10) / 10,
      extremeCount,
    }
  }, [filteredBoundaries])

  const activeBoundary = useMemo(
    () => boundaries.find((b) => b.id === state.activeBoundaryId) ?? null,
    [boundaries, state.activeBoundaryId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ContinentalDriftState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMovementRate', label: 'Movement Rate', icon: Move },
    { key: 'showStressAccumulation', label: 'Stress Accumulation', icon: Activity },
    { key: 'showSeismicGap', label: 'Seismic Gap', icon: Waves },
    { key: 'showRiskLevel', label: 'Risk Level', icon: Shield },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <GlobeIcon3 className="h-4 w-4 text-emerald-600" />
              Continental Drift Monitor
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
          {/* Boundary Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Boundary Type
            </Label>
            <Select
              value={state.boundaryFilter}
              onValueChange={(v) =>
                setState({
                  boundaryFilter: v as ContinentalDriftState['boundaryFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="divergent">Divergent</SelectItem>
                <SelectItem value="convergent">Convergent</SelectItem>
                <SelectItem value="transform">Transform</SelectItem>
                <SelectItem value="triple_junction">Triple Junction</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg Movement</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.avgMovement}</div>
              <div className="text-[9px] text-muted-foreground">mm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Stress</div>
              <div className="text-sm font-semibold">{summary.avgStress}%</div>
              <div className="text-[9px] text-muted-foreground">accumulated</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">V.High/Extreme</div>
              <div className="text-sm font-semibold text-red-600">{summary.extremeCount}</div>
              <div className="text-[9px] text-muted-foreground">boundaries</div>
            </div>
          </div>

          <Separator />

          {/* Boundary List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Plate Boundaries ({filteredBoundaries.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredBoundaries.map((boundary) => {
                  const isActive = state.activeBoundaryId === boundary.id
                  const riskCfg = RISK_LEVEL_CONFIG[boundary.riskLevel]
                  const typeCfg = BOUNDARY_TYPE_CONFIG[boundary.boundaryType]
                  return (
                    <div
                      key={boundary.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeBoundaryId: isActive ? null : boundary.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: typeCfg.color }}
                          />
                          <span className="text-xs font-medium">{boundary.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${riskCfg.bgClass}`}
                        >
                          {riskCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showMovementRate && (
                          <div>
                            Movement:{' '}
                            <span className="text-foreground font-medium">
                              {boundary.movementRate} mm/yr
                            </span>
                          </div>
                        )}
                        {state.showStressAccumulation && (
                          <div>
                            Stress:{' '}
                            <span className="text-foreground font-medium">
                              {boundary.stressAccumulation}%
                            </span>
                          </div>
                        )}
                        {state.showSeismicGap && (
                          <div>
                            Seismic Gap:{' '}
                            <span className="text-foreground font-medium">
                              {boundary.seismicGap}%
                            </span>
                          </div>
                        )}
                        {state.showRiskLevel && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {typeCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredBoundaries.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No boundaries match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Boundary Details */}
          {activeBoundary && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold">{activeBoundary.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${RISK_LEVEL_CONFIG[activeBoundary.riskLevel].bgClass}`}
                  >
                    {RISK_LEVEL_CONFIG[activeBoundary.riskLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeBoundary.latitude.toFixed(2)}, {activeBoundary.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Boundary Type: </span>
                    <span className="font-medium">{BOUNDARY_TYPE_CONFIG[activeBoundary.boundaryType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Movement Rate: </span>
                    <span className="font-medium">{activeBoundary.movementRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Direction: </span>
                    <span className="font-medium">{activeBoundary.movementDirection}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stress: </span>
                    <span className="font-medium">{activeBoundary.stressAccumulation}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seismic Gap: </span>
                    <span className="font-medium">{activeBoundary.seismicGap}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volcanic Activity: </span>
                    <span className="font-medium">{activeBoundary.volcanicActivity}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plates: </span>
                    <span className="font-medium">{activeBoundary.plateName}</span>
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
