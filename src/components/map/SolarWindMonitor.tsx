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
import { useMapStore, type SolarWindState, type SolarWindStation } from '@/lib/map-store'
import { Sun as SunIcon5, X, Gauge, Activity, MapPin, Filter, Zap } from 'lucide-react'

const DEMO_STATIONS: SolarWindStation[] = [
  {
    id: 'sw-discovr',
    name: 'DSCOVR L1 Satellite',
    latitude: 0,
    longitude: -150,
    stationType: 'satellite',
    protonDensity: 5.2,
    bulkSpeed: 420,
    imfBz: -2.1,
    kpIndex: 3,
    stormLevel: 'unsettled',
  },
  {
    id: 'sw-ace',
    name: 'ACE Satellite',
    latitude: 0,
    longitude: -145,
    stationType: 'satellite',
    protonDensity: 8.7,
    bulkSpeed: 580,
    imfBz: -8.5,
    kpIndex: 6,
    stormLevel: 'minor_storm',
  },
  {
    id: 'sw-soho',
    name: 'SOHO',
    latitude: 0,
    longitude: -140,
    stationType: 'satellite',
    protonDensity: 3.1,
    bulkSpeed: 350,
    imfBz: 1.2,
    kpIndex: 1,
    stormLevel: 'quiet',
  },
  {
    id: 'sw-tromso',
    name: 'Tromsø Norway',
    latitude: 69.65,
    longitude: 18.96,
    stationType: 'magnetometer',
    protonDensity: 6.4,
    bulkSpeed: 490,
    imfBz: -5.3,
    kpIndex: 5,
    stormLevel: 'active',
  },
  {
    id: 'sw-sodankyla',
    name: 'Sodankylä Finland',
    latitude: 67.37,
    longitude: 26.63,
    stationType: 'ionosonde',
    protonDensity: 12.3,
    bulkSpeed: 650,
    imfBz: -12.0,
    kpIndex: 8,
    stormLevel: 'major_storm',
  },
  {
    id: 'sw-ottawa',
    name: 'Ottawa Canada',
    latitude: 45.40,
    longitude: -75.68,
    stationType: 'ground_observatory',
    protonDensity: 18.5,
    bulkSpeed: 780,
    imfBz: -18.2,
    kpIndex: 9,
    stormLevel: 'severe_storm',
  },
]

const STORM_CONFIG: Record<
  SolarWindStation['stormLevel'],
  { label: string; color: string; bgClass: string }
> = {
  quiet: { label: 'Quiet', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  unsettled: { label: 'Unsettled', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  active: { label: 'Active', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  minor_storm: { label: 'Minor Storm', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  major_storm: { label: 'Major Storm', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  severe_storm: { label: 'Severe Storm', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

const TYPE_CONFIG: Record<
  SolarWindStation['stationType'],
  { label: string }
> = {
  ground_observatory: { label: 'Ground Observatory' },
  satellite: { label: 'Satellite' },
  magnetometer: { label: 'Magnetometer' },
  ionosonde: { label: 'Ionosonde' },
  riometer: { label: 'Riometer' },
}

export function SolarWindMonitor() {
  const state = useMapStore((s) => s.solarWind)
  const setState = useMapStore((s) => s.setSolarWind)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.typeFilter !== 'all' && s.stationType !== state.typeFilter) return false
      return true
    })
  }, [stations, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgProtonDensity: 0, avgBulkSpeed: 0, stormCount: 0 }
    }
    const avgProtonDensity = filteredStations.reduce((sum, s) => sum + s.protonDensity, 0) / filteredStations.length
    const avgBulkSpeed = filteredStations.reduce((sum, s) => sum + s.bulkSpeed, 0) / filteredStations.length
    const stormCount = filteredStations.filter(
      (s) => s.stormLevel === 'minor_storm' || s.stormLevel === 'major_storm' || s.stormLevel === 'severe_storm'
    ).length
    return {
      avgProtonDensity: Math.round(avgProtonDensity * 10) / 10,
      avgBulkSpeed: Math.round(avgBulkSpeed),
      stormCount,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SolarWindState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showProtonDensity', label: 'Proton Density', icon: Gauge },
    { key: 'showBulkSpeed', label: 'Bulk Speed', icon: Zap },
    { key: 'showIMF', label: 'IMF Bz', icon: Activity },
    { key: 'showStormLevel', label: 'Storm Level', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SunIcon5 className="h-4 w-4 text-amber-500" />
              Solar Wind Monitor
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
              Station Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SolarWindState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ground_observatory">Ground Observatory</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="magnetometer">Magnetometer</SelectItem>
                <SelectItem value="ionosonde">Ionosonde</SelectItem>
                <SelectItem value="riometer">Riometer</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg Proton Density</div>
              <div className="text-sm font-semibold text-amber-600">{summary.avgProtonDensity}</div>
              <div className="text-[9px] text-muted-foreground">p/cm³</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Bulk Speed</div>
              <div className="text-sm font-semibold text-amber-600">{summary.avgBulkSpeed}</div>
              <div className="text-[9px] text-muted-foreground">km/s</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Storm Count</div>
              <div className="text-sm font-semibold text-red-600">{summary.stormCount}</div>
              <div className="text-[9px] text-muted-foreground">minor+</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const stormCfg = STORM_CONFIG[station.stormLevel]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
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
                            style={{ backgroundColor: stormCfg.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${stormCfg.bgClass}`}
                        >
                          {stormCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showProtonDensity && (
                          <div>
                            Proton Density:{' '}
                            <span className="text-foreground font-medium">
                              {station.protonDensity.toFixed(1)} p/cm³
                            </span>
                          </div>
                        )}
                        {state.showBulkSpeed && (
                          <div>
                            Bulk Speed:{' '}
                            <span className="text-foreground font-medium">
                              {station.bulkSpeed} km/s
                            </span>
                          </div>
                        )}
                        {state.showIMF && (
                          <div>
                            IMF Bz:{' '}
                            <span className="text-foreground font-medium">
                              {station.imfBz.toFixed(1)} nT
                            </span>
                          </div>
                        )}
                        {state.showStormLevel && (
                          <div>
                            Kp Index:{' '}
                            <span className="text-foreground font-medium">
                              {station.kpIndex}
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
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STORM_CONFIG[activeStation.stormLevel].bgClass}`}
                  >
                    {STORM_CONFIG[activeStation.stormLevel].label}
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
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activeStation.stationType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Proton Density: </span>
                    <span className="font-medium">{activeStation.protonDensity.toFixed(1)} p/cm³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bulk Speed: </span>
                    <span className="font-medium">{activeStation.bulkSpeed} km/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IMF Bz: </span>
                    <span className="font-medium">{activeStation.imfBz.toFixed(1)} nT</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kp Index: </span>
                    <span className="font-medium">{activeStation.kpIndex}</span>
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
