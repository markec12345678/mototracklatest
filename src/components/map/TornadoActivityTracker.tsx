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
import { useMapStore, type TornadoActivityState, type TornadoEvent } from '@/lib/map-store'
import { Tornado as TornadoIcon, X, Gauge, Ruler, MapPin, Filter, Wind, AlertTriangle } from 'lucide-react'

const DEMO_EVENTS: TornadoEvent[] = [
  {
    id: 'te-moore',
    name: 'Moore, OK',
    latitude: 35.34,
    longitude: -97.49,
    efScale: 'ef5',
    windSpeed: 322,
    pathLength: 27.8,
    pathWidth: 1800,
    duration: 40,
    formationType: 'supercell',
    season: 'spring',
    riskLevel: 'extreme',
  },
  {
    id: 'te-joplin',
    name: 'Joplin, MO',
    latitude: 37.08,
    longitude: -94.51,
    efScale: 'ef5',
    windSpeed: 322,
    pathLength: 35.6,
    pathWidth: 1200,
    duration: 38,
    formationType: 'supercell',
    season: 'spring',
    riskLevel: 'extreme',
  },
  {
    id: 'te-elreno',
    name: 'El Reno, OK',
    latitude: 35.53,
    longitude: -98.02,
    efScale: 'ef3',
    windSpeed: 241,
    pathLength: 25.6,
    pathWidth: 4184,
    duration: 40,
    formationType: 'supercell',
    season: 'spring',
    riskLevel: 'high',
  },
  {
    id: 'te-tuscaloosa',
    name: 'Tuscaloosa, AL',
    latitude: 33.21,
    longitude: -87.57,
    efScale: 'ef4',
    windSpeed: 280,
    pathLength: 130.3,
    pathWidth: 2400,
    duration: 90,
    formationType: 'supercell',
    season: 'spring',
    riskLevel: 'very_high',
  },
  {
    id: 'te-dodgecity',
    name: 'Dodge City, KS',
    latitude: 37.76,
    longitude: -100.02,
    efScale: 'ef2',
    windSpeed: 193,
    pathLength: 15.2,
    pathWidth: 800,
    duration: 20,
    formationType: 'supercell',
    season: 'summer',
    riskLevel: 'moderate',
  },
  {
    id: 'te-ivan-waterspout',
    name: 'Hurricane Ivan Waterspout',
    latitude: 30.40,
    longitude: -87.50,
    efScale: 'ef1',
    windSpeed: 145,
    pathLength: 3.2,
    pathWidth: 150,
    duration: 10,
    formationType: 'waterspout',
    season: 'fall',
    riskLevel: 'low',
  },
]

const EF_CONFIG: Record<
  TornadoEvent['efScale'],
  { label: string; color: string; bgClass: string }
