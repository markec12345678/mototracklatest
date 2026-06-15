'use client'

import { useEffect, useMemo } from 'react'
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
import { useMapStore, type SapFlowState, type SapFlowData } from '@/lib/map-store'
import { TreeDeciduous as TreeDeciduousIcon4, X, Droplets, Ruler, MapPin, Filter, TrendingUp } from 'lucide-react'

const SAMPLE_LOCATIONS: SapFlowData[] = [
  {
    id: 'sf-amazon-1',
    name: 'Amazon Canopy Sensor A',
    lat: -3.1,
    lng: -60.0,
    species: 'Bertholletia excelsa',
    flowRate: 4.2,
    treeDiameter: 85,
    status: 'normal',
    description: 'Brazil nut tree in primary rainforest',
  },
  {
    id: 'sf-sequoia-1',
    name: 'Sequoia Grove Sensor',
    lat: 36.6,
    lng: -118.8,
    species: 'Sequoiadendron giganteum',
    flowRate: 12.5,
    treeDiameter: 450,
    status: 'normal',
    description: 'Giant sequoia in Sierra Nevada',
  },
  {
    id: 'sf-eucalyptus-1',
    name: 'Eucalyptus Stand Sensor',
    lat: -35.3,
    lng: 149.1,
    species: 'Eucalyptus regnans',
    flowRate: 0.8,
    treeDiameter: 120,
    status: 'stress',
    description: 'Mountain ash under drought stress',
  },
  {
    id: 'sf-oak-1',
    name: 'English Oak Sensor',
    lat: 51.5,
    lng: -0.1,
    species: 'Quercus robur',
    flowRate: 1.1,
    treeDiameter: 65,
    status: 'dormant',
    description: 'Dormant oak in winter phenological phase',
  },
]

const STATUS_COLORS: Record<SapFlowData['status'], { label: string; color: string; bgClass: string }> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stress: { label: 'Stress', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  dormant: { label: 'Dormant', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: SapFlowData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SapFlowMonitor() {
  const state = useMapStore((s) => s.sapFlow)
  const setState = useMapStore((s) => s.setSapFlow)

  const sensors = useMemo(
    () => (state.sensors.length > 0 ? state.sensors : SAMPLE_LOCATIONS),
    [state.sensors]
  )

  const filteredSensors = useMemo(() => {
    return sensors.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [sensors, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredSensors.length === 0) {
      return { totalSensors: 0, avgFlowRate: 0, avgTreeDiameter: 0, activeSensors: 0 }
    }
    const avgFlowRate = filteredSensors.reduce((sum, s) => sum + s.flowRate, 0) / filteredSensors.length
    const avgTreeDiameter = filteredSensors.reduce((sum, s) => sum + s.treeDiameter, 0) / filteredSensors.length
    const activeSensors = filteredSensors.filter((s) => s.status === 'normal').length
    return {
      totalSensors: filteredSensors.length,
      avgFlowRate: Math.round(avgFlowRate * 100) / 100,
      avgTreeDiameter: Math.round(avgTreeDiameter),
      activeSensors,
    }
  }, [filteredSensors])

  const activeItem = useMemo(
    () => sensors.find((s) => s.id === state.activeSensorId) ?? null,
    [sensors, state.activeSensorId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredSensors.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, flowRate: s.flowRate },
    })),
  }), [filteredSensors])

  useEffect(() => {
    if (state.sensors.length === 0) {
      useMapStore.getState().setSapFlow({ sensors: SAMPLE_LOCATIONS })
    }
  }, [state.sensors.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SapFlowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowRate', label: 'Flow Rate', icon: Droplets },
    { key: 'showTreeDiameter', label: 'Tree Diameter', icon: Ruler },
    { key: 'showTrend', label: 'Trend', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-lime-950/95 to-green-950/95 backdrop-blur-xl border border-lime-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-lime-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-lime-100">
              <TreeDeciduousIcon4 className="h-4 w-4 text-lime-400" />
              Sap Flow Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-lime-300 hover:text-lime-100 hover:bg-lime-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-lime-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-lime-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SapFlowState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-lime-900/40 border-lime-700/40 text-lime-100 hover:bg-lime-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="stress">Stress</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-lime-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lime-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-lime-200">
                  <Icon className="h-3 w-3 text-lime-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-lime-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-lime-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Total Sensors</div>
              <div className="text-sm font-semibold text-lime-200">{summary.totalSensors}</div>
              <div className="text-[9px] text-lime-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Avg Flow Rate</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgFlowRate}</div>
              <div className="text-[9px] text-lime-400/60">L/h</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Avg Tree Diameter</div>
              <div className="text-sm font-semibold text-lime-200">{summary.avgTreeDiameter}</div>
              <div className="text-[9px] text-lime-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400/70">Active Sensors</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeSensors}</div>
              <div className="text-[9px] text-lime-400/60">normal</div>
            </div>
          </div>

          <Separator className="bg-lime-700/30" />

          {/* Sensor List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lime-300/80">
              Sap Flow Sensors ({filteredSensors.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSensors.map((sensor) => {
                  const isActive = state.activeSensorId === sensor.id
                  const statusCfg = STATUS_COLORS[sensor.status]
                  return (
                    <div
                      key={sensor.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-lime-500/50 bg-lime-800/30'
                          : 'border-lime-700/30 hover:border-lime-500/30 hover:bg-lime-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSensorId: isActive ? null : sensor.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={sensor.status} />
                          <span className="text-xs font-medium text-lime-100">{sensor.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-lime-300/60">
                        {state.showFlowRate && (
                          <div>
                            Flow Rate:{' '}
                            <span className="text-lime-100 font-medium">{sensor.flowRate}L/h</span>
                          </div>
                        )}
                        {state.showTreeDiameter && (
                          <div>
                            Diameter:{' '}
                            <span className="text-lime-100 font-medium">{sensor.treeDiameter}cm</span>
                          </div>
                        )}
                        <div>
                          Species:{' '}
                          <span className="text-lime-100 font-medium italic">{sensor.species}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredSensors.length === 0 && (
                  <div className="text-center text-xs text-lime-400/50 py-4">
                    No sensors match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Sensor Details */}
          {activeItem && (
            <>
              <Separator className="bg-lime-700/30" />
              <div className="space-y-2 rounded-lg border border-lime-600/30 bg-lime-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-lime-400" />
                  <span className="text-xs font-semibold text-lime-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-lime-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-lime-400/70">Coordinates: </span>
                    <span className="font-medium text-lime-100">
                      {activeItem.lat.toFixed(1)}, {activeItem.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-lime-400/70">Flow Rate: </span>
                    <span className="font-medium text-green-400">{activeItem.flowRate}L/h</span>
                  </div>
                  <div>
                    <span className="text-lime-400/70">Tree Diameter: </span>
                    <span className="font-medium text-lime-200">{activeItem.treeDiameter}cm</span>
                  </div>
                  <div>
                    <span className="text-lime-400/70">Species: </span>
                    <span className="font-medium text-lime-200 italic">{activeItem.species}</span>
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
