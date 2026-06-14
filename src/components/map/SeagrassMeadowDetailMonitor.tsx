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
import { useMapStore, type SeagrassMeadowState, type SeagrassMeadowData } from '@/lib/map-store'
import { Leaf as LeafIcon4, X, Gauge, MapPin, Filter, Droplets } from 'lucide-react'

const DEMO_MEADOWS: SeagrassMeadowData[] = [
  {
    id: 'sgd-posidonia-med',
    name: 'Posidonia Mediterranean',
    lat: 40.0,
    lng: 18.0,
    coverage: 850,
    carbonStock: 12.5,
    waterClarity: 82,
    shootDensity: 450,
    depthRange: 35,
    status: 'good',
    description: 'Extensive Posidonia oceanica meadows across the Mediterranean basin',
  },
  {
    id: 'sgd-shark-bay',
    name: 'Shark Bay Australia',
    lat: -26.0,
    lng: 113.5,
    coverage: 4000,
    carbonStock: 18.2,
    waterClarity: 92,
    shootDensity: 680,
    depthRange: 12,
    status: 'excellent',
    description: 'World Heritage-listed seagrass meadows, largest reported globally',
  },
  {
    id: 'sgd-chesapeake',
    name: 'Chesapeake Eelgrass',
    lat: 37.5,
    lng: -76.0,
    coverage: 220,
    carbonStock: 5.8,
    waterClarity: 42,
    shootDensity: 180,
    depthRange: 2,
    status: 'declining',
    description: 'Declining eelgrass beds under stress from nutrient pollution and warming',
  },
  {
    id: 'sgd-florida-keys',
    name: 'Florida Keys',
    lat: 24.5,
    lng: -81.0,
    coverage: 580,
    carbonStock: 8.5,
    waterClarity: 55,
    shootDensity: 280,
    depthRange: 8,
    status: 'moderate',
    description: 'Thalassia testudinum-dominated meadows under moderate stress',
  },
  {
    id: 'sgd-cymodocea-med',
    name: 'Mediterranean Cymodocea',
    lat: 38.0,
    lng: 23.5,
    coverage: 320,
    carbonStock: 7.2,
    waterClarity: 65,
    shootDensity: 320,
    depthRange: 25,
    status: 'good',
    description: 'Cymodocea nodosa meadows in the Aegean Sea region',
  },
  {
    id: 'sgd-tampa-bay',
    name: 'Tampa Bay',
    lat: 27.8,
    lng: -82.5,
    coverage: 165,
    carbonStock: 4.2,
    waterClarity: 38,
    shootDensity: 120,
    depthRange: 1.5,
    status: 'critical',
    description: 'Severely impacted seagrass beds requiring urgent restoration',
  },
]

const STATUS_CONFIG: Record<
  SeagrassMeadowData['status'],
  { label: string; color: string; bgClass: string }
