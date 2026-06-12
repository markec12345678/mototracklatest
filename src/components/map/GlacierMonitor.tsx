'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type GlacierData, type GlacierMonitorState } from '@/lib/map-store'
import {
  Mountain,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  EyeOff,
  Layers,
  Activity,
  TrendingDown,
  ArrowRight,
  Snowflake,
  Timer,
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
} from 'recharts'

// Demo glacier data
const DEMO_GLACIERS: GlacierData[] = [
  {
    id: 'g1',
    name: 'Aletschgletscher',
    latitude: 46.5613,
    longitude: 7.9624,
    area: 81.7,
    length: 22.7,
    elevation: 2800,
    massBalance: -1.52,
    velocity: 67,
    retreatRate: 50,
    type: 'valley',
    status: 'retreating',
    lastSurvey: '2024-09-15',
  },
  {
    id: 'g2',
    name: 'Vatnajökull',
    latitude: 64.42,
    longitude: -16.80,
    area: 7700,
    length: 100,
    elevation: 1500,
    massBalance: -0.89,
    velocity: 120,
    retreatRate: 30,
    type: 'icecap',
    status: 'retreating',
    lastSurvey: '2024-08-20',
  },
  {
    id: 'g3',
    name: 'Malaspina Glacier',
    latitude: 59.89,
    longitude: -140.73,
    area: 3400,
    length: 70,
    elevation: 300,
    massBalance: -0.35,
    velocity: 3,
    retreatRate: 5,
    type: 'piedmont',
    status: 'stable',
    lastSurvey: '2024-07-10',
  },
  {
    id: 'g4',
    name: 'Grinnell Glacier',
    latitude: 48.76,
    longitude: -113.73,
    area: 0.89,
    length: 1.6,
    elevation: 2100,
    massBalance: -2.1,
    velocity: 12,
    retreatRate: 15,
    type: 'cirque',
    status: 'retreating',
    lastSurvey: '2024-09-01',
  },
  {
    id: 'g5',
    name: 'Columbia Glacier',
    latitude: 61.23,
    longitude: -147.08,
    area: 1060,
    length: 51,
    elevation: 600,
    massBalance: -4.5,
    velocity: 800,
    retreatRate: 300,
    type: 'tidewater',
    status: 'surging',
    lastSurvey: '2024-06-15',
  },
  {
    id: 'g6',
    name: 'Perito Moreno',
    latitude: -50.50,
    longitude: -73.05,
    area: 250,
    length: 30,
    elevation: 1700,
    massBalance: 0.15,
    velocity: 700,
    retreatRate: 0,
    type: 'valley',
    status: 'advancing',
    lastSurvey: '2024-10-01',
  },
]

const TYPE_ICONS: Record<string, string> = {
  valley: '🏔️',
  icecap: '🧊',
  piedmont: ' foothill',
  cirque: '⛰️',
  tidewater: '🌊',
}

