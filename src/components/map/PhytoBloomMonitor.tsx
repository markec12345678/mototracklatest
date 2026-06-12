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
import { useMapStore, type PhytoBloomState, type PhytoBloomSite } from '@/lib/map-store'
import {
  Fish,
  X,
  Droplets,
  Thermometer,
  Filter,
  MapPin,
  AlertTriangle,
} from 'lucide-react'

function getChlorophyllColor(conc: number): string {
  if (conc >= 30) return '#ef4444'
  if (conc >= 15) return '#f97316'
  if (conc >= 5) return '#eab308'
  return '#22c55e'
}

function getNutrientLevelLabel(level: number): { label: string; color: string } {
  if (level >= 8) return { label: 'Very High', color: '#ef4444' }
  if (level >= 6) return { label: 'High', color: '#f97316' }
  if (level >= 4) return { label: 'Moderate', color: '#eab308' }
  if (level >= 2) return { label: 'Low', color: '#22c55e' }
  return { label: 'Very Low', color: '#9ca3af' }
}

const FILTER_OPTIONS: { value: PhytoBloomState['toxicityFilter']; label: string }[] = [
  { value: 'all', label: 'All Sites' },
  { value: 'toxic', label: 'Toxic Only' },
  { value: 'nontoxic', label: 'Non-Toxic Only' },
]

function generateSampleSites(): PhytoBloomSite[] {
  return [
    {
      id: 'pb1',
      name: 'North Atlantic Spring Bloom',
      latitude: 52.5,
      longitude: -30.0,
      chlorophyllConc: 28.7,
      bloomArea: 185000,
      dominantSpecies: 'Emiliania huxleyi',
      toxicityRisk: false,
      seaSurfaceTemp: 10.4,
      nutrientLevel: 7.2,
    },
    {
      id: 'pb2',
      name: 'Arabian Sea Bloom',
      latitude: 18.0,
      longitude: 63.0,
      chlorophyllConc: 42.3,
      bloomArea: 124000,
      dominantSpecies: 'Noctiluca scintillans',
      toxicityRisk: true,
      seaSurfaceTemp: 27.8,
      nutrientLevel: 8.5,
    },
    {
      id: 'pb3',
      name: 'Southern Ocean Bloom',
      latitude: -58.0,
      longitude: 140.0,
      chlorophyllConc: 8.9,
      bloomArea: 310000,
      dominantSpecies: 'Phaeocystis antarctica',
      toxicityRisk: false,
      seaSurfaceTemp: 2.1,
      nutrientLevel: 5.6,
    },
    {
      id: 'pb4',
      name: 'Equatorial Pacific Bloom',
      latitude: 0.5,
      longitude: -140.0,
      chlorophyllConc: 14.6,
      bloomArea: 220000,
      dominantSpecies: 'Trichodesmium erythraeum',
      toxicityRisk: true,
      seaSurfaceTemp: 28.3,
      nutrientLevel: 3.8,
    },
    {
      id: 'pb5',
      name: 'Barents Sea Spring Bloom',
      latitude: 74.0,
      longitude: 33.0,
      chlorophyllConc: 19.2,
      bloomArea: 95000,
      dominantSpecies: 'Phaeocystis pouchetii',
      toxicityRisk: false,
      seaSurfaceTemp: 5.7,
      nutrientLevel: 6.4,
    },
    {
      id: 'pb6',
      name: 'Benguela Current Bloom',
      latitude: -22.0,
      longitude: 12.5,
      chlorophyllConc: 38.4,
      bloomArea: 78000,
      dominantSpecies: 'Alexandrium catenella',
      toxicityRisk: true,
      seaSurfaceTemp: 16.2,
      nutrientLevel: 9.1,
    },
    {
      id: 'pb7',
      name: 'Peru-Chile Upwelling Bloom',
      latitude: -15.0,
      longitude: -76.0,
      chlorophyllConc: 33.1,
      bloomArea: 142000,
      dominantSpecies: 'Dinophysis acuta',
      toxicityRisk: true,
      seaSurfaceTemp: 18.5,
      nutrientLevel: 7.8,
    },
  ]
}

