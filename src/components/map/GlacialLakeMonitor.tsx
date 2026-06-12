'use client'

import { useMemo } from 'react'
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
import { useMapStore, type GlacialLake } from '@/lib/map-store'
import {
  X,
  Eye,
  EyeOff,
  Waves,
  Mountain,
  AlertTriangle,
  Filter,
  RefreshCw,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type GlacialLakeState = ReturnType<typeof useMapStore.getState>['glacialLake']

const DEMO_LAKES: GlacialLake[] = [
  {
    id: 'gl1',
    name: 'Imja Tsho',
    latitude: 27.9,
    longitude: 86.93,
    area: 1.28,
    depth: 150,
    damType: 'moraine',
    glofRisk: 'high',
    expansionRate: 0.042,
  },
  {
    id: 'gl2',
    name: 'Tsho Rolpa',
    latitude: 27.85,
    longitude: 86.48,
    area: 1.76,
    depth: 130,
    damType: 'moraine',
    glofRisk: 'very_high',
    expansionRate: 0.058,
  },
  {
    id: 'gl3',
    name: 'Lake Palcacocha',
    latitude: -9.4,
    longitude: -77.38,
    area: 0.51,
    depth: 72,
    damType: 'moraine',
    glofRisk: 'high',
    expansionRate: 0.032,
  },
  {
    id: 'gl4',
    name: 'Greenland Ice Lake A',
    latitude: 68.7,
    longitude: -48.3,
    area: 3.45,
    depth: 200,
    damType: 'ice',
    glofRisk: 'medium',
    expansionRate: 0.095,
  },
  {
    id: 'gl5',
    name: 'Greenland Ice Lake B',
    latitude: 71.2,
    longitude: -25.6,
    area: 2.18,
    depth: 165,
    damType: 'ice',
    glofRisk: 'medium',
    expansionRate: 0.072,
  },
  {
    id: 'gl6',
    name: 'Alpine Lake Merjbelen',
    latitude: 46.53,
    longitude: 7.92,
    area: 0.22,
    depth: 40,
    damType: 'bedrock',
    glofRisk: 'low',
    expansionRate: 0.008,
  },
  {
    id: 'gl7',
    name: 'Grímsvötn',
    latitude: 64.42,
    longitude: -17.33,
    area: 8.5,
    depth: 250,
    damType: 'ice',
    glofRisk: 'high',
    expansionRate: 0.12,
  },
  {
    id: 'gl8',
    name: 'Skaftá Cauldron',
    latitude: 64.07,
    longitude: -18.0,
    area: 1.5,
    depth: 120,
    damType: 'ice',
    glofRisk: 'medium',
    expansionRate: 0.035,
  },
]

const GLOF_COLORS: Record<string, string> = {
  low: '#22d3ee',
  medium: '#06b6d4',
  high: '#f97316',
  very_high: '#ef4444',
}

const GLOF_LABELS: Record<string, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  very_high: 'Very High Risk',
}

const DAM_LABELS: Record<string, string> = {
  moraine: 'Moraine',
  ice: 'Ice',
  bedrock: 'Bedrock',
}

const REGION_LABELS: Record<string, string> = {
  all: 'All Regions',
  himalaya: 'Himalaya',
  andes: 'Andes',
  alps: 'Alps',
  rockies: 'Rockies',
  iceland: 'Iceland',
}

const LAKE_REGIONS: Record<string, string> = {
  gl1: 'himalaya',
  gl2: 'himalaya',
  gl3: 'andes',
  gl4: 'rockies',
  gl5: 'rockies',
  gl6: 'alps',
  gl7: 'iceland',
  gl8: 'iceland',
}

const EXPANSION_DATA = [
  { year: '2000', imjaTsho: 0.78, tshoRolpa: 1.1, palcacocha: 0.28, greenland: 1.8, alpine: 0.19, grimsvo: 5.2 },
  { year: '2004', imjaTsho: 0.85, tshoRolpa: 1.2, palcacocha: 0.32, greenland: 2.1, alpine: 0.20, grimsvo: 5.8 },
  { year: '2008', imjaTsho: 0.95, tshoRolpa: 1.35, palcacocha: 0.38, greenland: 2.5, alpine: 0.21, grimsvo: 6.5 },
  { year: '2012', imjaTsho: 1.05, tshoRolpa: 1.5, palcacocha: 0.42, greenland: 2.8, alpine: 0.21, grimsvo: 7.2 },
  { year: '2016', imjaTsho: 1.15, tshoRolpa: 1.62, palcacocha: 0.47, greenland: 3.1, alpine: 0.22, grimsvo: 7.8 },
  { year: '2020', imjaTsho: 1.22, tshoRolpa: 1.72, palcacocha: 0.50, greenland: 3.3, alpine: 0.22, grimsvo: 8.3 },
  { year: '2024', imjaTsho: 1.28, tshoRolpa: 1.76, palcacocha: 0.51, greenland: 3.45, alpine: 0.22, grimsvo: 8.5 },
]

