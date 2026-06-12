'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type VolcanicGasSite, type VolcanicGasState } from '@/lib/map-store'
import { Cloud, X, AlertTriangle, Users, Filter, MapPin } from 'lucide-react'

const DEMO_SITES: VolcanicGasSite[] = [
  {
    id: 'vg1',
    name: 'Etna SO2 Monitoring',
    latitude: 37.75,
    longitude: 14.99,
    volcano: 'Mount Etna',
    so2Emission: 3200,
    co2Emission: 18500,
    h2sEmission: 45,
    hazardLevel: 'elevated',
    windDirection: 225,
    affectedPopulation: 320000,
  },
  {
    id: 'vg2',
    name: 'Kilauea Gas Network',
    latitude: 19.41,
    longitude: -155.29,
    volcano: 'Kilauea',
    so2Emission: 850,
    co2Emission: 4200,
    h2sEmission: 12,
    hazardLevel: 'high',
    windDirection: 90,
    affectedPopulation: 145000,
  },
  {
    id: 'vg3',
    name: 'Popocatepetl Gas',
    latitude: 19.02,
    longitude: -98.62,
    volcano: 'Popocatepetl',
    so2Emission: 5100,
    co2Emission: 28000,
    h2sEmission: 78,
    hazardLevel: 'critical',
    windDirection: 315,
    affectedPopulation: 890000,
  },
  {
    id: 'vg4',
    name: 'Holuhraun Emission',
    latitude: 64.85,
    longitude: -16.83,
    volcano: 'Bardarbunga',
    so2Emission: 1200,
    co2Emission: 6800,
    h2sEmission: 22,
    hazardLevel: 'normal',
    windDirection: 180,
    affectedPopulation: 5200,
  },
  {
    id: 'vg5',
    name: 'Merapi Gas',
    latitude: -7.54,
    longitude: 110.44,
    volcano: 'Mount Merapi',
    so2Emission: 2700,
    co2Emission: 14500,
    h2sEmission: 55,
    hazardLevel: 'high',
    windDirection: 270,
    affectedPopulation: 420000,
  },
  {
    id: 'vg6',
    name: 'Nyiragongo Monitoring',
    latitude: -1.52,
    longitude: 29.23,
    volcano: 'Mount Nyiragongo',
    so2Emission: 4300,
    co2Emission: 22000,
    h2sEmission: 90,
    hazardLevel: 'critical',
    windDirection: 135,
    affectedPopulation: 650000,
  },
]

