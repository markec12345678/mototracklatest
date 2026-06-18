'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Route as RouteIcon5, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'wc-y2y',
    name: 'Yellowstone to Yukon',
    lat: 54.000,
    lng: -110.000,
    corridorLength: 3200,
    widthKm: 580,
    speciesUsing: 62,
    qualityPct: 78,
    status: 'stable',
    description: 'Premier transboundary wildlife corridor connecting Yellowstone to Yukon for wide-ranging species',
  },
  {
    id: 'wc-europeangreenbelt',
    name: 'European Green Belt',
    lat: 50.000,
    lng: 20.000,
    corridorLength: 12500,
    widthKm: 95,
    speciesUsing: 88,
    qualityPct: 65,
    status: 'moderate',
    description: 'Ecological network following the former Iron Curtain preserving biodiversity across 24 countries',
  },
  {
    id: 'wc-serengeti',
    name: 'Serengeti Migration',
    lat: -2.000,
    lng: 35.000,
    corridorLength: 1800,
    widthKm: 280,
    speciesUsing: 45,
    qualityPct: 82,
    status: 'stable',
    description: 'Critical ungulate migration corridor supporting the great Serengeti wildebeest migration',
  },
  {
    id: 'wc-cerrado',
    name: 'Brazilian Cerrado',
    lat: -15.000,
    lng: -50.000,
    corridorLength: 950,
    widthKm: 165,
    speciesUsing: 38,
    qualityPct: 42,
    status: 'warning',
    description: 'Threatened Cerrado savanna wildlife corridors facing agricultural conversion and fragmentation',
  },
]

const STATUS_COLORS: Record<string, { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.stable
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function WildlifeCorridorMapTrack() {
  const state = useMapStore((s) => s.wildlifeCorridorMapTrack)
  const setState = useMapStore((s) => s.setWildlifeCorridorMapTrack)

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
      return { totalLength: 0, avgWidth: 0, totalSpecies: 0, avgQuality: 0 }
    }
    const totalLength = filteredItems.reduce((sum, e) => sum + (e.corridorLength as number), 0)
    const avgWidth = filteredItems.reduce((sum, e) => sum + (e.widthKm as number), 0) / filteredItems.length
    const totalSpecies = filteredItems.reduce((sum, e) => sum + (e.speciesUsing as number), 0)
    const avgQuality = filteredItems.reduce((sum, e) => sum + (e.qualityPct as number), 0) / filteredItems.length
    return {
      totalLength: Math.round(totalLength).toLocaleString(),
      avgWidth: avgWidth.toFixed(0),
      totalSpecies: Math.round(totalSpecies),
      avgQuality: avgQuality.toFixed(0),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setWildlifeCorridorMapTrack({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-600/95 to-lime-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <RouteIcon5 className="h-4 w-4 text-green-200" />
              Wildlife Corridor Map
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
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <select
              className="mt-1 w-full h-8 text-xs bg-slate-900/40 border border-slate-700/40 rounded-md px-2 text-slate-100"
              value={state.statusFilter || 'all'}
              onChange={(e) => setState({ statusFilter: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="moderate">Moderate</option>
              <option value="stable">Stable</option>
            </select>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Corridor Length</div>
              <div className="text-sm font-semibold text-green-200">{summary.totalLength}</div>
              <div className="text-[9px] text-slate-400/60">km total</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Width</div>
              <div className="text-sm font-semibold text-lime-200">{summary.avgWidth}</div>
              <div className="text-[9px] text-slate-400/60">km avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Species Using</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalSpecies}</div>
              <div className="text-[9px] text-slate-400/60">total species</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Quality</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgQuality}%</div>
              <div className="text-[9px] text-slate-400/60">avg integrity</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Wildlife Corridors ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status as string] ?? STATUS_COLORS.stable
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status as string} />
                          <span className="text-xs font-medium text-slate-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        <div>
                          Length: <span className="text-slate-100 font-medium">{(e.corridorLength as number).toLocaleString()} km</span>
                        </div>
                        <div>
                          Width: <span className="text-slate-100 font-medium">{e.widthKm} km</span>
                        </div>
                        <div>
                          Species: <span className="text-slate-100 font-medium">{e.speciesUsing}</span>
                        </div>
                        <div>
                          Quality: <span className="text-slate-100 font-medium">{e.qualityPct}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No corridors match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status as string]?.bgClass ?? STATUS_COLORS.stable.bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status as string]?.label ?? 'Stable'}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description as string}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {(activeItem.lat as number).toFixed(2)}, {(activeItem.lng as number).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Length: </span>
                    <span className="font-medium text-green-200">{(activeItem.corridorLength as number).toLocaleString()} km</span>
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
