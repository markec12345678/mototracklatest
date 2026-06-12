'use client'

import { useMemo, useState } from 'react'
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
import { useMapStore, type VolcanoSeismicState, type VolcanoSeismicStation } from '@/lib/map-store'
import {
  Triangle,
  X,
  Activity,
  Wind,
  Filter,
  MapPin,
} from 'lucide-react'

const ALERT_COLORS: Record<VolcanoSeismicStation['alertLevel'], string> = {
  normal: '#22c55e',
  advisory: '#eab308',
  watch: '#f97316',
  warning: '#ef4444',
}

const ALERT_LABELS: Record<VolcanoSeismicStation['alertLevel'], string> = {
  normal: 'Normal',
  advisory: 'Advisory',
  watch: 'Watch',
  warning: 'Warning',
}

const FILTER_OPTIONS: { value: VolcanoSeismicState['alertFilter']; label: string }[] = [
  { value: 'all', label: 'All Alert Levels' },
  { value: 'normal', label: 'Normal' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'watch', label: 'Watch' },
  { value: 'warning', label: 'Warning' },
]

function generateSampleStations(): VolcanoSeismicStation[] {
  return [
    {
      id: 'vs1',
      name: 'Etna Observatory',
      latitude: 37.751,
      longitude: 14.993,
      volcano: 'Mount Etna',
      alertLevel: 'watch',
      seismicActivity: 78.5,
      deformation: 3.2,
      gasEmission: 1240,
      lastEruption: '2024-11-12',
      proximity: 1.5,
    },
    {
      id: 'vs2',
      name: 'Kilauea Monitoring Station',
      latitude: 19.407,
      longitude: -155.284,
      volcano: 'Kīlauea',
      alertLevel: 'warning',
      seismicActivity: 92.3,
      deformation: 8.7,
      gasEmission: 3500,
      lastEruption: '2025-01-15',
      proximity: 0.8,
    },
    {
      id: 'vs3',
      name: 'Sakurajima Observatory',
      latitude: 31.585,
      longitude: 130.657,
      volcano: 'Sakurajima',
      alertLevel: 'advisory',
      seismicActivity: 54.1,
      deformation: 1.8,
      gasEmission: 890,
      lastEruption: '2024-07-22',
      proximity: 3.2,
    },
    {
      id: 'vs4',
      name: 'Popocatépetl Seismic Network',
      latitude: 19.023,
      longitude: -98.622,
      volcano: 'Popocatépetl',
      alertLevel: 'watch',
      seismicActivity: 65.7,
      deformation: 2.4,
      gasEmission: 1580,
      lastEruption: '2024-05-03',
      proximity: 2.1,
    },
    {
      id: 'vs5',
      name: 'Eyjafjallajökull Station',
      latitude: 63.63,
      longitude: -19.621,
      volcano: 'Eyjafjallajökull',
      alertLevel: 'normal',
      seismicActivity: 12.4,
      deformation: 0.3,
      gasEmission: 120,
      lastEruption: '2010-04-14',
      proximity: 5.0,
    },
    {
      id: 'vs6',
      name: 'Merapi Volcano Observatory',
      latitude: -7.541,
      longitude: 110.445,
      volcano: 'Mount Merapi',
      alertLevel: 'advisory',
      seismicActivity: 46.8,
      deformation: 1.5,
      gasEmission: 720,
      lastEruption: '2023-12-09',
      proximity: 2.8,
    },
    {
      id: 'vs7',
      name: 'Vesuvius Monitoring Post',
      latitude: 40.821,
      longitude: 14.426,
      volcano: 'Mount Vesuvius',
      alertLevel: 'normal',
      seismicActivity: 8.2,
      deformation: 0.1,
      gasEmission: 85,
      lastEruption: '1944-03-18',
      proximity: 6.5,
    },
  ]
}

type ToggleKey = keyof Pick<VolcanoSeismicState, 'showAlertLevel' | 'showSeismic' | 'showDeformation' | 'showGas'>

const TOGGLES: { key: ToggleKey; label: string; icon: React.ElementType }[] = [
  { key: 'showAlertLevel', label: 'Alert Level', icon: Triangle },
  { key: 'showSeismic', label: 'Seismic', icon: Activity },
  { key: 'showDeformation', label: 'Deformation', icon: MapPin },
  { key: 'showGas', label: 'Gas Emission', icon: Wind },
]

