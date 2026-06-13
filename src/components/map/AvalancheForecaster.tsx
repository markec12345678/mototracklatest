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
import { useMapStore, type AvalancheZone, type AvalancheForecasterState } from '@/lib/map-store'
import {
  Mountain,
  X,
  Snowflake,
  Wind,
  Filter,
  MapPin,
} from 'lucide-react'

const DANGER_STYLES: Record<AvalancheZone['dangerLevel'], { bg: string; text: string; dot: string }> = {
  low: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  moderate: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  considerable: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  high: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  extreme: { bg: 'bg-red-800/10', text: 'text-red-900 dark:text-red-300', dot: 'bg-red-800' },
}

const DANGER_LABELS: Record<AvalancheZone['dangerLevel'], string> = {
  low: 'Low',
  moderate: 'Moderate',
  considerable: 'Considerable',
  high: 'High',
  extreme: 'Extreme',
}

function generateSampleZones(): AvalancheZone[] {
  return [
    {
      id: 'az1',
      name: 'Alps - Chamonix',
      latitude: 45.92,
      longitude: 6.87,
      dangerLevel: 'high',
      snowStability: 2.1,
      recentSnowfall: 65,
      windLoading: true,
      temperature: -8,
      aspect: 'NE',
      elevation: 3200,
    },
    {
      id: 'az2',
      name: 'Rockies - Vail',
      latitude: 39.64,
      longitude: -106.36,
      dangerLevel: 'considerable',
      snowStability: 3.4,
      recentSnowfall: 42,
      windLoading: true,
      temperature: -5,
      aspect: 'NW',
      elevation: 3450,
    },
    {
      id: 'az3',
      name: 'Wasatch Range',
      latitude: 40.65,
      longitude: -111.65,
      dangerLevel: 'moderate',
      snowStability: 4.2,
      recentSnowfall: 28,
      windLoading: false,
      temperature: -3,
      aspect: 'S',
      elevation: 2900,
    },
    {
      id: 'az4',
      name: 'Himalaya - Annapurna',
      latitude: 28.6,
      longitude: 83.82,
      dangerLevel: 'extreme',
      snowStability: 1.2,
      recentSnowfall: 95,
      windLoading: true,
      temperature: -18,
      aspect: 'N',
      elevation: 5100,
    },
    {
      id: 'az5',
      name: 'Norwegian Mountains - Tromsø',
      latitude: 69.65,
      longitude: 18.96,
      dangerLevel: 'considerable',
      snowStability: 3.0,
      recentSnowfall: 50,
      windLoading: true,
      temperature: -10,
      aspect: 'SE',
      elevation: 1600,
    },
    {
      id: 'az6',
      name: 'Scottish Highlands - Cairngorms',
      latitude: 57.12,
      longitude: -3.67,
      dangerLevel: 'low',
      snowStability: 4.8,
      recentSnowfall: 12,
      windLoading: false,
      temperature: 1,
      aspect: 'W',
      elevation: 1100,
    },
  ]
}

