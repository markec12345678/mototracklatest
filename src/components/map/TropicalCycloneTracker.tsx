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
import { useMapStore, type TropicalCycloneState, type TropicalCycloneData } from '@/lib/map-store'
import { CloudHail as CloudHailIcon2, X, Wind, Gauge, CloudRain, Waves, MapPin, Filter } from 'lucide-react'

interface DemoCyclone extends TropicalCycloneData {
  category: 'tropical_depression' | 'tropical_storm' | 'category_1_2' | 'category_3_5'
}

const DEMO_CYCLONES: DemoCyclone[] = [
  {
    id: 'tc-batsirai',
    name: 'Cyclone Batsirai',
    lat: -18,
    lng: 60,
    windSpeed: 185,
    pressure: 920,
    rainfall: 350,
    stormSurge: 4.5,
    forwardSpeed: 18,
    status: 'peak',
    description: 'Intense tropical cyclone in the Indian Ocean',
    category: 'category_3_5',
  },
  {
    id: 'tc-ida',
    name: 'Hurricane Ida',
    lat: 28,
    lng: -90,
    windSpeed: 215,
    pressure: 935,
    rainfall: 280,
    stormSurge: 5.2,
    forwardSpeed: 15,
    status: 'peak',
    description: 'Major hurricane in the Gulf of Mexico',
    category: 'category_3_5',
  },
  {
    id: 'tc-mangkhut',
    name: 'Typhoon Mangkhut',
    lat: 18,
    lng: 125,
    windSpeed: 285,
    pressure: 905,
    rainfall: 450,
    stormSurge: 6.0,
    forwardSpeed: 22,
    status: 'peak',
    description: 'Super typhoon in the Western Pacific',
    category: 'category_3_5',
  },
  {
    id: 'tc-yaku',
    name: 'Cyclone Yaku',
    lat: -12,
    lng: -78,
    windSpeed: 85,
    pressure: 990,
    rainfall: 120,
    stormSurge: 1.5,
    forwardSpeed: 10,
    status: 'forming',
    description: 'Developing cyclone off the South American coast',
    category: 'tropical_depression',
  },
  {
    id: 'tc-lee',
    name: 'Hurricane Lee',
    lat: 25,
    lng: -62,
    windSpeed: 195,
    pressure: 928,
    rainfall: 300,
    stormSurge: 3.8,
    forwardSpeed: 16,
    status: 'strengthening',
    description: 'Rapidly intensifying Atlantic hurricane',
    category: 'category_3_5',
  },
  {
    id: 'tc-freddy',
    name: 'Cyclone Freddy',
    lat: -15,
    lng: 45,
    windSpeed: 165,
    pressure: 945,
    rainfall: 250,
    stormSurge: 3.2,
    forwardSpeed: 12,
    status: 'weakening',
    description: 'Long-lived cyclone in the South Indian Ocean',
    category: 'category_1_2',
  },
]

const STATUS_CONFIG: Record<
  TropicalCycloneData['status'],
  { label: string; color: string; bgClass: string }
