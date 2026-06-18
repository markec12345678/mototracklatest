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
import { useMapStore, type UndergroundMineVentState, type UndergroundMineVentData } from '@/lib/map-store'
import { Wind as WindIcon13, X, Flame, Thermometer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: UndergroundMineVentData[] = [
  {
    id: 'umv-south',
    name: 'South African Deep',
    lat: -26.1300,
    lng: 28.2500,
    airflowRate: 85,
    methaneLevel: 0.8,
    temperature: 38,
    status: 'dangerous',
    description: 'Dangerous methane levels at depth',
  },
  {
    id: 'umv-ruwashi',
    name: 'Ruashi Copper Mine',
    lat: -11.2500,
    lng: 27.6200,
    airflowRate: 45,
    methaneLevel: 0.4,
    temperature: 28,
    status: 'alert',
    description: 'Alert level ventilation conditions',
  },
  {
    id: 'umv-kiruna',
    name: 'Kiruna Iron Mine',
    lat: 67.8500,
    lng: 20.2000,
    airflowRate: 120,
    methaneLevel: 0.05,
    temperature: 15,
    status: 'adequate',
    description: 'Adequate ventilation in subarctic mine',
  },
  {
    id: 'umv-olympic',
    name: 'Olympic Dam',
    lat: -30.4400,
    lng: 136.8900,
    airflowRate: 200,
    methaneLevel: 0.01,
    temperature: 22,
    status: 'optimal',
    description: 'Optimal ventilation conditions',
  },
]

const STATUS_COLORS: Record<UndergroundMineVentData['status'], { label: string; color: string; bgClass: string }> = {
  dangerous: { label: 'Dangerous', color: '#dc2626', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  alert: { label: 'Alert', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  adequate: { label: 'Adequate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  optimal: { label: 'Optimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: UndergroundMineVentData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function UndergroundMineVentMonitor() {
  const state = useMapStore((s) => s.undergroundMineVent)
  const setState = useMapStore((s) => s.setUndergroundMineVent)

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
      return { totalPaths: 0, avgAirflowRate: 0, avgMethaneLevel: 0, dangerousAlertCount: 0 }
    }
    const avgAirflowRate = filteredItems.reduce((sum, e) => sum + e.airflowRate, 0) / filteredItems.length
    const avgMethaneLevel = filteredItems.reduce((sum, e) => sum + e.methaneLevel, 0) / filteredItems.length
    const dangerousAlertCount = filteredItems.filter((e) => e.status === 'dangerous' || e.status === 'alert').length
    return {
      totalPaths: filteredItems.length,
      avgAirflowRate: Math.round(avgAirflowRate * 10) / 10,
      avgMethaneLevel: Math.round(avgMethaneLevel * 100) / 100,
      dangerousAlertCount,
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
      properties: { id: e.id, name: e.name, status: e.status, airflowRate: e.airflowRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setUndergroundMineVent({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof UndergroundMineVentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAirflowRate', label: 'Airflow Rate', icon: WindIcon13 },
    { key: 'showMethaneLevel', label: 'Methane Level', icon: Flame },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-blue-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <WindIcon13 className="h-4 w-4 text-blue-400" />
              Underground Mine Vent Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as UndergroundMineVentState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="dangerous">Dangerous</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
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

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Airflow</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgAirflowRate}</div>
              <div className="text-[9px] text-slate-400/60">m3/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Methane</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgMethaneLevel}</div>
              <div className="text-[9px] text-slate-400/60">%</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Dangerous+Alert</div>
              <div className="text-sm font-semibold text-red-400">{summary.dangerousAlertCount}</div>
              <div className="text-[9px] text-slate-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
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
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-slate-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showAirflowRate && (
                          <div>
                            Airflow:{' '}
                            <span className="text-slate-100 font-medium">{e.airflowRate} m3/s</span>
                          </div>
                        )}
                        {state.showMethaneLevel && (
                          <div>
                            Methane:{' '}
                            <span className="text-slate-100 font-medium">{e.methaneLevel}%</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-slate-100 font-medium">{e.temperature} C</span>
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

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
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
                    <span className="text-slate-400/70">Airflow: </span>
                    <span className="font-medium text-blue-400">{activeItem.airflowRate} m3/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Methane: </span>
                    <span className="font-medium text-red-400">{activeItem.methaneLevel}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Temperature: </span>
                    <span className="font-medium text-orange-400">{activeItem.temperature} C</span>
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
