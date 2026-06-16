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
import { useMapStore, type PandemicSpreadRateState, type PandemicSpreadRateData } from '@/lib/map-store'
import { Globe as GlobeIcon4, X, Activity, Timer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: PandemicSpreadRateData[] = [
  {
    id: 'psr-global',
    name: 'Global Hotspot',
    lat: 30.000,
    lng: 0.000,
    reproductionNumber: 2.4,
    doublingTime: 5,
    testPositivity: 32,
    hospitalizationRate: 45,
    status: 'exponential',
    description: 'Global hotspot with exponential growth in new cases across multiple regions',
  },
  {
    id: 'psr-europe',
    name: 'Europe Cluster',
    lat: 48.000,
    lng: 10.000,
    reproductionNumber: 1.6,
    doublingTime: 14,
    testPositivity: 18,
    hospitalizationRate: 28,
    status: 'accelerating',
    description: 'European cluster with accelerating spread in urban metropolitan areas',
  },
  {
    id: 'psr-americas',
    name: 'Americas Wave',
    lat: 25.000,
    lng: -80.000,
    reproductionNumber: 1.1,
    doublingTime: 28,
    testPositivity: 12,
    hospitalizationRate: 15,
    status: 'stable',
    description: 'Americas experiencing a slowing wave with declining daily case counts',
  },
  {
    id: 'psr-asiapacific',
    name: 'Asia Pacific',
    lat: 20.000,
    lng: 110.000,
    reproductionNumber: 0.8,
    doublingTime: 45,
    testPositivity: 5,
    hospitalizationRate: 8,
    status: 'declining',
    description: 'Asia Pacific region showing sustained decline in transmission rates',
  },
]

const STATUS_COLORS: Record<PandemicSpreadRateData['status'], { label: string; color: string; bgClass: string }> = {
  exponential: { label: 'Exponential', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  accelerating: { label: 'Accelerating', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  declining: { label: 'Declining', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: PandemicSpreadRateData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PandemicSpreadRateMonitor() {
  const state = useMapStore((s) => s.pandemicSpreadRate)
  const setState = useMapStore((s) => s.setPandemicSpreadRate)

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
      return { totalRegions: 0, avgR: 0, avgDoubling: 0, avgTestPos: 0 }
    }
    const avgR = filteredItems.reduce((sum, e) => sum + e.reproductionNumber, 0) / filteredItems.length
    const avgDoubling = filteredItems.reduce((sum, e) => sum + e.doublingTime, 0) / filteredItems.length
    const avgTestPos = filteredItems.reduce((sum, e) => sum + e.testPositivity, 0) / filteredItems.length
    return {
      totalRegions: filteredItems.length,
      avgR: avgR.toFixed(1),
      avgDoubling: Math.round(avgDoubling),
      avgTestPos: Math.round(avgTestPos),
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
      properties: { id: e.id, name: e.name, status: e.status, reproductionNumber: e.reproductionNumber },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setPandemicSpreadRate({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PandemicSpreadRateState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showReproductionNumber', label: 'Reproduction No', icon: Activity },
    { key: 'showDoublingTime', label: 'Doubling Days', icon: Timer },
    { key: 'showTestPositivity', label: 'Test Positivity', icon: GlobeIcon4 },
    { key: 'showHospitalizationRate', label: 'Recovery Rate', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-950/95 to-violet-950/95 backdrop-blur-xl border border-purple-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-100">
              <GlobeIcon4 className="h-4 w-4 text-purple-400" />
              Pandemic Spread Rate Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as PandemicSpreadRateState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-purple-900/40 border-purple-700/40 text-purple-100 hover:bg-purple-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="exponential">Exponential</SelectItem>
                <SelectItem value="accelerating">Accelerating</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
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
              <div className="text-[10px] text-purple-400/70">Reproduction No</div>
              <div className="text-sm font-semibold text-purple-300">{summary.avgR}</div>
              <div className="text-[9px] text-purple-400/60">average R</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Doubling Days</div>
              <div className="text-sm font-semibold text-violet-300">{summary.avgDoubling}</div>
              <div className="text-[9px] text-purple-400/60">average</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Test Positivity</div>
              <div className="text-sm font-semibold text-fuchsia-400">{summary.avgTestPos}%</div>
              <div className="text-[9px] text-purple-400/60">average</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Regions</div>
              <div className="text-sm font-semibold text-purple-200">{summary.totalRegions}</div>
              <div className="text-[9px] text-purple-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300/80">
              Pandemic Regions ({filteredItems.length})
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
                        {state.showReproductionNumber && (
                          <div>
                            R-value:{' '}
                            <span className="text-purple-100 font-medium">{e.reproductionNumber}</span>
                          </div>
                        )}
                        {state.showDoublingTime && (
                          <div>
                            Doubling:{' '}
                            <span className="text-purple-100 font-medium">{e.doublingTime} days</span>
                          </div>
                        )}
                        {state.showTestPositivity && (
                          <div>
                            Test +:{' '}
                            <span className="text-purple-100 font-medium">{e.testPositivity}%</span>
                          </div>
                        )}
                        {state.showHospitalizationRate && (
                          <div>
                            Hosp Rate:{' '}
                            <span className="text-purple-100 font-medium">{e.hospitalizationRate}/100k</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-purple-400/50 py-4">
                    No regions match the current filter.
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
                    <span className="text-purple-400/70">R-value: </span>
                    <span className="font-medium text-purple-300">{activeItem.reproductionNumber}</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Doubling: </span>
                    <span className="font-medium text-violet-300">{activeItem.doublingTime} days</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Test +: </span>
                    <span className="font-medium text-fuchsia-400">{activeItem.testPositivity}%</span>
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
