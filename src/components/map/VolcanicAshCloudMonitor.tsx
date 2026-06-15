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
import { useMapStore, type VolcanicAshCloudState, type VolcanicAshCloudData } from '@/lib/map-store'
import { Cloud as CloudIcon5, X, Mountain, Wind, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: VolcanicAshCloudData[] = [
  {
    id: 'vac-eyja',
    name: 'Eyjafjallajökull Plume',
    lat: 63.6,
    lng: -19.6,
    altitude: 10,
    dispersionRadius: 2000,
    concentration: 5,
    alertLevel: 'critical',
    windDirection: 'NE',
    description: '2010 European aviation disruption plume',
  },
  {
    id: 'vac-etna',
    name: 'Etna Ash Field',
    lat: 37.75,
    lng: 15.0,
    altitude: 7,
    dispersionRadius: 500,
    concentration: 3,
    alertLevel: 'warning',
    windDirection: 'S',
    description: 'Frequent ash emissions from Etna',
  },
  {
    id: 'vac-helens',
    name: 'Mt St Helens Cloud',
    lat: 46.2,
    lng: -122.2,
    altitude: 15,
    dispersionRadius: 1000,
    concentration: 8,
    alertLevel: 'severe',
    windDirection: 'E',
    description: '1980 explosive eruption plume',
  },
  {
    id: 'vac-ruapehu',
    name: 'Ruapehu Column',
    lat: -39.3,
    lng: 175.6,
    altitude: 8,
    dispersionRadius: 300,
    concentration: 2,
    alertLevel: 'advisory',
    windDirection: 'NW',
    description: 'Ongoing minor ash venting',
  },
]

const STATUS_COLORS: Record<VolcanicAshCloudData['alertLevel'], { label: string; color: string; bgClass: string }> = {
  advisory: { label: 'Advisory', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  warning: { label: 'Warning', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  critical: { label: 'Critical', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ alertLevel }: { alertLevel: VolcanicAshCloudData['alertLevel'] }) {
  const cfg = STATUS_COLORS[alertLevel]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VolcanicAshCloudMonitor() {
  const state = useMapStore((s) => s.volcanicAshCloud)
  const setState = useMapStore((s) => s.setVolcanicAshCloud)

  const clouds = useMemo(
    () => (state.clouds.length > 0 ? state.clouds : SAMPLE_LOCATIONS),
    [state.clouds]
  )

  const filteredClouds = useMemo(() => {
    return clouds.filter((c) => {
      if (state.alertFilter !== 'all' && c.alertLevel !== state.alertFilter) return false
      return true
    })
  }, [clouds, state.alertFilter])

  const summary = useMemo(() => {
    if (filteredClouds.length === 0) {
      return { totalClouds: 0, maxAltitude: 0, avgConcentration: 0, maxAlert: 'N/A' }
    }
    const maxAltitude = Math.max(...filteredClouds.map((c) => c.altitude))
    const avgConcentration = filteredClouds.reduce((sum, c) => sum + c.concentration, 0) / filteredClouds.length
    const alertOrder: Record<VolcanicAshCloudData['alertLevel'], number> = { advisory: 1, warning: 2, critical: 3, severe: 4 }
    const maxAlert = filteredClouds.reduce((max, c) => (alertOrder[c.alertLevel] > alertOrder[max] ? c.alertLevel : max), filteredClouds[0].alertLevel)
    return {
      totalClouds: filteredClouds.length,
      maxAltitude,
      avgConcentration: Math.round(avgConcentration * 10) / 10,
      maxAlert: STATUS_COLORS[maxAlert].label,
    }
  }, [filteredClouds])

  const activeCloud = useMemo(
    () => clouds.find((c) => c.id === state.activeCloudId) ?? null,
    [clouds, state.activeCloudId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredClouds.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { id: c.id, name: c.name, alertLevel: c.alertLevel, altitude: c.altitude },
    })),
  }), [filteredClouds])

  useEffect(() => {
    if (state.clouds.length === 0) {
      useMapStore.getState().setVolcanicAshCloud({ clouds: SAMPLE_LOCATIONS })
    }
  }, [state.clouds.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicAshCloudState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAltitude', label: 'Altitude', icon: Mountain },
    { key: 'showDispersion', label: 'Dispersion', icon: Wind },
    { key: 'showConcentration', label: 'Concentration', icon: AlertTriangle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-orange-950/95 backdrop-blur-xl border border-stone-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <CloudIcon5 className="h-4 w-4 text-orange-400" />
              Volcanic Ash Cloud Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-300 hover:text-stone-100 hover:bg-stone-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-stone-100">
          {/* Alert Level Filter */}
          <div>
            <Label className="text-xs text-stone-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Alert Level
            </Label>
            <Select
              value={state.alertFilter}
              onValueChange={(v) =>
                setState({ alertFilter: v as VolcanicAshCloudState['alertFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="advisory">Advisory</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-200">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Total Clouds</div>
              <div className="text-sm font-semibold text-stone-200">{summary.totalClouds}</div>
              <div className="text-[9px] text-stone-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Max Altitude</div>
              <div className="text-sm font-semibold text-blue-400">{summary.maxAltitude}</div>
              <div className="text-[9px] text-stone-400/60">km</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Concentration</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgConcentration}</div>
              <div className="text-[9px] text-stone-400/60">mg/m³</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Max Alert</div>
              <div className="text-sm font-semibold text-red-400">{summary.maxAlert}</div>
              <div className="text-[9px] text-stone-400/60">level</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Cloud List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">
              Ash Clouds ({filteredClouds.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredClouds.map((cloud) => {
                  const isActive = state.activeCloudId === cloud.id
                  const statusCfg = STATUS_COLORS[cloud.alertLevel]
                  return (
                    <div
                      key={cloud.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-800/30'
                          : 'border-stone-700/30 hover:border-orange-500/30 hover:bg-stone-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeCloudId: isActive ? null : cloud.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon alertLevel={cloud.alertLevel} />
                          <span className="text-xs font-medium text-stone-100">{cloud.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300/60">
                        {state.showAltitude && (
                          <div>
                            Altitude:{' '}
                            <span className="text-stone-100 font-medium">{cloud.altitude}km</span>
                          </div>
                        )}
                        {state.showDispersion && (
                          <div>
                            Dispersion:{' '}
                            <span className="text-stone-100 font-medium">{cloud.dispersionRadius}km</span>
                          </div>
                        )}
                        {state.showConcentration && (
                          <div>
                            Concentration:{' '}
                            <span className="text-stone-100 font-medium">{cloud.concentration}mg/m³</span>
                          </div>
                        )}
                        <div>
                          Wind:{' '}
                          <span className="text-stone-100 font-medium">{cloud.windDirection}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredClouds.length === 0 && (
                  <div className="text-center text-xs text-stone-400/50 py-4">
                    No clouds match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Cloud Details */}
          {activeCloud && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-stone-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeCloud.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeCloud.alertLevel].bgClass}`}
                  >
                    {STATUS_COLORS[activeCloud.alertLevel].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-stone-300/60 italic">{activeCloud.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400/70">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeCloud.lat.toFixed(1)}, {activeCloud.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Altitude: </span>
                    <span className="font-medium text-blue-400">{activeCloud.altitude}km</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Dispersion: </span>
                    <span className="font-medium text-orange-400">{activeCloud.dispersionRadius}km</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Concentration: </span>
                    <span className="font-medium text-yellow-400">{activeCloud.concentration}mg/m³</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Wind: </span>
                    <span className="font-medium text-stone-200">{activeCloud.windDirection}</span>
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
