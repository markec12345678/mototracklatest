'use client'

import { useMemo } from 'react'
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
import { useMapStore, type IceSheet } from '@/lib/map-store'
import {
  X,
  Snowflake,
  Eye,
  EyeOff,
  Activity,
  Waves,
  TrendingDown,
  Mountain,
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

const DEMO_SHEETS: IceSheet[] = [
  {
    id: 'is1',
    name: 'Greenland',
    latitude: 72.0,
    longitude: -40.0,
    area: 1.71,
    volume: 2.85,
    meltRate: 270,
    flowVelocity: 125,
    calvingRate: 48,
  },
  {
    id: 'is2',
    name: 'West Antarctic',
    latitude: -78.0,
    longitude: -95.0,
    area: 1.81,
    volume: 3.37,
    meltRate: 155,
    flowVelocity: 310,
    calvingRate: 72,
  },
  {
    id: 'is3',
    name: 'East Antarctic',
    latitude: -78.0,
    longitude: 75.0,
    area: 10.17,
    volume: 26.5,
    meltRate: 45,
    flowVelocity: 18,
    calvingRate: 22,
  },
  {
    id: 'is4',
    name: 'Patagonian',
    latitude: -48.5,
    longitude: -73.0,
    area: 0.017,
    volume: 0.005,
    meltRate: 28,
    flowVelocity: 550,
    calvingRate: 12,
  },
  {
    id: 'is5',
    name: 'Icelandic',
    latitude: 64.5,
    longitude: -18.5,
    area: 0.011,
    volume: 0.003,
    meltRate: 9.5,
    flowVelocity: 85,
    calvingRate: 3,
  },
  {
    id: 'is6',
    name: 'Svalbard',
    latitude: 78.5,
    longitude: 16.0,
    area: 0.034,
    volume: 0.007,
    meltRate: 11,
    flowVelocity: 45,
    calvingRate: 5,
  },
]

const VOLUME_DECLINE_DATA = [
  { year: 2000, historical: 32.7, rcp26: 32.7, rcp45: 32.7, rcp85: 32.7 },
  { year: 2010, historical: 32.4, rcp26: 32.3, rcp45: 32.2, rcp85: 32.1 },
  { year: 2020, historical: 32.0, rcp26: 31.8, rcp45: 31.5, rcp85: 31.2 },
  { year: 2030, historical: 0, rcp26: 31.3, rcp45: 30.7, rcp85: 29.8 },
  { year: 2040, historical: 0, rcp26: 30.8, rcp45: 29.9, rcp85: 28.3 },
  { year: 2050, historical: 0, rcp26: 30.4, rcp45: 29.0, rcp85: 26.5 },
  { year: 2060, historical: 0, rcp26: 30.0, rcp45: 28.1, rcp85: 24.5 },
  { year: 2070, historical: 0, rcp26: 29.7, rcp45: 27.2, rcp85: 22.3 },
  { year: 2080, historical: 0, rcp26: 29.4, rcp45: 26.3, rcp85: 20.0 },
  { year: 2090, historical: 0, rcp26: 29.2, rcp45: 25.5, rcp85: 17.6 },
  { year: 2100, historical: 0, rcp26: 29.0, rcp45: 24.8, rcp85: 15.2 },
]

const MELT_RATE_DATA = DEMO_SHEETS.map((s) => ({
  name: s.name.length > 10 ? s.name.substring(0, 10) + '…' : s.name,
  meltRate: s.meltRate,
  fill: '#06b6d4',
}))

const SCENARIO_COLORS: Record<string, string> = {
  historical: '#67e8f9',
  rcp26: '#22d3ee',
  rcp45: '#06b6d4',
  rcp85: '#0891b2',
}

const SCENARIO_LABELS: Record<string, string> = {
  historical: 'Historical',
  rcp26: 'RCP 2.6',
  rcp45: 'RCP 4.5',
  rcp85: 'RCP 8.5',
}

export function IceSheetMonitor() {
  const iceSheet = useMapStore((s) => s.iceSheet)
  const setIceSheet = useMapStore((s) => s.setIceSheet)

  if (typeof window === 'undefined') return null
  if (!iceSheet.open) return null

  const sheets = iceSheet.sheets.length > 0 ? iceSheet.sheets : DEMO_SHEETS
  const scenario = iceSheet.scenario
  const yearFilter = iceSheet.yearFilter

  const filteredVolumeData = VOLUME_DECLINE_DATA.filter((d) => {
    if (scenario === 'historical') return d.historical > 0
    return true
  }).map((d) => ({
    year: d.year,
    value: scenario === 'historical' ? d.historical : d[scenario as keyof typeof d] as number,
    scenario,
  }))

  const overlayToggles = [
    { key: 'showIceExtent' as const, label: 'Ice Extent', icon: Mountain },
    { key: 'showFlowVelocity' as const, label: 'Flow Velocity', icon: Activity },
    { key: 'showMeltRate' as const, label: 'Melt Rate', icon: TrendingDown },
    { key: 'showCalvingEvents' as const, label: 'Calving Events', icon: Waves },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-cyan-500" />
              Ice Sheet Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIceSheet({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Year filter & Scenario selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Year Filter</Label>
              <span className="text-xs font-mono text-cyan-600">{yearFilter}</span>
            </div>
            <Slider
              value={[yearFilter]}
              min={2000}
              max={2100}
              step={1}
              onValueChange={(v) => setIceSheet({ yearFilter: v[0] })}
              className="w-full"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>2000</span>
              <span>2100</span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Scenario</Label>
            <Select
              value={scenario}
              onValueChange={(v) =>
                setIceSheet({ scenario: v as IceSheetMonitor['scenario'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="historical">Historical</SelectItem>
                <SelectItem value="rcp26">RCP 2.6 (Low)</SelectItem>
                <SelectItem value="rcp45">RCP 4.5 (Medium)</SelectItem>
                <SelectItem value="rcp85">RCP 8.5 (High)</SelectItem>
              </SelectContent>
            </Select>
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
                  {iceSheet[key] ? (
                    <Eye className="h-3 w-3 text-cyan-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={iceSheet[key]}
                    onCheckedChange={(checked) => setIceSheet({ [key]: checked })}
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Volume decline chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Ice Sheet Volume — {SCENARIO_LABELS[scenario]}
            </Label>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredVolumeData}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SCENARIO_COLORS[scenario]} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={SCENARIO_COLORS[scenario]} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
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
                    width={35}
                    unit="M km³"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(6,182,212,0.3)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={SCENARIO_COLORS[scenario]}
                    fill="url(#volumeGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Melt rates bar chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Melt Rates by Sheet (Gt/yr)</Label>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MELT_RATE_DATA}>
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
                    width={30}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(6,182,212,0.3)',
                    }}
                  />
                  <Bar dataKey="meltRate" radius={[4, 4, 0, 0]}>
                    {MELT_RATE_DATA.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#0891b2', '#0e7490'][i]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Ice sheets list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ice Sheets</Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {sheets.map((sheet) => {
                  const isActive = iceSheet.activeSheetId === sheet.id
                  return (
                    <div
                      key={sheet.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setIceSheet({
                          activeSheetId: isActive ? null : sheet.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{sheet.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 border-cyan-500/30 text-cyan-600"
                        >
                          {sheet.meltRate} Gt/yr
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Area: <span className="text-foreground">{sheet.area} M km²</span>
                        </div>
                        <div>
                          Vol: <span className="text-foreground">{sheet.volume} M km³</span>
                        </div>
                        <div>
                          Flow: <span className="text-foreground">{sheet.flowVelocity} m/yr</span>
                        </div>
                        <div>
                          Calving:{' '}
                          <span className="text-foreground">{sheet.calvingRate} Gt/yr</span>
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

type IceSheetMonitor = ReturnType<typeof useMapStore.getState>['iceSheet']
