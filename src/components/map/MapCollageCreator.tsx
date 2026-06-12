'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useMapStore, type MapCollage, type CollageTile, MAP_STYLES } from '@/lib/map-store'
import { LayoutGrid, Plus, Trash2, Download, Image as ImageIcon, Camera, Share2, FileText } from 'lucide-react'
import { toast } from 'sonner'

const LAYOUT_TEMPLATES = [
  { id: '2x2', name: '2×2 Grid', maxTiles: 4, description: '4 equal tiles' },
  { id: '1+3', name: '1 + 3 Layout', maxTiles: 4, description: '1 large + 3 small' },
  { id: '3+1', name: '3 + 1 Layout', maxTiles: 4, description: '3 small + 1 large' },
  { id: 'h-strip', name: 'Horizontal Strip', maxTiles: 3, description: '3 tiles side by side' },
  { id: 'v-strip', name: 'Vertical Strip', maxTiles: 3, description: '3 tiles stacked' },
  { id: 'custom', name: 'Custom Grid', maxTiles: 12, description: 'Custom rows × columns' },
]

const BG_COLORS = [
  { value: '#ffffff', label: 'White' },
  { value: '#1a1a2e', label: 'Dark Blue' },
  { value: '#16213e', label: 'Navy' },
  { value: '#0f3460', label: 'Deep Blue' },
  { value: '#e8e8e8', label: 'Light Gray' },
  { value: '#2d2d2d', label: 'Charcoal' },
  { value: '#f5f0e1', label: 'Cream' },
  { value: '#1b4332', label: 'Forest Green' },
]

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function MapCollageCreator() {
  const collageCreatorOpen = useMapStore((s) => s.collageCreatorOpen)
  const setCollageCreatorOpen = useMapStore((s) => s.setCollageCreatorOpen)
  const mapCollage = useMapStore((s) => s.mapCollage)
  const setMapCollage = useMapStore((s) => s.setMapCollage)
  const savedLocations = useMapStore((s) => s.savedLocations)
  const currentStyle = useMapStore((s) => s.currentStyle)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [customRows, setCustomRows] = useState(2)
  const [customCols, setCustomCols] = useState(2)
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null)

  const defaultCollage: MapCollage = {
    id: generateId(),
    name: 'My Map Collage',
    layout: '2x2',
    tiles: [],
    bgColor: '#ffffff',
    spacing: 8,
    borderRadius: 8,
    title: '',
    subtitle: '',
  }

  const collage = mapCollage ?? defaultCollage

  const updateCollage = useCallback(
    (updates: Partial<MapCollage>) => {
      setMapCollage({ ...collage, ...updates })
    },
    [collage, setMapCollage]
  )

  const captureCurrentView = useCallback(async () => {
    if (typeof window === 'undefined') return

    const screenshotFn = (window as any).__mapScreenshot
    let dataUrl = ''

    if (screenshotFn) {
      try {
        dataUrl = await screenshotFn()
      } catch {
        dataUrl = ''
      }
    }

    if (!dataUrl) {
      const map = (window as any).__mainMap
      if (map) {
        const canvas = map.getCanvas()
        if (canvas) {
          dataUrl = canvas.toDataURL('image/png')
        }
      }
    }

    if (!dataUrl) {
      toast.error('Could not capture map view')
      return
    }

    const newTile: CollageTile = {
      id: generateId(),
      dataUrl,
      title: `View ${collage.tiles.length + 1}`,
      style: currentStyle.name,
    }

    updateCollage({ tiles: [...collage.tiles, newTile] })
    toast.success('Map view captured!')
  }, [collage, currentStyle.name, updateCollage])

  const navigateAndCapture = useCallback(
    async (lat: number, lng: number, zoom?: number) => {
      if (typeof window === 'undefined') return

      const map = (window as any).__mainMap
      if (!map) {
        toast.error('Map not available')
        return
      }

      map.flyTo({
        center: [lng, lat],
        zoom: zoom ?? map.getZoom(),
        duration: 1500,
      })

      await new Promise((resolve) => setTimeout(resolve, 2000))

      await captureCurrentView()
    },
    [captureCurrentView]
  )

  const removeTile = useCallback(
    (tileId: string) => {
      updateCollage({ tiles: collage.tiles.filter((t) => t.id !== tileId) })
      if (selectedTileIndex !== null && collage.tiles.length <= selectedTileIndex + 1) {
        setSelectedTileIndex(null)
      }
    },
    [collage, selectedTileIndex, updateCollage]
  )

  const updateTile = useCallback(
    (tileId: string, updates: Partial<CollageTile>) => {
      updateCollage({
        tiles: collage.tiles.map((t) => (t.id === tileId ? { ...t, ...updates } : t)),
      })
    },
    [collage, updateCollage]
  )

  const renderCollagePreview = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 800
    const height = 600
    canvas.width = width
    canvas.height = height

    ctx.fillStyle = collage.bgColor
    ctx.fillRect(0, 0, width, height)

    const titleHeight = collage.title ? 50 : 0
    const subtitleHeight = collage.subtitle ? 30 : 0
    const headerHeight = titleHeight + subtitleHeight
    const footerHeight = 25
    const spacing = collage.spacing

    let tilesArea = {
      x: spacing,
      y: headerHeight + spacing,
      w: width - spacing * 2,
      h: height - headerHeight - footerHeight - spacing * 2,
    }

    if (collage.title) {
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(collage.title, width / 2, 35)
    }

    if (collage.subtitle) {
      ctx.fillStyle = '#666666'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(collage.subtitle, width / 2, titleHeight + 20)
    }

    ctx.fillStyle = '#999999'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('© OpenStreetMap contributors · MapLibre Explorer', width / 2, height - 8)

    const tiles = collage.tiles
    if (tiles.length === 0) {
      ctx.fillStyle = '#cccccc'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Add tiles to preview collage', width / 2, height / 2)
      return
    }

    const layout = collage.layout
    const drawTile = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
      if (collage.borderRadius > 0) {
        ctx.beginPath()
        const r = collage.borderRadius
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.quadraticCurveTo(x + w, y, x + w, y + r)
        ctx.lineTo(x + w, y + h - r)
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        ctx.lineTo(x + r, y + h)
        ctx.quadraticCurveTo(x, y + h, x, y + h - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
        ctx.clip()
      }
      ctx.drawImage(img, x, y, w, h)
    }

    const renderTiles = (images: HTMLImageElement[]) => {
      const imgIndex = { current: 0 }
      const getNext = () => images[imgIndex.current++] ?? images[images.length - 1]

      if (layout === '2x2') {
        const cellW = (tilesArea.w - spacing) / 2
        const cellH = (tilesArea.h - spacing) / 2
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 2; col++) {
            ctx.save()
            drawTile(getNext(), tilesArea.x + col * (cellW + spacing), tilesArea.y + row * (cellH + spacing), cellW, cellH)
            ctx.restore()
          }
        }
      } else if (layout === '1+3') {
        const bigW = tilesArea.w * 0.6 - spacing
        const smallW = tilesArea.w * 0.4 - spacing
        const bigH = tilesArea.h
        const smallH = (tilesArea.h - spacing * 2) / 3
        ctx.save()
        drawTile(getNext(), tilesArea.x, tilesArea.y, bigW, bigH)
        ctx.restore()
        for (let i = 0; i < 3; i++) {
          ctx.save()
          drawTile(getNext(), tilesArea.x + bigW + spacing * 2, tilesArea.y + i * (smallH + spacing), smallW, smallH)
          ctx.restore()
        }
      } else if (layout === '3+1') {
        const smallW = tilesArea.w * 0.4 - spacing * 2
        const bigW = tilesArea.w * 0.6 - spacing
        const smallH = (tilesArea.h - spacing * 2) / 3
        const bigH = tilesArea.h
        for (let i = 0; i < 3; i++) {
          ctx.save()
          drawTile(getNext(), tilesArea.x, tilesArea.y + i * (smallH + spacing), smallW, smallH)
          ctx.restore()
        }
        ctx.save()
        drawTile(getNext(), tilesArea.x + smallW + spacing * 2, tilesArea.y, bigW, bigH)
        ctx.restore()
      } else if (layout === 'h-strip') {
        const cellW = (tilesArea.w - spacing * 2) / 3
        for (let i = 0; i < 3; i++) {
          ctx.save()
          drawTile(getNext(), tilesArea.x + i * (cellW + spacing), tilesArea.y, cellW, tilesArea.h)
          ctx.restore()
        }
      } else if (layout === 'v-strip') {
        const cellH = (tilesArea.h - spacing * 2) / 3
        for (let i = 0; i < 3; i++) {
          ctx.save()
          drawTile(getNext(), tilesArea.x, tilesArea.y + i * (cellH + spacing), tilesArea.w, cellH)
          ctx.restore()
        }
      } else if (layout === 'custom') {
        const rows = customRows
        const cols = customCols
        const cellW = (tilesArea.w - spacing * (cols - 1)) / cols
        const cellH = (tilesArea.h - spacing * (rows - 1)) / rows
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (imgIndex.current < images.length) {
              ctx.save()
              drawTile(
                getNext(),
                tilesArea.x + col * (cellW + spacing),
                tilesArea.y + row * (cellH + spacing),
                cellW,
                cellH
              )
              ctx.restore()
            }
          }
        }
      }
    }

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => {
          const fallback = new Image()
          fallback.onload = () => resolve(fallback)
          const fc = document.createElement('canvas')
          fc.width = 400
          fc.height = 300
          const fctx = fc.getContext('2d')
          if (fctx) {
            fctx.fillStyle = '#e0e0e0'
            fctx.fillRect(0, 0, 400, 300)
            fctx.fillStyle = '#999'
            fctx.font = '16px sans-serif'
            fctx.textAlign = 'center'
            fctx.fillText('Image unavailable', 200, 155)
          }
          fallback.src = fc.toDataURL()
        }
        img.src = src
      })
    }

    Promise.all(tiles.map((t) => loadImage(t.dataUrl))).then((images) => {
      ctx.fillStyle = collage.bgColor
      ctx.fillRect(0, 0, width, height)

      if (collage.title) {
        ctx.fillStyle = collage.bgColor === '#ffffff' || collage.bgColor === '#e8e8e8' || collage.bgColor === '#f5f0e1' ? '#333333' : '#ffffff'
        ctx.font = 'bold 24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(collage.title, width / 2, 35)
      }
      if (collage.subtitle) {
        ctx.fillStyle = collage.bgColor === '#ffffff' || collage.bgColor === '#e8e8e8' || collage.bgColor === '#f5f0e1' ? '#666666' : '#cccccc'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(collage.subtitle, width / 2, titleHeight + 20)
      }

      ctx.fillStyle = collage.bgColor === '#ffffff' || collage.bgColor === '#e8e8e8' || collage.bgColor === '#f5f0e1' ? '#999999' : '#777777'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('© OpenStreetMap contributors · MapLibre Explorer', width / 2, height - 8)

      renderTiles(images)
    })
  }, [collage, customRows, customCols])

  useEffect(() => {
    if (collageCreatorOpen) {
      renderCollagePreview()
    }
  }, [collageCreatorOpen, collage, renderCollagePreview])

  const exportAsPng = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${collage.name.replace(/\s+/g, '_')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('Collage exported as PNG!')
  }, [collage.name])

  const exportAsPdf = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>${collage.name}</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff;">
          <img src="${dataUrl}" alt="Map collage export" style="max-width:100%;max-height:100vh;" />
        </body></html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
      toast.success('PDF export opened in new window!')
    }
  }, [collage.name])

  const shareViaUrl = useCallback(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.set('collage', collage.id)
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Share URL copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy URL')
    })
  }, [collage.id])

  const isLightBg = collage.bgColor === '#ffffff' || collage.bgColor === '#e8e8e8' || collage.bgColor === '#f5f0e1'
  const maxTiles = LAYOUT_TEMPLATES.find((t) => t.id === collage.layout)?.maxTiles ?? 12

  return (
    <Dialog open={collageCreatorOpen} onOpenChange={setCollageCreatorOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-emerald-500" />
            Map Collage Creator
          </DialogTitle>
          <DialogDescription>
            Create beautiful map collages from multiple map views. Capture views, choose layouts, and export your creation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left: Controls */}
          <div className="space-y-5">
            {/* Collage Name */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Collage Name</Label>
              <Input
                value={collage.name}
                onChange={(e) => updateCollage({ name: e.target.value })}
                placeholder="My Map Collage"
                className="h-9"
              />
            </div>

            {/* Layout Template */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Layout Template</Label>
              <div className="grid grid-cols-3 gap-2">
                {LAYOUT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateCollage({ layout: t.id })}
                    className={`p-2 rounded-lg border text-xs text-center transition-all ${
                      collage.layout === t.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'border-border hover:border-emerald-300'
                    }`}
                  >
                    <div className="font-medium">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Grid Size */}
            {collage.layout === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Rows: {customRows}</Label>
                  <Slider
                    value={[customRows]}
                    onValueChange={([v]) => setCustomRows(v)}
                    min={1}
                    max={4}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Columns: {customCols}</Label>
                  <Slider
                    value={[customCols]}
                    onValueChange={([v]) => setCustomCols(v)}
                    min={1}
                    max={4}
                    step={1}
                  />
                </div>
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Title</Label>
                <Input
                  value={collage.title}
                  onChange={(e) => updateCollage({ title: e.target.value })}
                  placeholder="Collage title..."
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Subtitle</Label>
                <Input
                  value={collage.subtitle}
                  onChange={(e) => updateCollage({ subtitle: e.target.value })}
                  placeholder="Description..."
                  className="h-9"
                />
              </div>
            </div>

            {/* Customization */}
            <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
              <Label className="text-xs font-medium">Customization</Label>
              <div className="space-y-2">
                <Label className="text-[11px] text-muted-foreground">Background Color</Label>
                <div className="flex flex-wrap gap-2">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => updateCollage({ bgColor: c.value })}
                      className={`w-7 h-7 rounded-md border-2 transition-all ${
                        collage.bgColor === c.value ? 'border-emerald-500 scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                      aria-label={c.label}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Spacing: {collage.spacing}px</Label>
                <Slider
                  value={[collage.spacing]}
                  onValueChange={([v]) => updateCollage({ spacing: v })}
                  min={0}
                  max={24}
                  step={2}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Border Radius: {collage.borderRadius}px</Label>
                <Slider
                  value={[collage.borderRadius]}
                  onValueChange={([v]) => updateCollage({ borderRadius: v })}
                  min={0}
                  max={24}
                  step={2}
                />
              </div>
            </div>

            {/* Capture Controls */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Add Tiles ({collage.tiles.length}/{maxTiles})</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={captureCurrentView}
                  disabled={collage.tiles.length >= maxTiles}
                >
                  <Camera className="h-3.5 w-3.5 mr-1" />
                  Capture Current View
                </Button>
              </div>
              {savedLocations.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Auto-navigate & Capture</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                    {savedLocations.slice(0, 10).map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => navigateAndCapture(loc.latitude, loc.longitude)}
                        disabled={collage.tiles.length >= maxTiles}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md border border-border hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: loc.color }} />
                        <span className="truncate flex-1 text-left">{loc.name}</span>
                        <Plus className="h-3 w-3 text-emerald-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tile List */}
            {collage.tiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Tiles</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {collage.tiles.map((tile, idx) => (
                    <div
                      key={tile.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                        selectedTileIndex === idx
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : 'border-border hover:border-emerald-300'
                      }`}
                      onClick={() => setSelectedTileIndex(selectedTileIndex === idx ? null : idx)}
                    >
                      <div className="w-12 h-9 rounded overflow-hidden bg-muted shrink-0">
                        {tile.dataUrl && (
                          <img src={tile.dataUrl} alt={tile.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          value={tile.title}
                          onChange={(e) => updateTile(tile.id, { title: e.target.value })}
                          className="h-6 text-xs px-1.5 py-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Style: {tile.style}
                        </div>
                      </div>
                      <Select
                        value={tile.style}
                        onValueChange={(val) => updateTile(tile.id, { style: val })}
                      >
                        <SelectTrigger className="h-6 w-20 text-[10px] px-1" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MAP_STYLES.map((s) => (
                            <SelectItem key={s.id} value={s.name} className="text-xs">
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTile(tile.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Preview & Export */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Preview</Label>
              <div className={`rounded-xl border overflow-hidden ${isLightBg ? 'bg-white' : 'bg-gray-900'}`}>
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Export</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs"
                  onClick={exportAsPng}
                  disabled={collage.tiles.length === 0}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  PNG
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs"
                  onClick={exportAsPdf}
                  disabled={collage.tiles.length === 0}
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs"
                  onClick={shareViaUrl}
                  disabled={collage.tiles.length === 0}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-3 rounded-lg bg-muted/30 border">
              <div className="flex items-center gap-1.5 mb-2">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-medium">Tips</span>
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>• Navigate to an interesting view, then click &quot;Capture Current View&quot;</li>
                <li>• Click a saved location to auto-fly and capture it</li>
                <li>• Change map styles between captures for variety</li>
                <li>• Use 1+3 or 3+1 layouts for hero+detail compositions</li>
                <li>• Adjust spacing and border radius for polished look</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
