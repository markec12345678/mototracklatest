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
import { useMapStore, type HydrothermalPlumeState, type HydrothermalPlume } from '@/lib/map-store'
import { Flame as FlameIcon8, X, Thermometer, AlertTriangle, MapPin, Filter, Activity } from 'lucide-react'

const DEMO_PLUMES: HydrothermalPlume[] = [
  {
    id: 'hp-tag',
    name: 'TAG Hydrothermal Plume',
    lat: 26.1,
    lng: -44.8,
    depth: 3625,
    plumeHeight: 250,
    temperature: 365,
    particleConcentration: 85,
    ventType: 'black_smoker',
    chemicalSignature: 'sulfide_rich',
    biodiversityIndex: 0.42,
    activityLevel: 'high',
  },
  {
    id: 'hp-endeavour',
    name: 'Endeavour Vent Field',
    lat: 47.9,
    lng: -129.1,
    depth: 2200,
    plumeHeight: 180,
    temperature: 340,
    particleConcentration: 62,
    ventType: 'black_smoker',
    chemicalSignature: 'iron_rich',
    biodiversityIndex: 0.55,
    activityLevel: 'moderate',
  },
  {
    id: 'hp-loki',
    name: "Loki's Castle",
    lat: 73.5,
    lng: 8.0,
    depth: 2350,
    plumeHeight: 300,
    temperature: 317,
    particleConcentration: 78,
    ventType: 'black_smoker',
    chemicalSignature: 'methane_rich',
    biodiversityIndex: 0.38,
    activityLevel: 'high',
  },
  {
    id: 'hp-lostcity',
    name: 'Lost City',
    lat: 30.1,
    lng: -42.1,
    depth: 800,
    plumeHeight: 60,
    temperature: 90,
    particleConcentration: 25,
    ventType: 'white_smoker',
    chemicalSignature: 'methane_rich',
    biodiversityIndex: 0.61,
    activityLevel: 'moderate',
  },
  {
    id: 'hp-brothers',
    name: 'Brothers Volcano',
    lat: -34.9,
    lng: 179.1,
    depth: 1850,
    plumeHeight: 420,
    temperature: 410,
    particleConcentration: 110,
    ventType: 'beehive',
    chemicalSignature: 'sulfide_rich',
    biodiversityIndex: 0.29,
    activityLevel: 'eruptive',
  },
  {
    id: 'hp-snakepit',
    name: 'Snake Pit',
    lat: 23.1,
    lng: -44.9,
    depth: 3480,
    plumeHeight: 45,
    temperature: 55,
    particleConcentration: 12,
    ventType: 'diffuse_flow',
    chemicalSignature: 'mixed',
    biodiversityIndex: 0.72,
    activityLevel: 'low',
  },
]

const ACTIVITY_CONFIG: Record<
  HydrothermalPlume['activityLevel'],
  { label: string; color: string; bgClass: string }
