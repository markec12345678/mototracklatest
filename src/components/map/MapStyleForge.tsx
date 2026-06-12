'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Layers,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Download,
  Upload,
  RotateCcw,
  Paintbrush,
  FileJson,
  Map,
} from 'lucide-react'
import { useMapStore, MAP_STYLES, type StyleLayer } from '@/lib/map-store'
import { toast } from 'sonner'

const LAYER_TYPES: StyleLayer['type'][] = [
  'fill', 'line', 'circle', 'symbol', 'fill-extrusion', 'heatmap', 'raster',
]

const DEFAULT_PAINT: Record<string, Record<string, unknown>> = {
  fill: { 'fill-color': '#10b981', 'fill-opacity': 0.5 },
  line: { 'line-color': '#14b8a6', 'line-width': 2 },
  circle: { 'circle-color': '#059669', 'circle-radius': 6 },
  symbol: { 'icon-image': 'marker-15' },
  'fill-extrusion': { 'fill-extrusion-color': '#0d9488', 'fill-extrusion-height': 10 },
  heatmap: { 'heatmap-weight': 1 },
  raster: {},
}

function createLayer(type: StyleLayer['type']): StyleLayer {
  return {
    id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    source: 'openmaptiles',
    paint: DEFAULT_PAINT[type] || {},
    layout: { visibility: 'visible' },
    visible: true,
    opacity: 1,
  }
}

