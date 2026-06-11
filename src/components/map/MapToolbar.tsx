'use client'

import { useEffect, useRef } from 'react'
import { MapPin, Navigation, Ruler, Crosshair, Pencil } from 'lucide-react'
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
  {
    id: 'directions',
    icon: <Crosshair className="h-4 w-4" />,
    label: 'Directions',
    activeClass: 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30',
    shortcut: '4',
  },
  {
    id: 'draw',
    icon: <Pencil className="h-4 w-4" />,
    label: 'Draw',
    activeClass: 'bg-green-500 text-white shadow-md shadow-green-500/30',
    shortcut: '5',
  },
]

function ToolButton({ tool, isActive, onClick }: {
  tool: typeof tools[number]
  isActive: boolean
  onClick: () => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.classList.remove('tool-bounce')
      // Trigger reflow to restart animation
      void buttonRef.current.offsetWidth
      buttonRef.current.classList.add('tool-bounce')
    }
  }, [isActive])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          className={cn(
            'h-11 w-11 rounded-xl transition-all duration-200 relative',
            // 44px minimum touch target
            isActive
              ? tool.activeClass
              : 'hover:bg-accent'
          )}
          onClick={onClick}
          aria-label={`${tool.label} tool (press ${tool.shortcut})`}
        >
          {tool.icon}
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white tool-dot-glow" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs font-medium flex items-center gap-2 relative">
        {/* Tooltip arrow pointing left */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-popover border-l border-b border-border" />
        {tool.label}
        <kbd className="text-[10px] px-1 py-0.5 rounded border bg-muted/50 font-mono">{tool.shortcut}</kbd>
      </TooltipContent>
    </Tooltip>
  )
}

export function MapToolbar() {
  const { toolMode, setToolMode } = useMapStore()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-2 bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-2">
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={toolMode === tool.id}
            onClick={() => setToolMode(tool.id)}
          />
        ))}
      </div>
    </TooltipProvider>
  )
}
