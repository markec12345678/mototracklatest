'use client'

import { useEffect, useRef, useState } from 'react'
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
import { useMapStore, type SpeedZone } from '@/lib/map-store'
import {
  Gauge,
  AlertTriangle,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

function getZoneColor(speedLimit: number): string {
  if (speedLimit > 80) return '#22c55e'
  if (speedLimit >= 50) return '#eab308'
  if (speedLimit >= 30) return '#f97316'
  return '#ef4444'
}

function getZoneColorClass(speedLimit: number): string {
  if (speedLimit > 80) return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
  if (speedLimit >= 50) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
  if (speedLimit >= 30) return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30'
  return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

interface SpeedHistoryPoint {
  time: number
  speed: number
  limit: number
}

export function SpeedAlertSystem() {
  const speedAlertOpen = useMapStore((s) => s.speedAlertOpen)
  const setSpeedAlertOpen = useMapStore((s) => s.setSpeedAlertOpen)
  const speedZones = useMapStore((s) => s.speedZones)
  const addSpeedZone = useMapStore((s) => s.addSpeedZone)
  const removeSpeedZone = useMapStore((s) => s.removeSpeedZone)
  const clearSpeedZones = useMapStore((s) => s.clearSpeedZones)
  const speedAlertLog = useMapStore((s) => s.speedAlertLog)
  const addSpeedAlert = useMapStore((s) => s.addSpeedAlert)
  const speedLimit = useMapStore((s) => s.speedLimit)
  const setSpeedLimit = useMapStore((s) => s.setSpeedLimit)
  const currentSpeed = useMapStore((s) => s.currentSpeed)
  const setCurrentSpeed = useMapStore((s) => s.setCurrentSpeed)

  const [audioEnabled, setAudioEnabled] = useState(false)
  const [addingZone, setAddingZone] = useState(false)
  const [newZoneRadius, setNewZoneRadius] = useState(500)
  const [newZoneLimit, setNewZoneLimit] = useState(50)
  const [newZoneLabel, setNewZoneLabel] = useState('')
  const [speedHistory, setSpeedHistory] = useState<SpeedHistoryPoint[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const zoneLayerIdsRef = useRef<string[]>([])
  const lastAlertTimeRef = useRef<number>(0)

  // Derive isOverLimit instead of using setState in effect
  const isOverLimit = currentSpeed > speedLimit

  // Simulated speed for demo
  useEffect(() => {
    if (!speedAlertOpen) return
    const interval = setInterval(() => {
      const store = useMapStore.getState()
      if (!store.speedAlertOpen) return
      const simulated = Math.max(0, store.currentSpeed + (Math.random() - 0.5) * 20)
      setCurrentSpeed(Math.max(0, Math.round(simulated * 10) / 10))
    }, 1000)
    return () => clearInterval(interval)
  }, [speedAlertOpen, setCurrentSpeed])

  // Track speed history (last 60 seconds)
  useEffect(() => {
    if (!speedAlertOpen) return
    const interval = setInterval(() => {
      const store = useMapStore.getState()
      const speed = store.currentSpeed
      const limit = store.speedLimit
      setSpeedHistory((prev) => {
        const now = Date.now()
        const newHistory = [...prev, { time: now, speed, limit }]
        const cutoff = now - 60000
        return newHistory.filter((p) => p.time > cutoff)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [speedAlertOpen])

  // Side effects when over speed limit (audio, alert log)
  useEffect(() => {
    if (!isOverLimit) return

    // Log alert (with debounce)
    const now = Date.now()
    if (now - lastAlertTimeRef.current > 5000) {
      lastAlertTimeRef.current = now
      addSpeedAlert({
        speed: currentSpeed,
        limit: speedLimit,
      })
    }

    // Audio alert
    if (audioEnabled) {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext()
        }
        const ctx = audioCtxRef.current
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()
        oscillator.connect(gain)
        gain.connect(ctx.destination)
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gain.gain.value = 0.3
        oscillator.start()
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
        oscillator.stop(ctx.currentTime + 0.2)
      } catch {
        // Audio not supported
      }
    }
  }, [isOverLimit, currentSpeed, speedLimit, audioEnabled, addSpeedAlert])

  // Render speed zones on map
  useEffect(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return

    for (const id of zoneLayerIdsRef.current) {
      try {
        if (map.getLayer(id)) map.removeLayer(id)
        if (map.getSource(id)) map.removeSource(id)
      } catch {
        // ignore
      }
    }
    zoneLayerIdsRef.current = []

    for (const zone of speedZones) {
      const sourceId = `speed-zone-${zone.id}`
      const layerId = `speed-zone-layer-${zone.id}`
      const color = getZoneColor(zone.speedLimit)

      try {
        if (!map.getSource(sourceId)) {
          const points = 64
          const coords: [number, number][] = []
          const R = 6371000
          const latRad = (zone.latitude * Math.PI) / 180
          const d = zone.radius / R

          for (let i = 0; i <= points; i++) {
            const angle = (2 * Math.PI * i) / points
            const lat = zone.latitude + (d * Math.cos(angle) * 180) / Math.PI
            const lng = zone.longitude + (d * Math.sin(angle) / Math.cos(latRad) * 180) / Math.PI
            coords.push([lng, lat])
          }

          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [coords],
              },
              properties: {},
            },
          })
          map.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': color,
              'fill-opacity': 0.2,
            },
          })
          const borderLayerId = `speed-zone-border-${zone.id}`
          map.addLayer({
            id: borderLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': color,
              'line-width': 2,
              'line-opacity': 0.6,
            },
          })
          zoneLayerIdsRef.current.push(sourceId, layerId, borderLayerId)
        }
      } catch {
        // ignore map style errors
      }
    }

    return () => {
      if (typeof window === 'undefined') return
      const m = (window as any).__mainMap
      if (m) {
        for (const id of zoneLayerIdsRef.current) {
          try {
            if (m.getLayer(id)) m.removeLayer(id)
            if (m.getSource(id)) m.removeSource(id)
          } catch {
            // ignore
          }
        }
      }
    }
  }, [speedZones])

  // Handle adding a speed zone by clicking on the map
  useEffect(() => {
    if (!addingZone || typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return

    const handleClick = (e: any) => {
      const { lng, lat } = e.lngLat
      const zone: SpeedZone = {
        id: `zone-${Date.now()}`,
        longitude: lng,
        latitude: lat,
        radius: newZoneRadius,
        speedLimit: newZoneLimit,
        label: newZoneLabel || `Zone ${speedZones.length + 1}`,
      }
      addSpeedZone(zone)
      setAddingZone(false)
      setNewZoneLabel('')
      map.getCanvas().style.cursor = ''
    }

    map.getCanvas().style.cursor = 'crosshair'
    map.on('click', handleClick)

    return () => {
      map.getCanvas().style.cursor = ''
      map.off('click', handleClick)
    }
  }, [addingZone, newZoneRadius, newZoneLimit, newZoneLabel, speedZones.length, addSpeedZone])

  // Flashing red border overlay when over speed limit
  useEffect(() => {
    if (typeof document === 'undefined') return
    const mapContainer = document.querySelector('.maplibregl-map')?.parentElement
    if (!mapContainer) return

    if (isOverLimit) {
      const flashInterval = setInterval(() => {
        mapContainer.classList.toggle('speed-alert-flash')
      }, 500)
      mapContainer.style.boxShadow = 'inset 0 0 30px rgba(239, 68, 68, 0.4)'

      return () => {
        clearInterval(flashInterval)
        mapContainer.classList.remove('speed-alert-flash')
        mapContainer.style.boxShadow = ''
      }
    }
    mapContainer.classList.remove('speed-alert-flash')
    mapContainer.style.boxShadow = ''
  }, [isOverLimit])

  const chartData = speedHistory.map((p) => ({
    time: formatTimestamp(p.time),
    speed: p.speed,
    limit: p.limit,
  }))

  return (
    <>
      {isOverLimit && (
        <div className="absolute inset-0 pointer-events-none z-[60] border-4 border-red-500/60 animate-pulse" />
      )}

      <Dialog open={speedAlertOpen} onOpenChange={setSpeedAlertOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4 text-amber-500" />
              Speed Alert System
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 pb-4 space-y-4">
            {/* Current speed display */}
            <div className="relative rounded-xl overflow-hidden">
              <div
                className={`p-4 text-center transition-colors duration-300 ${
                  isOverLimit ? 'bg-red-500/10' : 'bg-muted/50'
                }`}
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Current Speed
                </div>
                <div
                  className={`text-5xl font-black tabular-nums transition-colors duration-300 ${
                    isOverLimit ? 'text-red-500' : 'text-foreground'
                  }`}
                >
                  {currentSpeed.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">km/h</div>
                {isOverLimit && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-500">
                      OVER LIMIT ({speedLimit} km/h)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Speed limit control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Speed Limit
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={speedLimit}
                    onChange={(e) => {
                      const v = parseInt(e.target.value)
                      if (!isNaN(v) && v > 0) setSpeedLimit(v)
                    }}
                    className="h-7 w-20 text-xs text-right"
                  />
                  <span className="text-xs text-muted-foreground">km/h</span>
                </div>
              </div>
              <Slider
                value={[speedLimit]}
                onValueChange={([v]) => setSpeedLimit(v)}
                min={10}
                max={200}
                step={5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>10</span>
                <span>200 km/h</span>
              </div>
            </div>

            {/* Audio toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Audio Alert</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1.5 text-xs"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-amber-500" />
                    On
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                    Off
                  </>
                )}
              </Button>
            </div>

            {/* Speed history chart */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Speed History (60s)
              </label>
              <div className="h-32 w-full rounded-lg bg-muted/30 p-2">
                {chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 8 }}
                        interval="preserveStartEnd"
                        tickFormatter={(v: string) => v.slice(-5)}
                      />
                      <YAxis tick={{ fontSize: 8 }} width={30} />
                      <RechartsTooltip
                        contentStyle={{ fontSize: 10 }}
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(0)} km/h`,
                          name === 'speed' ? 'Speed' : 'Limit',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="speed"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="limit"
                        stroke="#ef4444"
                        strokeWidth={1}
                        strokeDasharray="4 2"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    Waiting for data...
                  </div>
                )}
              </div>
            </div>

            {/* Speed zones section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Speed Zones ({speedZones.length})
                </label>
                <div className="flex gap-1">
                  {speedZones.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-red-500 hover:text-red-600"
                      onClick={clearSpeedZones}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Add zone controls */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Zone label..."
                    value={newZoneLabel}
                    onChange={(e) => setNewZoneLabel(e.target.value)}
                    className="h-7 text-xs flex-1"
                  />
                  <Button
                    variant={addingZone ? 'default' : 'outline'}
                    size="sm"
                    className={`h-7 px-2 gap-1 text-xs ${
                      addingZone ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
                    }`}
                    onClick={() => setAddingZone(!addingZone)}
                  >
                    <Plus className="h-3 w-3" />
                    {addingZone ? 'Click Map...' : 'Add Zone'}
                  </Button>
                </div>
                {addingZone && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Radius:</span>
                      <Input
                        type="number"
                        value={newZoneRadius}
                        onChange={(e) => setNewZoneRadius(parseInt(e.target.value) || 500)}
                        className="h-6 w-16 text-xs text-right"
                      />
                      <span className="text-muted-foreground">m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Limit:</span>
                      <Input
                        type="number"
                        value={newZoneLimit}
                        onChange={(e) => setNewZoneLimit(parseInt(e.target.value) || 50)}
                        className="h-6 w-16 text-xs text-right"
                      />
                      <span className="text-muted-foreground">km/h</span>
                    </div>
                  </div>
                )}
                {addingZone && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    Click on the map to place the speed zone center point
                  </p>
                )}
              </div>

              {/* Zone list */}
              {speedZones.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {speedZones.map((zone) => (
                    <div
                      key={zone.id}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs ${getZoneColorClass(zone.speedLimit)}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getZoneColor(zone.speedLimit) }}
                        />
                        <span className="font-medium truncate">{zone.label}</span>
                        <span className="text-[10px] opacity-70">
                          {zone.radius}m / {zone.speedLimit} km/h
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0 text-red-500 hover:text-red-600"
                        onClick={() => removeSpeedZone(zone.id)}
                        aria-label={`Remove zone ${zone.label}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alert log */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Recent Alerts ({speedAlertLog.length})
              </label>
              {speedAlertLog.length > 0 ? (
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {speedAlertLog.slice(0, 10).map((entry, idx) => (
                    <div
                      key={`${entry.timestamp}-${idx}`}
                      className="flex items-center gap-2 rounded-lg bg-red-500/5 border border-red-500/10 px-2.5 py-1.5 text-xs"
                    >
                      <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                      <span className="text-muted-foreground tabular-nums">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {entry.speed.toFixed(0)} km/h
                      </span>
                      <span className="text-muted-foreground">/ {entry.limit} km/h</span>
                      {entry.zoneName && (
                        <Badge variant="secondary" className="text-[9px] h-4 ml-auto">
                          {entry.zoneName}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No speed violations recorded yet
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
