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
import { useMapStore, type RiverDeltaState, type RiverDelta } from '@/lib/map-store'
import { Waves as WavesIcon6, X, Droplets, ArrowDown, Ruler, ShieldAlert, MapPin, Filter } from 'lucide-react'

const DEMO_DELTAS: RiverDelta[] = [
  {
    id: 'rd-nile',
    name: 'Nile Delta',
    latitude: 31.20,
    longitude: 31.60,
    deltaType: 'river_dominated',
    sedimentRate: 42.5,
    subsidenceRate: 3.2,
    areaChange: -12.8,
    wetlandLoss: 18.4,
    population: 42000000,
    riskLevel: 'critical',
  },
  {
    id: 'rd-mississippi',
    name: 'Mississippi Delta',
    latitude: 29.15,
    longitude: -89.25,
    deltaType: 'river_dominated',
    sedimentRate: 35.8,
    subsidenceRate: 5.1,
    areaChange: -48.2,
    wetlandLoss: 62.3,
    population: 2100000,
    riskLevel: 'critical',
  },
  {
    id: 'rd-ganges',
    name: 'Ganges-Brahmaputra Delta',
    latitude: 22.25,
    longitude: 89.50,
    deltaType: 'tide_dominated',
    sedimentRate: 98.6,
    subsidenceRate: 2.8,
    areaChange: 5.4,
    wetlandLoss: 12.1,
    population: 125000000,
    riskLevel: 'high',
  },
  {
    id: 'rd-mekong',
    name: 'Mekong Delta',
    latitude: 10.25,
    longitude: 105.95,
    deltaType: 'tide_dominated',
    sedimentRate: 56.2,
    subsidenceRate: 1.8,
    areaChange: -8.3,
    wetlandLoss: 15.7,
    population: 18000000,
    riskLevel: 'high',
  },
  {
    id: 'rd-danube',
    name: 'Danube Delta',
    latitude: 45.20,
    longitude: 29.70,
    deltaType: 'wave_dominated',
    sedimentRate: 18.4,
    subsidenceRate: 0.6,
    areaChange: 2.1,
    wetlandLoss: 4.2,
    population: 580000,
    riskLevel: 'low',
  },
  {
    id: 'rd-niger',
    name: 'Niger Delta',
    latitude: 4.95,
    longitude: 6.25,
    deltaType: 'mixed',
    sedimentRate: 28.7,
    subsidenceRate: 1.4,
    areaChange: -5.6,
    wetlandLoss: 9.8,
    population: 32000000,
    riskLevel: 'moderate',
  },
]

