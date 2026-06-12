'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import maplibregl from 'maplibre-gl'
import { useMapStore, getStyleUrl, MAP_STYLES, type MapStyleOption } from '@/lib/map-store'
import { GripVertical, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MapComparison() {
  const comparisonEnabled = useMapStore((s) => s.comparisonEnabled)
  const comparisonStyle = useMapStore((s) => s.comparisonStyle)
  const currentStyle = useMapStore((s) => s.currentStyle)
  const setComparisonEnabled = useMapStore((s) => s.setComparisonEnabled)
  const setComparisonStyle = useMapStore((s) => s.setComparisonStyle)

  const comparisonContainerRef = useRef<HTMLDivElement>(null)
  const comparisonMapRef = useRef<maplibregl.Map | null>(null)
  const [swipePosition, setSwipePosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [showStylePicker, setShowStylePicker] = useState(false)
  const syncRafRef = useRef<number | null>(null)
  const dividerRef = useRef<HTMLDivElement>(null)

  // Create and manage comparison map
  useEffect(() => {
    if (!comparisonEnabled || !comparisonContainerRef.current) return

    // Get the main map from the window reference
    const mainMap = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
    if (!mainMap) return

    // Create comparison map
    const compMap = new maplibregl.Map({
      container: comparisonContainerRef.current,
      style: getStyleUrl(comparisonStyle),
      center: mainMap.getCenter(),
      zoom: mainMap.getZoom(),
      bearing: mainMap.getBearing(),
      pitch: mainMap.getPitch(),
      interactive: false,
      attributionControl: false,
      preserveDrawingBuffer: true,
    })

    comparisonMapRef.current = compMap

    // Sync main map movements to comparison map
    const syncMap = () => {
      if (comparisonMapRef.current && mainMap) {
        try {
          comparisonMapRef.current.jumpTo({
            center: mainMap.getCenter(),
            zoom: mainMap.getZoom(),
            bearing: mainMap.getBearing(),
            pitch: mainMap.getPitch(),
          })
        } catch {
          // Map might be in an invalid state during transitions
        }
      }
    }

    const onMove = () => {
      if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current)
      syncRafRef.current = requestAnimationFrame(syncMap)
    }

    mainMap.on('move', onMove)
    mainMap.on('zoom', onMove)
    mainMap.on('rotate', onMove)
    mainMap.on('pitch', onMove)

    // Initial sync
    compMap.on('load', () => {
      syncMap()
    })

    // Error handling
    compMap.on('error', () => {
      const style = useMapStore.getState().comparisonStyle
      if (style.fallbackUrl) {
        try {
          const currentStyleUrl = compMap.getStyle()?.name
          if (currentStyleUrl !== style.fallbackUrl) {
            compMap.setStyle(style.fallbackUrl)
          }
        } catch { /* ignore */ }
      }
    })

    return () => {
      mainMap.off('move', onMove)
      mainMap.off('zoom', onMove)
      mainMap.off('rotate', onMove)
      mainMap.off('pitch', onMove)
      if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current)
      comparisonMapRef.current?.remove()
      comparisonMapRef.current = null
    }
  }, [comparisonEnabled])

  // Update comparison map style when it changes
  useEffect(() => {
    if (!comparisonMapRef.current || !comparisonEnabled) return
    try {
      comparisonMapRef.current.setStyle(getStyleUrl(comparisonStyle))
    } catch {
      // Ignore errors during style transition
    }
  }, [comparisonStyle, comparisonEnabled])

  // Handle drag for swipe divider
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)

    const getClientX = (ev: MouseEvent | TouchEvent) => {
      if ('touches' in ev) return ev.touches[0].clientX
      return ev.clientX
    }

    const container = comparisonContainerRef.current?.parentElement
    if (!container) return

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect()
      const x = getClientX(ev) - rect.left
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSwipePosition(percent)
    }

    const onEnd = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }, [])

  // Close comparison mode
  const handleClose = useCallback(() => {
    setComparisonEnabled(false)
    setShowStylePicker(false)
  }, [setComparisonEnabled])

  // Available styles for comparison (exclude current style)
  const availableStyles = MAP_STYLES.filter((s) => s.id !== currentStyle.id)

  if (!comparisonEnabled) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-[5] pointer-events-none"
      >
        {/* Comparison map container with clip-path */}
        <div
          ref={comparisonContainerRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            clipPath: `inset(0 0 0 ${swipePosition}%)`,
          }}
        />

        {/* Swipe divider line */}
        <div
          ref={dividerRef}
          className="absolute top-0 bottom-0 pointer-events-auto"
          style={{
            left: `${swipePosition}%`,
            transform: 'translateX(-50%)',
            width: 3,
            background: 'white',
            boxShadow: '0 0 6px rgba(0,0,0,0.4), 0 0 2px rgba(0,0,0,0.3)',
            cursor: 'ew-resize',
            zIndex: 10,
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* Divider handle grip */}
          <div
            className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full shadow-xl border-2 border-white transition-transform',
              isDragging ? 'scale-110' : 'scale-100 hover:scale-105'
            )}
            style={{
              width: 44,
              height: 44,
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              cursor: 'ew-resize',
            }}
          >
            <div className="flex items-center gap-0.5 text-gray-600">
              <ChevronLeft className="h-3 w-3" />
              <GripVertical className="h-4 w-4" />
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Left side label (current style) */}
        <div
          className="absolute top-4 pointer-events-none"
          style={{ left: `${Math.max(2, swipePosition / 2 - 40)}%`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg border border-border/50">
            <p className="text-[10px] font-semibold text-foreground whitespace-nowrap">
              {currentStyle.name}
            </p>
          </div>
        </div>

        {/* Right side label (comparison style) */}
        <div
          className="absolute top-4 pointer-events-none"
          style={{ left: `${Math.min(98, swipePosition + (100 - swipePosition) / 2)}%`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg border border-border/50">
            <p className="text-[10px] font-semibold text-foreground whitespace-nowrap">
              {comparisonStyle.name}
            </p>
          </div>
        </div>

        {/* Comparison control panel */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-background/95 backdrop-blur-xl rounded-xl shadow-xl border border-border/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="text-sm">🔄</span>
                Compare Styles
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setShowStylePicker(!showStylePicker)}
                >
                  Change
                </Button>
                <button
                  onClick={handleClose}
                  className="h-5 w-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Close comparison"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Style picker */}
            <AnimatePresence>
              {showStylePicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-2 grid grid-cols-4 gap-1 max-h-[200px] overflow-y-auto">
                    {availableStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setComparisonStyle(style)
                          setShowStylePicker(false)
                        }}
                        className={cn(
                          'flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all text-center',
                          comparisonStyle.id === style.id
                            ? 'border-primary/50 bg-primary/10 scale-[1.02]'
                            : 'border-transparent hover:bg-accent hover:border-border/50'
                        )}
                      >
                        <span className="text-sm">{style.preview.emoji}</span>
                        <span className="text-[8px] font-medium text-foreground leading-tight truncate w-full">
                          {style.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current comparison info */}
            <div className="px-3 py-1.5 flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground truncate">
                {currentStyle.name} ↔ {comparisonStyle.name}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Instruction hint - fades out */}
        <ComparisonHint />
      </motion.div>
    </AnimatePresence>
  )
}

/** A brief instruction hint that fades out after a few seconds */
function ComparisonHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none"
    >
      <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-border/50">
        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
          Drag the divider to compare map styles
        </p>
      </div>
    </motion.div>
  )
}

/** Helper function to programmatically enable comparison with a specific style */
export function enableComparison(style: MapStyleOption) {
  const store = useMapStore.getState()
  store.setComparisonStyle(style)
  store.setComparisonEnabled(true)
  store.pushNotification({
    type: 'style',
    icon: 'compare',
    message: `Comparing ${store.currentStyle.name} vs ${style.name}`,
  })
}
