'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type SpaceObject, type SpaceTrackState } from '@/lib/map-store'
import {
  X,
  Globe,
  ChevronDown,
  ChevronUp,
  Radio,
  RefreshCw,
  Gauge,
  Info,
  Zap,
  Eye,
  EyeOff,
  Shield,
  Star,
  Clock,
  Compass,
  Sun,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

// Demo space objects
const DEMO_OBJECTS: SpaceObject[] = [
  {
    id: 'so1',
    name: 'ISS (ZARYA)',
    noradId: '25544',
    type: 'space_station',
    latitude: 42.36,
    longitude: -71.06,
    altitude: 420,
    velocity: 7.66,
    inclination: 51.6,
    period: 92.68,
    launchDate: '1998-11-20',
    country: 'International',
    status: 'operational',
    visibility: 'visible',
  },
  {
    id: 'so2',
    name: 'HST (Hubble)',
    noradId: '20580',
    type: 'satellite',
    latitude: 28.57,
    longitude: -80.65,
    altitude: 540,
    velocity: 7.59,
    inclination: 28.5,
    period: 95.42,
    launchDate: '1990-04-24',
    country: 'USA',
    status: 'operational',
    visibility: 'shadowed',
  },
  {
    id: 'so3',
    name: 'GPS BIIR-2',
    noradId: '28474',
    type: 'satellite',
    latitude: 35.68,
    longitude: 139.69,
    altitude: 20180,
    velocity: 3.87,
    inclination: 55.0,
    period: 717.96,
    launchDate: '2004-11-06',
    country: 'USA',
    status: 'operational',
    visibility: 'daylight',
  },
  {
    id: 'so4',
    name: 'STARLINK-1007',
    noradId: '44713',
    type: 'satellite',
    latitude: 51.51,
    longitude: -0.13,
    altitude: 550,
    velocity: 7.59,
    inclination: 53.0,
    period: 96.0,
    launchDate: '2021-03-14',
    country: 'USA',
    status: 'operational',
    visibility: 'visible',
  },
  {
    id: 'so5',
    name: 'COSMOS 2251 DEB',
    noradId: '34211',
    type: 'debris',
    latitude: -33.87,
    longitude: 151.21,
    altitude: 780,
    velocity: 7.48,
    inclination: 74.0,
    period: 100.5,
    launchDate: '1993-06-16',
    country: 'Russia',
    status: 'non_operational',
    visibility: 'shadowed',
  },
  {
    id: 'so6',
    name: 'FALCON 9 DEB',
    noradId: '51035',
    type: 'rocket_body',
    latitude: 55.76,
    longitude: 37.62,
    altitude: 280,
    velocity: 7.74,
    inclination: 28.5,
    period: 90.1,
    launchDate: '2022-01-18',
    country: 'USA',
    status: 'decaying',
    visibility: 'visible',
  },
  {
    id: 'so7',
    name: 'TIANHE',
    noradId: '48274',
    type: 'space_station',
    latitude: 39.9,
    longitude: 116.4,
    altitude: 390,
    velocity: 7.68,
    inclination: 41.5,
    period: 92.3,
    launchDate: '2021-04-29',
    country: 'China',
    status: 'operational',
    visibility: 'daylight',
  },
  {
    id: 'so8',
    name: 'VOYAGER 1 (PROBE)',
    noradId: 'N/A',
    type: 'probe',
    latitude: 0,
    longitude: 0,
    altitude: 24000000,
    velocity: 17.0,
    inclination: 0,
    period: 0,
    launchDate: '1977-09-05',
    country: 'USA',
    status: 'operational',
    visibility: 'shadowed',
  },
]

const TYPE_COLORS: Record<SpaceObject['type'], { bg: string; text: string; label: string }> = {
  satellite: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'Satellite' },
  debris: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', label: 'Debris' },
  rocket_body: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', label: 'Rocket Body' },
  space_station: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', label: 'Station' },
  probe: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', label: 'Probe' },
}

const STATUS_COLORS: Record<SpaceObject['status'], { bg: string; text: string }> = {
  operational: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  non_operational: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  decaying: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
}

const VISIBILITY_ICONS: Record<SpaceObject['visibility'], { icon: typeof Eye; label: string }> = {
  visible: { icon: Eye, label: 'Visible' },
  shadowed: { icon: EyeOff, label: 'Shadowed' },
  daylight: { icon: Sun, label: 'Daylight' },
}

// Avoid TS type conflict - Sun is from lucide-react

function getAltitudeColor(alt: number): string {
  if (alt < 600) return '#3b82f6'
  if (alt < 2000) return '#22c55e'
  if (alt < 20200) return '#eab308'
  if (alt < 35786) return '#f97316'
  return '#ef4444'
}

