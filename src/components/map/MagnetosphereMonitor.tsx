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
import { useMapStore, type MagnetosphereState, type MagnetosphereReading } from '@/lib/map-store'
import { Magnet as MagnetIcon2, X, Activity, Wind, Gauge, Sparkles, MapPin, Filter } from 'lucide-react'

const DEMO_READINGS: MagnetosphereReading[] = [
  {
    id: 'mag-boulder',
    name: 'Boulder Observatory',
    latitude: 40.14,
    longitude: -105.24,
    bzComponent: -12.5,
    solarWindSpeed: 650,
    kpIndex: 7,
    dstIndex: -85,
    auroraProbability: 85,
    status: 'storm',
  },
  {
    id: 'mag-tromso',
    name: 'Tromsø Station',
    latitude: 69.65,
    longitude: 18.96,
    bzComponent: -18.3,
    solarWindSpeed: 780,
    kpIndex: 8,
    dstIndex: -120,
    auroraProbability: 95,
    status: 'severe_storm',
  },
  {
    id: 'mag-canberra',
    name: 'Canberra Station',
    latitude: -35.28,
    longitude: 149.13,
    bzComponent: 5.2,
    solarWindSpeed: 320,
    kpIndex: 2,
    dstIndex: -15,
    auroraProbability: 8,
    status: 'quiet',
  },
  {
    id: 'mag-hartland',
    name: 'Hartland Observatory',
    latitude: 50.99,
    longitude: -4.49,
    bzComponent: -6.8,
    solarWindSpeed: 480,
    kpIndex: 4,
    dstIndex: -35,
    auroraProbability: 35,
    status: 'unsettled',
  },
  {
    id: 'mag-kakioka',
    name: 'Kakioka Station',
    latitude: 36.23,
    longitude: 140.19,
    bzComponent: -9.1,
    solarWindSpeed: 550,
    kpIndex: 5,
    dstIndex: -50,
    auroraProbability: 55,
    status: 'active',
  },
  {
    id: 'mag-sanjuan',
    name: 'San Juan Observatory',
    latitude: 18.11,
    longitude: -66.15,
    bzComponent: 8.1,
    solarWindSpeed: 290,
    kpIndex: 1,
    dstIndex: -5,
    auroraProbability: 3,
    status: 'quiet',
  },
]

const STATUS_CONFIG: Record<
  MagnetosphereReading['status'],
  { label: string; color: string; bgClass: string }
> = {
  quiet: { label: 'Quiet', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  unsettled: { label: 'Unsettled', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  active: { label: 'Active', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  storm: { label: 'Storm', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe_storm: { label: 'Severe Storm', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function MagnetosphereMonitor() {
  const magnetosphere = useMapStore((s) => s.magnetosphere)
  const setMagnetosphere = useMapStore((s) => s.setMagnetosphere)

  const readings = useMemo(
    () => (magnetosphere.readings.length > 0 ? magnetosphere.readings : DEMO_READINGS),
    [magnetosphere.readings]
  )

  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      if (magnetosphere.statusFilter !== 'all' && r.status !== magnetosphere.statusFilter) return false
      return true
    })
  }, [readings, magnetosphere.statusFilter])

  const summary = useMemo(() => {
    if (filteredReadings.length === 0) {
      return { avgKpIndex: 0, stormCount: 0, maxAuroraProbability: 0 }
    }
    const avgKpIndex =
      filteredReadings.reduce((sum, r) => sum + r.kpIndex, 0) / filteredReadings.length
    const stormCount = filteredReadings.filter(
      (r) => r.status === 'storm' || r.status === 'severe_storm'
    ).length
    const maxAuroraProbability = Math.max(...filteredReadings.map((r) => r.auroraProbability))
    return { avgKpIndex: Math.round(avgKpIndex * 10) / 10, stormCount, maxAuroraProbability }
  }, [filteredReadings])

  const activeReading = useMemo(
    () => readings.find((r) => r.id === magnetosphere.activeReadingId) ?? null,
    [readings, magnetosphere.activeReadingId]
  )

  if (typeof window === 'undefined') return null
  if (!magnetosphere.open) return null

  const overlayToggles: { key: keyof MagnetosphereState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showBz', label: 'Activity', icon: Activity },
    { key: 'showSolarWind', label: 'Wind', icon: Wind },
    { key: 'showKp', label: 'Gauge', icon: Gauge },
    { key: 'showAurora', label: 'Sparkles', icon: Sparkles },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MagnetIcon2 className="h-4 w-4 text-violet-500" />
              Magnetosphere Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMagnetosphere({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={magnetosphere.statusFilter}
              onValueChange={(v) =>
                setMagnetosphere({
                  statusFilter: v as MagnetosphereState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="quiet">Quiet</SelectItem>
                <SelectItem value="unsettled">Unsettled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="storm">Storm</SelectItem>
                <SelectItem value="severe_storm">Severe Storm</SelectItem>
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
                  <Icon className="h-3 w-3 text-violet-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={magnetosphere[key] as boolean}
                  onCheckedChange={(checked) => setMagnetosphere({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Kp Index</div>
              <div className="text-sm font-semibold">{summary.avgKpIndex}</div>
              <div className="text-[9px] text-muted-foreground">Kp</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Storm Count</div>
              <div className="text-sm font-semibold text-red-500">{summary.stormCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Aurora</div>
              <div className="text-sm font-semibold text-orange-500">{summary.maxAuroraProbability}%</div>
              <div className="text-[9px] text-muted-foreground">probability</div>
            </div>
          </div>

          <Separator />

          {/* Reading List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Magnetosphere Readings ({filteredReadings.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredReadings.map((reading) => {
                  const isActive = magnetosphere.activeReadingId === reading.id
                  const statusCfg = STATUS_CONFIG[reading.status]
                  return (
                    <div
                      key={reading.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-500/5'
                          : 'border-border/40 hover:border-violet-500/20 hover:bg-violet-500/5'
                      }`}
                      onClick={() =>
                        setMagnetosphere({
                          activeReadingId: isActive ? null : reading.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium">{reading.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {magnetosphere.showBz && (
                          <div>
                            Bz:{' '}
                            <span className="text-foreground font-medium">
                              {reading.bzComponent} nT
                            </span>
                          </div>
                        )}
                        {magnetosphere.showSolarWind && (
                          <div>
                            Wind:{' '}
                            <span className="text-foreground font-medium">
                              {reading.solarWindSpeed} km/s
                            </span>
                          </div>
                        )}
                        {magnetosphere.showKp && (
                          <div>
                            Kp:{' '}
                            <span className="text-foreground font-medium">
                              {reading.kpIndex}
                            </span>
                          </div>
                        )}
                        {magnetosphere.showAurora && (
                          <div>
                            Aurora:{' '}
                            <span className="text-foreground font-medium">
                              {reading.auroraProbability}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredReadings.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No readings match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Reading Details */}
          {activeReading && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-500" />
                  <span className="text-xs font-semibold">{activeReading.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeReading.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeReading.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeReading.latitude.toFixed(2)}, {activeReading.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bz Component: </span>
                    <span className="font-medium">{activeReading.bzComponent} nT</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Solar Wind: </span>
                    <span className="font-medium">{activeReading.solarWindSpeed} km/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kp Index: </span>
                    <span className="font-medium">{activeReading.kpIndex}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dst Index: </span>
                    <span className="font-medium">{activeReading.dstIndex}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aurora Prob: </span>
                    <span className="font-medium">{activeReading.auroraProbability}%</span>
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
