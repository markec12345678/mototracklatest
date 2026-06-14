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
import { useMapStore, type PermafrostThawState, type PermafrostZone } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon4, X, Gauge, TrendingUp, Trees, AlertTriangle, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: PermafrostZone[] = [
  {
    id: 'pz-yakutia',
    name: 'Yakutia Siberia',
    latitude: 62.03,
    longitude: 129.73,
    permafrostType: 'continuous',
    activeLayerDepth: 1.2,
    groundTemperature: -8.5,
    thawRate: 2.1,
    iceContent: 85,
    carbonStore: 42.8,
    infrastructureRisk: 'high',
  },
  {
    id: 'pz-northslope',
    name: 'North Slope Alaska',
    latitude: 70.29,
    longitude: -153.49,
    permafrostType: 'continuous',
    activeLayerDepth: 0.8,
    groundTemperature: -6.2,
    thawRate: 3.4,
    iceContent: 78,
    carbonStore: 35.6,
    infrastructureRisk: 'critical',
  },
  {
    id: 'pz-canadianarctic',
    name: 'Canadian Arctic',
    latitude: 68.36,
    longitude: -95.82,
    permafrostType: 'discontinuous',
    activeLayerDepth: 1.8,
    groundTemperature: -3.7,
    thawRate: 4.2,
    iceContent: 62,
    carbonStore: 28.3,
    infrastructureRisk: 'moderate',
  },
  {
    id: 'pz-tibetan',
    name: 'Tibetan Plateau',
    latitude: 33.50,
    longitude: 89.50,
    permafrostType: 'alpine',
    activeLayerDepth: 2.5,
    groundTemperature: -1.3,
    thawRate: 5.8,
    iceContent: 45,
    carbonStore: 18.7,
    infrastructureRisk: 'high',
  },
  {
    id: 'pz-svalbard',
    name: 'Svalbard',
    latitude: 78.22,
    longitude: 15.63,
    permafrostType: 'continuous',
    activeLayerDepth: 1.5,
    groundTemperature: -4.8,
    thawRate: 3.9,
    iceContent: 72,
    carbonStore: 8.2,
    infrastructureRisk: 'moderate',
  },
  {
    id: 'pz-scandinavian',
    name: 'Scandinavian Mountains',
    latitude: 62.55,
    longitude: 12.67,
    permafrostType: 'sporadic',
    activeLayerDepth: 3.2,
    groundTemperature: -0.5,
    thawRate: 6.1,
    iceContent: 28,
    carbonStore: 5.4,
    infrastructureRisk: 'low',
  },
]

const INFRASTRUCTURE_RISK_CONFIG: Record<
  PermafrostZone['infrastructureRisk'],
  { label: string; color: string; bgClass: string }
> = {
  none: { label: 'None', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const PERMAFROST_TYPE_CONFIG: Record<
  PermafrostZone['permafrostType'],
  { label: string }
> = {
  continuous: { label: 'Continuous' },
  discontinuous: { label: 'Discontinuous' },
  sporadic: { label: 'Sporadic' },
  isolated: { label: 'Isolated' },
  alpine: { label: 'Alpine' },
}

export function PermafrostThawMapper() {
  const state = useMapStore((s) => s.permafrostThaw)
  const setState = useMapStore((s) => s.setPermafrostThaw)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.typeFilter !== 'all' && z.permafrostType !== state.typeFilter) return false
      return true
    })
  }, [zones, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgActiveLayer: 0, avgThawRate: 0, highRiskCount: 0 }
    }
    const avgActiveLayer = filteredZones.reduce((sum, z) => sum + z.activeLayerDepth, 0) / filteredZones.length
    const avgThawRate = filteredZones.reduce((sum, z) => sum + z.thawRate, 0) / filteredZones.length
    const highRiskCount = filteredZones.filter(
      (z) => z.infrastructureRisk === 'high' || z.infrastructureRisk === 'critical'
    ).length
    return {
      avgActiveLayer: Math.round(avgActiveLayer * 10) / 10,
      avgThawRate: Math.round(avgThawRate * 10) / 10,
      highRiskCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PermafrostThawState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showActiveLayer', label: 'Active Layer Depth', icon: Gauge },
    { key: 'showThawRate', label: 'Thaw Rate', icon: TrendingUp },
    { key: 'showCarbonStore', label: 'Carbon Store', icon: Trees },
    { key: 'showInfrastructureRisk', label: 'Infrastructure Risk', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SnowflakeIcon4 className="h-4 w-4 text-cyan-600" />
              Permafrost Thaw Mapper
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
              Permafrost Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as PermafrostThawState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="continuous">Continuous</SelectItem>
                <SelectItem value="discontinuous">Discontinuous</SelectItem>
                <SelectItem value="sporadic">Sporadic</SelectItem>
                <SelectItem value="isolated">Isolated</SelectItem>
                <SelectItem value="alpine">Alpine</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg Active Layer</div>
              <div className="text-sm font-semibold">{summary.avgActiveLayer}</div>
              <div className="text-[9px] text-muted-foreground">m</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Thaw Rate</div>
              <div className="text-sm font-semibold text-cyan-600">{summary.avgThawRate}</div>
              <div className="text-[9px] text-muted-foreground">cm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Critical</div>
              <div className="text-sm font-semibold text-red-600">{summary.highRiskCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Permafrost Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const riskCfg = INFRASTRUCTURE_RISK_CONFIG[zone.infrastructureRisk]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
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
                            style={{ backgroundColor: riskCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${riskCfg.bgClass}`}
                        >
                          {riskCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showActiveLayer && (
                          <div>
                            Active Layer:{' '}
                            <span className="text-foreground font-medium">
                              {zone.activeLayerDepth}m
                            </span>
                          </div>
                        )}
                        {state.showThawRate && (
                          <div>
                            Thaw Rate:{' '}
                            <span className="text-foreground font-medium">
                              {zone.thawRate}cm/yr
                            </span>
                          </div>
                        )}
                        {state.showCarbonStore && (
                          <div>
                            Carbon:{' '}
                            <span className="text-foreground font-medium">
                              {zone.carbonStore}Gt
                            </span>
                          </div>
                        )}
                        {state.showInfrastructureRisk && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {PERMAFROST_TYPE_CONFIG[zone.permafrostType].label}
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
                  <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${INFRASTRUCTURE_RISK_CONFIG[activeZone.infrastructureRisk].bgClass}`}
                  >
                    {INFRASTRUCTURE_RISK_CONFIG[activeZone.infrastructureRisk].label}
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
                    <span className="text-muted-foreground">Permafrost Type: </span>
                    <span className="font-medium">{PERMAFROST_TYPE_CONFIG[activeZone.permafrostType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active Layer: </span>
                    <span className="font-medium">{activeZone.activeLayerDepth}m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ground Temp: </span>
                    <span className="font-medium">{activeZone.groundTemperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thaw Rate: </span>
                    <span className="font-medium">{activeZone.thawRate}cm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ice Content: </span>
                    <span className="font-medium">{activeZone.iceContent}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon Store: </span>
                    <span className="font-medium">{activeZone.carbonStore}Gt</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Infra Risk: </span>
                    <span className="font-medium">{INFRASTRUCTURE_RISK_CONFIG[activeZone.infrastructureRisk].label}</span>
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
