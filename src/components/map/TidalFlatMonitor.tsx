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
import { useMapStore, type TidalFlatMonitorState, type TidalFlatMonitorData } from '@/lib/map-store'
import { Bird as BirdIcon4, X, BarChart3, MapPin, Filter, Waves, Leaf } from 'lucide-react'

const DEMO_FLATS: TidalFlatMonitorData[] = [
  {
    id: 'tf-wadden',
    name: 'Wadden Sea',
    lat: 53.5,
    lng: 6,
    area: 5000,
    biodiversity: 90,
    sedimentQuality: 85,
    birdPopulation: 12000000,
    tidalRange: 2.5,
    status: 'stable',
    description: 'Largest intertidal area in the world, UNESCO World Heritage Site',
  },
  {
    id: 'tf-yellowsea',
    name: 'Yellow Sea Flats',
    lat: 37,
    lng: 126,
    area: 3000,
    biodiversity: 75,
    sedimentQuality: 55,
    birdPopulation: 5000000,
    tidalRange: 8,
    status: 'shrinking',
    description: 'Critical stopover for migratory birds but under reclamation pressure',
  },
  {
    id: 'tf-fundy',
    name: 'Bay of Fundy',
    lat: 45.5,
    lng: -65,
    area: 800,
    biodiversity: 80,
    sedimentQuality: 78,
    birdPopulation: 2000000,
    tidalRange: 15,
    status: 'stable',
    description: 'Extreme tidal range creating vast intertidal mudflats',
  },
  {
    id: 'tf-kutch',
    name: 'Gulf of Kutch',
    lat: 23,
    lng: 70,
    area: 1500,
    biodiversity: 60,
    sedimentQuality: 45,
    birdPopulation: 800000,
    tidalRange: 5,
    status: 'rapid_loss',
    description: 'Indian tidal flats rapidly losing area to industrial development',
  },
  {
    id: 'tf-moreton',
    name: 'Moreton Bay',
    lat: -27.5,
    lng: 153,
    area: 600,
    biodiversity: 70,
    sedimentQuality: 65,
    birdPopulation: 500000,
    tidalRange: 2,
    status: 'shrinking',
    description: 'Australian tidal flats gradually shrinking from sediment changes',
  },
  {
    id: 'tf-delaware',
    name: 'Delaware Bay',
    lat: 39,
    lng: -75,
    area: 400,
    biodiversity: 85,
    sedimentQuality: 80,
    birdPopulation: 1500000,
    tidalRange: 2,
    status: 'expanding',
    description: 'Important horseshoe crab and shorebird habitat showing expansion',
  },
]

const STATUS_CONFIG: Record<
  TidalFlatMonitorData['status'],
  { label: string; color: string; bgClass: string }
