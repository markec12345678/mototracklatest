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
import { useMapStore, type CoralBleachingMonitorState, type CoralBleachingEvent } from '@/lib/map-store'
import { Fish as FishIcon2, X, MapPin, Thermometer, Flame, ShieldAlert, Filter } from 'lucide-react'

const DEMO_EVENTS: CoralBleachingEvent[] = [
  {
    id: 'cb-gbr',
    name: 'Great Barrier Reef',
    latitude: -18.29,
    longitude: 147.70,
    bleachingPercent: 62,
    seaSurfaceTemp: 29.4,
    heatStress: 8.7,
    recoveryPotential: 'moderate',
    reefType: 'barrier',
    lastSurveyed: '2024-11-15',
  },
  {
    id: 'cb-caribbean',
    name: 'Caribbean Reef System',
    latitude: 18.23,
    longitude: -66.03,
    bleachingPercent: 45,
    seaSurfaceTemp: 30.1,
    heatStress: 6.3,
    recoveryPotential: 'high',
    reefType: 'fringing',
    lastSurveyed: '2024-10-28',
  },
  {
    id: 'cb-maldives',
    name: 'Maldives Atolls',
    latitude: 3.20,
    longitude: 73.22,
    bleachingPercent: 78,
    seaSurfaceTemp: 31.2,
    heatStress: 11.4,
    recoveryPotential: 'low',
    reefType: 'atoll',
    lastSurveyed: '2024-12-01',
  },
  {
    id: 'cb-redsea',
    name: 'Red Sea Reefs',
    latitude: 22.73,
    longitude: 36.84,
    bleachingPercent: 28,
    seaSurfaceTemp: 27.8,
    heatStress: 3.1,
    recoveryPotential: 'high',
    reefType: 'fringing',
    lastSurveyed: '2024-09-20',
  },
  {
    id: 'cb-hawaii',
    name: 'Hawaiian Islands',
    latitude: 20.47,
    longitude: -156.43,
    bleachingPercent: 55,
    seaSurfaceTemp: 28.9,
    heatStress: 7.2,
    recoveryPotential: 'moderate',
    reefType: 'patch',
    lastSurveyed: '2024-11-03',
  },
  {
    id: 'cb-coralsea',
    name: 'Coral Sea',
    latitude: -15.50,
    longitude: 155.00,
    bleachingPercent: 71,
    seaSurfaceTemp: 30.6,
    heatStress: 9.8,
    recoveryPotential: 'none',
    reefType: 'barrier',
    lastSurveyed: '2024-10-12',
  },
]

const RECOVERY_CONFIG: Record<
  CoralBleachingEvent['recoveryPotential'],
  { label: string; color: string; bgClass: string }
