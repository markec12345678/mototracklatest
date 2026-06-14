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
import { useMapStore, type CoralSpawnData, type CoralSpawnState } from '@/lib/map-store'
import { Sparkles as SparklesIcon4, X, Thermometer, Moon, Waves, MapPin, Filter } from 'lucide-react'

const DEMO_REEFS: CoralSpawnData[] = [
  {
    id: 'cs-gbr',
    name: 'Great Barrier Reef',
    lat: -18.5,
    lng: 147.5,
    spawnIntensity: 95,
    waterTemp: 26.5,
    lunarPhase: 3,
    larvalDispersion: 45,
    syncIndex: 0.92,
    status: 'peak_spawn',
    description: 'Australia - Multi-species mass spawning event',
  },
  {
    id: 'cs-caribbean',
    name: 'Caribbean Reef',
    lat: 18.0,
    lng: -63.0,
    spawnIntensity: 62,
    waterTemp: 28.5,
    lunarPhase: 5,
    larvalDispersion: 28,
    syncIndex: 0.68,
    status: 'spawning',
    description: 'Bonaire - Diploria spawning',
  },
  {
    id: 'cs-redsea',
    name: 'Red Sea Reef',
    lat: 22.0,
    lng: 38.0,
    spawnIntensity: 78,
    waterTemp: 27.0,
    lunarPhase: 4,
    larvalDispersion: 35,
    syncIndex: 0.85,
    status: 'pre_spawn',
    description: 'Eilat, Israel - Predictable lunar timing',
  },
  {
    id: 'cs-triangle',
    name: 'Coral Triangle',
    lat: -2.0,
    lng: 128.0,
    spawnIntensity: 88,
    waterTemp: 29.5,
    lunarPhase: 2,
    larvalDispersion: 55,
    syncIndex: 0.90,
    status: 'spawning',
    description: 'Raja Ampat - Highest marine biodiversity',
  },
  {
    id: 'cs-maldives',
    name: 'Maldives Atoll',
    lat: 4.0,
    lng: 73.5,
    spawnIntensity: 45,
    waterTemp: 30.5,
    lunarPhase: 6,
    larvalDispersion: 18,
    syncIndex: 0.42,
    status: 'failed',
    description: 'Indian Ocean - Thermal stress disrupted spawning',
  },
  {
    id: 'cs-okinawa',
    name: 'Okinawa Reef',
    lat: 26.5,
    lng: 127.5,
    spawnIntensity: 72,
    waterTemp: 27.5,
    lunarPhase: 4,
    larvalDispersion: 32,
    syncIndex: 0.78,
    status: 'post_spawn',
    description: 'Japan - Acropora spawning completed',
  },
]

const STATUS_CONFIG: Record<
  CoralSpawnData['status'],
  { label: string; color: string; bgClass: string }
