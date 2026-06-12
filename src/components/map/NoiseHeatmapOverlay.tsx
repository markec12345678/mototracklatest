'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore } from '@/lib/map-store'
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  X,
  Activity,
  MapPin,
  Info,
  Palette,
} from 'lucide-react'

const TRAFFIC_COLORS: Array<{ db: number; color: string; label: string }> = [
  { db: 30, color: '#22c55e', label: '< 30 dB' },
  { db: 40, color: '#84cc16', label: '30-40 dB' },
  { db: 50, color: '#eab308', label: '40-50 dB' },
  { db: 60, color: '#f97316', label: '50-60 dB' },
  { db: 70, color: '#ef4444', label: '60-70 dB' },
  { db: 80, color: '#dc2626', label: '70-80 dB' },
  { db: 90, color: '#991b1b', label: '80-90 dB' },
  { db: 100, color: '#7f1d1d', label: '> 90 dB' },
]

const INDUSTRIAL_COLORS: Array<{ db: number; color: string; label: string }> = [
  { db: 30, color: '#6b7280', label: '< 30 dB' },
  { db: 40, color: '#78716c', label: '30-40 dB' },
  { db: 50, color: '#a16207', label: '40-50 dB' },
  { db: 60, color: '#b45309', label: '50-60 dB' },
  { db: 70, color: '#c2410c', label: '60-70 dB' },
  { db: 80, color: '#b91c1c', label: '70-80 dB' },
  { db: 90, color: '#9f1239', label: '80-90 dB' },
  { db: 100, color: '#831843', label: '> 90 dB' },
]

const AMBIENT_COLORS: Array<{ db: number; color: string; label: string }> = [
  { db: 30, color: '#064e3b', label: '< 30 dB' },
  { db: 40, color: '#065f46', label: '30-40 dB' },
  { db: 50, color: '#047857', label: '40-50 dB' },
  { db: 60, color: '#059669', label: '50-60 dB' },
  { db: 70, color: '#d97706', label: '60-70 dB' },
  { db: 80, color: '#ea580c', label: '70-80 dB' },
  { db: 90, color: '#dc2626', label: '80-90 dB' },
  { db: 100, color: '#7f1d1d', label: '> 90 dB' },
]

function getColorScheme(scheme: 'traffic' | 'industrial' | 'ambient') {
  return scheme === 'traffic' ? TRAFFIC_COLORS : scheme === 'industrial' ? INDUSTRIAL_COLORS : AMBIENT_COLORS
}

function getNoiseColor(db: number, scheme: 'traffic' | 'industrial' | 'ambient'): string {
  const colors = getColorScheme(scheme)
  for (let i = colors.length - 1; i >= 0; i--) {
    if (db >= colors[i].db) return colors[i].color
  }
  return colors[0].color
}

