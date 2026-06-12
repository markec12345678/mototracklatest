'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type AcidRainStation, type AcidRainState } from '@/lib/map-store'
import { CloudRain, X, Droplets, TrendingDown, Filter, MapPin } from 'lucide-react'

const SAMPLE_STATIONS: AcidRainStation[] = [
  {
    id: 'ar-1',
    name: 'Black Forest, Germany',
    latitude: 48.25,
    longitude: 8.15,
    precipPH: 4.2,
    sulfateConc: 7.8,
    nitrateConc: 5.4,
    ammoniumConc: 2.1,
    severity: 'severe',
    trend: 'improving',
  },
  {
    id: 'ar-2',
    name: 'Sudbury, Canada',
    latitude: 46.49,
    longitude: -81.0,
    precipPH: 4.5,
    sulfateConc: 6.2,
    nitrateConc: 4.1,
    ammoniumConc: 1.8,
    severity: 'moderate',
    trend: 'improving',
  },
  {
    id: 'ar-3',
    name: 'Polish Silesia',
    latitude: 50.3,
    longitude: 19.0,
    precipPH: 4.1,
    sulfateConc: 9.3,
    nitrateConc: 6.8,
    ammoniumConc: 3.4,
    severity: 'severe',
    trend: 'worsening',
  },
  {
    id: 'ar-4',
    name: 'Czech NW Basin',
    latitude: 50.55,
    longitude: 13.2,
    precipPH: 4.4,
    sulfateConc: 5.9,
    nitrateConc: 4.6,
    ammoniumConc: 2.3,
    severity: 'moderate',
    trend: 'stable',
  },
  {
    id: 'ar-5',
    name: 'Chongqing, China',
    latitude: 29.56,
    longitude: 106.55,
    precipPH: 3.9,
    sulfateConc: 12.5,
    nitrateConc: 7.2,
    ammoniumConc: 5.1,
    severity: 'severe',
    trend: 'worsening',
  },
  {
    id: 'ar-6',
    name: 'Southern Norway',
    latitude: 60.2,
    longitude: 8.7,
    precipPH: 4.7,
    sulfateConc: 3.8,
    nitrateConc: 3.2,
    ammoniumConc: 1.2,
    severity: 'mild',
    trend: 'improving',
  },
]

const SEVERITY_CONFIG: Record<
  AcidRainStation['severity'],
  { bg: string; text: string; border: string; dot: string }
> = {
  normal: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
    dot: 'bg-green-500',
  },
  mild: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    dot: 'bg-yellow-500',
  },
  moderate: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
  },
  severe: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-500',
  },
}

const TREND_CONFIG: Record<
  AcidRainStation['trend'],
  { bg: string; text: string; border: string }
> = {
  improving: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
  },
  stable: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
  },
  worsening: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
  },
}

