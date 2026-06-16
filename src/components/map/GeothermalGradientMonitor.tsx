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
import { Flame as FlameIcon18, X, Activity, Thermometer, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: GeothermalGradientData[] = [
  {
    id: 'gg-iceland',
    name: 'Iceland Fields',
    lat: 64.000,
    lng: -20.000,
    gradient: 80,
    temperature: 250,
    flowRate: 50,
    potential: 'exceptional',
    depth: 2000,
    description: 'High-temperature geothermal field on Mid-Atlantic Ridge',
  },
  {
    id: 'gg-ringoffire',
    name: 'Ring of Fire',
    lat: 36.000,
    lng: 138.000,
    gradient: 65,
    temperature: 220,
    flowRate: 35,
    potential: 'high',
    depth: 2500,
    description: 'Volcanic geothermal zone along the Pacific Ring of Fire',
  },
  {
    id: 'gg-yellowstone',
    name: 'Yellowstone',
    lat: 44.430,
    lng: -110.670,
    gradient: 70,
    temperature: 240,
    flowRate: 45,
    potential: 'exceptional',
    depth: 1800,
    description: 'Supervolcano caldera with exceptional geothermal potential',
  },
  {
    id: 'gg-kenya',
    name: 'Kenya Rift',
    lat: 0.200,
    lng: 36.800,
    gradient: 55,
    temperature: 180,
    flowRate: 25,
    potential: 'high',
    depth: 2200,
    description: 'East African Rift geothermal development zone',
  },
]

const STATUS_COLORS: Record<GeothermalGradientData['potential'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#94a3b8', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  high: { label: 'High', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
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
      return { totalSites: 0, avgGradient: 0, avgTemp: 0, avgFlow: 0 }
    }
    const avgGradient = filteredSites.reduce((sum, s) => sum + s.gradient, 0) / filteredSites.length
    const avgTemp = filteredSites.reduce((sum, s) => sum + s.temperature, 0) / filteredSites.length
    const avgFlow = filteredSites.reduce((sum, s) => sum + s.flowRate, 0) / filteredSites.length
    return {
      totalSites: filteredSites.length,
      avgGradient: Math.round(avgGradient * 10) / 10,
      avgTemp: Math.round(avgTemp),
      avgFlow: Math.round(avgFlow),
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
    { key: 'showGradient', label: 'Gradient C/km', icon: Activity },
    { key: 'showTemperature', label: 'Well Temp', icon: Thermometer },
    { key: 'showFlow', label: 'Flow Rate', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-orange-950/95 backdrop-blur-xl border border-red-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <FlameIcon18 className="h-4 w-4 text-red-400" />
              Geothermal Gradient Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Potential Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Potential Level
            </Label>
            <Select
              value={state.potentialFilter}
              onValueChange={(v) =>
                setState({ potentialFilter: v as GeothermalGradientState['potentialFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
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

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Gradient</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgGradient}</div>
              <div className="text-[9px] text-red-400/60">C/km avg</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Well Temp</div>
              <div className="text-sm font-semibold text-red-300">{summary.avgTemp}</div>
              <div className="text-[9px] text-red-400/60">C avg</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Flow Rate</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgFlow}</div>
              <div className="text-[9px] text-red-400/60">kg/s avg</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Sites</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalSites}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
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
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSiteId: isActive ? null : site.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon potential={site.potential} />
                          <span className="text-xs font-medium text-red-100">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showGradient && (
                          <div>
                            Gradient:{' '}
                            <span className="text-red-100 font-medium">{site.gradient} C/km</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Well Temp:{' '}
                            <span className="text-red-100 font-medium">{site.temperature} C</span>
                          </div>
                        )}
                        {state.showFlow && (
                          <div>
                            Flow Rate:{' '}
                            <span className="text-red-100 font-medium">{site.flowRate} kg/s</span>
                          </div>
                        )}
                        <div>
                          Reservoir P:{' '}
                          <span className="text-red-100 font-medium">{Math.round(site.depth * 0.1)} bar</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeSite.potential].bgClass}`}
                  >
                    {STATUS_COLORS[activeSite.potential].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeSite.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeSite.lat.toFixed(2)}, {activeSite.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Gradient: </span>
                    <span className="font-medium text-orange-400">{activeSite.gradient} C/km</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Well Temp: </span>
                    <span className="font-medium text-red-300">{activeSite.temperature} C</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Flow Rate: </span>
                    <span className="font-medium text-amber-400">{activeSite.flowRate} kg/s</span>
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
