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
import { useMapStore, type SubductionZoneData, type SubductionZoneState } from '@/lib/map-store'
import { Layers as LayersIcon2, X, Activity, TrendingUp, Link2, Waves, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: SubductionZoneData[] = [
  {
    id: 'sz-cascadia',
    name: 'Cascadia Subduction Zone',
    lat: 46.0,
    lng: -124.5,
    seismicity: 45,
    slipRate: 40,
    couplingRatio: 0.85,
    tremorCount: 120,
    maxDepth: 660,
    convergenceRate: 45,
    status: 'locked',
    description: 'Pacific NW, USA - Potential M9.0 megathrust zone',
  },
  {
    id: 'sz-chile',
    name: 'Chile Subduction Zone',
    lat: -33.0,
    lng: -72.0,
    seismicity: 78,
    slipRate: 65,
    couplingRatio: 0.70,
    tremorCount: 85,
    maxDepth: 700,
    convergenceRate: 80,
    status: 'partial_lock',
    description: 'Central Chile - 1960 M9.5 earthquake source',
  },
  {
    id: 'sz-japan',
    name: 'Japan Trench',
    lat: 38.0,
    lng: 143.5,
    seismicity: 92,
    slipRate: 85,
    couplingRatio: 0.60,
    tremorCount: 200,
    maxDepth: 680,
    convergenceRate: 90,
    status: 'creeping',
    description: 'NE Japan - 2011 Tohoku earthquake zone',
  },
  {
    id: 'sz-sumatra',
    name: 'Sumatra Trench',
    lat: 2.0,
    lng: 97.0,
    seismicity: 70,
    slipRate: 55,
    couplingRatio: 0.75,
    tremorCount: 95,
    maxDepth: 650,
    convergenceRate: 60,
    status: 'locked',
    description: 'Indonesia - 2004 Indian Ocean earthquake source',
  },
  {
    id: 'sz-hikurangi',
    name: 'Hikurangi Margin',
    lat: -39.0,
    lng: 178.0,
    seismicity: 55,
    slipRate: 45,
    couplingRatio: 0.55,
    tremorCount: 150,
    maxDepth: 600,
    convergenceRate: 50,
    status: 'tremor_swarm',
    description: 'New Zealand - Slow slip event zone',
  },
  {
    id: 'sz-middle-america',
    name: 'Middle America Trench',
    lat: 14.0,
    lng: -92.0,
    seismicity: 62,
    slipRate: 70,
    couplingRatio: 0.65,
    tremorCount: 60,
    maxDepth: 550,
    convergenceRate: 75,
    status: 'partial_lock',
    description: 'Central America - Complex subduction system',
  },
]

const ZONE_TYPE_MAP: Record<string, SubductionZoneState['typeFilter']> = {
  'sz-cascadia': 'oceanic_continental',
  'sz-chile': 'oceanic_continental',
  'sz-japan': 'oceanic_oceanic',
  'sz-sumatra': 'oceanic_oceanic',
  'sz-hikurangi': 'oceanic_continental',
  'sz-middle-america': 'continental_continental',
}

const STATUS_CONFIG: Record<
  SubductionZoneData['status'],
  { label: string; color: string; bgClass: string }
> = {
  locked: { label: 'Locked', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-400 border-red-500/30' },
  creeping: { label: 'Creeping', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-400 border-green-500/30' },
  partial_lock: { label: 'Partial Lock', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  tremor_swarm: { label: 'Tremor Swarm', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  megathrust: { label: 'Megathrust', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
}

const TYPE_FILTER_LABELS: Record<SubductionZoneState['typeFilter'], string> = {
  all: 'All Types',
  oceanic_oceanic: 'Oceanic-Oceanic',
  oceanic_continental: 'Oceanic-Continental',
  continental_continental: 'Continental-Continental',
}

export function SubductionZoneMonitor() {
  const state = useMapStore((s) => s.subductionZone)
  const setState = useMapStore((s) => s.setSubductionZone)

  useEffect(() => {
    if (state.zones.length === 0) {
      useMapStore.getState().setSubductionZone({ zones: DEMO_ZONES })
    }
  }, [state.zones.length])

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.typeFilter !== 'all' && ZONE_TYPE_MAP[z.id] !== state.typeFilter) return false
      return true
    })
  }, [zones, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgCouplingRatio: 0, avgConvergenceRate: 0, lockedCount: 0 }
    }
    const avgCouplingRatio =
      filteredZones.reduce((sum, z) => sum + z.couplingRatio, 0) / filteredZones.length
    const avgConvergenceRate =
      filteredZones.reduce((sum, z) => sum + z.convergenceRate, 0) / filteredZones.length
    const lockedCount = filteredZones.filter(
      (z) => z.status === 'locked'
    ).length
    return {
      avgCouplingRatio: Math.round(avgCouplingRatio * 100) / 100,
      avgConvergenceRate: Math.round(avgConvergenceRate * 10) / 10,
      lockedCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubductionZoneState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSeismicity', label: 'Seismicity', icon: Activity },
    { key: 'showSlipRate', label: 'Slip Rate', icon: TrendingUp },
    { key: 'showCoupling', label: 'Coupling Ratio', icon: Link2 },
    { key: 'showTremorActivity', label: 'Tremor Activity', icon: Waves },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-slate-950 to-zinc-950 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-lg overflow-hidden text-slate-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-200">
              <LayersIcon2 className="h-4 w-4 text-slate-400" />
              Subduction Zone Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-slate-400 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Subduction Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SubductionZoneState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-800/60 border-slate-600/50 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_FILTER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Icon className="h-3 w-3 text-slate-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-2 text-center">
              <div className="text-[10px] text-slate-400">Avg Coupling</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgCouplingRatio}</div>
              <div className="text-[9px] text-slate-500">ratio</div>
            </div>
            <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-2 text-center">
              <div className="text-[10px] text-slate-400">Avg Convergence</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgConvergenceRate}</div>
              <div className="text-[9px] text-slate-500">mm/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-2 text-center">
              <div className="text-[10px] text-slate-400">Locked Zones</div>
              <div className="text-sm font-semibold text-red-400">{summary.lockedCount}</div>
              <div className="text-[9px] text-slate-500">zones</div>
            </div>
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">
              Subduction Zones ({filteredZones.length})
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
                          ? 'border-slate-500/50 bg-slate-700/30'
                          : 'border-slate-700/40 hover:border-slate-500/20 hover:bg-slate-700/15'
                      }`}
                      onClick={() =>
                        setState({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-slate-200">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                        {state.showSeismicity && (
                          <div>
                            Seismicity:{' '}
                            <span className="text-slate-200 font-medium">
                              {zone.seismicity}
                            </span>
                          </div>
                        )}
                        {state.showSlipRate && (
                          <div>
                            Slip Rate:{' '}
                            <span className="text-slate-200 font-medium">
                              {zone.slipRate} mm/yr
                            </span>
                          </div>
                        )}
                        {state.showCoupling && (
                          <div>
                            Coupling:{' '}
                            <span className="text-slate-200 font-medium">
                              {zone.couplingRatio.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {state.showTremorActivity && (
                          <div>
                            Tremors:{' '}
                            <span className="text-slate-200 font-medium">
                              {zone.tremorCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-slate-500 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-slate-700/50" />
              <div className="space-y-2 rounded-lg border border-slate-500/20 bg-slate-800/40 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-200">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-400 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Coordinates: </span>
                    <span className="font-medium text-slate-200">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Max Depth: </span>
                    <span className="font-medium text-slate-200">{activeZone.maxDepth} km</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Seismicity: </span>
                    <span className="font-medium text-slate-200">{activeZone.seismicity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Slip Rate: </span>
                    <span className="font-medium text-slate-200">{activeZone.slipRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Coupling: </span>
                    <span className="font-medium text-slate-200">{activeZone.couplingRatio.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tremors: </span>
                    <span className="font-medium text-slate-200">{activeZone.tremorCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Convergence: </span>
                    <span className="font-medium text-slate-200">{activeZone.convergenceRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Type: </span>
                    <span className="font-medium text-slate-200">
                      {ZONE_TYPE_MAP[activeZone.id]?.replace(/_/g, '-') ?? 'N/A'}
                    </span>
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
