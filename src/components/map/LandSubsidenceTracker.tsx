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
import { useMapStore, type SubsidenceZone } from '@/lib/map-store'
import {
  X,
  TrendingDown,
  Eye,
  EyeOff,
  Factory,
  Droplet,
  Shield,
  Activity,
  Mountain,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const DEMO_ZONES: SubsidenceZone[] = [
  {
    id: 'ls1',
    name: 'Jakarta',
    latitude: -6.2,
    longitude: 106.85,
    subsidenceRate: 15,
    totalSubsidence: 4.0,
    cause: 'groundwater',
    severity: 'extreme',
  },
  {
    id: 'ls2',
    name: 'Mexico City',
    latitude: 19.43,
    longitude: -99.13,
    subsidenceRate: 10,
    totalSubsidence: 9.0,
    cause: 'groundwater',
    severity: 'severe',
  },
  {
    id: 'ls3',
    name: 'Shanghai',
    latitude: 31.23,
    longitude: 121.47,
    subsidenceRate: 3,
    totalSubsidence: 2.8,
    cause: 'groundwater',
    severity: 'moderate',
  },
  {
    id: 'ls4',
    name: 'Central Valley',
    latitude: 36.74,
    longitude: -119.78,
    subsidenceRate: 5,
    totalSubsidence: 8.5,
    cause: 'groundwater',
    severity: 'severe',
  },
  {
    id: 'ls5',
    name: 'Tehran',
    latitude: 35.69,
    longitude: 51.39,
    subsidenceRate: 25,
    totalSubsidence: 6.0,
    cause: 'groundwater',
    severity: 'extreme',
  },
  {
    id: 'ls6',
    name: 'Venice',
    latitude: 45.44,
    longitude: 12.32,
    subsidenceRate: 1,
    totalSubsidence: 0.7,
    cause: 'natural',
    severity: 'minor',
  },
]

const SUBSIDENCE_PROGRESSION = [
  { year: 2000, Jakarta: 3.0, MexicoCity: 7.5, Shanghai: 2.2, CentralValley: 6.5, Tehran: 3.5, Venice: 0.6 },
  { year: 2003, Jakarta: 3.3, MexicoCity: 7.8, Shanghai: 2.3, CentralValley: 6.8, Tehran: 3.9, Venice: 0.61 },
  { year: 2006, Jakarta: 3.5, MexicoCity: 8.0, Shanghai: 2.4, CentralValley: 7.2, Tehran: 4.3, Venice: 0.63 },
  { year: 2009, Jakarta: 3.6, MexicoCity: 8.3, Shanghai: 2.5, CentralValley: 7.6, Tehran: 4.8, Venice: 0.64 },
  { year: 2012, Jakarta: 3.7, MexicoCity: 8.5, Shanghai: 2.55, CentralValley: 7.9, Tehran: 5.2, Venice: 0.65 },
  { year: 2015, Jakarta: 3.8, MexicoCity: 8.7, Shanghai: 2.6, CentralValley: 8.1, Tehran: 5.5, Venice: 0.66 },
  { year: 2018, Jakarta: 3.9, MexicoCity: 8.85, Shanghai: 2.7, CentralValley: 8.3, Tehran: 5.8, Venice: 0.68 },
  { year: 2021, Jakarta: 3.95, MexicoCity: 9.0, Shanghai: 2.75, CentralValley: 8.5, Tehran: 6.0, Venice: 0.7 },
]

const SUBSIDENCE_RATE_DATA = DEMO_ZONES.map((z) => ({
  name: z.name.length > 10 ? z.name.substring(0, 10) + '…' : z.name,
  rate: z.subsidenceRate,
}))

const SEVERITY_COLORS: Record<string, string> = {
  minor: '#a3e635',
  moderate: '#facc15',
  severe: '#f97316',
  extreme: '#ef4444',
}

const SEVERITY_LABELS: Record<string, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  severe: 'Severe',
  extreme: 'Extreme',
}

const CAUSE_LABELS: Record<string, string> = {
  groundwater: 'Groundwater',
  mining: 'Mining',
  oil_gas: 'Oil & Gas',
  natural: 'Natural',
}

