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
import { useMapStore, type OreReserveEstimateState, type OreReserveEstimateData } from '@/lib/map-store'
import { Database as DatabaseIcon2, X, TrendingUp, Gem, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: OreReserveEstimateData[] = [
  {
    id: 'ore-olympic',
    name: 'Olympic Dam Reserve',
    lat: -30.4400,
    lng: 136.8900,
    provenReserve: 2800,
    probableReserve: 1800,
    resourceGrade: 1.2,
    status: 'proven',
    description: 'Large proven copper-uranium reserve',
  },
  {
    id: 'ore-Grasberg',
    name: 'Grasberg Reserve',
    lat: -4.0500,
    lng: 137.1000,
    provenReserve: 1500,
    probableReserve: 2200,
    resourceGrade: 0.95,
    status: 'probable',
    description: 'Major probable copper-gold reserve',
  },
  {
    id: 'ore-kamoa',
    name: 'Kamoa-Kakula',
    lat: -10.7700,
    lng: 26.0800,
    provenReserve: 400,
    probableReserve: 800,
    resourceGrade: 3.5,
    status: 'inferred',
    description: 'Inferred high-grade copper reserve',
  },
  {
    id: 'ore-nevada',
    name: 'Nevada Lithium Basin',
    lat: 40.5000,
    lng: -117.5000,
    provenReserve: 50,
    probableReserve: 120,
    resourceGrade: 0.8,
    status: 'exploration',
    description: 'Early-stage lithium exploration',
  },
]

const STATUS_COLORS: Record<OreReserveEstimateData['status'], { label: string; color: string; bgClass: string }> = {
  proven: { label: 'Proven', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  probable: { label: 'Probable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  inferred: { label: 'Inferred', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  exploration: { label: 'Exploration', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

function TrendIcon({ status }: { status: OreReserveEstimateData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function OreReserveEstimateMonitor() {
  const state = useMapStore((s) => s.oreReserveEstimate)
  const setState = useMapStore((s) => s.setOreReserveEstimate)

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
      return { totalPaths: 0, avgProvenReserve: 0, avgProbableReserve: 0, avgResourceGrade: 0 }
    }
    const avgProvenReserve = filteredItems.reduce((sum, e) => sum + e.provenReserve, 0) / filteredItems.length
    const avgProbableReserve = filteredItems.reduce((sum, e) => sum + e.probableReserve, 0) / filteredItems.length
    const avgResourceGrade = filteredItems.reduce((sum, e) => sum + e.resourceGrade, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgProvenReserve: Math.round(avgProvenReserve),
      avgProbableReserve: Math.round(avgProbableReserve),
      avgResourceGrade: Math.round(avgResourceGrade * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, provenReserve: e.provenReserve },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setOreReserveEstimate({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OreReserveEstimateState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showProvenReserve', label: 'Proven Reserve', icon: DatabaseIcon2 },
    { key: 'showProbableReserve', label: 'Probable Reserve', icon: TrendingUp },
    { key: 'showResourceGrade', label: 'Resource Grade', icon: Gem },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-blue-950/95 backdrop-blur-xl border border-indigo-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-indigo-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-100">
              <DatabaseIcon2 className="h-4 w-4 text-indigo-400" />
              Ore Reserve Estimate Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-indigo-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-indigo-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as OreReserveEstimateState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-indigo-900/40 border-indigo-700/40 text-indigo-100 hover:bg-indigo-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="proven">Proven</SelectItem>
                <SelectItem value="probable">Probable</SelectItem>
                <SelectItem value="inferred">Inferred</SelectItem>
                <SelectItem value="exploration">Exploration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                  <Icon className="h-3 w-3 text-indigo-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-indigo-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-indigo-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-indigo-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Proven</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgProvenReserve}</div>
              <div className="text-[9px] text-indigo-400/60">Mt</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Probable</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgProbableReserve}</div>
              <div className="text-[9px] text-indigo-400/60">Mt</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Grade</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgResourceGrade}</div>
              <div className="text-[9px] text-indigo-400/60">%</div>
            </div>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">
              Sites ({filteredItems.length})
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
                          ? 'border-indigo-500/50 bg-indigo-800/30'
                          : 'border-indigo-700/30 hover:border-indigo-500/30 hover:bg-indigo-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-indigo-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-indigo-300/60">
                        {state.showProvenReserve && (
                          <div>
                            Proven:{' '}
                            <span className="text-indigo-100 font-medium">{e.provenReserve} Mt</span>
                          </div>
                        )}
                        {state.showProbableReserve && (
                          <div>
                            Probable:{' '}
                            <span className="text-indigo-100 font-medium">{e.probableReserve} Mt</span>
                          </div>
                        )}
                        {state.showResourceGrade && (
                          <div>
                            Grade:{' '}
                            <span className="text-indigo-100 font-medium">{e.resourceGrade}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-indigo-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-indigo-700/30" />
              <div className="space-y-2 rounded-lg border border-indigo-600/30 bg-indigo-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-indigo-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-indigo-400/70">Coordinates: </span>
                    <span className="font-medium text-indigo-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Proven: </span>
                    <span className="font-medium text-blue-400">{activeItem.provenReserve} Mt</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Probable: </span>
                    <span className="font-medium text-indigo-400">{activeItem.probableReserve} Mt</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Grade: </span>
                    <span className="font-medium text-green-400">{activeItem.resourceGrade}%</span>
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
