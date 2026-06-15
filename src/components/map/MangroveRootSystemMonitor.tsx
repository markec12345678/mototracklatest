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
import { useMapStore, type MangroveRootSystemState, type MangroveRootSystemData } from '@/lib/map-store'
import { TreePine as TreePineIcon8, X, Activity, Layers, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MangroveRootSystemData[] = [
  {
    id: 'mr-sundarbans',
    name: 'Sundarbans Mangrove',
    lat: 22.0,
    lng: 89.0,
    rootDensity: 85,
    sedimentAccretion: 5.2,
    carbonStock: 120,
    status: 'healthy',
    description: "World's largest mangrove forest",
  },
  {
    id: 'mr-florida',
    name: 'Florida Mangrove Root',
    lat: 25.2,
    lng: -81.0,
    rootDensity: 62,
    sedimentAccretion: 3.8,
    carbonStock: 95,
    status: 'stressed',
    description: 'Hurricane-impacted root system',
  },
  {
    id: 'mr-vietnam',
    name: 'Mekong Delta Mangrove',
    lat: 9.5,
    lng: 106.0,
    rootDensity: 35,
    sedimentAccretion: 1.5,
    carbonStock: 55,
    status: 'declining',
    description: 'Shrimp farm encroachment',
  },
  {
    id: 'mr-kenya',
    name: 'Gazi Bay Mangrove',
    lat: -4.4167,
    lng: 39.5,
    rootDensity: 72,
    sedimentAccretion: 4.5,
    carbonStock: 110,
    status: 'restored',
    description: 'Community restoration project',
  },
]

const STATUS_COLORS: Record<MangroveRootSystemData['status'], { label: string; color: string; bgClass: string }> = {
  healthy: { label: 'Healthy', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stressed: { label: 'Stressed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  declining: { label: 'Declining', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  restored: { label: 'Restored', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: MangroveRootSystemData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MangroveRootSystemMonitor() {
  const state = useMapStore((s) => s.mangroveRootSystem)
  const setState = useMapStore((s) => s.setMangroveRootSystem)

  const items = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (state.statusFilter !== 'all' && item.status !== state.statusFilter) return false
      return true
    })
  }, [items, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgDensity: 0, avgCarbon: 0, healthyRestoredCount: 0 }
    }
    const avgDensity = filteredItems.reduce((sum, item) => sum + item.rootDensity, 0) / filteredItems.length
    const avgCarbon = filteredItems.reduce((sum, item) => sum + item.carbonStock, 0) / filteredItems.length
    const healthyRestoredCount = filteredItems.filter((item) => item.status === 'healthy' || item.status === 'restored').length
    return {
      totalSites: filteredItems.length,
      avgDensity: Math.round(avgDensity * 10) / 10,
      avgCarbon: Math.round(avgCarbon * 10) / 10,
      healthyRestoredCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => items.find((item) => item.id === state.activeItemId) ?? null,
    [items, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.lng, item.lat] },
      properties: { id: item.id, name: item.name, status: item.status, rootDensity: item.rootDensity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setMangroveRootSystem({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MangroveRootSystemState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRootDensity', label: 'Root Density', icon: Activity },
    { key: 'showSedimentAccretion', label: 'Sediment Accretion', icon: Layers },
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <TreePineIcon8 className="h-4 w-4 text-emerald-400" />
              Mangrove Root System
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-emerald-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as MangroveRootSystemState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="stressed">Stressed</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="restored">Restored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalSites}</div>
              <div className="text-[9px] text-emerald-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Density</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgDensity}</div>
              <div className="text-[9px] text-emerald-400/60">roots/m²</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Carbon</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgCarbon}</div>
              <div className="text-[9px] text-emerald-400/60">tC/ha</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Healthy+Restored</div>
              <div className="text-sm font-semibold text-blue-400">{summary.healthyRestoredCount}</div>
              <div className="text-[9px] text-emerald-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
              Sites ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((item) => {
                  const isActive = state.activeItemId === item.id
                  const statusCfg = STATUS_COLORS[item.status]
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/30 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : item.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={item.status} />
                          <span className="text-xs font-medium text-emerald-100">{item.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/60">
                        {state.showRootDensity && (
                          <div>
                            Density:{' '}
                            <span className="text-emerald-100 font-medium">{item.rootDensity} roots/m²</span>
                          </div>
                        )}
                        {state.showSedimentAccretion && (
                          <div>
                            Accretion:{' '}
                            <span className="text-emerald-100 font-medium">{item.sedimentAccretion} mm/yr</span>
                          </div>
                        )}
                        {state.showCarbonStock && (
                          <div>
                            Carbon:{' '}
                            <span className="text-teal-400 font-medium">{item.carbonStock} tC/ha</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-emerald-700/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-emerald-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400/70">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Density: </span>
                    <span className="font-medium text-green-400">{activeItem.rootDensity} roots/m²</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Accretion: </span>
                    <span className="font-medium text-teal-400">{activeItem.sedimentAccretion} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Carbon: </span>
                    <span className="font-medium text-blue-400">{activeItem.carbonStock} tC/ha</span>
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
