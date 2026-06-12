'use client'

import { useState, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type ScreenshotEntry } from '@/lib/map-store'
import { Image as ImageIcon, Download, Trash2, Grid, List, Columns, Camera } from 'lucide-react'
import { toast } from 'sonner'

type ViewMode = 'capture' | 'gallery' | 'compare'
type GalleryLayout = 'grid' | 'list'

export function ScreenshotManager() {
  const open = useMapStore((s) => s.screenshotManagerOpen)
  const setOpen = useMapStore((s) => s.setScreenshotManagerOpen)
  const savedScreenshots = useMapStore((s) => s.savedScreenshots)
  const addScreenshot = useMapStore((s) => s.addScreenshot)
  const removeScreenshot = useMapStore((s) => s.removeScreenshot)
  const clearScreenshots = useMapStore((s) => s.clearScreenshots)
  const center = useMapStore((s) => s.center)
  const zoom = useMapStore((s) => s.zoom)
  const currentStyle = useMapStore((s) => s.currentStyle)

  const [viewMode, setViewMode] = useState<ViewMode>('capture')
  const [galleryLayout, setGalleryLayout] = useState<GalleryLayout>('grid')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const [quality, setQuality] = useState(80)
  const [includeMarkers, setIncludeMarkers] = useState(true)
  const [includeRoutes, setIncludeRoutes] = useState(true)
  const [includeOverlays, setIncludeOverlays] = useState(true)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [compareSliderPos, setCompareSliderPos] = useState(50)
  const [viewingScreenshot, setViewingScreenshot] = useState<ScreenshotEntry | null>(null)
  const [selectedForBatch, setSelectedForBatch] = useState<Set<string>>(new Set())
  const compareContainerRef = useRef<HTMLDivElement>(null)
  const [compareContainerWidth, setCompareContainerWidth] = useState(0)

  const handleCapture = useCallback(() => {
    if (typeof window === 'undefined') return
    const mapScreenshot = (window as any).__mapScreenshot
    if (!mapScreenshot) {
      toast.error('Map screenshot not available')
      return
    }

    try {
      const dataUrl = mapScreenshot() as string
      const entry: ScreenshotEntry = {
        id: `screenshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim() || `Screenshot ${savedScreenshots.length + 1}`,
        description: description.trim(),
        dataUrl,
        format,
        quality: format === 'jpeg' ? quality : 100,
        timestamp: Date.now(),
        center: [center[0], center[1]],
        zoom,
        style: currentStyle.id,
      }
      addScreenshot(entry)
      setTitle('')
      setDescription('')
      toast.success('Screenshot captured!')
      setViewMode('gallery')
    } catch {
      toast.error('Failed to capture screenshot')
    }
  }, [title, description, format, quality, center, zoom, currentStyle, savedScreenshots.length, addScreenshot])

  const handleDownload = useCallback((entry: ScreenshotEntry) => {
    const link = document.createElement('a')
    link.download = `${entry.title.replace(/[^a-zA-Z0-9]/g, '_')}.${entry.format}`
    link.href = entry.dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Screenshot downloaded')
  }, [])

  const handleDelete = useCallback((id: string) => {
    removeScreenshot(id)
    setSelectedForBatch((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    toast.success('Screenshot deleted')
  }, [removeScreenshot])

  const handleBatchDelete = useCallback(() => {
    if (selectedForBatch.size === 0) return
    selectedForBatch.forEach((id) => removeScreenshot(id))
    setSelectedForBatch(new Set())
    toast.success(`${selectedForBatch.size} screenshots deleted`)
  }, [selectedForBatch, removeScreenshot])

  const handleDownloadAll = useCallback(() => {
    if (savedScreenshots.length === 0) return
    savedScreenshots.forEach((entry, i) => {
      setTimeout(() => handleDownload(entry), i * 200)
    })
    toast.success(`Downloading ${savedScreenshots.length} screenshots`)
  }, [savedScreenshots, handleDownload])

  const toggleCompareSelection = useCallback((id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }, [])

  const toggleBatchSelection = useCallback((id: string) => {
    setSelectedForBatch((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString()
  }

  const compareLeft = savedScreenshots.find((s) => s.id === selectedForCompare[0])
  const compareRight = savedScreenshots.find((s) => s.id === selectedForCompare[1])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Camera className="h-5 w-5 text-emerald-500" />
            Screenshot Manager
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 px-6 border-b pb-2">
          {[
            { mode: 'capture' as ViewMode, label: 'Capture', icon: Camera },
            { mode: 'gallery' as ViewMode, label: 'Gallery', icon: ImageIcon },
            { mode: 'compare' as ViewMode, label: 'Compare', icon: Columns },
          ].map((tab) => (
            <Button
              key={tab.mode}
              variant={viewMode === tab.mode ? 'default' : 'ghost'}
              size="sm"
              className={`text-xs h-8 gap-1.5 ${viewMode === tab.mode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              onClick={() => setViewMode(tab.mode)}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </Button>
          ))}
          <div className="flex-1" />
          {savedScreenshots.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {savedScreenshots.length} saved
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* CAPTURE VIEW */}
          {viewMode === 'capture' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Preview / Settings */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                    <Input
                      placeholder="Screenshot title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                    <Input
                      placeholder="Optional description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Format</label>
                    <div className="flex gap-2">
                      <Button
                        variant={format === 'png' ? 'default' : 'outline'}
                        size="sm"
                        className={`text-xs h-8 ${format === 'png' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                        onClick={() => setFormat('png')}
                      >
                        PNG
                      </Button>
                      <Button
                        variant={format === 'jpeg' ? 'default' : 'outline'}
                        size="sm"
                        className={`text-xs h-8 ${format === 'jpeg' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                        onClick={() => setFormat('jpeg')}
                      >
                        JPEG
                      </Button>
                    </div>
                  </div>
                  {format === 'jpeg' && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Quality: {quality}%
                      </label>
                      <Slider
                        value={[quality]}
                        onValueChange={([v]) => setQuality(v)}
                        min={10}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                  <Separator />
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Include Layers</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeMarkers}
                          onChange={(e) => setIncludeMarkers(e.target.checked)}
                          className="rounded"
                        />
                        Markers
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeRoutes}
                          onChange={(e) => setIncludeRoutes(e.target.checked)}
                          className="rounded"
                        />
                        Routes
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeOverlays}
                          onChange={(e) => setIncludeOverlays(e.target.checked)}
                          className="rounded"
                        />
                        UI Overlays
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right: Info & Capture Button */}
                <div className="space-y-3">
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                    <h4 className="text-xs font-semibold">Current Map View</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Center: {center[1].toFixed(4)}, {center[0].toFixed(4)}</p>
                      <p>Zoom: {zoom.toFixed(2)}</p>
                      <p>Style: {currentStyle.name}</p>
                      <p>Timestamp: {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full h-12 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleCapture}
                  >
                    <Camera className="h-4 w-4" />
                    Capture Screenshot
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* GALLERY VIEW */}
          {viewMode === 'gallery' && (
            <div className="space-y-3">
              {/* Gallery toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={galleryLayout === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setGalleryLayout('grid')}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={galleryLayout === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setGalleryLayout('list')}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                {selectedForBatch.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete ({selectedForBatch.size})
                  </Button>
                )}
                {savedScreenshots.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={handleDownloadAll}
                    >
                      <Download className="h-3 w-3" />
                      Download All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1 text-red-500 hover:text-red-600"
                      onClick={() => {
                        clearScreenshots()
                        setSelectedForBatch(new Set())
                        toast.success('All screenshots cleared')
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear All
                    </Button>
                  </>
                )}
              </div>

              {savedScreenshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-3 opacity-30" aria-hidden="true" />
                  <p className="text-sm">No screenshots yet</p>
                  <p className="text-xs">Capture your first screenshot from the Capture tab</p>
                </div>
              ) : galleryLayout === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {savedScreenshots.map((entry) => (
                    <div
                      key={entry.id}
                      className="relative group rounded-xl border overflow-hidden bg-muted/20 hover:shadow-md transition-shadow"
                    >
                      <div
                        className="aspect-video bg-muted cursor-pointer"
                        onClick={() => setViewingScreenshot(entry)}
                      >
                        <img
                          src={entry.dataUrl}
                          alt={entry.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="flex items-start gap-1">
                          <p className="text-xs font-medium truncate flex-1">{entry.title}</p>
                          <input
                            type="checkbox"
                            checked={selectedForBatch.has(entry.id)}
                            onChange={() => toggleBatchSelection(entry.id)}
                            className="mt-0.5 shrink-0"
                            aria-label={`Select ${entry.title}`}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">
                            {entry.format.toUpperCase()}
                          </Badge>
                          <span className="text-[9px] text-muted-foreground">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDownload(entry)}
                          aria-label={`Download ${entry.title}`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => handleDelete(entry.id)}
                          aria-label={`Delete ${entry.title}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {savedScreenshots.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-xl border p-2 hover:bg-accent/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedForBatch.has(entry.id)}
                        onChange={() => toggleBatchSelection(entry.id)}
                        className="shrink-0"
                        aria-label={`Select ${entry.title}`}
                      />
                      <div
                        className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer"
                        onClick={() => setViewingScreenshot(entry)}
                      >
                        <img
                          src={entry.dataUrl}
                          alt={entry.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-sm font-medium truncate">{entry.title}</p>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground truncate">{entry.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">
                            {entry.format.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            z{entry.zoom.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownload(entry)}
                          aria-label={`Download ${entry.title}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDelete(entry.id)}
                          aria-label={`Delete ${entry.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COMPARE VIEW */}
          {viewMode === 'compare' && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Select 2 screenshots to compare side by side
              </div>
              {savedScreenshots.length < 2 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Columns className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">Need at least 2 screenshots</p>
                  <p className="text-xs">Capture more screenshots to compare them</p>
                </div>
              ) : (
                <>
                  {/* Screenshot selector */}
                  <div className="flex gap-2 flex-wrap">
                    {savedScreenshots.map((entry) => (
                      <button
                        key={entry.id}
                        className={`relative rounded-lg border overflow-hidden w-24 h-16 transition-all ${
                          selectedForCompare.includes(entry.id)
                            ? 'ring-2 ring-emerald-500 ring-offset-1'
                            : 'hover:opacity-80'
                        }`}
                        onClick={() => toggleCompareSelection(entry.id)}
                      >
                        <img
                          src={entry.dataUrl}
                          alt={entry.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 truncate">
                          {entry.title}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Comparison display */}
                  {compareLeft && compareRight ? (
                    <div className="space-y-3">
                      {/* Side by side */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium truncate">{compareLeft.title}</p>
                          <div className="rounded-xl border overflow-hidden aspect-video">
                            <img
                              src={compareLeft.dataUrl}
                              alt={compareLeft.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {formatTimestamp(compareLeft.timestamp)} · z{compareLeft.zoom.toFixed(1)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium truncate">{compareRight.title}</p>
                          <div className="rounded-xl border overflow-hidden aspect-video">
                            <img
                              src={compareRight.dataUrl}
                              alt={compareRight.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {formatTimestamp(compareRight.timestamp)} · z{compareRight.zoom.toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {/* Slide overlay comparison */}
                      <div>
                        <h4 className="text-xs font-medium mb-2">Slide Comparison</h4>
                        <div
                          ref={compareContainerRef}
                          className="relative rounded-xl border overflow-hidden aspect-video cursor-ew-resize select-none"
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = ((e.clientX - rect.left) / rect.width) * 100
                            setCompareSliderPos(Math.max(0, Math.min(100, x)))
                            if (rect.width !== compareContainerWidth) {
                              setCompareContainerWidth(rect.width)
                            }
                          }}
                        >
                          <img
                            src={compareRight.dataUrl}
                            alt={compareRight.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: `${compareSliderPos}%` }}
                          >
                            <img
                              src={compareLeft.dataUrl}
                              alt={compareLeft.title}
                              className="w-full h-full object-cover"
                              style={{ width: compareContainerWidth ? `${compareContainerWidth}px` : '100%' }}
                            />
                          </div>
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                            style={{ left: `${compareSliderPos}%` }}
                          >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center">
                              <Columns className="h-3 w-3 text-gray-600" />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                          <span>{compareLeft.title}</span>
                          <span>{compareRight.title}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-xs">
                      Click 2 screenshots above to start comparing
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Full-size screenshot viewer overlay */}
        {viewingScreenshot && (
          <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewingScreenshot(null)}
          >
            <div
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={viewingScreenshot.dataUrl}
                alt={viewingScreenshot.title}
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
                  <p className="text-sm font-medium">{viewingScreenshot.title}</p>
                  {viewingScreenshot.description && (
                    <p className="text-xs opacity-80">{viewingScreenshot.description}</p>
                  )}
                  <p className="text-[10px] opacity-60 mt-1">
                    {formatTimestamp(viewingScreenshot.timestamp)} · {viewingScreenshot.format.toUpperCase()} · z{viewingScreenshot.zoom.toFixed(1)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => handleDownload(viewingScreenshot)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 gap-1 text-red-500"
                    onClick={() => {
                      handleDelete(viewingScreenshot.id)
                      setViewingScreenshot(null)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8"
                    onClick={() => setViewingScreenshot(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
