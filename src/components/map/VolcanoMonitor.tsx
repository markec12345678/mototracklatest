'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type VolcanoData, type VolcanoMonitorState } from '@/lib/map-store'
import {
  X,
  Mountain,
  Activity,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Gauge,
  Users,
  Radio,
  Wind,
  BarChart3,
  TrendingUp,
  Info,
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
} from 'recharts'

// Demo volcano data
const DEMO_VOLCANOES: VolcanoData[] = [
  {
    id: 'v1',
    name: 'Mount Etna',
    latitude: 37.751,
    longitude: 14.993,
    elevation: 3357,
    type: 'stratovolcano',
    status: 'erupting',
    lastEruption: '2024-11-12',
    vei: 3,
    alertLevel: 'warning',
    seismicActivity: 45,
    gasEmission: 1200,
    deformation: 15.2,
    population5km: 82000,
    population10km: 350000,
    country: 'Italy',
  },
  {
    id: 'v2',
    name: 'Mount Vesuvius',
    latitude: 40.821,
    longitude: 14.426,
    elevation: 1281,
    type: 'stratovolcano',
    status: 'dormant',
    lastEruption: '1944-03-18',
    vei: 5,
    alertLevel: 'normal',
    seismicActivity: 3,
    gasEmission: 80,
    deformation: 0.5,
    population5km: 560000,
    population10km: 1800000,
    country: 'Italy',
  },
  {
    id: 'v3',
    name: 'Mount Fuji',
    latitude: 35.361,
    longitude: 138.727,
    elevation: 3776,
    type: 'stratovolcano',
    status: 'dormant',
    lastEruption: '1707-12-16',
    vei: 4,
    alertLevel: 'normal',
    seismicActivity: 2,
    gasEmission: 30,
    deformation: 0.1,
    population5km: 12000,
    population10km: 89000,
    country: 'Japan',
  },
  {
    id: 'v4',
    name: 'Kilauea',
    latitude: 19.407,
    longitude: -155.284,
    elevation: 1247,
    type: 'shield',
    status: 'active',
    lastEruption: '2024-09-15',
    vei: 2,
    alertLevel: 'watch',
    seismicActivity: 28,
    gasEmission: 3500,
    deformation: 8.7,
    population5km: 2500,
    population10km: 15000,
    country: 'USA',
  },
  {
    id: 'v5',
    name: 'Eyjafjallajökull',
    latitude: 63.63,
    longitude: -19.631,
    elevation: 1651,
    type: 'stratovolcano',
    status: 'dormant',
    lastEruption: '2010-04-14',
    vei: 4,
    alertLevel: 'advisory',
    seismicActivity: 8,
    gasEmission: 150,
    deformation: 2.1,
    population5km: 500,
    population10km: 3000,
    country: 'Iceland',
  },
  {
    id: 'v6',
    name: 'Santorini',
    latitude: 36.393,
    longitude: 25.462,
    elevation: 367,
    type: 'caldera',
    status: 'dormant',
    lastEruption: '1950-01-10',
    vei: 7,
    alertLevel: 'advisory',
    seismicActivity: 12,
    gasEmission: 200,
    deformation: 3.4,
    population5km: 15000,
    population10km: 25000,
    country: 'Greece',
  },
]

const TYPE_COLORS: Record<VolcanoData['type'], { bg: string; text: string; label: string }> = {
  stratovolcano: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', label: 'Stratovolcano' },
  shield: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'Shield' },
  caldera: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', label: 'Caldera' },
  cinder_cone: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', label: 'Cinder Cone' },
  fissure: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', label: 'Fissure' },
  submarine: { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', label: 'Submarine' },
  lava_dome: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Lava Dome' },
}

const STATUS_COLORS: Record<VolcanoData['status'], { bg: string; text: string }> = {
  extinct: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400' },
  dormant: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  active: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  erupting: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
}

