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
import { useMapStore, type CalcicHorizonState, type CalcicHorizonData } from '@/lib/map-store'
import { Mountain as MountainIcon15, X, FlaskConical, ArrowDown, CircleDot, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CalcicHorizonData[] = [
  {
    id: 'ch-newmexico',
    name: 'New Mexico Calcic',
    lat: 34.0000,
    lng: -106.0000,
    caco3Content: 45,
    horizonDepth: 60,
    noduleDensity: 25,
    status: 'indurated',
    description: 'Hard petrocalcic horizon in desert',
  },
  {
    id: 'ch-spain',
    name: 'Spanish Calcrete',
    lat: 38.0000,
    lng: -2.0000,
    caco3Content: 30,
    horizonDepth: 45,
    noduleDensity: 15,
    status: 'cemented',
    description: 'Cemented calcrete in semi-arid zone',
  },
  {
    id: 'ch-morocco',
    name: 'Moroccan Calcisol',
    lat: 33.0000,
    lng: -5.0000,
    caco3Content: 15,
    horizonDepth: 80,
    noduleDensity: 8,
    status: 'developing',
    description: 'Developing calcic horizon',
  },
  {
    id: 'ch-argentina',
    name: 'Argentina Calcrete',
    lat: -33.0000,
    lng: -66.0000,
    caco3Content: 5,
    horizonDepth: 120,
    noduleDensity: 2,
    status: 'incipient',
    description: 'Early stage calcic accumulation',
  },
]

const STATUS_COLORS: Record<CalcicHorizonData['status'], { label: string; color: string; bgClass: string }> = {
  indurated: { label: 'Indurated', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  cemented: { label: 'Cemented', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  developing: { label: 'Developing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  incipient: { label: 'Incipient', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: CalcicHorizonData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CalcicHorizonMonitor() {
  const state = useMapStore((s) => s.calcicHorizon)
  const setState = useMapStore((s) => s.setCalcicHorizon)

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
      return { totalPaths: 0, avgCaco3Content: 0, avgHorizonDepth: 0, induratedCementedCount: 0 }
    }
    const avgCaco3Content = filteredItems.reduce((sum, e) => sum + e.caco3Content, 0) / filteredItems.length
    const avgHorizonDepth = filteredItems.reduce((sum, e) => sum + e.horizonDepth, 0) / filteredItems.length
    const induratedCementedCount = filteredItems.filter((e) => e.status === 'indurated' || e.status === 'cemented').length
    return {
      totalPaths: filteredItems.length,
      avgCaco3Content: Math.round(avgCaco3Content * 10) / 10,
      avgHorizonDepth: Math.round(avgHorizonDepth * 10) / 10,
      induratedCementedCount,
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
      properties: { id: e.id, name: e.name, status: e.status, caco3Content: e.caco3Content },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCalcicHorizon({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CalcicHorizonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCaco3Content', label: 'CaCO3 Content', icon: FlaskConical },
    { key: 'showHorizonDepth', label: 'Horizon Depth', icon: ArrowDown },
    { key: 'showNoduleDensity', label: 'Nodule Density', icon: CircleDot },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-amber-950/95 backdrop-blur-xl border border-stone-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <MountainIcon15 className="h-4 w-4 text-stone-400" />
              Calcic Horizon Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-300 hover:text-stone-100 hover:bg-stone-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-stone-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-stone-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as CalcicHorizonState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="indurated">Indurated</SelectItem>
                <SelectItem value="cemented">Cemented</SelectItem>
                <SelectItem value="developing">Developing</SelectItem>
                <SelectItem value="incipient">Incipient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-200">
                  <Icon className="h-3 w-3 text-stone-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-stone-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-stone-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg CaCO3</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgCaco3Content}%</div>
              <div className="text-[9px] text-stone-400/60">content</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Horizon Depth</div>
              <div className="text-sm font-semibold text-stone-400">{summary.avgHorizonDepth}</div>
              <div className="text-[9px] text-stone-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Indurated+Cemented</div>
              <div className="text-sm font-semibold text-red-400">{summary.induratedCementedCount}</div>
              <div className="text-[9px] text-stone-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">
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
                          ? 'border-stone-500/50 bg-stone-800/30'
                          : 'border-stone-700/30 hover:border-stone-500/30 hover:bg-stone-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-stone-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300/60">
                        {state.showCaco3Content && (
                          <div>
                            CaCO3:{' '}
                            <span className="text-stone-100 font-medium">{e.caco3Content}%</span>
                          </div>
                        )}
                        {state.showHorizonDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-stone-100 font-medium">{e.horizonDepth} cm</span>
                          </div>
                        )}
                        {state.showNoduleDensity && (
                          <div>
                            Nodule Dens.:{' '}
                            <span className="text-stone-100 font-medium">{e.noduleDensity}/dm2</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-stone-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-stone-600/30 bg-stone-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-stone-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400/70">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">CaCO3: </span>
                    <span className="font-medium text-amber-400">{activeItem.caco3Content}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Horizon Depth: </span>
                    <span className="font-medium text-stone-400">{activeItem.horizonDepth} cm</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Nodule Dens.: </span>
                    <span className="font-medium text-red-400">{activeItem.noduleDensity}/dm2</span>
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
