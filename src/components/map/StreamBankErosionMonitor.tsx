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
import { useMapStore, type StreamBankErosionState, type StreamBankErosionData } from '@/lib/map-store'
import { Waves as WavesIcon18, X, TrendingDown, Compass, TreePine, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: StreamBankErosionData[] = [
  {
    id: 'sb-mississippi',
    name: 'Mississippi River Bank',
    lat: 35.15,
    lng: -90.05,
    erosionRate: 85,
    bankAngle: 65,
    vegetationCover: 15,
    status: 'severe',
    description: 'Active meander erosion',
  },
  {
    id: 'sb-danube',
    name: 'Danube River Bank',
    lat: 48.2,
    lng: 16.35,
    erosionRate: 28,
    bankAngle: 45,
    vegetationCover: 52,
    status: 'moderate',
    description: 'Moderate bank undercutting',
  },
  {
    id: 'sb-thames',
    name: 'Thames River Bank',
    lat: 51.5,
    lng: -0.12,
    erosionRate: 5,
    bankAngle: 30,
    vegetationCover: 78,
    status: 'minimal',
    description: 'Stabilized urban bank',
  },
  {
    id: 'sb-amazon',
    name: 'Amazon River Bank',
    lat: -3.4167,
    lng: -60.0,
    erosionRate: 42,
    bankAngle: 55,
    vegetationCover: 25,
    status: 'stabilized',
    description: 'Vegetation-stabilized bank',
  },
]

const STATUS_COLORS: Record<StreamBankErosionData['status'], { label: string; color: string; bgClass: string }> = {
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  minimal: { label: 'Minimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stabilized: { label: 'Stabilized', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: StreamBankErosionData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function StreamBankErosionMonitor() {
  const state = useMapStore((s) => s.streamBankErosion)
  const setState = useMapStore((s) => s.setStreamBankErosion)

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
      return { totalSites: 0, avgErosion: 0, avgVegetation: 0, severeCount: 0 }
    }
    const avgErosion = filteredItems.reduce((sum, e) => sum + e.erosionRate, 0) / filteredItems.length
    const avgVegetation = filteredItems.reduce((sum, e) => sum + e.vegetationCover, 0) / filteredItems.length
    const severeCount = filteredItems.filter((e) => e.status === 'severe').length
    return {
      totalSites: filteredItems.length,
      avgErosion: Math.round(avgErosion * 10) / 10,
      avgVegetation: Math.round(avgVegetation * 10) / 10,
      severeCount,
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
      properties: { id: e.id, name: e.name, status: e.status, erosionRate: e.erosionRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setStreamBankErosion({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof StreamBankErosionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showErosionRate', label: 'Erosion Rate', icon: TrendingDown },
    { key: 'showBankAngle', label: 'Bank Angle', icon: Compass },
    { key: 'showVegetationCover', label: 'Vegetation Cover', icon: TreePine },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <WavesIcon18 className="h-4 w-4 text-amber-400" />
              Stream Bank Erosion
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
                setState({ statusFilter: v as StreamBankErosionState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="stabilized">Stabilized</SelectItem>
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
              <div className="text-sm font-semibold text-amber-200">{summary.totalSites}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Erosion</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgErosion}</div>
              <div className="text-[9px] text-amber-400/60">cm/yr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Vegetation</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgVegetation}%</div>
              <div className="text-[9px] text-amber-400/60">cover</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Severe</div>
              <div className="text-sm font-semibold text-red-400">{summary.severeCount}</div>
              <div className="text-[9px] text-amber-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
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
                        {state.showErosionRate && (
                          <div>
                            Erosion:{' '}
                            <span className="text-amber-100 font-medium">{e.erosionRate} cm/yr</span>
                          </div>
                        )}
                        {state.showBankAngle && (
                          <div>
                            Angle:{' '}
                            <span className="text-amber-100 font-medium">{e.bankAngle}°</span>
                          </div>
                        )}
                        {state.showVegetationCover && (
                          <div>
                            Vegetation:{' '}
                            <span className="text-amber-100 font-medium">{e.vegetationCover}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No locations match the current filter.
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
                    <span className="text-amber-400/70">Erosion: </span>
                    <span className="font-medium text-orange-400">{activeItem.erosionRate} cm/yr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Bank Angle: </span>
                    <span className="font-medium text-yellow-400">{activeItem.bankAngle}°</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Vegetation: </span>
                    <span className="font-medium text-green-400">{activeItem.vegetationCover}%</span>
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
