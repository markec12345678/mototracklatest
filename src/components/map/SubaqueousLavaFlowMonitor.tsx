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
import { useMapStore, type SubaqueousLavaFlowState, type SubaqueousLavaFlowData } from '@/lib/map-store'
import { Flame as VolcanoIcon, X, Ruler, ArrowDown, Thermometer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SubaqueousLavaFlowData[] = [
  {
    id: 'sl-tonga',
    name: 'Hunga Tonga Flow',
    lat: -20.5,
    lng: -175.4,
    flowLength: 5.0,
    depth: 150,
    lavaTemperature: 1200,
    status: 'active',
    description: 'Active submarine lava flow from 2022 eruption',
  },
  {
    id: 'sl-kilauea-ocean',
    name: 'Kīlauea Ocean Entry',
    lat: 19.3,
    lng: -155.0,
    flowLength: 2.5,
    depth: 30,
    lavaTemperature: 1150,
    status: 'inflating',
    description: 'Inflating submarine lava delta at ocean entry',
  },
  {
    id: 'sl-axial',
    name: 'Axial Seamount Flow',
    lat: 45.9,
    lng: -130.0,
    flowLength: 1.2,
    depth: 1500,
    lavaTemperature: 600,
    status: 'cooling',
    description: 'Cooling pillow lava flow at Juan de Fuca Ridge',
  },
  {
    id: 'sl-galapagos',
    name: 'Galápagos Rift Flow',
    lat: 0.8,
    lng: -86.1,
    flowLength: 3.0,
    depth: 2500,
    lavaTemperature: 4,
    status: 'solidified',
    description: 'Solidified pillow basalt flow from 2015 eruption',
  },
]

const STATUS_COLORS: Record<SubaqueousLavaFlowData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  inflating: { label: 'Inflating', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  cooling: { label: 'Cooling', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  solidified: { label: 'Solidified', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: SubaqueousLavaFlowData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SubaqueousLavaFlowMonitor() {
  const state = useMapStore((s) => s.subaqueousLavaFlow)
  const setState = useMapStore((s) => s.setSubaqueousLavaFlow)

  const flows = useMemo(
    () => (state.flows.length > 0 ? state.flows : SAMPLE_LOCATIONS),
    [state.flows]
  )

  const filteredItems = useMemo(() => {
    return flows.filter((f) => {
      if (state.statusFilter !== 'all' && f.status !== state.statusFilter) return false
      return true
    })
  }, [flows, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalFlows: 0, avgFlowLength: 0, maxTemperature: 0, activeCount: 0 }
    }
    const avgFlowLength = filteredItems.reduce((sum, f) => sum + f.flowLength, 0) / filteredItems.length
    const maxTemperature = Math.max(...filteredItems.map((f) => f.lavaTemperature))
    const activeCount = filteredItems.filter((f) => f.status === 'active').length
    return {
      totalFlows: filteredItems.length,
      avgFlowLength: Math.round(avgFlowLength * 10) / 10,
      maxTemperature,
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => flows.find((f) => f.id === state.activeFlowId) ?? null,
    [flows, state.activeFlowId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((f) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
      properties: { id: f.id, name: f.name, status: f.status, depth: f.depth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.flows.length === 0) {
      useMapStore.getState().setSubaqueousLavaFlow({ flows: SAMPLE_LOCATIONS })
    }
  }, [state.flows.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubaqueousLavaFlowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowLength', label: 'Flow Length', icon: Ruler },
    { key: 'showDepth', label: 'Depth', icon: ArrowDown },
    { key: 'showLavaTemperature', label: 'Lava Temperature', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-neutral-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <VolcanoIcon className="h-4 w-4 text-red-400" />
              Subaqueous Lava Flow Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SubaqueousLavaFlowState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inflating">Inflating</SelectItem>
                <SelectItem value="cooling">Cooling</SelectItem>
                <SelectItem value="solidified">Solidified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Flows</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalFlows}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Flow Length</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgFlowLength}</div>
              <div className="text-[9px] text-red-400/60">km</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Max Temperature</div>
              <div className="text-sm font-semibold text-amber-400">{summary.maxTemperature}</div>
              <div className="text-[9px] text-red-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Active Count</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeCount}</div>
              <div className="text-[9px] text-red-400/60">flows</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Flow List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Flows ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((f) => {
                  const isActive = state.activeFlowId === f.id
                  const statusCfg = STATUS_COLORS[f.status]
                  return (
                    <div
                      key={f.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeFlowId: isActive ? null : f.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={f.status} />
                          <span className="text-xs font-medium text-red-100">{f.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showFlowLength && (
                          <div>
                            Length:{' '}
                            <span className="text-red-100 font-medium">{f.flowLength} km</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-red-100 font-medium">{f.depth}m</span>
                          </div>
                        )}
                        {state.showLavaTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-red-100 font-medium">{f.lavaTemperature}°C</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No flows match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Flow Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Flow Length: </span>
                    <span className="font-medium text-orange-400">{activeItem.flowLength} km</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Depth: </span>
                    <span className="font-medium text-amber-400">{activeItem.depth}m</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Temperature: </span>
                    <span className="font-medium text-red-400">{activeItem.lavaTemperature}°C</span>
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
