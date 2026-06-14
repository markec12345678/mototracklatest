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
import { useMapStore, type IceSheetVelocityState, type IceVelocityPoint } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon5, X, Gauge, Activity, MapPin, Filter, TrendingUp } from 'lucide-react'

const DEMO_POINTS: IceVelocityPoint[] = [
  {
    id: 'iv-jakobshavn',
    name: 'Jakobshavn Isbrae Greenland',
    latitude: 69.17,
    longitude: -49.80,
    iceType: 'outlet_glacier',
    velocity: 12600,
    strainRate: 0.0085,
    thickness: 2600,
    meltRate: 18.5,
    stability: 'fast_retreat',
  },
  {
    id: 'iv-pineisland',
    name: 'Pine Island Glacier Antarctica',
    latitude: -75.17,
    longitude: -100.00,
    iceType: 'ice_stream',
    velocity: 4200,
    strainRate: 0.0042,
    thickness: 2100,
    meltRate: 12.3,
    stability: 'collapsing',
  },
  {
    id: 'iv-thwaites',
    name: 'Thwaites Glacier Antarctica',
    latitude: -75.50,
    longitude: -106.75,
    iceType: 'ice_stream',
    velocity: 3100,
    strainRate: 0.0038,
    thickness: 1800,
    meltRate: 10.8,
    stability: 'fast_retreat',
  },
  {
    id: 'iv-petermann',
    name: 'Petermann Glacier Greenland',
    latitude: 80.78,
    longitude: -60.15,
    iceType: 'outlet_glacier',
    velocity: 1100,
    strainRate: 0.0021,
    thickness: 1600,
    meltRate: 5.2,
    stability: 'retreating',
  },
  {
    id: 'iv-ross',
    name: 'Ross Ice Shelf Antarctica',
    latitude: -81.00,
    longitude: -170.00,
    iceType: 'ice_shelf',
    velocity: 800,
    strainRate: 0.0012,
    thickness: 3200,
    meltRate: 2.1,
    stability: 'slow_retreat',
  },
  {
    id: 'iv-kamb',
    name: 'Kamb Ice Stream Antarctica',
    latitude: -82.00,
    longitude: -150.00,
    iceType: 'ice_stream',
    velocity: 5,
    strainRate: 0.0001,
    thickness: 2400,
    meltRate: 0.2,
    stability: 'stable',
  },
]

const STABILITY_CONFIG: Record<
  IceVelocityPoint['stability'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  slow_retreat: { label: 'Slow Retreat', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  retreating: { label: 'Retreating', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  fast_retreat: { label: 'Fast Retreat', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsing: { label: 'Collapsing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_CONFIG: Record<
  IceVelocityPoint['iceType'],
  { label: string }
> = {
  outlet_glacier: { label: 'Outlet Glacier' },
  ice_stream: { label: 'Ice Stream' },
  ice_shelf: { label: 'Ice Shelf' },
  interior_ice: { label: 'Interior Ice' },
  pinning_point: { label: 'Pinning Point' },
  grounding_line: { label: 'Grounding Line' },
}

export function IceSheetVelocityMapper() {
  const state = useMapStore((s) => s.iceSheetVelocity)
  const setState = useMapStore((s) => s.setIceSheetVelocity)

  const points = useMemo(
    () => (state.points.length > 0 ? state.points : DEMO_POINTS),
    [state.points]
  )

  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      if (state.typeFilter !== 'all' && p.iceType !== state.typeFilter) return false
      return true
    })
  }, [points, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredPoints.length === 0) {
      return { avgVelocity: 0, avgThickness: 0, retreatingCount: 0 }
    }
    const avgVelocity = filteredPoints.reduce((sum, p) => sum + p.velocity, 0) / filteredPoints.length
    const avgThickness = filteredPoints.reduce((sum, p) => sum + p.thickness, 0) / filteredPoints.length
    const retreatingCount = filteredPoints.filter(
      (p) => p.stability === 'retreating' || p.stability === 'fast_retreat' || p.stability === 'collapsing'
    ).length
    return {
      avgVelocity: Math.round(avgVelocity),
      avgThickness: Math.round(avgThickness),
      retreatingCount,
    }
  }, [filteredPoints])

  const activePoint = useMemo(
    () => points.find((p) => p.id === state.activePointId) ?? null,
    [points, state.activePointId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IceSheetVelocityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVelocity', label: 'Velocity', icon: Gauge },
    { key: 'showStrainRate', label: 'Strain Rate', icon: TrendingUp },
    { key: 'showThickness', label: 'Thickness', icon: Activity },
    { key: 'showStability', label: 'Stability', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SnowflakeIcon5 className="h-4 w-4 text-cyan-500" />
              Ice Sheet Velocity Mapper
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
              Ice Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as IceSheetVelocityState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="outlet_glacier">Outlet Glacier</SelectItem>
                <SelectItem value="ice_stream">Ice Stream</SelectItem>
                <SelectItem value="ice_shelf">Ice Shelf</SelectItem>
                <SelectItem value="interior_ice">Interior Ice</SelectItem>
                <SelectItem value="pinning_point">Pinning Point</SelectItem>
                <SelectItem value="grounding_line">Grounding Line</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg Velocity</div>
              <div className="text-sm font-semibold text-cyan-600">{summary.avgVelocity}</div>
              <div className="text-[9px] text-muted-foreground">m/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Thickness</div>
              <div className="text-sm font-semibold text-cyan-600">{summary.avgThickness}</div>
              <div className="text-[9px] text-muted-foreground">m</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Retreating+</div>
              <div className="text-sm font-semibold text-red-600">{summary.retreatingCount}</div>
              <div className="text-[9px] text-muted-foreground">points</div>
            </div>
          </div>

          <Separator />

          {/* Point List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Velocity Points ({filteredPoints.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPoints.map((point) => {
                  const isActive = state.activePointId === point.id
                  const stabCfg = STABILITY_CONFIG[point.stability]
                  return (
                    <div
                      key={point.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activePointId: isActive ? null : point.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: stabCfg.color }}
                          />
                          <span className="text-xs font-medium">{point.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${stabCfg.bgClass}`}
                        >
                          {stabCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-foreground font-medium">
                              {point.velocity.toLocaleString()} m/yr
                            </span>
                          </div>
                        )}
                        {state.showStrainRate && (
                          <div>
                            Strain Rate:{' '}
                            <span className="text-foreground font-medium">
                              {point.strainRate.toFixed(4)}/yr
                            </span>
                          </div>
                        )}
                        {state.showThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-foreground font-medium">
                              {point.thickness.toLocaleString()} m
                            </span>
                          </div>
                        )}
                        {state.showStability && (
                          <div>
                            Melt Rate:{' '}
                            <span className="text-foreground font-medium">
                              {point.meltRate.toFixed(1)} m/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPoints.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No points match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Point Details */}
          {activePoint && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="text-xs font-semibold">{activePoint.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STABILITY_CONFIG[activePoint.stability].bgClass}`}
                  >
                    {STABILITY_CONFIG[activePoint.stability].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activePoint.latitude.toFixed(2)}, {activePoint.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ice Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activePoint.iceType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Velocity: </span>
                    <span className="font-medium">{activePoint.velocity.toLocaleString()} m/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Strain Rate: </span>
                    <span className="font-medium">{activePoint.strainRate.toFixed(4)}/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thickness: </span>
                    <span className="font-medium">{activePoint.thickness.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Melt Rate: </span>
                    <span className="font-medium">{activePoint.meltRate.toFixed(1)} m/yr</span>
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
