'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
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
  type TidalStation,
  type TidalPredictorState,
} from '@/lib/map-store'
import {
  X,
  Waves,
  ArrowUp,
  ArrowDown,
  Clock,
  Sun,
  Moon,
  Star,
  Compass,
  Droplets,
  Calendar,
  Info,
  Eye,
  ChevronDown,
  ChevronUp,
  Gauge,
  RefreshCw,
  MapPin,
} from 'lucide-react'

// Demo data
const DEMO_STATIONS: TidalStation[] = [
  {
    id: 'tidal1',
    name: 'Bay of Fundy',
    latitude: 45.2667,
    longitude: -64.3333,
    type: 'primary',
    currentHeight: 4.2,
    nextHigh: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    nextLow: new Date(Date.now() + 1000 * 60 * 360).toISOString(),
    tidalRange: 14.5,
    springRange: 16.3,
    neapRange: 10.2,
    harmonicConstants: [
      { constituent: 'M2', amplitude: 5.64, phase: 254 },
      { constituent: 'S2', amplitude: 0.82, phase: 278 },
      { constituent: 'N2', amplitude: 1.11, phase: 235 },
    ],
    maxCurrent: 4.8,
    currentDirection: 45,
  },
  {
    id: 'tidal2',
    name: 'Port of Southampton',
    latitude: 50.8990,
    longitude: -1.4043,
    type: 'primary',
    currentHeight: 2.1,
    nextHigh: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
    nextLow: new Date(Date.now() + 1000 * 60 * 300).toISOString(),
    tidalRange: 4.5,
    springRange: 5.2,
    neapRange: 2.8,
    harmonicConstants: [
      { constituent: 'M2', amplitude: 1.78, phase: 320 },
      { constituent: 'S2', amplitude: 0.56, phase: 348 },
      { constituent: 'N2', amplitude: 0.38, phase: 300 },
    ],
    maxCurrent: 2.1,
    currentDirection: 180,
  },
  {
    id: 'tidal3',
    name: 'Mont Saint-Michel',
    latitude: 48.6361,
    longitude: -1.5115,
    type: 'secondary',
    currentHeight: 5.8,
    nextHigh: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
    nextLow: new Date(Date.now() + 1000 * 60 * 240).toISOString(),
    tidalRange: 12.3,
    springRange: 14.0,
    neapRange: 8.5,
    harmonicConstants: [
      { constituent: 'M2', amplitude: 4.78, phase: 128 },
      { constituent: 'S2', amplitude: 1.52, phase: 155 },
      { constituent: 'N2', amplitude: 0.92, phase: 110 },
    ],
    maxCurrent: 3.2,
    currentDirection: 210,
  },
  {
    id: 'tidal4',
    name: 'Singapore Strait',
    latitude: 1.2833,
    longitude: 103.8333,
    type: 'harmonic',
    currentHeight: 1.4,
    nextHigh: new Date(Date.now() + 1000 * 60 * 200).toISOString(),
    nextLow: new Date(Date.now() + 1000 * 60 * 380).toISOString(),
    tidalRange: 2.8,
    springRange: 3.2,
    neapRange: 1.8,
    harmonicConstants: [
      { constituent: 'M2', amplitude: 0.88, phase: 45 },
      { constituent: 'S2', amplitude: 0.32, phase: 72 },
      { constituent: 'K1', amplitude: 0.65, phase: 180 },
    ],
    maxCurrent: 1.8,
    currentDirection: 290,
  },
  {
    id: 'tidal5',
    name: 'Derby, Western Australia',
    latitude: -17.3167,
    longitude: 123.6500,
    type: 'primary',
    currentHeight: 6.5,
    nextHigh: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    nextLow: new Date(Date.now() + 1000 * 60 * 210).toISOString(),
    tidalRange: 11.0,
    springRange: 12.5,
    neapRange: 7.2,
    harmonicConstants: [
      { constituent: 'M2', amplitude: 4.22, phase: 90 },
      { constituent: 'S2', amplitude: 2.15, phase: 115 },
      { constituent: 'N2', amplitude: 0.88, phase: 70 },
    ],
    maxCurrent: 3.8,
    currentDirection: 135,
  },
]

const TYPE_COLORS: Record<string, string> = {
  primary: 'bg-blue-500',
  secondary: 'bg-cyan-500',
  harmonic: 'bg-purple-500',
}

const TYPE_BADGE: Record<string, string> = {
  primary: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  secondary: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  harmonic: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
}

