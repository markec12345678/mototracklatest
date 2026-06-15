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
import { useMapStore, type CaveDripMonitorState, type CaveDripMonitorData } from '@/lib/map-store'
import { Droplets as DropletsIcon14, X, Beaker, FlaskConical, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CaveDripMonitorData[] = [
  {
    id: 'cd-carlsbad',
    name: 'Carlsbad Caverns Drip',
    lat: 32.175,
    lng: -104.445,
    dripRate: 12,
    calciumConcentration: 85,
    pHDrip: 7.8,
    status: 'active',
    description: 'Active stalactite drip site',
  },
  {
    id: 'cd-postojna-drip',
    name: 'Postojna Drip Station',
    lat: 45.7833,
    lng: 14.2167,
    dripRate: 5,
    calciumConcentration: 62,
    pHDrip: 7.2,
    status: 'slow',
    description: 'Reduced drip rate monitoring',
  },
  {
    id: 'cd-mammoth',
    name: 'Mammoth Cave Drip',
    lat: 37.1867,
    lng: -86.1,
    dripRate: 0,
    calciumConcentration: 45,
    pHDrip: 6.8,
    status: 'dry',
    description: 'Seasonal drip cessation',
  },
  {
    id: 'cd-jeita',
    name: 'Jeita Grotto Drip',
    lat: 33.9433,
    lng: 35.64,
    dripRate: 18,
    calciumConcentration: 120,
    pHDrip: 5.5,
    status: 'contaminated',
    description: 'Elevated calcium from runoff',
  },
]

const STATUS_COLORS: Record<CaveDripMonitorData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  slow: { label: 'Slow', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  dry: { label: 'Dry', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  contaminated: { label: 'Contaminated', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: CaveDripMonitorData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CaveDripMonitorPanel() {
  const state = useMapStore((s) => s.caveDripMonitor)
  const setState = useMapStore((s) => s.setCaveDripMonitor)

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
      return { totalSites: 0, avgDripRate: 0, avgCalcium: 0, activeCount: 0 }
    }
    const avgDripRate = +(filteredItems.reduce((sum, e) => sum + e.dripRate, 0) / filteredItems.length).toFixed(1)
    const avgCalcium = Math.round(filteredItems.reduce((sum, e) => sum + e.calciumConcentration, 0) / filteredItems.length)
    const activeCount = filteredItems.filter((e) => e.status === 'active').length
    return {
      totalSites: filteredItems.length,
      avgDripRate,
      avgCalcium,
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
      properties: { id: e.id, name: e.name, status: e.status, dripRate: e.dripRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCaveDripMonitor({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CaveDripMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDripRate', label: 'Drip Rate', icon: DropletsIcon14 },
    { key: 'showCalciumConcentration', label: 'Calcium Concentration', icon: Beaker },
    { key: 'showPHDrip', label: 'pH (Drip)', icon: FlaskConical },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-950/95 to-indigo-950/95 backdrop-blur-xl border border-purple-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-100">
              <DropletsIcon14 className="h-4 w-4 text-purple-400" />
              Cave Drip Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-purple-300 hover:text-purple-100 hover:bg-purple-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-purple-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-purple-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as CaveDripMonitorState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-purple-900/40 border-purple-700/40 text-purple-100 hover:bg-purple-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="dry">Dry</SelectItem>
                <SelectItem value="contaminated">Contaminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-purple-200">
                  <Icon className="h-3 w-3 text-purple-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-purple-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-purple-200">{summary.totalSites}</div>
              <div className="text-[9px] text-purple-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Avg Drip Rate</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgDripRate}</div>
              <div className="text-[9px] text-purple-400/60">drips/min</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Avg Calcium</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgCalcium}</div>
              <div className="text-[9px] text-purple-400/60">mg/L</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Active</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeCount}</div>
              <div className="text-[9px] text-purple-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300/80">
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
                          ? 'border-purple-500/50 bg-purple-800/30'
                          : 'border-purple-700/30 hover:border-purple-500/30 hover:bg-purple-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-purple-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-purple-300/60">
                        {state.showDripRate && (
                          <div>
                            Drip Rate:{' '}
                            <span className="text-purple-100 font-medium">{e.dripRate} drips/min</span>
                          </div>
                        )}
                        {state.showCalciumConcentration && (
                          <div>
                            Calcium:{' '}
                            <span className="text-purple-100 font-medium">{e.calciumConcentration} mg/L</span>
                          </div>
                        )}
                        {state.showPHDrip && (
                          <div>
                            pH:{' '}
                            <span className="text-purple-100 font-medium">{e.pHDrip} pH</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-purple-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-purple-700/30" />
              <div className="space-y-2 rounded-lg border border-purple-600/30 bg-purple-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-purple-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-purple-400/70">Coordinates: </span>
                    <span className="font-medium text-purple-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Drip Rate: </span>
                    <span className="font-medium text-indigo-400">{activeItem.dripRate} drips/min</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Calcium: </span>
                    <span className="font-medium text-orange-400">{activeItem.calciumConcentration} mg/L</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">pH: </span>
                    <span className="font-medium text-purple-400">{activeItem.pHDrip} pH</span>
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
