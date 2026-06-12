'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type Watershed } from '@/lib/map-store'
import {
  X,
  Eye,
  EyeOff,
  Droplets,
  Waves,
  Globe,
  Activity,
  Filter,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const DEMO_WATERSHEDS: Watershed[] = [
  {
    id: 'ws1',
    name: 'Amazon',
    latitude: -3.4,
    longitude: -60.0,
    area: 6915000,
    streamOrder: 12,
    discharge: 209000,
    waterQuality: 'moderate',
    landUse: 'Tropical Forest',
  },
  {
    id: 'ws2',
    name: 'Mississippi',
    latitude: 38.5,
    longitude: -90.0,
    area: 3220000,
    streamOrder: 10,
    discharge: 16700,
    waterQuality: 'moderate',
    landUse: 'Agriculture',
  },
  {
    id: 'ws3',
    name: 'Danube',
    latitude: 48.0,
    longitude: 18.0,
    area: 801463,
    streamOrder: 8,
    discharge: 7130,
    waterQuality: 'good',
    landUse: 'Mixed Urban/Rural',
  },
  {
    id: 'ws4',
    name: 'Nile',
    latitude: 25.0,
    longitude: 32.0,
    area: 3349000,
    streamOrder: 9,
    discharge: 2830,
    waterQuality: 'poor',
    landUse: 'Agriculture/Desert',
  },
  {
    id: 'ws5',
    name: 'Yangtze',
    latitude: 30.0,
    longitude: 112.0,
    area: 1800000,
    streamOrder: 10,
    discharge: 30166,
    waterQuality: 'moderate',
    landUse: 'Industrial/Agriculture',
  },
  {
    id: 'ws6',
    name: 'Murray-Darling',
    latitude: -34.0,
    longitude: 145.0,
    area: 1061469,
    streamOrder: 7,
    discharge: 767,
    waterQuality: 'poor',
    landUse: 'Agriculture',
  },
  {
    id: 'ws7',
    name: 'Ganges',
    latitude: 25.3,
    longitude: 83.0,
    area: 1080000,
    streamOrder: 9,
    discharge: 12500,
    waterQuality: 'poor',
    landUse: 'Agriculture/Urban',
  },
]

const QUALITY_COLORS: Record<string, string> = {
  good: '#10b981',
  moderate: '#f59e0b',
  poor: '#ef4444',
}

const QUALITY_LABELS: Record<string, string> = {
  good: 'Good',
  moderate: 'Moderate',
  poor: 'Poor',
}

const SIZE_LABELS: Record<string, string> = {
  all: 'All Sizes',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  major: 'Major',
}

const WATER_QUALITY_RADAR = [
  { metric: 'DO', amazon: 72, mississippi: 58, danube: 88, nile: 42, yangtze: 55, ganges: 38 },
  { metric: 'pH', amazon: 80, mississippi: 70, danube: 82, nile: 55, yangtze: 60, ganges: 48 },
  { metric: 'Turbidity', amazon: 35, mississippi: 65, danube: 30, nile: 78, yangtze: 70, ganges: 82 },
  { metric: 'Nitrates', amazon: 25, mississippi: 75, danube: 40, nile: 60, yangtze: 68, ganges: 85 },
  { metric: 'Biodiversity', amazon: 92, mississippi: 45, danube: 65, nile: 35, yangtze: 40, ganges: 30 },
  { metric: 'Temp Stability', amazon: 85, mississippi: 55, danube: 60, nile: 70, yangtze: 50, ganges: 55 },
]

function getWatershedSize(area: number): string {
  if (area < 100000) return 'small'
  if (area < 500000) return 'medium'
  if (area < 2000000) return 'large'
  return 'major'
}

export function WatershedManagerPanel() {
  const watershedManager = useMapStore((s) => s.watershedManager)
  const setWatershedManager = useMapStore((s) => s.setWatershedManager)

  if (typeof window === 'undefined') return null
  if (!watershedManager.open) return null

  const watersheds =
    watershedManager.watersheds.length > 0 ? watershedManager.watersheds : DEMO_WATERSHEDS

  const filteredWatersheds = watersheds.filter((w) => {
    if (watershedManager.sizeFilter !== 'all') {
      const size = getWatershedSize(w.area)
      if (size !== watershedManager.sizeFilter) return false
    }
    if (watershedManager.qualityFilter !== 'all' && w.waterQuality !== watershedManager.qualityFilter) return false
    return true
  })

  const dischargeData = filteredWatersheds.map((w) => ({
    name: w.name.length > 12 ? w.name.substring(0, 12) + '…' : w.name,
    discharge: w.discharge,
  }))

  const overlayToggles = [
    { key: 'showBoundaries' as const, label: 'Boundaries', icon: Globe },
    { key: 'showFlowAccumulation' as const, label: 'Flow Accumulation', icon: Activity },
    { key: 'showDrainageNetwork' as const, label: 'Drainage Network', icon: Waves },
    { key: 'showWaterQuality' as const, label: 'Water Quality', icon: Droplets },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-teal-500" />
              Watershed Manager
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setWatershedManager({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Size & Quality filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Size</Label>
              <Select
                value={watershedManager.sizeFilter}
                onValueChange={(v) =>
                  setWatershedManager({
                    sizeFilter: v as typeof watershedManager.sizeFilter,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Quality</Label>
              <Select
                value={watershedManager.qualityFilter}
                onValueChange={(v) =>
                  setWatershedManager({
                    qualityFilter: v as typeof watershedManager.qualityFilter,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualities</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Overlay toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Overlays</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-teal-500" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {watershedManager[key] ? (
                    <Eye className="h-3 w-3 text-teal-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={watershedManager[key]}
                    onCheckedChange={(checked) =>
                      setWatershedManager({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Discharge bar chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Discharge by Watershed (m³/s)
            </Label>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dischargeData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={38}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(20,184,166,0.3)',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} m³/s`, 'Discharge']}
                  />
                  <Bar dataKey="discharge" radius={[4, 4, 0, 0]}>
                    {dischargeData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={['#14b8a6', '#0d9488', '#2dd4bf', '#0f766e', '#5eead4', '#99f6e4', '#0d9488'][i % 7]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Water quality radar chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Water Quality Metrics
            </Label>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={WATER_QUALITY_RADAR}>
                  <PolarGrid stroke="rgba(20,184,166,0.2)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 9 }}
                  />
                  <PolarRadiusAxis
                    tick={{ fontSize: 8 }}
                    domain={[0, 100]}
                    tickCount={4}
                  />
                  <Radar
                    name="Amazon"
                    dataKey="amazon"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                  />
                  <Radar
                    name="Danube"
                    dataKey="danube"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                  />
                  <Radar
                    name="Ganges"
                    dataKey="ganges"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(20,184,166,0.3)',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {[
                { name: 'Amazon', color: '#14b8a6' },
                { name: 'Danube', color: '#0d9488' },
                { name: 'Ganges', color: '#ef4444' },
              ].map(({ name, color }) => (
                <div key={name} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {name}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Watershed list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Watersheds ({filteredWatersheds.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredWatersheds.map((ws) => {
                  const isActive = watershedManager.activeWatershedId === ws.id
                  const qualityColor = QUALITY_COLORS[ws.waterQuality]
                  const size = getWatershedSize(ws.area)
                  return (
                    <div
                      key={ws.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setWatershedManager({
                          activeWatershedId: isActive ? null : ws.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{ws.name}</span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 capitalize"
                            style={{
                              borderColor: qualityColor,
                              color: qualityColor,
                            }}
                          >
                            {QUALITY_LABELS[ws.waterQuality]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 capitalize"
                          >
                            {size}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Area:{' '}
                          <span className="text-foreground">
                            {(ws.area / 1000000).toFixed(1)}M km²
                          </span>
                        </div>
                        <div>
                          Discharge:{' '}
                          <span className="text-foreground">
                            {ws.discharge.toLocaleString()} m³/s
                          </span>
                        </div>
                        <div>
                          Order:{' '}
                          <span className="text-foreground">
                            {ws.streamOrder}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Land Use: <span className="text-foreground">{ws.landUse}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
