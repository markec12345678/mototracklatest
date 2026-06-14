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
import { useMapStore, type OrographicRainfallState, type OrographicRainfallData } from '@/lib/map-store'
import { CloudRain as CloudRainIcon3, X, BarChart3, MapPin, Filter, Mountain, TrendingUp, Droplets } from 'lucide-react'

const DEMO_REGIONS: OrographicRainfallData[] = [
  {
    id: 'or-cherrapunji',
    name: 'Cherrapunji India',
    lat: 25.3,
    lng: 91.7,
    rainfall: 11872,
    elevation: 1484,
    windSpeed: 45,
    runoff: 90,
    landslideRisk: 85,
    status: 'extreme',
    description: 'One of the wettest places on Earth, located in the East Khasi Hills of Meghalaya',
  },
  {
    id: 'or-waialeale',
    name: 'Mt Waialeale Hawaii',
    lat: 22.1,
    lng: -159.5,
    rainfall: 11400,
    elevation: 1569,
    windSpeed: 35,
    runoff: 85,
    landslideRisk: 60,
    status: 'extreme',
    description: 'Shield volcano summit on Kauai, second wettest place on Earth',
  },
  {
    id: 'or-lloro',
    name: 'Lloró Colombia',
    lat: 5.5,
    lng: -76.5,
    rainfall: 13000,
    elevation: 50,
    windSpeed: 25,
    runoff: 95,
    landslideRisk: 40,
    status: 'catastrophic',
    description: 'Tropical rainforest region in Chocó with extreme orographic precipitation',
  },
  {
    id: 'or-milford',
    name: 'Milford Sound NZ',
    lat: -44.7,
    lng: 167.9,
    rainfall: 6500,
    elevation: 1200,
    windSpeed: 30,
    runoff: 75,
    landslideRisk: 50,
    status: 'heavy',
    description: 'Fiordland fjord with intense orographic rainfall from Southern Alps',
  },
  {
    id: 'or-yakutat',
    name: 'Yakutat Alaska',
    lat: 59.5,
    lng: -139.7,
    rainfall: 3800,
    elevation: 15,
    windSpeed: 20,
    runoff: 60,
    landslideRisk: 15,
    status: 'moderate',
    description: 'Coastal plain near St Elias Mountains with moderate orographic enhancement',
  },
  {
    id: 'or-bergen',
    name: 'Bergen Norway',
    lat: 60.4,
    lng: 5.3,
    rainfall: 2250,
    elevation: 50,
    windSpeed: 15,
    runoff: 45,
    landslideRisk: 20,
    status: 'moderate',
    description: 'Norwegian coastal city with orographic rainfall from surrounding mountains',
  },
]

const STATUS_CONFIG: Record<
  OrographicRainfallData['status'],
  { label: string; color: string; bgClass: string }
