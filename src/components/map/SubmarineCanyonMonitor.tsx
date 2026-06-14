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
import { useMapStore, type SubmarineCanyonState, type SubmarineCanyonData } from '@/lib/map-store'
import { ArrowDown as ArrowDownIcon, X, BarChart3, MapPin, Filter, TrendingUp, Waves } from 'lucide-react'

const DEMO_CANYONS: SubmarineCanyonData[] = [
  {
    id: 'sc-monterey',
    name: 'Monterey Canyon',
    lat: 36.8,
    lng: -122,
    depth: 3500,
    currentSpeed: 35,
    sediment: 80,
    biodiversity: 85,
    length: 180,
    status: 'active',
    description: 'Deep submarine canyon with strong currents and high biodiversity off California',
  },
  {
    id: 'sc-zaire',
    name: 'Zaire Canyon',
    lat: -6,
    lng: 12,
    depth: 2800,
    currentSpeed: 25,
    sediment: 90,
    biodiversity: 70,
    length: 250,
    status: 'active',
    description: 'Major river-fed canyon with massive sediment transport in the Atlantic',
  },
  {
    id: 'sc-hudson',
    name: 'Hudson Canyon',
    lat: 39.5,
    lng: -72,
    depth: 2500,
    currentSpeed: 20,
    sediment: 65,
    biodiversity: 60,
    length: 150,
    status: 'moderate',
    description: 'Submarine canyon extending from the Hudson River shelf off New York',
  },
  {
    id: 'sc-congo',
    name: 'Congo Canyon',
    lat: -5,
    lng: 11,
    depth: 3200,
    currentSpeed: 30,
    sediment: 85,
    biodiversity: 75,
    length: 200,
    status: 'active',
    description: 'One of the largest submarine canyons with active turbidity currents',
  },
  {
    id: 'sc-nazare',
    name: 'Nazaré Canyon',
    lat: 39.5,
    lng: -10,
    depth: 4000,
    currentSpeed: 40,
    sediment: 70,
    biodiversity: 65,
    length: 170,
    status: 'active',
    description: 'Deep canyon off Portugal known for powerful currents and nutrient upwelling',
  },
  {
    id: 'sc-wilmington',
    name: 'Wilmington Canyon',
    lat: 33,
    lng: -78,
    depth: 1500,
    currentSpeed: 10,
    sediment: 40,
    biodiversity: 35,
    length: 80,
    status: 'quiet',
    description: 'Smaller canyon with reduced activity on the US Atlantic continental margin',
  },
]

const STATUS_CONFIG: Record<
  SubmarineCanyonData['status'],
  { label: string; color: string; bgClass: string }
