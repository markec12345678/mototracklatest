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
import { useMapStore, type PelagicZoneState, type PelagicZone } from '@/lib/map-store'
import { Fish, X, Gauge, Thermometer, MapPin, Filter, Waves } from 'lucide-react'

const DEMO_ZONES: PelagicZone[] = [
  {
    id: 'pz-npacific-gyre',
    name: 'North Pacific Gyre',
    lat: 30.0,
    lng: -155.0,
    depthZone: 'epipelagic',
    temperature: 22.5,
    salinity: 35.2,
    oxygenMinimum: 4.8,
    biomassDensity: 185,
    primaryProductivity: 320,
    migrationActivity: 'high',
    researchStatus: 'well_studied',
  },
  {
    id: 'pz-sargasso',
    name: 'Sargasso Sea Atlantic',
    lat: 28.0,
    lng: -60.0,
    depthZone: 'epipelagic',
    temperature: 24.0,
    salinity: 36.8,
    oxygenMinimum: 5.1,
    biomassDensity: 120,
    primaryProductivity: 280,
    migrationActivity: 'peak',
    researchStatus: 'well_studied',
  },
  {
    id: 'pz-omz-pacific',
    name: 'Oxygen Minimum Zone Pacific',
    lat: 15.0,
    lng: -105.0,
    depthZone: 'mesopelagic',
    temperature: 8.2,
    salinity: 34.5,
    oxygenMinimum: 0.5,
    biomassDensity: 45,
    primaryProductivity: 85,
    migrationActivity: 'moderate',
    researchStatus: 'surveyed',
  },
  {
    id: 'pz-mid-atlantic',
    name: 'Mid-Atlantic Ridge Deep',
    lat: 0.0,
    lng: -25.0,
    depthZone: 'bathypelagic',
    temperature: 2.8,
    salinity: 34.8,
    oxygenMinimum: 3.2,
    biomassDensity: 8,
    primaryProductivity: 12,
    migrationActivity: 'low',
    researchStatus: 'preliminary',
  },
  {
    id: 'pz-mariana',
    name: 'Mariana Trench Pelagic',
    lat: 11.0,
    lng: 142.0,
    depthZone: 'hadopelagic',
    temperature: 1.2,
    salinity: 34.7,
    oxygenMinimum: 4.0,
    biomassDensity: 0.5,
    primaryProductivity: 0.2,
    migrationActivity: 'minimal',
    researchStatus: 'data_sparse',
  },
  {
    id: 'pz-southern-ocean',
    name: 'Southern Ocean Pelagic',
    lat: -60.0,
    lng: 0.0,
    depthZone: 'mesopelagic',
    temperature: 2.1,
    salinity: 34.2,
    oxygenMinimum: 6.5,
    biomassDensity: 95,
    primaryProductivity: 210,
    migrationActivity: 'high',
    researchStatus: 'surveyed',
  },
]

const RESEARCH_CONFIG: Record<
  PelagicZone['researchStatus'],
  { label: string; color: string; bgClass: string }