const RISK_CONFIG: Record<
  RiverDelta['riskLevel'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function RiverDeltaMonitor() {
  const riverDelta = useMapStore((s) => s.riverDelta)
  const setRiverDelta = useMapStore((s) => s.setRiverDelta)

  const deltas = useMemo(
    () => (riverDelta.deltas.length > 0 ? riverDelta.deltas : DEMO_DELTAS),
    [riverDelta.deltas]
  )

  const filteredDeltas = useMemo(() => {
    return deltas.filter((d) => {
      if (riverDelta.riskFilter !== 'all' && d.riskLevel !== riverDelta.riskFilter) return false
      return true
    })
  }, [deltas, riverDelta.riskFilter])

  const summary = useMemo(() => {
    if (filteredDeltas.length === 0) {
      return { avgSedimentRate: 0, avgAreaChange: 0, criticalCount: 0 }
    }
    const avgSedimentRate = filteredDeltas.reduce((sum, d) => sum + d.sedimentRate, 0) / filteredDeltas.length
    const avgAreaChange = filteredDeltas.reduce((sum, d) => sum + d.areaChange, 0) / filteredDeltas.length
    const criticalCount = filteredDeltas.filter((d) => d.riskLevel === 'critical').length
    return {
      avgSedimentRate: Math.round(avgSedimentRate * 10) / 10,
      avgAreaChange: Math.round(avgAreaChange * 10) / 10,
      criticalCount,
    }
  }, [filteredDeltas])

  const activeDelta = useMemo(
    () => deltas.find((d) => d.id === riverDelta.activeDeltaId) ?? null,
    [deltas, riverDelta.activeDeltaId]
  )

  if (typeof window === 'undefined') return null
  if (!riverDelta.open) return null

  const overlayToggles: { key: keyof RiverDeltaState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSedimentRate', label: 'Sediment Rate', icon: Droplets },
    { key: 'showSubsidence', label: 'Subsidence', icon: ArrowDown },
    { key: 'showAreaChange', label: 'Area Change', icon: Ruler },
    { key: 'showRiskLevel', label: 'Risk Level', icon: ShieldAlert },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WavesIcon6 className="h-4 w-4 text-cyan-600" />
              River Delta Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRiverDelta({ open: false })}
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
              value={riverDelta.riskFilter}
              onValueChange={(v) =>
                setRiverDelta({
                  riskFilter: v as RiverDeltaState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
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
                  <Icon className="h-3 w-3 text-cyan-600" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={riverDelta[key] as boolean}
                  onCheckedChange={(checked) => setRiverDelta({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Sediment</div>
              <div className="text-sm font-semibold text-cyan-600">{summary.avgSedimentRate}</div>
              <div className="text-[9px] text-muted-foreground">Mt/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Area Change</div>
              <div className="text-sm font-semibold">{summary.avgAreaChange}</div>
              <div className="text-[9px] text-muted-foreground">km²/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Critical</div>
              <div className="text-sm font-semibold text-red-500">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">deltas</div>
            </div>
          </div>

          <Separator />

          {/* Delta List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              River Deltas ({filteredDeltas.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredDeltas.map((delta) => {
                  const isActive = riverDelta.activeDeltaId === delta.id
                  const riskCfg = RISK_CONFIG[delta.riskLevel]
                  return (
                    <div
                      key={delta.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setRiverDelta({
                          activeDeltaId: isActive ? null : delta.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: riskCfg.color }}
                          />
                          <span className="text-xs font-medium">{delta.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${riskCfg.bgClass}`}
                        >
                          {riskCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {riverDelta.showSedimentRate && (
                          <div>
                            Sediment:{' '}
                            <span className="text-foreground font-medium">
                              {delta.sedimentRate} Mt/yr
                            </span>
                          </div>
                        )}
                        {riverDelta.showSubsidence && (
                          <div>
                            Subsidence:{' '}
                            <span className="text-foreground font-medium">
                              {delta.subsidenceRate} mm/yr
                            </span>
                          </div>
                        )}
                        {riverDelta.showAreaChange && (
                          <div>
                            Area Δ:{' '}
                            <span className="text-foreground font-medium">
                              {delta.areaChange} km²/yr
                            </span>
                          </div>
                        )}
                        {riverDelta.showRiskLevel && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium capitalize">
                              {delta.deltaType.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredDeltas.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No deltas match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Delta Details */}
          {activeDelta && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="text-xs font-semibold">{activeDelta.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${RISK_CONFIG[activeDelta.riskLevel].bgClass}`}
                  >
                    {RISK_CONFIG[activeDelta.riskLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeDelta.latitude.toFixed(2)}, {activeDelta.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium capitalize">{activeDelta.deltaType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sediment: </span>
                    <span className="font-medium">{activeDelta.sedimentRate} Mt/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subsidence: </span>
                    <span className="font-medium">{activeDelta.subsidenceRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area Δ: </span>
                    <span className="font-medium">{activeDelta.areaChange} km²/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wetland Loss: </span>
                    <span className="font-medium">{activeDelta.wetlandLoss}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Population: </span>
                    <span className="font-medium">{(activeDelta.population / 1000000).toFixed(1)}M</span>
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
