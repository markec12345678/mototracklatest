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
import { useMapStore, type VolcanicSO2State, type VolcanicSO2Data } from '@/lib/map-store'
import { Cloud as CloudIcon4, X, Wind, Mountain, Activity, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: VolcanicSO2Data[] = [
  {
    id: 'vs-kilauea',
    name: 'Kilauea Vent',
    lat: 19.4,
    lng: -155.3,
    so2Concentration: 1200,
    plumeHeight: 5,
    emissionRate: 2000,
    alertLevel: 'high',
    description: 'Active vent with elevated SO2 emissions',
  },
  {
    id: 'vs-etna',
    name: 'Etna Crater',
    lat: 37.75,
    lng: 15.0,
    so2Concentration: 800,
    plumeHeight: 7,
    emissionRate: 1500,
    alertLevel: 'moderate',
    description: 'Persistent degassing from summit craters',
  },
  {
    id: 'vs-holuhruun',
    name: 'Holuhruun',
    lat: 63.6,
    lng: -19.6,
    so2Concentration: 3000,
    plumeHeight: 10,
    emissionRate: 5000,
    alertLevel: 'severe',
    description: 'Fissure eruption with extreme SO2 output',
  },
  {
    id: 'vs-popocatepetl',
    name: 'Popocatepetl',
    lat: 19.0,
    lng: -98.6,
    so2Concentration: 600,
    plumeHeight: 4,
    emissionRate: 1000,
    alertLevel: 'moderate',
    description: 'Regular explosive emissions from stratovolcano',
  },
]

const STATUS_COLORS: Record<VolcanicSO2Data['alertLevel'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ alertLevel }: { alertLevel: VolcanicSO2Data['alertLevel'] }) {
  const cfg = STATUS_COLORS[alertLevel]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VolcanicSulfurDioxideMonitor() {
  const state = useMapStore((s) => s.volcanicSO2)
  const setState = useMapStore((s) => s.setVolcanicSO2)

  const sources = useMemo(
    () => (state.sources.length > 0 ? state.sources : SAMPLE_LOCATIONS),
    [state.sources]
  )

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (state.alertFilter !== 'all' && s.alertLevel !== state.alertFilter) return false
      return true
    })
  }, [sources, state.alertFilter])

  const summary = useMemo(() => {
    if (filteredSources.length === 0) {
      return { avgSO2: 0, avgPlumeHeight: 0, avgEmissionRate: 0, highestAlert: 'low' as const }
    }
    const avgSO2 = filteredSources.reduce((sum, s) => sum + s.so2Concentration, 0) / filteredSources.length
    const avgPlumeHeight = filteredSources.reduce((sum, s) => sum + s.plumeHeight, 0) / filteredSources.length
    const avgEmissionRate = filteredSources.reduce((sum, s) => sum + s.emissionRate, 0) / filteredSources.length
    const alertOrder: VolcanicSO2Data['alertLevel'][] = ['severe', 'high', 'moderate', 'low']
    const highestAlert = alertOrder.find((a) => filteredSources.some((s) => s.alertLevel === a)) ?? 'low'
    return {
      avgSO2: Math.round(avgSO2),
      avgPlumeHeight: Math.round(avgPlumeHeight * 10) / 10,
      avgEmissionRate: Math.round(avgEmissionRate),
      highestAlert,
    }
  }, [filteredSources])

  const activeSource = useMemo(
    () => sources.find((s) => s.id === state.activeSourceId) ?? null,
    [sources, state.activeSourceId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredSources.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, alertLevel: s.alertLevel, so2Concentration: s.so2Concentration },
    })),
  }), [filteredSources])

  useEffect(() => {
    if (state.sources.length === 0) {
      useMapStore.getState().setVolcanicSO2({ sources: SAMPLE_LOCATIONS })
    }
  }, [state.sources.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicSO2State; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showConcentration', label: 'SO\u2082 Concentration', icon: Wind },
    { key: 'showPlume', label: 'Plume Height', icon: Mountain },
    { key: 'showAlerts', label: 'Alert Level', icon: AlertTriangle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-950/95 to-stone-950/95 backdrop-blur-xl border border-rose-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-rose-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-100">
              <CloudIcon4 className="h-4 w-4 text-rose-400" />
              Volcanic SO\u2082 Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-300 hover:text-rose-100 hover:bg-rose-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-rose-100">
          {/* Alert Filter */}
          <div>
            <Label className="text-xs text-rose-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Alert Level
            </Label>
            <Select
              value={state.alertFilter}
              onValueChange={(v) =>
                setState({ alertFilter: v as VolcanicSO2State['alertFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-rose-900/40 border-rose-700/40 text-rose-100 hover:bg-rose-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rose-200">
                  <Icon className="h-3 w-3 text-rose-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-rose-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">SO\u2082 Concentration</div>
              <div className="text-sm font-semibold text-rose-200">{summary.avgSO2}</div>
              <div className="text-[9px] text-rose-400/60">&mu;g/m&sup3;</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Plume Height</div>
              <div className="text-sm font-semibold text-rose-200">{summary.avgPlumeHeight}</div>
              <div className="text-[9px] text-rose-400/60">km</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Emission Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgEmissionRate}</div>
              <div className="text-[9px] text-rose-400/60">t/day</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Alert Level</div>
              <div className="text-sm font-semibold text-rose-200">{STATUS_COLORS[summary.highestAlert].label}</div>
              <div className="text-[9px] text-rose-400/60">highest</div>
            </div>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Source List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">
              Volcanic Sources ({filteredSources.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSources.map((source) => {
                  const isActive = state.activeSourceId === source.id
                  const statusCfg = STATUS_COLORS[source.alertLevel]
                  return (
                    <div
                      key={source.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-800/30'
                          : 'border-rose-700/30 hover:border-rose-500/30 hover:bg-rose-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSourceId: isActive ? null : source.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon alertLevel={source.alertLevel} />
                          <span className="text-xs font-medium text-rose-100">{source.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-rose-300/60">
                        {state.showConcentration && (
                          <div>
                            SO\u2082:{' '}
                            <span className="text-rose-100 font-medium">{source.so2Concentration}&mu;g/m&sup3;</span>
                          </div>
                        )}
                        {state.showPlume && (
                          <div>
                            Plume:{' '}
                            <span className="text-rose-100 font-medium">{source.plumeHeight}km</span>
                          </div>
                        )}
                        {state.showAlerts && (
                          <div>
                            Emission:{' '}
                            <span className="text-rose-100 font-medium">{source.emissionRate}t/day</span>
                          </div>
                        )}
                        {state.showAlerts && (
                          <div>
                            Alert:{' '}
                            <span className="text-rose-100 font-medium">{statusCfg.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSources.length === 0 && (
                  <div className="text-center text-xs text-rose-400/50 py-4">
                    No sources match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Source Details */}
          {activeSource && (
            <>
              <Separator className="bg-rose-700/30" />
              <div className="space-y-2 rounded-lg border border-rose-600/30 bg-rose-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-100">{activeSource.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeSource.alertLevel].bgClass}`}
                  >
                    {STATUS_COLORS[activeSource.alertLevel].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-rose-300/60 italic">{activeSource.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-rose-400/70">Coordinates: </span>
                    <span className="font-medium text-rose-100">
                      {activeSource.lat.toFixed(2)}, {activeSource.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">SO\u2082: </span>
                    <span className="font-medium text-orange-400">{activeSource.so2Concentration}&mu;g/m&sup3;</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Plume Height: </span>
                    <span className="font-medium text-rose-100">{activeSource.plumeHeight}km</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Emission Rate: </span>
                    <span className="font-medium text-rose-100">{activeSource.emissionRate}t/day</span>
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
