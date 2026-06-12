'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type HydrologyPoint, type WatershedData } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  Droplets,
  Plus,
  Download,
  MapPin,
  Waves,
  Activity,
  Thermometer,
  BarChart3,
  ArrowDown,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const POINT_TYPES: HydrologyPoint['type'][] = ['spring', 'well', 'river', 'lake', 'dam', 'gauge', 'outlet']
const TYPE_LABELS: Record<string, string> = {
  spring: 'Spring',
  well: 'Well',
  river: 'River',
  lake: 'Lake',
  dam: 'Dam',
  gauge: 'Gauge',
  outlet: 'Outlet',
}
const TYPE_ICONS: Record<string, string> = {
  spring: '💧',
  well: '🏗️',
  river: '🏞️',
  lake: '🌊',
  dam: '🧱',
  gauge: '📊',
  outlet: '🔽',
}

const QUALITY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  excellent: { bg: 'bg-green-500/10', color: 'text-green-600 dark:text-green-400', label: 'Excellent' },
  good: { bg: 'bg-teal-500/10', color: 'text-teal-600 dark:text-teal-400', label: 'Good' },
  moderate: { bg: 'bg-yellow-500/10', color: 'text-yellow-600 dark:text-yellow-400', label: 'Moderate' },
  poor: { bg: 'bg-orange-500/10', color: 'text-orange-600 dark:text-orange-400', label: 'Poor' },
  bad: { bg: 'bg-red-500/10', color: 'text-red-600 dark:text-red-400', label: 'Bad' },
}

const QUALITY_COLORS: Record<string, string> = {
  excellent: '#22c55e',
  good: '#14b8a6',
  moderate: '#eab308',
  poor: '#f97316',
  bad: '#ef4444',
}

