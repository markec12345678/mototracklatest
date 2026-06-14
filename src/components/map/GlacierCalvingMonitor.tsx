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
import { useMapStore, type GlacierCalvingState, type GlacierCalvingEvent } from '@/lib/map-store'
import { MountainSnow, X, Waves as WavesIcon5, TrendingDown as TrendingDownIcon, ArrowDown as ArrowDownIcon, MapPin, Filter } from 'lucide-react'

const DEMO_EVENTS: GlacierCalvingEvent[] = [
  {
    id: 'gc-petermann',
    name: 'Petermann Glacier Calving',
    latitude: 80.75,
    longitude: -60.50,
    iceVolume: 280,
    eventSize: 'catastrophic',
    tsunamiRisk: 'high',
    glacierName: 'Petermann',
    glacierType: 'tidewater',
    retreatRate: 450,
    seaLevelContribution: 0.12,
    date: '2024-08-15',
  },
  {
    id: 'gc-jakobshavn',
    name: 'Jakobshavn Calving Event',
    latitude: 69.17,
    longitude: -49.90,
    iceVolume: 150,
    eventSize: 'large',
    tsunamiRisk: 'moderate',
    glacierName: 'Jakobshavn Isbræ',
    glacierType: 'tidewater',
    retreatRate: 620,
    seaLevelContribution: 0.08,
    date: '2024-07-22',
  },
  {
    id: 'gc-helheim',
    name: 'Helheim Glacier Break',
    latitude: 66.45,
    longitude: -38.20,
    iceVolume: 85,
    eventSize: 'medium',
    tsunamiRisk: 'low',
    glacierName: 'Helheim',
    glacierType: 'tidewater',
    retreatRate: 310,
    seaLevelContribution: 0.04,
    date: '2024-06-10',
  },
  {
    id: 'gc-eggvesen',
    name: 'Eggvesen Glacier Retreat',
    latitude: 61.40,
    longitude: 6.80,
    iceVolume: 30,
    eventSize: 'small',
    tsunamiRisk: 'none',
    glacierName: 'Eggvesen',
    glacierType: 'lake_calving',
    retreatRate: 85,
    seaLevelContribution: 0.01,
    date: '2024-09-01',
  },
  {
    id: 'gc-thwaites',
    name: 'Thwaites Ice Shelf Collapse',
    latitude: -75.50,
    longitude: -106.75,
    iceVolume: 420,
    eventSize: 'catastrophic',
    tsunamiRisk: 'moderate',
    glacierName: 'Thwaites',
    glacierType: 'polar',
    retreatRate: 780,
    seaLevelContribution: 0.18,
    date: '2024-05-30',
  },
  {
    id: 'gc-grey',
    name: 'Grey Glacier Calving',
    latitude: -50.95,
    longitude: -73.28,
    iceVolume: 55,
    eventSize: 'medium',
    tsunamiRisk: 'low',
    glacierName: 'Grey',
    glacierType: 'lake_calving',
    retreatRate: 120,
    seaLevelContribution: 0.02,
    date: '2024-04-18',
  },
]

const SIZE_CONFIG: Record<
  GlacierCalvingEvent['eventSize'],
  { label: string; color: string; bgClass: string }