> = {
  dormant: { label: 'Dormant', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  eruptive: { label: 'Eruptive', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const VENT_TYPE_LABELS: Record<HydrothermalPlume['ventType'], string> = {
  black_smoker: 'Black Smoker',
  white_smoker: 'White Smoker',
  diffuse_flow: 'Diffuse Flow',
  shimmer: 'Shimmer',
  beehive: 'Beehive',
}

export function HydrothermalPlumeTracker() {
  const state = useMapStore((s) => s.hydrothermalPlume)
  const setState = useMapStore((s) => s.setHydrothermalPlume)

  const plumes = useMemo(
    () => (state.plumes && state.plumes.length > 0 ? state.plumes : DEMO_PLUMES),
    [state.plumes]
  )

  const filteredPlumes = useMemo(() => {
    return plumes.filter((p) => {
      if (state.ventTypeFilter !== 'all' && p.ventType !== state.ventTypeFilter) return false
      return true
    })
  }, [plumes, state.ventTypeFilter])

  const summary = useMemo(() => {
    if (filteredPlumes.length === 0) {
      return { avgPlumeHeight: 0, avgTemperature: 0, criticalCount: 0 }
    }
    const avgPlumeHeight = filteredPlumes.reduce((sum, p) => sum + p.plumeHeight, 0) / filteredPlumes.length
    const avgTemperature = filteredPlumes.reduce((sum, p) => sum + p.temperature, 0) / filteredPlumes.length
    const criticalCount = filteredPlumes.filter(
      (p) => p.activityLevel === 'high' || p.activityLevel === 'eruptive'
    ).length
    return {
      avgPlumeHeight: Math.round(avgPlumeHeight),
      avgTemperature: Math.round(avgTemperature),
      criticalCount,
    }
  }, [filteredPlumes])

  const activePlume = useMemo(
    () => plumes.find((p) => p.id === state.activePlumeId) ?? null,
    [plumes, state.activePlumeId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HydrothermalPlumeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPlumeHeight', label: 'Plume Height', icon: Activity },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showParticleConcentration', label: 'Particle Conc.', icon: AlertTriangle },
    { key: 'showActivityLevel', label: 'Activity Level', icon: FlameIcon8 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlameIcon8 className="h-4 w-4 text-orange-600" />
              Hydrothermal Plume Tracker
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
          {/* Vent Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Vent Type
            </Label>
            <Select
              value={state.ventTypeFilter}
              onValueChange={(v) =>
                setState({
                  ventTypeFilter: v as HydrothermalPlumeState['ventTypeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vent Types</SelectItem>
                <SelectItem value="black_smoker">Black Smoker</SelectItem>
                <SelectItem value="white_smoker">White Smoker</SelectItem>
                <SelectItem value="diffuse_flow">Diffuse Flow</SelectItem>
                <SelectItem value="shimmer">Shimmer</SelectItem>
                <SelectItem value="beehive">Beehive</SelectItem>
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
                  <Icon className="h-3 w-3 text-orange-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Plume Height</div>
              <div className="text-sm font-semibold text-orange-600">{summary.avgPlumeHeight}</div>
              <div className="text-[9px] text-muted-foreground">m</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Temperature</div>
              <div className="text-sm font-semibold text-red-600">{summary.avgTemperature}</div>
              <div className="text-[9px] text-muted-foreground">°C</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High+Eruptive</div>
              <div className="text-sm font-semibold text-red-600">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">plumes</div>
            </div>
          </div>

          <Separator />

          {/* Plume List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Hydrothermal Plumes ({filteredPlumes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPlumes.map((plume) => {
                  const isActive = state.activePlumeId === plume.id
                  const activityCfg = ACTIVITY_CONFIG[plume.activityLevel]
                  return (
                    <div
                      key={plume.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
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
                            style={{ backgroundColor: activityCfg.color }}
                          />
                          <span className="text-xs font-medium">{plume.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${activityCfg.bgClass}`}
                        >
                          {activityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showPlumeHeight && (
                          <div>
                            Height: <span className="text-foreground font-medium">{plume.plumeHeight} m</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp: <span className="text-foreground font-medium">{plume.temperature} °C</span>
                          </div>
                        )}
                        {state.showParticleConcentration && (
                          <div>
                            Particles: <span className="text-foreground font-medium">{plume.particleConcentration} μg/L</span>
                          </div>
                        )}
                        {state.showActivityLevel && (
                          <div>
                            Depth: <span className="text-foreground font-medium">{plume.depth} m</span>
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
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-xs font-semibold">{activePlume.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ACTIVITY_CONFIG[activePlume.activityLevel].bgClass}`}
                  >
                    {ACTIVITY_CONFIG[activePlume.activityLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activePlume.lat.toFixed(2)}, {activePlume.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vent Type: </span>
                    <span className="font-medium">{VENT_TYPE_LABELS[activePlume.ventType]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activePlume.depth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plume Height: </span>
                    <span className="font-medium">{activePlume.plumeHeight} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activePlume.temperature} °C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Particles: </span>
                    <span className="font-medium">{activePlume.particleConcentration} μg/L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chemistry: </span>
                    <span className="font-medium">{activePlume.chemicalSignature.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biodiversity: </span>
                    <span className="font-medium">{(activePlume.biodiversityIndex * 100).toFixed(0)}%</span>
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
