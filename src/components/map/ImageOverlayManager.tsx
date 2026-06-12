'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMapStore } from '@/lib/map-store'
import { ImageOverlayDialog } from '@/components/map/ImageOverlayDialog'
import { Eye, EyeOff, Trash2, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ImageOverlayManager() {
  const imageOverlays = useMapStore((s) => s.imageOverlays)
  const toggleImageOverlay = useMapStore((s) => s.toggleImageOverlay)
  const removeImageOverlay = useMapStore((s) => s.removeImageOverlay)
  const updateImageOverlayOpacity = useMapStore((s) => s.updateImageOverlayOpacity)

  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {imageOverlays.length} overlay{imageOverlays.length !== 1 ? 's' : ''}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setDialogOpen(true)}
        >
          <ImagePlus className="h-3 w-3" />
          Add Overlay
        </Button>
      </div>

      {imageOverlays.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <ImagePlus className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No image overlays yet</p>
          <p className="text-[10px] mt-1">Add historical maps, site plans, or other images</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {imageOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className={cn(
                'px-3 py-2 rounded-xl border transition-all duration-200',
                overlay.visible
                  ? 'bg-background border-border/50 shadow-sm'
                  : 'opacity-50 border-dashed'
              )}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleImageOverlay(overlay.id)}
                  className="shrink-0 hover:scale-110 transition-transform"
                  aria-label={overlay.visible ? 'Hide overlay' : 'Show overlay'}
                >
                  {overlay.visible ? (
                    <Eye className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{overlay.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{overlay.url}</p>
                </div>
                <button
                  onClick={() => removeImageOverlay(overlay.id)}
                  className="shrink-0 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove overlay"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              {overlay.visible && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground shrink-0">Opacity</span>
                  <Slider
                    value={[Math.round(overlay.opacity * 100)]}
                    onValueChange={(v) => updateImageOverlayOpacity(overlay.id, v[0] / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-8 text-right">
                    {Math.round(overlay.opacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ImageOverlayDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
