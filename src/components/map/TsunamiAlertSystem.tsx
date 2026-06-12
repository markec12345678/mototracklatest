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
import { useMapStore, type TsunamiAlert } from '@/lib/map-store'
import {
  X,
  Eye,
  EyeOff,
  Waves,
  AlertTriangle,
  Globe,
  Activity,
  RefreshCw,
  Siren,
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

const DEMO_ALERTS: TsunamiAlert[] = [
  {
    id: 'ts1',
    sourceName: 'Pacific Tsunami (Japan)',
    latitude: 38.3,
    longitude: 142.4,
    magnitude: 7.8,
    waveHeight: 3.2,
    arrivalTime: '2025-03-04T08:30:00Z',
    alertLevel: 'warning',
    status: 'active',
  },
  {
    id: 'ts2',
    sourceName: 'Indian Ocean (Indonesia)',
    latitude: -2.5,
    longitude: 100.5,
    magnitude: 6.9,
    waveHeight: 1.8,
    arrivalTime: '2025-03-04T10:15:00Z',
    alertLevel: 'watch',
    status: 'active',
  },
  {
    id: 'ts3',
    sourceName: 'Mediterranean (Greece)',
    latitude: 36.5,
    longitude: 25.0,
    magnitude: 5.8,
    waveHeight: 0.6,
    arrivalTime: '2025-03-03T14:00:00Z',
    alertLevel: 'advisory',
    status: 'expired',
  },
  {
    id: 'ts4',
    sourceName: 'Atlantic (Caribbean)',
    latitude: 18.0,
    longitude: -66.0,
    magnitude: 6.2,
    waveHeight: 1.1,
    arrivalTime: '2025-03-03T22:45:00Z',
    alertLevel: 'watch',
    status: 'canceled',
  },
  {
    id: 'ts5',
    sourceName: 'Pacific (Chile)',
    latitude: -33.4,
    longitude: -70.6,
    magnitude: 7.1,
    waveHeight: 2.4,
    arrivalTime: '2025-03-04T06:00:00Z',
    alertLevel: 'warning',
    status: 'active',
  },
  {
    id: 'ts6',
    sourceName: 'Caribbean (Puerto Rico)',
    latitude: 18.5,
    longitude: -66.5,
    magnitude: 5.5,
    waveHeight: 0.4,
    arrivalTime: '2025-03-02T12:00:00Z',
    alertLevel: 'information',
    status: 'expired',
  },
]

const WAVE_HEIGHT_DATA = [
  { hour: '00:00', japan: 0.3, indonesia: 0.1, chile: 0.2 },
  { hour: '02:00', japan: 0.8, indonesia: 0.3, chile: 0.5 },
  { hour: '04:00', japan: 1.6, indonesia: 0.7, chile: 1.1 },
  { hour: '06:00', japan: 2.8, indonesia: 1.2, chile: 1.8 },
  { hour: '08:00', japan: 3.2, indonesia: 1.5, chile: 2.4 },
  { hour: '10:00', japan: 2.5, indonesia: 1.8, chile: 2.0 },
  { hour: '12:00', japan: 1.8, indonesia: 1.4, chile: 1.5 },
  { hour: '14:00', japan: 1.2, indonesia: 1.0, chile: 1.1 },
  { hour: '16:00', japan: 0.8, indonesia: 0.7, chile: 0.8 },
  { hour: '18:00', japan: 0.5, indonesia: 0.4, chile: 0.5 },
  { hour: '20:00', japan: 0.3, indonesia: 0.3, chile: 0.3 },
  { hour: '22:00', japan: 0.2, indonesia: 0.2, chile: 0.2 },
]

const BASIN_ALERT_DATA = [
  { basin: 'Pacific', count: 3 },
  { basin: 'Atlantic', count: 1 },
  { basin: 'Indian', count: 1 },
  { basin: 'Mediterranean', count: 1 },
  { basin: 'Caribbean', count: 2 },
]

const STATUS_COLORS: Record<string, string> = {
  active: '#ef4444',
  expired: '#a1a1aa',
  canceled: '#6b7280',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  expired: 'Expired',
  canceled: 'Canceled',
}

const LEVEL_COLORS: Record<string, string> = {
  information: '#3b82f6',
  advisory: '#f59e0b',
  watch: '#f97316',
  warning: '#ef4444',
}

const LEVEL_LABELS: Record<string, string> = {
  information: 'Info',
  advisory: 'Advisory',
  watch: 'Watch',
  warning: 'Warning',
}

const BASIN_MAP: Record<string, string> = {
  ts1: 'pacific',
  ts2: 'indian',
  ts3: 'mediterranean',
  ts4: 'atlantic',
  ts5: 'pacific',
  ts6: 'atlantic',
}

const LINE_COLORS = ['#ef4444', '#f97316', '#dc2626']

export function TsunamiAlertSystem() {
  const tsunamiAlert = useMapStore((s) => s.tsunamiAlert)
  const setTsunamiAlert = useMapStore((s) => s.setTsunamiAlert)

  if (typeof window === 'undefined') return null
  if (!tsunamiAlert.open) return null

  const alerts =
    tsunamiAlert.alerts.length > 0 ? tsunamiAlert.alerts : DEMO_ALERTS

  const filteredAlerts = alerts.filter((a) => {
    if (tsunamiAlert.alertLevel !== 'all' && a.alertLevel !== tsunamiAlert.alertLevel) return false
    if (tsunamiAlert.basin !== 'all') {
      const alertBasin = BASIN_MAP[a.id]
      if (alertBasin !== tsunamiAlert.basin) return false
    }
    return true
  })

  const overlayToggles = [
    { key: 'showWavePropagation' as const, label: 'Wave Propagation', icon: Waves },
    { key: 'showEvacuationZones' as const, label: 'Evacuation Zones', icon: Siren },
    { key: 'showBuoyData' as const, label: 'Buoy Data', icon: Activity },
    { key: 'showHistoricalEvents' as const, label: 'Historical', icon: RefreshCw },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Waves className="h-4 w-4 text-red-500" />
              Tsunami Alert System
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setTsunamiAlert({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Alert Level & Basin filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Alert Level</Label>
              <Select
                value={tsunamiAlert.alertLevel}
                onValueChange={(v) =>
                  setTsunamiAlert({
                    alertLevel: v as typeof tsunamiAlert.alertLevel,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="information">Information</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Basin</Label>
              <Select
                value={tsunamiAlert.basin}
                onValueChange={(v) =>
                  setTsunamiAlert({
                    basin: v as typeof tsunamiAlert.basin,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Basins</SelectItem>
                  <SelectItem value="pacific">Pacific</SelectItem>
                  <SelectItem value="atlantic">Atlantic</SelectItem>
                  <SelectItem value="indian">Indian Ocean</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
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
                  <Icon className="h-3 w-3 text-red-500" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {tsunamiAlert[key] ? (
                    <Eye className="h-3 w-3 text-red-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={tsunamiAlert[key]}
                    onCheckedChange={(checked) =>
                      setTsunamiAlert({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Wave height line chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Wave Height Over Time (m)
            </Label>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WAVE_HEIGHT_DATA}>
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    unit="m"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.3)',
                    }}
                  />
                  {['japan', 'indonesia', 'chile'].map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={LINE_COLORS[i]}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {['Japan', 'Indonesia', 'Chile'].map((name, i) => (
                <div key={name} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: LINE_COLORS[i] }}
                  />
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* Alerts by basin bar chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Alerts by Basin
            </Label>
            <div className="h-[110px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BASIN_ALERT_DATA}>
                  <XAxis
                    dataKey="basin"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.3)',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {BASIN_ALERT_DATA.map((_, i) => (
                      <Cell
                        key={i}
                        fill={['#ef4444', '#f97316', '#dc2626', '#f59e0b', '#fb923c'][i % 5]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Alert list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Tsunami Alerts ({filteredAlerts.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredAlerts.map((alert) => {
                  const isActive = tsunamiAlert.activeAlertId === alert.id
                  const statusColor = STATUS_COLORS[alert.status]
                  const levelColor = LEVEL_COLORS[alert.alertLevel]
                  return (
                    <div
                      key={alert.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-border/40 hover:border-red-500/20 hover:bg-red-500/5'
                      }`}
                      onClick={() =>
                        setTsunamiAlert({
                          activeAlertId: isActive ? null : alert.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{alert.sourceName}</span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{
                              borderColor: levelColor,
                              color: levelColor,
                            }}
                          >
                            {LEVEL_LABELS[alert.alertLevel]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{
                              borderColor: statusColor,
                              color: statusColor,
                            }}
                          >
                            {STATUS_LABELS[alert.status]}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Mag:{' '}
                          <span className="text-foreground">
                            {alert.magnitude}
                          </span>
                        </div>
                        <div>
                          Wave:{' '}
                          <span className="text-foreground">
                            {alert.waveHeight}m
                          </span>
                        </div>
                        <div>
                          ETA:{' '}
                          <span className="text-foreground">
                            {new Date(alert.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
