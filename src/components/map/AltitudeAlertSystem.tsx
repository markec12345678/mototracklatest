'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMapStore, type AltitudeZone, type AltitudeAlert, type AltitudeState } from '@/lib/map-store'
import {
  ArrowUpFromLine,
  Mountain,
  AlertTriangle,
  Droplets,
  Sun,
  Download,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Heart,
  ThermometerSun,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function getZoneForAltitude(altitude: number, zones: AltitudeZone[]): AltitudeZone | null {
  for (const zone of zones) {
    if (altitude >= zone.minAlt && altitude < zone.maxAlt) return zone
  }
  return null
}

function getOxygenLevel(altitude: number): number {
  // Approximate oxygen percentage by altitude
  return Math.max(0, 20.9 - (altitude / 1000) * 0.6)
}

function getUVIndex(altitude: number): number {
  // UV increases roughly 10-12% per 1000m
  const baseUV = 6
  return Math.min(15, baseUV + (altitude / 1000) * 1.2)
}

function getAcclimatizationAdvice(altitude: number): string {
  if (altitude < 1500) return 'No acclimatization needed. Normal activity is safe.'
  if (altitude < 2500) return 'Mild altitude. Stay hydrated, avoid alcohol, take it easy the first day.'
  if (altitude < 3500) return 'Moderate altitude. Acclimatize for 1-2 days. Watch for headache and nausea.'
  if (altitude < 5500) return 'High altitude. Acclimatize for 2-3 days. Descend if symptoms worsen.'
  return 'Extreme altitude. Acclimatize for 3+ days. Use supplemental oxygen if available.'
}

function getHydrationTip(altitude: number): string {
  if (altitude < 1500) return 'Standard hydration: 2-3L per day.'
  if (altitude < 3000) return 'Increased hydration needed: 3-4L per day. Dry air increases water loss.'
  return 'Critical hydration: 4-5L+ per day. High altitude significantly increases fluid loss.'
}

const DEFAULT_ZONES: AltitudeZone[] = [
  { id: 'lowland', name: 'Lowland', minAlt: 0, maxAlt: 500, color: '#22c55e' },
  { id: 'highland', name: 'Highland', minAlt: 500, maxAlt: 1500, color: '#eab308' },
  { id: 'alpine', name: 'Alpine', minAlt: 1500, maxAlt: 3000, color: '#f97316' },
  { id: 'high-alpine', name: 'High Alpine', minAlt: 3000, maxAlt: 8849, color: '#ef4444' },
]

export function AltitudeAlertSystem() {
  const altitudeState = useMapStore((s) => s.altitudeState)
  const setAltitudeState = useMapStore((s) => s.setAltitudeState)
  const altitudeAlertOpen = useMapStore((s) => s.altitudeAlertOpen)
  const setAltitudeAlertOpen = useMapStore((s) => s.setAltitudeAlertOpen)

  const [audioEnabled, setAudioEnabled] = useState(false)
  const [targetInput, setTargetInput] = useState('')
  const [rateInput, setRateInput] = useState('')
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneMin, setNewZoneMin] = useState('')
  const [newZoneMax, setNewZoneMax] = useState('')
  const [newZoneColor, setNewZoneColor] = useState('#6366f1')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioEnabledRef = useRef(false)
  const lastZoneRef = useRef<string | null>(null)
  const prevAltRef = useRef<number | null>(null)
  const prevTimeRef = useRef<number | null>(null)
  const fetchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const historyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keep audioEnabled ref in sync
  useEffect(() => { audioEnabledRef.current = audioEnabled }, [audioEnabled])

  // Audio beep utility
  const playBeep = useCallback((freq: number, duration: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.frequency.value = freq
      oscillator.type = 'sine'
      gain.gain.value = 0.25
      oscillator.start()
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      oscillator.stop(ctx.currentTime + duration)
    } catch {
      // Audio not supported
    }
  }, [])

  // Fetch altitude from Open-Meteo API
  const fetchAltitude = useCallback(async () => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return

    const center = map.getCenter()
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/elevation?latitude=${center.lat.toFixed(4)}&longitude=${center.lng.toFixed(4)}`
      )
      if (!res.ok) return
      const data = await res.json()
      const alt = data.elevation?.[0]
      if (typeof alt === 'number') {
        const store = useMapStore.getState()
        const currentState = store.altitudeState
        const now = Date.now()
        const prevAlt = currentState.currentAltitude
        const prevTime = prevTimeRef.current

        let rate = 0
        if (prevAlt !== null && prevTime !== null) {
          const dt = (now - prevTime) / 60000 // minutes
          if (dt > 0) rate = (alt - prevAlt) / dt
        }
        prevAltRef.current = alt
        prevTimeRef.current = now

        const newMin = currentState.minAltitude === null ? alt : Math.min(currentState.minAltitude, alt)
        const newMax = currentState.maxAltitude === null ? alt : Math.max(currentState.maxAltitude, alt)

        const updatedHistory = [
          ...currentState.history,
          { timestamp: now, altitude: alt },
        ].slice(-120) // Keep last 120 points

        store.setAltitudeState({
          currentAltitude: alt,
          minAltitude: newMin,
          maxAltitude: newMax,
          history: updatedHistory,
        })

        // Check zone transitions
        const currentZone = getZoneForAltitude(alt, currentState.zones)
        if (currentZone && currentZone.id !== lastZoneRef.current) {
          if (lastZoneRef.current !== null) {
            // Zone transition detected
            const newAlert: AltitudeAlert = {
              id: `zone-${Date.now()}`,
              type: 'zone',
              value: alt,
              triggered: true,
              timestamp: now,
            }
            store.setAltitudeState({
              alerts: [...currentState.alerts, newAlert].slice(-20),
            })
            if (audioEnabledRef.current) playBeep(600, 0.4)
          }
          lastZoneRef.current = currentZone.id
        }

        // Check target altitude alerts
        if (currentState.targetAltitude !== null) {
          const diff = Math.abs(alt - currentState.targetAltitude)
          if (diff < 20) {
            const alreadyTriggered = currentState.alerts.some(
              (a) => a.type === 'target' && a.triggered && a.timestamp && (now - a.timestamp < 10000)
            )
            if (!alreadyTriggered) {
              const targetAlert: AltitudeAlert = {
                id: `target-${Date.now()}`,
                type: 'target',
                value: currentState.targetAltitude,
                triggered: true,
                timestamp: now,
              }
              store.setAltitudeState({
                alerts: [...currentState.alerts, targetAlert].slice(-20),
              })
              if (audioEnabledRef.current) playBeep(1000, 0.5)
            }
          }
        }

        // Check rate alerts
        if (currentState.alerts.some((a) => a.type === 'rate' && !a.triggered)) {
          const rateThreshold = currentState.alerts.find((a) => a.type === 'rate')?.value || 0
          if (Math.abs(rate) > rateThreshold && rateThreshold > 0) {
            const rateAlert: AltitudeAlert = {
              id: `rate-${Date.now()}`,
              type: 'rate',
              value: rateThreshold,
              triggered: true,
              timestamp: now,
            }
            store.setAltitudeState({
              alerts: [...currentState.alerts, rateAlert].slice(-20),
            })
            if (audioEnabledRef.current) playBeep(1200, 0.3)
          }
        }
      }
    } catch {
      // API error - silently ignore
    }
  }, [audioEnabled])

  // Start/stop altitude fetching
  useEffect(() => {
    if (!altitudeAlertOpen) return
    fetchAltitude()
    fetchIntervalRef.current = setInterval(fetchAltitude, 5000)
    return () => {
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current)
    }
  }, [altitudeAlertOpen, fetchAltitude])

  // Reset previous tracking when dialog closes
  useEffect(() => {
    if (!altitudeAlertOpen) {
      prevAltRef.current = null
      prevTimeRef.current = null
    }
  }, [altitudeAlertOpen])

  // Set target altitude alert
  const handleSetTarget = useCallback(() => {
    const val = parseFloat(targetInput)
    if (isNaN(val)) return
    const store = useMapStore.getState()
    const filtered = store.altitudeState.alerts.filter((a) => a.type !== 'target')
    store.setAltitudeState({
      targetAltitude: val,
      alerts: [...filtered, { id: `target-${Date.now()}`, type: 'target', value: val, triggered: false, timestamp: null }],
    })
    setTargetInput('')
  }, [targetInput])

  // Set rate alert
  const handleSetRate = useCallback(() => {
    const val = parseFloat(rateInput)
    if (isNaN(val) || val <= 0) return
    const store = useMapStore.getState()
    const filtered = store.altitudeState.alerts.filter((a) => a.type !== 'rate')
    store.setAltitudeState({
      alerts: [...filtered, { id: `rate-${Date.now()}`, type: 'rate', value: val, triggered: false, timestamp: null }],
    })
    setRateInput('')
  }, [rateInput])

  // Add custom zone
  const handleAddZone = useCallback(() => {
    if (!newZoneName || !newZoneMin || !newZoneMax) return
    const min = parseFloat(newZoneMin)
    const max = parseFloat(newZoneMax)
    if (isNaN(min) || isNaN(max) || min >= max) return
    const store = useMapStore.getState()
    store.setAltitudeState({
      zones: [...store.altitudeState.zones, {
        id: `zone-${Date.now()}`,
        name: newZoneName,
        minAlt: min,
        maxAlt: max,
        color: newZoneColor,
      }],
    })
    setNewZoneName('')
    setNewZoneMin('')
    setNewZoneMax('')
  }, [newZoneName, newZoneMin, newZoneMax, newZoneColor])

  // Remove a zone
  const handleRemoveZone = useCallback((id: string) => {
    const store = useMapStore.getState()
    store.setAltitudeState({
      zones: store.altitudeState.zones.filter((z) => z.id !== id),
    })
  }, [])

  // Clear alerts
  const handleClearAlerts = useCallback(() => {
    const store = useMapStore.getState()
    store.setAltitudeState({ alerts: [] })
  }, [])

  // Export altitude data as CSV
  const handleExportCSV = useCallback(() => {
    const store = useMapStore.getState()
    const { history, zones, alerts } = store.altitudeState
    let csv = 'Timestamp,DateTime,Altitude(m),Zone\n'
    for (const h of history) {
      const zone = getZoneForAltitude(h.altitude, zones)
      csv += `${h.timestamp},"${new Date(h.timestamp).toISOString()}",${h.altitude.toFixed(1)},${zone?.name || 'Unknown'}\n`
    }
    csv += '\nAlerts\nType,Value,Triggered,Timestamp\n'
    for (const a of alerts) {
      csv += `${a.type},${a.value},${a.triggered},${a.timestamp ? new Date(a.timestamp).toISOString() : 'N/A'}\n`
    }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `altitude-data-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // Reset to default zones
  const handleResetZones = useCallback(() => {
    const store = useMapStore.getState()
    store.setAltitudeState({ zones: DEFAULT_ZONES })
  }, [])

  // Reset altitude session
  const handleResetSession = useCallback(() => {
    const store = useMapStore.getState()
    store.setAltitudeState({
      currentAltitude: null,
      minAltitude: null,
      maxAltitude: null,
      targetAltitude: null,
      alerts: [],
      history: [],
    })
    lastZoneRef.current = null
    prevAltRef.current = null
    prevTimeRef.current = null
  }, [])

  const currentAlt = altitudeState.currentAltitude
  const currentZone = currentAlt !== null ? getZoneForAltitude(currentAlt, altitudeState.zones) : null
  const oxygenLevel = currentAlt !== null ? getOxygenLevel(currentAlt) : null
  const uvIndex = currentAlt !== null ? getUVIndex(currentAlt) : null

  // Calculate rate
  let altRate = 0
  if (altitudeState.history.length >= 2) {
    const last = altitudeState.history[altitudeState.history.length - 1]
    const prev = altitudeState.history[altitudeState.history.length - 2]
    const dtMin = (last.timestamp - prev.timestamp) / 60000
    if (dtMin > 0) altRate = (last.altitude - prev.altitude) / dtMin
  }

  const chartData = altitudeState.history.map((h) => ({
    time: formatTime(h.timestamp),
    altitude: Math.round(h.altitude),
  }))

  return (
    <Dialog open={altitudeAlertOpen} onOpenChange={setAltitudeAlertOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="h-5 w-5 text-orange-500" />
            Altitude Alert System
            {currentZone && (
              <Badge variant="outline" style={{ borderColor: currentZone.color, color: currentZone.color }}>
                {currentZone.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="monitor" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitor" className="text-xs">
              <Mountain className="h-3.5 w-3.5 mr-1" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs">
              <Heart className="h-3.5 w-3.5 mr-1" />
              Health
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <ArrowUpFromLine className="h-3.5 w-3.5 mr-1" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-4 mt-4">
            {/* Current Altitude */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-1">Current Altitude</div>
                <div className="text-2xl font-bold tabular-nums">
                  {currentAlt !== null ? `${currentAlt.toFixed(0)} m` : '—'}
                </div>
                {currentZone && (
                  <Badge variant="secondary" className="mt-1 text-[10px]" style={{ backgroundColor: currentZone.color + '20', color: currentZone.color }}>
                    {currentZone.name}
                  </Badge>
                )}
              </div>
              <div className="rounded-xl border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-1">Change Rate</div>
                <div className="text-2xl font-bold tabular-nums">
                  {altRate !== 0 ? `${altRate > 0 ? '+' : ''}${altRate.toFixed(1)}` : '0'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">m/min</span>
                </div>
                {altRate > 10 && (
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-red-500/10 text-red-600 dark:text-red-400">
                    Rapid Ascent
                  </Badge>
                )}
                {altRate < -10 && (
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Rapid Descent
                  </Badge>
                )}
              </div>
            </div>

            {/* Min/Max */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground mb-1">Min Altitude</div>
                <div className="text-lg font-semibold tabular-nums">
                  {altitudeState.minAltitude !== null ? `${altitudeState.minAltitude.toFixed(0)} m` : '—'}
                </div>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground mb-1">Max Altitude</div>
                <div className="text-lg font-semibold tabular-nums">
                  {altitudeState.maxAltitude !== null ? `${altitudeState.maxAltitude.toFixed(0)} m` : '—'}
                </div>
              </div>
            </div>

            {/* Altitude Zones */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Altitude Zones</h4>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleResetZones}>
                    Reset Defaults
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleResetSession}>
                    Reset Session
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                {altitudeState.zones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors ${
                      currentZone?.id === zone.id ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: zone.color }} />
                      <span className="font-medium">{zone.name}</span>
                      <span className="text-muted-foreground">
                        {zone.minAlt}–{zone.maxAlt === 8849 ? '∞' : zone.maxAlt} m
                      </span>
                    </div>
                    {!DEFAULT_ZONES.some((d) => d.id === zone.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveZone(zone.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {/* Add custom zone */}
              <div className="flex gap-1.5 items-end">
                <Input
                  placeholder="Name"
                  className="h-8 text-xs flex-1"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                />
                <Input
                  placeholder="Min m"
                  type="number"
                  className="h-8 text-xs w-20"
                  value={newZoneMin}
                  onChange={(e) => setNewZoneMin(e.target.value)}
                />
                <Input
                  placeholder="Max m"
                  type="number"
                  className="h-8 text-xs w-20"
                  value={newZoneMax}
                  onChange={(e) => setNewZoneMax(e.target.value)}
                />
                <input
                  type="color"
                  className="h-8 w-8 rounded border cursor-pointer"
                  value={newZoneColor}
                  onChange={(e) => setNewZoneColor(e.target.value)}
                />
                <Button size="sm" className="h-8 text-xs" onClick={handleAddZone}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Audio toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm">
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Audio Alerts
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4 mt-4">
            {/* Target Altitude Alert */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                Target Altitude Alert
              </h4>
              <p className="text-xs text-muted-foreground">
                Get notified when you reach a specific altitude.
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Target altitude (m)"
                  className="h-8 text-xs"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSetTarget() }}
                />
                <Button size="sm" className="h-8 text-xs" onClick={handleSetTarget}>
                  Set Target
                </Button>
              </div>
              {altitudeState.targetAltitude !== null && (
                <div className="text-xs text-muted-foreground">
                  Target: <span className="font-medium text-foreground">{altitudeState.targetAltitude} m</span>
                  {currentAlt !== null && (
                    <span className="ml-2">
                      ({Math.abs(currentAlt - altitudeState.targetAltitude).toFixed(0)} m away)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Rate Alert */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Rate Change Alert
              </h4>
              <p className="text-xs text-muted-foreground">
                Warn when altitude changes faster than the threshold (m/min).
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Rate threshold (m/min)"
                  className="h-8 text-xs"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSetRate() }}
                />
                <Button size="sm" className="h-8 text-xs" onClick={handleSetRate}>
                  Set Rate
                </Button>
              </div>
              {altitudeState.alerts.filter((a) => a.type === 'rate').map((alert) => (
                <div key={alert.id} className="text-xs text-muted-foreground flex items-center gap-2">
                  Rate threshold: <span className="font-medium text-foreground">{alert.value} m/min</span>
                  {alert.triggered && <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">Triggered</Badge>}
                </div>
              ))}
            </div>

            {/* Alert Log */}
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Alert Log</h4>
                {altitudeState.alerts.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={handleClearAlerts}>
                    Clear All
                  </Button>
                )}
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {altitudeState.alerts.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No alerts recorded yet.</p>
                ) : (
                  altitudeState.alerts.slice().reverse().map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between text-xs rounded-lg bg-muted/50 p-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            alert.type === 'target' ? 'bg-emerald-500/10 text-emerald-600' :
                            alert.type === 'rate' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-blue-500/10 text-blue-600'
                          }`}
                        >
                          {alert.type}
                        </Badge>
                        <span className="tabular-nums">{alert.value} {alert.type === 'rate' ? 'm/min' : 'm'}</span>
                      </div>
                      {alert.timestamp && (
                        <span className="text-muted-foreground tabular-nums">{formatTime(alert.timestamp)}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4 mt-4">
            {/* Oxygen Level */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-medium">Oxygen Level</h4>
              </div>
              {oxygenLevel !== null ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold tabular-nums">{oxygenLevel.toFixed(1)}%</div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(oxygenLevel / 20.9) * 100}%`,
                        backgroundColor: oxygenLevel > 18 ? '#22c55e' : oxygenLevel > 15 ? '#eab308' : '#ef4444',
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {oxygenLevel > 19.5 ? 'Normal oxygen levels.' :
                     oxygenLevel > 17 ? 'Slightly reduced oxygen. Minor effects possible.' :
                     oxygenLevel > 14 ? 'Reduced oxygen. Light-headedness possible.' :
                     'Significantly reduced oxygen. Use supplemental oxygen.'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Open this panel to start monitoring altitude.</p>
              )}
            </div>

            {/* UV Exposure */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <h4 className="text-sm font-medium">UV Exposure</h4>
              </div>
              {uvIndex !== null ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold tabular-nums">{uvIndex.toFixed(1)}</div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      uvIndex <= 2 ? 'bg-green-500/10 text-green-600' :
                      uvIndex <= 5 ? 'bg-yellow-500/10 text-yellow-600' :
                      uvIndex <= 7 ? 'bg-orange-500/10 text-orange-600' :
                      uvIndex <= 10 ? 'bg-red-500/10 text-red-600' :
                      'bg-purple-500/10 text-purple-600'
                    }`}
                  >
                    {uvIndex <= 2 ? 'Low' : uvIndex <= 5 ? 'Moderate' : uvIndex <= 7 ? 'High' : uvIndex <= 10 ? 'Very High' : 'Extreme'}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    UV increases ~10-12% per 1000m altitude.
                    {uvIndex > 5 && ' Wear sunscreen and protective clothing!'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Open this panel to start monitoring.</p>
              )}
            </div>

            {/* Acclimatization */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThermometerSun className="h-4 w-4 text-orange-500" />
                <h4 className="text-sm font-medium">Acclimatization</h4>
              </div>
              {currentAlt !== null ? (
                <p className="text-xs text-muted-foreground leading-relaxed">{getAcclimatizationAdvice(currentAlt)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Open this panel to start monitoring.</p>
              )}
            </div>

            {/* Hydration */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-cyan-500" />
                <h4 className="text-sm font-medium">Hydration Reminder</h4>
              </div>
              {currentAlt !== null ? (
                <p className="text-xs text-muted-foreground leading-relaxed">{getHydrationTip(currentAlt)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Open this panel to start monitoring.</p>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            {/* Altitude Chart */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Altitude Over Time</h4>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleExportCSV}>
                  <Download className="h-3 w-3 mr-1" />
                  Export CSV
                </Button>
              </div>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="altGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} width={50} />
                    <RechartsTooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      formatter={(value: number) => [`${value} m`, 'Altitude']}
                    />
                    <Area
                      type="monotone"
                      dataKey="altitude"
                      stroke="#f97316"
                      fill="url(#altGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Not enough data yet. Keep the dialog open to collect altitude readings.
                </p>
              )}
            </div>

            {/* Zone Transitions Log */}
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <h4 className="text-sm font-medium">Zone Transitions</h4>
              {altitudeState.alerts.filter((a) => a.type === 'zone').length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No zone transitions recorded yet.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {altitudeState.alerts
                    .filter((a) => a.type === 'zone')
                    .slice().reverse().map((alert) => {
                      const zone = getZoneForAltitude(alert.value, altitudeState.zones)
                      return (
                        <div key={alert.id} className="flex items-center justify-between text-xs rounded-lg bg-muted/50 p-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: zone?.color || '#888' }} />
                            <span>Entered <strong>{zone?.name || 'Unknown'}</strong> at {alert.value.toFixed(0)} m</span>
                          </div>
                          {alert.timestamp && (
                            <span className="text-muted-foreground tabular-nums">{formatTime(alert.timestamp)}</span>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
