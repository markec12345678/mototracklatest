'use client'

import { Palette, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useMapStore } from '@/lib/map-store'

interface ThemeColorKey {
  key: 'water' | 'land' | 'roads' | 'buildings' | 'parks' | 'labels'
  label: string
  defaultColor: string
}

const THEME_COLORS: ThemeColorKey[] = [
  { key: 'water', label: 'Water', defaultColor: '#aad3df' },
  { key: 'land', label: 'Land', defaultColor: '#f2efe9' },
  { key: 'roads', label: 'Roads', defaultColor: '#fcfae5' },
  { key: 'buildings', label: 'Buildings', defaultColor: '#d9d0c5' },
  { key: 'parks', label: 'Parks', defaultColor: '#c8e6b8' },
  { key: 'labels', label: 'Labels', defaultColor: '#333333' },
]

interface ThemePreset {
  id: string
  name: string
  emoji: string
  colors: Record<string, string>
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'standard',
    name: 'Standard',
    emoji: '🗺️',
    colors: {},
  },
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    colors: {
      water: '#1a3a4a',
      land: '#1a1a2e',
      roads: '#2a2a4a',
      buildings: '#252540',
      parks: '#1a3a1a',
      labels: '#c0c0d0',
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    emoji: '📜',
    colors: {
      water: '#8fa5a0',
      land: '#f0e6d2',
      roads: '#e0d5c0',
      buildings: '#d4c8b0',
      parks: '#c5d4a8',
      labels: '#5a4a38',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    emoji: '💡',
    colors: {
      water: '#0ff0fc',
      land: '#1a0a2e',
      roads: '#ff00ff',
      buildings: '#2a1a4e',
      parks: '#39ff14',
      labels: '#f0f0f0',
    },
  },
  {
    id: 'pastel',
    name: 'Pastel',
    emoji: '🎨',
    colors: {
      water: '#b8d8e8',
      land: '#f5f0e8',
      roads: '#e8e0d8',
      buildings: '#e0d5cd',
      parks: '#c8e8c0',
      labels: '#6b5e52',
    },
  },
]

export function MapThemeCustomizer() {
  const mapThemeOverrides = useMapStore((s) => s.mapThemeOverrides)
  const setMapThemeOverrides = useMapStore((s) => s.setMapThemeOverrides)
  const mapThemePreset = useMapStore((s) => s.mapThemePreset)
  const setMapThemePreset = useMapStore((s) => s.setMapThemePreset)

  const handleColorChange = (key: string, color: string) => {
    setMapThemeOverrides({ ...mapThemeOverrides, [key]: color })
    setMapThemePreset('custom')
  }

  const handlePresetSelect = (preset: ThemePreset) => {
    setMapThemeOverrides(preset.colors)
    setMapThemePreset(preset.id)
  }

  const handleReset = () => {
    setMapThemeOverrides({})
    setMapThemePreset('standard')
  }

  const hasOverrides = Object.keys(mapThemeOverrides).length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
          Theme Customizer
        </h3>
        {hasOverrides && (
          <Badge variant="outline" className="text-[9px]">
            Custom
          </Badge>
        )}
      </div>

      {/* Preset themes */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Presets</p>
        <div className="grid grid-cols-3 gap-1.5">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                mapThemePreset === preset.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/50 hover:border-border hover:bg-accent/30'
              }`}
              aria-label={`Apply ${preset.name} theme`}
            >
              <span className="text-base">{preset.emoji}</span>
              <span className="text-[10px] font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Color pickers */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Colors</p>
        {THEME_COLORS.map((item) => (
          <div key={item.key} className="flex items-center gap-2.5 px-1">
            <div
              className="w-6 h-6 rounded-md border border-border/50 shadow-sm shrink-0"
              style={{ backgroundColor: mapThemeOverrides[item.key] || item.defaultColor }}
            />
            <Label className="text-xs flex-1">{item.label}</Label>
            <input
              type="color"
              value={mapThemeOverrides[item.key] || item.defaultColor}
              onChange={(e) => handleColorChange(item.key, e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              aria-label={`${item.label} color`}
            />
          </div>
        ))}
      </div>

      <Separator />

      {/* Reset button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs h-8 gap-1.5"
        onClick={handleReset}
        disabled={!hasOverrides}
      >
        <RotateCcw className="h-3 w-3" />
        Reset to Default
      </Button>
    </div>
  )
}
