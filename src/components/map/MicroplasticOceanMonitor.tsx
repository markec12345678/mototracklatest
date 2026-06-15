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
import { useMapStore, type MicroplasticOceanState, type MicroplasticOceanData } from '@/lib/map-store'
import { Droplet as DropletIcon7, X, Layers, MapPin, Filter, TrendingUp, Activity } from 'lucide-react'

const SAMPLE_LOCATIONS: MicroplasticOceanData[] = [
  {
    id: 'mo-pacific',
    name: 'Great Pacific Garbage',
    lat: 35.0,
    lng: -155.0,
    concentration: 500000,
    avgSize: 2.5,
    sourceType: 'fishing_debris',
    density: 'extreme',
    depth: 200,
    description: 'North Pacific subtropical gyre accumulation',
  },
  {
    id: 'mo-south-pacific',
    name: 'South Pacific Gyre',
    lat: -30.0,
    lng: -120.0,
    concentration: 200000,
    avgSize: 1.8,
    sourceType: 'river_input',
    density: 'high',
    depth: 100,
    description: 'Southern hemisphere accumulation zone',
  },
  {
    id: 'mo-mediterranean',
    name: 'Mediterranean Hotspot',
    lat: 36.0,
    lng: 18.0,
    concentration: 350000,
    avgSize: 3.0,
    sourceType: 'coastal_runoff',
    density: 'extreme',
    depth: 50,
    description: 'Semi-enclosed sea microplastic concentration',
  },
  {
    id: 'mo-north-sea',
    name: 'North Sea Surface',
    lat: 55.0,
    lng: 3.0,
    concentration: 80000,
    avgSize: 1.5,
    sourceType: 'atmospheric',
    density: 'moderate',
    depth: 30,
    description: 'Atmospheric deposition dominated zone',
  },
]

const STATUS_COLORS: Record<MicroplasticOceanData['density'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SOURCE_LABELS: Record<MicroplasticOceanData['sourceType'], string> = {
  river_input: 'River Input',
  coastal_runoff: 'Coastal Runoff',
  fishing_debris: 'Fishing Debris',
  atmospheric: 'Atmospheric',
}

function TrendIcon({ density }: { density: MicroplasticOceanData['density'] }) {
  const cfg = STATUS_COLORS[density]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MicroplasticOceanMonitor() {
  const state = useMapStore((s) => s.microplasticOcean)
  const setState = useMapStore((s) => s.setMicroplasticOcean)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : SAMPLE_LOCATIONS),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.densityFilter !== 'all' && z.density !== state.densityFilter) return false
      return true
    })
  }, [zones, state.densityFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalZones: 0, avgConcentration: 0, avgSize: 0, densityLevel: 'N/A' }
    }
    const avgConcentration = filteredZones.reduce((sum, z) => sum + z.concentration, 0) / filteredZones.length
    const avgSize = filteredZones.reduce((sum, z) => sum + z.avgSize, 0) / filteredZones.length
    const extremeCount = filteredZones.filter((z) => z.density === 'extreme').length
    const densityLevel = extremeCount >= filteredZones.length / 2 ? 'Extreme' : 'Mixed'
    return {
      totalZones: filteredZones.length,
      avgConcentration: Math.round(avgConcentration),
      avgSize: Math.round(avgSize * 10) / 10,
      densityLevel,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredZones.map((z) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [z.lng, z.lat] },
      properties: { id: z.id, name: z.name, density: z.density, concentration: z.concentration },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.zones.length === 0) {
      useMapStore.getState().setMicroplasticOcean({ zones: SAMPLE_LOCATIONS })
    }
  }, [state.zones.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MicroplasticOceanState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showConcentration', label: 'Concentration', icon: Activity },
    { key: 'showSize', label: 'Particle Size', icon: TrendingUp },
    { key: 'showSourceType', label: 'Source Type', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-purple-950/95 backdrop-blur-xl border border-violet-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <DropletIcon7 className="h-4 w-4 text-violet-400" />
              Microplastic Ocean Monitor
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
          {/* Density Filter */}
          <div>
            <Label className="text-xs text-violet-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Density Level
            </Label>
            <Select
              value={state.densityFilter}
              onValueChange={(v) =>
                setState({ densityFilter: v as MicroplasticOceanState['densityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Densities</SelectItem>
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
              <div className="text-[10px] text-violet-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-violet-200">{summary.totalZones}</div>
              <div className="text-[9px] text-violet-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Concentration</div>
              <div className="text-sm font-semibold text-orange-400">{(summary.avgConcentration / 1000).toFixed(0)}k</div>
              <div className="text-[9px] text-violet-400/60">particles/km²</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Particle Size</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgSize}</div>
              <div className="text-[9px] text-violet-400/60">mm</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Density Level</div>
              <div className="text-sm font-semibold text-red-400">{summary.densityLevel}</div>
              <div className="text-[9px] text-violet-400/60">dominant</div>
            </div>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">
              Microplastic Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_COLORS[zone.density]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-800/30'
                          : 'border-violet-700/30 hover:border-violet-500/30 hover:bg-violet-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeZoneId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon density={zone.density} />
                          <span className="text-xs font-medium text-violet-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300/60">
                        {state.showConcentration && (
                          <div>
                            Concentration:{' '}
                            <span className="text-violet-100 font-medium">{(zone.concentration / 1000).toFixed(0)}k/km²</span>
                          </div>
                        )}
                        {state.showSize && (
                          <div>
                            Avg Size:{' '}
                            <span className="text-violet-100 font-medium">{zone.avgSize}mm</span>
                          </div>
                        )}
                        {state.showSourceType && (
                          <div>
                            Source:{' '}
                            <span className="text-violet-100 font-medium">{SOURCE_LABELS[zone.sourceType]}</span>
                          </div>
                        )}
                        <div>
                          Depth:{' '}
                          <span className="text-violet-100 font-medium">0-{zone.depth}m</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-violet-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-violet-700/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeZone.density].bgClass}`}
                  >
                    {STATUS_COLORS[activeZone.density].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300/60 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400/70">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Concentration: </span>
                    <span className="font-medium text-orange-400">{activeZone.concentration.toLocaleString()}/km²</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Avg Size: </span>
                    <span className="font-medium text-blue-400">{activeZone.avgSize}mm</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Source: </span>
                    <span className="font-medium text-violet-200">{SOURCE_LABELS[activeZone.sourceType]}</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Depth: </span>
                    <span className="font-medium text-violet-200">0-{activeZone.depth}m</span>
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
