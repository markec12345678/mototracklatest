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
import { useMapStore, type OceanMicroplasticState, type OceanMicroplasticData } from '@/lib/map-store'
import { CircleDot as CircleDotIcon, X, Layers, Ruler, ArrowDown, TrendingUp, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: OceanMicroplasticData[] = [
  {
    id: 'omp-1', name: 'Great Pacific Garbage Patch', lat: 35, lng: -140, concentration: 450, particleSize: 2.5, depth: 200, accumulation: 85, sourceDistance: 1500, status: 'extreme', description: 'Largest accumulation of ocean plastic in the North Pacific',
  },
  {
    id: 'omp-2', name: 'North Atlantic Gyre', lat: 30, lng: -55, concentration: 280, particleSize: 3.0, depth: 150, accumulation: 65, sourceDistance: 800, status: 'high', description: 'Major plastic accumulation zone in the North Atlantic',
  },
  {
    id: 'omp-3', name: 'South Pacific Gyre', lat: -30, lng: -120, concentration: 180, particleSize: 2.0, depth: 100, accumulation: 50, sourceDistance: 1200, status: 'elevated', description: 'Growing plastic accumulation in the South Pacific',
  },
  {
    id: 'omp-4', name: 'Indian Ocean Gyre', lat: -25, lng: 75, concentration: 220, particleSize: 2.8, depth: 180, accumulation: 55, sourceDistance: 900, status: 'high', description: 'Significant microplastic concentration in Indian Ocean',
  },
  {
    id: 'omp-5', name: 'Mediterranean Coast', lat: 38, lng: 15, concentration: 350, particleSize: 1.5, depth: 50, accumulation: 75, sourceDistance: 50, status: 'extreme', description: 'Highly contaminated semi-enclosed Mediterranean basin',
  },
  {
    id: 'omp-6', name: 'Yangtze River Mouth', lat: 31, lng: 122, concentration: 500, particleSize: 4.0, depth: 30, accumulation: 90, sourceDistance: 5, status: 'extreme', description: 'Highest microplastic concentration near major river outlet',
  },
]

const STATUS_CONFIG: Record<OceanMicroplasticData['status'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  moderate: { label: 'Moderate', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  elevated: { label: 'Elevated', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function OceanMicroplasticTracker() {
  const state = useMapStore((s) => s.oceanMicroplastic)
  const setState = useMapStore((s) => s.setOceanMicroplastic)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.typeFilter !== 'all' && z.sourceDistance < 100 && state.typeFilter !== 'river_mouth') return false
      if (state.typeFilter === 'gyre' && z.sourceDistance < 500) return false
      if (state.typeFilter === 'coastal' && (z.sourceDistance < 20 || z.sourceDistance > 200)) return false
      if (state.typeFilter === 'river_mouth' && z.sourceDistance > 100) return false
      if (state.typeFilter === 'deep_ocean' && z.depth < 150) return false
      return true
    })
  }, [zones, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgConcentration: 0, avgDepth: 0, extremeCount: 0 }
    }
    const avgConcentration = filteredZones.reduce((sum, z) => sum + z.concentration, 0) / filteredZones.length
    const avgDepth = filteredZones.reduce((sum, z) => sum + z.depth, 0) / filteredZones.length
    const extremeCount = filteredZones.filter((z) => z.status === 'extreme').length
    return {
      avgConcentration: Math.round(avgConcentration),
      avgDepth: Math.round(avgDepth),
      extremeCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OceanMicroplasticState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showConcentration', label: 'Concentration', icon: Layers },
    { key: 'showParticleSize', label: 'Particle Size', icon: Ruler },
    { key: 'showDepth', label: 'Depth', icon: ArrowDown },
    { key: 'showAccumulation', label: 'Accumulation', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-teal-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg shadow-cyan-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <CircleDotIcon className="h-4 w-4 text-cyan-400" />
              Ocean Microplastic Tracker
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
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-cyan-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Zone Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({ typeFilter: v as OceanMicroplasticState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="gyre">Gyre</SelectItem>
                <SelectItem value="coastal">Coastal</SelectItem>
                <SelectItem value="river_mouth">River Mouth</SelectItem>
                <SelectItem value="deep_ocean">Deep Ocean</SelectItem>
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
              <div className="text-[10px] text-cyan-400">Avg Conc.</div>
              <div className="text-sm font-semibold text-teal-300">{summary.avgConcentration}</div>
              <div className="text-[9px] text-cyan-400">particles/L</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Avg Depth</div>
              <div className="text-sm font-semibold text-cyan-300">{summary.avgDepth}</div>
              <div className="text-[9px] text-cyan-400">m</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Extreme</div>
              <div className="text-sm font-semibold text-red-400">{summary.extremeCount}</div>
              <div className="text-[9px] text-cyan-400">zones</div>
            </div>
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300">
              Microplastic Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_CONFIG[zone.status]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/60 bg-cyan-800/30'
                          : 'border-cyan-800/30 hover:border-cyan-600/40 hover:bg-cyan-900/20'
                      }`}
                      onClick={() =>
                        setState({ activeZoneId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-cyan-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300">
                        {state.showConcentration && (
                          <div>
                            Conc: <span className="text-cyan-100 font-medium">{zone.concentration} p/L</span>
                          </div>
                        )}
                        {state.showParticleSize && (
                          <div>
                            Size: <span className="text-cyan-100 font-medium">{zone.particleSize} mm</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth: <span className="text-cyan-100 font-medium">{zone.depth} m</span>
                          </div>
                        )}
                        {state.showAccumulation && (
                          <div>
                            Accum: <span className="text-cyan-100 font-medium">{zone.accumulation}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-cyan-400 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-cyan-800/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Concentration: </span>
                    <span className="font-medium text-teal-300">{activeZone.concentration} p/L</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Particle Size: </span>
                    <span className="font-medium text-cyan-200">{activeZone.particleSize} mm</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Depth: </span>
                    <span className="font-medium text-cyan-200">{activeZone.depth} m</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Accumulation: </span>
                    <span className="font-medium text-cyan-200">{activeZone.accumulation}%</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Source Dist: </span>
                    <span className="font-medium text-cyan-200">{activeZone.sourceDistance} km</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-cyan-400">Description: </span>
                    <span className="font-medium text-cyan-200">{activeZone.description}</span>
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
