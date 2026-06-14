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
import { useMapStore, type MangroveCarbonState, type MangroveCarbonData } from '@/lib/map-store'
import { TreePine as TreePineIcon5, X, BarChart3, MapPin, Filter, Leaf, TrendingUp } from 'lucide-react'

const DEMO_FORESTS: MangroveCarbonData[] = [
  {
    id: 'mc-sundarbans',
    name: 'Sundarbans Bangladesh',
    lat: 22,
    lng: 89.5,
    carbonStock: 2800,
    area: 10000,
    degradation: 25,
    restoration: 30,
    biodiversity: 85,
    status: 'moderate',
    description: 'Largest mangrove forest in the world facing moderate degradation',
  },
  {
    id: 'mc-zambezi',
    name: 'Zambezi Delta Mozambique',
    lat: -18,
    lng: 36,
    carbonStock: 1500,
    area: 3000,
    degradation: 15,
    restoration: 45,
    biodiversity: 78,
    status: 'good',
    description: 'Healthy mangrove system with active restoration programs',
  },
  {
    id: 'mc-borneo',
    name: 'Rhizophora Borneo',
    lat: 3,
    lng: 116,
    carbonStock: 3200,
    area: 8000,
    degradation: 35,
    restoration: 20,
    biodiversity: 90,
    status: 'moderate',
    description: 'Biodiverse mangrove with significant carbon stocks under pressure',
  },
  {
    id: 'mc-everglades',
    name: 'Everglades Florida',
    lat: 25.3,
    lng: -81,
    carbonStock: 1200,
    area: 2000,
    degradation: 40,
    restoration: 55,
    biodiversity: 65,
    status: 'degraded',
    description: 'Degraded mangrove with extensive restoration efforts underway',
  },
  {
    id: 'mc-redsea',
    name: 'Red Sea Egypt',
    lat: 24,
    lng: 36,
    carbonStock: 600,
    area: 500,
    degradation: 10,
    restoration: 70,
    biodiversity: 72,
    status: 'excellent',
    description: 'Pristine mangrove with minimal degradation and strong recovery',
  },
  {
    id: 'mc-niger',
    name: 'Niger Delta',
    lat: 4.5,
    lng: 7,
    carbonStock: 1800,
    area: 5000,
    degradation: 55,
    restoration: 10,
    biodiversity: 45,
    status: 'critical',
    description: 'Severely degraded mangrove from oil pollution and deforestation',
  },
]

const STATUS_CONFIG: Record<
  MangroveCarbonData['status'],
  { label: string; color: string; bgClass: string }
