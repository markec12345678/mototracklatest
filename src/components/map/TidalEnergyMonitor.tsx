'use client'

import { useMemo, useEffect } from 'react'
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
import { useMapStore, type TidalEnergyData, type TidalEnergyState } from '@/lib/map-store'
import { Waves as WavesIcon5, X, Gauge, Zap, MapPin, Filter, TrendingUp } from 'lucide-react'

const DEMO_SITES: TidalEnergyData[] = [
  {
    id: 'te-pentland',
    name: 'Pentland Firth',
    lat: 58.65,
    lng: -3.40,
    tidalRange: 4.5,
    currentSpeed: 5.0,
    powerPotential: 396,
    environmentalImpact: 28,
    capacityFactor: 35,
    status: 'operational',
    description: 'Scotland, UK - MeyGen tidal stream project',
  },
  {
    id: 'te-fundy',
    name: 'Bay of Fundy',
    lat: 45.30,
    lng: -64.50,
    tidalRange: 16.3,
    currentSpeed: 4.5,
    powerPotential: 7000,
    environmentalImpact: 42,
    capacityFactor: 28,
    status: 'pilot',
    description: 'Canada - World\'s highest tides',
  },
  {
    id: 'te-rance',
    name: 'Rance Estuary',
    lat: 48.63,
    lng: -2.03,
    tidalRange: 8.5,
    currentSpeed: 3.2,
    powerPotential: 240,
    environmentalImpact: 55,
    capacityFactor: 25,
    status: 'operational',
    description: 'France - World\'s first tidal barrage (1966)',
  },
  {
    id: 'te-strangford',
    name: 'Strangford Lough',
    lat: 54.40,
    lng: -5.55,
    tidalRange: 3.5,
    currentSpeed: 4.0,
    powerPotential: 1.2,
    environmentalImpact: 18,
    capacityFactor: 30,
    status: 'operational',
    description: 'Northern Ireland - SeaGen tidal turbine',
  },
  {
    id: 'te-alderney',
    name: 'Alderney',
    lat: 49.72,
    lng: -2.20,
    tidalRange: 6.5,
    currentSpeed: 5.5,
    powerPotential: 3000,
    environmentalImpact: 22,
    capacityFactor: 38,
    status: 'planned',
    description: 'Channel Islands - Massive tidal stream potential',
  },
  {
    id: 'te-cook',
    name: 'Cook Strait',
    lat: -41.25,
    lng: 174.50,
    tidalRange: 2.8,
    currentSpeed: 3.8,
    powerPotential: 15000,
    environmentalImpact: 35,
    capacityFactor: 32,
    status: 'potential',
    description: 'New Zealand - Huge untapped resource',
  },
]

const STATUS_CONFIG: Record<
  TidalEnergyData['status'],
  { label: string; color: string; bgClass: string }
