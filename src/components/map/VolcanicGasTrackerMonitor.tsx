'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useMapStore,
  type VolcanicGasTrackerState,
  type VolcanicGasTrackerData,
} from '@/lib/map-store'
import {
  CloudLightning as CloudLightningIcon,
  X,
  Wind,
  Flame,
  Mountain,
  AlertTriangle,
  MapPin,
  Filter,
  Cloud,
  TrendingUp,
} from 'lucide-react'

const DEMO_VOLCANOES: VolcanicGasTrackerData[] = [
  {
    id: 'vgt-kilauea',
    name: 'Kilauea Hawaii',
    lat: 19.41,
    lng: -155.27,
    so2: 4500,
    co2: 8500,
    h2s: 120,
    plumeHeight: 6,
    hazardLevel: 82,
    status: 'elevated',
    description: 'Active shield volcano with persistent SO₂ emissions and elevated gas output',
  },
  {
    id: 'vgt-etna',
    name: 'Etna Italy',
    lat: 37.75,
    lng: 15.0,
    so2: 3200,
    co2: 12000,
    h2s: 85,
    plumeHeight: 8,
    hazardLevel: 68,
    status: 'elevated',
    description: 'Europe\'s most active volcano with significant CO₂-dominated gas plume',
  },
  {
    id: 'vgt-holuhraun',
    name: 'Holuhraun Iceland',
    lat: 64.85,
    lng: -16.83,
    so2: 28000,
    co2: 18000,
    h2s: 250,
    plumeHeight: 10,
    hazardLevel: 95,
    status: 'critical',
    description: 'Fissure eruption with extreme SO₂ output affecting downwind populations',
  },
  {
    id: 'vgt-popocatepetl',
    name: 'Popocatépetl Mexico',
    lat: 19.02,
    lng: -98.62,
    so2: 5800,
    co2: 15000,
    h2s: 180,
    plumeHeight: 7,
    hazardLevel: 88,
    status: 'high',
    description: 'Stratovolcano near Mexico City with persistent explosive gas emissions',
  },
  {
    id: 'vgt-ambae',
    name: 'Ambae Vanuatu',
    lat: -15.4,
    lng: 167.8,
    so2: 12000,
    co2: 6000,
    h2s: 350,
    plumeHeight: 12,
    hazardLevel: 92,
    status: 'eruptive',
    description: 'Ongoing eruption with the tallest gas plume and highest H₂S readings',
  },
  {
    id: 'vgt-stromboli',
    name: 'Stromboli Italy',
    lat: 38.77,
    lng: 15.21,
    so2: 280,
    co2: 2200,
    h2s: 15,
    plumeHeight: 1,
    hazardLevel: 22,
    status: 'normal',
    description: 'Persistent mild Strombolian activity with low-level gas emissions',
  },
]

const STATUS_CONFIG: Record<
  VolcanicGasTrackerData['status'],
  { label: string; color: string; bgClass: string; dotClass: string }
> = {
  normal: {
    label: 'Normal',
    color: '#22c55e',
    bgClass: 'bg-green-500/10 text-green-600 border-green-500/30',
    dotClass: 'bg-green-500',
  },
  elevated: {
    label: 'Elevated',
    color: '#eab308',
    bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    dotClass: 'bg-yellow-500',
  },
  high: {
    label: 'High',
    color: '#f97316',
    bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    dotClass: 'bg-orange-500',
  },
  critical: {
    label: 'Critical',
    color: '#ef4444',
    bgClass: 'bg-red-500/10 text-red-600 border-red-500/30',
    dotClass: 'bg-red-500',
  },
  eruptive: {
    label: 'Eruptive',
    color: '#a855f7',
    bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    dotClass: 'bg-purple-500',
  },
}

const GAS_FILTER_OPTIONS: { value: VolcanicGasTrackerState['gasFilter']; label: string }[] = [
  { value: 'all', label: 'All Gas Types' },
  { value: 'so2_dominated', label: 'SO₂ Dominated' },
  { value: 'co2_dominated', label: 'CO₂ Dominated' },
  { value: 'h2s_dominated', label: 'H₂S Dominated' },
  { value: 'mixed', label: 'Mixed Emissions' },
]

function classifyGasType(v: VolcanicGasTrackerData): VolcanicGasTrackerState['gasFilter'] {
  if (v.so2 > v.co2 && v.so2 > v.h2s * 20) return 'so2_dominated'
  if (v.co2 > v.so2 && v.co2 > v.h2s * 20) return 'co2_dominated'
  if (v.h2s * 20 > v.so2 && v.h2s * 20 > v.co2) return 'h2s_dominated'
  return 'mixed'
}

