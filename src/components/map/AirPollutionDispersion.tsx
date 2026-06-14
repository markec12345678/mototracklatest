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
import { useMapStore, type AirPollutionDispersionState, type PollutionSource } from '@/lib/map-store'
import { Wind as WindIcon7, X, Gauge, AlertTriangle, MapPin, Filter, Users } from 'lucide-react'

const DEMO_SOURCES: PollutionSource[] = [
  {
    id: 'ap-bj-pm25',
    name: 'Beijing PM2.5',
    latitude: 39.90,
    longitude: 116.40,
    pollutantType: 'pm25',
    emissionRate: 245,
    concentration: 89,
    dispersionRadius: 45,
    windDirection: 315,
    affectedArea: 1200,
    populationExposed: 18500000,
    complianceStatus: 'severe_exceedance',
  },
  {
    id: 'ap-dl-pm10',
    name: 'Delhi PM10',
    latitude: 28.61,
    longitude: 77.21,
    pollutantType: 'pm10',
    emissionRate: 312,
    concentration: 156,
    dispersionRadius: 60,
    windDirection: 270,
    affectedArea: 2100,
    populationExposed: 22000000,
    complianceStatus: 'severe_exceedance',
  },
  {
    id: 'ap-ld-no2',
    name: 'London NO2',
    latitude: 51.51,
    longitude: -0.13,
    pollutantType: 'no2',
    emissionRate: 78,
    concentration: 42,
    dispersionRadius: 20,
    windDirection: 225,
    affectedArea: 580,
    populationExposed: 5400000,
    complianceStatus: 'exceedance',
  },
  {
    id: 'ap-rv-so2',
    name: 'Ruhr Valley SO2',
    latitude: 51.45,
    longitude: 7.01,
    pollutantType: 'so2',
    emissionRate: 52,
    concentration: 18,
    dispersionRadius: 35,
    windDirection: 180,
    affectedArea: 420,
    populationExposed: 2100000,
    complianceStatus: 'warning',
  },
  {
    id: 'ap-la-o3',
    name: 'Los Angeles O3',
    latitude: 34.05,
    longitude: -118.24,
    pollutantType: 'o3',
    emissionRate: 145,
    concentration: 68,
    dispersionRadius: 55,
    windDirection: 200,
    affectedArea: 950,
    populationExposed: 10000000,
    complianceStatus: 'exceedance',
  },
  {
    id: 'ap-bj-co',
    name: 'Beijing CO',
    latitude: 39.92,
    longitude: 116.46,
    pollutantType: 'co',
    emissionRate: 89,
    concentration: 3.2,
    dispersionRadius: 30,
    windDirection: 310,
    affectedArea: 380,
    populationExposed: 4200000,
    complianceStatus: 'compliant',
  },
]

const COMPLIANCE_CONFIG: Record<
  PollutionSource['complianceStatus'],
  { label: string; color: string; bgClass: string }
