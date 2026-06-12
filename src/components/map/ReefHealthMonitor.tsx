'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { useMapStore, type ReefSite } from '@/lib/map-store'
import {
  Waves,
  X,
  Fish,
  Thermometer,
  Droplets,
  Activity,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Filter,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts'

// Demo data
const DEMO_REEF_SITES: ReefSite[] = [
  {
    id: 'reef-1',
    name: 'Great Barrier Reef - Northern Sector',
    latitude: -15.5,
    longitude: 145.8,
    healthIndex: 72,
    bleachingLevel: 'moderate',
    waterTemp: 28.5,
    salinity: 34.8,
    turbidity: 2.1,
    dissolvedOxygen: 7.2,
    coralCover: 45,
    fishSpecies: 320,
    lastSurvey: '2025-01-15',
    depth: 12,
    type: 'barrier',
  },
  {
    id: 'reef-2',
    name: 'Coral Sea Atoll',
    latitude: -17.2,
    longitude: 148.5,
    healthIndex: 88,
    bleachingLevel: 'low',
    waterTemp: 27.1,
    salinity: 35.1,
    turbidity: 0.8,
    dissolvedOxygen: 8.1,
    coralCover: 68,
    fishSpecies: 410,
    lastSurvey: '2025-02-01',
    depth: 8,
    type: 'atoll',
  },
  {
    id: 'reef-3',
    name: 'Ningaloo Fringing Reef',
    latitude: -22.0,
    longitude: 113.9,
    healthIndex: 91,
    bleachingLevel: 'none',
    waterTemp: 25.8,
    salinity: 35.4,
    turbidity: 1.2,
    dissolvedOxygen: 8.4,
    coralCover: 72,
    fishSpecies: 280,
    lastSurvey: '2025-01-20',
    depth: 6,
    type: 'fringing',
  },
  {
    id: 'reef-4',
    name: 'Caribbean Patch Reef',
    latitude: 18.3,
    longitude: -66.5,
    healthIndex: 38,
    bleachingLevel: 'severe',
    waterTemp: 31.2,
    salinity: 33.9,
    turbidity: 5.8,
    dissolvedOxygen: 5.8,
    coralCover: 18,
    fishSpecies: 95,
    lastSurvey: '2025-01-28',
    depth: 4,
    type: 'patch',
  },
  {
    id: 'reef-5',
    name: 'Red Sea Deep Reef',
    latitude: 24.8,
    longitude: 36.1,
    healthIndex: 82,
    bleachingLevel: 'low',
    waterTemp: 26.4,
    salinity: 40.2,
    turbidity: 0.5,
    dissolvedOxygen: 6.9,
    coralCover: 55,
    fishSpecies: 350,
    lastSurvey: '2025-02-10',
    depth: 35,
    type: 'deep',
  },
  {
    id: 'reef-6',
    name: 'Maldives Barrier Reef',
    latitude: 4.2,
    longitude: 73.5,
    healthIndex: 55,
    bleachingLevel: 'moderate',
    waterTemp: 30.1,
    salinity: 34.5,
    turbidity: 3.2,
    dissolvedOxygen: 6.4,
    coralCover: 32,
    fishSpecies: 215,
    lastSurvey: '2025-01-10',
    depth: 10,
    type: 'barrier',
  },
]

const CORAL_COVER_TREND = [
  { year: '2019', healthy: 62, stressed: 25, bleached: 13 },
  { year: '2020', healthy: 58, stressed: 27, bleached: 15 },
  { year: '2021', healthy: 54, stressed: 28, bleached: 18 },
  { year: '2022', healthy: 50, stressed: 30, bleached: 20 },
  { year: '2023', healthy: 47, stressed: 29, bleached: 24 },
  { year: '2024', healthy: 44, stressed: 30, bleached: 26 },
  { year: '2025', healthy: 42, stressed: 31, bleached: 27 },
]

const BLEACHING_STYLES: Record<string, { bg: string; color: string; label: string; icon: typeof AlertTriangle }> = {
  none: { bg: 'bg-emerald-500/10', color: 'text-emerald-600 dark:text-emerald-400', label: 'None', icon: Fish },
  low: { bg: 'bg-yellow-500/10', color: 'text-yellow-600 dark:text-yellow-400', label: 'Low', icon: AlertTriangle },
  moderate: { bg: 'bg-orange-500/10', color: 'text-orange-600 dark:text-orange-400', label: 'Moderate', icon: AlertTriangle },
  severe: { bg: 'bg-red-500/10', color: 'text-red-600 dark:text-red-400', label: 'Severe', icon: AlertTriangle },
  extreme: { bg: 'bg-rose-500/10', color: 'text-rose-600 dark:text-rose-400', label: 'Extreme', icon: AlertTriangle },
}

const REEF_TYPE_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  fringing: { bg: 'bg-cyan-500/10', color: 'text-cyan-600 dark:text-cyan-400', label: 'Fringing' },
  barrier: { bg: 'bg-blue-500/10', color: 'text-blue-600 dark:text-blue-400', label: 'Barrier' },
  atoll: { bg: 'bg-teal-500/10', color: 'text-teal-600 dark:text-teal-400', label: 'Atoll' },
  patch: { bg: 'bg-amber-500/10', color: 'text-amber-600 dark:text-amber-400', label: 'Patch' },
  deep: { bg: 'bg-indigo-500/10', color: 'text-indigo-600 dark:text-indigo-400', label: 'Deep' },
}

