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
import { useMapStore, type VolcanicAshDispersionState, type AshDispersionPlume } from '@/lib/map-store'
import { CloudOff as CloudOffIcon2, X, ArrowUp, Circle, Wind, AlertTriangle, MapPin, Filter } from 'lucide-react'

const DEMO_PLUMES: AshDispersionPlume[] = [
  {
    id: 'va-eyjafjallajokull',
    name: 'Eyjafjallajökull Iceland',
    latitude: 63.6333,
    longitude: -19.6333,
    volcanoType: 'stratovolcano',
    ashColumnHeight: 10,
    dispersionRadius: 1800,
    particleConcentration: 4.2,
    windSpeed: 45,
    aviationThreat: 'critical',
  },
  {
    id: 'va-sthelens',
    name: 'Mount St. Helens USA',
    latitude: 46.1983,
    longitude: -122.1892,
    volcanoType: 'stratovolcano',
    ashColumnHeight: 15,
    dispersionRadius: 600,
    particleConcentration: 8.7,
    windSpeed: 30,
    aviationThreat: 'high',
  },
  {
    id: 'va-sakurajima',
    name: 'Sakurajima Japan',
    latitude: 31.5850,
    longitude: 130.6572,
    volcanoType: 'stratovolcano',
    ashColumnHeight: 5,
    dispersionRadius: 250,
    particleConcentration: 3.1,
    windSpeed: 22,
    aviationThreat: 'moderate',
  },
  {
    id: 'va-popocatepetl',
    name: 'Popocatépetl Mexico',
    latitude: 19.0233,
    longitude: -98.6225,
    volcanoType: 'stratovolcano',
    ashColumnHeight: 7,
    dispersionRadius: 350,
    particleConcentration: 5.5,
    windSpeed: 28,
    aviationThreat: 'high',
  },
  {
    id: 'va-taal',
    name: 'Taal Philippines',
    latitude: 14.0106,
    longitude: 120.9975,
    volcanoType: 'caldera',
    ashColumnHeight: 12,
    dispersionRadius: 800,
    particleConcentration: 6.8,
    windSpeed: 35,
    aviationThreat: 'critical',
  },
  {
    id: 'va-ruapehu',
    name: 'Ruapehu New Zealand',
    latitude: -39.2817,
    longitude: 175.5722,
    volcanoType: 'stratovolcano',
    ashColumnHeight: 4,
    dispersionRadius: 150,
    particleConcentration: 2.1,
    windSpeed: 18,
    aviationThreat: 'low',
  },
]

const AVIATION_CONFIG: Record<
  AshDispersionPlume['aviationThreat'],
  { label: string; color: string; bgClass: string }
