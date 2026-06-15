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
import { useMapStore, type CaveMineralState, type CaveMineralData } from '@/lib/map-store'
import { Gem as GemIcon3, X, Clock, Sparkles, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CaveMineralData[] = [
  {
    id: 'cm-carlsbad',
    name: 'Carlsbad Caverns',
    lat: 32.2,
    lng: -104.5,
    mineralType: 'stalactite',
    growthRate: 0.5,
    age: 500000,
    purity: 0.92,
    description: 'Massive stalactite formations',
  },
  {
    id: 'cm-waitomo',
    name: 'Waitomo Glow',
    lat: -38.3,
    lng: 175.1,
    mineralType: 'stalagmite',
    growthRate: 0.3,
    age: 300000,
    purity: 0.88,
    description: 'Bioluminescent cave formations',
  },
  {
    id: 'cm-naica',
    name: 'Naica Crystal',
    lat: 27.8,
    lng: -105.5,
    mineralType: 'crystal',
    growthRate: 1.2,
    age: 600000,
    purity: 0.99,
    description: 'Giant selenite crystals',
  },
  {
    id: 'cm-mammoth',
    name: 'Mammoth Cave',
    lat: 37.2,
    lng: -86.1,
    mineralType: 'flowstone',
    growthRate: 0.2,
    age: 400000,
    purity: 0.85,
    description: 'Extensive flowstone deposits',
  },
]

const STATUS_COLORS: Record<CaveMineralData['mineralType'], { label: string; color: string; bgClass: string }> = {
  stalactite: { label: 'Stalactite', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stalagmite: { label: 'Stalagmite', color: '#8b5cf6', bgClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30' },
  flowstone: { label: 'Flowstone', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  crystal: { label: 'Crystal', color: '#ec4899', bgClass: 'bg-pink-500/10 text-pink-600 border-pink-500/30' },
}

function TrendIcon({ mineralType }: { mineralType: CaveMineralData['mineralType'] }) {
  const cfg = STATUS_COLORS[mineralType]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CaveMineralFormationMonitor() {
  const state = useMapStore((s) => s.caveMineral)
  const setState = useMapStore((s) => s.setCaveMineral)

  const formations = useMemo(
    () => (state.formations.length > 0 ? state.formations : SAMPLE_LOCATIONS),
    [state.formations]
  )

  const filteredFormations = useMemo(() => {
    return formations.filter((f) => {
      if (state.typeFilter !== 'all' && f.mineralType !== state.typeFilter) return false
      return true
    })
  }, [formations, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredFormations.length === 0) {
      return { totalFormations: 0, avgGrowthRate: 0, avgAge: 0, avgPurity: 0 }
    }
    const avgGrowthRate = filteredFormations.reduce((sum, f) => sum + f.growthRate, 0) / filteredFormations.length
    const avgAge = filteredFormations.reduce((sum, f) => sum + f.age, 0) / filteredFormations.length
    const avgPurity = filteredFormations.reduce((sum, f) => sum + f.purity, 0) / filteredFormations.length
    return {
      totalFormations: filteredFormations.length,
      avgGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      avgAge: Math.round(avgAge / 1000),
      avgPurity: Math.round(avgPurity * 100) / 100,
    }
  }, [filteredFormations])

  const activeFormation = useMemo(
    () => formations.find((f) => f.id === state.activeFormationId) ?? null,
    [formations, state.activeFormationId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredFormations.map((f) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
      properties: { id: f.id, name: f.name, mineralType: f.mineralType, purity: f.purity },
    })),
  }), [filteredFormations])

  useEffect(() => {
    if (state.formations.length === 0) {
      useMapStore.getState().setCaveMineral({ formations: SAMPLE_LOCATIONS })
    }
  }, [state.formations.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CaveMineralState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMineralType', label: 'Mineral Type', icon: GemIcon3 },
    { key: 'showAge', label: 'Formation Age', icon: Clock },
    { key: 'showPurity', label: 'Purity Index', icon: Sparkles },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-stone-950/95 backdrop-blur-xl border border-violet-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <GemIcon3 className="h-4 w-4 text-violet-400" />
              Cave Mineral Formation Monitor
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
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-violet-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Mineral Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({ typeFilter: v as CaveMineralState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="stalactite">Stalactite</SelectItem>
                <SelectItem value="stalagmite">Stalagmite</SelectItem>
                <SelectItem value="flowstone">Flowstone</SelectItem>
                <SelectItem value="crystal">Crystal</SelectItem>
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
              <div className="text-[10px] text-violet-400/70">Total Formations</div>
              <div className="text-sm font-semibold text-violet-200">{summary.totalFormations}</div>
              <div className="text-[9px] text-violet-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Growth Rate</div>
              <div className="text-sm font-semibold text-violet-200">{summary.avgGrowthRate}</div>
              <div className="text-[9px] text-violet-400/60">mm/yr</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Age</div>
              <div className="text-sm font-semibold text-pink-400">{summary.avgAge}k</div>
              <div className="text-[9px] text-violet-400/60">years</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Purity</div>
              <div className="text-sm font-semibold text-violet-200">{summary.avgPurity}</div>
              <div className="text-[9px] text-violet-400/60">index</div>
            </div>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Formation List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">
              Formations ({filteredFormations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFormations.map((formation) => {
                  const isActive = state.activeFormationId === formation.id
                  const statusCfg = STATUS_COLORS[formation.mineralType]
                  return (
                    <div
                      key={formation.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-800/30'
                          : 'border-violet-700/30 hover:border-violet-500/30 hover:bg-violet-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeFormationId: isActive ? null : formation.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon mineralType={formation.mineralType} />
                          <span className="text-xs font-medium text-violet-100">{formation.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300/60">
                        {state.showMineralType && (
                          <div>
                            Growth:{' '}
                            <span className="text-violet-100 font-medium">{formation.growthRate}mm/yr</span>
                          </div>
                        )}
                        {state.showAge && (
                          <div>
                            Age:{' '}
                            <span className="text-violet-100 font-medium">{(formation.age / 1000).toFixed(0)}k yr</span>
                          </div>
                        )}
                        {state.showPurity && (
                          <div>
                            Purity:{' '}
                            <span className="text-violet-100 font-medium">{formation.purity}</span>
                          </div>
                        )}
                        {state.showMineralType && (
                          <div>
                            Type:{' '}
                            <span className="text-violet-100 font-medium">{statusCfg.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFormations.length === 0 && (
                  <div className="text-center text-xs text-violet-400/50 py-4">
                    No formations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Formation Details */}
          {activeFormation && (
            <>
              <Separator className="bg-violet-700/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeFormation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeFormation.mineralType].bgClass}`}
                  >
                    {STATUS_COLORS[activeFormation.mineralType].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300/60 italic">{activeFormation.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400/70">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeFormation.lat.toFixed(1)}, {activeFormation.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Type: </span>
                    <span className="font-medium text-violet-100">{STATUS_COLORS[activeFormation.mineralType].label}</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Growth Rate: </span>
                    <span className="font-medium text-pink-400">{activeFormation.growthRate}mm/yr</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Age: </span>
                    <span className="font-medium text-violet-100">{(activeFormation.age / 1000).toFixed(0)}k years</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Purity: </span>
                    <span className="font-medium text-violet-100">{activeFormation.purity}</span>
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
