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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Palette,
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react'
import { useMapStore, type StyleMixLayer, MAP_STYLES } from '@/lib/map-store'
import { toast } from 'sonner'

interface StylesMixerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const LAYER_CATEGORIES = [
  { id: 'water', label: 'Water', description: 'Oceans, lakes, rivers' },
  { id: 'landcover', label: 'Land Cover', description: 'Forests, grass, farmland' },
  { id: 'roads', label: 'Roads', description: 'Highways, streets, paths' },
  { id: 'buildings', label: 'Buildings', description: 'Building footprints' },
  { id: 'labels', label: 'Labels', description: 'Place names, POI labels' },
  { id: 'boundaries', label: 'Boundaries', description: 'Country, state borders' },
  { id: 'transit', label: 'Transit', description: 'Railways, airports' },
  { id: 'terrain', label: 'Terrain', description: 'Hillshading, contours' },
]

export function StylesMixer({ open, onOpenChange }: StylesMixerProps) {
  const styleMixLayers = useMapStore((s) => s.styleMixLayers)
  const addStyleMixLayer = useMapStore((s) => s.addStyleMixLayer)
  const removeStyleMixLayer = useMapStore((s) => s.removeStyleMixLayer)
  const toggleStyleMixLayerVisibility = useMapStore((s) => s.toggleStyleMixLayerVisibility)
  const updateStyleMixLayerOpacity = useMapStore((s) => s.updateStyleMixLayerOpacity)
  const clearStyleMixLayers = useMapStore((s) => s.clearStyleMixLayers)
  const currentStyle = useMapStore((s) => s.currentStyle)

  const [selectedSource, setSelectedSource] = useState(currentStyle.id)
  const [selectedCategory, setSelectedCategory] = useState('water')

  const handleAddLayer = useCallback(() => {
    const sourceStyle = MAP_STYLES.find((s) => s.id === selectedSource)
    if (!sourceStyle) {
      toast.error('Please select a source style')
      return
    }

    const layerCategory = LAYER_CATEGORIES.find((c) => c.id === selectedCategory)
    if (!layerCategory) return

    const existingLayer = styleMixLayers.find(
      (l) => l.sourceStyle === selectedSource && l.layerId === selectedCategory
    )
    if (existingLayer) {
      toast.info('This layer is already added')
      return
    }

    const newLayer: StyleMixLayer = {
      id: `mix-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sourceStyle: selectedSource,
      layerId: selectedCategory,
      opacity: 1,
      visible: true,
    }

    addStyleMixLayer(newLayer)
    toast.success(`Added ${layerCategory.label} from ${sourceStyle.name}`)
  }, [selectedSource, selectedCategory, styleMixLayers, addStyleMixLayer])

  const handleApplyMix = useCallback(() => {
    if (styleMixLayers.length === 0) {
      toast.error('Add at least one layer to create a mix')
      return
    }
    // The style mixing is applied in MapView by overlaying tile sources
    toast.success('Style mix applied! Layers are rendered as overlays on the map.')
  }, [styleMixLayers])

  const getStyleName = (styleId: string) => {
    return MAP_STYLES.find((s) => s.id === styleId)?.name || styleId
  }

  const getCategoryLabel = (categoryId: string) => {
    return LAYER_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId
  }

  const getStyleEmoji = (styleId: string) => {
    return MAP_STYLES.find((s) => s.id === styleId)?.preview.emoji || '🗺️'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-emerald-600" />
            Style Mixer
          </DialogTitle>
          <DialogDescription>
            Create custom map styles by mixing layers from different map sources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current base style */}
          <div className="rounded-xl border bg-muted/30 p-3">
            <Label className="text-xs font-medium text-muted-foreground mb-1 block">
              Base Style
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentStyle.preview.emoji}</span>
              <span className="text-sm font-medium">{currentStyle.name}</span>
              <Badge variant="outline" className="text-[10px] h-5 ml-auto">
                {currentStyle.category}
              </Badge>
            </div>
          </div>

          {/* Add layer */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add Layer from Style</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Source Style</Label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAP_STYLES.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        <span className="flex items-center gap-1.5">
                          <span>{style.preview.emoji}</span>
                          <span>{style.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Layer Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYER_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAddLayer}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Layer
            </Button>
          </div>

          {/* Active mix layers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Mixed Layers ({styleMixLayers.length})
              </Label>
              {styleMixLayers.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-muted-foreground"
                  onClick={clearStyleMixLayers}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {styleMixLayers.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No layers added yet. Select a source style and layer category to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {styleMixLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 transition-colors ${!layer.visible ? 'opacity-50' : 'hover:bg-accent/30'}`}
                  >
                    <button
                      className="shrink-0"
                      onClick={() => toggleStyleMixLayerVisibility(layer.id)}
                      aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
                    >
                      {layer.visible ? (
                        <Eye className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-sm">{getStyleEmoji(layer.sourceStyle)}</span>
                      <span className="text-xs font-medium truncate">
                        {getCategoryLabel(layer.layerId)}
                      </span>
                      <span className="text-xs text-muted-foreground">from</span>
                      <Badge variant="outline" className="text-[10px] h-4 shrink-0">
                        {getStyleName(layer.sourceStyle)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={layer.opacity}
                        onChange={(e) => updateStyleMixLayerOpacity(layer.id, parseFloat(e.target.value))}
                        className="w-14 h-1 accent-emerald-500"
                        aria-label="Layer opacity"
                      />
                      <span className="text-[10px] text-muted-foreground w-6 text-right">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                      onClick={() => removeStyleMixLayer(layer.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Apply button */}
          <Button
            className="w-full"
            onClick={handleApplyMix}
            disabled={styleMixLayers.length === 0}
          >
            <Layers className="h-4 w-4 mr-2" />
            Apply Style Mix
          </Button>

          {/* Info */}
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Style mixing overlays tile layers from different map sources.
            Adjust opacity to blend layers with the base style.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
