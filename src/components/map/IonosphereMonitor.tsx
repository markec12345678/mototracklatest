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
import { useMapStore, type IonosphereState, type IonosphereStation } from '@/lib/map-store'
import { Radio as RadioIcon3, X, Activity, Signal, Navigation, Layers, MapPin, Filter } from 'lucide-react'

const DEMO_STATIONS: IonosphereStation[] = [
  {
    id: 'iono-jicamarca',
    name: 'Jicamarca',
    latitude: -11.95,
    longitude: -76.87,
    tecValue: 85,
    f2PeakDensity: 12.5,
    f2PeakHeight: 350,
    spreadF: 'moderate',
    scintillation: 'extreme',
    gpsImpact: 'severe',
    region: 'equatorial',
  },
  {
    id: 'iono-tromso',
    name: 'Tromsø',
    latitude: 69.58,
    longitude: 19.23,
    tecValue: 22,
    f2PeakDensity: 3.8,
    f2PeakHeight: 280,
    spreadF: 'none',
    scintillation: 'moderate',
    gpsImpact: 'moderate',
    region: 'auroral',
  },
  {
    id: 'iono-thule',
    name: 'Thule',
    latitude: 76.53,
    longitude: -68.38,
    tecValue: 14,
    f2PeakDensity: 2.1,
    f2PeakHeight: 240,
    spreadF: 'none',
    scintillation: 'high',
    gpsImpact: 'severe',
    region: 'polar',
  },
  {
    id: 'iono-boulder',
    name: 'Boulder',
    latitude: 40.04,
    longitude: -105.26,
    tecValue: 48,
    f2PeakDensity: 8.2,
    f2PeakHeight: 310,
    spreadF: 'weak',
    scintillation: 'low',
    gpsImpact: 'minor',
    region: 'mid_latitude',
  },
  {
    id: 'iono-kokubunji',
    name: 'Kokubunji',
    latitude: 35.71,
    longitude: 139.49,
    tecValue: 62,
    f2PeakDensity: 9.8,
    f2PeakHeight: 320,
    spreadF: 'moderate',
    scintillation: 'moderate',
    gpsImpact: 'moderate',
    region: 'mid_latitude',
  },
  {
    id: 'iono-svalbard',
    name: 'Svalbard',
    latitude: 78.15,
    longitude: 16.02,
    tecValue: 18,
    f2PeakDensity: 2.8,
    f2PeakHeight: 260,
    spreadF: 'none',
    scintillation: 'high',
    gpsImpact: 'severe',
    region: 'polar',
  },
]

const SCINTILLATION_CONFIG: Record<
  IonosphereStation['scintillation'],
  { label: string; color: string; bgClass: string }
