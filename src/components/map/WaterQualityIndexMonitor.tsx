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
import { useMapStore, type WaterQualityIndexState, type WaterQualityIndexData } from '@/lib/map-store'
import { Droplets as DropletsIcon20, X, Gauge, Thermometer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: WaterQualityIndexData[] = [
  {
    id: 'wqi-ganges',
    name: 'Ganges River',
    lat: 25.300,
    lng: 83.000,
    wqiScore: 28,
    phLevel: 8.2,
    dissolvedOxygen: 3.5,
    contaminantLevel: 82,
    status: 'hazardous',
    description: 'Severe pollution from industrial and domestic waste discharge in the Ganges',
  },
  {
    id: 'wqi-yangtze',
    name: 'Yangtze Delta',
    lat: 31.200,
    lng: 121.500,
    wqiScore: 52,
    phLevel: 7.4,
    dissolvedOxygen: 5.8,
    contaminantLevel: 48,
    status: 'poor',
    description: 'Moderate pollution from agricultural runoff and urban wastewater in the Yangtze Delta',
  },
  {
    id: 'wqi-danube',
    name: 'Danube Basin',
    lat: 47.000,
    lng: 20.000,
    wqiScore: 72,
    phLevel: 7.8,
    dissolvedOxygen: 8.2,
    contaminantLevel: 22,
    status: 'moderate',
    description: 'Improving water quality in the Danube after EU environmental regulations',
  },
  {
    id: 'wqi-colorado',
    name: 'Colorado River',
    lat: 36.000,
    lng: -112.000,
    wqiScore: 85,
    phLevel: 7.6,
    dissolvedOxygen: 9.1,
    contaminantLevel: 12,
    status: 'good',
    description: 'Good water quality in upper Colorado River basin with minimal contamination',
  },
]

const STATUS_COLORS: Record<WaterQualityIndexData['status'], { label: string; color: string; bgClass: string }> = {
  hazardous: { label: 'Hazardous', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  poor: { label: 'Poor', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  excellent: { label: 'Excellent', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
}

function TrendIcon({ status }: { status: WaterQualityIndexData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function WaterQualityIndexMonitor() {
  const state = useMapStore((s) => s.waterQualityIndex)
  const setState = useMapStore((s) => s.setWaterQualityIndex)

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
      return { totalSites: 0, avgWqi: 0, avgDO: 0, avgContaminant: 0 }
    }
    const avgWqi = filteredItems.reduce((sum, e) => sum + e.wqiScore, 0) / filteredItems.length
    const avgDO = filteredItems.reduce((sum, e) => sum + e.dissolvedOxygen, 0) / filteredItems.length
    const avgContaminant = filteredItems.reduce((sum, e) => sum + e.contaminantLevel, 0) / filteredItems.length
    return {
      totalSites: filteredItems.length,
      avgWqi: Math.round(avgWqi),
      avgDO: avgDO.toFixed(1),
      avgContaminant: Math.round(avgContaminant),
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
      properties: { id: e.id, name: e.name, status: e.status, wqiScore: e.wqiScore },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setWaterQualityIndex({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WaterQualityIndexState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWqiScore', label: 'WQI Score', icon: Gauge },
    { key: 'showPhLevel', label: 'E.coli CFU', icon: Thermometer },
    { key: 'showDissolvedOxygen', label: 'DO Level', icon: DropletsIcon20 },
    { key: 'showContaminantLevel', label: 'Turbidity NTU', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-blue-950/95 backdrop-blur-xl border border-cyan-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <DropletsIcon20 className="h-4 w-4 text-cyan-400" />
              Water Quality Index Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as WaterQualityIndexState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="hazardous">Hazardous</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">WQI Score</div>
              <div className="text-sm font-semibold text-cyan-300">{summary.avgWqi}</div>
              <div className="text-[9px] text-cyan-400/60">average</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">DO Level</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgDO} mg/L</div>
              <div className="text-[9px] text-cyan-400/60">dissolved oxygen</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Turbidity</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgContaminant}</div>
              <div className="text-[9px] text-cyan-400/60">contaminant index</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Sites</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalSites}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Water Quality Sites ({filteredItems.length})
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
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-cyan-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showWqiScore && (
                          <div>
                            WQI:{' '}
                            <span className="text-cyan-100 font-medium">{e.wqiScore}</span>
                          </div>
                        )}
                        {state.showPhLevel && (
                          <div>
                            pH:{' '}
                            <span className="text-cyan-100 font-medium">{e.phLevel}</span>
                          </div>
                        )}
                        {state.showDissolvedOxygen && (
                          <div>
                            DO:{' '}
                            <span className="text-cyan-100 font-medium">{e.dissolvedOxygen} mg/L</span>
                          </div>
                        )}
                        {state.showContaminantLevel && (
                          <div>
                            Contaminant:{' '}
                            <span className="text-cyan-100 font-medium">{e.contaminantLevel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">WQI: </span>
                    <span className="font-medium text-cyan-300">{activeItem.wqiScore}</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">DO: </span>
                    <span className="font-medium text-blue-300">{activeItem.dissolvedOxygen} mg/L</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Contaminant: </span>
                    <span className="font-medium text-teal-400">{activeItem.contaminantLevel}</span>
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
