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
import { useMapStore, type GlacialMoulinState, type GlacialMoulinData } from '@/lib/map-store'
import { Droplet as DropletIcon8, X, Ruler, Gauge, Circle, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: GlacialMoulinData[] = [
  {
    id: 'gm-greenland-sw',
    name: 'Greenland SW Moulin Field',
    lat: 67.0,
    lng: -48.0,
    depth: 150,
    flowRate: 25,
    diameter: 8,
    status: 'active',
    description: 'Large active moulin draining supraglacial meltwater',
  },
  {
    id: 'gm-mont-blanc',
    name: 'Mer de Glace Moulin',
    lat: 45.9,
    lng: 6.9,
    depth: 40,
    flowRate: 5,
    diameter: 3,
    status: 'seasonal',
    description: 'Seasonal moulin on Mer de Glace glacier',
  },
  {
    id: 'gm-iceland',
    name: 'Skaftafell Moulin',
    lat: 64.0,
    lng: -16.9,
    depth: 60,
    flowRate: 0,
    diameter: 2,
    status: 'frozen',
    description: 'Frozen winter moulin in Vatnajökull outlet',
  },
  {
    id: 'gm-alska',
    name: 'Mendenhall Moulin',
    lat: 58.4,
    lng: -134.5,
    depth: 80,
    flowRate: 15,
    diameter: 5,
    status: 'draining',
    description: 'Active drainage moulin on Mendenhall Glacier',
  },
]

const STATUS_COLORS: Record<GlacialMoulinData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  seasonal: { label: 'Seasonal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  frozen: { label: 'Frozen', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  draining: { label: 'Draining', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
}

function TrendIcon({ status }: { status: GlacialMoulinData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GlacialMoulinExplorer() {
  const state = useMapStore((s) => s.glacialMoulin)
  const setState = useMapStore((s) => s.setGlacialMoulin)

  const moulins = useMemo(
    () => (state.moulins.length > 0 ? state.moulins : SAMPLE_LOCATIONS),
    [state.moulins]
  )

  const filteredItems = useMemo(() => {
    return moulins.filter((m) => {
      if (state.statusFilter !== 'all' && m.status !== state.statusFilter) return false
      return true
    })
  }, [moulins, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalMoulins: 0, avgDepth: 0, avgFlowRate: 0, activeCount: 0 }
    }
    const avgDepth = filteredItems.reduce((sum, m) => sum + m.depth, 0) / filteredItems.length
    const avgFlowRate = filteredItems.reduce((sum, m) => sum + m.flowRate, 0) / filteredItems.length
    const activeCount = filteredItems.filter((m) => m.status === 'active').length
    return {
      totalMoulins: filteredItems.length,
      avgDepth: Math.round(avgDepth * 10) / 10,
      avgFlowRate: Math.round(avgFlowRate * 10) / 10,
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => moulins.find((m) => m.id === state.activeMoulinId) ?? null,
    [moulins, state.activeMoulinId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((m) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [m.lng, m.lat] },
      properties: { id: m.id, name: m.name, status: m.status, depth: m.depth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.moulins.length === 0) {
      useMapStore.getState().setGlacialMoulin({ moulins: SAMPLE_LOCATIONS })
    }
  }, [state.moulins.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GlacialMoulinState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: Ruler },
    { key: 'showFlowRate', label: 'Flow Rate', icon: Gauge },
    { key: 'showDiameter', label: 'Diameter', icon: Circle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-sky-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <DropletIcon8 className="h-4 w-4 text-cyan-400" />
              Glacial Moulin Explorer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as GlacialMoulinState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="draining">Draining</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Moulins</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalMoulins}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgDepth}</div>
              <div className="text-[9px] text-cyan-400/60">m</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Flow Rate</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgFlowRate}</div>
              <div className="text-[9px] text-cyan-400/60">m³/s</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Active Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeCount}</div>
              <div className="text-[9px] text-cyan-400/60">moulins</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Moulin List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Glacial Moulins ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((m) => {
                  const isActive = state.activeMoulinId === m.id
                  const statusCfg = STATUS_COLORS[m.status]
                  return (
                    <div
                      key={m.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeMoulinId: isActive ? null : m.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={m.status} />
                          <span className="text-xs font-medium text-cyan-100">{m.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-cyan-100 font-medium">{m.depth}m</span>
                          </div>
                        )}
                        {state.showFlowRate && (
                          <div>
                            Flow Rate:{' '}
                            <span className="text-cyan-100 font-medium">{m.flowRate} m³/s</span>
                          </div>
                        )}
                        {state.showDiameter && (
                          <div>
                            Diameter:{' '}
                            <span className="text-cyan-100 font-medium">{m.diameter}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No moulins match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Moulin Details */}
          {activeItem && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Depth: </span>
                    <span className="font-medium text-sky-400">{activeItem.depth}m</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Flow Rate: </span>
                    <span className="font-medium text-blue-400">{activeItem.flowRate} m³/s</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Diameter: </span>
                    <span className="font-medium text-green-400">{activeItem.diameter}m</span>
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
