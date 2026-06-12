'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type OceanAcidificationState, type OceanAcidSite } from '@/lib/map-store'
import {
  Droplets,
  X,
  Thermometer,
  AlertTriangle,
  Filter,
  MapPin,
} from 'lucide-react'

// Sample data: 6+ sites
const SAMPLE_SITES: OceanAcidSite[] = [
  {
    id: 'oa-1',
    name: 'Great Barrier Reef',
    latitude: -18.2871,
    longitude: 147.6992,
    ph: 7.95,
    pCO2: 380,
    aragoniteSaturation: 3.2,
    coralImpact: 'high',
    trend: 'declining',
    samplingDepth: 10,
  },
  {
    id: 'oa-2',
    name: 'Hawaii Ocean Time-series',
    latitude: 22.75,
    longitude: -158.0,
    ph: 8.07,
    pCO2: 355,
    aragoniteSaturation: 3.8,
    coralImpact: 'moderate',
    trend: 'declining',
    samplingDepth: 25,
  },
  {
    id: 'oa-3',
    name: 'Bermuda Atlantic Time-series',
    latitude: 31.83,
    longitude: -64.17,
    ph: 8.05,
    pCO2: 360,
    aragoniteSaturation: 3.6,
    coralImpact: 'low',
    trend: 'stable',
    samplingDepth: 30,
  },
  {
    id: 'oa-4',
    name: 'Iceland Sea',
    latitude: 68.0,
    longitude: -12.0,
    ph: 8.02,
    pCO2: 370,
    aragoniteSaturation: 2.5,
    coralImpact: 'none',
    trend: 'declining',
    samplingDepth: 50,
  },
  {
    id: 'oa-5',
    name: 'Canary Islands',
    latitude: 28.0,
    longitude: -15.5,
    ph: 8.03,
    pCO2: 365,
    aragoniteSaturation: 3.4,
    coralImpact: 'moderate',
    trend: 'declining',
    samplingDepth: 20,
  },
  {
    id: 'oa-6',
    name: 'Bay of Bengal',
    latitude: 15.0,
    longitude: 88.0,
    ph: 7.88,
    pCO2: 420,
    aragoniteSaturation: 2.4,
    coralImpact: 'severe',
    trend: 'declining',
    samplingDepth: 15,
  },
]

