'use client'

import { useState } from 'react'
import { Layers, Check, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMapStore, MAP_STYLES, type MapStyleOption } from '@/lib/map-store'
import { cn } from '@/lib/utils'

const stylePreviews: Record<string, { gradient: string; emoji: string }> = {
  streets: { gradient: 'from-emerald-400 to-cyan-400', emoji: '🏙️' },
  dark: { gradient: 'from-gray-700 to-gray-900', emoji: '🌙' },
  voyager: { gradient: 'from-orange-400 to-rose-400', emoji: '🗺️' },
  positron: { gradient: 'from-gray-100 to-gray-200', emoji: '📐' },
  osm: { gradient: 'from-green-400 to-emerald-400', emoji: '🌍' },
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
          className="bg-background/90 backdrop-blur-sm shadow-md h-10 w-10 rounded-xl"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2 rounded-xl" side="bottom" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1.5">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              Map Style
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Choose a base map style
            </p>
          </div>
          <div className="grid gap-1">
            {MAP_STYLES.map((style) => {
              const preview = stylePreviews[style.id] || stylePreviews.streets
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    setCurrentStyle(style)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-2.5 py-2 rounded-xl border text-left transition-all group',
                    currentStyle.id === style.id
                      ? 'bg-primary/5 border-primary/20 shadow-sm'
                      : 'hover:bg-accent border-transparent'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm shadow-sm group-hover:shadow-md transition-shadow',
                      preview.gradient
                    )}
                  >
                    <span>{preview.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{style.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {style.category}
                    </p>
                  </div>
                  {currentStyle.id === style.id && (
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-3 w-3" />
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
