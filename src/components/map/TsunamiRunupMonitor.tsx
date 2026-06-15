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
import { useMapStore, type TsunamiRunupState, type TsunamiRunupData } from '@/lib/map-store'
import { Waves as WavesIcon12, X, Layers, Activity, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: TsunamiRunupData[] = [
  {
    id: 'tr-sendai',
    name: 'Sendai Plain',
    lat: 38.3,
    lng: 141.0,
    maxRunup: 40,
    inundationDistance: 6,
    recurrenceInterval: 500,
    risk: 'extreme',
    lastEvent: '2011-03-11',
    description: '2011 Tohoku tsunami maximum runup',
  },
  {
    id: 'tr-banda-aceh',
    name: 'Banda Aceh',
    lat: 5.5,
    lng: 95.3,
    maxRunup: 35,
    inundationDistance: 5,
    recurrenceInterval: 200,
    risk: 'extreme',
    lastEvent: '2004-12-26',
    description: '2004 Indian Ocean tsunami devastation',
  },
  {
    id: 'tr-lisbon',
    name: 'Lisbon Coast',
    lat: 38.7,
    lng: -9.4,
    maxRunup: 20,
    inundationDistance: 2,
    recurrenceInterval: 1000,
    risk: 'moderate',
    lastEvent: '1755-11-01',
    description: 'Historic 1755 Lisbon tsunami zone',
  },
  {
    id: 'tr-hilo',
    name: 'Hilo Bay',
    lat: 19.7,
    lng: -155.1,
    maxRunup: 15,
    inundationDistance: 1.5,
    recurrenceInterval: 50,
    risk: 'high',
    lastEvent: '1960-05-23',
    description: 'Chilean tsunami damage zone',
  },
]

const STATUS_COLORS: Record<TsunamiRunupData['risk'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ risk }: { risk: TsunamiRunupData['risk'] }) {
  const cfg = STATUS_COLORS[risk]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TsunamiRunupMonitor() {
  const state = useMapStore((s) => s.tsunamiRunup)
  const setState = useMapStore((s) => s.setTsunamiRunup)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : SAMPLE_LOCATIONS),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.riskFilter !== 'all' && s.risk !== state.riskFilter) return false
      return true
    })
  }, [sites, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { totalSites: 0, maxRunup: 0, avgInundation: 0, maxRisk: 'low' as TsunamiRunupData['risk'] }
    }
    const maxRunup = Math.max(...filteredSites.map((s) => s.maxRunup))
    const avgInundation = filteredSites.reduce((sum, s) => sum + s.inundationDistance, 0) / filteredSites.length
    const riskOrder: TsunamiRunupData['risk'][] = ['low', 'moderate', 'high', 'extreme']
    const maxRisk = filteredSites.reduce<TsunamiRunupData['risk']>((max, s) => {
      return riskOrder.indexOf(s.risk) > riskOrder.indexOf(max) ? s.risk : max
    }, 'low')
    return {
      totalSites: filteredSites.length,
      maxRunup,
      avgInundation: Math.round(avgInundation * 10) / 10,
      maxRisk,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredSites.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, risk: s.risk, maxRunup: s.maxRunup },
    })),
  }), [filteredSites])

  useEffect(() => {
    if (state.sites.length === 0) {
      useMapStore.getState().setTsunamiRunup({ sites: SAMPLE_LOCATIONS })
    }
  }, [state.sites.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TsunamiRunupState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRunup', label: 'Runup Height', icon: Layers },
    { key: 'showInundation', label: 'Inundation Distance', icon: Activity },
    { key: 'showRisk', label: 'Risk Level', icon: AlertTriangle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-cyan-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <WavesIcon12 className="h-4 w-4 text-blue-400" />
              Tsunami Runup Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-blue-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({ riskFilter: v as TsunamiRunupState['riskFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
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

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalSites}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Max Runup</div>
              <div className="text-sm font-semibold text-red-400">{summary.maxRunup}</div>
              <div className="text-[9px] text-blue-400/60">meters</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Inundation</div>
              <div className="text-sm font-semibold text-blue-200">{summary.avgInundation}</div>
              <div className="text-[9px] text-blue-400/60">km</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Max Risk</div>
              <div className="text-sm font-semibold text-orange-400">{STATUS_COLORS[summary.maxRisk].label}</div>
              <div className="text-[9px] text-blue-400/60">level</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const statusCfg = STATUS_COLORS[site.risk]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSiteId: isActive ? null : site.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon risk={site.risk} />
                          <span className="text-xs font-medium text-blue-100">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showRunup && (
                          <div>
                            Max Runup:{' '}
                            <span className="text-blue-100 font-medium">{site.maxRunup}m</span>
                          </div>
                        )}
                        {state.showInundation && (
                          <div>
                            Inundation:{' '}
                            <span className="text-blue-100 font-medium">{site.inundationDistance}km</span>
                          </div>
                        )}
                        {state.showRisk && (
                          <div>
                            Recurrence:{' '}
                            <span className="text-blue-100 font-medium">{site.recurrenceInterval}yr</span>
                          </div>
                        )}
                        {state.showRisk && (
                          <div>
                            Last Event:{' '}
                            <span className="text-blue-100 font-medium">{site.lastEvent}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeSite.risk].bgClass}`}
                  >
                    {STATUS_COLORS[activeSite.risk].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-blue-300/60 italic">{activeSite.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400/70">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeSite.lat.toFixed(1)}, {activeSite.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Max Runup: </span>
                    <span className="font-medium text-red-400">{activeSite.maxRunup}m</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Inundation: </span>
                    <span className="font-medium text-blue-100">{activeSite.inundationDistance}km</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Recurrence: </span>
                    <span className="font-medium text-blue-100">{activeSite.recurrenceInterval}yr</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Last Event: </span>
                    <span className="font-medium text-orange-400">{activeSite.lastEvent}</span>
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
