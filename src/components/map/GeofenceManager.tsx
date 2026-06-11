'use client'

import { useState, useCallback } from 'react'
import { Shield, Plus, Trash2, Power, PowerOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useMapStore, type Geofence } from '@/lib/map-store'
import { toast } from 'sonner'

interface GeofenceManagerProps {
  onCreateGeofence?: () => void
}

export function GeofenceManager({ onCreateGeofence }: GeofenceManagerProps) {
  const geofences = useMapStore((s) => s.geofences)
  const removeGeofence = useMapStore((s) => s.removeGeofence)
  const toggleGeofence = useMapStore((s) => s.toggleGeofence)

  const handleDelete = useCallback((id: string, name: string) => {
    removeGeofence(id)
    toast.success(`Geofence "${name}" removed`)
  }, [removeGeofence])

  const handleFlyTo = useCallback((geofence: Geofence) => {
    if (typeof window === 'undefined') return
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) {
      const zoomLevel = geofence.radius > 5000 ? 11 : geofence.radius > 1000 ? 13 : 15
      flyTo(geofence.longitude, geofence.latitude, zoomLevel)
    }
  }, [])

  if (geofences.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-xs">No geofences created</p>
        <p className="text-[10px] mt-1">Right-click the map or use the button below</p>
        {onCreateGeofence && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 h-8 text-xs gap-1.5 rounded-xl"
            onClick={onCreateGeofence}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Geofence
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {geofences.map((geofence) => (
        <GeofenceItem
          key={geofence.id}
          geofence={geofence}
          onToggle={() => toggleGeofence(geofence.id)}
          onDelete={() => handleDelete(geofence.id, geofence.name)}
          onFlyTo={() => handleFlyTo(geofence)}
        />
      ))}
      {onCreateGeofence && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs gap-1.5 rounded-xl mt-1"
          onClick={onCreateGeofence}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Geofence
        </Button>
      )}
    </div>
  )
}

function GeofenceItem({ geofence, onToggle, onDelete, onFlyTo }: {
  geofence: Geofence
  onToggle: () => void
  onDelete: () => void
  onFlyTo: () => void
}) {
  const formatRadius = (meters: number) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`
  }

  return (
    <div className={`group rounded-xl border border-border/50 p-3 transition-colors ${geofence.isActive ? 'bg-background' : 'bg-muted/30 opacity-60'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={onFlyTo}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block text-left flex items-center gap-1.5"
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: geofence.color }}
            />
            {geofence.name}
          </button>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            <span>{formatRadius(geofence.radius)}</span>
            {geofence.notifyOnEnter && (
              <span className="flex items-center gap-0.5 text-emerald-500">
                <ArrowRight className="h-2.5 w-2.5" />
                Enter
              </span>
            )}
            {geofence.notifyOnExit && (
              <span className="flex items-center gap-0.5 text-amber-500">
                <ArrowLeft className="h-2.5 w-2.5" />
                Exit
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Switch
            checked={geofence.isActive}
            onCheckedChange={onToggle}
            className="scale-75"
            aria-label={`Toggle geofence ${geofence.name}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-red-500"
            onClick={onDelete}
            aria-label={`Delete geofence ${geofence.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
