'use client'

import { useState } from 'react'
import { Locate, ZoomIn, ZoomOut, RotateCcw, MapPin, Ruler, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useMapStore, type ToolMode } from '@/lib/map-store'

export function MapToolbar() {
  const { toolMode, setToolMode } = useMapStore()

  const tools: { id: ToolMode; icon: React.ReactNode; label: string }[] = [
    { id: 'navigate', icon: <Navigation className="h-4 w-4" />, label: 'Navigate' },
    { id: 'mark', icon: <MapPin className="h-4 w-4" />, label: 'Drop Pin' },
    { id: 'measure', icon: <Ruler className="h-4 w-4" />, label: 'Measure' },
  ]

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-1 bg-background/90 backdrop-blur-sm border rounded-lg shadow-sm p-1">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={toolMode === tool.id ? 'default' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                onClick={() => setToolMode(tool.id)}
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              {tool.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
