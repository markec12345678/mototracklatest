'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe2,
  Navigation,
  Clock,
  AlertCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMapStore } from '@/lib/map-store'
import { toast } from 'sonner'

interface RecentCoord {
  lat: number
  lng: number
  zoom?: number
  label: string
  timestamp: number
}

const STORAGE_KEY = 'maplibre-recent-coords'
const MAX_RECENT = 5

function loadRecentCoords(): RecentCoord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return []
}

function saveRecentCoord(coord: RecentCoord) {
  const recent = loadRecentCoords()
  // Remove duplicate (same coords within 4 decimal places)
  const filtered = recent.filter(
    (c) =>
      Math.abs(c.lat - coord.lat) > 0.0001 ||
      Math.abs(c.lng - coord.lng) > 0.0001
  )
  const updated = [coord, ...filtered].slice(0, MAX_RECENT)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Parse DMS (Degrees Minutes Seconds) format:
 * 46°03'24.8"N 14°30'20.9"E
 * Also handles:
 * 46°03'24"N 14°30'20"E
 * 46 03 24.8 N 14 30 20.9 E
 */
function parseDMS(input: string): { lat: number; lng: number } | null {
  // Normalize the input: replace various degree/minute/second symbols
  const normalized = input
    .replace(/[°˚º]/g, ' ')
    .replace(/[′'ʹ]/g, ' ')
    .replace(/[″"ʺ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Pattern: lat_value lat_direction lng_value lng_direction
  const dmsPattern = /^(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*([NSns])\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*([EWew])$/
  const match = normalized.match(dmsPattern)

  if (match) {
    const latDeg = parseFloat(match[1])
    const latMin = parseFloat(match[2])
    const latSec = parseFloat(match[3])
    const latDir = match[4].toUpperCase()
    const lngDeg = parseFloat(match[5])
    const lngMin = parseFloat(match[6])
    const lngSec = parseFloat(match[7])
    const lngDir = match[8].toUpperCase()

    let lat = latDeg + latMin / 60 + latSec / 3600
    let lng = lngDeg + lngMin / 60 + lngSec / 3600

    if (latDir === 'S') lat = -lat
    if (lngDir === 'W') lng = -lng

    return { lat, lng }
  }

  return null
}

/**
 * Parse a single coordinate string like "46.0569, 14.5058" or "46.0569 14.5058"
 */
function parseDecimalDegrees(input: string): { lat: number; lng: number } | null {
  const parts = input.split(/[,\s]+/).filter(Boolean)
  if (parts.length === 2) {
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng }
    }
  }
  return null
}

interface ValidationResult {
  valid: boolean
  error?: string
  lat?: number
  lng?: number
}

function validateCoordinates(latStr: string, lngStr: string): ValidationResult {
  if (!latStr.trim() && !lngStr.trim()) {
    return { valid: false, error: 'Enter coordinates' }
  }

  if (!latStr.trim() || !lngStr.trim()) {
    return { valid: false, error: 'Both latitude and longitude are required' }
  }

  const lat = parseFloat(latStr)
  const lng = parseFloat(lngStr)

  if (isNaN(lat)) {
    return { valid: false, error: 'Invalid latitude value' }
  }
  if (isNaN(lng)) {
    return { valid: false, error: 'Invalid longitude value' }
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' }
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' }
  }

  return { valid: true, lat, lng }
}

interface CoordinateInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoordinateInputDialog({ open, onOpenChange }: CoordinateInputDialogProps) {
  const [latInput, setLatInput] = useState('')
  const [lngInput, setLngInput] = useState('')
  const [zoomInput, setZoomInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [recentCoords, setRecentCoords] = useState<RecentCoord[]>([])
  const [inputMode, setInputMode] = useState<'separate' | 'combined'>('separate')
  const [combinedInput, setCombinedInput] = useState('')

  const zoom = useMapStore((s) => s.zoom)

  // Load recent coords and defaults when dialog opens
  useEffect(() => {
    if (!open) return
    // Use a microtask to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setRecentCoords(loadRecentCoords())
      setZoomInput(String(Math.round(zoom)))
      setValidationError(null)
    }, 0)
    return () => clearTimeout(timer)
  }, [open, zoom])

  // Reset form helper - defined before other callbacks that use it
  const resetForm = useCallback(() => {
    setLatInput('')
    setLngInput('')
    setCombinedInput('')
    setZoomInput('')
    setValidationError(null)
    setInputMode('separate')
  }, [])

  const handleGo = useCallback(() => {
    let lat: number | undefined
    let lng: number | undefined

    if (inputMode === 'combined') {
      // Try DMS first
      const dms = parseDMS(combinedInput)
      if (dms) {
        lat = dms.lat
        lng = dms.lng
      } else {
        // Try decimal degrees
        const dd = parseDecimalDegrees(combinedInput)
        if (dd) {
          lat = dd.lat
          lng = dd.lng
        }
      }

      if (lat === undefined || lng === undefined) {
        setValidationError('Could not parse coordinates. Try decimal degrees (46.0569, 14.5058) or DMS format')
        return
      }
    } else {
      const result = validateCoordinates(latInput, lngInput)
      if (!result.valid) {
        setValidationError(result.error || 'Invalid coordinates')
        return
      }
      lat = result.lat
      lng = result.lng
    }

    const parsedZoom = zoomInput ? parseFloat(zoomInput) : undefined
    if (parsedZoom !== undefined && (isNaN(parsedZoom) || parsedZoom < 0 || parsedZoom > 22)) {
      setValidationError('Zoom must be between 0 and 22')
      return
    }

    // Fly to the coordinates
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) {
      flyTo(lng, lat, parsedZoom || 14)
    }

    // Save to recent
    saveRecentCoord({
      lat,
      lng,
      zoom: parsedZoom,
      label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      timestamp: Date.now(),
    })
    setRecentCoords(loadRecentCoords())

    useMapStore.getState().setCenter([lng, lat])
    if (parsedZoom) useMapStore.getState().setZoom(parsedZoom)

    toast.success(`Flying to ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    setValidationError(null)
    onOpenChange(false)
    resetForm()
  }, [inputMode, combinedInput, latInput, lngInput, zoomInput, onOpenChange, resetForm])

  const handleRecentClick = useCallback((coord: RecentCoord) => {
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) {
      flyTo(coord.lng, coord.lat, coord.zoom || 14)
    }
    useMapStore.getState().setCenter([coord.lng, coord.lat])
    if (coord.zoom) useMapStore.getState().setZoom(coord.zoom)

    toast.success(`Flying to ${coord.label}`)
    onOpenChange(false)
    resetForm()
  }, [onOpenChange, resetForm])

  const handleClose = useCallback((isOpen: boolean) => {
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }, [onOpenChange, resetForm])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="dialog-gradient-header -mx-6 -mt-6 px-6 pt-6 pb-4 mb-2 rounded-t-2xl">
          <DialogTitle className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Globe2 className="h-4 w-4 text-white" />
            </div>
            Go to Coordinates
          </DialogTitle>
          <DialogDescription>
            Enter coordinates to navigate to a specific location on the map.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Input mode toggle */}
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            <button
              className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${
                inputMode === 'separate'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setInputMode('separate'); setValidationError(null) }}
            >
              Lat / Lng
            </button>
            <button
              className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${
                inputMode === 'combined'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setInputMode('combined'); setValidationError(null) }}
            >
              Combined / DMS
            </button>
          </div>

          <AnimatePresence mode="wait">
            {inputMode === 'separate' ? (
              <motion.div
                key="separate"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="coord-lat" className="text-xs font-medium">
                      Latitude
                    </Label>
                    <Input
                      id="coord-lat"
                      type="number"
                      step="any"
                      value={latInput}
                      onChange={(e) => { setLatInput(e.target.value); setValidationError(null) }}
                      placeholder="46.0569"
                      className="rounded-xl font-mono text-sm"
                      min={-90}
                      max={90}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coord-lng" className="text-xs font-medium">
                      Longitude
                    </Label>
                    <Input
                      id="coord-lng"
                      type="number"
                      step="any"
                      value={lngInput}
                      onChange={(e) => { setLngInput(e.target.value); setValidationError(null) }}
                      placeholder="14.5058"
                      className="rounded-xl font-mono text-sm"
                      min={-180}
                      max={180}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="combined"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                <Label htmlFor="coord-combined" className="text-xs font-medium">
                  Coordinates
                </Label>
                <Input
                  id="coord-combined"
                  value={combinedInput}
                  onChange={(e) => { setCombinedInput(e.target.value); setValidationError(null) }}
                  placeholder="46.0569, 14.5058"
                  className="rounded-xl font-mono text-sm"
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground">
                  Supports decimal degrees (46.0569, 14.5058) or DMS (46&deg;03&apos;24.8&quot;N 14&deg;30&apos;20.9&quot;E)
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zoom level */}
          <div className="space-y-2">
            <Label htmlFor="coord-zoom" className="text-xs font-medium">
              Zoom Level <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="coord-zoom"
              type="number"
              step="1"
              min="0"
              max="22"
              value={zoomInput}
              onChange={(e) => { setZoomInput(e.target.value); setValidationError(null) }}
              placeholder="14"
              className="rounded-xl font-mono text-sm w-24"
            />
          </div>

          {/* Validation error */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {validationError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent coordinates */}
          {recentCoords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <Label className="text-xs font-medium text-muted-foreground">Recent</Label>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {recentCoords.map((coord, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentClick(coord)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-accent/60 transition-colors group text-left"
                  >
                    <Navigation className="h-3 w-3 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-foreground truncate">
                      {coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}
                    </span>
                    {coord.zoom && (
                      <span className="text-muted-foreground ml-auto shrink-0">
                        z{coord.zoom}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGo}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 gap-1.5"
          >
            <Navigation className="h-3.5 w-3.5" />
            Go
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
