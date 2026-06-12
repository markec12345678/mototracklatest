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
import { useMapStore, type TsunamiBuoyState, type TsunamiBuoy } from '@/lib/map-store'
import { Anchor, X, Waves, Activity, AlertTriangle, Filter, MapPin, Gauge } from 'lucide-react'

const DEMO_BUOYS: TsunamiBuoy[] = [
  {
    id: 'tb-dart51407',
    name: 'DART 51407 Pacific',
    latitude: 19.62,
    longitude: -156.47,
    waterHeight: 2.1,
    pressure: 3500,
    wavePeriod: 12,
    status: 'normal',
    detectionType: 'dart',
    lastReading: '2025-03-04T08:30:00Z',
  },
  {
    id: 'tb-dart23401',
    name: 'DART 23401 Atlantic',
    latitude: 14.58,
    longitude: -49.93,
    waterHeight: 5.8,
    pressure: 3820,
    wavePeriod: 18,
    status: 'advisory',
    detectionType: 'dart',
    lastReading: '2025-03-04T07:45:00Z',
  },
  {
    id: 'tb-dart52402',
    name: 'DART 52402 Indian',
    latitude: -7.48,
    longitude: 72.63,
    waterHeight: 1.4,
    pressure: 3450,
    wavePeriod: 10,
    status: 'normal',
    detectionType: 'dart',
    lastReading: '2025-03-04T09:15:00Z',
  },
  {
    id: 'tb-coastal-jp',
    name: 'Coastal Japan',
    latitude: 38.27,
    longitude: 141.57,
    waterHeight: 12.3,
    pressure: 4100,
    wavePeriod: 22,
    status: 'warning',
    detectionType: 'coastal',
    lastReading: '2025-03-04T06:00:00Z',
  },
  {
    id: 'tb-tide-chile',
    name: 'Tide Gauge Chile',
    latitude: -33.45,
    longitude: -71.62,
    waterHeight: 3.7,
    pressure: 3680,
    wavePeriod: 14,
    status: 'watch',
    detectionType: 'tide_gauge',
    lastReading: '2025-03-04T10:00:00Z',
  },
  {
    id: 'tb-dart51406',
    name: 'DART 51406 Alaska',
    latitude: 53.49,
    longitude: -157.37,
    waterHeight: 4.2,
    pressure: 3750,
    wavePeriod: 16,
    status: 'advisory',
    detectionType: 'dart',
    lastReading: '2025-03-04T07:20:00Z',
  },
]

const STATUS_CONFIG: Record<
  TsunamiBuoy['status'],
  { label: string; color: string; bgClass: string }
> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  watch: { label: 'Watch', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  advisory: { label: 'Advisory', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  warning: { label: 'Warning', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function TsunamiBuoyTracker() {
  const tsunamiBuoy = useMapStore((s) => s.tsunamiBuoy)
  const setTsunamiBuoy = useMapStore((s) => s.setTsunamiBuoy)

  const buoys = useMemo(
    () => (tsunamiBuoy.buoys.length > 0 ? tsunamiBuoy.buoys : DEMO_BUOYS),
    [tsunamiBuoy.buoys]
  )

  const filteredBuoys = useMemo(() => {
    return buoys.filter((b) => {
      if (tsunamiBuoy.statusFilter !== 'all' && b.status !== tsunamiBuoy.statusFilter) return false
      return true
    })
  }, [buoys, tsunamiBuoy.statusFilter])

  const summary = useMemo(() => {
    if (filteredBuoys.length === 0) {
      return { maxWaterHeight: 0, alertCount: 0, totalBuoys: 0 }
    }
    const maxWaterHeight = Math.max(...filteredBuoys.map((b) => b.waterHeight))
    const alertCount = filteredBuoys.filter(
      (b) => b.status === 'advisory' || b.status === 'warning'
    ).length
    const totalBuoys = filteredBuoys.length
    return { maxWaterHeight: Math.round(maxWaterHeight * 10) / 10, alertCount, totalBuoys }
  }, [filteredBuoys])

  const activeBuoy = useMemo(
    () => buoys.find((b) => b.id === tsunamiBuoy.activeBuoyId) ?? null,
    [buoys, tsunamiBuoy.activeBuoyId]
  )

  if (typeof window === 'undefined') return null
  if (!tsunamiBuoy.open) return null

  const overlayToggles: { key: keyof TsunamiBuoyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterHeight', label: 'Water Height', icon: Waves },
    { key: 'showPressure', label: 'Pressure', icon: Gauge },
    { key: 'showWavePeriod', label: 'Wave Period', icon: Activity },
    { key: 'showStatus', label: 'Status', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Anchor className="h-4 w-4 text-red-500" />
              Tsunami Buoy Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setTsunamiBuoy({ open: false })}
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
              Status Level
            </Label>
            <Select
              value={tsunamiBuoy.statusFilter}
              onValueChange={(v) =>
                setTsunamiBuoy({
                  statusFilter: v as TsunamiBuoyState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="watch">Watch</SelectItem>
                <SelectItem value="advisory">Advisory</SelectItem>
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
                  <Icon className="h-3 w-3 text-red-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={tsunamiBuoy[key] as boolean}
                  onCheckedChange={(checked) => setTsunamiBuoy({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Water Height</div>
              <div className="text-sm font-semibold text-red-500">{summary.maxWaterHeight}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Adv/Warning</div>
              <div className="text-sm font-semibold text-yellow-500">{summary.alertCount}</div>
              <div className="text-[9px] text-muted-foreground">buoys</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Buoys</div>
              <div className="text-sm font-semibold">{summary.totalBuoys}</div>
              <div className="text-[9px] text-muted-foreground">active</div>
            </div>
          </div>

          <Separator />

          {/* Buoy List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Monitoring Buoys ({filteredBuoys.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredBuoys.map((buoy) => {
                  const isActive = tsunamiBuoy.activeBuoyId === buoy.id
                  const statusCfg = STATUS_CONFIG[buoy.status]
                  return (
                    <div
                      key={buoy.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-border/40 hover:border-red-500/20 hover:bg-red-500/5'
                      }`}
                      onClick={() =>
                        setTsunamiBuoy({
                          activeBuoyId: isActive ? null : buoy.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium">{buoy.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {tsunamiBuoy.showWaterHeight && (
                          <div>
                            Height:{' '}
                            <span className="text-foreground font-medium">
                              {buoy.waterHeight} m
                            </span>
                          </div>
                        )}
                        {tsunamiBuoy.showPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-foreground font-medium">
                              {buoy.pressure} dbar
                            </span>
                          </div>
                        )}
                        {tsunamiBuoy.showWavePeriod && (
                          <div>
                            Period:{' '}
                            <span className="text-foreground font-medium">
                              {buoy.wavePeriod} s
                            </span>
                          </div>
                        )}
                        {tsunamiBuoy.showStatus && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {buoy.detectionType}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredBuoys.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No buoys match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Buoy Details */}
          {activeBuoy && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs font-semibold">{activeBuoy.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeBuoy.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeBuoy.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeBuoy.latitude.toFixed(2)}, {activeBuoy.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Height: </span>
                    <span className="font-medium">{activeBuoy.waterHeight} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pressure: </span>
                    <span className="font-medium">{activeBuoy.pressure} dbar</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wave Period: </span>
                    <span className="font-medium">{activeBuoy.wavePeriod} s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Detection: </span>
                    <span className="font-medium">{activeBuoy.detectionType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Reading: </span>
                    <span className="font-medium">
                      {new Date(activeBuoy.lastReading).toLocaleString()}
                    </span>
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
