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
import { useMapStore, type SpaceWeatherEvent } from '@/lib/map-store'
import {
  X,
  Eye,
  EyeOff,
  Zap,
  Atom,
  CircleDot,
  Radio,
  AlertTriangle,
  Filter,
  Globe,
  CloudLightning,
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

type SpaceWeatherState = ReturnType<typeof useMapStore.getState>['spaceWeather']

const DEMO_EVENTS: SpaceWeatherEvent[] = [
  {
    id: 'sw1',
    type: 'cme',
    startTime: '2024-03-15T08:30:00Z',
    magnitude: 1200,
    kpIndex: 7,
    alertLevel: 'strong',
    description: 'Earth-directed CME impact detected. Solar wind speed 650 km/s.',
  },
  {
    id: 'sw2',
    type: 'flare',
    startTime: '2024-03-14T12:45:00Z',
    magnitude: 9.2,
    kpIndex: 5,
    alertLevel: 'moderate',
    description: 'X9.2 class solar flare from AR3615. HF radio blackout.',
  },
  {
    id: 'sw3',
    type: 'geomagnetic_storm',
    startTime: '2024-03-16T02:00:00Z',
    magnitude: 3,
    kpIndex: 7,
    alertLevel: 'strong',
    description: 'G3 geomagnetic storm in progress. Aurora visible at mid-latitudes.',
  },
  {
    id: 'sw4',
    type: 'radiation',
    startTime: '2024-03-14T13:00:00Z',
    magnitude: 850,
    kpIndex: 4,
    alertLevel: 'minor',
    description: 'Solar radiation storm enhancement. S1 alert level.',
  },
  {
    id: 'sw5',
    type: 'flare',
    startTime: '2024-03-13T06:20:00Z',
    magnitude: 5.4,
    kpIndex: 3,
    alertLevel: 'minor',
    description: 'M5.4 class solar flare from AR3612. Minor R1 radio blackout.',
  },
  {
    id: 'sw6',
    type: 'cme',
    startTime: '2024-03-17T14:00:00Z',
    magnitude: 800,
    kpIndex: 5,
    alertLevel: 'moderate',
    description: 'CME observed on the solar west limb. Possible glancing blow in 48h.',
  },
]

const ALERT_COLORS: Record<string, string> = {
  minor: '#a855f7',
  moderate: '#7c3aed',
  strong: '#c026d3',
  severe: '#db2777',
  extreme: '#be123c',
}

const ALERT_LABELS: Record<string, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  strong: 'Strong',
  severe: 'Severe',
  extreme: 'Extreme',
}

const TYPE_LABELS: Record<string, string> = {
  cme: 'CME',
  flare: 'Solar Flare',
  geomagnetic_storm: 'Geomagnetic Storm',
  radiation: 'Radiation',
}

const TYPE_COLORS: Record<string, string> = {
  cme: '#a855f7',
  flare: '#f97316',
  geomagnetic_storm: '#7c3aed',
  radiation: '#ec4899',
}

const KP_INDEX_DATA = [
  { hour: '00h', kp: 3, threshold: 5 },
  { hour: '03h', kp: 4, threshold: 5 },
  { hour: '06h', kp: 5, threshold: 5 },
  { hour: '09h', kp: 7, threshold: 5 },
  { hour: '12h', kp: 6, threshold: 5 },
  { hour: '15h', kp: 5, threshold: 5 },
  { hour: '18h', kp: 4, threshold: 5 },
  { hour: '21h', kp: 3, threshold: 5 },
  { hour: '24h', kp: 5, threshold: 5 },
  { hour: '27h', kp: 4, threshold: 5 },
  { hour: '30h', kp: 3, threshold: 5 },
  { hour: '33h', kp: 2, threshold: 5 },
  { hour: '36h', kp: 3, threshold: 5 },
  { hour: '39h', kp: 2, threshold: 5 },
  { hour: '42h', kp: 2, threshold: 5 },
  { hour: '45h', kp: 1, threshold: 5 },
  { hour: '48h', kp: 2, threshold: 5 },
]

const EVENTS_BY_TYPE = [
  { type: 'CME', count: 2, color: TYPE_COLORS.cme },
  { type: 'Solar Flare', count: 2, color: TYPE_COLORS.flare },
  { type: 'Geo. Storm', count: 1, color: TYPE_COLORS.geomagnetic_storm },
  { type: 'Radiation', count: 1, color: TYPE_COLORS.radiation },
]

