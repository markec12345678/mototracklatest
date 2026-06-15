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
import { useMapStore, type IntertidalZoneState, type IntertidalZoneData } from '@/lib/map-store'
import { Waves as WavesIcon15, X, Ruler, Leaf, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IntertidalZoneData[] = [
  {
    id: 'iz-mont-st-michel',
    name: 'Mont-Saint-Michel Bay',
    lat: 48.6,
    lng: -1.5,
    tidalRange: 14.0,
    biodiversityIndex: 0.82,
    seaLevelRise: 3.2,
    status: 'healthy',
    description: 'Healthy intertidal flats with highest tides in Europe',
  },
  {
    id: 'iz-bay-of-fundy',
    name: 'Bay of Fundy',
    lat: 45.5,
    lng: -65.0,
    tidalRange: 16.3,
    biodiversityIndex: 0.75,
    seaLevelRise: 3.8,
    status: 'stressed',
    description: 'Stressed mudflats from increasing sea level and tourism',
  },
  {
    id: 'iz-yellow-sea',
    name: 'Yellow Sea Intertidal',
    lat: 35.0,
    lng: 126.0,
    tidalRange: 9.0,
    biodiversityIndex: 0.35,
    seaLevelRise: 5.1,
    status: 'degraded',
    description: 'Severely degraded by land reclamation and pollution',
  },
  {
    id: 'iz-wadden',
    name: 'Wadden Sea',
    lat: 53.5,
    lng: 6.0,
    tidalRange: 3.0,
    biodiversityIndex: 0.88,
    seaLevelRise: 2.1,
    status: 'restored',
    description: 'UNESCO site restored through conservation efforts',
  },
]

const STATUS_COLORS: Record<IntertidalZoneData['status'], { label: string; color: string; bgClass: string }> = {
  healthy: { label: 'Healthy', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stressed: { label: 'Stressed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  restored: { label: 'Restored', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: IntertidalZoneData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IntertidalZoneMonitor() {
  const state = useMapStore((s) => s.intertidalZone)
  const setState = useMapStore((s) => s.setIntertidalZone)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : SAMPLE_LOCATIONS),
    [state.zones]
  )

  const filteredItems = useMemo(() => {
    return zones.filter((z) => {
      if (state.statusFilter !== 'all' && z.status !== state.statusFilter) return false
      return true
    })
  }, [zones, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalZones: 0, avgTidalRange: 0, avgBiodiversity: 0, healthyCount: 0 }
    }
    const avgTidalRange = filteredItems.reduce((sum, z) => sum + z.tidalRange, 0) / filteredItems.length
    const avgBiodiversity = filteredItems.reduce((sum, z) => sum + z.biodiversityIndex, 0) / filteredItems.length
    const healthyCount = filteredItems.filter((z) => z.status === 'healthy').length
    return {
      totalZones: filteredItems.length,
      avgTidalRange: Math.round(avgTidalRange * 10) / 10,
      avgBiodiversity: Math.round(avgBiodiversity * 1000) / 1000,
      healthyCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((z) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [z.lng, z.lat] },
      properties: { id: z.id, name: z.name, status: z.status, tidalRange: z.tidalRange },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.zones.length === 0) {
      useMapStore.getState().setIntertidalZone({ zones: SAMPLE_LOCATIONS })
    }
  }, [state.zones.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IntertidalZoneState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTidalRange', label: 'Tidal Range', icon: Ruler },
    { key: 'showBiodiversityIndex', label: 'Biodiversity Index', icon: Leaf },
    { key: 'showSeaLevelRise', label: 'Sea Level Rise', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-green-950/95 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <WavesIcon15 className="h-4 w-4 text-teal-400" />
              Intertidal Zone Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-teal-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as IntertidalZoneState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="stressed">Stressed</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="restored">Restored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalZones}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Tidal Range</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgTidalRange}</div>
              <div className="text-[9px] text-teal-400/60">m</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Biodiversity</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgBiodiversity}</div>
              <div className="text-[9px] text-teal-400/60">index</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Healthy Count</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.healthyCount}</div>
              <div className="text-[9px] text-teal-400/60">zones</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Zones ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((z) => {
                  const isActive = state.activeZoneId === z.id
                  const statusCfg = STATUS_COLORS[z.status]
                  return (
                    <div
                      key={z.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeZoneId: isActive ? null : z.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={z.status} />
                          <span className="text-xs font-medium text-teal-100">{z.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showTidalRange && (
                          <div>
                            Tidal:{' '}
                            <span className="text-teal-100 font-medium">{z.tidalRange}m</span>
                          </div>
                        )}
                        {state.showBiodiversityIndex && (
                          <div>
                            Biodiv:{' '}
                            <span className="text-teal-100 font-medium">{z.biodiversityIndex.toFixed(2)}</span>
                          </div>
                        )}
                        {state.showSeaLevelRise && (
                          <div>
                            SLR:{' '}
                            <span className="text-teal-100 font-medium">{z.seaLevelRise}mm/yr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeItem && (
            <>
              <Separator className="bg-teal-700/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-teal-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400/70">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Tidal Range: </span>
                    <span className="font-medium text-cyan-400">{activeItem.tidalRange}m</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Biodiversity: </span>
                    <span className="font-medium text-green-400">{activeItem.biodiversityIndex.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Sea Level Rise: </span>
                    <span className="font-medium text-amber-400">{activeItem.seaLevelRise}mm/yr</span>
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
