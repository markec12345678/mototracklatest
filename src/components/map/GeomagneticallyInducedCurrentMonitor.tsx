'use client'

import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type GICMonitorState, type GICReading } from '@/lib/map-store'
import { Zap, Shield, Activity, AlertTriangle, X, Filter } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'

const DEMO_READINGS: GICReading[] = [
  {
    id: 'gic-tx1',
    transformer: 'Hudson Substation T1',
    intensity: 15.2,
    voltage: 345.8,
    riskLevel: 'normal',
    timestamp: '2024-01-15T08:30:00Z',
  },
  {
    id: 'gic-tx2',
    transformer: 'Quebec Grid T4',
    intensity: 42.8,
    voltage: 735.2,
    riskLevel: 'elevated',
    timestamp: '2024-01-15T08:30:00Z',
  },
  {
    id: 'gic-tx3',
    transformer: 'Mälarvik T2',
    intensity: 78.5,
    voltage: 400.1,
    riskLevel: 'high',
    timestamp: '2024-01-15T08:30:00Z',
  },
  {
    id: 'gic-tx4',
    transformer: 'Hydro-Québec T7',
    intensity: 125.3,
    voltage: 735.6,
    riskLevel: 'critical',
    timestamp: '2024-01-15T08:30:00Z',
  },
  {
    id: 'gic-tx5',
    transformer: 'Finnish Grid T1',
    intensity: 28.4,
    voltage: 400.3,
    riskLevel: 'elevated',
    timestamp: '2024-01-15T08:30:00Z',
  },
  {
    id: 'gic-tx6',
    transformer: 'NJ Substation T3',
    intensity: 8.7,
    voltage: 500.1,
    riskLevel: 'normal',
    timestamp: '2024-01-15T08:30:00Z',
  },
]

const RISK_CONFIG: Record<
  GICReading['riskLevel'],
  { label: string; color: string; bgClass: string }
> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  elevated: { label: 'Elevated', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const REALTIME_DATA = Array.from({ length: 30 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
  intensity: 15 + Math.sin(i * 0.3) * 20 + (i > 20 ? Math.sin(i * 0.8) * 40 : 0),
  threshold: 50,
}))

