'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useMapStore, MAP_STYLES } from '@/lib/map-store'
import {
  Columns2,
  Rows2,
  Lock,
  Unlock,
  RotateCcw,
  ArrowLeftRight,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export function MapComparisonSlider() {
  const { comparisonSlider, setComparisonSlider, currentStyle } = useMapStore()
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftImage, setLeftImage] = useState<string | null>(null)
  const [rightImage, setRightImage] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)

  // Take screenshots of current map for comparison
  const captureScreenshots = useCallback(async () => {
    if (typeof window === 'undefined') return
    setCapturing(true)

    try {
      const mapEl = document.querySelector('.maplibregl-map canvas') as HTMLCanvasElement | null
      if (!mapEl) {
        setCapturing(false)
        return
      }

      // Capture current style as left image
      const leftDataUrl = mapEl.toDataURL('image/png')
      setLeftImage(leftDataUrl)
      setComparisonSlider({ leftTimestamp: Date.now() })

      // For right image, we just use the same map with a note about switching styles
      // In production, you'd switch the style, wait for render, and capture again
      const rightDataUrl = mapEl.toDataURL('image/png')
      setRightImage(rightDataUrl)
      setComparisonSlider({ rightTimestamp: Date.now() })
    } catch {
      // Canvas might be tainted, fall back to no-image mode
    }

    setCapturing(false)
  }, [setComparisonSlider])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    let pos: number

    if (comparisonSlider.orientation === 'horizontal') {
      pos = ((e.clientX - rect.left) / rect.width) * 100
    } else {
      pos = ((e.clientY - rect.top) / rect.height) * 100
    }

    pos = Math.max(0, Math.min(100, pos))
    setComparisonSlider({ position: pos })
  }, [isDragging, comparisonSlider.orientation, setComparisonSlider])

  const handlePointerDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging && typeof window !== 'undefined') {
      const onUp = () => setIsDragging(false)
      window.addEventListener('pointerup', onUp)
      return () => window.removeEventListener('pointerup', onUp)
    }
  }, [isDragging])

  if (!comparisonSlider.enabled) return null

  const leftStyle = MAP_STYLES.find(s => s.id === comparisonSlider.leftStyle) || MAP_STYLES[0]
  const rightStyle = MAP_STYLES.find(s => s.id === comparisonSlider.rightStyle) || MAP_STYLES[1]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] pointer-events-none"
      >
        {/* Comparison viewport */}
        <div
          ref={containerRef}
          className="absolute inset-0 pointer-events-auto select-none"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {/* Left side */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: comparisonSlider.orientation === 'horizontal'
                ? `inset(0 ${100 - comparisonSlider.position}% 0 0)`
                : `inset(0 0 ${100 - comparisonSlider.position}% 0)`,
            }}
          >
            {leftImage ? (
              <img src={leftImage} alt="Left style" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 flex items-center justify-center">
                <div className="text-center p-4">
                  <Camera className="size-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Current: {leftStyle.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right side */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: comparisonSlider.orientation === 'horizontal'
                ? `inset(0 0 0 ${comparisonSlider.position}%)`
                : `inset(${comparisonSlider.position}% 0 0 0)`,
            }}
          >
            {rightImage ? (
              <img src={rightImage} alt="Right style" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 flex items-center justify-center">
                <div className="text-center p-4">
                  <Camera className="size-8 mx-auto mb-2 text-teal-500" />
                  <p className="text-sm text-teal-700 dark:text-teal-300">Compare: {rightStyle.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Slider handle */}
          <div
            className="absolute z-10"
            style={
              comparisonSlider.orientation === 'horizontal'
                ? { left: `${comparisonSlider.position}%`, top: 0, bottom: 0, transform: 'translateX(-50%)' }
                : { top: `${comparisonSlider.position}%`, left: 0, right: 0, transform: 'translateY(-50%)' }
            }
          >
            {comparisonSlider.orientation === 'horizontal' ? (
              <div className="w-1 h-full bg-emerald-500 shadow-lg cursor-col-resize relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border-2 border-emerald-500">
                  <ArrowLeftRight className="size-4 text-emerald-600" />
                </div>
              </div>
            ) : (
              <div className="h-1 w-full bg-emerald-500 shadow-lg cursor-row-resize relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border-2 border-emerald-500">
                  <ChevronLeft className="size-4 text-emerald-600 rotate-90" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating control panel */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 dark:text-emerald-400">
                    Left: {leftStyle.name}
                  </Badge>

                  <Select
                    value={comparisonSlider.leftStyle}
                    onValueChange={(v) => setComparisonSlider({ leftStyle: v })}
                  >
                    <SelectTrigger className="w-[110px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAP_STYLES.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Separator orientation="vertical" className="h-5" />

                  <Select
                    value={comparisonSlider.rightStyle}
                    onValueChange={(v) => setComparisonSlider({ rightStyle: v })}
                  >
                    <SelectTrigger className="w-[110px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAP_STYLES.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Badge variant="outline" className="text-xs border-teal-300 text-teal-700 dark:text-teal-400">
                    Right: {rightStyle.name}
                  </Badge>

                  <Separator orientation="vertical" className="h-5" />

                  <Button
                    variant="ghost" size="icon" className="size-7"
                    onClick={() => setComparisonSlider({
                      orientation: comparisonSlider.orientation === 'horizontal' ? 'vertical' : 'horizontal',
                    })}
                    title="Toggle orientation"
                  >
                    {comparisonSlider.orientation === 'horizontal'
                      ? <Columns2 className="size-4" />
                      : <Rows2 className="size-4" />}
                  </Button>

                  <Button
                    variant="ghost" size="icon" className="size-7"
                    onClick={() => setComparisonSlider({
                      leftStyle: comparisonSlider.rightStyle,
                      rightStyle: comparisonSlider.leftStyle,
                    })}
                    title="Swap sides"
                  >
                    <ArrowLeftRight className="size-4" />
                  </Button>

                  <Button
                    variant="ghost" size="icon" className="size-7"
                    onClick={() => setComparisonSlider({ position: 50 })}
                    title="Reset position"
                  >
                    <RotateCcw className="size-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    <Lock className="size-3 text-muted-foreground" />
                    <Switch
                      checked={comparisonSlider.lockedZoom}
                      onCheckedChange={(v) => setComparisonSlider({ lockedZoom: v })}
                      className="scale-75"
                    />
                  </div>

                  <Button
                    variant="ghost" size="icon" className="size-7"
                    onClick={captureScreenshots}
                    disabled={capturing}
                    title="Capture screenshots"
                  >
                    <Camera className="size-4" />
                  </Button>

                  <Button
                    variant="ghost" size="icon" className="size-7 text-red-500 hover:text-red-600"
                    onClick={() => setComparisonSlider({ enabled: false })}
                    title="Close comparison"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="mt-2 px-1">
                  <Slider
                    value={[comparisonSlider.position]}
                    onValueChange={([v]) => setComparisonSlider({ position: v })}
                    min={0} max={100} step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Side labels */}
        <div
          className="absolute top-16 pointer-events-none z-10 text-xs font-semibold text-white drop-shadow-lg"
          style={{
            left: comparisonSlider.orientation === 'horizontal' ? `${comparisonSlider.position / 2}%` : '2%',
            top: comparisonSlider.orientation === 'horizontal' ? undefined : `${comparisonSlider.position / 2}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {leftStyle.name}
        </div>
        <div
          className="absolute top-16 pointer-events-none z-10 text-xs font-semibold text-white drop-shadow-lg"
          style={{
            left: comparisonSlider.orientation === 'horizontal'
              ? `${comparisonSlider.position + (100 - comparisonSlider.position) / 2}%`
              : '2%',
            top: comparisonSlider.orientation === 'horizontal'
              ? undefined
              : `${comparisonSlider.position + (100 - comparisonSlider.position) / 2}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {rightStyle.name}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
