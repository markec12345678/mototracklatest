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
import { useMapStore, type VolcanicIslandFormationState, type VolcanicIslandFormationData } from '@/lib/map-store'
import { Mountain as MountainIcon7, X, BarChart3, MapPin, Filter, TrendingUp, Activity } from 'lucide-react'

const DEMO_ISLANDS: VolcanicIslandFormationData[] = [
  {
    id: 'vi-nishinoshima',
    name: 'Nishinoshima Japan',
    lat: 27.2,
    lng: 140.9,
    elevation: 130,
    eruptionRate: 5.2,
    area: 2.5,
    subsidence: 0.5,
    age: 10,
    status: 'growing',
    description: 'Actively growing volcanic island with ongoing eruptions',
  },
  {
    id: 'vi-hunga',
    name: "Hunga Tonga-Hunga Ha'apai",
    lat: -20.5,
    lng: -175.4,
    elevation: 0,
    eruptionRate: 0,
    area: 0.1,
    subsidence: 2.0,
    age: 1,
    status: 'submerged',
    description: 'Massive 2022 eruption destroyed most of the island above sea level',
  },
  {
    id: 'vi-surtsey',
    name: 'Surtsey Iceland',
    lat: 63.3,
    lng: -20.6,
    elevation: 155,
    eruptionRate: 0,
    area: 1.4,
    subsidence: 0.3,
    age: 60,
    status: 'mature',
    description: 'Well-studied volcanic island that emerged in 1963, now a nature reserve',
  },
  {
    id: 'vi-krakatau',
    name: 'Anak Krakatau',
    lat: -6.1,
    lng: 105.4,
    elevation: 150,
    eruptionRate: 3.0,
    area: 3.2,
    subsidence: 0.2,
    age: 80,
    status: 'growing',
    description: 'Child of Krakatau actively growing through volcanic activity',
  },
  {
    id: 'vi-bogoslof',
    name: 'Bogoslof Alaska',
    lat: 53.9,
    lng: -168,
    elevation: 100,
    eruptionRate: 2.0,
    area: 0.8,
    subsidence: 1.0,
    age: 5,
    status: 'emerging',
    description: 'Recently emergent volcanic island with frequent eruptions',
  },
  {
    id: 'vi-iwojima',
    name: 'Iwo Jima',
    lat: 24.8,
    lng: 141.3,
    elevation: 161,
    eruptionRate: 0.5,
    area: 23,
    subsidence: 0.1,
    age: 1000,
    status: 'eroding',
    description: 'Ancient volcanic island slowly eroding with ongoing hydrothermal activity',
  },
]

const STATUS_CONFIG: Record<
  VolcanicIslandFormationData['status'],
  { label: string; color: string; bgClass: string }