export function NoiseHeatmapOverlay() {
  const { noiseHeatmap, setNoiseHeatmap, center } = useMapStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cursorNoise, setCursorNoise] = useState<number | null>(null)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)

  // Draw noise heatmap on canvas overlay
  const drawHeatmap = useCallback(() => {
    if (typeof window === 'undefined') return
    const canvas = canvasRef.current
    if (!canvas) return

    const mapContainer = document.querySelector('.maplibregl-map')
    if (!mapContainer) return

    const rect = mapContainer.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = noiseHeatmap.opacity

    // Generate estimated noise based on road proximity simulation
    // We simulate noise sources at various positions
    const noiseSources: Array<{ x: number; y: number; intensity: number }> = []
    const gridSize = 60

    // Create simulated road noise lines
    for (let i = 0; i < 8; i++) {
      const startX = Math.random() * canvas.width
      const startY = Math.random() * canvas.height
      const angle = Math.random() * Math.PI
      for (let j = 0; j < 20; j++) {
        const x = startX + Math.cos(angle + Math.sin(j * 0.3) * 0.5) * j * gridSize * 0.5
        const y = startY + Math.sin(angle + Math.cos(j * 0.3) * 0.5) * j * gridSize * 0.5
        noiseSources.push({ x, y, intensity: 65 + Math.random() * 20 })
      }
    }

    // Draw noise blobs
    for (const source of noiseSources) {
      const radius = (source.intensity - noiseHeatmap.threshold) * 4
      if (radius <= 0) continue

      const gradient = ctx.createRadialGradient(source.x, source.y, 0, source.x, source.y, radius)
      const color = getNoiseColor(source.intensity, noiseHeatmap.colorScheme)
      gradient.addColorStop(0, color)
      gradient.addColorStop(0.5, color + '80')
      gradient.addColorStop(1, color + '00')

      ctx.fillStyle = gradient
      ctx.fillRect(
        Math.max(0, source.x - radius),
        Math.max(0, source.y - radius),
        radius * 2,
        radius * 2,
      )
    }

    // Add labels if enabled
    if (noiseHeatmap.showLabels) {
      ctx.globalAlpha = Math.min(noiseHeatmap.opacity + 0.3, 1)
      for (const source of noiseSources) {
        if (source.intensity >= noiseHeatmap.threshold) {
          ctx.font = '10px sans-serif'
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.fillText(`${source.intensity.toFixed(0)} dB`, source.x, source.y - 8)
        }
      }
    }
  }, [noiseHeatmap.opacity, noiseHeatmap.threshold, noiseHeatmap.colorScheme, noiseHeatmap.showLabels])

  // Redraw when settings change
  useEffect(() => {
    if (noiseHeatmap.enabled) {
      drawHeatmap()
    }
  }, [noiseHeatmap.enabled, drawHeatmap])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCursorPos({ x, y })

    // Estimate noise at cursor position (simplified)
    const distFromCenter = Math.sqrt(
      (x - rect.width / 2) ** 2 + (y - rect.height / 2) ** 2
    )
    const estimatedDb = Math.max(30, 80 - distFromCenter / 20 + Math.random() * 5)
    setCursorNoise(estimatedDb)
  }, [])

  if (!noiseHeatmap.enabled) return null

  const colorScheme = getColorScheme(noiseHeatmap.colorScheme)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed top-16 right-4 z-50 w-72"
      >
        <Card className="shadow-xl border-orange-200 dark:border-orange-900/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="size-4 text-orange-500" />
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Noise Heatmap
                </span>
              </CardTitle>
              <Button
                variant="ghost" size="icon" className="size-6"
                onClick={() => setNoiseHeatmap({ enabled: false })}
              >
                <X className="size-3" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-3 space-y-3">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1.5">
                {noiseHeatmap.enabled ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                Heatmap Visible
              </Label>
              <Switch
                checked={noiseHeatmap.enabled}
                onCheckedChange={(v) => setNoiseHeatmap({ enabled: v })}
                className="scale-75"
              />
            </div>

            <Separator />

            {/* Opacity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Opacity</Label>
                <span className="text-xs text-muted-foreground">{(noiseHeatmap.opacity * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[noiseHeatmap.opacity]}
                onValueChange={([v]) => setNoiseHeatmap({ opacity: v })}
                min={0.1} max={1} step={0.05}
              />
            </div>

            {/* Threshold */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Noise Threshold</Label>
                <span className="text-xs text-muted-foreground">{noiseHeatmap.threshold} dB</span>
              </div>
              <Slider
                value={[noiseHeatmap.threshold]}
                onValueChange={([v]) => setNoiseHeatmap({ threshold: v })}
                min={30} max={100} step={5}
              />
            </div>

            <Separator />

            {/* Data Source */}
            <div className="space-y-1.5">
              <Label className="text-xs">Data Source</Label>
              <Select
                value={noiseHeatmap.dataSource}
                onValueChange={(v) => setNoiseHeatmap({ dataSource: v as 'estimated' | 'measured' })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estimated">Estimated (Road Proximity)</SelectItem>
                  <SelectItem value="measured">Measured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Scheme */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Palette className="size-3" /> Color Scheme
              </Label>
              <Select
                value={noiseHeatmap.colorScheme}
                onValueChange={(v) => setNoiseHeatmap({ colorScheme: v as 'traffic' | 'industrial' | 'ambient' })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="ambient">Ambient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show Labels */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show dB Labels</Label>
              <Switch
                checked={noiseHeatmap.showLabels}
                onCheckedChange={(v) => setNoiseHeatmap({ showLabels: v })}
                className="scale-75"
              />
            </div>

            <Separator />

            {/* Legend */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Info className="size-3" /> Legend
              </Label>
              <div className="grid grid-cols-2 gap-1">
                {colorScheme.map((item) => (
                  <div key={item.db} className="flex items-center gap-1.5">
                    <div
                      className="size-3 rounded-sm shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cursor noise level */}
            {cursorNoise !== null && cursorPos && (
              <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/40">
                <CardContent className="px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <Activity className="size-3 text-orange-500" />
                    <span className="text-xs font-medium">
                      {cursorNoise.toFixed(1)} dB
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 ml-auto"
                      style={{
                        borderColor: getNoiseColor(cursorNoise, noiseHeatmap.colorScheme),
                        color: getNoiseColor(cursorNoise, noiseHeatmap.colorScheme),
                      }}
                    >
                      {cursorNoise < 40 ? 'Quiet' : cursorNoise < 55 ? 'Moderate' : cursorNoise < 70 ? 'Loud' : 'Very Loud'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={drawHeatmap}
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
            >
              <Activity className="size-3 mr-1" /> Regenerate Heatmap
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Canvas overlay for the heatmap */}
      {noiseHeatmap.enabled && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-40 pointer-events-auto"
          style={{ mixBlendMode: 'multiply' }}
          onMouseMove={handleCanvasMouseMove}
        />
      )}
    </AnimatePresence>
  )
}
