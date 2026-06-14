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
import { useMapStore, type CaveEcosystemState, type CaveEcosystemData } from '@/lib/map-store'
import { Mountain as MountainIcon6, X, Bug, Thermometer, Droplets, GlassWater, MapPin, Filter } from 'lucide-react'

const DEMO_CAVES: CaveEcosystemData[] = [
  {
    id: 'ce-1', name: 'Mammoth Cave USA', lat: 37.2, lng: -86, biodiversity: 85, temperature: 13, humidity: 98, waterQuality: 80, depth: 140, status: 'good', description: 'World\'s longest cave system with rich endemic species',
  },
  {
    id: 'ce-2', name: 'Son Doong Vietnam', lat: 17.5, lng: 106, biodiversity: 92, temperature: 22, humidity: 95, waterQuality: 88, depth: 450, status: 'pristine', description: 'World\'s largest cave passage with unique ecosystem',
  },
  {
    id: 'ce-3', name: 'Waitomo NZ', lat: -38.3, lng: 175, biodiversity: 75, temperature: 12, humidity: 97, waterQuality: 72, depth: 80, status: 'good', description: 'Glowworm cave ecosystem in New Zealand limestone',
  },
  {
    id: 'ce-4', name: 'Postojna Slovenia', lat: 45.8, lng: 14.2, biodiversity: 65, temperature: 10, humidity: 95, waterQuality: 55, depth: 120, status: 'moderate', description: 'Tourism-impacted karst cave with olm populations',
  },
  {
    id: 'ce-5', name: 'Lascaux France', lat: 45.1, lng: 1.2, biodiversity: 40, temperature: 13, humidity: 98, waterQuality: 35, depth: 30, status: 'degraded', description: 'Famous painted cave suffering from microbial invasion',
  },
  {
    id: 'ce-6', name: 'Cango South Africa', lat: -33.4, lng: 22.2, biodiversity: 50, temperature: 18, humidity: 90, waterQuality: 45, depth: 60, status: 'moderate', description: 'Precambrian limestone cave with conservation challenges',
  },
]

const STATUS_CONFIG: Record<CaveEcosystemData['status'], { label: string; color: string; bgClass: string }> = {
  pristine: { label: 'Pristine', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function CaveEcosystemMonitor() {
  const state = useMapStore((s) => s.caveEcosystem)
  const setState = useMapStore((s) => s.setCaveEcosystem)

  const caves = useMemo(
    () => (state.caves.length > 0 ? state.caves : DEMO_CAVES),
    [state.caves]
  )

  const filteredCaves = useMemo(() => {
    return caves.filter((c) => {
      if (state.typeFilter !== 'all') return true
      return true
    })
  }, [caves, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredCaves.length === 0) {
      return { avgBiodiversity: 0, avgTemperature: 0, degradedCount: 0 }
    }
    const avgBiodiversity = filteredCaves.reduce((sum, c) => sum + c.biodiversity, 0) / filteredCaves.length
    const avgTemperature = filteredCaves.reduce((sum, c) => sum + c.temperature, 0) / filteredCaves.length
    const degradedCount = filteredCaves.filter((c) => c.status === 'degraded' || c.status === 'critical').length
    return {
      avgBiodiversity: Math.round(avgBiodiversity),
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      degradedCount,
    }
  }, [filteredCaves])

  const activeCave = useMemo(
    () => caves.find((c) => c.id === state.activeCaveId) ?? null,
    [caves, state.activeCaveId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CaveEcosystemState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showBiodiversity', label: 'Biodiversity', icon: Bug },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showHumidity', label: 'Humidity', icon: Droplets },
    { key: 'showWaterQuality', label: 'Water Quality', icon: GlassWater },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-amber-950/95 backdrop-blur-xl border border-stone-700/40 rounded-xl shadow-lg shadow-stone-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <MountainIcon6 className="h-4 w-4 text-stone-400" />
              Cave Ecosystem Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-300 hover:text-stone-100 hover:bg-stone-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-stone-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-stone-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Cave Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({ typeFilter: v as CaveEcosystemState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-800/40 border-stone-600/40 text-stone-100 hover:bg-stone-800/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="limestone">Limestone</SelectItem>
                <SelectItem value="lava_tube">Lava Tube</SelectItem>
                <SelectItem value="ice">Ice Cave</SelectItem>
                <SelectItem value="sea">Sea Cave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-200">
                  <Icon className="h-3 w-3 text-stone-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-stone-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-stone-600/30 bg-stone-800/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Biodiversity</div>
              <div className="text-sm font-semibold text-amber-300">{summary.avgBiodiversity}</div>
              <div className="text-[9px] text-stone-400">%</div>
            </div>
            <div className="rounded-lg border border-stone-600/30 bg-stone-800/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Temperature</div>
              <div className="text-sm font-semibold text-stone-300">{summary.avgTemperature}</div>
              <div className="text-[9px] text-stone-400">&deg;C</div>
            </div>
            <div className="rounded-lg border border-stone-600/30 bg-stone-800/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Degraded</div>
              <div className="text-sm font-semibold text-orange-400">{summary.degradedCount}</div>
              <div className="text-[9px] text-stone-400">caves</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Cave List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300">
              Cave Ecosystems ({filteredCaves.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCaves.map((cave) => {
                  const isActive = state.activeCaveId === cave.id
                  const statusCfg = STATUS_CONFIG[cave.status]
                  return (
                    <div
                      key={cave.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-stone-500/60 bg-stone-800/30'
                          : 'border-stone-700/30 hover:border-stone-500/40 hover:bg-stone-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeCaveId: isActive ? null : cave.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-stone-100">{cave.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300">
                        {state.showBiodiversity && (
                          <div>
                            Biodiv: <span className="text-stone-100 font-medium">{cave.biodiversity}%</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp: <span className="text-stone-100 font-medium">{cave.temperature}&deg;C</span>
                          </div>
                        )}
                        {state.showHumidity && (
                          <div>
                            Humidity: <span className="text-stone-100 font-medium">{cave.humidity}%</span>
                          </div>
                        )}
                        {state.showWaterQuality && (
                          <div>
                            Water: <span className="text-stone-100 font-medium">{cave.waterQuality}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCaves.length === 0 && (
                  <div className="text-center text-xs text-stone-400 py-4">
                    No caves match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Cave Details */}
          {activeCave && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-stone-500/30 bg-stone-800/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeCave.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeCave.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeCave.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeCave.lat.toFixed(1)}, {activeCave.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400">Biodiversity: </span>
                    <span className="font-medium text-amber-300">{activeCave.biodiversity}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Temperature: </span>
                    <span className="font-medium text-stone-200">{activeCave.temperature}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Humidity: </span>
                    <span className="font-medium text-stone-200">{activeCave.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Water Quality: </span>
                    <span className="font-medium text-stone-200">{activeCave.waterQuality}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Depth: </span>
                    <span className="font-medium text-stone-200">{activeCave.depth} m</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400">Description: </span>
                    <span className="font-medium text-stone-200">{activeCave.description}</span>
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
