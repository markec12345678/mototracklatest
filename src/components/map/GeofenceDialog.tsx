'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useMapStore, type Geofence } from '@/lib/map-store'
import { toast } from 'sonner'

const GEOFENCE_COLORS = [
  { id: 'red', color: '#ef4444', label: 'Red' },
  { id: 'orange', color: '#f97316', label: 'Orange' },
  { id: 'amber', color: '#f59e0b', label: 'Amber' },
  { id: 'emerald', color: '#10b981', label: 'Emerald' },
  { id: 'cyan', color: '#06b6d4', label: 'Cyan' },
  { id: 'violet', color: '#8b5cf6', label: 'Violet' },
  { id: 'pink', color: '#ec4899', label: 'Pink' },
  { id: 'slate', color: '#64748b', label: 'Slate' },
]

interface GeofenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  latitude?: number
  longitude?: number
}

export function GeofenceDialog({ open, onOpenChange, latitude, longitude }: GeofenceDialogProps) {
  const addGeofence = useMapStore((s) => s.addGeofence)
  const [name, setName] = useState('')
  const [radius, setRadius] = useState(500)
  const [color, setColor] = useState('#ef4444')
  const [notifyOnEnter, setNotifyOnEnter] = useState(true)
  const [notifyOnExit, setNotifyOnExit] = useState(true)

  // Reset form when dialog opens - use key-based pattern to avoid setState in effect
  const [dialogKey, setDialogKey] = useState(0)
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (newOpen) {
      setName('')
      setRadius(500)
      setColor('#ef4444')
      setNotifyOnEnter(true)
      setNotifyOnExit(true)
      setDialogKey((k) => k + 1)
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

  // Preview circle on map
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!open || latitude === undefined || longitude === undefined) return

    const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
    if (!map) return

    const sourceId = 'geofence-preview-source'
    const fillLayerId = 'geofence-preview-fill'
    const strokeLayerId = 'geofence-preview-stroke'

    const circlePolygon = createCircleGeoJSON(longitude, latitude, radius)

    const addPreview = () => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: 'geojson', data: circlePolygon })
      } else {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(circlePolygon)
      }
      if (!map.getLayer(fillLayerId)) {
        map.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': color,
            'fill-opacity': 0.1,
          },
        })
      } else {
        map.setPaintProperty(fillLayerId, 'fill-color', color)
      }
      if (!map.getLayer(strokeLayerId)) {
        map.addLayer({
          id: strokeLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': color,
            'line-width': 2,
            'line-opacity': 0.6,
          },
        })
      } else {
        map.setPaintProperty(strokeLayerId, 'line-color', color)
      }
    }

    if (map.isStyleLoaded()) {
      addPreview()
    } else {
      map.once('load', addPreview)
    }

    return () => {
      try {
        if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId)
        if (map.getLayer(strokeLayerId)) map.removeLayer(strokeLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch { /* ignore */ }
    }
  }, [open, latitude, longitude, radius, color])

  const handleCreate = useCallback(() => {
    if (!name.trim()) {
      toast.error('Please enter a name for the geofence')
      return
    }
    if (latitude === undefined || longitude === undefined) {
      toast.error('No location specified')
      return
    }

    const geofence: Geofence = {
      id: `geofence-${Date.now()}`,
      name: name.trim(),
      latitude,
      longitude,
      radius,
      color,
      notifyOnEnter,
      notifyOnExit,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    addGeofence(geofence)
    toast.success(`Geofence "${name.trim()}" created`)
    onOpenChange(false)
  }, [name, latitude, longitude, radius, color, notifyOnEnter, notifyOnExit, addGeofence, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Geofence</DialogTitle>
          <DialogDescription>
            Define a circular area to receive notifications when entering or leaving.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="geofence-name" className="text-xs">Name</Label>
            <Input
              id="geofence-name"
              placeholder="e.g., Home, Office, Park"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Radius: {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`}</Label>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer mt-2 accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>100m</span>
              <span>10km</span>
            </div>
          </div>

          <div>
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2 mt-1.5">
              {GEOFENCE_COLORS.map((c) => (
                <button
                  key={c.id}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    color === c.color ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.color }}
                  onClick={() => setColor(c.color)}
                  aria-label={`Color: ${c.label}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="notify-enter"
                checked={notifyOnEnter}
                onCheckedChange={(checked) => setNotifyOnEnter(checked === true)}
              />
              <Label htmlFor="notify-enter" className="text-xs">Notify on enter</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="notify-exit"
                checked={notifyOnExit}
                onCheckedChange={(checked) => setNotifyOnExit(checked === true)}
              />
              <Label htmlFor="notify-exit" className="text-xs">Notify on exit</Label>
            </div>
          </div>

          {latitude !== undefined && longitude !== undefined && (
            <div className="text-[10px] text-muted-foreground">
              Center: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0" onClick={handleCreate}>
            Create Geofence
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper: create a circle GeoJSON polygon
export function createCircleGeoJSON(centerLng: number, centerLat: number, radiusMeters: number): GeoJSON.Feature<GeoJSON.Polygon> {
  const points = 64
  const coords: [number, number][] = []
  const distanceX = radiusMeters / (111320 * Math.cos((centerLat * Math.PI) / 180))
  const distanceY = radiusMeters / 110550

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI
    const x = centerLng + distanceX * Math.cos(angle)
    const y = centerLat + distanceY * Math.sin(angle)
    coords.push([x, y])
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  }
}
