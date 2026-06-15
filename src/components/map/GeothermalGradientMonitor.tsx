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
import { useMapStore, type GeothermalGradientState, type GeothermalGradientData } from '@/lib/map-store'
import { Thermometer as ThermometerIcon8, X, Flame, Activity, MapPin, Filter, Zap } from 'lucide-react'

const SAMPLE_LOCATIONS: GeothermalGradientData[] = [
  {
    id: 'gg-iceland',
    name: 'Iceland Hellisheidi',
    lat: 64.0,
    lng: -21.4,
    gradient: 80,
    temperature: 250,
    flowRate: 50,
    potential: 'exceptional',
    depth: 2000,
    description: 'High-temperature geothermal field',
  },
  {
    id: 'gg-larderello',
    name: 'Larderello Field',
    lat: 43.3,
    lng: 10.9,
    gradient: 60,
    temperature: 200,
    flowRate: 30,
    potential: 'high',
    depth: 3000,
    description: 'Historic Italian geothermal region',
  },
  {
    id: 'gg-basin',
    name: 'Basin & Range',
    lat: 40.0,
    lng: -114.0,
    gradient: 40,
    temperature: 150,
    flowRate: 15,
    potential: 'moderate',
    depth: 2500,
    description: 'Extensional tectonic geothermal zone',
  },
  {
    id: 'gg-hawaii',
    name: 'Hawaiian Rift',
    lat: 19.5,
    lng: -155.5,
    gradient: 100,
    temperature: 300,
    flowRate: 80,
    potential: 'exceptional',
    depth: 1500,
    description: 'Hotspot volcanic geothermal system',
  },
]

const STATUS_COLORS: Record<GeothermalGradientData['potential'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#94a3b8', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  high: { label: 'High', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  exceptional: { label: 'Exceptional', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ potential }: { potential: GeothermalGradientData['potential'] }) {
  const cfg = STATUS_COLORS[potential]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GeothermalGradientMonitor() {
  const state = useMapStore((s) => s.geothermalGradient)
  const setState = useMapStore((s) => s.setGeothermalGradient)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : SAMPLE_LOCATIONS),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.potentialFilter !== 'all' && s.potential !== state.potentialFilter) return false
      return true
    })
  }, [sites, state.potentialFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { totalSites: 0, avgGradient: 0, maxTemperature: 0, potentialRating: 'N/A' }
    }
    const avgGradient = filteredSites.reduce((sum, s) => sum + s.gradient, 0) / filteredSites.length
    const maxTemperature = Math.max(...filteredSites.map((s) => s.temperature))
    const exceptionalCount = filteredSites.filter((s) => s.potential === 'exceptional').length
    const potentialRating = exceptionalCount > 0 ? `${exceptionalCount} exceptional` : 'Moderate'
    return {
      totalSites: filteredSites.length,
      avgGradient: Math.round(avgGradient * 10) / 10,
      maxTemperature,
      potentialRating,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredSites.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, potential: s.potential, gradient: s.gradient },
    })),
  }), [filteredSites])

  useEffect(() => {
    if (state.sites.length === 0) {
      useMapStore.getState().setGeothermalGradient({ sites: SAMPLE_LOCATIONS })
    }
  }, [state.sites.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GeothermalGradientState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showGradient', label: 'Gradient', icon: Activity },
    { key: 'showTemperature', label: 'Temperature', icon: ThermometerIcon8 },
    { key: 'showFlow', label: 'Flow Rate', icon: Zap },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-red-950/95 backdrop-blur-xl border border-amber-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <ThermometerIcon8 className="h-4 w-4 text-amber-400" />
              Geothermal Gradient Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Potential Filter */}
          <div>
            <Label className="text-xs text-amber-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Potential Level
            </Label>
            <Select
              value={state.potentialFilter}
              onValueChange={(v) =>
                setState({ potentialFilter: v as GeothermalGradientState['potentialFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Potentials</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="exceptional">Exceptional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalSites}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Gradient</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgGradient}</div>
              <div className="text-[9px] text-amber-400/60">°C/km</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Max Temperature</div>
              <div className="text-sm font-semibold text-red-400">{summary.maxTemperature}</div>
              <div className="text-[9px] text-amber-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Potential Rating</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.potentialRating}</div>
              <div className="text-[9px] text-amber-400/60">assessment</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Geothermal Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const statusCfg = STATUS_COLORS[site.potential]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSiteId: isActive ? null : site.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon potential={site.potential} />
                          <span className="text-xs font-medium text-amber-100">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showGradient && (
                          <div>
                            Gradient:{' '}
                            <span className="text-amber-100 font-medium">{site.gradient}°C/km</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-amber-100 font-medium">{site.temperature}°C</span>
                          </div>
                        )}
                        {state.showFlow && (
                          <div>
                            Flow Rate:{' '}
                            <span className="text-amber-100 font-medium">{site.flowRate}kg/s</span>
                          </div>
                        )}
                        <div>
                          Depth:{' '}
                          <span className="text-amber-100 font-medium">{site.depth}m</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeSite.potential].bgClass}`}
                  >
                    {STATUS_COLORS[activeSite.potential].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-amber-300/60 italic">{activeSite.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeSite.lat.toFixed(1)}, {activeSite.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Gradient: </span>
                    <span className="font-medium text-orange-400">{activeSite.gradient}°C/km</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Temperature: </span>
                    <span className="font-medium text-red-400">{activeSite.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Flow Rate: </span>
                    <span className="font-medium text-blue-400">{activeSite.flowRate}kg/s</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Depth: </span>
                    <span className="font-medium text-amber-200">{activeSite.depth}m</span>
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
