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
import { useMapStore, type DeepBiosphereState, type DeepBiosphereSite } from '@/lib/map-store'
import { Microscope as MicroscopeIcon, X, ArrowDown, Thermometer, Bug, Search, MapPin, Filter } from 'lucide-react'

const DEMO_SITES: DeepBiosphereSite[] = [
  {
    id: 'db-mponeng',
    name: 'Mponeng Gold Mine South Africa',
    latitude: -26.4175,
    longitude: 27.4236,
    habitatType: 'deep_mine',
    depth: 3600,
    temperature: 60,
    pressure: 350,
    microbialDensity: 4.2e5,
    discoveryStatus: 'well_studied',
  },
  {
    id: 'db-mariana',
    name: 'Mariana Trench Subseafloor',
    latitude: 11.3493,
    longitude: 142.1996,
    habitatType: 'subseafloor',
    depth: 10920,
    temperature: 2.4,
    pressure: 1100,
    microbialDensity: 8.7e3,
    discoveryStatus: 'preliminary',
  },
  {
    id: 'db-lostcity',
    name: 'Lost City Hydrothermal',
    latitude: 30.1250,
    longitude: -42.1167,
    habitatType: 'hydrothermal',
    depth: 800,
    temperature: 90,
    pressure: 80,
    microbialDensity: 1.3e7,
    discoveryStatus: 'well_studied',
  },
  {
    id: 'db-movile',
    name: 'Movile Cave Romania',
    latitude: 44.0750,
    longitude: 28.5608,
    habitatType: 'cave_system',
    depth: 22,
    temperature: 21,
    pressure: 2.2,
    microbialDensity: 5.6e6,
    discoveryStatus: 'reference_site',
  },
  {
    id: 'db-lidy',
    name: 'Lidy Hot Springs USA',
    latitude: 43.8500,
    longitude: -111.5333,
    habitatType: 'deep_aquifer',
    depth: 200,
    temperature: 62,
    pressure: 20,
    microbialDensity: 9.1e4,
    discoveryStatus: 'surveyed',
  },
  {
    id: 'db-fennoscandian',
    name: 'Fennoscandian Deep Aquifer',
    latitude: 61.5000,
    longitude: 24.3000,
    habitatType: 'deep_aquifer',
    depth: 2500,
    temperature: 25,
    pressure: 240,
    microbialDensity: 2.1e3,
    discoveryStatus: 'unexplored',
  },
]

const DISCOVERY_CONFIG: Record<
  DeepBiosphereSite['discoveryStatus'],
  { label: string; color: string; bgClass: string }
> = {
  unexplored: { label: 'Unexplored', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  preliminary: { label: 'Preliminary', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  surveyed: { label: 'Surveyed', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  well_studied: { label: 'Well Studied', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  reference_site: { label: 'Reference Site', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

const HABITAT_CONFIG: Record<
  DeepBiosphereSite['habitatType'],
  { label: string }
> = {
  deep_mine: { label: 'Deep Mine' },
  oceanic_crust: { label: 'Oceanic Crust' },
  subseafloor: { label: 'Subseafloor' },
  hydrothermal: { label: 'Hydrothermal' },
  cave_system: { label: 'Cave System' },
  deep_aquifer: { label: 'Deep Aquifer' },
}

function formatDensity(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toString()
}

export function DeepBiosphereExplorer() {
  const state = useMapStore((s) => s.deepBiosphere)
  const setState = useMapStore((s) => s.setDeepBiosphere)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.habitatFilter !== 'all' && s.habitatType !== state.habitatFilter) return false
      return true
    })
  }, [sites, state.habitatFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgDepth: 0, avgMicrobialDensity: 0, surveyedCount: 0 }
    }
    const avgDepth = filteredSites.reduce((sum, s) => sum + s.depth, 0) / filteredSites.length
    const avgMicrobialDensity = filteredSites.reduce((sum, s) => sum + s.microbialDensity, 0) / filteredSites.length
    const surveyedCount = filteredSites.filter(
      (s) => s.discoveryStatus === 'surveyed' || s.discoveryStatus === 'well_studied' || s.discoveryStatus === 'reference_site'
    ).length
    return {
      avgDepth: Math.round(avgDepth),
      avgMicrobialDensity: Math.round(avgMicrobialDensity),
      surveyedCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DeepBiosphereState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: ArrowDown },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showMicrobialDensity', label: 'Microbial Density', icon: Bug },
    { key: 'showDiscoveryStatus', label: 'Discovery Status', icon: Search },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MicroscopeIcon className="h-4 w-4 text-violet-600" />
              Deep Biosphere Explorer
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
          {/* Habitat Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Habitat Type
            </Label>
            <Select
              value={state.habitatFilter}
              onValueChange={(v) =>
                setState({
                  habitatFilter: v as DeepBiosphereState['habitatFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Habitats</SelectItem>
                <SelectItem value="deep_mine">Deep Mine</SelectItem>
                <SelectItem value="oceanic_crust">Oceanic Crust</SelectItem>
                <SelectItem value="subseafloor">Subseafloor</SelectItem>
                <SelectItem value="hydrothermal">Hydrothermal</SelectItem>
                <SelectItem value="cave_system">Cave System</SelectItem>
                <SelectItem value="deep_aquifer">Deep Aquifer</SelectItem>
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
                  <Icon className="h-3 w-3 text-violet-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Depth</div>
              <div className="text-sm font-semibold">{summary.avgDepth.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Microbial</div>
              <div className="text-sm font-semibold text-violet-600">{formatDensity(summary.avgMicrobialDensity)}</div>
              <div className="text-[9px] text-muted-foreground">cells/mL</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Surveyed+</div>
              <div className="text-sm font-semibold text-green-600">{summary.surveyedCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Deep Biosphere Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const discoveryCfg = DISCOVERY_CONFIG[site.discoveryStatus]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-500/5'
                          : 'border-border/40 hover:border-violet-500/20 hover:bg-violet-500/5'
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
                            style={{ backgroundColor: discoveryCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${discoveryCfg.bgClass}`}
                        >
                          {discoveryCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {site.depth.toLocaleString()} m
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {site.temperature.toFixed(1)}°C
                            </span>
                          </div>
                        )}
                        {state.showMicrobialDensity && (
                          <div>
                            Microbes:{' '}
                            <span className="text-foreground font-medium">
                              {formatDensity(site.microbialDensity)}/mL
                            </span>
                          </div>
                        )}
                        {state.showDiscoveryStatus && (
                          <div>
                            Pressure:{' '}
                            <span className="text-foreground font-medium">
                              {site.pressure} atm
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-600" />
                  <span className="text-xs font-semibold">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${DISCOVERY_CONFIG[activeSite.discoveryStatus].bgClass}`}
                  >
                    {DISCOVERY_CONFIG[activeSite.discoveryStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSite.latitude.toFixed(2)}, {activeSite.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Habitat: </span>
                    <span className="font-medium">{HABITAT_CONFIG[activeSite.habitatType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeSite.depth.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeSite.temperature.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pressure: </span>
                    <span className="font-medium">{activeSite.pressure} atm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Microbial Density: </span>
                    <span className="font-medium">{formatDensity(activeSite.microbialDensity)}/mL</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discovery: </span>
                    <span className="font-medium">{DISCOVERY_CONFIG[activeSite.discoveryStatus].label}</span>
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
