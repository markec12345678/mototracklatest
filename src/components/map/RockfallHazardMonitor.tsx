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
import { useMapStore, type RockfallHazardState, type RockfallHazardData } from '@/lib/map-store'
import { TriangleAlert as TriangleAlertIcon2, X, Mountain, Gauge, MapPin, Filter, TrendingUp } from 'lucide-react'

const SAMPLE_LOCATIONS: RockfallHazardData[] = [
  {
    id: 'rf-alps-1',
    name: 'Alpine Rockfall Zone',
    lat: 46.5,
    lng: 11.0,
    hazardLevel: 'high',
    slopeAngle: 65,
    rockVolume: 5000,
    triggerType: 'freeze-thaw',
    description: 'Active rockfall corridor in Dolomites',
  },
  {
    id: 'rf-yosemite-1',
    name: 'Yosemite Glacier Point',
    lat: 37.73,
    lng: -119.57,
    hazardLevel: 'moderate',
    slopeAngle: 55,
    rockVolume: 2000,
    triggerType: 'thermal',
    description: 'Exfoliation sheet instability at Glacier Point',
  },
  {
    id: 'rf-norway-1',
    name: 'Norwegian Fjord Wall',
    lat: 61.5,
    lng: 6.0,
    hazardLevel: 'extreme',
    slopeAngle: 78,
    rockVolume: 50000,
    triggerType: 'rainfall',
    description: 'Critical fjord wall instability zone',
  },
  {
    id: 'rf-himalaya-1',
    name: 'Himalayan Valley Slope',
    lat: 28.0,
    lng: 86.5,
    hazardLevel: 'low',
    slopeAngle: 35,
    rockVolume: 500,
    triggerType: 'seismic',
    description: 'Seismically vulnerable valley slope',
  },
]

const STATUS_COLORS: Record<RockfallHazardData['hazardLevel'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ hazardLevel }: { hazardLevel: RockfallHazardData['hazardLevel'] }) {
  const cfg = STATUS_COLORS[hazardLevel]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function RockfallHazardMonitor() {
  const state = useMapStore((s) => s.rockfallHazard)
  const setState = useMapStore((s) => s.setRockfallHazard)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : SAMPLE_LOCATIONS),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.hazardFilter !== 'all' && z.hazardLevel !== state.hazardFilter) return false
      return true
    })
  }, [zones, state.hazardFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalZones: 0, highExtremeCount: 0, avgSlope: 0, maxRockVolume: 0 }
    }
    const avgSlope = filteredZones.reduce((sum, z) => sum + z.slopeAngle, 0) / filteredZones.length
    const maxRockVolume = Math.max(...filteredZones.map((z) => z.rockVolume))
    const highExtremeCount = filteredZones.filter((z) => z.hazardLevel === 'high' || z.hazardLevel === 'extreme').length
    return {
      totalZones: filteredZones.length,
      highExtremeCount,
      avgSlope: Math.round(avgSlope * 10) / 10,
      maxRockVolume,
    }
  }, [filteredZones])

  const activeItem = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredZones.map((z) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [z.lng, z.lat] },
      properties: { id: z.id, name: z.name, hazardLevel: z.hazardLevel, slopeAngle: z.slopeAngle },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.zones.length === 0) {
      useMapStore.getState().setRockfallHazard({ zones: SAMPLE_LOCATIONS })
    }
  }, [state.zones.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RockfallHazardState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSlopeAngle', label: 'Slope Angle', icon: Mountain },
    { key: 'showRockVolume', label: 'Rock Volume', icon: Gauge },
    { key: 'showTriggerType', label: 'Trigger Type', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-rose-950/95 backdrop-blur-xl border border-red-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <TriangleAlertIcon2 className="h-4 w-4 text-red-400" />
              Rockfall Hazard Monitor
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
          {/* Hazard Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Hazard Level
            </Label>
            <Select
              value={state.hazardFilter}
              onValueChange={(v) =>
                setState({ hazardFilter: v as RockfallHazardState['hazardFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
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

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalZones}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">High/Extreme</div>
              <div className="text-sm font-semibold text-orange-400">{summary.highExtremeCount}</div>
              <div className="text-[9px] text-red-400/60">zones</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Slope</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgSlope}</div>
              <div className="text-[9px] text-red-400/60">°</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Max Rock Volume</div>
              <div className="text-sm font-semibold text-red-300">{summary.maxRockVolume.toLocaleString()}</div>
              <div className="text-[9px] text-red-400/60">m³</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Rockfall Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_COLORS[zone.hazardLevel]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeZoneId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon hazardLevel={zone.hazardLevel} />
                          <span className="text-xs font-medium text-red-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showSlopeAngle && (
                          <div>
                            Slope:{' '}
                            <span className="text-red-100 font-medium">{zone.slopeAngle}°</span>
                          </div>
                        )}
                        {state.showRockVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-red-100 font-medium">{zone.rockVolume.toLocaleString()}m³</span>
                          </div>
                        )}
                        {state.showTriggerType && (
                          <div>
                            Trigger:{' '}
                            <span className="text-red-100 font-medium">{zone.triggerType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.hazardLevel].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.hazardLevel].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(1)}, {activeItem.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Slope Angle: </span>
                    <span className="font-medium text-amber-400">{activeItem.slopeAngle}°</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Rock Volume: </span>
                    <span className="font-medium text-orange-400">{activeItem.rockVolume.toLocaleString()}m³</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Trigger Type: </span>
                    <span className="font-medium text-red-200">{activeItem.triggerType}</span>
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
