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
import { useMapStore, type UrbanMicroclimateState, type MicroclimateZone } from '@/lib/map-store'
import { Building2 as Building2Icon, X, Thermometer, Droplets, Wind, ShieldAlert, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: MicroclimateZone[] = [
  {
    id: 'um-manhattan',
    name: 'Manhattan CBD',
    latitude: 40.7580,
    longitude: -73.9855,
    zoneType: 'cbd',
    temperatureDelta: 4.2,
    humidityDelta: -8.5,
    windSpeedDelta: -3.2,
    uvIndex: 6.8,
    comfortLevel: 'very_uncomfortable',
  },
  {
    id: 'um-shinjuku',
    name: 'Shinjuku Tokyo',
    latitude: 35.6896,
    longitude: 139.7006,
    zoneType: 'cbd',
    temperatureDelta: 3.8,
    humidityDelta: -5.2,
    windSpeedDelta: -2.8,
    uvIndex: 5.9,
    comfortLevel: 'uncomfortable',
  },
  {
    id: 'um-ladefense',
    name: 'La Défense Paris',
    latitude: 48.8925,
    longitude: 2.2363,
    zoneType: 'cbd',
    temperatureDelta: 3.1,
    humidityDelta: -6.0,
    windSpeedDelta: -2.1,
    uvIndex: 5.2,
    comfortLevel: 'uncomfortable',
  },
  {
    id: 'um-pudong',
    name: 'Pudong Shanghai',
    latitude: 31.2397,
    longitude: 121.4998,
    zoneType: 'cbd',
    temperatureDelta: 4.6,
    humidityDelta: -7.3,
    windSpeedDelta: -4.1,
    uvIndex: 7.2,
    comfortLevel: 'very_uncomfortable',
  },
  {
    id: 'um-canarywharf',
    name: 'Canary Wharf London',
    latitude: 51.5054,
    longitude: -0.0195,
    zoneType: 'waterfront',
    temperatureDelta: 2.3,
    humidityDelta: 3.5,
    windSpeedDelta: 1.2,
    uvIndex: 4.1,
    comfortLevel: 'slightly_uncomfortable',
  },
  {
    id: 'um-barangaroo',
    name: 'Barangaroo Sydney',
    latitude: -33.8678,
    longitude: 151.2025,
    zoneType: 'waterfront',
    temperatureDelta: 1.9,
    humidityDelta: 2.8,
    windSpeedDelta: 0.9,
    uvIndex: 8.5,
    comfortLevel: 'comfortable',
  },
]

const COMFORT_CONFIG: Record<
  MicroclimateZone['comfortLevel'],
  { label: string; color: string; bgClass: string }
> = {
  comfortable: { label: 'Comfortable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  slightly_uncomfortable: { label: 'Slightly Uncomfortable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  uncomfortable: { label: 'Uncomfortable', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  very_uncomfortable: { label: 'Very Uncomfortable', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const ZONE_CONFIG: Record<
  MicroclimateZone['zoneType'],
  { label: string }
> = {
  cbd: { label: 'CBD' },
  residential: { label: 'Residential' },
  industrial: { label: 'Industrial' },
  park: { label: 'Park' },
  waterfront: { label: 'Waterfront' },
  suburban: { label: 'Suburban' },
}

export function UrbanMicroclimateAnalyzer() {
  const state = useMapStore((s) => s.urbanMicroclimate)
  const setState = useMapStore((s) => s.setUrbanMicroclimate)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.zoneFilter !== 'all' && z.zoneType !== state.zoneFilter) return false
      return true
    })
  }, [zones, state.zoneFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgTempDelta: 0, avgHumidityDelta: 0, uncomfortableCount: 0 }
    }
    const avgTempDelta = filteredZones.reduce((sum, z) => sum + z.temperatureDelta, 0) / filteredZones.length
    const avgHumidityDelta = filteredZones.reduce((sum, z) => sum + z.humidityDelta, 0) / filteredZones.length
    const uncomfortableCount = filteredZones.filter(
      (z) => z.comfortLevel === 'uncomfortable' || z.comfortLevel === 'very_uncomfortable' || z.comfortLevel === 'extreme'
    ).length
    return {
      avgTempDelta: Math.round(avgTempDelta * 10) / 10,
      avgHumidityDelta: Math.round(avgHumidityDelta * 10) / 10,
      uncomfortableCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof UrbanMicroclimateState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperatureDelta', label: 'Temperature Delta', icon: Thermometer },
    { key: 'showHumidityDelta', label: 'Humidity Delta', icon: Droplets },
    { key: 'showWindDelta', label: 'Wind Speed Delta', icon: Wind },
    { key: 'showComfortLevel', label: 'Comfort Level', icon: ShieldAlert },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2Icon className="h-4 w-4 text-slate-600" />
              Urban Microclimate Analyzer
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
          {/* Zone Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Zone Type
            </Label>
            <Select
              value={state.zoneFilter}
              onValueChange={(v) =>
                setState({
                  zoneFilter: v as UrbanMicroclimateState['zoneFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="cbd">CBD</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="park">Park</SelectItem>
                <SelectItem value="waterfront">Waterfront</SelectItem>
                <SelectItem value="suburban">Suburban</SelectItem>
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
                  <Icon className="h-3 w-3 text-slate-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Temp Delta</div>
              <div className="text-sm font-semibold">+{summary.avgTempDelta}°C</div>
              <div className="text-[9px] text-muted-foreground">urban heat</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Humidity Δ</div>
              <div className="text-sm font-semibold text-slate-600">{summary.avgHumidityDelta}%</div>
              <div className="text-[9px] text-muted-foreground">deviation</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Uncomfortable</div>
              <div className="text-sm font-semibold text-orange-600">{summary.uncomfortableCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Microclimate Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const comfortCfg = COMFORT_CONFIG[zone.comfortLevel]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-500/5'
                          : 'border-border/40 hover:border-slate-500/20 hover:bg-slate-500/5'
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
                            style={{ backgroundColor: comfortCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${comfortCfg.bgClass}`}
                        >
                          {comfortCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showTemperatureDelta && (
                          <div>
                            Temp Δ:{' '}
                            <span className="text-foreground font-medium">
                              +{zone.temperatureDelta.toFixed(1)}°C
                            </span>
                          </div>
                        )}
                        {state.showHumidityDelta && (
                          <div>
                            Humidity Δ:{' '}
                            <span className="text-foreground font-medium">
                              {zone.humidityDelta > 0 ? '+' : ''}{zone.humidityDelta.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {state.showWindDelta && (
                          <div>
                            Wind Δ:{' '}
                            <span className="text-foreground font-medium">
                              {zone.windSpeedDelta > 0 ? '+' : ''}{zone.windSpeedDelta.toFixed(1)} m/s
                            </span>
                          </div>
                        )}
                        {state.showComfortLevel && (
                          <div>
                            UV Index:{' '}
                            <span className="text-foreground font-medium">
                              {zone.uvIndex.toFixed(1)}
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
              <div className="space-y-2 rounded-lg border border-slate-500/20 bg-slate-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${COMFORT_CONFIG[activeZone.comfortLevel].bgClass}`}
                  >
                    {COMFORT_CONFIG[activeZone.comfortLevel].label}
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
                    <span className="text-muted-foreground">Zone Type: </span>
                    <span className="font-medium">{ZONE_CONFIG[activeZone.zoneType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temp Delta: </span>
                    <span className="font-medium">+{activeZone.temperatureDelta.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Humidity Delta: </span>
                    <span className="font-medium">{activeZone.humidityDelta > 0 ? '+' : ''}{activeZone.humidityDelta.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Delta: </span>
                    <span className="font-medium">{activeZone.windSpeedDelta > 0 ? '+' : ''}{activeZone.windSpeedDelta.toFixed(1)} m/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">UV Index: </span>
                    <span className="font-medium">{activeZone.uvIndex.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Comfort Level: </span>
                    <span className="font-medium">{COMFORT_CONFIG[activeZone.comfortLevel].label}</span>
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
