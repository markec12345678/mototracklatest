'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Flame as FlameIcon21, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'me-permian',
    name: 'Permian Basin',
    lat: 31.5,
    lng: -103.0,
    ch4Ppb: 1950,
    fluxKgHr: 88000,
    sourceType: 'Oil/Gas',
    plumeKm: 42,
    status: 'critical',
    description: 'Major oil and gas production basin showing persistent methane super-emitter plumes from infrastructure leaks',
  },
  {
    id: 'me-darvaza',
    name: 'Turkmenistan Darvaza',
    lat: 40.25,
    lng: 58.43,
    ch4Ppb: 2100,
    fluxKgHr: 125000,
    sourceType: 'Gas Crater',
    plumeKm: 18,
    status: 'critical',
    description: 'Burning natural gas crater emitting large volumes of methane with continuous combustion for decades',
  },
  {
    id: 'me-bangladesh',
    name: 'Bangladesh Wetlands',
    lat: 24.0,
    lng: 90.0,
    ch4Ppb: 2080,
    fluxKgHr: 32000,
    sourceType: 'Wetland',
    plumeKm: 75,
    status: 'warning',
    description: 'Extensive flooded wetlands and rice paddies with anaerobic decomposition producing biological methane',
  },
  {
    id: 'me-siberia',
    name: 'Siberian Lakes',
    lat: 65.0,
    lng: 100.0,
    ch4Ppb: 1900,
    fluxKgHr: 18500,
    sourceType: 'Thermokarst',
    plumeKm: 28,
    status: 'warning',
    description: 'Thawing permafrost lakes releasing ancient methane trapped in ice and organic sediments',
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

export function MethaneEmissionSource() {
  const state = useMapStore((s) => s.methaneEmissionSourceTrack)
  const setState = useMapStore((s) => s.setMethaneEmissionSourceTrack)

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
      return { avgCh4: 0, totalFlux: 0, maxPlume: 0, sites: 0 }
    }
    const avgCh4 = filteredItems.reduce((sum, e) => sum + (e.ch4Ppb as number), 0) / filteredItems.length
    const totalFlux = filteredItems.reduce((sum, e) => sum + (e.fluxKgHr as number), 0)
    const maxPlume = Math.max(...filteredItems.map((e) => e.plumeKm as number))
    return {
      avgCh4: avgCh4.toFixed(0),
      totalFlux: totalFlux.toLocaleString(),
      maxPlume: maxPlume,
      sites: filteredItems.length,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setMethaneEmissionSourceTrack({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-600/95 to-yellow-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <FlameIcon21 className="h-4 w-4 text-amber-200" />
              Methane Emission Source
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
              <div className="text-[10px] text-slate-400/70">CH4</div>
              <div className="text-sm font-semibold text-amber-200">{summary.avgCh4}</div>
              <div className="text-[9px] text-slate-400/60">ppb avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Flux</div>
              <div className="text-sm font-semibold text-yellow-200">{summary.totalFlux}</div>
              <div className="text-[9px] text-slate-400/60">kg/hr total</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Max Plume</div>
              <div className="text-sm font-semibold text-orange-200">{summary.maxPlume}</div>
              <div className="text-[9px] text-slate-400/60">km extent</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Active Sites</div>
              <div className="text-sm font-semibold text-slate-200">{summary.sites}</div>
              <div className="text-[9px] text-slate-400/60">emitters</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Methane Sources ({filteredItems.length})
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
                          CH4: <span className="text-slate-100 font-medium">{e.ch4Ppb as number} ppb</span>
                        </div>
                        <div>
                          Flux: <span className="text-slate-100 font-medium">{(e.fluxKgHr as number).toLocaleString()} kg/hr</span>
                        </div>
                        <div>
                          Type: <span className="text-slate-100 font-medium">{e.sourceType as string}</span>
                        </div>
                        <div>
                          Plume: <span className="text-slate-100 font-medium">{e.plumeKm as number} km</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No sources match the current filter.
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
                    <span className="text-slate-400/70">Flux: </span>
                    <span className="font-medium text-amber-200">{(activeItem.fluxKgHr as number).toLocaleString()} kg/hr</span>
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