export function SpaceTrackViewer() {
  const spaceTrack = useMapStore((s) => s.spaceTrack)
  const setSpaceTrack = useMapStore((s) => s.setSpaceTrack)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Use demo data if store is empty
  const objects = spaceTrack.objects.length > 0 ? spaceTrack.objects : DEMO_OBJECTS

  const filteredObjects = useMemo(() => {
    let list = objects
    if (spaceTrack.filterType.length > 0) {
      list = list.filter((o) => spaceTrack.filterType.includes(o.type))
    }
    if (spaceTrack.filterCountry.length > 0) {
      list = list.filter((o) => spaceTrack.filterCountry.includes(o.country))
    }
    list = list.filter(
      (o) => o.altitude >= spaceTrack.altitudeRange[0] && o.altitude <= spaceTrack.altitudeRange[1]
    )
    return list
  }, [objects, spaceTrack.filterType, spaceTrack.filterCountry, spaceTrack.altitudeRange])

  // Altitude distribution chart
  const altDistData = useMemo(() => {
    const bins = [
      { range: 'LEO <600', min: 0, max: 600 },
      { range: 'LEO 600-2k', min: 600, max: 2000 },
      { range: 'MEO', min: 2000, max: 20200 },
      { range: 'GEO', min: 20200, max: 35786 },
      { range: 'Deep', min: 35786, max: Infinity },
    ]
    return bins.map((bin) => ({
      range: bin.range,
      count: objects.filter((o) => o.altitude >= bin.min && o.altitude < bin.max).length,
      fill: getAltitudeColor((bin.min + (bin.max === Infinity ? 36000 : bin.max)) / 2),
    }))
  }, [objects])

  // Type distribution for pie chart
  const typePieData = useMemo(() => {
    const typeCounts: Record<string, number> = {}
    for (const obj of filteredObjects) {
      typeCounts[obj.type] = (typeCounts[obj.type] || 0) + 1
    }
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: TYPE_COLORS[type as SpaceObject['type']]?.label ?? type,
      value: count,
      fill: type === 'satellite' ? '#3b82f6' : type === 'debris' ? '#6b7280' : type === 'rocket_body' ? '#f97316' : type === 'space_station' ? '#a855f7' : '#06b6d4',
    }))
  }, [filteredObjects])

  // Available countries
  const countries = useMemo(() => {
    const set = new Set(objects.map((o) => o.country))
    return Array.from(set).sort()
  }, [objects])

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current)
      autoRefreshRef.current = null
    }
    if (spaceTrack.autoRefresh && typeof window !== 'undefined') {
      autoRefreshRef.current = setInterval(() => {
        // Simulate position updates for demo
        // Position update simulation (no-op for demo)
        setSpaceTrack({})
      }, 30000)
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current)
    }
  }, [spaceTrack.autoRefresh, setSpaceTrack])

  const toggleFilterType = useCallback(
    (type: string) => {
      const current = spaceTrack.filterType
      const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
      setSpaceTrack({ filterType: next })
    },
    [spaceTrack.filterType, setSpaceTrack]
  )

  const toggleFilterCountry = useCallback(
    (country: string) => {
      const current = spaceTrack.filterCountry
      const next = current.includes(country) ? current.filter((c) => c !== country) : [...current, country]
      setSpaceTrack({ filterCountry: next })
    },
    [spaceTrack.filterCountry, setSpaceTrack]
  )

  if (!spaceTrack.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-4 top-16 z-[40] w-[420px] max-h-[calc(100vh-5rem)]"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-cyan-500" />
                <CardTitle className="text-base font-semibold">Space Track Viewer</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredObjects.length} objects
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSpaceTrack({ open: false })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pb-4">
            {/* Overlay toggles */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showOrbits' as const, label: 'Orbits', icon: Radio },
                  { key: 'showGroundTracks' as const, label: 'Ground Tracks', icon: Globe },
                  { key: 'showFootprints' as const, label: 'Footprints', icon: Compass },
                  { key: 'showDebris' as const, label: 'Debris Field', icon: Shield },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={spaceTrack[key]}
                      onCheckedChange={(checked) => setSpaceTrack({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Filters */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filters</p>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Object Type</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(TYPE_COLORS).map(([type, { bg, text, label }]) => (
                    <Badge
                      key={type}
                      variant={spaceTrack.filterType.includes(type) ? 'default' : 'outline'}
                      className={`text-[10px] cursor-pointer ${
                        spaceTrack.filterType.includes(type) ? `${bg} ${text} border-0` : ''
                      }`}
                      onClick={() => toggleFilterType(type)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Country</p>
                <div className="flex flex-wrap gap-1">
                  {countries.map((country) => (
                    <Badge
                      key={country}
                      variant={spaceTrack.filterCountry.includes(country) ? 'default' : 'outline'}
                      className="text-[10px] cursor-pointer"
                      onClick={() => toggleFilterCountry(country)}
                    >
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Altitude Range Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Altitude Range</p>
                <span className="text-[10px] text-muted-foreground">
                  {spaceTrack.altitudeRange[0]} - {spaceTrack.altitudeRange[1].toLocaleString()} km
                </span>
              </div>
              <Slider
                value={spaceTrack.altitudeRange}
                min={160}
                max={36000}
                step={100}
                onValueChange={(value) => setSpaceTrack({ altitudeRange: value as [number, number] })}
                className="w-full"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>LEO 160km</span>
                <span>MEO</span>
                <span>GEO 36,000km</span>
              </div>
            </div>

            <Separator />

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Altitude Distribution */}
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Altitude Dist.</p>
                <div className="h-32 rounded-lg bg-muted/30 p-1.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={altDistData} margin={{ top: 2, right: 2, bottom: 2, left: -10 }}>
                      <XAxis dataKey="range" tick={{ fontSize: 7 }} angle={-20} textAnchor="end" height={30} />
                      <YAxis tick={{ fontSize: 7 }} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{
                          fontSize: 10,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                        {altDistData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Type Pie Chart */}
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Type Breakdown</p>
                <div className="h-32 rounded-lg bg-muted/30 p-1.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={40}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {typePieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          fontSize: 10,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(0,0,0,0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Auto-refresh toggle */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs cursor-pointer">Auto-refresh (30s)</Label>
              </div>
              <Switch
                checked={spaceTrack.autoRefresh}
                onCheckedChange={(checked) => setSpaceTrack({ autoRefresh: checked })}
                className="scale-75"
              />
            </div>

            <Separator />

            {/* Orbit visualization concept */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Orbit Visualization</p>
              <div className="h-28 rounded-lg bg-muted/30 relative overflow-hidden flex items-center justify-center">
                {/* Simplified orbit rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[0.25, 0.4, 0.55, 0.7, 0.85].map((scale, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full border border-cyan-500/20"
                      style={{
                        width: `${scale * 100}%`,
                        height: `${scale * 100}%`,
                      }}
                    />
                  ))}
                  {/* Earth center */}
                  <div className="absolute w-4 h-4 rounded-full bg-blue-500/30 border border-blue-500/50" />
                  {/* Object dots */}
                  {filteredObjects.slice(0, 5).map((obj, i) => {
                    const angle = (i * 72 * Math.PI) / 180
                    const radius = 15 + (obj.altitude / 36000) * 45
                    return (
                      <div
                        key={obj.id}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: getAltitudeColor(obj.altitude),
                          transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
                        }}
                      />
                    )
                  })}
                </div>
                <span className="absolute bottom-1 right-2 text-[8px] text-muted-foreground">Conceptual</span>
              </div>
            </div>

            <Separator />

            {/* Object list */}
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2">
                {filteredObjects.map((obj) => {
                  const isExpanded = expandedId === obj.id
                  const typeStyle = TYPE_COLORS[obj.type]
                  const statusStyle = STATUS_COLORS[obj.status]
                  const VisIcon = VISIBILITY_ICONS[obj.visibility]?.icon ?? Eye

                  return (
                    <div
                      key={obj.id}
                      className="rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : obj.id)}
                    >
                      <div className="flex items-center justify-between p-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="h-4 w-4 text-cyan-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{obj.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {obj.altitude.toLocaleString()}km · {obj.velocity} km/s
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={`${typeStyle.bg} ${typeStyle.text} text-[9px] border-0`}>
                            {typeStyle.label}
                          </Badge>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text} text-[9px] border-0 capitalize`}>
                            {obj.status.replace('_', ' ')}
                          </Badge>
                          <VisIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2.5 pb-2.5 space-y-2">
                              <Separator />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">NORAD:</span>
                                  <span className="font-medium">{obj.noradId}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Gauge className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Alt:</span>
                                  <span className="font-medium">{obj.altitude.toLocaleString()} km</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Zap className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Vel:</span>
                                  <span className="font-medium">{obj.velocity} km/s</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Compass className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Incl:</span>
                                  <span className="font-medium">{obj.inclination}°</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Period:</span>
                                  <span className="font-medium">{obj.period > 0 ? `${obj.period.toFixed(1)} min` : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Star className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Launch:</span>
                                  <span className="font-medium">{obj.launchDate}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Shield className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Country:</span>
                                  <span className="font-medium">{obj.country}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <VisIcon className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Visibility:</span>
                                  <span className="font-medium capitalize">{obj.visibility}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
