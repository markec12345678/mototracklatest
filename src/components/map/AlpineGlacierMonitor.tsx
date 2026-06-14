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
import { useMapStore, type AlpineGlacierState, type AlpineGlacierData } from '@/lib/map-store'
import { MountainSnow as MountainSnowIcon2, X, TrendingDown, Gauge, Maximize, Ruler, MapPin, Filter } from 'lucide-react'

interface DemoGlacier extends AlpineGlacierData {
  glacierType: 'valley' | 'cirque' | 'hanging' | 'piedmont'
}

const DEMO_GLACIERS: DemoGlacier[] = [
  {
    id: 'agm-aletsch',
    name: 'Aletsch Glacier',
    lat: 46.5,
    lng: 8.0,
    massBalance: -1.2,
    velocity: 45,
    area: 86,
    length: 23,
    elevation: 2800,
    status: 'retreating',
    description: 'Largest glacier in the Alps, experiencing steady mass loss',
    glacierType: 'valley',
  },
  {
    id: 'agm-merdeglace',
    name: 'Mer de Glace',
    lat: 45.9,
    lng: 6.9,
    massBalance: -1.8,
    velocity: 30,
    area: 32,
    length: 12,
    elevation: 2600,
    status: 'rapid_retreat',
    description: 'France\'s largest glacier undergoing rapid retreat and thinning',
    glacierType: 'valley',
  },
  {
    id: 'agm-pasterze',
    name: 'Pasterze Glacier',
    lat: 47.1,
    lng: 12.7,
    massBalance: -1.5,
    velocity: 18,
    area: 18,
    length: 8,
    elevation: 3100,
    status: 'retreating',
    description: 'Austria\'s largest glacier shrinking at an accelerating pace',
    glacierType: 'valley',
  },
  {
    id: 'agm-hintereisferner',
    name: 'Hintereisferner',
    lat: 46.8,
    lng: 10.8,
    massBalance: -0.9,
    velocity: 22,
    area: 7,
    length: 5,
    elevation: 3200,
    status: 'retreating',
    description: 'Research glacier in the Ötztal Alps with long-term monitoring data',
    glacierType: 'cirque',
  },
  {
    id: 'agm-stubai',
    name: 'Stubai Glacier',
    lat: 47.0,
    lng: 11.2,
    massBalance: -2.0,
    velocity: 12,
    area: 4,
    length: 3,
    elevation: 3000,
    status: 'rapid_retreat',
    description: 'Ski resort glacier facing severe ice loss and area reduction',
    glacierType: 'hanging',
  },
  {
    id: 'agm-careser',
    name: 'Careser Glacier',
    lat: 46.4,
    lng: 10.7,
    massBalance: -2.5,
    velocity: 5,
    area: 1.5,
    length: 1.2,
    elevation: 3300,
    status: 'gone',
    description: 'Nearly extinct glacier in the Italian Alps, reduced to remnant ice patches',
    glacierType: 'cirque',
  },
]

const STATUS_CONFIG: Record<
  AlpineGlacierData['status'],
  { label: string; color: string; bgClass: string }
