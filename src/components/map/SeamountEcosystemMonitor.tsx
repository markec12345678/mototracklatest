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
import { useMapStore, type SeamountEcosystemState, type SeamountEcosystemData } from '@/lib/map-store'
import { Mountain as MountainIcon8, X, BarChart3, MapPin, Filter, TrendingUp, Fish } from 'lucide-react'

const DEMO_SEAMOUNTS: SeamountEcosystemData[] = [
  {
    id: 'se-davidson',
    name: 'Davidson Seamount',
    lat: 35.7,
    lng: -122.7,
    elevation: 2300,
    biodiversity: 92,
    currentSpeed: 15,
    fishingPressure: 5,
    depth: 1250,
    status: 'pristine',
    description: 'Pristine deep-sea seamount off California with rich coral gardens',
  },
  {
    id: 'se-vema',
    name: 'Vema Seamount',
    lat: -31.6,
    lng: 8.4,
    elevation: 3200,
    biodiversity: 75,
    currentSpeed: 25,
    fishingPressure: 45,
    depth: 700,
    status: 'moderate',
    description: 'South Atlantic seamount with moderate fishing impact on ecosystem',
  },
  {
    id: 'se-emperor',
    name: 'Emperor Seamount',
    lat: 42,
    lng: 170,
    elevation: 2800,
    biodiversity: 68,
    currentSpeed: 20,
    fishingPressure: 55,
    depth: 900,
    status: 'degraded',
    description: 'Pacific seamount chain showing degradation from overfishing',
  },
  {
    id: 'se-cobra',
    name: 'Cobra Seamount',
    lat: -34,
    lng: 42,
    elevation: 1500,
    biodiversity: 80,
    currentSpeed: 18,
    fishingPressure: 15,
    depth: 1800,
    status: 'good',
    description: 'Indian Ocean seamount with healthy benthic communities',
  },
  {
    id: 'se-cross',
    name: 'Cross Seamount',
    lat: 18.7,
    lng: -158.3,
    elevation: 3200,
    biodiversity: 60,
    currentSpeed: 22,
    fishingPressure: 70,
    depth: 400,
    status: 'heavily_fished',
    description: 'Hawaiian seamount severely impacted by commercial fishing',
  },
  {
    id: 'se-kocebu',
    name: 'Kocebu Guyot',
    lat: 17,
    lng: 152,
    elevation: 2000,
    biodiversity: 85,
    currentSpeed: 12,
    fishingPressure: 10,
    depth: 1500,
    status: 'good',
    description: 'Pacific guyot with diverse sponge and coral communities',
  },
]

const STATUS_CONFIG: Record<
  SeamountEcosystemData['status'],
  { label: string; color: string; bgClass: string }
