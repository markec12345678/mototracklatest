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
import { useMapStore, type DesertOasisState, type DesertOasis } from '@/lib/map-store'
import { Droplets, SunDim, TreePine, TrendingUp, X, Filter } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const DEMO_OASES: DesertOasis[] = [
  {
    id: 'do-siwa',
    name: 'Siwa Oasis',
    waterLevel: 72,
    salinity: 3.2,
    vegetationIndex: 0.65,
    areaChange: -2.1,
    temperature: 34,
    latitude: 29.2,
    longitude: 25.52,
  },
  {
    id: 'do-huacachina',
    name: 'Huacachina Oasis',
    waterLevel: 45,
    salinity: 8.5,
    vegetationIndex: 0.32,
    areaChange: -5.8,
    temperature: 28,
    latitude: -14.09,
    longitude: -75.76,
  },
  {
    id: 'do-timimoun',
    name: 'Timimoun Oasis',
    waterLevel: 58,
    salinity: 5.1,
    vegetationIndex: 0.48,
    areaChange: -1.3,
    temperature: 38,
    latitude: 29.26,
    longitude: 0.23,
  },
  {
    id: 'do-ubar',
    name: 'Ubar Oasis',
    waterLevel: 38,
    salinity: 12.4,
    vegetationIndex: 0.22,
    areaChange: -8.5,
    temperature: 42,
    latitude: 18.28,
    longitude: 53.67,
  },
  {
    id: 'do-farafra',
    name: 'Farafra Oasis',
    waterLevel: 81,
    salinity: 2.1,
    vegetationIndex: 0.78,
    areaChange: 1.2,
    temperature: 36,
    latitude: 27.06,
    longitude: 27.97,
  },
]

const WATER_TREND_DATA = [
  { month: 'Jan', siwa: 78, huacachina: 55, timimoun: 65, ubar: 48, farafra: 85 },
  { month: 'Feb', siwa: 76, huacachina: 52, timimoun: 62, ubar: 45, farafra: 83 },
  { month: 'Mar', siwa: 74, huacachina: 50, timimoun: 60, ubar: 42, farafra: 82 },
  { month: 'Apr', siwa: 73, huacachina: 48, timimoun: 59, ubar: 40, farafra: 81 },
  { month: 'May', siwa: 72, huacachina: 46, timimoun: 58, ubar: 39, farafra: 81 },
  { month: 'Jun', siwa: 72, huacachina: 45, timimoun: 58, ubar: 38, farafra: 81 },
]

const VEGETATION_PIE_DATA = [
  { name: 'Thriving (>0.6)', value: 2, color: '#22c55e' },
  { name: 'Stable (0.4-0.6)', value: 1, color: '#eab308' },
  { name: 'Declining (0.2-0.4)', value: 1, color: '#f97316' },
  { name: 'Critical (<0.2)', value: 1, color: '#ef4444' },
]

function getHealthCategory(oasis: DesertOasis): DesertOasisState['healthFilter'] {
  if (oasis.vegetationIndex >= 0.6 && oasis.waterLevel >= 60) return 'thriving'
  if (oasis.vegetationIndex >= 0.4 && oasis.waterLevel >= 40) return 'stable'
  if (oasis.vegetationIndex >= 0.2 && oasis.waterLevel >= 30) return 'declining'
  return 'critical'
}

