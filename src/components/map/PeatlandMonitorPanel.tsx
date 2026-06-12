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
import { useMapStore, type Peatland } from '@/lib/map-store'
import {
  X,
  Eye,
  EyeOff,
  Leaf,
  TreePine,
  Activity,
  Filter,
  RefreshCw,
  Globe,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

type PeatlandMonitorState = ReturnType<typeof useMapStore.getState>['peatlandMonitor']

const DEMO_PEATLANDS: Peatland[] = [
  {
    id: 'pt1',
    name: 'West Siberian Peatlands',
    latitude: 60.0,
    longitude: 75.0,
    area: 540000,
    carbonStock: 35.8,
    depth: 3.2,
    status: 'degraded',
    waterTable: -0.45,
  },
  {
    id: 'pt2',
    name: 'Congo Basin',
    latitude: -1.5,
    longitude: 22.0,
    area: 145000,
    carbonStock: 18.2,
    depth: 2.8,
    status: 'intact',
    waterTable: -0.12,
  },
  {
    id: 'pt3',
    name: 'Southeast Asia',
    latitude: 1.0,
    longitude: 110.0,
    area: 250000,
    carbonStock: 28.5,
    depth: 4.5,
    status: 'degraded',
    waterTable: -0.82,
  },
  {
    id: 'pt4',
    name: 'Hudson Bay Lowlands',
    latitude: 55.0,
    longitude: -85.0,
    area: 320000,
    carbonStock: 22.1,
    depth: 2.1,
    status: 'intact',
    waterTable: -0.08,
  },
  {
    id: 'pt5',
    name: 'Borneo',
    latitude: 1.5,
    longitude: 114.0,
    area: 62000,
    carbonStock: 9.4,
    depth: 5.2,
    status: 'restoring',
    waterTable: -0.35,
  },
  {
    id: 'pt6',
    name: 'Patagonia',
    latitude: -48.0,
    longitude: -72.0,
    area: 45000,
    carbonStock: 4.8,
    depth: 1.8,
    status: 'intact',
    waterTable: -0.05,
  },
  {
    id: 'pt7',
    name: 'Scandinavia',
    latitude: 63.0,
    longitude: 15.0,
    area: 85000,
    carbonStock: 7.2,
    depth: 2.5,
    status: 'restoring',
    waterTable: -0.22,
  },
]

const STATUS_COLORS: Record<string, string> = {
  intact: '#22c55e',
  degraded: '#92400e',
  restoring: '#06b6d4',
}

const STATUS_LABELS: Record<string, string> = {
  intact: 'Intact',
  degraded: 'Degraded',
  restoring: 'Restoring',
}

const DEPTH_LABELS: Record<string, string> = {
  all: 'All Depths',
  shallow: 'Shallow (< 2m)',
  medium: 'Medium (2-4m)',
  deep: 'Deep (> 4m)',
}

function getDepthCategory(depth: number): string {
  if (depth < 2) return 'shallow'
  if (depth <= 4) return 'medium'
  return 'deep'
}

const PIE_COLORS = ['#22c55e', '#92400e', '#06b6d4']

export function PeatlandMonitorPanel() {
  const peatlandMonitor = useMapStore((s) => s.peatlandMonitor)
  const setPeatlandMonitor = useMapStore((s) => s.setPeatlandMonitor)

  const peatlands = peatlandMonitor.peatlands.length > 0 ? peatlandMonitor.peatlands : DEMO_PEATLANDS

  // Filter by status and depth
  const filteredPeatlands = peatlands.filter((p) => {
    if (peatlandMonitor.statusFilter !== 'all' && p.status !== peatlandMonitor.statusFilter) return false
    if (peatlandMonitor.depthFilter !== 'all' && getDepthCategory(p.depth) !== peatlandMonitor.depthFilter) return false
    return true
  })

  // Status distribution pie data
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = { intact: 0, degraded: 0, restoring: 0 }
    filteredPeatlands.forEach((p) => { counts[p.status]++ })
    return [
      { name: 'Intact', value: counts.intact, color: PIE_COLORS[0] },
      { name: 'Degraded', value: counts.degraded, color: PIE_COLORS[1] },
      { name: 'Restoring', value: counts.restoring, color: PIE_COLORS[2] },
    ].filter((d) => d.value > 0)
  }, [filteredPeatlands])

  // Carbon stock bar data
  const carbonBarData = filteredPeatlands.map((p) => ({
    name: p.name.length > 16 ? p.name.substring(0, 16) + '…' : p.name,
    carbon: p.carbonStock,
    status: p.status,
  }))

  if (typeof window === 'undefined') return null
  if (!peatlandMonitor.open) return null

  const overlayToggles: { key: keyof PeatlandMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPeatExtent', label: 'Peat Extent', icon: Globe },
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Activity },
    { key: 'showDegradation', label: 'Degradation', icon: TreePine },
    { key: 'showRestoration', label: 'Restoration', icon: RefreshCw },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              Peatland Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPeatlandMonitor({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status & Depth filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={peatlandMonitor.statusFilter}
                onValueChange={(v) =>
                  setPeatlandMonitor({
                    statusFilter: v as PeatlandMonitorState['statusFilter'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="intact">Intact</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="restoring">Restoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Depth</Label>
              <Select
                value={peatlandMonitor.depthFilter}
                onValueChange={(v) =>
                  setPeatlandMonitor({
                    depthFilter: v as PeatlandMonitorState['depthFilter'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Depths</SelectItem>
                  <SelectItem value="shallow">Shallow (&lt; 2m)</SelectItem>
                  <SelectItem value="medium">Medium (2-4m)</SelectItem>
                  <SelectItem value="deep">Deep (&gt; 4m)</SelectItem>
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
                  <Icon className="h-3 w-3 text-green-600" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {peatlandMonitor[key] ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={peatlandMonitor[key] as boolean}
                    onCheckedChange={(checked) =>
                      setPeatlandMonitor({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Carbon Stock Bar Chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Carbon Stock by Peatland (Gt C)
            </Label>
            <div className="h-[130px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carbonBarData} layout="vertical">
                  <XAxis
                    type="number"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 8 }}
                    axisLine={false}
                    tickLine={false}
                    width={85}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(34,197,94,0.3)',
                    }}
                  />
                  <Bar dataKey="carbon" radius={[0, 4, 4, 0]}>
                    {carbonBarData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={STATUS_COLORS[entry.status]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Status Distribution
            </Label>
            <div className="h-[130px] w-full flex items-center">
              <div className="h-[130px] w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      innerRadius={25}
                      paddingAngle={2}
                    >
                      {statusDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 10,
                        borderRadius: 8,
                        border: '1px solid rgba(34,197,94,0.3)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5 pl-2">
                {statusDistribution.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-medium ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Peatland List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Peatlands ({filteredPeatlands.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredPeatlands.map((peat) => {
                  const isActive = peatlandMonitor.activePeatlandId === peat.id
                  const statusColor = STATUS_COLORS[peat.status]
                  return (
                    <div
                      key={peat.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-600/50 bg-green-600/5'
                          : 'border-border/40 hover:border-green-600/20 hover:bg-green-600/5'
                      }`}
                      onClick={() =>
                        setPeatlandMonitor({
                          activePeatlandId: isActive ? null : peat.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{peat.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: statusColor,
                            color: statusColor,
                          }}
                        >
                          {STATUS_LABELS[peat.status]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Area:{' '}
                          <span className="text-foreground">{(peat.area / 1000).toFixed(0)}k km²</span>
                        </div>
                        <div>
                          Carbon:{' '}
                          <span className="text-foreground">{peat.carbonStock} Gt</span>
                        </div>
                        <div>
                          Depth:{' '}
                          <span className="text-foreground">{peat.depth} m</span>
                        </div>
                        <div className="col-span-3">
                          Water Table:{' '}
                          <span
                            className="text-foreground"
                            style={{
                              color: peat.waterTable < -0.5 ? '#92400e' : peat.waterTable < -0.2 ? '#f97316' : '#22c55e',
                            }}
                          >
                            {peat.waterTable} m
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
