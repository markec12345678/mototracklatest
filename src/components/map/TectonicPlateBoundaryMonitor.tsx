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
import { useMapStore, type TectonicPlateBoundaryState, type TectonicPlateBoundaryData } from '@/lib/map-store'
import { Globe as GlobeIcon3, X, Gauge, Zap, Activity, ArrowRightLeft, MapPin, Filter } from 'lucide-react'

interface DemoBoundary extends TectonicPlateBoundaryData {
  boundaryType: 'convergent' | 'divergent' | 'transform' | 'complex'
}

const DEMO_BOUNDARIES: DemoBoundary[] = [
  {
    id: 'tpb-cascadia',
    name: 'Cascadia Subduction',
    lat: 46,
    lng: -124,
    velocity: 40,
    stress: 85,
    seismicity: 35,
    slipRate: 0,
    maxDepth: 30,
    status: 'locked',
    description: 'Fully locked subduction zone capable of producing M9+ megathrust earthquakes',
    boundaryType: 'convergent',
  },
  {
    id: 'tpb-sanandreas',
    name: 'San Andreas Fault',
    lat: 35.5,
    lng: -118,
    velocity: 35,
    stress: 60,
    seismicity: 55,
    slipRate: 28,
    maxDepth: 15,
    status: 'creeping',
    description: 'Right-lateral transform fault with sections of aseismic creep and locked segments',
    boundaryType: 'transform',
  },
  {
    id: 'tpb-midatlantic',
    name: 'Mid-Atlantic Ridge',
    lat: 30,
    lng: -42,
    velocity: 25,
    stress: 20,
    seismicity: 80,
    slipRate: 25,
    maxDepth: 8,
    status: 'creeping',
    description: 'Active divergent plate boundary with continuous seafloor spreading',
    boundaryType: 'divergent',
  },
  {
    id: 'tpb-himalayan',
    name: 'Himalayan Front',
    lat: 28,
    lng: 85,
    velocity: 45,
    stress: 90,
    seismicity: 45,
    slipRate: 5,
    maxDepth: 25,
    status: 'locked',
    description: 'Continental collision zone with significant strain accumulation',
    boundaryType: 'convergent',
  },
  {
    id: 'tpb-japan',
    name: 'Japan Trench',
    lat: 38,
    lng: 143,
    velocity: 85,
    stress: 75,
    seismicity: 60,
    slipRate: 10,
    maxDepth: 35,
    status: 'partial_lock',
    description: 'Subduction zone with mixed locking behavior and slow slip events',
    boundaryType: 'convergent',
  },
  {
    id: 'tpb-anatolian',
    name: 'Anatolian Fault',
    lat: 39,
    lng: 37,
    velocity: 25,
    stress: 70,
    seismicity: 65,
    slipRate: 18,
    maxDepth: 12,
    status: 'tremor_swarm',
    description: 'Major strike-slip fault with ongoing tremor swarm activity',
    boundaryType: 'transform',
  },
]

const STATUS_CONFIG: Record<
  TectonicPlateBoundaryData['status'],
  { label: string; color: string; bgClass: string }
