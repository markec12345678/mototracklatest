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
import { useMapStore, type ColdWaterCoralReefState, type ColdWaterCoralReefData } from '@/lib/map-store'
import { Fish as FishIcon7, X, Anchor, Thermometer, Percent, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: ColdWaterCoralReefData[] = [
  {
    id: 'cw-mingulay',
    name: 'Mingulay Reef',
    lat: 56.8,
    lng: -7.4167,
    depth: 150,
    temperature: 6.5,
    coralCover: 45,
    status: 'thriving',
    description: 'Lophelia pertusa framework',
  },
  {
    id: 'cw-logachev',
    name: 'Logachev Mounds',
    lat: 51.4167,
    lng: -11.75,
    depth: 800,
    temperature: 4.2,
    coralCover: 22,
    status: 'stressed',
    description: 'Deep coral mounds',
  },
  {
    id: 'cw-tisler',
    name: 'Tisler Reef',
    lat: 58.9833,
    lng: 11.05,
    depth: 100,
    temperature: 7.1,
    coralCover: 15,
    status: 'bleached',
    description: 'Shallowest known cold coral',
  },
  {
    id: 'cw-galway',
    name: 'Galway Mound',
    lat: 51.5,
    lng: -11.8333,
    depth: 600,
    temperature: 5.0,
    coralCover: 35,
    status: 'protected',
    description: 'Marine Protected Area',
  },
]

const STATUS_COLORS: Record<ColdWaterCoralReefData['status'], { label: string; color: string; bgClass: string }> = {
  thriving: { label: 'Thriving', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stressed: { label: 'Stressed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  bleached: { label: 'Bleached', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  protected: { label: 'Protected', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: ColdWaterCoralReefData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function ColdWaterCoralReefMonitor() {
  const state = useMapStore((s) => s.coldWaterCoralReef)
  const setState = useMapStore((s) => s.setColdWaterCoralReef)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalReefs: 0, avgDepth: 0, avgTemperature: 0, thrivingCount: 0 }
    }
    const avgDepth = filteredItems.reduce((sum, e) => sum + e.depth, 0) / filteredItems.length
    const avgTemperature = filteredItems.reduce((sum, e) => sum + e.temperature, 0) / filteredItems.length
    const thrivingCount = filteredItems.filter((e) => e.status === 'thriving').length
    return {
      totalReefs: filteredItems.length,
      avgDepth,
      avgTemperature,
      thrivingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, depth: e.depth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setColdWaterCoralReef({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ColdWaterCoralReefState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: Anchor },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showCoralCover', label: 'Coral Cover', icon: Percent },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-blue-950/95 backdrop-blur-xl border border-indigo-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-indigo-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-100">
              <FishIcon7 className="h-4 w-4 text-indigo-400" />
              Cold Water Coral Reef
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-indigo-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as ColdWaterCoralReefState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-indigo-900/40 border-indigo-700/40 text-indigo-100 hover:bg-indigo-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="thriving">Thriving</SelectItem>
                <SelectItem value="stressed">Stressed</SelectItem>
                <SelectItem value="bleached">Bleached</SelectItem>
                <SelectItem value="protected">Protected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">Display Options</Label>
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

          <Separator className="bg-indigo-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Total Reefs</div>
              <div className="text-sm font-semibold text-indigo-200">{summary.totalReefs}</div>
              <div className="text-[9px] text-indigo-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgDepth.toFixed(0)}</div>
              <div className="text-[9px] text-indigo-400/60">m</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgTemperature.toFixed(1)}</div>
              <div className="text-[9px] text-indigo-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Thriving</div>
              <div className="text-sm font-semibold text-green-400">{summary.thrivingCount}</div>
              <div className="text-[9px] text-indigo-400/60">reefs</div>
            </div>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">
              Reefs ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/50 bg-indigo-800/30'
                          : 'border-indigo-700/30 hover:border-indigo-500/30 hover:bg-indigo-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-indigo-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-indigo-300/60">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-indigo-100 font-medium">{e.depth} m</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-indigo-100 font-medium">{e.temperature} °C</span>
                          </div>
                        )}
                        {state.showCoralCover && (
                          <div>
                            Cover:{' '}
                            <span className="text-indigo-100 font-medium">{e.coralCover}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-indigo-400/50 py-4">
                    No reefs match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-indigo-700/30" />
              <div className="space-y-2 rounded-lg border border-indigo-600/30 bg-indigo-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-indigo-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-indigo-400/70">Coordinates: </span>
                    <span className="font-medium text-indigo-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Depth: </span>
                    <span className="font-medium text-blue-400">{activeItem.depth} m</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Temperature: </span>
                    <span className="font-medium text-cyan-400">{activeItem.temperature} °C</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Coral Cover: </span>
                    <span className="font-medium text-green-400">{activeItem.coralCover}%</span>
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
