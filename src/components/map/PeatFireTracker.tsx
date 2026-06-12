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
import { useMapStore, type PeatFireState, type PeatFireZone } from '@/lib/map-store'
import { Flame, X, TreePine, AlertTriangle, Filter, MapPin } from 'lucide-react'

const DEMO_ZONES: PeatFireZone[] = [
  {
    id: 'pf-kalimantan',
    name: 'Indonesia Kalimantan',
    latitude: -1.5,
    longitude: 113.0,
    fireStatus: 'active',
    area: 12500,
    depth: 2.8,
    carbonEmission: 48500,
    peatType: 'Tropical ombrogenous',
    containmentProgress: 22,
  },
  {
    id: 'pf-siberia',
    name: 'Russia Siberia',
    latitude: 62.0,
    longitude: 100.0,
    fireStatus: 'smoldering',
    area: 8700,
    depth: 1.5,
    carbonEmission: 22300,
    peatType: 'Boreal sphagnum',
    containmentProgress: 45,
  },
  {
    id: 'pf-sarawak',
    name: 'Malaysia Sarawak',
    latitude: 2.5,
    longitude: 112.0,
    fireStatus: 'active',
    area: 3200,
    depth: 3.1,
    carbonEmission: 15800,
    peatType: 'Tropical coastal',
    containmentProgress: 18,
  },
  {
    id: 'pf-hudsonbay',
    name: 'Canada Hudson Bay',
    latitude: 55.0,
    longitude: -83.0,
    fireStatus: 'extinguished',
    area: 5100,
    depth: 0.9,
    carbonEmission: 0,
    peatType: 'Boreal fen',
    containmentProgress: 100,
  },
  {
    id: 'pf-minnesota',
    name: 'Minnesota',
    latitude: 47.5,
    longitude: -93.5,
    fireStatus: 'at_risk',
    area: 2800,
    depth: 1.8,
    carbonEmission: 0,
    peatType: 'Temperate raised bog',
    containmentProgress: 0,
  },
  {
    id: 'pf-scotland',
    name: 'Scotland Flow Country',
    latitude: 58.4,
    longitude: -3.9,
    fireStatus: 'smoldering',
    area: 950,
    depth: 1.2,
    carbonEmission: 4200,
    peatType: 'Blanket bog',
    containmentProgress: 67,
  },
]

const STATUS_CONFIG: Record<
  PeatFireZone['fireStatus'],
  { label: string; color: string; bgClass: string }
> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  smoldering: { label: 'Smoldering', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extinguished: { label: 'Extinguished', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  at_risk: { label: 'At Risk', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
}

export function PeatFireTracker() {
  const peatFire = useMapStore((s) => s.peatFire)
  const setPeatFire = useMapStore((s) => s.setPeatFire)

  const zones = useMemo(
    () => (peatFire.peatFires.length > 0 ? peatFire.peatFires : DEMO_ZONES),
    [peatFire.peatFires]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (peatFire.statusFilter !== 'all' && z.fireStatus !== peatFire.statusFilter) return false
      return true
    })
  }, [zones, peatFire.statusFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { activeCount: 0, totalCarbon: 0, avgContainment: 0 }
    }
    const activeCount = filteredZones.filter(
      (z) => z.fireStatus === 'active' || z.fireStatus === 'smoldering'
    ).length
    const totalCarbon = filteredZones.reduce((sum, z) => sum + z.carbonEmission, 0)
    const avgContainment =
      filteredZones.reduce((sum, z) => sum + z.containmentProgress, 0) / filteredZones.length
    return {
      activeCount,
      totalCarbon: Math.round(totalCarbon),
      avgContainment: Math.round(avgContainment),
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === peatFire.activeFireId) ?? null,
    [zones, peatFire.activeFireId]
  )

  if (typeof window === 'undefined') return null
  if (!peatFire.open) return null

  const overlayToggles: { key: keyof PeatFireState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showStatus', label: 'Fire Status', icon: Flame },
    { key: 'showArea', label: 'Area', icon: MapPin },
    { key: 'showCarbon', label: 'Carbon Emission', icon: AlertTriangle },
    { key: 'showContainment', label: 'Containment', icon: TreePine },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Peat Fire Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPeatFire({ open: false })}
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
              Fire Status
            </Label>
            <Select
              value={peatFire.statusFilter}
              onValueChange={(v) =>
                setPeatFire({
                  statusFilter: v as PeatFireState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="smoldering">Smoldering</SelectItem>
                <SelectItem value="extinguished">Extinguished</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
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
                  checked={peatFire[key] as boolean}
                  onCheckedChange={(checked) => setPeatFire({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Active Fires</div>
              <div className="text-sm font-semibold text-red-500">{summary.activeCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Carbon</div>
              <div className="text-sm font-semibold text-orange-500">
                {summary.totalCarbon > 0 ? `${(summary.totalCarbon / 1000).toFixed(1)}k` : '0'}
              </div>
              <div className="text-[9px] text-muted-foreground">tCO₂</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Containment</div>
              <div className="text-sm font-semibold">{summary.avgContainment}%</div>
              <div className="text-[9px] text-muted-foreground">progress</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Fire Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = peatFire.activeFireId === zone.id
                  const statusCfg = STATUS_CONFIG[zone.fireStatus]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setPeatFire({
                          activeFireId: isActive ? null : zone.id,
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
                        {peatFire.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-foreground font-medium">
                              {zone.area.toLocaleString()} ha
                            </span>
                          </div>
                        )}
                        {peatFire.showCarbon && (
                          <div>
                            Carbon:{' '}
                            <span className="text-foreground font-medium">
                              {zone.carbonEmission.toLocaleString()} tCO₂
                            </span>
                          </div>
                        )}
                        {peatFire.showContainment && (
                          <div>
                            Containment:{' '}
                            <span className="text-foreground font-medium">
                              {zone.containmentProgress}%
                            </span>
                          </div>
                        )}
                        {peatFire.showStatus && (
                          <div>
                            Peat Type:{' '}
                            <span className="text-foreground font-medium">
                              {zone.peatType}
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
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.fireStatus].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.fireStatus].label}
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
                    <span className="font-medium">{activeZone.area.toLocaleString()} ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeZone.depth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon: </span>
                    <span className="font-medium">{activeZone.carbonEmission.toLocaleString()} tCO₂</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peat Type: </span>
                    <span className="font-medium">{activeZone.peatType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Containment: </span>
                    <span className="font-medium">{activeZone.containmentProgress}%</span>
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
