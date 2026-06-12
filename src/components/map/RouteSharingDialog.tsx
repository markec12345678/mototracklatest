'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Share2,
  Copy,
  Link2,
  Mail,
  QrCode,
  Check,
  Download,
  MapPin,
  Route,
} from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { toast } from 'sonner'

interface RouteSharingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RouteSharingDialog({ open, onOpenChange }: RouteSharingDialogProps) {
  const routes = useMapStore((s) => s.routes)
  const center = useMapStore((s) => s.center)
  const zoom = useMapStore((s) => s.zoom)
  const currentStyle = useMapStore((s) => s.currentStyle)

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [includeElevation, setIncludeElevation] = useState(false)
  const [includeWaypoints, setIncludeWaypoints] = useState(true)
  const [includeWeather, setIncludeWeather] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [shareNote, setShareNote] = useState('')

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId),
    [routes, selectedRouteId]
  )

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams({
      lat: center[1].toFixed(5),
      lng: center[0].toFixed(5),
      zoom: zoom.toFixed(2),
      style: currentStyle.id,
    })
    if (selectedRouteId) {
      params.set('route', selectedRouteId)
    }
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/?${params.toString()}`
  }, [center, zoom, currentStyle, selectedRouteId])

  const geoJsonExport = useMemo(() => {
    if (!selectedRoute) return ''
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: selectedRoute.points.map((p) => [p.longitude, p.latitude]),
      },
      properties: {
        name: selectedRoute.name,
        color: selectedRoute.color,
        distance: selectedRoute.distance,
        duration: selectedRoute.duration,
        note: shareNote || undefined,
      },
    }
    return JSON.stringify(
      {
        type: 'FeatureCollection',
        features: [feature],
      },
      null,
      2
    )
  }, [selectedRoute, shareNote])

  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast.success(`${label} copied to clipboard!`)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }, [])

  const handleDownloadGeoJson = useCallback(() => {
    if (!geoJsonExport) return
    const blob = new Blob([geoJsonExport], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `route-${selectedRoute?.name || 'export'}.geojson`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('GeoJSON downloaded')
  }, [geoJsonExport, selectedRoute])

  const handleEmailShare = useCallback(() => {
    const subject = encodeURIComponent(`Map Route: ${selectedRoute?.name || 'My Route'}`)
    const body = encodeURIComponent(
      `Check out my route on MapLibre Explorer!\n\n` +
        `${selectedRoute ? `Route: ${selectedRoute.name}\n` : ''}` +
        `${selectedRoute?.distance ? `Distance: ${(selectedRoute.distance / 1000).toFixed(1)} km\n` : ''}` +
        `${selectedRoute?.duration ? `Duration: ${Math.round(selectedRoute.duration / 60)} min\n` : ''}` +
        `${shareNote ? `\nNote: ${shareNote}\n` : ''}` +
        `\nView on map: ${shareUrl}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
    toast.success('Email client opened')
  }, [selectedRoute, shareNote, shareUrl])

  const formatDistance = (meters: number | null) => {
    if (!meters) return 'N/A'
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`
    return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-600" />
            Share Route
          </DialogTitle>
          <DialogDescription>
            Share your route with others via link, email, or download.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Route selector */}
          {routes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Select Route</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    className={`w-full flex items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
                      selectedRouteId === route.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-accent/30'
                    }`}
                    onClick={() => setSelectedRouteId(route.id)}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: route.color }} />
                    <span className="text-sm font-medium flex-1 truncate">{route.name}</span>
                    <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                      {formatDistance(route.distance)}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Route details */}
          {selectedRoute && (
            <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">{selectedRoute.name}</span>
                <div className="w-3 h-3 rounded-full shrink-0 ml-1" style={{ backgroundColor: selectedRoute.color }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-medium">{formatDistance(selectedRoute.distance)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{formatDuration(selectedRoute.duration)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Waypoints:</span>
                  <span className="font-medium">{selectedRoute.points.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Share options */}
          <div className="space-y-2">
            <Label className="text-sm">Share Options</Label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-accent/30 transition-colors">
                <Checkbox checked={includeWaypoints} onCheckedChange={(c) => setIncludeWaypoints(!!c)} />
                <span className="text-xs">Include waypoint details</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-accent/30 transition-colors">
                <Checkbox checked={includeElevation} onCheckedChange={(c) => setIncludeElevation(!!c)} />
                <span className="text-xs">Include elevation data</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-accent/30 transition-colors">
                <Checkbox checked={includeWeather} onCheckedChange={(c) => setIncludeWeather(!!c)} />
                <span className="text-xs">Include current weather</span>
              </label>
            </div>
          </div>

          {/* Share note */}
          <div className="space-y-1.5">
            <Label className="text-sm">Note (optional)</Label>
            <Textarea
              placeholder="Add a note about this route..."
              value={shareNote}
              onChange={(e) => setShareNote(e.target.value)}
              className="text-xs min-h-[60px] resize-none"
            />
          </div>

          {/* Share link */}
          <div className="space-y-2">
            <Label className="text-sm">Share Link</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border bg-muted/30 px-3 py-2 overflow-hidden">
                <code className="text-xs font-mono truncate block">{shareUrl}</code>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => handleCopy(shareUrl, 'Share link')}
              >
                {copied === 'Share link' ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleEmailShare}
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDownloadGeoJson}
              disabled={!selectedRoute}
            >
              <Download className="h-4 w-4" />
              GeoJSON
            </Button>
          </div>

          {/* QR code placeholder */}
          <div className="rounded-xl border border-dashed p-4 text-center">
            <QrCode className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Scan QR code to open route on mobile
            </p>
            <div className="mt-2 mx-auto w-24 h-24 bg-muted/50 rounded-lg flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground">QR Code</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
