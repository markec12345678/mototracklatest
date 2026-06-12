'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type MigrationRoute } from '@/lib/map-store'
import {
  X,
  Bird,
  Fish,
  ChevronDown,
  ChevronUp,
  MapPin,
  Globe,
  TreePine,
  Leaf,
  Activity,
  Info,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

// Demo migration route data
const DEMO_ROUTES: MigrationRoute[] = [
  { id: 'mr1', species: 'Arctic Tern', name: 'Arctic-Antarctic Flyway', coordinates: [[-20, 70], [0, 50], [20, 30], [30, -30], [20, -60]], distance: 71000, duration: 90, status: 'active' },
  { id: 'mr2', species: 'Monarch Butterfly', name: 'Canada-Mexico Corridor', coordinates: [[-90, 45], [-95, 38], [-100, 30], [-100, 20]], distance: 4800, duration: 75, status: 'active' },
  { id: 'mr3', species: 'Humpback Whale', name: 'Alaska-Hawaii Route', coordinates: [[-150, 60], [-155, 45], [-158, 30], [-156, 20]], distance: 8300, duration: 60, status: 'delayed' },
  { id: 'mr4', species: 'Wildebeest', name: 'Serengeti Migration', coordinates: [[35, -2], [34, -3], [35, -4], [36, -3]], distance: 3000, duration: 180, status: 'active' },
  { id: 'mr5', species: 'Salmon', name: 'Pacific Upstream Run', coordinates: [[-125, 48], [-123, 49], [-120, 50]], distance: 1500, duration: 45, status: 'blocked' },
  { id: 'mr6', species: 'Caribou', name: 'Arctic Tundra Route', coordinates: [[-100, 65], [-95, 60], [-90, 55]], distance: 5000, duration: 120, status: 'delayed' },
]

const STATUS_STYLES: Record<MigrationRoute['status'], { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  delayed: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  blocked: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

const SPECIES_ICONS: Record<string, typeof Bird> = {
  'Arctic Tern': Bird,
  'Monarch Butterfly': Leaf,
  'Humpback Whale': Fish,
  'Wildebeest': TreePine,
  'Salmon': Fish,
  'Caribou': TreePine,
}

const SPECIES_TYPE: Record<string, 'birds' | 'mammals' | 'fish' | 'insects'> = {
  'Arctic Tern': 'birds',
  'Monarch Butterfly': 'insects',
  'Humpback Whale': 'mammals',
  'Wildebeest': 'mammals',
  'Salmon': 'fish',
  'Caribou': 'mammals',
}

const SEASONS: { value: 'spring' | 'summer' | 'autumn' | 'winter'; label: string }[] = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'winter', label: 'Winter' },
]

const SPECIES_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Species' },
  { value: 'birds', label: 'Birds' },
  { value: 'mammals', label: 'Mammals' },
  { value: 'fish', label: 'Fish' },
  { value: 'insects', label: 'Insects' },
]

