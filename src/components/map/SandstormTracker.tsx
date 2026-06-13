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
import { useMapStore, type SandstormEvent } from '@/lib/map-store'
import { Wind, X, Cloud, Eye, Filter, MapPin } from 'lucide-react'

const INTENSITY_STYLES: Record<SandstormEvent['intensity'], { bg: string; text: string; dot: string }> = {
  minor: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  moderate: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  severe: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  extreme: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

const INTENSITY_OPTIONS: { value: 'all' | 'minor' | 'moderate' | 'severe' | 'extreme'; label: string }[] = [
  { value: 'all', label: 'All Intensities' },
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'extreme', label: 'Extreme' },
]

function generateSampleStorms(): SandstormEvent[] {
  return [
    {
      id: 'ss-1',
      name: 'Sahara Major Dust Plume',
      latitude: 23.42,
      longitude: 2.11,
      intensity: 'extreme',
      pm10: 1850,
      pm25: 620,
      visibility: 0.3,
      windSpeed: 85,
      direction: 225,
      startTime: '2024-04-12T06:00:00Z',
      affectedArea: 480000,
    },
    {
      id: 'ss-2',
      name: 'Gobi Desert Spring Storm',
      latitude: 42.59,
      longitude: 105.37,
      intensity: 'severe',
      pm10: 980,
      pm25: 340,
      visibility: 0.8,
      windSpeed: 62,
      direction: 315,
      startTime: '2024-04-10T14:00:00Z',
      affectedArea: 210000,
    },
    {
      id: 'ss-3',
      name: 'Arabian Peninsula Shamal',
      latitude: 24.71,
      longitude: 46.68,
      intensity: 'severe',
      pm10: 1200,
      pm25: 410,
      visibility: 0.5,
      windSpeed: 72,
      direction: 330,
      startTime: '2024-04-08T10:00:00Z',
      affectedArea: 175000,
    },
    {
      id: 'ss-4',
      name: 'Taklamakan Dust Outbreak',
      latitude: 39.47,
      longitude: 82.43,
      intensity: 'moderate',
      pm10: 540,
      pm25: 180,
      visibility: 2.1,
      windSpeed: 45,
      direction: 270,
      startTime: '2024-04-14T02:00:00Z',
      affectedArea: 95000,
    },
    {
      id: 'ss-5',
      name: 'Sahel Seasonal Dust',
      latitude: 15.0,
      longitude: -5.0,
      intensity: 'minor',
      pm10: 220,
      pm25: 85,
      visibility: 4.5,
      windSpeed: 28,
      direction: 180,
      startTime: '2024-04-15T18:00:00Z',
      affectedArea: 62000,
    },
    {
      id: 'ss-6',
      name: 'Lake Eyre Basin Event',
      latitude: -28.47,
      longitude: 137.21,
      intensity: 'minor',
      pm10: 180,
      pm25: 65,
      visibility: 5.2,
      windSpeed: 35,
      direction: 200,
      startTime: '2024-04-11T09:00:00Z',
      affectedArea: 34000,
    },
    {
      id: 'ss-7',
      name: 'Mojave Desert Haboob',
      latitude: 35.01,
      longitude: -115.47,
      intensity: 'moderate',
      pm10: 620,
      pm25: 210,
      visibility: 1.6,
      windSpeed: 52,
      direction: 240,
      startTime: '2024-04-13T16:00:00Z',
      affectedArea: 28000,
    },
  ]
}

