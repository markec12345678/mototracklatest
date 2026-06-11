'use client'

import { MapPin, Star, Heart, Flag, Home, Camera, Coffee, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMapStore, MARKER_ICON_PRESETS } from '@/lib/map-store'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin,
  Star,
  Heart,
  Flag,
  Home,
  Camera,
  Coffee,
  Music,
}

interface MarkerIconPickerProps {
  selectedIcon: string
  onIconSelect: (iconId: string) => void
  customColor: string
  onColorChange: (color: string) => void
}

export function MarkerIconPicker({
  selectedIcon,
  onIconSelect,
  customColor,
  onColorChange,
}: MarkerIconPickerProps) {
  const markerIconPresets = useMapStore((s) => s.markerIconPresets)

  return (
    <div className="space-y-3">
      {/* Icon grid */}
      <div>
        <label className="text-xs font-medium text-foreground mb-2 block">Icon</label>
        <div className="grid grid-cols-4 gap-2">
          {markerIconPresets.map((preset) => {
            const IconComponent = ICON_MAP[preset.icon]
            const isSelected = selectedIcon === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => onIconSelect(preset.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all duration-150',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                    : 'border-transparent hover:bg-accent/50'
                )}
                aria-label={`Select ${preset.name} icon`}
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: isSelected ? customColor : preset.color + '20' }}
                >
                  {IconComponent ? (
                    <IconComponent
                      className="h-4 w-4"
                      style={{ color: isSelected ? '#fff' : preset.color }}
                    />
                  ) : (
                    <MapPin
                      className="h-4 w-4"
                      style={{ color: isSelected ? '#fff' : preset.color }}
                    />
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground font-medium leading-tight">
                  {preset.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom color picker */}
      <div>
        <label className="text-xs font-medium text-foreground mb-2 block">Color</label>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="color"
              value={customColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-10 h-10 rounded-xl border-2 border-border cursor-pointer appearance-none bg-transparent"
              style={{ padding: 0 }}
              aria-label="Pick a custom color"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {MARKER_ICON_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onColorChange(preset.color)}
                className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 shadow-sm"
                style={{
                  backgroundColor: preset.color,
                  borderColor: customColor === preset.color ? '#000' : 'transparent',
                  transform: customColor === preset.color ? 'scale(1.1)' : undefined,
                }}
                aria-label={`Select ${preset.name} color`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="text-xs font-medium text-foreground mb-2 block">Preview</label>
        <div className="flex items-center justify-center p-3 bg-muted/30 rounded-xl">
          <div className="flex flex-col items-center gap-1">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: customColor }}
            >
              {(() => {
                const preset = markerIconPresets.find((p) => p.id === selectedIcon)
                const IconComponent = preset ? ICON_MAP[preset.icon] : MapPin
                return IconComponent ? (
                  <IconComponent className="h-6 w-6 text-white" />
                ) : (
                  <MapPin className="h-6 w-6 text-white" />
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
