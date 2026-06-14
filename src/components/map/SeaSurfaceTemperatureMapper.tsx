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
import { useMapStore, type SeaSurfaceTemperatureState, type SSTMeasurement } from '@/lib/map-store'
import { Thermometer as ThermometerIcon3, X, Waves, TrendingUp, Droplets, AlertOctagon, MapPin, Filter } from 'lucide-react'

const DEMO_MEASUREMENTS: SSTMeasurement[] = [
  {
    id: 'sst-nino34',
    name: 'Nino 3.4 Pacific',
    latitude: 0.0,
    longitude: -170.0,
    temperature: 27.8,
    anomaly: 1.6,
    trend: 0.12,
    salinity: 34.8,
    chlorophyll: 0.08,
    region: 'tropical',
    status: 'hotspot',
  },
  {
    id: 'sst-northatlantic',
    name: 'North Atlantic',
    latitude: 45.0,
    longitude: -30.0,
    temperature: 22.4,
    anomaly: 2.1,
    trend: 0.18,
    salinity: 36.2,
    chlorophyll: 0.35,
    region: 'temperate',
    status: 'marine_heatwave',
  },
  {
    id: 'sst-indian',
    name: 'Indian Ocean',
    latitude: -10.0,
    longitude: 75.0,
    temperature: 29.2,
    anomaly: 0.8,
    trend: 0.06,
    salinity: 35.1,
    chlorophyll: 0.12,
    region: 'tropical',
    status: 'warming',
  },
  {
    id: 'sst-mediterranean',
    name: 'Mediterranean',
    latitude: 36.0,
    longitude: 18.0,
    temperature: 24.6,
    anomaly: 1.4,
    trend: 0.14,
    salinity: 38.5,
    chlorophyll: 0.22,
    region: 'subtropical',
    status: 'warming',
  },
  {
    id: 'sst-coralsea',
    name: 'Coral Sea',
    latitude: -18.0,
    longitude: 155.0,
    temperature: 28.5,
    anomaly: 0.5,
    trend: 0.04,
    salinity: 35.4,
    chlorophyll: 0.06,
    region: 'tropical',
    status: 'normal',
  },
  {
    id: 'sst-arctic',
    name: 'Arctic Ocean',
    latitude: 78.0,
    longitude: 15.0,
    temperature: 2.8,
    anomaly: -0.3,
    trend: -0.08,
    salinity: 33.2,
    chlorophyll: 0.55,
    region: 'polar',
    status: 'cooling',
  },
]

const STATUS_CONFIG: Record<
  SSTMeasurement['status'],
  { label: string; color: string; bgClass: string }
> = {
  cooling: { label: 'Cooling', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  warming: { label: 'Warming', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  hotspot: { label: 'Hotspot', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  marine_heatwave: { label: 'Marine Heatwave', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SeaSurfaceTemperatureMapper() {
  const state = useMapStore((s) => s.seaSurfaceTemperature)
  const setState = useMapStore((s) => s.setSeaSurfaceTemperature)

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
      return { avgTemp: 0, avgAnomaly: 0, heatwaveCount: 0 }
    }
    const avgTemp = filteredMeasurements.reduce((sum, m) => sum + m.temperature, 0) / filteredMeasurements.length
    const avgAnomaly = filteredMeasurements.reduce((sum, m) => sum + m.anomaly, 0) / filteredMeasurements.length
    const heatwaveCount = filteredMeasurements.filter(
      (m) => m.status === 'hotspot' || m.status === 'marine_heatwave'
    ).length
    return {
      avgTemp: Math.round(avgTemp * 10) / 10,
      avgAnomaly: Math.round(avgAnomaly * 10) / 10,
      heatwaveCount,
    }
  }, [filteredMeasurements])

  const activeMeasurement = useMemo(
    () => measurements.find((m) => m.id === state.activeMeasurementId) ?? null,
    [measurements, state.activeMeasurementId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeaSurfaceTemperatureState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Waves },
    { key: 'showAnomaly', label: 'Anomaly', icon: TrendingUp },
    { key: 'showTrend', label: 'Trend', icon: Droplets },
    { key: 'showStatus', label: 'Status', icon: AlertOctagon },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ThermometerIcon3 className="h-4 w-4 text-blue-600" />
              Sea Surface Temperature Mapper
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
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({
                  statusFilter: v as SeaSurfaceTemperatureState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="cooling">Cooling</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="warming">Warming</SelectItem>
                <SelectItem value="hotspot">Hotspot</SelectItem>
                <SelectItem value="marine_heatwave">Marine Heatwave</SelectItem>
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
                  <Icon className="h-3 w-3 text-blue-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg SST</div>
              <div className="text-sm font-semibold text-blue-600">{summary.avgTemp}&deg;C</div>
              <div className="text-[9px] text-muted-foreground">temperature</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Anomaly</div>
              <div className="text-sm font-semibold text-orange-600">{summary.avgAnomaly > 0 ? '+' : ''}{summary.avgAnomaly}&deg;C</div>
              <div className="text-[9px] text-muted-foreground">anomaly</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Heatwave</div>
              <div className="text-sm font-semibold text-red-600">{summary.heatwaveCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
          </div>

          <Separator />

          {/* Measurement List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              SST Stations ({filteredMeasurements.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredMeasurements.map((measurement) => {
                  const isActive = state.activeMeasurementId === measurement.id
                  const statusCfg = STATUS_CONFIG[measurement.status]
                  return (
                    <div
                      key={measurement.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-500/5'
                          : 'border-border/40 hover:border-blue-500/20 hover:bg-blue-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeMeasurementId: isActive ? null : measurement.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium">{measurement.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showTemperature && (
                          <div>
                            SST:{' '}
                            <span className="text-foreground font-medium">
                              {measurement.temperature}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showAnomaly && (
                          <div>
                            Anomaly:{' '}
                            <span className="text-foreground font-medium">
                              {measurement.anomaly > 0 ? '+' : ''}{measurement.anomaly}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Trend:{' '}
                            <span className="text-foreground font-medium">
                              {measurement.trend > 0 ? '+' : ''}{measurement.trend}&deg;C/yr
                            </span>
                          </div>
                        )}
                        {state.showStatus && (
                          <div>
                            Salinity:{' '}
                            <span className="text-foreground font-medium">
                              {measurement.salinity} PSU
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
              <div className="space-y-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
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
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeMeasurement.temperature}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Anomaly: </span>
                    <span className="font-medium">{activeMeasurement.anomaly > 0 ? '+' : ''}{activeMeasurement.anomaly}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trend: </span>
                    <span className="font-medium">{activeMeasurement.trend > 0 ? '+' : ''}{activeMeasurement.trend}&deg;C/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salinity: </span>
                    <span className="font-medium">{activeMeasurement.salinity} PSU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chlorophyll: </span>
                    <span className="font-medium">{activeMeasurement.chlorophyll} mg/m&sup3;</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Region: </span>
                    <span className="font-medium">{activeMeasurement.region}</span>
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
