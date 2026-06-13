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
import { useMapStore, type DesertMonitorState, type DesertZone } from '@/lib/map-store'
import { SunDim, X, TrendingUp, Thermometer, CloudRain, Leaf, Filter, MapPin } from 'lucide-react'

const DEMO_ZONES: DesertZone[] = [
  {
    id: 'dm-sahara',
    name: 'Sahara Desert',
    latitude: 23.42,
    longitude: 25.66,
    area: 9200000,
    expansionRate: 4.8,
    avgTemperature: 38.5,
    rainfall: 25,
    vegetationIndex: 0.04,
    status: 'expanding',
    severity: 'high',
    droughtIndex: 0.82,
  },
  {
    id: 'dm-gobi',
    name: 'Gobi Desert',
    latitude: 43.0,
    longitude: 105.0,
    area: 1295000,
    expansionRate: 3.2,
    avgTemperature: 25.1,
    rainfall: 50,
    vegetationIndex: 0.08,
    status: 'expanding',
    severity: 'moderate',
    droughtIndex: 0.65,
  },
  {
    id: 'dm-arabian',
    name: 'Arabian Desert',
    latitude: 22.0,
    longitude: 48.0,
    area: 2330000,
    expansionRate: 1.5,
    avgTemperature: 40.2,
    rainfall: 15,
    vegetationIndex: 0.02,
    status: 'critical',
    severity: 'extreme',
    droughtIndex: 0.95,
  },
  {
    id: 'dm-kalahari',
    name: 'Kalahari Desert',
    latitude: -23.5,
    longitude: 22.0,
    area: 930000,
    expansionRate: -0.3,
    avgTemperature: 28.4,
    rainfall: 150,
    vegetationIndex: 0.18,
    status: 'recovering',
    severity: 'low',
    droughtIndex: 0.35,
  },
  {
    id: 'dm-atacama',
    name: 'Atacama Desert',
    latitude: -24.0,
    longitude: -69.5,
    area: 1050000,
    expansionRate: 0.2,
    avgTemperature: 18.6,
    rainfall: 5,
    vegetationIndex: 0.01,
    status: 'stable',
    severity: 'low',
    droughtIndex: 0.40,
  },
  {
    id: 'dm-thar',
    name: 'Thar Desert',
    latitude: 27.0,
    longitude: 71.0,
    area: 200000,
    expansionRate: 2.1,
    avgTemperature: 33.7,
    rainfall: 100,
    vegetationIndex: 0.12,
    status: 'expanding',
    severity: 'moderate',
    droughtIndex: 0.58,
  },
]

const STATUS_CONFIG: Record<
  DesertZone['status'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  expanding: { label: 'Expanding', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  recovering: { label: 'Recovering', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function DesertMonitorPanel() {
  const desertMonitor = useMapStore((s) => s.desertMonitor)
  const setDesertMonitor = useMapStore((s) => s.setDesertMonitor)

  const zones = useMemo(
    () => (desertMonitor.zones.length > 0 ? desertMonitor.zones : DEMO_ZONES),
    [desertMonitor.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (desertMonitor.statusFilter !== 'all' && z.status !== desertMonitor.statusFilter) return false
      return true
    })
  }, [zones, desertMonitor.statusFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgExpansionRate: 0, expandingCriticalCount: 0, avgVegetationIndex: 0 }
    }
    const avgExpansionRate =
      filteredZones.reduce((sum, z) => sum + z.expansionRate, 0) / filteredZones.length
    const expandingCriticalCount = filteredZones.filter(
      (z) => z.status === 'expanding' || z.status === 'critical'
    ).length
    const avgVegetationIndex =
      filteredZones.reduce((sum, z) => sum + z.vegetationIndex, 0) / filteredZones.length
    return {
      avgExpansionRate: Math.round(avgExpansionRate * 10) / 10,
      expandingCriticalCount,
      avgVegetationIndex: Math.round(avgVegetationIndex * 1000) / 1000,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === desertMonitor.activeZoneId) ?? null,
    [zones, desertMonitor.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!desertMonitor.open) return null

  const overlayToggles: { key: keyof DesertMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showExpansion', label: 'Expansion', icon: TrendingUp },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showRainfall', label: 'Rainfall', icon: CloudRain },
    { key: 'showVegetation', label: 'Vegetation', icon: Leaf },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SunDim className="h-4 w-4 text-orange-500" />
              Desert Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setDesertMonitor({ open: false })}
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
              Status Level
            </Label>
            <Select
              value={desertMonitor.statusFilter}
              onValueChange={(v) =>
                setDesertMonitor({
                  statusFilter: v as DesertMonitorState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="expanding">Expanding</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
                  <Icon className="h-3 w-3 text-orange-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={desertMonitor[key] as boolean}
                  onCheckedChange={(checked) => setDesertMonitor({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Expansion</div>
              <div className="text-sm font-semibold text-orange-500">{summary.avgExpansionRate}</div>
              <div className="text-[9px] text-muted-foreground">km²/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Expanding/Critical</div>
              <div className="text-sm font-semibold text-red-500">{summary.expandingCriticalCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Vegetation</div>
              <div className="text-sm font-semibold">{summary.avgVegetationIndex}</div>
              <div className="text-[9px] text-muted-foreground">NDVI</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Desert Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = desertMonitor.activeZoneId === zone.id
                  const statusCfg = STATUS_CONFIG[zone.status]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setDesertMonitor({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {desertMonitor.showExpansion && (
                          <div>
                            Expansion:{' '}
                            <span className="text-foreground font-medium">
                              {zone.expansionRate} km²/yr
                            </span>
                          </div>
                        )}
                        {desertMonitor.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {zone.avgTemperature}°C
                            </span>
                          </div>
                        )}
                        {desertMonitor.showRainfall && (
                          <div>
                            Rain:{' '}
                            <span className="text-foreground font-medium">
                              {zone.rainfall} mm
                            </span>
                          </div>
                        )}
                        {desertMonitor.showVegetation && (
                          <div>
                            NDVI:{' '}
                            <span className="text-foreground font-medium">
                              {zone.vegetationIndex}
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
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
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
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeZone.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expansion Rate: </span>
                    <span className="font-medium">{activeZone.expansionRate} km²/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Temp: </span>
                    <span className="font-medium">{activeZone.avgTemperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rainfall: </span>
                    <span className="font-medium">{activeZone.rainfall} mm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vegetation (NDVI): </span>
                    <span className="font-medium">{activeZone.vegetationIndex}</span>
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
