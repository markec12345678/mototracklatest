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
import { useMapStore, type VolcanicEruption } from '@/lib/map-store'
import {
  X,
  Flame,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  RefreshCw,
  MapPin,
  Info,
  Globe,
  Wind,
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

// Demo eruption data
const DEMO_ERUPTIONS: VolcanicEruption[] = [
  { id: 'er1', volcanoName: 'Eyjafjallajökull', latitude: 63.63, longitude: -19.62, ashHeight: 10, vei: 4, startTime: '2024-03-15T08:00:00Z', status: 'ongoing' },
  { id: 'er2', volcanoName: 'Mt Etna', latitude: 37.75, longitude: 14.99, ashHeight: 7.5, vei: 3, startTime: '2024-02-20T12:00:00Z', status: 'ongoing' },
  { id: 'er3', volcanoName: 'Kilauea', latitude: 19.41, longitude: -155.29, ashHeight: 3.2, vei: 2, startTime: '2024-01-10T06:00:00Z', status: 'declining' },
  { id: 'er4', volcanoName: 'Taal', latitude: 14.01, longitude: 120.99, ashHeight: 15, vei: 4, startTime: '2024-04-01T14:00:00Z', status: 'ongoing' },
  { id: 'er5', volcanoName: 'Ruang', latitude: 2.30, longitude: 125.37, ashHeight: 19, vei: 4, startTime: '2024-04-16T22:00:00Z', status: 'declining' },
  { id: 'er6', volcanoName: 'Sakurajima', latitude: 31.59, longitude: 130.66, ashHeight: 5.4, vei: 3, startTime: '2024-03-05T10:00:00Z', status: 'ended' },
]

const STATUS_STYLES: Record<VolcanicEruption['status'], { bg: string; text: string; dot: string }> = {
  ongoing: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  declining: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  ended: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-500' },
}

const ALERT_LEVELS: { value: 'normal' | 'advisory' | 'watch' | 'warning'; label: string; color: string }[] = [
  { value: 'normal', label: 'Normal', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' },
  { value: 'advisory', label: 'Advisory', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  { value: 'watch', label: 'Watch', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  { value: 'warning', label: 'Warning', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
]

const DISPERSION_MODELS: { value: 'vaac' | 'hysplit' | 'fall3d'; label: string }[] = [
  { value: 'vaac', label: 'VAAC' },
  { value: 'hysplit', label: 'HYSPLIT' },
  { value: 'fall3d', label: 'FALL3D' },
]

export function VolcanicAshTracker() {
  const volcanicAsh = useMapStore((s) => s.volcanicAsh)
  const setVolcanicAsh = useMapStore((s) => s.setVolcanicAsh)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const eruptions = volcanicAsh.eruptions.length > 0 ? volcanicAsh.eruptions : DEMO_ERUPTIONS

  const veiBarData = useMemo(() => {
    return eruptions.map((e) => ({
      name: e.volcanoName.length > 12 ? e.volcanoName.slice(0, 12) + '…' : e.volcanoName,
      vei: e.vei,
      color: e.status === 'ongoing' ? '#ef4444' : e.status === 'declining' ? '#f97316' : '#9ca3af',
    }))
  }, [eruptions])

  const ashHeightTimeData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      eyjafjallajokull: Math.max(0, 10 - i * 0.15 + Math.sin(i * 0.5) * 2),
      etna: Math.max(0, 7.5 - i * 0.08 + Math.cos(i * 0.4) * 1.5),
      taal: Math.max(0, 15 - i * 0.2 + Math.sin(i * 0.3) * 3),
    }))
    return hours
  }, [])

  if (typeof window === 'undefined') return null
  if (!volcanicAsh.open) return null

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
                <Flame className="h-4 w-4 text-red-500" />
                Volcanic Ash Tracker
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {eruptions.filter((e) => e.status === 'ongoing').length} active
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setVolcanicAsh({ open: false })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Alert Level Selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alert Level</p>
              <div className="flex flex-wrap gap-1">
                {ALERT_LEVELS.map((level) => (
                  <Badge
                    key={level.value}
                    variant={volcanicAsh.alertLevel === level.value ? 'default' : 'outline'}
                    className={`text-[10px] cursor-pointer ${
                      volcanicAsh.alertLevel === level.value ? level.color : ''
                    }`}
                    onClick={() => setVolcanicAsh({ alertLevel: level.value })}
                  >
                    {level.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dispersion Model Selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dispersion Model</p>
              <div className="flex flex-wrap gap-1">
                {DISPERSION_MODELS.map((model) => (
                  <Badge
                    key={model.value}
                    variant={volcanicAsh.dispersionModel === model.value ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setVolcanicAsh({ dispersionModel: model.value })}
                  >
                    {model.label}
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
                  { key: 'showAshClouds' as const, label: 'Ash Clouds', icon: Wind },
                  { key: 'showNoFlyZones' as const, label: 'No-Fly Zones', icon: AlertTriangle },
                  { key: 'showDispersionModel' as const, label: 'Dispersion', icon: Globe },
                  { key: 'showHealthAdvisory' as const, label: 'Health Advisory', icon: Info },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={volcanicAsh[key]}
                      onCheckedChange={(checked) => setVolcanicAsh({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Bar chart: VEI by eruption */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Volcanic Explosivity Index</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={veiBarData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 7 }} angle={-25} textAnchor="end" height={35} />
                    <YAxis tick={{ fontSize: 8 }} domain={[0, 5]} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`VEI ${value}`, 'Explosivity']}
                    />
                    <Bar dataKey="vei" radius={[4, 4, 0, 0]}>
                      {veiBarData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line chart: ash cloud height over time */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ash Cloud Height (km) — 24h</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ashHeightTimeData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="hour" tick={{ fontSize: 7 }} interval={3} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} km`]}
                    />
                    <Line type="monotone" dataKey="eyjafjallajokull" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Eyjafjallajökull" />
                    <Line type="monotone" dataKey="etna" stroke="#f97316" strokeWidth={1.5} dot={false} name="Mt Etna" />
                    <Line type="monotone" dataKey="taal" stroke="#dc2626" strokeWidth={1.5} dot={false} name="Taal" strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Eruption list */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {eruptions.map((eruption) => {
                  const statusStyle = STATUS_STYLES[eruption.status]
                  const isExpanded = expandedId === eruption.id

                  return (
                    <div
                      key={eruption.id}
                      className={`rounded-lg border transition-colors cursor-pointer ${
                        volcanicAsh.activeEruptionId === eruption.id
                          ? 'border-red-300 dark:border-red-700 bg-red-500/5'
                          : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setExpandedId(isExpanded ? null : eruption.id)
                        setVolcanicAsh({ activeEruptionId: eruption.id })
                      }}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`h-2 w-2 rounded-full ${statusStyle.dot} shrink-0 ${eruption.status === 'ongoing' ? 'animate-pulse' : ''}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{eruption.volcanoName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              VEI {eruption.vei} · {eruption.ashHeight} km ash
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={`${statusStyle.bg} ${statusStyle.text} text-[9px] border-0 capitalize`}>
                            {eruption.status}
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
                                  <Flame className="h-3 w-3 text-red-500" />
                                  <span className="text-muted-foreground">VEI:</span>
                                  <span className="font-medium">{eruption.vei}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Wind className="h-3 w-3 text-orange-500" />
                                  <span className="text-muted-foreground">Ash Height:</span>
                                  <span className="font-medium">{eruption.ashHeight} km</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Coords:</span>
                                  <span className="font-medium">{eruption.latitude.toFixed(2)}, {eruption.longitude.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <RefreshCw className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Started:</span>
                                  <span className="font-medium">{new Date(eruption.startTime).toLocaleDateString()}</span>
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
