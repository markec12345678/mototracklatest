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
import { useMapStore, type UrbanNoiseCorridorState, type UrbanNoiseCorridorData } from '@/lib/map-store'
import { Activity as ActivityIcon4, X, Layers, Volume2, Heart, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: UrbanNoiseCorridorData[] = [
  {
    id: 'unc-heathrow',
    name: 'Heathrow Corridor',
    lat: 51.5,
    lng: -0.5,
    noiseLevel: 75,
    population: 500000,
    healthImpact: 0.72,
    sourceType: 'aircraft',
    level: 'extreme',
    description: 'Major aircraft noise corridor',
  },
  {
    id: 'unc-autobahn',
    name: 'Autobahn A9 Munich',
    lat: 48.2,
    lng: 11.6,
    noiseLevel: 68,
    population: 300000,
    healthImpact: 0.55,
    sourceType: 'traffic',
    level: 'high',
    description: 'High-speed traffic corridor',
  },
  {
    id: 'unc-shinkansen',
    name: 'Shinkansen Line',
    lat: 35.7,
    lng: 139.7,
    noiseLevel: 72,
    population: 450000,
    healthImpact: 0.65,
    sourceType: 'railway',
    level: 'high',
    description: 'High-speed rail noise zone',
  },
  {
    id: 'unc-ruhr',
    name: 'Ruhr Industrial',
    lat: 51.4,
    lng: 7.0,
    noiseLevel: 65,
    population: 200000,
    healthImpact: 0.48,
    sourceType: 'industrial',
    level: 'moderate',
    description: 'Industrial noise zone',
  },
]

const STATUS_COLORS: Record<UrbanNoiseCorridorData['level'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ level }: { level: UrbanNoiseCorridorData['level'] }) {
  const cfg = STATUS_COLORS[level]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function UrbanNoiseCorridorMonitor() {
  const state = useMapStore((s) => s.urbanNoiseCorridor)
  const setState = useMapStore((s) => s.setUrbanNoiseCorridor)

  const corridors = useMemo(
    () => (state.corridors.length > 0 ? state.corridors : SAMPLE_LOCATIONS),
    [state.corridors]
  )

  const filteredCorridors = useMemo(() => {
    return corridors.filter((c) => {
      if (state.levelFilter !== 'all' && c.level !== state.levelFilter) return false
      return true
    })
  }, [corridors, state.levelFilter])

  const summary = useMemo(() => {
    if (filteredCorridors.length === 0) {
      return { totalCorridors: 0, avgNoise: 0, totalPopulation: 0, avgHealthImpact: 0 }
    }
    const avgNoise = filteredCorridors.reduce((sum, c) => sum + c.noiseLevel, 0) / filteredCorridors.length
    const totalPopulation = filteredCorridors.reduce((sum, c) => sum + c.population, 0)
    const avgHealthImpact = filteredCorridors.reduce((sum, c) => sum + c.healthImpact, 0) / filteredCorridors.length
    return {
      totalCorridors: filteredCorridors.length,
      avgNoise: Math.round(avgNoise * 10) / 10,
      totalPopulation,
      avgHealthImpact: Math.round(avgHealthImpact * 100) / 100,
    }
  }, [filteredCorridors])

  const activeCorridor = useMemo(
    () => corridors.find((c) => c.id === state.activeCorridorId) ?? null,
    [corridors, state.activeCorridorId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredCorridors.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { id: c.id, name: c.name, level: c.level, noiseLevel: c.noiseLevel },
    })),
  }), [filteredCorridors])

  useEffect(() => {
    if (state.corridors.length === 0) {
      useMapStore.getState().setUrbanNoiseCorridor({ corridors: SAMPLE_LOCATIONS })
    }
  }, [state.corridors.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof UrbanNoiseCorridorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showLevel', label: 'Noise Level', icon: Volume2 },
    { key: 'showSources', label: 'Source Type', icon: Layers },
    { key: 'showHealthImpact', label: 'Health Impact', icon: Heart },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-purple-950/95 backdrop-blur-xl border border-violet-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <ActivityIcon4 className="h-4 w-4 text-violet-400" />
              Urban Noise Corridor Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-300 hover:text-violet-100 hover:bg-violet-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-violet-100">
          {/* Level Filter */}
          <div>
            <Label className="text-xs text-violet-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Noise Level
            </Label>
            <Select
              value={state.levelFilter}
              onValueChange={(v) =>
                setState({ levelFilter: v as UrbanNoiseCorridorState['levelFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-violet-200">
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Total Corridors</div>
              <div className="text-sm font-semibold text-violet-200">{summary.totalCorridors}</div>
              <div className="text-[9px] text-violet-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Noise Level</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgNoise}</div>
              <div className="text-[9px] text-violet-400/60">dB</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Affected Population</div>
              <div className="text-sm font-semibold text-violet-200">{(summary.totalPopulation / 1000).toFixed(0)}K</div>
              <div className="text-[9px] text-violet-400/60">people</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Health Impact</div>
              <div className="text-sm font-semibold text-violet-200">{summary.avgHealthImpact}</div>
              <div className="text-[9px] text-violet-400/60">avg index</div>
            </div>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Corridor List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">
              Corridors ({filteredCorridors.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCorridors.map((corridor) => {
                  const isActive = state.activeCorridorId === corridor.id
                  const statusCfg = STATUS_COLORS[corridor.level]
                  return (
                    <div
                      key={corridor.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-800/30'
                          : 'border-violet-700/30 hover:border-violet-500/30 hover:bg-violet-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeCorridorId: isActive ? null : corridor.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon level={corridor.level} />
                          <span className="text-xs font-medium text-violet-100">{corridor.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300/60">
                        {state.showLevel && (
                          <div>
                            Noise:{' '}
                            <span className="text-violet-100 font-medium">{corridor.noiseLevel}dB</span>
                          </div>
                        )}
                        {state.showSources && (
                          <div>
                            Source:{' '}
                            <span className="text-violet-100 font-medium">{corridor.sourceType}</span>
                          </div>
                        )}
                        {state.showHealthImpact && (
                          <div>
                            Health Impact:{' '}
                            <span className="text-violet-100 font-medium">{corridor.healthImpact}</span>
                          </div>
                        )}
                        {state.showLevel && (
                          <div>
                            Population:{' '}
                            <span className="text-violet-100 font-medium">{(corridor.population / 1000).toFixed(0)}K</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCorridors.length === 0 && (
                  <div className="text-center text-xs text-violet-400/50 py-4">
                    No corridors match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Corridor Details */}
          {activeCorridor && (
            <>
              <Separator className="bg-violet-700/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeCorridor.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeCorridor.level].bgClass}`}
                  >
                    {STATUS_COLORS[activeCorridor.level].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300/60 italic">{activeCorridor.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400/70">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeCorridor.lat.toFixed(1)}, {activeCorridor.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Noise Level: </span>
                    <span className="font-medium text-orange-400">{activeCorridor.noiseLevel}dB</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Population: </span>
                    <span className="font-medium text-violet-100">{activeCorridor.population.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Source Type: </span>
                    <span className="font-medium text-violet-100">{activeCorridor.sourceType}</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Health Impact: </span>
                    <span className="font-medium text-violet-100">{activeCorridor.healthImpact}</span>
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
