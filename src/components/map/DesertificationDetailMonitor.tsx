'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import {
  useMapStore,
  type DesertificationDetailData,
  type DesertificationDetailState,
} from '@/lib/map-store'
import {
  Sun as SunIcon4,
  X,
  MapPin,
  Filter,
  Leaf,
  Droplets,
  Wind,
  ThermometerSun,
  AlertTriangle,
} from 'lucide-react'

// Demo regions
const DEMO_REGIONS: DesertificationDetailData[] = [
  {
    id: 'dd-sahel',
    name: 'Sahel Region',
    lat: 14.0,
    lng: 2.0,
    vegetationIndex: 0.15,
    soilMoisture: 8,
    windErosion: 82,
    droughtIndex: 85,
    landDegradation: 72,
    status: 'very_severe',
    description: 'Semi-arid transition zone south of the Sahara experiencing severe land degradation and desertification.',
  },
  {
    id: 'dd-thar',
    name: 'Thar Desert India',
    lat: 27.0,
    lng: 71.0,
    vegetationIndex: 0.12,
    soilMoisture: 5,
    windErosion: 75,
    droughtIndex: 78,
    landDegradation: 65,
    status: 'severe',
    description: 'Expanding arid region in northwestern India with significant sand dune migration and vegetation loss.',
  },
  {
    id: 'dd-aral',
    name: 'Aral Sea Region',
    lat: 45.0,
    lng: 60.0,
    vegetationIndex: 0.22,
    soilMoisture: 12,
    windErosion: 68,
    droughtIndex: 72,
    landDegradation: 58,
    status: 'severe',
    description: 'Former seabed exposed by water diversion, now a major source of saline dust storms.',
  },
  {
    id: 'dd-patagonia',
    name: 'Patagonia Argentina',
    lat: -45.0,
    lng: -68.0,
    vegetationIndex: 0.35,
    soilMoisture: 18,
    windErosion: 55,
    droughtIndex: 48,
    landDegradation: 35,
    status: 'moderate',
    description: 'Dry steppe region facing gradual desertification from overgrazing and wind erosion.',
  },
  {
    id: 'dd-mediterranean',
    name: 'Mediterranean Spain',
    lat: 38.0,
    lng: -2.0,
    vegetationIndex: 0.42,
    soilMoisture: 22,
    windErosion: 35,
    droughtIndex: 52,
    landDegradation: 28,
    status: 'slight',
    description: 'Southern Europe experiencing early-stage desertification from recurring droughts and soil erosion.',
  },
  {
    id: 'dd-horn',
    name: 'Horn of Africa',
    lat: 8.0,
    lng: 45.0,
    vegetationIndex: 0.10,
    soilMoisture: 4,
    windErosion: 88,
    droughtIndex: 92,
    landDegradation: 82,
    status: 'extreme',
    description: 'One of the most severely desertified regions globally, with chronic drought and famine risk.',
  },
]

const STATUS_CONFIG: Record<
  DesertificationDetailData['status'],
  { label: string; color: string; bgClass: string }