export function AvalancheForecaster() {
  const avalancheForecaster = useMapStore((s) => s.avalancheForecaster)
  const setAvalancheForecaster = useMapStore((s) => s.setAvalancheForecaster)

  const sampleZones = useMemo(() => generateSampleZones(), [])

  const zones = avalancheForecaster.avalancheZones.length > 0
    ? avalancheForecaster.avalancheZones
    : sampleZones

  const filteredZones = useMemo(() => {
    if (avalancheForecaster.dangerFilter === 'all') return zones
    return zones.filter((z) => z.dangerLevel === avalancheForecaster.dangerFilter)
  }, [zones, avalancheForecaster.dangerFilter])

  const selectedZone = avalancheForecaster.activeZoneId
    ? zones.find((z) => z.id === avalancheForecaster.activeZoneId)
    : null

  const summaryStats = useMemo(() => {
    const highDanger = zones.filter(
      (z) => z.dangerLevel === 'high' || z.dangerLevel === 'extreme'
    ).length
    const avgStability = zones.reduce((sum, z) => sum + z.snowStability, 0) / zones.length
    const windLoading = zones.filter((z) => z.windLoading).length
    return { highDanger, avgStability: avgStability.toFixed(1), windLoading }
  }, [zones])

  if (typeof window === 'undefined') return null
  if (!avalancheForecaster.open) return null

  const toggleKeys = [
    { key: 'showDanger' as const, label: 'Danger', icon: Mountain },
    { key: 'showStability' as const, label: 'Stability', icon: Snowflake },
    { key: 'showSnowfall' as const, label: 'Snowfall', icon: Wind },
    { key: 'showAspect' as const, label: 'Aspect', icon: MapPin },
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
                <Mountain className="h-4 w-4 text-red-500" />
                Avalanche Forecaster
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {zones.length} zones
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setAvalancheForecaster({ open: false })}
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
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{summaryStats.highDanger}</p>
                <p className="text-[10px] text-muted-foreground">High+ Danger</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2 text-center">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{summaryStats.avgStability}</p>
                <p className="text-[10px] text-muted-foreground">Avg Stability</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2 text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{summaryStats.windLoading}</p>
                <p className="text-[10px] text-muted-foreground">Wind Loading</p>
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
                    variant={avalancheForecaster[key] ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs justify-start gap-1.5"
                    onClick={() =>
                      setAvalancheForecaster({ [key]: !avalancheForecaster[key] })
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Danger Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Danger Filter
                </p>
              </div>
              <Select
                value={avalancheForecaster.dangerFilter}
                onValueChange={(value) =>
                  setAvalancheForecaster({
                    dangerFilter: value as AvalancheForecasterState['dangerFilter'],
                  })
                }
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Filter by danger level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="considerable">Considerable</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
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
                    const style = DANGER_STYLES[zone.dangerLevel]
                    const isSelected = avalancheForecaster.activeZoneId === zone.id

                    return (
                      <div
                        key={zone.id}
                        className={`rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-red-300 dark:border-red-700 bg-red-500/5'
                            : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                        }`}
                        onClick={() =>
                          setAvalancheForecaster({
                            activeZoneId: isSelected ? null : zone.id,
                          })
                        }
                      >
                        <div className="flex items-center justify-between p-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`h-2 w-2 rounded-full ${style.dot} shrink-0`} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{zone.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {avalancheForecaster.showStability && `Stability: ${zone.snowStability.toFixed(1)} · `}
                                {avalancheForecaster.showSnowfall && `${zone.recentSnowfall}cm · `}
                                {zone.temperature}°C
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {avalancheForecaster.showAspect && (
                              <Badge variant="outline" className="text-[9px] h-5">
                                {zone.aspect}
                              </Badge>
                            )}
                            <Badge className={`${style.bg} ${style.text} text-[9px] border-0`}>
                              {DANGER_LABELS[zone.dangerLevel]}
                            </Badge>
                            {zone.windLoading && (
                              <Wind className="h-3 w-3 text-amber-500 shrink-0" />
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
                        <Mountain className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-sm font-semibold">{selectedZone.name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Mountain className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Danger:</span>
                          <Badge className={`${DANGER_STYLES[selectedZone.dangerLevel].bg} ${DANGER_STYLES[selectedZone.dangerLevel].text} text-[9px] border-0`}>
                            {DANGER_LABELS[selectedZone.dangerLevel]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Snowflake className="h-3 w-3 text-blue-500" />
                          <span className="text-muted-foreground">Stability:</span>
                          <span className="font-medium">{selectedZone.snowStability.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wind className="h-3 w-3 text-cyan-500" />
                          <span className="text-muted-foreground">Snowfall:</span>
                          <span className="font-medium">{selectedZone.recentSnowfall} cm</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wind className={`h-3 w-3 ${selectedZone.windLoading ? 'text-amber-500' : 'text-muted-foreground'}`} />
                          <span className="text-muted-foreground">Wind Load:</span>
                          {selectedZone.windLoading ? (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] border-0">
                              Active
                            </Badge>
                          ) : (
                            <span className="font-medium text-muted-foreground">None</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Snowflake className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Temp:</span>
                          <span className="font-medium">{selectedZone.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Aspect:</span>
                          <span className="font-medium">{selectedZone.aspect}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mountain className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Elevation:</span>
                          <span className="font-medium">{selectedZone.elevation} m</span>
                        </div>
                      </div>

                      {/* Snow stability bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Snow Stability (1-5)</span>
                          <span className="text-muted-foreground">{selectedZone.snowStability.toFixed(1)} / 5</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              selectedZone.snowStability >= 4
                                ? 'bg-green-500'
                                : selectedZone.snowStability >= 3
                                  ? 'bg-yellow-500'
                                  : selectedZone.snowStability >= 2
                                    ? 'bg-orange-500'
                                    : 'bg-red-500'
                            }`}
                            style={{ width: `${(selectedZone.snowStability / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Recent snowfall bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Recent Snowfall</span>
                          <span className="text-muted-foreground">{selectedZone.recentSnowfall} cm</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              selectedZone.recentSnowfall >= 80
                                ? 'bg-red-500'
                                : selectedZone.recentSnowfall >= 50
                                  ? 'bg-orange-500'
                                  : selectedZone.recentSnowfall >= 30
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((selectedZone.recentSnowfall / 100) * 100, 100)}%` }}
                          />
                        </div>
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
