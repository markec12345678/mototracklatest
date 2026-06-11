'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

const shortcuts = [
  { category: 'Tools', items: [
    { keys: ['1'], description: 'Navigate mode' },
    { keys: ['2'], description: 'Drop Pin mode' },
    { keys: ['3'], description: 'Measure mode' },
    { keys: ['4'], description: 'Directions mode' },
    { keys: ['5'], description: 'Draw mode' },
    { keys: ['6'], description: 'Area measurement mode' },
    { keys: ['Esc'], description: 'Clear selection / Reset tool' },
  ]},
  { category: 'Map Styles', items: [
    { keys: ['0'], description: 'Streets style' },
    { keys: ['7'], description: 'Satellite style' },
    { keys: ['8'], description: 'Dark style' },
    { keys: ['9'], description: 'Cycle all styles' },
  ]},
  { category: 'Undo / Redo', items: [
    { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
    { keys: ['Ctrl', 'Y'], description: 'Redo last action' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo (alternative)' },
  ]},
  { category: 'Navigation', items: [
    { keys: ['B'], description: 'Toggle sidebar' },
    { keys: ['F'], description: 'Toggle fullscreen' },
    { keys: ['L'], description: 'My location' },
    { keys: ['/'], description: 'Focus search' },
    { keys: ['?'], description: 'Show this dialog' },
  ]},
  { category: 'Map', items: [
    { keys: ['Scroll'], description: 'Zoom in/out' },
    { keys: ['Drag'], description: 'Pan the map' },
    { keys: ['Right Drag'], description: 'Rotate map' },
    { keys: ['Shift+Drag'], description: 'Tilt map' },
  ]},
  { category: 'Tools Tips', items: [
    { keys: ['Click'], description: 'Add point (in Pin/Measure/Area mode)' },
    { keys: ['Click'], description: 'Add route waypoint (in Directions mode)' },
    { keys: ['Drag+Draw'], description: 'Freehand drawing (in Draw mode)' },
    { keys: ['Drag'], description: 'Move route points (in Directions mode)' },
    { keys: ['Click'], description: 'Show building info (in Navigate + 3D mode)' },
    { keys: ['Click'], description: 'Copy coordinates (in coordinate display)' },
  ]},
]

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Keyboard className="h-4 w-4 text-white" />
            </div>
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate the map faster.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm">{item.description}</span>
                    <div className="flex gap-1">
                      {item.keys.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 text-[11px] font-mono font-medium rounded-lg border bg-muted/50 border-border shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
