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
import { useMapStore, type PermafrostZone, type PermafrostState } from '@/lib/map-store'
import {
  Snowflake,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3,
  MapPin,
  TrendingDown,
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

// Demo permafrost zones
const DEMO_ZONES: PermafrostZone[] = [
  {
    id: 'pz1',
    name: 'Siberian Permafrost',
    latitude: 65.0,
    longitude: 100.0,
    extent: 12500000,
    activeLayerDepth: 1.8,
    thawRate: 4.2,
    groundIceContent: 65,
    type: 'continuous',
  },
  {
    id: 'pz2',
    name: 'Canadian Shield Permafrost',
    latitude: 62.0,
    longitude: -95.0,
    extent: 5200000,
    activeLayerDepth: 1.5,
    thawRate: 3.1,
    groundIceContent: 42,
    type: 'continuous',
  },
  {
    id: 'pz3',
    name: 'Alaskan North Slope',
    latitude: 70.0,
    longitude: -155.0,
    extent: 680000,
    activeLayerDepth: 1.2,
    thawRate: 5.8,
    groundIceContent: 78,
    type: 'continuous',
  },
  {
    id: 'pz4',
    name: 'Scandinavian Mountain Permafrost',
    latitude: 68.0,
    longitude: 18.0,
    extent: 35000,
    activeLayerDepth: 2.5,
    thawRate: 2.8,
    groundIceContent: 25,
    type: 'discontinuous',
  },
  {
    id: 'pz5',
    name: 'Tibetan Plateau Permafrost',
    latitude: 34.0,
    longitude: 92.0,
    extent: 1500000,
    activeLayerDepth: 2.2,
    thawRate: 6.5,
    groundIceContent: 35,
    type: 'discontinuous',
  },
  {
    id: 'pz6',
    name: 'Himalayan Sporadic Zone',
    latitude: 30.0,
    longitude: 85.0,
    extent: 120000,
    activeLayerDepth: 3.5,
    thawRate: 8.2,
    groundIceContent: 15,
    type: 'sporadic',
  },
  {
    id: 'pz7',
    name: 'Mongolian Isolated Permafrost',
    latitude: 48.0,
    longitude: 105.0,
    extent: 85000,
    activeLayerDepth: 3.8,
    thawRate: 7.1,
    groundIceContent: 10,
    type: 'isolated',
  },
]

const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  continuous: { bg: 'bg-teal-500/10', color: 'text-teal-600 dark:text-teal-400' },
  discontinuous: { bg: 'bg-cyan-500/10', color: 'text-cyan-600 dark:text-cyan-400' },
  sporadic: { bg: 'bg-sky-500/10', color: 'text-sky-600 dark:text-sky-400' },
  isolated: { bg: 'bg-blue-500/10', color: 'text-blue-600 dark:text-blue-400' },
}

const TYPE_COLORS: Record<string, string> = {
  continuous: '#14b8a6',
  discontinuous: '#06b6d4',
  sporadic: '#0ea5e9',
  isolated: '#3b82f6',
}

const SCENARIO_COLORS: Record<string, string> = {
  rcp26: '#22c55e',
  rcp45: '#eab308',
  rcp85: '#ef4444',
}

const SCENARIO_LABELS: Record<string, string> = {
  rcp26: 'RCP 2.6 (Low)',
  rcp45: 'RCP 4.5 (Medium)',
  rcp85: 'RCP 8.5 (High)',
}

