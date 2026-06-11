'use client'

import { useState } from 'react'
import {
  Plus,
  MapPin,
  Navigation,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Compass,
  Locate,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore } from '@/lib/map-store'
import { toast } from 'sonner'

const categories = [
  { id: 'general', label: 'General', color: '#6b7280' },
  { id: 'favorite', label: 'Favorite', color: '#f59e0b' },
  { id: 'restaurant', label: 'Restaurant', color: '#ef4444' },
  { id: 'hotel', label: 'Hotel', color: '#8b5cf6' },
  { id: 'park', label: 'Park', color: '#22c55e' },
  { id: 'shop', label: 'Shop', color: '#3b82f6' },
  { id: 'landmark', label: 'Landmark', color: '#f97316' },
  { id: 'transport', label: 'Transport', color: '#06b6d4' },
]

const colorOptions = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
]

export function AddLocationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { center, addSavedLocation } = useMapStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [color, setColor] = useState('#ef4444')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUseMapCenter = () => {
    setLat(center[1].toFixed(6))
    setLng(center[0].toFixed(6))
  }

  const handleSubmit = async () => {
    if (!name || !lat || !lng) {
      toast.error('Please fill in name, latitude, and longitude')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          category,
          color,
        }),
      })

      if (res.ok) {
        const location = await res.json()
        addSavedLocation(location)
        useMapStore.getState().addMarker({
          id: location.id,
          longitude: location.longitude,
          latitude: location.latitude,
          name: location.name,
          description: location.description || undefined,
          color: location.color,
          category: location.category,
        })
        toast.success(`Added "${name}"`)
        onOpenChange(false)
        resetForm()
      }
    } catch (err) {
      console.error('Failed to add location:', err)
      toast.error('Failed to add location')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setCategory('general')
    setColor('#ef4444')
    setLat('')
    setLng('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Add New Location
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter location name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="46.0569"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="14.5058"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleUseMapCenter}
          >
            <Crosshair className="h-3.5 w-3.5 mr-1.5" />
            Use current map center ({center[1].toFixed(4)}, {center[0].toFixed(4)})
          </Button>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Marker Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#000' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              resetForm()
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
