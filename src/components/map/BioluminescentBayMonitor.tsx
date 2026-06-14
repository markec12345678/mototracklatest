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
import { useMapStore, type BioluminescentBayState, type BioluminescentBayData } from '@/lib/map-store'
import { Sparkles as SparklesIcon5, X, BarChart3, MapPin, Filter, TrendingUp, Activity } from 'lucide-react'

const DEMO_BAYS: BioluminescentBayData[] = [
  {
    id: 'bb-mosquito',
    name: 'Mosquito Bay Puerto Rico',
    lat: 18.1,
    lng: -65.5,
    brightness: 100,
    dinoflagellate: 700000,
    waterQuality: 90,
    tourism: 85,
    area: 0.2,
    status: 'spectacular',
    description: 'Guinness World Record brightest bioluminescent bay on Earth',
  },
  {
    id: 'bb-vaadhoo',
    name: 'Vaadhoo Maldives',
    lat: 5.4,
    lng: 72.9,
    brightness: 85,
    dinoflagellate: 500000,
    waterQuality: 82,
    tourism: 70,
    area: 0.5,
    status: 'excellent',
    description: 'Famous "Sea of Stars" phenomenon with consistent bioluminescence',
  },
  {
    id: 'bb-jamaica',
    name: 'Bioluminescent Bay Jamaica',
    lat: 18.4,
    lng: -76.3,
    brightness: 60,
    dinoflagellate: 200000,
    waterQuality: 55,
    tourism: 65,
    area: 0.15,
    status: 'fading',
    description: 'Luminous Lagoon experiencing decline from pollution and development',
  },
  {
    id: 'bb-toyama',
    name: 'Toyama Bay Japan',
    lat: 36.8,
    lng: 137.2,
    brightness: 70,
    dinoflagellate: 350000,
    waterQuality: 75,
    tourism: 50,
    area: 1.0,
    status: 'good',
    description: 'Seasonal firefly squid creating spectacular blue glow',
  },
  {
    id: 'bb-jervis',
    name: 'Jervis Bay Australia',
    lat: -35,
    lng: 150.7,
    brightness: 55,
    dinoflagellate: 150000,
    waterQuality: 68,
    tourism: 35,
    area: 0.8,
    status: 'good',
    description: 'Reliable bioluminescence in protected marine park',
  },
  {
    id: 'bb-halong',
    name: 'Halong Bay Vietnam',
    lat: 20.9,
    lng: 107.2,
    brightness: 30,
    dinoflagellate: 50000,
    waterQuality: 30,
    tourism: 90,
    area: 2.0,
    status: 'fading',
    description: 'Once-brilliant bay now fading due to tourism pressure and pollution',
  },
]

const STATUS_CONFIG: Record<
  BioluminescentBayData['status'],
  { label: string; color: string; bgClass: string }
