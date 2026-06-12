'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Activity, Play, Pause, RotateCcw, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMapStore } from '@/lib/map-store'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function PedometerWidget() {
  const pedometer = useMapStore((s) => s.pedometer)
  const setPedometer = useMapStore((s) => s.setPedometer)
  const pedometerVisible = useMapStore((s) => s.pedometerVisible)
  const setPedometerVisible = useMapStore((s) => s.setPedometerVisible)

  const [currentSpeed, setCurrentSpeed] = useState(0)
  const lastMoveTimeRef = useRef<number>(0)
  const lastDistanceRef = useRef<number>(0)
  const prevPositionRef = useRef<[number, number] | null>(null)

  // Tick to force re-render so elapsed time updates
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!pedometer.isTracking || !pedometer.startTime) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [pedometer.isTracking, pedometer.startTime])

  const elapsed = pedometer.isTracking && pedometer.startTime ? Date.now() - pedometer.startTime : 0

  // Track map movement when tracking is active
  useEffect(() => {
    if (!pedometer.isTracking) {
      prevPositionRef.current = null
      return
    }
    if (typeof window === 'undefined') return

    const interval = setInterval(() => {
      const map = (window as any).__mainMap
      if (!map) return
      const center = map.getCenter()
      const pos: [number, number] = [center.lng, center.lat]

      if (prevPositionRef.current) {
        const dist = haversineDistance(
          prevPositionRef.current[1], prevPositionRef.current[0],
          pos[1], pos[0]
        )
        // Only count if moved more than 1 meter to avoid jitter
        if (dist > 1) {
          const now = Date.now()
          const timeDiff = (now - lastMoveTimeRef.current) / 1000 // seconds
          if (timeDiff > 0) {
            const speed = (dist / timeDiff) * 3.6 // km/h
            setCurrentSpeed(speed)
          }
          lastMoveTimeRef.current = now
          lastDistanceRef.current = dist

          const newDistance = pedometer.distance + dist
          const newSteps = Math.round(newDistance / 0.75)
          setPedometer({
            distance: newDistance,
            steps: newSteps,
            lastPosition: pos,
          })
        }
      } else {
        setPedometer({ lastPosition: pos })
      }
      prevPositionRef.current = pos
    }, 1000)

    return () => clearInterval(interval)
  }, [pedometer.isTracking, pedometer.distance, setPedometer])

  // Speed decay
  useEffect(() => {
    if (!pedometer.isTracking) return
    const decay = setInterval(() => {
      setCurrentSpeed((prev) => {
        if (prev <= 0.1) return 0
        return prev * 0.9
      })
    }, 2000)
    return () => clearInterval(decay)
  }, [pedometer.isTracking])

  // Reset speed when tracking stops
  const prevTrackingRef = useRef(pedometer.isTracking)
  if (prevTrackingRef.current !== pedometer.isTracking && !pedometer.isTracking) {
    setCurrentSpeed(0)
  }
  prevTrackingRef.current = pedometer.isTracking

  const handleStart = useCallback(() => {
    setPedometer({
      isTracking: true,
      startTime: pedometer.startTime || Date.now(),
      lastPosition: null,
    })
    prevPositionRef.current = null
    lastMoveTimeRef.current = Date.now()
  }, [pedometer.startTime, setPedometer])

  const handlePause = useCallback(() => {
    setPedometer({ isTracking: false })
    setCurrentSpeed(0)
  }, [setPedometer])

  const handleReset = useCallback(() => {
    // Save to history before reset
    if (pedometer.steps > 0 || pedometer.distance > 0) {
      const today = new Date().toISOString().split('T')[0]
      const existing = pedometer.history.find((h) => h.date === today)
      let newHistory
      if (existing) {
        newHistory = pedometer.history.map((h) =>
          h.date === today
            ? { ...h, steps: h.steps + pedometer.steps, distance: h.distance + pedometer.distance }
            : h
        )
      } else {
        newHistory = [
          ...pedometer.history.slice(-6),
          { date: today, steps: pedometer.steps, distance: pedometer.distance },
        ]
      }
      setPedometer({
        isTracking: false,
        steps: 0,
        distance: 0,
        startTime: null,
        lastPosition: null,
        history: newHistory,
      })
    } else {
      setPedometer({
        isTracking: false,
        steps: 0,
        distance: 0,
        startTime: null,
        lastPosition: null,
      })
    }
    setCurrentSpeed(0)
    prevPositionRef.current = null
  }, [pedometer, setPedometer])

  const caloriesBurned = pedometer.distance * 0.0001 * 70 * (currentSpeed > 5 ? 1.2 : 1)
  const stepProgress = Math.min((pedometer.steps / pedometer.dailyGoal) * 100, 100)
  const distKm = pedometer.distance / 1000

  // History chart data - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  const historyChartData = last7Days.map((date) => {
    const found = pedometer.history.find((h) => h.date === date)
    return { date: date.slice(5), steps: found?.steps || 0 }
  })
  const maxHistorySteps = Math.max(...historyChartData.map((d) => d.steps), 1)
  const bestDay = pedometer.history.length > 0
    ? pedometer.history.reduce((best, h) => (h.steps > best.steps ? h : best), pedometer.history[0])
    : null
  const avgSteps = pedometer.history.length > 0
    ? Math.round(pedometer.history.reduce((sum, h) => sum + h.steps, 0) / pedometer.history.length)
    : 0

  // SVG circle progress
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const progressOffset = circumference - (stepProgress / 100) * circumference

  if (!pededometerVisible) return null

  return (
    <div className="hidden md:block absolute bottom-12 left-5 z-10">
      <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-3 w-[200px] space-y-2">
        {/* Header with progress ring */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
              <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
              <circle
                cx="36" cy="36" r={radius} fill="none"
                stroke="currentColor" strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold tabular-nums leading-none">{pedometer.steps.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">steps</div>
            <div className="text-xs font-medium text-muted-foreground mt-1">
              {distKm < 1 ? `${Math.round(pedometer.distance)}m` : `${distKm.toFixed(2)}km`}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="bg-muted/30 rounded-lg px-1 py-1">
            <div className="text-[10px] font-semibold tabular-nums">{currentSpeed.toFixed(1)}</div>
            <div className="text-[8px] text-muted-foreground">km/h</div>
          </div>
          <div className="bg-muted/30 rounded-lg px-1 py-1">
            <div className="text-[10px] font-semibold tabular-nums">{caloriesBurned.toFixed(1)}</div>
            <div className="text-[8px] text-muted-foreground">kcal</div>
          </div>
          <div className="bg-muted/30 rounded-lg px-1 py-1">
            <div className="text-[10px] font-semibold tabular-nums">
              {pedometer.isTracking ? formatDuration(elapsed) : '0:00'}
            </div>
            <div className="text-[8px] text-muted-foreground">time</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg"
            onClick={pedometer.isTracking ? handlePause : handleStart}
            aria-label={pedometer.isTracking ? 'Pause' : 'Start'}
          >
            {pedometer.isTracking ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg"
            onClick={handleReset}
            aria-label="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg"
            onClick={() => {
              const newGoal = prompt('Set daily step goal:', String(pedometer.dailyGoal))
              if (newGoal && !isNaN(Number(newGoal))) {
                setPedometer({ dailyGoal: Number(newGoal) })
              }
            }}
            aria-label="Set goal"
          >
            <Target className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Goal progress bar */}
        <div className="space-y-0.5">
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>Daily goal</span>
            <span>{Math.round(stepProgress)}%</span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        </div>

        {/* 7-day history mini bar chart */}
        <div className="space-y-1">
          <div className="text-[9px] text-muted-foreground font-medium">Last 7 days</div>
          <div className="flex items-end gap-0.5 h-8">
            {historyChartData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full bg-emerald-400/60 rounded-sm transition-all duration-200"
                  style={{ height: `${Math.max((d.steps / maxHistorySteps) * 24, 1)}px` }}
                />
                <span className="text-[7px] text-muted-foreground/60">{d.date}</span>
              </div>
            ))}
          </div>
          {bestDay && (
            <div className="flex justify-between text-[8px] text-muted-foreground">
              <span>Best: {bestDay.steps.toLocaleString()}</span>
              <span>Avg: {avgSteps.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