export function PermafrostThawTracker() {
  const permafrost = useMapStore((s) => s.permafrost)
  const setPermafrost = useMapStore((s) => s.setPermafrost)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const zones = permafrost.zones.length > 0 ? permafrost.zones : DEMO_ZONES

  // Permafrost extent decline chart by scenario
  const extentChartData = useMemo(() => {
    const baseYear = 2000
    const currentYear = permafrost.yearFilter
    return Array.from({ length: 11 }, (_, i) => {
      const year = baseYear + i * 10
      const factor = (year - baseYear) / 100
      return {
        year,
        rcp26: Math.round(25 - factor * 2),
        rcp45: Math.round(25 - factor * 5),
        rcp85: Math.round(25 - factor * 12),
      }
    }).filter(d => d.year <= currentYear || d.year <= 2100)
  }, [permafrost.yearFilter])

  // Active layer depth by zone bar chart
  const activeLayerChartData = useMemo(() => {
    return zones.map(z => ({
      name: z.name.replace(' Permafrost', '').replace(' Zone', '').length > 12
        ? z.name.replace(' Permafrost', '').replace(' Zone', '').slice(0, 10) + '…'
        : z.name.replace(' Permafrost', '').replace(' Zone', ''),
      depth: z.activeLayerDepth,
      color: TYPE_COLORS[z.type],
    }))
  }, [zones])

  if (typeof window === 'undefined') return null
  if (!permafrost.open) return null

  const overlayToggles: { key: keyof PermafrostState; label: string; checked: boolean }[] = [
    { key: 'showPermafrostExtent', label: 'Permafrost Extent', checked: permafrost.showPermafrostExtent },
    { key: 'showActiveLayer', label: 'Active Layer', checked: permafrost.showActiveLayer },
    { key: 'showThawRate', label: 'Thaw Rate', checked: permafrost.showThawRate },
    { key: 'showGroundIce', label: 'Ground Ice', checked: permafrost.showGroundIce },
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
                <Snowflake className="h-4 w-4 text-teal-500" />
                Permafrost Thaw Tracker
                <Badge variant="outline" className="text-[10px] font-normal">
                  {zones.length} zones
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPermafrost({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Year Filter Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Year Projection
                  </Label>
                  <span className="text-xs font-semibold tabular-nums">{permafrost.yearFilter}</span>
                </div>
                <Slider
                  value={[permafrost.yearFilter]}
                  onValueChange={([v]) => setPermafrost({ yearFilter: v })}
                  min={2000}
                  max={2100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>2000</span>
                  <span>2050</span>
                  <span>2100</span>
                </div>
              </div>

              {/* Temperature Scenario Selector */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Scenario
                </Label>
                <Select
                  value={permafrost.temperatureScenario}
                  onValueChange={(v) => setPermafrost({ temperatureScenario: v as PermafrostState['temperatureScenario'] })}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rcp26">RCP 2.6 (Low)</SelectItem>
                    <SelectItem value="rcp45">RCP 4.5 (Medium)</SelectItem>
                    <SelectItem value="rcp85">RCP 8.5 (High)</SelectItem>
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
                        onCheckedChange={(v) => setPermafrost({ [toggle.key]: v })}
                      />
                      <span className="text-xs">{toggle.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Permafrost Extent Decline Area Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Permafrost Extent by Scenario (M km²)
                </Label>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={extentChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 28]} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, name: string) => [`${value} M km²`, SCENARIO_LABELS[name] || name]}
                    />
                    <Area type="monotone" dataKey="rcp26" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={1.5} name="rcp26" />
                    <Area type="monotone" dataKey="rcp45" stroke="#eab308" fill="#eab308" fillOpacity={0.1} strokeWidth={1.5} name="rcp45" />
                    <Area type="monotone" dataKey="rcp85" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={1.5} name="rcp85" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> RCP 2.6</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> RCP 4.5</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> RCP 8.5</div>
                </div>
              </div>

              {/* Active Layer Depth Bar Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> Active Layer Depth (m)
                </Label>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={activeLayerChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={80} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value} m`, 'Active Layer']}
                    />
                    <Bar dataKey="depth" radius={[0, 3, 3, 0]}>
                      {activeLayerChartData.map((entry, index) => (
                        <Cell key={`al-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Separator />

              {/* Zone List */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Permafrost Zones</Label>
                {zones.map(zone => {
                  const style = TYPE_STYLES[zone.type]
                  const isExpanded = expandedId === zone.id
                  return (
                    <div
                      key={zone.id}
                      className="rounded-lg border border-border/50 p-2.5 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : zone.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Snowflake className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[130px]">{zone.name}</span>
                          <Badge className={`${style.bg} ${style.color} border-0 text-[9px] px-1.5 py-0 capitalize`}>
                            {zone.type}
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
                          <span>{(zone.extent / 1000000).toFixed(1)}M km²</span>
                          <span>ALT: {zone.activeLayerDepth}m</span>
                          <span className="text-red-500">{zone.thawRate} cm/yr</span>
                        </div>
                      )}
                      {isExpanded && (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className={`font-medium capitalize ${style.color}`}>{zone.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Extent</span>
                            <span className="font-medium">{(zone.extent / 1000000).toFixed(1)}M km²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Active Layer</span>
                            <span className="font-medium">{zone.activeLayerDepth} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Thaw Rate</span>
                            <span className="font-medium text-red-600 dark:text-red-400">{zone.thawRate} cm/yr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ground Ice</span>
                            <span className="font-medium">{zone.groundIceContent}%</span>
                          </div>
                          <div className="flex justify-between">
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
export function PermafrostThawTrackerToggle() {
  const permafrost = useMapStore((s) => s.permafrost)
  const setPermafrost = useMapStore((s) => s.setPermafrost)

  return (
    <Button
      variant={permafrost.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setPermafrost({ open: !permafrost.open })}
      title="Permafrost Thaw Tracker"
    >
      <Snowflake className="h-4 w-4" />
    </Button>
  )
}
