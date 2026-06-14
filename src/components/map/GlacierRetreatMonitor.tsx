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
import { useMapStore, type GlacierRetreatState, type GlacierSystem } from '@/lib/map-store'
import { MountainSnow as MountainSnowIcon3, X, Gauge, TrendingDown, MapPin, Filter, ArrowDown, Activity } from 'lucide-react'

const DEMO_GLACIERS: GlacierSystem[] = [
  {
    id: 'gs-aletsch',
    name: 'Aletsch Glacier, Switzerland',
    latitude: 46.50,
    longitude: 8.02,
    glacierType: 'valley',
    area: 81.7,
    retreatRate: 50,
    massBalance: -1.25,
    equilibriumLineAltitude: 2840,
    velocity: 200,
    lengthChange: -3.2,
    status: 'retreating',
  },
  {
    id: 'gs-jakobshavn',
    name: 'Jakobshavn Glacier, Greenland',
    latitude: 69.17,
    longitude: -49.80,
    glacierType: 'tidewater',
    area: 1100,
    retreatRate: 300,
    massBalance: -3.50,
    equilibriumLineAltitude: 1550,
    velocity: 12600,
    lengthChange: -18.0,
    status: 'rapid_retreat',
  },
  {
    id: 'gs-columbia',
    name: 'Columbia Glacier, Alaska',
    latitude: 61.24,
    longitude: -147.08,
    glacierType: 'tidewater',
    area: 920,
    retreatRate: 200,
    massBalance: -2.80,
    equilibriumLineAltitude: 900,
    velocity: 5000,
    lengthChange: -16.5,
    status: 'rapid_retreat',
  },
  {
    id: 'gs-gangotri',
    name: 'Gangotri Glacier, India',
    latitude: 30.80,
    longitude: 79.10,
    glacierType: 'valley',
    area: 286,
    retreatRate: 22,
    massBalance: -0.65,
    equilibriumLineAltitude: 5100,
    velocity: 30,
    lengthChange: -0.85,
    status: 'retreating',
  },
  {
    id: 'gs-peritomoreno',
    name: 'Perito Moreno, Argentina',
    latitude: -50.50,
    longitude: -73.05,
    glacierType: 'piedmont',
    area: 250,
    retreatRate: 0,
    massBalance: 0.10,
    equilibriumLineAltitude: 1650,
    velocity: 700,
    lengthChange: 0.5,
    status: 'stable',
  },
  {
    id: 'gs-fox',
    name: 'Fox Glacier, New Zealand',
    latitude: -43.47,
    longitude: 170.00,
    glacierType: 'valley',
    area: 12.4,
    retreatRate: 35,
    massBalance: -1.50,
    equilibriumLineAltitude: 1600,
    velocity: 250,
    lengthChange: -0.72,
    status: 'retreating',
  },
]

const STATUS_CONFIG: Record<
  GlacierSystem['status'],
  { label: string; color: string; bgClass: string }
