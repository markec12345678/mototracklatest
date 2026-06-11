'use client'

import { useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMapStore, MAP_STYLES } from '@/lib/map-store'
import { cn } from '@/lib/utils'

// Distinctive gradient backgrounds for each style preview card (inline styles)
const STYLE_GRADIENTS: Record<string, string> = {
  streets: 'linear-gradient(135deg, #e8f5e9, #b2dfdb, #80cbc4)',
  satellite: 'linear-gradient(135deg, #1b5e20, #2e7d32, #1b5e20)',
  hybrid: 'linear-gradient(135deg, #1b5e20, #4caf50, #1b5e20)',
  terrain: 'linear-gradient(135deg, #f9a825, #ff8f00, #e65100)',
  topo: 'linear-gradient(135deg, #fff9c4, #f9a825, #ff8f00)',
  dark: 'linear-gradient(135deg, #212121, #424242, #616161)',
  outdoor: 'linear-gradient(135deg, #c8e6c9, #66bb6a, #43a047)',
  osm: 'linear-gradient(135deg, #c8e6c9, #a5d6a7, #81c784)',
}

export function StyleSwitcher() {
  const { currentStyle, setCurrentStyle } = useMapStore()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="animate-ripple bg-background/90 backdrop-blur-md shadow-lg hover:shadow-xl h-10 w-10 rounded-xl border-border/50 transition-all hover:scale-105"
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
              const isActive = currentStyle.id === style.id
              const gradientBg = STYLE_GRADIENTS[style.id] || 'linear-gradient(135deg, #e0e0e0, #bdbdbd)'
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    setCurrentStyle(style)
                    setOpen(false)
                  }}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all duration-200 group',
                    isActive
                      ? 'style-card-glow border-primary/40 bg-primary/8 scale-[1.02]'
                      : 'hover:bg-accent border-transparent hover:border-border/50 hover:scale-[1.05]'
                  )}
                >
                  {/* Subtle gradient overlay on active card */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-primary/8 pointer-events-none" />
                  )}
                  <div
                    className={cn(
                      'w-full h-12 rounded-lg flex items-center justify-center text-lg shadow-sm transition-all duration-200',
                      isActive ? 'shadow-md scale-[1.02]' : 'group-hover:shadow-md group-hover:scale-[1.05]'
                    )}
                    style={{ background: gradientBg }}
                  >
                    <span className="relative z-10 drop-shadow-sm">{preview.emoji}</span>
                  </div>
                  <div className="w-full min-w-0 relative z-10">
                    <p className={cn(
                      'text-xs truncate transition-all duration-200',
                      isActive ? 'font-bold text-primary' : 'font-medium'
                    )}>
                      {style.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground capitalize">
                      {style.provider === 'maptiler' ? 'MapTiler' : style.provider === 'carto' ? 'CARTO' : 'OSM'}
                      {style.category !== 'standard' && ` · ${style.category}`}
                    </p>
                  </div>
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20">
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-primary/80 relative z-10">
                      Active
                    </span>
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
