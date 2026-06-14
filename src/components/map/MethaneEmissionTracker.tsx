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
import { useMapStore, type MethaneEmissionTrackerState, type MethaneSource } from '@/lib/map-store'
import { Flame as FlameIcon7, X, Gauge, TrendingUp, MapPin, Filter, ShieldCheck } from 'lucide-react'

const DEMO_SOURCES: MethaneSource[] = [
  {
    id: 'me-permian',
    name: 'Permian Basin TX',
    latitude: 31.87,
    longitude: -103.65,
    emissionRate: 2850,
    sourceType: 'fossil_fuel',
    concentration: 4200,
    plumeExtent: 85,
    trendPercent: 12.5,
    verificationStatus: 'confirmed',
    mitigationPotential: 'very_high',
  },
  {
    id: 'me-yamal',
    name: 'Yamal Peninsula',
    latitude: 70.25,
    longitude: 68.90,
    emissionRate: 1680,
    sourceType: 'permafrost',
    concentration: 3100,
    plumeExtent: 120,
    trendPercent: 22.3,
    verificationStatus: 'probable',
    mitigationPotential: 'moderate',
  },
  {
    id: 'me-bangladesh',
    name: 'Bangladesh Rice Fields',
    latitude: 23.81,
    longitude: 90.41,
    emissionRate: 1420,
    sourceType: 'agriculture',
    concentration: 2800,
    plumeExtent: 65,
    trendPercent: 5.1,
    verificationStatus: 'confirmed',
    mitigationPotential: 'high',
  },
  {
    id: 'me-california',
    name: 'California Landfill',
    latitude: 34.05,
    longitude: -118.24,
    emissionRate: 920,
    sourceType: 'landfill',
    concentration: 1950,
    plumeExtent: 18,
    trendPercent: -3.2,
    verificationStatus: 'confirmed',
    mitigationPotential: 'high',
  },
  {
    id: 'me-niger',
    name: 'Niger Delta Flaring',
    latitude: 4.95,
    longitude: 6.38,
    emissionRate: 2100,
    sourceType: 'fossil_fuel',
    concentration: 3800,
    plumeExtent: 55,
    trendPercent: 8.7,
    verificationStatus: 'suspected',
    mitigationPotential: 'very_high',
  },
  {
    id: 'me-nz-livestock',
    name: 'NZ Livestock Zone',
    latitude: -39.49,
    longitude: 176.91,
    emissionRate: 780,
    sourceType: 'livestock',
    concentration: 1450,
    plumeExtent: 30,
    trendPercent: 1.8,
    verificationStatus: 'probable',
    mitigationPotential: 'moderate',
  },
]

const SOURCE_TYPE_CONFIG: Record<
  MethaneSource['sourceType'],
  { label: string; color: string; bgClass: string }