> = {
  compliant: { label: 'Compliant', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  warning: { label: 'Warning', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  exceedance: { label: 'Exceedance', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe_exceedance: { label: 'Severe Exceedance', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const POLLUTANT_CONFIG: Record<
  PollutionSource['pollutantType'],
  { label: string; unit: string }
> = {
  pm25: { label: 'PM2.5', unit: 'μg/m³' },
  pm10: { label: 'PM10', unit: 'μg/m³' },
  no2: { label: 'NO₂', unit: 'μg/m³' },
  so2: { label: 'SO₂', unit: 'μg/m³' },
  o3: { label: 'O₃', unit: 'μg/m³' },
  co: { label: 'CO', unit: 'mg/m³' },
}

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

export function AirPollutionDispersion() {
  const state = useMapStore((s) => s.airPollutionDispersion)
  const setState = useMapStore((s) => s.setAirPollutionDispersion)

  const sources = useMemo(
    () => (state.sources.length > 0 ? state.sources : DEMO_SOURCES),
    [state.sources]
  )

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (state.pollutantFilter !== 'all' && s.pollutantType !== state.pollutantFilter) return false
      return true
    })
  }, [sources, state.pollutantFilter])

  const summary = useMemo(() => {
    if (filteredSources.length === 0) {
      return { avgConcentration: 0, totalPopulationExposed: 0, exceedanceCount: 0 }
    }
    const avgConcentration = filteredSources.reduce((sum, s) => sum + s.concentration, 0) / filteredSources.length
    const totalPopulationExposed = filteredSources.reduce((sum, s) => sum + s.populationExposed, 0)
    const exceedanceCount = filteredSources.filter(
      (s) => s.complianceStatus === 'exceedance' || s.complianceStatus === 'severe_exceedance'
    ).length
    return {
      avgConcentration: Math.round(avgConcentration * 10) / 10,
      totalPopulationExposed,
      exceedanceCount,
    }
  }, [filteredSources])

  const activeSource = useMemo(
    () => sources.find((s) => s.id === state.activeSourceId) ?? null,
    [sources, state.activeSourceId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AirPollutionDispersionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showConcentration', label: 'Concentration', icon: Gauge },
    { key: 'showDispersionRadius', label: 'Dispersion Radius', icon: WindIcon7 },
    { key: 'showPopulationExposed', label: 'Pop. Exposed', icon: Users },
    { key: 'showCompliance', label: 'Compliance', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WindIcon7 className="h-4 w-4 text-gray-600" />
              Air Pollution Dispersion
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
          {/* Pollutant Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Pollutant Type
            </Label>
            <Select
              value={state.pollutantFilter}
              onValueChange={(v) =>
                setState({
                  pollutantFilter: v as AirPollutionDispersionState['pollutantFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pollutants</SelectItem>
                <SelectItem value="pm25">PM2.5</SelectItem>
                <SelectItem value="pm10">PM10</SelectItem>
                <SelectItem value="no2">NO₂</SelectItem>
                <SelectItem value="so2">SO₂</SelectItem>
                <SelectItem value="o3">O₃</SelectItem>
                <SelectItem value="co">CO</SelectItem>
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
                  <Icon className="h-3 w-3 text-gray-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Concentration</div>
              <div className="text-sm font-semibold">{summary.avgConcentration}</div>
              <div className="text-[9px] text-muted-foreground">μg/m³</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Pop. Exposed</div>
              <div className="text-sm font-semibold text-gray-600">{formatPopulation(summary.totalPopulationExposed)}</div>
              <div className="text-[9px] text-muted-foreground">total</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Exceedance</div>
              <div className="text-sm font-semibold text-red-600">{summary.exceedanceCount}</div>
              <div className="text-[9px] text-muted-foreground">sources</div>
            </div>
          </div>

          <Separator />

          {/* Source List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Pollution Sources ({filteredSources.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSources.map((source) => {
                  const isActive = state.activeSourceId === source.id
                  const complianceCfg = COMPLIANCE_CONFIG[source.complianceStatus]
                  return (
                    <div
                      key={source.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-gray-500/50 bg-gray-500/5'
                          : 'border-border/40 hover:border-gray-500/20 hover:bg-gray-500/5'
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
                            style={{ backgroundColor: complianceCfg.color }}
                          />
                          <span className="text-xs font-medium">{source.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${complianceCfg.bgClass}`}
                        >
                          {complianceCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showConcentration && (
                          <div>
                            Conc.:{' '}
                            <span className="text-foreground font-medium">
                              {source.concentration} {POLLUTANT_CONFIG[source.pollutantType].unit}
                            </span>
                          </div>
                        )}
                        {state.showDispersionRadius && (
                          <div>
                            Dispersion:{' '}
                            <span className="text-foreground font-medium">
                              {source.dispersionRadius} km
                            </span>
                          </div>
                        )}
                        {state.showPopulationExposed && (
                          <div>
                            Pop.:{' '}
                            <span className="text-foreground font-medium">
                              {formatPopulation(source.populationExposed)}
                            </span>
                          </div>
                        )}
                        {state.showCompliance && (
                          <div>
                            Emission:{' '}
                            <span className="text-foreground font-medium">
                              {source.emissionRate} t/yr
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
              <div className="space-y-2 rounded-lg border border-gray-500/20 bg-gray-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-xs font-semibold">{activeSource.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${COMPLIANCE_CONFIG[activeSource.complianceStatus].bgClass}`}
                  >
                    {COMPLIANCE_CONFIG[activeSource.complianceStatus].label}
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
                    <span className="text-muted-foreground">Pollutant: </span>
                    <span className="font-medium">{POLLUTANT_CONFIG[activeSource.pollutantType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Concentration: </span>
                    <span className="font-medium">{activeSource.concentration} {POLLUTANT_CONFIG[activeSource.pollutantType].unit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Emission Rate: </span>
                    <span className="font-medium">{activeSource.emissionRate} t/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dispersion: </span>
                    <span className="font-medium">{activeSource.dispersionRadius} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Dir.: </span>
                    <span className="font-medium">{activeSource.windDirection}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected Area: </span>
                    <span className="font-medium">{activeSource.affectedArea} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pop. Exposed: </span>
                    <span className="font-medium">{formatPopulation(activeSource.populationExposed)}</span>
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
