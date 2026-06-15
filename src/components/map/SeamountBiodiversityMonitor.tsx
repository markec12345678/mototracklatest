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
import { useMapStore, type SeamountBiodiversityState, type SeamountBiodiversityData } from '@/lib/map-store'
import { Shell as ShellIcon3, X, Ruler, Fish, Percent, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SeamountBiodiversityData[] = [
  {
    id: 'sb-davidson',
    name: 'Davidson Seamount',
    lat: 35.7,
    lng: -122.7,
    depth: 1250,
    speciesCount: 350,
    endemismRate: 0.15,
    status: 'pristine',
    description: 'Deep-sea coral gardens off California coast',
  },
  {
    id: 'sb-empress',
    name: 'Empress of Britain Seamount',
    lat: 47.0,
    lng: -27.0,
    depth: 800,
    speciesCount: 220,
    endemismRate: 0.08,
    status: 'threatened',
    description: 'Mid-Atlantic seamount with trawling impacts',
  },
  {
    id: 'sb-cobb',
    name: 'Cobb Seamount',
    lat: 46.8,
    lng: -130.8,
    depth: 500,
    speciesCount: 180,
    endemismRate: 0.12,
    status: 'impacted',
    description: 'Northeast Pacific seamount with fishing damage',
  },
  {
    id: 'sb-vhma',
    name: 'Vema Seamount',
    lat: -31.6,
    lng: 8.3,
    depth: 2000,
    speciesCount: 120,
    endemismRate: 0.25,
    status: 'protected',
    description: 'Protected seamount with high endemism in South Atlantic',
  },
]

const STATUS_COLORS: Record<SeamountBiodiversityData['status'], { label: string; color: string; bgClass: string }> = {
  pristine: { label: 'Pristine', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  threatened: { label: 'Threatened', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  impacted: { label: 'Impacted', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  protected: { label: 'Protected', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: SeamountBiodiversityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SeamountBiodiversityMonitor() {
  const state = useMapStore((s) => s.seamountBiodiversity)
  const setState = useMapStore((s) => s.setSeamountBiodiversity)

  const seamounts = useMemo(
    () => (state.seamounts.length > 0 ? state.seamounts : SAMPLE_LOCATIONS),
    [state.seamounts]
  )

  const filteredItems = useMemo(() => {
    return seamounts.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [seamounts, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSeamounts: 0, avgSpeciesCount: 0, avgEndemism: 0, pristineCount: 0 }
    }
    const avgSpeciesCount = filteredItems.reduce((sum, s) => sum + s.speciesCount, 0) / filteredItems.length
    const avgEndemism = filteredItems.reduce((sum, s) => sum + s.endemismRate, 0) / filteredItems.length
    const pristineCount = filteredItems.filter((s) => s.status === 'pristine').length
    return {
      totalSeamounts: filteredItems.length,
      avgSpeciesCount: Math.round(avgSpeciesCount),
      avgEndemism: Math.round(avgEndemism * 1000) / 10,
      pristineCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => seamounts.find((s) => s.id === state.activeSeamountId) ?? null,
    [seamounts, state.activeSeamountId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, depth: s.depth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.seamounts.length === 0) {
      useMapStore.getState().setSeamountBiodiversity({ seamounts: SAMPLE_LOCATIONS })
    }
  }, [state.seamounts.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeamountBiodiversityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: Ruler },
    { key: 'showSpeciesCount', label: 'Species Count', icon: Fish },
    { key: 'showEndemismRate', label: 'Endemism Rate', icon: Percent },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <ShellIcon3 className="h-4 w-4 text-emerald-400" />
              Seamount Biodiversity Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-emerald-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SeamountBiodiversityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pristine">Pristine</SelectItem>
                <SelectItem value="threatened">Threatened</SelectItem>
                <SelectItem value="impacted">Impacted</SelectItem>
                <SelectItem value="protected">Protected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Total Seamounts</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalSeamounts}</div>
              <div className="text-[9px] text-emerald-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Species Count</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgSpeciesCount}</div>
              <div className="text-[9px] text-emerald-400/60">species</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Endemism</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgEndemism}</div>
              <div className="text-[9px] text-emerald-400/60">%</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Pristine Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.pristineCount}</div>
              <div className="text-[9px] text-emerald-400/60">seamounts</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Seamount List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
              Seamounts ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeSeamountId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/30 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSeamountId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-emerald-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/60">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-emerald-100 font-medium">{s.depth}m</span>
                          </div>
                        )}
                        {state.showSpeciesCount && (
                          <div>
                            Species:{' '}
                            <span className="text-emerald-100 font-medium">{s.speciesCount}</span>
                          </div>
                        )}
                        {state.showEndemismRate && (
                          <div>
                            Endemism:{' '}
                            <span className="text-emerald-100 font-medium">{(s.endemismRate * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/50 py-4">
                    No seamounts match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Seamount Details */}
          {activeItem && (
            <>
              <Separator className="bg-emerald-700/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-emerald-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400/70">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Depth: </span>
                    <span className="font-medium text-teal-400">{activeItem.depth}m</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Species Count: </span>
                    <span className="font-medium text-green-400">{activeItem.speciesCount}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Endemism: </span>
                    <span className="font-medium text-cyan-400">{(activeItem.endemismRate * 100).toFixed(0)}%</span>
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
