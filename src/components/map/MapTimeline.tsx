'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, Play, Pause, SkipBack, SkipForward, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'

export function MapTimeline() {
  const mapHistory = useMapStore((s) => s.mapHistory)
  const timelineOpen = useMapStore((s) => s.timelineOpen)
  const setTimelineOpen = useMapStore((s) => s.setTimelineOpen)
  const goToHistory = useMapStore((s) => s.goToHistory)
  const clearHistory = useMapStore((s) => s.clearHistory)
  const addToHistory = useMapStore((s) => s.addToHistory)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoTrackRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-track map position every 30 seconds
  useEffect(() => {
    if (!timelineOpen) return

    // Add initial position
    addToHistory()

    autoTrackRef.current = setInterval(() => {
      addToHistory()
    }, 30000)

    return () => {
      if (autoTrackRef.current) clearInterval(autoTrackRef.current)
    }
  }, [timelineOpen, addToHistory])

  // Play through timeline
  useEffect(() => {
    if (isPlaying && mapHistory.length > 0) {
      playTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1
          if (next >= mapHistory.length) {
            setIsPlaying(false)
            return prev
          }
          goToHistory(next)
          return next
        })
      }, 1500)
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
  }, [isPlaying, mapHistory.length, goToHistory])

  const handlePlay = useCallback(() => {
    if (mapHistory.length === 0) return
    if (currentIndex < 0) setCurrentIndex(0)
    setIsPlaying(!isPlaying)
  }, [isPlaying, mapHistory.length, currentIndex])

  const handleStepBack = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      goToHistory(newIndex)
    }
  }, [currentIndex, goToHistory])

  const handleStepForward = useCallback(() => {
    if (currentIndex < mapHistory.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      goToHistory(newIndex)
    }
  }, [currentIndex, mapHistory.length, goToHistory])

  const handleTimelineClick = useCallback((index: number) => {
    setCurrentIndex(index)
    goToHistory(index)
  }, [goToHistory])

  const handleClose = useCallback(() => {
    setIsPlaying(false)
    setTimelineOpen(false)
  }, [setTimelineOpen])

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  if (!timelineOpen) return null

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
      <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold">Map Timeline</span>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {mapHistory.length} points
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearHistory}
              title="Clear history"
              aria-label="Clear timeline history"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleClose}
              title="Close timeline"
              aria-label="Close timeline"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Timeline content */}
        <div className="px-4 py-3">
          {mapHistory.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Clock className="h-6 w-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No history yet. Navigate the map to build timeline.</p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={handleStepBack}
                  disabled={currentIndex <= 0}
                  aria-label="Previous position"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-9 w-9 rounded-lg',
                    isPlaying && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                  )}
                  onClick={handlePlay}
                  disabled={mapHistory.length === 0}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={handleStepForward}
                  disabled={currentIndex >= mapHistory.length - 1}
                  aria-label="Next position"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </Button>
                {currentIndex >= 0 && currentIndex < mapHistory.length && (
                  <Badge variant="outline" className="text-[10px] font-mono ml-2">
                    {formatTime(mapHistory[currentIndex].timestamp)}
                  </Badge>
                )}
              </div>

              {/* Timeline track */}
              <div className="relative h-12 overflow-x-auto">
                <div className="flex items-center gap-0.5 min-w-full relative h-full">
                  {mapHistory.map((entry, i) => (
                    <button
                      key={i}
                      onClick={() => handleTimelineClick(i)}
                      className={cn(
                        'relative flex-1 min-w-[6px] h-8 rounded-sm transition-all duration-150 group cursor-pointer',
                        i === currentIndex
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/30 min-w-[10px] h-10'
                          : i < currentIndex
                            ? 'bg-emerald-500/40 hover:bg-emerald-500/60'
                            : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
                      )}
                      title={`${formatTime(entry.timestamp)} · zoom ${entry.zoom.toFixed(1)}`}
                      aria-label={`Timeline point ${i + 1}: ${formatTime(entry.timestamp)}`}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                        <div className="bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                          {formatTime(entry.timestamp)} z{entry.zoom.toFixed(0)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time labels */}
              {mapHistory.length > 1 && (
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground/60 font-mono">
                    {formatTime(mapHistory[0].timestamp)}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60 font-mono">
                    {formatTime(mapHistory[mapHistory.length - 1].timestamp)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
