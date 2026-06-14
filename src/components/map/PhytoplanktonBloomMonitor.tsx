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
import { useMapStore, type PhytoplanktonBloomState, type PhytoplanktonBloomData } from '@/lib/map-store'
import { Leaf as LeafIcon5, X, BarChart3, MapPin, Filter, Clock, TrendingUp } from 'lucide-react'

const DEMO_BLOOMS: PhytoplanktonBloomData[] = [
  {
    id: 'pb-gulf-mexico',
    name: 'Gulf of Mexico Dead Zone',
    lat: 29,
    lng: -90,
    chlorophyll: 45,
    toxicity: 35,
    extent: 15000,
    duration: 120,
    species: 8,
    status: 'harmful',
    description: 'Recurring harmful algal bloom causing hypoxic dead zone in coastal waters',
  },
  {
    id: 'pb-lake-erie',
    name: 'Lake Erie',
    lat: 42,
    lng: -81,
    chlorophyll: 60,
    toxicity: 50,
    extent: 5000,
    duration: 90,
    species: 12,
    status: 'severe_hab',
    description: 'Severe cyanobacteria bloom with microcystin contamination in drinking water',
  },
  {
    id: 'pb-baltic',
    name: 'Baltic Sea',
    lat: 58,
    lng: 20,
    chlorophyll: 35,
    toxicity: 25,
    extent: 8000,
    duration: 150,
    species: 6,
    status: 'harmful',
    description: 'Cyanobacterial blooms fueled by nutrient pollution and warming waters',
  },
  {
    id: 'pb-chilean',
    name: 'Chilean Coast',
    lat: -36,
    lng: -73,
    chlorophyll: 25,
    toxicity: 15,
    extent: 3000,
    duration: 60,
    species: 4,
    status: 'dense_bloom',
    description: 'Dense phytoplankton bloom affecting aquaculture and fisheries',
  },
  {
    id: 'pb-north-sea',
    name: 'North Sea',
    lat: 55,
    lng: 5,
    chlorophyll: 15,
    toxicity: 5,
    extent: 2000,
    duration: 45,
    species: 3,
    status: 'bloom',
    description: 'Seasonal phytoplankton bloom with moderate chlorophyll levels',
  },
  {
    id: 'pb-bay-bengal',
    name: 'Bay of Bengal',
    lat: 18,
    lng: 87,
    chlorophyll: 10,
    toxicity: 2,
    extent: 1000,
    duration: 30,
    species: 2,
    status: 'background',
    description: 'Normal background phytoplankton levels with no harmful activity',
  },
]

const STATUS_CONFIG: Record<
  PhytoplanktonBloomData['status'],
  { label: string; color: string; bgClass: string }
