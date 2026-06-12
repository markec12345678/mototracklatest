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
import { useMapStore, type SpaceWeatherAlertState, type SpaceWeatherAlert } from '@/lib/map-store'
import { Sun as SunIcon2, X, AlertTriangle, Gauge, Radio, Satellite, Filter, MapPin } from 'lucide-react'

const DEMO_ALERTS: SpaceWeatherAlert[] = [
  {
    id: 'sw-xflare',
    name: 'X-Class Solar Flare',
    latitude: 15.2,
    longitude: -45.8,
    alertType: 'solar_flare',
    severity: 'extreme',
    kpIndex: 9,
    hfAbsorption: 85,
    gnssImpact: 'severe',
    startTime: '2025-03-04T10:15:00Z',
  },
  {
    id: 'sw-cme',
    name: 'CME Arrival',
    latitude: -8.5,
    longitude: 120.3,
    alertType: 'cme',
    severity: 'severe',
    kpIndex: 8,
    hfAbsorption: 72,
    gnssImpact: 'severe',
    startTime: '2025-03-04T08:45:00Z',
  },
  {
    id: 'sw-radstorm',
    name: 'Solar Radiation Storm',
    latitude: 22.1,
    longitude: -30.5,
    alertType: 'radiation_storm',
    severity: 'strong',
    kpIndex: 7,
    hfAbsorption: 55,
    gnssImpact: 'moderate',
    startTime: '2025-03-04T07:30:00Z',
  },
  {
    id: 'sw-geomag',
    name: 'Geomagnetic Storm',
    latitude: 55.8,
    longitude: -100.2,
    alertType: 'geomagnetic',
    severity: 'moderate',
    kpIndex: 5,
    hfAbsorption: 30,
    gnssImpact: 'minor',
    startTime: '2025-03-04T06:00:00Z',
  },
  {
    id: 'sw-mflare',
    name: 'M-Class Solar Flare',
    latitude: 10.4,
    longitude: 35.6,
    alertType: 'solar_flare',
    severity: 'minor',
    kpIndex: 3,
    hfAbsorption: 12,
    gnssImpact: 'none',
    startTime: '2025-03-04T04:20:00Z',
  },
  {
    id: 'sw-s1storm',
    name: 'S1 Radiation Storm',
    latitude: -25.3,
    longitude: 80.1,
    alertType: 'radiation_storm',
    severity: 'moderate',
    kpIndex: 4,
    hfAbsorption: 25,
    gnssImpact: 'minor',
    startTime: '2025-03-04T03:10:00Z',
  },
]

const SEVERITY_CONFIG: Record<
  SpaceWeatherAlert['severity'],
  { label: string; color: string; bgClass: string }
