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
import { useMapStore, type GroinSedimentState, type GroinSedimentData } from '@/lib/map-store'
import { ArrowRightLeft as ArrowRightLeftIcon, X, TrendingUp, Ruler, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: GroinSedimentData[] = [
  {
    id: 'gs-outerbanks',
    name: 'Outer Banks Groin',
    lat: 36.05,
    lng: -75.67,
    accretionRate: 850,
    bypassRate: 320,
    updriftWidth: 85,
    status: 'accreting',
    description: 'Active sediment accretion updrift',
  },
  {
    id: 'gs-longisland',
    name: 'Long Island Groin Field',
    lat: 40.75,
    lng: -73.0,
    accretionRate: 450,
    bypassRate: 600,
    updriftWidth: 42,
    status: 'bypassing',
    description: 'Sediment bypassing groin system',
  },
  {
    id: 'gs-blackpool',
    name: 'Blackpool Groin',
    lat: 53.81,
    lng: -3.05,
    accretionRate: 200,
    bypassRate: 210,
    updriftWidth: 30,
    status: 'equilibrium',
    description: 'Balanced sediment transport',
  },
  {
    id: 'gs-surfers',
    name: 'Surfers Paradise Groin',
    lat: -28.0028,
    lng: 153.429,
    accretionRate: 50,
    bypassRate: 500,
    updriftWidth: 12,
    status: 'eroding',
    description: 'Down-drift erosion observed',
  },
]

const STATUS_COLORS: Record<GroinSedimentData['status'], { label: string; color: string; bgClass: string }> = {
  accreting: { label: 'Accreting', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  bypassing: { label: 'Bypassing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  equilibrium: { label: 'Equilibrium', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  eroding: { label: 'Eroding', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: GroinSedimentData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GroinSedimentMonitor() {
  const state = useMapStore((s) => s.groinSediment)
  const setState = useMapStore((s) => s.setGroinSediment)

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
      return { totalPaths: 0, avgAccretionRate: 0, avgBypassRate: 0, erodingCount: 0 }
    }
    const avgAccretionRate = filteredItems.reduce((sum, e) => sum + e.accretionRate, 0) / filteredItems.length
    const avgBypassRate = filteredItems.reduce((sum, e) => sum + e.bypassRate, 0) / filteredItems.length
    const erodingCount = filteredItems.filter((e) => e.status === 'eroding').length
    return {
      totalPaths: filteredItems.length,
      avgAccretionRate: Math.round(avgAccretionRate * 10) / 10,
      avgBypassRate: Math.round(avgBypassRate * 10) / 10,
      erodingCount,
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
      properties: { id: e.id, name: e.name, status: e.status, accretionRate: e.accretionRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setGroinSediment({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GroinSedimentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAccretionRate', label: 'Accretion Rate', icon: TrendingUp },
    { key: 'showBypassRate', label: 'Bypass Rate', icon: ArrowRightLeftIcon },
    { key: 'showUpdriftWidth', label: 'Updrift Width', icon: Ruler },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-amber-700/30 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <ArrowRightLeftIcon className="h-4 w-4 text-amber-400" />
              Groin Sediment Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-amber-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as GroinSedimentState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="accreting">Accreting</SelectItem>
                <SelectItem value="bypassing">Bypassing</SelectItem>
                <SelectItem value="equilibrium">Equilibrium</SelectItem>
                <SelectItem value="eroding">Eroding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
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

          <Separator className="bg-amber-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Groins</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Accretion</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgAccretionRate}</div>
              <div className="text-[9px] text-amber-400/60">m3/yr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Bypass Rate</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgBypassRate}</div>
              <div className="text-[9px] text-amber-400/60">m3/yr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Eroding</div>
              <div className="text-sm font-semibold text-red-400">{summary.erodingCount}</div>
              <div className="text-[9px] text-amber-400/60">structures</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Groins ({filteredItems.length})
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
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-amber-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showAccretionRate && (
                          <div>
                            Accretion:{' '}
                            <span className="text-amber-100 font-medium">{e.accretionRate} m3/yr</span>
                          </div>
                        )}
                        {state.showBypassRate && (
                          <div>
                            Bypass:{' '}
                            <span className="text-amber-100 font-medium">{e.bypassRate} m3/yr</span>
                          </div>
                        )}
                        {state.showUpdriftWidth && (
                          <div>
                            Updrift:{' '}
                            <span className="text-amber-100 font-medium">{e.updriftWidth} m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No groins match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-amber-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Accretion: </span>
                    <span className="font-medium text-yellow-400">{activeItem.accretionRate} m3/yr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Bypass Rate: </span>
                    <span className="font-medium text-amber-400">{activeItem.bypassRate} m3/yr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Updrift Width: </span>
                    <span className="font-medium text-red-400">{activeItem.updriftWidth} m</span>
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
