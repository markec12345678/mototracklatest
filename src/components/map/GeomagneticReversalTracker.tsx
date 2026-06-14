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
import { useMapStore, type GeomagneticReversalState, type GeomagneticStation } from '@/lib/map-store'
import { Compass as CompassIcon2, X, Navigation, Activity, Zap, ShieldAlert, MapPin, Filter } from 'lucide-react'

const DEMO_STATIONS: GeomagneticStation[] = [
  {
    id: 'gm-svalbard',
    name: 'Svalbard Observatory',
    latitude: 78.23,
    longitude: 15.63,
    declination: 8.5,
    inclination: 79.2,
    fieldIntensity: 52.3,
    secularVariation: -0.12,
    poleDistance: 1200,
    anomalyStrength: 2.1,
    reversalProximity: 'negligible',
  },
  {
    id: 'gm-brazil',
    name: 'Brazil Anomaly Zone',
    latitude: -15.78,
    longitude: -47.92,
    declination: -19.8,
    inclination: -22.5,
    fieldIntensity: 22.8,
    secularVariation: -0.28,
    poleDistance: 8900,
    anomalyStrength: 18.6,
    reversalProximity: 'high',
  },
  {
    id: 'gm-south-atlantic',
    name: 'South Atlantic Anomaly',
    latitude: -28.45,
    longitude: -42.33,
    declination: -22.3,
    inclination: -38.7,
    fieldIntensity: 24.1,
    secularVariation: -0.35,
    poleDistance: 9200,
    anomalyStrength: 22.4,
    reversalProximity: 'imminent',
  },
  {
    id: 'gm-siberia',
    name: 'Siberian Magnetic High',
    latitude: 62.03,
    longitude: 112.48,
    declination: 12.4,
    inclination: 72.8,
    fieldIntensity: 61.5,
    secularVariation: 0.08,
    poleDistance: 3100,
    anomalyStrength: 3.8,
    reversalProximity: 'negligible',
  },
  {
    id: 'gm-australia',
    name: 'Australian Station',
    latitude: -30.35,
    longitude: 149.17,
    declination: 11.7,
    inclination: -64.2,
    fieldIntensity: 55.1,
    secularVariation: 0.04,
    poleDistance: 7800,
    anomalyStrength: 4.2,
    reversalProximity: 'low',
  },
  {
    id: 'gm-africa',
    name: 'Central Africa Station',
    latitude: 4.37,
    longitude: 18.58,
    declination: -3.2,
    inclination: -28.4,
    fieldIntensity: 31.7,
    secularVariation: -0.18,
    poleDistance: 8100,
    anomalyStrength: 12.3,
    reversalProximity: 'moderate',
  },
]

const PROXIMITY_CONFIG: Record<
  GeomagneticStation['reversalProximity'],
  { label: string; color: string; bgClass: string }
> = {
  negligible: { label: 'Negligible', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  imminent: { label: 'Imminent', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function GeomagneticReversalTracker() {
  const state = useMapStore((s) => s.geomagneticReversal)
  const setState = useMapStore((s) => s.setGeomagneticReversal)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.proximityFilter !== 'all' && s.reversalProximity !== state.proximityFilter) return false
      return true
    })
  }, [stations, state.proximityFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgFieldIntensity: 0, avgSecularVariation: 0, highProximityCount: 0 }
    }
    const avgFieldIntensity = filteredStations.reduce((sum, s) => sum + s.fieldIntensity, 0) / filteredStations.length
    const avgSecularVariation = filteredStations.reduce((sum, s) => sum + s.secularVariation, 0) / filteredStations.length
    const highProximityCount = filteredStations.filter(
      (s) => s.reversalProximity === 'high' || s.reversalProximity === 'imminent'
    ).length
    return {
      avgFieldIntensity: Math.round(avgFieldIntensity * 10) / 10,
      avgSecularVariation: Math.round(avgSecularVariation * 100) / 100,
      highProximityCount,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GeomagneticReversalState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDeclination', label: 'Declination', icon: Navigation },
    { key: 'showSecularVariation', label: 'Secular Variation', icon: Activity },
    { key: 'showFieldIntensity', label: 'Field Intensity', icon: Zap },
    { key: 'showReversalProximity', label: 'Reversal Proximity', icon: ShieldAlert },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CompassIcon2 className="h-4 w-4 text-rose-600" />
              Geomagnetic Reversal Tracker
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
          {/* Proximity Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Reversal Proximity
            </Label>
            <Select
              value={state.proximityFilter}
              onValueChange={(v) =>
                setState({
                  proximityFilter: v as GeomagneticReversalState['proximityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Proximities</SelectItem>
                <SelectItem value="negligible">Negligible</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="imminent">Imminent</SelectItem>
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
                  <Icon className="h-3 w-3 text-rose-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Intensity</div>
              <div className="text-sm font-semibold">{summary.avgFieldIntensity}</div>
              <div className="text-[9px] text-muted-foreground">μT</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Secular Var</div>
              <div className="text-sm font-semibold text-rose-600">{summary.avgSecularVariation}</div>
              <div className="text-[9px] text-muted-foreground">μT/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Imminent</div>
              <div className="text-sm font-semibold text-red-600">{summary.highProximityCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Geomagnetic Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const proxConfig = PROXIMITY_CONFIG[station.reversalProximity]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-500/5'
                          : 'border-border/40 hover:border-rose-500/20 hover:bg-rose-500/5'
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
                            style={{ backgroundColor: proxConfig.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${proxConfig.bgClass}`}
                        >
                          {proxConfig.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showDeclination && (
                          <div>
                            Declination:{' '}
                            <span className="text-foreground font-medium">
                              {station.declination}°
                            </span>
                          </div>
                        )}
                        {state.showSecularVariation && (
                          <div>
                            Sec. Var:{' '}
                            <span className="text-foreground font-medium">
                              {station.secularVariation} μT/yr
                            </span>
                          </div>
                        )}
                        {state.showFieldIntensity && (
                          <div>
                            Intensity:{' '}
                            <span className="text-foreground font-medium">
                              {station.fieldIntensity} μT
                            </span>
                          </div>
                        )}
                        {state.showReversalProximity && (
                          <div>
                            Anomaly:{' '}
                            <span className="text-foreground font-medium">
                              {station.anomalyStrength}
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
              <div className="space-y-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-600" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${PROXIMITY_CONFIG[activeStation.reversalProximity].bgClass}`}
                  >
                    {PROXIMITY_CONFIG[activeStation.reversalProximity].label}
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
                    <span className="text-muted-foreground">Declination: </span>
                    <span className="font-medium">{activeStation.declination}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inclination: </span>
                    <span className="font-medium">{activeStation.inclination}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Field Intensity: </span>
                    <span className="font-medium">{activeStation.fieldIntensity} μT</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Secular Var: </span>
                    <span className="font-medium">{activeStation.secularVariation} μT/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pole Distance: </span>
                    <span className="font-medium">{activeStation.poleDistance} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Anomaly Strength: </span>
                    <span className="font-medium">{activeStation.anomalyStrength}</span>
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
