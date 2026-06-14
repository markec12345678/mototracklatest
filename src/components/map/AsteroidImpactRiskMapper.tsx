'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type AsteroidImpactState, type NearEarthObject } from '@/lib/map-store'
import { Zap, Circle, Target, AlertTriangle, X, Filter } from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const DEMO_OBJECTS: NearEarthObject[] = [
  {
    id: 'neo-apophis',
    name: '99942 Apophis',
    diameter: 370,
    velocity: 30.73,
    missDistance: 38700,
    hazardScore: 8.2,
    approachDate: '2029-04-13',
    latitude: 20.0,
    longitude: -45.0,
  },
  {
    id: 'neo-bennu',
    name: '101955 Bennu',
    diameter: 490,
    velocity: 28.0,
    missDistance: 105000,
    hazardScore: 6.8,
    approachDate: '2060-09-23',
    latitude: -15.0,
    longitude: 110.0,
  },
  {
    id: 'neo-2023dw',
    name: '2023 DW',
    diameter: 49,
    velocity: 24.6,
    missDistance: 4200000,
    hazardScore: 9.1,
    approachDate: '2046-02-14',
    latitude: 35.0,
    longitude: 70.0,
  },
  {
    id: 'neo-florence',
    name: '3122 Florence',
    diameter: 4900,
    velocity: 24.6,
    missDistance: 7000000,
    hazardScore: 2.5,
    approachDate: '2028-09-02',
    latitude: -30.0,
    longitude: -60.0,
  },
  {
    id: 'neo-itokawa',
    name: '25143 Itokawa',
    diameter: 535,
    velocity: 25.4,
    missDistance: 1500000,
    hazardScore: 4.3,
    approachDate: '2071-06-11',
    latitude: 45.0,
    longitude: 140.0,
  },
]

const SCATTER_DATA = [
  { diameter: 370, velocity: 30.73, name: 'Apophis' },
  { diameter: 490, velocity: 28.0, name: 'Bennu' },
  { diameter: 49, velocity: 24.6, name: '2023 DW' },
  { diameter: 4900, velocity: 24.6, name: 'Florence' },
  { diameter: 535, velocity: 25.4, name: 'Itokawa' },
]

const HAZARD_DATA = [
  { object: 'Apophis', hazard: 8.2 },
  { object: 'Bennu', hazard: 6.8 },
  { object: '2023 DW', hazard: 9.1 },
  { object: 'Florence', hazard: 2.5 },
  { object: 'Itokawa', hazard: 4.3 },
]

function getHazardCategory(score: number): AsteroidImpactState['hazardFilter'] {
  if (score >= 8) return 'critical'
  if (score >= 6) return 'high'
  if (score >= 3) return 'moderate'
  return 'low'
}

