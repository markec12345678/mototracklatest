'use client'

import { useState, useEffect } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  MapPin,
  Navigation,
  Trash2,
  Pencil,
  Clock,
  Tag,
  Share2,
  Bookmark,
  ExternalLink,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  Check,
  X,
  Compass,
} from 'lucide-react'
import { type SavedLocation, useMapStore } from '@/lib/map-store'
import { LocationPhotoGallery } from '@/components/map/LocationPhotoGallery'
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

// WMO Weather interpretation codes
const weatherDescriptions: Record<number, { text: string; icon: string }> = {
  0: { text: 'Clear sky', icon: '☀️' },
  1: { text: 'Mainly clear', icon: '🌤️' },
  2: { text: 'Partly cloudy', icon: '⛅' },
  3: { text: 'Overcast', icon: '☁️' },
  45: { text: 'Fog', icon: '🌫️' },
  48: { text: 'Rime fog', icon: '🌫️' },
  51: { text: 'Light drizzle', icon: '🌦️' },
  53: { text: 'Moderate drizzle', icon: '🌦️' },
  55: { text: 'Dense drizzle', icon: '🌦️' },
  56: { text: 'Freezing drizzle', icon: '🌧️' },
  57: { text: 'Dense freezing drizzle', icon: '🌧️' },
  61: { text: 'Slight rain', icon: '🌧️' },
  63: { text: 'Moderate rain', icon: '🌧️' },
  65: { text: 'Heavy rain', icon: '🌧️' },
  66: { text: 'Freezing rain', icon: '🧊' },
  67: { text: 'Heavy freezing rain', icon: '🧊' },
  71: { text: 'Slight snow', icon: '🌨️' },
  73: { text: 'Moderate snow', icon: '🌨️' },
  75: { text: 'Heavy snow', icon: '❄️' },
  77: { text: 'Snow grains', icon: '❄️' },
  80: { text: 'Slight showers', icon: '🌦️' },
  81: { text: 'Moderate showers', icon: '🌧️' },
  82: { text: 'Violent showers', icon: '⛈️' },
  85: { text: 'Slight snow showers', icon: '🌨️' },
  86: { text: 'Heavy snow showers', icon: '❄️' },
  95: { text: 'Thunderstorm', icon: '⛈️' },
  96: { text: 'Thunderstorm with hail', icon: '⛈️' },
  99: { text: 'Thunderstorm with heavy hail', icon: '⛈️' },
}

function getWeatherInfo(code: number) {
  return weatherDescriptions[code] || { text: 'Unknown', icon: '🌡️' }
}

/** Convert decimal degrees to DMS string */
function toDMS(decimal: number, isLat: boolean): string {
  const absolute = Math.abs(decimal)
  const degrees = Math.floor(absolute)
  const minDecimal = (absolute - degrees) * 60
  const minutes = Math.floor(minDecimal)
  const seconds = ((minDecimal - minutes) * 60).toFixed(2)
  const direction = isLat
    ? decimal >= 0 ? 'N' : 'S'
    : decimal >= 0 ? 'E' : 'W'
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`
}

interface WeatherData {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
  }
}

type WeatherState =
  | { status: 'loading' }
  | { status: 'success'; data: WeatherData }
  | { status: 'error' }

function WeatherCard({ lat, lng }: { lat: number; lng: number }) {
  const [state, setState] = useState<WeatherState>({ status: 'loading' })

  useEffect(() => {
    let stale = false

    // Start fetch — loading state is set via the initial render or key change
    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then((res) => {
        if (!res.ok) throw new Error('Weather fetch failed')
        return res.json()
      })
      .then((data) => {
        if (stale) return
        if (data?.current) {
          setState({ status: 'success', data })
        } else {
          setState({ status: 'error' })
        }
      })
      .catch(() => {
        if (stale) return
        setState({ status: 'error' })
      })

    return () => { stale = true }
  }, [lat, lng])

  if (state.status === 'error') return null

  if (state.status === 'loading') {
    return (
      <div className="p-3 rounded-xl bg-muted/50 border">
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Weather</span>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
    )
  }

  const weather = state.data
  const current = weather.current
  const weatherInfo = getWeatherInfo(current.weather_code)

  return (
    <div className="p-3 rounded-xl bg-muted/50 border">
      <div className="flex items-center gap-2 mb-3">
        <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Current Weather</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{weatherInfo.icon}</span>
        <div>
          <p className="text-lg font-semibold">
            {current.temperature_2m}°C
          </p>
          <p className="text-xs text-muted-foreground">{weatherInfo.text}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-background border text-center">
          <Wind className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
          <p className="text-[10px] text-muted-foreground">Wind</p>
          <p className="text-xs font-semibold">{current.wind_speed_10m} km/h</p>
        </div>
        <div className="p-2 rounded-lg bg-background border text-center">
          <Droplets className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
          <p className="text-[10px] text-muted-foreground">Humidity</p>
          <p className="text-xs font-semibold">{current.relative_humidity_2m}%</p>
        </div>
        <div className="p-2 rounded-lg bg-background border text-center">
          <Thermometer className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
          <p className="text-[10px] text-muted-foreground">Feels like</p>
          <p className="text-xs font-semibold">{current.apparent_temperature}°C</p>
        </div>
      </div>
    </div>
  )
}

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
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  if (!location) return null

  const cat = categories.find((c) => c.id === location.category)
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=15/${location.latitude}/${location.longitude}`

  const handleEdit = () => {
    setEditName(location.name)
    setEditDescription(location.description || '')
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmedName = editName.trim()
    if (!trimmedName) {
      toast.error('Location name cannot be empty')
      return
    }
    // Update the saved location in the store
    const locations = useMapStore.getState().savedLocations
    const updated = locations.map((loc) =>
      loc.id === location.id
        ? { ...loc, name: trimmedName, description: editDescription.trim() || undefined, updatedAt: new Date().toISOString() }
        : loc
    )
    useMapStore.getState().setSavedLocations(updated)

    // Also update the marker if it exists
    const markers = useMapStore.getState().markers
    const updatedMarkers = markers.map((m) =>
      m.id === location.id
        ? { ...m, name: trimmedName, description: editDescription.trim() || undefined }
        : m
    )
    useMapStore.getState().setMarkers(updatedMarkers)

    setIsEditing(false)
    toast.success('Location updated')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditName('')
    setEditDescription('')
  }

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
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 text-sm font-semibold"
                  autoFocus
                />
              ) : (
                <p className="truncate">{location.name}</p>
              )}
              {cat && !isEditing && (
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
            {!isEditing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Location details for {location.name}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Description */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description..."
                className="text-sm min-h-20 resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} className="h-7 text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            location.description && (
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {location.description}
                </p>
              </div>
            )
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

          {/* Weather */}
          <WeatherCard key={location.id} lat={location.latitude} lng={location.longitude} />

          {/* Nearby Places - DMS Format */}
          <div className="p-3 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                DMS Coordinates
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-2 rounded-lg bg-background border">
                <p className="text-[10px] text-muted-foreground">Latitude</p>
                <p className="text-sm font-mono font-semibold">
                  {toDMS(location.latitude, true)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-background border">
                <p className="text-[10px] text-muted-foreground">Longitude</p>
                <p className="text-sm font-mono font-semibold">
                  {toDMS(location.longitude, false)}
                </p>
              </div>
            </div>
          </div>

          {/* Photos */}
          <LocationPhotoGallery locationId={location.id} photos={location.photos || []} />

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
