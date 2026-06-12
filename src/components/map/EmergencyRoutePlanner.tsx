'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type EmergencyZone, type EvacuationPoint } from '@/lib/map-store'
import {
  Flame,
  Droplets,
  Mountain,
  Skull,
  CloudLightning,
  AlertTriangle,
  Shield,
  Building2,
  Users,
  Tent,
  Navigation,
  Trash2,
  Plus,
  Route,
  Eye,
  EyeOff,
} from 'lucide-react'

const ZONE_TYPE_CONFIG: Record<EmergencyZone['type'], { icon: React.ReactNode; color: string; label: string }> = {
  fire: { icon: <Flame className="size-4" />, color: 'text-orange-500', label: 'Fire' },
  flood: { icon: <Droplets className="size-4" />, color: 'text-blue-500', label: 'Flood' },
  earthquake: { icon: <Mountain className="size-4" />, color: 'text-amber-700', label: 'Earthquake' },
  chemical: { icon: <Skull className="size-4" />, color: 'text-purple-500', label: 'Chemical' },
  storm: { icon: <CloudLightning className="size-4" />, color: 'text-slate-500', label: 'Storm' },
  general: { icon: <AlertTriangle className="size-4" />, color: 'text-yellow-600', label: 'General' },
}

const SEVERITY_CONFIG: Record<EmergencyZone['severity'], { color: string; bg: string; label: string }> = {
  low: { color: 'text-green-700', bg: 'bg-green-100 border-green-300', label: 'Low' },
  medium: { color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300', label: 'Medium' },
  high: { color: 'text-orange-700', bg: 'bg-orange-100 border-orange-300', label: 'High' },
  critical: { color: 'text-red-700', bg: 'bg-red-100 border-red-300', label: 'Critical' },
}

const EVAC_TYPE_CONFIG: Record<EvacuationPoint['type'], { icon: React.ReactNode; color: string; label: string }> = {
  shelter: { icon: <Building2 className="size-4" />, color: 'text-blue-500', label: 'Shelter' },
  hospital: { icon: <Shield className="size-4" />, color: 'text-red-500', label: 'Hospital' },
  assembly: { icon: <Users className="size-4" />, color: 'text-green-500', label: 'Assembly' },
  staging: { icon: <Tent className="size-4" />, color: 'text-amber-500', label: 'Staging' },
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export function EmergencyRoutePlanner() {
  const { emergencyRoute, setEmergencyRoute, center } = useMapStore()
  const open = emergencyRoute.open

  const [zoneForm, setZoneForm] = useState({
    name: '', type: 'fire' as EmergencyZone['type'],
    latitude: 0, longitude: 0, radius: 500, severity: 'medium' as EmergencyZone['severity'],
  })
  const [evacForm, setEvacForm] = useState({
    name: '', type: 'shelter' as EvacuationPoint['type'],
    latitude: 0, longitude: 0, capacity: 100,
  })

  const setOpen = useCallback((v: boolean) => {
    setEmergencyRoute({ open: v })
  }, [setEmergencyRoute])

  const addZone = useCallback(() => {
    if (!zoneForm.name.trim()) return
    const zone: EmergencyZone = {
      id: generateId(),
      name: zoneForm.name,
      type: zoneForm.type,
      latitude: zoneForm.latitude || center[1],
      longitude: zoneForm.longitude || center[0],
      radius: zoneForm.radius,
      severity: zoneForm.severity,
      color: SEVERITY_CONFIG[zoneForm.severity].bg.includes('green') ? '#22c55e'
        : SEVERITY_CONFIG[zoneForm.severity].bg.includes('yellow') ? '#eab308'
        : SEVERITY_CONFIG[zoneForm.severity].bg.includes('orange') ? '#f97316' : '#ef4444',
    }
    setEmergencyRoute({ zones: [...emergencyRoute.zones, zone] })
    setZoneForm({ name: '', type: 'fire', latitude: 0, longitude: 0, radius: 500, severity: 'medium' })
  }, [zoneForm, center, emergencyRoute.zones, setEmergencyRoute])

  const deleteZone = useCallback((id: string) => {
    setEmergencyRoute({ zones: emergencyRoute.zones.filter(z => z.id !== id) })
  }, [emergencyRoute.zones, setEmergencyRoute])

  const addEvacPoint = useCallback(() => {
    if (!evacForm.name.trim()) return
    const point: EvacuationPoint = {
      id: generateId(),
      name: evacForm.name,
      type: evacForm.type,
      latitude: evacForm.latitude || center[1],
      longitude: evacForm.longitude || center[0],
      capacity: evacForm.capacity,
    }
    setEmergencyRoute({ evacuationPoints: [...emergencyRoute.evacuationPoints, point] })
    setEvacForm({ name: '', type: 'shelter', latitude: 0, longitude: 0, capacity: 100 })
  }, [evacForm, center, emergencyRoute.evacuationPoints, setEmergencyRoute])

  const deleteEvacPoint = useCallback((id: string) => {
    setEmergencyRoute({ evacuationPoints: emergencyRoute.evacuationPoints.filter(p => p.id !== id) })
  }, [emergencyRoute.evacuationPoints, setEmergencyRoute])

  const planRoute = useCallback(() => {
    if (emergencyRoute.evacuationPoints.length === 0) return
    const userLat = center[1]
    const userLng = center[0]
    let nearest: EvacuationPoint | null = null
    let minDist = Infinity
    for (const p of emergencyRoute.evacuationPoints) {
      const d = Math.sqrt((p.latitude - userLat) ** 2 + (p.longitude - userLng) ** 2)
      if (d < minDist) { minDist = d; nearest = p }
    }
    if (nearest) setEmergencyRoute({ activeRouteId: nearest.id })
  }, [center, emergencyRoute.evacuationPoints, setEmergencyRoute])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col" aria-label="Emergency Route Planner">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
              <AlertTriangle className="size-5 text-red-500 inline mr-1" />
              Emergency Route Planner
            </span>
          </DialogTitle>
          <DialogDescription>Plan evacuation routes with danger zones and safe points</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center gap-2">
            <Switch
              checked={emergencyRoute.showZones}
              onCheckedChange={(v) => setEmergencyRoute({ showZones: v })}
              aria-label="Toggle zones visibility"
            />
            <Label className="text-xs flex items-center gap-1">
              {emergencyRoute.showZones ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
              Zones
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={emergencyRoute.showEvacuationPoints}
              onCheckedChange={(v) => setEmergencyRoute({ showEvacuationPoints: v })}
              aria-label="Toggle evacuation points visibility"
            />
            <Label className="text-xs flex items-center gap-1">
              {emergencyRoute.showEvacuationPoints ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
              Evac Points
            </Label>
          </div>
        </div>

        <Tabs defaultValue="zones" className="flex-1 overflow-hidden">
          <TabsList className="w-full">
            <TabsTrigger value="zones" className="flex-1">Zones</TabsTrigger>
            <TabsTrigger value="evacuation" className="flex-1">Evacuation</TabsTrigger>
            <TabsTrigger value="routes" className="flex-1">Routes</TabsTrigger>
          </TabsList>

          <TabsContent value="zones" className="overflow-y-auto max-h-[50vh] mt-2">
            <div className="space-y-3">
              <Card className="border-red-200 dark:border-red-900/40">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm">Add Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="Zone name"
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select value={zoneForm.type} onValueChange={(v) => setZoneForm({ ...zoneForm, type: v as EmergencyZone['type'] })}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(ZONE_TYPE_CONFIG).map(([k, cfg]) => (
                            <SelectItem key={k} value={k}>{cfg.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Lat</Label>
                      <Input
                        type="number" step="0.001"
                        placeholder={center[1].toFixed(4)}
                        value={zoneForm.latitude || ''}
                        onChange={(e) => setZoneForm({ ...zoneForm, latitude: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Lng</Label>
                      <Input
                        type="number" step="0.001"
                        placeholder={center[0].toFixed(4)}
                        value={zoneForm.longitude || ''}
                        onChange={(e) => setZoneForm({ ...zoneForm, longitude: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Radius (m)</Label>
                      <Input
                        type="number"
                        value={zoneForm.radius}
                        onChange={(e) => setZoneForm({ ...zoneForm, radius: parseInt(e.target.value) || 500 })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Severity</Label>
                      <Select value={zoneForm.severity} onValueChange={(v) => setZoneForm({ ...zoneForm, severity: v as EmergencyZone['severity'] })}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(SEVERITY_CONFIG).map(([k, cfg]) => (
                            <SelectItem key={k} value={k}>{cfg.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button size="sm" onClick={addZone} className="h-8 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white">
                      <Plus className="size-3 mr-1" /> Add Zone
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AnimatePresence>
                {emergencyRoute.zones.map((zone) => {
                  const typeCfg = ZONE_TYPE_CONFIG[zone.type]
                  const sevCfg = SEVERITY_CONFIG[zone.severity]
                  return (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <Card className={`border ${sevCfg.bg} dark:border-opacity-40`}>
                        <CardContent className="px-3 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={typeCfg.color}>{typeCfg.icon}</span>
                            <span className="text-sm font-medium truncate">{zone.name}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sevCfg.color}`}>
                              {sevCfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{zone.radius}m</span>
                            <Button variant="ghost" size="icon" className="size-6" onClick={() => deleteZone(zone.id)}>
                              <Trash2 className="size-3 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {emergencyRoute.zones.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No danger zones added yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="evacuation" className="overflow-y-auto max-h-[50vh] mt-2">
            <div className="space-y-3">
              <Card className="border-blue-200 dark:border-blue-900/40">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm">Add Evacuation Point</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="Point name"
                        value={evacForm.name}
                        onChange={(e) => setEvacForm({ ...evacForm, name: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select value={evacForm.type} onValueChange={(v) => setEvacForm({ ...evacForm, type: v as EvacuationPoint['type'] })}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(EVAC_TYPE_CONFIG).map(([k, cfg]) => (
                            <SelectItem key={k} value={k}>{cfg.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Lat</Label>
                      <Input
                        type="number" step="0.001"
                        placeholder={center[1].toFixed(4)}
                        value={evacForm.latitude || ''}
                        onChange={(e) => setEvacForm({ ...evacForm, latitude: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Lng</Label>
                      <Input
                        type="number" step="0.001"
                        placeholder={center[0].toFixed(4)}
                        value={evacForm.longitude || ''}
                        onChange={(e) => setEvacForm({ ...evacForm, longitude: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Capacity</Label>
                      <Input
                        type="number"
                        value={evacForm.capacity}
                        onChange={(e) => setEvacForm({ ...evacForm, capacity: parseInt(e.target.value) || 100 })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <Button size="sm" onClick={addEvacPoint} className="h-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    <Plus className="size-3 mr-1" /> Add Point
                  </Button>
                </CardContent>
              </Card>

              <AnimatePresence>
                {emergencyRoute.evacuationPoints.map((point) => {
                  const cfg = EVAC_TYPE_CONFIG[point.type]
                  const isActive = emergencyRoute.activeRouteId === point.id
                  return (
                    <motion.div
                      key={point.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <Card className={`border ${isActive ? 'border-green-400 bg-green-50 dark:bg-green-950/30' : 'border-slate-200 dark:border-slate-800'}`}>
                        <CardContent className="px-3 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cfg.color}>{cfg.icon}</span>
                            <span className="text-sm font-medium truncate">{point.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{cfg.label}</Badge>
                            <span className="text-xs text-muted-foreground">Cap: {point.capacity}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="size-6" onClick={() => deleteEvacPoint(point.id)}>
                            <Trash2 className="size-3 text-red-500" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {emergencyRoute.evacuationPoints.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No evacuation points added yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="routes" className="overflow-y-auto max-h-[50vh] mt-2">
            <div className="space-y-3">
              <Card className="border-rose-200 dark:border-rose-900/40">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Route className="size-4 text-rose-500" /> Evacuation Route
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Calculate the shortest route from your current location to the nearest evacuation point.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Navigation className="size-3" />
                    <span>Current: {center[1].toFixed(4)}, {center[0].toFixed(4)}</span>
                  </div>
                  <Button
                    onClick={planRoute}
                    disabled={emergencyRoute.evacuationPoints.length === 0}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                  >
                    <Navigation className="size-4 mr-2" /> Plan Route to Nearest Safe Point
                  </Button>
                </CardContent>
              </Card>

              {emergencyRoute.activeRouteId && (() => {
                const target = emergencyRoute.evacuationPoints.find(p => p.id === emergencyRoute.activeRouteId)
                if (!target) return null
                const dist = Math.sqrt(
                  (target.latitude - center[1]) ** 2 + (target.longitude - center[0]) ** 2
                ) * 111139 // rough meters
                return (
                  <Card className="border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-900/40">
                    <CardHeader className="pb-1 pt-3 px-4">
                      <CardTitle className="text-sm text-green-700 dark:text-green-400">Route Planned</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 space-y-1">
                      <p className="text-sm font-medium">{target.name}</p>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Type: {EVAC_TYPE_CONFIG[target.type].label}</p>
                        <p>Capacity: {target.capacity}</p>
                        <p>Distance: ~{dist.toFixed(0)}m</p>
                        <p>Walking: ~{(dist / 5000 * 60).toFixed(0)} min</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}

              {emergencyRoute.zones.length > 0 && (
                <Card className="border-red-200 dark:border-red-900/40">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-sm">Active Danger Zones</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {emergencyRoute.zones.map((z) => (
                        <Badge key={z.id} variant="outline" className={`text-[10px] ${SEVERITY_CONFIG[z.severity].color}`}>
                          {ZONE_TYPE_CONFIG[z.type].label}: {z.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
