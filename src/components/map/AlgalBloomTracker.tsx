'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type AlgalBloomState, type AlgalBloomSite } from '@/lib/map-store'
import {
  Droplets,
  X,
  AlertTriangle,
  Thermometer,
  Filter,
  MapPin,
  Fish,
} from 'lucide-react'

const INTENSITY_COLORS: Record<AlgalBloomSite['bloomIntensity'], string> = {
  none: '#9ca3af',
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  severe: '#ef4444',
}

const INTENSITY_LABELS: Record<AlgalBloomSite['bloomIntensity'], string> = {
  none: 'None',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  severe: 'Severe',
}

const FILTER_OPTIONS: { value: AlgalBloomState['intensityFilter']; label: string }[] = [
  { value: 'all', label: 'All Intensities' },
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'severe', label: 'Severe' },
]

function generateSampleSites(): AlgalBloomSite[] {
  return [
    {
      id: 'ab1',
      name: 'Lake Erie - Western Basin',
      latitude: 41.76,
      longitude: -83.34,
      bloomIntensity: 'severe',
      chlorophyllA: 58.4,
      waterTemperature: 24.3,
      dissolvedOxygen: 4.2,
      toxicity: true,
      species: 'Microcystis aeruginosa',
      detectedDate: '2025-08-12',
    },
    {
      id: 'ab2',
      name: 'Baltic Sea - Gulf of Finland',
      latitude: 59.85,
      longitude: 25.4,
      bloomIntensity: 'high',
      chlorophyllA: 42.1,
      waterTemperature: 19.7,
      dissolvedOxygen: 5.1,
      toxicity: true,
      species: 'Nodularia spumigena',
      detectedDate: '2025-07-28',
    },
    {
      id: 'ab3',
      name: 'Gulf of Mexico - Louisiana Shelf',
      latitude: 29.2,
      longitude: -90.5,
      bloomIntensity: 'moderate',
      chlorophyllA: 28.6,
      waterTemperature: 29.1,
      dissolvedOxygen: 2.8,
      toxicity: false,
      species: 'Karenia brevis',
      detectedDate: '2025-09-03',
    },
    {
      id: 'ab4',
      name: 'Lake Taihu - China',
      latitude: 31.23,
      longitude: 120.18,
      bloomIntensity: 'high',
      chlorophyllA: 47.9,
      waterTemperature: 26.5,
      dissolvedOxygen: 3.6,
      toxicity: true,
      species: 'Microcystis aeruginosa',
      detectedDate: '2025-07-15',
    },
    {
      id: 'ab5',
      name: 'Lake Victoria - Uganda',
      latitude: -0.35,
      longitude: 32.95,
      bloomIntensity: 'moderate',
      chlorophyllA: 22.3,
      waterTemperature: 25.8,
      dissolvedOxygen: 5.7,
      toxicity: false,
      species: 'Cylindrospermopsis raciborskii',
      detectedDate: '2025-08-22',
    },
    {
      id: 'ab6',
      name: 'Chesapeake Bay - Maryland',
      latitude: 38.3,
      longitude: -76.15,
      bloomIntensity: 'low',
      chlorophyllA: 12.7,
      waterTemperature: 22.4,
      dissolvedOxygen: 6.8,
      toxicity: false,
      species: 'Prorocentrum minimum',
      detectedDate: '2025-09-10',
    },
    {
      id: 'ab7',
      name: 'Lake Okeechobee - Florida',
      latitude: 26.95,
      longitude: -80.85,
      bloomIntensity: 'severe',
      chlorophyllA: 64.2,
      waterTemperature: 30.1,
      dissolvedOxygen: 3.1,
      toxicity: true,
      species: 'Microcystis aeruginosa',
      detectedDate: '2025-06-30',
    },
    {
      id: 'ab8',
      name: 'Lake Winnipeg - South Basin',
      latitude: 51.5,
      longitude: -96.8,
      bloomIntensity: 'low',
      chlorophyllA: 9.4,
      waterTemperature: 18.2,
      dissolvedOxygen: 7.3,
      toxicity: false,
      species: 'Aphanizomenon flos-aquae',
      detectedDate: '2025-08-05',
    },
  ]
}

type StoreAlgalBloom = ReturnType<typeof useMapStore.getState>['algalBloom']