export function AsteroidImpactRiskMapper() {
  const asteroidImpact = useMapStore((s) => s.asteroidImpact)
  const setAsteroidImpact = useMapStore((s) => s.setAsteroidImpact)

  const [chartMode, setChartMode] = useState<'scatter' | 'hazard'>('scatter')

  const objects = useMemo(
    () => (asteroidImpact.objects && asteroidImpact.objects.length > 0 ? asteroidImpact.objects : DEMO_OBJECTS),
    [asteroidImpact.objects]
  )

  const filteredObjects = useMemo(() => {
    return objects.filter((o) => {
      if (asteroidImpact.hazardFilter !== 'all' && getHazardCategory(o.hazardScore) !== asteroidImpact.hazardFilter) return false
      return true
    })
  }, [objects, asteroidImpact.hazardFilter])

  const summary = useMemo(() => {
    if (!filteredObjects || filteredObjects.length === 0) {
      return { largest: 0, avgVelocity: 0, maxHazard: 0 }
    }
    const largest = Math.round(filteredObjects.reduce((max, o) => Math.max(max, o.diameter), 0))
    const avgVelocity = Math.round((filteredObjects.reduce((s, o) => s + o.velocity, 0) / filteredObjects.length) * 10) / 10
    const maxHazard = Math.round(filteredObjects.reduce((max, o) => Math.max(max, o.hazardScore), 0) * 10) / 10
    return { largest, avgVelocity, maxHazard }
  }, [filteredObjects])

  const activeObject = useMemo(
    () => (objects && objects.length > 0 ? objects.find((o) => o.id === asteroidImpact.activeObjectId) ?? null : null),
    [objects, asteroidImpact.activeObjectId]
  )

  if (typeof window === 'undefined') return null
  if (!asteroidImpact.open) return null

  const overlayToggles: { key: keyof AsteroidImpactState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTrajectory', label: 'Trajectory', icon: Circle },
    { key: 'showHazardScore', label: 'Hazard', icon: Target },
    { key: 'showSizeComparison', label: 'Size', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Asteroid Impact Risk Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAsteroidImpact({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Hazard Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Hazard Level
            </Label>
            <Select
              value={asteroidImpact.hazardFilter}
              onValueChange={(v) =>
                setAsteroidImpact({
                  hazardFilter: v as AsteroidImpactState['hazardFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low (0-3)</SelectItem>
                <SelectItem value="moderate">Moderate (3-6)</SelectItem>
                <SelectItem value="high">High (6-8)</SelectItem>
                <SelectItem value="critical">Critical (8-10)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Largest</div>
              <div className="text-sm font-semibold">{summary.largest} m</div>
            </div>
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Velocity</div>
              <div className="text-sm font-semibold">{summary.avgVelocity} km/s</div>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Max Hazard</div>
              <div className="text-sm font-semibold">{summary.maxHazard}/10</div>
            </div>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Display Options</Label>
            <div className="flex flex-wrap gap-2">
              {overlayToggles.map((t) => (
                <div key={t.key} className="flex items-center gap-1.5">
                  <Switch
                    checked={asteroidImpact[t.key] as boolean}
                    onCheckedChange={(checked) => setAsteroidImpact({ [t.key]: checked })}
                    className="scale-75"
                  />
                  <Label className="text-[10px] flex items-center gap-0.5">
                    <t.icon className="h-3 w-3" />
                    {t.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Chart Mode Toggle */}
          <div className="flex gap-1">
            <Button
              variant={chartMode === 'scatter' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('scatter')}
            >
              Diameter vs Velocity
            </Button>
            <Button
              variant={chartMode === 'hazard' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('hazard')}
            >
              Hazard Scores
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'scatter' ? (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="diameter" tick={{ fontSize: 10 }} type="number" name="Diameter" unit=" m" label={{ value: 'Diameter (m)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis dataKey="velocity" tick={{ fontSize: 10 }} type="number" name="Velocity" unit=" km/s" />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Scatter data={SCATTER_DATA} fill="#f59e0b" name="NEO" />
                </ScatterChart>
              ) : (
                <BarChart data={HAZARD_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="object" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="hazard" fill="#ef4444" name="Hazard Score" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Object List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Near-Earth Objects ({filteredObjects.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredObjects && filteredObjects.length > 0) ? filteredObjects.map((obj) => {
                  const hazCat = getHazardCategory(obj.hazardScore)
                  const hazBgClass =
                    hazCat === 'critical' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                    hazCat === 'high' ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' :
                    hazCat === 'moderate' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                    'bg-green-500/10 text-green-600 border-green-500/30'
                  const isActive = activeObject?.id === obj.id
                  return (
                    <div
                      key={obj.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5'
                      }`}
                      onClick={() => setAsteroidImpact({ activeObjectId: isActive ? null : obj.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{obj.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${hazBgClass}`}>
                          {obj.hazardScore}/10
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {asteroidImpact.showSizeComparison && <span>⌀ {obj.diameter} m</span>}
                        <span>{obj.velocity} km/s</span>
                        {asteroidImpact.showTrajectory && <span>Miss: {(obj.missDistance / 1000).toFixed(0)}k km</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No objects match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Object Detail */}
          {activeObject && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  {activeObject.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Circle className="h-3 w-3 text-amber-600" />
                    <span className="text-muted-foreground">Diameter:</span>
                    <span className="font-medium">{activeObject.diameter} m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-cyan-500" />
                    <span className="text-muted-foreground">Velocity:</span>
                    <span className="font-medium">{activeObject.velocity} km/s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">Hazard:</span>
                    <span className="font-medium">{activeObject.hazardScore}/10</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Circle className="h-3 w-3 text-stone-500" />
                    <span className="text-muted-foreground">Miss Dist:</span>
                    <span className="font-medium">{(activeObject.missDistance).toLocaleString()} km</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Impact Risk</span>
                    <span className="text-[10px] font-medium">{activeObject.hazardScore >= 8 ? 'Critical' : activeObject.hazardScore >= 6 ? 'High' : activeObject.hazardScore >= 3 ? 'Moderate' : 'Low'}</span>
                  </div>
                  <Progress value={Math.min(100, (activeObject.hazardScore / 10) * 100)} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Approach: {activeObject.approachDate} | Location: {activeObject.latitude.toFixed(2)}°, {activeObject.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
