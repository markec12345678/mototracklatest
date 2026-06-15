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
import { useMapStore, type LavaTubeCaveState, type LavaTubeCaveData } from '@/lib/map-store'
import { Flame as FlameIcon14, X, Thermometer, Ruler, MapPin, Filter, LandPlot } from 'lucide-react'

const SAMPLE_LOCATIONS: LavaTubeCaveData[] = [
  {
    id: 'lt-kazumura',
    name: 'Kazumura Cave',
    lat: 19.38,
    lng: -155.08,
    length: 65.5,
    temperature: 25,
    lavaType: 'Pāhoehoe',
    status: 'dormant',
    description: 'Worlds longest lava tube on Kīlauea',
  },
  {
    id: 'lt-thurston',
    name: 'Thurston Lava Tube',
    lat: 19.40,
    lng: -155.25,
    length: 0.5,
    temperature: 22,
    lavaType: 'Pāhoehoe',
    status: 'dormant',
    description: 'Tourist-accessible lava tube near Kīlauea summit',
  },
  {
    id: 'lt-la-cueva',
    name: 'Cueva de los Verdes',
    lat: 29.15,
    lng: -13.47,
    length: 6.1,
    temperature: 20,
    lavaType: 'Aa',
    status: 'cooling',
    description: 'Lava tube in Canary Islands volcanic tunnel system',
  },
  {
    id: 'lt-nyiragongo',
    name: 'Nyiragongo Lava Tube',
    lat: -1.52,
    lng: 29.25,
    length: 2.3,
    temperature: 850,
    lavaType: 'Nephelinite',
    status: 'active',
    description: 'Active lava tube in Nyiragongo crater',
  },
]

const STATUS_COLORS: Record<LavaTubeCaveData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  cooling: { label: 'Cooling', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  dormant: { label: 'Dormant', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  collapsed: { label: 'Collapsed', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
}

function TrendIcon({ status }: { status: LavaTubeCaveData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function LavaTubeCaveMonitor() {
  const state = useMapStore((s) => s.lavaTubeCave)
  const setState = useMapStore((s) => s.setLavaTubeCave)

  const caves = useMemo(
    () => (state.caves.length > 0 ? state.caves : SAMPLE_LOCATIONS),
    [state.caves]
  )

  const filteredItems = useMemo(() => {
    return caves.filter((c) => {
      if (state.statusFilter !== 'all' && c.status !== state.statusFilter) return false
      return true
    })
  }, [caves, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalCaves: 0, avgLength: 0, avgTemperature: 0, activeCount: 0 }
    }
    const avgLength = filteredItems.reduce((sum, c) => sum + c.length, 0) / filteredItems.length
    const avgTemperature = filteredItems.reduce((sum, c) => sum + c.temperature, 0) / filteredItems.length
    const activeCount = filteredItems.filter((c) => c.status === 'active').length
    return {
      totalCaves: filteredItems.length,
      avgLength: Math.round(avgLength * 10) / 10,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => caves.find((c) => c.id === state.activeCaveId) ?? null,
    [caves, state.activeCaveId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { id: c.id, name: c.name, status: c.status, length: c.length },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.caves.length === 0) {
      useMapStore.getState().setLavaTubeCave({ caves: SAMPLE_LOCATIONS })
    }
  }, [state.caves.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LavaTubeCaveState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showLength', label: 'Length', icon: Ruler },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showLavaType', label: 'Lava Type', icon: LandPlot },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-orange-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <FlameIcon14 className="h-4 w-4 text-red-400" />
              Lava Tube Cave Monitor
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as LavaTubeCaveState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cooling">Cooling</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="collapsed">Collapsed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
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

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Caves</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalCaves}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Length</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgLength}</div>
              <div className="text-[9px] text-red-400/60">km</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-red-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Active Count</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeCount}</div>
              <div className="text-[9px] text-red-400/60">caves</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Cave List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Caves ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((c) => {
                  const isActive = state.activeCaveId === c.id
                  const statusCfg = STATUS_COLORS[c.status]
                  return (
                    <div
                      key={c.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeCaveId: isActive ? null : c.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={c.status} />
                          <span className="text-xs font-medium text-red-100">{c.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showLength && (
                          <div>
                            Length:{' '}
                            <span className="text-red-100 font-medium">{c.length} km</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-red-100 font-medium">{c.temperature}°C</span>
                          </div>
                        )}
                        {state.showLavaType && (
                          <div>
                            Lava Type:{' '}
                            <span className="text-red-100 font-medium">{c.lavaType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No caves match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Cave Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Length: </span>
                    <span className="font-medium text-orange-400">{activeItem.length} km</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Temperature: </span>
                    <span className="font-medium text-amber-400">{activeItem.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Lava Type: </span>
                    <span className="font-medium text-red-200">{activeItem.lavaType}</span>
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
