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
import { useMapStore, type MeteorShowerState, type MeteorShower } from '@/lib/map-store'
import { Sparkles as SparklesIcon3, X, MapPin, Gauge, Zap, Eye, Filter } from 'lucide-react'

const DEMO_SHOWERS: MeteorShower[] = [
  {
    id: 'ms-perseids',
    name: 'Perseids',
    latitude: 45.0,
    longitude: 15.0,
    radiantRA: 46.0,
    radiantDec: 58.0,
    peakRate: 110,
    speed: 59,
    activeFrom: 'Jul 17',
    activeTo: 'Aug 24',
    peakDate: 'Aug 12',
    parentBody: '109P/Swift-Tuttle',
    visibility: 'excellent',
  },
  {
    id: 'ms-geminids',
    name: 'Geminids',
    latitude: 35.0,
    longitude: -90.0,
    radiantRA: 112.0,
    radiantDec: 33.0,
    peakRate: 150,
    speed: 35,
    activeFrom: 'Dec 4',
    activeTo: 'Dec 20',
    peakDate: 'Dec 14',
    parentBody: '3200 Phaethon',
    visibility: 'excellent',
  },
  {
    id: 'ms-leonids',
    name: 'Leonids',
    latitude: 20.0,
    longitude: 45.0,
    radiantRA: 152.0,
    radiantDec: 22.0,
    peakRate: 15,
    speed: 71,
    activeFrom: 'Nov 6',
    activeTo: 'Nov 30',
    peakDate: 'Nov 17',
    parentBody: '55P/Tempel-Tuttle',
    visibility: 'good',
  },
  {
    id: 'ms-eta-aquariids',
    name: 'Eta Aquariids',
    latitude: -25.0,
    longitude: 135.0,
    radiantRA: 338.0,
    radiantDec: -1.0,
    peakRate: 50,
    speed: 66,
    activeFrom: 'Apr 19',
    activeTo: 'May 28',
    peakDate: 'May 6',
    parentBody: '1P/Halley',
    visibility: 'good',
  },
  {
    id: 'ms-orionids',
    name: 'Orionids',
    latitude: 40.0,
    longitude: -5.0,
    radiantRA: 95.0,
    radiantDec: 16.0,
    peakRate: 20,
    speed: 66,
    activeFrom: 'Oct 2',
    activeTo: 'Nov 7',
    peakDate: 'Oct 21',
    parentBody: '1P/Halley',
    visibility: 'fair',
  },
  {
    id: 'ms-quadrantids',
    name: 'Quadrantids',
    latitude: 55.0,
    longitude: 10.0,
    radiantRA: 230.0,
    radiantDec: 49.0,
    peakRate: 120,
    speed: 41,
    activeFrom: 'Dec 28',
    activeTo: 'Jan 12',
    peakDate: 'Jan 4',
    parentBody: '2003 EH1',
    visibility: 'poor',
  },
]

const VISIBILITY_CONFIG: Record<
  MeteorShower['visibility'],
  { label: string; color: string; bgClass: string }
