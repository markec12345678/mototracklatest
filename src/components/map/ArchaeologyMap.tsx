'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell as RechartsCell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
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
  type ArchaeologicalSite,
  type ArchaeologyMapState,
} from '@/lib/map-store'
import {
  X,
  MapPin,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  Info,
  Filter,
  Layers,
  Clock,
  Mountain,
  TreePine,
  Building2,
  Compass,
  PieChart as PieChartIcon,
} from 'lucide-react'

// Demo data
const DEMO_SITES: ArchaeologicalSite[] = [
  {
    id: 'arch1',
    name: 'Pompeii',
    latitude: 40.7484,
    longitude: 14.4848,
    type: 'settlement',
    period: 'Classical',
    dating: '7th century BC – 79 AD',
    culture: 'Roman',
    description: 'Ancient Roman city buried by volcanic eruption of Mount Vesuvius in 79 AD. Remarkably preserved under ash.',
    preservation: 'excellent',
    excavationStatus: 'ongoing',
    significance: 'international',
    area: 66,
    depth: 4,
    artifacts: 12000,
    unescoListed: true,
    coordinates: [[14.4848, 40.7484]],
  },
  {
    id: 'arch2',
    name: 'Stonehenge',
    latitude: 51.1789,
    longitude: -1.8262,
    type: 'megalith',
    period: 'Bronze Age',
    dating: '3000 – 2000 BC',
    culture: 'Neolithic British',
    description: 'Prehistoric ring of standing stones, each around 13 feet high. One of the most famous landmarks in the UK.',
    preservation: 'good',
    excavationStatus: 'completed',
    significance: 'international',
    area: 26,
    depth: null,
    artifacts: 3500,
    unescoListed: true,
    coordinates: [[-1.8262, 51.1789]],
  },
  {
    id: 'arch3',
    name: 'Machu Picchu',
    latitude: -13.1631,
    longitude: -72.5450,
    type: 'settlement',
    period: 'Medieval',
    dating: '1450 AD',
    culture: 'Inca',
    description: '15th-century Inca citadel on a mountain ridge. Most iconic creation of the Inca Empire.',
    preservation: 'good',
    excavationStatus: 'partial',
    significance: 'international',
    area: 8,
    depth: null,
    artifacts: 5000,
    unescoListed: true,
    coordinates: [[-72.545, -13.1631]],
  },
  {
    id: 'arch4',
    name: 'Troy',
    latitude: 39.9575,
    longitude: 26.2386,
    type: 'settlement',
    period: 'Bronze Age',
    dating: '3000 BC – 500 AD',
    culture: 'Anatolian / Greek',
    description: 'Legendary city, setting of the Trojan War. Nine layers of settlement spanning millennia.',
    preservation: 'fair',
    excavationStatus: 'ongoing',
    significance: 'international',
    area: 30,
    depth: 15,
    artifacts: 8000,
    unescoListed: true,
    coordinates: [[26.2386, 39.9575]],
  },
  {
    id: 'arch5',
    name: 'Angkor Wat',
    latitude: 13.4125,
    longitude: 103.8670,
    type: 'temple',
    period: 'Medieval',
    dating: '12th century AD',
    culture: 'Khmer',
    description: 'Largest religious monument in the world. Originally Hindu, later Buddhist temple complex.',
    preservation: 'good',
    excavationStatus: 'partial',
    significance: 'international',
    area: 162,
    depth: null,
    artifacts: 6000,
    unescoListed: true,
    coordinates: [[103.867, 13.4125]],
  },
  {
    id: 'arch6',
    name: 'Petra',
    latitude: 30.3285,
    longitude: 35.4444,
    type: 'temple',
    period: 'Classical',
    dating: '312 BC – 106 AD',
    culture: 'Nabataean',
    description: 'Historical and archaeological city famous for rock-cut architecture and water conduit system.',
    preservation: 'fair',
    excavationStatus: 'ongoing',
    significance: 'international',
    area: 264,
    depth: null,
    artifacts: 4500,
    unescoListed: true,
    coordinates: [[35.4444, 30.3285]],
  },
]

