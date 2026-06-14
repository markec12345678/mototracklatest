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
import { useMapStore, type DeepOceanCurrentState, type DeepOceanCurrent as DeepOceanCurrentType } from '@/lib/map-store'
import { Anchor as AnchorIcon2, X, Gauge, Thermometer, Waves, TrendingUp, MapPin, Filter } from 'lucide-react'

const DEMO_CURRENTS: DeepOceanCurrentType[] = [
  {
    id: 'dc-amoc',
    name: 'AMOC - North Atlantic',
    latitude: 55.0,
    longitude: -30.0,
    currentType: 'thermohaline',
    velocity: 2.4,
    temperature: 2.8,
    salinity: 34.92,
    depth: 3500,
    transportSv: 17.2,
    oxygenLevel: 5.6,
    trend: 'weakening',
  },
  {
    id: 'dc-aabw',
    name: 'Antarctic Bottom Water',
    latitude: -65.0,
    longitude: 0.0,
    currentType: 'antarctic_bottom',
    velocity: 0.8,
    temperature: -0.8,
    salinity: 34.66,
    depth: 4500,
    transportSv: 22.5,
    oxygenLevel: 7.2,
    trend: 'stable',
  },
  {
    id: 'dc-dwb',
    name: 'Deep Western Boundary Current',
    latitude: 32.0,
    longitude: -72.0,
    currentType: 'deep_western_boundary',
    velocity: 3.1,
    temperature: 1.9,
    salinity: 34.88,
    depth: 2800,
    transportSv: 14.8,
    oxygenLevel: 4.9,
    trend: 'weakening',
  },
  {
    id: 'dc-nadw',
    name: 'North Atlantic Deep Water',
    latitude: 48.0,
    longitude: -20.0,
    currentType: 'north_atlantic_deep',
    velocity: 1.6,
    temperature: 2.2,
    salinity: 34.95,
    depth: 3200,
    transportSv: 19.1,
    oxygenLevel: 6.1,
    trend: 'weakening',
  },
  {
    id: 'dc-ross',
    name: 'Ross Sea Deep Outflow',
    latitude: -75.0,
    longitude: 175.0,
    currentType: 'antarctic_bottom',
    velocity: 0.5,
    temperature: -1.2,
    salinity: 34.70,
    depth: 3800,
    transportSv: 8.4,
    oxygenLevel: 7.8,
    trend: 'strengthening',
  },
  {
    id: 'dc-weddell',
    name: 'Weddell Sea Bottom Current',
    latitude: -70.0,
    longitude: -35.0,
    currentType: 'antarctic_bottom',
    velocity: 0.6,
    temperature: -0.9,
    salinity: 34.68,
    depth: 4200,
    transportSv: 12.3,
    oxygenLevel: 7.5,
    trend: 'collapsing',
  },
]

const TREND_CONFIG: Record<
  DeepOceanCurrentType['trend'],
  { label: string; color: string; bgClass: string }
> = {
  strengthening: { label: 'Strengthening', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weakening: { label: 'Weakening', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsing: { label: 'Collapsing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_LABELS: Record<DeepOceanCurrentType['currentType'], string> = {
  thermohaline: 'Thermohaline',
  deep_western_boundary: 'Deep Western Boundary',
  antarctic_bottom: 'Antarctic Bottom',
  north_atlantic_deep: 'North Atlantic Deep',
}

export function DeepOceanCurrentMonitor() {
  const state = useMapStore((s) => s.deepOceanCurrent)
  const setState = useMapStore((s) => s.setDeepOceanCurrent)

  const currents = useMemo(
    () => (state.currents.length > 0 ? state.currents : DEMO_CURRENTS),
    [state.currents]
  )

  const filteredCurrents = useMemo(() => {
    return currents.filter((c) => {
      if (state.typeFilter !== 'all' && c.currentType !== state.typeFilter) return false
      return true
    })
  }, [currents, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredCurrents.length === 0) {
      return { avgVelocity: 0, totalTransport: 0, weakeningCount: 0 }
    }
    const avgVelocity = filteredCurrents.reduce((sum, c) => sum + c.velocity, 0) / filteredCurrents.length
    const totalTransport = filteredCurrents.reduce((sum, c) => sum + c.transportSv, 0)
    const weakeningCount = filteredCurrents.filter(
      (c) => c.trend === 'weakening' || c.trend === 'collapsing'
    ).length
    return {
      avgVelocity: Math.round(avgVelocity * 10) / 10,
      totalTransport: Math.round(totalTransport * 10) / 10,
      weakeningCount,
    }
  }, [filteredCurrents])

  const activeCurrent = useMemo(
    () => currents.find((c) => c.id === state.activeCurrentId) ?? null,
    [currents, state.activeCurrentId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DeepOceanCurrentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVelocity', label: 'Velocity', icon: Gauge },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showTransport', label: 'Transport', icon: Waves },
    { key: 'showTrend', label: 'Trend', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AnchorIcon2 className="h-4 w-4 text-blue-600" />
              Deep Ocean Current Monitor
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
              Current Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as DeepOceanCurrentState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="thermohaline">Thermohaline</SelectItem>
                <SelectItem value="deep_western_boundary">Deep Western Boundary</SelectItem>
                <SelectItem value="antarctic_bottom">Antarctic Bottom</SelectItem>
                <SelectItem value="north_atlantic_deep">North Atlantic Deep</SelectItem>
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
                  <Icon className="h-3 w-3 text-blue-600" />
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
              <div className="text-sm font-semibold">{summary.avgVelocity}</div>
              <div className="text-[9px] text-muted-foreground">cm/s</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Transport</div>
              <div className="text-sm font-semibold text-blue-600">{summary.totalTransport}</div>
              <div className="text-[9px] text-muted-foreground">Sv total</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Declining</div>
              <div className="text-sm font-semibold text-orange-600">{summary.weakeningCount}</div>
              <div className="text-[9px] text-muted-foreground">currents</div>
            </div>
          </div>

          <Separator />

          {/* Current List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Deep Currents ({filteredCurrents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCurrents.map((c) => {
                  const isActive = state.activeCurrentId === c.id
                  const trendCfg = TREND_CONFIG[c.trend]
                  return (
                    <div
                      key={c.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-500/5'
                          : 'border-border/40 hover:border-blue-500/20 hover:bg-blue-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeCurrentId: isActive ? null : c.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: trendCfg.color }}
                          />
                          <span className="text-xs font-medium">{c.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${trendCfg.bgClass}`}
                        >
                          {trendCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-foreground font-medium">
                              {c.velocity} cm/s
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {c.temperature}°C
                            </span>
                          </div>
                        )}
                        {state.showTransport && (
                          <div>
                            Transport:{' '}
                            <span className="text-foreground font-medium">
                              {c.transportSv} Sv
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {TYPE_LABELS[c.currentType]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCurrents.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No currents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Current Details */}
          {activeCurrent && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-semibold">{activeCurrent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${TREND_CONFIG[activeCurrent.trend].bgClass}`}
                  >
                    {TREND_CONFIG[activeCurrent.trend].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeCurrent.latitude.toFixed(2)}, {activeCurrent.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium">{TYPE_LABELS[activeCurrent.currentType]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Velocity: </span>
                    <span className="font-medium">{activeCurrent.velocity} cm/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeCurrent.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salinity: </span>
                    <span className="font-medium">{activeCurrent.salinity} PSU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeCurrent.depth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Transport: </span>
                    <span className="font-medium">{activeCurrent.transportSv} Sv</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Oxygen: </span>
                    <span className="font-medium">{activeCurrent.oxygenLevel} ml/L</span>
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