> = {
  expanding: { label: 'Expanding', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  stable: { label: 'Stable', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  shrinking: { label: 'Shrinking', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rapid_loss: { label: 'Rapid Loss', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function TidalFlatMonitor() {
  const state = useMapStore((s) => s.tidalFlatMonitor)
  const setState = useMapStore((s) => s.setTidalFlatMonitor)

  const flats = useMemo(
    () => (state.flats.length > 0 ? state.flats : DEMO_FLATS),
    [state.flats]
  )

  const filteredFlats = useMemo(() => {
    return flats.filter((f) => {
      if (state.typeFilter !== 'all') {
        const typeMap: Record<string, string[]> = {
          mudflat: ['tf-wadden', 'tf-yellowsea', 'tf-fundy'],
          sandflat: ['tf-delaware', 'tf-moreton'],
          salt_marsh: ['tf-wadden', 'tf-delaware'],
          seagrass: ['tf-moreton', 'tf-kutch'],
        }
        if (!typeMap[state.typeFilter]?.includes(f.id)) return false
      }
      return true
    })
  }, [flats, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredFlats.length === 0) {
      return { avgArea: 0, avgBiodiversity: 0, avgSedimentQuality: 0 }
    }
    const avgArea =
      filteredFlats.reduce((sum, f) => sum + f.area, 0) / filteredFlats.length
    const avgBiodiversity =
      filteredFlats.reduce((sum, f) => sum + f.biodiversity, 0) / filteredFlats.length
    const avgSedimentQuality =
      filteredFlats.reduce((sum, f) => sum + f.sedimentQuality, 0) / filteredFlats.length
    return {
      avgArea: Math.round(avgArea),
      avgBiodiversity: Math.round(avgBiodiversity),
      avgSedimentQuality: Math.round(avgSedimentQuality),
    }
  }, [filteredFlats])

  const activeFlat = useMemo(
    () => flats.find((f) => f.id === state.activeFlatId) ?? null,
    [flats, state.activeFlatId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TidalFlatMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showArea', label: 'Area', icon: BarChart3 },
    { key: 'showBiodiversity', label: 'Biodiversity', icon: Leaf },
    { key: 'showSedimentQuality', label: 'Sediment Quality', icon: Waves },
    { key: 'showBirdPopulation', label: 'Bird Population', icon: BirdIcon4 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-amber-950/80 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg shadow-amber-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <BirdIcon4 className="h-4 w-4 text-amber-400" />
              Tidal Flat Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-amber-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Flat Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as TidalFlatMonitorState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mudflat">Mudflat</SelectItem>
                <SelectItem value="sandflat">Sandflat</SelectItem>
                <SelectItem value="salt_marsh">Salt Marsh</SelectItem>
                <SelectItem value="seagrass">Seagrass</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Area</div>
              <div className="text-sm font-semibold text-amber-300">{summary.avgArea}</div>
              <div className="text-[9px] text-amber-400">km²</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Biodiversity</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgBiodiversity}</div>
              <div className="text-[9px] text-amber-400">index</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Sediment</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgSedimentQuality}</div>
              <div className="text-[9px] text-amber-400">quality</div>
            </div>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Flat List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">
              Tidal Flats ({filteredFlats.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFlats.map((flat) => {
                  const isActive = state.activeFlatId === flat.id
                  const statusCfg = STATUS_CONFIG[flat.status]
                  return (
                    <div
                      key={flat.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/60 bg-amber-800/30'
                          : 'border-amber-800/30 hover:border-amber-600/40 hover:bg-amber-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeFlatId: isActive ? null : flat.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-amber-100">{flat.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300">
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-amber-200 font-medium">
                              {flat.area} km²
                            </span>
                          </div>
                        )}
                        {state.showBiodiversity && (
                          <div>
                            Biodiversity:{' '}
                            <span className="text-emerald-400 font-medium">
                              {flat.biodiversity}
                            </span>
                          </div>
                        )}
                        {state.showSedimentQuality && (
                          <div>
                            Sediment:{' '}
                            <span className="text-sky-400 font-medium">
                              {flat.sedimentQuality}
                            </span>
                          </div>
                        )}
                        {state.showBirdPopulation && (
                          <div>
                            Birds:{' '}
                            <span className="text-amber-200 font-medium">
                              {(flat.birdPopulation / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFlats.length === 0 && (
                  <div className="text-center text-xs text-amber-400 py-4">
                    No flats match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Flat Details */}
          {activeFlat && (
            <>
              <Separator className="bg-amber-800/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeFlat.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeFlat.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeFlat.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeFlat.lat.toFixed(1)}, {activeFlat.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400">Area: </span>
                    <span className="font-medium text-amber-200">{activeFlat.area} km²</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Biodiversity: </span>
                    <span className="font-medium text-emerald-400">{activeFlat.biodiversity}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Sediment: </span>
                    <span className="font-medium text-sky-400">{activeFlat.sedimentQuality}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Bird Population: </span>
                    <span className="font-medium text-amber-200">{activeFlat.birdPopulation.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Tidal Range: </span>
                    <span className="font-medium text-amber-200">{activeFlat.tidalRange} m</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-amber-400">Description: </span>
                    <span className="font-medium text-amber-200">{activeFlat.description}</span>
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