> = {
  small: { label: 'Small', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  medium: { label: 'Medium', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  large: { label: 'Large', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  catastrophic: { label: 'Catastrophic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TSUNAMI_CONFIG: Record<
  GlacierCalvingEvent['tsunamiRisk'],
  { label: string; bgClass: string }
> = {
  none: { label: 'None', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  low: { label: 'Low', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function GlacierCalvingMonitor() {
  const glacierCalving = useMapStore((s) => s.glacierCalving)
  const setGlacierCalving = useMapStore((s) => s.setGlacierCalving)

  const events = useMemo(
    () => (glacierCalving.events.length > 0 ? glacierCalving.events : DEMO_EVENTS),
    [glacierCalving.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (glacierCalving.sizeFilter !== 'all' && e.eventSize !== glacierCalving.sizeFilter) return false
      return true
    })
  }, [events, glacierCalving.sizeFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { totalIceVolume: 0, avgRetreatRate: 0, totalSeaLevelContribution: 0 }
    }
    const totalIceVolume = filteredEvents.reduce((sum, e) => sum + e.iceVolume, 0)
    const avgRetreatRate =
      filteredEvents.reduce((sum, e) => sum + e.retreatRate, 0) / filteredEvents.length
    const totalSeaLevelContribution = filteredEvents.reduce((sum, e) => sum + e.seaLevelContribution, 0)
    return {
      totalIceVolume,
      avgRetreatRate: Math.round(avgRetreatRate),
      totalSeaLevelContribution: Math.round(totalSeaLevelContribution * 100) / 100,
    }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === glacierCalving.activeEventId) ?? null,
    [events, glacierCalving.activeEventId]
  )

  if (typeof window === 'undefined') return null
  if (!glacierCalving.open) return null

  const overlayToggles: { key: keyof GlacierCalvingState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showIceVolume', label: 'Ice Volume', icon: MountainSnow },
    { key: 'showTsunamiRisk', label: 'Tsunami Risk', icon: WavesIcon5 },
    { key: 'showRetreatRate', label: 'Retreat Rate', icon: TrendingDownIcon },
    { key: 'showSeaLevelContribution', label: 'Sea Level', icon: ArrowDownIcon },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MountainSnow className="h-4 w-4 text-cyan-500" />
              Glacier Calving Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGlacierCalving({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Size Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Event Size
            </Label>
            <Select
              value={glacierCalving.sizeFilter}
              onValueChange={(v) =>
                setGlacierCalving({
                  sizeFilter: v as GlacierCalvingState['sizeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="catastrophic">Catastrophic</SelectItem>
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
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={glacierCalving[key] as boolean}
                  onCheckedChange={(checked) => setGlacierCalving({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Ice Vol.</div>
              <div className="text-sm font-semibold">{summary.totalIceVolume}</div>
              <div className="text-[9px] text-muted-foreground">M m³</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Retreat</div>
              <div className="text-sm font-semibold text-cyan-500">{summary.avgRetreatRate}</div>
              <div className="text-[9px] text-muted-foreground">m/year</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Sea Level</div>
              <div className="text-sm font-semibold text-blue-500">{summary.totalSeaLevelContribution}</div>
              <div className="text-[9px] text-muted-foreground">mm</div>
            </div>
          </div>

          <Separator />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Calving Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = glacierCalving.activeEventId === event.id
                  const sizeCfg = SIZE_CONFIG[event.eventSize]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setGlacierCalving({
                          activeEventId: isActive ? null : event.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: sizeCfg.color }}
                          />
                          <span className="text-xs font-medium">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${sizeCfg.bgClass}`}
                        >
                          {sizeCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {glacierCalving.showIceVolume && (
                          <div>
                            Ice Vol:{' '}
                            <span className="text-foreground font-medium">
                              {event.iceVolume} M m³
                            </span>
                          </div>
                        )}
                        {glacierCalving.showTsunamiRisk && (
                          <div>
                            Tsunami:{' '}
                            <span className="text-foreground font-medium">
                              {TSUNAMI_CONFIG[event.tsunamiRisk].label}
                            </span>
                          </div>
                        )}
                        {glacierCalving.showRetreatRate && (
                          <div>
                            Retreat:{' '}
                            <span className="text-foreground font-medium">
                              {event.retreatRate} m/yr
                            </span>
                          </div>
                        )}
                        {glacierCalving.showSeaLevelContribution && (
                          <div>
                            Sea Level:{' '}
                            <span className="text-foreground font-medium">
                              {event.seaLevelContribution} mm
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
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SIZE_CONFIG[activeEvent.eventSize].bgClass}`}
                  >
                    {SIZE_CONFIG[activeEvent.eventSize].label}
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
                    <span className="text-muted-foreground">Date: </span>
                    <span className="font-medium">{activeEvent.date}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ice Volume: </span>
                    <span className="font-medium">{activeEvent.iceVolume} M m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Glacier: </span>
                    <span className="font-medium">{activeEvent.glacierName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Glacier Type: </span>
                    <span className="font-medium capitalize">{activeEvent.glacierType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retreat Rate: </span>
                    <span className="font-medium">{activeEvent.retreatRate} m/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sea Level: </span>
                    <span className="font-medium">{activeEvent.seaLevelContribution} mm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Tsunami Risk: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-4 ${TSUNAMI_CONFIG[activeEvent.tsunamiRisk].bgClass}`}
                    >
                      {TSUNAMI_CONFIG[activeEvent.tsunamiRisk].label}
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
