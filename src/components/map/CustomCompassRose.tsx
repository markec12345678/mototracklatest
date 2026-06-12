'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMapStore, type CompassRoseState } from '@/lib/map-store'
import {
  Compass,
  Settings2,
  RotateCcw,
} from 'lucide-react'

const SIZE_MAP = {
  small: 80,
  medium: 120,
  large: 160,
}

const POSITION_STYLES: Record<string, string> = {
  'top-right': 'top-20 right-4',
  'top-left': 'top-20 left-4',
  'bottom-right': 'bottom-20 right-4',
  'bottom-left': 'bottom-20 left-4',
}

// Generate cardinal/intercardinal labels based on number of points
function getLabels(points: number): { angle: number; label: string }[] {
  if (points === 4) {
    return [
      { angle: 0, label: 'N' },
      { angle: 90, label: 'E' },
      { angle: 180, label: 'S' },
      { angle: 270, label: 'W' },
    ]
  }
  if (points === 8) {
    return [
      { angle: 0, label: 'N' },
      { angle: 45, label: 'NE' },
      { angle: 90, label: 'E' },
      { angle: 135, label: 'SE' },
      { angle: 180, label: 'S' },
      { angle: 225, label: 'SW' },
      { angle: 270, label: 'W' },
      { angle: 315, label: 'NW' },
    ]
  }
  // 16 points
  const labels = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return labels.map((label, i) => ({ angle: i * 22.5, label }))
}

// Classic 8-point compass rose SVG
function ClassicCompassRose({ state, bearing }: { state: CompassRoseState; bearing: number }) {
  const size = SIZE_MAP[state.size]
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 16
  const labels = getLabels(state.points)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(${-bearing}, ${cx}, ${cy})`}>
        {/* Outer circle */}
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={state.secondaryColor} strokeWidth="1" opacity="0.4" />

        {/* Main cardinal points (longer, thicker) */}
        {[0, 90, 180, 270].map((angle) => (
          <g key={`cardinal-${angle}`} transform={`rotate(${angle}, ${cx}, ${cy})`}>
            {/* Primary half */}
            <polygon
              points={`${cx},${cy - r} ${cx - 4},${cy} ${cx},${cy - 4}`}
              fill={state.primaryColor}
              opacity="0.9"
            />
            {/* Secondary half */}
            <polygon
              points={`${cx},${cy - r} ${cx + 4},${cy} ${cx},${cy - 4}`}
              fill={state.secondaryColor}
              opacity="0.7"
            />
          </g>
        ))}

        {/* Intercardinal points if 8 or 16 points */}
        {state.points >= 8 && [45, 135, 225, 315].map((angle) => (
          <g key={`intercardinal-${angle}`} transform={`rotate(${angle}, ${cx}, ${cy})`}>
            <polygon
              points={`${cx},${cy - r * 0.7} ${cx - 3},${cy} ${cx},${cy - 4}`}
              fill={state.primaryColor}
              opacity="0.6"
            />
            <polygon
              points={`${cx},${cy - r * 0.7} ${cx + 3},${cy} ${cx},${cy - 4}`}
              fill={state.secondaryColor}
              opacity="0.5"
            />
          </g>
        ))}

        {/* Minor points for 16-point */}
        {state.points === 16 && [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => (
          <line
            key={`minor-${angle}`}
            x1={cx}
            y1={cy - r * 0.5}
            x2={cx}
            y2={cy - 4}
            stroke={state.secondaryColor}
            strokeWidth="1"
            opacity="0.4"
            transform={`rotate(${angle}, ${cx}, ${cy})`}
          />
        ))}

        {/* Center circle */}
        <circle cx={cx} cy={cy} r={4} fill={state.primaryColor} />
        <circle cx={cx} cy={cy} r={2} fill={state.secondaryColor} />

        {/* Degree markings */}
        {state.showDegrees && Array.from({ length: 36 }, (_, i) => {
          const angle = i * 10
          const isMajor = angle % 90 === 0
          const len = isMajor ? 6 : 3
          return (
            <line
              key={`deg-${angle}`}
              x1={cx}
              y1={cy - r - 2}
              x2={cx}
              y2={cy - r - 2 - len}
              stroke={state.secondaryColor}
              strokeWidth={isMajor ? 1.5 : 0.5}
              opacity="0.5"
              transform={`rotate(${angle}, ${cx}, ${cy})`}
            />
          )
        })}
      </g>

      {/* Labels (not rotated with bearing) */}
      {state.showLabels && labels.map(({ angle, label }) => {
        const rad = ((angle - bearing) * Math.PI) / 180
        const labelR = r + 12
        const x = cx + labelR * Math.sin(rad)
        const y = cy - labelR * Math.cos(rad)
        const isCardinal = ['N', 'E', 'S', 'W'].includes(label)
        return (
          <text
            key={`label-${label}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isCardinal ? state.primaryColor : state.secondaryColor}
            fontSize={isCardinal ? (state.size === 'small' ? 9 : 11) : (state.size === 'small' ? 7 : 8)}
            fontWeight={isCardinal ? 'bold' : 'normal'}
            opacity="0.9"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// Modern minimalist compass rose SVG
