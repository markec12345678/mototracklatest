'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Activity as ActivityIcon10, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'cas-turkey',
    name: 'Turkey Quake',
    lat: 37.000,
    lng: 36.000,
    affected: 13500000,
    injured: 107000,
    missing: 4200,
    displaced: 1500000,
    status: 'critical',
    description: 'Devastating M7.8 earthquake sequence affecting millions across southeastern Turkey',
  },
  {
    id: 'cas-ukraine',
    name: 'Ukraine Conflict',
    lat: 49.000,
    lng: 32.000,
    affected: 17800000,
    injured: 85000,
    missing: 18000,
    displaced: 6500000,
    status: 'warning',
    description: 'Ongoing armed conflict causing massive population displacement and casualty counts',
  },
  {
    id: 'cas-yemen',
    name: 'Yemen Crisis',
    lat: 15.500,
    lng: 44.000,
    affected: 23400000,
    injured: 165000,
    missing: 7800,
    displaced: 4300000,
    status: 'moderate',
    description: 'Protracted humanitarian crisis with sustained casualty and displacement levels',
  },
  {
    id: 'cas-sudan',
    name: 'Sudan Conflict',
    lat: 12.863,
    lng: 30.218,
    affected: 24800000,
    injured: 92000,
    missing: 5200,
    displaced: 7100000,
    status: 'stable',
    description: 'Civil conflict tracking data with stable reporting cadence from humanitarian agencies',
  },
]

const STATUS_COLORS: Record<string, { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.stable
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CasualtyTrackingMonitor() {
  const state = useMapStore((s) => s.casualtyTracking)
  const setState = useMapStore((s) => s.setCasualtyTracking)

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
      return { totalZones: 0, avgAffected: 0, avgInjured: 0, avgDisplaced: 0 }
    }
    const avgAffected = filteredItems.reduce((sum, e) => sum + (e.affected as number), 0) / filteredItems.length
    const avgInjured = filteredItems.reduce((sum, e) => sum + (e.injured as number), 0) / filteredItems.length
    const avgDisplaced = filteredItems.reduce((sum, e) => sum + (e.displaced as number), 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgAffected: Math.round(avgAffected),
      avgInjured: Math.round(avgInjured),
      avgDisplaced: Math.round(avgDisplaced),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCasualtyTracking({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-600/95 to-gray-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ActivityIcon10 className="h-4 w-4 text-slate-200" />
              Casualty Tracking Monitor
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
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <select
              className="mt-1 w-full h-8 text-xs bg-slate-900/40 border border-slate-700/40 rounded-md px-2 text-slate-100"
              value={state.statusFilter || 'all'}
              onChange={(e) => setState({ statusFilter: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="moderate">Moderate</option>
              <option value="stable">Stable</option>
            </select>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Affected</div>
              <div className="text-sm font-semibold text-gray-200">{(summary.avgAffected / 1000000).toFixed(1)}M</div>
              <div className="text-[9px] text-slate-400/60">avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Injured</div>
              <div className="text-sm font-semibold text-amber-200">{(summary.avgInjured / 1000).toFixed(0)}K</div>
              <div className="text-[9px] text-slate-400/60">avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Displaced</div>
              <div className="text-sm font-semibold text-slate-200">{(summary.avgDisplaced / 1000000).toFixed(1)}M</div>
              <div className="text-[9px] text-slate-400/60">avg</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Tracking Zones ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status as string] ?? STATUS_COLORS.stable
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
                          <TrendIcon status={e.status as string} />
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
                        <div>
                          Affected: <span className="text-slate-100 font-medium">{((e.affected as number) / 1000000).toFixed(1)}M</span>
                        </div>
                        <div>
                          Injured: <span className="text-slate-100 font-medium">{((e.injured as number) / 1000).toFixed(0)}K</span>
                        </div>
                        <div>
                          Missing: <span className="text-slate-100 font-medium">{((e.missing as number) / 1000).toFixed(1)}K</span>
                        </div>
                        <div>
                          Displaced: <span className="text-slate-100 font-medium">{((e.displaced as number) / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status as string]?.bgClass ?? STATUS_COLORS.stable.bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status as string]?.label ?? 'Stable'}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description as string}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {(activeItem.lat as number).toFixed(2)}, {(activeItem.lng as number).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Affected: </span>
                    <span className="font-medium text-slate-200">{((activeItem.affected as number) / 1000000).toFixed(1)}M</span>
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
