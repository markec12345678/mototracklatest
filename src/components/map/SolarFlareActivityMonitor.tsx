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
import { useMapStore, type SolarFlareActivityState, type SolarFlareActivityData } from '@/lib/map-store'
import { Sun as SunIcon5, X, Activity, Atom, Radio, Zap, MapPin, Filter } from 'lucide-react'

interface DemoEvent extends SolarFlareActivityData {
  flareClass: 'A_B' | 'C' | 'M' | 'X'
}

const DEMO_EVENTS: DemoEvent[] = [
  {
    id: 'sf-ar13664',
    name: 'AR13664',
    lat: 18,
    lng: -35,
    xRay: 8.2,
    proton: 450,
    radio: 28000,
    coronalMass: 2500,
    sunspotArea: 3200,
    status: 'extreme',
    description: 'Major X-class flare with significant coronal mass ejection',
    flareClass: 'X',
  },
  {
    id: 'sf-ar13644',
    name: 'AR13644',
    lat: -12,
    lng: 45,
    xRay: 2.1,
    proton: 85,
    radio: 5000,
    coronalMass: 800,
    sunspotArea: 1500,
    status: 'moderate',
    description: 'M-class flare with moderate proton enhancement',
    flareClass: 'M',
  },
  {
    id: 'sf-ar13655',
    name: 'AR13655',
    lat: 22,
    lng: -65,
    xRay: 5.5,
    proton: 280,
    radio: 18000,
    coronalMass: 1800,
    sunspotArea: 2800,
    status: 'strong',
    description: 'Strong M-class flare with Earth-directed CME',
    flareClass: 'M',
  },
  {
    id: 'sf-ar13672',
    name: 'AR13672',
    lat: -8,
    lng: 30,
    xRay: 0.5,
    proton: 15,
    radio: 800,
    coronalMass: 200,
    sunspotArea: 400,
    status: 'minor',
    description: 'C-class flare with minor radio burst',
    flareClass: 'C',
  },
  {
    id: 'sf-ar13680',
    name: 'AR13680',
    lat: 15,
    lng: -20,
    xRay: 1.2,
    proton: 45,
    radio: 2500,
    coronalMass: 500,
    sunspotArea: 800,
    status: 'moderate',
    description: 'Moderate M-class flare with associated CME',
    flareClass: 'M',
  },
  {
    id: 'sf-ar13690',
    name: 'AR13690',
    lat: -20,
    lng: 55,
    xRay: 0.1,
    proton: 2,
    radio: 100,
    coronalMass: 50,
    sunspotArea: 100,
    status: 'quiet',
    description: 'Quiet region with minimal activity',
    flareClass: 'A_B',
  },
]

const STATUS_CONFIG: Record<
  SolarFlareActivityData['status'],
  { label: string; color: string; bgClass: string }
