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
import { useMapStore, type IceCoreRecordState, type IceCoreRecordData } from '@/lib/map-store'
import { FlaskConical as FlaskConicalIcon3, X, ArrowDown, Clock, Cloud, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IceCoreRecordData[] = [
  {
    id: 'icr-vostok',
    name: 'Vostok Station',
    lat: -78,
    lng: 106,
    coreDepth: 3623,
    oldestIceAge: 420,
    co2Concentration: 280,
    status: 'completed',
    description: 'Longest ice core record spanning 420 kyr',
  },
  {
    id: 'icr-epica',
    name: 'EPICA Dome C',
    lat: -75,
    lng: 123,
    coreDepth: 3270,
    oldestIceAge: 800,
    co2Concentration: 185,
    status: 'completed',
    description: 'Oldest continuous ice core at 800 kyr BP',
  },
  {
    id: 'icr-gisp2',
    name: 'GISP2 Greenland',
    lat: 72,
    lng: -38,
    coreDepth: 3053,
    oldestIceAge: 110,
    co2Concentration: 290,
    status: 'archived',
    description: 'Greenland Ice Sheet Project 2 deep core',
  },
  {
    id: 'icr-neem',
    name: 'NEEM Camp',
    lat: 77,
    lng: -51,
    coreDepth: 2540,
    oldestIceAge: 128,
    co2Concentration: 310,
    status: 'drilling',
    description: 'North Eemian deep ice core in progress',
  },
]

const STATUS_COLORS: Record<IceCoreRecordData['status'], { label: string; color: string; bgClass: string }> = {
  recovering: { label: 'Recovering', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  drilling: { label: 'Drilling', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  completed: { label: 'Completed', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  archived: { label: 'Archived', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
}

function TrendIcon({ status }: { status: IceCoreRecordData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IceCoreRecordMonitor() {
  const state = useMapStore((s) => s.iceCoreRecord)
  const setState = useMapStore((s) => s.setIceCoreRecord)

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
      return { totalCores: 0, avgDepth: 0, avgAge: 0, avgCo2: 0 }
    }
    const avgDepth = filteredItems.reduce((sum, e) => sum + e.coreDepth, 0) / filteredItems.length
    const avgAge = filteredItems.reduce((sum, e) => sum + e.oldestIceAge, 0) / filteredItems.length
    const avgCo2 = filteredItems.reduce((sum, e) => sum + e.co2Concentration, 0) / filteredItems.length
    return {
      totalCores: filteredItems.length,
      avgDepth: Math.round(avgDepth),
      avgAge: Math.round(avgAge),
      avgCo2: Math.round(avgCo2),
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
      properties: { id: e.id, name: e.name, status: e.status, coreDepth: e.coreDepth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setIceCoreRecord({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IceCoreRecordState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCoreDepth', label: 'Core Depth', icon: ArrowDown },
    { key: 'showOldestIceAge', label: 'Oldest Ice Age', icon: Clock },
    { key: 'showCo2Concentration', label: 'CO2 Concentration', icon: Cloud },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-indigo-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <FlaskConicalIcon3 className="h-4 w-4 text-violet-400" />
              Ice Core Record Monitor
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
                setState({ statusFilter: v as IceCoreRecordState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
                <SelectItem value="drilling">Drilling</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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
                  <Icon className="h-3 w-3 text-slate-400" />
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

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Cores</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalCores}</div>
              <div className="text-[9px] text-slate-400/60">drilled</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgDepth}</div>
              <div className="text-[9px] text-slate-400/60">m</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Age</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgAge}</div>
              <div className="text-[9px] text-slate-400/60">kyr BP</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg CO2</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgCo2}</div>
              <div className="text-[9px] text-slate-400/60">ppm</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Ice Cores ({filteredItems.length})
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
                        {state.showCoreDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-slate-100 font-medium">{e.coreDepth} m</span>
                          </div>
                        )}
                        {state.showOldestIceAge && (
                          <div>
                            Oldest Ice:{' '}
                            <span className="text-slate-100 font-medium">{e.oldestIceAge} kyr</span>
                          </div>
                        )}
                        {state.showCo2Concentration && (
                          <div>
                            CO2:{' '}
                            <span className="text-slate-100 font-medium">{e.co2Concentration} ppm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No cores match the current filter.
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
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
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
                    <span className="text-slate-400/70">Depth: </span>
                    <span className="font-medium text-violet-400">{activeItem.coreDepth} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Oldest Ice: </span>
                    <span className="font-medium text-indigo-400">{activeItem.oldestIceAge} kyr BP</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">CO2: </span>
                    <span className="font-medium text-slate-400">{activeItem.co2Concentration} ppm</span>
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
