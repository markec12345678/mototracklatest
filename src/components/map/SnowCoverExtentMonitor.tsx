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
import { useMapStore, type SnowCoverExtentState, type SnowCoverExtentData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon5, X, BarChart3, MapPin, Filter, Thermometer, Droplets } from 'lucide-react'

const DEMO_REGIONS: SnowCoverExtentData[] = [
  {
    id: 'sc-siberian',
    name: 'Siberian Snow Cover',
    lat: 60,
    lng: 90,
    extent: 12,
    depth: 80,
    waterEquivalent: 250,
    meltRate: 5,
    albedo: 85,
    status: 'stable',
    description: 'Vast Siberian snow cover maintaining stable extent across the taiga',
  },
  {
    id: 'sc-canadian',
    name: 'Canadian Snow',
    lat: 55,
    lng: -95,
    extent: 8,
    depth: 60,
    waterEquivalent: 180,
    meltRate: 8,
    albedo: 80,
    status: 'declining',
    description: 'Canadian snow cover showing gradual decline due to warming trends',
  },
  {
    id: 'sc-himalayan',
    name: 'Himalayan Snow',
    lat: 30,
    lng: 82,
    extent: 3,
    depth: 120,
    waterEquivalent: 400,
    meltRate: 12,
    albedo: 75,
    status: 'rapid_decline',
    description: 'Himalayan snowpack rapidly declining with severe glacier implications',
  },
  {
    id: 'sc-alps',
    name: 'European Alps Snow',
    lat: 47,
    lng: 12,
    extent: 0.8,
    depth: 150,
    waterEquivalent: 500,
    meltRate: 15,
    albedo: 70,
    status: 'rapid_decline',
    description: 'Alpine snow cover in rapid decline with significant glacier retreat',
  },
  {
    id: 'sc-rocky',
    name: 'Rocky Mountain Snow',
    lat: 42,
    lng: -108,
    extent: 1.5,
    depth: 100,
    waterEquivalent: 320,
    meltRate: 10,
    albedo: 78,
    status: 'declining',
    description: 'Western US mountain snowpack declining with water resource impacts',
  },
  {
    id: 'sc-greenland',
    name: 'Greenland Snow',
    lat: 72,
    lng: -40,
    extent: 18,
    depth: 200,
    waterEquivalent: 600,
    meltRate: 3,
    albedo: 90,
    status: 'expanding',
    description: 'Greenland ice sheet interior with expanding high-altitude snow cover',
  },
]

const STATUS_CONFIG: Record<
  SnowCoverExtentData['status'],
  { label: string; color: string; bgClass: string }
