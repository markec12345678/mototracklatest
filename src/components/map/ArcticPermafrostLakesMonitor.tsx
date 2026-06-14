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
import { useMapStore, type ArcticPermafrostLakesState, type ArcticPermafrostLakesData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon3, X, Maximize, Ruler, Flame, Cloud, MapPin, Filter } from 'lucide-react'

interface DemoLake extends ArcticPermafrostLakesData {
  lakeType: 'thermokarst' | 'ice_wedge' | 'oriented' | 'drained'
}

const DEMO_LAKES: DemoLake[] = [
  {
    id: 'ap-illirney',
    name: 'Lake Illirney',
    lat: 66,
    lng: 170,
    area: 42,
    depth: 8,
    thawRate: 0.5,
    methane: 15,
    iceContent: 70,
    status: 'expanding',
    description: 'Expanding thermokarst lake in northeastern Siberia',
    lakeType: 'thermokarst',
  },
  {
    id: 'ap-batagay',
    name: 'Batagay Thermokarst',
    lat: 67,
    lng: 135,
    area: 85,
    depth: 12,
    thawRate: 2.5,
    methane: 45,
    iceContent: 85,
    status: 'expanding',
    description: 'Rapidly expanding megaslump in Yakutia, Siberia',
    lakeType: 'thermokarst',
  },
  {
    id: 'ap-peyto',
    name: 'Peyto Lake',
    lat: 51.7,
    lng: -116.5,
    area: 2.5,
    depth: 45,
    thawRate: 0.1,
    methane: 3,
    iceContent: 20,
    status: 'stable',
    description: 'Stable glacial lake in the Canadian Rockies',
    lakeType: 'oriented',
  },
  {
    id: 'ap-sarbah',
    name: 'Lake Sarbah',
    lat: 70,
    lng: 70,
    area: 15,
    depth: 3,
    thawRate: 3.0,
    methane: 55,
    iceContent: 90,
    status: 'draining',
    description: 'Draining thermokarst lake on the Yamal Peninsula',
    lakeType: 'ice_wedge',
  },
  {
    id: 'ap-teshekpuk',
    name: 'Teshekpuk Lake',
    lat: 70.5,
    lng: -153,
    area: 820,
    depth: 5,
    thawRate: 1.5,
    methane: 35,
    iceContent: 65,
    status: 'expanding',
    description: 'Largest thermokarst lake in Arctic Alaska',
    lakeType: 'thermokarst',
  },
  {
    id: 'ap-alaseya',
    name: 'Alaseya River Basin',
    lat: 65,
    lng: 145,
    area: 28,
    depth: 4,
    thawRate: 4.0,
    methane: 65,
    iceContent: 80,
    status: 'collapsed',
    description: 'Collapsed permafrost lake system in eastern Siberia',
    lakeType: 'drained',
  },
]

