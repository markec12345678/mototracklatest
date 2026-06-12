'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Keyboard, Navigation, Wrench, Eye, Circle, Search } from 'lucide-react'

interface ShortcutItem {
  keys: string[]
  description: string
}

interface ShortcutCategory {
  category: string
  icon: React.ReactNode
  items: ShortcutItem[]
}

const shortcutCategories: ShortcutCategory[] = [
  {
    category: 'Navigation',
    icon: <Navigation className="h-3.5 w-3.5" />,
    items: [
      { keys: ['L'], description: 'My location' },
      { keys: ['B'], description: 'Toggle sidebar' },
      { keys: ['Shift', '?'], description: 'Toggle sidebar (alt)' },
      { keys: ['F'], description: 'Toggle fullscreen' },
      { keys: ['/'], description: 'Focus search' },
      { keys: ['Scroll'], description: 'Zoom in/out' },
      { keys: ['Drag'], description: 'Pan the map' },
      { keys: ['Right Drag'], description: 'Rotate map' },
      { keys: ['Shift+Drag'], description: 'Tilt map' },
    ],
  },
  {
    category: 'Tools',
    icon: <Wrench className="h-3.5 w-3.5" />,
    items: [
      { keys: ['1'], description: 'Navigate mode' },
      { keys: ['2'], description: 'Drop Pin mode' },
      { keys: ['3'], description: 'Measure mode' },
      { keys: ['4'], description: 'Directions mode' },
      { keys: ['5'], description: 'Draw mode' },
      { keys: ['6'], description: 'Area measurement mode' },
      { keys: ['8'], description: 'Annotate mode' },
      { keys: ['D'], description: 'Toggle drawing mode' },
      { keys: ['Esc'], description: 'Clear selection / Reset tool' },
    ],
  },
  {
    category: 'Views',
    icon: <Eye className="h-3.5 w-3.5" />,
    items: [
      { keys: ['H'], description: 'Toggle heatmap' },
      { keys: ['B'], description: 'Toggle 3D buildings' },
      { keys: ['V'], description: 'Toggle voice navigation' },
      { keys: ['T'], description: 'Open theme customizer' },
      { keys: ['C'], description: 'Cycle coordinate format' },
      { keys: ['Shift', 'C'], description: 'Copy coordinates' },
      { keys: ['0'], description: 'Streets style' },
      { keys: ['7'], description: 'Satellite style' },
      { keys: ['9'], description: 'Cycle all styles' },
      { keys: ['1-8'], description: 'Switch map styles quickly' },
    ],
  },
  {
    category: 'Recording',
    icon: <Circle className="h-3.5 w-3.5" />,
    items: [
      { keys: ['R'], description: 'Start/stop track recording' },
      { keys: ['Ctrl', 'G'], description: 'Go to coordinates' },
      { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
      { keys: ['Ctrl', 'Y'], description: 'Redo last action' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo (alternative)' },
      { keys: ['?'], description: 'Show this dialog' },
    ],
  },
]

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return shortcutCategories
    const q = searchQuery.toLowerCase()
    return shortcutCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.description.toLowerCase().includes(q) ||
            item.keys.some((k) => k.toLowerCase().includes(q))
        ),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [searchQuery])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="dialog-gradient-header -mx-6 -mt-6 px-6 pt-6 pb-4 mb-2 rounded-t-2xl shrink-0">
          <DialogTitle className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Keyboard className="h-4 w-4 text-white" />
            </div>
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate the map faster.
          </DialogDescription>
          {/* Search / filter input */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter shortcuts..."
              className="pl-9 h-9 text-sm bg-background/50 border-border/50"
              aria-label="Filter keyboard shortcuts"
            />
          </div>
        </DialogHeader>
        <div className="space-y-4 py-2 overflow-y-auto flex-1 px-1">
          {filteredCategories.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                {group.icon}
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
          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No shortcuts match &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
