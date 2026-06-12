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
import { useMapStore, type TectonicStrainState, type StrainStation } from '@/lib/map-store'
import {
  Activity,
  X,
  AlertTriangle,
  Shield,
  Filter,
  MapPin,
} from 'lucide-react'

// Sample station data
const DEMO_STATIONS: StrainStation[] = [
  {
    id: 'ts1',
    name: 'San Andreas GPS',
    latitude: 35.46,
    longitude: -118.07,
    strainRate: 28.5,
    stressAccumulation: 78.3,
    faultType: 'Strike-Slip',
    lastEvent: '2024-06-15',
    riskLevel: 'high',
    displacement: 4.2,
  },
  {
    id: 'ts2',
    name: 'Anatolian Network',
    latitude: 39.92,
    longitude: 32.85,
    strainRate: 22.1,
    stressAccumulation: 65.7,
    faultType: 'Strike-Slip',
    lastEvent: '2023-02-06',
    riskLevel: 'critical',
    displacement: 6.8,
  },
  {
    id: 'ts3',
    name: 'Alpine Fault NZ',
    latitude: -43.53,
    longitude: 170.15,
    strainRate: 35.2,
    stressAccumulation: 91.4,
    faultType: 'Reverse',
    lastEvent: null,
    riskLevel: 'critical',
    displacement: 8.1,
  },
  {
    id: 'ts4',
    name: 'Japan Trench',
    latitude: 38.32,
    longitude: 142.37,
    strainRate: 19.8,
    stressAccumulation: 54.2,
    faultType: 'Subduction',
    lastEvent: '2024-03-11',
    riskLevel: 'moderate',
    displacement: 2.9,
  },
  {
    id: 'ts5',
    name: 'Himalayan GPS',
    latitude: 28.23,
    longitude: 84.73,
    strainRate: 15.6,
    stressAccumulation: 42.8,
    faultType: 'Thrust',
    lastEvent: '2023-11-03',
    riskLevel: 'high',
    displacement: 3.7,
  },
  {
    id: 'ts6',
    name: 'Andean Network',
    latitude: -16.5,
    longitude: -68.15,
    strainRate: 11.4,
    stressAccumulation: 33.1,
    faultType: 'Subduction',
    lastEvent: '2024-01-22',
    riskLevel: 'low',
    displacement: 1.5,
  },
  {
    id: 'ts7',
    name: 'Mid-Atlantic Ridge',
    latitude: 63.63,
    longitude: -19.6,
    strainRate: 8.3,
    stressAccumulation: 18.6,
    faultType: 'Divergent',
    lastEvent: null,
    riskLevel: 'low',
    displacement: 0.8,
  },
]

const RISK_COLORS: Record<StrainStation['riskLevel'], string> = {
  low: 'bg-green-500/15 text-green-600 border-green-500/30',
  moderate: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30',
  high: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  critical: 'bg-red-500/15 text-red-600 border-red-500/30',
}

const RISK_DOT_COLORS: Record<StrainStation['riskLevel'], string> = {
  low: 'bg-green-500',
  moderate: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
}

const TOGGLE_CONFIG = [
  { key: 'showStrain' as const, label: 'Strain Rate' },
  { key: 'showStress' as const, label: 'Stress Accumulation' },
  { key: 'showFaults' as const, label: 'Fault Lines' },
  { key: 'showRisk' as const, label: 'Risk Overlay' },
]

