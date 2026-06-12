'use client'

import { X, Eye, Contrast, Type, Wind, AudioLines, Palette } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMapStore } from '@/lib/map-store'

const ACCESSIBILITY_OPTIONS = [
  {
    key: 'highContrastMode' as const,
    setKey: 'setHighContrastMode' as const,
    label: 'High Contrast Mode',
    description: 'Increase borders, shadows, and text contrast for better visibility',
    icon: Contrast,
  },
  {
    key: 'largeTextMode' as const,
    setKey: 'setLargeTextMode' as const,
    label: 'Large Text',
    description: 'Increase base font size by 20% for easier reading',
    icon: Type,
  },
  {
    key: 'reducedMotionMode' as const,
    setKey: 'setReducedMotionMode' as const,
    label: 'Reduced Motion',
    description: 'Disable animations and transitions for motion sensitivity',
    icon: Wind,
  },
  {
    key: 'screenReaderMode' as const,
    setKey: 'setScreenReaderMode' as const,
    label: 'Screen Reader Mode',
    description: 'Add additional ARIA labels and descriptions for assistive technology',
    icon: AudioLines,
  },
  {
    key: 'colorBlindMode' as const,
    setKey: 'setColorBlindMode' as const,
    label: 'Color Blind Mode',
    description: 'Switch to colorblind-safe palette for markers and heatmap',
    icon: Palette,
  },
]

export function AccessibilityPanel() {
  const accessibilityPanelOpen = useMapStore((s) => s.accessibilityPanelOpen)
  const setAccessibilityPanelOpen = useMapStore((s) => s.setAccessibilityPanelOpen)

  const highContrastMode = useMapStore((s) => s.highContrastMode)
  const largeTextMode = useMapStore((s) => s.largeTextMode)
  const reducedMotionMode = useMapStore((s) => s.reducedMotionMode)
  const screenReaderMode = useMapStore((s) => s.screenReaderMode)
  const colorBlindMode = useMapStore((s) => s.colorBlindMode)

  const setHighContrastMode = useMapStore((s) => s.setHighContrastMode)
  const setLargeTextMode = useMapStore((s) => s.setLargeTextMode)
  const setReducedMotionMode = useMapStore((s) => s.setReducedMotionMode)
  const setScreenReaderMode = useMapStore((s) => s.setScreenReaderMode)
  const setColorBlindMode = useMapStore((s) => s.setColorBlindMode)

  if (!accessibilityPanelOpen) return null

  const setters: Record<string, (v: boolean) => void> = {
    highContrastMode: setHighContrastMode,
    largeTextMode: setLargeTextMode,
    reducedMotionMode: setReducedMotionMode,
    screenReaderMode: setScreenReaderMode,
    colorBlindMode: setColorBlindMode,
  }

  const values: Record<string, boolean> = {
    highContrastMode,
    largeTextMode,
    reducedMotionMode,
    screenReaderMode,
    colorBlindMode,
  }

  const activeCount = Object.values(values).filter(Boolean).length

  return (
    <Card className="w-[340px] max-w-[calc(100vw-40px)] shadow-xl border-border/50 bg-background/95 backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Accessibility
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {activeCount} active
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setAccessibilityPanelOpen(false)}
            aria-label="Close accessibility panel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {ACCESSIBILITY_OPTIONS.map((option, index) => {
          const Icon = option.icon
          const isEnabled = values[option.key]
          const setter = setters[option.key]

          return (
            <div key={option.key}>
              {index > 0 && <Separator className="my-2 opacity-50" />}
              <div className="flex items-start gap-3 py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors">
                <div className={`mt-0.5 p-1.5 rounded-md ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={option.key} className="text-xs font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <Switch
                      id={option.key}
                      checked={isEnabled}
                      onCheckedChange={setter}
                      aria-label={option.label}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        <Separator className="my-3" />

        <div className="px-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => {
              setHighContrastMode(false)
              setLargeTextMode(false)
              setReducedMotionMode(false)
              setScreenReaderMode(false)
              setColorBlindMode(false)
            }}
          >
            Reset All Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
