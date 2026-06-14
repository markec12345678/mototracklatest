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
import { useMapStore, type GroundSubsidenceState, type GroundSubsidenceData } from '@/lib/map-store'
import { ArrowDown as ArrowDownIcon3, X, BarChart3, MapPin, Filter, TrendingDown, AlertTriangle } from 'lucide-react'

const DEMO_ZONES: GroundSubsidenceData[] = [
  {
    id: 'gs-jakarta',
    name: 'Jakarta Indonesia',
    lat: -6.2,
    lng: 106.8,
    subsidenceRate: 150,
    groundwater: -25,
    infrastructure: 85,
    risk: 90,
    totalSubsidence: 4000,
    status: 'catastrophic',
    description: 'One of the fastest sinking cities in the world due to groundwater extraction',
  },
  {
    id: 'gs-mexicocity',
    name: 'Mexico City',
    lat: 19.4,
    lng: -99.1,
    subsidenceRate: 100,
    groundwater: -15,
    infrastructure: 75,
    risk: 80,
    totalSubsidence: 9000,
    status: 'catastrophic',
    description: 'Built on ancient lakebed, severe subsidence from aquifer depletion',
  },
  {
    id: 'gs-shanghai',
    name: 'Shanghai',
    lat: 31.2,
    lng: 121.5,
    subsidenceRate: 25,
    groundwater: -5,
    infrastructure: 50,
    risk: 55,
    totalSubsidence: 3000,
    status: 'moderate',
    description: 'Coastal city with controlled but ongoing subsidence issues',
  },
  {
    id: 'gs-sanjoaquin',
    name: 'San Joaquin Valley',
    lat: 36.5,
    lng: -120,
    subsidenceRate: 60,
    groundwater: -10,
    infrastructure: 65,
    risk: 70,
    totalSubsidence: 8000,
    status: 'rapid',
    description: 'Agricultural valley with severe groundwater depletion subsidence',
  },
  {
    id: 'gs-venice',
    name: 'Venice',
    lat: 45.4,
    lng: 12.3,
    subsidenceRate: 5,
    groundwater: -1,
    infrastructure: 35,
    risk: 40,
    totalSubsidence: 250,
    status: 'slow',
    description: 'Historic city with slow subsidence compounded by sea level rise',
  },
  {
    id: 'gs-tokyo',
    name: 'Tokyo',
    lat: 35.7,
    lng: 139.7,
    subsidenceRate: 2,
    groundwater: 0,
    infrastructure: 20,
    risk: 15,
    totalSubsidence: 500,
    status: 'stable',
    description: 'Successfully stabilized after strict groundwater regulations',
  },
]

const STATUS_CONFIG: Record<
  GroundSubsidenceData['status'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  slow: { label: 'Slow', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rapid: { label: 'Rapid', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  catastrophic: { label: 'Catastrophic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function GroundSubsidenceMonitor() {
  const state = useMapStore((s) => s.groundSubsidence)
  const setState = useMapStore((s) => s.setGroundSubsidence)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.causeFilter !== 'all') {
        const causeMap: Record<string, string[]> = {
          groundwater_extraction: ['gs-jakarta', 'gs-mexicocity', 'gs-shanghai', 'gs-sanjoaquin'],
          mining: ['gs-sanjoaquin'],
          oil_gas: ['gs-shanghai'],
          natural: ['gs-venice', 'gs-tokyo'],
        }
        if (!causeMap[state.causeFilter]?.includes(z.id)) return false
      }
      return true
    })
  }, [zones, state.causeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgSubsidenceRate: 0, avgRisk: 0, avgInfrastructure: 0 }
    }
    const avgSubsidenceRate =
      filteredZones.reduce((sum, z) => sum + z.subsidenceRate, 0) / filteredZones.length
    const avgRisk =
      filteredZones.reduce((sum, z) => sum + z.risk, 0) / filteredZones.length
    const avgInfrastructure =
      filteredZones.reduce((sum, z) => sum + z.infrastructure, 0) / filteredZones.length
    return {
      avgSubsidenceRate: Math.round(avgSubsidenceRate),
      avgRisk: Math.round(avgRisk),
      avgInfrastructure: Math.round(avgInfrastructure),
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GroundSubsidenceState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSubsidenceRate', label: 'Subsidence Rate', icon: TrendingDown },
    { key: 'showGroundwater', label: 'Groundwater Level', icon: ArrowDownIcon3 },
    { key: 'showInfrastructure', label: 'Infrastructure Risk', icon: AlertTriangle },
    { key: 'showRisk', label: 'Overall Risk', icon: BarChart3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-stone-950/80 backdrop-blur-xl border border-stone-800/40 rounded-xl shadow-lg shadow-stone-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <ArrowDownIcon3 className="h-4 w-4 text-stone-400" />
              Ground Subsidence Monitor
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
          {/* Cause Filter */}
          <div>
            <Label className="text-xs text-stone-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Cause Type
            </Label>
            <Select
              value={state.causeFilter}
              onValueChange={(v) =>
                setState({
                  causeFilter: v as GroundSubsidenceState['causeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Causes</SelectItem>
                <SelectItem value="groundwater_extraction">Groundwater Extraction</SelectItem>
                <SelectItem value="mining">Mining</SelectItem>
                <SelectItem value="oil_gas">Oil &amp; Gas</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300">Display Options</Label>
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

          <Separator className="bg-stone-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Subsidence</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgSubsidenceRate}</div>
              <div className="text-[9px] text-stone-400">mm/yr</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Risk</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgRisk}</div>
              <div className="text-[9px] text-stone-400">index</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Infrastructure</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgInfrastructure}</div>
              <div className="text-[9px] text-stone-400">risk</div>
            </div>
          </div>

          <Separator className="bg-stone-800/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300">
              Subsidence Zones ({filteredZones.length})
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
                          ? 'border-stone-500/60 bg-stone-800/30'
                          : 'border-stone-800/30 hover:border-stone-600/40 hover:bg-stone-900/20'
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
                          <span className="text-xs font-medium text-stone-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300">
                        {state.showSubsidenceRate && (
                          <div>
                            Subsidence Rate:{' '}
                            <span className="text-amber-400 font-medium">
                              {zone.subsidenceRate} mm/yr
                            </span>
                          </div>
                        )}
                        {state.showGroundwater && (
                          <div>
                            Groundwater:{' '}
                            <span className="text-sky-400 font-medium">
                              {zone.groundwater} m
                            </span>
                          </div>
                        )}
                        {state.showInfrastructure && (
                          <div>
                            Infrastructure:{' '}
                            <span className="text-orange-400 font-medium">
                              {zone.infrastructure}
                            </span>
                          </div>
                        )}
                        {state.showRisk && (
                          <div>
                            Risk:{' '}
                            <span className="text-red-400 font-medium">
                              {zone.risk}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-stone-400 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-stone-800/30" />
              <div className="space-y-2 rounded-lg border border-stone-600/30 bg-stone-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400">Subsidence Rate: </span>
                    <span className="font-medium text-amber-400">{activeZone.subsidenceRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Groundwater: </span>
                    <span className="font-medium text-sky-400">{activeZone.groundwater} m</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Infrastructure: </span>
                    <span className="font-medium text-orange-400">{activeZone.infrastructure}</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Total Subsidence: </span>
                    <span className="font-medium text-stone-200">{activeZone.totalSubsidence} mm</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Risk: </span>
                    <span className="font-medium text-red-400">{activeZone.risk}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400">Description: </span>
                    <span className="font-medium text-stone-200">{activeZone.description}</span>
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
