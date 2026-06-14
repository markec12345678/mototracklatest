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
import { useMapStore, type RiverDeltaErosionState, type RiverDeltaErosionData } from '@/lib/map-store'
import { Droplets as DropletsIcon6, X, Waves, Layers, ArrowDown, TreePine, MapPin, Filter } from 'lucide-react'

interface DemoDelta extends RiverDeltaErosionData {
  severity: 'stable' | 'slow' | 'moderate' | 'rapid' | 'critical'
}

const DEMO_DELTAS: DemoDelta[] = [
  {
    id: 'rde-mississippi',
    name: 'Mississippi Delta',
    lat: 29,
    lng: -89,
    erosionRate: 45,
    sedimentSupply: 35,
    seaLevel: 3.2,
    landLoss: 4800,
    subsidence: 8.5,
    status: 'critical',
    description: 'Severe land loss due to reduced sediment and high subsidence',
    severity: 'critical',
  },
  {
    id: 'rde-ganges',
    name: 'Ganges Delta',
    lat: 22,
    lng: 89,
    erosionRate: 25,
    sedimentSupply: 65,
    seaLevel: 4.5,
    landLoss: 2200,
    subsidence: 5.2,
    status: 'rapid',
    description: 'Rapid erosion with significant sea level rise impact',
    severity: 'rapid',
  },
  {
    id: 'rde-nile',
    name: 'Nile Delta',
    lat: 31,
    lng: 31,
    erosionRate: 18,
    sedimentSupply: 20,
    seaLevel: 2.8,
    landLoss: 1500,
    subsidence: 4.0,
    status: 'moderate',
    description: 'Moderate erosion due to upstream dam sediment trapping',
    severity: 'moderate',
  },
  {
    id: 'rde-mekong',
    name: 'Mekong Delta',
    lat: 10,
    lng: 106,
    erosionRate: 30,
    sedimentSupply: 40,
    seaLevel: 3.8,
    landLoss: 2800,
    subsidence: 6.5,
    status: 'rapid',
    description: 'Rapid erosion exacerbated by groundwater extraction',
    severity: 'rapid',
  },
  {
    id: 'rde-danube',
    name: 'Danube Delta',
    lat: 45,
    lng: 29,
    erosionRate: 5,
    sedimentSupply: 80,
    seaLevel: 1.5,
    landLoss: 200,
    subsidence: 1.0,
    status: 'stable',
    description: 'Stable delta with good sediment supply and low subsidence',
    severity: 'stable',
  },
  {
    id: 'rde-yellow',
    name: 'Yellow River Delta',
    lat: 37,
    lng: 119,
    erosionRate: 15,
    sedimentSupply: 55,
    seaLevel: 2.5,
    landLoss: 800,
    subsidence: 3.0,
    status: 'moderate',
    description: 'Moderate erosion with changing sediment dynamics',
    severity: 'moderate',
  },
]