function ModernCompassRose({ state, bearing }: { state: CompassRoseState; bearing: number }) {
  const size = SIZE_MAP[state.size]
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 16

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(${-bearing}, ${cx}, ${cy})`}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={state.secondaryColor} strokeWidth="2" opacity="0.3" />

        {/* North pointer */}
        <polygon
          points={`${cx},${cy - r + 4} ${cx - 5},${cy - 6} ${cx + 5},${cy - 6}`}
          fill={state.primaryColor}
        />

        {/* South pointer */}
        <polygon
          points={`${cx},${cy + r - 4} ${cx - 5},${cy + 6} ${cx + 5},${cy + 6}`}
          fill={state.secondaryColor}
          opacity="0.5"
        />

        {/* East/West ticks */}
        <line x1={cx + r - 4} y1={cy} x2={cx + 6} y2={cy} stroke={state.secondaryColor} strokeWidth="2" opacity="0.4" />
        <line x1={cx - r + 4} y1={cy} x2={cx - 6} y2={cy} stroke={state.secondaryColor} strokeWidth="2" opacity="0.4" />

        {/* Degree markings */}
        {state.showDegrees && Array.from({ length: 36 }, (_, i) => {
          const angle = i * 10
          const isMajor = angle % 90 === 0
          const len = isMajor ? 5 : 2
          return (
            <line
              key={`deg-${angle}`}
              x1={cx}
              y1={cy - r}
              x2={cx}
              y2={cy - r - len}
              stroke={state.secondaryColor}
              strokeWidth={isMajor ? 1 : 0.5}
              opacity="0.4"
              transform={`rotate(${angle}, ${cx}, ${cy})`}
            />
          )
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={state.primaryColor} />
      </g>

      {/* Labels */}
      {state.showLabels && getLabels(Math.min(state.points, 4)).map(({ angle, label }) => {
        const rad = ((angle - bearing) * Math.PI) / 180
        const labelR = r + 12
        const x = cx + labelR * Math.sin(rad)
        const y = cy - labelR * Math.cos(rad)
        const isCardinal = ['N', 'E', 'S', 'W'].includes(label)
        return (
          <text
            key={`label-${label}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isCardinal ? state.primaryColor : state.secondaryColor}
            fontSize={isCardinal ? (state.size === 'small' ? 10 : 12) : (state.size === 'small' ? 8 : 9)}
            fontWeight={isCardinal ? 'bold' : 'normal'}
            opacity="0.85"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// Nautical style compass rose SVG
function NauticalCompassRose({ state, bearing }: { state: CompassRoseState; bearing: number }) {
  const size = SIZE_MAP[state.size]
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 16

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(${-bearing}, ${cx}, ${cy})`}>
        {/* Outer decorative circle */}
        <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke={state.secondaryColor} strokeWidth="1.5" opacity="0.3" />
        <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={state.secondaryColor} strokeWidth="0.5" opacity="0.2" />

        {/* Fleur-de-lis style north pointer */}
        <polygon
          points={`${cx},${cy - r} ${cx - 6},${cy - 10} ${cx - 2},${cy - 8} ${cx},${cy - 14} ${cx + 2},${cy - 8} ${cx + 6},${cy - 10}`}
          fill={state.primaryColor}
        />

        {/* Cardinal diamond points */}
        {[90, 270].map((angle) => (
          <g key={`nautical-${angle}`} transform={`rotate(${angle}, ${cx}, ${cy})`}>
            <polygon
              points={`${cx},${cy - r * 0.8} ${cx - 4},${cy} ${cx},${cy - 4} ${cx + 4},${cy}`}
              fill={state.secondaryColor}
              opacity="0.5"
            />
          </g>
        ))}

        {/* South pointer */}
        <g transform={`rotate(180, ${cx}, ${cy})`}>
          <polygon
            points={`${cx},${cy - r * 0.8} ${cx - 5},${cy} ${cx + 5},${cy}`}
            fill={state.secondaryColor}
            opacity="0.4"
          />
        </g>

        {/* Intercardinal lines */}
        {[45, 135, 225, 315].map((angle) => (
          <line
            key={`nautical-line-${angle}`}
            x1={cx}
            y1={cy - r * 0.6}
            x2={cx}
            y2={cy - 4}
            stroke={state.secondaryColor}
            strokeWidth="1"
            opacity="0.3"
            transform={`rotate(${angle}, ${cx}, ${cy})`}
          />
        ))}

        {/* Degree markings */}
        {state.showDegrees && Array.from({ length: 36 }, (_, i) => {
          const angle = i * 10
          const isMajor = angle % 90 === 0
          const isMinor = angle % 30 === 0
          const len = isMajor ? 6 : isMinor ? 4 : 2
          return (
            <line
              key={`deg-${angle}`}
              x1={cx}
              y1={cy - r - 1}
              x2={cx}
              y2={cy - r - 1 - len}
              stroke={state.secondaryColor}
              strokeWidth={isMajor ? 1.5 : 0.5}
              opacity={isMajor ? 0.6 : 0.3}
              transform={`rotate(${angle}, ${cx}, ${cy})`}
            />
          )
        })}

        {/* Center rose */}
        <circle cx={cx} cy={cy} r={5} fill={state.primaryColor} opacity="0.8" />
        <circle cx={cx} cy={cy} r={2.5} fill={state.secondaryColor} />
      </g>

      {/* Labels */}
      {state.showLabels && getLabels(state.points).map(({ angle, label }) => {
        const rad = ((angle - bearing) * Math.PI) / 180
        const labelR = r + 14
        const x = cx + labelR * Math.sin(rad)
        const y = cy - labelR * Math.cos(rad)
        const isCardinal = ['N', 'E', 'S', 'W'].includes(label)
        return (
          <text
            key={`label-${label}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isCardinal ? state.primaryColor : state.secondaryColor}
            fontSize={isCardinal ? (state.size === 'small' ? 10 : 13) : (state.size === 'small' ? 7 : 8)}
            fontWeight={isCardinal ? 'bold' : 'normal'}
            fontStyle={isCardinal ? 'italic' : 'normal'}
            opacity="0.9"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// Custom compass rose - uses selected number of points