export function VolcanoSeismicMonitor() {
  const volcanoSeismic = useMapStore((s) => s.volcanoSeismic)
  const setVolcanoSeismic = useMapStore((s) => s.setVolcanoSeismic)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sampleStations = useMemo(() => generateSampleStations(), [])

  const stations = volcanoSeismic.seismicStations.length > 0
    ? volcanoSeismic.seismicStations
    : sampleStations

  const filteredStations = useMemo(() => {
    if (volcanoSeismic.alertFilter === 'all') return stations
    return stations.filter((s) => s.alertLevel === volcanoSeismic.alertFilter)
  }, [stations, volcanoSeismic.alertFilter])

  const activeStationId = volcanoSeismic.activeStationId ?? selectedId

  const selectedStation = useMemo(() => {
    if (!activeStationId) return null
    return stations.find((s) => s.id === activeStationId) ?? null
  }, [stations, activeStationId])

  const stats = useMemo(() => {
    const warningCount = stations.filter(
      (s) => s.alertLevel === 'warning' || s.alertLevel === 'watch'
    ).length
    const avgSeismic =
      stations.reduce((sum, s) => sum + s.seismicActivity, 0) / stations.length
    const mostActive = stations.reduce((prev, curr) =>
      curr.seismicActivity > prev.seismicActivity ? curr : prev
    )
    return {
      warningCount,
      avgSeismic: avgSeismic.toFixed(1),
      mostActiveVolcano: mostActive.volcano,
    }
  }, [stations])

  if (typeof window === 'undefined') return null
  if (!volcanoSeismic.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[440px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Triangle className="h-4 w-4 text-orange-500" />
              Volcano Seismic Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setVolcanoSeismic({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 bg-red-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-red-500">{stats.warningCount}</div>
              <div className="text-[10px] text-muted-foreground">Active Warnings</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-orange-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-orange-600">{stats.avgSeismic}</div>
              <div className="text-[10px] text-muted-foreground">Avg Seismic</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-amber-500/5 p-2.5 text-center">
              <div className="text-[10px] font-bold text-amber-700 leading-tight mt-0.5">{stats.mostActiveVolcano}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Most Active</div>
            </div>
          </div>

          {/* Alert filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select
              value={volcanoSeismic.alertFilter}
              onValueChange={(v) =>
                setVolcanoSeismic({
                  alertFilter: v as VolcanoSeismicState['alertFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Filter alert level" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-1.5">
            {TOGGLES.map(({ key, label, icon: Icon }) => {
              const active = volcanoSeismic[key]
              return (
                <Button
                  key={key}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 text-[10px] gap-1 ${
                    active
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setVolcanoSeismic({ [key]: !active })}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              )
            })}
          </div>

          {/* Stations list */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground font-medium">
              Monitoring Stations ({filteredStations.length})
            </div>
            <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredStations.map((station) => {
                const isActive = activeStationId === station.id
                const alertColor = ALERT_COLORS[station.alertLevel]
                return (
                  <div
                    key={station.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-orange-500/50 bg-orange-500/5'
                        : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                    }`}
                    onClick={() => {
                      const newId = isActive ? null : station.id
                      setSelectedId(newId)
                      setVolcanoSeismic({ activeStationId: newId })
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex flex-col min-w-0 mr-2">
                        <span className="text-xs font-medium truncate">{station.name}</span>
                        <span className="text-[10px] text-muted-foreground">{station.volcano}</span>
                      </div>
                      {volcanoSeismic.showAlertLevel && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 shrink-0"
                          style={{
                            borderColor: alertColor,
                            color: alertColor,
                          }}
                        >
                          {ALERT_LABELS[station.alertLevel]}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                      {volcanoSeismic.showSeismic && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-2.5 w-2.5 text-orange-500 shrink-0" />
                          Seismic: <span className="text-foreground font-medium">{station.seismicActivity}</span>
                        </div>
                      )}
                      {volcanoSeismic.showDeformation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-purple-500 shrink-0" />
                          Deform: <span className="text-foreground font-medium">{station.deformation} mm</span>
                        </div>
                      )}
                      {volcanoSeismic.showGas && (
                        <div className="flex items-center gap-1">
                          <Wind className="h-2.5 w-2.5 text-sky-500 shrink-0" />
                          Gas: <span className="text-foreground font-medium">{station.gasEmission} t/d</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        Proximity: <span className="text-foreground font-medium">{station.proximity} km</span>
                      </div>
                      {station.lastEruption && (
                        <div className="col-span-2">
                          Last eruption: <span className="text-foreground font-medium">{station.lastEruption}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {filteredStations.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No stations match the selected filter.
                </div>
              )}
            </div>
          </div>

          {/* Selected station details */}
          {selectedStation && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <Triangle className="h-3 w-3 text-orange-500" />
                  {selectedStation.name}
                </div>
                <Badge
                  className="text-[10px] h-5 text-white border-0"
                  style={{ backgroundColor: ALERT_COLORS[selectedStation.alertLevel] }}
                >
                  {ALERT_LABELS[selectedStation.alertLevel]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <Triangle className="h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground">Volcano:</span>
                  <span className="font-medium">{selectedStation.volcano}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground">Seismic:</span>
                  <span className="font-medium">{selectedStation.seismicActivity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-purple-500" />
                  <span className="text-muted-foreground">Deformation:</span>
                  <span className="font-medium">{selectedStation.deformation} mm</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3 text-sky-500" />
                  <span className="text-muted-foreground">Gas Emission:</span>
                  <span className="font-medium">{selectedStation.gasEmission} t/d</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Proximity:</span>
                  <span className="font-medium">{selectedStation.proximity} km</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {selectedStation.latitude.toFixed(2)}°, {selectedStation.longitude.toFixed(2)}°
                  </span>
                </div>
                {selectedStation.lastEruption && (
                  <div className="col-span-2 flex items-center gap-1">
                    <Activity className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">Last Eruption:</span>
                    <span className="font-medium">{selectedStation.lastEruption}</span>
                  </div>
                )}

                {/* Seismic activity bar */}
                <div className="col-span-2 mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Seismic Activity</span>
                    <span className="text-[10px] font-medium">{selectedStation.seismicActivity}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(selectedStation.seismicActivity, 100)}%`,
                        backgroundColor:
                          selectedStation.seismicActivity >= 80
                            ? '#ef4444'
                            : selectedStation.seismicActivity >= 50
                              ? '#f97316'
                              : '#22c55e',
                      }}
                    />
                  </div>
                </div>

                {/* Deformation bar */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Deformation</span>
                    <span className="text-[10px] font-medium">{selectedStation.deformation} mm</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((selectedStation.deformation / 10) * 100, 100)}%`,
                        backgroundColor:
                          selectedStation.deformation >= 5
                            ? '#ef4444'
                            : selectedStation.deformation >= 2
                              ? '#f97316'
                              : '#22c55e',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
