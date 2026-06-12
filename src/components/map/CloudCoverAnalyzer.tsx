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
import { useMapStore, type CloudCoverState, type CloudLayer } from '@/lib/map-store'
import { Cloud, X, Thermometer, Filter, MapPin, CloudRain } from 'lucide-react'

const CLOUD_TYPE_STYLES: Record<CloudLayer['cloudType'], { bg: string; text: string; dot: string }> = {
  cirrus: { bg: 'bg-sky-200/30', text: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-400' },
  cumulus: { bg: 'bg-white/30 dark:bg-white/10', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-200 dark:bg-gray-400' },
  stratus: { bg: 'bg-gray-200/30 dark:bg-gray-500/20', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  nimbus: { bg: 'bg-gray-400/20 dark:bg-gray-600/20', text: 'text-gray-800 dark:text-gray-300', dot: 'bg-gray-600' },
  cumulonimbus: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
}

const CLOUD_TYPE_FILTER_OPTIONS: { value: CloudCoverState['cloudTypeFilter']; label: string }[] = [
  { value: 'all', label: 'All Cloud Types' },
  { value: 'cirrus', label: 'Cirrus' },
  { value: 'cumulus', label: 'Cumulus' },
  { value: 'stratus', label: 'Stratus' },
  { value: 'nimbus', label: 'Nimbus' },
  { value: 'cumulonimbus', label: 'Cumulonimbus' },
]

function generateSampleCloudLayers(): CloudLayer[] {
  return [
    {
      id: 'cl-1',
      name: 'ITCZ Pacific Region',
      latitude: 5.0,
      longitude: -160.0,
      coverage: 92,
      cloudType: 'cumulonimbus',
      altitude: 12.5,
      temperature: -45,
      precipitation: true,
    },
    {
      id: 'cl-2',
      name: 'North Atlantic Stratocumulus',
      latitude: 38.5,
      longitude: -32.0,
      coverage: 78,
      cloudType: 'stratus',
      altitude: 1.2,
      temperature: 8,
      precipitation: false,
    },
    {
      id: 'cl-3',
      name: 'Saharan Air Layer',
      latitude: 18.0,
      longitude: 15.0,
      coverage: 45,
      cloudType: 'cirrus',
      altitude: 10.8,
      temperature: -38,
      precipitation: false,
    },
    {
      id: 'cl-4',
      name: 'Amazon Basin Convective',
      latitude: -3.5,
      longitude: -60.0,
      coverage: 88,
      cloudType: 'cumulonimbus',
      altitude: 14.2,
      temperature: -52,
      precipitation: true,
    },
    {
      id: 'cl-5',
      name: 'Bay of Bengal Monsoon',
      latitude: 14.0,
      longitude: 88.0,
      coverage: 95,
      cloudType: 'nimbus',
      altitude: 8.5,
      temperature: -22,
      precipitation: true,
    },
    {
      id: 'cl-6',
      name: 'European Warm Front',
      latitude: 50.0,
      longitude: 10.0,
      coverage: 65,
      cloudType: 'stratus',
      altitude: 3.2,
      temperature: -5,
      precipitation: true,
    },
    {
      id: 'cl-7',
      name: 'Rocky Mountain Cumulus',
      latitude: 40.5,
      longitude: -105.5,
      coverage: 55,
      cloudType: 'cumulus',
      altitude: 5.8,
      temperature: -15,
      precipitation: false,
    },
    {
      id: 'cl-8',
      name: 'West Pacific Typhoon Shield',
      latitude: 18.0,
      longitude: 135.0,
      coverage: 98,
      cloudType: 'cumulonimbus',
      altitude: 16.0,
      temperature: -60,
      precipitation: true,
    },
    {
      id: 'cl-9',
      name: 'Mediterranean Cirrus Belt',
      latitude: 38.0,
      longitude: 22.0,
      coverage: 35,
      cloudType: 'cirrus',
      altitude: 9.5,
      temperature: -32,
      precipitation: false,
    },
    {
      id: 'cl-10',
      name: 'Southern Ocean Nimbus',
      latitude: -55.0,
      longitude: 0.0,
      coverage: 82,
      cloudType: 'nimbus',
      altitude: 4.0,
      temperature: -8,
      precipitation: true,
    },
  ]
}

export function CloudCoverAnalyzer() {
  const cloudCover = useMapStore((s) => s.cloudCover)
  const setCloudCover = useMapStore((s) => s.setCloudCover)

  const sampleCloudLayers = useMemo(() => generateSampleCloudLayers(), [])

  const cloudLayers = cloudCover.cloudLayers.length > 0 ? cloudCover.cloudLayers : sampleCloudLayers

  const filteredLayers = useMemo(() => {
    if (cloudCover.cloudTypeFilter === 'all') return cloudLayers
    return cloudLayers.filter((l) => l.cloudType === cloudCover.cloudTypeFilter)
  }, [cloudLayers, cloudCover.cloudTypeFilter])

  const selectedLayer = useMemo(() => {
    if (!cloudCover.activeCloudId) return null
    return cloudLayers.find((l) => l.id === cloudCover.activeCloudId) ?? null
  }, [cloudLayers, cloudCover.activeCloudId])

  const summaryStats = useMemo(() => {
    const count = filteredLayers.length
    const avgCoverage = count > 0 ? Math.round(filteredLayers.reduce((sum, l) => sum + l.coverage, 0) / count) : 0
    const precipZones = filteredLayers.filter((l) => l.precipitation).length
    const highestAlt = count > 0 ? Math.max(...filteredLayers.map((l) => l.altitude)) : 0
    return { count, avgCoverage, precipZones, highestAlt }
  }, [filteredLayers])

  if (typeof window === 'undefined') return null
  if (!cloudCover.open) return null

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
                <Cloud className="h-4 w-4 text-sky-500" />
                Cloud Cover Analyzer
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {summaryStats.count} layers
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setCloudCover({ open: false })}
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
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Coverage</p>
                <p className="text-sm font-semibold">{summaryStats.avgCoverage}%</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Precip Zones</p>
                <p className="text-sm font-semibold">{summaryStats.precipZones}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Highest Alt</p>
                <p className="text-sm font-semibold">{summaryStats.highestAlt.toFixed(1)} km</p>
              </div>
            </div>

            <Separator />

            {/* Toggle Buttons */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showCoverage' as const, label: 'Coverage', icon: Cloud },
                  { key: 'showAltitude' as const, label: 'Altitude', icon: MapPin },
                  { key: 'showPrecipitation' as const, label: 'Precipitation', icon: CloudRain },
                  { key: 'showTemperature' as const, label: 'Temperature', icon: Thermometer },
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={cloudCover[key] ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs justify-start gap-1.5"
                    onClick={() => setCloudCover({ [key]: !cloudCover[key] })}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Cloud Type Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cloud Type Filter
                </p>
              </div>
              <Select
                value={cloudCover.cloudTypeFilter}
                onValueChange={(value: CloudCoverState['cloudTypeFilter']) =>
                  setCloudCover({ cloudTypeFilter: value })
                }
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Filter by cloud type" />
                </SelectTrigger>
                <SelectContent>
                  {CLOUD_TYPE_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Cloud Layers List */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {filteredLayers.map((layer) => {
                  const style = CLOUD_TYPE_STYLES[layer.cloudType]
                  const isSelected = cloudCover.activeCloudId === layer.id

                  return (
                    <div
                      key={layer.id}
                      className={`rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-sky-300 dark:border-sky-700 bg-sky-500/5'
                          : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() =>
                        setCloudCover({
                          activeCloudId: isSelected ? null : layer.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`h-2 w-2 rounded-full ${style.dot} shrink-0`} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{layer.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {cloudCover.showCoverage && `${layer.coverage}% cov`}
                              {cloudCover.showCoverage && cloudCover.showAltitude && ' · '}
                              {cloudCover.showAltitude && `${layer.altitude} km`}
                              {((cloudCover.showCoverage || cloudCover.showAltitude) && cloudCover.showTemperature) && ' · '}
                              {cloudCover.showTemperature && `${layer.temperature}°C`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {cloudCover.showPrecipitation && layer.precipitation && (
                            <CloudRain className="h-3 w-3 text-blue-500" />
                          )}
                          <Badge
                            className={`${style.bg} ${style.text} text-[9px] border-0 capitalize shrink-0`}
                          >
                            {layer.cloudType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredLayers.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No cloud layers match the current filter.
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* Selected Cloud Layer Details */}
            <AnimatePresence>
              {selectedLayer && (
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
                        <MapPin className="h-3.5 w-3.5 text-sky-500" />
                        {selectedLayer.name}
                      </p>
                      <Badge
                        className={`${CLOUD_TYPE_STYLES[selectedLayer.cloudType].bg} ${CLOUD_TYPE_STYLES[selectedLayer.cloudType].text} text-[9px] border-0 capitalize`}
                      >
                        {selectedLayer.cloudType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Cloud className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="font-medium">{selectedLayer.coverage}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Altitude:</span>
                        <span className="font-medium">{selectedLayer.altitude} km</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Temp:</span>
                        <span className="font-medium">{selectedLayer.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CloudRain className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Precip:</span>
                        <span className="font-medium">{selectedLayer.precipitation ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Coordinates:</span>
                        <span className="font-medium">
                          {selectedLayer.latitude.toFixed(2)}°, {selectedLayer.longitude.toFixed(2)}°
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cloud className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{selectedLayer.cloudType}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CloudRain className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={selectedLayer.precipitation ? 'default' : 'secondary'}
                          className="text-[9px] h-4"
                        >
                          {selectedLayer.precipitation ? 'Precipitating' : 'Dry'}
                        </Badge>
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
