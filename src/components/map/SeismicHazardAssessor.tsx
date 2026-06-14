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
import { useMapStore, type SeismicHazardState, type SeismicHazardZone } from '@/lib/map-store'
import { Activity as ActivityIcon2, X, Gauge, AlertTriangle, MapPin, Filter, Waves } from 'lucide-react'

const DEMO_ZONES: SeismicHazardZone[] = [
  {
    id: 'sh-sa',
    name: 'San Andreas Fault, CA',
    latitude: 36.12,
    longitude: -120.85,
    peakGroundAcceleration: 0.68,
    magnitude: 7.9,
    depth: 12,
    faultType: 'strike_slip',
    recurrenceInterval: 150,
    soilAmplification: 1.8,
    liquefactionPotential: 'high',
    hazardLevel: 'extreme',
  },
  {
    id: 'sh-na',
    name: 'North Anatolian Fault, Turkey',
    latitude: 40.70,
    longitude: 31.60,
    peakGroundAcceleration: 0.55,
    magnitude: 7.4,
    depth: 15,
    faultType: 'strike_slip',
    recurrenceInterval: 75,
    soilAmplification: 2.1,
    liquefactionPotential: 'very_high',
    hazardLevel: 'very_high',
  },
  {
    id: 'sh-hf',
    name: 'Himalayan Front',
    latitude: 28.50,
    longitude: 84.70,
    peakGroundAcceleration: 0.72,
    magnitude: 8.1,
    depth: 20,
    faultType: 'reverse',
    recurrenceInterval: 250,
    soilAmplification: 1.5,
    liquefactionPotential: 'moderate',
    hazardLevel: 'extreme',
  },
  {
    id: 'sh-cs',
    name: 'Chile Subduction Zone',
    latitude: -35.80,
    longitude: -72.70,
    peakGroundAcceleration: 0.61,
    magnitude: 8.5,
    depth: 30,
    faultType: 'reverse',
    recurrenceInterval: 120,
    soilAmplification: 1.3,
    liquefactionPotential: 'low',
    hazardLevel: 'very_high',
  },
  {
    id: 'sh-nm',
    name: 'New Madrid Fault, MO',
    latitude: 36.60,
    longitude: -89.50,
    peakGroundAcceleration: 0.42,
    magnitude: 6.8,
    depth: 10,
    faultType: 'oblique',
    recurrenceInterval: 500,
    soilAmplification: 3.2,
    liquefactionPotential: 'very_high',
    hazardLevel: 'high',
  },
  {
    id: 'sh-cz',
    name: 'Cascadia Subduction, WA',
    latitude: 47.60,
    longitude: -123.80,
    peakGroundAcceleration: 0.58,
    magnitude: 9.0,
    depth: 25,
    faultType: 'reverse',
    recurrenceInterval: 300,
    soilAmplification: 1.9,
    liquefactionPotential: 'high',
    hazardLevel: 'very_high',
  },
]

