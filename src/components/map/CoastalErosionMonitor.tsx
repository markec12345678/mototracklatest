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
import { useMapStore, type CoastalSegment } from '@/lib/map-store'
import {
  X,
  Droplets,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
  Info,
  Shield,
  Activity,
  TrendingDown,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

// Demo coastal segment data
const DEMO_SEGMENTS: CoastalSegment[] = [
  { id: 'cs1', name: 'Norfolk Coast', latitude: 52.63, longitude: 1.35, erosionRate: 1.8, seaLevelEffect: 0.6, vulnerability: 'high', protectionType: 'Sea Wall' },
  { id: 'cs2', name: 'Louisiana Delta', latitude: 29.15, longitude: -89.25, erosionRate: 8.4, seaLevelEffect: 2.1, vulnerability: 'very_high', protectionType: 'Levee System' },
  { id: 'cs3', name: 'Sundarbans', latitude: 21.95, longitude: 89.18, erosionRate: 3.2, seaLevelEffect: 1.5, vulnerability: 'very_high', protectionType: 'Mangrove Buffer' },
  { id: 'cs4', name: 'Maldives', latitude: 3.20, longitude: 73.22, erosionRate: 0.8, seaLevelEffect: 3.0, vulnerability: 'very_high', protectionType: 'Breakwater' },
  { id: 'cs5', name: 'Tuvalu', latitude: -7.11, longitude: 177.65, erosionRate: 0.5, seaLevelEffect: 2.8, vulnerability: 'very_high', protectionType: 'Reef Restoration' },
  { id: 'cs6', name: 'Miami Beach', latitude: 25.79, longitude: -80.13, erosionRate: 1.2, seaLevelEffect: 1.8, vulnerability: 'high', protectionType: 'Beach Nourishment' },
]

const VULNERABILITY_STYLES: Record<CoastalSegment['vulnerability'], { bg: string; text: string; dot: string }> = {
  very_low: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  low: { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', dot: 'bg-teal-500' },
  moderate: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  very_high: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

const TIME_HORIZONS: { value: 'current' | '2050' | '2100'; label: string }[] = [
  { value: 'current', label: 'Current' },
  { value: '2050', label: '2050' },
  { value: '2100', label: '2100' },
]

const RCP_SCENARIOS: { value: 'rcp26' | 'rcp45' | 'rcp85'; label: string }[] = [
  { value: 'rcp26', label: 'RCP 2.6' },
  { value: 'rcp45', label: 'RCP 4.5' },
  { value: 'rcp85', label: 'RCP 8.5' },
]

export function CoastalErosionMonitor() {
  const coastalErosion = useMapStore((s) => s.coastalErosion)
  const setCoastalErosion = useMapStore((s) => s.setCoastalErosion)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const segments = coastalErosion.segments.length > 0 ? coastalErosion.segments : DEMO_SEGMENTS

  const shorelineRetreatData = useMemo(() => {
    const multiplier = coastalErosion.timeHorizon === '2100' ? 3 : coastalErosion.timeHorizon === '2050' ? 1.5 : 1
    const scenarioFactor = coastalErosion.scenario === 'rcp85' ? 1.8 : coastalErosion.scenario === 'rcp45' ? 1.2 : 1
    return Array.from({ length: 10 }, (_, i) => {
      const year = 2024 + i * 8
      return {
        year: year.toString(),
        norfolk: +(1.8 * multiplier * scenarioFactor * (1 + i * 0.12)).toFixed(1),
        louisiana: +(8.4 * multiplier * scenarioFactor * (1 + i * 0.08)).toFixed(1),
        sundarbans: +(3.2 * multiplier * scenarioFactor * (1 + i * 0.10)).toFixed(1),
      }
    })
  }, [coastalErosion.timeHorizon, coastalErosion.scenario])

  const erosionBarData = useMemo(() => {
    return segments.map((s) => ({
      name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
      rate: s.erosionRate,
      color: s.vulnerability === 'very_high' ? '#ef4444' : s.vulnerability === 'high' ? '#f97316' : s.vulnerability === 'moderate' ? '#eab308' : '#14b8a6',
    }))
  }, [segments])

  if (typeof window === 'undefined') return null
  if (!coastalErosion.open) return null

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
                <Droplets className="h-4 w-4 text-teal-500" />
                Coastal Erosion Monitor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {segments.length} segments
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCoastalErosion({ open: false })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Time Horizon Selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Horizon</p>
              <div className="flex flex-wrap gap-1">
                {TIME_HORIZONS.map((h) => (
                  <Badge
                    key={h.value}
                    variant={coastalErosion.timeHorizon === h.value ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setCoastalErosion({ timeHorizon: h.value })}
                  >
                    {h.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* RCP Scenario Selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">RCP Scenario</p>
              <div className="flex flex-wrap gap-1">
                {RCP_SCENARIOS.map((s) => (
                  <Badge
                    key={s.value}
                    variant={coastalErosion.scenario === s.value ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setCoastalErosion({ scenario: s.value })}
                  >
                    {s.label}
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
                  { key: 'showErosionZones' as const, label: 'Erosion Zones', icon: TrendingDown },
                  { key: 'showShorelineChange' as const, label: 'Shoreline Change', icon: Activity },
                  { key: 'showSeaLevelRise' as const, label: 'Sea Level Rise', icon: Droplets },
                  { key: 'showProtection' as const, label: 'Protection', icon: Shield },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={coastalErosion[key]}
                      onCheckedChange={(checked) => setCoastalErosion({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Area chart: projected shoreline retreat */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Projected Shoreline Retreat (m)</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={shorelineRetreatData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="year" tick={{ fontSize: 7 }} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value} m`, '']}
                    />
                    <Area type="monotone" dataKey="norfolk" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} strokeWidth={1.5} name="Norfolk" />
                    <Area type="monotone" dataKey="louisiana" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={1.5} name="Louisiana" />
                    <Area type="monotone" dataKey="sundarbans" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={1.5} name="Sundarbans" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart: erosion rates by segment */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Erosion Rates (m/yr)</p>
              <div className="h-28 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={erosionBarData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 7 }} angle={-25} textAnchor="end" height={35} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value} m/yr`, 'Erosion Rate']}
                    />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                      {erosionBarData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Coastal segment list */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {segments.map((segment) => {
                  const vulnStyle = VULNERABILITY_STYLES[segment.vulnerability]
                  const isExpanded = expandedId === segment.id

                  return (
                    <div
                      key={segment.id}
                      className={`rounded-lg border transition-colors cursor-pointer ${
                        coastalErosion.activeSegmentId === segment.id
                          ? 'border-teal-300 dark:border-teal-700 bg-teal-500/5'
                          : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setExpandedId(isExpanded ? null : segment.id)
                        setCoastalErosion({ activeSegmentId: segment.id })
                      }}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`h-2 w-2 rounded-full ${vulnStyle.dot} shrink-0`} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{segment.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {segment.erosionRate} m/yr · SLR +{segment.seaLevelEffect}m
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={`${vulnStyle.bg} ${vulnStyle.text} text-[9px] border-0 capitalize`}>
                            {segment.vulnerability.replace('_', ' ')}
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
                                  <TrendingDown className="h-3 w-3 text-teal-500" />
                                  <span className="text-muted-foreground">Erosion:</span>
                                  <span className="font-medium">{segment.erosionRate} m/yr</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Droplets className="h-3 w-3 text-blue-500" />
                                  <span className="text-muted-foreground">SLR Effect:</span>
                                  <span className="font-medium">+{segment.seaLevelEffect} m</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Shield className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Protection:</span>
                                  <span className="font-medium">{segment.protectionType}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Coords:</span>
                                  <span className="font-medium">{segment.latitude.toFixed(2)}, {segment.longitude.toFixed(2)}</span>
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