> = {
  quiet: { label: 'Quiet', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  minor: { label: 'Minor', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  strong: { label: 'Strong', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const CLASS_LABELS: Record<DemoEvent['flareClass'], string> = {
  A_B: 'A/B Class',
  C: 'C Class',
  M: 'M Class',
  X: 'X Class',
}

export function SolarFlareActivityMonitor() {
  const state = useMapStore((s) => s.solarFlareActivity)
  const setState = useMapStore((s) => s.setSolarFlareActivity)

  const events = useMemo(
    () => (state.events.length > 0 ? (state.events as DemoEvent[]) : DEMO_EVENTS),
    [state.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (state.classFilter !== 'all' && e.flareClass !== state.classFilter) return false
      return true
    })
  }, [events, state.classFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { avgXRay: 0, avgProton: 0, extremeCount: 0 }
    }
    const avgXRay =
      filteredEvents.reduce((sum, e) => sum + e.xRay, 0) / filteredEvents.length
    const avgProton =
      filteredEvents.reduce((sum, e) => sum + e.proton, 0) / filteredEvents.length
    const extremeCount = filteredEvents.filter(
      (e) => e.status === 'strong' || e.status === 'extreme'
    ).length
    return {
      avgXRay: Math.round(avgXRay * 10) / 10,
      avgProton: Math.round(avgProton),
      extremeCount,
    }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === state.activeEventId) ?? null,
    [events, state.activeEventId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SolarFlareActivityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showXRay', label: 'X-Ray Flux', icon: Activity },
    { key: 'showProton', label: 'Proton Flux', icon: Atom },
    { key: 'showRadio', label: 'Radio Burst', icon: Radio },
    { key: 'showCoronalMass', label: 'Coronal Mass Ejection', icon: Zap },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-yellow-950/95 to-orange-950/95 backdrop-blur-xl border border-yellow-800/40 rounded-xl shadow-lg shadow-yellow-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-yellow-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-100">
              <SunIcon5 className="h-4 w-4 text-yellow-400" />
              Solar Flare Activity Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-yellow-100">
          {/* Class Filter */}
          <div>
            <Label className="text-xs text-yellow-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Flare Class
            </Label>
            <Select
              value={state.classFilter}
              onValueChange={(v) =>
                setState({
                  classFilter: v as SolarFlareActivityState['classFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-yellow-900/40 border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="A_B">A/B Class</SelectItem>
                <SelectItem value="C">C Class</SelectItem>
                <SelectItem value="M">M Class</SelectItem>
                <SelectItem value="X">X Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-yellow-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-yellow-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-yellow-200">
                  <Icon className="h-3 w-3 text-yellow-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-yellow-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-yellow-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400">Avg X-Ray</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgXRay}</div>
              <div className="text-[9px] text-yellow-400">W/m&sup2;</div>
            </div>
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400">Avg Proton</div>
              <div className="text-sm font-semibold text-yellow-300">{summary.avgProton}</div>
              <div className="text-[9px] text-yellow-400">pfu</div>
            </div>
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400">Strong/Extreme</div>
              <div className="text-sm font-semibold text-red-400">{summary.extremeCount}</div>
              <div className="text-[9px] text-yellow-400">events</div>
            </div>
          </div>

          <Separator className="bg-yellow-800/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-yellow-300">
              Solar Flare Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = state.activeEventId === event.id
                  const statusCfg = STATUS_CONFIG[event.status]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-yellow-500/60 bg-yellow-800/30'
                          : 'border-yellow-800/30 hover:border-yellow-600/40 hover:bg-yellow-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeEventId: isActive ? null : event.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-yellow-100">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-yellow-300">
                        {state.showXRay && (
                          <div>
                            X-Ray:{' '}
                            <span className="text-yellow-100 font-medium">
                              {event.xRay} W/m&sup2;
                            </span>
                          </div>
                        )}
                        {state.showProton && (
                          <div>
                            Proton:{' '}
                            <span className="text-yellow-100 font-medium">
                              {event.proton} pfu
                            </span>
                          </div>
                        )}
                        {state.showRadio && (
                          <div>
                            Radio:{' '}
                            <span className="text-yellow-100 font-medium">
                              {event.radio.toLocaleString()} sfu
                            </span>
                          </div>
                        )}
                        {state.showCoronalMass && (
                          <div>
                            CME:{' '}
                            <span className="text-yellow-100 font-medium">
                              {event.coronalMass} km/s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEvents.length === 0 && (
                  <div className="text-center text-xs text-yellow-400 py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeEvent && (
            <>
              <Separator className="bg-yellow-800/30" />
              <div className="space-y-2 rounded-lg border border-yellow-600/30 bg-yellow-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-100">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeEvent.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeEvent.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-yellow-400">Coordinates: </span>
                    <span className="font-medium text-yellow-100">
                      {activeEvent.lat.toFixed(1)}, {activeEvent.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-400">X-Ray Flux: </span>
                    <span className="font-medium text-orange-400">{activeEvent.xRay} W/m&sup2;</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Proton Flux: </span>
                    <span className="font-medium text-yellow-200">{activeEvent.proton} pfu</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Radio Burst: </span>
                    <span className="font-medium text-yellow-200">{activeEvent.radio.toLocaleString()} sfu</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">CME Speed: </span>
                    <span className="font-medium text-yellow-200">{activeEvent.coronalMass} km/s</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Sunspot Area: </span>
                    <span className="font-medium text-yellow-200">{activeEvent.sunspotArea.toLocaleString()} msh</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-yellow-400">Flare Class: </span>
                    <span className="font-medium text-yellow-200">
                      {(activeEvent as DemoEvent).flareClass ? CLASS_LABELS[(activeEvent as DemoEvent).flareClass] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-yellow-400">Description: </span>
                    <span className="font-medium text-yellow-200">{activeEvent.description}</span>
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
