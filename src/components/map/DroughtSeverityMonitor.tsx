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
import { useMapStore, type DroughtSeverityState, type DroughtSeverityData } from '@/lib/map-store'
import { Sun as SunIcon6, X, TrendingDown, Droplets, TreePine, Thermometer, MapPin, Filter } from 'lucide-react'

const DEMO_REGIONS: DroughtSeverityData[] = [
  {
    id: 'ds-1', name: 'Horn of Africa', lat: 5, lng: 42, spi: -2.8, soilMoisture: 15, vegetation: 20, waterStress: 85, reservoirLevel: 12, status: 'exceptional', description: 'Multi-year drought causing famine and displacement',
  },
  {
    id: 'ds-2', name: 'California Central Valley', lat: 37, lng: -120, spi: -2.0, soilMoisture: 25, vegetation: 35, waterStress: 70, reservoirLevel: 28, status: 'extreme', description: 'Severe agricultural drought with water restrictions',
  },
  {
    id: 'ds-3', name: 'Sahel Region', lat: 14, lng: 0, spi: -1.5, soilMoisture: 30, vegetation: 40, waterStress: 60, reservoirLevel: 35, status: 'severe', description: 'Chronic drought conditions across the Sahel belt',
  },
  {
    id: 'ds-4', name: 'Iberian Peninsula', lat: 40, lng: -4, spi: -1.2, soilMoisture: 35, vegetation: 50, waterStress: 45, reservoirLevel: 40, status: 'moderate', description: 'Recurring drought affecting agriculture and water supply',
  },
  {
    id: 'ds-5', name: 'Murray-Darling', lat: -34, lng: 144, spi: -1.8, soilMoisture: 22, vegetation: 30, waterStress: 65, reservoirLevel: 25, status: 'extreme', description: 'Prolonged drought in Australia\'s food bowl',
  },
  {
    id: 'ds-6', name: 'Northern India', lat: 28, lng: 78, spi: -0.8, soilMoisture: 45, vegetation: 55, waterStress: 35, reservoirLevel: 55, status: 'abnormally_dry', description: 'Emerging dry conditions affecting monsoon-dependent agriculture',
  },
]

const STATUS_CONFIG: Record<DroughtSeverityData['status'], { label: string; color: string; bgClass: string }> = {
  abnormally_dry: { label: 'Abnormally Dry', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  exceptional: { label: 'Exceptional', color: '#991b1b', bgClass: 'bg-red-900/10 text-red-800 border-red-800/30' },
}

export function DroughtSeverityMonitor() {
  const state = useMapStore((s) => s.droughtSeverity)
  const setState = useMapStore((s) => s.setDroughtSeverity)

  const regions = useMemo(
    () => (state.regions.length > 0 ? state.regions : DEMO_REGIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.severityFilter !== 'all' && r.status !== state.severityFilter) return false
      return true
    })
  }, [regions, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { avgSPI: 0, avgSoilMoisture: 0, exceptionalCount: 0 }
    }
    const avgSPI = filteredRegions.reduce((sum, r) => sum + r.spi, 0) / filteredRegions.length
    const avgSoilMoisture = filteredRegions.reduce((sum, r) => sum + r.soilMoisture, 0) / filteredRegions.length
    const exceptionalCount = filteredRegions.filter((r) => r.status === 'extreme' || r.status === 'exceptional').length
    return {
      avgSPI: Math.round(avgSPI * 100) / 100,
      avgSoilMoisture: Math.round(avgSoilMoisture),
      exceptionalCount,
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DroughtSeverityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSPI', label: 'SPI', icon: TrendingDown },
    { key: 'showSoilMoisture', label: 'Soil Moisture', icon: Droplets },
    { key: 'showVegetation', label: 'Vegetation', icon: TreePine },
    { key: 'showWaterStress', label: 'Water Stress', icon: Thermometer },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg shadow-amber-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <SunIcon6 className="h-4 w-4 text-amber-400" />
              Drought Severity Monitor
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
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-amber-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({ severityFilter: v as DroughtSeverityState['severityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="abnormally_dry">Abnormally Dry</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
                <SelectItem value="exceptional">Exceptional</SelectItem>
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
              <div className="text-[10px] text-amber-400">Avg SPI</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgSPI}</div>
              <div className="text-[9px] text-amber-400">index</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Soil Moisture</div>
              <div className="text-sm font-semibold text-amber-300">{summary.avgSoilMoisture}</div>
              <div className="text-[9px] text-amber-400">%</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Extreme+</div>
              <div className="text-sm font-semibold text-red-500">{summary.exceptionalCount}</div>
              <div className="text-[9px] text-amber-400">regions</div>
            </div>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">
              Drought Regions ({filteredRegions.length})
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
                          ? 'border-amber-500/60 bg-amber-800/30'
                          : 'border-amber-800/30 hover:border-amber-600/40 hover:bg-amber-900/20'
                      }`}
                      onClick={() =>
                        setState({ activeRegionId: isActive ? null : region.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-amber-100">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300">
                        {state.showSPI && (
                          <div>
                            SPI: <span className="text-amber-100 font-medium">{region.spi}</span>
                          </div>
                        )}
                        {state.showSoilMoisture && (
                          <div>
                            Soil: <span className="text-amber-100 font-medium">{region.soilMoisture}%</span>
                          </div>
                        )}
                        {state.showVegetation && (
                          <div>
                            Vegetation: <span className="text-amber-100 font-medium">{region.vegetation}%</span>
                          </div>
                        )}
                        {state.showWaterStress && (
                          <div>
                            Stress: <span className="text-amber-100 font-medium">{region.waterStress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-amber-400 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator className="bg-amber-800/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeRegion.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeRegion.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400">SPI: </span>
                    <span className="font-medium text-red-400">{activeRegion.spi}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Soil Moisture: </span>
                    <span className="font-medium text-amber-200">{activeRegion.soilMoisture}%</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Vegetation: </span>
                    <span className="font-medium text-amber-200">{activeRegion.vegetation}%</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Water Stress: </span>
                    <span className="font-medium text-red-400">{activeRegion.waterStress}%</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Reservoir: </span>
                    <span className="font-medium text-amber-200">{activeRegion.reservoirLevel}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-amber-400">Description: </span>
                    <span className="font-medium text-amber-200">{activeRegion.description}</span>
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
