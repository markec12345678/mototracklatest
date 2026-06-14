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
import { useMapStore, type WildfireSmokeState, type SmokePlume } from '@/lib/map-store'
import { Wind as WindIcon6, X, Cloud, Expand, Users, AlertTriangle, MapPin, Filter } from 'lucide-react'

const DEMO_PLUMES: SmokePlume[] = [
  {
    id: 'ws-california',
    name: 'California Creek Fire',
    latitude: 37.21,
    longitude: -119.49,
    sourceFire: 'Creek Wildfire',
    pm25Concentration: 185,
    pm10Concentration: 320,
    plumeAltitude: 8.5,
    dispersionKm: 450,
    affectedPopulation: 2800000,
    visibilityKm: 3.2,
    healthRisk: 'hazardous',
  },
  {
    id: 'ws-australia',
    name: 'Australian Black Summer',
    latitude: -33.87,
    longitude: 150.65,
    sourceFire: 'Black Summer Bushfire',
    pm25Concentration: 142,
    pm10Concentration: 258,
    plumeAltitude: 12.0,
    dispersionKm: 820,
    affectedPopulation: 4500000,
    visibilityKm: 2.1,
    healthRisk: 'very_unhealthy',
  },
  {
    id: 'ws-canada',
    name: 'Canadian Boreal Fire',
    latitude: 53.93,
    longitude: -116.58,
    sourceFire: 'Alberta Wildfire Complex',
    pm25Concentration: 98,
    pm10Concentration: 175,
    plumeAltitude: 6.8,
    dispersionKm: 620,
    affectedPopulation: 1200000,
    visibilityKm: 4.5,
    healthRisk: 'unhealthy',
  },
  {
    id: 'ws-siberia',
    name: 'Siberian Taiga Fire',
    latitude: 62.03,
    longitude: 129.73,
    sourceFire: 'Yakutia Wildfire',
    pm25Concentration: 210,
    pm10Concentration: 380,
    plumeAltitude: 10.2,
    dispersionKm: 950,
    affectedPopulation: 650000,
    visibilityKm: 1.8,
    healthRisk: 'hazardous',
  },
  {
    id: 'ws-amazon',
    name: 'Amazon Deforestation Fire',
    latitude: -8.37,
    longitude: -55.48,
    sourceFire: 'Amazon Basin Clearing',
    pm25Concentration: 78,
    pm10Concentration: 145,
    plumeAltitude: 4.5,
    dispersionKm: 350,
    affectedPopulation: 3200000,
    visibilityKm: 5.8,
    healthRisk: 'moderate',
  },
  {
    id: 'ws-indonesia',
    name: 'Indonesian Peat Fire',
    latitude: -1.59,
    longitude: 110.52,
    sourceFire: 'Kalimantan Peat Fire',
    pm25Concentration: 156,
    pm10Concentration: 290,
    plumeAltitude: 5.2,
    dispersionKm: 380,
    affectedPopulation: 5100000,
    visibilityKm: 2.5,
    healthRisk: 'very_unhealthy',
  },
]

