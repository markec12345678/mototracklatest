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
import { useMapStore, type IceShelfCollapseState, type IceShelfCollapseData } from '@/lib/map-store'
import { Layers as LayersIcon3, X, BarChart3, MapPin, Filter, Thermometer, TrendingUp } from 'lucide-react'

const DEMO_SHELVES: IceShelfCollapseData[] = [
  {
    id: 'isc-larsen-c',
    name: 'Larsen C Antarctica',
    lat: -68,
    lng: -62,
    area: 55000,
    thickness: 350,
    fracture: 65,
    meltRate: 2.5,
    buttressing: 75,
    status: 'fracturing',
    description: 'Major ice shelf with active fracture propagation threatening calving event',
  },
  {
    id: 'isc-thwaites',
    name: 'Thwaites Glacier Tongue',
    lat: -75,
    lng: -107,
    area: 3000,
    thickness: 300,
    fracture: 85,
    meltRate: 4.0,
    buttressing: 90,
    status: 'collapsing',
    description: 'Doomsday glacier experiencing rapid retreat and ice tongue disintegration',
  },
  {
    id: 'isc-ross',
    name: 'Ross Ice Shelf',
    lat: -78,
    lng: -175,
    area: 500000,
    thickness: 400,
    fracture: 20,
    meltRate: 0.5,
    buttressing: 95,
    status: 'stable',
    description: 'Largest ice shelf on Earth maintaining structural integrity',
  },
  {
    id: 'isc-filchner',
    name: 'Filchner-Ronne',
    lat: -78,
    lng: -40,
    area: 450000,
    thickness: 450,
    fracture: 25,
    meltRate: 0.8,
    buttressing: 90,
    status: 'stable',
    description: 'Second largest ice shelf with strong buttressing support',
  },
  {
    id: 'isc-pine-island',
    name: 'Pine Island Tongue',
    lat: -75,
    lng: -100,
    area: 5000,
    thickness: 250,
    fracture: 80,
    meltRate: 5.0,
    buttressing: 70,
    status: 'collapsing',
    description: 'Critically weakened ice tongue with accelerated calving and basal melt',
  },
  {
    id: 'isc-getz',
    name: 'Getz Ice Shelf',
    lat: -74,
    lng: -130,
    area: 30000,
    thickness: 200,
    fracture: 40,
    meltRate: 1.5,
    buttressing: 60,
    status: 'weakening',
    description: 'Ice shelf showing signs of progressive thinning and crack formation',
  },
]