const ALERT_COLORS: Record<VolcanoData['alertLevel'], { bg: string; text: string }> = {
  normal: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  advisory: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
  watch: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  warning: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
}

function getVEIColor(vei: number): string {
  if (vei <= 2) return '#22c55e'
  if (vei <= 4) return '#eab308'
  if (vei <= 6) return '#f97316'
  return '#ef4444'
}

export function VolcanoMonitor() {
  const volcanoMonitor = useMapStore((s) => s.volcanoMonitor)
  const setVolcanoMonitor = useMapStore((s) => s.setVolcanoMonitor)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Use demo data if store is empty
  const volcanoes = volcanoMonitor.volcanoes.length > 0 ? volcanoMonitor.volcanoes : DEMO_VOLCANOES

  const filteredVolcanoes = useMemo(() => {
    let list = volcanoes
    if (volcanoMonitor.filterType.length > 0) {
      list = list.filter((v) => volcanoMonitor.filterType.includes(v.type))
    }
    if (volcanoMonitor.filterStatus.length > 0) {
      list = list.filter((v) => volcanoMonitor.filterStatus.includes(v.status))
    }
    if (volcanoMonitor.filterAlertLevel.length > 0) {
      list = list.filter((v) => volcanoMonitor.filterAlertLevel.includes(v.alertLevel))
    }
    return list
  }, [volcanoes, volcanoMonitor.filterType, volcanoMonitor.filterStatus, volcanoMonitor.filterAlertLevel])

  // VEI bar chart data
  const veiChartData = useMemo(() => {
    return filteredVolcanoes.map((v) => ({
      name: v.name.length > 12 ? v.name.slice(0, 12) + '…' : v.name,
      vei: v.vei,
      color: getVEIColor(v.vei),
    }))
  }, [filteredVolcanoes])

  // Seismic time series demo data
  const seismicTimeData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      events: Math.floor(Math.random() * 20) + 2,
      magnitude: +(Math.random() * 3 + 1).toFixed(1),
    }))
  }, [])

  const toggleFilterType = useCallback(
    (type: string) => {
      const current = volcanoMonitor.filterType
      const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
      setVolcanoMonitor({ filterType: next })
    },
    [volcanoMonitor.filterType, setVolcanoMonitor]
  )

  const toggleFilterStatus = useCallback(
    (status: string) => {
      const current = volcanoMonitor.filterStatus
      const next = current.includes(status) ? current.filter((s) => s !== status) : [...current, status]
      setVolcanoMonitor({ filterStatus: next })
    },
    [volcanoMonitor.filterStatus, setVolcanoMonitor]
  )

  const toggleFilterAlert = useCallback(
    (alert: string) => {
      const current = volcanoMonitor.filterAlertLevel
      const next = current.includes(alert) ? current.filter((a) => a !== alert) : [...current, alert]
      setVolcanoMonitor({ filterAlertLevel: next })
    },
    [volcanoMonitor.filterAlertLevel, setVolcanoMonitor]
  )

  if (!volcanoMonitor.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-4 top-16 z-[40] w-[420px] max-h-[calc(100vh-5rem)]"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-red-500" />
                <CardTitle className="text-base font-semibold">Volcano Monitor</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredVolcanoes.length} volcanoes
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setVolcanoMonitor({ open: false })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pb-4">
            {/* Overlay toggles */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showAlertZones' as const, label: 'Alert Zones', icon: AlertTriangle },
                  { key: 'showSeismicOverlay' as const, label: 'Seismic', icon: Activity },
                  { key: 'showGasPlumes' as const, label: 'Gas Plumes', icon: Wind },
                  { key: 'showDeformation' as const, label: 'Deformation', icon: TrendingUp },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={volcanoMonitor[key]}
                      onCheckedChange={(checked) => setVolcanoMonitor({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Filters */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filters</p>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Type</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(TYPE_COLORS).map(([type, { bg, text }]) => (
                    <Badge
                      key={type}
                      variant={volcanoMonitor.filterType.includes(type) ? 'default' : 'outline'}
                      className={`text-[10px] cursor-pointer ${
                        volcanoMonitor.filterType.includes(type) ? `${bg} ${text} border-0` : ''
                      }`}
                      onClick={() => toggleFilterType(type)}
                    >
                      {TYPE_COLORS[type as VolcanoData['type']].label}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Status</p>
                <div className="flex flex-wrap gap-1">
                  {(['extinct', 'dormant', 'active', 'erupting'] as const).map((status) => (
                    <Badge
                      key={status}
                      variant={volcanoMonitor.filterStatus.includes(status) ? 'default' : 'outline'}
                      className={`text-[10px] cursor-pointer capitalize ${
                        volcanoMonitor.filterStatus.includes(status)
                          ? `${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text} border-0`
                          : ''
                      }`}
                      onClick={() => toggleFilterStatus(status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Alert Level</p>
                <div className="flex flex-wrap gap-1">
                  {(['normal', 'advisory', 'watch', 'warning'] as const).map((alert) => (
                    <Badge
                      key={alert}
                      variant={volcanoMonitor.filterAlertLevel.includes(alert) ? 'default' : 'outline'}
                      className={`text-[10px] cursor-pointer capitalize ${
                        volcanoMonitor.filterAlertLevel.includes(alert)
                          ? `${ALERT_COLORS[alert].bg} ${ALERT_COLORS[alert].text} border-0`
                          : ''
                      }`}
                      onClick={() => toggleFilterAlert(alert)}
                    >
                      {alert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* VEI Bar Chart */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">VEI Scale Comparison</p>
              <div className="h-36 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={veiChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={40} />
                    <YAxis tick={{ fontSize: 9 }} domain={[0, 8]} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="vei" radius={[4, 4, 0, 0]}>
                      {veiChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Seismic Activity Time Series */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Seismic Activity (24h)</p>
              <div className="h-28 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seismicTimeData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="hour" tick={{ fontSize: 8 }} interval={3} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line type="monotone" dataKey="events" stroke="#f97316" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Volcano list */}
            <ScrollArea className="max-h-[280px]">
              <div className="space-y-2">
                {filteredVolcanoes.map((volcano) => {
                  const isExpanded = expandedId === volcano.id
                  const typeStyle = TYPE_COLORS[volcano.type]
                  const statusStyle = STATUS_COLORS[volcano.status]
                  const alertStyle = ALERT_COLORS[volcano.alertLevel]

                  return (
                    <div
                      key={volcano.id}
                      className="rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : volcano.id)}
                    >
                      <div className="flex items-center justify-between p-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mountain className="h-4 w-4 text-red-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{volcano.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {volcano.elevation}m · {volcano.country}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={`${typeStyle.bg} ${typeStyle.text} text-[9px] border-0`}>
                            {typeStyle.label}
                          </Badge>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text} text-[9px] border-0 capitalize`}>
                            {volcano.status}
                          </Badge>
                          <Badge className={`${alertStyle.bg} ${alertStyle.text} text-[9px] border-0 capitalize`}>
                            {volcano.alertLevel}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
                            <div className="px-2.5 pb-2.5 space-y-2">
                              <Separator />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Gauge className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">VEI:</span>
                                  <span className="font-medium">{volcano.vei}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Activity className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Seismic:</span>
                                  <span className="font-medium">{volcano.seismicActivity}/day</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Wind className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">SO₂:</span>
                                  <span className="font-medium">{volcano.gasEmission} t/d</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Deform:</span>
                                  <span className="font-medium">{volcano.deformation} mm/yr</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">5km:</span>
                                  <span className="font-medium">{(volcano.population5km / 1000).toFixed(0)}k</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Last:</span>
                                  <span className="font-medium">{volcano.lastEruption}</span>
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
