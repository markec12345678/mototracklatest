'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  type WindTurbine,
  type WindFarmState,
} from '@/lib/map-store'
import {
  X,
  Wind,
  Zap,
  Gauge,
  TrendingUp,
  TrendingDown,
  Eye,
  ChevronDown,
  ChevronUp,
  Settings,
  BarChart3,
  Compass,
  AlertTriangle,
  RefreshCw,
  Info,
  Activity,
  ArrowUp,
} from 'lucide-react'

// Demo data
const DEMO_TURBINES: WindTurbine[] = [
  {
    id: 'wt1',
    name: 'North Sea Alpha',
    latitude: 55.88,
    longitude: 3.14,
    type: 'offshore',
    capacity: 8.0,
    hubHeight: 125,
    rotorDiameter: 164,
    windSpeed: 12.3,
    windDirection: 245,
    powerOutput: 6.4,
    capacityFactor: 42.5,
    availability: 97.2,
    wakeLoss: 8.5,
    status: 'operational',
    commissioning: '2022-06-15',
  },
  {
    id: 'wt2',
    name: 'North Sea Bravo',
    latitude: 55.92,
    longitude: 3.22,
    type: 'offshore',
    capacity: 8.0,
    hubHeight: 125,
    rotorDiameter: 164,
    windSpeed: 11.8,
    windDirection: 240,
    powerOutput: 5.9,
    capacityFactor: 38.2,
    availability: 95.8,
    wakeLoss: 12.3,
    status: 'operational',
    commissioning: '2022-06-20',
  },
  {
    id: 'wt3',
    name: 'Highland Ridge 1',
    latitude: 56.45,
    longitude: -3.87,
    type: 'onshore',
    capacity: 4.2,
    hubHeight: 90,
    rotorDiameter: 120,
    windSpeed: 9.8,
    windDirection: 220,
    powerOutput: 2.8,
    capacityFactor: 35.6,
    availability: 98.5,
    wakeLoss: 5.2,
    status: 'operational',
    commissioning: '2021-03-10',
  },
  {
    id: 'wt4',
    name: 'Highland Ridge 2',
    latitude: 56.47,
    longitude: -3.82,
    type: 'onshore',
    capacity: 4.2,
    hubHeight: 90,
    rotorDiameter: 120,
    windSpeed: 9.2,
    windDirection: 225,
    powerOutput: 0,
    capacityFactor: 0,
    availability: 0,
    wakeLoss: 0,
    status: 'maintenance',
    commissioning: '2021-03-15',
  },
  {
    id: 'wt5',
    name: 'Channel Delta 1',
    latitude: 50.75,
    longitude: 1.55,
    type: 'offshore',
    capacity: 6.0,
    hubHeight: 110,
    rotorDiameter: 150,
    windSpeed: 10.5,
    windDirection: 255,
    powerOutput: 3.2,
    capacityFactor: 28.8,
    availability: 92.4,
    wakeLoss: 15.8,
    status: 'curtailed',
    commissioning: '2023-01-22',
  },
  {
    id: 'wt6',
    name: 'Moorland Summit',
    latitude: 54.23,
    longitude: -2.05,
    type: 'onshore',
    capacity: 3.6,
    hubHeight: 80,
    rotorDiameter: 100,
    windSpeed: 8.5,
    windDirection: 210,
    powerOutput: 0,
    capacityFactor: 0,
    availability: 0,
    wakeLoss: 0,
    status: 'faulted',
    commissioning: '2020-09-05',
  },
]

const STATUS_COLORS: Record<string, string> = {
  operational: 'bg-green-500/10 text-green-600 dark:text-green-400',
  maintenance: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  faulted: 'bg-red-500/10 text-red-600 dark:text-red-400',
  curtailed: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
}

const STATUS_DOT: Record<string, string> = {
  operational: 'bg-green-500',
  maintenance: 'bg-yellow-500',
  faulted: 'bg-red-500',
  curtailed: 'bg-orange-500',
}

const TYPE_COLORS: Record<string, string> = {
  onshore: 'bg-emerald-500',
  offshore: 'bg-blue-500',
}

