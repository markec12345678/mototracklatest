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
import { useMapStore, type RiverFlowState, type RiverStation } from '@/lib/map-store'
import {
  Waves,
  X,
  Droplets,
  AlertTriangle,
  Filter,
  MapPin,
} from 'lucide-react'

const FLOOD_COLORS: Record<RiverStation['floodStatus'], string> = {
  normal: '#22c55e',
  watch: '#eab308',
  warning: '#f97316',
  flood: '#ef4444',
}

const FLOOD_LABELS: Record<RiverStation['floodStatus'], string> = {
  normal: 'Normal',
  watch: 'Watch',
  warning: 'Warning',
  flood: 'Flood',
}

const FILTER_OPTIONS: { value: RiverFlowState['floodFilter']; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'normal', label: 'Normal' },
  { value: 'watch', label: 'Watch' },
  { value: 'warning', label: 'Warning' },
  { value: 'flood', label: 'Flood' },
]

function generateSampleStations(): RiverStation[] {
  return [
    {
      id: 'rf1',
      name: 'Mississippi River - Vicksburg',
      latitude: 32.35,
      longitude: -90.91,
      flowRate: 17420,
      waterLevel: 8.4,
      floodStage: 13.0,
      floodStatus: 'normal',
      temperature: 22.1,
      dissolvedOxygen: 7.8,
    },
    {
      id: 'rf2',
      name: 'Danube River - Budapest',
      latitude: 47.50,
      longitude: 19.04,
      flowRate: 5830,
      waterLevel: 5.2,
      floodStage: 6.5,
      floodStatus: 'watch',
      temperature: 16.4,
      dissolvedOxygen: 9.1,
    },
    {
      id: 'rf3',
      name: 'Amazon River - Manaus',
      latitude: -3.12,
      longitude: -60.02,
      flowRate: 175000,
      waterLevel: 18.7,
      floodStage: 17.5,
      floodStatus: 'flood',
      temperature: 27.3,
      dissolvedOxygen: 5.4,
    },
    {
      id: 'rf4',
      name: 'Ganges River - Varanasi',
      latitude: 25.32,
      longitude: 83.01,
      flowRate: 12100,
      waterLevel: 10.8,
      floodStage: 11.0,
      floodStatus: 'warning',
      temperature: 24.6,
      dissolvedOxygen: 4.2,
    },
    {
      id: 'rf5',
      name: 'Nile River - Aswan',
      latitude: 24.09,
      longitude: 32.91,
      flowRate: 2830,
      waterLevel: 3.8,
      floodStage: 7.0,
      floodStatus: 'normal',
      temperature: 25.9,
      dissolvedOxygen: 8.3,
    },
    {
      id: 'rf6',
      name: 'Mekong River - Pakse',
      latitude: 15.12,
      longitude: 105.79,
      flowRate: 14200,
      waterLevel: 9.3,
      floodStage: 9.5,
      floodStatus: 'watch',
      temperature: 26.8,
      dissolvedOxygen: 6.9,
    },
    {
      id: 'rf7',
      name: 'Yangtze River - Wuhan',
      latitude: 30.58,
      longitude: 114.27,
      flowRate: 31200,
      waterLevel: 14.2,
      floodStage: 13.8,
      floodStatus: 'flood',
      temperature: 21.5,
      dissolvedOxygen: 6.1,
    },
  ]
}

type StoreRiverFlow = ReturnType<typeof useMapStore.getState>['riverFlow']

