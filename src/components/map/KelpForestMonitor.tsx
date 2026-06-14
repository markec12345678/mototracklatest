'use client'

import { useMemo } from 'react'
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
import { useMapStore, type KelpForestMonitorState, type KelpForestMonitorData } from '@/lib/map-store'
import { Fish as FishIcon3, X, BarChart3, MapPin, Filter, Leaf, TrendingUp } from 'lucide-react'

const DEMO_FORESTS: KelpForestMonitorData[] = [
  {
    id: 'kf-california',
    name: 'California Kelp Forest',
    lat: 34,
    lng: -120,
    coverage: 85,
    biomass: 12,
    waterTemp: 15,
    biodiversity: 90,
    depth: 20,
    status: 'thriving',
    description: 'Healthy kelp forest ecosystem along the California coast',
  },
  {
    id: 'kf-tasmania',
    name: 'Tasmania Giant Kelp',
    lat: -43,
    lng: 147,
    coverage: 25,
    biomass: 3,
    waterTemp: 19,
    biodiversity: 45,
    depth: 15,
    status: 'severely_declining',
    description: 'Once-thriving giant kelp forests now severely impacted by warming waters',
  },
  {
    id: 'kf-norwegian',
    name: 'Norwegian Kelp',
    lat: 62,
    lng: 5,
    coverage: 70,
    biomass: 8,
    waterTemp: 10,
    biodiversity: 75,
    depth: 25,
    status: 'stable',
    description: 'Cold-water kelp forests along Norwegian fjords remaining stable',
  },
  {
    id: 'kf-southafrica',
    name: 'South Africa Kelp',
    lat: -34,
    lng: 18,
    coverage: 65,
    biomass: 7,
    waterTemp: 14,
    biodiversity: 68,
    depth: 18,
    status: 'stable',
    description: 'Benguela-current supported kelp ecosystem with stable conditions',
  },
  {
    id: 'kf-japanese',
    name: 'Japanese Kelp',
    lat: 38,
    lng: 140,
    coverage: 55,
    biomass: 6,
    waterTemp: 16,
    biodiversity: 55,
    depth: 12,
    status: 'declining',
    description: 'Kelp forests under pressure from warming and overharvesting',
  },
  {
    id: 'kf-chilean',
    name: 'Chilean Kelp',
    lat: -40,
    lng: -73,
    coverage: 40,
    biomass: 5,
    waterTemp: 13,
    biodiversity: 50,
    depth: 22,
    status: 'declining',
    description: 'Lesser kelp forests showing gradual decline from environmental changes',
  },
]

const STATUS_CONFIG: Record<
  KelpForestMonitorData['status'],
  { label: string; color: string; bgClass: string }
