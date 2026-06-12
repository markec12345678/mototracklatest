'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { useMapStore, type MineralDeposit, type MineralExplorationState } from '@/lib/map-store'
import {
  Gem,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3,
  Filter,
  MapPin,
  Settings,
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

// Demo mineral deposits
const DEMO_DEPOSITS: MineralDeposit[] = [
  {
    id: 'md1',
    name: 'Witwatersrand Basin',
    latitude: -26.20,
    longitude: 28.04,
    mineralType: 'gold',
    estimatedTonnage: 120000,
    grade: 8.5,
    depth: 3200,
    status: 'production',
  },
  {
    id: 'md2',
    name: 'Escondida Mine',
    latitude: -24.27,
    longitude: -69.07,
    mineralType: 'copper',
    estimatedTonnage: 3500000,
    grade: 0.52,
    depth: 650,
    status: 'production',
  },
  {
    id: 'md3',
    name: 'Carajás Mine',
    latitude: -6.07,
    longitude: -50.17,
    mineralType: 'iron',
    estimatedTonnage: 7200000,
    grade: 66.0,
    depth: 200,
    status: 'production',
  },
  {
    id: 'md4',
    name: 'Bayan Obo',
    latitude: 41.80,
    longitude: 109.97,
    mineralType: 'rare_earth',
    estimatedTonnage: 48000,
    grade: 6.0,
    depth: 800,
    status: 'development',
  },
  {
    id: 'md5',
    name: 'Orapa Diamond Mine',
    latitude: -21.31,
    longitude: 25.37,
    mineralType: 'diamond',
    estimatedTonnage: 12500,
    grade: 0.68,
    depth: 250,
    status: 'production',
  },
  {
    id: 'md6',
    name: 'Oyu Tolgoi',
    latitude: 43.00,
    longitude: 106.85,
    mineralType: 'copper',
    estimatedTonnage: 2800000,
    grade: 0.49,
    depth: 1300,
    status: 'development',
  },
  {
    id: 'md7',
    name: 'Kalgoorlie Super Pit',
    latitude: -30.77,
    longitude: 121.50,
    mineralType: 'gold',
    estimatedTonnage: 65000,
    grade: 2.1,
    depth: 600,
    status: 'production',
  },
  {
    id: 'md8',
    name: 'Kami Iron Ore',
    latitude: 52.75,
    longitude: -57.10,
    mineralType: 'iron',
    estimatedTonnage: 4200000,
    grade: 30.5,
    depth: 150,
    status: 'exploration',
  },
  {
    id: 'md9',
    name: 'Nolans Bore',
    latitude: -22.58,
    longitude: 133.40,
    mineralType: 'rare_earth',
    estimatedTonnage: 30000,
    grade: 2.6,
    depth: 45,
    status: 'exploration',
  },
  {
    id: 'md10',
    name: 'Diavik Diamond Mine',
    latitude: 64.50,
    longitude: -110.27,
    mineralType: 'diamond',
    estimatedTonnage: 6800,
    grade: 3.4,
    depth: 350,
    status: 'prospect',
  },
]

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  prospect: { bg: 'bg-slate-500/10', color: 'text-slate-600 dark:text-slate-400' },
  exploration: { bg: 'bg-blue-500/10', color: 'text-blue-600 dark:text-blue-400' },
  development: { bg: 'bg-amber-500/10', color: 'text-amber-600 dark:text-amber-400' },
  production: { bg: 'bg-green-500/10', color: 'text-green-600 dark:text-green-400' },
}

const MINERAL_COLORS: Record<string, string> = {
  gold: '#eab308',
  copper: '#f97316',
  iron: '#78716c',
  rare_earth: '#a855f7',
  diamond: '#06b6d4',
}

const MINERAL_LABELS: Record<string, string> = {
  gold: 'Gold',
  copper: 'Copper',
  iron: 'Iron',
  rare_earth: 'Rare Earth',
  diamond: 'Diamond',
}