> = {
  advancing: { label: 'Advancing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  retreating: { label: 'Retreating', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  rapid_retreat: { label: 'Rapid Retreat', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsing: { label: 'Collapsing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_CONFIG: Record<
  GlacierSystem['glacierType'],
  { label: string }
> = {
  valley: { label: 'Valley' },
  piedmont: { label: 'Piedmont' },
  ice_cap: { label: 'Ice Cap' },
  tidewater: { label: 'Tidewater' },
  rock_glacier: { label: 'Rock Glacier' },
}

export function GlacierRetreatMonitor() {
  const state = useMapStore((s) => s.glacierRetreat)
  const setState = useMapStore((s) => s.setGlacierRetreat)

  const glaciers = useMemo(
    () => (state.glaciers.length > 0 ? state.glaciers : DEMO_GLACIERS),
    [state.glaciers]
  )

  const filteredGlaciers = useMemo(() => {
    return glaciers.filter((g) => {
      if (state.typeFilter !== 'all' && g.glacierType !== state.typeFilter) return false
      return true
    })
  }, [glaciers, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredGlaciers.length === 0) {
      return { avgRetreatRate: 0, avgMassBalance: 0, retreatingCount: 0 }
    }
    const avgRetreatRate = filteredGlaciers.reduce((sum, g) => sum + g.retreatRate, 0) / filteredGlaciers.length
    const avgMassBalance = filteredGlaciers.reduce((sum, g) => sum + g.massBalance, 0) / filteredGlaciers.length
    const retreatingCount = filteredGlaciers.filter(
      (g) => g.status === 'rapid_retreat' || g.status === 'collapsing'
    ).length
    return {
      avgRetreatRate: Math.round(avgRetreatRate),
      avgMassBalance: Math.round(avgMassBalance * 100) / 100,
      retreatingCount,
    }
  }, [filteredGlaciers])

  const activeGlacier = useMemo(
    () => glaciers.find((g) => g.id === state.activeGlacierId) ?? null,
    [glaciers, state.activeGlacierId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GlacierRetreatState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRetreatRate', label: 'Retreat Rate', icon: TrendingDown },
    { key: 'showMassBalance', label: 'Mass Balance', icon: Gauge },
    { key: 'showVelocity', label: 'Velocity', icon: Activity },
    { key: 'showStatus', label: 'Status', icon: ArrowDown },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MountainSnowIcon3 className="h-4 w-4 text-cyan-600" />
              Glacier Retreat Monitor
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
              Glacier Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as GlacierRetreatState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="valley">Valley</SelectItem>
                <SelectItem value="piedmont">Piedmont</SelectItem>
                <SelectItem value="ice_cap">Ice Cap</SelectItem>
                <SelectItem value="tidewater">Tidewater</SelectItem>
                <SelectItem value="rock_glacier">Rock Glacier</SelectItem>
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
                  <Icon className="h-3 w-3 text-cyan-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Retreat</div>
              <div className="text-sm font-semibold">{summary.avgRetreatRate}</div>
              <div className="text-[9px] text-muted-foreground">m/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Mass Balance</div>
              <div className="text-sm font-semibold text-cyan-600">{summary.avgMassBalance}</div>
              <div className="text-[9px] text-muted-foreground">m w.e.</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Rapid/Collapse</div>
              <div className="text-sm font-semibold text-red-600">{summary.retreatingCount}</div>
              <div className="text-[9px] text-muted-foreground">glaciers</div>
            </div>
          </div>

          <Separator />

          {/* Glacier List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Glaciers ({filteredGlaciers.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredGlaciers.map((glacier) => {
                  const isActive = state.activeGlacierId === glacier.id
                  const statusCfg = STATUS_CONFIG[glacier.status]
                  return (
                    <div
                      key={glacier.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeGlacierId: isActive ? null : glacier.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium">{glacier.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showRetreatRate && (
                          <div>
                            Retreat:{' '}
                            <span className="text-foreground font-medium">
                              {glacier.retreatRate} m/yr
                            </span>
                          </div>
                        )}
                        {state.showMassBalance && (
                          <div>
                            Mass Bal:{' '}
                            <span className="text-foreground font-medium">
                              {glacier.massBalance} m w.e.
                            </span>
                          </div>
                        )}
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-foreground font-medium">
                              {glacier.velocity} m/yr
                            </span>
                          </div>
                        )}
                        {state.showStatus && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {TYPE_CONFIG[glacier.glacierType].label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredGlaciers.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No glaciers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Glacier Details */}
          {activeGlacier && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="text-xs font-semibold">{activeGlacier.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeGlacier.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeGlacier.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeGlacier.latitude.toFixed(2)}, {activeGlacier.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeGlacier.area} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retreat Rate: </span>
                    <span className="font-medium">{activeGlacier.retreatRate} m/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mass Balance: </span>
                    <span className="font-medium">{activeGlacier.massBalance} m w.e.</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ELA: </span>
                    <span className="font-medium">{activeGlacier.equilibriumLineAltitude} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Velocity: </span>
                    <span className="font-medium">{activeGlacier.velocity} m/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Length Change: </span>
                    <span className="font-medium">{activeGlacier.lengthChange} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activeGlacier.glacierType].label}</span>
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
