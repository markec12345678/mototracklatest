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
import { useMapStore, type StratosphericOzoneState, type StratosphericOzoneData } from '@/lib/map-store'
import { Shield as ShieldIcon, X, Sun, Thermometer, TrendingUp, MapPin, Filter } from 'lucide-react'

interface DemoRegion extends StratosphericOzoneData {
  regionType: 'polar' | 'mid_latitude' | 'tropical' | 'subpolar'
}

const DEMO_REGIONS: DemoRegion[] = [
  {
    id: 'som-antarctica',
    name: 'Antarctica Ozone Hole',
    lat: -80,
    lng: 0,
    ozoneColumn: 180,
    uvIndex: 12,
    temperature: -80,
    trend: 2.1,
    chlorofluorocarbon: 45,
    status: 'severe',
    description: 'Seasonal ozone depletion over Antarctica during spring',
    regionType: 'polar',
  },
  {
    id: 'som-arctic',
    name: 'Arctic Stratosphere',
    lat: 78,
    lng: 20,
    ozoneColumn: 320,
    uvIndex: 4,
    temperature: -70,
    trend: 1.5,
    chlorofluorocarbon: 38,
    status: 'recovering',
    description: 'Arctic stratospheric ozone showing signs of recovery',
    regionType: 'polar',
  },
  {
    id: 'som-midlat-n',
    name: 'Mid-Latitude Northern',
    lat: 45,
    lng: -90,
    ozoneColumn: 350,
    uvIndex: 6,
    temperature: -55,
    trend: 0.8,
    chlorofluorocarbon: 30,
    status: 'stable',
    description: 'Northern mid-latitude ozone layer remaining stable',
    regionType: 'mid_latitude',
  },
  {
    id: 'som-midlat-s',
    name: 'Mid-Latitude Southern',
    lat: -40,
    lng: 150,
    ozoneColumn: 340,
    uvIndex: 7,
    temperature: -58,
    trend: 0.6,
    chlorofluorocarbon: 28,
    status: 'stable',
    description: 'Southern mid-latitude ozone layer maintaining equilibrium',
    regionType: 'mid_latitude',
  },
  {
    id: 'som-tropical',
    name: 'Tropical Pacific',
    lat: 0,
    lng: -160,
    ozoneColumn: 280,
    uvIndex: 10,
    temperature: -78,
    trend: -0.3,
    chlorofluorocarbon: 35,
    status: 'declining',
    description: 'Tropical Pacific stratospheric ozone showing decline',
    regionType: 'tropical',
  },
  {
    id: 'som-subpolar',
    name: 'Subpolar Siberia',
    lat: 60,
    lng: 100,
    ozoneColumn: 310,
    uvIndex: 3,
    temperature: -65,
    trend: 1.2,
    chlorofluorocarbon: 32,
    status: 'recovering',
    description: 'Subpolar Siberian stratosphere gradually recovering',
    regionType: 'subpolar',
  },
]

const STATUS_CONFIG: Record<
  StratosphericOzoneData['status'],
  { label: string; color: string; bgClass: string }