> = {
  advancing: { label: 'Advancing', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  retreating: { label: 'Retreating', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rapid_retreat: { label: 'Rapid Retreat', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  gone: { label: 'Gone', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const GLACIER_TYPE_LABELS: Record<DemoGlacier['glacierType'], string> = {
  valley: 'Valley',
  cirque: 'Cirque',
  hanging: 'Hanging',
  piedmont: 'Piedmont',
}

export function AlpineGlacierMonitor() {
  const state = useMapStore((s) => s.alpineGlacier)
  const setState = useMapStore((s) => s.setAlpineGlacier)

  const glaciers = useMemo(
    () => (state.glaciers.length > 0 ? (state.glaciers as DemoGlacier[]) : DEMO_GLACIERS),
    [state.glaciers]
  )

  const filteredGlaciers = useMemo(() => {
    return glaciers.filter((g) => {
      if (state.typeFilter !== 'all' && g.glacierType !== state.typeFilter) return false
      return true
    })
  }, [glaciers, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredGlaciers.length === 0) {
      return { avgMassBalance: 0, avgVelocity: 0, retreatingCount: 0 }
    }
    const avgMassBalance =
      filteredGlaciers.reduce((sum, g) => sum + g.massBalance, 0) / filteredGlaciers.length
    const avgVelocity =
      filteredGlaciers.reduce((sum, g) => sum + g.velocity, 0) / filteredGlaciers.length
    const retreatingCount = filteredGlaciers.filter(
      (g) => g.status === 'retreating' || g.status === 'rapid_retreat' || g.status === 'gone'
    ).length
    return {
      avgMassBalance: Math.round(avgMassBalance * 10) / 10,
      avgVelocity: Math.round(avgVelocity * 10) / 10,
      retreatingCount,
    }
  }, [filteredGlaciers])

  const activeGlacier = useMemo(
    () => glaciers.find((g) => g.id === state.activeGlacierId) ?? null,
    [glaciers, state.activeGlacierId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AlpineGlacierState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMassBalance', label: 'Mass Balance', icon: TrendingDown },
    { key: 'showVelocity', label: 'Velocity', icon: Gauge },
    { key: 'showArea', label: 'Area', icon: Maximize },
    { key: 'showLength', label: 'Length', icon: Ruler },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-sky-800/40 rounded-xl shadow-lg shadow-sky-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <MountainSnowIcon2 className="h-4 w-4 text-sky-400" />
              Alpine Glacier Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-sky-100 hover:bg-sky-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sky-100">
          {/* Glacier Type Filter */}
          <div>
            <Label className="text-xs text-sky-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Glacier Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as AlpineGlacierState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="valley">Valley</SelectItem>
                <SelectItem value="cirque">Cirque</SelectItem>
                <SelectItem value="hanging">Hanging</SelectItem>
                <SelectItem value="piedmont">Piedmont</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-200">
                  <Icon className="h-3 w-3 text-sky-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Avg Mass Balance</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgMassBalance}</div>
              <div className="text-[9px] text-sky-400">m w.e./yr</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Avg Velocity</div>
              <div className="text-sm font-semibold text-sky-300">{summary.avgVelocity}</div>
              <div className="text-[9px] text-sky-400">m/yr</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Retreating/Gone</div>
              <div className="text-sm font-semibold text-orange-400">{summary.retreatingCount}</div>
              <div className="text-[9px] text-sky-400">glaciers</div>
            </div>
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Glacier List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">
              Glaciers ({filteredGlaciers.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredGlaciers.map((glacier) => {
                  const isActive = state.activeGlacierId === glacier.id
                  const statusCfg = STATUS_CONFIG[glacier.status]
                  return (
                    <div
                      key={glacier.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/60 bg-sky-800/30'
                          : 'border-sky-800/30 hover:border-sky-600/40 hover:bg-sky-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeGlacierId: isActive ? null : glacier.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-sky-100">{glacier.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300">
                        {state.showMassBalance && (
                          <div>
                            Mass Balance:{' '}
                            <span className="text-sky-100 font-medium">
                              {glacier.massBalance} m w.e.
                            </span>
                          </div>
                        )}
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-sky-100 font-medium">
                              {glacier.velocity} m/yr
                            </span>
                          </div>
                        )}
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-sky-100 font-medium">
                              {glacier.area} km&sup2;
                            </span>
                          </div>
                        )}
                        {state.showLength && (
                          <div>
                            Length:{' '}
                            <span className="text-sky-100 font-medium">
                              {glacier.length} km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredGlaciers.length === 0 && (
                  <div className="text-center text-xs text-sky-400 py-4">
                    No glaciers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Glacier Details */}
          {activeGlacier && (
            <>
              <Separator className="bg-sky-800/30" />
              <div className="space-y-2 rounded-lg border border-sky-600/30 bg-sky-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeGlacier.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeGlacier.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeGlacier.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeGlacier.lat.toFixed(1)}, {activeGlacier.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400">Mass Balance: </span>
                    <span className="font-medium text-amber-400">{activeGlacier.massBalance} m w.e./yr</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Velocity: </span>
                    <span className="font-medium text-sky-200">{activeGlacier.velocity} m/yr</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Elevation: </span>
                    <span className="font-medium text-sky-200">{activeGlacier.elevation.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Area: </span>
                    <span className="font-medium text-sky-200">{activeGlacier.area} km&sup2;</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Length: </span>
                    <span className="font-medium text-sky-200">{activeGlacier.length} km</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sky-400">Glacier Type: </span>
                    <span className="font-medium text-sky-200">
                      {(activeGlacier as DemoGlacier).glacierType ? GLACIER_TYPE_LABELS[(activeGlacier as DemoGlacier).glacierType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sky-400">Description: </span>
                    <span className="font-medium text-sky-200">{activeGlacier.description}</span>
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
