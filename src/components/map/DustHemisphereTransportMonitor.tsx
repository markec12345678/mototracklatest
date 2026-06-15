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
import { useMapStore, type DustHemisphereState, type DustHemisphereData } from '@/lib/map-store'
import { Wind as WindIcon10, X, Layers, MapPin, Filter, TrendingUp, Activity } from 'lucide-react'

const SAMPLE_LOCATIONS: DustHemisphereData[] = [
  {
    id: 'dh-sahara',
    name: 'Sahara-Sahel Plume',
    lat: 20.0,
    lng: 0.0,
    concentration: 500,
    transportDistance: 5000,
    depositionRate: 8,
    intensity: 'extreme',
    sourceRegion: 'Bodélé Depression',
    description: 'World largest dust source transatlantic transport',
  },
  {
    id: 'dh-gobi',
    name: 'Gobi-Taklamakan',
    lat: 42.0,
    lng: 85.0,
    concentration: 300,
    transportDistance: 3000,
    depositionRate: 5,
    intensity: 'major',
    sourceRegion: 'Taklamakan Desert',
    description: 'East Asian dust storm corridor',
  },
  {
    id: 'dh-patagonia',
    name: 'Patagonia Outflow',
    lat: -48.0,
    lng: -68.0,
    concentration: 150,
    transportDistance: 4000,
    depositionRate: 3,
    intensity: 'moderate',
    sourceRegion: 'Patagonian steppe',
    description: 'Southern Hemisphere dust transport',
  },
  {
    id: 'dh-australia',
    name: 'Australian Lake Eyre',
    lat: -28.5,
    lng: 137.0,
    concentration: 200,
    transportDistance: 2000,
    depositionRate: 4,
    intensity: 'minor',
    sourceRegion: 'Lake Eyre basin',
    description: 'Intermittent Australian dust events',
  },
]

const STATUS_COLORS: Record<DustHemisphereData['intensity'], { label: string; color: string; bgClass: string }> = {
  minor: { label: 'Minor', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  major: { label: 'Major', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ intensity }: { intensity: DustHemisphereData['intensity'] }) {
  const cfg = STATUS_COLORS[intensity]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function DustHemisphereTransportMonitor() {
  const state = useMapStore((s) => s.dustHemisphere)
  const setState = useMapStore((s) => s.setDustHemisphere)

  const zones = useMemo(
    () => (state.events.length > 0 ? state.events : SAMPLE_LOCATIONS),
    [state.events]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.intensityFilter !== 'all' && z.intensity !== state.intensityFilter) return false
      return true
    })
  }, [zones, state.intensityFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalEvents: 0, avgConcentration: 0, maxTransport: 0, avgDeposition: 0 }
    }
    const avgConcentration = filteredZones.reduce((sum, z) => sum + z.concentration, 0) / filteredZones.length
    const maxTransport = Math.max(...filteredZones.map((z) => z.transportDistance))
    const avgDeposition = filteredZones.reduce((sum, z) => sum + z.depositionRate, 0) / filteredZones.length
    return {
      totalEvents: filteredZones.length,
      avgConcentration: Math.round(avgConcentration),
      maxTransport,
      avgDeposition: Math.round(avgDeposition * 10) / 10,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeEventId) ?? null,
    [zones, state.activeEventId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredZones.map((z) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [z.lng, z.lat] },
      properties: { id: z.id, name: z.name, intensity: z.intensity, concentration: z.concentration },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.events.length === 0) {
      useMapStore.getState().setDustHemisphere({ events: SAMPLE_LOCATIONS })
    }
  }, [state.events.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DustHemisphereState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showConcentration', label: 'Concentration', icon: Activity },
    { key: 'showTransport', label: 'Transport Distance', icon: TrendingUp },
    { key: 'showDeposition', label: 'Deposition Rate', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-orange-950/95 backdrop-blur-xl border border-amber-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <WindIcon10 className="h-4 w-4 text-amber-400" />
              Dust Hemisphere Transport Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Intensity Filter */}
          <div>
            <Label className="text-xs text-amber-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Intensity Level
            </Label>
            <Select
              value={state.intensityFilter}
              onValueChange={(v) =>
                setState({ intensityFilter: v as DustHemisphereState['intensityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intensities</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Events</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalEvents}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Concentration</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgConcentration}</div>
              <div className="text-[9px] text-amber-400/60">μg/m³</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Max Transport</div>
              <div className="text-sm font-semibold text-amber-200">{summary.maxTransport.toLocaleString()}</div>
              <div className="text-[9px] text-amber-400/60">km</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Deposition</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgDeposition}</div>
              <div className="text-[9px] text-amber-400/60">g/m²/yr</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Dust Events ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeEventId === zone.id
                  const statusCfg = STATUS_COLORS[zone.intensity]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeEventId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon intensity={zone.intensity} />
                          <span className="text-xs font-medium text-amber-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showConcentration && (
                          <div>
                            Concentration:{' '}
                            <span className="text-amber-100 font-medium">{zone.concentration}μg/m³</span>
                          </div>
                        )}
                        {state.showTransport && (
                          <div>
                            Transport:{' '}
                            <span className="text-amber-100 font-medium">{zone.transportDistance.toLocaleString()}km</span>
                          </div>
                        )}
                        {state.showDeposition && (
                          <div>
                            Deposition:{' '}
                            <span className="text-yellow-400 font-medium">{zone.depositionRate}g/m²/yr</span>
                          </div>
                        )}
                        <div>
                          Source:{' '}
                          <span className="text-amber-100 font-medium">{zone.sourceRegion}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeZone && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeZone.intensity].bgClass}`}
                  >
                    {STATUS_COLORS[activeZone.intensity].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-amber-300/60 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Concentration: </span>
                    <span className="font-medium text-orange-400">{activeZone.concentration}μg/m³</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Transport: </span>
                    <span className="font-medium text-amber-200">{activeZone.transportDistance.toLocaleString()}km</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Deposition: </span>
                    <span className="font-medium text-yellow-400">{activeZone.depositionRate}g/m²/yr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Source: </span>
                    <span className="font-medium text-amber-200">{activeZone.sourceRegion}</span>
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
