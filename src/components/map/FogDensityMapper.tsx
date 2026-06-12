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
import { useMapStore, type FogDensityState, type FogDensityZone } from '@/lib/map-store'
import { CloudFog, X, Eye, Gauge, Droplets, Plane, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: FogDensityZone[] = [
  {
    id: 'fog-centralvalley',
    name: 'Central Valley',
    latitude: 37.74,
    longitude: -120.95,
    density: 'super_dense',
    visibility: 0.05,
    humidity: 98,
    duration: '8 hours',
    fogType: 'Radiation Fog',
    aviationImpact: 'severe',
  },
  {
    id: 'fog-povalley',
    name: 'Po Valley',
    latitude: 45.20,
    longitude: 9.87,
    density: 'dense',
    visibility: 0.3,
    humidity: 95,
    duration: '12 hours',
    fogType: 'Radiation Fog',
    aviationImpact: 'moderate',
  },
  {
    id: 'fog-london',
    name: 'London Area',
    latitude: 51.51,
    longitude: -0.13,
    density: 'moderate',
    visibility: 1.5,
    humidity: 88,
    duration: '6 hours',
    fogType: 'Advection Fog',
    aviationImpact: 'minor',
  },
  {
    id: 'fog-sanfrancisco',
    name: 'San Francisco Bay',
    latitude: 37.77,
    longitude: -122.42,
    density: 'moderate',
    visibility: 2.0,
    humidity: 85,
    duration: '4 hours',
    fogType: 'Marine Fog',
    aviationImpact: 'minor',
  },
  {
    id: 'fog-northsea',
    name: 'North Sea Coast',
    latitude: 53.55,
    longitude: 7.20,
    density: 'dense',
    visibility: 0.2,
    humidity: 96,
    duration: '10 hours',
    fogType: 'Sea Fog',
    aviationImpact: 'severe',
  },
  {
    id: 'fog-himalayan',
    name: 'Himalayan Valley',
    latitude: 27.71,
    longitude: 85.32,
    density: 'light',
    visibility: 4.0,
    humidity: 78,
    duration: '3 hours',
    fogType: 'Valley Fog',
    aviationImpact: 'none',
  },
]

const DENSITY_CONFIG: Record<
  FogDensityZone['density'],
  { label: string; color: string; bgClass: string }
> = {
  light: { label: 'Light', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  dense: { label: 'Dense', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  super_dense: { label: 'Super Dense', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function FogDensityMapper() {
  const fogDensity = useMapStore((s) => s.fogDensity)
  const setFogDensity = useMapStore((s) => s.setFogDensity)

  const zones = useMemo(
    () => (fogDensity.zones.length > 0 ? fogDensity.zones : DEMO_ZONES),
    [fogDensity.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (fogDensity.densityFilter !== 'all' && z.density !== fogDensity.densityFilter) return false
      return true
    })
  }, [zones, fogDensity.densityFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgVisibility: 0, denseCount: 0, avgHumidity: 0 }
    }
    const avgVisibility =
      filteredZones.reduce((sum, z) => sum + z.visibility, 0) / filteredZones.length
    const denseCount = filteredZones.filter(
      (z) => z.density === 'dense' || z.density === 'super_dense'
    ).length
    const avgHumidity =
      filteredZones.reduce((sum, z) => sum + z.humidity, 0) / filteredZones.length
    return {
      avgVisibility: Math.round(avgVisibility * 100) / 100,
      denseCount,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === fogDensity.activeZoneId) ?? null,
    [zones, fogDensity.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!fogDensity.open) return null

  const overlayToggles: { key: keyof FogDensityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDensity', label: 'Eye', icon: Eye },
    { key: 'showVisibility', label: 'Gauge', icon: Gauge },
    { key: 'showHumidity', label: 'Droplets', icon: Droplets },
    { key: 'showAviationImpact', label: 'Plane', icon: Plane },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudFog className="h-4 w-4 text-slate-500" />
              Fog Density Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setFogDensity({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Density Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Density
            </Label>
            <Select
              value={fogDensity.densityFilter}
              onValueChange={(v) =>
                setFogDensity({
                  densityFilter: v as FogDensityState['densityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Densities</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="dense">Dense</SelectItem>
                <SelectItem value="super_dense">Super Dense</SelectItem>
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
                  <Icon className="h-3 w-3 text-slate-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={fogDensity[key] as boolean}
                  onCheckedChange={(checked) => setFogDensity({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Visibility</div>
              <div className="text-sm font-semibold">{summary.avgVisibility}</div>
              <div className="text-[9px] text-muted-foreground">km</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Dense+</div>
              <div className="text-sm font-semibold text-red-500">{summary.denseCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Humidity</div>
              <div className="text-sm font-semibold text-orange-500">{summary.avgHumidity}%</div>
              <div className="text-[9px] text-muted-foreground">RH</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Fog Density Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = fogDensity.activeZoneId === zone.id
                  const densityCfg = DENSITY_CONFIG[zone.density]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-500/5'
                          : 'border-border/40 hover:border-slate-500/20 hover:bg-slate-500/5'
                      }`}
                      onClick={() =>
                        setFogDensity({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: densityCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${densityCfg.bgClass}`}
                        >
                          {densityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {fogDensity.showDensity && (
                          <div>
                            Density:{' '}
                            <span className="text-foreground font-medium">
                              {densityCfg.label}
                            </span>
                          </div>
                        )}
                        {fogDensity.showVisibility && (
                          <div>
                            Vis:{' '}
                            <span className="text-foreground font-medium">
                              {zone.visibility} km
                            </span>
                          </div>
                        )}
                        {fogDensity.showHumidity && (
                          <div>
                            Humidity:{' '}
                            <span className="text-foreground font-medium">
                              {zone.humidity}%
                            </span>
                          </div>
                        )}
                        {fogDensity.showAviationImpact && (
                          <div>
                            Aviation:{' '}
                            <span className="text-foreground font-medium">
                              {zone.aviationImpact}
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
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${DENSITY_CONFIG[activeZone.density].bgClass}`}
                  >
                    {DENSITY_CONFIG[activeZone.density].label}
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
                    <span className="text-muted-foreground">Visibility: </span>
                    <span className="font-medium">{activeZone.visibility} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Humidity: </span>
                    <span className="font-medium">{activeZone.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{activeZone.duration}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fog Type: </span>
                    <span className="font-medium">{activeZone.fogType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aviation: </span>
                    <span className="font-medium">{activeZone.aviationImpact}</span>
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
