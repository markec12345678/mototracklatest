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
import { useMapStore, type TidalCreekMonitorState, type TidalCreekMonitorData } from '@/lib/map-store'
import { Waves as WavesIcon17, X, Ruler, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: TidalCreekMonitorData[] = [
  {
    id: 'tc-barataria',
    name: 'Barataria Basin Creek',
    lat: 29.45,
    lng: -90.05,
    tidalRange: 1.2,
    creekDepth: 3.5,
    salinity: 18,
    status: 'flooding',
    description: 'Louisiana tidal marsh creek',
  },
  {
    id: 'tc-wadden',
    name: 'Wadden Sea Creek',
    lat: 53.75,
    lng: 6.5,
    tidalRange: 2.8,
    creekDepth: 2.1,
    salinity: 28,
    status: 'ebbing',
    description: 'Dutch tidal flat drainage',
  },
  {
    id: 'tc-sapelo',
    name: 'Sapelo Island Creek',
    lat: 31.4,
    lng: -81.1833,
    tidalRange: 1.8,
    creekDepth: 2.8,
    salinity: 22,
    status: 'neap',
    description: 'Georgia coastal creek',
  },
  {
    id: 'tc-moreton',
    name: 'Moreton Bay Creek',
    lat: -27.4167,
    lng: 153.1667,
    tidalRange: 2.2,
    creekDepth: 3.0,
    salinity: 35,
    status: 'spring',
    description: 'Australian tidal creek',
  },
]

const STATUS_COLORS: Record<TidalCreekMonitorData['status'], { label: string; color: string; bgClass: string }> = {
  flooding: { label: 'Flooding', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  ebbing: { label: 'Ebbing', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  neap: { label: 'Neap', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  spring: { label: 'Spring', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: TidalCreekMonitorData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TidalCreekMonitor() {
  const state = useMapStore((s) => s.tidalCreekMonitor)
  const setState = useMapStore((s) => s.setTidalCreekMonitor)

  const items = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return items.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [items, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalCreeks: 0, avgTidalRange: 0, avgSalinity: 0, activeCount: 0 }
    }
    const avgTidalRange = +(filteredItems.reduce((sum, e) => sum + e.tidalRange, 0) / filteredItems.length).toFixed(1)
    const avgSalinity = Math.round(filteredItems.reduce((sum, e) => sum + e.salinity, 0) / filteredItems.length)
    const activeCount = filteredItems.filter((e) => e.status === 'flooding' || e.status === 'spring').length
    return {
      totalCreeks: filteredItems.length,
      avgTidalRange,
      avgSalinity,
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => items.find((e) => e.id === state.activeItemId) ?? null,
    [items, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, tidalRange: e.tidalRange },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setTidalCreekMonitor({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TidalCreekMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTidalRange', label: 'Tidal Range', icon: WavesIcon17 },
    { key: 'showCreekDepth', label: 'Creek Depth', icon: Ruler },
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-green-950/95 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <WavesIcon17 className="h-4 w-4 text-teal-400" />
              Tidal Creek Monitor
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-teal-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as TidalCreekMonitorState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="flooding">Flooding</SelectItem>
                <SelectItem value="ebbing">Ebbing</SelectItem>
                <SelectItem value="neap">Neap</SelectItem>
                <SelectItem value="spring">Spring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">Display Options</Label>
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

          <Separator className="bg-teal-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Total Creeks</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalCreeks}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Tidal Range</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgTidalRange}</div>
              <div className="text-[9px] text-teal-400/60">m</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Salinity</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgSalinity}</div>
              <div className="text-[9px] text-teal-400/60">ppt</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Active</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeCount}</div>
              <div className="text-[9px] text-teal-400/60">creeks</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Creeks ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-teal-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showTidalRange && (
                          <div>
                            Tidal Range:{' '}
                            <span className="text-teal-100 font-medium">{e.tidalRange} m</span>
                          </div>
                        )}
                        {state.showCreekDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-teal-100 font-medium">{e.creekDepth} m</span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-teal-100 font-medium">{e.salinity} ppt</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No creeks match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-teal-700/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-teal-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400/70">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Tidal Range: </span>
                    <span className="font-medium text-green-400">{activeItem.tidalRange} m</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Depth: </span>
                    <span className="font-medium text-orange-400">{activeItem.creekDepth} m</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Salinity: </span>
                    <span className="font-medium text-teal-400">{activeItem.salinity} ppt</span>
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
