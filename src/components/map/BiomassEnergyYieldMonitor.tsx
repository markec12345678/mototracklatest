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
import { useMapStore, type BiomassEnergyYieldState, type BiomassEnergyYieldData } from '@/lib/map-store'
import { TreePine as TreePineIcon10, X, Leaf, Zap, Cloud, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: BiomassEnergyYieldData[] = [
  {
    id: 'by-scandinavia',
    name: 'Scandinavia Forest',
    lat: 63.000,
    lng: 15.000,
    feedstockSupply: 120,
    biogasOutput: 850,
    conversionEfficiency: 78,
    carbonOffset: 45000,
    status: 'normal',
    description: 'Boreal forest biomass energy from sustainable forestry residues',
  },
  {
    id: 'by-brazil',
    name: 'Brazil Sugarcane',
    lat: -22.000,
    lng: -47.000,
    feedstockSupply: 250,
    biogasOutput: 1200,
    conversionEfficiency: 85,
    carbonOffset: 92000,
    status: 'peak',
    description: 'Sugarcane bagasse bioenergy in the Sao Paulo region',
  },
  {
    id: 'by-seasia',
    name: 'SE Asia Palm',
    lat: 2.500,
    lng: 112.000,
    feedstockSupply: 180,
    biogasOutput: 950,
    conversionEfficiency: 72,
    carbonOffset: 58000,
    status: 'normal',
    description: 'Palm oil biomass energy from empty fruit bunches',
  },
  {
    id: 'by-cornbelt',
    name: 'US Corn Belt',
    lat: 41.500,
    lng: -90.500,
    feedstockSupply: 200,
    biogasOutput: 1050,
    conversionEfficiency: 80,
    carbonOffset: 68000,
    status: 'normal',
    description: 'Corn stover and ethanol byproduct biomass energy',
  },
]

const STATUS_COLORS: Record<BiomassEnergyYieldData['status'], { label: string; color: string; bgClass: string }> = {
  inactive: { label: 'Inactive', color: '#94a3b8', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  low: { label: 'Low', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  normal: { label: 'Normal', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  peak: { label: 'Peak', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
}

function TrendIcon({ status }: { status: BiomassEnergyYieldData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function BiomassEnergyYieldMonitor() {
  const state = useMapStore((s) => s.biomassEnergyYield)
  const setState = useMapStore((s) => s.setBiomassEnergyYield)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgYield: 0, avgEnergy: 0, avgCarbon: 0 }
    }
    const avgYield = filteredItems.reduce((sum, e) => sum + e.feedstockSupply, 0) / filteredItems.length
    const avgEnergy = filteredItems.reduce((sum, e) => sum + e.biogasOutput, 0) / filteredItems.length
    const avgCarbon = filteredItems.reduce((sum, e) => sum + e.carbonOffset, 0) / filteredItems.length
    return {
      totalSites: filteredItems.length,
      avgYield: Math.round(avgYield),
      avgEnergy: Math.round(avgEnergy),
      avgCarbon: Math.round(avgCarbon / 1000),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, feedstockSupply: e.feedstockSupply },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setBiomassEnergyYield({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof BiomassEnergyYieldState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFeedstockSupply', label: 'Yield t/ha', icon: Leaf },
    { key: 'showBiogasOutput', label: 'Energy GJ', icon: Zap },
    { key: 'showCarbonOffset', label: 'Carbon Offset', icon: Cloud },
    { key: 'showConversionEfficiency', label: 'Moisture %', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-emerald-950/95 backdrop-blur-xl border border-green-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-green-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-100">
              <TreePineIcon10 className="h-4 w-4 text-green-400" />
              Biomass Energy Yield Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-300 hover:text-green-100 hover:bg-green-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-green-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-green-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as BiomassEnergyYieldState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-green-900/40 border-green-700/40 text-green-100 hover:bg-green-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="peak">Peak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-green-200">
                  <Icon className="h-3 w-3 text-green-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-green-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Yield</div>
              <div className="text-sm font-semibold text-green-300">{summary.avgYield}</div>
              <div className="text-[9px] text-green-400/60">t/day avg</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Energy</div>
              <div className="text-sm font-semibold text-emerald-300">{summary.avgEnergy}</div>
              <div className="text-[9px] text-green-400/60">m\u00B3/h avg</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Carbon Offset</div>
              <div className="text-sm font-semibold text-lime-400">{summary.avgCarbon}k</div>
              <div className="text-[9px] text-green-400/60">tCO2/yr avg</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Sites</div>
              <div className="text-sm font-semibold text-green-200">{summary.totalSites}</div>
              <div className="text-[9px] text-green-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">
              Biomass Sites ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-500/50 bg-green-800/30'
                          : 'border-green-700/30 hover:border-green-500/30 hover:bg-green-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-green-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-green-300/60">
                        {state.showFeedstockSupply && (
                          <div>
                            Yield:{' '}
                            <span className="text-green-100 font-medium">{e.feedstockSupply} t/day</span>
                          </div>
                        )}
                        {state.showBiogasOutput && (
                          <div>
                            Energy:{' '}
                            <span className="text-green-100 font-medium">{e.biogasOutput} m\u00B3/h</span>
                          </div>
                        )}
                        {state.showCarbonOffset && (
                          <div>
                            Carbon:{' '}
                            <span className="text-green-100 font-medium">{(e.carbonOffset / 1000).toFixed(0)}k tCO2</span>
                          </div>
                        )}
                        {state.showConversionEfficiency && (
                          <div>
                            Efficiency:{' '}
                            <span className="text-green-100 font-medium">{e.conversionEfficiency}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-green-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-green-700/30" />
              <div className="space-y-2 rounded-lg border border-green-600/30 bg-green-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-green-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-green-400/70">Coordinates: </span>
                    <span className="font-medium text-green-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Yield: </span>
                    <span className="font-medium text-green-300">{activeItem.feedstockSupply} t/day</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Energy: </span>
                    <span className="font-medium text-emerald-300">{activeItem.biogasOutput} m\u00B3/h</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Carbon: </span>
                    <span className="font-medium text-lime-400">{activeItem.carbonOffset} tCO2/yr</span>
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
