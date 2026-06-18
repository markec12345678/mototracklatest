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
import { useMapStore, type SeawallErosionState, type SeawallErosionData } from '@/lib/map-store'
import { Waves as WavesIcon20, X, TrendingDown, ArrowDown, Ruler, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SeawallErosionData[] = [
  {
    id: 'se-brighton',
    name: 'Brighton Seawall',
    lat: 50.82,
    lng: -0.14,
    erosionRate: 12.5,
    scourDepth: 2.8,
    wallDisplacement: 45,
    status: 'eroding',
    description: 'English Channel seawall under erosion',
  },
  {
    id: 'se-miami',
    name: 'Miami Beach Seawall',
    lat: 25.77,
    lng: -80.13,
    erosionRate: 35.0,
    scourDepth: 4.5,
    wallDisplacement: 120,
    status: 'failing',
    description: 'Critical seawall condition in Florida',
  },
  {
    id: 'se-odawara',
    name: 'Odawara Seawall',
    lat: 35.2567,
    lng: 139.1533,
    erosionRate: 3.2,
    scourDepth: 1.0,
    wallDisplacement: 8,
    status: 'stable',
    description: 'Well-maintained Japanese seawall',
  },
  {
    id: 'se-gold',
    name: 'Gold Coast Seawall',
    lat: -28.0,
    lng: 153.43,
    erosionRate: 0.5,
    scourDepth: 0.3,
    wallDisplacement: 2,
    status: 'reinforced',
    description: 'Recently reinforced coastal wall',
  },
]

const STATUS_COLORS: Record<SeawallErosionData['status'], { label: string; color: string; bgClass: string }> = {
  failing: { label: 'Failing', color: '#dc2626', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  eroding: { label: 'Eroding', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  reinforced: { label: 'Reinforced', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
}

function TrendIcon({ status }: { status: SeawallErosionData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SeawallErosionMonitor() {
  const state = useMapStore((s) => s.seawallErosion)
  const setState = useMapStore((s) => s.setSeawallErosion)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalPaths: 0, avgErosionRate: 0, avgScourDepth: 0, failingErodingCount: 0 }
    }
    const avgErosionRate = filteredItems.reduce((sum, e) => sum + e.erosionRate, 0) / filteredItems.length
    const avgScourDepth = filteredItems.reduce((sum, e) => sum + e.scourDepth, 0) / filteredItems.length
    const failingErodingCount = filteredItems.filter((e) => e.status === 'failing' || e.status === 'eroding').length
    return {
      totalPaths: filteredItems.length,
      avgErosionRate: Math.round(avgErosionRate * 10) / 10,
      avgScourDepth: Math.round(avgScourDepth * 10) / 10,
      failingErodingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, erosionRate: e.erosionRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSeawallErosion({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeawallErosionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showErosionRate', label: 'Erosion Rate', icon: TrendingDown },
    { key: 'showScourDepth', label: 'Scour Depth', icon: ArrowDown },
    { key: 'showWallDisplacement', label: 'Wall Displacement', icon: Ruler },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-cyan-950/95 backdrop-blur-xl border border-teal-700/30 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <WavesIcon20 className="h-4 w-4 text-teal-400" />
              Seawall Erosion Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as SeawallErosionState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="failing">Failing</SelectItem>
                <SelectItem value="eroding">Eroding</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="reinforced">Reinforced</SelectItem>
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
              <div className="text-[10px] text-teal-400/70">Total Seawalls</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Erosion Rate</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgErosionRate}</div>
              <div className="text-[9px] text-teal-400/60">mm/yr</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Scour Depth</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgScourDepth}</div>
              <div className="text-[9px] text-teal-400/60">m</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Failing+Eroding</div>
              <div className="text-sm font-semibold text-red-400">{summary.failingErodingCount}</div>
              <div className="text-[9px] text-teal-400/60">structures</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Seawalls ({filteredItems.length})
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
                        {state.showErosionRate && (
                          <div>
                            Erosion:{' '}
                            <span className="text-teal-100 font-medium">{e.erosionRate} mm/yr</span>
                          </div>
                        )}
                        {state.showScourDepth && (
                          <div>
                            Scour:{' '}
                            <span className="text-teal-100 font-medium">{e.scourDepth} m</span>
                          </div>
                        )}
                        {state.showWallDisplacement && (
                          <div>
                            Displacement:{' '}
                            <span className="text-teal-100 font-medium">{e.wallDisplacement} mm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No seawalls match the current filter.
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
                    <span className="text-teal-400/70">Erosion Rate: </span>
                    <span className="font-medium text-cyan-400">{activeItem.erosionRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Scour Depth: </span>
                    <span className="font-medium text-teal-400">{activeItem.scourDepth} m</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Displacement: </span>
                    <span className="font-medium text-red-400">{activeItem.wallDisplacement} mm</span>
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
