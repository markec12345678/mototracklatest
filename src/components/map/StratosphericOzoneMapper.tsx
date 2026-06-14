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
import { useMapStore, type StratosphericOzoneState, type OzoneMeasurement } from '@/lib/map-store'
import { Shield as ShieldIcon2, X, Gauge, TrendingDown, Sun, Eye, MapPin, Filter } from 'lucide-react'

const DEMO_MEASUREMENTS: OzoneMeasurement[] = [
  {
    id: 'oz-antarctica',
    name: 'Antarctica - Halley Bay',
    latitude: -75.52,
    longitude: -26.65,
    ozoneColumnDU: 185,
    ozoneProfile: 42,
    temperature: -78,
    altitudeRange: '15-25 km',
    trendPercent: -4.2,
    recoveryRate: 1.1,
    uvIndex: 8.5,
    status: 'depleted',
  },
  {
    id: 'oz-arctic',
    name: 'Arctic - Svalbard',
    latitude: 78.23,
    longitude: 15.63,
    ozoneColumnDU: 310,
    ozoneProfile: 58,
    temperature: -62,
    altitudeRange: '14-23 km',
    trendPercent: -1.8,
    recoveryRate: 2.3,
    uvIndex: 3.2,
    status: 'recovering',
  },
  {
    id: 'oz-midlat-n',
    name: 'Mid-Latitudes North - Arosa',
    latitude: 46.77,
    longitude: 9.68,
    ozoneColumnDU: 345,
    ozoneProfile: 72,
    temperature: -54,
    altitudeRange: '13-22 km',
    trendPercent: 0.3,
    recoveryRate: 1.8,
    uvIndex: 5.4,
    status: 'normal',
  },
  {
    id: 'oz-tropics',
    name: 'Tropics - Nairobi',
    latitude: -1.29,
    longitude: 36.82,
    ozoneColumnDU: 265,
    ozoneProfile: 55,
    temperature: -48,
    altitudeRange: '16-28 km',
    trendPercent: -0.5,
    recoveryRate: 0.4,
    uvIndex: 11.2,
    status: 'normal',
  },
  {
    id: 'oz-syowa',
    name: 'Antarctica - Syowa Station',
    latitude: -69.01,
    longitude: 39.59,
    ozoneColumnDU: 125,
    ozoneProfile: 28,
    temperature: -82,
    altitudeRange: '14-24 km',
    trendPercent: -8.5,
    recoveryRate: 0.3,
    uvIndex: 12.8,
    status: 'severely_depleted',
  },
  {
    id: 'oz-kerguelen',
    name: 'Kerguelen Islands',
    latitude: -49.35,
    longitude: 70.22,
    ozoneColumnDU: 380,
    ozoneProfile: 80,
    temperature: -45,
    altitudeRange: '12-21 km',
    trendPercent: 1.2,
    recoveryRate: 3.1,
    uvIndex: 4.8,
    status: 'enhanced',
  },
]

const STATUS_CONFIG: Record<
  OzoneMeasurement['status'],
  { label: string; color: string; bgClass: string }
> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  depleted: { label: 'Depleted', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severely_depleted: { label: 'Severely Depleted', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  recovering: { label: 'Recovering', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  enhanced: { label: 'Enhanced', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

export function StratosphericOzoneMapper() {
  const state = useMapStore((s) => s.stratosphericOzone)
  const setState = useMapStore((s) => s.setStratosphericOzone)

  const measurements = useMemo(
    () => (state.measurements.length > 0 ? state.measurements : DEMO_MEASUREMENTS),
    [state.measurements]
  )

  const filteredMeasurements = useMemo(() => {
    return measurements.filter((m) => {
      if (state.statusFilter !== 'all' && m.status !== state.statusFilter) return false
      return true
    })
  }, [measurements, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredMeasurements.length === 0) {
      return { avgOzoneColumn: 0, avgUVIndex: 0, depletedCount: 0 }
    }
    const avgOzoneColumn = filteredMeasurements.reduce((sum, m) => sum + m.ozoneColumnDU, 0) / filteredMeasurements.length
    const avgUVIndex = filteredMeasurements.reduce((sum, m) => sum + m.uvIndex, 0) / filteredMeasurements.length
    const depletedCount = filteredMeasurements.filter(
      (m) => m.status === 'depleted' || m.status === 'severely_depleted'
    ).length
    return {
      avgOzoneColumn: Math.round(avgOzoneColumn),
      avgUVIndex: Math.round(avgUVIndex * 10) / 10,
      depletedCount,
    }
  }, [filteredMeasurements])

  const activeMeasurement = useMemo(
    () => measurements.find((m) => m.id === state.activeMeasurementId) ?? null,
    [measurements, state.activeMeasurementId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof StratosphericOzoneState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOzoneColumn', label: 'Ozone Column', icon: Gauge },
    { key: 'showTrend', label: 'Trend', icon: TrendingDown },
    { key: 'showUVIndex', label: 'UV Index', icon: Sun },
    { key: 'showStatus', label: 'Status', icon: Eye },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldIcon2 className="h-4 w-4 text-cyan-600" />
              Stratospheric Ozone Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setState({ open: false })}
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
              Ozone Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({
                  statusFilter: v as StratosphericOzoneState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
                <SelectItem value="severely_depleted">Severely Depleted</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
                <SelectItem value="enhanced">Enhanced</SelectItem>
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
                  <Icon className="h-3 w-3 text-cyan-600" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Ozone</div>
              <div className="text-sm font-semibold">{summary.avgOzoneColumn}</div>
              <div className="text-[9px] text-muted-foreground">DU</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg UV Index</div>
              <div className="text-sm font-semibold text-cyan-600">{summary.avgUVIndex}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Depleted</div>
              <div className="text-sm font-semibold text-red-600">{summary.depletedCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
          </div>

          <Separator />

          {/* Measurement List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Ozone Stations ({filteredMeasurements.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredMeasurements.map((m) => {
                  const isActive = state.activeMeasurementId === m.id
                  const statusCfg = STATUS_CONFIG[m.status]
                  return (
                    <div
                      key={m.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeMeasurementId: isActive ? null : m.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium">{m.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showOzoneColumn && (
                          <div>
                            Ozone:{' '}
                            <span className="text-foreground font-medium">
                              {m.ozoneColumnDU} DU
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Trend:{' '}
                            <span className={`font-medium ${m.trendPercent < 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {m.trendPercent > 0 ? '+' : ''}{m.trendPercent}%
                            </span>
                          </div>
                        )}
                        {state.showUVIndex && (
                          <div>
                            UV Index:{' '}
                            <span className="text-foreground font-medium">
                              {m.uvIndex}
                            </span>
                          </div>
                        )}
                        {state.showStatus && (
                          <div>
                            Recovery:{' '}
                            <span className="text-foreground font-medium">
                              {m.recoveryRate}%/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredMeasurements.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Measurement Details */}
          {activeMeasurement && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="text-xs font-semibold">{activeMeasurement.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeMeasurement.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeMeasurement.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeMeasurement.latitude.toFixed(2)}, {activeMeasurement.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ozone Column: </span>
                    <span className="font-medium">{activeMeasurement.ozoneColumnDU} DU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ozone Profile: </span>
                    <span className="font-medium">{activeMeasurement.ozoneProfile}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeMeasurement.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Altitude Range: </span>
                    <span className="font-medium">{activeMeasurement.altitudeRange}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trend: </span>
                    <span className={`font-medium ${activeMeasurement.trendPercent < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {activeMeasurement.trendPercent > 0 ? '+' : ''}{activeMeasurement.trendPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recovery Rate: </span>
                    <span className="font-medium">{activeMeasurement.recoveryRate}%/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">UV Index: </span>
                    <span className="font-medium">{activeMeasurement.uvIndex}</span>
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
