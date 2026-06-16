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
import { useMapStore, type DiseaseOutbreakMapState, type DiseaseOutbreakMapData } from '@/lib/map-store'
import { Biohazard as VirusIcon, X, Activity, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: DiseaseOutbreakMapData[] = [
  {
    id: 'do-wafrica-ebola',
    name: 'W Africa Ebola',
    lat: 8.500,
    lng: -10.500,
    caseCount: 1240,
    incidenceRate: 15.3,
    transmissionRate: 2.1,
    mortalityRate: 45,
    status: 'epidemic',
    description: 'Active Ebola outbreak in West Africa with sustained community transmission',
  },
  {
    id: 'do-seasia-dengue',
    name: 'SE Asia Dengue',
    lat: 13.700,
    lng: 100.500,
    caseCount: 8500,
    incidenceRate: 42.7,
    transmissionRate: 3.5,
    mortalityRate: 1.2,
    status: 'spreading',
    description: 'Dengue fever spreading across Southeast Asia during monsoon season',
  },
  {
    id: 'do-samerica-zika',
    name: 'S America Zika',
    lat: -15.800,
    lng: -47.900,
    caseCount: 3200,
    incidenceRate: 28.1,
    transmissionRate: 1.8,
    mortalityRate: 0.4,
    status: 'contained',
    description: 'Zika virus cases declining after aggressive vector control measures',
  },
  {
    id: 'do-eafrica-cholera',
    name: 'E Africa Cholera',
    lat: -1.300,
    lng: 36.800,
    caseCount: 6700,
    incidenceRate: 56.2,
    transmissionRate: 2.8,
    mortalityRate: 2.5,
    status: 'pandemic',
    description: 'Cholera spreading across East Africa with multiple country outbreaks',
  },
]

const STATUS_COLORS: Record<DiseaseOutbreakMapData['status'], { label: string; color: string; bgClass: string }> = {
  pandemic: { label: 'Pandemic', color: '#dc2626', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  epidemic: { label: 'Epidemic', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  spreading: { label: 'Spreading', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  contained: { label: 'Contained', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: DiseaseOutbreakMapData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function DiseaseOutbreakMapMonitor() {
  const state = useMapStore((s) => s.diseaseOutbreakMap)
  const setState = useMapStore((s) => s.setDiseaseOutbreakMap)

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
      return { totalOutbreaks: 0, avgCases: 0, avgR0: 0, avgFatality: 0 }
    }
    const avgCases = filteredItems.reduce((sum, e) => sum + e.caseCount, 0) / filteredItems.length
    const avgR0 = filteredItems.reduce((sum, e) => sum + e.transmissionRate, 0) / filteredItems.length
    const avgFatality = filteredItems.reduce((sum, e) => sum + e.mortalityRate, 0) / filteredItems.length
    return {
      totalOutbreaks: filteredItems.length,
      avgCases: Math.round(avgCases),
      avgR0: avgR0.toFixed(1),
      avgFatality: avgFatality.toFixed(1),
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
      properties: { id: e.id, name: e.name, status: e.status, caseCount: e.caseCount },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setDiseaseOutbreakMap({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DiseaseOutbreakMapState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCaseCount', label: 'Active Cases', icon: Activity },
    { key: 'showIncidenceRate', label: 'New Cases', icon: TrendingUp },
    { key: 'showTransmissionRate', label: 'R0 Value', icon: VirusIcon },
    { key: 'showMortalityRate', label: 'Fatality Rate', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-rose-950/95 backdrop-blur-xl border border-red-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <VirusIcon className="h-4 w-4 text-red-400" />
              Disease Outbreak Map Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as DiseaseOutbreakMapState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pandemic">Pandemic</SelectItem>
                <SelectItem value="epidemic">Epidemic</SelectItem>
                <SelectItem value="spreading">Spreading</SelectItem>
                <SelectItem value="contained">Contained</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Active Cases</div>
              <div className="text-sm font-semibold text-red-300">{summary.avgCases}</div>
              <div className="text-[9px] text-red-400/60">average</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">R0 Value</div>
              <div className="text-sm font-semibold text-rose-300">{summary.avgR0}</div>
              <div className="text-[9px] text-red-400/60">average</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Fatality Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgFatality}%</div>
              <div className="text-[9px] text-red-400/60">average</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Outbreaks</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalOutbreaks}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Outbreak Zones ({filteredItems.length})
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
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-red-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showCaseCount && (
                          <div>
                            Active Cases:{' '}
                            <span className="text-red-100 font-medium">{e.caseCount.toLocaleString()}</span>
                          </div>
                        )}
                        {state.showIncidenceRate && (
                          <div>
                            Incidence:{' '}
                            <span className="text-red-100 font-medium">{e.incidenceRate}/100k</span>
                          </div>
                        )}
                        {state.showTransmissionRate && (
                          <div>
                            R0:{' '}
                            <span className="text-red-100 font-medium">{e.transmissionRate}</span>
                          </div>
                        )}
                        {state.showMortalityRate && (
                          <div>
                            Fatality:{' '}
                            <span className="text-red-100 font-medium">{e.mortalityRate}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No outbreaks match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Active Cases: </span>
                    <span className="font-medium text-red-300">{activeItem.caseCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">R0 Value: </span>
                    <span className="font-medium text-rose-300">{activeItem.transmissionRate}</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Fatality: </span>
                    <span className="font-medium text-orange-400">{activeItem.mortalityRate}%</span>
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
