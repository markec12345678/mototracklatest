'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MapPinned,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MapOverlay } from '@/lib/map-store'
import { cn } from '@/lib/utils'

// Predefined overlay definitions
const PREDEFINED_OVERLAYS: Omit<MapOverlay, 'enabled' | 'opacity'>[] = [
  {
    id: 'sea-level',
    name: 'Sea Level Rise',
    type: 'sea-level',
    tileUrl: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/SeaLevelRise/MapServer/tile/{z}/{y}/{x}',
    attribution: 'NOAA Sea Level Rise',
    minZoom: 0,
    maxZoom: 15,
    isTms: false,
    description: 'Shows areas vulnerable to sea level rise at various increments.',
  },
  {
    id: 'population',
    name: 'Population Density',
    type: 'population',
    tileUrl: 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVCh1x/arcgis/rest/services/World_Population_Density/MapServer/tile/{z}/{y}/{x}',
    attribution: 'ESRI World Population',
    minZoom: 0,
    maxZoom: 14,
    isTms: false,
    description: 'Global population density per square kilometer.',
  },
  {
    id: 'light-pollution',
    name: 'Night Sky / Light Pollution',
    type: 'light-pollution',
    tileUrl: 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVCh1x/arcgis/rest/services/EarthAtNight2012/MapServer/tile/{z}/{y}/{x}',
    attribution: 'NASA Earth Observatory',
    minZoom: 0,
    maxZoom: 10,
    isTms: false,
    description: 'Nighttime lights showing light pollution and urban areas.',
  },
  {
    id: 'land-cover',
    name: 'Land Cover',
    type: 'land-cover',
    tileUrl: 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVCh1x/arcgis/rest/services/IO_Global_Land_Cover/MapServer/tile/{z}/{y}/{x}',
    attribution: 'ESA GlobCover',
    minZoom: 0,
    maxZoom: 13,
    isTms: false,
    description: 'Global land cover classification (forest, urban, water, etc.).',
  },
  {
    id: 'temperature',
    name: 'Temperature',
    type: 'temperature',
    tileUrl: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=demo',
    attribution: 'OpenWeatherMap',
    minZoom: 0,
    maxZoom: 18,
    isTms: false,
    description: 'Current temperature heatmap from OpenWeatherMap.',
  },
  {
    id: 'wind',
    name: 'Wind Patterns',
    type: 'wind',
    tileUrl: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=demo',
    attribution: 'OpenWeatherMap',
    minZoom: 0,
    maxZoom: 18,
    isTms: false,
    description: 'Current wind speed and direction overlay.',
  },
  {
    id: 'precipitation',
    name: 'Precipitation',
    type: 'precipitation',
    tileUrl: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=demo',
    attribution: 'OpenWeatherMap',
    minZoom: 0,
    maxZoom: 18,
    isTms: false,
    description: 'Current precipitation and cloud cover overlay.',
  },
]

// Map layer management - add/remove raster layers on the map
function addOverlayToMap(map: maplibregl.Map, overlay: MapOverlay) {
  const sourceId = `overlay-${overlay.id}`
  const layerId = `overlay-layer-${overlay.id}`

  // Remove existing if any
  removeOverlayFromMap(map, overlay.id)

  if (!overlay.tileUrl) return

  const tileUrl = overlay.isTms
    ? overlay.tileUrl.replace('{y}', '{-y}')
    : overlay.tileUrl

  map.addSource(sourceId, {
    type: 'raster',
    tiles: [tileUrl],
    tileSize: 256,
    attribution: overlay.attribution || '',
    minzoom: overlay.minZoom || 0,
    maxzoom: overlay.maxZoom || 18,
  })

  map.addLayer({
    id: layerId,
    type: 'raster',
    source: sourceId,
    paint: {
      'raster-opacity': overlay.opacity,
    },
  })
}

function removeOverlayFromMap(map: maplibregl.Map, overlayId: string) {
  const sourceId = `overlay-${overlayId}`
  const layerId = `overlay-layer-${overlayId}`

  if (map.getLayer(layerId)) {
    map.removeLayer(layerId)
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId)
  }
}

function updateOverlayOpacity(map: maplibregl.Map, overlayId: string, opacity: number) {
  const layerId = `overlay-layer-${overlayId}`
  if (map.getLayer(layerId)) {
    map.setPaintProperty(layerId, 'raster-opacity', opacity)
  }
}

