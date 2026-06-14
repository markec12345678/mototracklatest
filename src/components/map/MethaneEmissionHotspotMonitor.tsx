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
import { useMapStore, type MethaneEmissionHotspotState, type MethaneEmissionHotspotData } from '@/lib/map-store'
import { Flame as FlameIcon7, X, Wind, Gauge, Crosshair, TrendingUp, MapPin, Filter } from 'lucide-react'

interface DemoHotspot extends MethaneEmissionHotspotData {
  sourceType: 'wetland' | 'fossil_fuel' | 'agriculture' | 'landfill'
}

const DEMO_HOTSPOTS: DemoHotspot[] = [
  {
    id: 'meh-darvaza',
    name: 'Turkmenistan Darvaza',
    lat: 40.3,
    lng: 58.5,
    emissionRate: 8500,
    concentration: 45,
    source: 95,
    trend: 2.5,
    uncertainty: 12,
    status: 'critical',
    description: 'Massive natural gas crater with continuous combustion and methane release',
    sourceType: 'fossil_fuel',
  },
  {
    id: 'meh-permian',
    name: 'Permian Basin TX',
    lat: 31.5,
    lng: -103,
    emissionRate: 5200,
    concentration: 28,
    source: 88,
    trend: 1.8,
    uncertainty: 8,
    status: 'high',
    description: 'Major oil and gas production basin with significant fugitive emissions',
    sourceType: 'fossil_fuel',
  },
  {
    id: 'meh-siberia',
    name: 'Siberian Wetlands',
    lat: 65,
    lng: 90,
    emissionRate: 3200,
    concentration: 22,
    source: 35,
    trend: 3.2,
    uncertainty: 15,
    status: 'elevated',
    description: 'Vast wetland complex with accelerating permafrost thaw emissions',
    sourceType: 'wetland',
  },
  {
    id: 'meh-bangladesh',
    name: 'Bangladesh Rice Paddies',
    lat: 24,
    lng: 90,
    emissionRate: 2800,
    concentration: 18,
    source: 55,
    trend: 1.2,
    uncertainty: 10,
    status: 'moderate',
    description: 'Extensive rice cultivation areas with anaerobic methane production',
    sourceType: 'agriculture',
  },
  {
    id: 'meh-northsea',
    name: 'North Sea Oil Fields',
    lat: 57,
    lng: 2,
    emissionRate: 1800,
    concentration: 12,
    source: 82,
    trend: -0.5,
    uncertainty: 5,
    status: 'moderate',
    description: 'Offshore oil and gas infrastructure with declining venting emissions',
    sourceType: 'fossil_fuel',
  },
  {
    id: 'meh-amazon',
    name: 'Amazon Wetlands',
    lat: -3,
    lng: -60,
    emissionRate: 4200,
    concentration: 30,
    source: 25,
    trend: 2.0,
    uncertainty: 18,
    status: 'high',
    description: 'Tropical wetland system with seasonal methane emission pulses',
    sourceType: 'wetland',
  },
]

