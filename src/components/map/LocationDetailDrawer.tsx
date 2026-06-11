'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Navigation,
  Trash2,
  Edit3,
  Clock,
  Tag,
  Share2,
  Bookmark,
  ExternalLink,
} from 'lucide-react'
import { type SavedLocation, useMapStore } from '@/lib/map-store'
import { toast } from 'sonner'

const categories = [
  { id: 'general', label: 'General', color: '#6b7280', icon: '📌' },
  { id: 'favorite', label: 'Favorite', color: '#f59e0b', icon: '⭐' },
  { id: 'restaurant', label: 'Restaurant', color: '#ef4444', icon: '🍽️' },
  { id: 'hotel', label: 'Hotel', color: '#8b5cf6', icon: '🏨' },
  { id: 'park', label: 'Park', color: '#22c55e', icon: '🌳' },
  { id: 'shop', label: 'Shop', color: '#3b82f6', icon: '🛍️' },
  { id: 'landmark', label: 'Landmark', color: '#f97316', icon: '🏛️' },
  { id: 'transport', label: 'Transport', color: '#06b6d4', icon: '🚌' },
]

export function LocationDetailDrawer({
  location,
  open,
  onOpenChange,
  onDelete,
}: {
  location: SavedLocation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (id: string) => void
}) {
  if (!location) return null

  const cat = categories.find((c) => c.id === location.category)
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=15/${location.latitude}/${location.longitude}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: location.color + '15',
                color: location.color,
              }}
            >
              <span className="text-lg">{cat?.icon || '📌'}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate">{location.name}</p>
              {cat && (
                <Badge
                  className="mt-0.5 text-[10px] px-1.5 py-0 h-4"
                  style={{
                    backgroundColor: cat.color + '15',
                    color: cat.color,
                    border: 'none',
                  }}
                >
                  {cat.label}
                </Badge>
              )}
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Location details for {location.name}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Description */}
          {location.description && (
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {location.description}
              </p>
            </div>
          )}

          {/* Coordinates */}
          <div className="p-3 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Coordinates
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-background border">
                <p className="text-[10px] text-muted-foreground">Latitude</p>
                <p className="text-sm font-mono font-semibold">
                  {location.latitude.toFixed(6)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-background border">
                <p className="text-[10px] text-muted-foreground">Longitude</p>
                <p className="text-sm font-mono font-semibold">
                  {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Created{' '}
                {new Date(location.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl"
              onClick={() => {
                const flyTo = (window as unknown as Record<
                  string,
                  (lng: number, lat: number, z?: number) => void
                >).__mapFlyTo
                if (flyTo) flyTo(location.longitude, location.latitude, 15)
                onOpenChange(false)
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Fly to Location
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl"
              onClick={() => window.open(mapsUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in OpenStreetMap
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl"
              onClick={() => {
                const currentStyle = useMapStore.getState().currentStyle
                const shareUrl = `${window.location.origin}${window.location.pathname}?lat=${location.latitude.toFixed(5)}&lng=${location.longitude.toFixed(5)}&zoom=15&style=${currentStyle.id}`
                navigator.clipboard.writeText(shareUrl).then(() => {
                  toast.success('Location link copied!')
                }).catch(() => {
                  const textArea = document.createElement('textarea')
                  textArea.value = shareUrl
                  document.body.appendChild(textArea)
                  textArea.select()
                  document.execCommand('copy')
                  document.body.removeChild(textArea)
                  toast.success('Location link copied!')
                })
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Location
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                onDelete(location.id)
                onOpenChange(false)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Location
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