function CustomCompassRose({ state, bearing }: { state: CompassRoseState; bearing: number }) {
  const size = SIZE_MAP[state.size]
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 16
  const labels = getLabels(state.points)
  const angleStep = 360 / state.points

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(${-bearing}, ${cx}, ${cy})`}>
        {/* Outer circle */}
        <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={state.secondaryColor} strokeWidth="1" opacity="0.3" />

        {/* Points */}
        {Array.from({ length: state.points }, (_, i) => {
          const angle = i * angleStep
          const isCardinal = i % (state.points / 4) === 0
          const pointLen = isCardinal ? r : r * 0.65
          const pointWidth = isCardinal ? 5 : 3

          return (
            <g key={`point-${i}`} transform={`rotate(${angle}, ${cx}, ${cy})`}>
              <polygon
                points={`${cx},${cy - pointLen} ${cx - pointWidth},${cy} ${cx},${cy - 4}`}
                fill={state.primaryColor}
                opacity={isCardinal ? 0.9 : 0.5}
              />
              <polygon
                points={`${cx},${cy - pointLen} ${cx + pointWidth},${cy} ${cx},${cy - 4}`}
                fill={state.secondaryColor}
                opacity={isCardinal ? 0.7 : 0.4}
              />
            </g>
          )
        })}

        {/* Degree markings */}
        {state.showDegrees && Array.from({ length: 36 }, (_, i) => {
          const angle = i * 10
          const isMajor = angle % 90 === 0
          const len = isMajor ? 5 : 2
          return (
            <line
              key={`deg-${angle}`}
              x1={cx}
              y1={cy - r}
              x2={cx}
              y2={cy - r - len}
              stroke={state.secondaryColor}
              strokeWidth={isMajor ? 1 : 0.5}
              opacity="0.4"
              transform={`rotate(${angle}, ${cx}, ${cy})`}
            />
          )
        })}

        {/* Center */}
        <circle cx={cx} cy={cy} r={4} fill={state.primaryColor} />
        <circle cx={cx} cy={cy} r={2} fill={state.secondaryColor} />
      </g>

      {/* Labels */}
      {state.showLabels && labels.map(({ angle, label }) => {
        const rad = ((angle - bearing) * Math.PI) / 180
        const labelR = r + 12
        const x = cx + labelR * Math.sin(rad)
        const y = cy - labelR * Math.cos(rad)
        const isCardinal = ['N', 'E', 'S', 'W'].includes(label)
        return (
          <text
            key={`label-${label}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isCardinal ? state.primaryColor : state.secondaryColor}
            fontSize={isCardinal ? (state.size === 'small' ? 10 : 12) : (state.size === 'small' ? 7 : 8)}
            fontWeight={isCardinal ? 'bold' : 'normal'}
            opacity="0.85"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

function CompassRoseSVG({ state, bearing }: { state: CompassRoseState; bearing: number }) {
  switch (state.style) {
    case 'classic': return <ClassicCompassRose state={state} bearing={bearing} />
    case 'modern': return <ModernCompassRose state={state} bearing={bearing} />
    case 'nautical': return <NauticalCompassRose state={state} bearing={bearing} />
    case 'custom': return <CustomCompassRose state={state} bearing={bearing} />
    default: return <ClassicCompassRose state={state} bearing={bearing} />
  }
}