> = {
  thriving: { label: 'Thriving', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  stable: { label: 'Stable', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  declining: { label: 'Declining', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  severely_declining: { label: 'Severely Declining', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsed: { label: 'Collapsed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function KelpForestMonitor() {
  const state = useMapStore((s) => s.kelpForestMonitor)
  const setState = useMapStore((s) => s.setKelpForestMonitor)

  const forests = useMemo(
    () => (state.forests.length > 0 ? state.forests : DEMO_FORESTS),
    [state.forests]
  )

  const filteredForests = useMemo(() => {
    return forests.filter((f) => {
      if (state.speciesFilter !== 'all') {
        const speciesMap: Record<string, string[]> = {
          macrocystis: ['kf-california', 'kf-chilean'],
          laminaria: ['kf-norwegian', 'kf-japanese'],
          ecklonia: ['kf-southafrica'],
          saccharina: ['kf-tasmania', 'kf-norwegian'],
        }
        if (!speciesMap[state.speciesFilter]?.includes(f.id)) return false
      }
      return true
    })
  }, [forests, state.speciesFilter])

  const summary = useMemo(() => {
    if (filteredForests.length === 0) {
      return { avgCoverage: 0, avgBiomass: 0, avgWaterTemp: 0 }
    }
    const avgCoverage =
      filteredForests.reduce((sum, f) => sum + f.coverage, 0) / filteredForests.length
    const avgBiomass =
      filteredForests.reduce((sum, f) => sum + f.biomass, 0) / filteredForests.length
    const avgWaterTemp =
      filteredForests.reduce((sum, f) => sum + f.waterTemp, 0) / filteredForests.length
    return {
      avgCoverage: Math.round(avgCoverage),
      avgBiomass: Math.round(avgBiomass * 10) / 10,
      avgWaterTemp: Math.round(avgWaterTemp * 10) / 10,
    }
  }, [filteredForests])

  const activeForest = useMemo(
    () => forests.find((f) => f.id === state.activeForestId) ?? null,
    [forests, state.activeForestId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof KelpForestMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCoverage', label: 'Coverage', icon: BarChart3 },
    { key: 'showBiomass', label: 'Biomass', icon: Leaf },
    { key: 'showWaterTemp', label: 'Water Temp', icon: TrendingUp },
    { key: 'showBiodiversity', label: 'Biodiversity', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg shadow-emerald-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <FishIcon3 className="h-4 w-4 text-emerald-400" />
              Kelp Forest Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Species Filter */}
          <div>
            <Label className="text-xs text-emerald-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Species Type
            </Label>
            <Select
              value={state.speciesFilter}
              onValueChange={(v) =>
                setState({
                  speciesFilter: v as KelpForestMonitorState['speciesFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                <SelectItem value="macrocystis">Macrocystis</SelectItem>
                <SelectItem value="laminaria">Laminaria</SelectItem>
                <SelectItem value="ecklonia">Ecklonia</SelectItem>
                <SelectItem value="saccharina">Saccharina</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg Coverage</div>
              <div className="text-sm font-semibold text-emerald-300">{summary.avgCoverage}%</div>
              <div className="text-[9px] text-emerald-400">canopy</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg Biomass</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.avgBiomass}</div>
              <div className="text-[9px] text-emerald-400">kg/m²</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg Temp</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgWaterTemp}°C</div>
              <div className="text-[9px] text-emerald-400">water</div>
            </div>
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Forest List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300">
              Kelp Forests ({filteredForests.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredForests.map((forest) => {
                  const isActive = state.activeForestId === forest.id
                  const statusCfg = STATUS_CONFIG[forest.status]
                  return (
                    <div
                      key={forest.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/60 bg-emerald-800/30'
                          : 'border-emerald-800/30 hover:border-emerald-600/40 hover:bg-emerald-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeForestId: isActive ? null : forest.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-emerald-100">{forest.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300">
                        {state.showCoverage && (
                          <div>
                            Coverage:{' '}
                            <span className="text-emerald-100 font-medium">
                              {forest.coverage}%
                            </span>
                          </div>
                        )}
                        {state.showBiomass && (
                          <div>
                            Biomass:{' '}
                            <span className="text-emerald-100 font-medium">
                              {forest.biomass} kg/m²
                            </span>
                          </div>
                        )}
                        {state.showWaterTemp && (
                          <div>
                            Water Temp:{' '}
                            <span className="text-amber-400 font-medium">
                              {forest.waterTemp}°C
                            </span>
                          </div>
                        )}
                        {state.showBiodiversity && (
                          <div>
                            Biodiversity:{' '}
                            <span className="text-emerald-200 font-medium">
                              {forest.biodiversity}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredForests.length === 0 && (
                  <div className="text-center text-xs text-emerald-400 py-4">
                    No forests match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Forest Details */}
          {activeForest && (
            <>
              <Separator className="bg-emerald-800/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeForest.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeForest.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeForest.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeForest.lat.toFixed(1)}, {activeForest.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Coverage: </span>
                    <span className="font-medium text-emerald-200">{activeForest.coverage}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Biomass: </span>
                    <span className="font-medium text-emerald-200">{activeForest.biomass} kg/m²</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Water Temp: </span>
                    <span className="font-medium text-amber-400">{activeForest.waterTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Depth: </span>
                    <span className="font-medium text-emerald-200">{activeForest.depth} m</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Biodiversity: </span>
                    <span className="font-medium text-emerald-200">{activeForest.biodiversity}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-emerald-400">Description: </span>
                    <span className="font-medium text-emerald-200">{activeForest.description}</span>
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