export function RiverFlowMonitor() {
  const riverFlow = useMapStore((s) => s.riverFlow)
  const setRiverFlow = useMapStore((s) => s.setRiverFlow)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sampleStations = useMemo(() => generateSampleStations(), [])

  const stations = riverFlow.stations.length > 0 ? riverFlow.stations : sampleStations

  const filteredStations = useMemo(() => {
    if (riverFlow.floodFilter === 'all') return stations
    return stations.filter((s) => s.floodStatus === riverFlow.floodFilter)
  }, [stations, riverFlow.floodFilter])

  const activeStationId = riverFlow.activeStationId ?? selectedId

  const selectedStation = useMemo(() => {
    if (!activeStationId) return null
    return stations.find((s) => s.id === activeStationId) ?? null
  }, [stations, activeStationId])

  const stats = useMemo(() => {
    const totalFlow = stations.reduce((sum, s) => sum + s.flowRate, 0)
    const floodWarnings = stations.filter(
      (s) => s.floodStatus === 'warning' || s.floodStatus === 'flood'
    ).length
    const avgDO = stations.reduce((sum, s) => sum + s.dissolvedOxygen, 0) / stations.length
    return {
      totalFlow: totalFlow >= 1000 ? `${(totalFlow / 1000).toFixed(1)}k` : `${totalFlow}`,
      floodWarnings,
      avgDO: avgDO.toFixed(1),
    }
  }, [stations])

  const toggles: { key: keyof Pick<StoreRiverFlow, 'showFlowRate' | 'showWaterLevel' | 'showFloodStatus' | 'showQuality'>; label: string; icon: React.ElementType }[] = [
    { key: 'showFlowRate', label: 'Flow Rate', icon: Waves },
    { key: 'showWaterLevel', label: 'Water Level', icon: Droplets },
    { key: 'showFloodStatus', label: 'Flood Status', icon: AlertTriangle },
    { key: 'showQuality', label: 'Quality', icon: MapPin },
  ]

  if (typeof window === 'undefined') return null
  if (!riverFlow.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[440px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Waves className="h-4 w-4 text-cyan-500" />
              River Flow Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRiverFlow({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 bg-cyan-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-cyan-600">{stats.totalFlow}</div>
              <div className="text-[10px] text-muted-foreground">Total Flow (m³/s)</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-red-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-red-500">{stats.floodWarnings}</div>
              <div className="text-[10px] text-muted-foreground">Flood Warnings</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-emerald-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-emerald-600">{stats.avgDO}</div>
              <div className="text-[10px] text-muted-foreground">Avg DO (mg/L)</div>
            </div>
          </div>

          {/* Flood status filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select
              value={riverFlow.floodFilter}
              onValueChange={(v) =>
                setRiverFlow({
                  floodFilter: v as RiverFlowState['floodFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Filter status" />
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
            {toggles.map(({ key, label, icon: Icon }) => {
              const active = riverFlow[key]
              return (
                <Button
                  key={key}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 text-[10px] gap-1 ${
                    active
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setRiverFlow({ [key]: !active })}
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
              Stations ({filteredStations.length})
            </div>
            <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredStations.map((station) => {
                const isActive = activeStationId === station.id
                const statusColor = FLOOD_COLORS[station.floodStatus]
                const waterLevelRatio = station.floodStage > 0 ? station.waterLevel / station.floodStage : 0
                return (
                  <div
                    key={station.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-cyan-500/50 bg-cyan-500/5'
                        : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                    }`}
                    onClick={() => {
                      const newId = isActive ? null : station.id
                      setSelectedId(newId)
                      setRiverFlow({ activeStationId: newId })
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium truncate mr-2">{station.name}</span>
                      {riverFlow.showFloodStatus && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 shrink-0"
                          style={{
                            borderColor: statusColor,
                            color: statusColor,
                          }}
                        >
                          {FLOOD_LABELS[station.floodStatus]}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                      {riverFlow.showFlowRate && (
                        <div>
                          Flow:{' '}
                          <span className="text-foreground">
                            {station.flowRate >= 1000
                              ? `${(station.flowRate / 1000).toFixed(1)}k`
                              : station.flowRate}{' '}
                            m³/s
                          </span>
                        </div>
                      )}
                      {riverFlow.showWaterLevel && (
                        <div>
                          Level:{' '}
                          <span className="text-foreground">
                            {station.waterLevel}m
                          </span>
                        </div>
                      )}
                      {riverFlow.showQuality && (
                        <div>
                          DO:{' '}
                          <span className="text-foreground">
                            {station.dissolvedOxygen} mg/L
                          </span>
                        </div>
                      )}
                    </div>
                    {riverFlow.showWaterLevel && (
                      <div className="mt-1.5">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(waterLevelRatio * 100, 100)}%`,
                              backgroundColor:
                                waterLevelRatio >= 1
                                  ? FLOOD_COLORS.flood
                                  : waterLevelRatio >= 0.85
                                    ? FLOOD_COLORS.warning
                                    : waterLevelRatio >= 0.7
                                      ? FLOOD_COLORS.watch
                                      : FLOOD_COLORS.normal,
                            }}
                          />
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          Flood stage: {station.floodStage}m
                        </div>
                      </div>
                    )}
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
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-cyan-500" />
                  {selectedStation.name}
                </div>
                <Badge
                  className="text-[10px] h-5 text-white border-0"
                  style={{ backgroundColor: FLOOD_COLORS[selectedStation.floodStatus] }}
                >
                  {FLOOD_LABELS[selectedStation.floodStatus]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <Waves className="h-3 w-3 text-cyan-500" />
                  <span className="text-muted-foreground">Flow Rate:</span>
                  <span className="font-medium">{selectedStation.flowRate.toLocaleString()} m³/s</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-sky-500" />
                  <span className="text-muted-foreground">Water Level:</span>
                  <span className="font-medium">{selectedStation.waterLevel} m</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground">Flood Stage:</span>
                  <span className="font-medium">{selectedStation.floodStage} m</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle
                    className={`h-3 w-3`}
                    style={{ color: FLOOD_COLORS[selectedStation.floodStatus] }}
                  />
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1"
                    style={{
                      borderColor: FLOOD_COLORS[selectedStation.floodStatus],
                      color: FLOOD_COLORS[selectedStation.floodStatus],
                    }}
                  >
                    {FLOOD_LABELS[selectedStation.floodStatus]}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-medium">{selectedStation.temperature}°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Dissolved O₂:</span>
                  <span className="font-medium">{selectedStation.dissolvedOxygen} mg/L</span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {selectedStation.latitude.toFixed(2)}°, {selectedStation.longitude.toFixed(2)}°
                  </span>
                </div>
              </div>

              {/* Water level vs flood stage bar */}
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground">
                  Water Level vs Flood Stage
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((selectedStation.waterLevel / selectedStation.floodStage) * 100, 100)}%`,
                      backgroundColor: FLOOD_COLORS[selectedStation.floodStatus],
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                    style={{ left: '100%' }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>{selectedStation.waterLevel}m</span>
                  <span>Flood stage: {selectedStation.floodStage}m</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
