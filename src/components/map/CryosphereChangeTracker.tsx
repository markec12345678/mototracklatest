'use client'

import { useMemo, useState } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMapStore, type CryosphereChangeState, type CryosphereRegion } from '@/lib/map-store'
import { Snowflake, TrendingDown, Mountain, Waves, X, Filter } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts'

const DEMO_REGIONS: CryosphereRegion[] = [
  {
    id: 'cr-greenland',
    name: 'Greenland Ice Sheet',
    type: 'ice_sheet',
    massBalance: -269,
    extentChange: -3.8,
    albedoShift: -0.012,
    seaLevelContribution: 0.7,
  },
  {
    id: 'cr-antarctic',
    name: 'Antarctic Ice Sheet',
    type: 'ice_sheet',
    massBalance: -150,
    extentChange: -2.1,
    albedoShift: -0.008,
    seaLevelContribution: 0.4,
  },
  {
    id: 'cr-arctic',
    name: 'Arctic Sea Ice',
    type: 'sea_ice',
    massBalance: 0,
    extentChange: -13.2,
    albedoShift: -0.025,
    seaLevelContribution: 0,
  },
  {
    id: 'cr-glaciers',
    name: 'Mountain Glaciers',
    type: 'glacier',
    massBalance: -245,
    extentChange: -5.5,
    albedoShift: -0.015,
    seaLevelContribution: 0.68,
  },
  {
    id: 'cr-permafrost',
    name: 'Northern Permafrost',
    type: 'permafrost',
    massBalance: 0,
    extentChange: -8.4,
    albedoShift: -0.018,
    seaLevelContribution: 0,
  },
  {
    id: 'cr-snow',
    name: 'Northern Snow Cover',
    type: 'snow',
    massBalance: 0,
    extentChange: -4.6,
    albedoShift: -0.020,
    seaLevelContribution: 0,
  },
]

const TYPE_CONFIG: Record<
  CryosphereRegion['type'],
  { label: string; color: string; bgClass: string }