const STATUS_CONFIG: Record<
  RiverDeltaErosionData['status'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  slow: { label: 'Slow', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rapid: { label: 'Rapid', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SEVERITY_LABELS: Record<DemoDelta['severity'], string> = {
  stable: 'Stable',
  slow: 'Slow',
  moderate: 'Moderate',
  rapid: 'Rapid',
  critical: 'Critical',
}

export function RiverDeltaErosionMonitor() {
  const state = useMapStore((s) => s.riverDeltaErosion)
  const setState = useMapStore((s) => s.setRiverDeltaErosion)

  const deltas = useMemo(
    () => (state.deltas.length > 0 ? (state.deltas as DemoDelta[]) : DEMO_DELTAS),
    [state.deltas]
  )

  const filteredDeltas = useMemo(() => {
    return deltas.filter((d) => {
      if (state.severityFilter !== 'all' && d.status !== state.severityFilter) return false
      return true
    })
  }, [deltas, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredDeltas.length === 0) {
      return { avgErosionRate: 0, avgSeaLevel: 0, criticalCount: 0 }
    }
    const avgErosionRate =
      filteredDeltas.reduce((sum, d) => sum + d.erosionRate, 0) / filteredDeltas.length
    const avgSeaLevel =
      filteredDeltas.reduce((sum, d) => sum + d.seaLevel, 0) / filteredDeltas.length
    const criticalCount = filteredDeltas.filter(
      (d) => d.status === 'rapid' || d.status === 'critical'
    ).length
    return {
      avgErosionRate: Math.round(avgErosionRate * 10) / 10,
      avgSeaLevel: Math.round(avgSeaLevel * 10) / 10,
      criticalCount,
    }
  }, [filteredDeltas])

  const activeDelta = useMemo(
    () => deltas.find((d) => d.id === state.activeDeltaId) ?? null,
    [deltas, state.activeDeltaId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RiverDeltaErosionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showErosionRate', label: 'Erosion Rate', icon: Waves },
    { key: 'showSedimentSupply', label: 'Sediment Supply', icon: Layers },
    { key: 'showSeaLevel', label: 'Sea Level', icon: ArrowDown },
    { key: 'showLandLoss', label: 'Land Loss', icon: TreePine },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-teal-950/80 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg shadow-teal-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <DropletsIcon6 className="h-4 w-4 text-teal-400" />
              River Delta Erosion Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-teal-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as RiverDeltaErosionState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="rapid">Rapid</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Avg Erosion</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgErosionRate}</div>
              <div className="text-[9px] text-teal-400">m/yr</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Avg Sea Level</div>
              <div className="text-sm font-semibold text-teal-300">{summary.avgSeaLevel}</div>
              <div className="text-[9px] text-teal-400">mm/yr</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Rapid/Critical</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-teal-400">deltas</div>
            </div>
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Delta List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300">
              River Deltas ({filteredDeltas.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredDeltas.map((delta) => {
                  const isActive = state.activeDeltaId === delta.id
                  const statusCfg = STATUS_CONFIG[delta.status]
                  return (
                    <div
                      key={delta.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/60 bg-teal-800/30'
                          : 'border-teal-800/30 hover:border-teal-600/40 hover:bg-teal-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeDeltaId: isActive ? null : delta.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-teal-100">{delta.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300">
                        {state.showErosionRate && (
                          <div>
                            Erosion:{' '}
                            <span className="text-teal-100 font-medium">
                              {delta.erosionRate} m/yr
                            </span>
                          </div>
                        )}
                        {state.showSedimentSupply && (
                          <div>
                            Sediment:{' '}
                            <span className="text-teal-100 font-medium">
                              {delta.sedimentSupply}%
                            </span>
                          </div>
                        )}
                        {state.showSeaLevel && (
                          <div>
                            Sea Level:{' '}
                            <span className="text-teal-100 font-medium">
                              {delta.seaLevel} mm/yr
                            </span>
                          </div>
                        )}
                        {state.showLandLoss && (
                          <div>
                            Land Loss:{' '}
                            <span className="text-teal-100 font-medium">
                              {delta.landLoss.toLocaleString()} ha
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredDeltas.length === 0 && (
                  <div className="text-center text-xs text-teal-400 py-4">
                    No deltas match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Delta Details */}
          {activeDelta && (
            <>
              <Separator className="bg-teal-800/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeDelta.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeDelta.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeDelta.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeDelta.lat.toFixed(1)}, {activeDelta.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400">Erosion Rate: </span>
                    <span className="font-medium text-orange-400">{activeDelta.erosionRate} m/yr</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Sediment Supply: </span>
                    <span className="font-medium text-teal-200">{activeDelta.sedimentSupply}%</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Sea Level Rise: </span>
                    <span className="font-medium text-teal-200">{activeDelta.seaLevel} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Land Loss: </span>
                    <span className="font-medium text-teal-200">{activeDelta.landLoss.toLocaleString()} ha</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Subsidence: </span>
                    <span className="font-medium text-teal-200">{activeDelta.subsidence} mm/yr</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-teal-400">Severity: </span>
                    <span className="font-medium text-teal-200">
                      {(activeDelta as DemoDelta).severity ? SEVERITY_LABELS[(activeDelta as DemoDelta).severity] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-teal-400">Description: </span>
                    <span className="font-medium text-teal-200">{activeDelta.description}</span>
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
