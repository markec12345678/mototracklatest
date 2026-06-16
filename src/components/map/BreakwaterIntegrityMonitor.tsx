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
import { useMapStore, type BreakwaterIntegrityState, type BreakwaterIntegrityData } from '@/lib/map-store'
import { Shield as ShieldIcon3, X, Waves, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: BreakwaterIntegrityData[] = [
  {
    id: 'bi-cherbourg',
    name: 'Cherbourg Breakwater',
    lat: 49.65,
    lng: -1.6167,
    structuralHealth: 85,
    waveForce: 45,
    overtoppingRate: 12,
    status: 'fair',
    description: 'Major French breakwater monitoring',
  },
  {
    id: 'bi-oosterschelde',
    name: 'Oosterschelde Barrier',
    lat: 51.7,
    lng: 3.7,
    structuralHealth: 42,
    waveForce: 120,
    overtoppingRate: 85,
    status: 'critical',
    description: 'Storm surge barrier under stress',
  },
  {
    id: 'bi-alfons',
    name: 'Alfonsos Breakwater',
    lat: 36.7167,
    lng: -4.4167,
    structuralHealth: 68,
    waveForce: 55,
    overtoppingRate: 28,
    status: 'degraded',
    description: 'Mediterranean port breakwater',
  },
  {
    id: 'bi-yokohama',
    name: 'Yokohama Sea Wall',
    lat: 35.45,
    lng: 139.65,
    structuralHealth: 95,
    waveForce: 30,
    overtoppingRate: 5,
    status: 'intact',
    description: 'Well-maintained coastal defense',
  },
]

const STATUS_COLORS: Record<BreakwaterIntegrityData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#dc2626', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  fair: { label: 'Fair', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  intact: { label: 'Intact', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: BreakwaterIntegrityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function BreakwaterIntegrityMonitor() {
  const state = useMapStore((s) => s.breakwaterIntegrity)
  const setState = useMapStore((s) => s.setBreakwaterIntegrity)

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
      return { totalPaths: 0, avgStructuralHealth: 0, avgWaveForce: 0, criticalDegradedCount: 0 }
    }
    const avgStructuralHealth = filteredItems.reduce((sum, e) => sum + e.structuralHealth, 0) / filteredItems.length
    const avgWaveForce = filteredItems.reduce((sum, e) => sum + e.waveForce, 0) / filteredItems.length
    const criticalDegradedCount = filteredItems.filter((e) => e.status === 'critical' || e.status === 'degraded').length
    return {
      totalPaths: filteredItems.length,
      avgStructuralHealth: Math.round(avgStructuralHealth * 10) / 10,
      avgWaveForce: Math.round(avgWaveForce * 10) / 10,
      criticalDegradedCount,
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
      properties: { id: e.id, name: e.name, status: e.status, structuralHealth: e.structuralHealth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setBreakwaterIntegrity({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof BreakwaterIntegrityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showStructuralHealth', label: 'Structural Health', icon: ShieldIcon3 },
    { key: 'showWaveForce', label: 'Wave Force', icon: Waves },
    { key: 'showOvertoppingRate', label: 'Overtopping Rate', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <ShieldIcon3 className="h-4 w-4 text-blue-400" />
              Breakwater Integrity Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-blue-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as BreakwaterIntegrityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="intact">Intact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Breakwaters</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Health</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgStructuralHealth}</div>
              <div className="text-[9px] text-blue-400/60">%</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Wave Force</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgWaveForce}</div>
              <div className="text-[9px] text-blue-400/60">kN/m</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Critical+Degraded</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalDegradedCount}</div>
              <div className="text-[9px] text-blue-400/60">structures</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Breakwaters ({filteredItems.length})
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
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-blue-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showStructuralHealth && (
                          <div>
                            Health:{' '}
                            <span className="text-blue-100 font-medium">{e.structuralHealth}%</span>
                          </div>
                        )}
                        {state.showWaveForce && (
                          <div>
                            Wave Force:{' '}
                            <span className="text-blue-100 font-medium">{e.waveForce} kN/m</span>
                          </div>
                        )}
                        {state.showOvertoppingRate && (
                          <div>
                            Overtopping:{' '}
                            <span className="text-blue-100 font-medium">{e.overtoppingRate} l/s/m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No breakwaters match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-blue-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400/70">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Health: </span>
                    <span className="font-medium text-indigo-400">{activeItem.structuralHealth}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Wave Force: </span>
                    <span className="font-medium text-blue-400">{activeItem.waveForce} kN/m</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Overtopping: </span>
                    <span className="font-medium text-red-400">{activeItem.overtoppingRate} l/s/m</span>
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