> = {
  excellent: { label: 'Excellent', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function MangroveCarbonMonitor() {
  const state = useMapStore((s) => s.mangroveCarbon)
  const setState = useMapStore((s) => s.setMangroveCarbon)

  const forests = useMemo(
    () => (state.forests.length > 0 ? state.forests : DEMO_FORESTS),
    [state.forests]
  )

  const filteredForests = useMemo(() => {
    return forests.filter((f) => {
      if (state.speciesFilter !== 'all') {
        const speciesMap: Record<string, string[]> = {
          rhizophora: ['mc-sundarbans', 'mc-borneo', 'mc-niger'],
          avicennia: ['mc-zambezi', 'mc-everglades'],
          sonneratia: ['mc-redsea', 'mc-borneo'],
          mixed: ['mc-sundarbans', 'mc-zambezi', 'mc-everglades'],
        }
        if (!speciesMap[state.speciesFilter]?.includes(f.id)) return false
      }
      return true
    })
  }, [forests, state.speciesFilter])

  const summary = useMemo(() => {
    if (filteredForests.length === 0) {
      return { avgCarbonStock: 0, avgDegradation: 0, totalArea: 0 }
    }
    const avgCarbonStock =
      filteredForests.reduce((sum, f) => sum + f.carbonStock, 0) / filteredForests.length
    const avgDegradation =
      filteredForests.reduce((sum, f) => sum + f.degradation, 0) / filteredForests.length
    const totalArea = filteredForests.reduce((sum, f) => sum + f.area, 0)
    return {
      avgCarbonStock: Math.round(avgCarbonStock),
      avgDegradation: Math.round(avgDegradation * 10) / 10,
      totalArea: totalArea.toLocaleString(),
    }
  }, [filteredForests])

  const activeForest = useMemo(
    () => forests.find((f) => f.id === state.activeForestId) ?? null,
    [forests, state.activeForestId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MangroveCarbonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: BarChart3 },
    { key: 'showArea', label: 'Area', icon: MapPin },
    { key: 'showDegradation', label: 'Degradation', icon: TrendingUp },
    { key: 'showRestoration', label: 'Restoration', icon: Leaf },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg shadow-emerald-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <TreePineIcon5 className="h-4 w-4 text-emerald-400" />
              Mangrove Carbon Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Species Filter */}
          <div>
            <Label className="text-xs text-emerald-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Species Type
            </Label>
            <Select
              value={state.speciesFilter}
              onValueChange={(v) =>
                setState({
                  speciesFilter: v as MangroveCarbonState['speciesFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                <SelectItem value="rhizophora">Rhizophora</SelectItem>
                <SelectItem value="avicennia">Avicennia</SelectItem>
                <SelectItem value="sonneratia">Sonneratia</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300">Display Options</Label>
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

          <Separator className="bg-emerald-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg Carbon</div>
              <div className="text-sm font-semibold text-emerald-300">{summary.avgCarbonStock}</div>
              <div className="text-[9px] text-emerald-400">tC/ha</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg Degradation</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgDegradation}%</div>
              <div className="text-[9px] text-emerald-400">impact</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Total Area</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalArea}</div>
              <div className="text-[9px] text-emerald-400">ha</div>
            </div>
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Forest List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300">
              Mangrove Forests ({filteredForests.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredForests.map((forest) => {
                  const isActive = state.activeForestId === forest.id
                  const statusCfg = STATUS_CONFIG[forest.status]
                  return (
                    <div
                      key={forest.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/60 bg-emerald-800/30'
                          : 'border-emerald-800/30 hover:border-emerald-600/40 hover:bg-emerald-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeForestId: isActive ? null : forest.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-emerald-100">{forest.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300">
                        {state.showCarbonStock && (
                          <div>
                            Carbon:{' '}
                            <span className="text-emerald-100 font-medium">
                              {forest.carbonStock} tC/ha
                            </span>
                          </div>
                        )}
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-emerald-100 font-medium">
                              {forest.area.toLocaleString()} ha
                            </span>
                          </div>
                        )}
                        {state.showDegradation && (
                          <div>
                            Degradation:{' '}
                            <span className="text-amber-400 font-medium">
                              {forest.degradation}%
                            </span>
                          </div>
                        )}
                        {state.showRestoration && (
                          <div>
                            Restoration:{' '}
                            <span className="text-emerald-200 font-medium">
                              {forest.restoration}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredForests.length === 0 && (
                  <div className="text-center text-xs text-emerald-400 py-4">
                    No forests match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Forest Details */}
          {activeForest && (
            <>
              <Separator className="bg-emerald-800/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeForest.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeForest.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeForest.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeForest.lat.toFixed(1)}, {activeForest.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Carbon Stock: </span>
                    <span className="font-medium text-emerald-200">{activeForest.carbonStock} tC/ha</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Area: </span>
                    <span className="font-medium text-emerald-200">{activeForest.area.toLocaleString()} ha</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Degradation: </span>
                    <span className="font-medium text-amber-400">{activeForest.degradation}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Restoration: </span>
                    <span className="font-medium text-emerald-200">{activeForest.restoration}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Biodiversity: </span>
                    <span className="font-medium text-emerald-200">{activeForest.biodiversity}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-emerald-400">Description: </span>
                    <span className="font-medium text-emerald-200">{activeForest.description}</span>
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