> = {
  agriculture: { label: 'Agriculture', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  landfill: { label: 'Landfill', color: '#a16207', bgClass: 'bg-amber-700/10 text-amber-700 border-amber-700/30' },
  fossil_fuel: { label: 'Fossil Fuel', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  wetland: { label: 'Wetland', color: '#14b8a6', bgClass: 'bg-teal-500/10 text-teal-600 border-teal-500/30' },
  permafrost: { label: 'Permafrost', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  livestock: { label: 'Livestock', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
}

const VERIFICATION_CONFIG: Record<
  MethaneSource['verificationStatus'],
  { label: string; color: string; bgClass: string }
> = {
  confirmed: { label: 'Confirmed', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  probable: { label: 'Probable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  suspected: { label: 'Suspected', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  unverified: { label: 'Unverified', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
}

const MITIGATION_CONFIG: Record<
  MethaneSource['mitigationPotential'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_high: { label: 'Very High', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function MethaneEmissionTracker() {
  const state = useMapStore((s) => s.methaneEmission)
  const setState = useMapStore((s) => s.setMethaneEmission)

  const sources = useMemo(
    () => (state.sources.length > 0 ? state.sources : DEMO_SOURCES),
    [state.sources]
  )

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (state.sourceFilter !== 'all' && s.sourceType !== state.sourceFilter) return false
      return true
    })
  }, [sources, state.sourceFilter])

  const summary = useMemo(() => {
    if (filteredSources.length === 0) {
      return { avgEmissionRate: 0, avgConcentration: 0, highMitigationCount: 0 }
    }
    const avgEmissionRate = filteredSources.reduce((sum, s) => sum + s.emissionRate, 0) / filteredSources.length
    const avgConcentration = filteredSources.reduce((sum, s) => sum + s.concentration, 0) / filteredSources.length
    const highMitigationCount = filteredSources.filter(
      (s) => s.mitigationPotential === 'high' || s.mitigationPotential === 'very_high'
    ).length
    return {
      avgEmissionRate: Math.round(avgEmissionRate),
      avgConcentration: Math.round(avgConcentration),
      highMitigationCount,
    }
  }, [filteredSources])

  const activeSource = useMemo(
    () => sources.find((s) => s.id === state.activeSourceId) ?? null,
    [sources, state.activeSourceId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MethaneEmissionTrackerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showEmissionRate', label: 'Emission Rate', icon: Gauge },
    { key: 'showConcentration', label: 'Concentration', icon: TrendingUp },
    { key: 'showTrend', label: 'Trend', icon: TrendingUp },
    { key: 'showMitigationPotential', label: 'Mitigation Potential', icon: ShieldCheck },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlameIcon7 className="h-4 w-4 text-amber-600" />
              Methane Emission Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Source Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Source Type
            </Label>
            <Select
              value={state.sourceFilter}
              onValueChange={(v) =>
                setState({
                  sourceFilter: v as MethaneEmissionTrackerState['sourceFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="landfill">Landfill</SelectItem>
                <SelectItem value="fossil_fuel">Fossil Fuel</SelectItem>
                <SelectItem value="wetland">Wetland</SelectItem>
                <SelectItem value="permafrost">Permafrost</SelectItem>
                <SelectItem value="livestock">Livestock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-amber-600" />
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

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Emission</div>
              <div className="text-sm font-semibold">{summary.avgEmissionRate}</div>
              <div className="text-[9px] text-muted-foreground">t/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Conc.</div>
              <div className="text-sm font-semibold text-amber-600">{summary.avgConcentration}</div>
              <div className="text-[9px] text-muted-foreground">ppb</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High Mitig.</div>
              <div className="text-sm font-semibold text-orange-600">{summary.highMitigationCount}</div>
              <div className="text-[9px] text-muted-foreground">sources</div>
            </div>
          </div>

          <Separator />

          {/* Source List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Methane Sources ({filteredSources.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSources.map((source) => {
                  const isActive = state.activeSourceId === source.id
                  const typeCfg = SOURCE_TYPE_CONFIG[source.sourceType]
                  return (
                    <div
                      key={source.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeSourceId: isActive ? null : source.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: typeCfg.color }}
                          />
                          <span className="text-xs font-medium">{source.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${typeCfg.bgClass}`}
                        >
                          {typeCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showEmissionRate && (
                          <div>
                            Emission:{' '}
                            <span className="text-foreground font-medium">
                              {source.emissionRate} t/yr
                            </span>
                          </div>
                        )}
                        {state.showConcentration && (
                          <div>
                            Conc.:{' '}
                            <span className="text-foreground font-medium">
                              {source.concentration} ppb
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Trend:{' '}
                            <span className={`font-medium ${source.trendPercent > 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {source.trendPercent > 0 ? '+' : ''}{source.trendPercent}%
                            </span>
                          </div>
                        )}
                        {state.showMitigationPotential && (
                          <div>
                            Mitigation:{' '}
                            <span className="text-foreground font-medium">
                              {MITIGATION_CONFIG[source.mitigationPotential].label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSources.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No sources match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Source Details */}
          {activeSource && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold">{activeSource.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${VERIFICATION_CONFIG[activeSource.verificationStatus].bgClass}`}
                  >
                    {VERIFICATION_CONFIG[activeSource.verificationStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSource.latitude.toFixed(2)}, {activeSource.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source Type: </span>
                    <span className="font-medium">{SOURCE_TYPE_CONFIG[activeSource.sourceType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Emission Rate: </span>
                    <span className="font-medium">{activeSource.emissionRate} t/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Concentration: </span>
                    <span className="font-medium">{activeSource.concentration} ppb</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plume Extent: </span>
                    <span className="font-medium">{activeSource.plumeExtent} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trend: </span>
                    <span className={`font-medium ${activeSource.trendPercent > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {activeSource.trendPercent > 0 ? '+' : ''}{activeSource.trendPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verification: </span>
                    <span className="font-medium">{VERIFICATION_CONFIG[activeSource.verificationStatus].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mitigation: </span>
                    <span className="font-medium">{MITIGATION_CONFIG[activeSource.mitigationPotential].label}</span>
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
