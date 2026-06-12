'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Server,
  Globe2,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type WMSTileSource } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PresetWMSSource {
  name: string
  url: string
  serviceType: 'wms' | 'wmts' | 'tms'
  layerName: string
  format: string
  description: string
}

const PRESET_WMS_SOURCES: PresetWMSSource[] = [
  {
    name: 'OpenSeaMap',
    url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    serviceType: 'tms',
    layerName: 'seamark',
    format: 'image/png',
    description: 'Nautical charts overlay with sea marks',
  },
  {
    name: 'USGS Topo',
    url: 'https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMS',
    serviceType: 'wms',
    layerName: '0',
    format: 'image/png',
    description: 'USGS topographic maps',
  },
  {
    name: 'ESA WorldCover',
    url: 'https://services.terrascope.be/wms/v2',
    serviceType: 'wms',
    layerName: 'WORLDCOVER_2021_MAP',
    format: 'image/png',
    description: 'ESA WorldCover land cover classification',
  },
  {
    name: 'Open Weather Clouds',
    url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png',
    serviceType: 'tms',
    layerName: 'clouds_new',
    format: 'image/png',
    description: 'Cloud coverage overlay',
  },
  {
    name: 'Waymarked Trails Hiking',
    url: 'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png',
    serviceType: 'tms',
    layerName: 'hiking',
    format: 'image/png',
    description: 'Waymarked hiking trails overlay',
  },
  {
    name: 'Waymarked Trails Cycling',
    url: 'https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png',
    serviceType: 'tms',
    layerName: 'cycling',
    format: 'image/png',
    description: 'Waymarked cycling routes overlay',
  },
]

function buildWMSUrl(source: WMSTileSource): string {
  if (source.serviceType === 'tms') {
    return source.url
  }

  // Build WMS/WMTS GetMap URL
  const params = new URLSearchParams({
    service: source.serviceType === 'wmts' ? 'WMTS' : 'WMS',
    request: 'GetMap',
    version: source.serviceType === 'wmts' ? '1.0.0' : '1.1.1',
    layers: source.layerName,
    styles: '',
    srs: 'EPSG:3857',
    format: source.format,
    width: String(source.tileSize),
    height: String(source.tileSize),
    ...(source.serviceType === 'wmts'
      ? {
          tileMatrixSet: 'GoogleMapsCompatible',
          tileMatrix: '{z}',
          tileRow: '{y}',
          tileCol: '{x}',
        }
      : {
          bbox: '{bbox-epsg-3857}',
        }),
  })

  // Add custom params
  for (const [key, value] of Object.entries(source.customParams)) {
    if (key && value) {
      params.set(key, value)
    }
  }

  const separator = source.url.includes('?') ? '&' : '?'
  return source.url + separator + params.toString()
}

