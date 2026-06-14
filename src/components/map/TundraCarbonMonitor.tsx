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
import { useMapStore, type TundraCarbonData, type TundraCarbonState } from '@/lib/map-store'
import { TreeDeciduous as TreeDeciduousIcon3, X, Thermometer, MapPin, Filter, Activity, Snowflake, Leaf } from 'lucide-react'

const DEMO_SITES: TundraCarbonData[] = [
  {
    id: 'tc-toolik',
    name: 'Toolik Lake Arctic',
    lat: 68.6,
    lng: -149.6,
    carbonFlux: -45,
    permafrostDepth: 0.8,
    vegetationIndex: 0.35,
    methaneRelease: 2.8,
    soilTemperature: -5.2,
    status: 'sink',
    description: 'Alaska, USA - Long Term Ecological Research site',
  },
  {
    id: 'tc-abisko',
    name: 'Abisko Arctic',
    lat: 68.3,
    lng: 18.8,
    carbonFlux: -20,
    permafrostDepth: 1.5,
    vegetationIndex: 0.42,
    methaneRelease: 4.5,
    soilTemperature: -2.1,
    status: 'neutral',
    description: 'Sweden - Permafrost thaw monitoring',
  },
  {
    id: 'tc-chersky',
    name: 'Chersky Siberian',
    lat: 68.5,
    lng: 161.5,
    carbonFlux: 85,
    permafrostDepth: 0.3,
    vegetationIndex: 0.55,
    methaneRelease: 18.2,
    soilTemperature: 2.5,
    status: 'accelerating',
    description: 'Russia - Yedoma permafrost carbon release',
  },
  {
    id: 'tc-zackenberg',
    name: 'Zackenberg Greenland',
    lat: 74.5,
    lng: -21.0,
    carbonFlux: -30,
    permafrostDepth: 1.2,
    vegetationIndex: 0.28,
    methaneRelease: 3.2,
    soilTemperature: -4.8,
    status: 'sink',
    description: 'Greenland - Zero emission monitoring',
  },
  {
    id: 'tc-council',
    name: 'Council Alaska',
    lat: 64.8,
    lng: -163.7,
    carbonFlux: 35,
    permafrostDepth: 0.5,
    vegetationIndex: 0.48,
    methaneRelease: 12.5,
    soilTemperature: 0.8,
    status: 'source',
    description: 'Alaska - Thermokarst lake emissions',
  },
  {
    id: 'tc-swiss',
    name: 'Swiss Alpine Permafrost',
    lat: 46.5,
    lng: 7.8,
    carbonFlux: 120,
    permafrostDepth: 0.2,
    vegetationIndex: 0.62,
    methaneRelease: 25.0,
    soilTemperature: 5.2,
    status: 'runaway',
    description: 'Alps - Rapid alpine permafrost degradation',
  },
]

const STATUS_CONFIG: Record<
  TundraCarbonData['status'],
  { label: string; color: string; bgClass: string }
