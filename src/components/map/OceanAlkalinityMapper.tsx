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
import { useMapStore, type OceanAlkalinityState, type AlkalinityStation } from '@/lib/map-store'
import { Droplets as DropletsIcon5, X, Gauge, TrendingUp, MapPin, Filter, Activity } from 'lucide-react'

const DEMO_STATIONS: AlkalinityStation[] = [
  {
    id: 'oa-hot',
    name: 'Hawaii HOT Station',
    latitude: 22.75,
    longitude: -158.00,
    totalAlkalinity: 2305,
    pH: 8.07,
    aragoniteSaturation: 3.8,
    calciteSaturation: 5.9,
    dissolvedInorganicCarbon: 2015,
    bufferCapacity: 0.82,
    region: 'pacific',
    status: 'healthy',
  },
  {
    id: 'oa-bats',
    name: 'Bermuda BATS Station',
    latitude: 31.67,
    longitude: -64.17,
    totalAlkalinity: 2390,
    pH: 8.04,
    aragoniteSaturation: 3.4,
    calciteSaturation: 5.3,
    dissolvedInorganicCarbon: 2120,
    bufferCapacity: 0.76,
    region: 'atlantic',
    status: 'stress',
  },
  {
    id: 'oa-iceland',
    name: 'Iceland Sub-Arctic Station',
    latitude: 64.13,
    longitude: -28.03,
    totalAlkalinity: 2250,
    pH: 7.98,
    aragoniteSaturation: 2.6,
    calciteSaturation: 4.1,
    dissolvedInorganicCarbon: 2180,
    bufferCapacity: 0.65,
    region: 'arctic',
    status: 'critical',
  },
  {
    id: 'oa-southern',
    name: 'Southern Ocean Station',
    latitude: -61.00,
    longitude: 0.00,
    totalAlkalinity: 2275,
    pH: 7.95,
    aragoniteSaturation: 2.2,
    calciteSaturation: 3.5,
    dissolvedInorganicCarbon: 2220,
    bufferCapacity: 0.58,
    region: 'southern',
    status: 'critical',
  },
  {
    id: 'oa-bengal',
    name: 'Bay of Bengal Station',
    latitude: 15.00,
    longitude: 88.00,
    totalAlkalinity: 2310,
    pH: 7.89,
    aragoniteSaturation: 2.8,
    calciteSaturation: 4.4,
    dissolvedInorganicCarbon: 2150,
    bufferCapacity: 0.62,
    region: 'indian',
    status: 'stress',
  },
  {
    id: 'oa-gbr',
    name: 'Great Barrier Reef Station',
    latitude: -18.29,
    longitude: 147.70,
    totalAlkalinity: 2290,
    pH: 7.82,
    aragoniteSaturation: 2.9,
    calciteSaturation: 4.5,
    dissolvedInorganicCarbon: 2210,
    bufferCapacity: 0.55,
    region: 'pacific',
    status: 'collapsing',
  },
]

const STATUS_CONFIG: Record<
  AlkalinityStation['status'],
  { label: string; color: string; bgClass: string }
> = {
  healthy: { label: 'Healthy', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stress: { label: 'Stress', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  critical: { label: 'Critical', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsing: { label: 'Collapsing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const REGION_CONFIG: Record<
  AlkalinityStation['region'],
  { label: string; color: string }
> = {
  pacific: { label: 'Pacific', color: '#0ea5e9' },
  atlantic: { label: 'Atlantic', color: '#3b82f6' },
  indian: { label: 'Indian', color: '#6366f1' },
  arctic: { label: 'Arctic', color: '#38bdf8' },
  southern: { label: 'Southern', color: '#06b6d4' },
}

export function OceanAlkalinityMapper() {
  const state = useMapStore((s) => s.oceanAlkalinity)
  const setState = useMapStore((s) => s.setOceanAlkalinity)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.regionFilter !== 'all' && s.region !== state.regionFilter) return false
      return true
    })
  }, [stations, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgAlkalinity: 0, avgPH: 0, criticalCount: 0 }
    }
    const avgAlkalinity = filteredStations.reduce((sum, s) => sum + s.totalAlkalinity, 0) / filteredStations.length
    const avgPH = filteredStations.reduce((sum, s) => sum + s.pH, 0) / filteredStations.length
    const criticalCount = filteredStations.filter(
      (s) => s.status === 'critical' || s.status === 'collapsing'
    ).length
    return {
      avgAlkalinity: Math.round(avgAlkalinity),
      avgPH: Math.round(avgPH * 100) / 100,
      criticalCount,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OceanAlkalinityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAlkalinity', label: 'Alkalinity', icon: Gauge },
    { key: 'showPH', label: 'pH Level', icon: Activity },
    { key: 'showSaturation', label: 'Saturation State', icon: TrendingUp },
    { key: 'showStatus', label: 'Status', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DropletsIcon5 className="h-4 w-4 text-sky-600" />
              Ocean Alkalinity Mapper
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
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({
                  regionFilter: v as OceanAlkalinityState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="pacific">Pacific</SelectItem>
                <SelectItem value="atlantic">Atlantic</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="arctic">Arctic</SelectItem>
                <SelectItem value="southern">Southern</SelectItem>
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
                  <Icon className="h-3 w-3 text-sky-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Alkalinity</div>
              <div className="text-sm font-semibold">{summary.avgAlkalinity}</div>
              <div className="text-[9px] text-muted-foreground">μmol/kg</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg pH</div>
              <div className="text-sm font-semibold text-sky-600">{summary.avgPH}</div>
              <div className="text-[9px] text-muted-foreground">level</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Critical/Collapsing</div>
              <div className="text-sm font-semibold text-red-600">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Alkalinity Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const statusCfg = STATUS_CONFIG[station.status]
                  const regionCfg = REGION_CONFIG[station.region]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-500/5'
                          : 'border-border/40 hover:border-sky-500/20 hover:bg-sky-500/5'
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
                        {state.showAlkalinity && (
                          <div>
                            Alkalinity:{' '}
                            <span className="text-foreground font-medium">
                              {station.totalAlkalinity} μmol/kg
                            </span>
                          </div>
                        )}
                        {state.showPH && (
                          <div>
                            pH:{' '}
                            <span className="text-foreground font-medium">
                              {station.pH}
                            </span>
                          </div>
                        )}
                        {state.showSaturation && (
                          <div>
                            Ω Aragonite:{' '}
                            <span className="text-foreground font-medium">
                              {station.aragoniteSaturation}
                            </span>
                          </div>
                        )}
                        {state.showStatus && (
                          <div>
                            Region:{' '}
                            <span className="text-foreground font-medium" style={{ color: regionCfg.color }}>
                              {regionCfg.label}
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
              <div className="space-y-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-600" />
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
                    <span className="text-muted-foreground">Region: </span>
                    <span className="font-medium" style={{ color: REGION_CONFIG[activeStation.region].color }}>
                      {REGION_CONFIG[activeStation.region].label}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Alkalinity: </span>
                    <span className="font-medium">{activeStation.totalAlkalinity} μmol/kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">pH: </span>
                    <span className="font-medium">{activeStation.pH}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ω Aragonite: </span>
                    <span className="font-medium">{activeStation.aragoniteSaturation}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ω Calcite: </span>
                    <span className="font-medium">{activeStation.calciteSaturation}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DIC: </span>
                    <span className="font-medium">{activeStation.dissolvedInorganicCarbon} μmol/kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Buffer Capacity: </span>
                    <span className="font-medium">{activeStation.bufferCapacity}</span>
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