export function WMSTileDialog() {
  const wmsTileSources = useMapStore((s) => s.wmsTileSources)
  const addWMSTileSource = useMapStore((s) => s.addWMSTileSource)
  const removeWMSTileSource = useMapStore((s) => s.removeWMSTileSource)
  const toggleWMSTileSourceVisibility = useMapStore((s) => s.toggleWMSTileSourceVisibility)
  const updateWMSTileSourceOpacity = useMapStore((s) => s.updateWMSTileSourceOpacity)

  const [open, setOpen] = useState(false)
  const [serviceUrl, setServiceUrl] = useState('')
  const [layerName, setLayerName] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [serviceType, setServiceType] = useState<'wms' | 'wmts' | 'tms'>('wms')
  const [opacity, setOpacity] = useState(100)
  const [format, setFormat] = useState('image/png')
  const [tileSize, setTileSize] = useState(256)
  const [customParamsText, setCustomParamsText] = useState('')
  const [showPresets, setShowPresets] = useState(false)

  const parseCustomParams = useCallback((text: string): Record<string, string> => {
    const params: Record<string, string> = {}
    if (!text.trim()) return params
    text.split('\n').forEach((line) => {
      const eq = line.indexOf('=')
      if (eq > 0) {
        const key = line.slice(0, eq).trim()
        const value = line.slice(eq + 1).trim()
        if (key) params[key] = value
      }
    })
    return params
  }, [])

  const handleAdd = useCallback(() => {
    if (!serviceUrl.trim()) {
      toast.error('Service URL is required')
      return
    }
    if (!layerName.trim() && serviceType !== 'tms') {
      toast.error('Layer name is required for WMS/WMTS')
      return
    }

    const id = `wms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const source: WMSTileSource = {
      id,
      name: sourceName.trim() || `WMS Layer ${wmsTileSources.length + 1}`,
      url: serviceUrl.trim(),
      serviceType,
      layerName: layerName.trim() || 'default',
      opacity: opacity / 100,
      format,
      tileSize,
      customParams: parseCustomParams(customParamsText),
      isVisible: true,
    }

    addWMSTileSource(source)
    toast.success(`Added WMS layer: ${source.name}`)

    // Reset form
    setServiceUrl('')
    setLayerName('')
    setSourceName('')
    setServiceType('wms')
    setOpacity(100)
    setFormat('image/png')
    setTileSize(256)
    setCustomParamsText('')
  }, [
    serviceUrl,
    layerName,
    sourceName,
    serviceType,
    opacity,
    format,
    tileSize,
    customParamsText,
    wmsTileSources.length,
    addWMSTileSource,
    parseCustomParams,
  ])

  const handleAddPreset = useCallback((preset: PresetWMSSource) => {
    setServiceUrl(preset.url)
    setLayerName(preset.layerName)
    setSourceName(preset.name)
    setServiceType(preset.serviceType)
    setFormat(preset.format)
    setShowPresets(false)
    toast.info(`Loaded preset: ${preset.name}`)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          title="WMS/WMTS Layers"
          aria-label="Add WMS/WMTS tile layers"
        >
          <Server className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Server className="h-5 w-5 text-teal-500" />
            WMS / WMTS / TMS Layers
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="p-4 space-y-4">
            {/* Existing WMS Layers */}
            {wmsTileSources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  Active Layers ({wmsTileSources.length})
                </h4>
                {wmsTileSources.map((source) => (
                  <div
                    key={source.id}
                    className="rounded-xl border border-border/50 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => toggleWMSTileSourceVisibility(source.id)}
                        title={source.isVisible ? 'Hide layer' : 'Show layer'}
                      >
                        {source.isVisible ? (
                          <Eye className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{source.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {source.serviceType.toUpperCase()} · {source.layerName}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[9px] shrink-0">
                        {Math.round(source.opacity * 100)}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-red-400 hover:text-red-500"
                        onClick={() => {
                          removeWMSTileSource(source.id)
                          toast.success(`Removed: ${source.name}`)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {/* Opacity slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-12 shrink-0">Opacity</span>
                      <Slider
                        value={[source.opacity * 100]}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                        onValueChange={([v]) => updateWMSTileSourceOpacity(source.id, v / 100)}
                      />
                    </div>
                  </div>
                ))}
                <Separator />
              </div>
            )}

            {/* Preset Sources */}
            <div>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                onClick={() => setShowPresets(!showPresets)}
              >
                <Globe2 className="h-3.5 w-3.5" />
                Preset Sources
                <ChevronDown className={cn('h-3 w-3 ml-auto transition-transform', showPresets && 'rotate-180')} />
              </Button>
              <AnimatePresence>
                {showPresets && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1.5">
                      {PRESET_WMS_SOURCES.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => handleAddPreset(preset)}
                          className="w-full text-left rounded-lg border border-border/50 p-2.5 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Globe2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium">{preset.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {preset.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-[9px] shrink-0">
                              {preset.serviceType.toUpperCase()}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Separator />

            {/* Add New Layer Form */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add New Layer
              </h4>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Layer Name</label>
                  <Input
                    placeholder="e.g., My WMS Layer"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Service URL</label>
                  <Input
                    placeholder="https://example.com/wms"
                    value={serviceUrl}
                    onChange={(e) => setServiceUrl(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Service Type</label>
                    <Select value={serviceType} onValueChange={(v: 'wms' | 'wmts' | 'tms') => setServiceType(v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wms" className="text-xs">WMS</SelectItem>
                        <SelectItem value="wmts" className="text-xs">WMTS</SelectItem>
                        <SelectItem value="tms" className="text-xs">TMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Layer Name (WMS/WMTS)</label>
                    <Input
                      placeholder="e.g., 0 or layer_name"
                      value={layerName}
                      onChange={(e) => setLayerName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Format</label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image/png" className="text-xs">PNG</SelectItem>
                        <SelectItem value="image/jpeg" className="text-xs">JPEG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Tile Size</label>
                    <Select value={String(tileSize)} onValueChange={(v) => setTileSize(Number(v))}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="256" className="text-xs">256</SelectItem>
                        <SelectItem value="512" className="text-xs">512</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Opacity: {opacity}%</label>
                    <div className="flex items-center h-8">
                      <Slider
                        value={[opacity]}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                        onValueChange={([v]) => setOpacity(v)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">
                    Custom Parameters (key=value, one per line)
                  </label>
                  <textarea
                    placeholder={"transparent=true\ntime=2024-01-01"}
                    value={customParamsText}
                    onChange={(e) => setCustomParamsText(e.target.value)}
                    className="w-full min-h-[60px] px-3 py-1.5 text-xs rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                  />
                </div>
              </div>

              <Button
                className="w-full h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleAdd}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Layer
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
