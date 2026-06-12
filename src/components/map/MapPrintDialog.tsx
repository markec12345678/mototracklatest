'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Printer,
  FileDown,
  Type,
  Compass,
  Ruler,
  MapPin,
  Calendar,
  Layers,
  Loader2,
  Image as ImageIcon,
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore } from '@/lib/map-store'
import { toast } from 'sonner'

type Orientation = 'landscape' | 'portrait'
type PaperSize = 'a4' | 'a3' | 'letter' | 'legal'

interface PrintOptions {
  title: string
  orientation: Orientation
  paperSize: PaperSize
  showLegend: boolean
  showScaleBar: boolean
  showNorthArrow: boolean
  showCoordinates: boolean
  showDateTime: boolean
  showStyleName: boolean
}

const PAPER_SIZES: Record<PaperSize, { label: string; widthMm: number; heightMm: number }> = {
  a4: { label: 'A4', widthMm: 297, heightMm: 210 },
  a3: { label: 'A3', widthMm: 420, heightMm: 297 },
  letter: { label: 'Letter', widthMm: 279, heightMm: 216 },
  legal: { label: 'Legal', widthMm: 356, heightMm: 216 },
}

export function MapPrintDialog() {
  const printDialogOpen = useMapStore((s) => s.printDialogOpen)
  const setPrintDialogOpen = useMapStore((s) => s.setPrintDialogOpen)
  const currentStyle = useMapStore((s) => s.currentStyle)
  const center = useMapStore((s) => s.center)
  const zoom = useMapStore((s) => s.zoom)
  const bearing = useMapStore((s) => s.bearing)

  const [options, setOptions] = useState<PrintOptions>({
    title: '',
    orientation: 'landscape',
    paperSize: 'a4',
    showLegend: true,
    showScaleBar: true,
    showNorthArrow: true,
    showCoordinates: true,
    showDateTime: true,
    showStyleName: false,
  })

  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const captureScreenshot = useCallback(async () => {
    if (typeof window === 'undefined') return null
    const takeScreenshot = (window as unknown as Record<string, () => Promise<string> | string>).__mapScreenshot
    if (!takeScreenshot) {
      toast.error('Screenshot not available. Make sure the map is loaded.')
      return null
    }
    setIsCapturing(true)
    try {
      const result = takeScreenshot()
      const url = result instanceof Promise ? await result : result
      setScreenshotUrl(url)
      return url
    } catch {
      toast.error('Failed to capture map screenshot')
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setPrintDialogOpen(open)
    if (open) {
      captureScreenshot()
    } else {
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl)
      }
      setScreenshotUrl(null)
    }
  }, [setPrintDialogOpen, captureScreenshot, screenshotUrl])

  const updateOption = <K extends keyof PrintOptions>(key: K, value: PrintOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const getPreviewAspect = () => {
    const paper = PAPER_SIZES[options.paperSize]
    const isLandscape = options.orientation === 'landscape'
    const w = isLandscape ? paper.widthMm : paper.heightMm
    const h = isLandscape ? paper.heightMm : paper.widthMm
    return { width: w, height: h }
  }

  const handlePrint = useCallback(async () => {
    const imgUrl = screenshotUrl || (await captureScreenshot())
    if (!imgUrl) return

    const paper = PAPER_SIZES[options.paperSize]
    const isLandscape = options.orientation === 'landscape'
    const pageWidth = isLandscape ? paper.widthMm : paper.heightMm
    const pageHeight = isLandscape ? paper.heightMm : paper.widthMm

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const coordStr = `${center[1].toFixed(5)}, ${center[0].toFixed(5)}`

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Could not open print window. Please allow popups.')
      return
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${options.title || 'Map Print'}</title>
  <style>
    @page {
      size: ${pageWidth}mm ${pageHeight}mm;
      margin: 10mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      width: 100%;
      height: 100%;
    }
    .print-page {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .print-header {
      text-align: center;
      padding-bottom: 8px;
      border-bottom: 2px solid #10b981;
      margin-bottom: 8px;
    }
    .print-header h1 {
      font-size: 20px;
      font-weight: 700;
      color: #064e3b;
    }
    .map-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      min-height: 0;
    }
    .map-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }
    .print-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
      margin-top: 8px;
      font-size: 11px;
      color: #6b7280;
      flex-wrap: wrap;
      gap: 8px;
    }
    .footer-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .north-arrow {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 36px;
      height: 36px;
      background: rgba(255,255,255,0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      transform: rotate(${-bearing}deg);
    }
    .scale-bar {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(255,255,255,0.9);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .legend {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(255,255,255,0.9);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .legend-title { font-weight: 600; margin-bottom: 4px; }
    .legend-item { display: flex; align-items: center; gap: 4px; margin: 2px 0; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="print-page">
    ${options.title ? `<div class="print-header"><h1>${options.title}</h1></div>` : ''}
    <div class="map-container">
      <img src="${imgUrl}" alt="Map" />
      ${options.showNorthArrow ? `<div class="north-arrow">⬆</div>` : ''}
      ${options.showScaleBar ? `<div class="scale-bar">Zoom: ${zoom.toFixed(1)}</div>` : ''}
      ${options.showLegend ? `<div class="legend">
        <div class="legend-title">Legend</div>
        <div class="legend-item"><span class="legend-dot" style="background:#ef4444"></span> Markers</div>
        <div class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span> Routes</div>
        <div class="legend-item"><span class="legend-dot" style="background:#22c55e"></span> Drawings</div>
      </div>` : ''}
    </div>
    <div class="print-footer">
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        ${options.showCoordinates ? `<div class="footer-item"><span>📍</span> ${coordStr}</div>` : ''}
        ${options.showStyleName ? `<div class="footer-item"><span>🗺️</span> ${currentStyle.name}</div>` : ''}
      </div>
      <div>
        ${options.showDateTime ? `<div class="footer-item"><span>📅</span> ${dateStr}</div>` : ''}
      </div>
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`)
    printWindow.document.close()
    setPrintDialogOpen(false)
  }, [screenshotUrl, captureScreenshot, options, center, zoom, bearing, currentStyle, setPrintDialogOpen])

  const handleExportPDF = useCallback(async () => {
    await handlePrint()
    toast.success('Print dialog opened — select "Save as PDF" as the destination to export as PDF')
  }, [handlePrint])

  const previewAspect = getPreviewAspect()
  const aspectRatio = previewAspect.width / previewAspect.height

  return (
    <Dialog open={printDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-emerald-600" />
            Print Map
          </DialogTitle>
          <DialogDescription>
            Customize your print layout and export the current map view.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Preview */}
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3" />
                Preview
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={captureScreenshot}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
            <div
              ref={previewRef}
              className="bg-white rounded-lg border overflow-hidden mx-auto"
              style={{
                maxWidth: '100%',
                aspectRatio: `${aspectRatio}`,
              }}
            >
              {isCapturing ? (
                <div className="flex items-center justify-center h-full bg-muted/20">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : screenshotUrl ? (
                <img
                  src={screenshotUrl}
                  alt="Map preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted/20 text-muted-foreground text-sm">
                  Click refresh to capture map
                </div>
              )}
              {/* Preview overlays */}
              {screenshotUrl && (
                <div className="relative -mt-full h-full pointer-events-none">
                  {options.showNorthArrow && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-sm shadow-sm"
                      style={{ transform: `rotate(${-bearing}deg)` }}>
                      ⬆
                    </div>
                  )}
                  {options.title && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-2">
                      <p className="text-white text-xs font-semibold truncate">{options.title}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-emerald-600" />
              Title
            </Label>
            <Input
              placeholder="Enter a title for the print..."
              value={options.title}
              onChange={(e) => updateOption('title', e.target.value)}
              className="h-9"
            />
          </div>

          {/* Orientation & Paper Size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Orientation</Label>
              <Select
                value={options.orientation}
                onValueChange={(v) => updateOption('orientation', v as Orientation)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Paper Size</Label>
              <Select
                value={options.paperSize}
                onValueChange={(v) => updateOption('paperSize', v as PaperSize)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="a3">A3</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Include Options */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Include Options</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                <Checkbox
                  checked={options.showLegend}
                  onCheckedChange={(checked) => updateOption('showLegend', !!checked)}
                />
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs">Legend</span>
                </div>
              </label>
              <label className="flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                <Checkbox
                  checked={options.showScaleBar}
                  onCheckedChange={(checked) => updateOption('showScaleBar', !!checked)}
                />
                <div className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs">Scale Bar</span>
                </div>
              </label>
              <label className="flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                <Checkbox
                  checked={options.showNorthArrow}
                  onCheckedChange={(checked) => updateOption('showNorthArrow', !!checked)}
                />
                <div className="flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs">North Arrow</span>
                </div>
              </label>
              <label className="flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                <Checkbox
                  checked={options.showCoordinates}
                  onCheckedChange={(checked) => updateOption('showCoordinates', !!checked)}
                />
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs">Coordinates</span>
                </div>
              </label>
              <label className="flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                <Checkbox
                  checked={options.showDateTime}
                  onCheckedChange={(checked) => updateOption('showDateTime', !!checked)}
                />
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs">Date/Time</span>
                </div>
              </label>
              <label className="flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                <Checkbox
                  checked={options.showStyleName}
                  onCheckedChange={(checked) => updateOption('showStyleName', !!checked)}
                />
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs">Style Name</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setPrintDialogOpen(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={isCapturing || !screenshotUrl}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <FileDown className="h-4 w-4 mr-1.5" />
            Export PDF
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isCapturing || !screenshotUrl}
            className="rounded-xl"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
