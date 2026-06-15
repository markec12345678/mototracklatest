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
import { useMapStore, type GlacierBasalSlideState, type GlacierBasalSlideData } from '@/lib/map-store'
import { MountainSnow as MountainSnowIcon4, X, Activity, Thermometer, MapPin, Filter, TrendingUp } from 'lucide-react'

const SAMPLE_LOCATIONS: GlacierBasalSlideData[] = [
  {
    id: 'gbs-jakobshavn',
    name: 'Jakobshavn Isbræ',
    lat: 69.2,
    lng: -50.0,
    velocity: 12,
    basalTemperature: -0.5,
    slideRisk: 0.95,
    risk: 'critical',
    iceThickness: 2500,
    description: 'Fastest flowing Greenland outlet glacier',
  },
  {
    id: 'gbs-whillans',
    name: 'Whillans Ice Stream',
    lat: -84.0,
    lng: -155.0,
    velocity: 0.8,
    basalTemperature: -2.0,
    slideRisk: 0.7,
    risk: 'high',
    iceThickness: 800,
    description: 'Stick-slip motion Antarctic ice stream',
  },
  {
    id: 'gbs-petermann',
    name: 'Petermann Glacier',
    lat: 80.5,
    lng: -60.0,
    velocity: 1.2,
    basalTemperature: -1.0,
    slideRisk: 0.6,
    risk: 'moderate',
    iceThickness: 600,
    description: 'Northern Greenland marine-terminating glacier',
  },
  {
    id: 'gbs-thwaites',
    name: 'Thwaites Glacier',
    lat: -75.5,
    lng: -108.0,
    velocity: 2.5,
    basalTemperature: 0.5,
    slideRisk: 0.92,
    risk: 'critical',
    iceThickness: 1500,
    description: 'Doomsday glacier with warm basal conditions',
  },
]

const STATUS_COLORS: Record<GlacierBasalSlideData['risk'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ risk }: { risk: GlacierBasalSlideData['risk'] }) {
  const cfg = STATUS_COLORS[risk]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GlacierBasalSlideMonitor() {
  const state = useMapStore((s) => s.glacierBasalSlide)
  const setState = useMapStore((s) => s.setGlacierBasalSlide)

  const zones = useMemo(
    () => (state.glaciers.length > 0 ? state.glaciers : SAMPLE_LOCATIONS),
    [state.glaciers]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.riskFilter !== 'all' && z.risk !== state.riskFilter) return false
      return true
    })
  }, [zones, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalGlaciers: 0, avgVelocity: 0, avgBasalTemp: 0, maxRisk: 0 }
    }
    const avgVelocity = filteredZones.reduce((sum, z) => sum + z.velocity, 0) / filteredZones.length
    const avgBasalTemp = filteredZones.reduce((sum, z) => sum + z.basalTemperature, 0) / filteredZones.length
    const maxRisk = Math.max(...filteredZones.map((z) => z.slideRisk))
    return {
      totalGlaciers: filteredZones.length,
      avgVelocity: Math.round(avgVelocity * 100) / 100,
      avgBasalTemp: Math.round(avgBasalTemp * 10) / 10,
      maxRisk: Math.round(maxRisk * 100) / 100,
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
      properties: { id: z.id, name: z.name, risk: z.risk, slideRisk: z.slideRisk },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.glaciers.length === 0) {
      useMapStore.getState().setGlacierBasalSlide({ glaciers: SAMPLE_LOCATIONS })
    }
  }, [state.glaciers.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GlacierBasalSlideState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVelocity', label: 'Velocity', icon: TrendingUp },
    { key: 'showBasalTemp', label: 'Basal Temperature', icon: Thermometer },
    { key: 'showSlideRisk', label: 'Slide Risk', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-blue-950/95 backdrop-blur-xl border border-indigo-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-indigo-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-100">
              <MountainSnowIcon4 className="h-4 w-4 text-indigo-400" />
              Glacier Basal Slide Monitor
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
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-indigo-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({ riskFilter: v as GlacierBasalSlideState['riskFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-indigo-900/40 border-indigo-700/40 text-indigo-100 hover:bg-indigo-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">Display Options</Label>
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

          <Separator className="bg-indigo-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Total Glaciers</div>
              <div className="text-sm font-semibold text-indigo-200">{summary.totalGlaciers}</div>
              <div className="text-[9px] text-indigo-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Velocity</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgVelocity}</div>
              <div className="text-[9px] text-indigo-400/60">km/yr</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Basal Temp</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgBasalTemp}°C</div>
              <div className="text-[9px] text-indigo-400/60">subglacial</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Max Risk</div>
              <div className="text-sm font-semibold text-red-400">{(summary.maxRisk * 100).toFixed(0)}%</div>
              <div className="text-[9px] text-indigo-400/60">slide index</div>
            </div>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Glacier List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">
              Glaciers ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeGlacierId === zone.id
                  const statusCfg = STATUS_COLORS[zone.risk]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/50 bg-indigo-800/30'
                          : 'border-indigo-700/30 hover:border-indigo-500/30 hover:bg-indigo-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeGlacierId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon risk={zone.risk} />
                          <span className="text-xs font-medium text-indigo-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-indigo-300/60">
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-indigo-100 font-medium">{zone.velocity}km/yr</span>
                          </div>
                        )}
                        {state.showBasalTemp && (
                          <div>
                            Basal Temp:{' '}
                            <span className="text-indigo-100 font-medium">{zone.basalTemperature}°C</span>
                          </div>
                        )}
                        {state.showSlideRisk && (
                          <div>
                            Slide Risk:{' '}
                            <span className="text-red-400 font-medium">{(zone.slideRisk * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        <div>
                          Thickness:{' '}
                          <span className="text-indigo-100 font-medium">{zone.iceThickness}m</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-indigo-400/50 py-4">
                    No glaciers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Glacier Details */}
          {activeZone && (
            <>
              <Separator className="bg-indigo-700/30" />
              <div className="space-y-2 rounded-lg border border-indigo-600/30 bg-indigo-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeZone.risk].bgClass}`}
                  >
                    {STATUS_COLORS[activeZone.risk].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-indigo-300/60 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-indigo-400/70">Coordinates: </span>
                    <span className="font-medium text-indigo-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Velocity: </span>
                    <span className="font-medium text-cyan-400">{activeZone.velocity}km/yr</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Basal Temp: </span>
                    <span className="font-medium text-blue-400">{activeZone.basalTemperature}°C</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Slide Risk: </span>
                    <span className="font-medium text-red-400">{(activeZone.slideRisk * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Ice Thickness: </span>
                    <span className="font-medium text-indigo-200">{activeZone.iceThickness}m</span>
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
