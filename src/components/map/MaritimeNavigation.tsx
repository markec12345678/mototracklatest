'use client'

import { useState, useCallback } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Anchor,
  Plus,
  Trash2,
  Navigation,
  Ship,
  Compass,
  Waves,
  AlertTriangle,
  Lighthouse,
  MapPin,
  Clock,
  Gauge,
  Ruler,
  Route,
  Settings,
} from 'lucide-react'
import { useMapStore, type MaritimeWaypoint, type MaritimeRoute } from '@/lib/map-store'
import { toast } from 'sonner'

const WAYPOINT_TYPES: { value: MaritimeWaypoint['type']; label: string; color: string; icon: typeof Anchor }[] = [
  { value: 'port', label: 'Port', color: 'bg-green-500', icon: Anchor },
  { value: 'anchorage', label: 'Anchorage', color: 'bg-blue-500', icon: Anchor },
  { value: 'lighthouse', label: 'Lighthouse', color: 'bg-yellow-500', icon: Lighthouse },
  { value: 'buoy', label: 'Buoy', color: 'bg-orange-500', icon: MapPin },
  { value: 'danger', label: 'Danger', color: 'bg-red-500', icon: AlertTriangle },
  { value: 'waypoint', label: 'Waypoint', color: 'bg-cyan-500', icon: Navigation },
]

const DEPTH_UNITS: MaritimeNavState['depthUnit'][] = ['meters', 'feet', 'fathoms']

function createWaypoint(type: MaritimeWaypoint['type'], lat: number, lng: number): MaritimeWaypoint {
  return {
    id: `wp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${Date.now() % 1000}`,
    latitude: lat,
    longitude: lng,
    type,
    depth: null,
    notes: '',
  }
}

function haversineNm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) / 1852
}

function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

function convertDepth(meters: number | null, unit: MaritimeNavState['depthUnit']): string {
  if (meters === null) return '—'
  switch (unit) {
    case 'feet': return `${(meters * 3.28084).toFixed(1)} ft`
    case 'fathoms': return `${(meters * 0.546807).toFixed(1)} fm`
    default: return `${meters.toFixed(1)} m`
  }
}

