'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMapStore, type WallpaperState } from '@/lib/map-store'
import { Monitor, Download, Filter, Clock, Type, Sun } from 'lucide-react'
import { toast } from 'sonner'

const RESOLUTIONS = [
  { label: '1920×1080 (Full HD)', value: '1920x1080', w: 1920, h: 1080 },
  { label: '2560×1440 (QHD)', value: '2560x1440', w: 2560, h: 1440 },
  { label: '3840×2160 (4K)', value: '3840x2160', w: 3840, h: 2160 },
  { label: '1080×1920 (Mobile)', value: '1080x1920', w: 1080, h: 1920 },
  { label: '1440×2560 (Mobile QHD)', value: '1440x2560', w: 1440, h: 2560 },
  { label: 'Custom', value: 'custom', w: 0, h: 0 },
]

const FILTERS: Record<string, string> = {
  vintage: 'sepia(0.5) saturate(1.2) brightness(1.05)',
  noir: 'grayscale(1) contrast(1.3) brightness(0.9)',
  vibrant: 'saturate(1.8) contrast(1.1) brightness(1.05)',
  dreamy: 'blur(1px) saturate(1.3) brightness(1.1)',
  minimal: 'saturate(0.5) contrast(1.05) brightness(1.1)',
  custom: '',
}

function getFilterCSS(state: WallpaperState): string {
  if (state.filter === 'custom') {
    const { brightness, contrast, saturation, hue } = state.customFilter
    return `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100}) hue-rotate(${hue}deg)`
  }
  return FILTERS[state.filter] || ''
}