const TYPE_LABELS: Record<string, string> = {
  valley: 'Valley',
  icecap: 'Ice Cap',
  piedmont: 'Piedmont',
  cirque: 'Cirque',
  tidewater: 'Tidewater',
}

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  advancing: { bg: 'bg-green-500/10', color: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  stable: { bg: 'bg-yellow-500/10', color: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  retreating: { bg: 'bg-red-500/10', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  surging: { bg: 'bg-purple-500/10', color: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
}

const STATUS_COLORS: Record<string, string> = {
  advancing: '#22c55e',
  stable: '#eab308',
  retreating: '#ef4444',
  surging: '#a855f7',
}

function exportCSV(glaciers: GlacierData[]) {
  const headers = ['Name', 'Type', 'Status', 'Area (km²)', 'Length (km)', 'Elevation (m)', 'Mass Balance (m w.e./yr)', 'Velocity (m/yr)', 'Retreat Rate (m/yr)', 'Latitude', 'Longitude', 'Last Survey']
  const rows = glaciers.map(g => [
    g.name, g.type, g.status, g.area, g.length, g.elevation,
    g.massBalance, g.velocity, g.retreatRate, g.latitude, g.longitude, g.lastSurvey,
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'glacier_data.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function GlacierMonitor() {
  const glacierMonitor = useMapStore((s) => s.glacierMonitor)
  const setGlacierMonitor = useMapStore((s) => s.setGlacierMonitor)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Use demo data if store is empty
  const glaciers = glacierMonitor.glaciers.length > 0 ? glacierMonitor.glaciers : DEMO_GLACIERS

  const filteredGlaciers = useMemo(() => {
    let list = glaciers
    if (glacierMonitor.filterType.length > 0) {
      list = list.filter(g => glacierMonitor.filterType.includes(g.type))
    }
    if (glacierMonitor.filterStatus.length > 0) {
      list = list.filter(g => glacierMonitor.filterStatus.includes(g.status))
    }
    return list
  }, [glaciers, glacierMonitor.filterType, glacierMonitor.filterStatus])

  const massBalanceChartData = useMemo(() => {
    return filteredGlaciers.map(g => ({
      name: g.name.length > 12 ? g.name.slice(0, 10) + '…' : g.name,
      massBalance: g.massBalance,
      color: STATUS_COLORS[g.status],
    }))
  }, [filteredGlaciers])

  const timelineData = useMemo(() => {
    const currentYear = glacierMonitor.timelineYear
    return Array.from({ length: 10 }, (_, i) => {
      const year = currentYear - 9 + i
      return {
        year,
        retreat: Math.round(Math.random() * 50 + 10 + (year - currentYear) * 3),
      }
    })
  }, [glacierMonitor.timelineYear])

  const toggleFilterType = useCallback((type: string) => {
    const current = glacierMonitor.filterType
    const next = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    setGlacierMonitor({ filterType: next })
  }, [glacierMonitor.filterType, setGlacierMonitor])

  const toggleFilterStatus = useCallback((status: string) => {
    const current = glacierMonitor.filterStatus
    const next = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    setGlacierMonitor({ filterStatus: next })
  }, [glacierMonitor.filterStatus, setGlacierMonitor])

  if (!glacierMonitor.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25 }}
        className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Snowflake className="h-4 w-4 text-cyan-500" />
                Glacier Monitor
                <Badge variant="outline" className="text-[10px] font-normal">
                  {filteredGlaciers.length} glaciers
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setGlacierMonitor({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Timeline Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3 w-3" /> Timeline Year
                  </Label>
                  <span className="text-xs font-semibold tabular-nums">{glacierMonitor.timelineYear}</span>
                </div>
                <Slider
                  value={[glacierMonitor.timelineYear]}
                  onValueChange={([v]) => setGlacierMonitor({ timelineYear: v })}
                  min={1980}
                  max={2030}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>1980</span>
                  <span>2000</span>
                  <span>2024</span>
                  <span>2030</span>
                </div>
              </div>

              <Separator />

              {/* Overlay Toggles */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Map Overlays
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={glacierMonitor.showRetreatOverlay}
                      onCheckedChange={(v) => setGlacierMonitor({ showRetreatOverlay: v })}
                    />
                    <span className="text-xs">Retreat Overlay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={glacierMonitor.showMassBalance}
                      onCheckedChange={(v) => setGlacierMonitor({ showMassBalance: v })}
                    />
                    <span className="text-xs">Mass Balance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={glacierMonitor.showVelocityVectors}
                      onCheckedChange={(v) => setGlacierMonitor({ showVelocityVectors: v })}
                    />
                    <span className="text-xs">Velocity Vectors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={glacierMonitor.comparisonMode}
                      onCheckedChange={(v) => setGlacierMonitor({ comparisonMode: v })}
                    />
                    <span className="text-xs">Comparison Mode</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Filters */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Filter by Type</Label>
                <div className="flex flex-wrap gap-1.5">
                  {(['valley', 'icecap', 'piedmont', 'cirque', 'tidewater'] as const).map(type => (
                    <Badge
                      key={type}
                      variant={glacierMonitor.filterType.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer text-[10px] transition-colors"
                      onClick={() => toggleFilterType(type)}
                    >
                      {TYPE_ICONS[type]} {TYPE_LABELS[type]}
                    </Badge>
                  ))}
                </div>
                <Label className="text-xs text-muted-foreground mt-2">Filter by Status</Label>
                <div className="flex flex-wrap gap-1.5">
                  {(['advancing', 'stable', 'retreating', 'surging'] as const).map(status => {
                    const style = STATUS_STYLES[status]
                    return (
                      <Badge
                        key={status}
                        variant={glacierMonitor.filterStatus.includes(status) ? 'default' : 'outline'}
                        className="cursor-pointer text-[10px] capitalize transition-colors"
                        onClick={() => toggleFilterStatus(status)}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${style.dot}`} />
                        {status}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Mass Balance Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Mass Balance (m w.e./yr)
                </Label>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={massBalanceChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)} m w.e./yr`, 'Mass Balance']}
                    />
                    <Bar dataKey="massBalance" radius={[3, 3, 0, 0]}>
                      {massBalanceChartData.map((entry, index) => (
                        <Cell key={`mb-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Timeline Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Retreat Trend
                </Label>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={timelineData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="retreat" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <Separator />

              {/* Glacier List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Glaciers</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={() => exportCSV(filteredGlaciers)}
                  >
                    <Download className="h-3 w-3" /> CSV
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {filteredGlaciers.map(glacier => {
                    const style = STATUS_STYLES[glacier.status]
                    const isExpanded = expandedId === glacier.id
                    return (
                      <div
                        key={glacier.id}
                        className="rounded-lg border border-border/50 p-2.5 hover:bg-accent/30 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : glacier.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{TYPE_ICONS[glacier.type]}</span>
                            <span className="text-xs font-medium truncate max-w-[160px]">{glacier.name}</span>
                            <Badge className={`${style.bg} ${style.color} border-0 text-[9px] px-1.5 py-0`}>
                              {glacier.status}
                            </Badge>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        {isExpanded && (
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Area</span>
                              <span className="font-medium">{glacier.area} km²</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Length</span>
                              <span className="font-medium">{glacier.length} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Elevation</span>
                              <span className="font-medium">{glacier.elevation} m</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Mass Balance</span>
                              <span className="font-medium" style={{ color: glacier.massBalance >= 0 ? '#22c55e' : '#ef4444' }}>
                                {glacier.massBalance > 0 ? '+' : ''}{glacier.massBalance} m w.e./yr
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Velocity</span>
                              <span className="font-medium">{glacier.velocity} m/yr</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Retreat Rate</span>
                              <span className="font-medium" style={{ color: glacier.retreatRate > 0 ? '#ef4444' : '#22c55e' }}>
                                {glacier.retreatRate} m/yr
                              </span>
                            </div>
                            <div className="col-span-2 flex justify-between">
                              <span className="text-muted-foreground">Last Survey</span>
                              <span className="font-medium">{glacier.lastSurvey}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Toggle button for the map toolbar
export function GlacierMonitorToggle() {
  const glacierMonitor = useMapStore((s) => s.glacierMonitor)
  const setGlacierMonitor = useMapStore((s) => s.setGlacierMonitor)

  return (
    <Button
      variant={glacierMonitor.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setGlacierMonitor({ open: !glacierMonitor.open })}
      title="Glacier Monitor"
    >
      <Snowflake className="h-4 w-4" />
    </Button>
  )
}