> = {
  slight: { label: 'Slight', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  very_severe: { label: 'Very Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' },
  extreme: { label: 'Extreme', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
}

export function DesertificationDetailMonitor() {
  const state = useMapStore((s) => s.desertificationDetail)
  const setState = useMapStore((s) => s.setDesertificationDetail)

  // SSR guard
  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const regions = state.regions.length > 0 ? state.regions : DEMO_REGIONS

  const filteredRegions = regions.filter((r) => {
    if (state.severityFilter !== 'all' && r.status !== state.severityFilter) return false
    return true
  })

  // Summary calculations
  const summary = (() => {
    if (filteredRegions.length === 0) {
      return { avgVegetationIndex: 0, avgSoilMoisture: 0, criticalCount: 0 }
    }
    const avgVegetationIndex =
      filteredRegions.reduce((sum, r) => sum + r.vegetationIndex, 0) / filteredRegions.length
    const avgSoilMoisture =
      filteredRegions.reduce((sum, r) => sum + r.soilMoisture, 0) / filteredRegions.length
    const criticalCount = filteredRegions.filter(
      (r) => r.status === 'severe' || r.status === 'very_severe' || r.status === 'extreme'
    ).length
    return {
      avgVegetationIndex: Math.round(avgVegetationIndex * 1000) / 1000,
      avgSoilMoisture: Math.round(avgSoilMoisture * 10) / 10,
      criticalCount,
    }
  })()

  const activeRegion = regions.find((r) => r.id === state.activeRegionId) ?? null

  const overlayToggles: {
    key: keyof DesertificationDetailState
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { key: 'showVegetationIndex', label: 'Vegetation Index', icon: Leaf },
    { key: 'showSoilMoisture', label: 'Soil Moisture', icon: Droplets },
    { key: 'showWindErosion', label: 'Wind Erosion', icon: Wind },
    { key: 'showDroughtIndex', label: 'Drought Index', icon: ThermometerSun },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25 }}
        className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]"
      >
        <Card className="bg-gradient-to-br from-amber-950/95 to-stone-950/95 backdrop-blur-xl border border-amber-800/30 rounded-xl shadow-lg overflow-hidden text-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
                <SunIcon4 className="h-4 w-4 text-amber-400" />
                Desertification Detail Monitor
                <Badge
                  variant="outline"
                  className="text-[10px] font-normal border-amber-700/50 text-amber-300"
                >
                  {filteredRegions.length} regions
                </Badge>
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

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="space-y-3 pb-4">
              {/* Severity Filter */}
              <div>
                <Label className="text-xs text-amber-400/80 flex items-center gap-1.5">
                  <Filter className="h-3 w-3" />
                  Severity Filter
                </Label>
                <Select
                  value={state.severityFilter}
                  onValueChange={(v) =>
                    setState({
                      severityFilter: v as DesertificationDetailState['severityFilter'],
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/30 border-amber-700/40 text-amber-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="slight">Slight</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="very_severe">Very Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-amber-800/30" />

              {/* Overlay Toggles */}
              <div className="space-y-1.5">
                <Label className="text-xs text-amber-400/80">Display Options</Label>
                {overlayToggles.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-amber-200">
                      <Icon className="h-3 w-3 text-amber-500" />
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
                <div className="rounded-lg border border-amber-700/30 bg-amber-900/20 p-2 text-center">
                  <div className="text-[10px] text-amber-400/70">Avg Vegetation</div>
                  <div className="text-sm font-semibold text-amber-100">
                    {summary.avgVegetationIndex.toFixed(3)}
                  </div>
                  <div className="text-[9px] text-amber-400/60">NDVI</div>
                </div>
                <div className="rounded-lg border border-amber-700/30 bg-amber-900/20 p-2 text-center">
                  <div className="text-[10px] text-amber-400/70">Avg Soil Moisture</div>
                  <div className="text-sm font-semibold text-amber-100">
                    {summary.avgSoilMoisture}%
                  </div>
                  <div className="text-[9px] text-amber-400/60">moisture</div>
                </div>
                <div className="rounded-lg border border-amber-700/30 bg-amber-900/20 p-2 text-center">
                  <div className="text-[10px] text-amber-400/70">Critical</div>
                  <div className="text-sm font-semibold text-red-400">
                    {summary.criticalCount}
                  </div>
                  <div className="text-[9px] text-amber-400/60">regions</div>
                </div>
              </div>

              <Separator className="bg-amber-800/30" />

              {/* Region List */}
              <div className="space-y-1.5">
                <Label className="text-xs text-amber-400/80">
                  Monitored Regions ({filteredRegions.length})
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
                              ? 'border-amber-500/50 bg-amber-800/20'
                              : 'border-amber-700/30 hover:border-amber-600/30 hover:bg-amber-800/10'
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
                              <span className="text-xs font-medium text-amber-100">
                                {region.name}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                            >
                              {statusCfg.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/70">
                            {state.showVegetationIndex && (
                              <div>
                                Veg. Index:{' '}
                                <span className="text-amber-100 font-medium">
                                  {region.vegetationIndex.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {state.showSoilMoisture && (
                              <div>
                                Soil Moisture:{' '}
                                <span className="text-amber-100 font-medium">
                                  {region.soilMoisture}%
                                </span>
                              </div>
                            )}
                            {state.showWindErosion && (
                              <div>
                                Wind Erosion:{' '}
                                <span className="text-amber-100 font-medium">
                                  {region.windErosion}
                                </span>
                              </div>
                            )}
                            {state.showDroughtIndex && (
                              <div>
                                Drought Index:{' '}
                                <span className="text-amber-100 font-medium">
                                  {region.droughtIndex}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {filteredRegions.length === 0 && (
                      <div className="text-center text-xs text-amber-400/60 py-4">
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
                  <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-900/20 p-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-100">
                        {activeRegion.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeRegion.status].bgClass}`}
                      >
                        {STATUS_CONFIG[activeRegion.status].label}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-amber-300/60 leading-relaxed">
                      {activeRegion.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-amber-400/60">Coordinates: </span>
                        <span className="font-medium text-amber-100">
                          {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-amber-400/60">Land Degradation: </span>
                        <span className="font-medium text-amber-100">
                          {activeRegion.landDegradation}%
                        </span>
                      </div>
                      <div>
                        <span className="text-amber-400/60">Veg. Index: </span>
                        <span className="font-medium text-amber-100">
                          {activeRegion.vegetationIndex.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-amber-400/60">Soil Moisture: </span>
                        <span className="font-medium text-amber-100">
                          {activeRegion.soilMoisture}%
                        </span>
                      </div>
                      <div>
                        <span className="text-amber-400/60">Wind Erosion: </span>
                        <span className="font-medium text-orange-400">
                          {activeRegion.windErosion}
                        </span>
                      </div>
                      <div>
                        <span className="text-amber-400/60">Drought Index: </span>
                        <span className="font-medium text-red-400">
                          {activeRegion.droughtIndex}
                        </span>
                      </div>
                    </div>

                    {/* Mini severity bar */}
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-[9px] text-amber-400/50 mb-1">
                        <span>Degradation Severity</span>
                        <span>{activeRegion.landDegradation}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-amber-900/50 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${activeRegion.landDegradation}%`,
                            backgroundColor: STATUS_CONFIG[activeRegion.status].color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Alert Footer */}
              {summary.criticalCount > 0 && (
                <>
                  <Separator className="bg-amber-800/30" />
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="text-[11px] text-red-300/80">
                      {summary.criticalCount} region{summary.criticalCount > 1 ? 's' : ''} at severe
                      or worse desertification level requiring immediate attention.
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Toggle button for the map toolbar
export function DesertificationDetailMonitorToggle() {
  const state = useMapStore((s) => s.desertificationDetail)
  const setState = useMapStore((s) => s.setDesertificationDetail)

  return (
    <Button
      variant={state.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setState({ open: !state.open })}
      title="Desertification Detail Monitor"
    >
      <SunIcon4 className="h-4 w-4" />
    </Button>
  )
}