> = {
  none: { label: 'None', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const GPS_IMPACT_CONFIG: Record<
  IonosphereStation['gpsImpact'],
  { label: string; bgClass: string }
> = {
  none: { label: 'None', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  minor: { label: 'Minor', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severe: { label: 'Severe', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const REGION_LABELS: Record<IonosphereStation['region'], string> = {
  polar: 'Polar',
  auroral: 'Auroral',
  mid_latitude: 'Mid-Latitude',
  equatorial: 'Equatorial',
}

const SPREAD_F_CONFIG: Record<
  IonosphereStation['spreadF'],
  { label: string; bgClass: string }
> = {
  none: { label: 'None', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  weak: { label: 'Weak', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  strong: { label: 'Strong', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function IonosphereMonitor() {
  const ionosphere = useMapStore((s) => s.ionosphere)
  const setIonosphere = useMapStore((s) => s.setIonosphere)

  const stations = useMemo(
    () => (ionosphere.stations.length > 0 ? ionosphere.stations : DEMO_STATIONS),
    [ionosphere.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (ionosphere.regionFilter !== 'all' && s.region !== ionosphere.regionFilter) return false
      return true
    })
  }, [stations, ionosphere.regionFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { maxTEC: 0, extremeScintCount: 0, severeGPSCount: 0 }
    }
    const maxTEC = Math.max(...filteredStations.map((s) => s.tecValue))
    const extremeScintCount = filteredStations.filter((s) => s.scintillation === 'extreme').length
    const severeGPSCount = filteredStations.filter((s) => s.gpsImpact === 'severe').length
    return { maxTEC, extremeScintCount, severeGPSCount }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === ionosphere.activeStationId) ?? null,
    [stations, ionosphere.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!ionosphere.open) return null

  const overlayToggles: { key: keyof IonosphereState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTEC', label: 'TEC', icon: Activity },
    { key: 'showScintillation', label: 'Scintillation', icon: Signal },
    { key: 'showGPSImpact', label: 'GPS Impact', icon: Navigation },
    { key: 'showSpreadF', label: 'Spread F', icon: Layers },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <RadioIcon3 className="h-4 w-4 text-rose-500" />
              Ionosphere Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIonosphere({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region
            </Label>
            <Select
              value={ionosphere.regionFilter}
              onValueChange={(v) =>
                setIonosphere({
                  regionFilter: v as IonosphereState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="polar">Polar</SelectItem>
                <SelectItem value="auroral">Auroral</SelectItem>
                <SelectItem value="mid_latitude">Mid-Latitude</SelectItem>
                <SelectItem value="equatorial">Equatorial</SelectItem>
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
                  <Icon className="h-3 w-3 text-rose-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={ionosphere[key] as boolean}
                  onCheckedChange={(checked) => setIonosphere({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max TEC</div>
              <div className="text-sm font-semibold text-rose-500">{summary.maxTEC}</div>
              <div className="text-[9px] text-muted-foreground">TECU</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Extreme Scint</div>
              <div className="text-sm font-semibold text-red-500">{summary.extremeScintCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Severe GPS</div>
              <div className="text-sm font-semibold text-orange-500">{summary.severeGPSCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Monitoring Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = ionosphere.activeStationId === station.id
                  const scintCfg = SCINTILLATION_CONFIG[station.scintillation]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-500/5'
                          : 'border-border/40 hover:border-rose-500/20 hover:bg-rose-500/5'
                      }`}
                      onClick={() =>
                        setIonosphere({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: scintCfg.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${scintCfg.bgClass}`}
                        >
                          {scintCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {ionosphere.showTEC && (
                          <div>
                            TEC:{' '}
                            <span className="text-foreground font-medium">
                              {station.tecValue} TECU
                            </span>
                          </div>
                        )}
                        {ionosphere.showScintillation && (
                          <div>
                            Scint:{' '}
                            <span className="text-foreground font-medium">
                              {SCINTILLATION_CONFIG[station.scintillation].label}
                            </span>
                          </div>
                        )}
                        {ionosphere.showGPSImpact && (
                          <div>
                            GPS:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${GPS_IMPACT_CONFIG[station.gpsImpact].bgClass}`}
                            >
                              {GPS_IMPACT_CONFIG[station.gpsImpact].label}
                            </Badge>
                          </div>
                        )}
                        {ionosphere.showSpreadF && (
                          <div>
                            Spread F:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${SPREAD_F_CONFIG[station.spreadF].bgClass}`}
                            >
                              {SPREAD_F_CONFIG[station.spreadF].label}
                            </Badge>
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
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SCINTILLATION_CONFIG[activeStation.scintillation].bgClass}`}
                  >
                    {SCINTILLATION_CONFIG[activeStation.scintillation].label}
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
                    <span className="text-muted-foreground">Region: </span>
                    <span className="font-medium">{REGION_LABELS[activeStation.region]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TEC: </span>
                    <span className="font-medium">{activeStation.tecValue} TECU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">F2 Peak Density: </span>
                    <span className="font-medium">{activeStation.f2PeakDensity} ×10⁵ /cm³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">F2 Peak Height: </span>
                    <span className="font-medium">{activeStation.f2PeakHeight} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spread F: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 ${SPREAD_F_CONFIG[activeStation.spreadF].bgClass}`}
                    >
                      {SPREAD_F_CONFIG[activeStation.spreadF].label}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GPS Impact: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 ${GPS_IMPACT_CONFIG[activeStation.gpsImpact].bgClass}`}
                    >
                      {GPS_IMPACT_CONFIG[activeStation.gpsImpact].label}
                    </Badge>
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
