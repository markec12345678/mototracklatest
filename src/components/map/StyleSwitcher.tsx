'use client'

import { useState } from 'react'
import { Layers, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMapStore, MAP_STYLES, type MapStyleOption } from '@/lib/map-store'
import { cn } from '@/lib/utils'

const styleColors: Record<string, string> = {
  standard: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  dark: 'bg-gray-800/10 text-gray-600 border-gray-500/20',
  satellite: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  terrain: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  custom: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
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
          className="bg-background/90 backdrop-blur-sm shadow-sm h-10 w-10"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" side="left" align="start">
        <div className="space-y-1.5">
          <h4 className="font-semibold text-sm px-1">Map Style</h4>
          <div className="grid gap-1.5">
            {MAP_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  setCurrentStyle(style)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all hover:bg-accent',
                  currentStyle.id === style.id && 'bg-accent border-primary/20'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center border text-xs font-medium',
                    styleColors[style.category] || styleColors.standard
                  )}
                >
                  {style.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{style.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{style.category}</p>
                </div>
                {currentStyle.id === style.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
