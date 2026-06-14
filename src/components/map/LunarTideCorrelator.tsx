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
import { useMapStore, type LunarTideState, type TideStation } from '@/lib/map-store'
import { Moon as MoonIcon, X, Gauge, Target, MapPin, Filter, Waves } from 'lucide-react'

const DEMO_STATIONS: TideStation[] = [
  {
    id: 'lt-fundy',
    name: 'Bay of Fundy Canada',
    latitude: 45.25,
    longitude: -64.33,
    tideType: 'semidiurnal',
    lunarPhase: 'full_moon',
    tidalRange: 16.3,
    springRange: 17.8,
    neapRange: 8.2,
    correlationCoeff: 0.96,
    forecastAccuracy: 'exceptional',
  },
  {
    id: 'lt-bristol',
    name: 'Bristol Channel UK',
    latitude: 51.40,
    longitude: -3.00,
    tideType: 'semidiurnal',
    lunarPhase: 'waxing_gibbous',
    tidalRange: 12.4,
    springRange: 14.6,
    neapRange: 6.3,
    correlationCoeff: 0.94,
    forecastAccuracy: 'excellent',
  },
  {
    id: 'lt-mont',
    name: 'Mont Saint-Michel France',
    latitude: 48.64,
    longitude: -1.51,
    tideType: 'semidiurnal',
    lunarPhase: 'first_quarter',
    tidalRange: 10.9,
    springRange: 12.3,
    neapRange: 5.6,
    correlationCoeff: 0.92,
    forecastAccuracy: 'excellent',
  },
  {
    id: 'lt-darwin',
    name: 'Darwin Australia',
    latitude: -12.46,
    longitude: 130.84,
    tideType: 'mixed_semidiurnal',
    lunarPhase: 'waxing_crescent',
    tidalRange: 6.8,
    springRange: 7.9,
    neapRange: 3.2,
    correlationCoeff: 0.88,
    forecastAccuracy: 'good',
  },
  {
    id: 'lt-semidiurnal',
    name: 'Semidiurnal Bay Alaska',
    latitude: 59.50,
    longitude: -150.00,
    tideType: 'mixed_semidiurnal',
    lunarPhase: 'waning_gibbous',
    tidalRange: 8.2,
    springRange: 9.5,
    neapRange: 4.1,
    correlationCoeff: 0.90,
    forecastAccuracy: 'good',
  },
  {
    id: 'lt-tonkin',
    name: 'Gulf of Tonkin Vietnam',
    latitude: 19.50,
    longitude: 107.00,
    tideType: 'diurnal',
    lunarPhase: 'new_moon',
    tidalRange: 3.6,
    springRange: 4.2,
    neapRange: 1.8,
    correlationCoeff: 0.82,
    forecastAccuracy: 'fair',
  },
]

const ACCURACY_CONFIG: Record<
  TideStation['forecastAccuracy'],
  { label: string; color: string; bgClass: string }
