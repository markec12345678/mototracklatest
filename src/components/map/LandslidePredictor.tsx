'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type LandslideZone } from '@/lib/map-store'
import {
  Mountain,
  X,
  Droplets,
  TreePine,
  Filter,
  MapPin,
  AlertTriangle,
} from 'lucide-react'

const SUSCEPTIBILITY_STYLES: Record<LandslideZone['susceptibility'], { bg: string; text: string; dot: string }> = {
  very_low: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  low: { bg: 'bg-lime-500/10', text: 'text-lime-600 dark:text-lime-400', dot: 'bg-lime-500' },
  moderate: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  very_high: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

const SUSCEPTIBILITY_LABELS: Record<LandslideZone['susceptibility'], string> = {
  very_low: 'Very Low',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
}

function generateSampleZones(): LandslideZone[] {
  return [
    {
      id: 'lz1',
      name: 'Himalayas - Uttarakhand',
      latitude: 30.39,
      longitude: 79.07,
      susceptibility: 'very_high',
      slope: 42,
      rainfallThreshold: 180,
      currentRainfall: 210,
      soilType: 'Sandy Loam',
      vegetationCover: 28,
      recentActivity: true,
    },
    {
      id: 'lz2',
      name: 'Andes - Peru Slopes',
      latitude: -13.16,
      longitude: -72.55,
      susceptibility: 'high',
      slope: 38,
      rainfallThreshold: 150,
      currentRainfall: 120,
      soilType: 'Clay Loam',
      vegetationCover: 45,
      recentActivity: true,
    },
    {
      id: 'lz3',
      name: 'Alps - Swiss Valley',
      latitude: 46.82,
      longitude: 8.23,
      susceptibility: 'moderate',
      slope: 30,
      rainfallThreshold: 200,
      currentRainfall: 95,
      soilType: 'Silty Loam',
      vegetationCover: 62,
      recentActivity: false,
    },
    {
      id: 'lz4',
      name: 'Java - Merapi Region',
      latitude: -7.54,
      longitude: 110.45,
      susceptibility: 'high',
      slope: 35,
      rainfallThreshold: 140,
      currentRainfall: 165,
      soilType: 'Volcanic Ash',
      vegetationCover: 38,
      recentActivity: true,
    },
    {
      id: 'lz5',
      name: 'Rocky Mountains - Colorado',
      latitude: 39.55,
      longitude: -105.78,
      susceptibility: 'low',
      slope: 22,
      rainfallThreshold: 250,
      currentRainfall: 60,
      soilType: 'Rocky Gravel',
      vegetationCover: 72,
      recentActivity: false,
    },
    {
      id: 'lz6',
      name: 'Appalachians - West Virginia',
      latitude: 38.35,
      longitude: -81.63,
      susceptibility: 'moderate',
      slope: 26,
      rainfallThreshold: 190,
      currentRainfall: 140,
      soilType: 'Clay',
      vegetationCover: 55,
      recentActivity: false,
    },
    {
      id: 'lz7',
      name: 'Himalayas - Nepal',
      latitude: 27.95,
      longitude: 85.32,
      susceptibility: 'very_high',
      slope: 48,
      rainfallThreshold: 160,
      currentRainfall: 195,
      soilType: 'Sandy Clay',
      vegetationCover: 22,
      recentActivity: true,
    },
    {
      id: 'lz8',
      name: 'Japanese Alps - Nagano',
      latitude: 36.35,
      longitude: 137.95,
      susceptibility: 'moderate',
      slope: 28,
      rainfallThreshold: 220,
      currentRainfall: 110,
      soilType: 'Loam',
      vegetationCover: 68,
      recentActivity: false,
    },
    {
      id: 'lz9',
      name: 'Carpathians - Romania',
      latitude: 45.75,
      longitude: 24.95,
      susceptibility: 'low',
      slope: 18,
      rainfallThreshold: 230,
      currentRainfall: 75,
      soilType: 'Sandy Loam',
      vegetationCover: 78,
      recentActivity: false,
    },
    {
      id: 'lz10',
      name: 'Andes - Colombia Ridge',
      latitude: 4.65,
      longitude: -74.1,
      susceptibility: 'very_high',
      slope: 44,
      rainfallThreshold: 170,
      currentRainfall: 220,
      soilType: 'Clay Loam',
      vegetationCover: 30,
      recentActivity: true,
    },
  ]
}

export function LandslidePredictor() {
  const landslidePredictor = useMapStore((s) => s.landslidePredictor)
  const setLandslidePredictor = useMapStore((s) => s.setLandslidePredictor)

  const sampleZones = useMemo(() => generateSampleZones(), [])

  const zones = landslidePredictor.landslideZones.length > 0
    ? landslidePredictor.landslideZones
    : sampleZones

  const filteredZones = useMemo(() => {
    if (landslidePredictor.susceptibilityFilter === 'all') return zones
    return zones.filter((z) => z.susceptibility === landslidePredictor.susceptibilityFilter)
  }, [zones, landslidePredictor.susceptibilityFilter])

  const selectedZone = landslidePredictor.activeLandslideId
    ? zones.find((z) => z.id === landslidePredictor.activeLandslideId)
    : null

  const summaryStats = useMemo(() => {
    const highRisk = zones.filter(
      (z) => z.susceptibility === 'high' || z.susceptibility === 'very_high'
    ).length
    const avgSlope = zones.reduce((sum, z) => sum + z.slope, 0) / zones.length
    const withActivity = zones.filter((z) => z.recentActivity).length
    return { highRisk, avgSlope: avgSlope.toFixed(1), withActivity }
  }, [zones])

  if (typeof window === 'undefined') return null
  if (!landslidePredictor.open) return null

  const toggleKeys = [
    { key: 'showSusceptibility' as const, label: 'Susceptibility', icon: AlertTriangle },
    { key: 'showSlope' as const, label: 'Slope', icon: Mountain },
    { key: 'showRainfall' as const, label: 'Rainfall', icon: Droplets },
    { key: 'showActivity' as const, label: 'Activity', icon: MapPin },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-16 right-4 z-30 w-[400px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-background/90 border shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mountain className="h-4 w-4 text-orange-500" />
                Landslide Predictor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {zones.length} zones
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setLandslidePredictor({ open: false })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-red-500/10 p-2 text-center">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{summaryStats.highRisk}</p>
                <p className="text-[10px] text-muted-foreground">High Risk</p>
              </div>
              <div className="rounded-lg bg-orange-500/10 p-2 text-center">
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{summaryStats.avgSlope}&deg;</p>
                <p className="text-[10px] text-muted-foreground">Avg Slope</p>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-2 text-center">
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{summaryStats.withActivity}</p>
                <p className="text-[10px] text-muted-foreground">Active Zones</p>
              </div>
            </div>

            <Separator />

            {/* Toggle Buttons */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {toggleKeys.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={landslidePredictor[key] ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs justify-start gap-1.5"
                    onClick={() =>
                      setLandslidePredictor({ [key]: !landslidePredictor[key] })
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Susceptibility Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Susceptibility Filter
                </p>
              </div>
              <Select
                value={landslidePredictor.susceptibilityFilter}
                onValueChange={(value) =>
                  setLandslidePredictor({
                    susceptibilityFilter: value as LandslidePredictorState['susceptibilityFilter'],
                  })
                }
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Filter by susceptibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="very_low">Very Low</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very_high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Zone List */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Zones ({filteredZones.length})
              </p>
              <ScrollArea className="max-h-64">
                <div className="space-y-1.5">
                  {filteredZones.map((zone) => {
                    const style = SUSCEPTIBILITY_STYLES[zone.susceptibility]
                    const isSelected = landslidePredictor.activeLandslideId === zone.id
                    const rainfallPct = Math.round((zone.currentRainfall / zone.rainfallThreshold) * 100)
                    const isRainfallCritical = zone.currentRainfall >= zone.rainfallThreshold

                    return (
                      <div
                        key={zone.id}
                        className={`rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-orange-300 dark:border-orange-700 bg-orange-500/5'
                            : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                        }`}
                        onClick={() =>
                          setLandslidePredictor({
                            activeLandslideId: isSelected ? null : zone.id,
                          })
                        }
                      >
                        <div className="flex items-center justify-between p-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`h-2 w-2 rounded-full ${style.dot} shrink-0`} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{zone.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {zone.slope}&deg; slope &middot; {zone.soilType}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge className={`${style.bg} ${style.text} text-[9px] border-0`}>
                              {SUSCEPTIBILITY_LABELS[zone.susceptibility]}
                            </Badge>
                            {zone.recentActivity && (
                              <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredZones.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No zones match the selected filter.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Selected Zone Details */}
            <AnimatePresence>
              {selectedZone && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Separator />
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Zone Details
                    </p>
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Mountain className="h-4 w-4 text-orange-500 shrink-0" />
                        <p className="text-sm font-semibold">{selectedZone.name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Susceptibility:</span>
                          <Badge className={`${SUSCEPTIBILITY_STYLES[selectedZone.susceptibility].bg} ${SUSCEPTIBILITY_STYLES[selectedZone.susceptibility].text} text-[9px] border-0`}>
                            {SUSCEPTIBILITY_LABELS[selectedZone.susceptibility]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mountain className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Slope:</span>
                          <span className="font-medium">{selectedZone.slope}&deg;</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          <span className="text-muted-foreground">Threshold:</span>
                          <span className="font-medium">{selectedZone.rainfallThreshold} mm</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Droplets className={`h-3 w-3 ${selectedZone.currentRainfall >= selectedZone.rainfallThreshold ? 'text-red-500' : 'text-blue-500'}`} />
                          <span className="text-muted-foreground">Current:</span>
                          <span className={`font-medium ${selectedZone.currentRainfall >= selectedZone.rainfallThreshold ? 'text-red-600 dark:text-red-400' : ''}`}>
                            {selectedZone.currentRainfall} mm
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Soil:</span>
                          <span className="font-medium">{selectedZone.soilType}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TreePine className="h-3 w-3 text-green-500" />
                          <span className="text-muted-foreground">Vegetation:</span>
                          <span className="font-medium">{selectedZone.vegetationCover}%</span>
                        </div>
                      </div>

                      {/* Rainfall progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Rainfall vs Threshold</span>
                          <span className={isRainfallCritical ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}>
                            {Math.round((selectedZone.currentRainfall / selectedZone.rainfallThreshold) * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isRainfallCritical ? 'bg-red-500' : rainfallPct > 75 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(rainfallPct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Vegetation bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Vegetation Cover</span>
                          <span className="text-muted-foreground">{selectedZone.vegetationCover}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{ width: `${selectedZone.vegetationCover}%` }}
                          />
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="flex items-center gap-2">
                        {selectedZone.recentActivity ? (
                          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] border-0">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Recent Activity Detected
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] border-0">
                            No Recent Activity
                          </Badge>
                        )}
                      </div>

                      {/* Coordinates */}
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {selectedZone.latitude.toFixed(4)}, {selectedZone.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
