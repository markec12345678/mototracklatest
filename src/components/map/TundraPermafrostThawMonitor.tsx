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
import { useMapStore, type TundraPermafrostThawState, type TundraPermafrostThawData } from '@/lib/map-store'
import { Thermometer as ThermometerIcon9, X, Layers, Thermometer as GroundTempIcon, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: TundraPermafrostThawData[] = [
  {
    id: 'tp-barrow',
    name: 'Utqiagvik (Barrow)',
    lat: 71.3,
    lng: -156.8,
    activeLayerDepth: 0.8,
    groundTemperature: -5.0,
    thawRate: 0.05,
    status: 'thawing',
    description: 'Rapidly deepening active layer on Alaska North Slope',
  },
  {
    id: 'tp-yakutsk',
    name: 'Yakutsk Permafrost',
    lat: 62.0,
    lng: 129.7,
    activeLayerDepth: 1.5,
    groundTemperature: -2.0,
    thawRate: 0.03,
    status: 'degraded',
    description: 'Degraded permafrost under Siberian city',
  },
  {
    id: 'tp-svalbard',
    name: 'Svalbard Monitoring',
    lat: 78.2,
    lng: 16.0,
    activeLayerDepth: 0.4,
    groundTemperature: -8.0,
    thawRate: 0.01,
    status: 'frozen',
    description: 'Still stable high-Arctic permafrost site',
  },
  {
    id: 'tp-inuvik',
    name: 'Inuvik Thermokarst',
    lat: 68.3,
    lng: -133.7,
    activeLayerDepth: 2.5,
    groundTemperature: -0.5,
    thawRate: 0.12,
    status: 'thermokarst',
    description: 'Active thermokarst terrain with ground collapse',
  },
]

const STATUS_COLORS: Record<TundraPermafrostThawData['status'], { label: string; color: string; bgClass: string }> = {
  frozen: { label: 'Frozen', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  thawing: { label: 'Thawing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  thermokarst: { label: 'Thermokarst', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: TundraPermafrostThawData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TundraPermafrostThawMonitor() {
  const state = useMapStore((s) => s.tundraPermafrostThaw)
  const setState = useMapStore((s) => s.setTundraPermafrostThaw)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : SAMPLE_LOCATIONS),
    [state.sites]
  )

  const filteredItems = useMemo(() => {
    return sites.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [sites, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgActiveLayer: 0, avgGroundTemp: 0, thawingCount: 0 }
    }
    const avgActiveLayer = filteredItems.reduce((sum, s) => sum + s.activeLayerDepth, 0) / filteredItems.length
    const avgGroundTemp = filteredItems.reduce((sum, s) => sum + s.groundTemperature, 0) / filteredItems.length
    const thawingCount = filteredItems.filter((s) => s.status === 'thawing' || s.status === 'degraded').length
    return {
      totalSites: filteredItems.length,
      avgActiveLayer: Math.round(avgActiveLayer * 100) / 100,
      avgGroundTemp: Math.round(avgGroundTemp * 100) / 100,
      thawingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, activeLayerDepth: s.activeLayerDepth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.sites.length === 0) {
      useMapStore.getState().setTundraPermafrostThaw({ sites: SAMPLE_LOCATIONS })
    }
  }, [state.sites.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TundraPermafrostThawState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showActiveLayerDepth', label: 'Active Layer Depth', icon: Layers },
    { key: 'showGroundTemperature', label: 'Ground Temperature', icon: GroundTempIcon },
    { key: 'showThawRate', label: 'Thaw Rate', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-cyan-950/95 backdrop-blur-xl border border-slate-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ThermometerIcon9 className="h-4 w-4 text-cyan-400" />
              Tundra Permafrost Thaw Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as TundraPermafrostThawState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="thawing">Thawing</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="thermokarst">Thermokarst</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
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

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalSites}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Active Layer</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgActiveLayer}</div>
              <div className="text-[9px] text-slate-400/60">m</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Ground Temp</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgGroundTemp}</div>
              <div className="text-[9px] text-slate-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Thawing+ Count</div>
              <div className="text-sm font-semibold text-amber-400">{summary.thawingCount}</div>
              <div className="text-[9px] text-slate-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Sites List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Sites ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeSiteId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSiteId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-slate-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showActiveLayerDepth && (
                          <div>
                            Active Layer:{' '}
                            <span className="text-slate-100 font-medium">{s.activeLayerDepth}m</span>
                          </div>
                        )}
                        {state.showGroundTemperature && (
                          <div>
                            Ground Temp:{' '}
                            <span className="text-slate-100 font-medium">{s.groundTemperature}°C</span>
                          </div>
                        )}
                        {state.showThawRate && (
                          <div>
                            Thaw Rate:{' '}
                            <span className="text-slate-100 font-medium">{s.thawRate}m/yr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Active Layer: </span>
                    <span className="font-medium text-cyan-400">{activeItem.activeLayerDepth}m</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Ground Temp: </span>
                    <span className="font-medium text-blue-400">{activeItem.groundTemperature}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Thaw Rate: </span>
                    <span className="font-medium text-amber-400">{activeItem.thawRate}m/yr</span>
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
