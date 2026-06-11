'use client'

import { useState } from 'react'
import { Globe2, Trash2, Eye, EyeOff, Plus, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useMapStore, type CustomTileSource } from '@/lib/map-store'
import { CustomTileSourceDialog } from '@/components/map/CustomTileSourceDialog'
import { cn } from '@/lib/utils'

export function CustomTileSourceList() {
  const { customTileSources, removeCustomTileSource, toggleCustomTileSource } = useMapStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  const getTypeBadge = (type: CustomTileSource['type']) => {
    if (type === 'raster') {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium uppercase">
          Raster
        </span>
      )
    }
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-medium uppercase">
        Vector
      </span>
    )
  }

  if (customTileSources.length === 0) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            <Globe2 className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No custom tile sources</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
            Add custom raster or vector tile overlays
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 h-8 text-xs gap-1.5 rounded-xl"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Source
          </Button>
        </div>
        <CustomTileSourceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-1.5">
        {customTileSources.map((source) => (
          <div
            key={source.id}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-200 group',
              source.visible
                ? 'bg-background border-border/50 shadow-sm'
                : 'opacity-50 border-dashed border-border/50'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              source.type === 'raster'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
            )}>
              <Globe2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{source.name}</p>
                {getTypeBadge(source.type)}
              </div>
              <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
                {source.url}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleCustomTileSource(source.id)}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  source.visible
                    ? 'text-primary hover:bg-primary/10'
                    : 'text-muted-foreground hover:bg-accent'
                )}
                aria-label={source.visible ? 'Hide tile source' : 'Show tile source'}
              >
                {source.visible ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => removeCustomTileSource(source.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                aria-label={`Remove ${source.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2 h-8 text-xs gap-1.5 rounded-xl border-dashed"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Custom Source
      </Button>

      <CustomTileSourceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
