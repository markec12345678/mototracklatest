'use client'

import { MapPin, Navigation, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useMapStore, type ToolMode } from '@/lib/map-store'

const tools: {
  id: ToolMode
  icon: React.ReactNode
  label: string
  activeClass: string
  shortcut: string
}[] = [
  {
    id: 'navigate',
    icon: <Navigation className="h-4 w-4" />,
    label: 'Navigate',
    activeClass: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30',
    shortcut: '1',
  },
  {
    id: 'mark',
    icon: <MapPin className="h-4 w-4" />,
    label: 'Drop Pin',
    activeClass: 'bg-red-500 text-white shadow-md shadow-red-500/30',
    shortcut: '2',
  },
  {
    id: 'measure',
    icon: <Ruler className="h-4 w-4" />,
    label: 'Measure',
    activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
    shortcut: '3',
  },
]

export function MapToolbar() {
  const { toolMode, setToolMode } = useMapStore()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-1.5 bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-1.5">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-xl transition-all duration-200 relative',
                  toolMode === tool.id
                    ? tool.activeClass
                    : 'hover:bg-accent'
                )}
                onClick={() => setToolMode(tool.id)}
                aria-label={`${tool.label} tool (press ${tool.shortcut})`}
              >
                {tool.icon}
                {toolMode === tool.id && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-medium flex items-center gap-2">
              {tool.label}
              <kbd className="text-[10px] px-1 py-0.5 rounded border bg-muted/50 font-mono">{tool.shortcut}</kbd>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