const HAZARD_STYLES: Record<VolcanicGasSite['hazardLevel'], { bg: string; text: string; dot: string }> = {
  normal: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  elevated: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

function windDirectionLabel(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return dirs[index]
}

export function VolcanicGasMonitor() {
  const volcanicGas = useMapStore((s) => s.volcanicGas)
  const setVolcanicGas = useMapStore((s) => s.setVolcanicGas)

  const sites = volcanicGas.gasSites.length > 0 ? volcanicGas.gasSites : DEMO_SITES

  const filteredSites = useMemo(() => {
    let result = sites
    if (volcanicGas.hazardFilter !== 'all') {
      result = result.filter((s) => s.hazardLevel === volcanicGas.hazardFilter)
    }
    return result
  }, [sites, volcanicGas.hazardFilter])

  const summary = useMemo(() => {
    const totalSO2 = filteredSites.reduce((sum, s) => sum + s.so2Emission, 0)
    const criticalCount = filteredSites.filter(
      (s) => s.hazardLevel === 'critical' || s.hazardLevel === 'high'
    ).length
    const totalAffected = filteredSites.reduce((sum, s) => sum + s.affectedPopulation, 0)
    return { totalSO2, criticalCount, totalAffected }
  }, [filteredSites])

  if (typeof window === 'undefined') return null
  if (!volcanicGas.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-16 right-4 z-30 w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-background/90 border shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Cloud className="h-4 w-4 text-orange-500" />
                Volcanic Gas Monitor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredSites.length} sites
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setVolcanicGas({ open: false })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total SO2</p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {summary.totalSO2.toLocaleString()}
                </p>
                <p className="text-[9px] text-muted-foreground">t/day</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Critical/High</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {summary.criticalCount}
                </p>
                <p className="text-[9px] text-muted-foreground">sites</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Affected Pop.</p>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {(summary.totalAffected / 1000).toFixed(0)}k
                </p>
                <p className="text-[9px] text-muted-foreground">people</p>
              </div>
            </div>

            <Separator />

            {/* Toggle Controls */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Options</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showSO2' as const, label: 'SO2 Emissions', icon: Cloud },
                  { key: 'showCO2' as const, label: 'CO2 Emissions', icon: Cloud },
                  { key: 'showHazard' as const, label: 'Hazard Levels', icon: AlertTriangle },
                  { key: 'showPopulation' as const, label: 'Population', icon: Users },
                ].map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={volcanicGas[key]}
                      onCheckedChange={(checked) => setVolcanicGas({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Hazard Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Hazard Filter
                </p>
              </div>
              <Select
                value={volcanicGas.hazardFilter}
                onValueChange={(value) =>
                  setVolcanicGas({ hazardFilter: value as VolcanicGasState['hazardFilter'] })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Filter by hazard level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="elevated">Elevated</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Site List */}
            <ScrollArea className="max-h-96">
              <div className="space-y-1.5">
                {filteredSites.map((site) => {
                  const hazardStyle = HAZARD_STYLES[site.hazardLevel]
                  const isActive = volcanicGas.activeSiteId === site.id

                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border transition-colors cursor-pointer ${
                        isActive
                          ? 'border-orange-300 dark:border-orange-700 bg-orange-500/5'
                          : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() =>
                        setVolcanicGas({
                          activeSiteId: isActive ? null : site.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`h-2 w-2 rounded-full ${hazardStyle.dot} shrink-0 ${
                              site.hazardLevel === 'critical' ? 'animate-pulse' : ''
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{site.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {site.volcano}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            className={`${hazardStyle.bg} ${hazardStyle.text} text-[9px] border-0 capitalize`}
                          >
                            {site.hazardLevel}
                          </Badge>
                        </div>
                      </div>

                      {/* Compact stats row */}
                      <div className="flex items-center gap-3 px-2 pb-1.5 text-[10px] text-muted-foreground">
                        {volcanicGas.showSO2 && (
                          <span>
                            SO2: <span className="font-medium text-foreground">{site.so2Emission.toLocaleString()}</span> t/d
                          </span>
                        )}
                        {volcanicGas.showCO2 && (
                          <span>
                            CO2: <span className="font-medium text-foreground">{site.co2Emission.toLocaleString()}</span> t/d
                          </span>
                        )}
                        {volcanicGas.showHazard && (
                          <span>
                            H2S: <span className="font-medium text-foreground">{site.h2sEmission}</span> ppm
                          </span>
                        )}
                        {volcanicGas.showPopulation && (
                          <span>
                            Pop: <span className="font-medium text-foreground">{(site.affectedPopulation / 1000).toFixed(0)}k</span>
                          </span>
                        )}
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 pb-2 space-y-1.5">
                              <Separator />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Coords:</span>
                                  <span className="font-medium">
                                    {site.latitude.toFixed(2)}, {site.longitude.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Cloud className="h-3 w-3 text-orange-500" />
                                  <span className="text-muted-foreground">SO2:</span>
                                  <span className="font-medium">
                                    {site.so2Emission.toLocaleString()} t/day
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Cloud className="h-3 w-3 text-emerald-500" />
                                  <span className="text-muted-foreground">CO2:</span>
                                  <span className="font-medium">
                                    {site.co2Emission.toLocaleString()} t/day
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Cloud className="h-3 w-3 text-yellow-500" />
                                  <span className="text-muted-foreground">H2S:</span>
                                  <span className="font-medium">{site.h2sEmission} ppm</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  <span className="text-muted-foreground">Hazard:</span>
                                  <span className={`font-medium capitalize ${hazardStyle.text}`}>
                                    {site.hazardLevel}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Cloud className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Wind:</span>
                                  <span className="font-medium">
                                    {site.windDirection}° ({windDirectionLabel(site.windDirection)})
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 col-span-2">
                                  <Users className="h-3 w-3 text-amber-500" />
                                  <span className="text-muted-foreground">Affected Population:</span>
                                  <span className="font-medium">
                                    {site.affectedPopulation.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}

                {filteredSites.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
