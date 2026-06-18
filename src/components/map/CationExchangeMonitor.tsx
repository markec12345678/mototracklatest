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
import { useMapStore, type CationExchangeState, type CationExchangeData } from '@/lib/map-store'
import { FlaskConical as FlaskConicalIcon2, X, TrendingUp, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CationExchangeData[] = [
  {
    id: 'ce-andisol',
    name: 'Japanese Andisol',
    lat: 36.3000,
    lng: 138.4000,
    cec: 35,
    baseSaturation: 72,
    phLevel: 6.2,
    status: 'fertile',
    description: 'Volcanic ash soil with high CEC',
  },
  {
    id: 'ce-oxisol',
    name: 'Brazilian Oxisol',
    lat: -15.0000,
    lng: -47.0000,
    cec: 8,
    baseSaturation: 25,
    phLevel: 4.5,
    status: 'low',
    description: 'Highly weathered low-CEC soil',
  },
  {
    id: 'ce-mollisol',
    name: 'US Mollisol',
    lat: 41.0000,
    lng: -96.0000,
    cec: 25,
    baseSaturation: 65,
    phLevel: 6.8,
    status: 'adequate',
    description: 'Prairie soil moderate CEC',
  },
  {
    id: 'ce-spodic',
    name: 'Scandinavian Spodosol',
    lat: 62.0000,
    lng: 15.0000,
    cec: 4,
    baseSaturation: 12,
    phLevel: 3.8,
    status: 'degraded',
    description: 'Acidic low-base spodosol',
  },
]

const STATUS_COLORS: Record<CationExchangeData['status'], { label: string; color: string; bgClass: string }> = {
  fertile: { label: 'Fertile', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  adequate: { label: 'Adequate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  low: { label: 'Low', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: CationExchangeData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CationExchangeMonitor() {
  const state = useMapStore((s) => s.cationExchange)
  const setState = useMapStore((s) => s.setCationExchange)

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
      return { totalPaths: 0, avgCec: 0, avgBaseSaturation: 0, lowDegradedCount: 0 }
    }
    const avgCec = filteredItems.reduce((sum, e) => sum + e.cec, 0) / filteredItems.length
    const avgBaseSaturation = filteredItems.reduce((sum, e) => sum + e.baseSaturation, 0) / filteredItems.length
    const lowDegradedCount = filteredItems.filter((e) => e.status === 'low' || e.status === 'degraded').length
    return {
      totalPaths: filteredItems.length,
      avgCec: Math.round(avgCec * 10) / 10,
      avgBaseSaturation: Math.round(avgBaseSaturation * 10) / 10,
      lowDegradedCount,
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
      properties: { id: e.id, name: e.name, status: e.status, cec: e.cec },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCationExchange({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CationExchangeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCec', label: 'CEC', icon: FlaskConicalIcon2 },
    { key: 'showBaseSaturation', label: 'Base Saturation', icon: TrendingUp },
    { key: 'showPhLevel', label: 'pH Level', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-orange-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <FlaskConicalIcon2 className="h-4 w-4 text-amber-400" />
              Cation Exchange Monitor
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
                setState({ statusFilter: v as CationExchangeState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="fertile">Fertile</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
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
              <div className="text-[10px] text-amber-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg CEC</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgCec}</div>
              <div className="text-[9px] text-amber-400/60">cmol/kg</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Base Sat.</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgBaseSaturation}%</div>
              <div className="text-[9px] text-amber-400/60">saturation</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Low+Degraded</div>
              <div className="text-sm font-semibold text-red-400">{summary.lowDegradedCount}</div>
              <div className="text-[9px] text-amber-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
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
                        {state.showCec && (
                          <div>
                            CEC:{' '}
                            <span className="text-amber-100 font-medium">{e.cec} cmol/kg</span>
                          </div>
                        )}
                        {state.showBaseSaturation && (
                          <div>
                            Base Sat.:{' '}
                            <span className="text-amber-100 font-medium">{e.baseSaturation}%</span>
                          </div>
                        )}
                        {state.showPhLevel && (
                          <div>
                            pH:{' '}
                            <span className="text-amber-100 font-medium">{e.phLevel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No sites match the current filter.
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
                    <span className="text-amber-400/70">CEC: </span>
                    <span className="font-medium text-orange-400">{activeItem.cec} cmol/kg</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Base Sat.: </span>
                    <span className="font-medium text-amber-400">{activeItem.baseSaturation}%</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">pH: </span>
                    <span className="font-medium text-red-400">{activeItem.phLevel}</span>
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
