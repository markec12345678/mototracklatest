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
import { useMapStore, type SoilErosionZone } from '@/lib/map-store'
import {
  X,
  Eye,
  EyeOff,
  Mountain,
  Droplets,
  Leaf,
  CloudRain,
  Filter,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const DEMO_ZONES: SoilErosionZone[] = [
  {
    id: 'se1',
    name: 'Loess Plateau',
    latitude: 36.0,
    longitude: 109.0,
    erosionRate: 15.2,
    sedimentYield: 5200,
    type: 'water',
    severity: 'severe',
    conservationPractice: 'Terracing',
  },
  {
    id: 'se2',
    name: 'Dust Bowl Region',
    latitude: 36.5,
    longitude: -100.5,
    erosionRate: 8.7,
    sedimentYield: 3100,
    type: 'wind',
    severity: 'high',
    conservationPractice: 'Shelterbelts',
  },
  {
    id: 'se3',
    name: 'Sahel Zone',
    latitude: 14.0,
    longitude: 10.0,
    erosionRate: 12.4,
    sedimentYield: 4600,
    type: 'wind',
    severity: 'severe',
    conservationPractice: 'Agroforestry',
  },
  {
    id: 'se4',
    name: 'Mediterranean Hills',
    latitude: 40.0,
    longitude: 22.0,
    erosionRate: 5.3,
    sedimentYield: 1800,
    type: 'water',
    severity: 'moderate',
    conservationPractice: 'Contour Farming',
  },
  {
    id: 'se5',
    name: 'Ethiopian Highlands',
    latitude: 9.0,
    longitude: 38.5,
    erosionRate: 18.6,
    sedimentYield: 6800,
    type: 'water',
    severity: 'severe',
    conservationPractice: 'Check Dams',
  },
  {
    id: 'se6',
    name: 'Madagascar',
    latitude: -19.5,
    longitude: 47.0,
    erosionRate: 9.8,
    sedimentYield: 3400,
    type: 'tillage',
    severity: 'high',
    conservationPractice: 'No-Till Farming',
  },
]

const SEVERITY_COLORS: Record<string, string> = {
  low: '#a3e635',
  moderate: '#facc15',
  high: '#f97316',
  severe: '#dc2626',
}

const SEVERITY_LABELS: Record<string, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  severe: 'Severe',
}

const TYPE_COLORS: Record<string, string> = {
  water: '#3b82f6',
  wind: '#f59e0b',
  tillage: '#8b5cf6',
}

const TYPE_LABELS: Record<string, string> = {
  water: 'Water',
  wind: 'Wind',
  tillage: 'Tillage',
}

const EROSION_TYPE_DATA = [
  { name: 'Water', value: 58, fill: '#3b82f6' },
  { name: 'Wind', value: 28, fill: '#f59e0b' },
  { name: 'Tillage', value: 14, fill: '#8b5cf6' },
]

export function SoilErosionMonitor() {
  const soilErosion = useMapStore((s) => s.soilErosion)
  const setSoilErosion = useMapStore((s) => s.setSoilErosion)

  if (typeof window === 'undefined') return null
  if (!soilErosion.open) return null

  const zones =
    soilErosion.zones.length > 0 ? soilErosion.zones : DEMO_ZONES

  const filteredZones = zones.filter((z) => {
    if (soilErosion.erosionType !== 'all' && z.type !== soilErosion.erosionType) return false
    if (soilErosion.severityFilter !== 'all' && z.severity !== soilErosion.severityFilter) return false
    return true
  })

  const erosionRateData = filteredZones.map((z) => ({
    name: z.name.length > 14 ? z.name.substring(0, 14) + '…' : z.name,
    rate: z.erosionRate,
  }))

  const overlayToggles = [
    { key: 'showErosionRisk' as const, label: 'Erosion Risk', icon: Mountain },
    { key: 'showSedimentYield' as const, label: 'Sediment Yield', icon: Droplets },
    { key: 'showConservation' as const, label: 'Conservation', icon: Leaf },
    { key: 'showRainfallIntensity' as const, label: 'Rainfall', icon: CloudRain },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mountain className="h-4 w-4 text-amber-600" />
              Soil Erosion Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSoilErosion({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Erosion Type & Severity filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Erosion Type</Label>
              <Select
                value={soilErosion.erosionType}
                onValueChange={(v) =>
                  setSoilErosion({
                    erosionType: v as typeof soilErosion.erosionType,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="wind">Wind</SelectItem>
                  <SelectItem value="tillage">Tillage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Severity</Label>
              <Select
                value={soilErosion.severityFilter}
                onValueChange={(v) =>
                  setSoilErosion({
                    severityFilter: v as typeof soilErosion.severityFilter,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-600" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {soilErosion[key] ? (
                    <Eye className="h-3 w-3 text-amber-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={soilErosion[key]}
                    onCheckedChange={(checked) =>
                      setSoilErosion({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Erosion rates bar chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Erosion Rate (t/ha/yr)
            </Label>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={erosionRateData}>
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
                    width={28}
                    unit="t"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(217,119,6,0.3)',
                    }}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {erosionRateData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={['#d97706', '#f59e0b', '#b45309', '#92400e', '#78350f', '#a16207'][i % 6]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Erosion type pie chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Erosion Type Distribution
            </Label>
            <div className="h-[150px] w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={EROSION_TYPE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {EROSION_TYPE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(217,119,6,0.3)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Erosion zone list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Erosion Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = soilErosion.activeZoneId === zone.id
                  const severityColor = SEVERITY_COLORS[zone.severity]
                  const typeColor = TYPE_COLORS[zone.type]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setSoilErosion({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{zone.name}</span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{
                              borderColor: typeColor,
                              color: typeColor,
                            }}
                          >
                            {TYPE_LABELS[zone.type]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{
                              borderColor: severityColor,
                              color: severityColor,
                            }}
                          >
                            {SEVERITY_LABELS[zone.severity]}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Rate:{' '}
                          <span className="text-foreground">
                            {zone.erosionRate} t/ha/yr
                          </span>
                        </div>
                        <div>
                          Sediment:{' '}
                          <span className="text-foreground">
                            {zone.sedimentYield.toLocaleString()} t/yr
                          </span>
                        </div>
                        <div>
                          Practice:{' '}
                          <span className="text-foreground">
                            {zone.conservationPractice}
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
