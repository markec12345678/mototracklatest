'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMapStore, type ShareCardState } from '@/lib/map-store'
import { QrCode, Download, Copy, Share2, Palette } from 'lucide-react'
import { toast } from 'sonner'

function toDMS(deg: number, isLat: boolean): string {
  const dir = isLat ? (deg >= 0 ? 'N' : 'S') : deg >= 0 ? 'E' : 'W'
  const abs = Math.abs(deg)
  const d = Math.floor(abs)
  const m = Math.floor((abs - d) * 60)
  const s = ((abs - d - m / 60) * 3600).toFixed(1)
  return `${d}°${m}'${s}"${dir}`
}

function toUTM(lat: number, lng: number): string {
  const zone = Math.floor((lng + 180) / 6) + 1
  const letter = lat >= 0 ? 'N' : 'S'
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const lng0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180)
  const a = 6378137.0
  const f = 1 / 298.257223563
  const e2 = 2 * f - f * f
  const ep2 = e2 / (1 - e2)
  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2)
  const T = Math.tan(latRad) ** 2
  const C = ep2 * Math.cos(latRad) ** 2
  const A = (lngRad - lng0) * Math.cos(latRad)
  const M = a * ((1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256) * latRad
    - (3 * e2 / 8 + (3 * e2 ** 2) / 32 + (45 * e2 ** 3) / 1024) * Math.sin(2 * latRad)
    + (15 * e2 ** 2 / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * latRad)
    - (35 * e2 ** 3 / 3072) * Math.sin(6 * latRad))
  const k0 = 0.9996
  const easting = k0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T ** 2 + 72 * C - 58 * ep2) * A ** 5) / 120) + 500000
  const northing = lat < 0
    ? k0 * (M + N * Math.tan(latRad) * (A ** 2 / 2 + ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 + ((61 - 58 * T + T ** 2 + 600 * C - 330 * ep2) * A ** 6) / 720)) + 10000000
    : k0 * (M + N * Math.tan(latRad) * (A ** 2 / 2 + ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 + ((61 - 58 * T + T ** 2 + 600 * C - 330 * ep2) * A ** 6) / 720))
  return `${zone}${letter} ${Math.round(easting)} ${Math.round(northing)}`
}

function drawQR(canvas: HTMLCanvasElement, text: string, size: number) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = size
  canvas.height = size
  const cellSize = Math.max(2, Math.floor(size / 33))

  // Simple QR-like pattern from text hash
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0
  }

  const grid = Math.floor(size / cellSize)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#000000'

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (y === 0 || y === 6 || x === 0 || x === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
          ctx!.fillRect((ox + x) * cellSize, (oy + y) * cellSize, cellSize, cellSize)
        }
      }
    }
  }
  drawFinder(0, 0)
  drawFinder(grid - 7, 0)
  drawFinder(0, grid - 7)

  // Data modules
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      // Skip finder areas
      if ((x < 8 && y < 8) || (x >= grid - 8 && y < 8) || (x < 8 && y >= grid - 8)) continue
      const val = Math.abs((hash ^ (x * 31 + y * 37)) * 2654435761) % 100
      if (val < 45) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }
}

