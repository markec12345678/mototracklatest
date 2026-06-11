'use client'

import { useEffect, useRef, useState } from 'react'
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
  description: string
}[] = [
  {
    id: 'navigate',
    icon: <Navigation className="h-4 w-4" />,
    label: 'Navigate',
    activeClass: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30',
    shortcut: '1',
    description: 'Pan & zoom the map',
  },
  {
    id: 'mark',
    icon: <MapPin className="h-4 w-4" />,
    label: 'Drop Pin',
    activeClass: 'bg-red-500 text-white shadow-md shadow-red-500/30',
    shortcut: '2',
    description: 'Click map to add markers',
  },
  {
    id: 'measure',
    icon: <Ruler className="h-4 w-4" />,
    label: 'Measure',
    activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
    shortcut: '3',
    description: 'Click points to measure distance',
  },
  {
    id: 'directions',
    icon: <Crosshair className="h-4 w-4" />,
    label: 'Directions',
    activeClass: 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30',
    shortcut: '4',
    description: 'Draw routes between points',
  },
  {
    id: 'draw',
    icon: <Pencil className="h-4 w-4" />,
    label: 'Draw',
    activeClass: 'bg-green-500 text-white shadow-md shadow-green-500/30',
    shortcut: '5',
    description: 'Freehand drawing on the map',
  },
]

function ToolButton({ tool, isActive, onClick, index }: {
  tool: typeof tools[number]
  isActive: boolean
  onClick: () => void
  index: number
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Trigger stagger animation on mount
    const timer = setTimeout(() => setMounted(true), index * 80)
    return () => clearTimeout(timer)
  }, [index])

  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.classList.remove('tool-bounce')
      // Trigger reflow to restart animation
      void buttonRef.current.offsetWidth
      buttonRef.current.classList.add('tool-bounce')
    }
  }, [isActive])

  return (
    <div
      className={cn(
        'toolbar-stagger-item',
        mounted && 'opacity-100'
      )}
      style={{
        animationDelay: mounted ? undefined : `${index * 80}ms`,
        animationFillMode: mounted ? 'none' : 'forwards',
        opacity: mounted ? 1 : undefined,
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={buttonRef}
            variant="ghost"
            size="icon"
            className={cn(
              'h-11 w-11 rounded-xl transition-all duration-200 relative toolbar-btn-press',
              // 44px minimum touch target
              isActive
                ? cn(tool.activeClass, 'tool-active-glow')
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
        <TooltipContent side="right" className="text-xs font-medium relative px-3 py-2">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span>{tool.label}</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded border bg-muted/50 font-mono text-muted-foreground">{tool.shortcut}</kbd>
            </div>
            <span className="text-[10px] text-muted-foreground font-normal">{tool.description}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function MapToolbar() {
  const { toolMode, setToolMode } = useMapStore()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-2 bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-2">
        {tools.map((tool, index) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={toolMode === tool.id}
            onClick={() => setToolMode(tool.id)}
            index={index}
          />
        ))}
      </div>
    </TooltipProvider>
  )
}