> = {
  emerging: { label: 'Emerging', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  growing: { label: 'Growing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  mature: { label: 'Mature', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  eroding: { label: 'Eroding', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  submerged: { label: 'Submerged', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

export function VolcanicIslandFormationMonitor() {
  const state = useMapStore((s) => s.volcanicIslandFormation)
  const setState = useMapStore((s) => s.setVolcanicIslandFormation)

  const islands = useMemo(
    () => (state.islands.length > 0 ? state.islands : DEMO_ISLANDS),
    [state.islands]
  )

  const filteredIslands = useMemo(() => {
    return islands.filter((i) => {
      if (state.stageFilter !== 'all') {
        const stageMap: Record<string, string[]> = {
          emerging: ['vi-bogoslof'],
          growing: ['vi-nishinoshima', 'vi-krakatau'],
          mature: ['vi-surtsey'],
          eroding: ['vi-iwojima'],
          submerged: ['vi-hunga'],
        }
        if (!stageMap[state.stageFilter]?.includes(i.id)) return false
      }
      return true
    })
  }, [islands, state.stageFilter])

  const summary = useMemo(() => {
    if (filteredIslands.length === 0) {
      return { avgElevation: 0, avgEruptionRate: 0, totalArea: 0 }
    }
    const avgElevation =
      filteredIslands.reduce((sum, i) => sum + i.elevation, 0) / filteredIslands.length
    const avgEruptionRate =
      filteredIslands.reduce((sum, i) => sum + i.eruptionRate, 0) / filteredIslands.length
    const totalArea = filteredIslands.reduce((sum, i) => sum + i.area, 0)
    return {
      avgElevation: Math.round(avgElevation),
      avgEruptionRate: Math.round(avgEruptionRate * 10) / 10,
      totalArea: Math.round(totalArea * 10) / 10,
    }
  }, [filteredIslands])

  const activeIsland = useMemo(
    () => islands.find((i) => i.id === state.activeIslandId) ?? null,
    [islands, state.activeIslandId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicIslandFormationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showElevation', label: 'Elevation', icon: TrendingUp },
    { key: 'showEruptionRate', label: 'Eruption Rate', icon: Activity },
    { key: 'showArea', label: 'Area', icon: MapPin },
    { key: 'showSubsidence', label: 'Subsidence', icon: BarChart3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-stone-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg shadow-red-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <MountainIcon7 className="h-4 w-4 text-red-400" />
              Volcanic Island Formation Monitor
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
          {/* Stage Filter */}
          <div>
            <Label className="text-xs text-red-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Formation Stage
            </Label>
            <Select
              value={state.stageFilter}
              onValueChange={(v) =>
                setState({
                  stageFilter: v as VolcanicIslandFormationState['stageFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="emerging">Emerging</SelectItem>
                <SelectItem value="growing">Growing</SelectItem>
                <SelectItem value="mature">Mature</SelectItem>
                <SelectItem value="eroding">Eroding</SelectItem>
                <SelectItem value="submerged">Submerged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300">Display Options</Label>
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

          <Separator className="bg-red-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Avg Elevation</div>
              <div className="text-sm font-semibold text-red-300">{summary.avgElevation}</div>
              <div className="text-[9px] text-red-400">m</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Eruption Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgEruptionRate}</div>
              <div className="text-[9px] text-red-400">m³/s</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Total Area</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalArea}</div>
              <div className="text-[9px] text-red-400">km²</div>
            </div>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Island List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300">
              Volcanic Islands ({filteredIslands.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredIslands.map((island) => {
                  const isActive = state.activeIslandId === island.id
                  const statusCfg = STATUS_CONFIG[island.status]
                  return (
                    <div
                      key={island.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/60 bg-red-800/30'
                          : 'border-red-800/30 hover:border-red-600/40 hover:bg-red-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeIslandId: isActive ? null : island.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-red-100">{island.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300">
                        {state.showElevation && (
                          <div>
                            Elevation:{' '}
                            <span className="text-red-100 font-medium">
                              {island.elevation} m
                            </span>
                          </div>
                        )}
                        {state.showEruptionRate && (
                          <div>
                            Eruption:{' '}
                            <span className="text-orange-400 font-medium">
                              {island.eruptionRate} m³/s
                            </span>
                          </div>
                        )}
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-red-100 font-medium">
                              {island.area} km²
                            </span>
                          </div>
                        )}
                        {state.showSubsidence && (
                          <div>
                            Subsidence:{' '}
                            <span className="text-amber-400 font-medium">
                              {island.subsidence} m/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredIslands.length === 0 && (
                  <div className="text-center text-xs text-red-400 py-4">
                    No islands match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Island Details */}
          {activeIsland && (
            <>
              <Separator className="bg-red-800/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeIsland.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeIsland.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeIsland.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeIsland.lat.toFixed(1)}, {activeIsland.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400">Elevation: </span>
                    <span className="font-medium text-red-200">{activeIsland.elevation} m</span>
                  </div>
                  <div>
                    <span className="text-red-400">Eruption Rate: </span>
                    <span className="font-medium text-orange-400">{activeIsland.eruptionRate} m³/s</span>
                  </div>
                  <div>
                    <span className="text-red-400">Area: </span>
                    <span className="font-medium text-red-200">{activeIsland.area} km²</span>
                  </div>
                  <div>
                    <span className="text-red-400">Subsidence: </span>
                    <span className="font-medium text-amber-400">{activeIsland.subsidence} m/yr</span>
                  </div>
                  <div>
                    <span className="text-red-400">Age: </span>
                    <span className="font-medium text-red-200">{activeIsland.age} yrs</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-red-400">Description: </span>
                    <span className="font-medium text-red-200">{activeIsland.description}</span>
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
