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
import { useMapStore, type SoilPhosphorusState, type SoilPhosphorusData } from '@/lib/map-store'
import { Droplets as DropletsIcon16, X, Layers, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SoilPhosphorusData[] = [
  {
    id: 'sp-iowa',
    name: 'Iowa Mollisol P',
    lat: 42.0000,
    lng: -93.5000,
    availableP: 35,
    totalP: 650,
    retentionCapacity: 45,
    status: 'optimal',
    description: 'Well-fertilized prairie soil',
  },
  {
    id: 'sp-kenya',
    name: 'Kenya Acrisol P',
    lat: -1.0000,
    lng: 37.0000,
    availableP: 8,
    totalP: 180,
    retentionCapacity: 85,
    status: 'locked',
    description: 'P locked by iron and aluminum',
  },
  {
    id: 'sp-australia',
    name: 'Australia Vertisol P',
    lat: -28.0000,
    lng: 150.0000,
    availableP: 15,
    totalP: 320,
    retentionCapacity: 55,
    status: 'adequate',
    description: 'Moderate P availability',
  },
  {
    id: 'sp-brazil',
    name: 'Brazil Cerrado P',
    lat: -15.0000,
    lng: -48.0000,
    availableP: 3,
    totalP: 90,
    retentionCapacity: 92,
    status: 'deficient',
    description: 'Severely P-deficient tropical soil',
  },
]

const STATUS_COLORS: Record<SoilPhosphorusData['status'], { label: string; color: string; bgClass: string }> = {
  optimal: { label: 'Optimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  adequate: { label: 'Adequate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  deficient: { label: 'Deficient', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  locked: { label: 'Locked', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: SoilPhosphorusData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SoilPhosphorusMonitor() {
  const state = useMapStore((s) => s.soilPhosphorus)
  const setState = useMapStore((s) => s.setSoilPhosphorus)

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
      return { totalPaths: 0, avgAvailableP: 0, avgTotalP: 0, deficientLockedCount: 0 }
    }
    const avgAvailableP = filteredItems.reduce((sum, e) => sum + e.availableP, 0) / filteredItems.length
    const avgTotalP = filteredItems.reduce((sum, e) => sum + e.totalP, 0) / filteredItems.length
    const deficientLockedCount = filteredItems.filter((e) => e.status === 'deficient' || e.status === 'locked').length
    return {
      totalPaths: filteredItems.length,
      avgAvailableP: Math.round(avgAvailableP * 10) / 10,
      avgTotalP: Math.round(avgTotalP * 10) / 10,
      deficientLockedCount,
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
      properties: { id: e.id, name: e.name, status: e.status, availableP: e.availableP },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSoilPhosphorus({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SoilPhosphorusState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAvailableP', label: 'Available P', icon: DropletsIcon16 },
    { key: 'showTotalP', label: 'Total P', icon: Layers },
    { key: 'showRetentionCapacity', label: 'Retention Capacity', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-purple-950/95 backdrop-blur-xl border border-violet-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <DropletsIcon16 className="h-4 w-4 text-violet-400" />
              Soil Phosphorus Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-300 hover:text-violet-100 hover:bg-violet-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-violet-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-violet-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as SoilPhosphorusState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
                <SelectItem value="deficient">Deficient</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-violet-200">
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-violet-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-violet-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Available P</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgAvailableP}</div>
              <div className="text-[9px] text-violet-400/60">mg/kg</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Total P</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgTotalP}</div>
              <div className="text-[9px] text-violet-400/60">mg/kg</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Deficient+Locked</div>
              <div className="text-sm font-semibold text-red-400">{summary.deficientLockedCount}</div>
              <div className="text-[9px] text-violet-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">
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
                          ? 'border-violet-500/50 bg-violet-800/30'
                          : 'border-violet-700/30 hover:border-violet-500/30 hover:bg-violet-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-violet-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300/60">
                        {state.showAvailableP && (
                          <div>
                            Available P:{' '}
                            <span className="text-violet-100 font-medium">{e.availableP} mg/kg</span>
                          </div>
                        )}
                        {state.showTotalP && (
                          <div>
                            Total P:{' '}
                            <span className="text-violet-100 font-medium">{e.totalP} mg/kg</span>
                          </div>
                        )}
                        {state.showRetentionCapacity && (
                          <div>
                            Retention:{' '}
                            <span className="text-violet-100 font-medium">{e.retentionCapacity}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-violet-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-violet-700/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400/70">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Available P: </span>
                    <span className="font-medium text-purple-400">{activeItem.availableP} mg/kg</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Total P: </span>
                    <span className="font-medium text-violet-400">{activeItem.totalP} mg/kg</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Retention: </span>
                    <span className="font-medium text-red-400">{activeItem.retentionCapacity}%</span>
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
