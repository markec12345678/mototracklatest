'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Grid3x3 as GridIcon, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'hf-amazon',
    name: 'Amazon Edge',
    lat: -3.500,
    lng: -60.000,
    patchCount: 1842,
    avgPatchHa: 95,
    connectivity: 28,
    edgeDensity: 12.4,
    status: 'critical',
    description: 'Severe forest fragmentation along Amazon deforestation frontier isolating wildlife populations',
  },
  {
    id: 'hf-boreal',
    name: 'Boreal Fragment',
    lat: 60.000,
    lng: -110.000,
    patchCount: 2310,
    avgPatchHa: 420,
    connectivity: 48,
    edgeDensity: 6.8,
    status: 'warning',
    description: 'Boreal forest fragmentation from logging and oil extraction creating isolated habitat patches',
  },
  {
    id: 'hf-savanna',
    name: 'African Savanna',
    lat: -2.000,
    lng: 35.000,
    patchCount: 980,
    avgPatchHa: 680,
    connectivity: 55,
    edgeDensity: 4.2,
    status: 'moderate',
    description: 'Savanna habitat fragmentation from agricultural expansion disrupting migratory wildlife routes',
  },
  {
    id: 'hf-seasia',
    name: 'SE Asia Forest',
    lat: 2.000,
    lng: 110.000,
    patchCount: 1525,
    avgPatchHa: 62,
    connectivity: 18,
    edgeDensity: 18.6,
    status: 'critical',
    description: 'Highly fragmented tropical forest landscapes in Southeast Asia from palm oil and logging',
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

export function HabitatFragmentationMonitor() {
  const state = useMapStore((s) => s.habitatFragmentation)
  const setState = useMapStore((s) => s.setHabitatFragmentation)

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
      return { totalPatches: 0, avgPatchHa: 0, avgConnectivity: 0, avgEdge: 0 }
    }
    const totalPatches = filteredItems.reduce((sum, e) => sum + (e.patchCount as number), 0)
    const avgPatchHa = filteredItems.reduce((sum, e) => sum + (e.avgPatchHa as number), 0) / filteredItems.length
    const avgConnectivity = filteredItems.reduce((sum, e) => sum + (e.connectivity as number), 0) / filteredItems.length
    const avgEdge = filteredItems.reduce((sum, e) => sum + (e.edgeDensity as number), 0) / filteredItems.length
    return {
      totalPatches: Math.round(totalPatches).toLocaleString(),
      avgPatchHa: Math.round(avgPatchHa),
      avgConnectivity: avgConnectivity.toFixed(0),
      avgEdge: avgEdge.toFixed(1),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setHabitatFragmentation({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-600/95 to-yellow-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <GridIcon className="h-4 w-4 text-amber-200" />
              Habitat Fragmentation Monitor
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
              <div className="text-[10px] text-slate-400/70">Patch Count</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalPatches}</div>
              <div className="text-[9px] text-slate-400/60">total patches</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Patch</div>
              <div className="text-sm font-semibold text-yellow-200">{summary.avgPatchHa}</div>
              <div className="text-[9px] text-slate-400/60">ha average</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Connectivity</div>
              <div className="text-sm font-semibold text-orange-200">{summary.avgConnectivity}%</div>
              <div className="text-[9px] text-slate-400/60">avg index</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Edge Density</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgEdge}</div>
              <div className="text-[9px] text-slate-400/60">m/ha avg</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Fragmentation Sites ({filteredItems.length})
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
                          Patches: <span className="text-slate-100 font-medium">{(e.patchCount as number).toLocaleString()}</span>
                        </div>
                        <div>
                          Avg Patch: <span className="text-slate-100 font-medium">{e.avgPatchHa} ha</span>
                        </div>
                        <div>
                          Connectivity: <span className="text-slate-100 font-medium">{e.connectivity}%</span>
                        </div>
                        <div>
                          Edge: <span className="text-slate-100 font-medium">{e.edgeDensity} m/ha</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No sites match the current filter.
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
                    <span className="text-slate-400/70">Patches: </span>
                    <span className="font-medium text-amber-200">{(activeItem.patchCount as number).toLocaleString()}</span>
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