> = {
  poor: { label: 'Poor', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  fair: { label: 'Fair', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  good: { label: 'Good', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  excellent: { label: 'Excellent', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  exceptional: { label: 'Exceptional', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

const TYPE_CONFIG: Record<
  TideStation['tideType'],
  { label: string }
> = {
  semidiurnal: { label: 'Semidiurnal' },
  diurnal: { label: 'Diurnal' },
  mixed_semidiurnal: { label: 'Mixed Semidiurnal' },
  mixed_diurnal: { label: 'Mixed Diurnal' },
}

const LUNAR_PHASE_CONFIG: Record<
  TideStation['lunarPhase'],
  { label: string; emoji: string }
> = {
  new_moon: { label: 'New Moon', emoji: '🌑' },
  waxing_crescent: { label: 'Waxing Crescent', emoji: '🌒' },
  first_quarter: { label: 'First Quarter', emoji: '🌓' },
  waxing_gibbous: { label: 'Waxing Gibbous', emoji: '🌔' },
  full_moon: { label: 'Full Moon', emoji: '🌕' },
  waning_gibbous: { label: 'Waning Gibbous', emoji: '🌖' },
  last_quarter: { label: 'Last Quarter', emoji: '🌗' },
  waning_crescent: { label: 'Waning Crescent', emoji: '🌘' },
}

export function LunarTideCorrelator() {
  const state = useMapStore((s) => s.lunarTide)
  const setState = useMapStore((s) => s.setLunarTide)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.typeFilter !== 'all' && s.tideType !== state.typeFilter) return false
      return true
    })
  }, [stations, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgTidalRange: 0, avgCorrelation: 0, goodExceptionalCount: 0 }
    }
    const avgTidalRange = filteredStations.reduce((sum, s) => sum + s.tidalRange, 0) / filteredStations.length
    const avgCorrelation = filteredStations.reduce((sum, s) => sum + s.correlationCoeff, 0) / filteredStations.length
    const goodExceptionalCount = filteredStations.filter(
      (s) => s.forecastAccuracy === 'good' || s.forecastAccuracy === 'excellent' || s.forecastAccuracy === 'exceptional'
    ).length
    return {
      avgTidalRange: Math.round(avgTidalRange * 10) / 10,
      avgCorrelation: Math.round(avgCorrelation * 100) / 100,
      goodExceptionalCount,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LunarTideState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTidalRange', label: 'Tidal Range', icon: Gauge },
    { key: 'showLunarPhase', label: 'Lunar Phase', icon: MoonIcon },
    { key: 'showCorrelation', label: 'Correlation', icon: Target },
    { key: 'showAccuracy', label: 'Accuracy', icon: Target },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MoonIcon className="h-4 w-4 text-indigo-600" />
              Lunar Tide Correlator
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
              Tide Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as LunarTideState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="semidiurnal">Semidiurnal</SelectItem>
                <SelectItem value="diurnal">Diurnal</SelectItem>
                <SelectItem value="mixed_semidiurnal">Mixed Semidiurnal</SelectItem>
                <SelectItem value="mixed_diurnal">Mixed Diurnal</SelectItem>
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
                  <Icon className="h-3 w-3 text-indigo-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Tidal Range</div>
              <div className="text-sm font-semibold">{summary.avgTidalRange.toFixed(1)}</div>
              <div className="text-[9px] text-muted-foreground">m</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Correlation</div>
              <div className="text-sm font-semibold text-indigo-600">{summary.avgCorrelation.toFixed(2)}</div>
              <div className="text-[9px] text-muted-foreground">r²</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Good+Exceptional</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.goodExceptionalCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Tide Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const accCfg = ACCURACY_CONFIG[station.forecastAccuracy]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/50 bg-indigo-500/5'
                          : 'border-border/40 hover:border-indigo-500/20 hover:bg-indigo-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: accCfg.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${accCfg.bgClass}`}
                        >
                          {accCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showTidalRange && (
                          <div>
                            Range:{' '}
                            <span className="text-foreground font-medium">
                              {station.tidalRange.toFixed(1)} m
                            </span>
                          </div>
                        )}
                        {state.showLunarPhase && (
                          <div>
                            Phase:{' '}
                            <span className="text-foreground font-medium">
                              {LUNAR_PHASE_CONFIG[station.lunarPhase].emoji} {LUNAR_PHASE_CONFIG[station.lunarPhase].label}
                            </span>
                          </div>
                        )}
                        {state.showCorrelation && (
                          <div>
                            Corr.:{' '}
                            <span className="text-foreground font-medium">
                              {station.correlationCoeff.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {state.showAccuracy && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {TYPE_CONFIG[station.tideType].label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ACCURACY_CONFIG[activeStation.forecastAccuracy].bgClass}`}
                  >
                    {ACCURACY_CONFIG[activeStation.forecastAccuracy].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeStation.latitude.toFixed(2)}, {activeStation.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tide Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activeStation.tideType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tidal Range: </span>
                    <span className="font-medium">{activeStation.tidalRange.toFixed(1)} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spring Range: </span>
                    <span className="font-medium">{activeStation.springRange.toFixed(1)} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Neap Range: </span>
                    <span className="font-medium">{activeStation.neapRange.toFixed(1)} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lunar Phase: </span>
                    <span className="font-medium">{LUNAR_PHASE_CONFIG[activeStation.lunarPhase].emoji} {LUNAR_PHASE_CONFIG[activeStation.lunarPhase].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Correlation: </span>
                    <span className="font-medium">{activeStation.correlationCoeff.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accuracy: </span>
                    <span className="font-medium">{ACCURACY_CONFIG[activeStation.forecastAccuracy].label}</span>
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
