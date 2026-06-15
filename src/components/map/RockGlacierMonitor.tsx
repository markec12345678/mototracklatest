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
import { useMapStore, type RockGlacierState, type RockGlacierData } from '@/lib/map-store'
import { Mountain as MountainIcon10, X, Activity, Thermometer, MapPin, Filter, TrendingUp } from 'lucide-react'

const SAMPLE_LOCATIONS: RockGlacierData[] = [
  {
    id: 'rg-murtel',
    name: 'Swiss Alps Murtèl',
    lat: 46.5,
    lng: 9.8,
    velocity: 0.5,
    temperature: -2,
    iceContent: 60,
    activity: 'active',
    area: 0.15,
    description: 'Most studied rock glacier in Alps',
  },
  {
    id: 'rg-colorado',
    name: 'Colorado Front Range',
    lat: 40.0,
    lng: -105.5,
    velocity: 0.1,
    temperature: -1,
    iceContent: 40,
    activity: 'transitional',
    area: 0.08,
    description: 'Degraded permafrost rock glacier',
  },
  {
    id: 'rg-andes',
    name: 'Andes Dry Belt',
    lat: -30.0,
    lng: -69.5,
    velocity: 0.8,
    temperature: -5,
    iceContent: 75,
    activity: 'active',
    area: 0.3,
    description: 'High-altitude Andean rock glacier',
  },
  {
    id: 'rg-dovre',
    name: 'Norwegian Dovre',
    lat: 62.2,
    lng: 9.5,
    velocity: 0.02,
    temperature: 0,
    iceContent: 15,
    activity: 'relict',
    area: 0.05,
    description: 'Fossil rock glacier from Little Ice Age',
  },
]

const STATUS_COLORS: Record<RockGlacierData['activity'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  transitional: { label: 'Transitional', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  inactive: { label: 'Inactive', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  relict: { label: 'Relict', color: '#9ca3af', bgClass: 'bg-gray-400/10 text-gray-500 border-gray-400/30' },
}

function TrendIcon({ activity }: { activity: RockGlacierData['activity'] }) {
  const cfg = STATUS_COLORS[activity]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function RockGlacierMonitor() {
  const state = useMapStore((s) => s.rockGlacier)
  const setState = useMapStore((s) => s.setRockGlacier)

  const zones = useMemo(
    () => (state.glaciers.length > 0 ? state.glaciers : SAMPLE_LOCATIONS),
    [state.glaciers]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.activityFilter !== 'all' && z.activity !== state.activityFilter) return false
      return true
    })
  }, [zones, state.activityFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalGlaciers: 0, avgVelocity: 0, avgIceContent: 0, activityStatus: 'N/A' }
    }
    const avgVelocity = filteredZones.reduce((sum, z) => sum + z.velocity, 0) / filteredZones.length
    const avgIceContent = filteredZones.reduce((sum, z) => sum + z.iceContent, 0) / filteredZones.length
    const activeCount = filteredZones.filter((z) => z.activity === 'active').length
    const dominantActivity = activeCount >= filteredZones.length / 2 ? 'Active' : 'Mixed'
    return {
      totalGlaciers: filteredZones.length,
      avgVelocity: Math.round(avgVelocity * 100) / 100,
      avgIceContent: Math.round(avgIceContent),
      activityStatus: dominantActivity,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeGlacierId) ?? null,
    [zones, state.activeGlacierId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredZones.map((z) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [z.lng, z.lat] },
      properties: { id: z.id, name: z.name, activity: z.activity, velocity: z.velocity },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.glaciers.length === 0) {
      useMapStore.getState().setRockGlacier({ glaciers: SAMPLE_LOCATIONS })
    }
  }, [state.glaciers.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RockGlacierState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVelocity', label: 'Velocity', icon: TrendingUp },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showIceContent', label: 'Ice Content', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-stone-950/95 backdrop-blur-xl border border-slate-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <MountainIcon10 className="h-4 w-4 text-slate-400" />
              Rock Glacier Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          {/* Activity Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Activity Status
            </Label>
            <Select
              value={state.activityFilter}
              onValueChange={(v) =>
                setState({ activityFilter: v as RockGlacierState['activityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="transitional">Transitional</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="relict">Relict</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-slate-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Glaciers</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalGlaciers}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Velocity</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgVelocity}</div>
              <div className="text-[9px] text-slate-400/60">m/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Ice Content</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgIceContent}%</div>
              <div className="text-[9px] text-slate-400/60">permafrost</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Activity Status</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.activityStatus}</div>
              <div className="text-[9px] text-slate-400/60">dominant</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Glacier List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Rock Glaciers ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeGlacierId === zone.id
                  const statusCfg = STATUS_COLORS[zone.activity]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeGlacierId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon activity={zone.activity} />
                          <span className="text-xs font-medium text-slate-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-slate-100 font-medium">{zone.velocity}m/yr</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-slate-100 font-medium">{zone.temperature}°C</span>
                          </div>
                        )}
                        {state.showIceContent && (
                          <div>
                            Ice:{' '}
                            <span className="text-blue-400 font-medium">{zone.iceContent}%</span>
                          </div>
                        )}
                        <div>
                          Area:{' '}
                          <span className="text-slate-100 font-medium">{zone.area}km²</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No glaciers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Glacier Details */}
          {activeZone && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeZone.activity].bgClass}`}
                  >
                    {STATUS_COLORS[activeZone.activity].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Velocity: </span>
                    <span className="font-medium text-green-400">{activeZone.velocity}m/yr</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Temperature: </span>
                    <span className="font-medium text-blue-400">{activeZone.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Ice Content: </span>
                    <span className="font-medium text-cyan-400">{activeZone.iceContent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Area: </span>
                    <span className="font-medium text-slate-200">{activeZone.area}km²</span>
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
