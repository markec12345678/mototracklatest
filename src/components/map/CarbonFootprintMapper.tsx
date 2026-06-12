'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type CarbonSource } from '@/lib/map-store'
import {
  X,
  Factory,
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Leaf,
  ArrowRight,
  Info,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell as RechartsCell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

// Demo carbon source data
const DEMO_SOURCES: CarbonSource[] = [
  { id: 'cs1', name: 'Tashan Power Plant', latitude: 34.75, longitude: 113.65, emissions: 45.2, sector: 'energy', trend: 'increasing', offsetAvailable: true },
  { id: 'cs2', name: 'Siberian Gas Fields', latitude: 61.0, longitude: 73.0, emissions: 62.8, sector: 'energy', trend: 'stable', offsetAvailable: false },
  { id: 'cs3', name: 'Ruhr Industrial Zone', latitude: 51.45, longitude: 7.02, emissions: 28.5, sector: 'industry', trend: 'decreasing', offsetAvailable: true },
  { id: 'cs4', name: 'Pearl River Delta Hub', latitude: 23.13, longitude: 113.26, emissions: 38.7, sector: 'transport', trend: 'increasing', offsetAvailable: false },
  { id: 'cs5', name: 'Iowa Corn Belt', latitude: 42.03, longitude: -93.46, emissions: 15.3, sector: 'agriculture', trend: 'stable', offsetAvailable: true },
  { id: 'cs6', name: 'Saudi Aramco Complex', latitude: 26.3, longitude: 49.9, emissions: 58.1, sector: 'energy', trend: 'increasing', offsetAvailable: false },
  { id: 'cs7', name: 'Po Valley Agriculture', latitude: 45.0, longitude: 10.5, emissions: 12.4, sector: 'agriculture', trend: 'decreasing', offsetAvailable: true },
  { id: 'cs8', name: 'Yangtze Steel Corridor', latitude: 30.5, longitude: 114.3, emissions: 41.9, sector: 'industry', trend: 'stable', offsetAvailable: true },
]

const SECTOR_STYLES: Record<string, { bg: string; text: string; label: string; icon: typeof Factory }> = {
  energy: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Energy', icon: Factory },
  transport: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', label: 'Transport', icon: ArrowRight },
  industry: { bg: 'bg-zinc-500/10', text: 'text-zinc-600 dark:text-zinc-400', label: 'Industry', icon: BarChart3 },
  agriculture: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', label: 'Agriculture', icon: Leaf },
}

const TREND_STYLES: Record<CarbonSource['trend'], { bg: string; text: string; icon: typeof TrendingUp }> = {
  increasing: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: TrendingUp },
  stable: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', icon: ArrowRight },
  decreasing: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', icon: TrendingDown },
}

const SECTOR_COLORS: Record<string, string> = {
  energy: '#f59e0b',
  transport: '#64748b',
  industry: '#71717a',
  agriculture: '#22c55e',
}

const GAS_TYPES: { value: 'co2' | 'methane' | 'n2o' | 'all'; label: string }[] = [
  { value: 'all', label: 'All Gases' },
  { value: 'co2', label: 'CO₂' },
  { value: 'methane', label: 'CH₄' },
  { value: 'n2o', label: 'N₂O' },
]

const SECTOR_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Sectors' },
  { value: 'energy', label: 'Energy' },
  { value: 'transport', label: 'Transport' },
  { value: 'industry', label: 'Industry' },
  { value: 'agriculture', label: 'Agriculture' },
]

