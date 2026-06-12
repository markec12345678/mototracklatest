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
import { useMapStore, type DroughtRegion } from '@/lib/map-store'
import {
  X,
  Sun,
  Eye,
  EyeOff,
  Droplets,
  TrendingDown,
  Flame,
  BarChart3,
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

const DEMO_REGIONS: DroughtRegion[] = [
  {
    id: 'dr1',
    name: 'Horn of Africa',
    latitude: 8.0,
    longitude: 42.0,
    droughtLevel: 'd4',
    soilMoisture: 12,
    precipitationDeficit: -420,
    cropImpact: 92,
  },
  {
    id: 'dr2',
    name: 'Central US',
    latitude: 38.0,
    longitude: -98.0,
    droughtLevel: 'd2',
    soilMoisture: 35,
    precipitationDeficit: -180,
    cropImpact: 55,
  },
  {
    id: 'dr3',
    name: 'Iberian Peninsula',
    latitude: 40.0,
    longitude: -4.0,
    droughtLevel: 'd3',
    soilMoisture: 22,
    precipitationDeficit: -310,
    cropImpact: 72,
  },
  {
    id: 'dr4',
    name: 'Murray-Darling',
    latitude: -34.0,
    longitude: 144.0,
    droughtLevel: 'd2',
    soilMoisture: 28,
    precipitationDeficit: -240,
    cropImpact: 61,
  },
  {
    id: 'dr5',
    name: 'Sahel',
    latitude: 14.0,
    longitude: 5.0,
    droughtLevel: 'd3',
    soilMoisture: 18,
    precipitationDeficit: -350,
    cropImpact: 78,
  },
  {
    id: 'dr6',
    name: 'Northern China',
    latitude: 38.0,
    longitude: 112.0,
    droughtLevel: 'd1',
    soilMoisture: 42,
    precipitationDeficit: -120,
    cropImpact: 38,
  },
]

const DROUGHT_INDEX_TRENDS = [
  { month: 'Jan', spi: 0.3, spei: -0.2, pdsi: -1.1, eddi: 0.8 },
  { month: 'Feb', spi: -0.4, spei: -0.8, pdsi: -1.5, eddi: 0.5 },
  { month: 'Mar', spi: -1.1, spei: -1.4, pdsi: -2.0, eddi: -0.1 },
  { month: 'Apr', spi: -1.8, spei: -2.0, pdsi: -2.8, eddi: -0.7 },
  { month: 'May', spi: -2.2, spei: -2.4, pdsi: -3.2, eddi: -1.2 },
  { month: 'Jun', spi: -1.9, spei: -2.1, pdsi: -3.0, eddi: -1.5 },
  { month: 'Jul', spi: -1.3, spei: -1.6, pdsi: -2.5, eddi: -1.0 },
  { month: 'Aug', spi: -0.8, spei: -1.1, pdsi: -2.0, eddi: -0.6 },
  { month: 'Sep', spi: -0.3, spei: -0.6, pdsi: -1.5, eddi: -0.2 },
  { month: 'Oct', spi: 0.2, spei: -0.1, pdsi: -1.0, eddi: 0.3 },
  { month: 'Nov', spi: 0.6, spei: 0.3, pdsi: -0.5, eddi: 0.7 },
  { month: 'Dec', spi: 0.9, spei: 0.6, pdsi: -0.2, eddi: 1.0 },
]

const CROP_IMPACT_DATA = DEMO_REGIONS.map((r) => ({
  name: r.name.length > 12 ? r.name.substring(0, 12) + '…' : r.name,
  impact: r.cropImpact,
}))

const DROUGHT_COLORS: Record<string, string> = {
  none: '#a3e635',
  d0: '#facc15',
  d1: '#fb923c',
  d2: '#f97316',
  d3: '#ef4444',
  d4: '#991b1b',
}

const DROUGHT_LABELS: Record<string, string> = {
  none: 'None',
  d0: 'D0 Abnormal',
  d1: 'D1 Moderate',
  d2: 'D2 Severe',
  d3: 'D3 Extreme',
  d4: 'D4 Exceptional',
}

const INDEX_COLORS: Record<string, string> = {
  spi: '#f59e0b',
  spei: '#d97706',
  pdsi: '#92400e',
  eddi: '#78350f',
}

const INDEX_LABELS: Record<string, string> = {
  spi: 'SPI',
  spei: 'SPEI',
  pdsi: 'PDSI',
  eddi: 'EDDI',
}

const TIMESCALE_LABELS: Record<string, string> = {
  '1m': '1 Month',
  '3m': '3 Months',
  '6m': '6 Months',
  '12m': '12 Months',
  '24m': '24 Months',
}

export function DroughtMonitorPanel() {
  const droughtMonitor = useMapStore((s) => s.droughtMonitor)
  const setDroughtMonitor = useMapStore((s) => s.setDroughtMonitor)

  if (typeof window === 'undefined') return null
  if (!droughtMonitor.open) return null

  const regions =
    droughtMonitor.regions.length > 0 ? droughtMonitor.regions : DEMO_REGIONS
  const currentIndex = droughtMonitor.index

  const overlayToggles = [
    { key: 'showDroughtZones' as const, label: 'Drought Zones', icon: Sun },
    { key: 'showSoilMoisture' as const, label: 'Soil Moisture', icon: Droplets },
    { key: 'showPrecipitationDeficit' as const, label: 'Precip. Deficit', icon: TrendingDown },
    { key: 'showCropImpact' as const, label: 'Crop Impact', icon: BarChart3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Drought Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setDroughtMonitor({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Index & Time Scale selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Drought Index</Label>
              <Select
                value={currentIndex}
                onValueChange={(v) =>
                  setDroughtMonitor({ index: v as DroughtMonitorPanel['index'] })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spi">SPI</SelectItem>
                  <SelectItem value="spei">SPEI</SelectItem>
                  <SelectItem value="pdsi">PDSI</SelectItem>
                  <SelectItem value="eddi">EDDI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Time Scale</Label>
              <Select
                value={droughtMonitor.timeScale}
                onValueChange={(v) =>
                  setDroughtMonitor({ timeScale: v as DroughtMonitorPanel['timeScale'] })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="12m">12 Months</SelectItem>
                  <SelectItem value="24m">24 Months</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-500" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {droughtMonitor[key] ? (
                    <Eye className="h-3 w-3 text-amber-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={droughtMonitor[key]}
                    onCheckedChange={(checked) =>
                      setDroughtMonitor({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Drought index trends chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {INDEX_LABELS[currentIndex]} Trend — {TIMESCALE_LABELS[droughtMonitor.timeScale]}
            </Label>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DROUGHT_INDEX_TRENDS}>
                  <defs>
                    <linearGradient id="droughtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={INDEX_COLORS[currentIndex]}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={INDEX_COLORS[currentIndex]}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(245,158,11,0.3)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={currentIndex}
                    stroke={INDEX_COLORS[currentIndex]}
                    fill="url(#droughtGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crop impact bar chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Crop Impact by Region</Label>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CROP_IMPACT_DATA}>
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
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(245,158,11,0.3)',
                    }}
                  />
                  <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
                    {CROP_IMPACT_DATA.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#a16207'][i]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Drought regions list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Drought Regions</Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {regions.map((region) => {
                  const isActive = droughtMonitor.activeRegionId === region.id
                  const levelColor = DROUGHT_COLORS[region.droughtLevel]
                  return (
                    <div
                      key={region.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setDroughtMonitor({
                          activeRegionId: isActive ? null : region.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{region.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: levelColor,
                            color: levelColor,
                          }}
                        >
                          {DROUGHT_LABELS[region.droughtLevel]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Soil:{' '}
                          <span className="text-foreground">{region.soilMoisture}%</span>
                        </div>
                        <div>
                          Precip:{' '}
                          <span className="text-foreground">
                            {region.precipitationDeficit}mm
                          </span>
                        </div>
                        <div>
                          Crop:{' '}
                          <span className="text-foreground">{region.cropImpact}/100</span>
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

type DroughtMonitorPanel = ReturnType<typeof useMapStore.getState>['droughtMonitor']