function getHealthColor(index: number): string {
  if (index >= 80) return '#22c55e'
  if (index >= 60) return '#84cc16'
  if (index >= 40) return '#eab308'
  if (index >= 20) return '#f97316'
  return '#ef4444'
}

function getHealthLabel(index: number): string {
  if (index >= 80) return 'Excellent'
  if (index >= 60) return 'Good'
  if (index >= 40) return 'Fair'
  if (index >= 20) return 'Poor'
  return 'Critical'
}

export function ReefHealthMonitor() {
  const reefHealth = useMapStore((s) => s.reefHealth)
  const setReefHealth = useMapStore((s) => s.setReefHealth)

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [localFilterType, setLocalFilterType] = useState<string[]>([])
  const [localFilterBleaching, setLocalFilterBleaching] = useState<string[]>([])

  // Use demo data if store is empty
  const sites = reefHealth.sites.length > 0 ? reefHealth.sites : DEMO_REEF_SITES
  const isOpen = reefHealth.open

  const filteredSites = useMemo(() => {
    let filtered = sites
    const typeFilter = reefHealth.filterType.length > 0 ? reefHealth.filterType : localFilterType
    const bleachingFilter = reefHealth.filterBleaching.length > 0 ? reefHealth.filterBleaching : localFilterBleaching

    if (typeFilter.length > 0) {
      filtered = filtered.filter((s) => typeFilter.includes(s.type))
    }
    if (bleachingFilter.length > 0) {
      filtered = filtered.filter((s) => bleachingFilter.includes(s.bleachingLevel))
    }
    return filtered
  }, [sites, reefHealth.filterType, reefHealth.filterBleaching, localFilterType, localFilterBleaching])

  const selectedSite = useMemo(() => {
    return sites.find((s) => s.id === selectedSiteId) || null
  }, [sites, selectedSiteId])

  const waterQualityData = useMemo(() => {
    if (!selectedSite) return []
    return [
      { name: 'Temp', value: selectedSite.waterTemp, max: 35, color: '#ef4444', unit: '°C' },
      { name: 'Salinity', value: selectedSite.salinity, max: 42, color: '#3b82f6', unit: 'PSU' },
      { name: 'Turbidity', value: selectedSite.turbidity, max: 10, color: '#f97316', unit: 'NTU' },
      { name: 'DO', value: selectedSite.dissolvedOxygen, max: 12, color: '#22c55e', unit: 'mg/L' },
    ]
  }, [selectedSite])

  const togglePanel = useCallback(() => {
    setReefHealth({ open: !isOpen })
  }, [isOpen, setReefHealth])

  const toggleFilterType = useCallback((type: string) => {
    setLocalFilterType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const toggleFilterBleaching = useCallback((level: string) => {
    setLocalFilterBleaching((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }, [])

  if (typeof window === 'undefined') return null

  return (
    <>
      {/* Toggle button */}
      <motion.div
        className="fixed top-20 right-[4.5rem] z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={togglePanel}
          className={cn(
            'h-11 w-11 rounded-full shadow-lg transition-all duration-200',
            'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white'
          )}
          aria-label={isOpen ? 'Close reef health monitor' : 'Open reef health monitor'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Waves className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-36 right-4 z-40 w-[400px] max-h-[75vh] flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                  <Waves className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Reef Health Monitor</h3>
                  <p className="text-[10px] text-muted-foreground">Coral reef health tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] font-normal">
                  {filteredSites.length} sites
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={togglePanel}
                  aria-label="Close panel"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <Tabs defaultValue="sites" className="w-full flex-1 flex flex-col min-h-0">
              <div className="px-4 pt-2">
                <TabsList className="w-full h-8 text-xs">
                  <TabsTrigger value="sites" className="text-[11px] flex-1">Sites</TabsTrigger>
                  <TabsTrigger value="waterquality" className="text-[11px] flex-1">Water Quality</TabsTrigger>
                  <TabsTrigger value="trends" className="text-[11px] flex-1">Trends</TabsTrigger>
                  <TabsTrigger value="overlays" className="text-[11px] flex-1">Overlays</TabsTrigger>
                </TabsList>
              </div>

              {/* Sites Tab */}
              <TabsContent value="sites" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-3">
                    {/* Filters */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Filter className="h-3 w-3 text-muted-foreground" />
                        <Label className="text-xs font-medium">Reef Type</Label>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(REEF_TYPE_CONFIG).map(([key, config]) => (
                          <Badge
                            key={key}
                            variant="outline"
                            className={cn(
                              'cursor-pointer text-[9px] transition-all',
                              localFilterType.includes(key)
                                ? cn(config.bg, config.color, 'ring-1 ring-current')
                                : 'opacity-60'
                            )}
                            onClick={() => toggleFilterType(key)}
                          >
                            {config.label}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                        <Label className="text-xs font-medium">Bleaching Level</Label>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(BLEACHING_STYLES).map(([key, config]) => (
                          <Badge
                            key={key}
                            variant="outline"
                            className={cn(
                              'cursor-pointer text-[9px] transition-all',
                              localFilterBleaching.includes(key)
                                ? cn(config.bg, config.color, 'ring-1 ring-current')
                                : 'opacity-60'
                            )}
                            onClick={() => toggleFilterBleaching(key)}
                          >
                            {config.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Site List */}
                    <div className="space-y-2">
                      {filteredSites.map((site) => {
                        const isSelected = selectedSiteId === site.id
                        const healthColor = getHealthColor(site.healthIndex)
                        const bleachingConfig = BLEACHING_STYLES[site.bleachingLevel]
                        const typeConfig = REEF_TYPE_CONFIG[site.type]
                        return (
                          <Card
                            key={site.id}
                            className={cn(
                              'cursor-pointer transition-all hover:shadow-md',
                              isSelected ? 'ring-1 ring-primary' : ''
                            )}
                            onClick={() => setSelectedSiteId(isSelected ? null : site.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <div
                                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: healthColor + '20' }}
                                >
                                  <Fish className="h-4 w-4" style={{ color: healthColor }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <span className="text-xs font-medium truncate">{site.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                    <Badge
                                      className="text-[9px] px-1.5 py-0 h-4"
                                      style={{ backgroundColor: healthColor + '15', color: healthColor, borderColor: healthColor + '30' }}
                                      variant="outline"
                                    >
                                      {site.healthIndex}/100
                                    </Badge>
                                    <Badge className={cn('text-[9px] px-1.5 py-0 h-4', bleachingConfig.bg, bleachingConfig.color)} variant="outline">
                                      {bleachingConfig.label}
                                    </Badge>
                                    <Badge className={cn('text-[9px] px-1.5 py-0 h-4', typeConfig.bg, typeConfig.color)} variant="outline">
                                      {typeConfig.label}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-0.5">
                                      <Thermometer className="h-2.5 w-2.5" />
                                      {site.waterTemp}°C
                                    </span>
                                    <span>{site.coralCover}% cover</span>
                                    <span>{site.fishSpecies} fish</span>
                                    <span>{site.depth}m depth</span>
                                  </div>
                                </div>
                                <ChevronRight className={cn(
                                  'h-3.5 w-3.5 text-muted-foreground transition-transform',
                                  isSelected && 'rotate-90'
                                )} />
                              </div>

                              {/* Expanded detail */}
                              {isSelected && (
                                <div className="mt-3 pt-2 border-t border-border/50">
                                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                      <span className="text-muted-foreground">Health Index</span>
                                      <span className="font-mono font-medium" style={{ color: healthColor }}>{site.healthIndex}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                      <span className="text-muted-foreground">Bleaching</span>
                                      <span className={cn('font-medium', bleachingConfig.color)}>{bleachingConfig.label}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                      <span className="text-muted-foreground">Salinity</span>
                                      <span className="font-mono">{site.salinity} PSU</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                      <span className="text-muted-foreground">Turbidity</span>
                                      <span className="font-mono">{site.turbidity} NTU</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                      <span className="text-muted-foreground">Dissolved O₂</span>
                                      <span className="font-mono">{site.dissolvedOxygen} mg/L</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                      <span className="text-muted-foreground">Coral Cover</span>
                                      <span className="font-mono">{site.coralCover}%</span>
                                    </div>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground mt-2">
                                    Last survey: {site.lastSurvey}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    {/* Health Index Gradient Legend */}
                    <div className="pt-2">
                      <Label className="text-xs font-medium mb-2 block">Health Index Scale</Label>
                      <div className="h-3 rounded-full overflow-hidden" style={{
                        background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)'
                      }} />
                      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span>0 - Critical</span>
                        <span>50 - Fair</span>
                        <span>100 - Excellent</span>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Water Quality Tab */}
              <TabsContent value="waterquality" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-4">
                    {selectedSite ? (
                      <>
                        <div className="text-xs font-medium flex items-center gap-1.5">
                          <Droplets className="h-3.5 w-3.5 text-cyan-500" />
                          {selectedSite.name}
                        </div>

                        {/* Water Quality Gauges */}
                        <div className="space-y-3">
                          {waterQualityData.map((param) => {
                            const percent = Math.min((param.value / param.max) * 100, 100)
                            return (
                              <div key={param.name} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] font-medium">{param.name}</Label>
                                  <span className="text-[10px] font-mono" style={{ color: param.color }}>
                                    {param.value} {param.unit}
                                  </span>
                                </div>
                                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: param.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <Separator />

                        {/* Water Quality Bar Chart */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">Quality Overview</Label>
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={waterQualityData} layout="vertical">
                                <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 9 }} />
                                <YAxis dataKey="name" type="category" width={55} tick={{ fontSize: 9 }} />
                                <RechartsTooltip
                                  contentStyle={{ fontSize: 10, borderRadius: 8 }}
                                  formatter={(value: number, name: string, props: { payload: { unit: string } }) =>
                                    [`${value} ${props.payload.unit}`, name]
                                  }
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                  {waterQualityData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Droplets className="h-8 w-8 mb-2 opacity-30" />
                        <p className="text-xs">Select a reef site to view water quality</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Coral Cover Trend (Global)</Label>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={CORAL_COVER_TREND}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                            <RechartsTooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                            <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                            <Line type="monotone" dataKey="healthy" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Healthy %" />
                            <Line type="monotone" dataKey="stressed" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} name="Stressed %" />
                            <Line type="monotone" dataKey="bleached" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Bleached %" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <Separator />

                    {/* Summary Stats */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Summary Statistics</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                          <CardContent className="p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Avg Health Index</p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {Math.round(sites.reduce((sum, s) => sum + s.healthIndex, 0) / sites.length)}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-red-500/5 border-red-500/20">
                          <CardContent className="p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Bleaching Alerts</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              {sites.filter((s) => s.bleachingLevel !== 'none').length}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-cyan-500/5 border-cyan-500/20">
                          <CardContent className="p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Avg Coral Cover</p>
                            <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                              {Math.round(sites.reduce((sum, s) => sum + s.coralCover, 0) / sites.length)}%
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-amber-500/5 border-amber-500/20">
                          <CardContent className="p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Total Fish Species</p>
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                              {sites.reduce((sum, s) => sum + s.fishSpecies, 0).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Bleaching Alert Summary */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Bleaching Distribution</Label>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(BLEACHING_STYLES).map(([key, config]) => ({
                              name: config.label,
                              count: sites.filter((s) => s.bleachingLevel === key).length,
                              color: key === 'none' ? '#22c55e' : key === 'low' ? '#eab308' : key === 'moderate' ? '#f97316' : key === 'severe' ? '#ef4444' : '#be123c',
                            }))}
                          >
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                            <RechartsTooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {Object.entries(BLEACHING_STYLES).map(([key], index) => (
                                <Cell
                                  key={index}
                                  fill={key === 'none' ? '#22c55e' : key === 'low' ? '#eab308' : key === 'moderate' ? '#f97316' : key === 'severe' ? '#ef4444' : '#be123c'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Overlays Tab */}
              <TabsContent value="overlays" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <Label className="text-xs font-medium mb-3 block">Map Overlays</Label>
                      <div className="space-y-3">
                        {[
                          { key: 'showSites' as const, label: 'Reef Sites', icon: Fish, desc: 'Reef site markers' },
                          { key: 'showHealthOverlay' as const, label: 'Health Overlay', icon: Activity, desc: 'Health index color map' },
                          { key: 'showBleachingAlert' as const, label: 'Bleaching Alerts', icon: AlertTriangle, desc: 'Bleaching severity zones' },
                          { key: 'showTemperature' as const, label: 'Water Temperature', icon: Thermometer, desc: 'Sea surface temperature' },
                          { key: 'showWaterQuality' as const, label: 'Water Quality', icon: Droplets, desc: 'Water quality indicators' },
                        ].map((overlay) => (
                          <div key={overlay.key} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <overlay.icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs font-medium">{overlay.label}</p>
                                <p className="text-[10px] text-muted-foreground">{overlay.desc}</p>
                              </div>
                            </div>
                            <Switch
                              checked={reefHealth[overlay.key]}
                              onCheckedChange={(checked) => setReefHealth({ [overlay.key]: checked })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Active Alerts */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Active Bleaching Alerts</Label>
                      <div className="space-y-1.5">
                        {sites
                          .filter((s) => s.bleachingLevel !== 'none')
                          .sort((a, b) => {
                            const order = { extreme: 4, severe: 3, moderate: 2, low: 1, none: 0 }
                            return order[b.bleachingLevel] - order[a.bleachingLevel]
                          })
                          .map((site) => {
                            const config = BLEACHING_STYLES[site.bleachingLevel]
                            return (
                              <div key={site.id} className={cn('flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px]', config.bg)}>
                                <config.icon className={cn('h-3 w-3', config.color)} />
                                <span className={cn('font-medium', config.color)}>{site.bleachingLevel.toUpperCase()}</span>
                                <span className="text-muted-foreground truncate">{site.name}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