> = {
  peak_spawn: { label: 'Peak Spawn', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  spawning: { label: 'Spawning', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  pre_spawn: { label: 'Pre-Spawn', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  post_spawn: { label: 'Post-Spawn', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  failed: { label: 'Failed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const REGION_OPTIONS: { value: CoralSpawnState['regionFilter']; label: string }[] = [
  { value: 'all', label: 'All Regions' },
  { value: 'pacific', label: 'Pacific' },
  { value: 'atlantic', label: 'Atlantic' },
  { value: 'indian', label: 'Indian' },
  { value: 'red_sea', label: 'Red Sea' },
]

function getRegionForReef(reef: CoralSpawnData): CoralSpawnState['regionFilter'] {
  if (reef.id === 'cs-redsea') return 'red_sea'
  if (reef.id === 'cs-caribbean') return 'atlantic'
  if (reef.id === 'cs-maldives') return 'indian'
  return 'pacific'
}

export function CoralSpawnTracker() {
  const state = useMapStore((s) => s.coralSpawn)
  const setState = useMapStore.getState().setCoralSpawn

  useEffect(() => {
    if (state.reefs.length === 0) {
      setState({ reefs: DEMO_REEFS })
    }
  }, [state.reefs.length])

  const reefs = useMemo(
    () => (state.reefs.length > 0 ? state.reefs : DEMO_REEFS),
    [state.reefs]
  )

  const filteredReefs = useMemo(() => {
    return reefs.filter((r) => {
      if (state.regionFilter !== 'all' && getRegionForReef(r) !== state.regionFilter) return false
      return true
    })
  }, [reefs, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredReefs.length === 0) {
      return { avgSpawnIntensity: 0, avgSyncIndex: 0, activeCount: 0 }
    }
    const avgSpawnIntensity = filteredReefs.reduce((sum, r) => sum + r.spawnIntensity, 0) / filteredReefs.length
    const avgSyncIndex = filteredReefs.reduce((sum, r) => sum + r.syncIndex, 0) / filteredReefs.length
    const activeCount = filteredReefs.filter(
      (r) => r.status === 'peak_spawn' || r.status === 'spawning'
    ).length
    return {
      avgSpawnIntensity: Math.round(avgSpawnIntensity * 10) / 10,
      avgSyncIndex: Math.round(avgSyncIndex * 100) / 100,
      activeCount,
    }
  }, [filteredReefs])

  const activeReef = useMemo(
    () => reefs.find((r) => r.id === state.activeReefId) ?? null,
    [reefs, state.activeReefId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoralSpawnState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSpawnIntensity', label: 'Spawn Intensity', icon: SparklesIcon4 },
    { key: 'showWaterTemp', label: 'Water Temperature', icon: Thermometer },
    { key: 'showLunarPhase', label: 'Lunar Phase', icon: Moon },
    { key: 'showLarvalDispersion', label: 'Larval Dispersion', icon: Waves },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-pink-950/95 to-rose-950/95 backdrop-blur-xl border border-pink-800/30 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-pink-100">
              <SparklesIcon4 className="h-4 w-4 text-pink-400" />
              Coral Spawn Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-pink-300 hover:text-pink-100 hover:bg-pink-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-pink-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({
                  regionFilter: v as CoralSpawnState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-pink-900/40 border-pink-700/30 text-pink-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-pink-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-pink-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-pink-200">
                  <Icon className="h-3 w-3 text-pink-400" />
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

          <Separator className="bg-pink-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-300">Avg Spawn Intensity</div>
              <div className="text-sm font-semibold text-pink-100">{summary.avgSpawnIntensity}</div>
              <div className="text-[9px] text-pink-400">intensity</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-300">Avg Sync Index</div>
              <div className="text-sm font-semibold text-pink-100">{summary.avgSyncIndex}</div>
              <div className="text-[9px] text-pink-400">synchrony</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-300">Active Spawning</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.activeCount}</div>
              <div className="text-[9px] text-pink-400">reefs</div>
            </div>
          </div>

          <Separator className="bg-pink-700/30" />

          {/* Reef List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-pink-300">
              Coral Spawn Reefs ({filteredReefs.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredReefs.map((reef) => {
                  const isActive = state.activeReefId === reef.id
                  const statusCfg = STATUS_CONFIG[reef.status]
                  return (
                    <div
                      key={reef.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-pink-500/50 bg-pink-800/20'
                          : 'border-pink-700/30 hover:border-pink-500/30 hover:bg-pink-800/10'
                      }`}
                      onClick={() =>
                        setState({
                          activeReefId: isActive ? null : reef.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-pink-100">{reef.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-pink-300">
                        {state.showSpawnIntensity && (
                          <div>
                            Intensity:{' '}
                            <span className="text-pink-100 font-medium">
                              {reef.spawnIntensity}
                            </span>
                          </div>
                        )}
                        {state.showWaterTemp && (
                          <div>
                            Temp:{' '}
                            <span className="text-pink-100 font-medium">
                              {reef.waterTemp}°C
                            </span>
                          </div>
                        )}
                        {state.showLunarPhase && (
                          <div>
                            Lunar:{' '}
                            <span className="text-pink-100 font-medium">
                              Phase {reef.lunarPhase}
                            </span>
                          </div>
                        )}
                        {state.showLarvalDispersion && (
                          <div>
                            Dispersion:{' '}
                            <span className="text-pink-100 font-medium">
                              {reef.larvalDispersion}km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredReefs.length === 0 && (
                  <div className="text-center text-xs text-pink-400 py-4">
                    No reefs match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Reef Details */}
          {activeReef && (
            <>
              <Separator className="bg-pink-700/30" />
              <div className="space-y-2 rounded-lg border border-pink-500/20 bg-pink-800/15 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-pink-400" />
                  <span className="text-xs font-semibold text-pink-100">{activeReef.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeReef.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeReef.status].label}
                  </Badge>
                </div>
                <div className="text-[10px] text-pink-300 italic mb-1.5">{activeReef.description}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-pink-400">Coordinates: </span>
                    <span className="font-medium text-pink-100">
                      {activeReef.lat.toFixed(1)}, {activeReef.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-pink-400">Intensity: </span>
                    <span className="font-medium text-pink-100">{activeReef.spawnIntensity}</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Water Temp: </span>
                    <span className="font-medium text-pink-100">{activeReef.waterTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Lunar Phase: </span>
                    <span className="font-medium text-pink-100">{activeReef.lunarPhase}</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Larval Dispersion: </span>
                    <span className="font-medium text-pink-100">{activeReef.larvalDispersion} km</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Sync Index: </span>
                    <span className="font-medium text-pink-100">{activeReef.syncIndex}</span>
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