> = {
  ef0: { label: 'EF0', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  ef1: { label: 'EF1', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  ef2: { label: 'EF2', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  ef3: { label: 'EF3', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  ef4: { label: 'EF4', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  ef5: { label: 'EF5', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

const RISK_CONFIG: Record<
  TornadoEvent['riskLevel'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  high: { label: 'High', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  very_high: { label: 'Very High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const FORMATION_CONFIG: Record<
  TornadoEvent['formationType'],
  { label: string }
> = {
  supercell: { label: 'Supercell' },
  landspout: { label: 'Landspout' },
  waterspout: { label: 'Waterspout' },
  qlic: { label: 'QLCS' },
  anticyclonic: { label: 'Anticyclonic' },
}

export function TornadoActivityTracker() {
  const state = useMapStore((s) => s.tornadoActivity)
  const setState = useMapStore((s) => s.setTornadoActivity)

  const events = useMemo(
    () => (state.events.length > 0 ? state.events : DEMO_EVENTS),
    [state.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (state.efFilter !== 'all' && e.efScale !== state.efFilter) return false
      return true
    })
  }, [events, state.efFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { avgWindSpeed: 0, avgPathLength: 0, highRiskCount: 0 }
    }
    const avgWindSpeed = filteredEvents.reduce((sum, e) => sum + e.windSpeed, 0) / filteredEvents.length
    const avgPathLength = filteredEvents.reduce((sum, e) => sum + e.pathLength, 0) / filteredEvents.length
    const highRiskCount = filteredEvents.filter(
      (e) => e.riskLevel === 'very_high' || e.riskLevel === 'extreme'
    ).length
    return {
      avgWindSpeed: Math.round(avgWindSpeed),
      avgPathLength: Math.round(avgPathLength * 10) / 10,
      highRiskCount,
    }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === state.activeEventId) ?? null,
    [events, state.activeEventId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TornadoActivityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showPathLength', label: 'Path Length', icon: Ruler },
    { key: 'showEfScale', label: 'EF Scale', icon: Gauge },
    { key: 'showRiskLevel', label: 'Risk Level', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TornadoIcon className="h-4 w-4 text-slate-600" />
              Tornado Activity Tracker
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
          {/* EF Scale Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              EF Scale Filter
            </Label>
            <Select
              value={state.efFilter}
              onValueChange={(v) =>
                setState({
                  efFilter: v as TornadoActivityState['efFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All EF Scales</SelectItem>
                <SelectItem value="ef0">EF0</SelectItem>
                <SelectItem value="ef1">EF1</SelectItem>
                <SelectItem value="ef2">EF2</SelectItem>
                <SelectItem value="ef3">EF3</SelectItem>
                <SelectItem value="ef4">EF4</SelectItem>
                <SelectItem value="ef5">EF5</SelectItem>
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
                  <Icon className="h-3 w-3 text-slate-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Wind</div>
              <div className="text-sm font-semibold">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-muted-foreground">km/h</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Path</div>
              <div className="text-sm font-semibold text-slate-600">{summary.avgPathLength}</div>
              <div className="text-[9px] text-muted-foreground">km</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">V.High/Extreme</div>
              <div className="text-sm font-semibold text-red-600">{summary.highRiskCount}</div>
              <div className="text-[9px] text-muted-foreground">events</div>
            </div>
          </div>

          <Separator />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Tornado Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = state.activeEventId === event.id
                  const efCfg = EF_CONFIG[event.efScale]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-500/5'
                          : 'border-border/40 hover:border-slate-500/20 hover:bg-slate-500/5'
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
                            style={{ backgroundColor: efCfg.color }}
                          />
                          <span className="text-xs font-medium">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${efCfg.bgClass}`}
                        >
                          {efCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-foreground font-medium">
                              {event.windSpeed} km/h
                            </span>
                          </div>
                        )}
                        {state.showPathLength && (
                          <div>
                            Path:{' '}
                            <span className="text-foreground font-medium">
                              {event.pathLength} km
                            </span>
                          </div>
                        )}
                        {state.showEfScale && (
                          <div>
                            Width:{' '}
                            <span className="text-foreground font-medium">
                              {event.pathWidth} m
                            </span>
                          </div>
                        )}
                        {state.showRiskLevel && (
                          <div>
                            Risk:{' '}
                            <span className="text-foreground font-medium">
                              {RISK_CONFIG[event.riskLevel].label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEvents.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeEvent && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-slate-500/20 bg-slate-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-xs font-semibold">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${EF_CONFIG[activeEvent.efScale].bgClass}`}
                  >
                    {EF_CONFIG[activeEvent.efScale].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeEvent.latitude.toFixed(2)}, {activeEvent.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Speed: </span>
                    <span className="font-medium">{activeEvent.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Path Length: </span>
                    <span className="font-medium">{activeEvent.pathLength} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Path Width: </span>
                    <span className="font-medium">{activeEvent.pathWidth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{activeEvent.duration} min</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Formation: </span>
                    <span className="font-medium">{FORMATION_CONFIG[activeEvent.formationType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Season: </span>
                    <span className="font-medium">{activeEvent.season.charAt(0).toUpperCase() + activeEvent.season.slice(1)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Level: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 ${RISK_CONFIG[activeEvent.riskLevel].bgClass}`}
                    >
                      {RISK_CONFIG[activeEvent.riskLevel].label}
                    </Badge>
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