export function DesertOasisMonitor() {
  const desertOasis = useMapStore((s) => s.desertOasis)
  const setDesertOasis = useMapStore((s) => s.setDesertOasis)

  const [chartMode, setChartMode] = useState<'waterTrend' | 'vegetation'>('waterTrend')

  const oases = useMemo(
    () => (desertOasis.oases && desertOasis.oases.length > 0 ? desertOasis.oases : DEMO_OASES),
    [desertOasis.oases]
  )

  const filteredOases = useMemo(() => {
    return oases.filter((o) => {
      if (desertOasis.healthFilter !== 'all' && getHealthCategory(o) !== desertOasis.healthFilter) return false
      return true
    })
  }, [oases, desertOasis.healthFilter])

  const summary = useMemo(() => {
    if (!filteredOases || filteredOases.length === 0) {
      return { avgWater: 0, avgSalinity: 0, avgVeg: 0 }
    }
    const avgWater = Math.round(filteredOases.reduce((s, o) => s + o.waterLevel, 0) / filteredOases.length)
    const avgSalinity = Math.round((filteredOases.reduce((s, o) => s + o.salinity, 0) / filteredOases.length) * 10) / 10
    const avgVeg = Math.round((filteredOases.reduce((s, o) => s + o.vegetationIndex, 0) / filteredOases.length) * 100) / 100
    return { avgWater, avgSalinity, avgVeg }
  }, [filteredOases])

  const activeOasis = useMemo(
    () => (oases && oases.length > 0 ? oases.find((o) => o.id === desertOasis.activeOasisId) ?? null : null),
    [oases, desertOasis.activeOasisId]
  )

  if (typeof window === 'undefined') return null
  if (!desertOasis.open) return null

  const overlayToggles: { key: keyof DesertOasisState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterLevel', label: 'Water', icon: Droplets },
    { key: 'showSalinity', label: 'Salinity', icon: SunDim },
    { key: 'showVegetation', label: 'Vegetation', icon: TreePine },
    { key: 'showAreaChange', label: 'Area', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-emerald-500" />
              Desert Oasis Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setDesertOasis({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Health Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Health Status
            </Label>
            <Select
              value={desertOasis.healthFilter}
              onValueChange={(v) =>
                setDesertOasis({
                  healthFilter: v as DesertOasisState['healthFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="thriving">Thriving</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Water</div>
              <div className="text-sm font-semibold">{summary.avgWater}%</div>
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Salinity</div>
              <div className="text-sm font-semibold">{summary.avgSalinity} g/L</div>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Veg</div>
              <div className="text-sm font-semibold">{summary.avgVeg}</div>
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
                    checked={desertOasis[t.key] as boolean}
                    onCheckedChange={(checked) => setDesertOasis({ [t.key]: checked })}
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
              variant={chartMode === 'waterTrend' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('waterTrend')}
            >
              Water Level Trends
            </Button>
            <Button
              variant={chartMode === 'vegetation' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('vegetation')}
            >
              Vegetation
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'waterTrend' ? (
                <AreaChart data={WATER_TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="siwa" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} name="Siwa" />
                  <Area type="monotone" dataKey="farafra" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Farafra" />
                  <Area type="monotone" dataKey="timimoun" stroke="#eab308" fill="#eab308" fillOpacity={0.1} name="Timimoun" />
                </AreaChart>
              ) : (
                <PieChart>
                  <Pie data={VEGETATION_PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {VEGETATION_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Oasis List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Desert Oases ({filteredOases.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredOases && filteredOases.length > 0) ? filteredOases.map((oasis) => {
                  const healthCat = getHealthCategory(oasis)
                  const healthBgClass =
                    healthCat === 'thriving' ? 'bg-green-500/10 text-green-600 border-green-500/30' :
                    healthCat === 'stable' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                    healthCat === 'declining' ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' :
                    'bg-red-500/10 text-red-600 border-red-500/30'
                  const healthLabel =
                    healthCat === 'thriving' ? 'Thriving' :
                    healthCat === 'stable' ? 'Stable' :
                    healthCat === 'declining' ? 'Declining' :
                    'Critical'
                  const isActive = activeOasis?.id === oasis.id
                  return (
                    <div
                      key={oasis.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                      }`}
                      onClick={() => setDesertOasis({ activeOasisId: isActive ? null : oasis.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{oasis.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${healthBgClass}`}>
                          {healthLabel}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {desertOasis.showWaterLevel && <span>Water: {oasis.waterLevel}%</span>}
                        {desertOasis.showSalinity && <span>Salt: {oasis.salinity} g/L</span>}
                        {desertOasis.showVegetation && <span>Veg: {oasis.vegetationIndex}</span>}
                        {desertOasis.showAreaChange && <span>Area: {oasis.areaChange > 0 ? '+' : ''}{oasis.areaChange}%</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No oases match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Oasis Detail */}
          {activeOasis && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-emerald-500" />
                  {activeOasis.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Water:</span>
                    <span className="font-medium">{activeOasis.waterLevel}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <SunDim className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">Salinity:</span>
                    <span className="font-medium">{activeOasis.salinity} g/L</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TreePine className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Vegetation:</span>
                    <span className="font-medium">{activeOasis.vegetationIndex}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-orange-500" />
                    <span className="text-muted-foreground">Area Δ:</span>
                    <span className="font-medium">{activeOasis.areaChange > 0 ? '+' : ''}{activeOasis.areaChange}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Oasis Health</span>
                    <span className="text-[10px] font-medium">{activeOasis.waterLevel >= 60 ? 'Good' : activeOasis.waterLevel >= 40 ? 'Fair' : 'Poor'}</span>
                  </div>
                  <Progress value={activeOasis.waterLevel} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Temp: {activeOasis.temperature}°C | Location: {activeOasis.latitude.toFixed(2)}°, {activeOasis.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
