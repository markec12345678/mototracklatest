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
import { useMapStore, type SeaIceThicknessState, type SeaIceThicknessData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon4, X, Ruler, Percent, Maximize, Clock, MapPin, Filter } from 'lucide-react'

interface DemoRegion extends SeaIceThicknessData {
  iceType: 'first_year' | 'multi_year' | 'fast_ice' | 'pack_ice'
}

const DEMO_REGIONS: DemoRegion[] = [
  {
    id: 'si-central-arctic',
    name: 'Central Arctic',
    lat: 85,
    lng: 0,
    thickness: 3.2,
    concentration: 95,
    extent: 14,
    age: 5,
    snowDepth: 0.3,
    status: 'stable',
    description: 'Multi-year ice pack in the central Arctic basin',
    iceType: 'multi_year',
  },
  {
    id: 'si-beaufort',
    name: 'Beaufort Sea',
    lat: 72,
    lng: -140,
    thickness: 1.8,
    concentration: 80,
    extent: 5,
    age: 2,
    snowDepth: 0.2,
    status: 'thinning',
    description: 'Seasonal ice with accelerating thinning trend',
    iceType: 'pack_ice',
  },
  {
    id: 'si-greenland',
    name: 'Greenland Sea',
    lat: 78,
    lng: -5,
    thickness: 2.5,
    concentration: 85,
    extent: 3,
    age: 4,
    snowDepth: 0.25,
    status: 'thinning',
    description: 'Export pathway for Arctic multi-year ice',
    iceType: 'multi_year',
  },
  {
    id: 'si-laptev',
    name: 'Laptev Sea',
    lat: 76,
    lng: 120,
    thickness: 1.5,
    concentration: 70,
    extent: 4,
    age: 1,
    snowDepth: 0.15,
    status: 'rapid_thinning',
    description: 'First-year ice with rapid seasonal loss',
    iceType: 'first_year',
  },
  {
    id: 'si-barents',
    name: 'Barents Sea',
    lat: 75,
    lng: 35,
    thickness: 0.8,
    concentration: 40,
    extent: 2,
    age: 1,
    snowDepth: 0.1,
    status: 'rapid_thinning',
    description: 'Atlantic-influenced region with minimal ice cover',
    iceType: 'pack_ice',
  },
  {
    id: 'si-hudson',
    name: 'Hudson Bay',
    lat: 60,
    lng: -85,
    thickness: 1.2,
    concentration: 60,
    extent: 3,
    age: 1,
    snowDepth: 0.1,
    status: 'gone',
    description: 'Seasonal ice that now melts completely each summer',
    iceType: 'fast_ice',
  },
]

const STATUS_CONFIG: Record<
  SeaIceThicknessData['status'],
  { label: string; color: string; bgClass: string }
> = {
  growing: { label: 'Growing', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  stable: { label: 'Stable', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  thinning: { label: 'Thinning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rapid_thinning: { label: 'Rapid Thinning', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  gone: { label: 'Gone', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const ICE_TYPE_LABELS: Record<DemoRegion['iceType'], string> = {
  first_year: 'First Year',
  multi_year: 'Multi Year',
  fast_ice: 'Fast Ice',
  pack_ice: 'Pack Ice',
}

export function SeaIceThicknessMonitor() {
  const state = useMapStore((s) => s.seaIceThickness)
  const setState = useMapStore((s) => s.setSeaIceThickness)

  const regions = useMemo(
    () => (state.regions.length > 0 ? (state.regions as DemoRegion[]) : DEMO_REGIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.typeFilter !== 'all' && r.iceType !== state.typeFilter) return false
      return true
    })
  }, [regions, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { avgThickness: 0, avgConcentration: 0, thinningCount: 0 }
    }
    const avgThickness =
      filteredRegions.reduce((sum, r) => sum + r.thickness, 0) / filteredRegions.length
    const avgConcentration =
      filteredRegions.reduce((sum, r) => sum + r.concentration, 0) / filteredRegions.length
    const thinningCount = filteredRegions.filter(
      (r) => r.status === 'thinning' || r.status === 'rapid_thinning'
    ).length
    return {
      avgThickness: Math.round(avgThickness * 10) / 10,
      avgConcentration: Math.round(avgConcentration),
      thinningCount,
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeaIceThicknessState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showThickness', label: 'Thickness', icon: Ruler },
    { key: 'showConcentration', label: 'Concentration', icon: Percent },
    { key: 'showExtent', label: 'Extent', icon: Maximize },
    { key: 'showAge', label: 'Age', icon: Clock },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-blue-950/80 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg shadow-blue-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <SnowflakeIcon4 className="h-4 w-4 text-blue-400" />
              Sea Ice Thickness Monitor
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
          {/* Ice Type Filter */}
          <div>
            <Label className="text-xs text-blue-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Ice Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SeaIceThicknessState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="first_year">First Year</SelectItem>
                <SelectItem value="multi_year">Multi Year</SelectItem>
                <SelectItem value="fast_ice">Fast Ice</SelectItem>
                <SelectItem value="pack_ice">Pack Ice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">Display Options</Label>
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

          <Separator className="bg-blue-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Thickness</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgThickness}</div>
              <div className="text-[9px] text-blue-400">meters</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Concentration</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgConcentration}</div>
              <div className="text-[9px] text-blue-400">%</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Thinning</div>
              <div className="text-sm font-semibold text-amber-400">{summary.thinningCount}</div>
              <div className="text-[9px] text-blue-400">regions</div>
            </div>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">
              Ice Regions ({filteredRegions.length})
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
                          ? 'border-blue-500/60 bg-blue-800/30'
                          : 'border-blue-800/30 hover:border-blue-600/40 hover:bg-blue-900/20'
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
                          <span className="text-xs font-medium text-blue-100">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300">
                        {state.showThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-blue-100 font-medium">
                              {region.thickness} m
                            </span>
                          </div>
                        )}
                        {state.showConcentration && (
                          <div>
                            Concentration:{' '}
                            <span className="text-blue-100 font-medium">
                              {region.concentration}%
                            </span>
                          </div>
                        )}
                        {state.showExtent && (
                          <div>
                            Extent:{' '}
                            <span className="text-blue-100 font-medium">
                              {region.extent}M km&sup2;
                            </span>
                          </div>
                        )}
                        {state.showAge && (
                          <div>
                            Age:{' '}
                            <span className="text-blue-100 font-medium">
                              {region.age} yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-blue-400 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator className="bg-blue-800/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeRegion.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeRegion.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Thickness: </span>
                    <span className="font-medium text-sky-400">{activeRegion.thickness} m</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Concentration: </span>
                    <span className="font-medium text-blue-200">{activeRegion.concentration}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Extent: </span>
                    <span className="font-medium text-blue-200">{activeRegion.extent}M km&sup2;</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Ice Age: </span>
                    <span className="font-medium text-blue-200">{activeRegion.age} yr</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Snow Depth: </span>
                    <span className="font-medium text-blue-200">{activeRegion.snowDepth} m</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-400">Ice Type: </span>
                    <span className="font-medium text-blue-200">
                      {(activeRegion as DemoRegion).iceType ? ICE_TYPE_LABELS[(activeRegion as DemoRegion).iceType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-400">Description: </span>
                    <span className="font-medium text-blue-200">{activeRegion.description}</span>
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