> = {
  spectacular: { label: 'Spectacular', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  excellent: { label: 'Excellent', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  good: { label: 'Good', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  fading: { label: 'Fading', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  lost: { label: 'Lost', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function BioluminescentBayMonitor() {
  const state = useMapStore((s) => s.bioluminescentBay)
  const setState = useMapStore((s) => s.setBioluminescentBay)

  const bays = useMemo(
    () => (state.bays.length > 0 ? state.bays : DEMO_BAYS),
    [state.bays]
  )

  const filteredBays = useMemo(() => {
    return bays.filter((b) => {
      if (state.qualityFilter !== 'all') {
        const qualityMap: Record<string, string[]> = {
          spectacular: ['bb-mosquito'],
          excellent: ['bb-vaadhoo'],
          good: ['bb-toyama', 'bb-jervis'],
          fading: ['bb-jamaica', 'bb-halong'],
          lost: [],
        }
        if (!qualityMap[state.qualityFilter]?.includes(b.id)) return false
      }
      return true
    })
  }, [bays, state.qualityFilter])

  const summary = useMemo(() => {
    if (filteredBays.length === 0) {
      return { avgBrightness: 0, avgWaterQuality: 0, avgDinoflagellate: 0 }
    }
    const avgBrightness =
      filteredBays.reduce((sum, b) => sum + b.brightness, 0) / filteredBays.length
    const avgWaterQuality =
      filteredBays.reduce((sum, b) => sum + b.waterQuality, 0) / filteredBays.length
    const avgDinoflagellate =
      filteredBays.reduce((sum, b) => sum + b.dinoflagellate, 0) / filteredBays.length
    return {
      avgBrightness: Math.round(avgBrightness),
      avgWaterQuality: Math.round(avgWaterQuality),
      avgDinoflagellate: Math.round(avgDinoflagellate).toLocaleString(),
    }
  }, [filteredBays])

  const activeBay = useMemo(
    () => bays.find((b) => b.id === state.activeBayId) ?? null,
    [bays, state.activeBayId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof BioluminescentBayState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showBrightness', label: 'Brightness', icon: SparklesIcon5 },
    { key: 'showDinoflagellate', label: 'Dinoflagellate Count', icon: BarChart3 },
    { key: 'showWaterQuality', label: 'Water Quality', icon: Activity },
    { key: 'showTourism', label: 'Tourism Impact', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-blue-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg shadow-cyan-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <SparklesIcon5 className="h-4 w-4 text-cyan-400" />
              Bioluminescent Bay Monitor
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
          {/* Quality Filter */}
          <div>
            <Label className="text-xs text-cyan-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Quality Level
            </Label>
            <Select
              value={state.qualityFilter}
              onValueChange={(v) =>
                setState({
                  qualityFilter: v as BioluminescentBayState['qualityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="spectacular">Spectacular</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fading">Fading</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300">Display Options</Label>
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

          <Separator className="bg-cyan-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Avg Brightness</div>
              <div className="text-sm font-semibold text-cyan-300">{summary.avgBrightness}</div>
              <div className="text-[9px] text-cyan-400">index</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Water Quality</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgWaterQuality}%</div>
              <div className="text-[9px] text-cyan-400">score</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Dinoflag.</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgDinoflagellate}</div>
              <div className="text-[9px] text-cyan-400">cells/L</div>
            </div>
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Bay List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300">
              Bioluminescent Bays ({filteredBays.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredBays.map((bay) => {
                  const isActive = state.activeBayId === bay.id
                  const statusCfg = STATUS_CONFIG[bay.status]
                  return (
                    <div
                      key={bay.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/60 bg-cyan-800/30'
                          : 'border-cyan-800/30 hover:border-cyan-600/40 hover:bg-cyan-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeBayId: isActive ? null : bay.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-cyan-100">{bay.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300">
                        {state.showBrightness && (
                          <div>
                            Brightness:{' '}
                            <span className="text-cyan-100 font-medium">
                              {bay.brightness}
                            </span>
                          </div>
                        )}
                        {state.showDinoflagellate && (
                          <div>
                            Dinoflag.:{' '}
                            <span className="text-cyan-100 font-medium">
                              {bay.dinoflagellate.toLocaleString()}/L
                            </span>
                          </div>
                        )}
                        {state.showWaterQuality && (
                          <div>
                            Water Quality:{' '}
                            <span className="text-emerald-400 font-medium">
                              {bay.waterQuality}%
                            </span>
                          </div>
                        )}
                        {state.showTourism && (
                          <div>
                            Tourism:{' '}
                            <span className="text-amber-400 font-medium">
                              {bay.tourism}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredBays.length === 0 && (
                  <div className="text-center text-xs text-cyan-400 py-4">
                    No bays match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Bay Details */}
          {activeBay && (
            <>
              <Separator className="bg-cyan-800/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeBay.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeBay.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeBay.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeBay.lat.toFixed(1)}, {activeBay.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Brightness: </span>
                    <span className="font-medium text-cyan-200">{activeBay.brightness}</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Dinoflagellate: </span>
                    <span className="font-medium text-cyan-200">{activeBay.dinoflagellate.toLocaleString()}/L</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Water Quality: </span>
                    <span className="font-medium text-emerald-400">{activeBay.waterQuality}%</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Tourism: </span>
                    <span className="font-medium text-amber-400">{activeBay.tourism}%</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Area: </span>
                    <span className="font-medium text-cyan-200">{activeBay.area} km²</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-cyan-400">Description: </span>
                    <span className="font-medium text-cyan-200">{activeBay.description}</span>
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
