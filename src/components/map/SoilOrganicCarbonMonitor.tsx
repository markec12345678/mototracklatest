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
import { useMapStore, type SoilOrganicCarbonState, type SoilOrganicCarbonData } from '@/lib/map-store'
import { Leaf as LeafIcon8, X, Layers, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SoilOrganicCarbonData[] = [
  {
    id: 'soc-chernozem',
    name: 'Ukrainian Chernozem',
    lat: 50.0000,
    lng: 32.0000,
    carbonContent: 45,
    bulkDensity: 1.1,
    decompositionRate: 12,
    status: 'rich',
    description: 'Deep fertile chernozem soils',
  },
  {
    id: 'soc-amazon',
    name: 'Amazon Terra Preta',
    lat: -3.1000,
    lng: -60.0000,
    carbonContent: 65,
    bulkDensity: 0.9,
    decompositionRate: 18,
    status: 'rich',
    description: 'Anthropogenic dark earth soils',
  },
  {
    id: 'soc-sahel',
    name: 'Sahel Sandy Soil',
    lat: 14.0000,
    lng: 2.0000,
    carbonContent: 5,
    bulkDensity: 1.6,
    decompositionRate: 3,
    status: 'depleted',
    description: 'Carbon-depleted arid soil',
  },
  {
    id: 'soc-peat',
    name: 'Borneo Peat Soil',
    lat: 1.5000,
    lng: 110.0000,
    carbonContent: 180,
    bulkDensity: 0.3,
    decompositionRate: 8,
    status: 'critical',
    description: 'Vulnerable tropical peatland',
  },
]

const STATUS_COLORS: Record<SoilOrganicCarbonData['status'], { label: string; color: string; bgClass: string }> = {
  rich: { label: 'Rich', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  depleted: { label: 'Depleted', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: SoilOrganicCarbonData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SoilOrganicCarbonMonitor() {
  const state = useMapStore((s) => s.soilOrganicCarbon)
  const setState = useMapStore((s) => s.setSoilOrganicCarbon)

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
      return { totalPaths: 0, avgCarbonContent: 0, avgBulkDensity: 0, criticalDepletedCount: 0 }
    }
    const avgCarbonContent = filteredItems.reduce((sum, e) => sum + e.carbonContent, 0) / filteredItems.length
    const avgBulkDensity = filteredItems.reduce((sum, e) => sum + e.bulkDensity, 0) / filteredItems.length
    const criticalDepletedCount = filteredItems.filter((e) => e.status === 'critical' || e.status === 'depleted').length
    return {
      totalPaths: filteredItems.length,
      avgCarbonContent: Math.round(avgCarbonContent * 10) / 10,
      avgBulkDensity: Math.round(avgBulkDensity * 10) / 10,
      criticalDepletedCount,
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
      properties: { id: e.id, name: e.name, status: e.status, carbonContent: e.carbonContent },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSoilOrganicCarbon({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SoilOrganicCarbonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonContent', label: 'Carbon Content', icon: LeafIcon8 },
    { key: 'showBulkDensity', label: 'Bulk Density', icon: Layers },
    { key: 'showDecompositionRate', label: 'Decomposition Rate', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-lime-950/95 backdrop-blur-xl border border-green-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-green-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-100">
              <LeafIcon8 className="h-4 w-4 text-green-400" />
              Soil Organic Carbon Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-300 hover:text-green-100 hover:bg-green-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-green-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-green-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as SoilOrganicCarbonState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-green-900/40 border-green-700/40 text-green-100 hover:bg-green-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="rich">Rich</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-green-200">
                  <Icon className="h-3 w-3 text-green-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-green-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-green-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-green-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Avg Carbon</div>
              <div className="text-sm font-semibold text-lime-400">{summary.avgCarbonContent}</div>
              <div className="text-[9px] text-green-400/60">t/ha</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Avg Bulk Density</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgBulkDensity}</div>
              <div className="text-[9px] text-green-400/60">g/cm3</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Critical+Depleted</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalDepletedCount}</div>
              <div className="text-[9px] text-green-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">
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
                          ? 'border-green-500/50 bg-green-800/30'
                          : 'border-green-700/30 hover:border-green-500/30 hover:bg-green-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-green-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-green-300/60">
                        {state.showCarbonContent && (
                          <div>
                            Carbon:{' '}
                            <span className="text-green-100 font-medium">{e.carbonContent} t/ha</span>
                          </div>
                        )}
                        {state.showBulkDensity && (
                          <div>
                            Bulk Density:{' '}
                            <span className="text-green-100 font-medium">{e.bulkDensity} g/cm3</span>
                          </div>
                        )}
                        {state.showDecompositionRate && (
                          <div>
                            Decomp Rate:{' '}
                            <span className="text-green-100 font-medium">{e.decompositionRate} %/yr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-green-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-green-700/30" />
              <div className="space-y-2 rounded-lg border border-green-600/30 bg-green-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-green-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-green-400/70">Coordinates: </span>
                    <span className="font-medium text-green-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Carbon: </span>
                    <span className="font-medium text-lime-400">{activeItem.carbonContent} t/ha</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Bulk Density: </span>
                    <span className="font-medium text-green-400">{activeItem.bulkDensity} g/cm3</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Decomp Rate: </span>
                    <span className="font-medium text-red-400">{activeItem.decompositionRate} %/yr</span>
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