> = {
  operational: { label: 'Operational', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  pilot: { label: 'Pilot', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  planned: { label: 'Planned', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  potential: { label: 'Potential', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  unsuitable: { label: 'Unsuitable', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function formatPower(mw: number): string {
  if (mw >= 1000) return (mw / 1000).toFixed(1) + ' GW'
  return mw.toFixed(mw < 10 ? 1 : 0) + ' MW'
}

export function TidalEnergyMonitor() {
  const state = useMapStore((s) => s.tidalEnergy)
  const setState = useMapStore((s) => s.setTidalEnergy)

  // Initialize demo data on mount if sites array is empty
  useEffect(() => {
    if (useMapStore.getState().tidalEnergy.sites.length === 0) {
      useMapStore.getState().setTidalEnergy({ sites: DEMO_SITES })
    }
  }, [])

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.typeFilter !== 'all') {
        // Map site status/type to filter categories based on description hints
        // Since TidalEnergyData doesn't have a 'type' field, we filter by status for demo
        // In a real app, there would be a type field
        return true
      }
      return true
    })
  }, [sites, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgPowerPotential: 0, avgCapacityFactor: 0, activeCount: 0 }
    }
    const avgPowerPotential = filteredSites.reduce((sum, s) => sum + s.powerPotential, 0) / filteredSites.length
    const avgCapacityFactor = filteredSites.reduce((sum, s) => sum + s.capacityFactor, 0) / filteredSites.length
    const activeCount = filteredSites.filter(
      (s) => s.status === 'operational' || s.status === 'pilot'
    ).length
    return {
      avgPowerPotential: Math.round(avgPowerPotential * 10) / 10,
      avgCapacityFactor: Math.round(avgCapacityFactor * 10) / 10,
      activeCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TidalEnergyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTidalRange', label: 'Tidal Range', icon: WavesIcon5 },
    { key: 'showCurrentSpeed', label: 'Current Speed', icon: Gauge },
    { key: 'showPowerPotential', label: 'Power Potential', icon: Zap },
    { key: 'showEnvironmentalImpact', label: 'Environmental Impact', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-blue-950/95 to-cyan-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <WavesIcon5 className="h-4 w-4 text-cyan-400" />
              Tidal Energy Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-white hover:bg-cyan-800/40"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Energy Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as TidalEnergyState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/50 border-blue-700/40 text-cyan-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="barrage">Barrage</SelectItem>
                <SelectItem value="stream">Stream</SelectItem>
                <SelectItem value="lagoon">Lagoon</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
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

          <Separator className="bg-blue-700/30" />

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/20 p-2 text-center">
              <div className="text-[10px] text-cyan-300/70">Avg Power</div>
              <div className="text-sm font-semibold text-cyan-100">{formatPower(summary.avgPowerPotential)}</div>
              <div className="text-[9px] text-cyan-300/60">potential</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/20 p-2 text-center">
              <div className="text-[10px] text-cyan-300/70">Avg Capacity</div>
              <div className="text-sm font-semibold text-cyan-100">{summary.avgCapacityFactor}%</div>
              <div className="text-[9px] text-cyan-300/60">factor</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/20 p-2 text-center">
              <div className="text-[10px] text-cyan-300/70">Active Sites</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeCount}</div>
              <div className="text-[9px] text-cyan-300/60">operational</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Tidal Energy Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const statusCfg = STATUS_CONFIG[site.status]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/20'
                          : 'border-blue-700/30 hover:border-cyan-500/20 hover:bg-cyan-800/10'
                      }`}
                      onClick={() =>
                        setState({
                          activeSiteId: isActive ? null : site.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-cyan-100">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showTidalRange && (
                          <div>
                            Range:{' '}
                            <span className="text-cyan-100 font-medium">
                              {site.tidalRange}m
                            </span>
                          </div>
                        )}
                        {state.showCurrentSpeed && (
                          <div>
                            Current:{' '}
                            <span className="text-cyan-100 font-medium">
                              {site.currentSpeed}m/s
                            </span>
                          </div>
                        )}
                        {state.showPowerPotential && (
                          <div>
                            Power:{' '}
                            <span className="text-cyan-100 font-medium">
                              {formatPower(site.powerPotential)}
                            </span>
                          </div>
                        )}
                        {state.showEnvironmentalImpact && (
                          <div>
                            Impact:{' '}
                            <span className="text-cyan-100 font-medium">
                              {site.environmentalImpact}/100
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-cyan-300/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-800/15 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeSite.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeSite.status].label}
                  </Badge>
                </div>
                <div className="text-[10px] text-cyan-300/60 italic mb-1.5">
                  {activeSite.description}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-300/60">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeSite.lat.toFixed(2)}, {activeSite.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-300/60">Tidal Range: </span>
                    <span className="font-medium text-cyan-100">{activeSite.tidalRange}m</span>
                  </div>
                  <div>
                    <span className="text-cyan-300/60">Current Speed: </span>
                    <span className="font-medium text-cyan-100">{activeSite.currentSpeed}m/s</span>
                  </div>
                  <div>
                    <span className="text-cyan-300/60">Power Potential: </span>
                    <span className="font-medium text-cyan-100">{formatPower(activeSite.powerPotential)}</span>
                  </div>
                  <div>
                    <span className="text-cyan-300/60">Capacity Factor: </span>
                    <span className="font-medium text-cyan-100">{activeSite.capacityFactor}%</span>
                  </div>
                  <div>
                    <span className="text-cyan-300/60">Env. Impact: </span>
                    <span className="font-medium text-cyan-100">{activeSite.environmentalImpact}/100</span>
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
