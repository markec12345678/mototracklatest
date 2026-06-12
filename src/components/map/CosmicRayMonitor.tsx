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
import { useMapStore, type CosmicRayState, type CosmicRayStation } from '@/lib/map-store'
import { Zap, X, Activity, Shield, Filter, MapPin } from 'lucide-react'

const DEMO_STATIONS: CosmicRayStation[] = [
  {
    id: 'cr-oulu',
    name: 'Oulu, Finland',
    latitude: 65.05,
    longitude: 25.47,
    neutronCount: 12450,
    fluxVariation: 2.3,
    solarModulation: 0.85,
    cutoffRigidity: 0.81,
    altitude: 15,
    status: 'normal',
  },
  {
    id: 'cr-moscow',
    name: 'Moscow Neutron Monitor',
    latitude: 55.47,
    longitude: 37.32,
    neutronCount: 9820,
    fluxVariation: -8.7,
    solarModulation: 0.92,
    cutoffRigidity: 2.43,
    altitude: 200,
    status: 'forbush_decrease',
  },
  {
    id: 'cr-thule',
    name: 'Thule, Greenland',
    latitude: 76.53,
    longitude: -68.33,
    neutronCount: 13100,
    fluxVariation: 1.1,
    solarModulation: 0.79,
    cutoffRigidity: 0.30,
    altitude: 44,
    status: 'normal',
  },
  {
    id: 'cr-southpole',
    name: 'South Pole',
    latitude: -90.0,
    longitude: 0.0,
    neutronCount: 15200,
    fluxVariation: 0.5,
    solarModulation: 0.73,
    cutoffRigidity: 0.00,
    altitude: 2835,
    status: 'normal',
  },
  {
    id: 'cr-apatity',
    name: 'Apatity, Russia',
    latitude: 67.57,
    longitude: 33.39,
    neutronCount: 11800,
    fluxVariation: -12.4,
    solarModulation: 0.91,
    cutoffRigidity: 0.65,
    altitude: 177,
    status: 'forbush_decrease',
  },
  {
    id: 'cr-mcmurdo',
    name: 'McMurdo, Antarctica',
    latitude: -77.85,
    longitude: 166.67,
    neutronCount: 14700,
    fluxVariation: 45.2,
    solarModulation: 0.68,
    cutoffRigidity: 0.00,
    altitude: 48,
    status: 'ground_level_enhancement',
  },
]

const STATUS_CONFIG: Record<
  CosmicRayStation['status'],
  { label: string; color: string; bgClass: string }
> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  forbush_decrease: { label: 'Forbush Decrease', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  ground_level_enhancement: { label: 'GLE', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function CosmicRayMonitor() {
  const cosmicRay = useMapStore((s) => s.cosmicRay)
  const setCosmicRay = useMapStore((s) => s.setCosmicRay)

  const stations = useMemo(
    () => (cosmicRay.stations.length > 0 ? cosmicRay.stations : DEMO_STATIONS),
    [cosmicRay.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (cosmicRay.statusFilter !== 'all' && s.status !== cosmicRay.statusFilter) return false
      return true
    })
  }, [stations, cosmicRay.statusFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgNeutron: 0, forbushCount: 0, avgFlux: 0 }
    }
    const avgNeutron =
      filteredStations.reduce((sum, s) => sum + s.neutronCount, 0) / filteredStations.length
    const forbushCount = filteredStations.filter(
      (s) => s.status === 'forbush_decrease'
    ).length
    const avgFlux =
      filteredStations.reduce((sum, s) => sum + s.fluxVariation, 0) / filteredStations.length
    return { avgNeutron: Math.round(avgNeutron), forbushCount, avgFlux: Math.round(avgFlux * 10) / 10 }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === cosmicRay.activeStationId) ?? null,
    [stations, cosmicRay.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!cosmicRay.open) return null

  const overlayToggles: { key: keyof CosmicRayState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showNeutronCount', label: 'Neutron Count', icon: Activity },
    { key: 'showFluxVariation', label: 'Flux Variation', icon: Zap },
    { key: 'showSolarModulation', label: 'Solar Modulation', icon: Shield },
    { key: 'showStatus', label: 'Status Overlay', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Cosmic Ray Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCosmicRay({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Station Status
            </Label>
            <Select
              value={cosmicRay.statusFilter}
              onValueChange={(v) =>
                setCosmicRay({
                  statusFilter: v as CosmicRayState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="forbush_decrease">Forbush Decrease</SelectItem>
                <SelectItem value="ground_level_enhancement">Ground Level Enhancement</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={cosmicRay[key] as boolean}
                  onCheckedChange={(checked) => setCosmicRay({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Neutron</div>
              <div className="text-sm font-semibold">{summary.avgNeutron.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">cts/hr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Forbush Decrease</div>
              <div className="text-sm font-semibold text-orange-500">{summary.forbushCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Flux Var.</div>
              <div className={`text-sm font-semibold ${summary.avgFlux >= 0 ? 'text-green-500' : 'text-orange-500'}`}>
                {summary.avgFlux > 0 ? '+' : ''}{summary.avgFlux}%
              </div>
              <div className="text-[9px] text-muted-foreground">variation</div>
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
                  const isActive = cosmicRay.activeStationId === station.id
                  const statusCfg = STATUS_CONFIG[station.status]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setCosmicRay({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {cosmicRay.showNeutronCount && (
                          <div>
                            Neutron:{' '}
                            <span className="text-foreground font-medium">
                              {station.neutronCount.toLocaleString()} cts/hr
                            </span>
                          </div>
                        )}
                        {cosmicRay.showFluxVariation && (
                          <div>
                            Flux Var.:{' '}
                            <span
                              className={`font-medium ${
                                station.fluxVariation >= 0 ? 'text-green-500' : 'text-orange-500'
                              }`}
                            >
                              {station.fluxVariation > 0 ? '+' : ''}
                              {station.fluxVariation}%
                            </span>
                          </div>
                        )}
                        {cosmicRay.showSolarModulation && (
                          <div>
                            Solar Mod.:{' '}
                            <span className="text-foreground font-medium">
                              {station.solarModulation.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {cosmicRay.showStatus && (
                          <div>
                            Cutoff Rig.:{' '}
                            <span className="text-foreground font-medium">
                              {station.cutoffRigidity.toFixed(2)} GV
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
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeStation.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeStation.status].label}
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
                    <span className="text-muted-foreground">Altitude: </span>
                    <span className="font-medium">{activeStation.altitude} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Neutron Count: </span>
                    <span className="font-medium">
                      {activeStation.neutronCount.toLocaleString()} cts/hr
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flux Variation: </span>
                    <span
                      className={`font-medium ${
                        activeStation.fluxVariation >= 0 ? 'text-green-500' : 'text-orange-500'
                      }`}
                    >
                      {activeStation.fluxVariation > 0 ? '+' : ''}
                      {activeStation.fluxVariation}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Solar Modulation: </span>
                    <span className="font-medium">{activeStation.solarModulation.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cutoff Rigidity: </span>
                    <span className="font-medium">
                      {activeStation.cutoffRigidity.toFixed(2)} GV
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