export function WildlifeMigrationTracker() {
  const wildlifeMigration = useMapStore((s) => s.wildlifeMigration)
  const setWildlifeMigration = useMapStore((s) => s.setWildlifeMigration)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const routes = wildlifeMigration.routes.length > 0 ? wildlifeMigration.routes : DEMO_ROUTES

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const speciesType = SPECIES_TYPE[r.species]
      const matchesSpecies = wildlifeMigration.species === 'all' || speciesType === wildlifeMigration.species
      return matchesSpecies
    })
  }, [routes, wildlifeMigration.species])

  const migrationTimingData = useMemo(() => {
    return [
      { season: 'Spring', birds: 92, mammals: 65, fish: 78, insects: 85 },
      { season: 'Summer', birds: 45, mammals: 30, fish: 60, insects: 40 },
      { season: 'Autumn', birds: 88, mammals: 55, fish: 70, insects: 75 },
      { season: 'Winter', birds: 20, mammals: 15, fish: 35, insects: 10 },
    ]
  }, [])

  const routeDistanceData = useMemo(() => {
    return [...filteredRoutes]
      .sort((a, b) => b.distance - a.distance)
      .map((r) => ({
        name: r.species.length > 12 ? r.species.slice(0, 12) + '…' : r.species,
        distance: +(r.distance / 1000).toFixed(1),
        color: r.status === 'active' ? '#22c55e' : r.status === 'delayed' ? '#eab308' : '#ef4444',
      }))
  }, [filteredRoutes])

  if (typeof window === 'undefined') return null
  if (!wildlifeMigration.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-16 right-4 z-30 w-[400px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-background/90 border shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bird className="h-4 w-4 text-emerald-500" />
                Wildlife Migration Tracker
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredRoutes.length} routes
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setWildlifeMigration({ open: false })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Season Selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Season</p>
              <div className="flex flex-wrap gap-1">
                {SEASONS.map((s) => (
                  <Badge
                    key={s.value}
                    variant={wildlifeMigration.season === s.value ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setWildlifeMigration({ season: s.value })}
                  >
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Species Filter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Species Filter</p>
              <div className="flex flex-wrap gap-1">
                {SPECIES_FILTERS.map((f) => (
                  <Badge
                    key={f.value}
                    variant={wildlifeMigration.species === f.value ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setWildlifeMigration({ species: f.value as MigrationRoute['species'] & string })}
                  >
                    {f.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Overlay toggles */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showRoutes' as const, label: 'Routes', icon: Globe },
                  { key: 'showCorridors' as const, label: 'Corridors', icon: Activity },
                  { key: 'showStopPoints' as const, label: 'Stop Points', icon: MapPin },
                  { key: 'showBarriers' as const, label: 'Barriers', icon: Info },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={wildlifeMigration[key]}
                      onCheckedChange={(checked) => setWildlifeMigration({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Line chart: migration timing by season */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Migration Activity by Season</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={migrationTimingData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="season" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Line type="monotone" dataKey="birds" stroke="#22c55e" strokeWidth={1.5} dot={{ r: 3 }} name="Birds" />
                    <Line type="monotone" dataKey="mammals" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} name="Mammals" />
                    <Line type="monotone" dataKey="fish" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 3 }} name="Fish" />
                    <Line type="monotone" dataKey="insects" stroke="#a855f7" strokeWidth={1.5} dot={{ r: 3 }} name="Insects" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Horizontal bar chart: route distances */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Route Distances (×1000 km)</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routeDistanceData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" tick={{ fontSize: 7 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 7 }} width={80} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value}k km`, 'Distance']}
                    />
                    <Bar dataKey="distance" radius={[0, 4, 4, 0]}>
                      {routeDistanceData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Route list */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {filteredRoutes.map((route) => {
                  const statusStyle = STATUS_STYLES[route.status]
                  const SpeciesIcon = SPECIES_ICONS[route.species] || Bird
                  const isExpanded = expandedId === route.id

                  return (
                    <div
                      key={route.id}
                      className={`rounded-lg border transition-colors cursor-pointer ${
                        wildlifeMigration.activeRouteId === route.id
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-500/5'
                          : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setExpandedId(isExpanded ? null : route.id)
                        setWildlifeMigration({ activeRouteId: route.id })
                      }}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`h-2 w-2 rounded-full ${statusStyle.dot} shrink-0 ${route.status === 'active' ? 'animate-pulse' : ''}`} />
                          <SpeciesIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{route.species}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {(route.distance / 1000).toFixed(1)}k km · {route.duration} days
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={`${statusStyle.bg} ${statusStyle.text} text-[9px] border-0 capitalize`}>
                            {route.status}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
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
                            <div className="px-2 pb-2 space-y-1.5">
                              <Separator />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Globe className="h-3 w-3 text-emerald-500" />
                                  <span className="text-muted-foreground">Route:</span>
                                  <span className="font-medium truncate">{route.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Activity className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Distance:</span>
                                  <span className="font-medium">{(route.distance / 1000).toFixed(1)}k km</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Duration:</span>
                                  <span className="font-medium">{route.duration} days</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Type:</span>
                                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] border-0 capitalize">
                                    {SPECIES_TYPE[route.species] || 'unknown'}
                                  </Badge>
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