const STATUS_CONFIG: Record<
  MethaneEmissionHotspotData['status'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  moderate: { label: 'Moderate', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  elevated: { label: 'Elevated', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SOURCE_TYPE_LABELS: Record<DemoHotspot['sourceType'], string> = {
  wetland: 'Wetland',
  fossil_fuel: 'Fossil Fuel',
  agriculture: 'Agriculture',
  landfill: 'Landfill',
}

export function MethaneEmissionHotspotMonitor() {
  const state = useMapStore((s) => s.methaneEmissionHotspot)
  const setState = useMapStore((s) => s.setMethaneEmissionHotspot)

  const hotspots = useMemo(
    () => (state.hotspots.length > 0 ? (state.hotspots as DemoHotspot[]) : DEMO_HOTSPOTS),
    [state.hotspots]
  )

  const filteredHotspots = useMemo(() => {
    return hotspots.filter((h) => {
      if (state.sourceFilter !== 'all' && h.sourceType !== state.sourceFilter) return false
      return true
    })
  }, [hotspots, state.sourceFilter])

  const summary = useMemo(() => {
    if (filteredHotspots.length === 0) {
      return { avgEmissionRate: 0, avgConcentration: 0, criticalHighCount: 0 }
    }
    const avgEmissionRate =
      filteredHotspots.reduce((sum, h) => sum + h.emissionRate, 0) / filteredHotspots.length
    const avgConcentration =
      filteredHotspots.reduce((sum, h) => sum + h.concentration, 0) / filteredHotspots.length
    const criticalHighCount = filteredHotspots.filter(
      (h) => h.status === 'critical' || h.status === 'high'
    ).length
    return {
      avgEmissionRate: Math.round(avgEmissionRate),
      avgConcentration: Math.round(avgConcentration * 10) / 10,
      criticalHighCount,
    }
  }, [filteredHotspots])

  const activeHotspot = useMemo(
    () => hotspots.find((h) => h.id === state.activeHotspotId) ?? null,
    [hotspots, state.activeHotspotId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MethaneEmissionHotspotState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showEmissionRate', label: 'Emission Rate', icon: Wind },
    { key: 'showConcentration', label: 'Concentration', icon: Gauge },
    { key: 'showSource', label: 'Source', icon: Crosshair },
    { key: 'showTrend', label: 'Trend', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-lime-950/80 to-green-950/80 backdrop-blur-xl border border-lime-800/40 rounded-xl shadow-lg shadow-lime-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-lime-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-lime-100">
              <FlameIcon7 className="h-4 w-4 text-lime-400" />
              Methane Emission Hotspot Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-lime-300 hover:text-lime-100 hover:bg-lime-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-lime-100">
          {/* Source Filter */}
          <div>
            <Label className="text-xs text-lime-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Source Type
            </Label>
            <Select
              value={state.sourceFilter}
              onValueChange={(v) =>
                setState({
                  sourceFilter: v as MethaneEmissionHotspotState['sourceFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-lime-900/40 border-lime-700/40 text-lime-100 hover:bg-lime-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="wetland">Wetland</SelectItem>
                <SelectItem value="fossil_fuel">Fossil Fuel</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="landfill">Landfill</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-lime-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lime-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-lime-200">
                  <Icon className="h-3 w-3 text-lime-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-lime-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-lime-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400">Avg Emission</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgEmissionRate}</div>
              <div className="text-[9px] text-lime-400">t/yr</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400">Avg Conc.</div>
              <div className="text-sm font-semibold text-lime-300">{summary.avgConcentration}</div>
              <div className="text-[9px] text-lime-400">ppb</div>
            </div>
            <div className="rounded-lg border border-lime-700/30 bg-lime-900/30 p-2 text-center">
              <div className="text-[10px] text-lime-400">Critical/High</div>
              <div className="text-sm font-semibold text-lime-200">{summary.criticalHighCount}</div>
              <div className="text-[9px] text-lime-400">hotspots</div>
            </div>
          </div>

          <Separator className="bg-lime-800/30" />

          {/* Hotspot List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lime-300">
              Emission Hotspots ({filteredHotspots.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredHotspots.map((hotspot) => {
                  const isActive = state.activeHotspotId === hotspot.id
                  const statusCfg = STATUS_CONFIG[hotspot.status]
                  return (
                    <div
                      key={hotspot.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-lime-500/60 bg-lime-800/30'
                          : 'border-lime-800/30 hover:border-lime-600/40 hover:bg-lime-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeHotspotId: isActive ? null : hotspot.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-lime-100">{hotspot.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-lime-300">
                        {state.showEmissionRate && (
                          <div>
                            Emission:{' '}
                            <span className="text-lime-100 font-medium">
                              {hotspot.emissionRate.toLocaleString()} t/yr
                            </span>
                          </div>
                        )}
                        {state.showConcentration && (
                          <div>
                            Conc.:{' '}
                            <span className="text-lime-100 font-medium">
                              {hotspot.concentration} ppb
                            </span>
                          </div>
                        )}
                        {state.showSource && (
                          <div>
                            Source:{' '}
                            <span className="text-lime-100 font-medium">
                              {hotspot.source}%
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Trend:{' '}
                            <span className={`font-medium ${hotspot.trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {hotspot.trend > 0 ? '+' : ''}{hotspot.trend} ppb/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredHotspots.length === 0 && (
                  <div className="text-center text-xs text-lime-400 py-4">
                    No hotspots match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Hotspot Details */}
          {activeHotspot && (
            <>
              <Separator className="bg-lime-800/30" />
              <div className="space-y-2 rounded-lg border border-lime-600/30 bg-lime-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-lime-400" />
                  <span className="text-xs font-semibold text-lime-100">{activeHotspot.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeHotspot.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeHotspot.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-lime-400">Coordinates: </span>
                    <span className="font-medium text-lime-100">
                      {activeHotspot.lat.toFixed(1)}, {activeHotspot.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-lime-400">Emission Rate: </span>
                    <span className="font-medium text-yellow-400">{activeHotspot.emissionRate.toLocaleString()} t/yr</span>
                  </div>
                  <div>
                    <span className="text-lime-400">Concentration: </span>
                    <span className="font-medium text-lime-200">{activeHotspot.concentration} ppb</span>
                  </div>
                  <div>
                    <span className="text-lime-400">Source Confidence: </span>
                    <span className="font-medium text-lime-200">{activeHotspot.source}%</span>
                  </div>
                  <div>
                    <span className="text-lime-400">Trend: </span>
                    <span className={`font-medium ${activeHotspot.trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {activeHotspot.trend > 0 ? '+' : ''}{activeHotspot.trend} ppb/yr
                    </span>
                  </div>
                  <div>
                    <span className="text-lime-400">Uncertainty: </span>
                    <span className="font-medium text-lime-200">&plusmn;{activeHotspot.uncertainty}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-lime-400">Source Type: </span>
                    <span className="font-medium text-lime-200">
                      {(activeHotspot as DemoHotspot).sourceType ? SOURCE_TYPE_LABELS[(activeHotspot as DemoHotspot).sourceType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-lime-400">Description: </span>
                    <span className="font-medium text-lime-200">{activeHotspot.description}</span>
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