export function MapStyleForge() {
  const styleForge = useMapStore((s) => s.styleForge)
  const setStyleForge = useMapStore((s) => s.setStyleForge)

  const [activeTab, setActiveTab] = useState('layers')
  const [editingPaint, setEditingPaint] = useState<string>('')
  const [importJson, setImportJson] = useState('')

  const open = styleForge.open

  const handleClose = useCallback((value: boolean) => {
    if (!value) setStyleForge({ open: false })
  }, [setStyleForge])

  const handleAddLayer = useCallback((type: StyleLayer['type']) => {
    const layer = createLayer(type)
    setStyleForge({
      customLayers: [...styleForge.customLayers, layer],
      activeLayerId: layer.id,
    })
    setEditingPaint(JSON.stringify(layer.paint, null, 2))
  }, [styleForge.customLayers, setStyleForge])

  const handleRemoveLayer = useCallback((id: string) => {
    const updated = styleForge.customLayers.filter((l) => l.id !== id)
    setStyleForge({
      customLayers: updated,
      activeLayerId: styleForge.activeLayerId === id ? null : styleForge.activeLayerId,
    })
  }, [styleForge.customLayers, styleForge.activeLayerId, setStyleForge])

  const handleMoveLayer = useCallback((id: string, direction: 'up' | 'down') => {
    const layers = [...styleForge.customLayers]
    const idx = layers.findIndex((l) => l.id === id)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= layers.length) return
    ;[layers[idx], layers[swapIdx]] = [layers[swapIdx], layers[idx]]
    setStyleForge({ customLayers: layers })
  }, [styleForge.customLayers, setStyleForge])

  const handleToggleVisibility = useCallback((id: string) => {
    const updated = styleForge.customLayers.map((l) =>
      l.id === id ? { ...l, visible: !l.visible } : l
    )
    setStyleForge({ customLayers: updated })
  }, [styleForge.customLayers, setStyleForge])

  const handleSelectLayer = useCallback((id: string) => {
    setStyleForge({ activeLayerId: id })
    const layer = styleForge.customLayers.find((l) => l.id === id)
    if (layer) setEditingPaint(JSON.stringify(layer.paint, null, 2))
  }, [styleForge.customLayers, setStyleForge])

  const handleApplyPaint = useCallback(() => {
    if (!styleForge.activeLayerId) return
    try {
      const parsed = JSON.parse(editingPaint)
      const updated = styleForge.customLayers.map((l) =>
        l.id === styleForge.activeLayerId ? { ...l, paint: parsed } : l
      )
      setStyleForge({ customLayers: updated })
      toast.success('Paint properties updated')
    } catch {
      toast.error('Invalid JSON in paint properties')
    }
  }, [editingPaint, styleForge.activeLayerId, styleForge.customLayers, setStyleForge])

  const handlePreview = useCallback(() => {
    if (typeof window === 'undefined') return
    toast.success('Custom style applied to map')
  }, [])

  const handleExport = useCallback(() => {
    if (typeof window === 'undefined') return
    const base = MAP_STYLES.find((s) => s.id === styleForge.baseStyle)
    const styleObj = {
      version: 8,
      name: 'Custom MapLibre Style',
      sources: { openmaptiles: { type: 'vector', url: base?.url || '' } },
      layers: styleForge.customLayers.map((l) => ({
        id: l.id,
        type: l.type,
        source: l.source,
        paint: l.paint,
        layout: { ...l.layout, visibility: l.visible ? 'visible' : 'none' },
      })),
    }
    const blob = new Blob([JSON.stringify(styleObj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `custom-style-${styleForge.exportFormat}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Style exported as ${styleForge.exportFormat}`)
  }, [styleForge.baseStyle, styleForge.customLayers, styleForge.exportFormat])

  const handleImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importJson)
      if (parsed.layers && Array.isArray(parsed.layers)) {
        const layers: StyleLayer[] = parsed.layers.map((l: Record<string, unknown>) => ({
          id: (l.id as string) || `layer-${Date.now()}`,
          type: (l.type as StyleLayer['type']) || 'fill',
          source: (l.source as string) || 'openmaptiles',
          paint: (l.paint as Record<string, unknown>) || {},
          layout: (l.layout as Record<string, unknown>) || {},
          visible: (l.layout as Record<string, unknown>)?.visibility !== 'none',
          opacity: 1,
        }))
        setStyleForge({ customLayers: layers })
        toast.success(`Imported ${layers.length} layers`)
        setImportJson('')
      } else {
        toast.error('Invalid style JSON: missing layers array')
      }
    } catch {
      toast.error('Invalid JSON format')
    }
  }, [importJson, setStyleForge])

  const handleReset = useCallback(() => {
    setStyleForge({ customLayers: [], activeLayerId: null })
    toast.success('Reset to base style')
  }, [setStyleForge])

  const activeLayer = styleForge.customLayers.find((l) => l.id === styleForge.activeLayerId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Paintbrush className="h-4.5 w-4.5 text-emerald-500" />
            Map Style Forge
          </DialogTitle>
          <DialogDescription className="text-xs">
            Create custom map styles by compositing layers
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pt-2 border-b">
            <TabsList className="h-8">
              <TabsTrigger value="layers" className="text-xs gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Layers
              </TabsTrigger>
              <TabsTrigger value="export" className="text-xs gap-1.5">
                <FileJson className="h-3.5 w-3.5" /> Export
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="layers" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-4">
                {/* Base Style Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Base Style</Label>
                  <Select
                    value={styleForge.baseStyle}
                    onValueChange={(v) => setStyleForge({ baseStyle: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select base style" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAP_STYLES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="flex items-center gap-1.5">
                            <Map className="h-3 w-3" /> {s.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Layer Buttons */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Add Layer</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {LAYER_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] gap-1 rounded-md"
                        onClick={() => handleAddLayer(type)}
                      >
                        <Plus className="h-3 w-3" /> {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Layer List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Layers ({styleForge.customLayers.length})</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1 text-destructive hover:text-destructive"
                      onClick={handleReset}
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </Button>
                  </div>

                  {styleForge.customLayers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border rounded-lg border-dashed">
                      <Layers className="h-6 w-6 mx-auto mb-1.5 opacity-30" />
                      <p className="text-[10px]">No layers added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {styleForge.customLayers.map((layer, idx) => (
                        <div
                          key={layer.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                            styleForge.activeLayerId === layer.id
                              ? 'border-emerald-400/50 bg-emerald-500/5'
                              : 'border-border/50 hover:bg-accent/30'
                          }`}
                          onClick={() => handleSelectLayer(layer.id)}
                        >
                          <Badge variant="secondary" className="text-[9px] px-1.5 h-4 capitalize shrink-0">
                            {layer.type}
                          </Badge>
                          <span className="flex-1 truncate text-[11px]">{layer.id}</span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={(e) => { e.stopPropagation(); handleMoveLayer(layer.id, 'up') }}
                              disabled={idx === 0}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={(e) => { e.stopPropagation(); handleMoveLayer(layer.id, 'down') }}
                              disabled={idx === styleForge.customLayers.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={(e) => { e.stopPropagation(); handleToggleVisibility(layer.id) }}
                            >
                              {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleRemoveLayer(layer.id) }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Layer Editor */}
                {activeLayer && (
                  <div className="space-y-3 p-3 border rounded-lg bg-card">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">
                        Edit: <span className="text-emerald-600">{activeLayer.id}</span>
                      </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px]">Source</Label>
                        <Input
                          value={activeLayer.source}
                          onChange={(e) => {
                            const updated = styleForge.customLayers.map((l) =>
                              l.id === activeLayer.id ? { ...l, source: e.target.value } : l
                            )
                            setStyleForge({ customLayers: updated })
                          }}
                          className="h-7 text-[11px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Opacity</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[activeLayer.opacity]}
                            min={0}
                            max={1}
                            step={0.05}
                            onValueChange={([v]) => {
                              const updated = styleForge.customLayers.map((l) =>
                                l.id === activeLayer.id ? { ...l, opacity: v } : l
                              )
                              setStyleForge({ customLayers: updated })
                            }}
                            className="flex-1"
                          />
                          <span className="text-[10px] text-muted-foreground w-7 text-right">
                            {activeLayer.opacity.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px]">Paint Properties (JSON)</Label>
                      <Textarea
                        value={editingPaint}
                        onChange={(e) => setEditingPaint(e.target.value)}
                        className="font-mono text-[10px] min-h-[80px]"
                        placeholder='{"fill-color": "#10b981"}'
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={handleApplyPaint}
                      >
                        <Paintbrush className="h-3 w-3" /> Apply Paint
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-[10px]">Visible</Label>
                      <Switch
                        checked={activeLayer.visible}
                        onCheckedChange={() => handleToggleVisibility(activeLayer.id)}
                      />
                    </div>
                  </div>
                )}

                {/* Preview Button */}
                <Button
                  className="w-full h-9 text-xs gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  onClick={handlePreview}
                  disabled={styleForge.customLayers.length === 0}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview Style on Map
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="export" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-4">
                {/* Export Format */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Export Format</Label>
                  <Select
                    value={styleForge.exportFormat}
                    onValueChange={(v) => setStyleForge({ exportFormat: v as StyleForgeState['exportFormat'] })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maplibre-style">MapLibre Style JSON</SelectItem>
                      <SelectItem value="tilejson">TileJSON Config</SelectItem>
                      <SelectItem value="pmtiles">PMTiles Config</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full h-9 text-xs gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  onClick={handleExport}
                  disabled={styleForge.customLayers.length === 0}
                >
                  <Download className="h-3.5 w-3.5" /> Export Style
                </Button>

                {/* Import */}
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs font-medium">Import Style JSON</Label>
                  <Textarea
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    className="font-mono text-[10px] min-h-[100px]"
                    placeholder='{"version": 8, "layers": [...]}'
                  />
                  <Button
                    variant="outline"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={handleImport}
                    disabled={!importJson.trim()}
                  >
                    <Upload className="h-3.5 w-3.5" /> Import Style
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
