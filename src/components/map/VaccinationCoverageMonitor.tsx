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
import { useMapStore, type VaccinationCoverageState, type VaccinationCoverageData } from '@/lib/map-store'
import { Syringe as SyringeIcon, X, Activity, BarChart3, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: VaccinationCoverageData[] = [
  {
    id: 'vc-subsaharan',
    name: 'SubSaharan Africa',
    lat: 5.000,
    lng: 20.000,
    coverageRate: 52,
    doseCompletion: 41,
    boosterUptake: 12,
    hesitancyIndex: 34,
    status: 'critical',
    description: 'Low vaccination coverage across SubSaharan Africa with supply chain challenges',
  },
  {
    id: 'vc-southasia',
    name: 'South Asia India',
    lat: 22.500,
    lng: 78.500,
    coverageRate: 78,
    doseCompletion: 65,
    boosterUptake: 28,
    hesitancyIndex: 22,
    status: 'on_track',
    description: 'India making steady progress in national immunization programs',
  },
  {
    id: 'vc-seasia',
    name: 'SE Asia',
    lat: 10.500,
    lng: 106.000,
    coverageRate: 68,
    doseCompletion: 55,
    boosterUptake: 18,
    hesitancyIndex: 28,
    status: 'below_target',
    description: 'Southeast Asia facing challenges in rural vaccine distribution',
  },
  {
    id: 'vc-latinamerica',
    name: 'Latin America',
    lat: -10.000,
    lng: -55.000,
    coverageRate: 85,
    doseCompletion: 72,
    boosterUptake: 38,
    hesitancyIndex: 15,
    status: 'achieved',
    description: 'Strong immunization infrastructure across Latin American nations',
  },
]

const STATUS_COLORS: Record<VaccinationCoverageData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  below_target: { label: 'Below Target', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  on_track: { label: 'On Track', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  achieved: { label: 'Achieved', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: VaccinationCoverageData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VaccinationCoverageMonitor() {
  const state = useMapStore((s) => s.vaccinationCoverage)
  const setState = useMapStore((s) => s.setVaccinationCoverage)

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
      return { totalRegions: 0, avgCoverage: 0, avgDoses: 0, avgHesitancy: 0 }
    }
    const avgCoverage = filteredItems.reduce((sum, e) => sum + e.coverageRate, 0) / filteredItems.length
    const avgDoses = filteredItems.reduce((sum, e) => sum + e.doseCompletion, 0) / filteredItems.length
    const avgHesitancy = filteredItems.reduce((sum, e) => sum + e.hesitancyIndex, 0) / filteredItems.length
    return {
      totalRegions: filteredItems.length,
      avgCoverage: avgCoverage.toFixed(1),
      avgDoses: avgDoses.toFixed(1),
      avgHesitancy: avgHesitancy.toFixed(1),
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
      properties: { id: e.id, name: e.name, status: e.status, coverageRate: e.coverageRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setVaccinationCoverage({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VaccinationCoverageState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCoverageRate', label: 'Coverage %', icon: BarChart3 },
    { key: 'showDoseCompletion', label: 'Doses Given', icon: SyringeIcon },
    { key: 'showBoosterUptake', label: 'Supply Level', icon: Activity },
    { key: 'showHesitancyIndex', label: 'Dropout Rate', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-blue-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <SyringeIcon className="h-4 w-4 text-blue-400" />
              Vaccination Coverage Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as VaccinationCoverageState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="below_target">Below Target</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="achieved">Achieved</SelectItem>
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
              <div className="text-[10px] text-blue-400/70">Coverage %</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgCoverage}%</div>
              <div className="text-[9px] text-blue-400/60">average</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Doses Given</div>
              <div className="text-sm font-semibold text-indigo-300">{summary.avgDoses}%</div>
              <div className="text-[9px] text-blue-400/60">completion</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Dropout Rate</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgHesitancy}%</div>
              <div className="text-[9px] text-blue-400/60">hesitancy index</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Regions</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalRegions}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Coverage Regions ({filteredItems.length})
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
                        {state.showCoverageRate && (
                          <div>
                            Coverage:{' '}
                            <span className="text-blue-100 font-medium">{e.coverageRate}%</span>
                          </div>
                        )}
                        {state.showDoseCompletion && (
                          <div>
                            Doses:{' '}
                            <span className="text-blue-100 font-medium">{e.doseCompletion}%</span>
                          </div>
                        )}
                        {state.showBoosterUptake && (
                          <div>
                            Supply:{' '}
                            <span className="text-blue-100 font-medium">{e.boosterUptake}%</span>
                          </div>
                        )}
                        {state.showHesitancyIndex && (
                          <div>
                            Dropout:{' '}
                            <span className="text-blue-100 font-medium">{e.hesitancyIndex}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No regions match the current filter.
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
                    <span className="text-blue-400/70">Coverage: </span>
                    <span className="font-medium text-blue-300">{activeItem.coverageRate}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Doses: </span>
                    <span className="font-medium text-indigo-300">{activeItem.doseCompletion}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Hesitancy: </span>
                    <span className="font-medium text-violet-400">{activeItem.hesitancyIndex}%</span>
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