const AREA_LINE_COLORS = ['#06b6d4', '#0891b2', '#22d3ee', '#67e8f9', '#a5f3fc', '#0e7490']
const AREA_LEGEND_NAMES = ['Imja Tsho', 'Tsho Rolpa', 'Palcacocha', 'Greenland', 'Alpine', 'Grímsvötn']

export function GlacialLakeMonitor() {
  const glacialLake = useMapStore((s) => s.glacialLake)
  const setGlacialLake = useMapStore((s) => s.setGlacialLake)

  if (typeof window === 'undefined') return null
  if (!glacialLake.open) return null

  const lakes = glacialLake.lakes.length > 0 ? glacialLake.lakes : DEMO_LAKES

  // Filter by risk and region
  const filteredLakes = lakes.filter((lake) => {
    if (glacialLake.riskLevel !== 'all' && lake.glofRisk !== glacialLake.riskLevel) return false
    if (glacialLake.region !== 'all') {
      const lakeRegion = LAKE_REGIONS[lake.id]
      if (lakeRegion !== glacialLake.region) return false
    }
    return true
  })

  const expansionRateData = filteredLakes.map((lake) => ({
    name: lake.name.length > 14 ? lake.name.substring(0, 14) + '…' : lake.name,
    rate: lake.expansionRate,
    risk: lake.glofRisk,
  }))

  const overlayToggles: { key: keyof GlacialLakeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showLakeExtent', label: 'Lake Extent', icon: Waves },
    { key: 'showGLOFRisk', label: 'GLOF Risk', icon: AlertTriangle },
    { key: 'showDamType', label: 'Dam Type', icon: Mountain },
    { key: 'showMonitoring', label: 'Monitoring', icon: RefreshCw },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mountain className="h-4 w-4 text-cyan-500" />
              Glacial Lake Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGlacialLake({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Risk & Region filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">GLOF Risk</Label>
              <Select
                value={glacialLake.riskLevel}
                onValueChange={(v) =>
                  setGlacialLake({
                    riskLevel: v as GlacialLakeState['riskLevel'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very_high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Region</Label>
              <Select
                value={glacialLake.region}
                onValueChange={(v) =>
                  setGlacialLake({
                    region: v as GlacialLakeState['region'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="himalaya">Himalaya</SelectItem>
                  <SelectItem value="andes">Andes</SelectItem>
                  <SelectItem value="alps">Alps</SelectItem>
                  <SelectItem value="rockies">Rockies</SelectItem>
                  <SelectItem value="iceland">Iceland</SelectItem>
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
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {glacialLake[key] ? (
                    <Eye className="h-3 w-3 text-cyan-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={glacialLake[key] as boolean}
                    onCheckedChange={(checked) =>
                      setGlacialLake({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Lake Expansion Area Chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Lake Expansion Over Time (km²)
            </Label>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={EXPANSION_DATA}>
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    unit=" km²"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(6,182,212,0.3)',
                    }}
                  />
                  {['imjaTsho', 'tshoRolpa', 'palcacocha', 'greenland', 'alpine', 'grimsvo'].map(
                    (key, i) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={AREA_LINE_COLORS[i]}
                        fill={AREA_LINE_COLORS[i]}
                        fillOpacity={0.1}
                        strokeWidth={1.5}
                      />
                    )
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {AREA_LEGEND_NAMES.map((name, i) => (
                <div key={name} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: AREA_LINE_COLORS[i] }}
                  />
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* Expansion Rate Bar Chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Expansion Rate (km²/year)
            </Label>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expansionRateData} layout="vertical">
                  <XAxis
                    type="number"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(6,182,212,0.3)',
                    }}
                  />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                    {expansionRateData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={GLOF_COLORS[entry.risk]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Lake list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Glacial Lakes ({filteredLakes.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredLakes.map((lake) => {
                  const isActive = glacialLake.activeLakeId === lake.id
                  const riskColor = GLOF_COLORS[lake.glofRisk]
                  return (
                    <div
                      key={lake.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setGlacialLake({
                          activeLakeId: isActive ? null : lake.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{lake.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: riskColor,
                            color: riskColor,
                          }}
                        >
                          {GLOF_LABELS[lake.glofRisk]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Area:{' '}
                          <span className="text-foreground">{lake.area} km²</span>
                        </div>
                        <div>
                          Depth:{' '}
                          <span className="text-foreground">{lake.depth} m</span>
                        </div>
                        <div>
                          Dam:{' '}
                          <span className="text-foreground">{DAM_LABELS[lake.damType]}</span>
                        </div>
                        <div className="col-span-3">
                          Expansion:{' '}
                          <span className="text-foreground">{lake.expansionRate} km²/yr</span>
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
