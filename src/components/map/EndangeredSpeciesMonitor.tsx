'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { PawPrint as PawPrintIcon, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'es-gorilla',
    name: 'Mountain Gorilla Rwanda',
    lat: -1.500,
    lng: 29.500,
    population: 1063,
    habitatKm2: 780,
    threatLevel: 4,
    birthRate: 2.8,
    status: 'critical',
    description: 'Critically endangered mountain gorilla population in Volcanoes National Park showing steady recovery',
  },
  {
    id: 'es-panda',
    name: 'Giant Panda Sichuan',
    lat: 30.500,
    lng: 103.500,
    population: 1864,
    habitatKm2: 2570,
    threatLevel: 3,
    birthRate: 3.2,
    status: 'moderate',
    description: 'Vulnerable giant panda population across Sichuan bamboo forests with active conservation programs',
  },
  {
    id: 'es-snowleopard',
    name: 'Snow Leopard Himalaya',
    lat: 32.000,
    lng: 78.000,
    population: 4500,
    habitatKm2: 18500,
    threatLevel: 4,
    birthRate: 2.1,
    status: 'warning',
    description: 'Endangered snow leopard population across high Himalayan ranges facing poaching pressure',
  },
  {
    id: 'es-amurleopard',
    name: 'Amur Leopard Russia',
    lat: 43.000,
    lng: 131.000,
    population: 100,
    habitatKm2: 3500,
    threatLevel: 5,
    birthRate: 1.8,
    status: 'critical',
    description: 'Critically endangered Amur leopard in Russian Far East with fewer than 100 individuals remaining',
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

export function EndangeredSpeciesMonitor() {
  const state = useMapStore((s) => s.endangeredSpecies)
  const setState = useMapStore((s) => s.setEndangeredSpecies)

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
      return { totalPopulation: 0, totalHabitat: 0, avgThreat: 0, avgBirthRate: 0 }
    }
    const totalPopulation = filteredItems.reduce((sum, e) => sum + (e.population as number), 0)
    const totalHabitat = filteredItems.reduce((sum, e) => sum + (e.habitatKm2 as number), 0)
    const avgThreat = filteredItems.reduce((sum, e) => sum + (e.threatLevel as number), 0) / filteredItems.length
    const avgBirthRate = filteredItems.reduce((sum, e) => sum + (e.birthRate as number), 0) / filteredItems.length
    return {
      totalPopulation: Math.round(totalPopulation).toLocaleString(),
      totalHabitat: Math.round(totalHabitat).toLocaleString(),
      avgThreat: avgThreat.toFixed(1),
      avgBirthRate: avgBirthRate.toFixed(1),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setEndangeredSpecies({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-600/95 to-green-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <PawPrintIcon className="h-4 w-4 text-emerald-200" />
              Endangered Species Monitor
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
              <div className="text-[10px] text-slate-400/70">Population</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalPopulation}</div>
              <div className="text-[9px] text-slate-400/60">individuals</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Habitat</div>
              <div className="text-sm font-semibold text-green-200">{summary.totalHabitat}</div>
              <div className="text-[9px] text-slate-400/60">km2 total</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Threat Level</div>
              <div className="text-sm font-semibold text-teal-200">{summary.avgThreat}</div>
              <div className="text-[9px] text-slate-400/60">avg 1-5</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Birth Rate</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgBirthRate}%</div>
              <div className="text-[9px] text-slate-400/60">avg annual</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Endangered Species Sites ({filteredItems.length})
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
                          Population: <span className="text-slate-100 font-medium">{(e.population as number).toLocaleString()}</span>
                        </div>
                        <div>
                          Habitat: <span className="text-slate-100 font-medium">{(e.habitatKm2 as number).toLocaleString()} km2</span>
                        </div>
                        <div>
                          Threat: <span className="text-slate-100 font-medium">{e.threatLevel}/5</span>
                        </div>
                        <div>
                          Birth Rate: <span className="text-slate-100 font-medium">{e.birthRate}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No species match the current filter.
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
                    <span className="text-slate-400/70">Population: </span>
                    <span className="font-medium text-emerald-200">{(activeItem.population as number).toLocaleString()}</span>
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
