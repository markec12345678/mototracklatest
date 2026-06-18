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
import { useMapStore, type SoilCompactionState, type SoilCompactionData } from '@/lib/map-store'
import { Box as BoxIcon2, X, ArrowDown, Layers, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SoilCompactionData[] = [
  {
    id: 'sc-netherlands',
    name: 'Netherlands Polder',
    lat: 52.0000,
    lng: 5.0000,
    penetrationResistance: 4.5,
    bulkDensity: 1.7,
    porosity: 32,
    status: 'severe',
    description: 'Heavily compacted polder soil',
  },
  {
    id: 'sc-argentina',
    name: 'Argentina Pampas',
    lat: -34.0000,
    lng: -62.0000,
    penetrationResistance: 2.8,
    bulkDensity: 1.5,
    porosity: 42,
    status: 'moderate',
    description: 'Moderate compaction from tillage',
  },
  {
    id: 'sc-germany',
    name: 'German Loess Soil',
    lat: 51.0000,
    lng: 10.0000,
    penetrationResistance: 1.5,
    bulkDensity: 1.3,
    porosity: 50,
    status: 'slight',
    description: 'Slight compaction in loess',
  },
  {
    id: 'sc-forest',
    name: 'Boreal Forest Soil',
    lat: 58.0000,
    lng: 25.0000,
    penetrationResistance: 0.8,
    bulkDensity: 0.9,
    porosity: 65,
    status: 'loose',
    description: 'Loose organic forest soil',
  },
]

const STATUS_COLORS: Record<SoilCompactionData['status'], { label: string; color: string; bgClass: string }> = {
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  slight: { label: 'Slight', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  loose: { label: 'Loose', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: SoilCompactionData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SoilCompactionMonitor() {
  const state = useMapStore((s) => s.soilCompaction)
  const setState = useMapStore((s) => s.setSoilCompaction)

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
      return { totalPaths: 0, avgPenetrationResistance: 0, avgPorosity: 0, severeModerateCount: 0 }
    }
    const avgPenetrationResistance = filteredItems.reduce((sum, e) => sum + e.penetrationResistance, 0) / filteredItems.length
    const avgPorosity = filteredItems.reduce((sum, e) => sum + e.porosity, 0) / filteredItems.length
    const severeModerateCount = filteredItems.filter((e) => e.status === 'severe' || e.status === 'moderate').length
    return {
      totalPaths: filteredItems.length,
      avgPenetrationResistance: Math.round(avgPenetrationResistance * 10) / 10,
      avgPorosity: Math.round(avgPorosity * 10) / 10,
      severeModerateCount,
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
      properties: { id: e.id, name: e.name, status: e.status, penetrationResistance: e.penetrationResistance },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSoilCompaction({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SoilCompactionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPenetrationResistance', label: 'Penetration Resistance', icon: ArrowDown },
    { key: 'showBulkDensity', label: 'Bulk Density', icon: Layers },
    { key: 'showPorosity', label: 'Porosity', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-yellow-950/95 to-amber-950/95 backdrop-blur-xl border border-yellow-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-yellow-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-100">
              <BoxIcon2 className="h-4 w-4 text-yellow-400" />
              Soil Compaction Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-yellow-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-yellow-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as SoilCompactionState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-yellow-900/40 border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="slight">Slight</SelectItem>
                <SelectItem value="loose">Loose</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-yellow-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-yellow-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-yellow-200">
                  <Icon className="h-3 w-3 text-yellow-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-yellow-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-yellow-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-yellow-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-yellow-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400/70">Avg Pen. Resist.</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgPenetrationResistance}</div>
              <div className="text-[9px] text-yellow-400/60">MPa</div>
            </div>
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400/70">Avg Porosity</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgPorosity}%</div>
              <div className="text-[9px] text-yellow-400/60">volume</div>
            </div>
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400/70">Severe+Moderate</div>
              <div className="text-sm font-semibold text-red-400">{summary.severeModerateCount}</div>
              <div className="text-[9px] text-yellow-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-yellow-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-yellow-300/80">
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
                          ? 'border-yellow-500/50 bg-yellow-800/30'
                          : 'border-yellow-700/30 hover:border-yellow-500/30 hover:bg-yellow-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-yellow-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-yellow-300/60">
                        {state.showPenetrationResistance && (
                          <div>
                            Pen. Resist.:{' '}
                            <span className="text-yellow-100 font-medium">{e.penetrationResistance} MPa</span>
                          </div>
                        )}
                        {state.showBulkDensity && (
                          <div>
                            Bulk Density:{' '}
                            <span className="text-yellow-100 font-medium">{e.bulkDensity} g/cm3</span>
                          </div>
                        )}
                        {state.showPorosity && (
                          <div>
                            Porosity:{' '}
                            <span className="text-yellow-100 font-medium">{e.porosity}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-yellow-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-yellow-700/30" />
              <div className="space-y-2 rounded-lg border border-yellow-600/30 bg-yellow-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-yellow-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-yellow-400/70">Coordinates: </span>
                    <span className="font-medium text-yellow-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-400/70">Pen. Resist.: </span>
                    <span className="font-medium text-amber-400">{activeItem.penetrationResistance} MPa</span>
                  </div>
                  <div>
                    <span className="text-yellow-400/70">Bulk Density: </span>
                    <span className="font-medium text-yellow-400">{activeItem.bulkDensity} g/cm3</span>
                  </div>
                  <div>
                    <span className="text-yellow-400/70">Porosity: </span>
                    <span className="font-medium text-red-400">{activeItem.porosity}%</span>
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
