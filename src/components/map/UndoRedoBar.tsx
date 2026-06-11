'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Undo2, Redo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUndoStore } from '@/lib/use-undo-store'

export function UndoRedoBar() {
  const canUndo = useUndoStore((s) => s.canUndo)
  const canRedo = useUndoStore((s) => s.canRedo)
  const undoStack = useUndoStore((s) => s.undoStack)
  const redoStack = useUndoStore((s) => s.redoStack)
  const undo = useUndoStore((s) => s.undo)
  const redo = useUndoStore((s) => s.redo)

  const lastUndoAction = undoStack[undoStack.length - 1]
  const lastRedoAction = redoStack[redoStack.length - 1]

  // Don't render if there's nothing to undo or redo
  const hasHistory = canUndo || canRedo

  return (
    <AnimatePresence>
      {hasHistory && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex items-center gap-0.5 map-control-glass rounded-xl border border-border/50 shadow-lg p-0.5"
        >
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4} className="text-xs">
                <p>
                  {canUndo
                    ? `Undo: ${lastUndoAction?.description ?? 'Action'}`
                    : 'Nothing to undo'}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[9px] font-mono font-medium rounded border bg-muted/50 border-border shadow-sm">
                    Ctrl
                  </kbd>{' '}
                  +{' '}
                  <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[9px] font-mono font-medium rounded border bg-muted/50 border-border shadow-sm">
                    Z
                  </kbd>
                </p>
              </TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-border/50" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Redo"
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4} className="text-xs">
                <p>
                  {canRedo
                    ? `Redo: ${lastRedoAction?.description ?? 'Action'}`
                    : 'Nothing to redo'}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[9px] font-mono font-medium rounded border bg-muted/50 border-border shadow-sm">
                    Ctrl
                  </kbd>{' '}
                  +{' '}
                  <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[9px] font-mono font-medium rounded border bg-muted/50 border-border shadow-sm">
                    Y
                  </kbd>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
