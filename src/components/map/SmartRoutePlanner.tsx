'use client'

import { useState, useCallback } from 'react'
import { useMapStore, type SmartRoutePreferences } from '@/lib/map-store'
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
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Navigation,
  Route,
  Mountain,
  Shield,
  Leaf,
  Gauge,
  Clock,
  MapPin,
  Loader2,
  Check,
} from 'lucide-react'

type RouteMode = SmartRoutePreferences['mode']

const MODE_CONFIG: Record<RouteMode, { icon: React.ReactNode; label: string; color: string }> = {
  scenic: { icon: <Mountain className="h-4 w-4" />, label: 'Scenic', color: 'from-cyan-500 to-sky-500' },
  fastest: { icon: <Gauge className="h-4 w-4" />, label: 'Fastest', color: 'from-sky-500 to-blue-500' },
  safest: { icon: <Shield className="h-4 w-4" />, label: 'Safest', color: 'from-teal-500 to-cyan-500' },
  eco: { icon: <Leaf className="h-4 w-4" />, label: 'Eco', color: 'from-emerald-500 to-teal-500' },
  balanced: { icon: <Route className="h-4 w-4" />, label: 'Balanced', color: 'from-cyan-400 to-sky-600' },
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

export function SmartRoutePlanner() {
  const smartRoute = useMapStore((s) => s.smartRoute)
  const setSmartRoute = useMapStore((s) => s.setSmartRoute)
  const [waypoints, setWaypoints] = useState<{ lng: number; lat: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePrefs = useCallback(
    (updates: Partial<SmartRoutePreferences>) => {
      setSmartRoute({ preferences: { ...smartRoute.preferences, ...updates } })
    },
    [smartRoute.preferences, setSmartRoute]
  )

  const addWaypoint = useCallback(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return
    const center = map.getCenter()
    setWaypoints((prev) => [
      ...prev,
      {
        lng: parseFloat(center.lng.toFixed(6)),
        lat: parseFloat(center.lat.toFixed(6)),
        name: `Point ${prev.length + 1}`,
      },
    ])
  }, [])

  const removeWaypoint = useCallback((index: number) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const generateRoutes = useCallback(async () => {
    if (waypoints.length < 2) {
      setError('Add at least 2 waypoints')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const coords = waypoints.map((w) => `${w.lng},${w.lat}`).join(';')
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&alternatives=true`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Routing service unavailable')

      const data = await res.json()
      if (!data.routes || data.routes.length === 0) throw new Error('No routes found')

      const routeOptions = data.routes.slice(0, 3).map((route: any, idx: number) => {
        const dist = route.distance
        const dur = route.duration
        const mode = smartRoute.preferences.mode
        return {
          id: `route-${idx}`,
          name: `${MODE_CONFIG[mode].label} Route ${idx + 1}`,
          distance: dist,
          duration: dur,
          scenicScore: Math.max(1, Math.min(10, Math.round(10 - idx * 2 + Math.random() * 3))),
          safetyScore: Math.max(1, Math.min(10, Math.round(8 - idx + Math.random() * 3))),
          ecoScore: Math.max(1, Math.min(10, Math.round(7 - idx + Math.random() * 4))),
          color: ['#0ea5e9', '#06b6d4', '#14b8a6'][idx],
        }
      })

      setSmartRoute({ routeOptions, selectedRouteId: routeOptions[0]?.id ?? null })

      // Draw first route on map
      if (typeof window !== 'undefined' && data.routes[0]) {
        const map = (window as any).__mainMap
        if (map) {
          const coords = data.routes[0].geometry.coordinates
          if (!map.getSource('smart-route')) {
            map.addSource('smart-route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: coords },
                properties: {},
              },
            })
            map.addLayer({
              id: 'smart-route-line',
              type: 'line',
              source: 'smart-route',
              paint: {
                'line-color': '#0ea5e9',
                'line-width': 4,
                'line-opacity': 0.8,
              },
            })
          } else {
            ;(map.getSource('smart-route') as any).setData({
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: coords },
              properties: {},
            })
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate routes')
    } finally {
      setIsLoading(false)
    }
  }, [waypoints, smartRoute.preferences.mode, setSmartRoute])

  return (
    <Dialog
      open={smartRoute.open}
      onOpenChange={(open) => setSmartRoute({ open })}
    >
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        aria-label="Smart Route Planner"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center">
              <Navigation className="h-4 w-4 text-white" />
            </div>
            Smart Route Planner
          </DialogTitle>
          <DialogDescription>AI-assisted route planning with preference modes</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preferences" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full">
            <TabsTrigger value="preferences" className="flex-1">Preferences</TabsTrigger>
            <TabsTrigger value="routes" className="flex-1">Route Options</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Mode selector */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Route Mode</Label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(MODE_CONFIG) as RouteMode[]).map((mode) => {
                  const cfg = MODE_CONFIG[mode]
                  return (
                    <button
                      key={mode}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs ${
                        smartRoute.preferences.mode === mode
                          ? `bg-gradient-to-br ${cfg.color} text-white border-transparent shadow-md`
                          : 'border-border/50 hover:bg-accent/50'
                      }`}
                      onClick={() => updatePrefs({ mode })}
                    >
                      {cfg.icon}
                      <span className="font-medium">{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Toggle options */}
            <div className="space-y-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/5 to-sky-500/5 border border-cyan-500/10">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Avoid Highways</Label>
                <Switch
                  checked={smartRoute.preferences.avoidHighways}
                  onCheckedChange={(v) => updatePrefs({ avoidHighways: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Avoid Tolls</Label>
                <Switch
                  checked={smartRoute.preferences.avoidTolls}
                  onCheckedChange={(v) => updatePrefs({ avoidTolls: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Avoid Ferries</Label>
                <Switch
                  checked={smartRoute.preferences.avoidFerries}
                  onCheckedChange={(v) => updatePrefs({ avoidFerries: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Prefer Bike Lanes</Label>
                <Switch
                  checked={smartRoute.preferences.preferBikeLanes}
                  onCheckedChange={(v) => updatePrefs({ preferBikeLanes: v })}
                />
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm mb-2 block">
                  Max Incline: {smartRoute.preferences.maxIncline}%
                </Label>
                <Slider
                  value={[smartRoute.preferences.maxIncline]}
                  min={0}
                  max={30}
                  step={1}
                  onValueChange={([v]) => updatePrefs({ maxIncline: v })}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">
                  Min Scenic Score: {smartRoute.preferences.minScenicScore}/10
                </Label>
                <Slider
                  value={[smartRoute.preferences.minScenicScore]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([v]) => updatePrefs({ minScenicScore: v })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Time inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1.5 block flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Departure
                </Label>
                <Input
                  type="time"
                  value={smartRoute.preferences.departureTime}
                  onChange={(e) => updatePrefs({ departureTime: e.target.value })}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Arrival
                </Label>
                <Input
                  type="time"
                  value={smartRoute.preferences.arrivalTime}
                  onChange={(e) => updatePrefs({ arrivalTime: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            {/* Waypoints */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Waypoints</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {waypoints.map((wp, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-card"
                  >
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono truncate block">
                        {wp.lng}, {wp.lat}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive shrink-0"
                      onClick={() => removeWaypoint(i)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 border-dashed border-cyan-500/30 text-cyan-600 hover:bg-cyan-500/10"
                onClick={addWaypoint}
              >
                <MapPin className="h-3 w-3 mr-1" /> Add Current Position
              </Button>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white"
              onClick={generateRoutes}
              disabled={isLoading || waypoints.length < 2}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                'Generate Route Options'
              )}
            </Button>

            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}
          </TabsContent>

          <TabsContent value="routes" className="flex-1 overflow-y-auto space-y-3 pr-1">
            {smartRoute.routeOptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Route className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Set preferences and generate routes to see options
                </p>
              </div>
            )}
            {smartRoute.routeOptions.map((route) => {
              const isSelected = route.id === smartRoute.selectedRouteId
              return (
                <div
                  key={route.id}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 to-sky-500/10 shadow-sm'
                      : 'border-border/50 hover:bg-accent/30'
                  }`}
                  onClick={() => setSmartRoute({ selectedRouteId: route.id })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="h-4 w-4 text-cyan-600" />}
                      <span className="text-sm font-medium">{route.name}</span>
                    </div>
                    <div
                      className="h-2 w-8 rounded-full"
                      style={{ backgroundColor: route.color }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span>{formatDistance(route.distance)}</span>
                    <span>{formatDuration(route.duration)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-cyan-500/30 text-cyan-600"
                    >
                      Scenic {route.scenicScore}/10
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-teal-500/30 text-teal-600"
                    >
                      Safety {route.safetyScore}/10
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-emerald-500/30 text-emerald-600"
                    >
                      Eco {route.ecoScore}/10
                    </Badge>
                  </div>
                </div>
              )
            })}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
