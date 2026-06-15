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
import { useMapStore, type OpalPaleoMonitorState, type OpalPaleoMonitorData } from '@/lib/map-store'
import { Sparkles as SparklesIcon7, X, FlaskConical, Biohazard, Clock, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: OpalPaleoMonitorData[] = [
  {
    id: 'op-antarctic',
    name: 'Antarctic Opal Core',
    lat: -77.85,
    lng: 166.6667,
    opalConcentration: 15.2,
    diatomCount: 8500,
    sedimentAge: 45,
    status: 'pristine',
    description: 'Pristine diatomaceous sediment',
  },
  {
    id: 'op-subantarctic',
    name: 'Sub-Antarctic Core',
    lat: -52.0,
    lng: 0.0,
    opalConcentration: 8.7,
    diatomCount: 3200,
    sedimentAge: 120,
    status: 'processed',
    description: 'Processed paleoclimate core',
  },
  {
    id: 'op-equatorial',
    name: 'Equatorial Pacific Core',
    lat: 0.5,
    lng: -139.0,
    opalConcentration: 4.2,
    diatomCount: 1200,
    sedimentAge: 250,
    status: 'degraded',
    description: 'Dissolved opal record',
  },
  {
    id: 'op-northatlantic',
    name: 'North Atlantic Core',
    lat: 55.0,
    lng: -30.0,
    opalConcentration: 2.1,
    diatomCount: 450,
    sedimentAge: 800,
    status: 'archived',
    description: 'Archived deep-sea core',
  },
]

const STATUS_COLORS: Record<OpalPaleoMonitorData['status'], { label: string; color: string; bgClass: string }> = {
  pristine: { label: 'Pristine', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  processed: { label: 'Processed', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  degraded: { label: 'Degraded', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  archived: { label: 'Archived', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: OpalPaleoMonitorData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function OpalPaleoMonitor() {
  const state = useMapStore((s) => s.opalPaleoMonitor)
  const setState = useMapStore((s) => s.setOpalPaleoMonitor)

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
      return { totalCores: 0, avgOpal: 0, avgAge: 0, pristineCount: 0 }
    }
    const avgOpal = filteredItems.reduce((sum, e) => sum + e.opalConcentration, 0) / filteredItems.length
    const avgAge = filteredItems.reduce((sum, e) => sum + e.sedimentAge, 0) / filteredItems.length
    const pristineCount = filteredItems.filter((e) => e.status === 'pristine').length
    return {
      totalCores: filteredItems.length,
      avgOpal: Math.round(avgOpal * 10) / 10,
      avgAge: Math.round(avgAge * 10) / 10,
      pristineCount,
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
      properties: { id: e.id, name: e.name, status: e.status, opalConcentration: e.opalConcentration },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setOpalPaleoMonitor({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OpalPaleoMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOpalConcentration', label: 'Opal Concentration', icon: FlaskConical },
    { key: 'showDiatomCount', label: 'Diatom Count', icon: Biohazard },
    { key: 'showSedimentAge', label: 'Sediment Age', icon: Clock },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-purple-950/95 backdrop-blur-xl border border-violet-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <SparklesIcon7 className="h-4 w-4 text-violet-400" />
              Opal Paleo Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-300 hover:text-violet-100 hover:bg-violet-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-violet-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-violet-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as OpalPaleoMonitorState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pristine">Pristine</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-violet-200">
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Total Cores</div>
              <div className="text-sm font-semibold text-violet-200">{summary.totalCores}</div>
              <div className="text-[9px] text-violet-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Opal</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgOpal}</div>
              <div className="text-[9px] text-violet-400/60">μg/g</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Age</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgAge}</div>
              <div className="text-[9px] text-violet-400/60">kyr</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Pristine Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.pristineCount}</div>
              <div className="text-[9px] text-violet-400/60">cores</div>
            </div>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">
              Cores ({filteredItems.length})
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
                          ? 'border-violet-500/50 bg-violet-800/30'
                          : 'border-violet-700/30 hover:border-violet-500/30 hover:bg-violet-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-violet-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300/60">
                        {state.showOpalConcentration && (
                          <div>
                            Opal:{' '}
                            <span className="text-violet-100 font-medium">{e.opalConcentration} μg/g</span>
                          </div>
                        )}
                        {state.showDiatomCount && (
                          <div>
                            Diatoms:{' '}
                            <span className="text-violet-100 font-medium">{e.diatomCount.toLocaleString()} per/g</span>
                          </div>
                        )}
                        {state.showSedimentAge && (
                          <div>
                            Age:{' '}
                            <span className="text-violet-100 font-medium">{e.sedimentAge} kyr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-violet-400/50 py-4">
                    No cores match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-violet-700/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400/70">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Opal: </span>
                    <span className="font-medium text-purple-400">{activeItem.opalConcentration} μg/g</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Diatom Count: </span>
                    <span className="font-medium text-indigo-400">{activeItem.diatomCount.toLocaleString()} per/g</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Sediment Age: </span>
                    <span className="font-medium text-violet-400">{activeItem.sedimentAge} kyr</span>
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
