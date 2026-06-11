'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, Trash2, Download, Clock, Route, Gauge, Mountain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMapStore, type TrackRecording } from '@/lib/map-store'
import { toast } from 'sonner'

// Haversine distance
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`
}

// Generate GPX XML from track
function generateGPX(track: TrackRecording): string {
  const trkpts = track.points.map((p) => {
    const ele = p.elevation !== null ? `<ele>${p.elevation.toFixed(1)}</ele>` : ''
    const time = `<time>${new Date(p.timestamp).toISOString()}</time>`
    return `      <trkpt lat="${p.latitude}" lon="${p.longitude}">${ele}${time}</trkpt>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MotoTrack MapLibre Explorer"
  xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${track.name}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`
}

export function TrackPlayer({ track }: { track: TrackRecording }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playIndex, setPlayIndex] = useState(0)
  const deleteTrack = useMapStore((s) => s.deleteTrack)
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markerId = 'track-player-marker'

  // Draw track on map
  useEffect(() => {
    if (typeof window === 'undefined') return
    const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
    if (!map || track.points.length < 2) return

    const sourceId = `track-source-${track.id}`
    const lineLayerId = `track-line-${track.id}`
    const borderLayerId = `track-border-${track.id}`

    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: track.points.map((p) => [p.longitude, p.latitude]),
      },
    }

    const addLayers = () => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: 'geojson', data: geojson })
      }
      if (!map.getLayer(borderLayerId)) {
        map.addLayer({
          id: borderLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 6, 'line-opacity': 0.6 },
        })
      }
      if (!map.getLayer(lineLayerId)) {
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': track.color || '#ef4444', 'line-width': 3 },
        })
      }
    }

    if (map.isStyleLoaded()) {
      addLayers()
    } else {
      map.once('load', addLayers)
    }

    return () => {
      try {
        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
        if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch { /* ignore */ }
    }
  }, [track])

  // Animate marker along track
  useEffect(() => {
    if (!isPlaying || track.points.length < 2) return

    const animate = () => {
      if (playIndex >= track.points.length - 1) {
        setIsPlaying(false)
        return
      }

      const point = track.points[playIndex]
      const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
      if (map) {
        const sourceId = `track-player-marker-source`

        const geojson: GeoJSON.Feature<GeoJSON.Point> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude],
          },
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, { type: 'geojson', data: geojson })
          map.addLayer({
            id: markerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': 7,
              'circle-color': '#ef4444',
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            },
          })
        } else {
          (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson)
        }
      }

      setPlayIndex((prev) => prev + 1)
    }

    animationRef.current = setTimeout(animate, 100)

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current)
    }
  }, [isPlaying, playIndex, track.points])

  // Clean up marker on stop/unmount
  useEffect(() => {
    return () => {
      if (typeof window === 'undefined') return
      const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
      if (!map) return
      try {
        if (map.getLayer(markerId)) map.removeLayer(markerId)
        if (map.getSource('track-player-marker-source')) map.removeSource('track-player-marker-source')
      } catch { /* ignore */ }
    }
  }, [])

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      setPlayIndex(0)
      // Clean up marker
      const map = (window as unknown as Record<string, unknown>).__mainMap as maplibregl.Map | undefined
      if (map) {
        try {
          if (map.getLayer(markerId)) map.removeLayer(markerId)
          if (map.getSource('track-player-marker-source')) map.removeSource('track-player-marker-source')
        } catch { /* ignore */ }
      }
    } else {
      setPlayIndex(0)
      setIsPlaying(true)
      // Fly to track start
      if (track.points.length > 0) {
        const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
        if (flyTo) flyTo(track.points[0].longitude, track.points[0].latitude, 15)
      }
    }
  }, [isPlaying, track.points])

  const handleExportGPX = useCallback(() => {
    const gpx = generateGPX(track)
    const blob = new Blob([gpx], { type: 'application/gpx+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${track.name.replace(/[^a-zA-Z0-9]/g, '_')}.gpx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('GPX exported')
  }, [track])

  const handleDelete = useCallback(() => {
    deleteTrack(track.id)
    toast.success(`Track "${track.name}" deleted`)
  }, [deleteTrack, track.id, track.name])

  const handleShowOnMap = useCallback(() => {
    if (track.points.length === 0) return
    // Fly to track center
    const centerIdx = Math.floor(track.points.length / 2)
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) flyTo(track.points[centerIdx].longitude, track.points[centerIdx].latitude, 14)
  }, [track.points])

  const duration = track.duration || (track.points.length >= 2
    ? (track.points[track.points.length - 1].timestamp - track.points[0].timestamp) / 1000
    : 0)

  return (
    <div className="group rounded-xl border border-border/50 p-3 hover:bg-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={handleShowOnMap}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block text-left"
          >
            {track.name}
          </button>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(track.startedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlePlay}
            aria-label={isPlaying ? 'Stop playback' : 'Play track animation'}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleExportGPX}
            aria-label="Export GPX"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-red-500"
            onClick={handleDelete}
            aria-label="Delete track"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Route className="h-3 w-3" />
          {formatDistance(track.distance)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(duration)}
        </span>
        {track.points.some((p) => p.elevation !== null) && (
          <span className="flex items-center gap-1">
            <Mountain className="h-3 w-3" />
            Elev.
          </span>
        )}
      </div>
    </div>
  )
}

// Saved Tracks list for sidebar
export function SavedTracksList() {
  const savedTracks = useMapStore((s) => s.savedTracks)

  if (savedTracks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Route className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-xs">No saved tracks</p>
        <p className="text-[10px] mt-1">Record a GPS track to see it here</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {savedTracks.map((track) => (
        <TrackPlayer key={track.id} track={track} />
      ))}
    </div>
  )
}
