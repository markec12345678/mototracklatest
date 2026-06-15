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
import { useMapStore, type RipCurrentState, type RipCurrentData } from '@/lib/map-store'
import { Waves as WavesIcon11, X, Layers, Activity, AlertTriangle, MapPin, Filter, Mountain } from 'lucide-react'

const SAMPLE_LOCATIONS: RipCurrentData[] = [
  {
    id: 'rc-bondi',
    name: 'Bondi Beach',
    lat: -33.9,
    lng: 151.3,
    risk: 'high',
    speed: 2.5,
    frequency: 15,
    beachType: 'sandy',
    description: 'Notorious rip current beach',
  },
  {
    id: 'rc-miami',
    name: 'Miami Beach',
    lat: 25.8,
    lng: -80.1,
    risk: 'moderate',
    speed: 1.8,
    frequency: 8,
    beachType: 'barred',
    description: 'Barred surf zone with channels',
  },
  {
    id: 'rc-nazare',
    name: 'Nazare Beach',
    lat: 39.6,
    lng: -9.1,
    risk: 'extreme',
    speed: 3.5,
    frequency: 20,
    beachType: 'headland',
    description: 'Headland-rip system with giant waves',
  },
  {
    id: 'rc-kohsamui',
    name: 'Koh Samui',
    lat: 9.5,
    lng: 100.0,
    risk: 'moderate',
    speed: 1.5,
    frequency: 6,
    beachType: 'sandy',
    description: 'Monsoon-season rip current zone',
  },
]

const STATUS_COLORS: Record<RipCurrentData['risk'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ risk }: { risk: RipCurrentData['risk'] }) {
  const cfg = STATUS_COLORS[risk]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function RipCurrentMonitor() {
  const state = useMapStore((s) => s.ripCurrent)
  const setState = useMapStore((s) => s.setRipCurrent)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : SAMPLE_LOCATIONS),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.riskFilter !== 'all' && z.risk !== state.riskFilter) return false
      return true
    })
  }, [zones, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalZones: 0, avgSpeed: 0, maxRiskLevel: 'N/A', avgFrequency: 0 }
    }
    const avgSpeed = filteredZones.reduce((sum, z) => sum + z.speed, 0) / filteredZones.length
    const avgFrequency = filteredZones.reduce((sum, z) => sum + z.frequency, 0) / filteredZones.length
    const riskOrder: RipCurrentData['risk'][] = ['low', 'moderate', 'high', 'extreme']
    const maxRisk = filteredZones.reduce<RipCurrentData['risk']>((max, z) => {
      return riskOrder.indexOf(z.risk) > riskOrder.indexOf(max) ? z.risk : max
    }, 'low')
    return {
      totalZones: filteredZones.length,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      maxRiskLevel: STATUS_COLORS[maxRisk].label,
      avgFrequency: Math.round(avgFrequency * 10) / 10,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredZones.map((z) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [z.lng, z.lat] },
      properties: { id: z.id, name: z.name, risk: z.risk, speed: z.speed },
    })),
  }), [filteredZones])

  useEffect(() => {
    if (state.zones.length === 0) {
      useMapStore.getState().setRipCurrent({ zones: SAMPLE_LOCATIONS })
    }
  }, [state.zones.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RipCurrentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRisk', label: 'Risk Level', icon: AlertTriangle },
    { key: 'showSpeed', label: 'Current Speed', icon: Activity },
    { key: 'showFrequency', label: 'Frequency', icon: WavesIcon11 },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-slate-950/95 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <WavesIcon11 className="h-4 w-4 text-teal-400" />
              Rip Current Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-teal-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({ riskFilter: v as RipCurrentState['riskFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalZones}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Speed</div>
              <div className="text-sm font-semibold text-teal-200">{summary.avgSpeed}</div>
              <div className="text-[9px] text-teal-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Max Risk Level</div>
              <div className="text-sm font-semibold text-red-400">{summary.maxRiskLevel}</div>
              <div className="text-[9px] text-teal-400/60">severity</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Frequency</div>
              <div className="text-sm font-semibold text-teal-200">{summary.avgFrequency}</div>
              <div className="text-[9px] text-teal-400/60">per month</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_COLORS[zone.risk]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeZoneId: isActive ? null : zone.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon risk={zone.risk} />
                          <span className="text-xs font-medium text-teal-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showRisk && (
                          <div>
                            Risk:{' '}
                            <span className="text-teal-100 font-medium">{zone.risk}</span>
                          </div>
                        )}
                        {state.showSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-teal-100 font-medium">{zone.speed}m/s</span>
                          </div>
                        )}
                        {state.showFrequency && (
                          <div>
                            Frequency:{' '}
                            <span className="text-teal-100 font-medium">{zone.frequency}/month</span>
                          </div>
                        )}
                        {state.showSpeed && (
                          <div>
                            Beach:{' '}
                            <span className="text-teal-100 font-medium">{zone.beachType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-teal-700/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeZone.risk].bgClass}`}
                  >
                    {STATUS_COLORS[activeZone.risk].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-teal-300/60 italic">{activeZone.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400/70">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Speed: </span>
                    <span className="font-medium text-teal-100">{activeZone.speed}m/s</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Risk: </span>
                    <span className="font-medium text-red-400">{activeZone.risk}</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Frequency: </span>
                    <span className="font-medium text-teal-100">{activeZone.frequency}/month</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Beach Type: </span>
                    <span className="font-medium text-teal-100">{activeZone.beachType}</span>
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
