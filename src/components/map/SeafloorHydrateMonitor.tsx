'use client'

import { useEffect, useMemo } from 'react'
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
import { useMapStore, type SeafloorHydrateState, type SeafloorHydrateData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon7, X, Layers, Activity, Thermometer, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: SeafloorHydrateData[] = [
  {
    id: 'sh-blake-ridge',
    name: 'Blake Ridge',
    lat: 32.0,
    lng: -75.0,
    volume: 1500,
    stability: 'stable',
    seafloorDepth: 2500,
    temperature: 2.1,
    description: 'Large hydrate deposit on continental rise',
  },
  {
    id: 'sh-nankai-trough',
    name: 'Nankai Trough',
    lat: 33.0,
    lng: 137.0,
    volume: 800,
    stability: 'unstable',
    seafloorDepth: 1200,
    temperature: 4.5,
    description: 'Active margin hydrate system',
  },
  {
    id: 'sh-cascadia-margin',
    name: 'Cascadia Margin',
    lat: 44.5,
    lng: -125.0,
    volume: 600,
    stability: 'dissociating',
    seafloorDepth: 800,
    temperature: 5.2,
    description: 'Warming-induced dissociation zone',
  },
  {
    id: 'sh-gulf-mexico',
    name: 'Gulf of Mexico',
    lat: 27.0,
    lng: -90.0,
    volume: 400,
    stability: 'critical',
    seafloorDepth: 1500,
    temperature: 6.8,
    description: 'Temperature-sensitive deposit',
  },
]

const STATUS_COLORS: Record<SeafloorHydrateData['stability'], { label: string; color: string; bgClass: string }> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  unstable: { label: 'Unstable', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  dissociating: { label: 'Dissociating', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ stability }: { stability: SeafloorHydrateData['stability'] }) {
  const cfg = STATUS_COLORS[stability]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SeafloorHydrateMonitor() {
  const state = useMapStore((s) => s.seafloorHydrate)
  const setState = useMapStore((s) => s.setSeafloorHydrate)

  const deposits = useMemo(
    () => (state.deposits.length > 0 ? state.deposits : SAMPLE_LOCATIONS),
    [state.deposits]
  )

  const filteredDeposits = useMemo(() => {
    return deposits.filter((d) => {
      if (state.stabilityFilter !== 'all' && d.stability !== state.stabilityFilter) return false
      return true
    })
  }, [deposits, state.stabilityFilter])

  const summary = useMemo(() => {
    if (filteredDeposits.length === 0) {
      return { totalDeposits: 0, totalVolume: 0, avgDepth: 0, stabilityStatus: 'N/A' }
    }
    const totalVolume = filteredDeposits.reduce((sum, d) => sum + d.volume, 0)
    const avgDepth = filteredDeposits.reduce((sum, d) => sum + d.seafloorDepth, 0) / filteredDeposits.length
    const criticalCount = filteredDeposits.filter((d) => d.stability === 'critical' || d.stability === 'dissociating').length
    const stabilityStatus = criticalCount > 0 ? `${criticalCount} at risk` : 'All stable'
    return {
      totalDeposits: filteredDeposits.length,
      totalVolume: Math.round(totalVolume),
      avgDepth: Math.round(avgDepth * 10) / 10,
      stabilityStatus,
    }
  }, [filteredDeposits])

  const activeDeposit = useMemo(
    () => deposits.find((d) => d.id === state.activeDepositId) ?? null,
    [deposits, state.activeDepositId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredDeposits.map((d) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] },
      properties: { id: d.id, name: d.name, stability: d.stability, volume: d.volume },
    })),
  }), [filteredDeposits])

  useEffect(() => {
    if (state.deposits.length === 0) {
      useMapStore.getState().setSeafloorHydrate({ deposits: SAMPLE_LOCATIONS })
    }
  }, [state.deposits.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeafloorHydrateState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVolume', label: 'Volume', icon: Layers },
    { key: 'showStability', label: 'Stability', icon: AlertTriangle },
    { key: 'showDepth', label: 'Seafloor Depth', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-slate-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <SnowflakeIcon7 className="h-4 w-4 text-cyan-400" />
              Seafloor Hydrate Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Stability Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Stability Level
            </Label>
            <Select
              value={state.stabilityFilter}
              onValueChange={(v) =>
                setState({ stabilityFilter: v as SeafloorHydrateState['stabilityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stability</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="unstable">Unstable</SelectItem>
                <SelectItem value="dissociating">Dissociating</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Deposits</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalDeposits}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Volume</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalVolume}</div>
              <div className="text-[9px] text-cyan-400/60">km³</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgDepth}</div>
              <div className="text-[9px] text-cyan-400/60">meters</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Stability Status</div>
              <div className="text-sm font-semibold text-orange-400">{summary.stabilityStatus}</div>
              <div className="text-[9px] text-cyan-400/60">assessment</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Deposit List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Deposits ({filteredDeposits.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredDeposits.map((deposit) => {
                  const isActive = state.activeDepositId === deposit.id
                  const statusCfg = STATUS_COLORS[deposit.stability]
                  return (
                    <div
                      key={deposit.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeDepositId: isActive ? null : deposit.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon stability={deposit.stability} />
                          <span className="text-xs font-medium text-cyan-100">{deposit.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-cyan-100 font-medium">{deposit.volume}km³</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-cyan-100 font-medium">{deposit.seafloorDepth}m</span>
                          </div>
                        )}
                        {state.showStability && (
                          <div>
                            Temperature:{' '}
                            <span className="text-cyan-100 font-medium">{deposit.temperature}°C</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredDeposits.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No deposits match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Deposit Details */}
          {activeDeposit && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeDeposit.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeDeposit.stability].bgClass}`}
                  >
                    {STATUS_COLORS[activeDeposit.stability].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeDeposit.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeDeposit.lat.toFixed(1)}, {activeDeposit.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Volume: </span>
                    <span className="font-medium text-cyan-100">{activeDeposit.volume}km³</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Seafloor Depth: </span>
                    <span className="font-medium text-cyan-100">{activeDeposit.seafloorDepth}m</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Temperature: </span>
                    <span className="font-medium text-orange-400">{activeDeposit.temperature}°C</span>
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
