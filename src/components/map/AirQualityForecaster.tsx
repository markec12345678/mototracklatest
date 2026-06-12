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
import { useMapStore, type AQStation } from '@/lib/map-store'
import {
  X,
  Eye,
  EyeOff,
  Wind,
  Activity,
  Thermometer,
  Filter,
  Globe,
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

type AirQualityState = ReturnType<typeof useMapStore.getState>['airQualityForecaster']

const DEMO_STATIONS: (AQStation & { no2: number; so2: number })[] = [
  {
    id: 'aq1',
    name: 'Beijing',
    latitude: 39.9,
    longitude: 116.4,
    aqi: 178,
    pm25: 134.5,
    pm10: 189.2,
    o3: 62.1,
    category: 'unhealthy',
    no2: 78.3,
    so2: 22.1,
  },
  {
    id: 'aq2',
    name: 'Delhi',
    latitude: 28.6,
    longitude: 77.2,
    aqi: 312,
    pm25: 245.8,
    pm10: 312.4,
    o3: 48.3,
    category: 'hazardous',
    no2: 92.7,
    so2: 35.4,
  },
  {
    id: 'aq3',
    name: 'Los Angeles',
    latitude: 34.05,
    longitude: -118.24,
    aqi: 82,
    pm25: 28.4,
    pm10: 45.1,
    o3: 95.6,
    category: 'moderate',
    no2: 34.2,
    so2: 5.1,
  },
  {
    id: 'aq4',
    name: 'London',
    latitude: 51.5,
    longitude: -0.12,
    aqi: 42,
    pm25: 12.3,
    pm10: 22.5,
    o3: 55.2,
    category: 'good',
    no2: 28.4,
    so2: 3.8,
  },
  {
    id: 'aq5',
    name: 'Cairo',
    latitude: 30.04,
    longitude: 31.24,
    aqi: 165,
    pm25: 112.7,
    pm10: 198.3,
    o3: 72.4,
    category: 'unhealthy',
    no2: 65.8,
    so2: 28.9,
  },
  {
    id: 'aq6',
    name: 'Tokyo',
    latitude: 35.68,
    longitude: 139.69,
    aqi: 55,
    pm25: 18.2,
    pm10: 32.4,
    o3: 68.5,
    category: 'moderate',
    no2: 31.6,
    so2: 6.2,
  },
  {
    id: 'aq7',
    name: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
    aqi: 98,
    pm25: 35.6,
    pm10: 58.2,
    o3: 82.1,
    category: 'moderate',
    no2: 48.3,
    so2: 8.9,
  },
  {
    id: 'aq8',
    name: 'Lagos',
    latitude: 6.52,
    longitude: 3.38,
    aqi: 145,
    pm25: 88.4,
    pm10: 152.7,
    o3: 54.2,
    category: 'unhealthy_sensitive',
    no2: 56.7,
    so2: 19.5,
  },
]

const AQI_COLORS: Record<string, string> = {
  good: '#22c55e',
  moderate: '#eab308',
  unhealthy_sensitive: '#f97316',
  unhealthy: '#ef4444',
  very_unhealthy: '#a855f7',
  hazardous: '#881337',
}

const AQI_LABELS: Record<string, string> = {
  good: 'Good',
  moderate: 'Moderate',
  unhealthy_sensitive: 'Unhealthy (SG)',
  unhealthy: 'Unhealthy',
  very_unhealthy: 'Very Unhealthy',
  hazardous: 'Hazardous',
}

const POLLUTANT_LABELS: Record<string, string> = {
  aqi: 'AQI',
  pm25: 'PM2.5',
  pm10: 'PM10',
  o3: 'O₃',
  no2: 'NO₂',
  so2: 'SO₂',
}

const FORECAST_LABELS: Record<string, string> = {
  current: 'Current',
  '24h': '24h Forecast',
  '48h': '48h Forecast',
  '7d': '7-Day Forecast',
}

const AQI_FORECAST_DATA = [
  { hour: 'Now', beijing: 178, delhi: 312, la: 82, london: 42, cairo: 165, tokyo: 55, saoPaulo: 98, lagos: 145 },
  { hour: '+3h', beijing: 185, delhi: 320, la: 78, london: 40, cairo: 172, tokyo: 52, saoPaulo: 95, lagos: 150 },
  { hour: '+6h', beijing: 192, delhi: 335, la: 72, london: 38, cairo: 180, tokyo: 48, saoPaulo: 92, lagos: 155 },
  { hour: '+9h', beijing: 175, delhi: 328, la: 68, london: 35, cairo: 168, tokyo: 45, saoPaulo: 88, lagos: 148 },
  { hour: '+12h', beijing: 160, delhi: 310, la: 65, london: 33, cairo: 155, tokyo: 42, saoPaulo: 85, lagos: 140 },
  { hour: '+18h', beijing: 145, delhi: 295, la: 70, london: 36, cairo: 142, tokyo: 46, saoPaulo: 90, lagos: 135 },
  { hour: '+24h', beijing: 152, delhi: 305, la: 75, london: 39, cairo: 148, tokyo: 50, saoPaulo: 93, lagos: 138 },
  { hour: '+48h', beijing: 140, delhi: 280, la: 80, london: 44, cairo: 135, tokyo: 53, saoPaulo: 96, lagos: 132 },
  { hour: '+7d', beijing: 130, delhi: 260, la: 85, london: 48, cairo: 128, tokyo: 58, saoPaulo: 100, lagos: 128 },
]

const FORECAST_LINE_COLORS = [
  '#ef4444', '#881337', '#eab308', '#22c55e', '#f97316', '#3b82f6', '#a855f7', '#ec4899',
]

const FORECAST_LEGEND_NAMES = [
  'Beijing', 'Delhi', 'LA', 'London', 'Cairo', 'Tokyo', 'São Paulo', 'Lagos',
]

export function AirQualityForecaster() {
  const airQualityForecaster = useMapStore((s) => s.airQualityForecaster)
  const setAirQualityForecaster = useMapStore((s) => s.setAirQualityForecaster)

  if (typeof window === 'undefined') return null
  if (!airQualityForecaster.open) return null

  const stations = airQualityForecaster.stations.length > 0
    ? airQualityForecaster.stations
    : DEMO_STATIONS

  const getPollutantValue = (station: AQStation, pollutant: string): number => {
    const extended = station as AQStation & { no2?: number; so2?: number }
    switch (pollutant) {
      case 'aqi': return station.aqi
      case 'pm25': return station.pm25
      case 'pm10': return station.pm10
      case 'o3': return station.o3
      case 'no2': return extended.no2 ?? 0
      case 'so2': return extended.so2 ?? 0
      default: return station.aqi
    }
  }

  const pollutantBarData = stations.map((s) => ({
    name: s.name.length > 10 ? s.name.substring(0, 10) + '…' : s.name,
    value: getPollutantValue(s, airQualityForecaster.pollutant),
    category: s.category,
  }))

  const overlayToggles: { key: keyof AirQualityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAQI', label: 'AQI', icon: Activity },
    { key: 'showPM25', label: 'PM2.5', icon: Thermometer },
    { key: 'showPM10', label: 'PM10', icon: Wind },
    { key: 'showOzone', label: 'Ozone', icon: Globe },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-500" />
              Air Quality Forecaster
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAirQualityForecaster({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Pollutant & Forecast selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Pollutant</Label>
              <Select
                value={airQualityForecaster.pollutant}
                onValueChange={(v) =>
                  setAirQualityForecaster({
                    pollutant: v as AirQualityState['pollutant'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aqi">AQI</SelectItem>
                  <SelectItem value="pm25">PM2.5</SelectItem>
                  <SelectItem value="pm10">PM10</SelectItem>
                  <SelectItem value="o3">O₃</SelectItem>
                  <SelectItem value="no2">NO₂</SelectItem>
                  <SelectItem value="so2">SO₂</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Forecast</Label>
              <Select
                value={airQualityForecaster.forecast}
                onValueChange={(v) =>
                  setAirQualityForecaster({
                    forecast: v as AirQualityState['forecast'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="24h">24h Forecast</SelectItem>
                  <SelectItem value="48h">48h Forecast</SelectItem>
                  <SelectItem value="7d">7-Day Forecast</SelectItem>
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
                  <Icon className="h-3 w-3 text-green-500" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {airQualityForecaster[key] ? (
                    <Eye className="h-3 w-3 text-green-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={airQualityForecaster[key] as boolean}
                    onCheckedChange={(checked) =>
                      setAirQualityForecaster({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* AQI Forecast Line Chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              AQI Forecast — {FORECAST_LABELS[airQualityForecaster.forecast]}
            </Label>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={AQI_FORECAST_DATA}>
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
                    width={32}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(34,197,94,0.3)',
                    }}
                  />
                  {['beijing', 'delhi', 'la', 'london', 'cairo', 'tokyo', 'saoPaulo', 'lagos'].map(
                    (key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={FORECAST_LINE_COLORS[i]}
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
              {FORECAST_LEGEND_NAMES.map((name, i) => (
                <div key={name} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: FORECAST_LINE_COLORS[i] }}
                  />
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* Pollutant Bar Chart by Station */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {POLLUTANT_LABELS[airQualityForecaster.pollutant]} by Station
            </Label>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pollutantBarData} layout="vertical">
                  <XAxis
                    type="number"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    width={65}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(34,197,94,0.3)',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {pollutantBarData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={AQI_COLORS[entry.category]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Monitoring Stations ({stations.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {stations.map((station) => {
                  const isActive = airQualityForecaster.activeStationId === station.id
                  const aqiColor = AQI_COLORS[station.category]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-border/40 hover:border-green-500/20 hover:bg-green-500/5'
                      }`}
                      onClick={() =>
                        setAirQualityForecaster({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{station.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: aqiColor,
                            color: aqiColor,
                          }}
                        >
                          {AQI_LABELS[station.category]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          AQI:{' '}
                          <span className="text-foreground" style={{ color: aqiColor }}>
                            {station.aqi}
                          </span>
                        </div>
                        <div>
                          PM2.5:{' '}
                          <span className="text-foreground">{station.pm25}</span>
                        </div>
                        <div>
                          PM10:{' '}
                          <span className="text-foreground">{station.pm10}</span>
                        </div>
                        <div>
                          O₃:{' '}
                          <span className="text-foreground">{station.o3}</span>
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
