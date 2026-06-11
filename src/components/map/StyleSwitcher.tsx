'use client'

import { useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMapStore, MAP_STYLES } from '@/lib/map-store'
import { cn } from '@/lib/utils'

export function StyleSwitcher() {
  const { currentStyle, setCurrentStyle } = useMapStore()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/90 backdrop-blur-md shadow-lg hover:shadow-xl h-10 w-10 rounded-xl border-border/50 transition-all hover:scale-105"
          aria-label="Change map style"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2 rounded-xl" side="bottom" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1.5">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              Map Style
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Premium maps by MapTiler + OpenStreetMap
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-[340px] overflow-y-auto pr-0.5">
            {MAP_STYLES.map((style) => {
              const preview = style.preview
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    setCurrentStyle(style)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all group',
                    currentStyle.id === style.id
                      ? 'bg-primary/5 border-primary/20 shadow-sm'
                      : 'hover:bg-accent border-transparent'
                  )}
                >
                  <div
                    className={cn(
                      'w-full h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-lg shadow-sm group-hover:shadow-md transition-all group-hover:scale-[1.03]',
                      preview.gradient
                    )}
                  >
                    <span>{preview.emoji}</span>
                  </div>
                  <div className="w-full min-w-0">
                    <p className="text-xs font-medium truncate">{style.name}</p>
                    <p className="text-[9px] text-muted-foreground capitalize">
                      {style.provider === 'maptiler' ? 'MapTiler' : style.provider === 'carto' ? 'CARTO' : 'OSM'}
                      {style.category !== 'standard' && ` · ${style.category}`}
                    </p>
                  </div>
                  {currentStyle.id === style.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
