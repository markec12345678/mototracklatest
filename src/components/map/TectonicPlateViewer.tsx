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
import { useMapStore, type TectonicPlate } from '@/lib/map-store'
import {
  X,
  Eye,
  EyeOff,
  Globe,
  CircleDot,
  Zap,
  ArrowRight,
  Mountain,
} from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts'

const DEMO_PLATES: TectonicPlate[] = [
  {
    id: 'tp1',
    name: 'Pacific Plate',
    centerLat: -5.0,
    centerLng: -170.0,
    movementRate: 7.5,
    direction: 310,
    boundaryType: 'convergent',
    earthquakeCount: 4280,
  },
  {
    id: 'tp2',
    name: 'North American',
    centerLat: 50.0,
    centerLng: -100.0,
    movementRate: 2.3,
    direction: 270,
    boundaryType: 'divergent',
    earthquakeCount: 1560,
  },
  {
    id: 'tp3',
    name: 'Eurasian',
    centerLat: 50.0,
    centerLng: 60.0,
    movementRate: 2.1,
    direction: 180,
    boundaryType: 'convergent',
    earthquakeCount: 1890,
  },
  {
    id: 'tp4',
    name: 'African',
    centerLat: 5.0,
    centerLng: 25.0,
    movementRate: 2.15,
    direction: 30,
    boundaryType: 'divergent',
    earthquakeCount: 680,
  },
  {
    id: 'tp5',
    name: 'Indo-Australian',
    centerLat: -25.0,
    centerLng: 105.0,
    movementRate: 5.8,
    direction: 15,
    boundaryType: 'convergent',
    earthquakeCount: 2750,
  },
  {
    id: 'tp6',
    name: 'Antarctic',
    centerLat: -80.0,
    centerLng: 0.0,
    movementRate: 1.7,
    direction: 180,
    boundaryType: 'divergent',
    earthquakeCount: 320,
  },
  {
    id: 'tp7',
    name: 'Nazca',
    centerLat: -15.0,
    centerLng: -85.0,
    movementRate: 6.2,
    direction: 85,
    boundaryType: 'convergent',
    earthquakeCount: 1120,
  },
  {
    id: 'tp8',
    name: 'Philippine',
    centerLat: 15.0,
    centerLng: 130.0,
    movementRate: 4.5,
    direction: 305,
    boundaryType: 'transform',
    earthquakeCount: 960,
  },
]

const EARTHQUAKE_SCATTER_DATA = [
  { name: 'Pacific', depth: 35, magnitude: 7.8, plate: 'tp1' },
  { name: 'Pacific', depth: 120, magnitude: 6.5, plate: 'tp1' },
  { name: 'Pacific', depth: 450, magnitude: 8.2, plate: 'tp1' },
  { name: 'Pacific', depth: 15, magnitude: 5.8, plate: 'tp1' },
  { name: 'N. American', depth: 8, magnitude: 6.2, plate: 'tp2' },
  { name: 'N. American', depth: 25, magnitude: 5.5, plate: 'tp2' },
  { name: 'Eurasian', depth: 60, magnitude: 7.1, plate: 'tp3' },
  { name: 'Eurasian', depth: 180, magnitude: 6.8, plate: 'tp3' },
  { name: 'African', depth: 12, magnitude: 5.2, plate: 'tp4' },
  { name: 'Indo-Australian', depth: 30, magnitude: 7.5, plate: 'tp5' },
  { name: 'Indo-Australian', depth: 200, magnitude: 6.9, plate: 'tp5' },
  { name: 'Indo-Australian', depth: 540, magnitude: 7.2, plate: 'tp5' },
  { name: 'Antarctic', depth: 18, magnitude: 4.8, plate: 'tp6' },
  { name: 'Nazca', depth: 95, magnitude: 7.4, plate: 'tp7' },
  { name: 'Nazca', depth: 350, magnitude: 6.7, plate: 'tp7' },
  { name: 'Philippine', depth: 45, magnitude: 6.9, plate: 'tp8' },
  { name: 'Philippine', depth: 280, magnitude: 6.1, plate: 'tp8' },
  { name: 'Pacific', depth: 600, magnitude: 5.9, plate: 'tp1' },
  { name: 'Eurasian', depth: 380, magnitude: 6.3, plate: 'tp3' },
  { name: 'N. American', depth: 150, magnitude: 5.8, plate: 'tp2' },
]

const BOUNDARY_COLORS: Record<string, string> = {
  convergent: '#ef4444',
  divergent: '#f97316',
  transform: '#eab308',
}

const BOUNDARY_LABELS: Record<string, string> = {
  convergent: 'Convergent',
  divergent: 'Divergent',
  transform: 'Transform',
}

const TIME_RANGE_LABELS: Record<string, string> = {
  recent: 'Recent (30 days)',
  historical: 'Historical (1 year)',
  all: 'All Time',
}