> = {
  light: { label: 'Light', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  heavy: { label: 'Heavy', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  extreme: { label: 'Extreme', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  catastrophic: { label: 'Catastrophic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function OrographicRainfallMonitor() {
  const state = useMapStore((s) => s.orographicRainfall)
  const setState = useMapStore((s) => s.setOrographicRainfall)

  const regions = useMemo(
    () => (state.regions.length > 0 ? state.regions : DEMO_REGIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.typeFilter !== 'all') {
        const typeMap: Record<string, string[]> = {
          windward: ['or-cherrapunji', 'or-waialeale', 'or-lloro'],
          leeward: ['or-yakutat', 'or-bergen'],
          valley: ['or-lloro', 'or-yakutat'],
          peak: ['or-waialeale', 'or-milford'],
        }
        if (!typeMap[state.typeFilter]?.includes(r.id)) return false
      }
      return true
    })
  }, [regions, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { avgRainfall: 0, avgElevation: 0, avgWindSpeed: 0 }
    }
    const avgRainfall =
      filteredRegions.reduce((sum, r) => sum + r.rainfall, 0) / filteredRegions.length
    const avgElevation =
      filteredRegions.reduce((sum, r) => sum + r.elevation, 0) / filteredRegions.length
    const avgWindSpeed =
      filteredRegions.reduce((sum, r) => sum + r.windSpeed, 0) / filteredRegions.length
    return {
      avgRainfall: Math.round(avgRainfall),
      avgElevation: Math.round(avgElevation),
      avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OrographicRainfallState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRainfall', label: 'Rainfall', icon: CloudRainIcon3 },
    { key: 'showElevation', label: 'Elevation', icon: Mountain },
    { key: 'showWindSpeed', label: 'Wind Speed', icon: TrendingUp },
    { key: 'showRunoff', label: 'Runoff', icon: Droplets },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-emerald-950/95 backdrop-blur-xl border border-green-800/40 rounded-xl shadow-lg shadow-green-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-green-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-100">
              <CloudRainIcon3 className="h-4 w-4 text-green-400" />
              Orographic Rainfall Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-300 hover:text-green-100 hover:bg-green-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-green-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-green-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as OrographicRainfallState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-green-900/40 border-green-700/40 text-green-100 hover:bg-green-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="windward">Windward</SelectItem>
                <SelectItem value="leeward">Leeward</SelectItem>
                <SelectItem value="valley">Valley</SelectItem>
                <SelectItem value="peak">Peak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-green-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-green-200">
                  <Icon className="h-3 w-3 text-green-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-green-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Avg Rainfall</div>
              <div className="text-sm font-semibold text-green-300">{summary.avgRainfall}</div>
              <div className="text-[9px] text-green-400">mm/yr</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Avg Elevation</div>
              <div className="text-sm font-semibold text-green-200">{summary.avgElevation}</div>
              <div className="text-[9px] text-green-400">meters</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Avg Wind</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-green-400">km/h</div>
            </div>
          </div>

          <Separator className="bg-green-800/30" />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300">
              Rainfall Regions ({filteredRegions.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredRegions.map((region) => {
                  const isActive = state.activeRegionId === region.id
                  const statusCfg = STATUS_CONFIG[region.status]
                  return (
                    <div
                      key={region.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-500/60 bg-green-800/30'
                          : 'border-green-800/30 hover:border-green-600/40 hover:bg-green-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeRegionId: isActive ? null : region.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-green-100">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-green-300">
                        {state.showRainfall && (
                          <div>
                            Rainfall:{' '}
                            <span className="text-green-100 font-medium">
                              {region.rainfall} mm
                            </span>
                          </div>
                        )}
                        {state.showElevation && (
                          <div>
                            Elevation:{' '}
                            <span className="text-green-100 font-medium">
                              {region.elevation} m
                            </span>
                          </div>
                        )}
                        {state.showWindSpeed && (
                          <div>
                            Wind Speed:{' '}
                            <span className="text-amber-400 font-medium">
                              {region.windSpeed} km/h
                            </span>
                          </div>
                        )}
                        {state.showRunoff && (
                          <div>
                            Runoff:{' '}
                            <span className="text-blue-400 font-medium">
                              {region.runoff}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-green-400 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator className="bg-green-800/30" />
              <div className="space-y-2 rounded-lg border border-green-600/30 bg-green-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-100">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeRegion.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeRegion.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-green-400">Coordinates: </span>
                    <span className="font-medium text-green-100">
                      {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-400">Rainfall: </span>
                    <span className="font-medium text-green-200">{activeRegion.rainfall} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-green-400">Elevation: </span>
                    <span className="font-medium text-green-200">{activeRegion.elevation} m</span>
                  </div>
                  <div>
                    <span className="text-green-400">Wind Speed: </span>
                    <span className="font-medium text-amber-400">{activeRegion.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-green-400">Runoff: </span>
                    <span className="font-medium text-blue-400">{activeRegion.runoff}%</span>
                  </div>
                  <div>
                    <span className="text-green-400">Landslide Risk: </span>
                    <span className="font-medium text-orange-400">{activeRegion.landslideRisk}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-green-400">Description: </span>
                    <span className="font-medium text-green-200">{activeRegion.description}</span>
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