const HEALTH_RISK_CONFIG: Record<
  SmokePlume['healthRisk'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  unhealthy: { label: 'Unhealthy', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_unhealthy: { label: 'Very Unhealthy', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  hazardous: { label: 'Hazardous', color: '#7c3aed', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

export function WildfireSmokeDispersion() {
  const state = useMapStore((s) => s.wildfireSmoke)
  const setState = useMapStore((s) => s.setWildfireSmoke)

  const plumes = useMemo(
    () => (state.plumes.length > 0 ? state.plumes : DEMO_PLUMES),
    [state.plumes]
  )

  const filteredPlumes = useMemo(() => {
    return plumes.filter((p) => {
      if (state.riskFilter !== 'all' && p.healthRisk !== state.riskFilter) return false
      return true
    })
  }, [plumes, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredPlumes.length === 0) {
      return { avgPM25: 0, totalAffected: 0, hazardousCount: 0 }
    }
    const avgPM25 = filteredPlumes.reduce((sum, p) => sum + p.pm25Concentration, 0) / filteredPlumes.length
    const totalAffected = filteredPlumes.reduce((sum, p) => sum + p.affectedPopulation, 0)
    const hazardousCount = filteredPlumes.filter(
      (p) => p.healthRisk === 'very_unhealthy' || p.healthRisk === 'hazardous'
    ).length
    return {
      avgPM25: Math.round(avgPM25),
      totalAffected,
      hazardousCount,
    }
  }, [filteredPlumes])

  const activePlume = useMemo(
    () => plumes.find((p) => p.id === state.activePlumeId) ?? null,
    [plumes, state.activePlumeId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WildfireSmokeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPM25', label: 'PM2.5 Concentration', icon: Cloud },
    { key: 'showDispersion', label: 'Dispersion Range', icon: Expand },
    { key: 'showAffectedPopulation', label: 'Affected Population', icon: Users },
    { key: 'showHealthRisk', label: 'Health Risk', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WindIcon6 className="h-4 w-4 text-amber-600" />
              Wildfire Smoke Dispersion
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
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Health Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({
                  riskFilter: v as WildfireSmokeState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="unhealthy">Unhealthy</SelectItem>
                <SelectItem value="very_unhealthy">Very Unhealthy</SelectItem>
                <SelectItem value="hazardous">Hazardous</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg PM2.5</div>
              <div className="text-sm font-semibold text-amber-600">{summary.avgPM25}</div>
              <div className="text-[9px] text-muted-foreground">µg/m³</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Affected Pop</div>
              <div className="text-sm font-semibold">{(summary.totalAffected / 1000000).toFixed(1)}M</div>
              <div className="text-[9px] text-muted-foreground">people</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Critical</div>
              <div className="text-sm font-semibold text-purple-600">{summary.hazardousCount}</div>
              <div className="text-[9px] text-muted-foreground">plumes</div>
            </div>
          </div>

          <Separator />

          {/* Plume List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Smoke Plumes ({filteredPlumes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPlumes.map((plume) => {
                  const isActive = state.activePlumeId === plume.id
                  const riskCfg = HEALTH_RISK_CONFIG[plume.healthRisk]
                  return (
                    <div
                      key={plume.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activePlumeId: isActive ? null : plume.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: riskCfg.color }}
                          />
                          <span className="text-xs font-medium">{plume.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${riskCfg.bgClass}`}
                        >
                          {riskCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showPM25 && (
                          <div>
                            PM2.5:{' '}
                            <span className="text-foreground font-medium">
                              {plume.pm25Concentration} µg/m³
                            </span>
                          </div>
                        )}
                        {state.showDispersion && (
                          <div>
                            Dispersion:{' '}
                            <span className="text-foreground font-medium">
                              {plume.dispersionKm} km
                            </span>
                          </div>
                        )}
                        {state.showAffectedPopulation && (
                          <div>
                            Affected:{' '}
                            <span className="text-foreground font-medium">
                              {(plume.affectedPopulation / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        )}
                        {state.showHealthRisk && (
                          <div>
                            Visibility:{' '}
                            <span className="text-foreground font-medium">
                              {plume.visibilityKm} km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPlumes.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No plumes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Plume Details */}
          {activePlume && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold">{activePlume.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${HEALTH_RISK_CONFIG[activePlume.healthRisk].bgClass}`}
                  >
                    {HEALTH_RISK_CONFIG[activePlume.healthRisk].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activePlume.latitude.toFixed(2)}, {activePlume.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source Fire: </span>
                    <span className="font-medium">{activePlume.sourceFire}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PM2.5: </span>
                    <span className="font-medium">{activePlume.pm25Concentration} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PM10: </span>
                    <span className="font-medium">{activePlume.pm10Concentration} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plume Altitude: </span>
                    <span className="font-medium">{activePlume.plumeAltitude} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dispersion: </span>
                    <span className="font-medium">{activePlume.dispersionKm} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected Pop: </span>
                    <span className="font-medium">{(activePlume.affectedPopulation / 1000000).toFixed(1)}M</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visibility: </span>
                    <span className="font-medium">{activePlume.visibilityKm} km</span>
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