> = {
  excellent: { label: 'Excellent', color: '#059669', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  declining: { label: 'Declining', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SPECIES_LABELS: Record<SeagrassMeadowState['speciesFilter'], string> = {
  all: 'All Species',
  posidonia: 'Posidonia',
  zostera: 'Zostera',
  thalassia: 'Thalassia',
  cymodocea: 'Cymodocea',
}

function inferSpecies(meadow: SeagrassMeadowData): SeagrassMeadowState['speciesFilter'] | null {
  const n = meadow.name.toLowerCase()
  if (n.includes('posidonia')) return 'posidonia'
  if (n.includes('eelgrass')) return 'zostera'
  if (n.includes('florida') || n.includes('tampa')) return 'thalassia'
  if (n.includes('cymodocea')) return 'cymodocea'
  return null
}

export function SeagrassMeadowDetailMonitor() {
  const state = useMapStore((s) => s.seagrassMeadow)
  const setState = useMapStore((s) => s.setSeagrassMeadow)

  const meadows = useMemo(
    () => (state.meadows && state.meadows.length > 0 ? state.meadows : DEMO_MEADOWS),
    [state.meadows]
  )

  const filteredMeadows = useMemo(() => {
    return meadows.filter((m) => {
      if (state.speciesFilter !== 'all') {
        const species = inferSpecies(m)
        if (species !== state.speciesFilter) return false
      }
      return true
    })
  }, [meadows, state.speciesFilter])

  const summary = useMemo(() => {
    if (filteredMeadows.length === 0) {
      return { avgCoverage: 0, avgCarbonStock: 0, decliningCriticalCount: 0 }
    }
    const avgCoverage = filteredMeadows.reduce((sum, m) => sum + m.coverage, 0) / filteredMeadows.length
    const avgCarbonStock = filteredMeadows.reduce((sum, m) => sum + m.carbonStock, 0) / filteredMeadows.length
    const decliningCriticalCount = filteredMeadows.filter(
      (m) => m.status === 'declining' || m.status === 'critical'
    ).length
    return {
      avgCoverage: Math.round(avgCoverage),
      avgCarbonStock: Math.round(avgCarbonStock * 10) / 10,
      decliningCriticalCount,
    }
  }, [filteredMeadows])

  const activeMeadow = useMemo(
    () => meadows.find((m) => m.id === state.activeMeadowId) ?? null,
    [meadows, state.activeMeadowId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeagrassMeadowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCoverage', label: 'Coverage', icon: LeafIcon4 },
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Gauge },
    { key: 'showWaterClarity', label: 'Water Clarity', icon: Droplets },
    { key: 'showHealthStatus', label: 'Health Status', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 backdrop-blur-xl border border-emerald-500/20 rounded-xl shadow-lg shadow-emerald-900/20 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <LeafIcon4 className="h-4 w-4 text-emerald-400" />
              Seagrass Meadow Detail Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/50"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Species Filter */}
          <div>
            <Label className="text-xs text-emerald-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Species Type
            </Label>
            <Select
              value={state.speciesFilter}
              onValueChange={(v) =>
                setState({
                  speciesFilter: v as SeagrassMeadowState['speciesFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/50 border-emerald-700/40 text-emerald-100 focus:ring-emerald-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SPECIES_LABELS) as SeagrassMeadowState['speciesFilter'][]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SPECIES_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/80">Avg Coverage</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.avgCoverage}</div>
              <div className="text-[9px] text-emerald-400/60">km²</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/80">Avg Carbon Stock</div>
              <div className="text-sm font-semibold text-teal-300">{summary.avgCarbonStock}</div>
              <div className="text-[9px] text-emerald-400/60">tC/ha</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/80">Declining/Critical</div>
              <div className="text-sm font-semibold text-red-400">{summary.decliningCriticalCount}</div>
              <div className="text-[9px] text-emerald-400/60">meadows</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Meadow List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
              Seagrass Meadows ({filteredMeadows.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredMeadows.map((meadow) => {
                  const isActive = state.activeMeadowId === meadow.id
                  const statusCfg = STATUS_CONFIG[meadow.status]
                  return (
                    <div
                      key={meadow.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/25 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeMeadowId: isActive ? null : meadow.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-emerald-100">{meadow.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/70">
                        {state.showCoverage && (
                          <div>
                            Coverage:{' '}
                            <span className="text-emerald-100 font-medium">
                              {meadow.coverage} km²
                            </span>
                          </div>
                        )}
                        {state.showCarbonStock && (
                          <div>
                            Carbon Stock:{' '}
                            <span className="text-emerald-100 font-medium">
                              {meadow.carbonStock} tC/ha
                            </span>
                          </div>
                        )}
                        {state.showWaterClarity && (
                          <div>
                            Water Clarity:{' '}
                            <span className="text-emerald-100 font-medium">
                              {meadow.waterClarity}%
                            </span>
                          </div>
                        )}
                        {state.showHealthStatus && (
                          <div>
                            Health:{' '}
                            <span className="text-emerald-100 font-medium">
                              {statusCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredMeadows.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/60 py-4">
                    No meadows match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Meadow Details */}
          {activeMeadow && (
            <>
              <Separator className="bg-emerald-700/30" />
              <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-800/25 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeMeadow.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeMeadow.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeMeadow.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400/70">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeMeadow.lat.toFixed(1)}, {activeMeadow.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Species: </span>
                    <span className="font-medium text-emerald-100 capitalize">
                      {inferSpecies(activeMeadow) ?? 'Mixed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Coverage: </span>
                    <span className="font-medium text-emerald-100">{activeMeadow.coverage} km²</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Carbon Stock: </span>
                    <span className="font-medium text-emerald-100">{activeMeadow.carbonStock} tC/ha</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Shoot Density: </span>
                    <span className="font-medium text-emerald-100">{activeMeadow.shootDensity}/m²</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Water Clarity: </span>
                    <span className="font-medium text-emerald-100">{activeMeadow.waterClarity}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Depth Range: </span>
                    <span className="font-medium text-emerald-100">{activeMeadow.depthRange}m</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Status: </span>
                    <span className="font-medium text-emerald-100">{STATUS_CONFIG[activeMeadow.status].label}</span>
                  </div>
                </div>
                {activeMeadow.description && (
                  <div className="text-[10px] text-emerald-300/60 pt-1 border-t border-emerald-700/20">
                    {activeMeadow.description}
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