export default function AcidRainTracker() {
  const acidRain = useMapStore((s) => s.acidRain)
  const setAcidRain = useMapStore((s) => s.setAcidRain)

  const stations = useMemo(() => {
    const source = acidRain.stations.length > 0 ? acidRain.stations : SAMPLE_STATIONS
    return source
  }, [acidRain.stations])

  const filteredStations = useMemo(() => {
    let result = stations
    if (acidRain.severityFilter !== 'all') {
      result = result.filter((s) => s.severity === acidRain.severityFilter)
    }
    return result
  }, [stations, acidRain.severityFilter])

  const selectedStation = useMemo(() => {
    if (!acidRain.activeStationId) return null
    return stations.find((s) => s.id === acidRain.activeStationId) ?? null
  }, [stations, acidRain.activeStationId])

  const summary = useMemo(() => {
    const avgPH =
      stations.length > 0
        ? stations.reduce((sum, s) => sum + s.precipPH, 0) / stations.length
        : 0
    const severeCount = stations.filter(
      (s) => s.severity === 'severe' || s.severity === 'moderate'
    ).length
    const worseningCount = stations.filter((s) => s.trend === 'worsening').length
    return { avgPH, severeCount, worseningCount }
  }, [stations])

  if (!acidRain.open) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-[420px] max-h-[calc(100vh-2rem)] overflow-hidden">
      <Card className="shadow-2xl border-border/60 backdrop-blur-sm bg-background/95">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Acid Rain Tracker</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setAcidRain({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Avg pH</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {summary.avgPH.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Severe</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {summary.severeCount}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Worsening</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {summary.worseningCount}
              </p>
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Display Options
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="ar-show-ph"
                  checked={acidRain.showPH}
                  onCheckedChange={(v) => setAcidRain({ showPH: v })}
                />
                <Label htmlFor="ar-show-ph" className="text-xs cursor-pointer">
                  Precip pH
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="ar-show-sulfate"
                  checked={acidRain.showSulfate}
                  onCheckedChange={(v) => setAcidRain({ showSulfate: v })}
                />
                <Label htmlFor="ar-show-sulfate" className="text-xs cursor-pointer">
                  Sulfate
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="ar-show-severity"
                  checked={acidRain.showSeverity}
                  onCheckedChange={(v) => setAcidRain({ showSeverity: v })}
                />
                <Label htmlFor="ar-show-severity" className="text-xs cursor-pointer">
                  Severity
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="ar-show-trend"
                  checked={acidRain.showTrend}
                  onCheckedChange={(v) => setAcidRain({ showTrend: v })}
                />
                <Label htmlFor="ar-show-trend" className="text-xs cursor-pointer">
                  Trend
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Severity Filter */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Filter by Severity
              </p>
            </div>
            <Select
              value={acidRain.severityFilter}
              onValueChange={(v) =>
                setAcidRain({
                  severityFilter: v as AcidRainState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Monitoring Stations ({filteredStations.length})
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {filteredStations.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No stations match the current filter.
                </p>
              )}
              {filteredStations.map((station) => {
                const sc = SEVERITY_CONFIG[station.severity]
                const tc = TREND_CONFIG[station.trend]
                const isSelected = acidRain.activeStationId === station.id
                return (
                  <button
                    key={station.id}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                    onClick={() =>
                      setAcidRain({
                        activeStationId: isSelected ? null : station.id,
                      })
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${sc.dot}`} />
                        <span className="text-sm font-medium truncate">{station.name}</span>
                      </div>
                      {acidRain.showSeverity && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}
                        >
                          {station.severity}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {acidRain.showPH && (
                        <span className="flex items-center gap-0.5">
                          <Droplets className="h-3 w-3" />
                          pH {station.precipPH.toFixed(1)}
                        </span>
                      )}
                      {acidRain.showSulfate && (
                        <span className="flex items-center gap-0.5">
                          {station.sulfateConc.toFixed(1)} mg/L SO₄
                        </span>
                      )}
                      <span>{station.nitrateConc.toFixed(1)} mg/L NO₃</span>
                      <span>{station.ammoniumConc.toFixed(1)} mg/L NH₄</span>
                      {acidRain.showTrend && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1 py-0 ${tc.bg} ${tc.text} ${tc.border}`}
                        >
                          {station.trend === 'worsening' && (
                            <TrendingDown className="h-2.5 w-2.5 mr-0.5 rotate-180" />
                          )}
                          {station.trend}
                        </Badge>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Station Details */}
          {selectedStation && (
            <>
              <Separator />
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">{selectedStation.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Precip pH
                    </p>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {selectedStation.precipPH.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Severity
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-0.5 ${SEVERITY_CONFIG[selectedStation.severity].bg} ${SEVERITY_CONFIG[selectedStation.severity].text} ${SEVERITY_CONFIG[selectedStation.severity].border}`}
                    >
                      {selectedStation.severity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Sulfate
                    </p>
                    <p className="text-sm font-medium">
                      {selectedStation.sulfateConc.toFixed(1)} mg/L
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Nitrate
                    </p>
                    <p className="text-sm font-medium">
                      {selectedStation.nitrateConc.toFixed(1)} mg/L
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Ammonium
                    </p>
                    <p className="text-sm font-medium">
                      {selectedStation.ammoniumConc.toFixed(1)} mg/L
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Trend
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-0.5 ${TREND_CONFIG[selectedStation.trend].bg} ${TREND_CONFIG[selectedStation.trend].text} ${TREND_CONFIG[selectedStation.trend].border}`}
                    >
                      {selectedStation.trend === 'worsening' && (
                        <TrendingDown className="h-3 w-3 mr-1 rotate-180" />
                      )}
                      {selectedStation.trend}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Coordinates
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedStation.latitude.toFixed(2)}°,{' '}
                    {selectedStation.longitude.toFixed(2)}°
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