export function SandstormTracker() {
  const sandstormTracker = useMapStore((s) => s.sandstormTracker)
  const setSandstormTracker = useMapStore((s) => s.setSandstormTracker)

  const sampleStorms = useMemo(() => generateSampleStorms(), [])

  const storms = sandstormTracker.storms.length > 0 ? sandstormTracker.storms : sampleStorms

  const filteredStorms = useMemo(() => {
    if (sandstormTracker.intensityFilter === 'all') return storms
    return storms.filter((s) => s.intensity === sandstormTracker.intensityFilter)
  }, [storms, sandstormTracker.intensityFilter])

  const selectedStorm = useMemo(() => {
    if (!sandstormTracker.activeStormId) return null
    return storms.find((s) => s.id === sandstormTracker.activeStormId) ?? null
  }, [storms, sandstormTracker.activeStormId])

  const summaryStats = useMemo(() => {
    const activeCount = filteredStorms.length
    const avgPM10 = activeCount > 0 ? Math.round(filteredStorms.reduce((sum, s) => sum + s.pm10, 0) / activeCount) : 0
    const totalArea = filteredStorms.reduce((sum, s) => sum + s.affectedArea, 0)
    return { activeCount, avgPM10, totalArea }
  }, [filteredStorms])

  if (typeof window === 'undefined') return null
  if (!sandstormTracker.open) return null

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
                <Wind className="h-4 w-4 text-orange-500" />
                Sandstorm Tracker
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {summaryStats.activeCount} active
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSandstormTracker({ open: false })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
                <p className="text-sm font-semibold">{summaryStats.activeCount}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg PM10</p>
                <p className="text-sm font-semibold">{summaryStats.avgPM10}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Area (km²)</p>
                <p className="text-sm font-semibold">{(summaryStats.totalArea / 1000).toFixed(0)}k</p>
              </div>
            </div>

            <Separator />

            {/* Toggle Buttons */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showPlumes' as const, label: 'Plumes', icon: Cloud },
                  { key: 'showPM' as const, label: 'PM Data', icon: Wind },
                  { key: 'showVisibility' as const, label: 'Visibility', icon: Eye },
                  { key: 'showWind' as const, label: 'Wind', icon: Wind },
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={sandstormTracker[key] ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs justify-start gap-1.5"
                    onClick={() => setSandstormTracker({ [key]: !sandstormTracker[key] })}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Intensity Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Intensity Filter
                </p>
              </div>
              <Select
                value={sandstormTracker.intensityFilter}
                onValueChange={(value: 'all' | 'minor' | 'moderate' | 'severe' | 'extreme') =>
                  setSandstormTracker({ intensityFilter: value })
                }
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Filter by intensity" />
                </SelectTrigger>
                <SelectContent>
                  {INTENSITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Storm List */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {filteredStorms.map((storm) => {
                  const style = INTENSITY_STYLES[storm.intensity]
                  const isSelected = sandstormTracker.activeStormId === storm.id

                  return (
                    <div
                      key={storm.id}
                      className={`rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-orange-300 dark:border-orange-700 bg-orange-500/5'
                          : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() =>
                        setSandstormTracker({
                          activeStormId: isSelected ? null : storm.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`h-2 w-2 rounded-full ${style.dot} shrink-0 ${
                              storm.intensity === 'extreme' ? 'animate-pulse' : ''
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{storm.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              PM10: {storm.pm10} · {storm.visibility} km vis
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${style.bg} ${style.text} text-[9px] border-0 capitalize shrink-0`}
                        >
                          {storm.intensity}
                        </Badge>
                      </div>
                    </div>
                  )
                })}

                {filteredStorms.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No storms match the current filter.
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* Selected Storm Details */}
            <AnimatePresence>
              {selectedStorm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Separator />
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-orange-500" />
                        {selectedStorm.name}
                      </p>
                      <Badge
                        className={`${INTENSITY_STYLES[selectedStorm.intensity].bg} ${INTENSITY_STYLES[selectedStorm.intensity].text} text-[9px] border-0 capitalize`}
                      >
                        {selectedStorm.intensity}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Cloud className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">PM10:</span>
                        <span className="font-medium">{selectedStorm.pm10} µg/m³</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cloud className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">PM2.5:</span>
                        <span className="font-medium">{selectedStorm.pm25} µg/m³</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Visibility:</span>
                        <span className="font-medium">{selectedStorm.visibility} km</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wind className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Wind:</span>
                        <span className="font-medium">{selectedStorm.windSpeed} km/h</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wind className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Direction:</span>
                        <span className="font-medium">{selectedStorm.direction}°</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Coords:</span>
                        <span className="font-medium">
                          {selectedStorm.latitude.toFixed(2)}, {selectedStorm.longitude.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cloud className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Area:</span>
                        <span className="font-medium">{selectedStorm.affectedArea.toLocaleString()} km²</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wind className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Started:</span>
                        <span className="font-medium">
                          {new Date(selectedStorm.startTime).toLocaleDateString()}
                        </span>
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
