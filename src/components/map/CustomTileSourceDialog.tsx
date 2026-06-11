'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe2, Map, Layers, Zap } from 'lucide-react'
import { useMapStore, type CustomTileSource } from '@/lib/map-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PRESETS: {
  name: string
  url: string
  type: 'raster' | 'vector'
  attribution: string
  icon: React.ReactNode
  color: string
}[] = [
  {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    type: 'raster',
    attribution: '© OpenStreetMap contributors',
    icon: <Map className="h-4 w-4" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Stamen Terrain',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',
    type: 'raster',
    attribution: '© Stadia Maps © Stamen Design © OpenStreetMap',
    icon: <Layers className="h-4 w-4" />,
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'CartoDB Dark Matter',
    url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    type: 'raster',
    attribution: '© CARTO © OpenStreetMap contributors',
    icon: <Globe2 className="h-4 w-4" />,
    color: 'from-gray-600 to-gray-800',
  },
]

interface CustomTileSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomTileSourceDialog({ open, onOpenChange }: CustomTileSourceDialogProps) {
  const { addCustomTileSource, customTileSources } = useMapStore()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<'raster' | 'vector'>('raster')
  const [attribution, setAttribution] = useState('')
  const [minZoom, setMinZoom] = useState('')
  const [maxZoom, setMaxZoom] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const validateUrl = (tileUrl: string): boolean => {
    if (!tileUrl.trim()) return false
    try {
      // Must contain {z}/{x}/{y} or be a valid URL
      const hasTilePattern = tileUrl.includes('{z}') && tileUrl.includes('{x}') && tileUrl.includes('{y}')
      const isStyleJson = tileUrl.endsWith('.json') || tileUrl.includes('style.json')
      if (hasTilePattern || isStyleJson) return true
      // At least be a valid URL format
      new URL(tileUrl.replace('{z}', '0').replace('{x}', '0').replace('{y}', '0'))
      return true
    } catch {
      return false
    }
  }

  const handlePresetClick = (preset: typeof PRESETS[number]) => {
    setName(preset.name)
    setUrl(preset.url)
    setType(preset.type)
    setAttribution(preset.attribution)
    setSelectedPreset(preset.name)
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the tile source')
      return
    }
    if (!validateUrl(url)) {
      toast.error('Please enter a valid tile URL (must contain {z}/{x}/{y} or be a style.json URL)')
      return
    }
    // Check for duplicate names
    if (customTileSources.some((s) => s.name === name.trim())) {
      toast.error('A tile source with this name already exists')
      return
    }

    const source: CustomTileSource = {
      id: `custom-tile-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      url: url.trim(),
      type,
      attribution: attribution.trim() || undefined,
      minZoom: minZoom ? parseInt(minZoom, 10) : undefined,
      maxZoom: maxZoom ? parseInt(maxZoom, 10) : undefined,
      visible: true,
    }

    addCustomTileSource(source)
    toast.success(`Added "${source.name}" tile source`)

    // Reset form
    setName('')
    setUrl('')
    setType('raster')
    setAttribution('')
    setMinZoom('')
    setMaxZoom('')
    setSelectedPreset(null)
    onOpenChange(false)
  }

  const resetForm = () => {
    setName('')
    setUrl('')
    setType('raster')
    setAttribution('')
    setMinZoom('')
    setMaxZoom('')
    setSelectedPreset(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            Add Custom Tile Source
          </DialogTitle>
          <DialogDescription>
            Add a custom raster or vector tile source to overlay on the map.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Presets */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Quick Presets</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200',
                    selectedPreset === preset.name
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  )}
                >
                  {preset.icon}
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="tile-name" className="text-xs">Name</Label>
            <Input
              id="tile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Tile Source"
              className="h-9"
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="tile-url" className="text-xs">Tile URL Template</Label>
            <Input
              id="tile-url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setSelectedPreset(null) }}
              placeholder="https://tiles.example.com/{z}/{x}/{y}.png"
              className="h-9 font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Use {'{z}'}, {'{x}'}, {'{y}'} for tile coordinates. Vector sources can use a style.json URL.
            </p>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'raster' | 'vector')}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raster">Raster</SelectItem>
                <SelectItem value="vector">Vector</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attribution */}
          <div className="space-y-1.5">
            <Label htmlFor="tile-attribution" className="text-xs">
              Attribution <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="tile-attribution"
              value={attribution}
              onChange={(e) => setAttribution(e.target.value)}
              placeholder="© OpenStreetMap contributors"
              className="h-9"
            />
          </div>

          {/* Min/Max Zoom */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tile-min-zoom" className="text-xs">
                Min Zoom <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="tile-min-zoom"
                type="number"
                value={minZoom}
                onChange={(e) => setMinZoom(e.target.value)}
                placeholder="0"
                min={0}
                max={22}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tile-max-zoom" className="text-xs">
                Max Zoom <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="tile-max-zoom"
                type="number"
                value={maxZoom}
                onChange={(e) => setMaxZoom(e.target.value)}
                placeholder="18"
                min={0}
                max={22}
                className="h-9"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !url.trim()}
            className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
          >
            <Zap className="h-3.5 w-3.5" />
            Add Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
