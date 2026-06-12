'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  Share2,
  ChevronUp,
  ChevronDown,
  Copy,
} from 'lucide-react'
import { useMapStore, type MapStory, type StoryStop, MAP_STYLES } from '@/lib/map-store'
import { toast } from 'sonner'

function generateId(): string {
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function generateStoryId(): string {
  return `story-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function MapStoryCreator() {
  const storyCreatorOpen = useMapStore((s) => s.storyCreatorOpen)
  const setStoryCreatorOpen = useMapStore((s) => s.setStoryCreatorOpen)
  const mapStories = useMapStore((s) => s.mapStories)
  const addMapStory = useMapStore((s) => s.addMapStory)
  const updateMapStory = useMapStore((s) => s.updateMapStory)
  const removeMapStory = useMapStore((s) => s.removeMapStory)
  const activeStoryId = useMapStore((s) => s.activeStoryId)
  const setActiveStoryId = useMapStore((s) => s.setActiveStoryId)
  const storyPlayback = useMapStore((s) => s.storyPlayback)
  const setStoryPlayback = useMapStore((s) => s.setStoryPlayback)
  const savedLocations = useMapStore((s) => s.savedLocations)

  const [editingStopId, setEditingStopId] = useState<string | null>(null)
  const [newStoryName, setNewStoryName] = useState('')
  const playbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeStory = mapStories.find((s) => s.id === activeStoryId) ?? null
  const currentStops = activeStory?.stops ?? []
  const currentStopIndex = storyPlayback.currentStopIndex

  // Create new story
  const handleCreateStory = useCallback(() => {
    const name = newStoryName.trim() || `Story ${mapStories.length + 1}`
    const story: MapStory = {
      id: generateStoryId(),
      name,
      stops: [],
      createdAt: new Date().toISOString(),
    }
    addMapStory(story)
    setActiveStoryId(story.id)
    setNewStoryName('')
    toast.success(`Story "${name}" created`)
  }, [newStoryName, mapStories.length, addMapStory, setActiveStoryId])

  // Add stop to active story
  const handleAddStop = useCallback(() => {
    if (!activeStory) return

    // Use current map center if available
    let longitude = 0
    let latitude = 0
    let zoom = 10
    if (typeof window !== 'undefined') {
      const map = (window as any).__mainMap
      if (map) {
        const center = map.getCenter()
        longitude = center.lng
        latitude = center.lat
        zoom = map.getZoom()
      }
    }

    const stop: StoryStop = {
      id: generateId(),
      title: `Stop ${(activeStory.stops?.length ?? 0) + 1}`,
      description: '',
      longitude,
      latitude,
      zoom: Math.round(zoom),
      duration: 5,
      transition: 'flyTo',
    }
    updateMapStory(activeStory.id, {
      stops: [...(activeStory.stops ?? []), stop],
    })
    setEditingStopId(stop.id)
  }, [activeStory, updateMapStory])

  // Update stop
  const handleUpdateStop = useCallback(
    (stopId: string, updates: Partial<StoryStop>) => {
      if (!activeStory) return
      updateMapStory(activeStory.id, {
        stops: (activeStory.stops ?? []).map((s) =>
          s.id === stopId ? { ...s, ...updates } : s
        ),
      })
    },
    [activeStory, updateMapStory]
  )

  // Remove stop
  const handleRemoveStop = useCallback(
    (stopId: string) => {
      if (!activeStory) return
      updateMapStory(activeStory.id, {
        stops: (activeStory.stops ?? []).filter((s) => s.id !== stopId),
      })
    },
    [activeStory, updateMapStory]
  )

  // Duplicate stop
  const handleDuplicateStop = useCallback(
    (stop: StoryStop) => {
      if (!activeStory) return
      const dup: StoryStop = {
        ...stop,
        id: generateId(),
        title: `${stop.title} (copy)`,
      }
      const stops = activeStory.stops ?? []
      const idx = stops.findIndex((s) => s.id === stop.id)
      const newStops = [...stops]
      newStops.splice(idx + 1, 0, dup)
      updateMapStory(activeStory.id, { stops: newStops })
    },
    [activeStory, updateMapStory]
  )

  // Move stop up/down
  const handleMoveStop = useCallback(
    (stopId: string, direction: 'up' | 'down') => {
      if (!activeStory) return
      const stops = [...(activeStory.stops ?? [])]
      const idx = stops.findIndex((s) => s.id === stopId)
      if (idx < 0) return
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= stops.length) return
      const temp = stops[idx]
      stops[idx] = stops[newIdx]
      stops[newIdx] = temp
      updateMapStory(activeStory.id, { stops })
    },
    [activeStory, updateMapStory]
  )

  // Preview a single stop
  const handlePreviewStop = useCallback((stop: StoryStop) => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return

    // Apply style if specified
    if (stop.style) {
      const found = MAP_STYLES.find((s) => s.id === stop.style)
      if (found) {
        useMapStore.getState().setCurrentStyle(found)
      }
    }

    map.flyTo({
      center: [stop.longitude, stop.latitude],
      zoom: stop.zoom,
      duration: 2000,
    })
  }, [])

  // Playback controls
  const handlePlay = useCallback(() => {
    if (!activeStory || currentStops.length === 0) return
    setStoryPlayback({ isPlaying: true, currentStopIndex: 0 })
  }, [activeStory, currentStops.length, setStoryPlayback])

  const handlePause = useCallback(() => {
    setStoryPlayback({ isPlaying: false })
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current)
      playbackTimerRef.current = null
    }
  }, [setStoryPlayback])

  const handleResume = useCallback(() => {
    setStoryPlayback({ isPlaying: true })
  }, [setStoryPlayback])

  const handleNext = useCallback(() => {
    if (!activeStory) return
    const nextIndex = currentStopIndex + 1
    if (nextIndex < currentStops.length) {
      setStoryPlayback({ currentStopIndex: nextIndex })
    } else {
      setStoryPlayback({ isPlaying: false, currentStopIndex: 0 })
    }
  }, [activeStory, currentStopIndex, currentStops.length, setStoryPlayback])

  const handlePrev = useCallback(() => {
    if (currentStopIndex > 0) {
      setStoryPlayback({ currentStopIndex: currentStopIndex - 1 })
    }
  }, [currentStopIndex, setStoryPlayback])

  // Playback timer effect
  useEffect(() => {
    if (!storyPlayback.isPlaying || !activeStory) return
    const stops = activeStory.stops ?? []
    if (currentStopIndex >= stops.length) {
      setStoryPlayback({ isPlaying: false, currentStopIndex: 0 })
      return
    }

    const stop = stops[currentStopIndex]

    // Navigate to stop
    if (typeof window !== 'undefined') {
      const map = (window as any).__mainMap
      if (map) {
        // Apply style if specified
        if (stop.style) {
          const found = MAP_STYLES.find((s) => s.id === stop.style)
          if (found) {
            useMapStore.getState().setCurrentStyle(found)
          }
        }

        const options: Record<string, any> = {
          center: [stop.longitude, stop.latitude],
          zoom: stop.zoom,
        }

        if (stop.transition === 'flyTo') {
          options.duration = 2000
          map.flyTo(options)
        } else if (stop.transition === 'easeTo') {
          options.duration = 2000
          map.easeTo(options)
        } else {
          map.jumpTo(options)
        }
      }
    }

    // Auto-advance after duration
    playbackTimerRef.current = setTimeout(() => {
      const nextIndex = currentStopIndex + 1
      if (nextIndex < stops.length) {
        setStoryPlayback({ currentStopIndex: nextIndex })
      } else {
        setStoryPlayback({ isPlaying: false, currentStopIndex: 0 })
        toast.success('Story playback complete')
      }
    }, stop.duration * 1000)

    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current)
        playbackTimerRef.current = null
      }
    }
  }, [storyPlayback.isPlaying, currentStopIndex, activeStory, setStoryPlayback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current)
      }
    }
  }, [])

  // Export story as JSON
  const handleExport = useCallback(() => {
    if (!activeStory) {
      toast.error('No active story to export')
      return
    }
    const blob = new Blob([JSON.stringify(activeStory, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeStory.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Story exported as JSON')
  }, [activeStory])

  // Import story from JSON
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as MapStory
          if (!data.name || !Array.isArray(data.stops)) {
            toast.error('Invalid story format')
            return
          }
          const story: MapStory = {
            ...data,
            id: generateStoryId(),
            createdAt: new Date().toISOString(),
          }
          addMapStory(story)
          setActiveStoryId(story.id)
          toast.success(`Story "${story.name}" imported`)
        } catch {
          toast.error('Failed to parse story JSON')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [addMapStory, setActiveStoryId])

  // Share story as URL
  const handleShare = useCallback(() => {
    if (!activeStory) {
      toast.error('No active story to share')
      return
    }
    try {
      const encoded = btoa(JSON.stringify(activeStory))
      const url = `${window.location.origin}${window.location.pathname}?story=${encodeURIComponent(encoded)}`
      navigator.clipboard.writeText(url)
      toast.success('Story link copied to clipboard')
    } catch {
      toast.error('Failed to generate share link')
    }
  }, [activeStory])

  // Add stop from saved location
  const handleAddFromLocation = useCallback(
    (locationId: string) => {
      if (!activeStory) return
      const loc = savedLocations.find((l) => l.id === locationId)
      if (!loc) return

      const stop: StoryStop = {
        id: generateId(),
        title: loc.name,
        description: loc.description || '',
        longitude: loc.longitude,
        latitude: loc.latitude,
        zoom: 12,
        duration: 5,
        transition: 'flyTo',
      }
      updateMapStory(activeStory.id, {
        stops: [...(activeStory.stops ?? []), stop],
      })
      toast.success(`Added "${loc.name}" as stop`)
    },
    [activeStory, savedLocations, updateMapStory]
  )

  // Get current stop for playback display
  const currentPlaybackStop = currentStops[currentStopIndex] ?? null

  return (
    <Dialog open={storyCreatorOpen} onOpenChange={setStoryCreatorOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            Map Story Creator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Story Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Story</label>
            <div className="flex gap-2">
              <Select
                value={activeStoryId ?? ''}
                onValueChange={(val) => setActiveStoryId(val)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select or create a story..." />
                </SelectTrigger>
                <SelectContent>
                  {mapStories.map((story) => (
                    <SelectItem key={story.id} value={story.id}>
                      {story.name} ({story.stops?.length ?? 0} stops)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeStory && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    removeMapStory(activeStory.id)
                    setEditingStopId(null)
                  }}
                  title="Delete story"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Create New Story */}
          <div className="flex gap-2">
            <Input
              placeholder="New story name..."
              value={newStoryName}
              onChange={(e) => setNewStoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateStory()
              }}
            />
            <Button onClick={handleCreateStory} className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>

          {/* Active Story Content */}
          {activeStory && (
            <>
              {/* Story Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Story Name</label>
                <Input
                  value={activeStory.name}
                  onChange={(e) =>
                    updateMapStory(activeStory.id, { name: e.target.value })
                  }
                  placeholder="Story name..."
                />
              </div>

              {/* Playback Controls */}
              {currentStops.length > 0 && (
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Playback</span>
                    <Badge variant="outline" className="text-xs">
                      {currentStopIndex + 1} / {currentStops.length}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{
                        width: `${((currentStopIndex + 1) / currentStops.length) * 100}%`,
                      }}
                    />
                  </div>

                  {currentPlaybackStop && (
                    <div className="text-xs text-muted-foreground">
                      Now viewing: <strong>{currentPlaybackStop.title}</strong>
                    </div>
                  )}

                  <div className="flex items-center gap-1 justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handlePrev}
                      disabled={currentStopIndex === 0}
                    >
                      <SkipBack className="h-3.5 w-3.5" />
                    </Button>
                    {storyPlayback.isPlaying ? (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handlePause}
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={
                          storyPlayback.currentStopIndex > 0
                            ? handleResume
                            : handlePlay
                        }
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleNext}
                      disabled={currentStopIndex >= currentStops.length - 1}
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Add Stop */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Stops ({currentStops.length})
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={handleAddStop}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Stop
                  </Button>
                </div>

                {/* Add from saved locations */}
                {savedLocations.length > 0 && (
                  <Select onValueChange={handleAddFromLocation}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Add from saved locations..." />
                    </SelectTrigger>
                    <SelectContent>
                      {savedLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name} ({loc.latitude.toFixed(3)},{' '}
                          {loc.longitude.toFixed(3)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Stop List */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {currentStops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        editingStopId === stop.id
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : 'hover:bg-accent/50'
                      } ${
                        storyPlayback.isPlaying && currentStopIndex === idx
                          ? 'ring-2 ring-emerald-500/50'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-medium">
                            {stop.title}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {stop.transition}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {stop.duration}s
                          </Badge>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleMoveStop(stop.id, 'up')
                            }
                            disabled={idx === 0}
                            title="Move up"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleMoveStop(stop.id, 'down')
                            }
                            disabled={idx === currentStops.length - 1}
                            title="Move down"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handlePreviewStop(stop)}
                            title="Preview stop"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              setEditingStopId(
                                editingStopId === stop.id ? null : stop.id
                              )
                            }
                            title="Edit stop"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDuplicateStop(stop)}
                            title="Duplicate stop"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleRemoveStop(stop.id)}
                            title="Delete stop"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Edit form */}
                      {editingStopId === stop.id && (
                        <div className="mt-2 space-y-2 border-t pt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                Title
                              </label>
                              <Input
                                value={stop.title}
                                onChange={(e) =>
                                  handleUpdateStop(stop.id, {
                                    title: e.target.value,
                                  })
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                Duration (seconds)
                              </label>
                              <Input
                                type="number"
                                min={1}
                                max={120}
                                value={stop.duration}
                                onChange={(e) =>
                                  handleUpdateStop(stop.id, {
                                    duration: parseInt(e.target.value) || 5,
                                  })
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">
                              Description
                            </label>
                            <Textarea
                              value={stop.description}
                              onChange={(e) =>
                                handleUpdateStop(stop.id, {
                                  description: e.target.value,
                                })
                              }
                              className="min-h-[60px] text-xs"
                              placeholder="Describe this stop..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                Latitude
                              </label>
                              <Input
                                type="number"
                                step="0.0001"
                                value={stop.latitude}
                                onChange={(e) =>
                                  handleUpdateStop(stop.id, {
                                    latitude: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                Longitude
                              </label>
                              <Input
                                type="number"
                                step="0.0001"
                                value={stop.longitude}
                                onChange={(e) =>
                                  handleUpdateStop(stop.id, {
                                    longitude: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                Zoom
                              </label>
                              <Input
                                type="number"
                                min={0}
                                max={22}
                                value={stop.zoom}
                                onChange={(e) =>
                                  handleUpdateStop(stop.id, {
                                    zoom: parseInt(e.target.value) || 10,
                                  })
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                Transition
                              </label>
                              <Select
                                value={stop.transition}
                                onValueChange={(val: 'flyTo' | 'jumpTo' | 'easeTo') =>
                                  handleUpdateStop(stop.id, { transition: val })
                                }
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="flyTo">Fly To</SelectItem>
                                  <SelectItem value="jumpTo">Jump To</SelectItem>
                                  <SelectItem value="easeTo">Ease To</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                Map Style
                              </label>
                              <Select
                                value={stop.style ?? 'default'}
                                onValueChange={(val) =>
                                  handleUpdateStop(stop.id, {
                                    style: val === 'default' ? undefined : val,
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="default">No Change</SelectItem>
                                  {MAP_STYLES.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Click the map to update coordinates for this stop.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {currentStops.length === 0 && (
                    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                      No stops yet. Click &quot;Add Stop&quot; to get started, or add
                      from saved locations.
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={currentStops.length === 0}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" onClick={handleImport}>
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  Import JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  disabled={currentStops.length === 0}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1" />
                  Share Link
                </Button>
              </div>
            </>
          )}

          {/* No story selected */}
          {!activeStory && mapStories.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No stories yet. Create your first map story to build guided
                tours with waypoints.
              </p>
            </div>
          )}

          {!activeStory && mapStories.length > 0 && (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Select a story or create a new one to get started.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
