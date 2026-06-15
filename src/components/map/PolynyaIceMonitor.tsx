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
import { useMapStore, type PolynyaIceState, type PolynyaIceData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon10, X, AreaChart, Thermometer, MapPin, Filter, Waves } from 'lucide-react'

const SAMPLE_LOCATIONS: PolynyaIceData[] = [
  {
    id: 'pi-weddell',
    name: 'Weddell Polynya',
    lat: -64.0,
    lng: -5.0,
    area: 30000,
    iceThickness: 0.1,
    waterTemperature: -1.8,
    status: 'open',
    description: 'Large persistent polynya in Weddell Sea',
  },
  {
    id: 'pi-north-water',
    name: 'North Water Polynya',
    lat: 77.0,
    lng: -70.0,
    area: 80000,
    iceThickness: 0.0,
    waterTemperature: -1.5,
    status: 'permanent',
    description: 'Largest Arctic polynya in Baffin Bay',
  },
  {
    id: 'pi-ross',
    name: 'Ross Sea Polynya',
    lat: -76.0,
    lng: 175.0,
    area: 15000,
    iceThickness: 0.3,
    waterTemperature: -1.9,
    status: 'seasonal',
    description: 'Seasonal opening in Ross Sea ice cover',
  },
  {
    id: 'pi-caspian',
    name: 'Kara Sea Polynya',
    lat: 73.0,
    lng: 60.0,
    area: 5000,
    iceThickness: 0.5,
    waterTemperature: -1.7,
    status: 'refreezing',
    description: 'Late-season polynya beginning to refreeze',
  },
]

const STATUS_COLORS: Record<PolynyaIceData['status'], { label: string; color: string; bgClass: string }> = {
  open: { label: 'Open', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  refreezing: { label: 'Refreezing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  seasonal: { label: 'Seasonal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  permanent: { label: 'Permanent', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
}

function TrendIcon({ status }: { status: PolynyaIceData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PolynyaIceMonitor() {
  const state = useMapStore((s) => s.polynyaIce)
  const setState = useMapStore((s) => s.setPolynyaIce)

  const polynyas = useMemo(
    () => (state.polynyas.length > 0 ? state.polynyas : SAMPLE_LOCATIONS),
    [state.polynyas]
  )

  const filteredItems = useMemo(() => {
    return polynyas.filter((p) => {
      if (state.statusFilter !== 'all' && p.status !== state.statusFilter) return false
      return true
    })
  }, [polynyas, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalPolynyas: 0, totalArea: 0, avgIceThickness: 0, openCount: 0 }
    }
    const totalArea = filteredItems.reduce((sum, p) => sum + p.area, 0)
    const avgIceThickness = filteredItems.reduce((sum, p) => sum + p.iceThickness, 0) / filteredItems.length
    const openCount = filteredItems.filter((p) => p.status === 'open').length
    return {
      totalPolynyas: filteredItems.length,
      totalArea: Math.round(totalArea),
      avgIceThickness: Math.round(avgIceThickness * 100) / 100,
      openCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => polynyas.find((p) => p.id === state.activePolynyaId) ?? null,
    [polynyas, state.activePolynyaId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      properties: { id: p.id, name: p.name, status: p.status, area: p.area },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.polynyas.length === 0) {
      useMapStore.getState().setPolynyaIce({ polynyas: SAMPLE_LOCATIONS })
    }
  }, [state.polynyas.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PolynyaIceState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showArea', label: 'Area', icon: AreaChart },
    { key: 'showIceThickness', label: 'Ice Thickness', icon: SnowflakeIcon10 },
    { key: 'showWaterTemperature', label: 'Water Temperature', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-sky-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <SnowflakeIcon10 className="h-4 w-4 text-sky-400" />
              Polynya Ice Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-sky-100 hover:bg-sky-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sky-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-sky-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as PolynyaIceState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="refreezing">Refreezing</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-200">
                  <Icon className="h-3 w-3 text-sky-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Total Polynyas</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalPolynyas}</div>
              <div className="text-[9px] text-sky-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Total Area</div>
              <div className="text-sm font-semibold text-blue-400">{summary.totalArea.toLocaleString()}</div>
              <div className="text-[9px] text-sky-400/60">km²</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Ice Thickness</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgIceThickness}</div>
              <div className="text-[9px] text-sky-400/60">m</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Open Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.openCount}</div>
              <div className="text-[9px] text-sky-400/60">polynyas</div>
            </div>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Polynya List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">
              Polynyas ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((p) => {
                  const isActive = state.activePolynyaId === p.id
                  const statusCfg = STATUS_COLORS[p.status]
                  return (
                    <div
                      key={p.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-800/30'
                          : 'border-sky-700/30 hover:border-sky-500/30 hover:bg-sky-800/20'
                      }`}
                      onClick={() =>
                        setState({ activePolynyaId: isActive ? null : p.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={p.status} />
                          <span className="text-xs font-medium text-sky-100">{p.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300/60">
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-sky-100 font-medium">{p.area.toLocaleString()} km²</span>
                          </div>
                        )}
                        {state.showIceThickness && (
                          <div>
                            Ice Thickness:{' '}
                            <span className="text-sky-100 font-medium">{p.iceThickness} m</span>
                          </div>
                        )}
                        {state.showWaterTemperature && (
                          <div>
                            Water Temp:{' '}
                            <span className="text-sky-100 font-medium">{p.waterTemperature}°C</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-sky-400/50 py-4">
                    No polynyas match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Polynya Details */}
          {activeItem && (
            <>
              <Separator className="bg-sky-700/30" />
              <div className="space-y-2 rounded-lg border border-sky-600/30 bg-sky-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-sky-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400/70">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Area: </span>
                    <span className="font-medium text-blue-400">{activeItem.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Ice Thickness: </span>
                    <span className="font-medium text-cyan-400">{activeItem.iceThickness} m</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Water Temp: </span>
                    <span className="font-medium text-sky-200">{activeItem.waterTemperature}°C</span>
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