export function MaritimeNavigation() {
  const maritimeNav = useMapStore((s) => s.maritimeNav)
  const setMaritimeNav = useMapStore((s) => s.setMaritimeNav)
  const center = useMapStore((s) => s.center)

  const [activeTab, setActiveTab] = useState('waypoints')
  const [newWpType, setNewWpType] = useState<MaritimeWaypoint['type']>('waypoint')
  const [speed, setSpeed] = useState(10)
  const [editingWaypoint, setEditingWaypoint] = useState<string | null>(null)

  const open = maritimeNav.open

  const handleClose = useCallback((value: boolean) => {
    if (!value) setMaritimeNav({ open: false })
  }, [setMaritimeNav])

  const handleAddWaypoint = useCallback(() => {
    const wp = createWaypoint(newWpType, center[1], center[0])
    setMaritimeNav({ waypoints: [...maritimeNav.waypoints, wp] })
    toast.success(`Added ${newWpType}: ${wp.name}`)
  }, [newWpType, center, maritimeNav.waypoints, setMaritimeNav])

  const handleRemoveWaypoint = useCallback((id: string) => {
    setMaritimeNav({ waypoints: maritimeNav.waypoints.filter((w) => w.id !== id) })
  }, [maritimeNav.waypoints, setMaritimeNav])

  const handleUpdateWaypoint = useCallback((id: string, updates: Partial<MaritimeWaypoint>) => {
    setMaritimeNav({
      waypoints: maritimeNav.waypoints.map((w) => w.id === id ? { ...w, ...updates } : w),
    })
  }, [maritimeNav.waypoints, setMaritimeNav])

  const handleCreateRoute = useCallback(() => {
    if (maritimeNav.waypoints.length < 2) {
      toast.error('Add at least 2 waypoints to create a route')
      return
    }
    let totalDist = 0
    for (let i = 1; i < maritimeNav.waypoints.length; i++) {
      totalDist += haversineNm(
        maritimeNav.waypoints[i - 1].latitude, maritimeNav.waypoints[i - 1].longitude,
        maritimeNav.waypoints[i].latitude, maritimeNav.waypoints[i].longitude,
      )
    }
    const route: MaritimeRoute = {
      id: `route-${Date.now()}`,
      name: `Route ${maritimeNav.routes.length + 1}`,
      waypoints: [...maritimeNav.waypoints],
      totalDistance: totalDist,
      estimatedTime: totalDist / speed,
    }
    setMaritimeNav({ routes: [...maritimeNav.routes, route], activeRouteId: route.id })
    toast.success(`Route created: ${totalDist.toFixed(1)} NM`)
  }, [maritimeNav.waypoints, maritimeNav.routes, speed, setMaritimeNav])

  const handleRemoveRoute = useCallback((id: string) => {
    setMaritimeNav({
      routes: maritimeNav.routes.filter((r) => r.id !== id),
      activeRouteId: maritimeNav.activeRouteId === id ? null : maritimeNav.activeRouteId,
    })
  }, [maritimeNav.routes, maritimeNav.activeRouteId, setMaritimeNav])

  const getWaypointColor = (type: MaritimeWaypoint['type']) => {
    return WAYPOINT_TYPES.find((w) => w.value === type)?.color || 'bg-gray-500'
  }

  const getWaypointIcon = (type: MaritimeWaypoint['type']) => {
    return WAYPOINT_TYPES.find((w) => w.value === type)?.icon || MapPin
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b bg-gradient-to-r from-blue-900/10 via-cyan-500/10 to-transparent">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Ship className="h-4.5 w-4.5 text-cyan-600" />
            Maritime Navigation
          </DialogTitle>
          <DialogDescription className="text-xs">
            Plan maritime routes with waypoints and navigation aids
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pt-2 border-b">
            <TabsList className="h-8">
              <TabsTrigger value="waypoints" className="text-xs gap-1.5">
                <Anchor className="h-3.5 w-3.5" /> Waypoints
              </TabsTrigger>
              <TabsTrigger value="routes" className="text-xs gap-1.5">
                <Route className="h-3.5 w-3.5" /> Routes
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs gap-1.5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="waypoints" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-3">
                {/* Add Waypoint */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px]">Type</Label>
                    <Select value={newWpType} onValueChange={(v) => setNewWpType(v as MaritimeWaypoint['type'])}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WAYPOINT_TYPES.map((wt) => (
                          <SelectItem key={wt.value} value={wt.value}>
                            <span className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${wt.color}`} />
                              {wt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-gradient-to-r from-blue-800 to-cyan-600 hover:from-blue-900 hover:to-cyan-700 text-white"
                    onClick={handleAddWaypoint}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>

                {/* Waypoint List */}
                {maritimeNav.waypoints.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border rounded-lg border-dashed">
                    <Anchor className="h-6 w-6 mx-auto mb-1.5 opacity-30" />
                    <p className="text-[10px]">No waypoints added</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {maritimeNav.waypoints.map((wp, idx) => {
                      const WpIcon = getWaypointIcon(wp.type)
                      const colorClass = getWaypointColor(wp.type)
                      const isEditing = editingWaypoint === wp.id
                      const bearing = idx > 0
                        ? calculateBearing(
                            maritimeNav.waypoints[idx - 1].latitude, maritimeNav.waypoints[idx - 1].longitude,
                            wp.latitude, wp.longitude,
                          )
                        : null
                      const dist = idx > 0
                        ? haversineNm(
                            maritimeNav.waypoints[idx - 1].latitude, maritimeNav.waypoints[idx - 1].longitude,
                            wp.latitude, wp.longitude,
                          )
                        : null

                      return (
                        <div key={wp.id} className="p-2.5 rounded-lg border text-xs space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${colorClass} shrink-0`} />
                            {isEditing ? (
                              <Input
                                value={wp.name}
                                onChange={(e) => handleUpdateWaypoint(wp.id, { name: e.target.value })}
                                className="h-6 text-[11px] flex-1"
                                onBlur={() => setEditingWaypoint(null)}
                                autoFocus
                              />
                            ) : (
                              <span
                                className="flex-1 font-medium cursor-pointer hover:text-cyan-600"
                                onClick={() => setEditingWaypoint(wp.id)}
                              >
                                {wp.name}
                              </span>
                            )}
                            <Badge variant="secondary" className="text-[9px] px-1.5 h-4 capitalize">
                              {wp.type}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveWaypoint(wp.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                            <span className="font-mono">{wp.latitude.toFixed(4)}, {wp.longitude.toFixed(4)}</span>
                            {wp.depth !== null && <span>Depth: {convertDepth(wp.depth, maritimeNav.depthUnit)}</span>}
                            {dist !== null && <span className="flex items-center gap-0.5"><Ruler className="h-2.5 w-2.5" />{dist.toFixed(1)} NM</span>}
                            {bearing !== null && <span className="flex items-center gap-0.5"><Compass className="h-2.5 w-2.5" />{bearing.toFixed(1)}°</span>}
                          </div>
                          {wp.notes && <p className="text-[10px] text-muted-foreground italic">{wp.notes}</p>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="routes" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px]">Speed (knots)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value) || 10)}
                      className="h-8 text-xs w-20"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-gradient-to-r from-blue-800 to-cyan-600 hover:from-blue-900 hover:to-cyan-700 text-white"
                    onClick={handleCreateRoute}
                    disabled={maritimeNav.waypoints.length < 2}
                  >
                    <Route className="h-3.5 w-3.5" /> Create Route
                  </Button>
                </div>

                {maritimeNav.routes.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border rounded-lg border-dashed">
                    <Route className="h-6 w-6 mx-auto mb-1.5 opacity-30" />
                    <p className="text-[10px]">No routes created</p>
                    <p className="text-[9px] mt-0.5">Add waypoints first, then create a route</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {maritimeNav.routes.map((route) => {
                      const isActive = maritimeNav.activeRouteId === route.id
                      return (
                        <div
                          key={route.id}
                          className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                            isActive ? 'border-cyan-400/50 bg-cyan-500/5' : 'hover:bg-accent/30'
                          }`}
                          onClick={() => setMaritimeNav({ activeRouteId: route.id })}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{route.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleRemoveRoute(route.id) }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Ruler className="h-2.5 w-2.5" />{route.totalDistance.toFixed(1)} NM</span>
                            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{route.estimatedTime.toFixed(1)} hrs</span>
                            <span className="flex items-center gap-0.5"><Anchor className="h-2.5 w-2.5" />{route.waypoints.length} waypoints</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Bearing Calculator */}
                {maritimeNav.waypoints.length >= 2 && (
                  <div className="p-3 rounded-lg border bg-card space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-cyan-600" /> Bearing Calculator
                    </Label>
                    <div className="space-y-1">
                      {maritimeNav.waypoints.slice(1).map((wp, idx) => {
                        const prev = maritimeNav.waypoints[idx]
                        const bearing = calculateBearing(prev.latitude, prev.longitude, wp.latitude, wp.longitude)
                        const dist = haversineNm(prev.latitude, prev.longitude, wp.latitude, wp.longitude)
                        return (
                          <div key={wp.id} className="flex items-center justify-between text-[10px] p-1 rounded">
                            <span className="text-muted-foreground">{prev.name} → {wp.name}</span>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-[9px] px-1.5 h-4">{bearing.toFixed(1)}°</Badge>
                              <Badge variant="outline" className="text-[9px] px-1.5 h-4">{dist.toFixed(1)} NM</Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-4">
                {/* Display Options */}
                <div className="space-y-3 p-3 rounded-lg border bg-card">
                  <Label className="text-xs font-semibold">Display Options</Label>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] flex items-center gap-1.5"><Waves className="h-3 w-3" /> Depth Contours</Label>
                    <Switch
                      checked={maritimeNav.showDepthContours}
                      onCheckedChange={(v) => setMaritimeNav({ showDepthContours: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] flex items-center gap-1.5"><Lighthouse className="h-3 w-3" /> Navigation Aids</Label>
                    <Switch
                      checked={maritimeNav.showNavigationAids}
                      onCheckedChange={(v) => setMaritimeNav({ showNavigationAids: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] flex items-center gap-1.5"><Ship className="h-3 w-3" /> Shipping Lanes</Label>
                    <Switch
                      checked={maritimeNav.showShippingLanes}
                      onCheckedChange={(v) => setMaritimeNav({ showShippingLanes: v })}
                    />
                  </div>
                </div>

                {/* Depth Unit */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Depth Unit</Label>
                  <Select
                    value={maritimeNav.depthUnit}
                    onValueChange={(v) => setMaritimeNav({ depthUnit: v as MaritimeNavState['depthUnit'] })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPTH_UNITS.map((u) => (
                        <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Waypoint Type Legend */}
                <div className="space-y-2 p-3 rounded-lg border bg-card">
                  <Label className="text-xs font-semibold">Waypoint Type Legend</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {WAYPOINT_TYPES.map((wt) => (
                      <div key={wt.value} className="flex items-center gap-1.5 text-[10px]">
                        <span className={`w-2.5 h-2.5 rounded-full ${wt.color}`} />
                        <span>{wt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