const TYPE_BADGE: Record<string, string> = {
  onshore: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  offshore: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

function generateWindRoseData(): Array<{ direction: string; speed: number; frequency: number }> {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return directions.map((dir) => ({
    direction: dir,
    speed: Math.round((3 + Math.random() * 12) * 10) / 10,
    frequency: Math.round(2 + Math.random() * 18),
  }))
}

function generatePowerTimeline(): Array<{ hour: string; power: number }> {
  const data: Array<{ hour: string; power: number }> = []
  for (let i = 0; i < 24; i++) {
    const basePower = 3 + Math.sin(i / 24 * Math.PI * 2) * 2
    data.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      power: Math.round(Math.max(0, basePower + (Math.random() - 0.5) * 2) * 10) / 10,
    })
  }
  return data
}

export function WindFarmOptimizer() {
  const { windFarm, setWindFarm } = useMapStore()

  const turbines = windFarm.turbines.length > 0 ? windFarm.turbines : DEMO_TURBINES
  const state = windFarm

  const activeTurbine = useMemo(() => {
    return state.activeTurbineId
      ? turbines.find((t) => t.id === state.activeTurbineId)
      : null
  }, [turbines, state.activeTurbineId])

  const windRoseData = useMemo(() => generateWindRoseData(), [])

  const powerTimeline = useMemo(() => generatePowerTimeline(), [])

  const capacityDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20%', min: 0, max: 20, count: 0 },
      { range: '20-40%', min: 20, max: 40, count: 0 },
      { range: '40-60%', min: 40, max: 60, count: 0 },
      { range: '60-80%', min: 60, max: 80, count: 0 },
      { range: '80-100%', min: 80, max: 100, count: 0 },
    ]
    turbines
      .filter((t) => t.status === 'operational' || t.status === 'curtailed')
      .forEach((t) => {
        const range = ranges.find((r) => t.capacityFactor >= r.min && t.capacityFactor < r.max)
        if (range) range.count++
      })
    return ranges
  }, [turbines])

  const totalPower = useMemo(() => {
    return turbines
      .filter((t) => t.status === 'operational' || t.status === 'curtailed')
      .reduce((sum, t) => sum + t.powerOutput, 0)
  }, [turbines])

  const totalCapacity = useMemo(() => {
    return turbines.reduce((sum, t) => sum + t.capacity, 0)
  }, [turbines])

  const avgCapacityFactor = useMemo(() => {
    const active = turbines.filter((t) => t.status === 'operational' || t.status === 'curtailed')
    if (active.length === 0) return 0
    return Math.round(active.reduce((sum, t) => sum + t.capacityFactor, 0) / active.length * 10) / 10
  }, [turbines])

  const operationalCount = turbines.filter((t) => t.status === 'operational').length
  const faultedCount = turbines.filter((t) => t.status === 'faulted').length

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
            <Wind className="h-5 w-5 text-emerald-500" />
            <h2 className="text-sm font-semibold">Wind Farm Optimizer</h2>
            <Badge variant="secondary" className="text-xs">
              {turbines.length} turbines
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setWindFarm({ open: false })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-4">
            {/* Summary Stats */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total Power</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {totalPower.toFixed(1)} MW
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="text-lg font-bold">{totalCapacity.toFixed(1)} MW</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Avg CF</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {avgCapacityFactor}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {operationalCount} operational
                  </span>
                  {faultedCount > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {faultedCount} faulted
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Overlay Toggles */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Eye className="h-3.5 w-3.5" />
                  Overlays
                </div>
                {[
                  { key: 'showWindRose' as const, label: 'Wind Rose' },
                  { key: 'showWakeEffects' as const, label: 'Wake Effects' },
                  { key: 'showPowerOutput' as const, label: 'Power Output' },
                  { key: 'showOptimization' as const, label: 'Optimization Suggestions' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-xs">{label}</Label>
                    <Switch
                      checked={state[key]}
                      onCheckedChange={(checked) => setWindFarm({ [key]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Scenario & Target */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Settings className="h-3.5 w-3.5" />
                  Configuration
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Wind Scenario</Label>
                  <Select
                    value={state.windScenario}
                    onValueChange={(value: 'current' | 'optimal' | 'conservative') =>
                      setWindFarm({ windScenario: value })
                    }
                  >
                    <SelectTrigger className="w-[140px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="optimal">Optimal</SelectItem>
                      <SelectItem value="conservative">Conservative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Optimization Target</Label>
                  <Select
                    value={state.optimizationTarget}
                    onValueChange={(value: 'power' | 'cost' | 'lifetime') =>
                      setWindFarm({ optimizationTarget: value })
                    }
                  >
                    <SelectTrigger className="w-[140px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="power">Max Power</SelectItem>
                      <SelectItem value="cost">Min Cost</SelectItem>
                      <SelectItem value="lifetime">Max Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-3">
              {/* Wind Rose */}
              <Card className="bg-transparent border-border/30">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Compass className="h-3 w-3" />
                    Wind Rose
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={140}>
                    <RadarChart data={windRoseData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="direction" tick={{ fontSize: 7 }} />
                      <PolarRadiusAxis tick={{ fontSize: 7 }} />
                      <Radar name="Frequency" dataKey="frequency" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Capacity Distribution */}
              <Card className="bg-transparent border-border/30">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Capacity Factor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={capacityDistribution}>
                      <XAxis dataKey="range" tick={{ fontSize: 7 }} />
                      <YAxis tick={{ fontSize: 8 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Power Output Timeline */}
            <Card className="bg-transparent border-border/30">
              <CardHeader className="p-2 pb-0">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Power Output (24h)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart data={powerTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="hour" tick={{ fontSize: 8 }} />
                    <YAxis tick={{ fontSize: 8 }} unit="MW" />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="power" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Wake Loss Visualization */}
            {state.showWakeEffects && (
              <Card className="bg-transparent border-border/30 border-orange-500/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Wake Effect Analysis
                  </div>
                  <div className="space-y-1.5">
                    {turbines
                      .filter((t) => t.status === 'operational' || t.status === 'curtailed')
                      .map((t) => (
                        <div key={t.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate">{t.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-border/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500 rounded-full"
                                style={{ width: `${Math.min(t.wakeLoss * 5, 100)}%` }}
                              />
                            </div>
                            <span className="text-orange-600 dark:text-orange-400 w-10 text-right">
                              {t.wakeLoss}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="opacity-50" />

            {/* Turbines List */}
            <div className="space-y-2">
              {turbines.map((turbine) => (
                <Card
                  key={turbine.id}
                  className={`bg-transparent border-border/30 cursor-pointer transition-colors hover:border-border/60 ${
                    state.activeTurbineId === turbine.id ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() =>
                    setWindFarm({
                      activeTurbineId: state.activeTurbineId === turbine.id ? null : turbine.id,
                    })
                  }
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wind className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-sm font-medium truncate">{turbine.name}</span>
                          <Badge className={`${TYPE_BADGE[turbine.type]} text-[10px] capitalize`}>
                            {turbine.type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          <Badge className={`${STATUS_COLORS[turbine.status]} text-[10px] capitalize`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[turbine.status]} mr-1 inline-block`} />
                            {turbine.status}
                          </Badge>
                          {(turbine.status === 'operational' || turbine.status === 'curtailed') && (
                            <>
                              <Badge variant="outline" className="text-[10px]">
                                {turbine.powerOutput.toFixed(1)} MW
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {turbine.capacityFactor}%
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      {state.activeTurbineId === turbine.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <AnimatePresence>
                      {state.activeTurbineId === turbine.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <Separator className="my-2 opacity-50" />
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Capacity</span>
                              <span className="font-medium">{turbine.capacity} MW</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Hub Height</span>
                              <span className="font-medium">{turbine.hubHeight}m</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Rotor Ø</span>
                              <span className="font-medium">{turbine.rotorDiameter}m</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Wind Speed</span>
                              <span className="font-medium">{turbine.windSpeed} m/s</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Direction</span>
                              <span className="font-medium">{turbine.windDirection}°</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Power</span>
                              <span className="font-medium">{turbine.powerOutput.toFixed(1)} MW</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Capacity Factor</span>
                              <span className="font-medium">{turbine.capacityFactor}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Availability</span>
                              <span className="font-medium">{turbine.availability}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Wake Loss</span>
                              <span className="font-medium text-orange-600 dark:text-orange-400">{turbine.wakeLoss}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Commissioned</span>
                              <span className="font-medium">{turbine.commissioning}</span>
                            </div>
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