export function MineralExploration() {
  const mineralExploration = useMapStore((s) => s.mineralExploration)
  const setMineralExploration = useMapStore((s) => s.setMineralExploration)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const deposits = mineralExploration.deposits.length > 0 ? mineralExploration.deposits : DEMO_DEPOSITS

  const filteredDeposits = mineralExploration.mineralFilter === 'all'
    ? deposits
    : deposits.filter(d => d.mineralType === mineralExploration.mineralFilter)

  // Grade bar chart data
  const gradeChartData = useMemo(() => {
    return filteredDeposits.map(d => ({
      name: d.name.length > 12 ? d.name.slice(0, 10) + '…' : d.name,
      grade: d.grade,
      color: MINERAL_COLORS[d.mineralType],
    }))
  }, [filteredDeposits])

  // Pie chart: mineral type distribution
  const pieChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    deposits.forEach(d => {
      counts[d.mineralType] = (counts[d.mineralType] || 0) + 1
    })
    return Object.entries(counts).map(([type, count]) => ({
      name: MINERAL_LABELS[type] || type,
      value: count,
      color: MINERAL_COLORS[type],
    }))
  }, [deposits])

  if (typeof window === 'undefined') return null
  if (!mineralExploration.open) return null

  const overlayToggles: { key: keyof MineralExplorationState; label: string; checked: boolean }[] = [
    { key: 'showDeposits', label: 'Deposits', checked: mineralExploration.showDeposits },
    { key: 'showGeologicalMap', label: 'Geological Map', checked: mineralExploration.showGeologicalMap },
    { key: 'showMiningClaims', label: 'Mining Claims', checked: mineralExploration.showMiningClaims },
    { key: 'showGeochemistry', label: 'Geochemistry', checked: mineralExploration.showGeochemistry },
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
                <Gem className="h-4 w-4 text-yellow-500" />
                Mineral Exploration
                <Badge variant="outline" className="text-[10px] font-normal">
                  {filteredDeposits.length} deposits
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setMineralExploration({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Mineral Type Filter */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Mineral
                </Label>
                <Select
                  value={mineralExploration.mineralFilter}
                  onValueChange={(v) => setMineralExploration({ mineralFilter: v as MineralExplorationState['mineralFilter'] })}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Minerals</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="copper">Copper</SelectItem>
                    <SelectItem value="iron">Iron</SelectItem>
                    <SelectItem value="rare_earth">Rare Earth</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Survey Mode Selector */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Settings className="h-3 w-3" /> Survey
                </Label>
                <Select
                  value={mineralExploration.surveyMode}
                  onValueChange={(v) => setMineralExploration({ surveyMode: v as MineralExplorationState['surveyMode'] })}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surface">Surface</SelectItem>
                    <SelectItem value="subsurface">Subsurface</SelectItem>
                    <SelectItem value="geochemical">Geochemical</SelectItem>
                    <SelectItem value="geophysical">Geophysical</SelectItem>
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
                        onCheckedChange={(v) => setMineralExploration({ [toggle.key]: v })}
                      />
                      <span className="text-xs">{toggle.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Grade Bar Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> Grade by Deposit (%)
                </Label>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={gradeChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={75} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Grade']}
                    />
                    <Bar dataKey="grade" radius={[0, 3, 3, 0]}>
                      {gradeChartData.map((entry, index) => (
                        <Cell key={`gr-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mineral Type Distribution Pie Chart */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Mineral Type Distribution</Label>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, name: string) => [`${value} deposits`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap items-center gap-2 text-[9px] text-muted-foreground">
                  {pieChartData.map(entry => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Deposit List */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Mineral Deposits</Label>
                {filteredDeposits.map(deposit => {
                  const style = STATUS_STYLES[deposit.status]
                  const isExpanded = expandedId === deposit.id
                  return (
                    <div
                      key={deposit.id}
                      className="rounded-lg border border-border/50 p-2.5 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : deposit.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: MINERAL_COLORS[deposit.mineralType] }} />
                          <span className="text-xs font-medium truncate max-w-[130px]">{deposit.name}</span>
                          <Badge className={`${style.bg} ${style.color} border-0 text-[9px] px-1.5 py-0 capitalize`}>
                            {deposit.status}
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
                          <span style={{ color: MINERAL_COLORS[deposit.mineralType] }}>{MINERAL_LABELS[deposit.mineralType]}</span>
                          <span>Grade: {deposit.grade}%</span>
                          <span>Depth: {deposit.depth}m</span>
                        </div>
                      )}
                      {isExpanded && (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mineral</span>
                            <span className="font-medium" style={{ color: MINERAL_COLORS[deposit.mineralType] }}>{MINERAL_LABELS[deposit.mineralType]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Grade</span>
                            <span className="font-medium">{deposit.grade}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Tonnage</span>
                            <span className="font-medium">{(deposit.estimatedTonnage / 1000).toFixed(0)}k tonnes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Depth</span>
                            <span className="font-medium">{deposit.depth} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-medium capitalize">{deposit.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coordinates</span>
                            <span className="font-medium">{deposit.latitude.toFixed(2)}°, {deposit.longitude.toFixed(2)}°</span>
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
export function MineralExplorationToggle() {
  const mineralExploration = useMapStore((s) => s.mineralExploration)
  const setMineralExploration = useMapStore((s) => s.setMineralExploration)

  return (
    <Button
      variant={mineralExploration.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setMineralExploration({ open: !mineralExploration.open })}
      title="Mineral Exploration"
    >
      <Gem className="h-4 w-4" />
    </Button>
  )
}