export function SpaceWeatherMonitor() {
  const spaceWeather = useMapStore((s) => s.spaceWeather)
  const setSpaceWeather = useMapStore((s) => s.setSpaceWeather)

  if (typeof window === 'undefined') return null
  if (!spaceWeather.open) return null

  const events = spaceWeather.events.length > 0 ? spaceWeather.events : DEMO_EVENTS

  // Filter by event type and alert level
  const filteredEvents = events.filter((event) => {
    if (spaceWeather.eventType !== 'all' && event.type !== spaceWeather.eventType) return false
    if (spaceWeather.alertLevel !== 'all' && event.alertLevel !== spaceWeather.alertLevel) return false
    return true
  })

  const eventsByType = [
    { type: 'CME', count: filteredEvents.filter((e) => e.type === 'cme').length, color: TYPE_COLORS.cme },
    { type: 'Solar Flare', count: filteredEvents.filter((e) => e.type === 'flare').length, color: TYPE_COLORS.flare },
    { type: 'Geo. Storm', count: filteredEvents.filter((e) => e.type === 'geomagnetic_storm').length, color: TYPE_COLORS.geomagnetic_storm },
    { type: 'Radiation', count: filteredEvents.filter((e) => e.type === 'radiation').length, color: TYPE_COLORS.radiation },
  ]

  const overlayToggles: { key: keyof SpaceWeatherState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSolarWind', label: 'Solar Wind', icon: Zap },
    { key: 'showMagneticField', label: 'Magnetic Field', icon: Atom },
    { key: 'showAuroraForecast', label: 'Aurora Forecast', icon: CircleDot },
    { key: 'showRadiationBelt', label: 'Radiation Belt', icon: Radio },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudLightning className="h-4 w-4 text-purple-500" />
              Space Weather Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSpaceWeather({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Event Type & Alert Level filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Event Type</Label>
              <Select
                value={spaceWeather.eventType}
                onValueChange={(v) =>
                  setSpaceWeather({
                    eventType: v as SpaceWeatherState['eventType'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cme">CME</SelectItem>
                  <SelectItem value="flare">Solar Flare</SelectItem>
                  <SelectItem value="geomagnetic_storm">Geomagnetic Storm</SelectItem>
                  <SelectItem value="radiation">Radiation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Alert Level</Label>
              <Select
                value={spaceWeather.alertLevel}
                onValueChange={(v) =>
                  setSpaceWeather({
                    alertLevel: v as SpaceWeatherState['alertLevel'],
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
                  <SelectItem value="strong">Strong</SelectItem>
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
                  <Icon className="h-3 w-3 text-purple-500" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {spaceWeather[key] ? (
                    <Eye className="h-3 w-3 text-purple-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={spaceWeather[key] as boolean}
                    onCheckedChange={(checked) =>
                      setSpaceWeather({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Kp Index Line Chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Kp Index Over Time (storm threshold ≥ 5)
            </Label>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={KP_INDEX_DATA}>
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                    domain={[0, 9]}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(168,85,247,0.3)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="threshold"
                    stroke="#7c3aed"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="kp"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#a855f7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <div className="h-0.5 w-4 bg-purple-400" style={{ borderTop: '2px dashed #7c3aed' }} />
                Storm Threshold
              </div>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-purple-400" />
                Kp Index
              </div>
            </div>
          </div>

          {/* Events by Type Bar Chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Active Events by Type
            </Label>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsByType}>
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(168,85,247,0.3)',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {eventsByType.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Space Weather Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = spaceWeather.activeEventId === event.id
                  const alertColor = ALERT_COLORS[event.alertLevel]
                  const typeColor = TYPE_COLORS[event.type]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-purple-500/50 bg-purple-500/5'
                          : 'border-border/40 hover:border-purple-500/20 hover:bg-purple-500/5'
                      }`}
                      onClick={() =>
                        setSpaceWeather({
                          activeEventId: isActive ? null : event.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: typeColor }}
                          />
                          <span className="text-xs font-medium">{TYPE_LABELS[event.type]}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: alertColor,
                            color: alertColor,
                          }}
                        >
                          {ALERT_LABELS[event.alertLevel]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground mb-1">
                        <div>
                          Kp:{' '}
                          <span className="text-foreground" style={{ color: event.kpIndex >= 5 ? alertColor : undefined }}>
                            {event.kpIndex}
                          </span>
                        </div>
                        <div>
                          Magnitude:{' '}
                          <span className="text-foreground">{event.magnitude}</span>
                        </div>
                        <div>
                          Start:{' '}
                          <span className="text-foreground">
                            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">{event.description}</p>
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