export function GeomagneticallyInducedCurrentMonitor() {
  const gicMonitor = useMapStore((s) => s.gicMonitor)
  const setGicMonitor = useMapStore((s) => s.setGicMonitor)

  const [liveData, setLiveData] = useState(REALTIME_DATA)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => {
      setLiveData((prev) => {
        const lastTime = prev.length > 0 ? prev[prev.length - 1].time : '00:00'
        const [mins] = lastTime.split(':').map(Number)
        const newMins = mins + 1
        const newTime = `${String(newMins % 60).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
        const newVal = 15 + Math.sin(newMins * 0.3) * 20 + (Math.random() > 0.7 ? Math.random() * 60 : 0)
        const next = [...prev.slice(1), { time: newTime, intensity: Math.round(newVal * 10) / 10, threshold: 50 }]
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [isLive])

  const readings = useMemo(
    () => (gicMonitor.readings && gicMonitor.readings.length > 0 ? gicMonitor.readings : DEMO_READINGS),
    [gicMonitor.readings]
  )

  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      if (gicMonitor.riskFilter !== 'all' && r.riskLevel !== gicMonitor.riskFilter) return false
      return true
    })
  }, [readings, gicMonitor.riskFilter])

  const summary = useMemo(() => {
    if (!filteredReadings || filteredReadings.length === 0) {
      return { avgIntensity: 0, maxIntensity: 0, criticalCount: 0, affectedVoltage: 0 }
    }
    const avgIntensity = Math.round((filteredReadings.reduce((s, r) => s + r.intensity, 0) / filteredReadings.length) * 10) / 10
    const maxIntensity = Math.round(Math.max(...filteredReadings.map((r) => r.intensity)) * 10) / 10
    const criticalCount = filteredReadings.filter((r) => r.riskLevel === 'critical' || r.riskLevel === 'high').length
    const affectedVoltage = Math.round(filteredReadings.filter((r) => r.riskLevel !== 'normal').reduce((s, r) => s + r.voltage, 0) * 10) / 10
    return { avgIntensity, maxIntensity, criticalCount, affectedVoltage }
  }, [filteredReadings])

  const activeReading = useMemo(
    () => (readings && readings.length > 0 ? readings.find((r) => r.id === gicMonitor.activeReadingId) ?? null : null),
    [readings, gicMonitor.activeReadingId]
  )

  if (typeof window === 'undefined') return null
  if (!gicMonitor.open) return null

  const overlayToggles: { key: keyof GICMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showIntensity', label: 'Intensity', icon: Zap },
    { key: 'showVoltage', label: 'Voltage', icon: Activity },
    { key: 'showRiskLevel', label: 'Risk Level', icon: Shield },
  ]

  const riskProgressValue = activeReading
    ? activeReading.riskLevel === 'normal' ? 15 : activeReading.riskLevel === 'elevated' ? 40 : activeReading.riskLevel === 'high' ? 70 : 95
    : 0

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              GIC Monitor
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant={isLive ? 'default' : 'outline'}
                size="sm"
                className="text-[10px] h-6 px-2"
                onClick={() => setIsLive(!isLive)}
              >
                <Activity className="h-3 w-3 mr-1" />
                {isLive ? 'LIVE' : 'LIVE'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setGicMonitor({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={gicMonitor.riskFilter}
              onValueChange={(v) =>
                setGicMonitor({
                  riskFilter: v as GICMonitorState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
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

          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Intensity</div>
              <div className="text-sm font-semibold">{summary.avgIntensity} A</div>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Peak Intensity</div>
              <div className="text-sm font-semibold">{summary.maxIntensity} A</div>
            </div>
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">High/Critical</div>
              <div className="text-sm font-semibold">{summary.criticalCount}</div>
            </div>
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Affected kV</div>
              <div className="text-sm font-semibold">{summary.affectedVoltage}</div>
            </div>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Display Options</Label>
            <div className="flex flex-wrap gap-2">
              {overlayToggles.map((t) => (
                <div key={t.key} className="flex items-center gap-1.5">
                  <Switch
                    checked={gicMonitor[t.key] as boolean}
                    onCheckedChange={(checked) => setGicMonitor({ [t.key]: checked })}
                    className="scale-75"
                  />
                  <Label className="text-[10px] flex items-center gap-0.5">
                    <t.icon className="h-3 w-3" />
                    {t.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Real-time Intensity Chart */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Real-time GIC Intensity {isLive && <span className="animate-pulse text-red-500">●</span>}
            </Label>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'A', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Alert', fontSize: 9, fill: '#f59e0b' }} />
                  <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Critical', fontSize: 9, fill: '#ef4444' }} />
                  <Area type="monotone" dataKey="intensity" stroke="#eab308" fill="#eab308" fillOpacity={0.15} name="GIC (A)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Transformer List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Affected Transformers ({filteredReadings.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredReadings && filteredReadings.length > 0) ? filteredReadings.map((reading) => {
                  const riskCfg = RISK_CONFIG[reading.riskLevel]
                  const isActive = activeReading?.id === reading.id
                  return (
                    <div
                      key={reading.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border/50 hover:border-yellow-500/30 hover:bg-yellow-500/5'
                      }`}
                      onClick={() => setGicMonitor({ activeReadingId: isActive ? null : reading.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{reading.transformer}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${riskCfg.bgClass}`}>
                          {riskCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {gicMonitor.showIntensity && <span>{reading.intensity} A</span>}
                        {gicMonitor.showVoltage && <span>{reading.voltage} kV</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No readings match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Reading Detail + Risk Assessment */}
          {activeReading && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  {activeReading.transformer}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-600" />
                    <span className="text-muted-foreground">Intensity:</span>
                    <span className="font-medium">{activeReading.intensity} A</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Voltage:</span>
                    <span className="font-medium">{activeReading.voltage} kV</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Infrastructure Risk</span>
                    <span className="text-[10px] font-medium">{RISK_CONFIG[activeReading.riskLevel].label}</span>
                  </div>
                  <Progress value={riskProgressValue} className="h-1.5" />
                </div>
                {activeReading.riskLevel === 'critical' && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-red-500 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Immediate action required — transformer at risk of damage
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