> = {
  expanding: { label: 'Expanding', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  stable: { label: 'Stable', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  declining: { label: 'Declining', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rapid_decline: { label: 'Rapid Decline', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  minimal: { label: 'Minimal', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SnowCoverExtentMonitor() {
  const state = useMapStore((s) => s.snowCoverExtent)
  const setState = useMapStore((s) => s.setSnowCoverExtent)

  const regions = useMemo(
    () => (state.regions.length > 0 ? state.regions : DEMO_REGIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.seasonFilter !== 'all') {
        const seasonMap: Record<string, string[]> = {
          early_winter: ['sc-siberian', 'sc-greenland'],
          mid_winter: ['sc-siberian', 'sc-canadian', 'sc-greenland'],
          late_winter: ['sc-canadian', 'sc-rocky', 'sc-alps'],
          spring_melt: ['sc-himalayan', 'sc-alps', 'sc-rocky'],
        }
        if (!seasonMap[state.seasonFilter]?.includes(r.id)) return false
      }
      return true
    })
  }, [regions, state.seasonFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { avgExtent: 0, avgDepth: 0, avgAlbedo: 0 }
    }
    const avgExtent =
      filteredRegions.reduce((sum, r) => sum + r.extent, 0) / filteredRegions.length
    const avgDepth =
      filteredRegions.reduce((sum, r) => sum + r.depth, 0) / filteredRegions.length
    const avgAlbedo =
      filteredRegions.reduce((sum, r) => sum + r.albedo, 0) / filteredRegions.length
    return {
      avgExtent: Math.round(avgExtent * 10) / 10,
      avgDepth: Math.round(avgDepth),
      avgAlbedo: Math.round(avgAlbedo),
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SnowCoverExtentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showExtent', label: 'Extent', icon: BarChart3 },
    { key: 'showDepth', label: 'Depth', icon: SnowflakeIcon5 },
    { key: 'showWaterEquivalent', label: 'Water Equivalent', icon: Droplets },
    { key: 'showMeltRate', label: 'Melt Rate', icon: Thermometer },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-sky-950/80 backdrop-blur-xl border border-sky-800/40 rounded-xl shadow-lg shadow-sky-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <SnowflakeIcon5 className="h-4 w-4 text-sky-400" />
              Snow Cover Extent Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-sky-100 hover:bg-sky-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sky-100">
          {/* Season Filter */}
          <div>
            <Label className="text-xs text-sky-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Season
            </Label>
            <Select
              value={state.seasonFilter}
              onValueChange={(v) =>
                setState({
                  seasonFilter: v as SnowCoverExtentState['seasonFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                <SelectItem value="early_winter">Early Winter</SelectItem>
                <SelectItem value="mid_winter">Mid Winter</SelectItem>
                <SelectItem value="late_winter">Late Winter</SelectItem>
                <SelectItem value="spring_melt">Spring Melt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-200">
                  <Icon className="h-3 w-3 text-sky-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Avg Extent</div>
              <div className="text-sm font-semibold text-sky-300">{summary.avgExtent}</div>
              <div className="text-[9px] text-sky-400">M km²</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Avg Depth</div>
              <div className="text-sm font-semibold text-sky-200">{summary.avgDepth}</div>
              <div className="text-[9px] text-sky-400">cm</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Avg Albedo</div>
              <div className="text-sm font-semibold text-white">{summary.avgAlbedo}%</div>
              <div className="text-[9px] text-sky-400">reflectivity</div>
            </div>
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">
              Snow Regions ({filteredRegions.length})
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
                          ? 'border-sky-500/60 bg-sky-800/30'
                          : 'border-sky-800/30 hover:border-sky-600/40 hover:bg-sky-900/20'
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
                          <span className="text-xs font-medium text-sky-100">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300">
                        {state.showExtent && (
                          <div>
                            Extent:{' '}
                            <span className="text-sky-200 font-medium">
                              {region.extent} M km²
                            </span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-sky-200 font-medium">
                              {region.depth} cm
                            </span>
                          </div>
                        )}
                        {state.showWaterEquivalent && (
                          <div>
                            Water Equiv:{' '}
                            <span className="text-sky-200 font-medium">
                              {region.waterEquivalent} mm
                            </span>
                          </div>
                        )}
                        {state.showMeltRate && (
                          <div>
                            Melt Rate:{' '}
                            <span className="text-amber-400 font-medium">
                              {region.meltRate} mm/day
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-sky-400 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator className="bg-sky-800/30" />
              <div className="space-y-2 rounded-lg border border-sky-600/30 bg-sky-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeRegion.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeRegion.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400">Extent: </span>
                    <span className="font-medium text-sky-200">{activeRegion.extent} M km²</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Depth: </span>
                    <span className="font-medium text-sky-200">{activeRegion.depth} cm</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Water Equiv: </span>
                    <span className="font-medium text-sky-200">{activeRegion.waterEquivalent} mm</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Melt Rate: </span>
                    <span className="font-medium text-amber-400">{activeRegion.meltRate} mm/day</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Albedo: </span>
                    <span className="font-medium text-white">{activeRegion.albedo}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sky-400">Description: </span>
                    <span className="font-medium text-sky-200">{activeRegion.description}</span>
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