export function CarbonFootprintMapper() {
  const carbonFootprint = useMapStore((s) => s.carbonFootprint)
  const setCarbonFootprint = useMapStore((s) => s.setCarbonFootprint)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sources = carbonFootprint.sources.length > 0 ? carbonFootprint.sources : DEMO_SOURCES

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchesSector = carbonFootprint.sector === 'all' || s.sector === carbonFootprint.sector
      return matchesSector
    })
  }, [sources, carbonFootprint.sector])

  const pieData = useMemo(() => {
    const sectorTotals: Record<string, number> = {}
    for (const s of filteredSources) {
      sectorTotals[s.sector] = (sectorTotals[s.sector] || 0) + s.emissions
    }
    return Object.entries(sectorTotals).map(([sector, total]) => ({
      name: SECTOR_STYLES[sector]?.label || sector,
      value: +total.toFixed(1),
      color: SECTOR_COLORS[sector] || '#94a3b8',
    }))
  }, [filteredSources])

  const topEmissionsData = useMemo(() => {
    return [...filteredSources]
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 6)
      .map((s) => ({
        name: s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name,
        emissions: s.emissions,
        color: SECTOR_COLORS[s.sector] || '#94a3b8',
        trend: s.trend,
      }))
  }, [filteredSources])

  if (typeof window === 'undefined') return null
  if (!carbonFootprint.open) return null

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
                <BarChart3 className="h-4 w-4 text-slate-500" />
                Carbon Footprint Mapper
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredSources.length} sources
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCarbonFootprint({ open: false })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Gas Type Filter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gas Type</p>
              <div className="flex flex-wrap gap-1">
                {GAS_TYPES.map((g) => (
                  <Badge
                    key={g.value}
                    variant={carbonFootprint.gasType === g.value ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setCarbonFootprint({ gasType: g.value })}
                  >
                    {g.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sector Filter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sector Filter</p>
              <div className="flex flex-wrap gap-1">
                {SECTOR_FILTERS.map((f) => (
                  <Badge
                    key={f.value}
                    variant={carbonFootprint.sector === f.value ? 'default' : 'outline'}
                    className={`text-[10px] cursor-pointer ${
                      carbonFootprint.sector === f.value && f.value !== 'all' ? `${SECTOR_STYLES[f.value]?.bg || ''} ${SECTOR_STYLES[f.value]?.text || ''} border-0` : ''
                    }`}
                    onClick={() => setCarbonFootprint({ sector: f.value as CarbonFootprint['sector'] })}
                  >
                    {f.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Overlay toggles */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showEmissions' as const, label: 'Emissions', icon: Factory },
                  { key: 'showHeatmap' as const, label: 'Heatmap', icon: BarChart3 },
                  { key: 'showOffsetProjects' as const, label: 'Offset Projects', icon: Leaf },
                  { key: 'showTrends' as const, label: 'Trends', icon: TrendingUp },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={carbonFootprint[key]}
                      onCheckedChange={(checked) => setCarbonFootprint({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pie chart: emissions by sector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Emissions by Sector</p>
              <div className="h-40 rounded-lg bg-muted/30 p-2 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <RechartsCell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value} MtCO₂e/yr`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 shrink-0 pr-1">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[9px] text-muted-foreground">{entry.name}</span>
                      <span className="text-[9px] font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar chart: top emission sources */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Emission Sources (MtCO₂e/yr)</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topEmissionsData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" tick={{ fontSize: 7 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 7 }} width={80} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value} MtCO₂e/yr`, 'Emissions']}
                    />
                    <Bar dataKey="emissions" radius={[0, 4, 4, 0]}>
                      {topEmissionsData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Source list */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {filteredSources.map((source) => {
                  const sectorStyle = SECTOR_STYLES[source.sector] || SECTOR_STYLES.energy
                  const trendStyle = TREND_STYLES[source.trend]
                  const TrendIcon = trendStyle.icon
                  const isExpanded = expandedId === source.id

                  return (
                    <div
                      key={source.id}
                      className={`rounded-lg border transition-colors cursor-pointer ${
                        carbonFootprint.activeSourceId === source.id
                          ? 'border-slate-300 dark:border-slate-700 bg-slate-500/5'
                          : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setExpandedId(isExpanded ? null : source.id)
                        setCarbonFootprint({ activeSourceId: source.id })
                      }}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <TrendIcon className={`h-3.5 w-3.5 shrink-0 ${trendStyle.text}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{source.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {source.emissions} MtCO₂e/yr
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={`${sectorStyle.bg} ${sectorStyle.text} text-[9px] border-0`}>
                            {sectorStyle.label}
                          </Badge>
                          {source.offsetAvailable && (
                            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] border-0">
                              Offset
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 pb-2 space-y-1.5">
                              <Separator />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Factory className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Sector:</span>
                                  <Badge className={`${sectorStyle.bg} ${sectorStyle.text} text-[9px] border-0`}>{sectorStyle.label}</Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <TrendIcon className={`h-3 w-3 ${trendStyle.text}`} />
                                  <span className="text-muted-foreground">Trend:</span>
                                  <Badge className={`${trendStyle.bg} ${trendStyle.text} text-[9px] border-0 capitalize`}>{source.trend}</Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Coords:</span>
                                  <span className="font-medium">{source.latitude.toFixed(2)}, {source.longitude.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Leaf className="h-3 w-3 text-green-500" />
                                  <span className="text-muted-foreground">Offset:</span>
                                  <span className="font-medium">{source.offsetAvailable ? 'Available' : 'None'}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
