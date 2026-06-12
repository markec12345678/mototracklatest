'use client'

import { useState, useCallback } from 'react'
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
import { Slider } from '@/components/ui/slider'
import { useMapStore, type ImageOverlay } from '@/lib/map-store'
import { toast } from 'sonner'
import { ImagePlus } from 'lucide-react'

interface ImageOverlayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageOverlayDialog({ open, onOpenChange }: ImageOverlayDialogProps) {
  const addImageOverlay = useMapStore((s) => s.addImageOverlay)
  const center = useMapStore((s) => s.center)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [swLng, setSwLng] = useState(String((center[0] - 0.01).toFixed(6)))
  const [swLat, setSwLat] = useState(String((center[1] - 0.01).toFixed(6)))
  const [neLng, setNeLng] = useState(String((center[0] + 0.01).toFixed(6)))
  const [neLat, setNeLat] = useState(String((center[1] + 0.01).toFixed(6)))
  const [opacity, setOpacity] = useState(80)

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      toast.error('Please enter a name for the overlay')
      return
    }
    if (!url.trim()) {
      toast.error('Please enter an image URL')
      return
    }

    const swLngNum = parseFloat(swLng)
    const swLatNum = parseFloat(swLat)
    const neLngNum = parseFloat(neLng)
    const neLatNum = parseFloat(neLat)

    if ([swLngNum, swLatNum, neLngNum, neLatNum].some(isNaN)) {
      toast.error('Please enter valid coordinates')
      return
    }

    if (swLngNum >= neLngNum || swLatNum >= neLatNum) {
      toast.error('SW corner must be south-west of NE corner')
      return
    }

    const overlay: ImageOverlay = {
      id: `overlay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      url: url.trim(),
      bounds: [[swLngNum, swLatNum], [neLngNum, neLatNum]],
      opacity: opacity / 100,
      visible: true,
    }

    addImageOverlay(overlay)
    toast.success(`Image overlay "${name.trim()}" added`)
    onOpenChange(false)

    // Reset form
    setName('')
    setUrl('')
    setOpacity(80)
  }, [name, url, swLng, swLat, neLng, neLat, opacity, addImageOverlay, onOpenChange])

  const handleUseMapCenter = useCallback(() => {
    const c = useMapStore.getState().center
    setSwLng(String((c[0] - 0.01).toFixed(6)))
    setSwLat(String((c[1] - 0.01).toFixed(6)))
    setNeLng(String((c[0] + 0.01).toFixed(6)))
    setNeLat(String((c[1] + 0.01).toFixed(6)))
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-emerald-500" />
            Add Image Overlay
          </DialogTitle>
          <DialogDescription>
            Place an image on the map as an overlay. Useful for historical maps, site plans, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="overlay-name" className="text-xs font-medium">Name</Label>
            <Input
              id="overlay-name"
              placeholder="e.g. Historical Map 1890"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="overlay-url" className="text-xs font-medium">Image URL</Label>
            <Input
              id="overlay-url"
              placeholder="https://example.com/map-image.png"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-9 text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Direct link to image (PNG, JPG, WebP)
            </p>
          </div>

          {/* SW Corner */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">SW Corner (South-West)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Longitude"
                  value={swLng}
                  onChange={(e) => setSwLng(e.target.value)}
                  className="h-9 text-sm"
                  type="number"
                  step="0.000001"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Latitude"
                  value={swLat}
                  onChange={(e) => setSwLat(e.target.value)}
                  className="h-9 text-sm"
                  type="number"
                  step="0.000001"
                />
              </div>
            </div>
          </div>

          {/* NE Corner */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">NE Corner (North-East)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Longitude"
                  value={neLng}
                  onChange={(e) => setNeLng(e.target.value)}
                  className="h-9 text-sm"
                  type="number"
                  step="0.000001"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Latitude"
                  value={neLat}
                  onChange={(e) => setNeLat(e.target.value)}
                  className="h-9 text-sm"
                  type="number"
                  step="0.000001"
                />
              </div>
            </div>
          </div>

          {/* Use map center button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-8"
            onClick={handleUseMapCenter}
          >
            Use current map center for bounds
          </Button>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Opacity</Label>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">{opacity}%</span>
            </div>
            <Slider
              value={[opacity]}
              onValueChange={(v) => setOpacity(v[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
          >
            <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
            Add Overlay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
