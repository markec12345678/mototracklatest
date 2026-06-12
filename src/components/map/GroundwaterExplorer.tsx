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
import { useMapStore, type Aquifer } from '@/lib/map-store'
import {
  X,
  Droplets,
  ArrowDown,
  MapPin,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw,
  Activity,
  Shield,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

// Demo aquifer data
const DEMO_AQUIFERS: Aquifer[] = [
  { id: 'aq1', name: 'Ogallala', latitude: 37.5, longitude: -101.0, type: 'unconfined', depth: 45, waterLevel: 28, quality: 'moderate', rechargeRate: 15 },
  { id: 'aq2', name: 'Great Artesian Basin', latitude: -24.0, longitude: 142.0, type: 'confined', depth: 320, waterLevel: 85, quality: 'good', rechargeRate: 22 },
  { id: 'aq3', name: 'Guarani', latitude: -23.0, longitude: -55.0, type: 'confined', depth: 800, waterLevel: 350, quality: 'excellent', rechargeRate: 45 },
  { id: 'aq4', name: 'Nubian Sandstone', latitude: 22.0, longitude: 25.0, type: 'confined', depth: 1200, waterLevel: 450, quality: 'good', rechargeRate: 3 },
  { id: 'aq5', name: 'Sahara', latitude: 25.0, longitude: 10.0, type: 'semi_confined', depth: 650, waterLevel: 200, quality: 'moderate', rechargeRate: 5 },
  { id: 'aq6', name: 'Floridan', latitude: 29.5, longitude: -82.5, type: 'karst', depth: 180, waterLevel: 15, quality: 'good', rechargeRate: 120 },
  { id: 'aq7', name: 'Edwards Aquifer', latitude: 29.8, longitude: -98.5, type: 'karst', depth: 95, waterLevel: 12, quality: 'excellent', rechargeRate: 185 },
]

const TYPE_COLORS: Record<Aquifer['type'], { bg: string; text: string; label: string }> = {
  unconfined: { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', label: 'Unconfined' },
  confined: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'Confined' },
  semi_confined: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', label: 'Semi-Confined' },
  karst: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', label: 'Karst' },
}

const QUALITY_COLORS: Record<Aquifer['quality'], { bg: string; text: string }> = {
  excellent: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  good: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  moderate: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
  poor: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
}

const DEPTH_FILTERS: { value: string; label: string; range: [number, number] }[] = [
  { value: 'all', label: 'All', range: [0, Infinity] },
  { value: 'shallow', label: 'Shallow', range: [0, 100] },
  { value: 'intermediate', label: 'Intermediate', range: [100, 500] },
  { value: 'deep', label: 'Deep', range: [500, 1000] },
  { value: 'very_deep', label: 'Very Deep', range: [1000, Infinity] },
]

const QUALITY_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'poor', label: 'Poor' },
]