> = {
  sink: { label: 'Carbon Sink', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  neutral: { label: 'Neutral', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  source: { label: 'Carbon Source', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  accelerating: { label: 'Accelerating', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  runaway: { label: 'Runaway', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function TundraCarbonMonitor() {
  const state = useMapStore((s) => s.tundraCarbon)
  const setState = useMapStore((s) => s.setTundraCarbon)

  // Initialize demo data on mount if sites array is empty
  useEffect(() => {
    if (useMapStore.getState().tundraCarbon.sites.length === 0) {
      useMapStore.getState().setTundraCarbon({ sites: DEMO_SITES })
    }
  }, [])

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      if (state.regionFilter === 'arctic') {
        return site.lat >= 60 && site.id !== 'tc-swiss'
      }
      if (state.regionFilter === 'alpine') {
        return site.id === 'tc-swiss'
      }
      if (state.regionFilter === 'antarctic') {
        return false
      }
      return true
    })
  }, [sites, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgCarbonFlux: 0, avgPermafrostDepth: 0, criticalCount: 0 }
    }
    const avgCarbonFlux =
      filteredSites.reduce((sum, s) => sum + s.carbonFlux, 0) / filteredSites.length
    const avgPermafrostDepth =
      filteredSites.reduce((sum, s) => sum + s.permafrostDepth, 0) / filteredSites.length
    const criticalCount = filteredSites.filter(
      (s) => s.status === 'source' || s.status === 'accelerating' || s.status === 'runaway'
    ).length
    return {
      avgCarbonFlux: Math.round(avgCarbonFlux * 10) / 10,
      avgPermafrostDepth: Math.round(avgPermafrostDepth * 100) / 100,
      criticalCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TundraCarbonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonFlux', label: 'Carbon Flux', icon: Activity },
    { key: 'showPermafrostDepth', label: 'Permafrost Depth', icon: Snowflake },
    { key: 'showVegetationIndex', label: 'Vegetation Index', icon: Leaf },
    { key: 'showMethaneRelease', label: 'Methane Release', icon: Thermometer },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-lime-950/95 to-green-950/95 backdrop-blur-xl border border-green-800/40 rounded-xl shadow-lg overflow-hidden text-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-100">
              <TreeDeciduousIcon3 className="h-4 w-4 text-green-400" />
              Tundra Carbon Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-300 hover:text-green-100 hover:bg-green-800/40"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-green-400 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({
                  regionFilter: v as TundraCarbonState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-green-900/40 border-green-700/40 text-green-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="arctic">Arctic</SelectItem>
                <SelectItem value="alpine">Alpine</SelectItem>
                <SelectItem value="antarctic">Antarctic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-400">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-green-200">
                  <Icon className="h-3 w-3 text-green-500" />
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

          <Separator className="bg-green-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Avg Carbon Flux</div>
              <div className="text-sm font-semibold text-green-100">{summary.avgCarbonFlux}</div>
              <div className="text-[9px] text-green-500">gC/m²/yr</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Avg Permafrost</div>
              <div className="text-sm font-semibold text-green-100">{summary.avgPermafrostDepth}</div>
              <div className="text-[9px] text-green-500">m depth</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Critical Sites</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-green-500">source/accel/runaway</div>
            </div>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-400">
              Tundra Carbon Sites ({filteredSites.length})
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
                          ? 'border-green-500/50 bg-green-800/20'
                          : 'border-green-700/30 hover:border-green-500/30 hover:bg-green-800/10'
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
                          <span className="text-xs font-medium text-green-100">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-green-400">
                        {state.showCarbonFlux && (
                          <div>
                            Flux:{' '}
                            <span className="text-green-100 font-medium">
                              {site.carbonFlux} gC/m²/yr
                            </span>
                          </div>
                        )}
                        {state.showPermafrostDepth && (
                          <div>
                            Permafrost:{' '}
                            <span className="text-green-100 font-medium">
                              {site.permafrostDepth} m
                            </span>
                          </div>
                        )}
                        {state.showVegetationIndex && (
                          <div>
                            Veg. Index:{' '}
                            <span className="text-green-100 font-medium">
                              {site.vegetationIndex}
                            </span>
                          </div>
                        )}
                        {state.showMethaneRelease && (
                          <div>
                            CH₄:{' '}
                            <span className="text-green-100 font-medium">
                              {site.methaneRelease} mg/m²/day
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-green-500 py-4">
                    No sites match the current region filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator className="bg-green-700/30" />
              <div className="space-y-2 rounded-lg border border-green-600/30 bg-green-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-100">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeSite.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeSite.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-green-400 italic">{activeSite.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-green-500">Coordinates: </span>
                    <span className="font-medium text-green-100">
                      {activeSite.lat.toFixed(1)}, {activeSite.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-500">Soil Temp: </span>
                    <span className="font-medium text-green-100">
                      {activeSite.soilTemperature}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-green-500">Carbon Flux: </span>
                    <span className="font-medium text-green-100">
                      {activeSite.carbonFlux} gC/m²/yr
                    </span>
                  </div>
                  <div>
                    <span className="text-green-500">Permafrost Depth: </span>
                    <span className="font-medium text-green-100">
                      {activeSite.permafrostDepth} m
                    </span>
                  </div>
                  <div>
                    <span className="text-green-500">Veg. Index: </span>
                    <span className="font-medium text-green-100">
                      {activeSite.vegetationIndex}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-500">CH₄ Release: </span>
                    <span className="font-medium text-green-100">
                      {activeSite.methaneRelease} mg/m²/day
                    </span>
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
