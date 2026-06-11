'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  Download,
  Image,
  FileText,
  Type,
  Compass,
  Ruler,
  MapPin,
  Calendar,
  Monitor,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type ExportFormat = 'png' | 'jpeg' | 'pdf'
type ResolutionScale = 1 | 2 | 3
type SizePreset = 'current' | '1920x1080' | '2560x1440' | '3840x2160' | 'custom'

interface ExportOptions {
  format: ExportFormat
  quality: number
  resolution: ResolutionScale
  sizePreset: SizePreset
  customWidth: number
  customHeight: number
  includeTitle: boolean
  title: string
  includeCompass: boolean
  includeScale: boolean
  includeCoords: boolean
  includeDate: boolean
}

const SIZE_PRESETS: Record<string, { label: string; width: number; height: number }> = {
  current: { label: 'Current View', width: 0, height: 0 },
  '1920x1080': { label: '1920 × 1080 (Full HD)', width: 1920, height: 1080 },
  '2560x1440': { label: '2560 × 1440 (QHD)', width: 2560, height: 1440 },
  '3840x2160': { label: '3840 × 2160 (4K)', width: 3840, height: 2160 },
  custom: { label: 'Custom Size', width: 1920, height: 1080 },
}

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'png', label: 'PNG', icon: <Image className="h-4 w-4" alt="" />, description: 'Lossless quality, larger file' },
  { id: 'jpeg', label: 'JPEG', icon: <Image className="h-4 w-4" alt="" />, description: 'Compressed, adjustable quality' },
  { id: 'pdf', label: 'PDF', icon: <FileText className="h-4 w-4" />, description: 'Document format with metadata' },
]

