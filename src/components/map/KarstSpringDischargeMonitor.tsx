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
import { useMapStore, type KarstSpringDischargeState, type KarstSpringDischargeData } from '@/lib/map-store'
import { Droplet as DropletIcon9, X, Thermometer, Zap, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: KarstSpringDischargeData[] = [
  {
    id: 'ks-postojna',
    name: 'Postojna Cave Spring',
    lat: 45.7833,
    lng: 14.2167,
    dischargeRate: 250,
    waterTemperature: 10.5,
    conductivity: 420,
    status: 'flowing',
    description: 'Major karst spring system',
  },
  {
    id: 'ks-vaucluse',
    name: 'Fontaine de Vaucluse',
    lat: 43.92,
    lng: 5.1283,
    dischargeRate: 1500,
    waterTemperature: 13.2,
    conductivity: 380,
    status: 'flooding',
    description: 'Largest spring in France',
  },
  {
    id: 'ks-silver',
    name: 'Silver Springs',
    lat: 29.2167,
    lng: -82.05,
    dischargeRate: 850,
    waterTemperature: 22.1,
    conductivity: 280,
    status: 'seasonal',
    description: 'Florida karst spring group',
  },
  {
    id: 'ks-buna',
    name: 'Buna River Spring',
    lat: 43.3167,
    lng: 17.85,
    dischargeRate: 0,
    waterTemperature: 12.0,
    conductivity: 350,
    status: 'dry',
    description: 'Seasonal karst resurgence',
  },
]

const STATUS_COLORS: Record<KarstSpringDischargeData['status'], { label: string; color: string; bgClass: string }> = {
  flowing: { label: 'Flowing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  seasonal: { label: 'Seasonal', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  dry: { label: 'Dry', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  flooding: { label: 'Flooding', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: KarstSpringDischargeData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function KarstSpringDischargeMonitor() {
  const state = useMapStore((s) => s.karstSpringDischarge)
  const setState = useMapStore((s) => s.setKarstSpringDischarge)

  const items = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return items.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [items, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSprings: 0, avgDischarge: 0, avgTemperature: 0, activeFlowCount: 0 }
    }
    const avgDischarge = Math.round(filteredItems.reduce((sum, e) => sum + e.dischargeRate, 0) / filteredItems.length)
    const avgTemperature = +(filteredItems.reduce((sum, e) => sum + e.waterTemperature, 0) / filteredItems.length).toFixed(1)
    const activeFlowCount = filteredItems.filter((e) => e.status === 'flowing' || e.status === 'flooding').length
    return {
      totalSprings: filteredItems.length,
      avgDischarge,
      avgTemperature,
      activeFlowCount,
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
      properties: { id: e.id, name: e.name, status: e.status, dischargeRate: e.dischargeRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setKarstSpringDischarge({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof KarstSpringDischargeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDischargeRate', label: 'Discharge Rate', icon: DropletIcon9 },
    { key: 'showWaterTemperature', label: 'Water Temperature', icon: Thermometer },
    { key: 'showConductivity', label: 'Conductivity', icon: Zap },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-teal-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <DropletIcon9 className="h-4 w-4 text-blue-400" />
              Karst Spring Discharge
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
                setState({ statusFilter: v as KarstSpringDischargeState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="flowing">Flowing</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="dry">Dry</SelectItem>
                <SelectItem value="flooding">Flooding</SelectItem>
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
              <div className="text-[10px] text-blue-400/70">Total Springs</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalSprings}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Discharge</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgDischarge}</div>
              <div className="text-[9px] text-blue-400/60">L/s</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-blue-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Flowing+Flooding</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeFlowCount}</div>
              <div className="text-[9px] text-blue-400/60">springs</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Springs ({filteredItems.length})
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
                        {state.showDischargeRate && (
                          <div>
                            Discharge:{' '}
                            <span className="text-blue-100 font-medium">{e.dischargeRate} L/s</span>
                          </div>
                        )}
                        {state.showWaterTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-blue-100 font-medium">{e.waterTemperature} °C</span>
                          </div>
                        )}
                        {state.showConductivity && (
                          <div>
                            Conductivity:{' '}
                            <span className="text-blue-100 font-medium">{e.conductivity} μS/cm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No springs match the current filter.
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
                    <span className="text-blue-400/70">Discharge: </span>
                    <span className="font-medium text-teal-400">{activeItem.dischargeRate} L/s</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Temperature: </span>
                    <span className="font-medium text-orange-400">{activeItem.waterTemperature} °C</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Conductivity: </span>
                    <span className="font-medium text-blue-400">{activeItem.conductivity} μS/cm</span>
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