> = {
  recovering: { label: 'Recovering', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  declining: { label: 'Declining', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const REGION_TYPE_LABELS: Record<DemoRegion['regionType'], string> = {
  polar: 'Polar',
  mid_latitude: 'Mid-Latitude',
  tropical: 'Tropical',
  subpolar: 'Subpolar',
}

export function StratosphericOzoneMonitor() {
  const state = useMapStore((s) => s.stratosphericOzone)
  const setState = useMapStore((s) => s.setStratosphericOzone)

  const regions = useMemo(
    () => (state.regions.length > 0 ? (state.regions as DemoRegion[]) : DEMO_REGIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.regionFilter !== 'all' && r.regionType !== state.regionFilter) return false
      return true
    })
  }, [regions, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { avgOzoneColumn: 0, avgUVIndex: 0, decliningSevereCount: 0 }
    }
    const avgOzoneColumn =
      filteredRegions.reduce((sum, r) => sum + r.ozoneColumn, 0) / filteredRegions.length
    const avgUVIndex =
      filteredRegions.reduce((sum, r) => sum + r.uvIndex, 0) / filteredRegions.length
    const decliningSevereCount = filteredRegions.filter(
      (r) => r.status === 'declining' || r.status === 'severe'
    ).length
    return {
      avgOzoneColumn: Math.round(avgOzoneColumn),
      avgUVIndex: Math.round(avgUVIndex * 10) / 10,
      decliningSevereCount,
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof StratosphericOzoneState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOzoneColumn', label: 'Ozone Column', icon: Sun },
    { key: 'showUVIndex', label: 'UV Index', icon: Sun },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showTrend', label: 'Trend', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-purple-950/95 backdrop-blur-xl border border-violet-800/40 rounded-xl shadow-lg shadow-violet-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <ShieldIcon className="h-4 w-4 text-violet-400" />
              Stratospheric Ozone Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-300 hover:text-violet-100 hover:bg-violet-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-violet-100">
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-violet-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region Type
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({
                  regionFilter: v as StratosphericOzoneState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="polar">Polar</SelectItem>
                <SelectItem value="mid_latitude">Mid-Latitude</SelectItem>
                <SelectItem value="tropical">Tropical</SelectItem>
                <SelectItem value="subpolar">Subpolar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-violet-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-violet-200">
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-violet-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400">Avg Ozone</div>
              <div className="text-sm font-semibold text-violet-300">{summary.avgOzoneColumn}</div>
              <div className="text-[9px] text-violet-400">DU</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400">Avg UV Index</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgUVIndex}</div>
              <div className="text-[9px] text-violet-400">index</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400">Declining/Severe</div>
              <div className="text-sm font-semibold text-orange-400">{summary.decliningSevereCount}</div>
              <div className="text-[9px] text-violet-400">regions</div>
            </div>
          </div>

          <Separator className="bg-violet-800/30" />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300">
              Ozone Regions ({filteredRegions.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredRegions.map((region) => {
                  const isActive = state.activeRegionId === region.id
                  const statusCfg = STATUS_CONFIG[region.status]
                  return (
                    <div
                      key={region.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/60 bg-violet-800/30'
                          : 'border-violet-800/30 hover:border-violet-600/40 hover:bg-violet-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeRegionId: isActive ? null : region.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-violet-100">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300">
                        {state.showOzoneColumn && (
                          <div>
                            Ozone:{' '}
                            <span className="text-violet-100 font-medium">
                              {region.ozoneColumn} DU
                            </span>
                          </div>
                        )}
                        {state.showUVIndex && (
                          <div>
                            UV Index:{' '}
                            <span className="text-violet-100 font-medium">
                              {region.uvIndex}
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-violet-100 font-medium">
                              {region.temperature}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Trend:{' '}
                            <span className="text-violet-100 font-medium">
                              {region.trend > 0 ? '+' : ''}{region.trend} DU/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-violet-400 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator className="bg-violet-800/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeRegion.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeRegion.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400">Ozone Column: </span>
                    <span className="font-medium text-violet-200">{activeRegion.ozoneColumn} DU</span>
                  </div>
                  <div>
                    <span className="text-violet-400">UV Index: </span>
                    <span className="font-medium text-amber-400">{activeRegion.uvIndex}</span>
                  </div>
                  <div>
                    <span className="text-violet-400">Temperature: </span>
                    <span className="font-medium text-violet-200">{activeRegion.temperature}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-violet-400">Trend: </span>
                    <span className="font-medium text-violet-200">{activeRegion.trend > 0 ? '+' : ''}{activeRegion.trend} DU/yr</span>
                  </div>
                  <div>
                    <span className="text-violet-400">CFC Level: </span>
                    <span className="font-medium text-violet-200">{activeRegion.chlorofluorocarbon} ppt</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-violet-400">Region Type: </span>
                    <span className="font-medium text-violet-200">
                      {(activeRegion as DemoRegion).regionType ? REGION_TYPE_LABELS[(activeRegion as DemoRegion).regionType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-violet-400">Description: </span>
                    <span className="font-medium text-violet-200">{activeRegion.description}</span>
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
