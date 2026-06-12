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
import { useMapStore, type PermafrostThawState, type PermafrostThawZone } from '@/lib/map-store'
import { ThermometerSnowflake, X, Activity, ArrowDownFromLine, Thermometer, AlertTriangle, Filter, MapPin } from 'lucide-react'

const DEMO_ZONES: PermafrostThawZone[] = [
  {
    id: 'pt-siberia',
    name: 'Siberia',
    latitude: 62.0,
    longitude: 110.0,
    thawRate: 4.2,
    activeLayerDepth: 2.8,
    groundTemp: -3.1,
    carbonRelease: 12.5,
    infrastructure: 'severe',
    permafrostType: 'Continuous',
  },
  {
    id: 'pt-alaska',
    name: 'Alaska',
    latitude: 64.84,
    longitude: -147.72,
    thawRate: 2.7,
    activeLayerDepth: 1.9,
    groundTemp: -5.4,
    carbonRelease: 6.3,
    infrastructure: 'moderate',
    permafrostType: 'Discontinuous',
  },
  {
    id: 'pt-canada',
    name: 'Canada',
    latitude: 62.0,
    longitude: -95.0,
    thawRate: 1.8,
    activeLayerDepth: 1.5,
    groundTemp: -6.2,
    carbonRelease: 4.1,
    infrastructure: 'minor',
    permafrostType: 'Continuous',
  },
  {
    id: 'pt-scandinavia',
    name: 'Scandinavia',
    latitude: 68.0,
    longitude: 20.0,
    thawRate: 1.2,
    activeLayerDepth: 1.1,
    groundTemp: -4.8,
    carbonRelease: 2.8,
    infrastructure: 'none',
    permafrostType: 'Sporadic',
  },
  {
    id: 'pt-tibet',
    name: 'Tibet',
    latitude: 33.0,
    longitude: 88.0,
    thawRate: 3.1,
    activeLayerDepth: 2.2,
    groundTemp: -1.5,
    carbonRelease: 8.9,
    infrastructure: 'moderate',
    permafrostType: 'Discontinuous',
  },
  {
    id: 'pt-greenland',
    name: 'Greenland',
    latitude: 72.0,
    longitude: -40.0,
    thawRate: 2.3,
    activeLayerDepth: 1.7,
    groundTemp: -8.1,
    carbonRelease: 5.2,
    infrastructure: 'minor',
    permafrostType: 'Continuous',
  },
]

const INFRA_CONFIG: Record<
  PermafrostThawZone['infrastructure'],
  { label: string; color: string; bgClass: string }
> = {
  none: { label: 'None', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  minor: { label: 'Minor', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function PermafrostThawMonitor() {
  const permafrostThaw = useMapStore((s) => s.permafrostThaw)
  const setPermafrostThaw = useMapStore((s) => s.setPermafrostThaw)

  const zones = useMemo(
    () => (permafrostThaw.zones.length > 0 ? permafrostThaw.zones : DEMO_ZONES),
    [permafrostThaw.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (permafrostThaw.infrastructureFilter !== 'all' && z.infrastructure !== permafrostThaw.infrastructureFilter) return false
      return true
    })
  }, [zones, permafrostThaw.infrastructureFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgThawRate: 0, severeCount: 0, avgGroundTemp: 0 }
    }
    const avgThawRate =
      filteredZones.reduce((sum, z) => sum + z.thawRate, 0) / filteredZones.length
    const severeCount = filteredZones.filter(
      (z) => z.infrastructure === 'severe'
    ).length
    const avgGroundTemp =
      filteredZones.reduce((sum, z) => sum + z.groundTemp, 0) / filteredZones.length
    return {
      avgThawRate: Math.round(avgThawRate * 10) / 10,
      severeCount,
      avgGroundTemp: Math.round(avgGroundTemp * 10) / 10,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === permafrostThaw.activeZoneId) ?? null,
    [zones, permafrostThaw.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!permafrostThaw.open) return null

  const overlayToggles: { key: keyof PermafrostThawState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showThawRate', label: 'Thaw Rate', icon: Activity },
    { key: 'showActiveLayer', label: 'Active Layer', icon: ArrowDownFromLine },
    { key: 'showGroundTemp', label: 'Ground Temp', icon: Thermometer },
    { key: 'showInfrastructure', label: 'Infrastructure', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ThermometerSnowflake className="h-4 w-4 text-cyan-500" />
              Permafrost Thaw Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPermafrostThaw({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Infrastructure Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Infrastructure Level
            </Label>
            <Select
              value={permafrostThaw.infrastructureFilter}
              onValueChange={(v) =>
                setPermafrostThaw({
                  infrastructureFilter: v as PermafrostThawState['infrastructureFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
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
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={permafrostThaw[key] as boolean}
                  onCheckedChange={(checked) => setPermafrostThaw({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Thaw Rate</div>
              <div className="text-sm font-semibold">{summary.avgThawRate}</div>
              <div className="text-[9px] text-muted-foreground">cm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Severe</div>
              <div className="text-sm font-semibold text-red-500">{summary.severeCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Ground Temp</div>
              <div className="text-sm font-semibold">{summary.avgGroundTemp}</div>
              <div className="text-[9px] text-muted-foreground">°C</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Thaw Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = permafrostThaw.activeZoneId === zone.id
                  const infraCfg = INFRA_CONFIG[zone.infrastructure]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setPermafrostThaw({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: infraCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${infraCfg.bgClass}`}
                        >
                          {infraCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {permafrostThaw.showThawRate && (
                          <div>
                            Thaw Rate:{' '}
                            <span className="text-foreground font-medium">
                              {zone.thawRate} cm/yr
                            </span>
                          </div>
                        )}
                        {permafrostThaw.showActiveLayer && (
                          <div>
                            Active Layer:{' '}
                            <span className="text-foreground font-medium">
                              {zone.activeLayerDepth} m
                            </span>
                          </div>
                        )}
                        {permafrostThaw.showGroundTemp && (
                          <div>
                            Ground Temp:{' '}
                            <span className="text-foreground font-medium">
                              {zone.groundTemp} °C
                            </span>
                          </div>
                        )}
                        {permafrostThaw.showInfrastructure && (
                          <div>
                            Carbon Release:{' '}
                            <span className="text-foreground font-medium">
                              {zone.carbonRelease} t/ha
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
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${INFRA_CONFIG[activeZone.infrastructure].bgClass}`}
                  >
                    {INFRA_CONFIG[activeZone.infrastructure].label}
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
                    <span className="text-muted-foreground">Thaw Rate: </span>
                    <span className="font-medium">{activeZone.thawRate} cm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active Layer: </span>
                    <span className="font-medium">{activeZone.activeLayerDepth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ground Temp: </span>
                    <span className="font-medium">{activeZone.groundTemp} °C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon Release: </span>
                    <span className="font-medium">{activeZone.carbonRelease} t/ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Permafrost Type: </span>
                    <span className="font-medium">{activeZone.permafrostType}</span>
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
