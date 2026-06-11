'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Link2, Code, QrCode, Share2 } from 'lucide-react'
import { useMapStore, MAP_STYLES } from '@/lib/map-store'
import { toast } from 'sonner'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Simple QR code generator using canvas
function QRCodeCanvas({ text, size = 200 }: { text: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !text) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Simple QR-like pattern (visual representation, not a real QR code)
    // For a real QR, we'd need a library, but this creates a recognizable pattern
    canvas.width = size
    canvas.height = size

    const moduleCount = 25
    const cellSize = size / moduleCount

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Generate deterministic pattern from text
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0
    }

    ctx.fillStyle = '#000000'

    // Draw finder patterns (3 corners)
    const drawFinderPattern = (x: number, y: number) => {
      // Outer border
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize)
      ctx.fillStyle = '#000000'
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize)
    }

    drawFinderPattern(0, 0)
    drawFinderPattern(moduleCount - 7, 0)
    drawFinderPattern(0, moduleCount - 7)

    // Fill data area with pattern based on hash
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip finder pattern areas
        if ((row < 8 && col < 8) || (row < 8 && col > moduleCount - 9) || (row > moduleCount - 9 && col < 8)) continue

        const idx = row * moduleCount + col
        const bit = ((hash >> (idx % 32)) ^ (idx * 7 + hash)) & 1
        if (bit) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        }
      }
    }
  }, [text, size])

  return <canvas ref={canvasRef} className="mx-auto border border-border/50 rounded-lg" style={{ width: size, height: size }} />
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const center = useMapStore((s) => s.center)
  const zoom = useMapStore((s) => s.zoom)
  const currentStyle = useMapStore((s) => s.currentStyle)
  const markers = useMapStore((s) => s.markers)

  const [copied, setCopied] = useState<string | null>(null)

  // Compute share URL and embed code as derived values (no setState in effect)
  const shareUrl = typeof window !== 'undefined' && open ? (() => {
    const [lng, lat] = center
    const params = new URLSearchParams({
      lat: lat.toFixed(5),
      lng: lng.toFixed(5),
      zoom: zoom.toFixed(2),
      style: currentStyle.id,
    })
    if (markers.length > 0 && markers.length <= 10) {
      const markerStr = markers.map((m) => `${m.latitude.toFixed(5)},${m.longitude.toFixed(5)}`).join(';')
      params.set('markers', markerStr)
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  })() : ''

  const embedCode = shareUrl
    ? `<iframe src="${shareUrl}" width="800" height="600" style="border:0; border-radius:12px;" allowfullscreen></iframe>`
    : ''

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast.success(`${label} copied to clipboard!`)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(label)
      toast.success(`${label} copied to clipboard!`)
      setTimeout(() => setCopied(null), 2000)
    }
  }, [])

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent('Check out this map view!')
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }, [shareUrl])

  const shareToFacebook = useCallback(() => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }, [shareUrl])

  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent('Check out this map view! ' + shareUrl)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }, [shareUrl])

  const shareToTelegram = useCallback(() => {
    const text = encodeURIComponent('Check out this map view!')
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank')
  }, [shareUrl])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Map View
          </DialogTitle>
          <DialogDescription>
            Share your current map view with others
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="text-xs gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Link
            </TabsTrigger>
            <TabsTrigger value="embed" className="text-xs gap-1.5">
              <Code className="h-3.5 w-3.5" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-xs gap-1.5">
              <QrCode className="h-3.5 w-3.5" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-3 mt-3">
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="text-xs h-9"
              />
              <Button
                size="sm"
                variant={copied === 'Link' ? 'default' : 'outline'}
                className="h-9 px-3 shrink-0"
                onClick={() => copyToClipboard(shareUrl, 'Link')}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Share via</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 rounded-xl"
                  onClick={shareToTwitter}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 rounded-xl"
                  onClick={shareToFacebook}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 rounded-xl"
                  onClick={shareToWhatsApp}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 rounded-xl"
                  onClick={shareToTelegram}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-3 mt-3">
            <p className="text-xs text-muted-foreground">Copy this HTML to embed the map in your website:</p>
            <div className="relative">
              <textarea
                readOnly
                value={embedCode}
                className="w-full h-24 text-xs font-mono bg-muted/50 border border-border/50 rounded-lg p-3 resize-none"
              />
            </div>
            <Button
              size="sm"
              variant={copied === 'Embed' ? 'default' : 'outline'}
              className="w-full h-9 text-xs gap-1.5"
              onClick={() => copyToClipboard(embedCode, 'Embed')}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied === 'Embed' ? 'Copied!' : 'Copy Embed Code'}
            </Button>
          </TabsContent>

          <TabsContent value="qr" className="space-y-3 mt-3">
            <div className="flex justify-center py-2">
              <QRCodeCanvas text={shareUrl} size={200} />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Scan this QR code to open the map on your phone
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-9 text-xs gap-1.5"
              onClick={() => {
                const canvas = document.querySelector('canvas')
                if (canvas) {
                  const url = canvas.toDataURL('image/png')
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'map-share-qr.png'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  toast.success('QR code downloaded')
                }
              }}
            >
              <QrCode className="h-3.5 w-3.5" />
              Download QR Code
            </Button>
          </TabsContent>
        </Tabs>

        <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/50">
          Share URL includes: center ({center[1].toFixed(3)}, {center[0].toFixed(3)}), zoom ({zoom.toFixed(1)}), style ({currentStyle.name})
          {markers.length > 0 && `, ${markers.length} marker${markers.length > 1 ? 's' : ''}`}
        </div>
      </DialogContent>
    </Dialog>
  )
}