> = {
  active: { label: 'Active', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  moderate: { label: 'Moderate', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  quiet: { label: 'Quiet', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  dormant: { label: 'Dormant', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  buried: { label: 'Buried', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

export function SubmarineCanyonMonitor() {
  const state = useMapStore((s) => s.submarineCanyon)
  const setState = useMapStore((s) => s.setSubmarineCanyon)

  const canyons = useMemo(
    () => (state.canyons.length > 0 ? state.canyons : DEMO_CANYONS),
    [state.canyons]
  )

  const filteredCanyons = useMemo(() => {
    return canyons.filter((c) => {
      if (state.typeFilter !== 'all') {
        const typeMap: Record<string, string[]> = {
          river_originated: ['sc-zaire', 'sc-congo', 'sc-hudson'],
          shelf_incised: ['sc-monterey', 'sc-wilmington'],
          slope: ['sc-nazare'],
          blind: ['sc-wilmington'],
        }
        if (!typeMap[state.typeFilter]?.includes(c.id)) return false
      }
      return true
    })
  }, [canyons, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredCanyons.length === 0) {
      return { avgDepth: 0, avgCurrentSpeed: 0, totalLength: 0 }
    }
    const avgDepth =
      filteredCanyons.reduce((sum, c) => sum + c.depth, 0) / filteredCanyons.length
    const avgCurrentSpeed =
      filteredCanyons.reduce((sum, c) => sum + c.currentSpeed, 0) / filteredCanyons.length
    const totalLength = filteredCanyons.reduce((sum, c) => sum + c.length, 0)
    return {
      avgDepth: Math.round(avgDepth),
      avgCurrentSpeed: Math.round(avgCurrentSpeed * 10) / 10,
      totalLength: totalLength.toLocaleString(),
    }
  }, [filteredCanyons])

  const activeCanyon = useMemo(
    () => canyons.find((c) => c.id === state.activeCanyonId) ?? null,
    [canyons, state.activeCanyonId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubmarineCanyonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: BarChart3 },
    { key: 'showCurrentSpeed', label: 'Current Speed', icon: TrendingUp },
    { key: 'showSediment', label: 'Sediment', icon: Waves },
    { key: 'showBiodiversity', label: 'Biodiversity', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-slate-950/95 backdrop-blur-xl border border-indigo-800/40 rounded-xl shadow-lg shadow-indigo-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-indigo-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-100">
              <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
              Submarine Canyon Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-indigo-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-indigo-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Canyon Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SubmarineCanyonState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-indigo-900/40 border-indigo-700/40 text-indigo-100 hover:bg-indigo-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="river_originated">River Originated</SelectItem>
                <SelectItem value="shelf_incised">Shelf Incised</SelectItem>
                <SelectItem value="slope">Slope</SelectItem>
                <SelectItem value="blind">Blind</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-indigo-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                  <Icon className="h-3 w-3 text-indigo-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-indigo-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-indigo-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Avg Depth</div>
              <div className="text-sm font-semibold text-indigo-300">{summary.avgDepth}</div>
              <div className="text-[9px] text-indigo-400">m</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Avg Current</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgCurrentSpeed}</div>
              <div className="text-[9px] text-indigo-400">cm/s</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Total Length</div>
              <div className="text-sm font-semibold text-indigo-200">{summary.totalLength}</div>
              <div className="text-[9px] text-indigo-400">km</div>
            </div>
          </div>

          <Separator className="bg-indigo-800/30" />

          {/* Canyon List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300">
              Submarine Canyons ({filteredCanyons.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCanyons.map((canyon) => {
                  const isActive = state.activeCanyonId === canyon.id
                  const statusCfg = STATUS_CONFIG[canyon.status]
                  return (
                    <div
                      key={canyon.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/60 bg-indigo-800/30'
                          : 'border-indigo-800/30 hover:border-indigo-600/40 hover:bg-indigo-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeCanyonId: isActive ? null : canyon.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-indigo-100">{canyon.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-indigo-300">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-indigo-100 font-medium">
                              {canyon.depth.toLocaleString()} m
                            </span>
                          </div>
                        )}
                        {state.showCurrentSpeed && (
                          <div>
                            Current:{' '}
                            <span className="text-indigo-100 font-medium">
                              {canyon.currentSpeed} cm/s
                            </span>
                          </div>
                        )}
                        {state.showSediment && (
                          <div>
                            Sediment:{' '}
                            <span className="text-indigo-100 font-medium">
                              {canyon.sediment}%
                            </span>
                          </div>
                        )}
                        {state.showBiodiversity && (
                          <div>
                            Biodiversity:{' '}
                            <span className="text-emerald-400 font-medium">
                              {canyon.biodiversity}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCanyons.length === 0 && (
                  <div className="text-center text-xs text-indigo-400 py-4">
                    No canyons match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Canyon Details */}
          {activeCanyon && (
            <>
              <Separator className="bg-indigo-800/30" />
              <div className="space-y-2 rounded-lg border border-indigo-600/30 bg-indigo-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-100">{activeCanyon.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeCanyon.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeCanyon.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-indigo-400">Coordinates: </span>
                    <span className="font-medium text-indigo-100">
                      {activeCanyon.lat.toFixed(1)}, {activeCanyon.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Depth: </span>
                    <span className="font-medium text-indigo-200">{activeCanyon.depth.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Current Speed: </span>
                    <span className="font-medium text-sky-400">{activeCanyon.currentSpeed} cm/s</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Sediment: </span>
                    <span className="font-medium text-indigo-200">{activeCanyon.sediment}%</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Biodiversity: </span>
                    <span className="font-medium text-emerald-400">{activeCanyon.biodiversity}%</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Length: </span>
                    <span className="font-medium text-indigo-200">{activeCanyon.length} km</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-indigo-400">Description: </span>
                    <span className="font-medium text-indigo-200">{activeCanyon.description}</span>
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