type StorePhytoBloom = ReturnType<typeof useMapStore.getState>['phytoBloom']

export function PhytoBloomMonitor() {
  const phytoBloom = useMapStore((s) => s.phytoBloom)
  const setPhytoBloom = useMapStore((s) => s.setPhytoBloom)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sampleSites = useMemo(() => generateSampleSites(), [])

  const sites = phytoBloom.bloomSites.length > 0 ? phytoBloom.bloomSites : sampleSites

  const filteredSites = useMemo(() => {
    if (phytoBloom.toxicityFilter === 'all') return sites
    if (phytoBloom.toxicityFilter === 'toxic') return sites.filter((s) => s.toxicityRisk)
    return sites.filter((s) => !s.toxicityRisk)
  }, [sites, phytoBloom.toxicityFilter])

  const activeBloomId = phytoBloom.activeBloomId ?? selectedId

  const selectedBloom = useMemo(() => {
    if (!activeBloomId) return null
    return sites.find((s) => s.id === activeBloomId) ?? null
  }, [sites, activeBloomId])

  const stats = useMemo(() => {
    const totalBloomArea = sites.reduce((sum, s) => sum + s.bloomArea, 0)
    const toxicCount = sites.filter((s) => s.toxicityRisk).length
    const avgChl = sites.reduce((sum, s) => sum + s.chlorophyllConc, 0) / sites.length
    return {
      totalBloomArea,
      toxicCount,
      avgChl: avgChl.toFixed(1),
    }
  }, [sites])

  const toggles: { key: keyof Pick<StorePhytoBloom, 'showChlorophyll' | 'showArea' | 'showToxicity' | 'showNutrients'>; label: string; icon: React.ElementType }[] = [
    { key: 'showChlorophyll', label: 'Chlorophyll', icon: Droplets },
    { key: 'showArea', label: 'Bloom Area', icon: MapPin },
    { key: 'showToxicity', label: 'Toxicity', icon: AlertTriangle },
    { key: 'showNutrients', label: 'Nutrients', icon: Fish },
  ]

  if (typeof window === 'undefined') return null
  if (!phytoBloom.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[460px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Fish className="h-4 w-4 text-teal-500" />
              Phytoplankton Bloom Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPhytoBloom({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 bg-teal-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-teal-600">
                {(stats.totalBloomArea / 1000).toFixed(0)}k
              </div>
              <div className="text-[10px] text-muted-foreground">Total Area (km²)</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-red-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-red-500">{stats.toxicCount}</div>
              <div className="text-[10px] text-muted-foreground">Toxic Blooms</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-amber-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-amber-600">{stats.avgChl}</div>
              <div className="text-[10px] text-muted-foreground">Avg Chl (mg/m³)</div>
            </div>
          </div>

          {/* Toxicity filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select
              value={phytoBloom.toxicityFilter}
              onValueChange={(v) =>
                setPhytoBloom({
                  toxicityFilter: v as PhytoBloomState['toxicityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Filter toxicity" />
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
              const active = phytoBloom[key]
              return (
                <Button
                  key={key}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 text-[10px] gap-1 ${
                    active
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setPhytoBloom({ [key]: !active })}
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
            <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredSites.map((site) => {
                const isActive = activeBloomId === site.id
                const chlColor = getChlorophyllColor(site.chlorophyllConc)
                return (
                  <div
                    key={site.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-teal-500/50 bg-teal-500/5'
                        : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                    }`}
                    onClick={() => {
                      const newId = isActive ? null : site.id
                      setSelectedId(newId)
                      setPhytoBloom({ activeBloomId: newId })
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium truncate mr-2">{site.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {site.toxicityRisk && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-red-500 text-red-500 bg-red-500/10"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                            TOXIC
                          </Badge>
                        )}
                        {!site.toxicityRisk && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-green-500 text-green-500 bg-green-500/10"
                          >
                            SAFE
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                      {phytoBloom.showChlorophyll && (
                        <div>
                          Chl:{' '}
                          <span className="font-medium" style={{ color: chlColor }}>
                            {site.chlorophyllConc} mg/m³
                          </span>
                        </div>
                      )}
                      {phytoBloom.showArea && (
                        <div>
                          Area:{' '}
                          <span className="text-foreground">
                            {(site.bloomArea / 1000).toFixed(0)}k km²
                          </span>
                        </div>
                      )}
                      {phytoBloom.showNutrients && (
                        <div>
                          Nutrients:{' '}
                          <span
                            className="font-medium"
                            style={{ color: getNutrientLevelLabel(site.nutrientLevel).color }}
                          >
                            {site.nutrientLevel.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {!phytoBloom.showChlorophyll && !phytoBloom.showArea && !phytoBloom.showNutrients && (
                        <>
                          <div>
                            Chl:{' '}
                            <span className="font-medium" style={{ color: chlColor }}>
                              {site.chlorophyllConc}
                            </span>
                          </div>
                          <div>
                            Area:{' '}
                            <span className="text-foreground">
                              {(site.bloomArea / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div>
                            SST:{' '}
                            <span className="text-foreground">{site.seaSurfaceTemp}°C</span>
                          </div>
                        </>
                      )}
                      {phytoBloom.showChlorophyll && phytoBloom.showArea && phytoBloom.showNutrients && (
                        <div>
                          SST:{' '}
                          <span className="text-foreground">{site.seaSurfaceTemp}°C</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 truncate">
                      <Fish className="h-2.5 w-2.5 inline mr-0.5 text-teal-500" />
                      <span className="italic">{site.dominantSpecies}</span>
                    </div>
                  </div>
                )
              })}
              {filteredSites.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No bloom sites match the selected filter.
                </div>
              )}
            </div>
          </div>

          {/* Selected bloom details */}
          {selectedBloom && (
            <div className="rounded-lg border border-teal-500/30 bg-teal-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-teal-500" />
                  {selectedBloom.name}
                </div>
                {selectedBloom.toxicityRisk ? (
                  <Badge className="text-[10px] h-5 text-white bg-red-500 border-0 hover:bg-red-600">
                    <AlertTriangle className="h-3 w-3 mr-0.5" />
                    Toxic
                  </Badge>
                ) : (
                  <Badge className="text-[10px] h-5 text-white bg-green-500 border-0 hover:bg-green-600">
                    Non-toxic
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-teal-500" />
                  <span className="text-muted-foreground">Chlorophyll:</span>
                  <span
                    className="font-medium"
                    style={{ color: getChlorophyllColor(selectedBloom.chlorophyllConc) }}
                  >
                    {selectedBloom.chlorophyllConc} mg/m³
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground">SST:</span>
                  <span className="font-medium">{selectedBloom.seaSurfaceTemp}°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-violet-500" />
                  <span className="text-muted-foreground">Bloom Area:</span>
                  <span className="font-medium">
                    {selectedBloom.bloomArea.toLocaleString()} km²
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Fish className="h-3 w-3 text-sky-500" />
                  <span className="text-muted-foreground">Nutrients:</span>
                  <span
                    className="font-medium"
                    style={{ color: getNutrientLevelLabel(selectedBloom.nutrientLevel).color }}
                  >
                    {selectedBloom.nutrientLevel.toFixed(1)} ({getNutrientLevelLabel(selectedBloom.nutrientLevel).label})
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <Fish className="h-3 w-3 text-purple-500" />
                  <span className="text-muted-foreground">Dominant Species:</span>
                  <span className="font-medium italic">{selectedBloom.dominantSpecies}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {selectedBloom.latitude.toFixed(2)}°, {selectedBloom.longitude.toFixed(2)}°
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