> = {
  well_studied: { label: 'Well Studied', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  surveyed: { label: 'Surveyed', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  preliminary: { label: 'Preliminary', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  data_sparse: { label: 'Data Sparse', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  unknown: { label: 'Unknown', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
}

const DEPTH_ZONE_LABELS: Record<
  PelagicZone['depthZone'],
  { label: string; range: string }
> = {
  epipelagic: { label: 'Epipelagic', range: '0-200 m' },
  mesopelagic: { label: 'Mesopelagic', range: '200-1000 m' },
  bathypelagic: { label: 'Bathypelagic', range: '1000-4000 m' },
  abyssopelagic: { label: 'Abyssopelagic', range: '4000-6000 m' },
  hadopelagic: { label: 'Hadopelagic', range: '6000-11000 m' },
}

export function PelagicZoneTracker() {
  const state = useMapStore((s) => s.pelagicZone)
  const setState = useMapStore((s) => s.setPelagicZone)

  const zones = useMemo(
    () => (state.zones && state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.depthFilter !== 'all' && z.depthZone !== state.depthFilter) return false
      return true
    })
  }, [zones, state.depthFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgBiomassDensity: 0, avgPrimaryProductivity: 0, dataSparseUnknownCount: 0 }
    }
    const avgBiomassDensity = filteredZones.reduce((sum, z) => sum + z.biomassDensity, 0) / filteredZones.length
    const avgPrimaryProductivity = filteredZones.reduce((sum, z) => sum + z.primaryProductivity, 0) / filteredZones.length
    const dataSparseUnknownCount = filteredZones.filter(
      (z) => z.researchStatus === 'data_sparse' || z.researchStatus === 'unknown'
    ).length
    return {
      avgBiomassDensity: Math.round(avgBiomassDensity * 10) / 10,
      avgPrimaryProductivity: Math.round(avgPrimaryProductivity * 10) / 10,
      dataSparseUnknownCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PelagicZoneState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showBiomassDensity', label: 'Biomass Density', icon: Waves },
    { key: 'showPrimaryProductivity', label: 'Primary Productivity', icon: Gauge },
    { key: 'showResearchStatus', label: 'Research Status', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Fish className="h-4 w-4 text-blue-700" />
              Pelagic Zone Tracker
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
          {/* Depth Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Depth Zone
            </Label>
            <Select
              value={state.depthFilter}
              onValueChange={(v) =>
                setState({
                  depthFilter: v as PelagicZoneState['depthFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="epipelagic">Epipelagic (0-200m)</SelectItem>
                <SelectItem value="mesopelagic">Mesopelagic (200-1000m)</SelectItem>
                <SelectItem value="bathypelagic">Bathypelagic (1000-4000m)</SelectItem>
                <SelectItem value="abyssopelagic">Abyssopelagic (4000-6000m)</SelectItem>
                <SelectItem value="hadopelagic">Hadopelagic (6000-11000m)</SelectItem>
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
                  <Icon className="h-3 w-3 text-blue-700" />
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
              <div className="text-[10px] text-muted-foreground">Avg Biomass</div>
              <div className="text-sm font-semibold">{summary.avgBiomassDensity}</div>
              <div className="text-[9px] text-muted-foreground">g/m³</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Productivity</div>
              <div className="text-sm font-semibold text-blue-700">{summary.avgPrimaryProductivity}</div>
              <div className="text-[9px] text-muted-foreground">mg C/m³/day</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Data Sparse</div>
              <div className="text-sm font-semibold text-orange-600">{summary.dataSparseUnknownCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Pelagic Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const researchCfg = RESEARCH_CONFIG[zone.researchStatus]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-600/50 bg-blue-500/5'
                          : 'border-border/40 hover:border-blue-500/20 hover:bg-blue-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: researchCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${researchCfg.bgClass}`}
                        >
                          {researchCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {zone.temperature}°C
                            </span>
                          </div>
                        )}
                        {state.showBiomassDensity && (
                          <div>
                            Biomass:{' '}
                            <span className="text-foreground font-medium">
                              {zone.biomassDensity} g/m³
                            </span>
                          </div>
                        )}
                        {state.showPrimaryProductivity && (
                          <div>
                            Productivity:{' '}
                            <span className="text-foreground font-medium">
                              {zone.primaryProductivity} mg C/m³/day
                            </span>
                          </div>
                        )}
                        {state.showResearchStatus && (
                          <div>
                            Status:{' '}
                            <span className="text-foreground font-medium">
                              {researchCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-blue-600/20 bg-blue-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-700" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${RESEARCH_CONFIG[activeZone.researchStatus].bgClass}`}
                  >
                    {RESEARCH_CONFIG[activeZone.researchStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeZone.lat.toFixed(2)}, {activeZone.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth Zone: </span>
                    <span className="font-medium">{DEPTH_ZONE_LABELS[activeZone.depthZone].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeZone.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salinity: </span>
                    <span className="font-medium">{activeZone.salinity} PSU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">O₂ Minimum: </span>
                    <span className="font-medium">{activeZone.oxygenMinimum} mg/L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biomass: </span>
                    <span className="font-medium">{activeZone.biomassDensity} g/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Productivity: </span>
                    <span className="font-medium">{activeZone.primaryProductivity} mg C/m³/day</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Migration: </span>
                    <span className="font-medium capitalize">{activeZone.migrationActivity.replace('_', ' ')}</span>
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
