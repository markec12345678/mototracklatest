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
import { useMapStore, type SnowCoverDurationState, type SnowCoverDurationData } from '@/lib/map-store'
import { Cloud as CloudIcon6, X, Calendar, ArrowRight, Clock, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SnowCoverDurationData[] = [
  {
    id: 'scd-siberia',
    name: 'Siberia',
    lat: 62,
    lng: 100,
    snowDays: 220,
    snowOnsetDate: 260,
    snowMeltDate: 130,
    status: 'prolonged',
    description: 'Extended snow cover in central Siberia',
  },
  {
    id: 'scd-alps',
    name: 'Alps',
    lat: 47,
    lng: 12,
    snowDays: 150,
    snowOnsetDate: 300,
    snowMeltDate: 110,
    status: 'normal',
    description: 'Normal Alpine snow cover duration',
  },
  {
    id: 'scd-rockies',
    name: 'Rockies',
    lat: 40,
    lng: -106,
    snowDays: 90,
    snowOnsetDate: 320,
    snowMeltDate: 85,
    status: 'shortened',
    description: 'Shortened snow season in the Rockies',
  },
  {
    id: 'scd-sahara',
    name: 'Sahara Edge',
    lat: 30,
    lng: 0,
    snowDays: 0,
    snowOnsetDate: 0,
    snowMeltDate: 0,
    status: 'absent',
    description: 'No snow cover at Sahara desert fringe',
  },
]

const STATUS_COLORS: Record<SnowCoverDurationData['status'], { label: string; color: string; bgClass: string }> = {
  prolonged: { label: 'Prolonged', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  shortened: { label: 'Shortened', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  absent: { label: 'Absent', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
}

function TrendIcon({ status }: { status: SnowCoverDurationData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SnowCoverDurationMonitor() {
  const state = useMapStore((s) => s.snowCoverDuration)
  const setState = useMapStore((s) => s.setSnowCoverDuration)

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
      return { totalRegions: 0, avgSnowDays: 0, avgOnset: 0, avgMelt: 0 }
    }
    const avgSnowDays = filteredItems.reduce((sum, e) => sum + e.snowDays, 0) / filteredItems.length
    const avgOnset = filteredItems.reduce((sum, e) => sum + e.snowOnsetDate, 0) / filteredItems.length
    const avgMelt = filteredItems.reduce((sum, e) => sum + e.snowMeltDate, 0) / filteredItems.length
    return {
      totalRegions: filteredItems.length,
      avgSnowDays: Math.round(avgSnowDays),
      avgOnset: Math.round(avgOnset),
      avgMelt: Math.round(avgMelt),
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
      properties: { id: e.id, name: e.name, status: e.status, snowDays: e.snowDays },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSnowCoverDuration({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SnowCoverDurationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSnowDays', label: 'Snow Days', icon: Calendar },
    { key: 'showSnowOnsetDate', label: 'Snow Onset Date', icon: ArrowRight },
    { key: 'showSnowMeltDate', label: 'Snow Melt Date', icon: Clock },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-sky-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CloudIcon6 className="h-4 w-4 text-sky-400" />
              Snow Cover Duration Monitor
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
                setState({ statusFilter: v as SnowCoverDurationState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="prolonged">Prolonged</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="shortened">Shortened</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Regions</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalRegions}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Snow Days</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgSnowDays}</div>
              <div className="text-[9px] text-slate-400/60">days/year</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Onset</div>
              <div className="text-sm font-semibold text-slate-300">{summary.avgOnset}</div>
              <div className="text-[9px] text-slate-400/60">day of year</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Melt</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgMelt}</div>
              <div className="text-[9px] text-slate-400/60">day of year</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Regions ({filteredItems.length})
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
                        {state.showSnowDays && (
                          <div>
                            Snow Days:{' '}
                            <span className="text-slate-100 font-medium">{e.snowDays} days</span>
                          </div>
                        )}
                        {state.showSnowOnsetDate && (
                          <div>
                            Onset:{' '}
                            <span className="text-slate-100 font-medium">Day {e.snowOnsetDate}</span>
                          </div>
                        )}
                        {state.showSnowMeltDate && (
                          <div>
                            Melt:{' '}
                            <span className="text-slate-100 font-medium">Day {e.snowMeltDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No regions match the current filter.
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
                    <span className="text-slate-400/70">Snow Days: </span>
                    <span className="font-medium text-sky-400">{activeItem.snowDays} days</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Onset: </span>
                    <span className="font-medium text-slate-300">Day {activeItem.snowOnsetDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Melt: </span>
                    <span className="font-medium text-slate-400">Day {activeItem.snowMeltDate}</span>
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
