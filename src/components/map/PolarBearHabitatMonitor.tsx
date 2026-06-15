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
import { useMapStore, type PolarBearHabitatState, type PolarBearHabitatData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon8, X, Layers, Activity, MapPin, Filter, Thermometer } from 'lucide-react'

const SAMPLE_LOCATIONS: PolarBearHabitatData[] = [
  {
    id: 'pb-svalbard',
    name: 'Svalbard Population',
    lat: 78.0,
    lng: 16.0,
    iceCoverPercent: 65,
    population: 300,
    migrationDistance: 2000,
    status: 'declining',
    seaIceLoss: 12,
    description: 'Barents Sea subpopulation under stress',
  },
  {
    id: 'pb-hudson',
    name: 'Western Hudson Bay',
    lat: 58.0,
    lng: -92.0,
    iceCoverPercent: 45,
    population: 800,
    migrationDistance: 1500,
    status: 'declining',
    seaIceLoss: 18,
    description: 'Most studied population showing decline',
  },
  {
    id: 'pb-chukchi',
    name: 'Chukchi Sea',
    lat: 68.0,
    lng: -170.0,
    iceCoverPercent: 80,
    population: 2000,
    migrationDistance: 3000,
    status: 'stable',
    seaIceLoss: 5,
    description: 'Relatively stable population',
  },
  {
    id: 'pb-lancaster',
    name: 'Lancaster Sound',
    lat: 74.0,
    lng: -85.0,
    iceCoverPercent: 70,
    population: 2500,
    migrationDistance: 2500,
    status: 'recovering',
    seaIceLoss: 8,
    description: 'Protected area supporting recovery',
  },
]

const STATUS_COLORS: Record<PolarBearHabitatData['status'], { label: string; color: string; bgClass: string }> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  declining: { label: 'Declining', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  critical: { label: 'Critical', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
  recovering: { label: 'Recovering', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: PolarBearHabitatData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PolarBearHabitatMonitor() {
  const state = useMapStore((s) => s.polarBearHabitat)
  const setState = useMapStore((s) => s.setPolarBearHabitat)

  const regions = useMemo(
    () => (state.regions.length > 0 ? state.regions : SAMPLE_LOCATIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.statusFilter !== 'all' && r.status !== state.statusFilter) return false
      return true
    })
  }, [regions, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { totalRegions: 0, totalPopulation: 0, avgIceCover: 0, avgSeaIceLoss: 0 }
    }
    const totalPopulation = filteredRegions.reduce((sum, r) => sum + r.population, 0)
    const avgIceCover = filteredRegions.reduce((sum, r) => sum + r.iceCoverPercent, 0) / filteredRegions.length
    const avgSeaIceLoss = filteredRegions.reduce((sum, r) => sum + r.seaIceLoss, 0) / filteredRegions.length
    return {
      totalRegions: filteredRegions.length,
      totalPopulation,
      avgIceCover: Math.round(avgIceCover * 10) / 10,
      avgSeaIceLoss: Math.round(avgSeaIceLoss * 10) / 10,
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredRegions.map((r) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
      properties: { id: r.id, name: r.name, status: r.status, population: r.population },
    })),
  }), [filteredRegions])

  useEffect(() => {
    if (state.regions.length === 0) {
      useMapStore.getState().setPolarBearHabitat({ regions: SAMPLE_LOCATIONS })
    }
  }, [state.regions.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PolarBearHabitatState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showIceCover', label: 'Ice Cover', icon: SnowflakeIcon8 },
    { key: 'showPopulation', label: 'Population', icon: Activity },
    { key: 'showMigration', label: 'Migration Distance', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-slate-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <SnowflakeIcon8 className="h-4 w-4 text-blue-400" />
              Polar Bear Habitat Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-blue-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Population Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as PolarBearHabitatState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Regions</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalRegions}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Population</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalPopulation.toLocaleString()}</div>
              <div className="text-[9px] text-blue-400/60">bears</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Ice Cover</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgIceCover}%</div>
              <div className="text-[9px] text-blue-400/60">coverage</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Sea Ice Loss</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgSeaIceLoss}%</div>
              <div className="text-[9px] text-blue-400/60">per decade</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Habitat Regions ({filteredRegions.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredRegions.map((region) => {
                  const isActive = state.activeRegionId === region.id
                  const statusCfg = STATUS_COLORS[region.status]
                  return (
                    <div
                      key={region.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeRegionId: isActive ? null : region.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={region.status} />
                          <span className="text-xs font-medium text-blue-100">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showIceCover && (
                          <div>
                            Ice Cover:{' '}
                            <span className="text-blue-100 font-medium">{region.iceCoverPercent}%</span>
                          </div>
                        )}
                        {state.showPopulation && (
                          <div>
                            Population:{' '}
                            <span className="text-blue-100 font-medium">{region.population.toLocaleString()}</span>
                          </div>
                        )}
                        {state.showMigration && (
                          <div>
                            Migration:{' '}
                            <span className="text-blue-100 font-medium">{region.migrationDistance.toLocaleString()}km</span>
                          </div>
                        )}
                        {state.showIceCover && (
                          <div>
                            Ice Loss:{' '}
                            <span className="text-blue-100 font-medium">{region.seaIceLoss}%/decade</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeRegion.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeRegion.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-blue-300/60 italic">{activeRegion.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400/70">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Population: </span>
                    <span className="font-medium text-blue-100">{activeRegion.population.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Ice Cover: </span>
                    <span className="font-medium text-cyan-400">{activeRegion.iceCoverPercent}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Migration: </span>
                    <span className="font-medium text-blue-100">{activeRegion.migrationDistance.toLocaleString()}km</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Sea Ice Loss: </span>
                    <span className="font-medium text-red-400">{activeRegion.seaIceLoss}%/decade</span>
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