export function MapExportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { center, zoom, bearing, pitch } = useMapStore()
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 90,
    resolution: 2,
    sizePreset: 'current',
    customWidth: 1920,
    customHeight: 1080,
    includeTitle: false,
    title: '',
    includeCompass: true,
    includeScale: true,
    includeCoords: true,
    includeDate: true,
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Generate preview when dialog opens or options change
  const generatePreview = useCallback(async () => {
    const screenshotFn = (window as unknown as Record<string, () => Promise<string | null>>).__mapScreenshot
    if (!screenshotFn) return

    setIsGeneratingPreview(true)
    try {
      const screenshot = await screenshotFn()
      if (screenshot) {
        setPreviewUrl(screenshot)
      }
    } catch {
      // Ignore preview errors
    } finally {
      setIsGeneratingPreview(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      generatePreview()
    } else {
      setPreviewUrl(null)
    }
  }, [open, generatePreview])

  // Debounced preview regeneration
  useEffect(() => {
    if (!open) return
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current)
    previewTimeoutRef.current = setTimeout(() => {
      generatePreview()
    }, 1000)
    return () => {
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current)
    }
  
  }, [center, zoom, bearing, pitch])

  const getExportDimensions = useCallback(() => {
    if (options.sizePreset === 'current') {
      const mapEl = typeof document !== 'undefined' ? document.querySelector('.maplibregl-map canvas') as HTMLCanvasElement | null : null
      const w = mapEl?.width || 1280
      const h = mapEl?.height || 720
      return { width: w * options.resolution, height: h * options.resolution }
    }
    if (options.sizePreset === 'custom') {
      return { width: options.customWidth * options.resolution, height: options.customHeight * options.resolution }
    }
    const preset = SIZE_PRESETS[options.sizePreset]
    return { width: preset.width * options.resolution, height: preset.height * options.resolution }
  }, [options.sizePreset, options.customWidth, options.customHeight, options.resolution])

  const drawOverlays = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const w = canvas.width
    const h = canvas.height
    const fontSize = Math.max(16, Math.round(w / 80))

    // Title overlay
    if (options.includeTitle && options.title.trim()) {
      // Semi-transparent background bar at top
      const barHeight = fontSize * 3
      const gradient = ctx.createLinearGradient(0, 0, 0, barHeight)
      gradient.addColorStop(0, 'rgba(0,0,0,0.6)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, barHeight)

      // Title text
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${fontSize * 1.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
      ctx.textBaseline = 'middle'
      ctx.fillText(options.title, fontSize * 1.5, barHeight / 2)
    }

    // Bottom info bar
    const infoItems: string[] = []
    if (options.includeCoords) {
      infoItems.push(`${center[1].toFixed(5)}°, ${center[0].toFixed(5)}°`)
    }
    if (options.includeDate) {
      infoItems.push(new Date().toLocaleString())
    }
    if (options.includeScale) {
      infoItems.push(`Zoom ${zoom.toFixed(1)}`)
    }

    if (infoItems.length > 0 || options.includeCompass) {
      const barHeight = fontSize * 2.5
      const gradient = ctx.createLinearGradient(0, h, 0, h - barHeight)
      gradient.addColorStop(0, 'rgba(0,0,0,0.6)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, h - barHeight, w, barHeight)

      // Info text
      ctx.fillStyle = '#ffffff'
      ctx.font = `${fontSize * 0.85}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
      ctx.textBaseline = 'middle'
      const infoText = infoItems.join('  ·  ')
      ctx.fillText(infoText, fontSize * 1.5, h - barHeight / 2)

      // Compass rose
      if (options.includeCompass) {
        const compassX = w - fontSize * 3
        const compassY = h - barHeight / 2
        const compassR = fontSize * 1.2
        const bearingRad = (-bearing * Math.PI) / 180

        ctx.save()
        ctx.translate(compassX, compassY)
        ctx.rotate(bearingRad)

        // Draw compass cross
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = Math.max(1.5, fontSize / 12)
        ctx.lineCap = 'round'

        // North arrow (red)
        ctx.beginPath()
        ctx.moveTo(0, -compassR)
        ctx.lineTo(-compassR * 0.25, 0)
        ctx.lineTo(compassR * 0.25, 0)
        ctx.closePath()
        ctx.fillStyle = '#ef4444'
        ctx.fill()

        // South arrow
        ctx.beginPath()
        ctx.moveTo(0, compassR)
        ctx.lineTo(-compassR * 0.25, 0)
        ctx.lineTo(compassR * 0.25, 0)
        ctx.closePath()
        ctx.fillStyle = '#ffffff88'
        ctx.fill()

        // East/West lines
        ctx.beginPath()
        ctx.moveTo(-compassR * 0.5, 0)
        ctx.lineTo(compassR * 0.5, 0)
        ctx.stroke()

        // N label
        ctx.rotate(-bearingRad)
        ctx.fillStyle = '#ef4444'
        ctx.font = `bold ${fontSize * 0.7}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText('N', 0, -compassR - 2)

        ctx.restore()
      }
    }
  }, [options, center, zoom, bearing])

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const screenshotFn = (window as unknown as Record<string, () => Promise<string | null>>).__mapScreenshot
      if (!screenshotFn) {
        toast.error('Map not ready for export')
        return
      }

      const screenshot = await screenshotFn()
      if (!screenshot) {
        toast.error('Failed to capture map')
        return
      }

      // Create an image from the screenshot
      const img = new Image()
      img.crossOrigin = 'anonymous'

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load screenshot'))
        img.src = screenshot
      })

      // Determine export dimensions
      const dims = getExportDimensions()

      // Create the export canvas at target resolution
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = dims.width
      exportCanvas.height = dims.height
      const ctx = exportCanvas.getContext('2d')
      if (!ctx) {
        toast.error('Canvas not supported')
        return
      }

      // Draw the map image scaled to fill the export canvas
      ctx.drawImage(img, 0, 0, dims.width, dims.height)

      // Draw overlays
      drawOverlays(exportCanvas, ctx)

      // Export based on format
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

      if (options.format === 'pdf') {
        // For PDF: export as high-res PNG and download with PDF extension info
        // We'll create a simple approach using a data URL
        const dataUrl = exportCanvas.toDataURL('image/png')
        // Create an HTML document that acts as a PDF-like printable page
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>Map Export - ${options.title || 'MapLibre Export'}</title>
            <style>
              @page { margin: 0; size: ${dims.width}px ${dims.height}px; }
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              img { max-width: 100%; max-height: 100vh; }
            </style>
            </head>
            <body><img src="${dataUrl}" onload="window.print();"></body>
            </html>
          `)
          printWindow.document.close()
        }
        toast.success('Map export opened for PDF printing')
      } else {
        // PNG or JPEG
        const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png'
        const quality = options.format === 'jpeg' ? options.quality / 100 : undefined
        const dataUrl = exportCanvas.toDataURL(mimeType, quality)

        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `maplibre-export-${timestamp}.${options.format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success(`Map exported as ${options.format.toUpperCase()}`)
      }

      onOpenChange(false)
    } catch (err) {
      console.error('Export failed:', err)
      toast.error('Failed to export map')
    } finally {
      setIsExporting(false)
    }
  }, [options, getExportDimensions, drawOverlays, onOpenChange])

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="dialog-gradient-header px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                <Camera className="h-4 w-4 text-white" />
              </div>
              Export Map
            </DialogTitle>
            <DialogDescription>
              Capture the current map view as a high-quality image or PDF.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-2 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/30">
            <div className="aspect-video relative">
              {isGeneratingPreview ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Map export preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Preview will appear here
                </div>
              )}
              {/* Overlay indicators */}
              <div className="absolute top-2 right-2 flex gap-1.5">
                {options.includeTitle && options.title && (
                  <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-medium">Title</span>
                )}
                {options.includeCompass && (
                  <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-medium">Compass</span>
                )}
                {options.includeCoords && (
                  <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-medium">Coords</span>
                )}
                {options.includeDate && (
                  <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-medium">Date</span>
                )}
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Format</Label>
            <div className="grid grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map((fmt) => (
                <motion.button
                  key={fmt.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateOption('format', fmt.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer',
                    options.format === fmt.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/50 hover:border-primary/30'
                  )}
                >
                  {fmt.icon}
                  <span className="text-xs font-semibold">{fmt.label}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight text-center">{fmt.description}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* JPEG Quality (only for JPEG) */}
          {options.format === 'jpeg' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Quality</Label>
                <span className="text-xs text-muted-foreground font-mono">{options.quality}%</span>
              </div>
              <Slider
                value={[options.quality]}
                min={10}
                max={100}
                step={5}
                onValueChange={([v]) => updateOption('quality', v)}
                className="w-full"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>Smaller file</span>
                <span>Higher quality</span>
              </div>
            </motion.div>
          )}

          {/* Resolution */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Resolution</Label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as ResolutionScale[]).map((scale) => (
                <motion.button
                  key={scale}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateOption('resolution', scale)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all cursor-pointer',
                    options.resolution === scale
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/50 hover:border-primary/30'
                  )}
                >
                  <Monitor className="h-4 w-4" />
                  <span className="text-xs font-semibold">{scale}x</span>
                  <span className="text-[9px] text-muted-foreground">
                    {scale === 1 ? 'Standard' : scale === 2 ? 'High DPI' : 'Ultra HD'}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Size Preset */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Size</Label>
            <Select
              value={options.sizePreset}
              onValueChange={(v) => updateOption('sizePreset', v as SizePreset)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIZE_PRESETS).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom size inputs */}
            {options.sizePreset === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-3 mt-2"
              >
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Width (px)</Label>
                  <Input
                    type="number"
                    min={100}
                    max={7680}
                    value={options.customWidth}
                    onChange={(e) => updateOption('customWidth', parseInt(e.target.value) || 1920)}
                    className="rounded-xl font-mono text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Height (px)</Label>
                  <Input
                    type="number"
                    min={100}
                    max={4320}
                    value={options.customHeight}
                    onChange={(e) => updateOption('customHeight', parseInt(e.target.value) || 1080)}
                    className="rounded-xl font-mono text-sm"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Export dimensions summary */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/30">
            <Monitor className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              Output: {getExportDimensions().width} × {getExportDimensions().height} px
              <span className="ml-2 text-muted-foreground/60">
                ({options.format.toUpperCase()}, {options.resolution}x resolution)
              </span>
            </span>
          </div>

          {/* Overlays section */}
          <div className="space-y-3">
            <Label className="text-xs font-medium">Include in Export</Label>

            {/* Title */}
            <div className="space-y-2 rounded-xl border border-border/40 p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={options.includeTitle}
                  onCheckedChange={(v) => updateOption('includeTitle', v === true)}
                  id="include-title"
                />
                <label htmlFor="include-title" className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                  <Type className="h-3.5 w-3.5 text-muted-foreground" />
                  Title Overlay
                </label>
              </div>
              {options.includeTitle && (
                <Input
                  value={options.title}
                  onChange={(e) => updateOption('title', e.target.value)}
                  placeholder="Enter map title..."
                  className="rounded-xl text-sm"
                />
              )}
            </div>

            {/* Other overlays */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-border/40 p-3">
                <Checkbox
                  checked={options.includeCompass}
                  onCheckedChange={(v) => updateOption('includeCompass', v === true)}
                  id="include-compass"
                />
                <label htmlFor="include-compass" className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                  <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                  Compass Rose
                </label>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/40 p-3">
                <Checkbox
                  checked={options.includeScale}
                  onCheckedChange={(v) => updateOption('includeScale', v === true)}
                  id="include-scale"
                />
                <label htmlFor="include-scale" className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                  Scale / Zoom
                </label>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/40 p-3">
                <Checkbox
                  checked={options.includeCoords}
                  onCheckedChange={(v) => updateOption('includeCoords', v === true)}
                  id="include-coords"
                />
                <label htmlFor="include-coords" className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Coordinates
                </label>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/40 p-3">
                <Checkbox
                  checked={options.includeDate}
                  onCheckedChange={(v) => updateOption('includeDate', v === true)}
                  id="include-date"
                />
                <label htmlFor="include-date" className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Date / Time
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white border-0"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1.5" />
                  Export {options.format.toUpperCase()}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
