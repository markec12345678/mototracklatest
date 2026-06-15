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
import { useMapStore, type CryoconiteHoleState, type CryoconiteHoleData } from '@/lib/map-store'
import { CircleDot as CircleDotIcon2, X, Ruler, Leaf, Circle, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CryoconiteHoleData[] = [
  {
    id: 'ch-greenland-1',
    name: 'Greenland Ice Sheet W',
    lat: 67.0,
    lng: -50.0,
    depth: 25,
    diameter: 12,
    organicContent: 0.35,
    status: 'active',
    description: 'Active cryoconite hole with thriving microbial mat',
  },
  {
    id: 'ch-antarctica-1',
    name: 'Antarctica McMurdo',
    lat: -77.8,
    lng: 166.7,
    depth: 8,
    diameter: 5,
    organicContent: 0.15,
    status: 'frozen',
    description: 'Frozen cryoconite hole in Dry Valleys',
  },
  {
    id: 'ch-alaska-1',
    name: 'Alaska Juneau Icefield',
    lat: 58.8,
    lng: -134.5,
    depth: 18,
    diameter: 9,
    organicContent: 0.28,
    status: 'active',
    description: 'Seasonally active hole with dark microbial deposits',
  },
  {
    id: 'ch-iceland-1',
    name: 'Iceland Vatnajökull',
    lat: 64.4,
    lng: -16.8,
    depth: 30,
    diameter: 15,
    organicContent: 0.42,
    status: 'draining',
    description: 'Draining cryoconite hole with high organic content',
  },
]

const STATUS_COLORS: Record<CryoconiteHoleData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  frozen: { label: 'Frozen', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  draining: { label: 'Draining', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
}

function TrendIcon({ status }: { status: CryoconiteHoleData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CryoconiteHoleMonitor() {
  const state = useMapStore((s) => s.cryoconiteHole)
  const setState = useMapStore((s) => s.setCryoconiteHole)

  const holes = useMemo(
    () => (state.holes.length > 0 ? state.holes : SAMPLE_LOCATIONS),
    [state.holes]
  )

  const filteredItems = useMemo(() => {
    return holes.filter((h) => {
      if (state.statusFilter !== 'all' && h.status !== state.statusFilter) return false
      return true
    })
  }, [holes, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalHoles: 0, avgDepth: 0, avgOrganicContent: 0, activeCount: 0 }
    }
    const avgDepth = filteredItems.reduce((sum, h) => sum + h.depth, 0) / filteredItems.length
    const avgOrganicContent = filteredItems.reduce((sum, h) => sum + h.organicContent, 0) / filteredItems.length
    const activeCount = filteredItems.filter((h) => h.status === 'active').length
    return {
      totalHoles: filteredItems.length,
      avgDepth: Math.round(avgDepth * 10) / 10,
      avgOrganicContent: Math.round(avgOrganicContent * 100) / 100,
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => holes.find((h) => h.id === state.activeHoleId) ?? null,
    [holes, state.activeHoleId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((h) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [h.lng, h.lat] },
      properties: { id: h.id, name: h.name, status: h.status, depth: h.depth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.holes.length === 0) {
      useMapStore.getState().setCryoconiteHole({ holes: SAMPLE_LOCATIONS })
    }
  }, [state.holes.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CryoconiteHoleState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: Ruler },
    { key: 'showOrganicContent', label: 'Organic Content', icon: Leaf },
    { key: 'showDiameter', label: 'Diameter', icon: Circle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-blue-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CircleDotIcon2 className="h-4 w-4 text-slate-400" />
              Cryoconite Hole Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as CryoconiteHoleState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="draining">Draining</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Holes</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalHoles}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgDepth}</div>
              <div className="text-[9px] text-slate-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Organic Content</div>
              <div className="text-sm font-semibold text-green-400">{(summary.avgOrganicContent * 100).toFixed(0)}</div>
              <div className="text-[9px] text-slate-400/60">%</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Active Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeCount}</div>
              <div className="text-[9px] text-slate-400/60">holes</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Hole List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Cryoconite Holes ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((h) => {
                  const isActive = state.activeHoleId === h.id
                  const statusCfg = STATUS_COLORS[h.status]
                  return (
                    <div
                      key={h.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-blue-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeHoleId: isActive ? null : h.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={h.status} />
                          <span className="text-xs font-medium text-slate-100">{h.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-slate-100 font-medium">{h.depth}cm</span>
                          </div>
                        )}
                        {state.showDiameter && (
                          <div>
                            Diameter:{' '}
                            <span className="text-slate-100 font-medium">{h.diameter}cm</span>
                          </div>
                        )}
                        {state.showOrganicContent && (
                          <div>
                            Organic:{' '}
                            <span className="text-slate-100 font-medium">{(h.organicContent * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No holes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Hole Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Depth: </span>
                    <span className="font-medium text-blue-400">{activeItem.depth}cm</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Diameter: </span>
                    <span className="font-medium text-cyan-400">{activeItem.diameter}cm</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Organic: </span>
                    <span className="font-medium text-green-400">{(activeItem.organicContent * 100).toFixed(0)}%</span>
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
