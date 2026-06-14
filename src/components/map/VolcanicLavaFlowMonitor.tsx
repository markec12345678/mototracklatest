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
import { useMapStore, type VolcanicLavaFlowState, type LavaFlow } from '@/lib/map-store'
import { Flame as FlameIcon3, X, Thermometer, MoveRight, ShieldAlert, MapPin, Filter } from 'lucide-react'

const DEMO_FLOWS: LavaFlow[] = [
  {
    id: 'lf-etna',
    name: 'Mount Etna Flow',
    latitude: 37.75,
    longitude: 14.99,
    flowType: 'aa',
    temperature: 1050,
    velocity: 45,
    length: 3.2,
    width: 250,
    thickness: 12,
    riskLevel: 'high',
    affectedArea: 18.5,
  },
  {
    id: 'lf-kilauea',
    name: 'Kīlauea East Rift',
    latitude: 19.41,
    longitude: -155.28,
    flowType: 'pahoehoe',
    temperature: 1170,
    velocity: 12,
    length: 8.5,
    width: 400,
    thickness: 8,
    riskLevel: 'extreme',
    affectedArea: 42.0,
  },
  {
    id: 'lf-fagradalsfjall',
    name: 'Fagradalsfjall Flow',
    latitude: 63.90,
    longitude: -22.27,
    flowType: 'pahoehoe',
    temperature: 1240,
    velocity: 8,
    length: 1.5,
    width: 120,
    thickness: 6,
    riskLevel: 'moderate',
    affectedArea: 5.2,
  },
  {
    id: 'lf-nyiragongo',
    name: 'Nyiragongo Lava',
    latitude: -1.52,
    longitude: 29.23,
    flowType: 'aa',
    temperature: 980,
    velocity: 60,
    length: 5.8,
    width: 350,
    thickness: 15,
    riskLevel: 'extreme',
    affectedArea: 35.0,
  },
  {
    id: 'lf-stromboli',
    name: 'Stromboli Sciara',
    latitude: 38.79,
    longitude: 15.21,
    flowType: 'block',
    temperature: 890,
    velocity: 25,
    length: 1.2,
    width: 80,
    thickness: 10,
    riskLevel: 'low',
    affectedArea: 2.8,
  },
  {
    id: 'lf-fuji',
    name: 'Fuji Flank Flow',
    latitude: 35.36,
    longitude: 138.73,
    flowType: 'aa',
    temperature: 1020,
    velocity: 35,
    length: 4.0,
    width: 200,
    thickness: 14,
    riskLevel: 'high',
    affectedArea: 22.0,
  },
]

const RISK_CONFIG: Record<
  LavaFlow['riskLevel'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const RISK_LABELS: Record<VolcanicLavaFlowState['riskFilter'], string> = {
  all: 'All Risk Levels',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  extreme: 'Extreme',
}

export function VolcanicLavaFlowMonitor() {
  const state = useMapStore((s) => s.volcanicLavaFlow)
  const setState = useMapStore((s) => s.setVolcanicLavaFlow)

  const flows = useMemo(
    () => (state.flows.length > 0 ? state.flows : DEMO_FLOWS),
    [state.flows]
  )

  const filteredFlows = useMemo(() => {
    return flows.filter((f) => {
      if (state.riskFilter !== 'all' && f.riskLevel !== state.riskFilter) return false
      return true
    })
  }, [flows, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredFlows.length === 0) {
      return { avgTemperature: 0, totalAffectedArea: 0, highExtremeCount: 0 }
    }
    const avgTemperature =
      filteredFlows.reduce((sum, f) => sum + f.temperature, 0) / filteredFlows.length
    const totalAffectedArea = filteredFlows.reduce((sum, f) => sum + f.affectedArea, 0)
    const highExtremeCount = filteredFlows.filter(
      (f) => f.riskLevel === 'high' || f.riskLevel === 'extreme'
    ).length
    return {
      avgTemperature: Math.round(avgTemperature),
      totalAffectedArea: Math.round(totalAffectedArea * 10) / 10,
      highExtremeCount,
    }
  }, [filteredFlows])

  const activeFlow = useMemo(
    () => flows.find((f) => f.id === state.activeFlowId) ?? null,
    [flows, state.activeFlowId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicLavaFlowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showVelocity', label: 'Velocity', icon: MoveRight },
    { key: 'showRiskLevel', label: 'Risk Level', icon: ShieldAlert },
    { key: 'showAffectedArea', label: 'Affected Area', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlameIcon3 className="h-4 w-4 text-orange-500" />
              Volcanic Lava Flow Monitor
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
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({
                  riskFilter: v as VolcanicLavaFlowState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RISK_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
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
              <div className="text-[10px] text-muted-foreground">Avg Temperature</div>
              <div className="text-sm font-semibold">{summary.avgTemperature}</div>
              <div className="text-[9px] text-muted-foreground">°C</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Area</div>
              <div className="text-sm font-semibold text-orange-500">{summary.totalAffectedArea}</div>
              <div className="text-[9px] text-muted-foreground">km²</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Extreme</div>
              <div className="text-sm font-semibold text-red-500">{summary.highExtremeCount}</div>
              <div className="text-[9px] text-muted-foreground">flows</div>
            </div>
          </div>

          <Separator />

          {/* Flow List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Lava Flows ({filteredFlows.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFlows.map((flow) => {
                  const isActive = state.activeFlowId === flow.id
                  const riskCfg = RISK_CONFIG[flow.riskLevel]
                  return (
                    <div
                      key={flow.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeFlowId: isActive ? null : flow.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: riskCfg.color }}
                          />
                          <span className="text-xs font-medium">{flow.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${riskCfg.bgClass}`}
                        >
                          {riskCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {flow.temperature} °C
                            </span>
                          </div>
                        )}
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-foreground font-medium">
                              {flow.velocity} m/hr
                            </span>
                          </div>
                        )}
                        {state.showRiskLevel && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {flow.flowType}
                            </span>
                          </div>
                        )}
                        {state.showAffectedArea && (
                          <div>
                            Area:{' '}
                            <span className="text-foreground font-medium">
                              {flow.affectedArea} km²
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFlows.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No flows match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Flow Details */}
          {activeFlow && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-semibold">{activeFlow.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${RISK_CONFIG[activeFlow.riskLevel].bgClass}`}
                  >
                    {RISK_CONFIG[activeFlow.riskLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeFlow.latitude.toFixed(2)}, {activeFlow.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeFlow.temperature} °C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Velocity: </span>
                    <span className="font-medium">{activeFlow.velocity} m/hr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flow Type: </span>
                    <span className="font-medium capitalize">{activeFlow.flowType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Length: </span>
                    <span className="font-medium">{activeFlow.length} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Width: </span>
                    <span className="font-medium">{activeFlow.width} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thickness: </span>
                    <span className="font-medium">{activeFlow.thickness} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected Area: </span>
                    <span className="font-medium">{activeFlow.affectedArea} km²</span>
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
