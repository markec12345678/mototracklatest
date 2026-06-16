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
import { useMapStore, type UpwellingIntensityState, type UpwellingIntensityData } from '@/lib/map-store'
import { ArrowUpFromLine as ArrowUpIcon5, X, ArrowUpFromLine, Thermometer, Leaf, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: UpwellingIntensityData[] = [
  {
    id: 'ui-peru',
    name: 'Peru Upwelling',
    lat: -15.0000,
    lng: -75.0000,
    upwellingVelocity: 3.5,
    sstAnomaly: -4.2,
    chlorophyllConcentration: 8.5,
    status: 'strong',
    description: 'Strong coastal upwelling system',
  },
  {
    id: 'ui-benguela',
    name: 'Benguela Upwelling',
    lat: -22.0000,
    lng: 12.0000,
    upwellingVelocity: 2.0,
    sstAnomaly: -2.5,
    chlorophyllConcentration: 5.2,
    status: 'moderate',
    description: 'Moderate upwelling off SW Africa',
  },
  {
    id: 'ui-california',
    name: 'California Upwelling',
    lat: 38.0000,
    lng: -124.0000,
    upwellingVelocity: 0.8,
    sstAnomaly: -1.0,
    chlorophyllConcentration: 2.1,
    status: 'weak',
    description: 'Weak seasonal upwelling',
  },
  {
    id: 'ui-elNino',
    name: 'El Nino Suppressed',
    lat: -5.0000,
    lng: -85.0000,
    upwellingVelocity: 0.1,
    sstAnomaly: 3.5,
    chlorophyllConcentration: 0.3,
    status: 'suppressed',
    description: 'Upwelling suppressed by El Nino',
  },
]

const STATUS_COLORS: Record<UpwellingIntensityData['status'], { label: string; color: string; bgClass: string }> = {
  strong: { label: 'Strong', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weak: { label: 'Weak', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  suppressed: { label: 'Suppressed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: UpwellingIntensityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function UpwellingIntensityMonitor() {
  const state = useMapStore((s) => s.upwellingIntensity)
  const setState = useMapStore((s) => s.setUpwellingIntensity)

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
      return { totalPaths: 0, avgUpwellingVelocity: 0, avgSstAnomaly: 0, avgChlorophyllConcentration: 0 }
    }
    const avgUpwellingVelocity = filteredItems.reduce((sum, e) => sum + e.upwellingVelocity, 0) / filteredItems.length
    const avgSstAnomaly = filteredItems.reduce((sum, e) => sum + e.sstAnomaly, 0) / filteredItems.length
    const avgChlorophyllConcentration = filteredItems.reduce((sum, e) => sum + e.chlorophyllConcentration, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgUpwellingVelocity: Math.round(avgUpwellingVelocity * 100) / 100,
      avgSstAnomaly: Math.round(avgSstAnomaly * 100) / 100,
      avgChlorophyllConcentration: Math.round(avgChlorophyllConcentration * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, upwellingVelocity: e.upwellingVelocity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setUpwellingIntensity({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof UpwellingIntensityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showUpwellingVelocity', label: 'Upwelling Velocity', icon: ArrowUpFromLine },
    { key: 'showSstAnomaly', label: 'SST Anomaly', icon: Thermometer },
    { key: 'showChlorophyllConcentration', label: 'Chlorophyll', icon: Leaf },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <ArrowUpIcon5 className="h-4 w-4 text-emerald-400" />
              Upwelling Intensity Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as UpwellingIntensityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="weak">Weak</SelectItem>
                <SelectItem value="suppressed">Suppressed</SelectItem>
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
              <div className="text-[10px] text-emerald-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-emerald-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Upwelling Vel</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgUpwellingVelocity}</div>
              <div className="text-[9px] text-emerald-400/60">m/day</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg SST Anomaly</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgSstAnomaly}</div>
              <div className="text-[9px] text-emerald-400/60">C</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Chlorophyll</div>
              <div className="text-sm font-semibold text-lime-400">{summary.avgChlorophyllConcentration}</div>
              <div className="text-[9px] text-emerald-400/60">mg/m3</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
              Zones ({filteredItems.length})
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
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/30 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-emerald-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/60">
                        {state.showUpwellingVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-emerald-100 font-medium">{e.upwellingVelocity} m/day</span>
                          </div>
                        )}
                        {state.showSstAnomaly && (
                          <div>
                            SST Anomaly:{' '}
                            <span className="text-emerald-100 font-medium">{e.sstAnomaly} C</span>
                          </div>
                        )}
                        {state.showChlorophyllConcentration && (
                          <div>
                            Chlorophyll:{' '}
                            <span className="text-emerald-100 font-medium">{e.chlorophyllConcentration} mg/m3</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/50 py-4">
                    No zones match the current filter.
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
                    <span className="text-emerald-400/70">Velocity: </span>
                    <span className="font-medium text-green-400">{activeItem.upwellingVelocity} m/day</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">SST Anomaly: </span>
                    <span className="font-medium text-cyan-400">{activeItem.sstAnomaly} C</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Chlorophyll: </span>
                    <span className="font-medium text-lime-400">{activeItem.chlorophyllConcentration} mg/m3</span>
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
