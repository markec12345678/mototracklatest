'use client'

import { useState, useCallback } from 'react'
import {
  ImagePlus,
  X,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Maximize2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useMapStore } from '@/lib/map-store'
import { toast } from 'sonner'

interface LocationPhotoGalleryProps {
  locationId: string
  photos: string[]
}

export function LocationPhotoGallery({ locationId, photos: initialPhotos }: LocationPhotoGalleryProps) {
  const updateLocationPhotos = useMapStore((s) => s.updateLocationPhotos)
  const [photoUrl, setPhotoUrl] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const photos = initialPhotos || []

  const handleAddPhoto = useCallback(() => {
    const url = photoUrl.trim()
    if (!url) {
      toast.error('Please enter a photo URL')
      return
    }
    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }
    if (photos.includes(url)) {
      toast.error('This photo URL already exists')
      return
    }
    const updated = [...photos, url]
    updateLocationPhotos(locationId, updated)
    setPhotoUrl('')
    setIsAdding(false)
    toast.success('Photo added')
  }, [photoUrl, photos, locationId, updateLocationPhotos])

  const handleRemovePhoto = useCallback((index: number) => {
    const updated = photos.filter((_, i) => i !== index)
    updateLocationPhotos(locationId, updated)
    toast.success('Photo removed')
  }, [photos, locationId, updateLocationPhotos])

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return
    const updated = [...photos]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    updateLocationPhotos(locationId, updated)
  }, [photos, locationId, updateLocationPhotos])

  const handleMoveDown = useCallback((index: number) => {
    if (index === photos.length - 1) return
    const updated = [...photos]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    updateLocationPhotos(locationId, updated)
  }, [photos, locationId, updateLocationPhotos])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPhoto()
    }
  }, [handleAddPhoto])

  return (
    <div className="p-3 rounded-xl bg-muted/50 border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Photos</span>
          {photos.length > 0 && (
            <Badge
              className="h-4 text-[10px] px-1.5 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
            >
              {photos.length}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          onClick={() => setIsAdding(true)}
        >
          <ImagePlus className="h-3 w-3" />
          Add Photo
        </Button>
      </div>

      {/* Add Photo Input */}
      {isAdding && (
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="Enter photo URL..."
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-xs flex-1"
            autoFocus
          />
          <Button
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleAddPhoto}
          >
            Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setIsAdding(false)
              setPhotoUrl('')
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square rounded-lg overflow-hidden border bg-muted/30"
            >
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `
                      <div class="flex items-center justify-center w-full h-full text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                    `
                  }
                }}
              />
              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200">
                {/* View button */}
                <button
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => setLightboxIndex(index)}
                  aria-label="View photo full size"
                >
                  <Maximize2 className="h-5 w-5 text-white drop-shadow-md" />
                </button>
                {/* Delete button */}
                <button
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemovePhoto(index)
                  }}
                  aria-label="Remove photo"
                >
                  <X className="h-3 w-3" />
                </button>
                {/* Reorder buttons */}
                <div className="absolute bottom-1 left-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    className={`h-5 w-5 rounded bg-black/60 text-white flex items-center justify-center hover:bg-black/80 ${index === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveUp(index)
                    }}
                    aria-label="Move photo up"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    className={`h-5 w-5 rounded bg-black/60 text-white flex items-center justify-center hover:bg-black/80 ${index === photos.length - 1 ? 'opacity-30 pointer-events-none' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveDown(index)
                    }}
                    aria-label="Move photo down"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground max-w-48">
            No photos yet. Add a photo URL to get started.
          </p>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null)
        }}
      >
        <DialogContent className="sm:max-w-3xl p-2 bg-black/95 border-white/10">
          <DialogHeader className="sr-only">
            <DialogTitle>Photo Viewer</DialogTitle>
            <DialogDescription>
              Viewing photo {lightboxIndex !== null ? lightboxIndex + 1 : 0} of {photos.length}
            </DialogDescription>
          </DialogHeader>
          {lightboxIndex !== null && photos[lightboxIndex] && (
            <div className="relative">
              <img
                src={photos[lightboxIndex]}
                alt={`Photo ${lightboxIndex + 1}`}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  {lightboxIndex > 0 && (
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      onClick={() => setLightboxIndex(lightboxIndex - 1)}
                      aria-label="Previous photo"
                    >
                      <ChevronUp className="h-5 w-5 -rotate-90" />
                    </button>
                  )}
                  {lightboxIndex < photos.length - 1 && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      onClick={() => setLightboxIndex(lightboxIndex + 1)}
                      aria-label="Next photo"
                    >
                      <ChevronUp className="h-5 w-5 rotate-90" />
                    </button>
                  )}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs">
                    {lightboxIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
