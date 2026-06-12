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
import { useMapStore, type RadioSignalState, type RadioSignalStation } from '@/lib/map-store'
import { Radio as RadioIcon2, X, Activity, Gauge, Circle, AlertTriangle, Filter, MapPin } from 'lucide-react'

const DEMO_STATIONS: RadioSignalStation[] = [
  {
    id: 'rs-tokyo',
    name: 'Tokyo Relay Tower',
    latitude: 35.68,
    longitude: 139.69,
    frequency: 145.5,
    signalStrength: 92,
    modulationType: 'FM',
    coverageRadius: 85,
    interferenceLevel: 'none',
    bandType: 'VHF',
  },
  {
    id: 'rs-london',
    name: 'London Broadcast Hub',
    latitude: 51.51,
    longitude: -0.13,
    frequency: 446.0,
    signalStrength: 78,
    modulationType: 'DMR',
    coverageRadius: 60,
    interferenceLevel: 'low',
    bandType: 'UHF',
  },
  {
    id: 'rs-nyc',
    name: 'New York Metro Station',
    latitude: 40.71,
    longitude: -74.01,
    frequency: 162.475,
    signalStrength: 65,
    modulationType: 'NOAA',
    coverageRadius: 120,
    interferenceLevel: 'moderate',
    bandType: 'VHF',
  },
  {
    id: 'rs-sydney',
    name: 'Sydney Coastal Repeater',
    latitude: -33.87,
    longitude: 151.21,
    frequency: 28.45,
    signalStrength: 88,
    modulationType: 'SSB',
    coverageRadius: 200,
    interferenceLevel: 'none',
    bandType: 'HF',
  },
  {
    id: 'rs-mumbai',
    name: 'Mumbai Urban Relay',
    latitude: 19.08,
    longitude: 72.88,
    frequency: 868.125,
    signalStrength: 45,
    modulationType: 'LoRa',
    coverageRadius: 15,
    interferenceLevel: 'high',
    bandType: 'UHF',
  },
  {
    id: 'rs-saopaulo',
    name: 'São Paulo Mountain Repeater',
    latitude: -23.55,
    longitude: -46.63,
    frequency: 440.0,
    signalStrength: 71,
    modulationType: 'FM',
    coverageRadius: 95,
    interferenceLevel: 'low',
    bandType: 'UHF',
  },
]

const INTERFERENCE_CONFIG: Record<
  RadioSignalStation['interferenceLevel'],
  { label: string; color: string; bgClass: string }
> = {
  none: { label: 'None', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function RadioSignalMapper() {
  const radioSignal = useMapStore((s) => s.radioSignal)
  const setRadioSignal = useMapStore((s) => s.setRadioSignal)

  const stations = useMemo(
    () => (radioSignal.stations.length > 0 ? radioSignal.stations : DEMO_STATIONS),
    [radioSignal.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (radioSignal.interferenceFilter !== 'all' && s.interferenceLevel !== radioSignal.interferenceFilter) return false
      return true
    })
  }, [stations, radioSignal.interferenceFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgSignalStrength: 0, highInterferenceCount: 0, maxCoverageRadius: 0 }
    }
    const avgSignalStrength =
      filteredStations.reduce((sum, s) => sum + s.signalStrength, 0) / filteredStations.length
    const highInterferenceCount = filteredStations.filter(
      (s) => s.interferenceLevel === 'high' || s.interferenceLevel === 'moderate'
    ).length
    const maxCoverageRadius = Math.max(...filteredStations.map((s) => s.coverageRadius))
    return {
      avgSignalStrength: Math.round(avgSignalStrength * 10) / 10,
      highInterferenceCount,
      maxCoverageRadius,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === radioSignal.activeStationId) ?? null,
    [stations, radioSignal.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!radioSignal.open) return null

  const overlayToggles: { key: keyof RadioSignalState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showStrength', label: 'Signal Strength', icon: Activity },
    { key: 'showFrequency', label: 'Frequency', icon: Gauge },
    { key: 'showCoverage', label: 'Coverage', icon: Circle },
    { key: 'showInterference', label: 'Interference', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <RadioIcon2 className="h-4 w-4 text-violet-500" />
              Radio Signal Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRadioSignal({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Interference Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Interference Level
            </Label>
            <Select
              value={radioSignal.interferenceFilter}
              onValueChange={(v) =>
                setRadioSignal({
                  interferenceFilter: v as RadioSignalState['interferenceFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
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
                  <Icon className="h-3 w-3 text-violet-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={radioSignal[key] as boolean}
                  onCheckedChange={(checked) => setRadioSignal({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Strength</div>
              <div className="text-sm font-semibold">{summary.avgSignalStrength}</div>
              <div className="text-[9px] text-muted-foreground">%</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High Interference</div>
              <div className="text-sm font-semibold text-red-500">{summary.highInterferenceCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Coverage</div>
              <div className="text-sm font-semibold text-violet-500">{summary.maxCoverageRadius}</div>
              <div className="text-[9px] text-muted-foreground">km</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Signal Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = radioSignal.activeStationId === station.id
                  const intCfg = INTERFERENCE_CONFIG[station.interferenceLevel]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-500/5'
                          : 'border-border/40 hover:border-violet-500/20 hover:bg-violet-500/5'
                      }`}
                      onClick={() =>
                        setRadioSignal({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: intCfg.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${intCfg.bgClass}`}
                        >
                          {intCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {radioSignal.showStrength && (
                          <div>
                            Strength:{' '}
                            <span className="text-foreground font-medium">
                              {station.signalStrength}%
                            </span>
                          </div>
                        )}
                        {radioSignal.showFrequency && (
                          <div>
                            Freq:{' '}
                            <span className="text-foreground font-medium">
                              {station.frequency} MHz
                            </span>
                          </div>
                        )}
                        {radioSignal.showCoverage && (
                          <div>
                            Coverage:{' '}
                            <span className="text-foreground font-medium">
                              {station.coverageRadius} km
                            </span>
                          </div>
                        )}
                        {radioSignal.showInterference && (
                          <div>
                            Band:{' '}
                            <span className="text-foreground font-medium">
                              {station.bandType}
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
              <div className="space-y-2 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-500" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${INTERFERENCE_CONFIG[activeStation.interferenceLevel].bgClass}`}
                  >
                    {INTERFERENCE_CONFIG[activeStation.interferenceLevel].label}
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
                    <span className="text-muted-foreground">Signal Strength: </span>
                    <span className="font-medium">{activeStation.signalStrength}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequency: </span>
                    <span className="font-medium">{activeStation.frequency} MHz</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Modulation: </span>
                    <span className="font-medium">{activeStation.modulationType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coverage: </span>
                    <span className="font-medium">{activeStation.coverageRadius} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Band: </span>
                    <span className="font-medium">{activeStation.bandType}</span>
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