const STATUS_CONFIG: Record<
  ArcticPermafrostLakesData['status'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  expanding: { label: 'Expanding', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  draining: { label: 'Draining', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  shrinking: { label: 'Shrinking', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsed: { label: 'Collapsed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const LAKE_TYPE_LABELS: Record<DemoLake['lakeType'], string> = {
  thermokarst: 'Thermokarst',
  ice_wedge: 'Ice Wedge',
  oriented: 'Oriented',
  drained: 'Drained',
}

export function ArcticPermafrostLakesMonitor() {
  const state = useMapStore((s) => s.arcticPermafrostLakes)
  const setState = useMapStore((s) => s.setArcticPermafrostLakes)

  const lakes = useMemo(
    () => (state.lakes.length > 0 ? (state.lakes as DemoLake[]) : DEMO_LAKES),
    [state.lakes]
  )

  const filteredLakes = useMemo(() => {
    return lakes.filter((l) => {
      if (state.typeFilter !== 'all' && l.lakeType !== state.typeFilter) return false
      return true
    })
  }, [lakes, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredLakes.length === 0) {
      return { avgThawRate: 0, avgMethane: 0, expandingCount: 0 }
    }
    const avgThawRate =
      filteredLakes.reduce((sum, l) => sum + l.thawRate, 0) / filteredLakes.length
    const avgMethane =
      filteredLakes.reduce((sum, l) => sum + l.methane, 0) / filteredLakes.length
    const expandingCount = filteredLakes.filter(
      (l) => l.status === 'expanding'
    ).length
    return {
      avgThawRate: Math.round(avgThawRate * 10) / 10,
      avgMethane: Math.round(avgMethane * 10) / 10,
      expandingCount,
    }
  }, [filteredLakes])

  const activeLake = useMemo(
    () => lakes.find((l) => l.id === state.activeLakeId) ?? null,
    [lakes, state.activeLakeId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ArcticPermafrostLakesState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showArea', label: 'Area', icon: Maximize },
    { key: 'showDepth', label: 'Depth', icon: Ruler },
    { key: 'showThawRate', label: 'Thaw Rate', icon: Flame },
    { key: 'showMethane', label: 'Methane', icon: Cloud },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-cyan-900/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg shadow-cyan-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <SnowflakeIcon3 className="h-4 w-4 text-cyan-400" />
              Arctic Permafrost Lakes Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Lake Type Filter */}
          <div>
            <Label className="text-xs text-cyan-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Lake Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as ArcticPermafrostLakesState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="thermokarst">Thermokarst</SelectItem>
                <SelectItem value="ice_wedge">Ice Wedge</SelectItem>
                <SelectItem value="oriented">Oriented</SelectItem>
                <SelectItem value="drained">Drained</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Avg Thaw Rate</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgThawRate}</div>
              <div className="text-[9px] text-cyan-400">m/yr</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Avg Methane</div>
              <div className="text-sm font-semibold text-cyan-300">{summary.avgMethane}</div>
              <div className="text-[9px] text-cyan-400">ppm</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Expanding</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.expandingCount}</div>
              <div className="text-[9px] text-cyan-400">lakes</div>
            </div>
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Lake List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300">
              Permafrost Lakes ({filteredLakes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredLakes.map((lake) => {
                  const isActive = state.activeLakeId === lake.id
                  const statusCfg = STATUS_CONFIG[lake.status]
                  return (
                    <div
                      key={lake.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/60 bg-cyan-800/30'
                          : 'border-cyan-800/30 hover:border-cyan-600/40 hover:bg-cyan-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeLakeId: isActive ? null : lake.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-cyan-100">{lake.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300">
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-cyan-100 font-medium">
                              {lake.area} ha
                            </span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-cyan-100 font-medium">
                              {lake.depth} m
                            </span>
                          </div>
                        )}
                        {state.showThawRate && (
                          <div>
                            Thaw:{' '}
                            <span className="text-cyan-100 font-medium">
                              {lake.thawRate} m/yr
                            </span>
                          </div>
                        )}
                        {state.showMethane && (
                          <div>
                            CH4:{' '}
                            <span className="text-cyan-100 font-medium">
                              {lake.methane} ppm
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredLakes.length === 0 && (
                  <div className="text-center text-xs text-cyan-400 py-4">
                    No lakes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Lake Details */}
          {activeLake && (
            <>
              <Separator className="bg-cyan-800/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeLake.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeLake.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeLake.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeLake.lat.toFixed(1)}, {activeLake.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Area: </span>
                    <span className="font-medium text-amber-400">{activeLake.area} ha</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Depth: </span>
                    <span className="font-medium text-cyan-200">{activeLake.depth} m</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Thaw Rate: </span>
                    <span className="font-medium text-cyan-200">{activeLake.thawRate} m/yr</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Methane: </span>
                    <span className="font-medium text-cyan-200">{activeLake.methane} ppm</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Ice Content: </span>
                    <span className="font-medium text-cyan-200">{activeLake.iceContent}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-cyan-400">Lake Type: </span>
                    <span className="font-medium text-cyan-200">
                      {(activeLake as DemoLake).lakeType ? LAKE_TYPE_LABELS[(activeLake as DemoLake).lakeType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-cyan-400">Description: </span>
                    <span className="font-medium text-cyan-200">{activeLake.description}</span>
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