export function MapWallpaperGenerator() {
  const wallpaperState = useMapStore((s) => s.wallpaperState)
  const setWallpaperState = useMapStore((s) => s.setWallpaperState)
  const wallpaperOpen = useMapStore((s) => s.wallpaperOpen)
  const setWallpaperOpen = useMapStore((s) => s.setWallpaperOpen)

  const [mapImage, setMapImage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [jpegQuality, setJpegQuality] = useState(85)
  const [currentTime, setCurrentTime] = useState('')
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Capture map screenshot when dialog opens
  useEffect(() => {
    if (wallpaperOpen && typeof window !== 'undefined') {
      const mapScreenshot = (window as any).__mapScreenshot
      if (mapScreenshot) {
        try {
          const dataUrl = mapScreenshot() as string
          setTimeout(() => setMapImage(dataUrl), 0)
        } catch {
          setTimeout(() => setMapImage(null), 0)
        }
      }
    }
    if (!wallpaperOpen) {
      setTimeout(() => {
        setMapImage(null)
        setPreviewUrl(null)
      }, 0)
    }
  }, [wallpaperOpen])

  // Update clock
  useEffect(() => {
    if (!wallpaperOpen || !wallpaperState.showClock) return
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [wallpaperOpen, wallpaperState.showClock])

  const getResolution = useCallback((): [number, number] => {
    if (wallpaperState.resolution === 'custom') {
      return [wallpaperState.customWidth, wallpaperState.customHeight]
    }
    const preset = RESOLUTIONS.find((r) => r.value === wallpaperState.resolution)
    return preset ? [preset.w, preset.h] : [1920, 1080]
  }, [wallpaperState.resolution, wallpaperState.customWidth, wallpaperState.customHeight])

  const renderWallpaper = useCallback((canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png', quality = 85): Promise<string> => {
    return new Promise((resolve) => {
      const [w, h] = getResolution()
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(''); return }

      const drawOverlays = () => {
        // Vignette
        if (wallpaperState.vignette) {
          const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7)
          grad.addColorStop(0, 'rgba(0,0,0,0)')
          grad.addColorStop(1, 'rgba(0,0,0,0.5)')
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, w, h)
        }

        // Dark gradient at bottom
        if (wallpaperState.darkGradient) {
          const grad = ctx.createLinearGradient(0, h * 0.6, 0, h)
          grad.addColorStop(0, 'rgba(0,0,0,0)')
          grad.addColorStop(1, 'rgba(0,0,0,0.7)')
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, w, h)
        }

        // Text positioning helper
        const getTextPos = (position: string): { x: number; y: number; align: CanvasTextAlign } => {
          const padding = w * 0.05
          switch (position) {
            case 'top-left': return { x: padding, y: padding + 40, align: 'left' }
            case 'top-right': return { x: w - padding, y: padding + 40, align: 'right' }
            case 'bottom-left': return { x: padding, y: h - padding - 20, align: 'left' }
            case 'bottom-right': return { x: w - padding, y: h - padding - 20, align: 'right' }
            case 'center': return { x: w / 2, y: h / 2, align: 'center' }
            default: return { x: padding, y: h - padding - 20, align: 'left' }
          }
        }

        const fontSize = wallpaperState.textSize === 'small' ? Math.round(w * 0.02) : wallpaperState.textSize === 'large' ? Math.round(w * 0.05) : Math.round(w * 0.03)
        const fontFace = wallpaperState.textFont === 'serif' ? 'Georgia' : wallpaperState.textFont === 'mono' ? 'monospace' : 'sans-serif'

        // Clock
        if (wallpaperState.showClock) {
          const clockSize = Math.round(w * 0.08)
          ctx.fillStyle = wallpaperState.textColor
          ctx.font = `300 ${clockSize}px ${fontFace}`
          ctx.textAlign = 'center'
          if (wallpaperState.textShadow) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)'
            ctx.shadowBlur = 10
          }
          ctx.fillText(currentTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), w / 2, h * 0.15)
          ctx.shadowBlur = 0
        }

        // Weather placeholder
        if (wallpaperState.showWeather) {
          const weatherSize = Math.round(w * 0.025)
          ctx.fillStyle = wallpaperState.textColor
          ctx.font = `${weatherSize}px ${fontFace}`
          ctx.textAlign = 'right'
          if (wallpaperState.textShadow) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)'
            ctx.shadowBlur = 8
          }
          ctx.fillText('🌤 Weather Info', w - w * 0.05, h * 0.08)
          ctx.shadowBlur = 0
        }

        // Custom text
        if (wallpaperState.showText && wallpaperState.textContent) {
          const pos = getTextPos(wallpaperState.textPosition)
          ctx.fillStyle = wallpaperState.textColor
          ctx.font = `${fontSize}px ${fontFace}`
          ctx.textAlign = pos.align
          if (wallpaperState.textShadow) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)'
            ctx.shadowBlur = 8
          }
          // Word wrap
          const maxLineWidth = w * 0.8
          const words = wallpaperState.textContent.split(' ')
          let line = ''
          let ly = pos.y
          for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxLineWidth && line) {
              ctx.fillText(line, pos.x, ly)
              line = word
              ly += fontSize * 1.3
            } else {
              line = testLine
            }
          }
          if (line) ctx.fillText(line, pos.x, ly)
          ctx.shadowBlur = 0
        }

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
        resolve(canvas.toDataURL(mimeType, quality / 100))
      }

      if (mapImage) {
        const img = new window.Image()
        img.onload = () => {
          // Apply filter via CSS filter on canvas
          ctx.filter = getFilterCSS(wallpaperState)

          // Cover fill the image
          const imgAspect = img.width / img.height
          const canvasAspect = w / h
          let sx = 0, sy = 0, sw = img.width, sh = img.height
          if (imgAspect > canvasAspect) {
            sw = img.height * canvasAspect
            sx = (img.width - sw) / 2
          } else {
            sh = img.width / canvasAspect
            sy = (img.height - sh) / 2
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
          ctx.filter = 'none'
          drawOverlays()
        }
        img.onerror = () => {
          ctx.fillStyle = '#1a1a2e'
          ctx.fillRect(0, 0, w, h)
          drawOverlays()
        }
        img.src = mapImage
      } else {
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, 0, w, h)
        drawOverlays()
      }
    })
  }, [wallpaperState, mapImage, getResolution, currentTime])

  const handlePreview = useCallback(async () => {
    if (typeof window === 'undefined') return
    const canvas = document.createElement('canvas')
    const url = await renderWallpaper(canvas)
    setPreviewUrl(url)
  }, [renderWallpaper])

  const handleDownloadPNG = useCallback(async () => {
    if (typeof window === 'undefined') return
    const canvas = document.createElement('canvas')
    const url = await renderWallpaper(canvas, 'png')
    const link = document.createElement('a')
    link.download = `map-wallpaper-${Date.now()}.png`
    link.href = url
    link.click()
    toast.success('Wallpaper downloaded as PNG')
  }, [renderWallpaper])

  const handleDownloadJPEG = useCallback(async () => {
    if (typeof window === 'undefined') return
    const canvas = document.createElement('canvas')
    const url = await renderWallpaper(canvas, 'jpeg', jpegQuality)
    const link = document.createElement('a')
    link.download = `map-wallpaper-${Date.now()}.jpg`
    link.href = url
    link.click()
    toast.success('Wallpaper downloaded as JPEG')
  }, [renderWallpaper, jpegQuality])

  return (
    <Dialog open={wallpaperOpen} onOpenChange={setWallpaperOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Map Wallpaper Generator
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Wallpaper preview"
                className="max-w-full max-h-48 rounded-lg border shadow-md object-contain"
              />
            </div>
          )}

          {/* Filter Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Style
            </Label>
            <Select
              value={wallpaperState.filter}
              onValueChange={(v) => setWallpaperState({ filter: v as WallpaperState['filter'] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vintage">Vintage (Sepia, Warmth)</SelectItem>
                <SelectItem value="noir">Noir (B&W, High Contrast)</SelectItem>
                <SelectItem value="vibrant">Vibrant (Saturated)</SelectItem>
                <SelectItem value="dreamy">Dreamy (Soft Blur, Glow)</SelectItem>
                <SelectItem value="minimal">Minimal (Reduced Saturation)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Filter Controls */}
          {wallpaperState.filter === 'custom' && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Sun className="h-3 w-3" />
                  Brightness: {wallpaperState.customFilter.brightness}%
                </Label>
                <Slider
                  value={[wallpaperState.customFilter.brightness]}
                  onValueChange={([v]) => setWallpaperState({ customFilter: { ...wallpaperState.customFilter, brightness: v } })}
                  min={0} max={200} step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Contrast: {wallpaperState.customFilter.contrast}%</Label>
                <Slider
                  value={[wallpaperState.customFilter.contrast]}
                  onValueChange={([v]) => setWallpaperState({ customFilter: { ...wallpaperState.customFilter, contrast: v } })}
                  min={0} max={200} step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Saturation: {wallpaperState.customFilter.saturation}%</Label>
                <Slider
                  value={[wallpaperState.customFilter.saturation]}
                  onValueChange={([v]) => setWallpaperState({ customFilter: { ...wallpaperState.customFilter, saturation: v } })}
                  min={0} max={200} step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Hue Rotate: {wallpaperState.customFilter.hue}°</Label>
                <Slider
                  value={[wallpaperState.customFilter.hue]}
                  onValueChange={([v]) => setWallpaperState({ customFilter: { ...wallpaperState.customFilter, hue: v } })}
                  min={0} max={360} step={1}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Resolution */}
          <div className="space-y-2">
            <Label>Resolution</Label>
            <Select
              value={wallpaperState.resolution}
              onValueChange={(v) => setWallpaperState({ resolution: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESOLUTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {wallpaperState.resolution === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Width</Label>
                <Input
                  type="number"
                  value={wallpaperState.customWidth}
                  onChange={(e) => setWallpaperState({ customWidth: parseInt(e.target.value) || 1920 })}
                  min={320} max={7680}
                />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input
                  type="number"
                  value={wallpaperState.customHeight}
                  onChange={(e) => setWallpaperState({ customHeight: parseInt(e.target.value) || 1080 })}
                  min={320} max={4320}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Overlay Options */}
          <div className="space-y-3">
            <Label className="font-semibold">Overlay Options</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="wShowClock" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Show Clock
              </Label>
              <Switch
                id="wShowClock"
                checked={wallpaperState.showClock}
                onCheckedChange={(v) => setWallpaperState({ showClock: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="wShowWeather">Show Weather Info</Label>
              <Switch
                id="wShowWeather"
                checked={wallpaperState.showWeather}
                onCheckedChange={(v) => setWallpaperState({ showWeather: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="wVignette">Vignette Effect</Label>
              <Switch
                id="wVignette"
                checked={wallpaperState.vignette}
                onCheckedChange={(v) => setWallpaperState({ vignette: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="wDarkGradient">Dark Gradient (Bottom)</Label>
              <Switch
                id="wDarkGradient"
                checked={wallpaperState.darkGradient}
                onCheckedChange={(v) => setWallpaperState({ darkGradient: v })}
              />
            </div>
          </div>

          <Separator />

          {/* Text Options */}
          <div className="space-y-3">
            <Label className="font-semibold flex items-center gap-1">
              <Type className="h-4 w-4" />
              Text Options
            </Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="wShowText">Show Custom Text</Label>
              <Switch
                id="wShowText"
                checked={wallpaperState.showText}
                onCheckedChange={(v) => setWallpaperState({ showText: v })}
              />
            </div>

            {wallpaperState.showText && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label>Text Content</Label>
                  <Input
                    value={wallpaperState.textContent}
                    onChange={(e) => setWallpaperState({ textContent: e.target.value })}
                    placeholder="Enter your text..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select
                      value={wallpaperState.textPosition}
                      onValueChange={(v) => setWallpaperState({ textPosition: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font</Label>
                    <Select
                      value={wallpaperState.textFont}
                      onValueChange={(v) => setWallpaperState({ textFont: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="mono">Mono</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Select
                      value={wallpaperState.textSize}
                      onValueChange={(v) => setWallpaperState({ textSize: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={wallpaperState.textColor}
                        onChange={(e) => setWallpaperState({ textColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border"
                      />
                      <span className="text-xs text-muted-foreground">{wallpaperState.textColor}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="wTextShadow">Text Shadow</Label>
                  <Switch
                    id="wTextShadow"
                    checked={wallpaperState.textShadow}
                    onCheckedChange={(v) => setWallpaperState({ textShadow: v })}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* JPEG Quality */}
          <div className="space-y-2">
            <Label>JPEG Quality: {jpegQuality}%</Label>
            <Slider
              value={[jpegQuality]}
              onValueChange={([v]) => setJpegQuality(v)}
              min={10} max={100} step={5}
            />
          </div>

          {/* Hidden canvas */}
          <canvas ref={previewCanvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handlePreview} className="flex-1">
              <Monitor className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleDownloadPNG} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" onClick={handleDownloadJPEG} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download JPEG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