const HAZARD_CONFIG: Record<
  SeismicHazardZone['hazardLevel'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  high: { label: 'High', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  very_high: { label: 'Very High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const FAULT_TYPE_CONFIG: Record<
  SeismicHazardZone['faultType'],
  { label: string }
> = {
  strike_slip: { label: 'Strike-Slip' },
  reverse: { label: 'Reverse' },
  normal: { label: 'Normal' },
  oblique: { label: 'Oblique' },
  unknown: { label: 'Unknown' },
}

const LIQUEFACTION_CONFIG: Record<
  SeismicHazardZone['liquefactionPotential'],
  { label: string; color: string }
> = {
  none: { label: 'None', color: '#22c55e' },
  low: { label: 'Low', color: '#3b82f6' },
  moderate: { label: 'Moderate', color: '#eab308' },
  high: { label: 'High', color: '#f97316' },
  very_high: { label: 'Very High', color: '#ef4444' },
}

export function SeismicHazardAssessor() {
  const state = useMapStore((s) => s.seismicHazard)
  const setState = useMapStore((s) => s.setSeismicHazard)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.hazardFilter !== 'all' && z.hazardLevel !== state.hazardFilter) return false
      return true
    })
  }, [zones, state.hazardFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgPGA: 0, avgMagnitude: 0, highHazardCount: 0 }
    }
    const avgPGA = filteredZones.reduce((sum, z) => sum + z.peakGroundAcceleration, 0) / filteredZones.length
    const avgMagnitude = filteredZones.reduce((sum, z) => sum + z.magnitude, 0) / filteredZones.length
    const highHazardCount = filteredZones.filter(
      (z) => z.hazardLevel === 'very_high' || z.hazardLevel === 'extreme'
    ).length
    return {
      avgPGA: Math.round(avgPGA * 100) / 100,
      avgMagnitude: Math.round(avgMagnitude * 10) / 10,
      highHazardCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeismicHazardState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPGA', label: 'Peak Ground Accel.', icon: Gauge },
    { key: 'showMagnitude', label: 'Magnitude', icon: AlertTriangle },
    { key: 'showLiquefaction', label: 'Liquefaction', icon: Waves },
    { key: 'showHazardLevel', label: 'Hazard Level', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ActivityIcon2 className="h-4 w-4 text-red-600" />
              Seismic Hazard Assessor
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
          {/* Hazard Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Hazard Level
            </Label>
            <Select
              value={state.hazardFilter}
              onValueChange={(v) =>
                setState({
                  hazardFilter: v as SeismicHazardState['hazardFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg PGA</div>
              <div className="text-sm font-semibold">{summary.avgPGA}g</div>
              <div className="text-[9px] text-muted-foreground">acceleration</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Magnitude</div>
              <div className="text-sm font-semibold text-red-600">{summary.avgMagnitude}</div>
              <div className="text-[9px] text-muted-foreground">Mw scale</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">V.High/Extreme</div>
              <div className="text-sm font-semibold text-red-600">{summary.highHazardCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Seismic Hazard Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const hazardCfg = HAZARD_CONFIG[zone.hazardLevel]
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
                            style={{ backgroundColor: hazardCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${hazardCfg.bgClass}`}
                        >
                          {hazardCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showPGA && (
                          <div>
                            PGA:{' '}
                            <span className="text-foreground font-medium">
                              {zone.peakGroundAcceleration}g
                            </span>
                          </div>
                        )}
                        {state.showMagnitude && (
                          <div>
                            Mag:{' '}
                            <span className="text-foreground font-medium">
                              M{zone.magnitude}
                            </span>
                          </div>
                        )}
                        {state.showLiquefaction && (
                          <div>
                            Liquefaction:{' '}
                            <span className="text-foreground font-medium">
                              {LIQUEFACTION_CONFIG[zone.liquefactionPotential].label}
                            </span>
                          </div>
                        )}
                        {state.showHazardLevel && (
                          <div>
                            Fault:{' '}
                            <span className="text-foreground font-medium">
                              {FAULT_TYPE_CONFIG[zone.faultType].label}
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
                    className={`text-[10px] h-5 ml-auto ${HAZARD_CONFIG[activeZone.hazardLevel].bgClass}`}
                  >
                    {HAZARD_CONFIG[activeZone.hazardLevel].label}
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
                    <span className="text-muted-foreground">PGA: </span>
                    <span className="font-medium">{activeZone.peakGroundAcceleration}g</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Magnitude: </span>
                    <span className="font-medium">M{activeZone.magnitude}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeZone.depth} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fault Type: </span>
                    <span className="font-medium">{FAULT_TYPE_CONFIG[activeZone.faultType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recurrence: </span>
                    <span className="font-medium">{activeZone.recurrenceInterval} yrs</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Soil Amplif.: </span>
                    <span className="font-medium">{activeZone.soilAmplification}x</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Liquefaction: </span>
                    <span className="font-medium" style={{ color: LIQUEFACTION_CONFIG[activeZone.liquefactionPotential].color }}>
                      {LIQUEFACTION_CONFIG[activeZone.liquefactionPotential].label}
                    </span>
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