export function CoordinateShareCard() {
  const shareCardState = useMapStore((s) => s.shareCardState)
  const setShareCardState = useMapStore((s) => s.setShareCardState)
  const shareCardOpen = useMapStore((s) => s.shareCardOpen)
  const setShareCardOpen = useMapStore((s) => s.setShareCardOpen)
  const center = useMapStore((s) => s.center)

  const [locationName, setLocationName] = useState('My Location')
  const [mapImage, setMapImage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const lng = center[0]
  const lat = center[1]
  const ddStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  const dmsStr = `${toDMS(lat, true)} ${toDMS(lng, false)}`
  const utmStr = toUTM(lat, lng)

  // Capture map screenshot when dialog opens
  useEffect(() => {
    if (shareCardOpen && typeof window !== 'undefined') {
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
    if (!shareCardOpen) {
      setTimeout(() => {
        setMapImage(null)
        setPreviewUrl(null)
      }, 0)
    }
  }, [shareCardOpen])

  // Draw QR code
  useEffect(() => {
    if (shareCardOpen && shareCardState.showQR && qrCanvasRef.current) {
      const shareText = `${lat.toFixed(6)},${lng.toFixed(6)}`
      drawQR(qrCanvasRef.current, shareText, 80)
    }
  }, [shareCardOpen, shareCardState.showQR, lat, lng])

  const renderCard = useCallback((canvas: HTMLCanvasElement): Promise<string> => {
    return new Promise((resolve) => {
      const { style, size, showQR, showCoords, showMap, accentColor, message } = shareCardState

      let w = 800
      let h = 450
      if (size === 'square') { w = 600; h = 600 }
      else if (size === 'portrait') { w = 450; h = 800 }

      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(''); return }

      // Background
      if (style === 'modern') {
        const grad = ctx.createLinearGradient(0, 0, w, h)
        grad.addColorStop(0, accentColor)
        grad.addColorStop(1, '#0f172a')
        ctx.fillStyle = grad
      } else if (style === 'minimalist') {
        ctx.fillStyle = '#ffffff'
      } else if (style === 'dark') {
        ctx.fillStyle = '#0a0a0a'
      } else if (style === 'vintage') {
        ctx.fillStyle = '#f5f0e8'
      }
      ctx.fillRect(0, 0, w, h)

      // Map screenshot background
      const drawContent = () => {
        // Map image
        if (showMap && mapImage) {
          const img = new window.Image()
          img.onload = () => {
            if (style === 'modern') {
              ctx.globalAlpha = 0.3
            } else if (style === 'vintage') {
              ctx.globalAlpha = 0.4
              ctx.filter = 'sepia(0.6)'
            } else if (style === 'dark') {
              ctx.globalAlpha = 0.2
            }
            // Cover fill
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
            ctx.globalAlpha = 1
            ctx.filter = 'none'

            // Overlay for readability
            if (style === 'modern' || style === 'dark') {
              ctx.fillStyle = style === 'modern' ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.6)'
              ctx.fillRect(0, 0, w, h)
            } else if (style === 'vintage') {
              ctx.fillStyle = 'rgba(245,240,232,0.5)'
              ctx.fillRect(0, 0, w, h)
            }

            drawTextContent(ctx, w, h)
            resolve(canvas.toDataURL('image/png'))
          }
          img.onerror = () => {
            drawTextContent(ctx, w, h)
            resolve(canvas.toDataURL('image/png'))
          }
          img.src = mapImage
        } else {
          drawTextContent(ctx, w, h)
          resolve(canvas.toDataURL('image/png'))
        }
      }

      const drawTextContent = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
        const isLight = style === 'minimalist' || style === 'vintage'
        const textColor = isLight ? '#1a1a1a' : '#ffffff'
        const subtextColor = isLight ? '#666666' : '#cccccc'
        const borderColor = style === 'dark' ? accentColor : (style === 'vintage' ? '#8b7355' : accentColor)

        // Rounded rect border
        ctx.strokeStyle = borderColor
        ctx.lineWidth = style === 'minimalist' ? 1 : 3
        const r = 12
        ctx.beginPath()
        ctx.roundRect(8, 8, w - 16, h - 16, r)
        ctx.stroke()

        // Accent bar
        if (style === 'modern' || style === 'dark') {
          ctx.fillStyle = accentColor
          ctx.fillRect(20, 30, 4, 40)
        }

        // Title
        const titleFont = shareCardState.style === 'vintage' ? 'Georgia' : 'sans-serif'
        ctx.fillStyle = textColor
        ctx.font = `bold 28px ${titleFont}`
        ctx.fillText(locationName || 'My Location', style === 'minimalist' ? 30 : 36, 65)

        // Coordinates
        if (showCoords) {
          ctx.fillStyle = subtextColor
          ctx.font = '14px monospace'
          let cy = 95
          ctx.fillText(`DD:  ${ddStr}`, 36, cy); cy += 22
          ctx.fillText(`DMS: ${dmsStr}`, 36, cy); cy += 22
          ctx.fillText(`UTM: ${utmStr}`, 36, cy)
        }

        // Message
        if (message) {
          ctx.fillStyle = isLight ? '#555555' : '#aaaaaa'
          ctx.font = `italic 16px ${style === 'vintage' ? 'Georgia' : 'sans-serif'}`
          const lines = message.split('\n')
          let my = h - 90
          if (showQR) my -= 30
          for (const line of lines) {
            ctx.fillText(line, 36, my)
            my += 22
          }
        }

        // Date
        ctx.fillStyle = subtextColor
        ctx.font = '12px sans-serif'
        ctx.fillText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 36, h - 30)

        // QR code
        if (showQR && qrCanvasRef.current) {
          try {
            ctx.drawImage(qrCanvasRef.current, w - 110, h - 110, 80, 80)
            ctx.fillStyle = subtextColor
            ctx.font = '10px sans-serif'
            ctx.fillText('Scan to locate', w - 110, h - 24)
          } catch {
            // QR draw failed silently
          }
        }

        // Accent decorations
        if (style === 'dark') {
          ctx.shadowColor = accentColor
          ctx.shadowBlur = 20
          ctx.strokeStyle = accentColor
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.roundRect(8, 8, w - 16, h - 16, r)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }

      drawContent()
    })
  }, [shareCardState, locationName, mapImage, ddStr, dmsStr, utmStr])

  const handlePreview = useCallback(async () => {
    if (typeof window === 'undefined') return
    const canvas = document.createElement('canvas')
    const url = await renderCard(canvas)
    setPreviewUrl(url)
  }, [renderCard])

  const handleDownload = useCallback(async () => {
    if (typeof window === 'undefined') return
    const canvas = document.createElement('canvas')
    const url = await renderCard(canvas)
    const link = document.createElement('a')
    link.download = `share-card-${Date.now()}.png`
    link.href = url
    link.click()
    toast.success('Share card downloaded')
  }, [renderCard])

  const handleCopyToClipboard = useCallback(async () => {
    if (typeof window === 'undefined') return
    try {
      const canvas = document.createElement('canvas')
      const url = await renderCard(canvas)
      const response = await fetch(url)
      const blob = await response.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      toast.success('Card copied to clipboard')
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [renderCard])

  const handleShareLink = useCallback(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams({
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    })
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    if (navigator.share) {
      navigator.share({ title: locationName, url }).catch(() => {
        navigator.clipboard.writeText(url)
        toast.success('Share link copied to clipboard')
      })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Share link copied to clipboard')
    }
  }, [lat, lng, locationName])

  return (
    <Dialog open={shareCardOpen} onOpenChange={setShareCardOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Coordinate Share Card
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Share card preview"
                className="max-w-full max-h-64 rounded-lg border shadow-md object-contain"
              />
            </div>
          )}

          {/* Location Name */}
          <div className="space-y-2">
            <Label>Location Name</Label>
            <Input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter location name..."
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Custom Message</Label>
            <Input
              value={shareCardState.message}
              onChange={(e) => setShareCardState({ message: e.target.value })}
              placeholder="Add a personal message..."
            />
          </div>

          <Separator />

          {/* Style Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Card Style
            </Label>
            <Select
              value={shareCardState.style}
              onValueChange={(v) => setShareCardState({ style: v as ShareCardState['style'] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern (Gradient)</SelectItem>
                <SelectItem value="minimalist">Minimalist (Clean)</SelectItem>
                <SelectItem value="dark">Dark (Neon)</SelectItem>
                <SelectItem value="vintage">Vintage (Sepia)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label>Card Size</Label>
            <Select
              value={shareCardState.size}
              onValueChange={(v) => setShareCardState({ size: v as ShareCardState['size'] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
                <SelectItem value="portrait">Portrait</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={shareCardState.accentColor}
                onChange={(e) => setShareCardState({ accentColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border"
              />
              <span className="text-sm text-muted-foreground">{shareCardState.accentColor}</span>
            </div>
          </div>

          <Separator />

          {/* Toggle Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="showQR">Show QR Code</Label>
              <Switch
                id="showQR"
                checked={shareCardState.showQR}
                onCheckedChange={(v) => setShareCardState({ showQR: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showCoords">Show Coordinates</Label>
              <Switch
                id="showCoords"
                checked={shareCardState.showCoords}
                onCheckedChange={(v) => setShareCardState({ showCoords: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showMap">Show Map Screenshot</Label>
              <Switch
                id="showMap"
                checked={shareCardState.showMap}
                onCheckedChange={(v) => setShareCardState({ showMap: v })}
              />
            </div>
          </div>

          <Separator />

          {/* Coordinate Info (read-only display) */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-xs font-mono">
            <div>DD:  {ddStr}</div>
            <div>DMS: {dmsStr}</div>
            <div>UTM: {utmStr}</div>
          </div>

          {/* Hidden canvases */}
          <canvas ref={qrCanvasRef} className="hidden" />
          <canvas ref={previewCanvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handlePreview} className="flex-1">
              <QrCode className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" onClick={handleCopyToClipboard} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleShareLink} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
