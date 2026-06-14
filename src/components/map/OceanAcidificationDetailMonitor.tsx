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
import { useMapStore, type OceanAcidificationDetailData, type OceanAcidificationDetailState } from '@/lib/map-store'
import { FlaskConical as FlaskConicalIcon, X, Gauge, AlertTriangle, MapPin, Filter, Activity } from 'lucide-react'

const DEMO_STATIONS: OceanAcidificationDetailData[] = [
  {
    id: 'oad-hawaii',
    name: 'Hawaii Ocean Time-series',
    lat: 22.75,
    lng: -158.0,
    ph: 8.08,
    aragonite: 3.5,
    pco2: 380,
    saturationState: 3.8,
    shellGrowthRate: 92,
    status: 'moderate',
    description: 'Long-term open ocean monitoring station in the North Pacific subtropical gyre tracking carbonate chemistry trends since 1988.',
  },
  {
    id: 'oad-bermuda',
    name: 'Bermuda Atlantic Time-series',
    lat: 31.67,
    lng: -64.17,
    ph: 8.06,
    aragonite: 3.2,
    pco2: 395,
    saturationState: 3.4,
    shellGrowthRate: 85,
    status: 'elevated',
    description: 'Atlantic time-series station monitoring surface and deep ocean carbonate system changes southeast of Bermuda.',
  },
  {
    id: 'oad-arctic',
    name: 'Arctic Ocean Station',
    lat: 78.0,
    lng: 5.0,
    ph: 7.95,
    aragonite: 2.1,
    pco2: 480,
    saturationState: 1.8,
    shellGrowthRate: 35,
    status: 'critical',
    description: 'High Arctic monitoring station tracking rapid acidification driven by sea ice loss and increased CO₂ absorption.',
  },
  {
    id: 'oad-southern',
    name: 'Southern Ocean Station',
    lat: -60.0,
    lng: 0.0,
    ph: 7.98,
    aragonite: 2.3,
    pco2: 450,
    saturationState: 2.0,
    shellGrowthRate: 42,
    status: 'severe',
    description: 'Southern Ocean observing system tracking one of the most rapidly acidifying ocean basins on Earth.',
  },
  {
    id: 'oad-california',
    name: 'Coastal Upwelling California',
    lat: 35.0,
    lng: -121.0,
    ph: 7.85,
    aragonite: 1.5,
    pco2: 650,
    saturationState: 1.2,
    shellGrowthRate: 18,
    status: 'critical',
    description: 'Coastal upwelling zone where corrosive deep waters reach the surface, severely impacting shell-forming organisms.',
  },
  {
    id: 'oad-gbr',
    name: 'Great Barrier Reef',
    lat: -18.0,
    lng: 147.0,
    ph: 8.02,
    aragonite: 3.0,
    pco2: 410,
    saturationState: 3.2,
    shellGrowthRate: 72,
    status: 'elevated',
    description: 'World\'s largest coral reef system experiencing declining aragonite saturation impacting coral calcification rates.',
  },
]

const STATUS_CONFIG: Record<
  OceanAcidificationDetailData['status'],
  { label: string; color: string; bgClass: string }
> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  elevated: { label: 'Elevated', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

const REGION_LABELS: Record<OceanAcidificationDetailState['regionFilter'], string> = {
  all: 'All Regions',
  pacific: 'Pacific',
  atlantic: 'Atlantic',
  arctic: 'Arctic',
  coastal: 'Coastal',
}

function getStationRegion(station: OceanAcidificationDetailData): OceanAcidificationDetailState['regionFilter'] {
  const regionMap: Record<string, OceanAcidificationDetailState['regionFilter']> = {
    'oad-hawaii': 'pacific',
    'oad-bermuda': 'atlantic',
    'oad-arctic': 'arctic',
    'oad-southern': 'atlantic',
    'oad-california': 'coastal',
    'oad-gbr': 'pacific',
  }
  return regionMap[station.id] ?? 'pacific'
}

export function OceanAcidificationDetailMonitor() {
  const state = useMapStore((s) => s.oceanAcidificationDetail)
  const setState = useMapStore((s) => s.setOceanAcidificationDetail)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.regionFilter !== 'all' && getStationRegion(s) !== state.regionFilter) return false
      return true
    })
  }, [stations, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgPh: 0, avgShellGrowthRate: 0, criticalSevereCount: 0 }
    }
    const avgPh = filteredStations.reduce((sum, s) => sum + s.ph, 0) / filteredStations.length
    const avgShellGrowthRate = filteredStations.reduce((sum, s) => sum + s.shellGrowthRate, 0) / filteredStations.length
    const criticalSevereCount = filteredStations.filter(
      (s) => s.status === 'critical' || s.status === 'severe'
    ).length
    return {
      avgPh: Math.round(avgPh * 100) / 100,
      avgShellGrowthRate: Math.round(avgShellGrowthRate),
      criticalSevereCount,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OceanAcidificationDetailState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPH', label: 'pH', icon: Gauge },
    { key: 'showAragonite', label: 'Aragonite', icon: Activity },
    { key: 'showPCO2', label: 'pCO\u2082', icon: AlertTriangle },
    { key: 'showSaturationState', label: 'Saturation State', icon: Filter },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-teal-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <FlaskConicalIcon className="h-4 w-4 text-teal-400" />
              Ocean Acidification Detail Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-white hover:bg-blue-800/40"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-blue-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({
                  regionFilter: v as OceanAcidificationDetailState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(REGION_LABELS) as OceanAcidificationDetailState['regionFilter'][]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {REGION_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-teal-400" />
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

          <Separator className="bg-blue-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-300">Avg pH</div>
              <div className="text-sm font-semibold text-teal-300">{summary.avgPh.toFixed(2)}</div>
              <div className="text-[9px] text-blue-400">level</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-300">Avg Shell Growth</div>
              <div className="text-sm font-semibold text-teal-300">{summary.avgShellGrowthRate}%</div>
              <div className="text-[9px] text-blue-400">rate</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-300">Critical+Severe</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalSevereCount}</div>
              <div className="text-[9px] text-blue-400">stations</div>
            </div>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">
              Monitoring Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const statusCfg = STATUS_CONFIG[station.status]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-900/20'
                          : 'border-blue-700/30 hover:border-teal-500/20 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-blue-100">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300">
                        {state.showPH && (
                          <div>
                            pH:{' '}
                            <span className="text-blue-100 font-medium">
                              {station.ph.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {state.showAragonite && (
                          <div>
                            Aragonite:{' '}
                            <span className="text-blue-100 font-medium">
                              {station.aragonite.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {state.showPCO2 && (
                          <div>
                            pCO₂:{' '}
                            <span className="text-blue-100 font-medium">
                              {station.pco2} µatm
                            </span>
                          </div>
                        )}
                        {state.showSaturationState && (
                          <div>
                            Sat.:{' '}
                            <span className="text-blue-100 font-medium">
                              {station.saturationState.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-1 text-[10px] text-blue-400">
                        Shell Growth:{' '}
                        <span className={`font-medium ${
                          station.shellGrowthRate < 40
                            ? 'text-red-400'
                            : station.shellGrowthRate < 70
                            ? 'text-yellow-400'
                            : 'text-teal-300'
                        }`}>
                          {station.shellGrowthRate}%
                        </span>
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-blue-400 py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator className="bg-blue-800/30" />
              <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-900/15 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeStation.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeStation.status].label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeStation.lat.toFixed(2)}, {activeStation.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Region: </span>
                    <span className="font-medium text-blue-100 capitalize">{getStationRegion(activeStation)}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">pH Level: </span>
                    <span className="font-medium text-blue-100">{activeStation.ph.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">pCO₂: </span>
                    <span className="font-medium text-blue-100">{activeStation.pco2} µatm</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Aragonite: </span>
                    <span className="font-medium text-blue-100">{activeStation.aragonite.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Saturation: </span>
                    <span className="font-medium text-blue-100">{activeStation.saturationState.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Shell Growth: </span>
                    <span className={`font-medium ${
                      activeStation.shellGrowthRate < 40
                        ? 'text-red-400'
                        : activeStation.shellGrowthRate < 70
                        ? 'text-yellow-400'
                        : 'text-teal-300'
                    }`}>
                      {activeStation.shellGrowthRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Status: </span>
                    <span className="font-medium" style={{ color: STATUS_CONFIG[activeStation.status].color }}>
                      {STATUS_CONFIG[activeStation.status].label}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-blue-300 pt-1">
                  {activeStation.description}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