const TYPE_COLORS: Record<string, string> = {
  settlement: 'bg-blue-500',
  burial: 'bg-purple-500',
  temple: 'bg-amber-500',
  fortification: 'bg-red-500',
  cave: 'bg-stone-500',
  petroglyph: 'bg-orange-500',
  megalith: 'bg-teal-500',
  shipwreck: 'bg-cyan-500',
  industrial: 'bg-gray-500',
}

const PRESERVATION_COLORS: Record<string, string> = {
  excellent: 'text-green-500',
  good: 'text-lime-500',
  fair: 'text-yellow-500',
  poor: 'text-orange-500',
  endangered: 'text-red-500',
}

const PRESERVATION_BG: Record<string, string> = {
  excellent: 'bg-green-500/10 text-green-600 dark:text-green-400',
  good: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
  fair: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  poor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  endangered: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

const EXCAVATION_COLORS: Record<string, string> = {
  unexcavated: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ongoing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const SIGNIFICANCE_COLORS: Record<string, string> = {
  local: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  regional: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  national: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  international: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const PERIODS = ['Prehistoric', 'Bronze Age', 'Iron Age', 'Classical', 'Medieval', 'Modern']
const SITE_TYPES: ArchaeologicalSite['type'][] = ['settlement', 'burial', 'temple', 'fortification', 'cave', 'petroglyph', 'megalith', 'shipwreck', 'industrial']
const SIGNIFICANCE_LEVELS: ArchaeologicalSite['significance'][] = ['local', 'regional', 'national', 'international']

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#78716c', '#f97316', '#14b8a6', '#06b6d4', '#6b7280']

export function ArchaeologyMap() {
  const { archaeologyMap, setArchaeologyMap } = useMapStore()
  const [expandedSite, setExpandedSite] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const sites = archaeologyMap.sites.length > 0 ? archaeologyMap.sites : DEMO_SITES
  const state = archaeologyMap

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      if (state.filterType.length > 0 && !state.filterType.includes(site.type)) return false
      if (state.filterPeriod.length > 0 && !state.filterPeriod.includes(site.period)) return false
      if (state.filterSignificance.length > 0 && !state.filterSignificance.includes(site.significance)) return false
      if (state.timelinePeriod !== 'all' && site.period !== state.timelinePeriod) return false
      return true
    })
  }, [sites, state.filterType, state.filterPeriod, state.filterSignificance, state.timelinePeriod])

  const periodDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    sites.forEach((s) => {
      counts[s.period] = (counts[s.period] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [sites])

  const significanceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    sites.forEach((s) => {
      counts[s.significance] = (counts[s.significance] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [sites])

  const toggleFilter = useCallback(
    (filterKey: 'filterType' | 'filterPeriod' | 'filterSignificance', value: string) => {
      const current = state[filterKey]
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      setArchaeologyMap({ [filterKey]: next })
    },
    [state, setArchaeologyMap]
  )

  if (!state.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed top-4 right-4 z-50 w-[420px] max-h-[calc(100vh-2rem)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-semibold">Archaeology Map</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredSites.length} sites
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setArchaeologyMap({ open: false })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-4">
            {/* Overlay Toggles */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Layers className="h-3.5 w-3.5" />
                  Overlays
                </div>
                {[
                  { key: 'showPeriodOverlay' as const, label: 'Period Overlay' },
                  { key: 'showSignificance' as const, label: 'Significance' },
                  { key: 'showExcavationStatus' as const, label: 'Excavation Status' },
                  { key: 'showProtectionZones' as const, label: 'Protection Zones' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-xs">{label}</Label>
                    <Switch
                      checked={state[key]}
                      onCheckedChange={(checked) => setArchaeologyMap({ [key]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Timeline Period Selector */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Clock className="h-3.5 w-3.5" />
                  Timeline Period
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant={state.timelinePeriod === 'all' ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    onClick={() => setArchaeologyMap({ timelinePeriod: 'all' })}
                  >
                    All
                  </Button>
                  {PERIODS.map((period) => (
                    <Button
                      key={period}
                      size="sm"
                      variant={state.timelinePeriod === period ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setArchaeologyMap({ timelinePeriod: period })}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3">
                <button
                  className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                  </div>
                  {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3 mt-2"
                    >
                      {/* Type filter */}
                      <div>
                        <p className="text-xs font-medium mb-1.5">Type</p>
                        <div className="flex flex-wrap gap-1">
                          {SITE_TYPES.map((type) => (
                            <Badge
                              key={type}
                              variant={state.filterType.includes(type) ? 'default' : 'outline'}
                              className="cursor-pointer text-xs capitalize"
                              onClick={() => toggleFilter('filterType', type)}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* Period filter */}
                      <div>
                        <p className="text-xs font-medium mb-1.5">Period</p>
                        <div className="flex flex-wrap gap-1">
                          {PERIODS.map((period) => (
                            <Badge
                              key={period}
                              variant={state.filterPeriod.includes(period) ? 'default' : 'outline'}
                              className="cursor-pointer text-xs"
                              onClick={() => toggleFilter('filterPeriod', period)}
                            >
                              {period}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* Significance filter */}
                      <div>
                        <p className="text-xs font-medium mb-1.5">Significance</p>
                        <div className="flex flex-wrap gap-1">
                          {SIGNIFICANCE_LEVELS.map((sig) => (
                            <Badge
                              key={sig}
                              variant={state.filterSignificance.includes(sig) ? 'default' : 'outline'}
                              className="cursor-pointer text-xs capitalize"
                              onClick={() => toggleFilter('filterSignificance', sig)}
                            >
                              {sig}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-transparent border-border/30">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <PieChartIcon className="h-3 w-3" />
                    Period Dist.
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie
                        data={periodDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {periodDistribution.map((_, index) => (
                          <RechartsCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="bg-transparent border-border/30">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Compass className="h-3 w-3" />
                    Significance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={significanceBreakdown}>
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Separator className="opacity-50" />

            {/* Sites List */}
            <div className="space-y-2">
              {filteredSites.map((site) => (
                <Card
                  key={site.id}
                  className={`bg-transparent border-border/30 cursor-pointer transition-colors hover:border-border/60 ${
                    state.activeSiteId === site.id ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() =>
                    setArchaeologyMap({
                      activeSiteId: state.activeSiteId === site.id ? null : site.id,
                    })
                  }
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm font-medium truncate">{site.name}</span>
                          {site.unescoListed && (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0">
                              <Star className="h-2.5 w-2.5 mr-0.5" />
                              UNESCO
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          <Badge className={`${TYPE_COLORS[site.type]} text-white text-[10px] px-1.5 py-0 capitalize`}>
                            {site.type}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {site.period}
                          </Badge>
                          <Badge className={`${PRESERVATION_BG[site.preservation]} text-[10px] px-1.5 py-0 capitalize`}>
                            {site.preservation}
                          </Badge>
                          <Badge className={`${EXCAVATION_COLORS[site.excavationStatus]} text-[10px] px-1.5 py-0 capitalize`}>
                            {site.excavationStatus}
                          </Badge>
                        </div>
                      </div>
                      {state.activeSiteId === site.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <AnimatePresence>
                      {state.activeSiteId === site.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <Separator className="my-2 opacity-50" />
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <p>{site.description}</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{site.dating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                <span>{site.culture}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{site.area} ha</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                <span>{site.artifacts.toLocaleString()} artifacts</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">Significance:</span>
                              <Badge className={`${SIGNIFICANCE_COLORS[site.significance]} text-[10px] capitalize`}>
                                {site.significance}
                              </Badge>
                            </div>
                            {site.depth !== null && (
                              <div className="flex items-center gap-1">
                                <Mountain className="h-3 w-3" />
                                <span>Depth: {site.depth}m</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  )
}