export function CustomCompassRose() {
  const compassRose = useMapStore((s) => s.compassRose)
  const setCompassRose = useMapStore((s) => s.setCompassRose)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [bearing, setBearing] = useState(0)
  const animationRef = useRef<number | null>(null)
  const targetBearingRef = useRef(0)
  const currentBearingRef = useRef(0)

  // Animate bearing changes smoothly
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateBearing = () => {
      const map = (window as any).__mainMap
      if (map) {
        targetBearingRef.current = map.getBearing()
      }

      // Smooth interpolation
      const diff = targetBearingRef.current - currentBearingRef.current
      // Handle wrapping
      const wrappedDiff = ((diff + 180) % 360) - 180
      currentBearingRef.current += wrappedDiff * 0.15

      setBearing(currentBearingRef.current)

      animationRef.current = requestAnimationFrame(updateBearing)
    }

    animationRef.current = requestAnimationFrame(updateBearing)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Reset north
  const handleResetNorth = useCallback(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (map) {
      map.rotateTo({ bearing: 0 }, { duration: 500 })
    }
  }, [])

  if (!compassRose.visible) return null

  return (
    <>
      {/* Compass Rose Overlay */}
      <div
        className={`absolute z-10 ${POSITION_STYLES[compassRose.position]} cursor-pointer`}
        style={{ opacity: compassRose.opacity }}
        onClick={handleResetNorth}
        title={`Bearing: ${Math.round(((bearing % 360) + 360) % 360)}° — Click to reset north`}
      >
        <div className="relative group">
          <CompassRoseSVG state={compassRose} bearing={bearing} />

          {/* Bearing display */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground tabular-nums whitespace-nowrap">
            {Math.round(((bearing % 360) + 360) % 360)}°
          </div>

          {/* Settings button (appears on hover) */}
          <button
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              setSettingsOpen(true)
            }}
            aria-label="Compass settings"
          >
            <Settings2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-teal-500" />
              Compass Rose Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Preview */}
            <div className="flex justify-center py-4 rounded-xl border bg-card">
              <CompassRoseSVG state={compassRose} bearing={0} />
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <Select
                value={compassRose.style}
                onValueChange={(v) => setCompassRose({ style: v as CompassRoseState['style'] })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic 8-Point</SelectItem>
                  <SelectItem value="modern">Modern Minimalist</SelectItem>
                  <SelectItem value="nautical">Nautical</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom points (only for custom style) */}
            {compassRose.style === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Points</label>
                <Select
                  value={String(compassRose.points)}
                  onValueChange={(v) => setCompassRose({ points: parseInt(v) })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 Points</SelectItem>
                    <SelectItem value="8">8 Points</SelectItem>
                    <SelectItem value="16">16 Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Size</label>
              <Select
                value={compassRose.size}
                onValueChange={(v) => setCompassRose({ size: v as CompassRoseState['size'] })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Select
                value={compassRose.position}
                onValueChange={(v) => setCompassRose({ position: v as CompassRoseState['position'] })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-8 w-8 rounded border cursor-pointer"
                    value={compassRose.primaryColor}
                    onChange={(e) => setCompassRose({ primaryColor: e.target.value })}
                  />
                  <span className="text-xs text-muted-foreground">{compassRose.primaryColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-8 w-8 rounded border cursor-pointer"
                    value={compassRose.secondaryColor}
                    onChange={(e) => setCompassRose({ secondaryColor: e.target.value })}
                  />
                  <span className="text-xs text-muted-foreground">{compassRose.secondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Opacity: {Math.round(compassRose.opacity * 100)}%</label>
              <Slider
                value={[compassRose.opacity]}
                onValueChange={([v]) => setCompassRose({ opacity: v })}
                min={0.1}
                max={1}
                step={0.05}
              />
            </div>

            {/* Show Degrees */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Degree Markings</label>
              <Button
                variant={compassRose.showDegrees ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCompassRose({ showDegrees: !compassRose.showDegrees })}
              >
                {compassRose.showDegrees ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Show Labels */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Labels</label>
              <Button
                variant={compassRose.showLabels ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCompassRose({ showLabels: !compassRose.showLabels })}
              >
                {compassRose.showLabels ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Reset */}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
              onClick={() => {
                setCompassRose({
                  style: 'classic',
                  points: 8,
                  primaryColor: '#14b8a6',
                  secondaryColor: '#64748b',
                  size: 'medium',
                  opacity: 0.9,
                  showDegrees: true,
                  showLabels: true,
                  position: 'top-right',
                })
              }}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset to Defaults
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
