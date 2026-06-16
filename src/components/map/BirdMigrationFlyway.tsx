'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Bird as BirdIcon6, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'bm-mississippi',
    name: 'Mississippi Flyway',
    lat: 35.000,
    lng: -90.000,
    speciesCount: 325,
    birdsTracked: 4250000,
    stopoverSites: 87,
    distanceKm: 4200,
    status: 'stable',
    description: 'Major North American migration corridor following the Mississippi River from Canada to Gulf coast',
  },
  {
    id: 'bm-eastatlantic',
    name: 'East Atlantic Flyway',
    lat: 50.000,
    lng: 0.000,
    speciesCount: 270,
    birdsTracked: 3100000,
    stopoverSites: 64,
    distanceKm: 5800,
    status: 'moderate',
    description: 'European-African flyway connecting Arctic breeding grounds with West African wintering areas',
  },
  {
    id: 'bm-eastasian',
    name: 'East Asian Flyway',
    lat: 35.000,
    lng: 120.000,
    speciesCount: 250,
    birdsTracked: 5200000,
    stopoverSites: 72,
    distanceKm: 6100,
    status: 'warning',
    description: 'Critically threatened flyway connecting Siberian breeding areas with Southeast Asian wintering grounds',
  },
  {
    id: 'bm-centralasian',
    name: 'Central Asian Flyway',
    lat: 45.000,
    lng: 70.000,
    speciesCount: 182,
    birdsTracked: 1850000,
    stopoverSites: 45,
    distanceKm: 4900,
    status: 'warning',
    description: 'Migration route across Central Asia linking Siberia with Indian subcontinent wintering habitats',
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

export function BirdMigrationFlyway() {
  const state = useMapStore((s) => s.birdMigrationFlyway)
  const setState = useMapStore((s) => s.setBirdMigrationFlyway)

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
      return { totalSpecies: 0, totalBirds: 0, totalStopovers: 0, avgDistance: 0 }
    }
    const totalSpecies = filteredItems.reduce((sum, e) => sum + (e.speciesCount as number), 0)
    const totalBirds = filteredItems.reduce((sum, e) => sum + (e.birdsTracked as number), 0)
    const totalStopovers = filteredItems.reduce((sum, e) => sum + (e.stopoverSites as number), 0)
    const avgDistance = filteredItems.reduce((sum, e) => sum + (e.distanceKm as number), 0) / filteredItems.length
    return {
      totalSpecies: Math.round(totalSpecies),
      totalBirds: (totalBirds / 1000000).toFixed(1),
      totalStopovers: Math.round(totalStopovers),
      avgDistance: Math.round(avgDistance).toLocaleString(),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setBirdMigrationFlyway({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-600/95 to-blue-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <BirdIcon6 className="h-4 w-4 text-sky-200" />
              Bird Migration Flyway
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
              <div className="text-[10px] text-slate-400/70">Species Count</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalSpecies}</div>
              <div className="text-[9px] text-slate-400/60">species total</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Birds Tracked</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalBirds}M</div>
              <div className="text-[9px] text-slate-400/60">individuals</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Stopover Sites</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalStopovers}</div>
              <div className="text-[9px] text-slate-400/60">total sites</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Distance</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgDistance}</div>
              <div className="text-[9px] text-slate-400/60">km avg</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Migration Flyways ({filteredItems.length})
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
                          Species: <span className="text-slate-100 font-medium">{e.speciesCount}</span>
                        </div>
                        <div>
                          Tracked: <span className="text-slate-100 font-medium">{((e.birdsTracked as number) / 1000000).toFixed(1)}M</span>
                        </div>
                        <div>
                          Stopovers: <span className="text-slate-100 font-medium">{e.stopoverSites}</span>
                        </div>
                        <div>
                          Distance: <span className="text-slate-100 font-medium">{(e.distanceKm as number).toLocaleString()} km</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No flyways match the current filter.
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
                    <span className="text-slate-400/70">Species: </span>
                    <span className="font-medium text-sky-200">{activeItem.speciesCount as number}</span>
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