> = {
  locked: { label: 'Locked', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  creeping: { label: 'Creeping', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  partial_lock: { label: 'Partial Lock', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  tremor_swarm: { label: 'Tremor Swarm', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  rupturing: { label: 'Rupturing', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
}

const BOUNDARY_TYPE_LABELS: Record<DemoBoundary['boundaryType'], string> = {
  convergent: 'Convergent',
  divergent: 'Divergent',
  transform: 'Transform',
  complex: 'Complex',
}

export function TectonicPlateBoundaryMonitor() {
  const state = useMapStore((s) => s.tectonicPlateBoundary)
  const setState = useMapStore((s) => s.setTectonicPlateBoundary)

  const boundaries = useMemo(
    () => (state.boundaries.length > 0 ? (state.boundaries as DemoBoundary[]) : DEMO_BOUNDARIES),
    [state.boundaries]
  )

  const filteredBoundaries = useMemo(() => {
    return boundaries.filter((b) => {
      if (state.typeFilter !== 'all' && b.boundaryType !== state.typeFilter) return false
      return true
    })
  }, [boundaries, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredBoundaries.length === 0) {
      return { avgVelocity: 0, avgStress: 0, lockedCount: 0 }
    }
    const avgVelocity =
      filteredBoundaries.reduce((sum, b) => sum + b.velocity, 0) / filteredBoundaries.length
    const avgStress =
      filteredBoundaries.reduce((sum, b) => sum + b.stress, 0) / filteredBoundaries.length
    const lockedCount = filteredBoundaries.filter(
      (b) => b.status === 'locked'
    ).length
    return {
      avgVelocity: Math.round(avgVelocity),
      avgStress: Math.round(avgStress),
      lockedCount,
    }
  }, [filteredBoundaries])

  const activeBoundary = useMemo(
    () => boundaries.find((b) => b.id === state.activeBoundaryId) ?? null,
    [boundaries, state.activeBoundaryId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TectonicPlateBoundaryState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVelocity', label: 'Velocity', icon: Gauge },
    { key: 'showStress', label: 'Stress', icon: Zap },
    { key: 'showSeismicity', label: 'Seismicity', icon: Activity },
    { key: 'showSlipRate', label: 'Slip Rate', icon: ArrowRightLeft },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-zinc-950/80 to-neutral-950/80 backdrop-blur-xl border border-zinc-700/40 rounded-xl shadow-lg shadow-zinc-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-100">
              <GlobeIcon3 className="h-4 w-4 text-zinc-400" />
              Tectonic Plate Boundary Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-zinc-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-zinc-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Boundary Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as TectonicPlateBoundaryState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-zinc-800/40 border-zinc-600/40 text-zinc-100 hover:bg-zinc-800/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="convergent">Convergent</SelectItem>
                <SelectItem value="divergent">Divergent</SelectItem>
                <SelectItem value="transform">Transform</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-zinc-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-200">
                  <Icon className="h-3 w-3 text-zinc-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-zinc-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-zinc-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-zinc-600/30 bg-zinc-800/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400">Avg Velocity</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgVelocity}</div>
              <div className="text-[9px] text-zinc-400">mm/yr</div>
            </div>
            <div className="rounded-lg border border-zinc-600/30 bg-zinc-800/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400">Avg Stress</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgStress}</div>
              <div className="text-[9px] text-zinc-400">MPa</div>
            </div>
            <div className="rounded-lg border border-zinc-600/30 bg-zinc-800/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400">Locked</div>
              <div className="text-sm font-semibold text-red-400">{summary.lockedCount}</div>
              <div className="text-[9px] text-zinc-400">boundaries</div>
            </div>
          </div>

          <Separator className="bg-zinc-700/30" />

          {/* Boundary List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300">
              Plate Boundaries ({filteredBoundaries.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredBoundaries.map((boundary) => {
                  const isActive = state.activeBoundaryId === boundary.id
                  const statusCfg = STATUS_CONFIG[boundary.status]
                  return (
                    <div
                      key={boundary.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-zinc-500/60 bg-zinc-700/30'
                          : 'border-zinc-700/30 hover:border-zinc-500/40 hover:bg-zinc-800/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeBoundaryId: isActive ? null : boundary.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-zinc-100">{boundary.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-zinc-300">
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-zinc-100 font-medium">
                              {boundary.velocity} mm/yr
                            </span>
                          </div>
                        )}
                        {state.showStress && (
                          <div>
                            Stress:{' '}
                            <span className="text-zinc-100 font-medium">
                              {boundary.stress} MPa
                            </span>
                          </div>
                        )}
                        {state.showSeismicity && (
                          <div>
                            Seismicity:{' '}
                            <span className="text-zinc-100 font-medium">
                              {boundary.seismicity}%
                            </span>
                          </div>
                        )}
                        {state.showSlipRate && (
                          <div>
                            Slip Rate:{' '}
                            <span className="text-zinc-100 font-medium">
                              {boundary.slipRate} mm/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredBoundaries.length === 0 && (
                  <div className="text-center text-xs text-zinc-400 py-4">
                    No boundaries match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Boundary Details */}
          {activeBoundary && (
            <>
              <Separator className="bg-zinc-700/30" />
              <div className="space-y-2 rounded-lg border border-zinc-500/30 bg-zinc-800/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-100">{activeBoundary.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeBoundary.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeBoundary.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-400">Coordinates: </span>
                    <span className="font-medium text-zinc-100">
                      {activeBoundary.lat.toFixed(1)}, {activeBoundary.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Velocity: </span>
                    <span className="font-medium text-blue-400">{activeBoundary.velocity} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Stress: </span>
                    <span className="font-medium text-amber-400">{activeBoundary.stress} MPa</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Seismicity: </span>
                    <span className="font-medium text-zinc-200">{activeBoundary.seismicity}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Slip Rate: </span>
                    <span className="font-medium text-zinc-200">{activeBoundary.slipRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Max Depth: </span>
                    <span className="font-medium text-zinc-200">{activeBoundary.maxDepth} km</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400">Boundary Type: </span>
                    <span className="font-medium text-zinc-200">
                      {(activeBoundary as DemoBoundary).boundaryType ? BOUNDARY_TYPE_LABELS[(activeBoundary as DemoBoundary).boundaryType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400">Description: </span>
                    <span className="font-medium text-zinc-200">{activeBoundary.description}</span>
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
