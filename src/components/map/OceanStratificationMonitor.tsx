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
import { useMapStore, type OceanStratificationState, type OceanStratificationData } from '@/lib/map-store'
import { Layers as LayersIcon4, X, BarChart3, MapPin, Filter, Thermometer, Droplets } from 'lucide-react'

const DEMO_BASINS: OceanStratificationData[] = [
  {
    id: 'os-tropicalpacific',
    name: 'Tropical Pacific',
    lat: 0,
    lng: -160,
    pycnocline: 120,
    temperature: 28,
    salinity: 35.0,
    mixing: 15,
    oxygen: 40,
    status: 'very_strong',
    description: 'Strong stratification in the tropical Pacific warm pool',
  },
  {
    id: 'os-natlantic',
    name: 'N Atlantic',
    lat: 35,
    lng: -40,
    pycnocline: 200,
    temperature: 20,
    salinity: 35.5,
    mixing: 25,
    oxygen: 55,
    status: 'strong',
    description: 'North Atlantic deep water formation region with strong layering',
  },
  {
    id: 'os-indian',
    name: 'Indian Ocean',
    lat: -10,
    lng: 70,
    pycnocline: 150,
    temperature: 26,
    salinity: 35.2,
    mixing: 18,
    oxygen: 45,
    status: 'very_strong',
    description: 'Warm Indian Ocean with intense thermal stratification',
  },
  {
    id: 'os-mediterranean',
    name: 'Mediterranean',
    lat: 36,
    lng: 18,
    pycnocline: 80,
    temperature: 22,
    salinity: 38.5,
    mixing: 35,
    oxygen: 65,
    status: 'moderate',
    description: 'Semi-enclosed sea with moderate stratification and high salinity',
  },
  {
    id: 'os-arctic',
    name: 'Arctic Ocean',
    lat: 80,
    lng: 0,
    pycnocline: 30,
    temperature: 4,
    salinity: 34.0,
    mixing: 10,
    oxygen: 30,
    status: 'extreme',
    description: 'Extreme stratification from freshwater lens under sea ice',
  },
  {
    id: 'os-southern',
    name: 'Southern Ocean',
    lat: -55,
    lng: 0,
    pycnocline: 250,
    temperature: 8,
    salinity: 34.5,
    mixing: 40,
    oxygen: 70,
    status: 'weak',
    description: 'Deep mixing and weak stratification in the Southern Ocean',
  },
]

const STATUS_CONFIG: Record<
  OceanStratificationData['status'],
  { label: string; color: string; bgClass: string }
> = {
  weak: { label: 'Weak', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  moderate: { label: 'Moderate', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  strong: { label: 'Strong', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  very_strong: { label: 'Very Strong', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function OceanStratificationMonitor() {
  const state = useMapStore((s) => s.oceanStratification)
  const setState = useMapStore((s) => s.setOceanStratification)

  const basins = useMemo(
    () => (state.basins.length > 0 ? state.basins : DEMO_BASINS),
    [state.basins]
  )

  const filteredBasins = useMemo(() => {
    return basins.filter((b) => {
      if (state.regionFilter !== 'all') {
        const regionMap: Record<string, string[]> = {
          tropical: ['os-tropicalpacific', 'os-indian'],
          subtropical: ['os-natlantic'],
          temperate: ['os-mediterranean'],
          high_latitude: ['os-arctic', 'os-southern'],
        }
        if (!regionMap[state.regionFilter]?.includes(b.id)) return false
      }
      return true
    })
  }, [basins, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredBasins.length === 0) {
      return { avgPycnocline: 0, avgTemperature: 0, avgOxygen: 0 }
    }
    const avgPycnocline =
      filteredBasins.reduce((sum, b) => sum + b.pycnocline, 0) / filteredBasins.length
    const avgTemperature =
      filteredBasins.reduce((sum, b) => sum + b.temperature, 0) / filteredBasins.length
    const avgOxygen =
      filteredBasins.reduce((sum, b) => sum + b.oxygen, 0) / filteredBasins.length
    return {
      avgPycnocline: Math.round(avgPycnocline),
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgOxygen: Math.round(avgOxygen),
    }
  }, [filteredBasins])

  const activeBasin = useMemo(
    () => basins.find((b) => b.id === state.activeBasinId) ?? null,
    [basins, state.activeBasinId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OceanStratificationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPycnocline', label: 'Pycnocline', icon: LayersIcon4 },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
    { key: 'showMixing', label: 'Mixing', icon: BarChart3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-teal-950/80 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg shadow-teal-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <LayersIcon4 className="h-4 w-4 text-teal-400" />
              Ocean Stratification Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-teal-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Ocean Region
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({
                  regionFilter: v as OceanStratificationState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="tropical">Tropical</SelectItem>
                <SelectItem value="subtropical">Subtropical</SelectItem>
                <SelectItem value="temperate">Temperate</SelectItem>
                <SelectItem value="high_latitude">High Latitude</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Avg Pycnocline</div>
              <div className="text-sm font-semibold text-teal-300">{summary.avgPycnocline}</div>
              <div className="text-[9px] text-teal-400">m depth</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Avg Temperature</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgTemperature}°C</div>
              <div className="text-[9px] text-teal-400">surface</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Avg Oxygen</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgOxygen}</div>
              <div className="text-[9px] text-teal-400">μmol/kg</div>
            </div>
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Basin List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300">
              Ocean Basins ({filteredBasins.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredBasins.map((basin) => {
                  const isActive = state.activeBasinId === basin.id
                  const statusCfg = STATUS_CONFIG[basin.status]
                  return (
                    <div
                      key={basin.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/60 bg-teal-800/30'
                          : 'border-teal-800/30 hover:border-teal-600/40 hover:bg-teal-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeBasinId: isActive ? null : basin.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-teal-100">{basin.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300">
                        {state.showPycnocline && (
                          <div>
                            Pycnocline:{' '}
                            <span className="text-teal-200 font-medium">
                              {basin.pycnocline} m
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-amber-400 font-medium">
                              {basin.temperature}°C
                            </span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-teal-200 font-medium">
                              {basin.salinity} PSU
                            </span>
                          </div>
                        )}
                        {state.showMixing && (
                          <div>
                            Mixing:{' '}
                            <span className="text-sky-400 font-medium">
                              {basin.mixing}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredBasins.length === 0 && (
                  <div className="text-center text-xs text-teal-400 py-4">
                    No basins match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Basin Details */}
          {activeBasin && (
            <>
              <Separator className="bg-teal-800/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeBasin.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeBasin.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeBasin.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeBasin.lat.toFixed(1)}, {activeBasin.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400">Pycnocline: </span>
                    <span className="font-medium text-teal-200">{activeBasin.pycnocline} m</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Temperature: </span>
                    <span className="font-medium text-amber-400">{activeBasin.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Salinity: </span>
                    <span className="font-medium text-teal-200">{activeBasin.salinity} PSU</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Mixing: </span>
                    <span className="font-medium text-sky-400">{activeBasin.mixing}</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Oxygen: </span>
                    <span className="font-medium text-sky-400">{activeBasin.oxygen} μmol/kg</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-teal-400">Description: </span>
                    <span className="font-medium text-teal-200">{activeBasin.description}</span>
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