function formatTonnesPerDay(n: number): string {
  if (n >= 10000) return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString()
}

export function VolcanicGasTrackerMonitor() {
  const state = useMapStore((s) => s.volcanicGasTracker)
  const setState = useMapStore((s) => s.setVolcanicGasTracker)

  const volcanoes = useMemo(
    () => (state.volcanoes.length > 0 ? state.volcanoes : DEMO_VOLCANOES),
    [state.volcanoes]
  )

  const filteredVolcanoes = useMemo(() => {
    return volcanoes.filter((v) => {
      if (state.gasFilter !== 'all' && classifyGasType(v) !== state.gasFilter) return false
      return true
    })
  }, [volcanoes, state.gasFilter])

  const summary = useMemo(() => {
    if (filteredVolcanoes.length === 0) {
      return { avgSO2: 0, avgPlumeHeight: 0, dangerCount: 0 }
    }
    const avgSO2 =
      filteredVolcanoes.reduce((sum, v) => sum + v.so2, 0) / filteredVolcanoes.length
    const avgPlumeHeight =
      filteredVolcanoes.reduce((sum, v) => sum + v.plumeHeight, 0) / filteredVolcanoes.length
    const dangerCount = filteredVolcanoes.filter(
      (v) => v.status === 'high' || v.status === 'critical' || v.status === 'eruptive'
    ).length
    return {
      avgSO2: Math.round(avgSO2),
      avgPlumeHeight: Math.round(avgPlumeHeight * 10) / 10,
      dangerCount,
    }
  }, [filteredVolcanoes])

  const activeVolcano = useMemo(
    () => volcanoes.find((v) => v.id === state.activeVolcanoId) ?? null,
    [volcanoes, state.activeVolcanoId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: {
    key: keyof VolcanicGasTrackerState
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { key: 'showSO2', label: 'SO₂', icon: Wind },
    { key: 'showCO2', label: 'CO₂', icon: Flame },
    { key: 'showH2S', label: 'H₂S', icon: Cloud },
    { key: 'showPlumeHeight', label: 'Plume Height', icon: Mountain },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-yellow-950/95 to-stone-950/95 backdrop-blur-xl border border-yellow-800/30 rounded-xl shadow-lg shadow-yellow-900/20 overflow-hidden text-stone-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-200">
              <CloudLightningIcon className="h-4 w-4 text-yellow-500" />
              Volcanic Gas Tracker Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Gas Filter */}
          <div>
            <Label className="text-xs text-yellow-400/70 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Gas Type Filter
            </Label>
            <Select
              value={state.gasFilter}
              onValueChange={(v) =>
                setState({
                  gasFilter: v as VolcanicGasTrackerState['gasFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/50 border-yellow-800/30 text-stone-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GAS_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-yellow-800/20" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-yellow-400/70">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-300">
                  <Icon className="h-3 w-3 text-yellow-600" />
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

          <Separator className="bg-yellow-800/20" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-yellow-800/20 bg-stone-900/40 p-2 text-center">
              <div className="text-[10px] text-yellow-500/60">Avg SO₂</div>
              <div className="text-sm font-semibold text-yellow-300">
                {formatTonnesPerDay(summary.avgSO2)}
              </div>
              <div className="text-[9px] text-stone-500">t/d</div>
            </div>
            <div className="rounded-lg border border-yellow-800/20 bg-stone-900/40 p-2 text-center">
              <div className="text-[10px] text-yellow-500/60">Avg Plume Ht</div>
              <div className="text-sm font-semibold text-yellow-300">
                {summary.avgPlumeHeight}
              </div>
              <div className="text-[9px] text-stone-500">km</div>
            </div>
            <div className="rounded-lg border border-yellow-800/20 bg-stone-900/40 p-2 text-center">
              <div className="text-[10px] text-yellow-500/60">Danger Volcanoes</div>
              <div className="text-sm font-semibold text-red-400">{summary.dangerCount}</div>
              <div className="text-[9px] text-stone-500">high+</div>
            </div>
          </div>

          <Separator className="bg-yellow-800/20" />

          {/* Volcano List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-yellow-400/70">
              Monitored Volcanoes ({filteredVolcanoes.length})
            </Label>
            <ScrollArea className="max-h-[280px]">
              <div className="space-y-2 pr-1">
                {filteredVolcanoes.map((volcano) => {
                  const isActive = state.activeVolcanoId === volcano.id
                  const statusCfg = STATUS_CONFIG[volcano.status]
                  return (
                    <div
                      key={volcano.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-yellow-600/50 bg-yellow-900/20'
                          : 'border-yellow-800/20 bg-stone-900/30 hover:border-yellow-700/30 hover:bg-yellow-900/10'
                      }`}
                      onClick={() =>
                        setState({
                          activeVolcanoId: isActive ? null : volcano.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`h-2 w-2 rounded-full ${statusCfg.dotClass}`}
                          />
                          <span className="text-xs font-medium text-stone-200">{volcano.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      {/* Hazard Level Bar */}
                      <div className="mb-1.5">
                        <div className="flex items-center justify-between text-[10px] text-stone-500 mb-0.5">
                          <span>Hazard Level</span>
                          <span className="font-medium" style={{ color: statusCfg.color }}>
                            {volcano.hazardLevel}%
                          </span>
                        </div>
                        <Progress
                          value={volcano.hazardLevel}
                          className="h-1.5 bg-stone-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-500">
                        {state.showSO2 && (
                          <div>
                            SO₂:{' '}
                            <span className="text-stone-200 font-medium">
                              {formatTonnesPerDay(volcano.so2)} t/d
                            </span>
                          </div>
                        )}
                        {state.showCO2 && (
                          <div>
                            CO₂:{' '}
                            <span className="text-stone-200 font-medium">
                              {formatTonnesPerDay(volcano.co2)} t/d
                            </span>
                          </div>
                        )}
                        {state.showH2S && (
                          <div>
                            H₂S:{' '}
                            <span className="text-stone-200 font-medium">
                              {formatTonnesPerDay(volcano.h2s)} t/d
                            </span>
                          </div>
                        )}
                        {state.showPlumeHeight && (
                          <div>
                            Plume:{' '}
                            <span className="text-stone-200 font-medium">
                              {volcano.plumeHeight} km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredVolcanoes.length === 0 && (
                  <div className="text-center text-xs text-stone-500 py-4">
                    No volcanoes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Volcano Details */}
          {activeVolcano && (
            <>
              <Separator className="bg-yellow-800/20" />
              <div className="space-y-2.5 rounded-lg border border-yellow-700/30 bg-yellow-900/15 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-xs font-semibold text-yellow-200">
                    {activeVolcano.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeVolcano.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeVolcano.status].label}
                  </Badge>
                </div>

                <p className="text-[10px] text-stone-400 leading-relaxed">
                  {activeVolcano.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-500">Coordinates: </span>
                    <span className="font-medium text-stone-200">
                      {activeVolcano.lat.toFixed(2)}, {activeVolcano.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">Hazard Level: </span>
                    <span
                      className="font-medium"
                      style={{ color: STATUS_CONFIG[activeVolcano.status].color }}
                    >
                      {activeVolcano.hazardLevel}%
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">SO₂: </span>
                    <span className="font-medium text-stone-200">
                      {activeVolcano.so2.toLocaleString()} t/d
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">CO₂: </span>
                    <span className="font-medium text-stone-200">
                      {activeVolcano.co2.toLocaleString()} t/d
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">H₂S: </span>
                    <span className="font-medium text-stone-200">
                      {activeVolcano.h2s.toLocaleString()} t/d
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">Plume Height: </span>
                    <span className="font-medium text-stone-200">
                      {activeVolcano.plumeHeight} km
                    </span>
                  </div>
                </div>

                {/* Air Pollution Dispersion Pattern */}
                <div className="rounded-md border border-yellow-800/20 bg-stone-900/50 p-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-3 w-3 text-yellow-600" />
                    <span className="text-[10px] font-medium text-yellow-400/80">
                      Air Pollution Dispersion
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-[9px] text-stone-500">Dispersion</div>
                      <div className="text-[11px] font-semibold text-stone-200">
                        {activeVolcano.plumeHeight >= 8 ? 'Stratospheric' : activeVolcano.plumeHeight >= 4 ? 'Tropospheric' : 'Boundary'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] text-stone-500">Reach Radius</div>
                      <div className="text-[11px] font-semibold text-stone-200">
                        {Math.round(activeVolcano.plumeHeight * 120)} km
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] text-stone-500">Gas Classification</div>
                      <div className="text-[11px] font-semibold text-stone-200 capitalize">
                        {classifyGasType(activeVolcano).replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  {/* Visual dispersion bar */}
                  <div className="mt-2">
                    <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(activeVolcano.hazardLevel, 100)}%`,
                          background: `linear-gradient(to right, ${STATUS_CONFIG[activeVolcano.status].color}80, ${STATUS_CONFIG[activeVolcano.status].color})`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-stone-600 mt-0.5">
                      <span>Source</span>
                      <span>Dispersion range</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer Legend */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              <span className="text-[9px] text-stone-500">Status Legend:</span>
            </div>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-0.5">
                <div className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                <span className="text-[9px] text-stone-500 capitalize">{key}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