// Info tooltip component
function OverlayInfo({ description, attribution }: { description?: string; attribution?: string }) {
  const [show, setShow] = useState(false)
  if (!description && !attribution) return null

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShow(!show)
        }}
        className="p-0.5 rounded hover:bg-accent transition-colors"
        aria-label="Overlay info"
      >
        <Info className="h-3 w-3 text-muted-foreground" />
      </button>
      {show && (
        <div className="absolute right-0 top-6 z-50 bg-popover border rounded-lg shadow-lg p-2.5 w-56 text-xs space-y-1">
          {description && <p className="text-foreground">{description}</p>}
          {attribution && (
            <p className="text-muted-foreground text-[10px]">Source: {attribution}</p>
          )}
        </div>
      )}
    </div>
  )
}

export function MapOverlayGallery() {
  const mapOverlays = useMapStore((s) => s.mapOverlays)
  const setMapOverlay = useMapStore((s) => s.setMapOverlay)
  const addMapOverlay = useMapStore((s) => s.addMapOverlay)
  const removeMapOverlay = useMapStore((s) => s.removeMapOverlay)
  const overlayGalleryOpen = useMapStore((s) => s.overlayGalleryOpen)
  const setOverlayGalleryOpen = useMapStore((s) => s.setOverlayGalleryOpen)

  const [customName, setCustomName] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [customAttribution, setCustomAttribution] = useState('')
  const [customMinZoom, setCustomMinZoom] = useState('0')
  const [customMaxZoom, setCustomMaxZoom] = useState('18')
  const [customIsTms, setCustomIsTms] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)

  // Sync overlays to the map
  useEffect(() => {
    if (typeof window === 'undefined') return

    const map = (window as any).__mainMap as maplibregl.Map | undefined
    if (!map) return

    const applyOverlays = () => {
      if (!map || !map.getStyle()) return

      for (const overlay of mapOverlays) {
        if (overlay.enabled) {
          addOverlayToMap(map, overlay)
          updateOverlayOpacity(map, overlay.id, overlay.opacity)
        } else {
          removeOverlayFromMap(map, overlay.id)
        }
      }
    }

    if (map.isStyleLoaded()) {
      applyOverlays()
    } else {
      map.once('load', applyOverlays)
    }
  }, [mapOverlays])

  // Handle opacity changes
  const handleOpacityChange = useCallback((id: string, opacity: number) => {
    setMapOverlay(id, { opacity })
    if (typeof window !== 'undefined') {
      const map = (window as any).__mainMap as maplibregl.Map | undefined
      if (map) {
        updateOverlayOpacity(map, id, opacity)
      }
    }
  }, [setMapOverlay])

  // Initialize predefined overlays if not already present
  const initializePredefined = useCallback(() => {
    const existingIds = mapOverlays.map((o) => o.id)
    for (const predefined of PREDEFINED_OVERLAYS) {
      if (!existingIds.includes(predefined.id)) {
        addMapOverlay({
          ...predefined,
          enabled: false,
          opacity: 0.7,
        })
      }
    }
  }, [mapOverlays, addMapOverlay])

  // Auto-init on first open
  useEffect(() => {
    if (overlayGalleryOpen) {
      initializePredefined()
    }
  }, [overlayGalleryOpen, initializePredefined])

  const handleAddCustomOverlay = useCallback(() => {
    if (!customName.trim() || !customUrl.trim()) return

    const id = `custom-${Date.now()}`
    addMapOverlay({
      id,
      name: customName.trim(),
      type: 'custom',
      enabled: true,
      opacity: 0.7,
      tileUrl: customUrl.trim(),
      attribution: customAttribution.trim() || undefined,
      minZoom: Number(customMinZoom) || 0,
      maxZoom: Number(customMaxZoom) || 18,
      isTms: customIsTms,
      description: 'Custom tile overlay',
    })

    setCustomName('')
    setCustomUrl('')
    setCustomAttribution('')
    setCustomMinZoom('0')
    setCustomMaxZoom('18')
    setCustomIsTms(false)
    setShowCustomForm(false)
  }, [customName, customUrl, customAttribution, customMinZoom, customMaxZoom, customIsTms, addMapOverlay])

  const handleRemoveOverlay = useCallback((id: string) => {
    if (typeof window !== 'undefined') {
      const map = (window as any).__mainMap as maplibregl.Map | undefined
      if (map) {
        removeOverlayFromMap(map, id)
      }
    }
    removeMapOverlay(id)
  }, [removeMapOverlay])

  const predefinedOverlays = mapOverlays.filter((o) => o.type !== 'custom')
  const customOverlays = mapOverlays.filter((o) => o.type === 'custom')
  const activeCount = mapOverlays.filter((o) => o.enabled).length

  return (
    <Dialog open={overlayGalleryOpen} onOpenChange={setOverlayGalleryOpen}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-teal-500" />
            Map Overlay Gallery
          </DialogTitle>
          <DialogDescription>
            Add and manage map overlays. {activeCount > 0 && `${activeCount} active`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-4 pb-6">
            {/* Predefined Overlays */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Predefined Overlays
              </h3>
              <div className="space-y-1.5">
                {predefinedOverlays.map((overlay) => (
                  <div
                    key={overlay.id}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 transition-all duration-200',
                      overlay.enabled
                        ? 'bg-background border-border/50 shadow-sm'
                        : 'border-dashed hover:border-border'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={overlay.enabled}
                        onCheckedChange={(checked) => setMapOverlay(overlay.id, { enabled: checked })}
                        aria-label={`Toggle ${overlay.name}`}
                        className="scale-75"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate">{overlay.name}</p>
                          <OverlayInfo description={overlay.description} attribution={overlay.attribution} />
                        </div>
                        {overlay.attribution && (
                          <p className="text-[9px] text-muted-foreground/60 truncate">{overlay.attribution}</p>
                        )}
                      </div>
                      {overlay.enabled && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 shrink-0">
                          {Math.round(overlay.opacity * 100)}%
                        </Badge>
                      )}
                    </div>
                    {overlay.enabled && (
                      <div className="mt-2 ml-8 pr-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-6">Op.</span>
                          <Slider
                            value={[overlay.opacity * 100]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={([val]) => handleOpacityChange(overlay.id, val / 100)}
                            className="flex-1"
                            aria-label={`${overlay.name} opacity`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Overlays */}
            {(customOverlays.length > 0 || showCustomForm) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Custom Overlays
                  </h3>
                  <div className="space-y-1.5">
                    {customOverlays.map((overlay) => (
                      <div
                        key={overlay.id}
                        className={cn(
                          'rounded-xl border px-3 py-2.5 transition-all duration-200',
                          overlay.enabled
                            ? 'bg-background border-border/50 shadow-sm'
                            : 'border-dashed hover:border-border'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={overlay.enabled}
                            onCheckedChange={(checked) => setMapOverlay(overlay.id, { enabled: checked })}
                            aria-label={`Toggle ${overlay.name}`}
                            className="scale-75"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium truncate">{overlay.name}</p>
                              <Badge variant="outline" className="text-[9px] px-1">Custom</Badge>
                            </div>
                            {overlay.tileUrl && (
                              <p className="text-[9px] text-muted-foreground/60 truncate">{overlay.tileUrl}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => handleRemoveOverlay(overlay.id)}
                            aria-label={`Remove ${overlay.name}`}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                        {overlay.enabled && (
                          <div className="mt-2 ml-8 pr-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground w-6">Op.</span>
                              <Slider
                                value={[overlay.opacity * 100]}
                                min={0}
                                max={100}
                                step={5}
                                onValueChange={([val]) => handleOpacityChange(overlay.id, val / 100)}
                                className="flex-1"
                                aria-label={`${overlay.name} opacity`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Add Custom Overlay */}
            <Separator />
            {!showCustomForm ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => setShowCustomForm(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Custom Tile Overlay
              </Button>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-3 space-y-2.5">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  Custom Overlay
                </h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Overlay name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Tile URL (e.g. https://tiles.example.com/{z}/{x}/{y}.png)"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Attribution (optional)"
                    value={customAttribution}
                    onChange={(e) => setCustomAttribution(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">Min Zoom</label>
                      <Input
                        type="number"
                        min={0}
                        max={22}
                        value={customMinZoom}
                        onChange={(e) => setCustomMinZoom(e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">Max Zoom</label>
                      <Input
                        type="number"
                        min={0}
                        max={22}
                        value={customMaxZoom}
                        onChange={(e) => setCustomMaxZoom(e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">TMS tile scheme (flip Y)</span>
                    <Switch
                      checked={customIsTms}
                      onCheckedChange={setCustomIsTms}
                      aria-label="Toggle TMS scheme"
                      className="scale-75"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setShowCustomForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    disabled={!customName.trim() || !customUrl.trim()}
                    onClick={handleAddCustomOverlay}
                  >
                    Add Overlay
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
