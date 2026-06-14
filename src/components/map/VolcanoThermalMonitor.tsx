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
import { useMapStore, type VolcanoThermalState, type ThermalAnomaly } from '@/lib/map-store'
import { ThermometerSun, X, MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle, Filter } from 'lucide-react'

const DEMO_ANOMALIES: ThermalAnomaly[] = [
  {
    id: 'vt-etna',
    name: 'Mount Etna Thermal Anomaly',
    latitude: 37.75,
    longitude: 14.99,
    surfaceTemp: 485,
    backgroundTemp: 22,
    anomalyDelta: 463,
    area: 2.8,
    volcanoName: 'Mount Etna',
    alertLevel: 'warning',
    trendDirection: 'increasing',
    detectionMethod: 'combined',
  },
  {
    id: 'vt-kilauea',
    name: 'Kīlauea Summit Anomaly',
    latitude: 19.42,
    longitude: -155.29,
    surfaceTemp: 312,
    backgroundTemp: 25,
    anomalyDelta: 287,
    area: 1.5,
    volcanoName: 'Kīlauea',
    alertLevel: 'watch',
    trendDirection: 'increasing',
    detectionMethod: 'satellite',
  },
  {
    id: 'vt-fuji',
    name: 'Fuji Thermal Anomaly',
    latitude: 35.36,
    longitude: 138.73,
    surfaceTemp: 48,
    backgroundTemp: 15,
    anomalyDelta: 33,
    area: 0.3,
    volcanoName: 'Mount Fuji',
    alertLevel: 'normal',
    trendDirection: 'stable',
    detectionMethod: 'ground',
  },
  {
    id: 'vt-popocatepetl',
    name: 'Popocatépetl Dome Anomaly',
    latitude: 19.02,
    longitude: -98.62,
    surfaceTemp: 395,
    backgroundTemp: 18,
    anomalyDelta: 377,
    area: 1.8,
    volcanoName: 'Popocatépetl',
    alertLevel: 'advisory',
    trendDirection: 'increasing',
    detectionMethod: 'aerial',
  },
  {
    id: 'vt-eyjafjallajokull',
    name: 'Eyjafjallajökull Anomaly',
    latitude: 63.63,
    longitude: -19.62,
    surfaceTemp: 85,
    backgroundTemp: 5,
    anomalyDelta: 80,
    area: 0.6,
    volcanoName: 'Eyjafjallajökull',
    alertLevel: 'advisory',
    trendDirection: 'decreasing',
    detectionMethod: 'satellite',
  },
  {
    id: 'vt-vesuvius',
    name: 'Vesuvius Fumarole Anomaly',
    latitude: 40.82,
    longitude: 14.43,
    surfaceTemp: 72,
    backgroundTemp: 20,
    anomalyDelta: 52,
    area: 0.4,
    volcanoName: 'Mount Vesuvius',
    alertLevel: 'normal',
    trendDirection: 'stable',
    detectionMethod: 'ground',
  },
]

const ALERT_CONFIG: Record<
  ThermalAnomaly['alertLevel'],
  { label: string; color: string; bgClass: string }
> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  advisory: { label: 'Advisory', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  watch: { label: 'Watch', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  warning: { label: 'Warning', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TREND_CONFIG: Record<
  ThermalAnomaly['trendDirection'],
  { label: string; color: string; bgClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  increasing: { label: 'Increasing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30', icon: TrendingUp },
  stable: { label: 'Stable', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: Minus },
  decreasing: { label: 'Decreasing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30', icon: TrendingDown },
}

export function VolcanoThermalMonitor() {
  const volcanoThermal = useMapStore((s) => s.volcanoThermal)
  const setVolcanoThermal = useMapStore((s) => s.setVolcanoThermal)

  const anomalies = useMemo(
    () => (volcanoThermal.anomalies.length > 0 ? volcanoThermal.anomalies : DEMO_ANOMALIES),
    [volcanoThermal.anomalies]
  )

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((a) => {
      if (volcanoThermal.alertFilter !== 'all' && a.alertLevel !== volcanoThermal.alertFilter) return false
      return true
    })
  }, [anomalies, volcanoThermal.alertFilter])

  const summary = useMemo(() => {
    if (filteredAnomalies.length === 0) {
      return { maxAnomalyDelta: 0, advisoryPlusCount: 0, increasingCount: 0 }
    }
    const maxAnomalyDelta = Math.max(...filteredAnomalies.map((a) => a.anomalyDelta))
    const advisoryPlusCount = filteredAnomalies.filter(
      (a) => a.alertLevel === 'advisory' || a.alertLevel === 'watch' || a.alertLevel === 'warning'
    ).length
    const increasingCount = filteredAnomalies.filter((a) => a.trendDirection === 'increasing').length
    return {
      maxAnomalyDelta,
      advisoryPlusCount,
      increasingCount,
    }
  }, [filteredAnomalies])

  const activeAnomaly = useMemo(
    () => anomalies.find((a) => a.id === volcanoThermal.activeAnomalyId) ?? null,
    [anomalies, volcanoThermal.activeAnomalyId]
  )

  if (typeof window === 'undefined') return null
  if (!volcanoThermal.open) return null

  const overlayToggles: { key: keyof VolcanoThermalState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSurfaceTemp', label: 'Surface Temp', icon: ThermometerSun },
    { key: 'showAnomalyDelta', label: 'Anomaly Delta', icon: AlertTriangle },
    { key: 'showAlertLevel', label: 'Alert Level', icon: AlertTriangle },
    { key: 'showTrend', label: 'Trend', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ThermometerSun className="h-4 w-4 text-red-500" />
              Volcano Thermal Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setVolcanoThermal({ open: false })}
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
              value={volcanoThermal.alertFilter}
              onValueChange={(v) =>
                setVolcanoThermal({
                  alertFilter: v as VolcanoThermalState['alertFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
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
                  <Icon className="h-3 w-3 text-red-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={volcanoThermal[key] as boolean}
                  onCheckedChange={(checked) => setVolcanoThermal({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Anomaly</div>
              <div className="text-sm font-semibold text-red-500">{summary.maxAnomalyDelta}</div>
              <div className="text-[9px] text-muted-foreground">°C delta</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Advisory+</div>
              <div className="text-sm font-semibold text-orange-500">{summary.advisoryPlusCount}</div>
              <div className="text-[9px] text-muted-foreground">anomalies</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Increasing</div>
              <div className="text-sm font-semibold text-red-500">{summary.increasingCount}</div>
              <div className="text-[9px] text-muted-foreground">trends</div>
            </div>
          </div>

          <Separator />

          {/* Anomaly List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Thermal Anomalies ({filteredAnomalies.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredAnomalies.map((anomaly) => {
                  const isActive = volcanoThermal.activeAnomalyId === anomaly.id
                  const alertCfg = ALERT_CONFIG[anomaly.alertLevel]
                  const trendCfg = TREND_CONFIG[anomaly.trendDirection]
                  const TrendIcon = trendCfg.icon
                  return (
                    <div
                      key={anomaly.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-border/40 hover:border-red-500/20 hover:bg-red-500/5'
                      }`}
                      onClick={() =>
                        setVolcanoThermal({
                          activeAnomalyId: isActive ? null : anomaly.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: alertCfg.color }}
                          />
                          <span className="text-xs font-medium">{anomaly.volcanoName}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${alertCfg.bgClass}`}
                        >
                          {alertCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {volcanoThermal.showSurfaceTemp && (
                          <div>
                            Surface:{' '}
                            <span className="text-foreground font-medium">
                              {anomaly.surfaceTemp}°C
                            </span>
                          </div>
                        )}
                        {volcanoThermal.showAnomalyDelta && (
                          <div>
                            Delta:{' '}
                            <span className="text-foreground font-medium">
                              +{anomaly.anomalyDelta}°C
                            </span>
                          </div>
                        )}
                        {volcanoThermal.showAlertLevel && (
                          <div>
                            Alert:{' '}
                            <span className="text-foreground font-medium">
                              {anomaly.alertLevel}
                            </span>
                          </div>
                        )}
                        {volcanoThermal.showTrend && (
                          <div className="flex items-center gap-1">
                            Trend:{' '}
                            <TrendIcon className="h-3 w-3" style={{ color: trendCfg.color }} />
                            <span className="text-foreground font-medium">
                              {trendCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredAnomalies.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No anomalies match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Anomaly Details */}
          {activeAnomaly && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs font-semibold">{activeAnomaly.volcanoName}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ALERT_CONFIG[activeAnomaly.alertLevel].bgClass}`}
                  >
                    {ALERT_CONFIG[activeAnomaly.alertLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeAnomaly.latitude.toFixed(2)}, {activeAnomaly.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Surface Temp: </span>
                    <span className="font-medium">{activeAnomaly.surfaceTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Background Temp: </span>
                    <span className="font-medium">{activeAnomaly.backgroundTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Anomaly Delta: </span>
                    <span className="font-medium text-red-500">+{activeAnomaly.anomalyDelta}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeAnomaly.area} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Alert Level: </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] h-4 px-1 ${ALERT_CONFIG[activeAnomaly.alertLevel].bgClass}`}
                    >
                      {ALERT_CONFIG[activeAnomaly.alertLevel].label}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trend: </span>
                    <div className="inline-flex items-center gap-1">
                      {(() => {
                        const tCfg = TREND_CONFIG[activeAnomaly.trendDirection]
                        const TIcon = tCfg.icon
                        return <TIcon className="h-3 w-3" style={{ color: tCfg.color }} />
                      })()}
                      <span className="font-medium">{TREND_CONFIG[activeAnomaly.trendDirection].label}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Detection: </span>
                    <span className="font-medium capitalize">{activeAnomaly.detectionMethod}</span>
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