function formatCountdown(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now()
  if (diff <= 0) return 'Now'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function getMoonPhase(): { name: string; icon: React.ReactNode; illumination: number } {
  // Simple approximation based on a known new moon date
  const knownNewMoon = new Date('2024-01-11').getTime()
  const synodicPeriod = 29.53 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const phase = ((now - knownNewMoon) % synodicPeriod) / synodicPeriod

  if (phase < 0.0625) return { name: 'New Moon', icon: <Moon className="h-5 w-5" />, illumination: 0 }
  if (phase < 0.1875) return { name: 'Waxing Crescent', icon: <Moon className="h-5 w-5" />, illumination: Math.round(phase / 0.25 * 50) }
  if (phase < 0.3125) return { name: 'First Quarter', icon: <Moon className="h-5 w-5" />, illumination: 50 }
  if (phase < 0.4375) return { name: 'Waxing Gibbous', icon: <Moon className="h-5 w-5" />, illumination: Math.round(50 + phase / 0.25 * 25) }
  if (phase < 0.5625) return { name: 'Full Moon', icon: <Sun className="h-5 w-5 text-amber-400" />, illumination: 100 }
  if (phase < 0.6875) return { name: 'Waning Gibbous', icon: <Moon className="h-5 w-5" />, illumination: Math.round(75 - (phase - 0.5) * 100) }
  if (phase < 0.8125) return { name: 'Last Quarter', icon: <Moon className="h-5 w-5" />, illumination: 50 }
  if (phase < 0.9375) return { name: 'Waning Crescent', icon: <Moon className="h-5 w-5" />, illumination: Math.round(25 - (phase - 0.75) * 100) }
  return { name: 'New Moon', icon: <Moon className="h-5 w-5" />, illumination: 0 }
}

function generateTidalCurve(station: TidalStation, hours: number): Array<{ time: string; height: number }> {
  const data: Array<{ time: string; height: number }> = []
  const m2 = station.harmonicConstants.find(h => h.constituent === 'M2')
  const s2 = station.harmonicConstants.find(h => h.constituent === 'S2')
  const n2 = station.harmonicConstants.find(h => h.constituent === 'N2')

  const m2Amp = m2?.amplitude || 1.5
  const m2Phase = m2?.phase || 0
  const s2Amp = s2?.amplitude || 0.5
  const s2Phase = s2?.phase || 0
  const n2Amp = n2?.amplitude || 0.3
  const n2Phase = n2?.phase || 0

  const meanLevel = station.tidalRange / 2

  for (let i = 0; i <= hours; i++) {
    const t = i * 3600
    const h =
      meanLevel +
      m2Amp * Math.cos((2 * Math.PI * t) / (12.42 * 3600) - (m2Phase * Math.PI) / 180) +
      s2Amp * Math.cos((2 * Math.PI * t) / (12.0 * 3600) - (s2Phase * Math.PI) / 180) +
      n2Amp * Math.cos((2 * Math.PI * t) / (12.66 * 3600) - (n2Phase * Math.PI) / 180)
    data.push({
      time: `${i}h`,
      height: Math.round(Math.max(0, h) * 100) / 100,
    })
  }
  return data
}

export function TidalPredictor() {
  const { tidalPredictor, setTidalPredictor } = useMapStore()
  const [expandedStation, setExpandedStation] = useState<string | null>(null)

  const stations = tidalPredictor.stations.length > 0 ? tidalPredictor.stations : DEMO_STATIONS
  const state = tidalPredictor

  const activeStation = useMemo(() => {
    return state.activeStationId
      ? stations.find((s) => s.id === state.activeStationId)
      : stations[0]
  }, [stations, state.activeStationId])

  const tidalCurveData = useMemo(() => {
    if (!activeStation) return []
    return generateTidalCurve(activeStation, state.predictionHours)
  }, [activeStation, state.predictionHours])

  const moonPhase = useMemo(() => getMoonPhase(), [])

  const tideDirection = useMemo(() => {
    if (!activeStation) return 'rising'
    const nextHigh = new Date(activeStation.nextHigh).getTime()
    const nextLow = new Date(activeStation.nextLow).getTime()
    return nextHigh < nextLow ? 'rising' : 'falling'
  }, [activeStation])

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
            <Waves className="h-5 w-5 text-cyan-500" />
            <h2 className="text-sm font-semibold">Tidal Predictor</h2>
            <Badge variant="secondary" className="text-xs">
              {stations.length} stations
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setTidalPredictor({ open: false })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-4">
            {/* Current Station Info */}
            {activeStation && (
              <Card className="bg-transparent border-border/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm font-medium">{activeStation.name}</span>
                      <Badge className={`${TYPE_BADGE[activeStation.type]} text-[10px] capitalize`}>
                        {activeStation.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Height</p>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                          {activeStation.currentHeight.toFixed(1)}m
                        </span>
                        {tideDirection === 'rising' ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <ArrowUp className="h-3 w-3 text-green-500" />
                        <span className="text-muted-foreground">Next High:</span>
                        <span className="font-medium">{formatCountdown(activeStation.nextHigh)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <ArrowDown className="h-3 w-3 text-red-500" />
                        <span className="text-muted-foreground">Next Low:</span>
                        <span className="font-medium">{formatCountdown(activeStation.nextLow)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overlay Toggles */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Eye className="h-3.5 w-3.5" />
                  Overlays
                </div>
                {[
                  { key: 'showCurrentHeight' as const, label: 'Current Height' },
                  { key: 'showTidalFlow' as const, label: 'Tidal Flow' },
                  { key: 'showMoonPhase' as const, label: 'Moon Phase' },
                  { key: 'showCurrentVectors' as const, label: 'Current Vectors' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-xs">{label}</Label>
                    <Switch
                      checked={state[key]}
                      onCheckedChange={(checked) => setTidalPredictor({ [key]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Prediction Controls */}
            <Card className="bg-transparent border-border/30">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Prediction Settings
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Date</Label>
                  <input
                    type="date"
                    value={state.predictionDate}
                    onChange={(e) => setTidalPredictor({ predictionDate: e.target.value })}
                    className="text-xs bg-transparent border border-border/50 rounded px-2 py-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs">Hours</Label>
                    <span className="text-xs text-muted-foreground">{state.predictionHours}h</span>
                  </div>
                  <Slider
                    value={[state.predictionHours]}
                    onValueChange={([value]) => setTidalPredictor({ predictionHours: value })}
                    min={1}
                    max={168}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Moon Phase & Sun Info */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-transparent border-border/30">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                    <Moon className="h-3.5 w-3.5" />
                    Moon Phase
                  </div>
                  <div className="flex justify-center mb-1">
                    {moonPhase.icon}
                  </div>
                  <p className="text-xs font-medium">{moonPhase.name}</p>
                  <p className="text-[10px] text-muted-foreground">{moonPhase.illumination}% illuminated</p>
                </CardContent>
              </Card>
              <Card className="bg-transparent border-border/30">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                    <Sun className="h-3.5 w-3.5" />
                    Solar
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sunrise</span>
                      <span className="font-medium">06:42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sunset</span>
                      <span className="font-medium">18:15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Daylight</span>
                      <span className="font-medium">11h 33m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spring/Neap Range & Current Direction */}
            {activeStation && (
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-transparent border-border/30">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <Gauge className="h-3.5 w-3.5" />
                      Tidal Ranges
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Spring</span>
                        <span className="font-medium text-cyan-600 dark:text-cyan-400">{activeStation.springRange.toFixed(1)}m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Neap</span>
                        <span className="font-medium text-cyan-600 dark:text-cyan-400">{activeStation.neapRange.toFixed(1)}m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Current Range</span>
                        <span className="font-medium">{activeStation.tidalRange.toFixed(1)}m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-transparent border-border/30">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <Compass className="h-3.5 w-3.5" />
                      Current
                    </div>
                    <div className="flex flex-col items-center">
                      {/* Simple compass */}
                      <div className="relative w-16 h-16 rounded-full border-2 border-border/50 flex items-center justify-center">
                        <span className="absolute top-0.5 text-[8px] text-muted-foreground">N</span>
                        <span className="absolute bottom-0.5 text-[8px] text-muted-foreground">S</span>
                        <span className="absolute left-0.5 text-[8px] text-muted-foreground">W</span>
                        <span className="absolute right-0.5 text-[8px] text-muted-foreground">E</span>
                        <div
                          className="absolute w-0.5 h-6 bg-cyan-500 rounded-full origin-bottom"
                          style={{
                            transform: `rotate(${activeStation.currentDirection}deg)`,
                            bottom: '50%',
                            left: 'calc(50% - 1px)',
                          }}
                        />
                        <div className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400" />
                      </div>
                      <div className="mt-1 text-xs text-center">
                        <span className="font-medium">{activeStation.currentDirection}°</span>
                        <span className="text-muted-foreground ml-1">@ {activeStation.maxCurrent} kt</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tidal Curve Chart */}
            {activeStation && (
              <Card className="bg-transparent border-border/30">
                <CardHeader className="p-2 pb-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Waves className="h-3 w-3" />
                    Tidal Prediction Curve
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={tidalCurveData}>
                      <defs>
                        <linearGradient id="tidalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} unit="m" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Area
                        type="monotone"
                        dataKey="height"
                        stroke="#06b6d4"
                        fill="url(#tidalGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Separator className="opacity-50" />

            {/* Stations List */}
            <div className="space-y-2">
              {stations.map((station) => (
                <Card
                  key={station.id}
                  className={`bg-transparent border-border/30 cursor-pointer transition-colors hover:border-border/60 ${
                    state.activeStationId === station.id ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() =>
                    setTidalPredictor({
                      activeStationId: state.activeStationId === station.id ? null : station.id,
                    })
                  }
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Waves className="h-4 w-4 text-cyan-500" />
                        <span className="text-sm font-medium">{station.name}</span>
                        <Badge className={`${TYPE_BADGE[station.type]} text-[10px] capitalize`}>
                          {station.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                          {station.currentHeight.toFixed(1)}m
                        </span>
                        {state.activeStationId === station.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {state.activeStationId === station.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <Separator className="my-2 opacity-50" />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">Tidal Range</span>
                              <p className="font-medium">{station.tidalRange.toFixed(1)}m</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">Max Current</span>
                              <p className="font-medium">{station.maxCurrent} kt</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">Spring Range</span>
                              <p className="font-medium">{station.springRange.toFixed(1)}m</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground">Neap Range</span>
                              <p className="font-medium">{station.neapRange.toFixed(1)}m</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Compass className="h-3 w-3" />
                            <span>Current direction: {station.currentDirection}°</span>
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