> = {
  none: { label: 'None', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_CONFIG: Record<
  AshDispersionPlume['volcanoType'],
  { label: string }
> = {
  stratovolcano: { label: 'Stratovolcano' },
  caldera: { label: 'Caldera' },
  fissure: { label: 'Fissure' },
  dome: { label: 'Dome' },
  shield: { label: 'Shield' },
  maar: { label: 'Maar' },
}

export function VolcanicAshDispersion() {
  const state = useMapStore((s) => s.volcanicAshDispersion)
  const setState = useMapStore((s) => s.setVolcanicAshDispersion)

  const plumes = useMemo(
    () => (state.plumes.length > 0 ? state.plumes : DEMO_PLUMES),
    [state.plumes]
  )

  const filteredPlumes = useMemo(() => {
    return plumes.filter((p) => {
      if (state.typeFilter !== 'all' && p.volcanoType !== state.typeFilter) return false
      return true
    })
  }, [plumes, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredPlumes.length === 0) {
      return { avgColumnHeight: 0, avgDispersionRadius: 0, highCriticalCount: 0 }
    }
    const avgColumnHeight = filteredPlumes.reduce((sum, p) => sum + p.ashColumnHeight, 0) / filteredPlumes.length
    const avgDispersionRadius = filteredPlumes.reduce((sum, p) => sum + p.dispersionRadius, 0) / filteredPlumes.length
    const highCriticalCount = filteredPlumes.filter(
      (p) => p.aviationThreat === 'high' || p.aviationThreat === 'critical'
    ).length
    return {
      avgColumnHeight: Math.round(avgColumnHeight * 10) / 10,
      avgDispersionRadius: Math.round(avgDispersionRadius),
      highCriticalCount,
    }
  }, [filteredPlumes])

  const activePlume = useMemo(
    () => plumes.find((p) => p.id === state.activePlumeId) ?? null,
    [plumes, state.activePlumeId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicAshDispersionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showColumnHeight', label: 'Column Height', icon: ArrowUp },
    { key: 'showDispersionRadius', label: 'Dispersion Radius', icon: Circle },
    { key: 'showConcentration', label: 'Concentration', icon: Wind },
    { key: 'showAviationThreat', label: 'Aviation Threat', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudOffIcon2 className="h-4 w-4 text-gray-600" />
              Volcanic Ash Dispersion
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
              Volcano Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as VolcanicAshDispersionState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="stratovolcano">Stratovolcano</SelectItem>
                <SelectItem value="caldera">Caldera</SelectItem>
                <SelectItem value="fissure">Fissure</SelectItem>
                <SelectItem value="dome">Dome</SelectItem>
                <SelectItem value="shield">Shield</SelectItem>
                <SelectItem value="maar">Maar</SelectItem>
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
                  <Icon className="h-3 w-3 text-gray-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Column Ht</div>
              <div className="text-sm font-semibold">{summary.avgColumnHeight} km</div>
              <div className="text-[9px] text-muted-foreground">height</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Dispersion</div>
              <div className="text-sm font-semibold text-gray-600">{summary.avgDispersionRadius} km</div>
              <div className="text-[9px] text-muted-foreground">radius</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High+Critical</div>
              <div className="text-sm font-semibold text-red-600">{summary.highCriticalCount}</div>
              <div className="text-[9px] text-muted-foreground">plumes</div>
            </div>
          </div>

          <Separator />

          {/* Plume List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Ash Dispersion Plumes ({filteredPlumes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPlumes.map((plume) => {
                  const isActive = state.activePlumeId === plume.id
                  const aviationCfg = AVIATION_CONFIG[plume.aviationThreat]
                  return (
                    <div
                      key={plume.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-gray-500/50 bg-gray-500/5'
                          : 'border-border/40 hover:border-gray-500/20 hover:bg-gray-500/5'
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
                            style={{ backgroundColor: aviationCfg.color }}
                          />
                          <span className="text-xs font-medium">{plume.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${aviationCfg.bgClass}`}
                        >
                          {aviationCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showColumnHeight && (
                          <div>
                            Column Ht:{' '}
                            <span className="text-foreground font-medium">
                              {plume.ashColumnHeight} km
                            </span>
                          </div>
                        )}
                        {state.showDispersionRadius && (
                          <div>
                            Dispersion:{' '}
                            <span className="text-foreground font-medium">
                              {plume.dispersionRadius} km
                            </span>
                          </div>
                        )}
                        {state.showConcentration && (
                          <div>
                            Conc.:{' '}
                            <span className="text-foreground font-medium">
                              {plume.particleConcentration.toFixed(1)} mg/m³
                            </span>
                          </div>
                        )}
                        {state.showAviationThreat && (
                          <div>
                            Wind:{' '}
                            <span className="text-foreground font-medium">
                              {plume.windSpeed} km/h
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
              <div className="space-y-2 rounded-lg border border-gray-500/20 bg-gray-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-xs font-semibold">{activePlume.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${AVIATION_CONFIG[activePlume.aviationThreat].bgClass}`}
                  >
                    {AVIATION_CONFIG[activePlume.aviationThreat].label}
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
                    <span className="text-muted-foreground">Volcano Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activePlume.volcanoType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Column Height: </span>
                    <span className="font-medium">{activePlume.ashColumnHeight} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dispersion: </span>
                    <span className="font-medium">{activePlume.dispersionRadius} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Concentration: </span>
                    <span className="font-medium">{activePlume.particleConcentration.toFixed(1)} mg/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Speed: </span>
                    <span className="font-medium">{activePlume.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aviation Threat: </span>
                    <span className="font-medium">{AVIATION_CONFIG[activePlume.aviationThreat].label}</span>
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
