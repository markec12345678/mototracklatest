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
import { useMapStore, type HyporheicZoneState, type HyporheicZoneData } from '@/lib/map-store'
import { Droplets as DropletsIcon13, X, ArrowLeftRight, Clock, Thermometer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: HyporheicZoneData[] = [
  {
    id: 'hz-columbia',
    name: 'Columbia River Hyporheic',
    lat: 46.2,
    lng: -119.1,
    exchangeRate: 2.5,
    residenceTime: 4.2,
    temperature: 12.5,
    status: 'active',
    description: 'Large river exchange zone',
  },
  {
    id: 'hz-snake',
    name: 'Snake River Downwelling',
    lat: 43.5833,
    lng: -116.5667,
    exchangeRate: 0.8,
    residenceTime: 8.5,
    temperature: 10.2,
    status: 'restricted',
    description: 'Sediment-clogged zone',
  },
  {
    id: 'hz-colorado',
    name: 'Colorado River Alluvial',
    lat: 36.0167,
    lng: -111.8167,
    exchangeRate: 0.3,
    residenceTime: 24.0,
    temperature: 15.0,
    status: 'stagnant',
    description: 'Low gradient exchange',
  },
  {
    id: 'hz-willamette',
    name: 'Willamette Valley',
    lat: 44.9167,
    lng: -123.0333,
    exchangeRate: 1.8,
    residenceTime: 3.1,
    temperature: 11.8,
    status: 'flowing',
    description: 'Active upwelling zone',
  },
]

const STATUS_COLORS: Record<HyporheicZoneData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  restricted: { label: 'Restricted', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stagnant: { label: 'Stagnant', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  flowing: { label: 'Flowing', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: HyporheicZoneData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HyporheicZoneMonitor() {
  const state = useMapStore((s) => s.hyporheicZone)
  const setState = useMapStore((s) => s.setHyporheicZone)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgExchange: 0, avgResidence: 0, activeFlowingCount: 0 }
    }
    const avgExchange = filteredItems.reduce((sum, e) => sum + e.exchangeRate, 0) / filteredItems.length
    const avgResidence = filteredItems.reduce((sum, e) => sum + e.residenceTime, 0) / filteredItems.length
    const activeFlowingCount = filteredItems.filter((e) => e.status === 'active' || e.status === 'flowing').length
    return {
      totalSites: filteredItems.length,
      avgExchange,
      avgResidence,
      activeFlowingCount,
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
      properties: { id: e.id, name: e.name, status: e.status, exchangeRate: e.exchangeRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setHyporheicZone({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HyporheicZoneState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showExchangeRate', label: 'Exchange Rate', icon: ArrowLeftRight },
    { key: 'showResidenceTime', label: 'Residence Time', icon: Clock },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-cyan-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <DropletsIcon13 className="h-4 w-4 text-blue-400" />
              Hyporheic Zone
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-blue-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as HyporheicZoneState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="stagnant">Stagnant</SelectItem>
                <SelectItem value="flowing">Flowing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalSites}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Exchange</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgExchange.toFixed(1)}</div>
              <div className="text-[9px] text-blue-400/60">L/m²/s</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Residence</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgResidence.toFixed(1)}</div>
              <div className="text-[9px] text-blue-400/60">hr</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Active+Flowing</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeFlowingCount}</div>
              <div className="text-[9px] text-blue-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
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
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-blue-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showExchangeRate && (
                          <div>
                            Exchange:{' '}
                            <span className="text-blue-100 font-medium">{e.exchangeRate} L/m²/s</span>
                          </div>
                        )}
                        {state.showResidenceTime && (
                          <div>
                            Residence:{' '}
                            <span className="text-blue-100 font-medium">{e.residenceTime} hr</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-blue-100 font-medium">{e.temperature} °C</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-blue-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400/70">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Exchange: </span>
                    <span className="font-medium text-cyan-400">{activeItem.exchangeRate} L/m²/s</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Residence: </span>
                    <span className="font-medium text-sky-400">{activeItem.residenceTime} hr</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Temperature: </span>
                    <span className="font-medium text-blue-400">{activeItem.temperature} °C</span>
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