> = {
  pristine: { label: 'Pristine', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  heavily_fished: { label: 'Heavily Fished', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SeamountEcosystemMonitor() {
  const state = useMapStore((s) => s.seamountEcosystem)
  const setState = useMapStore((s) => s.setSeamountEcosystem)

  const seamounts = useMemo(
    () => (state.seamounts.length > 0 ? state.seamounts : DEMO_SEAMOUNTS),
    [state.seamounts]
  )

  const filteredSeamounts = useMemo(() => {
    return seamounts.filter((s) => {
      if (state.typeFilter !== 'all') {
        const typeMap: Record<string, string[]> = {
          guyot: ['se-kocebu'],
          conical: ['se-davidson', 'se-vema'],
          rift_zone: ['se-emperor'],
          caldera: ['se-cobra', 'se-cross'],
        }
        if (!typeMap[state.typeFilter]?.includes(s.id)) return false
      }
      return true
    })
  }, [seamounts, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredSeamounts.length === 0) {
      return { avgElevation: 0, avgBiodiversity: 0, avgFishingPressure: 0 }
    }
    const avgElevation =
      filteredSeamounts.reduce((sum, s) => sum + s.elevation, 0) / filteredSeamounts.length
    const avgBiodiversity =
      filteredSeamounts.reduce((sum, s) => sum + s.biodiversity, 0) / filteredSeamounts.length
    const avgFishingPressure =
      filteredSeamounts.reduce((sum, s) => sum + s.fishingPressure, 0) / filteredSeamounts.length
    return {
      avgElevation: Math.round(avgElevation),
      avgBiodiversity: Math.round(avgBiodiversity),
      avgFishingPressure: Math.round(avgFishingPressure),
    }
  }, [filteredSeamounts])

  const activeSeamount = useMemo(
    () => seamounts.find((s) => s.id === state.activeSeamountId) ?? null,
    [seamounts, state.activeSeamountId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeamountEcosystemState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showElevation', label: 'Elevation', icon: MountainIcon8 },
    { key: 'showBiodiversity', label: 'Biodiversity', icon: Fish },
    { key: 'showCurrentSpeed', label: 'Current Speed', icon: TrendingUp },
    { key: 'showFishingPressure', label: 'Fishing Pressure', icon: BarChart3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-indigo-950/80 backdrop-blur-xl border border-indigo-800/40 rounded-xl shadow-lg shadow-indigo-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-indigo-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-100">
              <MountainIcon8 className="h-4 w-4 text-indigo-400" />
              Seamount Ecosystem Monitor
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
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-indigo-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Seamount Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SeamountEcosystemState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-indigo-900/40 border-indigo-700/40 text-indigo-100 hover:bg-indigo-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="guyot">Guyot</SelectItem>
                <SelectItem value="conical">Conical</SelectItem>
                <SelectItem value="rift_zone">Rift Zone</SelectItem>
                <SelectItem value="caldera">Caldera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-indigo-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300">Display Options</Label>
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

          <Separator className="bg-indigo-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Avg Elevation</div>
              <div className="text-sm font-semibold text-indigo-300">{summary.avgElevation}</div>
              <div className="text-[9px] text-indigo-400">m</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Avg Biodiversity</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgBiodiversity}</div>
              <div className="text-[9px] text-indigo-400">index</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Avg Fishing</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgFishingPressure}</div>
              <div className="text-[9px] text-indigo-400">pressure</div>
            </div>
          </div>

          <Separator className="bg-indigo-800/30" />

          {/* Seamount List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300">
              Seamounts ({filteredSeamounts.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSeamounts.map((seamount) => {
                  const isActive = state.activeSeamountId === seamount.id
                  const statusCfg = STATUS_CONFIG[seamount.status]
                  return (
                    <div
                      key={seamount.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/60 bg-indigo-800/30'
                          : 'border-indigo-800/30 hover:border-indigo-600/40 hover:bg-indigo-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeSeamountId: isActive ? null : seamount.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-indigo-100">{seamount.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-indigo-300">
                        {state.showElevation && (
                          <div>
                            Elevation:{' '}
                            <span className="text-indigo-100 font-medium">
                              {seamount.elevation} m
                            </span>
                          </div>
                        )}
                        {state.showBiodiversity && (
                          <div>
                            Biodiversity:{' '}
                            <span className="text-emerald-400 font-medium">
                              {seamount.biodiversity}
                            </span>
                          </div>
                        )}
                        {state.showCurrentSpeed && (
                          <div>
                            Current Speed:{' '}
                            <span className="text-indigo-200 font-medium">
                              {seamount.currentSpeed} cm/s
                            </span>
                          </div>
                        )}
                        {state.showFishingPressure && (
                          <div>
                            Fishing Pressure:{' '}
                            <span className="text-amber-400 font-medium">
                              {seamount.fishingPressure}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSeamounts.length === 0 && (
                  <div className="text-center text-xs text-indigo-400 py-4">
                    No seamounts match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Seamount Details */}
          {activeSeamount && (
            <>
              <Separator className="bg-indigo-800/30" />
              <div className="space-y-2 rounded-lg border border-indigo-600/30 bg-indigo-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-100">{activeSeamount.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeSeamount.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeSeamount.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-indigo-400">Coordinates: </span>
                    <span className="font-medium text-indigo-100">
                      {activeSeamount.lat.toFixed(1)}, {activeSeamount.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Elevation: </span>
                    <span className="font-medium text-indigo-200">{activeSeamount.elevation} m</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Biodiversity: </span>
                    <span className="font-medium text-emerald-400">{activeSeamount.biodiversity}</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Current Speed: </span>
                    <span className="font-medium text-indigo-200">{activeSeamount.currentSpeed} cm/s</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Depth: </span>
                    <span className="font-medium text-indigo-200">{activeSeamount.depth} m</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Fishing Pressure: </span>
                    <span className="font-medium text-amber-400">{activeSeamount.fishingPressure}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-indigo-400">Description: </span>
                    <span className="font-medium text-indigo-200">{activeSeamount.description}</span>
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
