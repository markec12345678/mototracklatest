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
import { useMapStore, type RiftValleyVolcanoState, type RiftValleyVolcanoData } from '@/lib/map-store'
import { Flame as FlameIcon17, X, Layers, Activity, Thermometer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: RiftValleyVolcanoData[] = [
  {
    id: 'rv-nyiragongo',
    name: 'Nyiragongo Volcano',
    lat: -1.5208,
    lng: 29.2313,
    magmaChamberDepth: 5,
    deformationRate: 15,
    so2Emission: 2500,
    status: 'active',
    description: 'Active lava lake volcano',
  },
  {
    id: 'rv-ol-doinyo',
    name: 'Ol Doinyo Lengai',
    lat: -2.7583,
    lng: 35.8983,
    magmaChamberDepth: 12,
    deformationRate: 2,
    so2Emission: 150,
    status: 'dormant',
    description: 'Carbonatite volcano',
  },
  {
    id: 'rv-geldungur',
    name: 'Geldungur Fissure',
    lat: -4.0833,
    lng: 35.5833,
    magmaChamberDepth: 8,
    deformationRate: 8,
    so2Emission: 500,
    status: 'fissuring',
    description: 'Active fissure eruption',
  },
  {
    id: 'rv-menengai',
    name: 'Menengai Caldera',
    lat: -0.2,
    lng: 36.05,
    magmaChamberDepth: 3,
    deformationRate: 0.5,
    so2Emission: 50,
    status: 'caldera_formation',
    description: 'Massive caldera system',
  },
]

const STATUS_COLORS: Record<RiftValleyVolcanoData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  dormant: { label: 'Dormant', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  fissuring: { label: 'Fissuring', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  caldera_formation: { label: 'Caldera', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
}

function TrendIcon({ status }: { status: RiftValleyVolcanoData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function RiftValleyVolcanoMonitor() {
  const state = useMapStore((s) => s.riftValleyVolcano)
  const setState = useMapStore((s) => s.setRiftValleyVolcano)

  const items = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return items.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [items, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalVolcanoes: 0, avgDepth: 0, maxSo2: 0, activeFissuringCount: 0 }
    }
    const avgDepth = filteredItems.reduce((sum, e) => sum + e.magmaChamberDepth, 0) / filteredItems.length
    const maxSo2 = Math.max(...filteredItems.map((e) => e.so2Emission))
    const activeFissuringCount = filteredItems.filter((e) => e.status === 'active' || e.status === 'fissuring').length
    return {
      totalVolcanoes: filteredItems.length,
      avgDepth: Math.round(avgDepth * 10) / 10,
      maxSo2,
      activeFissuringCount,
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
      properties: { id: e.id, name: e.name, status: e.status, magmaChamberDepth: e.magmaChamberDepth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setRiftValleyVolcano({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RiftValleyVolcanoState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMagmaChamberDepth', label: 'Magma Chamber Depth', icon: Layers },
    { key: 'showDeformationRate', label: 'Deformation Rate', icon: Activity },
    { key: 'showSo2Emission', label: 'SO₂ Emission', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-orange-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <FlameIcon17 className="h-4 w-4 text-red-400" />
              Rift Valley Volcano
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as RiftValleyVolcanoState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="fissuring">Fissuring</SelectItem>
                <SelectItem value="caldera_formation">Caldera Formation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Volcanoes</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalVolcanoes}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgDepth}</div>
              <div className="text-[9px] text-red-400/60">km</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Max SO₂</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.maxSo2.toLocaleString()}</div>
              <div className="text-[9px] text-red-400/60">tons/day</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Active+Fissuring</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeFissuringCount}</div>
              <div className="text-[9px] text-red-400/60">volcanoes</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Locations ({filteredItems.length})
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
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-red-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showMagmaChamberDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-red-100 font-medium">{e.magmaChamberDepth} km</span>
                          </div>
                        )}
                        {state.showDeformationRate && (
                          <div>
                            Deform:{' '}
                            <span className="text-red-100 font-medium">{e.deformationRate} cm/yr</span>
                          </div>
                        )}
                        {state.showSo2Emission && (
                          <div>
                            SO₂:{' '}
                            <span className="text-red-100 font-medium">{e.so2Emission.toLocaleString()} tons/day</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No locations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Depth: </span>
                    <span className="font-medium text-orange-400">{activeItem.magmaChamberDepth} km</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Deformation: </span>
                    <span className="font-medium text-yellow-400">{activeItem.deformationRate} cm/yr</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">SO₂: </span>
                    <span className="font-medium text-red-400">{activeItem.so2Emission.toLocaleString()} tons/day</span>
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