> = {
  excellent: { label: 'Excellent', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  good: { label: 'Good', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  fair: { label: 'Fair', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  poor: { label: 'Poor', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
}

export function MeteorShowerTracker() {
  const meteorShower = useMapStore((s) => s.meteorShower)
  const setMeteorShower = useMapStore((s) => s.setMeteorShower)

  const showers = useMemo(
    () => (meteorShower.showers.length > 0 ? meteorShower.showers : DEMO_SHOWERS),
    [meteorShower.showers]
  )

  const filteredShowers = useMemo(() => {
    return showers.filter((s) => {
      if (meteorShower.visibilityFilter !== 'all' && s.visibility !== meteorShower.visibilityFilter) return false
      return true
    })
  }, [showers, meteorShower.visibilityFilter])

  const summary = useMemo(() => {
    if (filteredShowers.length === 0) {
      return { highestZHR: 0, avgSpeed: 0, excellentCount: 0 }
    }
    const highestZHR = Math.max(...filteredShowers.map((s) => s.peakRate))
    const avgSpeed =
      filteredShowers.reduce((sum, s) => sum + s.speed, 0) / filteredShowers.length
    const excellentCount = filteredShowers.filter((s) => s.visibility === 'excellent').length
    return {
      highestZHR,
      avgSpeed: Math.round(avgSpeed),
      excellentCount,
    }
  }, [filteredShowers])

  const activeShower = useMemo(
    () => showers.find((s) => s.id === meteorShower.activeShowerId) ?? null,
    [showers, meteorShower.activeShowerId]
  )

  if (typeof window === 'undefined') return null
  if (!meteorShower.open) return null

  const overlayToggles: { key: keyof MeteorShowerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPeakRate', label: 'Peak Rate', icon: Gauge },
    { key: 'showSpeed', label: 'Speed', icon: Zap },
    { key: 'showVisibility', label: 'Visibility', icon: Eye },
    { key: 'showParentBody', label: 'Parent Body', icon: SparklesIcon3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SparklesIcon3 className="h-4 w-4 text-amber-500" />
              Meteor Shower Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMeteorShower({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Visibility Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Visibility
            </Label>
            <Select
              value={meteorShower.visibilityFilter}
              onValueChange={(v) =>
                setMeteorShower({
                  visibilityFilter: v as MeteorShowerState['visibilityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={meteorShower[key] as boolean}
                  onCheckedChange={(checked) => setMeteorShower({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Highest ZHR</div>
              <div className="text-sm font-semibold text-amber-500">{summary.highestZHR}</div>
              <div className="text-[9px] text-muted-foreground">meteors/hr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Speed</div>
              <div className="text-sm font-semibold">{summary.avgSpeed}</div>
              <div className="text-[9px] text-muted-foreground">km/s</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Excellent</div>
              <div className="text-sm font-semibold text-green-500">{summary.excellentCount}</div>
              <div className="text-[9px] text-muted-foreground">showers</div>
            </div>
          </div>

          <Separator />

          {/* Shower List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Meteor Showers ({filteredShowers.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredShowers.map((shower) => {
                  const isActive = meteorShower.activeShowerId === shower.id
                  const visCfg = VISIBILITY_CONFIG[shower.visibility]
                  return (
                    <div
                      key={shower.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setMeteorShower({
                          activeShowerId: isActive ? null : shower.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: visCfg.color }}
                          />
                          <span className="text-xs font-medium">{shower.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${visCfg.bgClass}`}
                        >
                          {visCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {meteorShower.showPeakRate && (
                          <div>
                            ZHR:{' '}
                            <span className="text-foreground font-medium">
                              {shower.peakRate}
                            </span>
                          </div>
                        )}
                        {meteorShower.showSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-foreground font-medium">
                              {shower.speed} km/s
                            </span>
                          </div>
                        )}
                        {meteorShower.showVisibility && (
                          <div>
                            Visibility:{' '}
                            <span className="text-foreground font-medium">
                              {shower.visibility}
                            </span>
                          </div>
                        )}
                        {meteorShower.showParentBody && (
                          <div>
                            Parent:{' '}
                            <span className="text-foreground font-medium">
                              {shower.parentBody}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredShowers.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No showers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Shower Details */}
          {activeShower && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeShower.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${VISIBILITY_CONFIG[activeShower.visibility].bgClass}`}
                  >
                    {VISIBILITY_CONFIG[activeShower.visibility].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeShower.latitude.toFixed(2)}, {activeShower.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peak Rate: </span>
                    <span className="font-medium">{activeShower.peakRate} ZHR</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Speed: </span>
                    <span className="font-medium">{activeShower.speed} km/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peak Date: </span>
                    <span className="font-medium">{activeShower.peakDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active: </span>
                    <span className="font-medium">{activeShower.activeFrom} – {activeShower.activeTo}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Parent Body: </span>
                    <span className="font-medium">{activeShower.parentBody}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Radiant: </span>
                    <span className="font-medium">{activeShower.radiantRA}° / {activeShower.radiantDec}°</span>
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