export function TectonicStrainMonitor() {
  const tectonicStrain = useMapStore((s) => s.tectonicStrain)
  const setTectonicStrain = useMapStore((s) => s.setTectonicStrain)

  const stations = useMemo(
    () =>
      tectonicStrain.strainStations.length > 0
        ? tectonicStrain.strainStations
        : DEMO_STATIONS,
    [tectonicStrain.strainStations]
  )

  const filteredStations = useMemo(
    () =>
      tectonicStrain.riskFilter === 'all'
        ? stations
        : stations.filter((s) => s.riskLevel === tectonicStrain.riskFilter),
    [stations, tectonicStrain.riskFilter]
  )

  const summary = useMemo(() => {
    const criticalCount = stations.filter(
      (s) => s.riskLevel === 'critical'
    ).length
    const avgStrain =
      stations.reduce((sum, s) => sum + s.strainRate, 0) / stations.length
    const highestStress = Math.max(...stations.map((s) => s.stressAccumulation))
    return { criticalCount, avgStrain, highestStress }
  }, [stations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === tectonicStrain.activeStationId) ?? null,
    [stations, tectonicStrain.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!tectonicStrain.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              Tectonic Strain Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setTectonicStrain({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-lg font-semibold text-red-500">
                {summary.criticalCount}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Critical
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-lg font-semibold text-orange-500">
                {summary.avgStrain.toFixed(1)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Avg Strain (nε/yr)
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {summary.highestStress.toFixed(1)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Max Stress (MPa)
              </div>
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-orange-500" />
              Overlays
            </Label>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {TOGGLE_CONFIG.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs">{label}</span>
                  <Switch
                    checked={tectonicStrain[key]}
                    onCheckedChange={(checked) =>
                      setTectonicStrain({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Risk filter */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-orange-500" />
              Risk Level Filter
            </Label>
            <Select
              value={tectonicStrain.riskFilter}
              onValueChange={(v) =>
                setTectonicStrain({
                  riskFilter: v as TectonicStrainState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Station list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Monitoring Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive =
                    tectonicStrain.activeStationId === station.id
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setTectonicStrain({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <MapPin className="h-3 w-3 text-orange-500" />
                          {station.name}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 border ${RISK_COLORS[station.riskLevel]}`}
                        >
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${RISK_DOT_COLORS[station.riskLevel]}`}
                          />
                          {station.riskLevel.charAt(0).toUpperCase() +
                            station.riskLevel.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        <div>
                          Strain:{' '}
                          <span className="text-foreground">
                            {station.strainRate} nε/yr
                          </span>
                        </div>
                        <div>
                          Stress:{' '}
                          <span className="text-foreground">
                            {station.stressAccumulation} MPa
                          </span>
                        </div>
                        <div>
                          Fault:{' '}
                          <span className="text-foreground">
                            {station.faultType}
                          </span>
                        </div>
                        <div>
                          Displacement:{' '}
                          <span className="text-foreground">
                            {station.displacement} mm
                          </span>
                        </div>
                      </div>
                      {station.lastEvent && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Last event:{' '}
                          <span className="text-foreground">
                            {station.lastEvent}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No stations match the selected risk level.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Selected station detail */}
          {activeStation && (
            <>
              <Separator />
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    {activeStation.name}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 border ${RISK_COLORS[activeStation.riskLevel]}`}
                  >
                    {activeStation.riskLevel.charAt(0).toUpperCase() +
                      activeStation.riskLevel.slice(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Strain Rate</span>
                    <div className="font-medium">
                      {activeStation.strainRate} nε/yr
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stress Accum.</span>
                    <div className="font-medium">
                      {activeStation.stressAccumulation} MPa
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fault Type</span>
                    <div className="font-medium">{activeStation.faultType}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Displacement</span>
                    <div className="font-medium">
                      {activeStation.displacement} mm
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coordinates</span>
                    <div className="font-medium">
                      {activeStation.latitude.toFixed(2)}°,{' '}
                      {activeStation.longitude.toFixed(2)}°
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Event</span>
                    <div className="font-medium">
                      {activeStation.lastEvent ?? 'No recent event'}
                    </div>
                  </div>
                </div>
                {(activeStation.riskLevel === 'high' ||
                  activeStation.riskLevel === 'critical') && (
                  <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-medium mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    Elevated risk — increased monitoring recommended
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