const CAUSE_COLORS: Record<string, string> = {
  groundwater: '#3b82f6',
  mining: '#a16207',
  oil_gas: '#1e1e1e',
  natural: '#22c55e',
}

const PROGRESSION_COLORS = ['#f97316', '#ef4444', '#06b6d4', '#8b5cf6', '#b45309', '#64748b']

export function LandSubsidenceTracker() {
  const landSubsidence = useMapStore((s) => s.landSubsidence)
  const setLandSubsidence = useMapStore((s) => s.setLandSubsidence)

  if (typeof window === 'undefined') return null
  if (!landSubsidence.open) return null

  const zones =
    landSubsidence.zones.length > 0 ? landSubsidence.zones : DEMO_ZONES

  const filteredZones = zones.filter((z) => {
    if (landSubsidence.causeFilter !== 'all' && z.cause !== landSubsidence.causeFilter)
      return false
    if (landSubsidence.rateFilter !== 'all' && z.severity !== landSubsidence.rateFilter)
      return false
    return true
  })

  const filteredRateData = filteredZones.map((z) => ({
    name: z.name.length > 10 ? z.name.substring(0, 10) + '…' : z.name,
    rate: z.subsidenceRate,
  }))

  const overlayToggles = [
    { key: 'showSubsidence' as const, label: 'Subsidence', icon: TrendingDown },
    { key: 'showGroundwaterDecline' as const, label: 'Groundwater Decline', icon: Droplet },
    { key: 'showInfrastructure' as const, label: 'Infrastructure', icon: Shield },
    { key: 'showMonitoring' as const, label: 'Monitoring', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Land Subsidence Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setLandSubsidence({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Cause</Label>
              <Select
                value={landSubsidence.causeFilter}
                onValueChange={(v) =>
                  setLandSubsidence({
                    causeFilter: v as LandSubsidenceTracker['causeFilter'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Causes</SelectItem>
                  <SelectItem value="groundwater">Groundwater</SelectItem>
                  <SelectItem value="mining">Mining</SelectItem>
                  <SelectItem value="oil_gas">Oil & Gas</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Severity</Label>
              <Select
                value={landSubsidence.rateFilter}
                onValueChange={(v) =>
                  setLandSubsidence({
                    rateFilter: v as LandSubsidenceTracker['rateFilter'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
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
                  {landSubsidence[key] ? (
                    <Eye className="h-3 w-3 text-orange-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={landSubsidence[key]}
                    onCheckedChange={(checked) =>
                      setLandSubsidence({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Subsidence progression line chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Subsidence Progression (m)
            </Label>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SUBSIDENCE_PROGRESSION}>
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
                    width={30}
                    unit="m"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(249,115,22,0.3)',
                    }}
                  />
                  {['Jakarta', 'MexicoCity', 'Shanghai', 'CentralValley', 'Tehran', 'Venice'].map(
                    (key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={PROGRESSION_COLORS[i]}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    )
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {['Jakarta', 'Mexico City', 'Shanghai', 'Central Valley', 'Tehran', 'Venice'].map(
                (name, i) => (
                  <div key={name} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: PROGRESSION_COLORS[i] }}
                    />
                    {name}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Subsidence rates bar chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Current Subsidence Rate (cm/yr)
            </Label>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredRateData}>
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
                      border: '1px solid rgba(249,115,22,0.3)',
                    }}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {filteredRateData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={['#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#78350f'][i % 6]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Subsidence zones list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Subsidence Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = landSubsidence.activeZoneId === zone.id
                  const sevColor = SEVERITY_COLORS[zone.severity]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setLandSubsidence({
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
                              borderColor: CAUSE_COLORS[zone.cause],
                              color: CAUSE_COLORS[zone.cause],
                            }}
                          >
                            {CAUSE_LABELS[zone.cause]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{
                              borderColor: sevColor,
                              color: sevColor,
                            }}
                          >
                            {SEVERITY_LABELS[zone.severity]}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Rate:{' '}
                          <span className="text-foreground">
                            {zone.subsidenceRate} cm/yr
                          </span>
                        </div>
                        <div>
                          Total:{' '}
                          <span className="text-foreground">
                            {zone.totalSubsidence} m
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

type LandSubsidenceTracker = ReturnType<typeof useMapStore.getState>['landSubsidence']
