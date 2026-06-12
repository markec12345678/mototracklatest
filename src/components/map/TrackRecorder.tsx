'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Square, Timer, Gauge, Route, Mountain, Save, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMapStore, type TrackPoint } from '@/lib/map-store'
import { toast } from 'sonner'

export function TrackRecorder() {
  const isRecording = useMapStore((s) => s.isRecording)
  const currentTrack = useMapStore((s) => s.currentTrack)
  const recordingStats = useMapStore((s) => s.recordingStats)
  const startRecording = useMapStore((s) => s.startRecording)
  const stopRecording = useMapStore((s) => s.stopRecording)
  const addTrackPoint = useMapStore((s) => s.addTrackPoint)
  const clearCurrentTrack = useMapStore((s) => s.clearCurrentTrack)
  const saveCurrentTrack = useMapStore((s) => s.saveCurrentTrack)

  const [showSummary, setShowSummary] = useState(false)
  const [trackName, setTrackName] = useState('')
  const [expanded, setExpanded] = useState(true)
  const [elapsedTime, setElapsedTime] = useState('00:00')
  const watchIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Draw track on map
  useEffect(() => {
    if (typeof window === 'undefined') return
    const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
    if (!map) return

    const updateTrackLayer = () => {
      if (!map) return
      const sourceId = 'current-track-source'
      const lineLayerId = 'current-track-line'
      const borderLayerId = 'current-track-border'

      if (currentTrack.length < 2) {
        // Remove layers if not enough points
        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
        if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
        return
      }

      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: currentTrack.map((p) => [p.longitude, p.latitude]),
        },
      }

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson)
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson,
        })
        // Add white border first (underneath)
        map.addLayer({
          id: borderLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ffffff',
            'line-width': 6,
            'line-opacity': 0.8,
          },
        })
        // Add red line on top
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ef4444',
            'line-width': 3,
            'line-opacity': 1,
          },
        })
      }
    }

    updateTrackLayer()
  }, [currentTrack])

  // Update elapsed time
  useEffect(() => {
    if (!isRecording) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    startTimeRef.current = Date.now() - (recordingStats.duration * 1000)
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const mins = Math.floor(elapsed / 60)
      const secs = elapsed % 60
      setElapsedTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording, recordingStats.duration])

  // Cleanup track layers on unmount
  useEffect(() => {
    return () => {
      if (typeof window === 'undefined') return
      const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
      if (!map) return
      try {
        if (map.getLayer('current-track-line')) map.removeLayer('current-track-line')
        if (map.getLayer('current-track-border')) map.removeLayer('current-track-border')
        if (map.getSource('current-track-source')) map.removeSource('current-track-source')
      } catch { /* ignore */ }
    }
  }, [])

  const handleStart = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    startRecording()
    setShowSummary(false)
    setElapsedTime('00:00')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: TrackPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          elevation: position.coords.altitude,
          timestamp: position.timestamp,
          speed: position.coords.speed,
          accuracy: position.coords.accuracy,
        }
        addTrackPoint(point)
      },
      (error) => {
        toast.error(`GPS Error: ${error.message}`)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    )
  }, [startRecording, addTrackPoint])

  const handleStop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    stopRecording()

    if (currentTrack.length >= 2) {
      setShowSummary(true)
    } else {
      toast.info('Track too short to save')
      clearCurrentTrack()
      // Clean up map layers
      const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
      if (map) {
        try {
          if (map.getLayer('current-track-line')) map.removeLayer('current-track-line')
          if (map.getLayer('current-track-border')) map.removeLayer('current-track-border')
          if (map.getSource('current-track-source')) map.removeSource('current-track-source')
        } catch { /* ignore */ }
      }
    }
  }, [stopRecording, currentTrack.length, clearCurrentTrack])

  const handleSave = useCallback(() => {
    const name = trackName.trim() || `Track ${new Date().toLocaleDateString()}`
    saveCurrentTrack(name)
    setShowSummary(false)
    setTrackName('')
    toast.success(`Track "${name}" saved!`)

    // Clean up map layers
    const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
    if (map) {
      try {
        if (map.getLayer('current-track-line')) map.removeLayer('current-track-line')
        if (map.getLayer('current-track-border')) map.removeLayer('current-track-border')
        if (map.getSource('current-track-source')) map.removeSource('current-track-source')
      } catch { /* ignore */ }
    }
  }, [trackName, saveCurrentTrack])

  const handleDiscard = useCallback(() => {
    clearCurrentTrack()
    setShowSummary(false)
    setTrackName('')

    // Clean up map layers
    const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
    if (map) {
      try {
        if (map.getLayer('current-track-line')) map.removeLayer('current-track-line')
        if (map.getLayer('current-track-border')) map.removeLayer('current-track-border')
        if (map.getSource('current-track-source')) map.removeSource('current-track-source')
      } catch { /* ignore */ }
    }
  }, [clearCurrentTrack])

  const formatDist = (km: number) => km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`
  const formatSpeed = (speedKmh: number | null) => speedKmh !== null ? `${speedKmh.toFixed(1)}` : '--'

  // Summary panel after stopping
  if (showSummary) {
    return (
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 w-[340px] max-w-[90vw]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-background/90 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="px-4 py-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-border/40">
            <h3 className="text-sm font-semibold">Track Summary</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-red-500 shrink-0" />
              <div>
                <div className="text-[10px] text-muted-foreground">Distance</div>
                <div className="text-sm font-semibold tabular-nums">{formatDist(recordingStats.distance)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-cyan-500 shrink-0" />
              <div>
                <div className="text-[10px] text-muted-foreground">Duration</div>
                <div className="text-sm font-semibold tabular-nums">{elapsedTime}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <div className="text-[10px] text-muted-foreground">Avg Speed</div>
                <div className="text-sm font-semibold tabular-nums">{formatSpeed(recordingStats.avgSpeed)} km/h</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-emerald-500 shrink-0" />
              <div>
                <div className="text-[10px] text-muted-foreground">Elev. Gain</div>
                <div className="text-sm font-semibold tabular-nums">+{Math.round(recordingStats.elevationGain)}m</div>
              </div>
            </div>
          </div>
          <div className="px-4 pb-3">
            <Input
              placeholder="Track name (optional)"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              className="h-9 text-sm mb-2"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-9 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                onClick={handleSave}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save Track
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleDiscard}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Discard
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Recording panel
  if (isRecording) {
    return (
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 w-[320px] max-w-[90vw]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-background/90 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="absolute inset-0 h-3 w-3 rounded-full bg-red-500 animate-ping opacity-75" />
              </div>
              <span className="text-xs font-medium text-red-500">Recording</span>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 pb-2 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Time</div>
                    <div className="text-sm font-semibold tabular-nums">{elapsedTime}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Distance</div>
                    <div className="text-sm font-semibold tabular-nums">{formatDist(recordingStats.distance)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Speed</div>
                    <div className="text-sm font-semibold tabular-nums">{formatSpeed(recordingStats.currentSpeed !== null ? recordingStats.currentSpeed * 3.6 : null)} km/h</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="px-4 pb-3 flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-9 text-xs bg-red-500 hover:bg-red-600 text-white border-0"
              onClick={handleStop}
            >
              <Square className="h-3.5 w-3.5 mr-1" />
              Stop
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Not recording - show record button
  return null
}

// Standalone button to toggle recording
export function TrackRecordButton({ onClick }: { onClick: () => void }) {
  const isRecording = useMapStore((s) => s.isRecording)

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-11 w-11 rounded-xl transition-all duration-200 relative ${
        isRecording
          ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
          : 'hover:bg-accent'
      }`}
      onClick={onClick}
      aria-label={isRecording ? 'Stop recording' : 'Start GPS recording'}
    >
      <Circle className={`h-4 w-4 ${isRecording ? 'fill-white' : ''}`} />
      {isRecording && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white animate-pulse" />
      )}
    </Button>
  )
}