> = {
  ice_sheet: { label: 'Ice Sheet', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  glacier: { label: 'Glacier', color: '#8b5cf6', bgClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30' },
  sea_ice: { label: 'Sea Ice', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  permafrost: { label: 'Permafrost', color: '#a16207', bgClass: 'bg-yellow-700/10 text-yellow-700 border-yellow-700/30' },
  snow: { label: 'Snow Cover', color: '#e2e8f0', bgClass: 'bg-slate-400/10 text-slate-600 border-slate-400/30' },
}

const CHANGE_OVER_TIME = [
  { year: '2018', iceSheets: -380, glaciers: -220, seaIce: -12.5, permafrost: -6.2 },
  { year: '2019', iceSheets: -450, glaciers: -240, seaIce: -13.0, permafrost: -7.0 },
  { year: '2020', iceSheets: -400, glaciers: -235, seaIce: -13.5, permafrost: -7.5 },
  { year: '2021', iceSheets: -350, glaciers: -250, seaIce: -13.0, permafrost: -8.0 },
  { year: '2022', iceSheets: -420, glaciers: -260, seaIce: -13.5, permafrost: -8.2 },
  { year: '2023', iceSheets: -419, glaciers: -245, seaIce: -13.2, permafrost: -8.4 },
]

export function CryosphereChangeTracker() {
  const cryosphereChange = useMapStore((s) => s.cryosphereChange)
  const setCryosphereChange = useMapStore((s) => s.setCryosphereChange)

  const [chartMode, setChartMode] = useState<'change' | 'seaLevel'>('change')

  const regions = useMemo(
    () => (cryosphereChange.regions && cryosphereChange.regions.length > 0 ? cryosphereChange.regions : DEMO_REGIONS),
    [cryosphereChange.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (cryosphereChange.typeFilter !== 'all' && r.type !== cryosphereChange.typeFilter) return false
      return true
    })
  }, [regions, cryosphereChange.typeFilter])

  const summary = useMemo(() => {
    if (!filteredRegions || filteredRegions.length === 0) {
      return { totalMassLoss: 0, totalSeaLevel: 0, avgExtent: 0 }
    }
    const totalMassLoss = Math.round(filteredRegions.reduce((s, r) => s + r.massBalance, 0))
    const totalSeaLevel = Math.round(filteredRegions.reduce((s, r) => s + r.seaLevelContribution, 0) * 100) / 100
    const avgExtent = Math.round((filteredRegions.reduce((s, r) => s + r.extentChange, 0) / filteredRegions.length) * 10) / 10
    return { totalMassLoss, totalSeaLevel, avgExtent }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => (regions && regions.length > 0 ? regions.find((r) => r.id === cryosphereChange.activeRegionId) ?? null : null),
    [regions, cryosphereChange.activeRegionId]
  )

  if (typeof window === 'undefined') return null
  if (!cryosphereChange.open) return null

  const overlayToggles: { key: keyof CryosphereChangeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMassBalance', label: 'Mass Balance', icon: TrendingDown },
    { key: 'showExtentChange', label: 'Extent', icon: Snowflake },
    { key: 'showAlbedoShift', label: 'Albedo', icon: Mountain },
    { key: 'showSeaLevelContribution', label: 'Sea Level', icon: Waves },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-blue-400" />
              Cryosphere Change Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCryosphereChange({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region Type
            </Label>
            <Select
              value={cryosphereChange.typeFilter}
              onValueChange={(v) =>
                setCryosphereChange({
                  typeFilter: v as CryosphereChangeState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ice_sheet">Ice Sheet</SelectItem>
                <SelectItem value="glacier">Glacier</SelectItem>
                <SelectItem value="sea_ice">Sea Ice</SelectItem>
                <SelectItem value="permafrost">Permafrost</SelectItem>
                <SelectItem value="snow">Snow Cover</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Mass Loss</div>
              <div className="text-sm font-semibold text-blue-600">{summary.totalMassLoss} Gt</div>
            </div>
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Sea Level</div>
              <div className="text-sm font-semibold text-cyan-600">+{summary.totalSeaLevel} mm</div>
            </div>
            <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Extent</div>
              <div className="text-sm font-semibold text-violet-600">{summary.avgExtent}%</div>
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
                    checked={cryosphereChange[t.key] as boolean}
                    onCheckedChange={(checked) => setCryosphereChange({ [t.key]: checked })}
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
              variant={chartMode === 'change' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('change')}
            >
              Change Over Time
            </Button>
            <Button
              variant={chartMode === 'seaLevel' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('seaLevel')}
            >
              Sea Level Contrib.
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'change' ? (
                <BarChart data={CHANGE_OVER_TIME}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="iceSheets" fill="#06b6d4" name="Ice Sheets (Gt)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="glaciers" fill="#8b5cf6" name="Glaciers (Gt)" radius={[2, 2, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={filteredRegions.map((r) => ({
                  name: r.name.length > 15 ? r.name.slice(0, 15) + '…' : r.name,
                  contribution: r.seaLevelContribution,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'mm/yr', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="contribution" stroke="#06b6d4" name="Sea Level (mm/yr)" dot={{ r: 5, fill: '#06b6d4' }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Regional Comparison Table */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Regional Comparison</Label>
            <ScrollArea className="max-h-40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] h-7">Region</TableHead>
                    {cryosphereChange.showMassBalance && <TableHead className="text-[10px] h-7">Mass (Gt)</TableHead>}
                    {cryosphereChange.showExtentChange && <TableHead className="text-[10px] h-7">Extent %</TableHead>}
                    {cryosphereChange.showAlbedoShift && <TableHead className="text-[10px] h-7">Albedo</TableHead>}
                    {cryosphereChange.showSeaLevelContribution && <TableHead className="text-[10px] h-7">SL (mm)</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredRegions && filteredRegions.length > 0) ? filteredRegions.map((region) => {
                    const typeCfg = TYPE_CONFIG[region.type]
                    const isActive = activeRegion?.id === region.id
                    return (
                      <TableRow
                        key={region.id}
                        className={`cursor-pointer text-[10px] ${isActive ? 'bg-blue-500/5' : ''}`}
                        onClick={() => setCryosphereChange({ activeRegionId: isActive ? null : region.id })}
                      >
                        <TableCell className="py-1">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className={`text-[8px] px-1 py-0 ${typeCfg.bgClass}`}>
                              {typeCfg.label}
                            </Badge>
                            <span className="font-medium truncate max-w-[100px]">{region.name}</span>
                          </div>
                        </TableCell>
                        {cryosphereChange.showMassBalance && (
                          <TableCell className="py-1 text-red-500">{region.massBalance !== 0 ? region.massBalance : '—'}</TableCell>
                        )}
                        {cryosphereChange.showExtentChange && (
                          <TableCell className="py-1 text-orange-500">{region.extentChange}%</TableCell>
                        )}
                        {cryosphereChange.showAlbedoShift && (
                          <TableCell className="py-1 text-violet-500">{region.albedoShift}</TableCell>
                        )}
                        {cryosphereChange.showSeaLevelContribution && (
                          <TableCell className="py-1 text-cyan-500">{region.seaLevelContribution !== 0 ? `+${region.seaLevelContribution}` : '—'}</TableCell>
                        )}
                      </TableRow>
                    )
                  }) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-4">No regions match filter</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Active Region Detail */}
          {activeRegion && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Snowflake className="h-3.5 w-3.5 text-blue-400" />
                  {activeRegion.name}
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ml-1 ${TYPE_CONFIG[activeRegion.type].bgClass}`}>
                    {TYPE_CONFIG[activeRegion.type].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">Mass:</span>
                    <span className="font-medium">{activeRegion.massBalance !== 0 ? `${activeRegion.massBalance} Gt/yr` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Snowflake className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Extent:</span>
                    <span className="font-medium">{activeRegion.extentChange}%/decade</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mountain className="h-3 w-3 text-violet-500" />
                    <span className="text-muted-foreground">Albedo:</span>
                    <span className="font-medium">{activeRegion.albedoShift}/decade</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Waves className="h-3 w-3 text-cyan-500" />
                    <span className="text-muted-foreground">Sea Level:</span>
                    <span className="font-medium">{activeRegion.seaLevelContribution !== 0 ? `+${activeRegion.seaLevelContribution} mm/yr` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