> = {
  high: { label: 'High', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  low: { label: 'Low', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  none: { label: 'None', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const REEF_TYPE_LABELS: Record<CoralBleachingEvent['reefType'], string> = {
  fringing: 'Fringing',
  barrier: 'Barrier',
  atoll: 'Atoll',
  patch: 'Patch',
}

export function CoralBleachingMonitor() {
  const coralBleachingMonitor = useMapStore((s) => s.coralBleachingMonitor)
  const setCoralBleachingMonitor = useMapStore((s) => s.setCoralBleachingMonitor)

  const events = useMemo(
    () => (coralBleachingMonitor.events.length > 0 ? coralBleachingMonitor.events : DEMO_EVENTS),
    [coralBleachingMonitor.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (coralBleachingMonitor.reefFilter !== 'all' && e.reefType !== coralBleachingMonitor.reefFilter) return false
      return true
    })
  }, [events, coralBleachingMonitor.reefFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { avgBleaching: 0, avgTemp: 0, highRiskCount: 0 }
    }
    const avgBleaching = Math.round(
      filteredEvents.reduce((sum, e) => sum + e.bleachingPercent, 0) / filteredEvents.length
    )
    const avgTemp =
      Math.round(
        (filteredEvents.reduce((sum, e) => sum + e.seaSurfaceTemp, 0) / filteredEvents.length) * 10
      ) / 10
    const highRiskCount = filteredEvents.filter(
      (e) => e.recoveryPotential === 'low' || e.recoveryPotential === 'none'
    ).length
    return { avgBleaching, avgTemp, highRiskCount }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === coralBleachingMonitor.activeEventId) ?? null,
    [events, coralBleachingMonitor.activeEventId]
  )

  if (typeof window === 'undefined') return null
  if (!coralBleachingMonitor.open) return null

  const overlayToggles: { key: keyof CoralBleachingMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showBleachingPercent', label: 'Bleaching %', icon: Flame },
    { key: 'showHeatStress', label: 'Heat Stress', icon: Thermometer },
    { key: 'showSeaTemp', label: 'Sea Surface Temp', icon: MapPin },
    { key: 'showRecoveryPotential', label: 'Recovery Potential', icon: ShieldAlert },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FishIcon2 className="h-4 w-4 text-orange-500" />
              Coral Bleaching Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCoralBleachingMonitor({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Reef Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Reef Type
            </Label>
            <Select
              value={coralBleachingMonitor.reefFilter}
              onValueChange={(v) =>
                setCoralBleachingMonitor({
                  reefFilter: v as CoralBleachingMonitorState['reefFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reef Types</SelectItem>
                <SelectItem value="fringing">Fringing</SelectItem>
                <SelectItem value="barrier">Barrier</SelectItem>
                <SelectItem value="atoll">Atoll</SelectItem>
                <SelectItem value="patch">Patch</SelectItem>
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
                  checked={coralBleachingMonitor[key] as boolean}
                  onCheckedChange={(checked) => setCoralBleachingMonitor({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Bleaching</div>
              <div className="text-sm font-semibold text-orange-500">{summary.avgBleaching}%</div>
              <div className="text-[9px] text-muted-foreground">coral cover</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg SST</div>
              <div className="text-sm font-semibold text-red-500">{summary.avgTemp}°C</div>
              <div className="text-[9px] text-muted-foreground">sea surface</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High Risk</div>
              <div className="text-sm font-semibold">{summary.highRiskCount}</div>
              <div className="text-[9px] text-muted-foreground">reefs</div>
            </div>
          </div>

          <Separator />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Bleaching Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = coralBleachingMonitor.activeEventId === event.id
                  const recCfg = RECOVERY_CONFIG[event.recoveryPotential]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setCoralBleachingMonitor({
                          activeEventId: isActive ? null : event.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: recCfg.color }}
                          />
                          <span className="text-xs font-medium">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${recCfg.bgClass}`}
                        >
                          {recCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {coralBleachingMonitor.showBleachingPercent && (
                          <div>
                            Bleaching:{' '}
                            <span className="text-foreground font-medium">
                              {event.bleachingPercent}%
                            </span>
                          </div>
                        )}
                        {coralBleachingMonitor.showHeatStress && (
                          <div>
                            Heat Stress:{' '}
                            <span className="text-foreground font-medium">
                              {event.heatStress} DHW
                            </span>
                          </div>
                        )}
                        {coralBleachingMonitor.showSeaTemp && (
                          <div>
                            SST:{' '}
                            <span className="text-foreground font-medium">
                              {event.seaSurfaceTemp}°C
                            </span>
                          </div>
                        )}
                        {coralBleachingMonitor.showRecoveryPotential && (
                          <div>
                            Recovery:{' '}
                            <span className="text-foreground font-medium">
                              {RECOVERY_CONFIG[event.recoveryPotential].label}
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
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-semibold">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${RECOVERY_CONFIG[activeEvent.recoveryPotential].bgClass}`}
                  >
                    {RECOVERY_CONFIG[activeEvent.recoveryPotential].label}
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
                    <span className="text-muted-foreground">Reef Type: </span>
                    <span className="font-medium">{REEF_TYPE_LABELS[activeEvent.reefType]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bleaching: </span>
                    <span className="font-medium">{activeEvent.bleachingPercent}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SST: </span>
                    <span className="font-medium">{activeEvent.seaSurfaceTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Heat Stress: </span>
                    <span className="font-medium">{activeEvent.heatStress} DHW</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Surveyed: </span>
                    <span className="font-medium">{activeEvent.lastSurveyed}</span>
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
