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
import { useMapStore, type NutritionSecurityState, type NutritionSecurityData } from '@/lib/map-store'
import { Apple as AppleIcon, X, Activity, TrendingDown, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: NutritionSecurityData[] = [
  {
    id: 'ns-hornafrica',
    name: 'Horn of Africa',
    lat: 5.000,
    lng: 42.000,
    foodSecurityIndex: 22,
    malnutritionRate: 42,
    stuntingPrevalence: 38,
    dietaryDiversity: 2.8,
    status: 'critical',
    description: 'Severe food insecurity across the Horn of Africa due to prolonged drought',
  },
  {
    id: 'ns-yemen',
    name: 'Yemen Crisis',
    lat: 15.500,
    lng: 48.500,
    foodSecurityIndex: 15,
    malnutritionRate: 55,
    stuntingPrevalence: 46,
    dietaryDiversity: 2.1,
    status: 'critical',
    description: 'Yemen facing one of the worst humanitarian crises with widespread malnutrition',
  },
  {
    id: 'ns-sahel',
    name: 'Sahel Band',
    lat: 14.000,
    lng: 1.000,
    foodSecurityIndex: 35,
    malnutritionRate: 32,
    stuntingPrevalence: 28,
    dietaryDiversity: 3.5,
    status: 'severe',
    description: 'Sahel region experiencing chronic food insecurity from climate and conflict',
  },
  {
    id: 'ns-afghanistan',
    name: 'Afghanistan',
    lat: 33.900,
    lng: 67.700,
    foodSecurityIndex: 28,
    malnutritionRate: 38,
    stuntingPrevalence: 41,
    dietaryDiversity: 2.5,
    status: 'critical',
    description: 'Afghanistan facing acute malnutrition crisis affecting children and women',
  },
]

const STATUS_COLORS: Record<NutritionSecurityData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  severe: { label: 'Severe', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  adequate: { label: 'Adequate', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  optimal: { label: 'Optimal', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
}

function TrendIcon({ status }: { status: NutritionSecurityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function NutritionSecurityMonitor() {
  const state = useMapStore((s) => s.nutritionSecurity)
  const setState = useMapStore((s) => s.setNutritionSecurity)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalRegions: 0, avgFoodSec: 0, avgStunting: 0, avgMalnut: 0 }
    }
    const avgFoodSec = filteredItems.reduce((sum, e) => sum + e.foodSecurityIndex, 0) / filteredItems.length
    const avgStunting = filteredItems.reduce((sum, e) => sum + e.stuntingPrevalence, 0) / filteredItems.length
    const avgMalnut = filteredItems.reduce((sum, e) => sum + e.malnutritionRate, 0) / filteredItems.length
    return {
      totalRegions: filteredItems.length,
      avgFoodSec: Math.round(avgFoodSec),
      avgStunting: Math.round(avgStunting),
      avgMalnut: Math.round(avgMalnut),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, foodSecurityIndex: e.foodSecurityIndex },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setNutritionSecurity({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof NutritionSecurityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFoodSecurityIndex', label: 'Food Security', icon: Activity },
    { key: 'showMalnutritionRate', label: 'Malnutrition Rate', icon: TrendingDown },
    { key: 'showStuntingPrevalence', label: 'Stunting %', icon: AppleIcon },
    { key: 'showDietaryDiversity', label: 'Wasting %', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-lime-950/95 backdrop-blur-xl border border-green-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-green-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-100">
              <AppleIcon className="h-4 w-4 text-green-400" />
              Nutrition Security Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-300 hover:text-green-100 hover:bg-green-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-green-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-green-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as NutritionSecurityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-green-900/40 border-green-700/40 text-green-100 hover:bg-green-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-green-200">
                  <Icon className="h-3 w-3 text-green-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-green-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Stunting %</div>
              <div className="text-sm font-semibold text-green-300">{summary.avgStunting}%</div>
              <div className="text-[9px] text-green-400/60">average</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Malnutrition</div>
              <div className="text-sm font-semibold text-lime-300">{summary.avgMalnut}%</div>
              <div className="text-[9px] text-green-400/60">wasting rate</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Food Security</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgFoodSec}</div>
              <div className="text-[9px] text-green-400/60">index score</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Regions</div>
              <div className="text-sm font-semibold text-green-200">{summary.totalRegions}</div>
              <div className="text-[9px] text-green-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">
              Nutrition Zones ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-500/50 bg-green-800/30'
                          : 'border-green-700/30 hover:border-green-500/30 hover:bg-green-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-green-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-green-300/60">
                        {state.showFoodSecurityIndex && (
                          <div>
                            Food Sec:{' '}
                            <span className="text-green-100 font-medium">{e.foodSecurityIndex}</span>
                          </div>
                        )}
                        {state.showMalnutritionRate && (
                          <div>
                            Malnut:{' '}
                            <span className="text-green-100 font-medium">{e.malnutritionRate}%</span>
                          </div>
                        )}
                        {state.showStuntingPrevalence && (
                          <div>
                            Stunting:{' '}
                            <span className="text-green-100 font-medium">{e.stuntingPrevalence}%</span>
                          </div>
                        )}
                        {state.showDietaryDiversity && (
                          <div>
                            Diversity:{' '}
                            <span className="text-green-100 font-medium">{e.dietaryDiversity}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-green-400/50 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-green-700/30" />
              <div className="space-y-2 rounded-lg border border-green-600/30 bg-green-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-green-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-green-400/70">Coordinates: </span>
                    <span className="font-medium text-green-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Stunting: </span>
                    <span className="font-medium text-green-300">{activeItem.stuntingPrevalence}%</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Malnutrition: </span>
                    <span className="font-medium text-lime-300">{activeItem.malnutritionRate}%</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Food Sec: </span>
                    <span className="font-medium text-emerald-400">{activeItem.foodSecurityIndex}</span>
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
