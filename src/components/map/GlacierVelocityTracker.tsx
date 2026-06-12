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
import { useMapStore, type GlacierVelocityState, type GlacierVelocityZone } from '@/lib/map-store'
import { MountainSnow, X, Activity, Layers, TrendingDown, Waves, Filter, MapPin } from 'lucide-react'

const DEMO_ZONES: GlacierVelocityZone[] = [
  {
    id: 'gv-jakobshavn',
    name: 'Jakobshavn',
    latitude: 69.16,
    longitude: -49.95,
    velocity: 12.6,
    thickness: 2800,
    massBalance: -3.2,
    calvingRate: 8.4,
    flowDirection: 245,
    status: 'surging',
  },
  {
    id: 'gv-pineisland',
    name: 'Pine Island',
    latitude: -75.17,
    longitude: -100.0,
    velocity: 4.2,
    thickness: 2100,
    massBalance: -5.1,
    calvingRate: 6.3,
    flowDirection: 45,
    status: 'retreating',
  },
  {
    id: 'gv-thwaites',
    name: 'Thwaites',
    latitude: -75.5,
    longitude: -106.75,
    velocity: 2.8,
    thickness: 1900,
    massBalance: -4.7,
    calvingRate: 5.1,
    flowDirection: 30,
    status: 'retreating',
  },
  {
    id: 'gv-petermann',
    name: 'Petermann',
    latitude: 80.78,
    longitude: -60.18,
    velocity: 1.2,
    thickness: 3200,
    massBalance: -0.8,
    calvingRate: 2.3,
    flowDirection: 15,
    status: 'accelerating',
  },
  {
    id: 'gv-columbia',
    name: 'Columbia',
    latitude: 61.24,
    longitude: -146.87,
    velocity: 0.9,
    thickness: 1500,
    massBalance: -1.5,
    calvingRate: 1.8,
    flowDirection: 270,
    status: 'stable',
  },
  {
    id: 'gv-aletsch',
    name: 'Aletsch',
    latitude: 46.48,
    longitude: 7.98,
    velocity: 0.2,
    thickness: 900,
    massBalance: -1.1,
    calvingRate: 0,
    flowDirection: 180,
    status: 'accelerating',
  },
]

const STATUS_CONFIG: Record<
  GlacierVelocityZone['status'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  accelerating: { label: 'Accelerating', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  surging: { label: 'Surging', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  retreating: { label: 'Retreating', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function GlacierVelocityTracker() {
  const glacierVelocity = useMapStore((s) => s.glacierVelocity)
  const setGlacierVelocity = useMapStore((s) => s.setGlacierVelocity)

  const zones = useMemo(
    () => (glacierVelocity.zones.length > 0 ? glacierVelocity.zones : DEMO_ZONES),
    [glacierVelocity.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (glacierVelocity.statusFilter !== 'all' && z.status !== glacierVelocity.statusFilter) return false
      return true
    })
  }, [zones, glacierVelocity.statusFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgVelocity: 0, alertCount: 0, avgMassBalance: 0 }
    }
    const avgVelocity =
      filteredZones.reduce((sum, z) => sum + z.velocity, 0) / filteredZones.length
    const alertCount = filteredZones.filter(
      (z) => z.status === 'surging' || z.status === 'retreating'
    ).length
    const avgMassBalance =
      filteredZones.reduce((sum, z) => sum + z.massBalance, 0) / filteredZones.length
    return {
      avgVelocity: Math.round(avgVelocity * 10) / 10,
      alertCount,
      avgMassBalance: Math.round(avgMassBalance * 10) / 10,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === glacierVelocity.activeZoneId) ?? null,
    [zones, glacierVelocity.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!glacierVelocity.open) return null

  const overlayToggles: { key: keyof GlacierVelocityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVelocity', label: 'Velocity', icon: Activity },
    { key: 'showThickness', label: 'Thickness', icon: Layers },
    { key: 'showMassBalance', label: 'Mass Balance', icon: TrendingDown },
    { key: 'showCalving', label: 'Calving Rate', icon: Waves },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MountainSnow className="h-4 w-4 text-sky-500" />
              Glacier Velocity Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGlacierVelocity({ open: false })}
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
              value={glacierVelocity.statusFilter}
              onValueChange={(v) =>
                setGlacierVelocity({
                  statusFilter: v as GlacierVelocityState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="accelerating">Accelerating</SelectItem>
                <SelectItem value="surging">Surging</SelectItem>
                <SelectItem value="retreating">Retreating</SelectItem>
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
                  <Icon className="h-3 w-3 text-sky-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={glacierVelocity[key] as boolean}
                  onCheckedChange={(checked) => setGlacierVelocity({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Velocity</div>
              <div className="text-sm font-semibold text-sky-500">{summary.avgVelocity}</div>
              <div className="text-[9px] text-muted-foreground">km/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Surging/Retreat</div>
              <div className="text-sm font-semibold text-orange-500">{summary.alertCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Mass Balance</div>
              <div className="text-sm font-semibold text-red-500">{summary.avgMassBalance}</div>
              <div className="text-[9px] text-muted-foreground">m w.e./yr</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Glacier Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = glacierVelocity.activeZoneId === zone.id
                  const statusCfg = STATUS_CONFIG[zone.status]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-500/5'
                          : 'border-border/40 hover:border-sky-500/20 hover:bg-sky-500/5'
                      }`}
                      onClick={() =>
                        setGlacierVelocity({
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
                        {glacierVelocity.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-foreground font-medium">
                              {zone.velocity} km/yr
                            </span>
                          </div>
                        )}
                        {glacierVelocity.showThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-foreground font-medium">
                              {zone.thickness} m
                            </span>
                          </div>
                        )}
                        {glacierVelocity.showMassBalance && (
                          <div>
                            Mass Balance:{' '}
                            <span className="text-foreground font-medium">
                              {zone.massBalance} m w.e./yr
                            </span>
                          </div>
                        )}
                        {glacierVelocity.showCalving && (
                          <div>
                            Calving:{' '}
                            <span className="text-foreground font-medium">
                              {zone.calvingRate} km²/yr
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
              <div className="space-y-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
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
                    <span className="text-muted-foreground">Velocity: </span>
                    <span className="font-medium">{activeZone.velocity} km/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thickness: </span>
                    <span className="font-medium">{activeZone.thickness} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mass Balance: </span>
                    <span className="font-medium">{activeZone.massBalance} m w.e./yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Calving Rate: </span>
                    <span className="font-medium">{activeZone.calvingRate} km²/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flow Direction: </span>
                    <span className="font-medium">{activeZone.flowDirection}°</span>
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