export function GroundwaterExplorer() {
  const groundwater = useMapStore((s) => s.groundwater)
  const setGroundwater = useMapStore((s) => s.setGroundwater)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // All hooks before early returns
  const aquifers = groundwater.aquifers.length > 0 ? groundwater.aquifers : DEMO_AQUIFERS

  const filteredAquifers = useMemo(() => {
    return aquifers.filter((a) => {
      const depthFilter = DEPTH_FILTERS.find((d) => d.value === groundwater.depthFilter)
      const matchesDepth = groundwater.depthFilter === 'all' || (depthFilter && a.depth >= depthFilter.range[0] && a.depth < depthFilter.range[1])
      const matchesQuality = groundwater.qualityFilter === 'all' || a.quality === groundwater.qualityFilter
      return matchesDepth && matchesQuality
    })
  }, [aquifers, groundwater.depthFilter, groundwater.qualityFilter])

  const waterLevelData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      level: 85 - i * 1.8 + Math.sin(i * 0.8) * 5,
      recharge: 15 + Math.cos(i * 0.6) * 8,
    }))
  }, [])

  const rechargeBarData = useMemo(() => {
    return filteredAquifers.map((a) => ({
      name: a.name.length > 14 ? a.name.slice(0, 14) + '…' : a.name,
      recharge: a.rechargeRate,
      color: a.type === 'karst' ? '#06b6d4' : a.type === 'confined' ? '#3b82f6' : a.type === 'semi_confined' ? '#6366f1' : '#0ea5e9',
    }))
  }, [filteredAquifers])

  if (typeof window === 'undefined') return null
  if (!groundwater.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-16 right-4 z-30 w-[380px] max-h-[80vh] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-background/90 border shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Droplets className="h-4 w-4 text-sky-500" />
                Groundwater Explorer
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredAquifers.length} aquifers
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setGroundwater({ open: false })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Depth filter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Depth Filter</p>
              <div className="flex flex-wrap gap-1">
                {DEPTH_FILTERS.map((d) => (
                  <Badge
                    key={d.value}
                    variant={groundwater.depthFilter === d.value ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setGroundwater({ depthFilter: d.value as any })}
                  >
                    {d.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quality filter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quality Filter</p>
              <div className="flex flex-wrap gap-1">
                {QUALITY_FILTERS.map((q) => (
                  <Badge
                    key={q.value}
                    variant={groundwater.qualityFilter === q.value ? 'default' : 'outline'}
                    className={`text-[10px] cursor-pointer ${
                      groundwater.qualityFilter === q.value && q.value !== 'all' ? `${QUALITY_COLORS[q.value as Aquifer['quality']]?.bg || ''} ${QUALITY_COLORS[q.value as Aquifer['quality']]?.text || ''} border-0` : ''
                    }`}
                    onClick={() => setGroundwater({ qualityFilter: q.value as any })}
                  >
                    {q.label}
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
                  { key: 'showAquifers' as const, label: 'Aquifers', icon: Droplets },
                  { key: 'showWells' as const, label: 'Wells', icon: ArrowDown },
                  { key: 'showRechargeZones' as const, label: 'Recharge Zones', icon: RefreshCw },
                  { key: 'showFlowDirection' as const, label: 'Flow Direction', icon: Activity },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={groundwater[key]}
                      onCheckedChange={(checked) => setGroundwater({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Line chart: water level trends */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Water Level Trends</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waterLevelData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line type="monotone" dataKey="level" stroke="#0ea5e9" strokeWidth={1.5} dot={false} name="Level (m)" />
                    <Line type="monotone" dataKey="recharge" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="Recharge (mm)" strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart: recharge rates */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recharge Rates (mm/yr)</p>
              <div className="h-28 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rechargeBarData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 7 }} angle={-25} textAnchor="end" height={35} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value} mm/yr`, 'Recharge']}
                    />
                    <Bar dataKey="recharge" radius={[4, 4, 0, 0]}>
                      {rechargeBarData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Aquifer list */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {filteredAquifers.map((aquifer) => {
                  const typeStyle = TYPE_COLORS[aquifer.type]
                  const qualityStyle = QUALITY_COLORS[aquifer.quality]
                  const isExpanded = expandedId === aquifer.id

                  return (
                    <div
                      key={aquifer.id}
                      className="rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : aquifer.id)}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Droplets className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{aquifer.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {aquifer.depth}m deep · {aquifer.waterLevel}m level
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={`${typeStyle.bg} ${typeStyle.text} text-[9px] border-0`}>
                            {typeStyle.label}
                          </Badge>
                          <Badge className={`${qualityStyle.bg} ${qualityStyle.text} text-[9px] border-0 capitalize`}>
                            {aquifer.quality}
                          </Badge>
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
                                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Depth:</span>
                                  <span className="font-medium">{aquifer.depth} m</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Activity className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Water Level:</span>
                                  <span className="font-medium">{aquifer.waterLevel} m</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <RefreshCw className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Recharge:</span>
                                  <span className="font-medium">{aquifer.rechargeRate} mm/yr</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Shield className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Quality:</span>
                                  <Badge className={`${qualityStyle.bg} ${qualityStyle.text} text-[9px] border-0 capitalize`}>{aquifer.quality}</Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Coords:</span>
                                  <span className="font-medium">{aquifer.latitude.toFixed(1)}, {aquifer.longitude.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Type:</span>
                                  <Badge className={`${typeStyle.bg} ${typeStyle.text} text-[9px] border-0`}>{typeStyle.label}</Badge>
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