export function AlgalBloomTracker() {
  const algalBloom = useMapStore((s) => s.algalBloom)
  const setAlgalBloom = useMapStore((s) => s.setAlgalBloom)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sampleSites = useMemo(() => generateSampleSites(), [])

  const sites = algalBloom.blooms.length > 0 ? algalBloom.blooms : sampleSites

  const filteredSites = useMemo(() => {
    if (algalBloom.intensityFilter === 'all') return sites
    return sites.filter((s) => s.bloomIntensity === algalBloom.intensityFilter)
  }, [sites, algalBloom.intensityFilter])

  const activeBloomId = algalBloom.activeBloomId ?? selectedId

  const selectedBloom = useMemo(() => {
    if (!activeBloomId) return null
    return sites.find((s) => s.id === activeBloomId) ?? null
  }, [sites, activeBloomId])

  const stats = useMemo(() => {
    const activeCount = sites.filter((s) => s.bloomIntensity !== 'none').length
    const toxicCount = sites.filter((s) => s.toxicity).length
    const avgChl = sites.reduce((sum, s) => sum + s.chlorophyllA, 0) / sites.length
    return { activeCount, toxicCount, avgChl: avgChl.toFixed(1) }
  }, [sites])

  const toggles: { key: keyof Pick<StoreAlgalBloom, 'showBloomExtent' | 'showChlorophyll' | 'showToxicity' | 'showTemperature'>; label: string; icon: React.ElementType }[] = [
    { key: 'showBloomExtent', label: 'Bloom Extent', icon: MapPin },
    { key: 'showChlorophyll', label: 'Chlorophyll-a', icon: Droplets },
    { key: 'showToxicity', label: 'Toxicity', icon: AlertTriangle },
    { key: 'showTemperature', label: 'Water Temp', icon: Thermometer },
  ]

  if (typeof window === 'undefined') return null
  if (!algalBloom.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[440px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-emerald-500" />
              Algal Bloom Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAlgalBloom({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 bg-emerald-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-emerald-600">{stats.activeCount}</div>
              <div className="text-[10px] text-muted-foreground">Active Blooms</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-red-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-red-500">{stats.toxicCount}</div>
              <div className="text-[10px] text-muted-foreground">Toxic Blooms</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-amber-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-amber-600">{stats.avgChl}</div>
              <div className="text-[10px] text-muted-foreground">Avg Chl-a (µg/L)</div>
            </div>
          </div>

          {/* Intensity filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select
              value={algalBloom.intensityFilter}
              onValueChange={(v) =>
                setAlgalBloom({
                  intensityFilter: v as AlgalBloomState['intensityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Filter intensity" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-1.5">
            {toggles.map(({ key, label, icon: Icon }) => {
              const active = algalBloom[key]
              return (
                <Button
                  key={key}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 text-[10px] gap-1 ${
                    active
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setAlgalBloom({ [key]: !active })}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              )
            })}
          </div>

          {/* Bloom sites list */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground font-medium">
              Bloom Sites ({filteredSites.length})
            </div>
            <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredSites.map((site) => {
                const isActive = activeBloomId === site.id
                const intensityColor = INTENSITY_COLORS[site.bloomIntensity]
                return (
                  <div
                    key={site.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                    }`}
                    onClick={() => {
                      const newId = isActive ? null : site.id
                      setSelectedId(newId)
                      setAlgalBloom({ activeBloomId: newId })
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium truncate mr-2">{site.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {site.toxicity && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-red-500 text-red-500 bg-red-500/10"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                            TOXIC
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: intensityColor,
                            color: intensityColor,
                          }}
                        >
                          {INTENSITY_LABELS[site.bloomIntensity]}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                      <div>
                        Chl-a:{' '}
                        <span className="text-foreground">{site.chlorophyllA} µg/L</span>
                      </div>
                      <div>
                        Temp:{' '}
                        <span className="text-foreground">{site.waterTemperature}°C</span>
                      </div>
                      <div>
                        DO:{' '}
                        <span className="text-foreground">{site.dissolvedOxygen} mg/L</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredSites.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No blooms match the selected filter.
                </div>
              )}
            </div>
          </div>

          {/* Selected bloom details */}
          {selectedBloom && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  {selectedBloom.name}
                </div>
                <Badge
                  className="text-[10px] h-5 text-white border-0"
                  style={{ backgroundColor: INTENSITY_COLORS[selectedBloom.bloomIntensity] }}
                >
                  {INTENSITY_LABELS[selectedBloom.bloomIntensity]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-emerald-500" />
                  <span className="text-muted-foreground">Chlorophyll-a:</span>
                  <span className="font-medium">{selectedBloom.chlorophyllA} µg/L</span>
                </div>
                <div className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground">Water Temp:</span>
                  <span className="font-medium">{selectedBloom.waterTemperature}°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <Fish className="h-3 w-3 text-sky-500" />
                  <span className="text-muted-foreground">Dissolved O₂:</span>
                  <span className="font-medium">{selectedBloom.dissolvedOxygen} mg/L</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle
                    className={`h-3 w-3 ${selectedBloom.toxicity ? 'text-red-500' : 'text-green-500'}`}
                  />
                  <span className="text-muted-foreground">Toxicity:</span>
                  {selectedBloom.toxicity ? (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-red-500 text-red-500 bg-red-500/10">
                      Toxic
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-green-500 text-green-500 bg-green-500/10">
                      Non-toxic
                    </Badge>
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <Fish className="h-3 w-3 text-purple-500" />
                  <span className="text-muted-foreground">Species:</span>
                  <span className="font-medium italic">{selectedBloom.species}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {selectedBloom.latitude.toFixed(2)}°, {selectedBloom.longitude.toFixed(2)}°
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <span className="text-muted-foreground">Detected:</span>
                  <span className="font-medium">{selectedBloom.detectedDate}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