> = {
  forming: { label: 'Forming', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  strengthening: { label: 'Strengthening', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  peak: { label: 'Peak', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  weakening: { label: 'Weakening', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  dissipating: { label: 'Dissipating', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

const CATEGORY_LABELS: Record<DemoCyclone['category'], string> = {
  tropical_depression: 'Tropical Depression',
  tropical_storm: 'Tropical Storm',
  category_1_2: 'Category 1-2',
  category_3_5: 'Category 3-5',
}

export function TropicalCycloneTracker() {
  const state = useMapStore((s) => s.tropicalCyclone)
  const setState = useMapStore((s) => s.setTropicalCyclone)

  const cyclones = useMemo(
    () => (state.cyclones.length > 0 ? (state.cyclones as DemoCyclone[]) : DEMO_CYCLONES),
    [state.cyclones]
  )

  const filteredCyclones = useMemo(() => {
    return cyclones.filter((c) => {
      if (state.categoryFilter !== 'all' && c.category !== state.categoryFilter) return false
      return true
    })
  }, [cyclones, state.categoryFilter])

  const summary = useMemo(() => {
    if (filteredCyclones.length === 0) {
      return { avgWindSpeed: 0, avgPressure: 0, peakCount: 0 }
    }
    const avgWindSpeed =
      filteredCyclones.reduce((sum, c) => sum + c.windSpeed, 0) / filteredCyclones.length
    const avgPressure =
      filteredCyclones.reduce((sum, c) => sum + c.pressure, 0) / filteredCyclones.length
    const peakCount = filteredCyclones.filter(
      (c) => c.status === 'peak'
    ).length
    return {
      avgWindSpeed: Math.round(avgWindSpeed),
      avgPressure: Math.round(avgPressure),
      peakCount,
    }
  }, [filteredCyclones])

  const activeCyclone = useMemo(
    () => cyclones.find((c) => c.id === state.activeCycloneId) ?? null,
    [cyclones, state.activeCycloneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TropicalCycloneState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showPressure', label: 'Pressure', icon: Gauge },
    { key: 'showRainfall', label: 'Rainfall', icon: CloudRain },
    { key: 'showStormSurge', label: 'Storm Surge', icon: Waves },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-950/95 to-red-950/95 backdrop-blur-xl border border-rose-800/40 rounded-xl shadow-lg shadow-rose-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-rose-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-100">
              <CloudHailIcon2 className="h-4 w-4 text-rose-400" />
              Tropical Cyclone Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-300 hover:text-rose-100 hover:bg-rose-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-rose-100">
          {/* Category Filter */}
          <div>
            <Label className="text-xs text-rose-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Storm Category
            </Label>
            <Select
              value={state.categoryFilter}
              onValueChange={(v) =>
                setState({
                  categoryFilter: v as TropicalCycloneState['categoryFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-rose-900/40 border-rose-700/40 text-rose-100 hover:bg-rose-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="tropical_depression">Tropical Depression</SelectItem>
                <SelectItem value="tropical_storm">Tropical Storm</SelectItem>
                <SelectItem value="category_1_2">Category 1-2</SelectItem>
                <SelectItem value="category_3_5">Category 3-5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-rose-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rose-200">
                  <Icon className="h-3 w-3 text-rose-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-rose-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-rose-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400">Avg Wind</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-rose-400">km/h</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400">Avg Pressure</div>
              <div className="text-sm font-semibold text-rose-300">{summary.avgPressure}</div>
              <div className="text-[9px] text-rose-400">hPa</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400">Peak</div>
              <div className="text-sm font-semibold text-rose-200">{summary.peakCount}</div>
              <div className="text-[9px] text-rose-400">cyclones</div>
            </div>
          </div>

          <Separator className="bg-rose-800/30" />

          {/* Cyclone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300">
              Tropical Cyclones ({filteredCyclones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCyclones.map((cyclone) => {
                  const isActive = state.activeCycloneId === cyclone.id
                  const statusCfg = STATUS_CONFIG[cyclone.status]
                  return (
                    <div
                      key={cyclone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/60 bg-rose-800/30'
                          : 'border-rose-800/30 hover:border-rose-600/40 hover:bg-rose-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeCycloneId: isActive ? null : cyclone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-rose-100">{cyclone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-rose-300">
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-rose-100 font-medium">
                              {cyclone.windSpeed} km/h
                            </span>
                          </div>
                        )}
                        {state.showPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-rose-100 font-medium">
                              {cyclone.pressure} hPa
                            </span>
                          </div>
                        )}
                        {state.showRainfall && (
                          <div>
                            Rainfall:{' '}
                            <span className="text-rose-100 font-medium">
                              {cyclone.rainfall} mm
                            </span>
                          </div>
                        )}
                        {state.showStormSurge && (
                          <div>
                            Surge:{' '}
                            <span className="text-rose-100 font-medium">
                              {cyclone.stormSurge} m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCyclones.length === 0 && (
                  <div className="text-center text-xs text-rose-400 py-4">
                    No cyclones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Cyclone Details */}
          {activeCyclone && (
            <>
              <Separator className="bg-rose-800/30" />
              <div className="space-y-2 rounded-lg border border-rose-600/30 bg-rose-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-100">{activeCyclone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeCyclone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeCyclone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-rose-400">Coordinates: </span>
                    <span className="font-medium text-rose-100">
                      {activeCyclone.lat.toFixed(1)}, {activeCyclone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-400">Wind Speed: </span>
                    <span className="font-medium text-red-400">{activeCyclone.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-rose-400">Pressure: </span>
                    <span className="font-medium text-rose-200">{activeCyclone.pressure} hPa</span>
                  </div>
                  <div>
                    <span className="text-rose-400">Forward Speed: </span>
                    <span className="font-medium text-rose-200">{activeCyclone.forwardSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-rose-400">Rainfall: </span>
                    <span className="font-medium text-rose-200">{activeCyclone.rainfall} mm</span>
                  </div>
                  <div>
                    <span className="text-rose-400">Storm Surge: </span>
                    <span className="font-medium text-rose-200">{activeCyclone.stormSurge} m</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-rose-400">Category: </span>
                    <span className="font-medium text-rose-200">
                      {(activeCyclone as DemoCyclone).category ? CATEGORY_LABELS[(activeCyclone as DemoCyclone).category] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-rose-400">Description: </span>
                    <span className="font-medium text-rose-200">{activeCyclone.description}</span>
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