> = {
  background: { label: 'Background', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  bloom: { label: 'Bloom', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  dense_bloom: { label: 'Dense Bloom', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  harmful: { label: 'Harmful', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe_hab: { label: 'Severe HAB', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function PhytoplanktonBloomMonitor() {
  const state = useMapStore((s) => s.phytoplanktonBloom)
  const setState = useMapStore((s) => s.setPhytoplanktonBloom)

  const blooms = useMemo(
    () => (state.blooms.length > 0 ? state.blooms : DEMO_BLOOMS),
    [state.blooms]
  )

  const filteredBlooms = useMemo(() => {
    return blooms.filter((b) => {
      if (state.speciesFilter !== 'all') {
        const speciesMap: Record<string, string[]> = {
          karenia: ['pb-gulf-mexico'],
          alexandrium: ['pb-chilean', 'pb-north-sea'],
          pseudo_nitzschia: ['pb-chilean', 'pb-baltic'],
          microcystis: ['pb-lake-erie', 'pb-baltic'],
        }
        if (!speciesMap[state.speciesFilter]?.includes(b.id)) return false
      }
      return true
    })
  }, [blooms, state.speciesFilter])

  const summary = useMemo(() => {
    if (filteredBlooms.length === 0) {
      return { avgChlorophyll: 0, avgToxicity: 0, totalExtent: 0 }
    }
    const avgChlorophyll =
      filteredBlooms.reduce((sum, b) => sum + b.chlorophyll, 0) / filteredBlooms.length
    const avgToxicity =
      filteredBlooms.reduce((sum, b) => sum + b.toxicity, 0) / filteredBlooms.length
    const totalExtent = filteredBlooms.reduce((sum, b) => sum + b.extent, 0)
    return {
      avgChlorophyll: Math.round(avgChlorophyll),
      avgToxicity: Math.round(avgToxicity * 10) / 10,
      totalExtent: totalExtent.toLocaleString(),
    }
  }, [filteredBlooms])

  const activeBloom = useMemo(
    () => blooms.find((b) => b.id === state.activeBloomId) ?? null,
    [blooms, state.activeBloomId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PhytoplanktonBloomState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showChlorophyll', label: 'Chlorophyll', icon: BarChart3 },
    { key: 'showToxicity', label: 'Toxicity', icon: TrendingUp },
    { key: 'showExtent', label: 'Extent', icon: MapPin },
    { key: 'showDuration', label: 'Duration', icon: Clock },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-emerald-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg shadow-cyan-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <LeafIcon5 className="h-4 w-4 text-cyan-400" />
              Phytoplankton Bloom Monitor
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
          {/* Species Filter */}
          <div>
            <Label className="text-xs text-cyan-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Species Type
            </Label>
            <Select
              value={state.speciesFilter}
              onValueChange={(v) =>
                setState({
                  speciesFilter: v as PhytoplanktonBloomState['speciesFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                <SelectItem value="karenia">Karenia</SelectItem>
                <SelectItem value="alexandrium">Alexandrium</SelectItem>
                <SelectItem value="pseudo_nitzschia">Pseudo-nitzschia</SelectItem>
                <SelectItem value="microcystis">Microcystis</SelectItem>
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
              <div className="text-[10px] text-cyan-400">Avg Chlorophyll</div>
              <div className="text-sm font-semibold text-cyan-300">{summary.avgChlorophyll}</div>
              <div className="text-[9px] text-cyan-400">mg/m³</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Avg Toxicity</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgToxicity}</div>
              <div className="text-[9px] text-cyan-400">index</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Total Extent</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalExtent}</div>
              <div className="text-[9px] text-cyan-400">km²</div>
            </div>
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Bloom List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300">
              Phytoplankton Blooms ({filteredBlooms.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredBlooms.map((bloom) => {
                  const isActive = state.activeBloomId === bloom.id
                  const statusCfg = STATUS_CONFIG[bloom.status]
                  return (
                    <div
                      key={bloom.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/60 bg-cyan-800/30'
                          : 'border-cyan-800/30 hover:border-cyan-600/40 hover:bg-cyan-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeBloomId: isActive ? null : bloom.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-cyan-100">{bloom.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300">
                        {state.showChlorophyll && (
                          <div>
                            Chlorophyll:{' '}
                            <span className="text-cyan-100 font-medium">
                              {bloom.chlorophyll} mg/m³
                            </span>
                          </div>
                        )}
                        {state.showToxicity && (
                          <div>
                            Toxicity:{' '}
                            <span className="text-amber-400 font-medium">
                              {bloom.toxicity}
                            </span>
                          </div>
                        )}
                        {state.showExtent && (
                          <div>
                            Extent:{' '}
                            <span className="text-cyan-100 font-medium">
                              {bloom.extent.toLocaleString()} km²
                            </span>
                          </div>
                        )}
                        {state.showDuration && (
                          <div>
                            Duration:{' '}
                            <span className="text-cyan-100 font-medium">
                              {bloom.duration} days
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredBlooms.length === 0 && (
                  <div className="text-center text-xs text-cyan-400 py-4">
                    No blooms match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Bloom Details */}
          {activeBloom && (
            <>
              <Separator className="bg-cyan-800/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeBloom.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeBloom.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeBloom.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeBloom.lat.toFixed(1)}, {activeBloom.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Chlorophyll: </span>
                    <span className="font-medium text-cyan-200">{activeBloom.chlorophyll} mg/m³</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Toxicity: </span>
                    <span className="font-medium text-amber-400">{activeBloom.toxicity}</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Extent: </span>
                    <span className="font-medium text-cyan-200">{activeBloom.extent.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Duration: </span>
                    <span className="font-medium text-cyan-200">{activeBloom.duration} days</span>
                  </div>
                  <div>
                    <span className="text-cyan-400">Species: </span>
                    <span className="font-medium text-cyan-200">{activeBloom.species}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-cyan-400">Description: </span>
                    <span className="font-medium text-cyan-200">{activeBloom.description}</span>
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
