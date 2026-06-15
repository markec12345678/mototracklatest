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
import { useMapStore, type BiomassBurningState, type BiomassBurningData } from '@/lib/map-store'
import { Flame as FlameIcon8, X, FlameKindling, Map, CloudCog as CloudSmoke, TrendingUp, MapPin, Filter } from 'lucide-react'

interface DemoRegion extends BiomassBurningData {
  burnType: 'forest' | 'savanna' | 'agricultural' | 'peat'
}

const DEMO_REGIONS: DemoRegion[] = [
  {
    id: 'bb-amazon',
    name: 'Brazilian Amazon',
    lat: -5,
    lng: -55,
    fireCount: 15000,
    burnedArea: 45000,
    emissions: 85,
    smoke: 72,
    intensity: 8.5,
    status: 'extreme',
    description: 'Unprecedented deforestation-driven fires in the Amazon basin',
    burnType: 'forest',
  },
  {
    id: 'bb-car',
    name: 'Central African Republic',
    lat: 5,
    lng: 20,
    fireCount: 12000,
    burnedArea: 38000,
    emissions: 70,
    smoke: 65,
    intensity: 7.2,
    status: 'high',
    description: 'Extensive savanna and woodland burning during dry season',
    burnType: 'savanna',
  },
  {
    id: 'bb-kalimantan',
    name: 'Indonesian Kalimantan',
    lat: -1,
    lng: 112,
    fireCount: 8000,
    burnedArea: 22000,
    emissions: 55,
    smoke: 58,
    intensity: 6.5,
    status: 'high',
    description: 'Peatland fires causing severe transboundary haze',
    burnType: 'peat',
  },
  {
    id: 'bb-outback',
    name: 'Australian Outback',
    lat: -22,
    lng: 135,
    fireCount: 5000,
    burnedArea: 30000,
    emissions: 45,
    smoke: 42,
    intensity: 5.8,
    status: 'moderate',
    description: 'Large-scale savanna burning across northern Australia',
    burnType: 'savanna',
  },
  {
    id: 'bb-boreal',
    name: 'Canadian Boreal',
    lat: 55,
    lng: -105,
    fireCount: 3500,
    burnedArea: 18000,
    emissions: 30,
    smoke: 28,
    intensity: 4.5,
    status: 'moderate',
    description: 'Boreal forest fires with increasing frequency and intensity',
    burnType: 'forest',
  },
  {
    id: 'bb-siberia',
    name: 'Siberian Taiga',
    lat: 60,
    lng: 100,
    fireCount: 2000,
    burnedArea: 12000,
    emissions: 20,
    smoke: 18,
    intensity: 3.0,
    status: 'low',
    description: 'Early-season agricultural and forest burning',
    burnType: 'agricultural',
  },
]

const STATUS_CONFIG: Record<
  BiomassBurningData['status'],
  { label: string; color: string; bgClass: string }
> = {
  minimal: { label: 'Minimal', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  low: { label: 'Low', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const BURN_TYPE_LABELS: Record<DemoRegion['burnType'], string> = {
  forest: 'Forest',
  savanna: 'Savanna',
  agricultural: 'Agricultural',
  peat: 'Peat',
}

export function BiomassBurningMonitor() {
  const state = useMapStore((s) => s.biomassBurning)
  const setState = useMapStore((s) => s.setBiomassBurning)

  const regions = useMemo(
    () => (state.regions.length > 0 ? (state.regions as DemoRegion[]) : DEMO_REGIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.typeFilter !== 'all' && r.burnType !== state.typeFilter) return false
      return true
    })
  }, [regions, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { totalFires: 0, avgEmissions: 0, highCount: 0 }
    }
    const totalFires = filteredRegions.reduce((sum, r) => sum + r.fireCount, 0)
    const avgEmissions =
      filteredRegions.reduce((sum, r) => sum + r.emissions, 0) / filteredRegions.length
    const highCount = filteredRegions.filter(
      (r) => r.status === 'high' || r.status === 'extreme'
    ).length
    return {
      totalFires,
      avgEmissions: Math.round(avgEmissions),
      highCount,
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof BiomassBurningState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFireCount', label: 'Fire Count', icon: FlameKindling },
    { key: 'showBurnedArea', label: 'Burned Area', icon: Map },
    { key: 'showEmissions', label: 'Emissions', icon: CloudSmoke },
    { key: 'showSmoke', label: 'Smoke', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-red-950/80 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg shadow-red-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <FlameIcon8 className="h-4 w-4 text-red-400" />
              Biomass Burning Monitor
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
          {/* Burn Type Filter */}
          <div>
            <Label className="text-xs text-red-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Burn Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as BiomassBurningState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="savanna">Savanna</SelectItem>
                <SelectItem value="agricultural">Agricultural</SelectItem>
                <SelectItem value="peat">Peat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300">Display Options</Label>
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

          <Separator className="bg-red-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Total Fires</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalFires.toLocaleString()}</div>
              <div className="text-[9px] text-red-400">active</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Avg Emissions</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgEmissions}</div>
              <div className="text-[9px] text-red-400">Mt CO2</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">High/Extreme</div>
              <div className="text-sm font-semibold text-amber-400">{summary.highCount}</div>
              <div className="text-[9px] text-red-400">regions</div>
            </div>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300">
              Burning Regions ({filteredRegions.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredRegions.map((region) => {
                  const isActive = state.activeRegionId === region.id
                  const statusCfg = STATUS_CONFIG[region.status]
                  return (
                    <div
                      key={region.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/60 bg-red-800/30'
                          : 'border-red-800/30 hover:border-red-600/40 hover:bg-red-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeRegionId: isActive ? null : region.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-red-100">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300">
                        {state.showFireCount && (
                          <div>
                            Fires:{' '}
                            <span className="text-red-100 font-medium">
                              {region.fireCount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {state.showBurnedArea && (
                          <div>
                            Burned:{' '}
                            <span className="text-red-100 font-medium">
                              {region.burnedArea.toLocaleString()} km&sup2;
                            </span>
                          </div>
                        )}
                        {state.showEmissions && (
                          <div>
                            Emissions:{' '}
                            <span className="text-red-100 font-medium">
                              {region.emissions} Mt CO2
                            </span>
                          </div>
                        )}
                        {state.showSmoke && (
                          <div>
                            Smoke:{' '}
                            <span className="text-red-100 font-medium">
                              {region.smoke}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-red-400 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator className="bg-red-800/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeRegion.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeRegion.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400">Fire Count: </span>
                    <span className="font-medium text-orange-400">{activeRegion.fireCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-red-400">Burned Area: </span>
                    <span className="font-medium text-red-200">{activeRegion.burnedArea.toLocaleString()} km&sup2;</span>
                  </div>
                  <div>
                    <span className="text-red-400">Emissions: </span>
                    <span className="font-medium text-red-200">{activeRegion.emissions} Mt CO2</span>
                  </div>
                  <div>
                    <span className="text-red-400">Smoke Index: </span>
                    <span className="font-medium text-red-200">{activeRegion.smoke}%</span>
                  </div>
                  <div>
                    <span className="text-red-400">Intensity: </span>
                    <span className="font-medium text-red-200">{activeRegion.intensity}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-red-400">Burn Type: </span>
                    <span className="font-medium text-red-200">
                      {(activeRegion as DemoRegion).burnType ? BURN_TYPE_LABELS[(activeRegion as DemoRegion).burnType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-red-400">Description: </span>
                    <span className="font-medium text-red-200">{activeRegion.description}</span>
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