const STATUS_CONFIG: Record<
  IceShelfCollapseData['status'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weakening: { label: 'Weakening', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  fracturing: { label: 'Fracturing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  collapsing: { label: 'Collapsing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsed: { label: 'Collapsed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function IceShelfCollapseMonitor() {
  const state = useMapStore((s) => s.iceShelfCollapse)
  const setState = useMapStore((s) => s.setIceShelfCollapse)

  const shelves = useMemo(
    () => (state.shelves.length > 0 ? state.shelves : DEMO_SHELVES),
    [state.shelves]
  )

  const filteredShelves = useMemo(() => {
    return shelves.filter((s) => {
      if (state.stabilityFilter !== 'all' && s.status !== state.stabilityFilter) return false
      return true
    })
  }, [shelves, state.stabilityFilter])

  const summary = useMemo(() => {
    if (filteredShelves.length === 0) {
      return { avgThickness: 0, avgFracture: 0, totalArea: 0 }
    }
    const avgThickness =
      filteredShelves.reduce((sum, s) => sum + s.thickness, 0) / filteredShelves.length
    const avgFracture =
      filteredShelves.reduce((sum, s) => sum + s.fracture, 0) / filteredShelves.length
    const totalArea = filteredShelves.reduce((sum, s) => sum + s.area, 0)
    return {
      avgThickness: Math.round(avgThickness),
      avgFracture: Math.round(avgFracture * 10) / 10,
      totalArea: totalArea.toLocaleString(),
    }
  }, [filteredShelves])

  const activeShelf = useMemo(
    () => shelves.find((s) => s.id === state.activeShelfId) ?? null,
    [shelves, state.activeShelfId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IceShelfCollapseState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showArea', label: 'Area', icon: BarChart3 },
    { key: 'showThickness', label: 'Thickness', icon: Thermometer },
    { key: 'showFracture', label: 'Fracture', icon: TrendingUp },
    { key: 'showMeltRate', label: 'Melt Rate', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-slate-950/95 backdrop-blur-xl border border-sky-800/40 rounded-xl shadow-lg shadow-sky-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <LayersIcon3 className="h-4 w-4 text-sky-400" />
              Ice Shelf Collapse Monitor
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
          {/* Stability Filter */}
          <div>
            <Label className="text-xs text-sky-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Stability Status
            </Label>
            <Select
              value={state.stabilityFilter}
              onValueChange={(v) =>
                setState({
                  stabilityFilter: v as IceShelfCollapseState['stabilityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="weakening">Weakening</SelectItem>
                <SelectItem value="fracturing">Fracturing</SelectItem>
                <SelectItem value="collapsing">Collapsing</SelectItem>
                <SelectItem value="collapsed">Collapsed</SelectItem>
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
              <div className="text-[10px] text-sky-400">Avg Thickness</div>
              <div className="text-sm font-semibold text-sky-300">{summary.avgThickness}</div>
              <div className="text-[9px] text-sky-400">m</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Avg Fracture</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgFracture}%</div>
              <div className="text-[9px] text-sky-400">index</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Total Area</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalArea}</div>
              <div className="text-[9px] text-sky-400">km²</div>
            </div>
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Shelf List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">
              Ice Shelves ({filteredShelves.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredShelves.map((shelf) => {
                  const isActive = state.activeShelfId === shelf.id
                  const statusCfg = STATUS_CONFIG[shelf.status]
                  return (
                    <div
                      key={shelf.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/60 bg-sky-800/30'
                          : 'border-sky-800/30 hover:border-sky-600/40 hover:bg-sky-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeShelfId: isActive ? null : shelf.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-sky-100">{shelf.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300">
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-sky-100 font-medium">
                              {shelf.area.toLocaleString()} km²
                            </span>
                          </div>
                        )}
                        {state.showThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-sky-100 font-medium">
                              {shelf.thickness} m
                            </span>
                          </div>
                        )}
                        {state.showFracture && (
                          <div>
                            Fracture:{' '}
                            <span className="text-amber-400 font-medium">
                              {shelf.fracture}%
                            </span>
                          </div>
                        )}
                        {state.showMeltRate && (
                          <div>
                            Melt Rate:{' '}
                            <span className="text-orange-400 font-medium">
                              {shelf.meltRate} m/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredShelves.length === 0 && (
                  <div className="text-center text-xs text-sky-400 py-4">
                    No shelves match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Shelf Details */}
          {activeShelf && (
            <>
              <Separator className="bg-sky-800/30" />
              <div className="space-y-2 rounded-lg border border-sky-600/30 bg-sky-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeShelf.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeShelf.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeShelf.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeShelf.lat.toFixed(1)}, {activeShelf.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400">Area: </span>
                    <span className="font-medium text-sky-200">{activeShelf.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Thickness: </span>
                    <span className="font-medium text-sky-200">{activeShelf.thickness} m</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Fracture: </span>
                    <span className="font-medium text-amber-400">{activeShelf.fracture}%</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Melt Rate: </span>
                    <span className="font-medium text-orange-400">{activeShelf.meltRate} m/yr</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Buttressing: </span>
                    <span className="font-medium text-sky-200">{activeShelf.buttressing}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sky-400">Description: </span>
                    <span className="font-medium text-sky-200">{activeShelf.description}</span>
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
