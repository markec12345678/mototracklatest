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
import { useMapStore, type EarthquakeSwarmState, type EarthquakeSwarmEvent } from '@/lib/map-store'
import { Activity as ActivityIcon2, X, Zap, ArrowDownFromLine, AlertTriangle, Filter, MapPin } from 'lucide-react'

const DEMO_EVENTS: EarthquakeSwarmEvent[] = [
  {
    id: 'es-iceland',
    name: 'Iceland Reykjanes',
    latitude: 63.85,
    longitude: -22.35,
    magnitude: 4.8,
    depth: 7.2,
    frequency: 142,
    swarmSize: 520,
    faultType: 'Strike-slip',
    alertLevel: 'watch',
  },
  {
    id: 'es-italy',
    name: 'Italy Campi Flegrei',
    latitude: 40.83,
    longitude: 14.14,
    magnitude: 3.6,
    depth: 3.1,
    frequency: 98,
    swarmSize: 310,
    faultType: 'Normal',
    alertLevel: 'advisory',
  },
  {
    id: 'es-japan',
    name: 'Japan Noto',
    latitude: 37.35,
    longitude: 137.05,
    magnitude: 5.4,
    depth: 12.5,
    frequency: 256,
    swarmSize: 890,
    faultType: 'Thrust',
    alertLevel: 'warning',
  },
  {
    id: 'es-hawaii',
    name: 'Hawaii Kilauea',
    latitude: 19.41,
    longitude: -155.29,
    magnitude: 3.2,
    depth: 5.8,
    frequency: 67,
    swarmSize: 180,
    faultType: 'Normal',
    alertLevel: 'background',
  },
  {
    id: 'es-chile',
    name: 'Chile Nevados',
    latitude: -35.85,
    longitude: -70.75,
    magnitude: 4.1,
    depth: 15.3,
    frequency: 113,
    swarmSize: 440,
    faultType: 'Subduction',
    alertLevel: 'advisory',
  },
  {
    id: 'es-png',
    name: 'Papua New Guinea',
    latitude: -5.55,
    longitude: 151.15,
    magnitude: 5.1,
    depth: 22.0,
    frequency: 189,
    swarmSize: 670,
    faultType: 'Subduction',
    alertLevel: 'watch',
  },
]

const ALERT_CONFIG: Record<
  EarthquakeSwarmEvent['alertLevel'],
  { label: string; color: string; bgClass: string }
> = {
  background: { label: 'Background', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  advisory: { label: 'Advisory', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  watch: { label: 'Watch', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  warning: { label: 'Warning', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function EarthquakeSwarmMonitor() {
  const earthquakeSwarm = useMapStore((s) => s.earthquakeSwarm)
  const setEarthquakeSwarm = useMapStore((s) => s.setEarthquakeSwarm)

  const events = useMemo(
    () => (earthquakeSwarm.events.length > 0 ? earthquakeSwarm.events : DEMO_EVENTS),
    [earthquakeSwarm.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (earthquakeSwarm.alertFilter !== 'all' && e.alertLevel !== earthquakeSwarm.alertFilter) return false
      return true
    })
  }, [events, earthquakeSwarm.alertFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { maxMagnitude: 0, watchWarningCount: 0, totalEvents: 0 }
    }
    const maxMagnitude = Math.max(...filteredEvents.map((e) => e.magnitude))
    const watchWarningCount = filteredEvents.filter(
      (e) => e.alertLevel === 'watch' || e.alertLevel === 'warning'
    ).length
    const totalEvents = filteredEvents.reduce((sum, e) => sum + e.swarmSize, 0)
    return { maxMagnitude: Math.round(maxMagnitude * 10) / 10, watchWarningCount, totalEvents }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === earthquakeSwarm.activeEventId) ?? null,
    [events, earthquakeSwarm.activeEventId]
  )

  if (typeof window === 'undefined') return null
  if (!earthquakeSwarm.open) return null

  const overlayToggles: { key: keyof EarthquakeSwarmState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMagnitude', label: 'Magnitude', icon: Zap },
    { key: 'showDepth', label: 'Depth', icon: ArrowDownFromLine },
    { key: 'showFrequency', label: 'Frequency', icon: ActivityIcon2 },
    { key: 'showAlertLevel', label: 'Alert Level', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ActivityIcon2 className="h-4 w-4 text-orange-500" />
              Earthquake Swarm Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEarthquakeSwarm({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Alert Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Alert Level
            </Label>
            <Select
              value={earthquakeSwarm.alertFilter}
              onValueChange={(v) =>
                setEarthquakeSwarm({
                  alertFilter: v as EarthquakeSwarmState['alertFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="background">Background</SelectItem>
                <SelectItem value="advisory">Advisory</SelectItem>
                <SelectItem value="watch">Watch</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
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
                  <Icon className="h-3 w-3 text-orange-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={earthquakeSwarm[key] as boolean}
                  onCheckedChange={(checked) => setEarthquakeSwarm({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Magnitude</div>
              <div className="text-sm font-semibold text-orange-500">{summary.maxMagnitude}</div>
              <div className="text-[9px] text-muted-foreground">Mw</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Watch/Warning</div>
              <div className="text-sm font-semibold text-red-500">{summary.watchWarningCount}</div>
              <div className="text-[9px] text-muted-foreground">swarms</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Events</div>
              <div className="text-sm font-semibold">{summary.totalEvents}</div>
              <div className="text-[9px] text-muted-foreground">earthquakes</div>
            </div>
          </div>

          <Separator />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Swarm Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = earthquakeSwarm.activeEventId === event.id
                  const alertCfg = ALERT_CONFIG[event.alertLevel]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setEarthquakeSwarm({
                          activeEventId: isActive ? null : event.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: alertCfg.color }}
                          />
                          <span className="text-xs font-medium">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${alertCfg.bgClass}`}
                        >
                          {alertCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {earthquakeSwarm.showMagnitude && (
                          <div>
                            Magnitude:{' '}
                            <span className="text-foreground font-medium">
                              {event.magnitude} Mw
                            </span>
                          </div>
                        )}
                        {earthquakeSwarm.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {event.depth} km
                            </span>
                          </div>
                        )}
                        {earthquakeSwarm.showFrequency && (
                          <div>
                            Frequency:{' '}
                            <span className="text-foreground font-medium">
                              {event.frequency}/wk
                            </span>
                          </div>
                        )}
                        {earthquakeSwarm.showAlertLevel && (
                          <div>
                            Fault:{' '}
                            <span className="text-foreground font-medium">
                              {event.faultType}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEvents.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No swarms match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeEvent && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-semibold">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ALERT_CONFIG[activeEvent.alertLevel].bgClass}`}
                  >
                    {ALERT_CONFIG[activeEvent.alertLevel].label}
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
                    <span className="text-muted-foreground">Magnitude: </span>
                    <span className="font-medium">{activeEvent.magnitude} Mw</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeEvent.depth} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequency: </span>
                    <span className="font-medium">{activeEvent.frequency}/wk</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Swarm Size: </span>
                    <span className="font-medium">{activeEvent.swarmSize} events</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fault Type: </span>
                    <span className="font-medium">{activeEvent.faultType}</span>
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
