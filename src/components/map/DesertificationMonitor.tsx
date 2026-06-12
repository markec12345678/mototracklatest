'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type DesertZone, type DesertificationState } from '@/lib/map-store'
import {
  Sun,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Layers,
  TrendingDown,
  BarChart3,
  Filter,
  MapPin,
  AlertTriangle,
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

// Demo desert zones
const DEMO_ZONES: DesertZone[] = [
  {
    id: 'dz1',
    name: 'Sahara Desert',
    latitude: 23.42,
    longitude: 25.66,
    area: 9200000,
    severity: 'extreme',
    expansionRate: 48,
    vegetationIndex: 0.08,
    droughtIndex: 0.92,
  },
  {
    id: 'dz2',
    name: 'Gobi Desert',
    latitude: 42.59,
    longitude: 105.0,
    area: 1295000,
    severity: 'high',
    expansionRate: 36,
    vegetationIndex: 0.15,
    droughtIndex: 0.78,
  },
  {
    id: 'dz3',
    name: 'Kalahari Desert',
    latitude: -23.0,
    longitude: 22.0,
    area: 930000,
    severity: 'moderate',
    expansionRate: 22,
    vegetationIndex: 0.28,
    droughtIndex: 0.61,
  },
  {
    id: 'dz4',
    name: 'Thar Desert',
    latitude: 27.0,
    longitude: 71.0,
    area: 200000,
    severity: 'high',
    expansionRate: 31,
    vegetationIndex: 0.12,
    droughtIndex: 0.85,
  },
  {
    id: 'dz5',
    name: 'Arabian Desert',
    latitude: 22.0,
    longitude: 45.0,
    area: 2330000,
    severity: 'extreme',
    expansionRate: 42,
    vegetationIndex: 0.05,
    droughtIndex: 0.95,
  },
]

const SEVERITY_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  low: { bg: 'bg-green-500/10', color: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  moderate: { bg: 'bg-yellow-500/10', color: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  high: { bg: 'bg-orange-500/10', color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  extreme: { bg: 'bg-red-500/10', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  extreme: '#ef4444',
}

export function DesertificationMonitor() {
  const desertification = useMapStore((s) => s.desertification)
  const setDesertification = useMapStore((s) => s.setDesertification)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const zones = desertification.zones.length > 0 ? desertification.zones : DEMO_ZONES

  const filteredZones = desertification.severityFilter === 'all'
    ? zones
    : zones.filter(z => z.severity === desertification.severityFilter)

  // Vegetation index decline chart data (NDVI over years)
  const vegetationChartData = useMemo(() => {
    const baseYear = desertification.timelineYear - 9
    return Array.from({ length: 10 }, (_, i) => {
      const year = baseYear + i
      const decline = (year - 2000) * 0.005 + Math.sin(year * 0.3) * 0.02
      return {
        year,
        sahara: Math.max(0.02, 0.15 - decline * 1.5),
        gobi: Math.max(0.04, 0.25 - decline * 1.1),
        kalahari: Math.max(0.08, 0.40 - decline * 0.8),
      }
    })
  }, [desertification.timelineYear])

  // Expansion rate by zone bar chart
  const expansionChartData = useMemo(() => {
    return filteredZones.map(z => ({
      name: z.name.replace(' Desert', '').length > 10 ? z.name.replace(' Desert', '').slice(0, 8) + '…' : z.name.replace(' Desert', ''),
      rate: z.expansionRate,
      color: SEVERITY_COLORS[z.severity],
    }))
  }, [filteredZones])

  if (typeof window === 'undefined') return null
  if (!desertification.open) return null

  const overlayToggles: { key: keyof DesertificationState; label: string; checked: boolean }[] = [
    { key: 'showDesertExpansion', label: 'Desert Expansion', checked: desertification.showDesertExpansion },
    { key: 'showVegetationLoss', label: 'Vegetation Loss', checked: desertification.showVegetationLoss },
    { key: 'showSandDunes', label: 'Sand Dunes', checked: desertification.showSandDunes },
    { key: 'showDroughtIndex', label: 'Drought Index', checked: desertification.showDroughtIndex },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25 }}
        className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                Desertification Monitor
                <Badge variant="outline" className="text-[10px] font-normal">
                  {filteredZones.length} zones
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setDesertification({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Timeline Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Timeline Year
                  </Label>
                  <span className="text-xs font-semibold tabular-nums">{desertification.timelineYear}</span>
                </div>
                <Slider
                  value={[desertification.timelineYear]}
                  onValueChange={([v]) => setDesertification({ timelineYear: v })}
                  min={2000}
                  max={2050}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>2000</span>
                  <span>2025</span>
                  <span>2050</span>
                </div>
              </div>

              <Separator />

              {/* Severity Filter */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Severity
                </Label>
                <Select
                  value={desertification.severityFilter}
                  onValueChange={(v) => setDesertification({ severityFilter: v as DesertificationState['severityFilter'] })}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Overlay Toggles */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Map Overlays
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {overlayToggles.map(toggle => (
                    <div key={toggle.key} className="flex items-center gap-2">
                      <Switch
                        checked={toggle.checked}
                        onCheckedChange={(v) => setDesertification({ [toggle.key]: v })}
                      />
                      <span className="text-xs">{toggle.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Vegetation Index Decline Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Vegetation Index (NDVI)
                </Label>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={vegetationChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 0.5]} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [value.toFixed(3), '']}
                    />
                    <Area type="monotone" dataKey="sahara" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={1.5} name="Sahara" />
                    <Area type="monotone" dataKey="gobi" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={1.5} name="Gobi" />
                    <Area type="monotone" dataKey="kalahari" stroke="#eab308" fill="#eab308" fillOpacity={0.15} strokeWidth={1.5} name="Kalahari" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Sahara</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Gobi</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Kalahari</div>
                </div>
              </div>

              {/* Expansion Rate Bar Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> Expansion Rate (km²/yr)
                </Label>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={expansionChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value} km²/yr`, 'Expansion']}
                    />
                    <Bar dataKey="rate" radius={[3, 3, 0, 0]}>
                      {expansionChartData.map((entry, index) => (
                        <Cell key={`exp-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Separator />

              {/* Zone List */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Desert Zones</Label>
                {filteredZones.map(zone => {
                  const style = SEVERITY_STYLES[zone.severity]
                  const isExpanded = expandedId === zone.id
                  return (
                    <div
                      key={zone.id}
                      className="rounded-lg border border-border/50 p-2.5 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : zone.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[150px]">{zone.name}</span>
                          <Badge className={`${style.bg} ${style.color} border-0 text-[9px] px-1.5 py-0 capitalize`}>
                            {zone.severity}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      {!isExpanded && (
                        <div className="flex items-center gap-3 mt-1.5 text-[9px] text-muted-foreground ml-5.5">
                          <span>NDVI: {zone.vegetationIndex.toFixed(2)}</span>
                          <span>Rate: {zone.expansionRate} km²/yr</span>
                        </div>
                      )}
                      {isExpanded && (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Area</span>
                            <span className="font-medium">{(zone.area / 1000).toFixed(0)}k km²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vegetation Index</span>
                            <span className="font-medium">{zone.vegetationIndex.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expansion Rate</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">{zone.expansionRate} km²/yr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Drought Index</span>
                            <span className="font-medium text-red-600 dark:text-red-400">{zone.droughtIndex.toFixed(2)}</span>
                          </div>
                          <div className="col-span-2 flex justify-between">
                            <span className="text-muted-foreground">Coordinates</span>
                            <span className="font-medium">{zone.latitude.toFixed(2)}°, {zone.longitude.toFixed(2)}°</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Toggle button for the map toolbar
export function DesertificationMonitorToggle() {
  const desertification = useMapStore((s) => s.desertification)
  const setDesertification = useMapStore((s) => s.setDesertification)

  return (
    <Button
      variant={desertification.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setDesertification({ open: !desertification.open })}
      title="Desertification Monitor"
    >
      <Sun className="h-4 w-4" />
    </Button>
  )
}