// Impact badge color helper
function getImpactBadge(coralImpact: OceanAcidSite['coralImpact']) {
  const map: Record<OceanAcidSite['coralImpact'], { className: string; label: string }> = {
    none: { className: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'None' },
    low: { className: 'bg-green-100 text-green-800 border-green-300', label: 'Low' },
    moderate: { className: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Moderate' },
    high: { className: 'bg-orange-100 text-orange-800 border-orange-300', label: 'High' },
    severe: { className: 'bg-red-100 text-red-800 border-red-300', label: 'Severe' },
  }
  const config = map[coralImpact]
  return (
    <Badge variant="outline" className={`${config.className} text-xs font-medium`}>
      {config.label}
    </Badge>
  )
}

// Trend badge color helper
function getTrendBadge(trend: OceanAcidSite['trend']) {
  const map: Record<OceanAcidSite['trend'], { className: string; label: string }> = {
    improving: { className: 'bg-green-100 text-green-800 border-green-300', label: 'Improving' },
    stable: { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Stable' },
    declining: { className: 'bg-red-100 text-red-800 border-red-300', label: 'Declining' },
  }
  const config = map[trend]
  return (
    <Badge variant="outline" className={`${config.className} text-xs font-medium`}>
      {config.label}
    </Badge>
  )
}

export default function OceanAcidificationMonitor() {
  const oceanAcidification = useMapStore((s) => s.oceanAcidification)
  const setOceanAcidification = useMapStore((s) => s.setOceanAcidification)

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)

  // Use sample data if store has no sites
  const sites = useMemo(
    () => (oceanAcidification.acidSites.length > 0 ? oceanAcidification.acidSites : SAMPLE_SITES),
    [oceanAcidification.acidSites]
  )

  // Filtered sites
  const filteredSites = useMemo(() => {
    if (oceanAcidification.impactFilter === 'all') return sites
    return sites.filter((s) => s.coralImpact === oceanAcidification.impactFilter)
  }, [sites, oceanAcidification.impactFilter])

  // Selected site details
  const selectedSite = useMemo(
    () => sites.find((s) => s.id === selectedSiteId) ?? null,
    [sites, selectedSiteId]
  )

  // Summary stats
  const summary = useMemo(() => {
    const avgPh = sites.reduce((sum, s) => sum + s.ph, 0) / sites.length
    const decliningCount = sites.filter((s) => s.trend === 'declining').length
    const severeCount = sites.filter((s) => s.coralImpact === 'severe').length
    return { avgPh: avgPh.toFixed(2), decliningCount, severeCount }
  }, [sites])

  if (!oceanAcidification.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25 }}
        className="fixed right-4 top-16 z-50 w-[400px] max-h-[calc(100vh-5rem)]"
      >
        <Card className="shadow-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Droplets className="h-5 w-5 text-cyan-600" />
                Ocean Acidification Monitor
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOceanAcidification({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0 space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-cyan-50 dark:bg-cyan-950/40 p-2.5 text-center">
                <div className="text-xs text-muted-foreground">Avg pH</div>
                <div className="text-lg font-bold text-cyan-700 dark:text-cyan-400">
                  {summary.avgPh}
                </div>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-950/40 p-2.5 text-center">
                <div className="text-xs text-muted-foreground">Declining</div>
                <div className="text-lg font-bold text-red-700 dark:text-red-400">
                  {summary.decliningCount}
                </div>
              </div>
              <div className="rounded-lg bg-orange-50 dark:bg-orange-950/40 p-2.5 text-center">
                <div className="text-xs text-muted-foreground">Severe Impact</div>
                <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                  {summary.severeCount}
                </div>
              </div>
            </div>

            <Separator />

            {/* Toggles */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Display Options
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={oceanAcidification.showPH ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => setOceanAcidification({ showPH: !oceanAcidification.showPH })}
                >
                  <Thermometer className="h-3 w-3 mr-1" />
                  pH
                </Button>
                <Button
                  size="sm"
                  variant={oceanAcidification.showCO2 ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => setOceanAcidification({ showCO2: !oceanAcidification.showCO2 })}
                >
                  <Droplets className="h-3 w-3 mr-1" />
                  pCO2
                </Button>
                <Button
                  size="sm"
                  variant={oceanAcidification.showAragonite ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() =>
                    setOceanAcidification({ showAragonite: !oceanAcidification.showAragonite })
                  }
                >
                  Aragonite
                </Button>
                <Button
                  size="sm"
                  variant={oceanAcidification.showImpact ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() =>
                    setOceanAcidification({ showImpact: !oceanAcidification.showImpact })
                  }
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Impact
                </Button>
              </div>
            </div>

            <Separator />

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={oceanAcidification.impactFilter}
                onValueChange={(value: OceanAcidificationState['impactFilter']) =>
                  setOceanAcidification({ impactFilter: value })
                }
              >
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Filter by impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impacts</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Site List */}
            <ScrollArea className="max-h-72">
              <div className="space-y-2 pr-1">
                {filteredSites.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No sites match the current filter.
                  </div>
                )}
                {filteredSites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() =>
                      setSelectedSiteId(selectedSiteId === site.id ? null : site.id)
                    }
                    className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      selectedSiteId === site.id
                        ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/30'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                        <span className="text-sm font-medium truncate">{site.name}</span>
                      </div>
                      {getImpactBadge(site.coralImpact)}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {oceanAcidification.showPH && (
                        <span>
                          pH: <span className="font-medium text-foreground">{site.ph.toFixed(2)}</span>
                        </span>
                      )}
                      {oceanAcidification.showCO2 && (
                        <span>
                          pCO₂:{' '}
                          <span className="font-medium text-foreground">{site.pCO2} μatm</span>
                        </span>
                      )}
                      {oceanAcidification.showAragonite && (
                        <span>
                          Aragonite:{' '}
                          <span className="font-medium text-foreground">
                            {site.aragoniteSaturation.toFixed(1)}
                          </span>
                        </span>
                      )}
                      <span>
                        Depth:{' '}
                        <span className="font-medium text-foreground">{site.samplingDepth}m</span>
                      </span>
                    </div>

                    {oceanAcidification.showImpact && (
                      <div className="mt-1.5">
                        {getTrendBadge(site.trend)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Selected Site Details */}
            <AnimatePresence>
              {selectedSite && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Separator />
                  <div className="pt-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-cyan-600" />
                      <span className="text-sm font-semibold">{selectedSite.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-2">
                        <div className="text-muted-foreground">pH Level</div>
                        <div className="text-sm font-bold">{selectedSite.ph.toFixed(2)}</div>
                      </div>
                      <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-2">
                        <div className="text-muted-foreground">pCO₂ (μatm)</div>
                        <div className="text-sm font-bold">{selectedSite.pCO2}</div>
                      </div>
                      <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-2">
                        <div className="text-muted-foreground">Aragonite Saturation</div>
                        <div className="text-sm font-bold">
                          {selectedSite.aragoniteSaturation.toFixed(1)}
                        </div>
                      </div>
                      <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-2">
                        <div className="text-muted-foreground">Sampling Depth</div>
                        <div className="text-sm font-bold">{selectedSite.samplingDepth}m</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Coral Impact:</span>
                      {getImpactBadge(selectedSite.coralImpact)}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Trend:</span>
                      {getTrendBadge(selectedSite.trend)}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Coordinates: {selectedSite.latitude.toFixed(4)}°,{' '}
                      {selectedSite.longitude.toFixed(4)}°
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
