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
import { useMapStore, type RadiationExposureState, type RadiationStation } from '@/lib/map-store'
import { Shield, X, Activity, AlertTriangle, Filter, MapPin } from 'lucide-react'

const DEMO_STATIONS: RadiationStation[] = [
  {
    id: 're-fukushima',
    name: 'Fukushima Monitoring',
    latitude: 37.42,
    longitude: 141.03,
    doseRate: 3.8,
    gammaRate: 2.1,
    betaRate: 0.7,
    alertLevel: 'elevated',
    source: 'Cs-137, Cs-134',
    lastReading: '2025-03-04T08:30:00Z',
  },
  {
    id: 're-chernobyl',
    name: 'Chernobyl Zone',
    latitude: 51.39,
    longitude: 30.1,
    doseRate: 1.2,
    gammaRate: 0.9,
    betaRate: 0.3,
    alertLevel: 'normal',
    source: 'Cs-137, Sr-90',
    lastReading: '2025-03-04T07:45:00Z',
  },
  {
    id: 're-hanford',
    name: 'Hanford Site',
    latitude: 46.55,
    longitude: -119.49,
    doseRate: 8.5,
    gammaRate: 5.3,
    betaRate: 2.1,
    alertLevel: 'high',
    source: 'Tc-99, I-129',
    lastReading: '2025-03-04T09:15:00Z',
  },
  {
    id: 're-sellafield',
    name: 'Sellafield',
    latitude: 54.43,
    longitude: -3.5,
    doseRate: 0.9,
    gammaRate: 0.5,
    betaRate: 0.2,
    alertLevel: 'normal',
    source: 'Cs-137, Am-241',
    lastReading: '2025-03-04T06:00:00Z',
  },
  {
    id: 're-losalamos',
    name: 'Los Alamos',
    latitude: 35.88,
    longitude: -106.32,
    doseRate: 15.2,
    gammaRate: 9.8,
    betaRate: 4.3,
    alertLevel: 'critical',
    source: 'Pu-239, Am-241',
    lastReading: '2025-03-04T10:00:00Z',
  },
  {
    id: 're-mayak',
    name: 'Mayak',
    latitude: 55.72,
    longitude: 60.82,
    doseRate: 5.6,
    gammaRate: 3.2,
    betaRate: 1.8,
    alertLevel: 'elevated',
    source: 'Sr-90, Cs-137',
    lastReading: '2025-03-04T07:20:00Z',
  },
]

const ALERT_CONFIG: Record<
  RadiationStation['alertLevel'],
  { label: string; color: string; bgClass: string }
> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  elevated: { label: 'Elevated', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function RadiationExposureMonitor() {
  const radiationExposure = useMapStore((s) => s.radiationExposure)
  const setRadiationExposure = useMapStore((s) => s.setRadiationExposure)

  const stations = useMemo(
    () => (radiationExposure.stations.length > 0 ? radiationExposure.stations : DEMO_STATIONS),
    [radiationExposure.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (radiationExposure.alertFilter !== 'all' && s.alertLevel !== radiationExposure.alertFilter) return false
      return true
    })
  }, [stations, radiationExposure.alertFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgDoseRate: 0, criticalCount: 0, maxDose: 0 }
    }
    const avgDoseRate =
      filteredStations.reduce((sum, s) => sum + s.doseRate, 0) / filteredStations.length
    const criticalCount = filteredStations.filter(
      (s) => s.alertLevel === 'critical' || s.alertLevel === 'high'
    ).length
    const maxDose = Math.max(...filteredStations.map((s) => s.doseRate))
    return { avgDoseRate: Math.round(avgDoseRate * 10) / 10, criticalCount, maxDose }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === radiationExposure.activeStationId) ?? null,
    [stations, radiationExposure.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!radiationExposure.open) return null

  const overlayToggles: { key: keyof RadiationExposureState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDoseRate', label: 'Dose Rate', icon: Activity },
    { key: 'showGamma', label: 'Gamma', icon: Shield },
    { key: 'showBeta', label: 'Beta', icon: AlertTriangle },
    { key: 'showAlert', label: 'Alert Level', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              Radiation Exposure Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRadiationExposure({ open: false })}
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
              value={radiationExposure.alertFilter}
              onValueChange={(v) =>
                setRadiationExposure({
                  alertFilter: v as RadiationExposureState['alertFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
                  <Icon className="h-3 w-3 text-emerald-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={radiationExposure[key] as boolean}
                  onCheckedChange={(checked) => setRadiationExposure({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Dose Rate</div>
              <div className="text-sm font-semibold">{summary.avgDoseRate}</div>
              <div className="text-[9px] text-muted-foreground">μSv/h</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Critical/High</div>
              <div className="text-sm font-semibold text-red-500">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Dose</div>
              <div className="text-sm font-semibold text-orange-500">{summary.maxDose}</div>
              <div className="text-[9px] text-muted-foreground">μSv/h</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Monitoring Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = radiationExposure.activeStationId === station.id
                  const alertCfg = ALERT_CONFIG[station.alertLevel]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                      }`}
                      onClick={() =>
                        setRadiationExposure({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: alertCfg.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${alertCfg.bgClass}`}
                        >
                          {alertCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {radiationExposure.showDoseRate && (
                          <div>
                            Dose:{' '}
                            <span className="text-foreground font-medium">
                              {station.doseRate} μSv/h
                            </span>
                          </div>
                        )}
                        {radiationExposure.showGamma && (
                          <div>
                            Gamma:{' '}
                            <span className="text-foreground font-medium">
                              {station.gammaRate} μSv/h
                            </span>
                          </div>
                        )}
                        {radiationExposure.showBeta && (
                          <div>
                            Beta:{' '}
                            <span className="text-foreground font-medium">
                              {station.betaRate} μSv/h
                            </span>
                          </div>
                        )}
                        {radiationExposure.showAlert && (
                          <div>
                            Source:{' '}
                            <span className="text-foreground font-medium">
                              {station.source}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ALERT_CONFIG[activeStation.alertLevel].bgClass}`}
                  >
                    {ALERT_CONFIG[activeStation.alertLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeStation.latitude.toFixed(2)}, {activeStation.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dose Rate: </span>
                    <span className="font-medium">{activeStation.doseRate} μSv/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gamma Rate: </span>
                    <span className="font-medium">{activeStation.gammaRate} μSv/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Beta Rate: </span>
                    <span className="font-medium">{activeStation.betaRate} μSv/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source: </span>
                    <span className="font-medium">{activeStation.source}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Reading: </span>
                    <span className="font-medium">
                      {new Date(activeStation.lastReading).toLocaleString()}
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
