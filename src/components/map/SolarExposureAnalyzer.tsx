'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useMapStore, type SolarData } from '@/lib/map-store'
import {
  Sun,
  Sunrise,
  Sunset,
  Clock,
  Ruler,
  Zap,
  Compass,
  MapPin,
  Calendar,
  Building2,
} from 'lucide-react'

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

function toJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

function calculateSolarData(lat: number, lng: number, dateStr: string, buildingHeight: number): SolarData {
  const date = new Date(dateStr + 'T12:00:00Z')
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 0).getTime()) / 86400000)

  // Solar declination (Cooper's equation)
  const declination = 23.45 * Math.sin(DEG_TO_RAD * (360 / 365) * (dayOfYear - 81))

  // Hour angle at sunrise/sunset
  const latRad = lat * DEG_TO_RAD
  const decRad = declination * DEG_TO_RAD
  const cosHA = -Math.tan(latRad) * Math.tan(decRad)

  let dayLengthHours: number
  let sunriseHour: number
  let sunsetHour: number

  if (cosHA > 1) {
    // Polar night
    dayLengthHours = 0
    sunriseHour = 12
    sunsetHour = 12
  } else if (cosHA < -1) {
    // Midnight sun
    dayLengthHours = 24
    sunriseHour = 0
    sunsetHour = 24
  } else {
    const HA = Math.acos(cosHA) * RAD_TO_DEG
    dayLengthHours = 2 * HA / 15
    sunriseHour = 12 - HA / 15
    sunsetHour = 12 + HA / 15
  }

  // Solar noon correction for longitude (simplified)
  const solarNoonCorrection = lng / 15
  const solarNoonHour = 12 - solarNoonCorrection

  // Max elevation angle
  const maxElevation = 90 - Math.abs(lat - declination)

  // Total daily radiation (simplified sine model)
  const clearnessIndex = 0.5 + 0.3 * Math.cos(DEG_TO_RAD * (dayOfYear - 172) * 360 / 365)
  const solarConstant = 1367 // W/m2
  const airMass = maxElevation > 0 ? 1 / Math.sin(DEG_TO_RAD * Math.max(maxElevation, 1)) : 999
  const peakIrradiance = solarConstant * Math.pow(0.7, Math.pow(airMass, 0.678)) * clearnessIndex
  const totalRadiation = peakIrradiance * dayLengthHours * 3600 / 1e6 * 0.5 // kWh/m2

  // Monthly averages using sine approximation
  const monthlyAverages: number[] = []
  for (let m = 0; m < 12; m++) {
    const monthDay = Math.floor(30.5 * m + 10)
    const monthDec = 23.45 * Math.sin(DEG_TO_RAD * (360 / 365) * (monthDay - 81))
    const monthMaxElev = 90 - Math.abs(lat - monthDec)
    const monthCosHA = -Math.tan(latRad) * Math.tan(monthDec * DEG_TO_RAD)
    const monthDayLen = monthCosHA < -1 ? 24 : monthCosHA > 1 ? 0 : 2 * Math.acos(Math.max(-1, Math.min(1, monthCosHA))) * RAD_TO_DEG / 15
    const monthAM = monthMaxElev > 0 ? 1 / Math.sin(DEG_TO_RAD * Math.max(monthMaxElev, 1)) : 999
    const monthPeak = solarConstant * Math.pow(0.7, Math.pow(Math.min(monthAM, 40), 0.678)) * clearnessIndex
    const monthRad = monthPeak * monthDayLen * 3600 / 1e6 * 0.5
    monthlyAverages.push(Math.max(0, monthRad))
  }

  // Hourly shadow lengths
  const shadowLengths: Array<{ hour: number; length: number; direction: number }> = []
  for (let h = Math.floor(Math.max(0, sunriseHour)); h <= Math.ceil(Math.min(24, sunsetHour)); h++) {
    const hourAngle = (h - 12) * 15 * DEG_TO_RAD
    const elevation = Math.asin(
      Math.sin(decRad) * Math.sin(latRad) +
      Math.cos(decRad) * Math.cos(latRad) * Math.cos(hourAngle)
    ) * RAD_TO_DEG

    if (elevation > 0) {
      const shadowLen = buildingHeight / Math.tan(Math.max(elevation, 0.1) * DEG_TO_RAD)
      const azimuth = Math.atan2(
        Math.sin(hourAngle),
        Math.cos(hourAngle) * Math.sin(latRad) - Math.tan(decRad) * Math.cos(latRad)
      ) * RAD_TO_DEG
      shadowLengths.push({
        hour: h,
        length: Math.min(shadowLen, 1000),
        direction: ((azimuth + 180) % 360 + 360) % 360,
      })
    }
  }

  // Format times
  const formatTime = (h: number): string => {
    const hours = Math.floor(h)
    const minutes = Math.round((h - hours) * 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  return {
    latitude: lat,
    longitude: lng,
    date: dateStr,
    sunrise: formatTime(sunriseHour),
    sunset: formatTime(sunsetHour),
    solarNoon: formatTime(solarNoonHour),
    dayLength: dayLengthHours,
    maxElevation: Math.max(0, maxElevation),
    totalRadiation: Math.max(0, totalRadiation),
    monthlyAverages,
    shadowLengths,
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function SolarExposureAnalyzer() {
  const { solarExposure, setSolarExposure, center } = useMapStore()
  const open = solarExposure.open

  const point = solarExposure.analyzerPoint || { latitude: center[1], longitude: center[0] }

  const setOpen = useCallback((v: boolean) => {
    setSolarExposure({ open: v })
  }, [setSolarExposure])

  const calculate = useCallback(() => {
    const data = calculateSolarData(point.latitude, point.longitude, solarExposure.date, solarExposure.buildingHeight)
    setSolarExposure({ data })
  }, [point, solarExposure.date, solarExposure.buildingHeight, setSolarExposure])

  const chartData = useMemo(() => {
    if (!solarExposure.data) return []
    return solarExposure.data.monthlyAverages.map((val, i) => ({
      month: MONTHS[i],
      radiation: Math.round(val * 100) / 100,
    }))
  }, [solarExposure.data])

  const data = solarExposure.data

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col" aria-label="Solar Exposure Analyzer">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
              <Sun className="size-5 text-yellow-500 inline mr-1" />
              Solar Exposure Analyzer
            </span>
          </DialogTitle>
          <DialogDescription>Analyze solar exposure and shadow patterns at any location</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Input section */}
          <Card className="border-yellow-200 dark:border-yellow-900/40">
            <CardContent className="pt-3 pb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <MapPin className="size-3" /> Latitude
                  </Label>
                  <Input
                    type="number" step="0.0001"
                    value={point.latitude}
                    onChange={(e) => setSolarExposure({
                      analyzerPoint: { ...point, latitude: parseFloat(e.target.value) || 0 },
                    })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <MapPin className="size-3" /> Longitude
                  </Label>
                  <Input
                    type="number" step="0.0001"
                    value={point.longitude}
                    onChange={(e) => setSolarExposure({
                      analyzerPoint: { ...point, longitude: parseFloat(e.target.value) || 0 },
                    })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Calendar className="size-3" /> Date
                  </Label>
                  <Input
                    type="date"
                    value={solarExposure.date}
                    onChange={(e) => setSolarExposure({ date: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Building2 className="size-3" /> Building Height (m)
                  </Label>
                  <Input
                    type="number" min="0" step="0.5"
                    value={solarExposure.buildingHeight}
                    onChange={(e) => setSolarExposure({ buildingHeight: parseFloat(e.target.value) || 10 })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={solarExposure.showShadowPath}
                    onCheckedChange={(v) => setSolarExposure({ showShadowPath: v })}
                  />
                  <Label className="text-xs">Shadow Path</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={solarExposure.showRadiationMap}
                    onCheckedChange={(v) => setSolarExposure({ showRadiationMap: v })}
                  />
                  <Label className="text-xs">Radiation Map</Label>
                </div>
              </div>
              <Button
                onClick={calculate}
                className="w-full h-8 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
              >
                <Sun className="size-4 mr-1" /> Calculate Solar Exposure
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {data && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Sun position data cards */}
                <div className="grid grid-cols-2 gap-2">
                  <Card className="border-yellow-200 dark:border-yellow-900/30 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
                    <CardContent className="p-3 flex items-center gap-2">
                      <Sunrise className="size-4 text-orange-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Sunrise</p>
                        <p className="text-sm font-semibold">{data.sunrise}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 dark:border-yellow-900/30 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                    <CardContent className="p-3 flex items-center gap-2">
                      <Sunset className="size-4 text-red-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Sunset</p>
                        <p className="text-sm font-semibold">{data.sunset}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 dark:border-yellow-900/30 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
                    <CardContent className="p-3 flex items-center gap-2">
                      <Clock className="size-4 text-yellow-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Solar Noon</p>
                        <p className="text-sm font-semibold">{data.solarNoon}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 dark:border-yellow-900/30 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
                    <CardContent className="p-3 flex items-center gap-2">
                      <Sun className="size-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Day Length</p>
                        <p className="text-sm font-semibold">{data.dayLength.toFixed(1)}h</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg border border-yellow-200 dark:border-yellow-900/30 bg-yellow-50/50 dark:bg-yellow-950/10">
                    <Ruler className="size-3 text-yellow-600 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Max Elevation</p>
                    <p className="text-sm font-semibold">{data.maxElevation.toFixed(1)}°</p>
                  </div>
                  <div className="text-center p-2 rounded-lg border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10">
                    <Zap className="size-3 text-amber-600 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Daily Radiation</p>
                    <p className="text-sm font-semibold">{data.totalRadiation.toFixed(2)}</p>
                    <p className="text-[9px] text-muted-foreground">kWh/m²</p>
                  </div>
                  <div className="text-center p-2 rounded-lg border border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/10">
                    <Compass className="size-3 text-orange-600 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Shadows</p>
                    <p className="text-sm font-semibold">{data.shadowLengths.length}</p>
                    <p className="text-[9px] text-muted-foreground">data points</p>
                  </div>
                </div>

                <Separator />

                {/* Monthly radiation chart */}
                <Card className="border-yellow-200 dark:border-yellow-900/30">
                  <CardHeader className="pb-1 pt-2 px-3">
                    <CardTitle className="text-xs flex items-center gap-1">
                      <Zap className="size-3 text-amber-500" /> Monthly Radiation (kWh/m²)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-2">
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 10 }}
                            stroke="var(--muted-foreground)"
                          />
                          <YAxis
                            tick={{ fontSize: 10 }}
                            stroke="var(--muted-foreground)"
                            label={{ value: 'kWh/m²', angle: -90, position: 'insideLeft', fontSize: 9 }}
                          />
                          <Tooltip
                            contentStyle={{
                              fontSize: 11,
                              borderRadius: 6,
                              border: '1px solid var(--border)',
                              background: 'var(--background)',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="radiation"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ fill: '#f59e0b', r: 3 }}
                            activeDot={{ r: 5, fill: '#d97706' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Shadow direction visualization */}
                {data.shadowLengths.length > 0 && (
                  <Card className="border-yellow-200 dark:border-yellow-900/30">
                    <CardHeader className="pb-1 pt-2 px-3">
                      <CardTitle className="text-xs flex items-center gap-1">
                        <Compass className="size-3 text-orange-500" /> Hourly Shadow Direction
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-2">
                      <div className="flex flex-wrap gap-1.5">
                        {data.shadowLengths.map((s) => (
                          <Badge
                            key={s.hour}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-amber-300 dark:border-amber-700"
                          >
                            {s.hour}:00 → {s.length.toFixed(0)}m @ {s.direction.toFixed(0)}°
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
