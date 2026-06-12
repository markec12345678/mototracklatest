'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Ruler, Crosshair, Pencil, Maximize2, Type, Building2, Sparkles, Volume2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useMapStore, type ToolMode } from '@/lib/map-store'
import { useTranslation } from '@/lib/translations'
import { useCollaborationStore } from '@/lib/collaboration-store'

interface ToolDef {
  id: ToolMode
  icon: React.ReactNode
  label: string
  activeClass: string
  shortcut: string
  description: string
}

interface ToggleToolDef {
  id: string
  icon: React.ReactNode
  label: string
  activeClass: string
  shortcut: string
  description: string
}

function ToolButton({ tool, isActive, onClick, index }: {
  tool: ToolDef
  isActive: boolean
  onClick: () => void
  index: number
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

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
              'h-11 w-11 rounded-xl transition-all duration-200 relative',
              isActive
                ? cn(tool.activeClass, 'tool-active-glow')
                : 'hover:bg-accent',
              isPressed && 'scale-90'
            )}
            onClick={() => {
              setIsPressed(true)
              onClick()
              setTimeout(() => setIsPressed(false), 150)
            }}
            aria-label={`${tool.label} tool (press ${tool.shortcut})`}
          >
            {tool.icon}
            {isActive && (
              <>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white tool-dot-glow" />
                <span className="absolute inset-0 rounded-xl ring-2 ring-white/30 pointer-events-none" />
              </>
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

export function MapToolbar({ aiSuggestionsOpen, setAiSuggestionsOpen }: { aiSuggestionsOpen: boolean; setAiSuggestionsOpen: (v: boolean) => void }) {
  const { toolMode, setToolMode } = useMapStore()
  const buildings3DEnabled = useMapStore((s) => s.buildings3DEnabled)
  const setBuildings3DEnabled = useMapStore((s) => s.setBuildings3DEnabled)
  const drawingTool = useMapStore((s) => s.drawingTool)
  const setDrawingTool = useMapStore((s) => s.setDrawingTool)
  const voiceNavigationEnabled = useMapStore((s) => s.voiceNavigationEnabled)
  const setVoiceNavigationEnabled = useMapStore((s) => s.setVoiceNavigationEnabled)
  const routeSteps = useMapStore((s) => s.routeSteps)
  const isCollaborating = useCollaborationStore((s) => s.isCollaborating)
  const { t } = useTranslation()

  const isDrawModeActive = drawingTool !== 'none'
  const isVoiceActive = voiceNavigationEnabled && routeSteps.length > 0

  const toolGroups: {
    separatorAfter?: boolean
    tools: ToolDef[]
  }[] = [
    {
      tools: [
        {
          id: 'navigate',
          icon: <Navigation className="h-4 w-4" />,
          label: t('toolNavigate'),
          activeClass: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30',
          shortcut: '1',
          description: t('toolNavigateDesc'),
        },
        {
          id: 'mark',
          icon: <MapPin className="h-4 w-4" />,
          label: t('toolMark'),
          activeClass: 'bg-red-500 text-white shadow-md shadow-red-500/30',
          shortcut: '2',
          description: t('toolMarkDesc'),
        },
      ],
    },
    {
      separatorAfter: true,
      tools: [
        {
          id: 'measure',
          icon: <Ruler className="h-4 w-4" />,
          label: t('toolMeasure'),
          activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
          shortcut: '3',
          description: t('toolMeasureDesc'),
        },
        {
          id: 'directions',
          icon: <Crosshair className="h-4 w-4" />,
          label: t('toolDirections'),
          activeClass: 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30',
          shortcut: '4',
          description: t('toolDirectionsDesc'),
        },
        {
          id: 'area',
          icon: <Maximize2 className="h-4 w-4" />,
          label: t('toolArea'),
          activeClass: 'bg-violet-500 text-white shadow-md shadow-violet-500/30',
          shortcut: '6',
          description: t('toolAreaDesc'),
        },
      ],
    },
    {
      tools: [
        {
          id: 'draw',
          icon: <Pencil className="h-4 w-4" />,
          label: t('toolDraw'),
          activeClass: 'bg-green-500 text-white shadow-md shadow-green-500/30',
          shortcut: '5',
          description: t('toolDrawDesc'),
        },
        {
          id: 'annotate',
          icon: <Type className="h-4 w-4" />,
          label: t('toolAnnotate'),
          activeClass: 'bg-pink-500 text-white shadow-md shadow-pink-500/30',
          shortcut: '8',
          description: t('toolAnnotateDesc'),
        },
      ],
    },
  ]

  // Flatten tools for index counting
  let globalIndex = 0

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-1 bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-2">
        {toolGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {groupIdx > 0 && (
              <Separator className="my-1 opacity-50" />
            )}
            <div className="flex flex-col gap-1">
              {group.tools.map((tool) => {
                const idx = globalIndex++
                return (
                  <ToolButton
                    key={tool.id}
                    tool={tool}
                    isActive={tool.id === 'draw' ? isDrawModeActive : toolMode === tool.id}
                    onClick={() => {
                      if (tool.id === 'draw') {
                        // Toggle enhanced drawing tools
                        setDrawingTool(drawingTool === 'none' ? 'line' : 'none')
                        setToolMode('draw')
                      } else {
                        setToolMode(tool.id)
                        if (drawingTool !== 'none') {
                          setDrawingTool('none')
                        }
                      }
                    }}
                    index={idx}
                  />
                )
              })}
            </div>
          </div>
        ))}
        {/* 3D Buildings Toggle */}
        <Separator className="my-1 opacity-50" />
        <div className="flex flex-col gap-1">
          <ToolButton
            tool={{
              id: 'navigate' as any,
              icon: <Building2 className="h-4 w-4" />,
              label: '3D Buildings',
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
              shortcut: 'B',
              description: 'Toggle 3D building explorer',
            }}
            isActive={buildings3DEnabled}
            onClick={() => setBuildings3DEnabled(!buildings3DEnabled)}
            index={globalIndex}
          />
          <ToolButton
            tool={{
              id: 'navigate' as any,
              icon: <Sparkles className="h-4 w-4" />,
              label: t('aiTitle'),
              activeClass: 'bg-purple-600 text-white shadow-md shadow-purple-600/30',
              shortcut: 'A',
              description: 'Get AI-powered location suggestions',
            }}
            isActive={aiSuggestionsOpen}
            onClick={() => setAiSuggestionsOpen(!aiSuggestionsOpen)}
            index={globalIndex + 1}
          />
        </div>

        {/* Voice & Collaboration */}
        <Separator className="my-1 opacity-50" />
        <div className="flex flex-col gap-1">
          <ToolButton
            tool={{
              id: 'navigate' as any,
              icon: <Volume2 className="h-4 w-4" />,
              label: 'Voice Nav',
              activeClass: 'bg-teal-500 text-white shadow-md shadow-teal-500/30',
              shortcut: 'V',
              description: 'Turn-by-turn voice navigation',
            }}
            isActive={isVoiceActive}
            onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                if (voiceNavigationEnabled) {
                  window.speechSynthesis.cancel()
                } else {
                  const u = new SpeechSynthesisUtterance('')
                  u.volume = 0
                  window.speechSynthesis.speak(u)
                }
              }
              setVoiceNavigationEnabled(!voiceNavigationEnabled)
            }}
            index={globalIndex + 2}
          />
          <div className="relative">
            <ToolButton
              tool={{
                id: 'navigate' as any,
                icon: <Users className="h-4 w-4" />,
                label: 'Collaborate',
                activeClass: 'bg-sky-500 text-white shadow-md shadow-sky-500/30',
                shortcut: 'C',
                description: 'Share and collaborate on the map',
              }}
              isActive={isCollaborating}
              onClick={() => {
                // This is handled by CollaborationPanel dialog trigger
                const btn = document.querySelector('[aria-label="Collaboration"]') as HTMLButtonElement | null
                btn?.click()
              }}
              index={globalIndex + 3}
            />
            {isCollaborating && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-background" />
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
