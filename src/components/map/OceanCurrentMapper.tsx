'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { useMapStore, type OceanCurrent, type OceanCurrentState } from '@/lib/map-store'
import {
  Waves,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3,
  MapPin,
  Thermometer,
  ArrowRight,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// Demo ocean currents
const DEMO_CURRENTS: OceanCurrent[] = [
  {
    id: 'oc1',
    name: 'Gulf Stream',
    coordinates: [[25, -80], [35, -75], [40, -70], [45, -60], [50, -45]],
    speed: 2.0,
    temperature: 24.5,
    direction: 45,
    type: 'warm',
  },
  {
    id: 'oc2',
    name: 'Kuroshio Current',
    coordinates: [[15, 125], [22, 128], [30, 135], [35, 140], [42, 150]],
    speed: 1.8,
    temperature: 22.0,
    direction: 55,
    type: 'warm',
  },
  {
    id: 'oc3',
    name: 'Antarctic Circumpolar',
    coordinates: [[-55, -180], [-55, -120], [-55, -60], [-55, 0], [-55, 60], [-55, 120]],
    speed: 0.6,
    temperature: 2.0,
    direction: 90,
    type: 'cold',
  },
  {
    id: 'oc4',
    name: 'Benguela Current',
    coordinates: [[-35, 15], [-25, 13], [-15, 11], [-5, 9]],
    speed: 0.4,
    temperature: 12.5,
    direction: 0,
    type: 'cold',
  },
  {
    id: 'oc5',
    name: 'Humboldt Current',
    coordinates: [[-45, -75], [-35, -73], [-25, -72], [-15, -76], [-5, -80]],
    speed: 0.5,
    temperature: 14.0,
    direction: 350,
    type: 'cold',
  },
  {
    id: 'oc6',
    name: 'North Atlantic Drift',
    coordinates: [[45, -45], [50, -30], [55, -20], [60, -10], [65, 0]],
    speed: 0.8,
    temperature: 13.0,
    direction: 50,
    type: 'mixed',
  },
]

const TYPE_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  warm: { bg: 'bg-red-500/10', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  cold: { bg: 'bg-blue-500/10', color: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  mixed: { bg: 'bg-purple-500/10', color: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
}

const TYPE_COLORS: Record<string, string> = {
  warm: '#ef4444',
  cold: '#3b82f6',
  mixed: '#a855f7',
}

// Temperature profile by depth
const DEPTH_LABELS = ['Surface', '50m', '100m', '250m', '500m', '1000m', '2000m', '4000m']

export function OceanCurrentMapper() {
  const oceanCurrent = useMapStore((s) => s.oceanCurrent)
  const setOceanCurrent = useMapStore((s) => s.setOceanCurrent)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const currents = oceanCurrent.currents.length > 0 ? oceanCurrent.currents : DEMO_CURRENTS

  // Temperature profile data by depth for different current types
  const tempProfileData = useMemo(() => {
    const depthValues = [0, 50, 100, 250, 500, 1000, 2000, 4000]
    return depthValues.map((depth, i) => ({
      depth: DEPTH_LABELS[i],
      warm: Math.max(2, 26 - depth * 0.005 - Math.log(depth + 1) * 2),
      cold: Math.max(1.5, 14 - depth * 0.003 - Math.log(depth + 1) * 1.2),
      mixed: Math.max(1.8, 18 - depth * 0.004 - Math.log(depth + 1) * 1.6),
    }))
  }, [])

  // Current speed bar chart
  const speedChartData = useMemo(() => {
    return currents.map(c => ({
      name: c.name.length > 14 ? c.name.slice(0, 12) + '…' : c.name,
      speed: c.speed,
      color: TYPE_COLORS[c.type],
    }))
  }, [currents])

  // Adjust speeds based on depth layer
  const depthMultiplier: Record<string, number> = {
    surface: 1.0,
    '100m': 0.7,
    '500m': 0.4,
    '1000m': 0.2,
    deep: 0.1,
  }

  const adjustedSpeedData = useMemo(() => {
    const mult = depthMultiplier[oceanCurrent.depthLayer] || 1.0
    return speedChartData.map(d => ({
      ...d,
      speed: Math.round(d.speed * mult * 100) / 100,
    }))
  }, [speedChartData, oceanCurrent.depthLayer])

  if (typeof window === 'undefined') return null
  if (!oceanCurrent.open) return null

  const overlayToggles: { key: keyof OceanCurrentState; label: string; checked: boolean }[] = [
    { key: 'showCurrents', label: 'Currents', checked: oceanCurrent.showCurrents },
    { key: 'showSST', label: 'Sea Surface Temp', checked: oceanCurrent.showSST },
    { key: 'showThermohaline', label: 'Thermohaline', checked: oceanCurrent.showThermohaline },
    { key: 'showSalinity', label: 'Salinity', checked: oceanCurrent.showSalinity },
  ]

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
                <Waves className="h-4 w-4 text-blue-500" />
                Ocean Current Mapper
                <Badge variant="outline" className="text-[10px] font-normal">
                  {currents.length} currents
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOceanCurrent({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Depth Layer Selector */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Depth
                </Label>
                <Select
                  value={oceanCurrent.depthLayer}
                  onValueChange={(v) => setOceanCurrent({ depthLayer: v as OceanCurrentState['depthLayer'] })}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surface">Surface</SelectItem>
                    <SelectItem value="100m">100m</SelectItem>
                    <SelectItem value="500m">500m</SelectItem>
                    <SelectItem value="1000m">1000m</SelectItem>
                    <SelectItem value="deep">Deep Ocean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Season Selector */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Season</Label>
                <Select
                  value={oceanCurrent.season}
                  onValueChange={(v) => setOceanCurrent({ season: v as OceanCurrentState['season'] })}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="autumn">Autumn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Overlay Toggles */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Map Overlays
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {overlayToggles.map(toggle => (
                    <div key={toggle.key} className="flex items-center gap-2">
                      <Switch
                        checked={toggle.checked}
                        onCheckedChange={(v) => setOceanCurrent({ [toggle.key]: v })}
                      />
                      <span className="text-xs">{toggle.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Temperature Profile Line Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Thermometer className="h-3 w-3" /> Temperature Profile by Depth (°C)
                </Label>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={tempProfileData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="depth" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 30]} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}°C`, '']}
                    />
                    <Line type="monotone" dataKey="warm" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} name="Warm" />
                    <Line type="monotone" dataKey="cold" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Cold" />
                    <Line type="monotone" dataKey="mixed" stroke="#a855f7" strokeWidth={2} dot={{ r: 2 }} name="Mixed" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Warm</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Cold</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Mixed</div>
                </div>
              </div>

              {/* Current Speed Bar Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> Current Speed (m/s) — {oceanCurrent.depthLayer}
                </Label>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={adjustedSpeedData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value} m/s`, 'Speed']}
                    />
                    <Bar dataKey="speed" radius={[3, 3, 0, 0]}>
                      {adjustedSpeedData.map((entry, index) => (
                        <Cell key={`spd-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Separator />

              {/* Current List */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Major Ocean Currents</Label>
                {currents.map(current => {
                  const style = TYPE_STYLES[current.type]
                  const isExpanded = expandedId === current.id
                  return (
                    <div
                      key={current.id}
                      className="rounded-lg border border-border/50 p-2.5 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : current.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Waves className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[140px]">{current.name}</span>
                          <Badge className={`${style.bg} ${style.color} border-0 text-[9px] px-1.5 py-0 capitalize`}>
                            {current.type}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      {!isExpanded && (
                        <div className="flex items-center gap-3 mt-1.5 text-[9px] text-muted-foreground ml-5.5">
                          <span>{current.speed} m/s</span>
                          <span>{current.temperature}°C</span>
                          <ArrowRight className="h-2.5 w-2.5" style={{ transform: `rotate(${current.direction}deg)` }} />
                        </div>
                      )}
                      {isExpanded && (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className={`font-medium capitalize ${style.color}`}>{current.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Speed</span>
                            <span className="font-medium">{current.speed} m/s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Temperature</span>
                            <span className="font-medium">{current.temperature}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Direction</span>
                            <span className="font-medium">{current.direction}°</span>
                          </div>
                          <div className="col-span-2 flex justify-between">
                            <span className="text-muted-foreground">Waypoints</span>
                            <span className="font-medium">{current.coordinates.length} points</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Toggle button for the map toolbar
export function OceanCurrentMapperToggle() {
  const oceanCurrent = useMapStore((s) => s.oceanCurrent)
  const setOceanCurrent = useMapStore((s) => s.setOceanCurrent)

  return (
    <Button
      variant={oceanCurrent.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setOceanCurrent({ open: !oceanCurrent.open })}
      title="Ocean Current Mapper"
    >
      <Waves className="h-4 w-4" />
    </Button>
  )
}