> = {
  minor: { label: 'Minor', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  strong: { label: 'Strong', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  extreme: { label: 'Extreme', color: '#8b5cf6', bgClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30' },
}

export function SpaceWeatherAlertPanel() {
  const spaceWeatherAlert = useMapStore((s) => s.spaceWeatherAlert)
  const setSpaceWeatherAlert = useMapStore((s) => s.setSpaceWeatherAlert)

  const alerts = useMemo(
    () => (spaceWeatherAlert.alerts.length > 0 ? spaceWeatherAlert.alerts : DEMO_ALERTS),
    [spaceWeatherAlert.alerts]
  )

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (spaceWeatherAlert.severityFilter !== 'all' && a.severity !== spaceWeatherAlert.severityFilter) return false
      return true
    })
  }, [alerts, spaceWeatherAlert.severityFilter])

  const summary = useMemo(() => {
    if (filteredAlerts.length === 0) {
      return { maxKpIndex: 0, severeExtremeCount: 0, activeAlertTypes: 0 }
    }
    const maxKpIndex = Math.max(...filteredAlerts.map((a) => a.kpIndex))
    const severeExtremeCount = filteredAlerts.filter(
      (a) => a.severity === 'severe' || a.severity === 'extreme'
    ).length
    const alertTypes = new Set(filteredAlerts.map((a) => a.alertType))
    return { maxKpIndex, severeExtremeCount, activeAlertTypes: alertTypes.size }
  }, [filteredAlerts])

  const activeAlert = useMemo(
    () => alerts.find((a) => a.id === spaceWeatherAlert.activeAlertId) ?? null,
    [alerts, spaceWeatherAlert.activeAlertId]
  )

  if (typeof window === 'undefined') return null
  if (!spaceWeatherAlert.open) return null

  const overlayToggles: { key: keyof SpaceWeatherAlertState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSeverity', label: 'Severity', icon: AlertTriangle },
    { key: 'showKpIndex', label: 'Kp Index', icon: Gauge },
    { key: 'showHfImpact', label: 'HF Impact', icon: Radio },
    { key: 'showGnssImpact', label: 'GNSS Impact', icon: Satellite },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SunIcon2 className="h-4 w-4 text-amber-500" />
              Space Weather Alerts
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSpaceWeatherAlert({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={spaceWeatherAlert.severityFilter}
              onValueChange={(v) =>
                setSpaceWeatherAlert({
                  severityFilter: v as SpaceWeatherAlertState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
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
                  checked={spaceWeatherAlert[key] as boolean}
                  onCheckedChange={(checked) => setSpaceWeatherAlert({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Kp Index</div>
              <div className="text-sm font-semibold text-amber-500">{summary.maxKpIndex}</div>
              <div className="text-[9px] text-muted-foreground">Kp</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Severe/Extreme</div>
              <div className="text-sm font-semibold text-red-500">{summary.severeExtremeCount}</div>
              <div className="text-[9px] text-muted-foreground">alerts</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Alert Types</div>
              <div className="text-sm font-semibold">{summary.activeAlertTypes}</div>
              <div className="text-[9px] text-muted-foreground">active</div>
            </div>
          </div>

          <Separator />

          {/* Alert List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Alerts ({filteredAlerts.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredAlerts.map((alert) => {
                  const isActive = spaceWeatherAlert.activeAlertId === alert.id
                  const sevCfg = SEVERITY_CONFIG[alert.severity]
                  return (
                    <div
                      key={alert.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setSpaceWeatherAlert({
                          activeAlertId: isActive ? null : alert.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: sevCfg.color }}
                          />
                          <span className="text-xs font-medium">{alert.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${sevCfg.bgClass}`}
                        >
                          {sevCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {spaceWeatherAlert.showSeverity && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {alert.alertType.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                        {spaceWeatherAlert.showKpIndex && (
                          <div>
                            Kp:{' '}
                            <span className="text-foreground font-medium">
                              {alert.kpIndex}
                            </span>
                          </div>
                        )}
                        {spaceWeatherAlert.showHfImpact && (
                          <div>
                            HF Abs:{' '}
                            <span className="text-foreground font-medium">
                              {alert.hfAbsorption}%
                            </span>
                          </div>
                        )}
                        {spaceWeatherAlert.showGnssImpact && (
                          <div>
                            GNSS:{' '}
                            <span className="text-foreground font-medium">
                              {alert.gnssImpact}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredAlerts.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No alerts match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Alert Details */}
          {activeAlert && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeAlert.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SEVERITY_CONFIG[activeAlert.severity].bgClass}`}
                  >
                    {SEVERITY_CONFIG[activeAlert.severity].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeAlert.latitude.toFixed(2)}, {activeAlert.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kp Index: </span>
                    <span className="font-medium">{activeAlert.kpIndex}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">HF Absorption: </span>
                    <span className="font-medium">{activeAlert.hfAbsorption}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GNSS Impact: </span>
                    <span className="font-medium">{activeAlert.gnssImpact}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Alert Type: </span>
                    <span className="font-medium">{activeAlert.alertType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Time: </span>
                    <span className="font-medium">
                      {new Date(activeAlert.startTime).toLocaleString()}
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
