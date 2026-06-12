'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Minus,
  Pentagon,
  Circle,
  Square,
  Pencil,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useMapStore } from '@/lib/map-store'

const DRAWING_TOOLS = [
  { id: 'point' as const, icon: MapPin, label: 'Point', shortcut: 'P' },
  { id: 'line' as const, icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'polygon' as const, icon: Pentagon, label: 'Polygon', shortcut: 'G' },
  { id: 'circle' as const, icon: Circle, label: 'Circle', shortcut: 'C' },
  { id: 'rectangle' as const, icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'freehand' as const, icon: Pencil, label: 'Freehand', shortcut: 'F' },
]

const PRESET_COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

export function DrawingToolbar() {
  const drawingTool = useMapStore((s) => s.drawingTool)
  const setDrawingTool = useMapStore((s) => s.setDrawingTool)
  const drawingColor = useMapStore((s) => s.drawingColor)
  const setDrawingColor = useMapStore((s) => s.setDrawingColor)
  const drawingLineWidth = useMapStore((s) => s.drawingLineWidth)
  const setDrawingLineWidth = useMapStore((s) => s.setDrawingLineWidth)
  const drawnFeatures = useMapStore((s) => s.drawnFeatures)
  const removeDrawnFeature = useMapStore((s) => s.removeDrawnFeature)
  const clearDrawnFeatures = useMapStore((s) => s.clearDrawnFeatures)

  const isActive = drawingTool !== 'none'

  const handleToolSelect = useCallback((tool: 'point' | 'line' | 'polygon' | 'circle' | 'rectangle' | 'freehand') => {
    setDrawingTool(drawingTool === tool ? 'none' : tool)
  }, [drawingTool, setDrawingTool])

  const handleUndo = useCallback(() => {
    if (drawnFeatures.length > 0) {
      const lastFeature = drawnFeatures[drawnFeatures.length - 1]
      removeDrawnFeature(lastFeature.id)
    }
  }, [drawnFeatures, removeDrawnFeature])

  const handleClose = useCallback(() => {
    setDrawingTool('none')
  }, [setDrawingTool])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute left-20 z-10"
          style={{ top: '80px' }}
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-3 space-y-3 w-16">
            {/* Close button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                onClick={handleClose}
                aria-label="Close drawing toolbar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator className="opacity-50" />

            {/* Drawing tools */}
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-col gap-1">
                {DRAWING_TOOLS.map((tool) => (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-10 w-10 rounded-xl transition-all',
                          drawingTool === tool.id
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'hover:bg-accent'
                        )}
                        onClick={() => handleToolSelect(tool.id)}
                        aria-label={`${tool.label} tool`}
                      >
                        <tool.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span>{tool.label}</span>
                        <kbd className="text-[10px] px-1 py-0.5 rounded border bg-muted/50 font-mono">{tool.shortcut}</kbd>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>

            <Separator className="opacity-50" />

            {/* Color picker */}
            <div className="grid grid-cols-2 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    'h-5 w-5 rounded-full border-2 transition-transform hover:scale-110',
                    drawingColor === color ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setDrawingColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>

            {/* Custom color input */}
            <div className="flex justify-center">
              <input
                type="color"
                value={drawingColor}
                onChange={(e) => setDrawingColor(e.target.value)}
                className="h-6 w-6 cursor-pointer rounded border border-border"
                aria-label="Custom color picker"
              />
            </div>

            <Separator className="opacity-50" />

            {/* Line width slider */}
            <div className="space-y-1 px-1">
              <div className="text-[8px] text-muted-foreground text-center">Width</div>
              <input
                type="range"
                min="1"
                max="10"
                value={drawingLineWidth}
                onChange={(e) => setDrawingLineWidth(Number(e.target.value))}
                className="w-full h-1 accent-emerald-500"
                aria-label="Line width"
              />
              <div className="text-[9px] text-center text-muted-foreground">{drawingLineWidth}px</div>
            </div>

            <Separator className="opacity-50" />

            {/* Action buttons */}
            <div className="flex flex-col gap-1">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-amber-500/10 hover:text-amber-600"
                      onClick={handleUndo}
                      disabled={drawnFeatures.length === 0}
                      aria-label="Undo last drawing"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">Undo</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                      onClick={clearDrawnFeatures}
                      disabled={drawnFeatures.length === 0}
                      aria-label="Clear all drawings"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">Clear All</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Feature count */}
            {drawnFeatures.length > 0 && (
              <div className="text-[9px] text-center text-muted-foreground">
                {drawnFeatures.length} item{drawnFeatures.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