const SCATTER_COLORS: Record<string, string> = {
  tp1: '#ef4444',
  tp2: '#f97316',
  tp3: '#eab308',
  tp4: '#22c55e',
  tp5: '#3b82f6',
  tp6: '#a855f7',
  tp7: '#ec4899',
  tp8: '#14b8a6',
}

export function TectonicPlateViewer() {
  const tectonicPlate = useMapStore((s) => s.tectonicPlate)
  const setTectonicPlate = useMapStore((s) => s.setTectonicPlate)

  if (typeof window === 'undefined') return null
  if (!tectonicPlate.open) return null

  const plates =
    tectonicPlate.plates.length > 0 ? tectonicPlate.plates : DEMO_PLATES

  const filteredPlates = plates.filter((p) => {
    if (tectonicPlate.boundaryType !== 'all' && p.boundaryType !== tectonicPlate.boundaryType) return false
    return true
  })

  const eqCountData = filteredPlates.map((p) => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + '…' : p.name,
    count: p.earthquakeCount,
    boundary: p.boundaryType,
  }))

  const filteredScatterData = EARTHQUAKE_SCATTER_DATA.filter((d) => {
    if (tectonicPlate.boundaryType !== 'all') {
      const plate = plates.find((p) => p.id === d.plate)
      if (plate && plate.boundaryType !== tectonicPlate.boundaryType) return false
    }
    return true
  })

  const overlayToggles = [
    { key: 'showPlateBoundaries' as const, label: 'Plate Boundaries', icon: Globe },
    { key: 'showFaultLines' as const, label: 'Fault Lines', icon: Zap },
    { key: 'showEpicenters' as const, label: 'Epicenters', icon: CircleDot },
    { key: 'showMovementVectors' as const, label: 'Movement Vectors', icon: ArrowRight },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-orange-500" />
              Tectonic Plate Viewer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setTectonicPlate({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Boundary Type & Time Range filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Boundary Type</Label>
              <Select
                value={tectonicPlate.boundaryType}
                onValueChange={(v) =>
                  setTectonicPlate({
                    boundaryType: v as typeof tectonicPlate.boundaryType,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="convergent">Convergent</SelectItem>
                  <SelectItem value="divergent">Divergent</SelectItem>
                  <SelectItem value="transform">Transform</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Time Range</Label>
              <Select
                value={tectonicPlate.timeRange}
                onValueChange={(v) =>
                  setTectonicPlate({
                    timeRange: v as typeof tectonicPlate.timeRange,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent (30 days)</SelectItem>
                  <SelectItem value="historical">Historical (1 year)</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
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
                  <Icon className="h-3 w-3 text-orange-500" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {tectonicPlate[key] ? (
                    <Eye className="h-3 w-3 text-orange-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={tectonicPlate[key]}
                    onCheckedChange={(checked) =>
                      setTectonicPlate({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Earthquake depth vs magnitude scatter chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Earthquake Depth vs Magnitude
            </Label>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(249,115,22,0.1)" />
                  <XAxis
                    dataKey="depth"
                    type="number"
                    name="Depth"
                    unit=" km"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Depth (km)', position: 'insideBottom', offset: -2, fontSize: 9 }}
                  />
                  <YAxis
                    dataKey="magnitude"
                    type="number"
                    name="Magnitude"
                    domain={[4, 9]}
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(249,115,22,0.3)',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Depth') return [`${value} km`, name]
                      return [value, name]
                    }}
                  />
                  <Scatter data={filteredScatterData} fill="#f97316">
                    {filteredScatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SCATTER_COLORS[entry.plate] || '#f97316'}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Earthquake count by plate bar chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Earthquake Count by Plate
            </Label>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eqCountData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 8 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(249,115,22,0.3)',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {eqCountData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={BOUNDARY_COLORS[entry.boundary] || '#f97316'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {Object.entries(BOUNDARY_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: BOUNDARY_COLORS[key] }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Plate list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Tectonic Plates ({filteredPlates.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredPlates.map((plate) => {
                  const isActive = tectonicPlate.activePlateId === plate.id
                  const boundaryColor = BOUNDARY_COLORS[plate.boundaryType]
                  return (
                    <div
                      key={plate.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setTectonicPlate({
                          activePlateId: isActive ? null : plate.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{plate.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: boundaryColor,
                            color: boundaryColor,
                          }}
                        >
                          {BOUNDARY_LABELS[plate.boundaryType]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Rate:{' '}
                          <span className="text-foreground">
                            {plate.movementRate} cm/yr
                          </span>
                        </div>
                        <div>
                          Dir:{' '}
                          <span className="text-foreground">
                            {plate.direction}°
                          </span>
                        </div>
                        <div>
                          Quakes:{' '}
                          <span className="text-foreground">
                            {plate.earthquakeCount.toLocaleString()}
                          </span>
                        </div>
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
