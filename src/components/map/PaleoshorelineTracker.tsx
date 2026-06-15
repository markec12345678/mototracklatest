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
import { useMapStore, type PaleoshorelineTrackerState, type PaleoshorelineTrackerData } from '@/lib/map-store'
import { MapPinned as MapPinnedIcon2, X, Clock, Mountain, Waves, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: PaleoshorelineTrackerData[] = [
  {
    id: 'ps-blacksea',
    name: 'Black Sea Ancient Shore',
    lat: 44.0,
    lng: 34.0,
    shorelineAge: 8,
    elevation: 15,
    seaLevelIndicator: 120,
    status: 'preserved',
    description: "Preserved Noah's Flood shoreline",
  },
  {
    id: 'ps-sahara',
    name: 'Mega-Lake Chad Shore',
    lat: 14.0,
    lng: 14.0,
    shorelineAge: 5,
    elevation: 280,
    seaLevelIndicator: 50,
    status: 'exposed',
    description: 'Holocene lake shoreline exposed',
  },
  {
    id: 'ps-mediterranean',
    name: 'Messinian Shoreline',
    lat: 36.0,
    lng: 15.0,
    shorelineAge: 5300,
    elevation: 2500,
    seaLevelIndicator: -2500,
    status: 'eroding',
    description: 'Messinian salinity crisis shore',
  },
  {
    id: 'ps-baltic',
    name: 'Baltic Ancylus Shore',
    lat: 58.0,
    lng: 18.0,
    shorelineAge: 9,
    elevation: 45,
    seaLevelIndicator: 25,
    status: 'submerged',
    description: 'Ancylus Lake submerged shore',
  },
]

const STATUS_COLORS: Record<PaleoshorelineTrackerData['status'], { label: string; color: string; bgClass: string }> = {
  preserved: { label: 'Preserved', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  exposed: { label: 'Exposed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  eroding: { label: 'Eroding', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  submerged: { label: 'Submerged', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: PaleoshorelineTrackerData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PaleoshorelineTracker() {
  const state = useMapStore((s) => s.paleoshorelineTracker)
  const setState = useMapStore((s) => s.setPaleoshorelineTracker)

  const items = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (state.statusFilter !== 'all' && item.status !== state.statusFilter) return false
      return true
    })
  }, [items, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgAge: 0, maxElevation: 0, preservedExposedCount: 0 }
    }
    const avgAge = filteredItems.reduce((sum, item) => sum + item.shorelineAge, 0) / filteredItems.length
    const maxElevation = Math.max(...filteredItems.map((item) => item.elevation))
    const preservedExposedCount = filteredItems.filter((item) => item.status === 'preserved' || item.status === 'exposed').length
    return {
      totalSites: filteredItems.length,
      avgAge: Math.round(avgAge * 10) / 10,
      maxElevation,
      preservedExposedCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => items.find((item) => item.id === state.activeItemId) ?? null,
    [items, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.lng, item.lat] },
      properties: { id: item.id, name: item.name, status: item.status, shorelineAge: item.shorelineAge },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setPaleoshorelineTracker({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PaleoshorelineTrackerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showShorelineAge', label: 'Shoreline Age', icon: Clock },
    { key: 'showElevation', label: 'Elevation', icon: Mountain },
    { key: 'showSeaLevelIndicator', label: 'Sea Level Indicator', icon: Waves },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-neutral-950/95 backdrop-blur-xl border border-stone-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <MapPinnedIcon2 className="h-4 w-4 text-stone-400" />
              Paleoshoreline Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-300 hover:text-stone-100 hover:bg-stone-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-stone-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-stone-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as PaleoshorelineTrackerState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="preserved">Preserved</SelectItem>
                <SelectItem value="exposed">Exposed</SelectItem>
                <SelectItem value="eroding">Eroding</SelectItem>
                <SelectItem value="submerged">Submerged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-200">
                  <Icon className="h-3 w-3 text-stone-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-stone-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-stone-200">{summary.totalSites}</div>
              <div className="text-[9px] text-stone-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Age</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgAge}</div>
              <div className="text-[9px] text-stone-400/60">kyr BP</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Max Elevation</div>
              <div className="text-sm font-semibold text-green-400">{summary.maxElevation}</div>
              <div className="text-[9px] text-stone-400/60">m</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Preserved+Exposed</div>
              <div className="text-sm font-semibold text-blue-400">{summary.preservedExposedCount}</div>
              <div className="text-[9px] text-stone-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">
              Sites ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((item) => {
                  const isActive = state.activeItemId === item.id
                  const statusCfg = STATUS_COLORS[item.status]
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-stone-500/50 bg-stone-800/30'
                          : 'border-stone-700/30 hover:border-stone-500/30 hover:bg-stone-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : item.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={item.status} />
                          <span className="text-xs font-medium text-stone-100">{item.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300/60">
                        {state.showShorelineAge && (
                          <div>
                            Age:{' '}
                            <span className="text-stone-100 font-medium">{item.shorelineAge} kyr BP</span>
                          </div>
                        )}
                        {state.showElevation && (
                          <div>
                            Elevation:{' '}
                            <span className="text-stone-100 font-medium">{item.elevation} m</span>
                          </div>
                        )}
                        {state.showSeaLevelIndicator && (
                          <div>
                            Sea Level:{' '}
                            <span className="text-stone-100 font-medium">{item.seaLevelIndicator} m above MSL</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-stone-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-stone-600/30 bg-stone-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-stone-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400/70">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Age: </span>
                    <span className="font-medium text-amber-400">{activeItem.shorelineAge} kyr BP</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Elevation: </span>
                    <span className="font-medium text-green-400">{activeItem.elevation} m</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Sea Level: </span>
                    <span className="font-medium text-blue-400">{activeItem.seaLevelIndicator} m above MSL</span>
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
