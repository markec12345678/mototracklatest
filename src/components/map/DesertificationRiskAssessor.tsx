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
import { useMapStore, type DesertificationRiskState, type DesertificationZone } from '@/lib/map-store'
import { Sun as SunIcon3, X, Gauge, Leaf, Layers, AlertOctagon, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: DesertificationZone[] = [
  {
    id: 'dz-sahel',
    name: 'Sahel Region',
    latitude: 13.50,
    longitude: 2.11,
    aridityIndex: 0.22,
    vegetationDecline: 34,
    soilDegradation: 'severe',
    windErosionRisk: 'very_high',
    waterErosionRisk: 'high',
    populationPressure: 85,
    overallRisk: 'critical',
  },
  {
    id: 'dz-thar',
    name: 'Thar Desert Edge',
    latitude: 26.91,
    longitude: 70.90,
    aridityIndex: 0.18,
    vegetationDecline: 28,
    soilDegradation: 'moderate',
    windErosionRisk: 'high',
    waterErosionRisk: 'low',
    populationPressure: 72,
    overallRisk: 'very_high',
  },
  {
    id: 'dz-atacama',
    name: 'Atacama Desert Edge',
    latitude: -23.80,
    longitude: -69.42,
    aridityIndex: 0.05,
    vegetationDecline: 12,
    soilDegradation: 'light',
    windErosionRisk: 'moderate',
    waterErosionRisk: 'low',
    populationPressure: 18,
    overallRisk: 'moderate',
  },
  {
    id: 'dz-aralsea',
    name: 'Aral Sea Basin',
    latitude: 44.50,
    longitude: 59.67,
    aridityIndex: 0.28,
    vegetationDecline: 42,
    soilDegradation: 'extreme',
    windErosionRisk: 'very_high',
    waterErosionRisk: 'moderate',
    populationPressure: 55,
    overallRisk: 'critical',
  },
  {
    id: 'dz-mediterranean',
    name: 'Mediterranean Dryland',
    latitude: 38.72,
    longitude: -4.42,
    aridityIndex: 0.38,
    vegetationDecline: 18,
    soilDegradation: 'moderate',
    windErosionRisk: 'low',
    waterErosionRisk: 'high',
    populationPressure: 48,
    overallRisk: 'high',
  },
  {
    id: 'dz-patagonia',
    name: 'Patagonian Steppe',
    latitude: -45.86,
    longitude: -67.49,
    aridityIndex: 0.15,
    vegetationDecline: 22,
    soilDegradation: 'light',
    windErosionRisk: 'high',
    waterErosionRisk: 'low',
    populationPressure: 12,
    overallRisk: 'low',
  },
]

const RISK_CONFIG: Record<
  DesertificationZone['overallRisk'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_high: { label: 'Very High', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  critical: { label: 'Critical', color: '#7f1d1d', bgClass: 'bg-red-900/10 text-red-900 border-red-900/30' },
}

export function DesertificationRiskAssessor() {
  const state = useMapStore((s) => s.desertificationRisk)
  const setState = useMapStore((s) => s.setDesertificationRisk)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.riskFilter !== 'all' && z.overallRisk !== state.riskFilter) return false
      return true
    })
  }, [zones, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgAridity: 0, totalVegDecline: 0, highRiskCount: 0 }
    }
    const avgAridity = filteredZones.reduce((sum, z) => sum + z.aridityIndex, 0) / filteredZones.length
    const totalVegDecline = filteredZones.reduce((sum, z) => sum + z.vegetationDecline, 0)
    const highRiskCount = filteredZones.filter(
      (z) => z.overallRisk === 'very_high' || z.overallRisk === 'critical'
    ).length
    return {
      avgAridity: Math.round(avgAridity * 100) / 100,
      totalVegDecline,
      highRiskCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DesertificationRiskState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAridityIndex', label: 'Aridity Index', icon: Gauge },
    { key: 'showVegetationDecline', label: 'Vegetation Decline', icon: Leaf },
    { key: 'showSoilDegradation', label: 'Soil Degradation', icon: Layers },
    { key: 'showOverallRisk', label: 'Overall Risk', icon: AlertOctagon },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SunIcon3 className="h-4 w-4 text-yellow-600" />
              Desertification Risk Assessor
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
                  riskFilter: v as DesertificationRiskState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
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
                  <Icon className="h-3 w-3 text-yellow-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Aridity</div>
              <div className="text-sm font-semibold">{summary.avgAridity}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Veg Decline</div>
              <div className="text-sm font-semibold text-yellow-600">{summary.totalVegDecline}%</div>
              <div className="text-[9px] text-muted-foreground">total</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">V.High/Critical</div>
              <div className="text-sm font-semibold text-red-600">{summary.highRiskCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Desertification Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const riskCfg = RISK_CONFIG[zone.overallRisk]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : 'border-border/40 hover:border-yellow-500/20 hover:bg-yellow-500/5'
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
                        {state.showAridityIndex && (
                          <div>
                            Aridity:{' '}
                            <span className="text-foreground font-medium">
                              {zone.aridityIndex}
                            </span>
                          </div>
                        )}
                        {state.showVegetationDecline && (
                          <div>
                            Veg Loss:{' '}
                            <span className="text-foreground font-medium">
                              {zone.vegetationDecline}%
                            </span>
                          </div>
                        )}
                        {state.showSoilDegradation && (
                          <div>
                            Soil:{' '}
                            <span className="text-foreground font-medium">
                              {zone.soilDegradation}
                            </span>
                          </div>
                        )}
                        {state.showOverallRisk && (
                          <div>
                            Wind Erosion:{' '}
                            <span className="text-foreground font-medium">
                              {zone.windErosionRisk.replace('_', ' ')}
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
              <div className="space-y-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-yellow-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${RISK_CONFIG[activeZone.overallRisk].bgClass}`}
                  >
                    {RISK_CONFIG[activeZone.overallRisk].label}
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
                    <span className="text-muted-foreground">Aridity Index: </span>
                    <span className="font-medium">{activeZone.aridityIndex}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Veg Decline: </span>
                    <span className="font-medium">{activeZone.vegetationDecline}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Soil Degradation: </span>
                    <span className="font-medium">{activeZone.soilDegradation}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Erosion: </span>
                    <span className="font-medium">{activeZone.windErosionRisk.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Erosion: </span>
                    <span className="font-medium">{activeZone.waterErosionRisk.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Population Pressure: </span>
                    <span className="font-medium">{activeZone.populationPressure}</span>
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