function generateId(): string {
  return `hy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function HydrologyAnalyzer() {
  const hydrology = useMapStore((s) => s.hydrology)
  const setHydrology = useMapStore((s) => s.setHydrology)
  const center = useMapStore((s) => s.center)

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'river' as HydrologyPoint['type'],
    flowRate: '',
    waterLevel: '',
    quality: 'good' as HydrologyPoint['quality'],
  })

  const points = hydrology.points

  const qualityDistribution = useMemo(() => {
    const dist: Record<string, number> = { excellent: 0, good: 0, moderate: 0, poor: 0, bad: 0 }
    points.forEach((p) => { dist[p.quality]++ })
    return Object.entries(dist)
      .filter(([, count]) => count > 0)
      .map(([quality, count]) => ({
        quality: QUALITY_STYLES[quality]?.label || quality,
        count,
        color: QUALITY_COLORS[quality],
      }))
  }, [points])

  const stats = useMemo(() => {
    const flowRates = points.map((p) => p.flowRate).filter((f): f is number => f !== null)
    const avgFlow = flowRates.length > 0 ? flowRates.reduce((a, b) => a + b, 0) / flowRates.length : 0
    return {
      totalPoints: points.length,
      averageFlowRate: avgFlow,
      qualityDistribution: qualityDistribution,
    }
  }, [points, qualityDistribution])

  const simulateWatershed = useCallback(() => {
    if (points.length === 0) {
      toast.error('Add at least one hydrology point first')
      return
    }
    // Simulated watershed data based on existing points
    const lats = points.map((p) => p.latitude)
    const lngs = points.map((p) => p.longitude)
    const minLat = Math.min(...lats) - 0.01
    const maxLat = Math.max(...lats) + 0.01
    const minLng = Math.min(...lngs) - 0.01
    const maxLng = Math.max(...lngs) + 0.01

    const gridSize = 5
    const flowDirection: number[][] = []
    const accumulation: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      const flowRow: number[] = []
      const accRow: number[] = []
      for (let j = 0; j < gridSize; j++) {
        flowRow.push(Math.floor(Math.random() * 8))
        accRow.push(Math.floor(Math.random() * 100))
      }
      flowDirection.push(flowRow)
      accRow[gridSize - 1] = Math.max(...accRow) // outlet has highest accumulation
      accumulation.push(accRow)
    }

    // Find outlet point (lowest point)
    const outlet = points.reduce((prev, curr) =>
      (prev.waterLevel ?? Infinity) < (curr.waterLevel ?? Infinity) ? prev : curr
    )

    const watershed: WatershedData = {
      area: (maxLat - minLat) * (maxLng - minLng) * 111 * 111,
      perimeter: 2 * ((maxLat - minLat) * 111 + (maxLng - minLng) * 111),
      outletPoint: { latitude: outlet.latitude, longitude: outlet.longitude },
      flowDirection,
      accumulation,
    }
    setHydrology({ watershed })
    toast.success('Watershed analysis complete')
  }, [points, setHydrology])

  const handleAddPoint = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error('Point name is required')
      return
    }
    const [lng, lat] = center
    const newPoint: HydrologyPoint = {
      id: generateId(),
      latitude: lat,
      longitude: lng,
      type: formData.type,
      name: formData.name.trim(),
      flowRate: formData.flowRate ? parseFloat(formData.flowRate) : null,
      waterLevel: formData.waterLevel ? parseFloat(formData.waterLevel) : null,
      quality: formData.quality,
      lastReading: new Date().toISOString(),
    }
    setHydrology({ points: [...points, newPoint] })
    setFormData({ name: '', type: 'river', flowRate: '', waterLevel: '', quality: 'good' })
    setShowAddForm(false)
    toast.success(`Added "${newPoint.name}" hydrology point`)
  }, [formData, center, points, setHydrology])

  const handleExportGeoJSON = useCallback(() => {
    if (typeof window === 'undefined') return
    const geojson = {
      type: 'FeatureCollection' as const,
      features: points.map((p) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          name: p.name,
          type: p.type,
          flowRate: p.flowRate,
          waterLevel: p.waterLevel,
          quality: p.quality,
          lastReading: p.lastReading,
        },
      })),
    }
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hydrology-data-${new Date().toISOString().split('T')[0]}.geojson`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('GeoJSON exported successfully')
  }, [points])

  return (
    <Dialog open={hydrology.open} onOpenChange={(open) => setHydrology({ open })}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            Hydrology Analyzer
            <Badge variant="outline" className="text-[10px] ml-auto font-normal">
              {points.length} points
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="points" className="w-full">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="points" className="flex-1">Points</TabsTrigger>
              <TabsTrigger value="analysis" className="flex-1">Analysis</TabsTrigger>
              <TabsTrigger value="quality" className="flex-1">Quality</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[70vh]">
            <TabsContent value="points" className="p-4 pt-2 space-y-3">
              {/* Toggles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4 text-cyan-500" />
                    <Label className="text-sm">Show Flow Paths</Label>
                  </div>
                  <Switch checked={hydrology.showFlowPaths} onCheckedChange={(v) => setHydrology({ showFlowPaths: v })} aria-label="Toggle flow paths" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                    <Label className="text-sm">Show Watersheds</Label>
                  </div>
                  <Switch checked={hydrology.showWatersheds} onCheckedChange={(v) => setHydrology({ showWatersheds: v })} aria-label="Toggle watersheds" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-500" />
                    <Label className="text-sm">Show Water Bodies</Label>
                  </div>
                  <Switch checked={hydrology.showWaterBodies} onCheckedChange={(v) => setHydrology({ showWaterBodies: v })} aria-label="Toggle water bodies" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-cyan-500" />
                    <Label className="text-sm">Quality Overlay</Label>
                  </div>
                  <Switch checked={hydrology.showQualityOverlay} onCheckedChange={(v) => setHydrology({ showQualityOverlay: v })} aria-label="Toggle quality overlay" />
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => setShowAddForm(!showAddForm)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Point
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={handleExportGeoJSON} disabled={points.length === 0}>
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>

              {/* Add form */}
              {showAddForm && (
                <Card className="border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                  <CardContent className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Name *</Label>
                        <Input className="h-7 text-xs" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Cedar Creek" />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <select className="h-7 w-full rounded-md border bg-background text-xs px-2" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as HydrologyPoint['type'] })}>
                          {POINT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Flow Rate (m³/s)</Label>
                        <Input type="number" step="0.1" className="h-7 text-xs" value={formData.flowRate} onChange={(e) => setFormData({ ...formData, flowRate: e.target.value })} placeholder="0.0" />
                      </div>
                      <div>
                        <Label className="text-xs">Water Level (m)</Label>
                        <Input type="number" step="0.1" className="h-7 text-xs" value={formData.waterLevel} onChange={(e) => setFormData({ ...formData, waterLevel: e.target.value })} placeholder="0.0" />
                      </div>
                      <div>
                        <Label className="text-xs">Quality</Label>
                        <select className="h-7 w-full rounded-md border bg-background text-xs px-2" value={formData.quality} onChange={(e) => setFormData({ ...formData, quality: e.target.value as HydrologyPoint['quality'] })}>
                          {Object.entries(QUALITY_STYLES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs gap-1 bg-cyan-600 hover:bg-cyan-700" onClick={handleAddPoint}>
                        <Plus className="h-3 w-3" />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Points list */}
              {points.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Droplets className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hydrology points yet</p>
                  <p className="text-xs mt-1">Click &quot;Add Point&quot; to start monitoring</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {points.map((point) => (
                    <Card
                      key={point.id}
                      className={`cursor-pointer hover:shadow-sm transition-shadow ${hydrology.activePointId === point.id ? 'border-cyan-400 dark:border-cyan-700 ring-1 ring-cyan-300' : ''}`}
                      onClick={() => setHydrology({ activePointId: hydrology.activePointId === point.id ? null : point.id })}
                    >
                      <CardContent className="p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm">{TYPE_ICONS[point.type]}</span>
                            <span className="text-sm font-medium truncate">{point.name}</span>
                          </div>
                          <Badge className={`${QUALITY_STYLES[point.quality].bg} ${QUALITY_STYLES[point.quality].color} border-0 text-[9px] px-1.5`}>
                            {QUALITY_STYLES[point.quality].label}
                          </Badge>
                        </div>
                        {hydrology.activePointId === point.id && (
                          <div className="mt-2 pt-2 border-t space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Waves className="h-3 w-3" />
                              {point.flowRate !== null ? `${point.flowRate.toFixed(2)} m³/s` : 'No flow data'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Activity className="h-3 w-3" />
                              {point.waterLevel !== null ? `${point.waterLevel.toFixed(2)} m` : 'No level data'}
                            </div>
                            {point.lastReading && (
                              <p className="text-[10px] text-muted-foreground">
                                Last: {new Date(point.lastReading).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="p-4 pt-2 space-y-3">
              {/* Analysis mode selector */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase">Analysis Mode</Label>
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {(['flow', 'watershed', 'quality', 'flood'] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={hydrology.analysisMode === mode ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-[10px] capitalize"
                      onClick={() => setHydrology({ analysisMode: mode })}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                onClick={simulateWatershed}
                disabled={points.length === 0}
              >
                <ArrowDown className="h-3.5 w-3.5" />
                Run Watershed Analysis
              </Button>

              {hydrology.watershed && (
                <Card className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                  <CardContent className="p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Watershed Results</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Area</p>
                        <p className="text-sm font-semibold">{hydrology.watershed.area.toFixed(2)} km²</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Perimeter</p>
                        <p className="text-sm font-semibold">{hydrology.watershed.perimeter.toFixed(2)} km</p>
                      </div>
                      {hydrology.watershed.outletPoint && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-muted-foreground">Outlet Point</p>
                          <p className="text-sm font-semibold">
                            {hydrology.watershed.outletPoint.latitude.toFixed(4)}, {hydrology.watershed.outletPoint.longitude.toFixed(4)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Flow accumulation visualization */}
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Flow Accumulation Grid</p>
                      <div className="grid grid-cols-5 gap-0.5">
                        {hydrology.watershed.accumulation.flat().map((val, idx) => {
                          const maxVal = Math.max(...hydrology.watershed!.accumulation.flat())
                          const intensity = maxVal > 0 ? val / maxVal : 0
                          return (
                            <div
                              key={idx}
                              className="h-6 rounded-sm flex items-center justify-center text-[7px] text-white font-medium"
                              style={{ backgroundColor: `rgba(6, 182, 212, ${0.2 + intensity * 0.8})` }}
                            >
                              {val}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats summary */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.totalPoints}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Total Points</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.averageFlowRate.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Avg Flow (m³/s)</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="p-4 pt-2 space-y-3">
              {qualityDistribution.length > 0 ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Quality Distribution</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={qualityDistribution} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                        <XAxis dataKey="quality" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--popover))',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                          {qualityDistribution.map((entry, index) => (
                            <Cell key={`q-cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No quality data to chart</p>
                  <p className="text-xs mt-1">Add hydrology points to see quality distribution</p>
                </div>
              )}

              <Separator />

              {/* Quality legend */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Quality Scale</p>
                  <div className="space-y-1.5">
                    {Object.entries(QUALITY_STYLES).map(([key, style]) => {
                      const count = points.filter((p) => p.quality === key).length
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: QUALITY_COLORS[key] }} />
                            <span className="text-xs">{style.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{count} points</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
