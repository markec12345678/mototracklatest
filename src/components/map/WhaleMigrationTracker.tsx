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
import { useMapStore, type WhaleMigrationState, type WhalePod } from '@/lib/map-store'
import {
  Fish,
  X,
  Compass,
  Navigation,
  Filter,
  MapPin,
  Volume2,
} from 'lucide-react'

function generateSamplePods(): WhalePod[] {
  return [
    {
      id: 'wp1',
      name: 'Humpback Hawaii',
      latitude: 21.31,
      longitude: -157.86,
      species: 'Humpback Whale',
      podSize: 12,
      heading: 225,
      speed: 4.8,
      depth: 35,
      vocalizing: true,
      lastSighting: '2025-12-15',
    },
    {
      id: 'wp2',
      name: 'Gray Whale Baja',
      latitude: 23.87,
      longitude: -110.28,
      species: 'Gray Whale',
      podSize: 8,
      heading: 180,
      speed: 3.2,
      depth: 22,
      vocalizing: true,
      lastSighting: '2025-12-14',
    },
    {
      id: 'wp3',
      name: 'Blue Whale Sri Lanka',
      latitude: 6.21,
      longitude: 80.67,
      species: 'Blue Whale',
      podSize: 3,
      heading: 340,
      speed: 6.1,
      depth: 120,
      vocalizing: true,
      lastSighting: '2025-12-13',
    },
    {
      id: 'wp4',
      name: 'Sperm Whale Azores',
      latitude: 38.72,
      longitude: -27.22,
      species: 'Sperm Whale',
      podSize: 6,
      heading: 90,
      speed: 3.7,
      depth: 450,
      vocalizing: false,
      lastSighting: '2025-12-12',
    },
    {
      id: 'wp5',
      name: 'Orca Norway',
      latitude: 68.24,
      longitude: 14.46,
      species: 'Orca',
      podSize: 18,
      heading: 315,
      speed: 8.3,
      depth: 15,
      vocalizing: true,
      lastSighting: '2025-12-15',
    },
    {
      id: 'wp6',
      name: 'Right Whale Cape Cod',
      latitude: 41.75,
      longitude: -69.95,
      species: 'Right Whale',
      podSize: 4,
      heading: 45,
      speed: 2.1,
      depth: 18,
      vocalizing: false,
      lastSighting: '2025-12-10',
    },
    {
      id: 'wp7',
      name: 'Humpback Alaska',
      latitude: 58.38,
      longitude: -134.67,
      species: 'Humpback Whale',
      podSize: 9,
      heading: 170,
      speed: 5.2,
      depth: 42,
      vocalizing: true,
      lastSighting: '2025-12-11',
    },
  ]
}

type StoreWhaleMigration = ReturnType<typeof useMapStore.getState>['whaleMigration']

function headingToDirection(heading: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(heading / 45) % 8
  return directions[index]
}

export function WhaleMigrationTracker() {
  const whaleMigration = useMapStore((s) => s.whaleMigration)
  const setWhaleMigration = useMapStore((s) => s.setWhaleMigration)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const samplePods = useMemo(() => generateSamplePods(), [])

  const pods = whaleMigration.whalePods.length > 0 ? whaleMigration.whalePods : samplePods

  const speciesList = useMemo(() => {
    const species = new Set(pods.map((p) => p.species))
    return Array.from(species).sort()
  }, [pods])

  const filteredPods = useMemo(() => {
    if (whaleMigration.speciesFilter === 'all') return pods
    return pods.filter((p) => p.species === whaleMigration.speciesFilter)
  }, [pods, whaleMigration.speciesFilter])

  const activePodId = whaleMigration.activePodId ?? selectedId

  const selectedPod = useMemo(() => {
    if (!activePodId) return null
    return pods.find((p) => p.id === activePodId) ?? null
  }, [pods, activePodId])

  const stats = useMemo(() => {
    const totalPods = pods.length
    const totalIndividuals = pods.reduce((sum, p) => sum + p.podSize, 0)
    const vocalizingCount = pods.filter((p) => p.vocalizing).length
    const avgSpeed = pods.reduce((sum, p) => sum + p.speed, 0) / pods.length
    return {
      totalPods,
      totalIndividuals,
      vocalizingCount,
      avgSpeed: avgSpeed.toFixed(1),
    }
  }, [pods])

  const toggles: {
    key: keyof Pick<StoreWhaleMigration, 'showTracks' | 'showDepth' | 'showVocalization' | 'showSpeed'>
    label: string
    icon: React.ElementType
  }[] = [
    { key: 'showTracks', label: 'Tracks', icon: Navigation },
    { key: 'showDepth', label: 'Depth', icon: MapPin },
    { key: 'showVocalization', label: 'Vocalization', icon: Volume2 },
    { key: 'showSpeed', label: 'Speed', icon: Compass },
  ]

  if (typeof window === 'undefined') return null
  if (!whaleMigration.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[440px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Fish className="h-4 w-4 text-sky-500" />
              Whale Migration Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setWhaleMigration({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg border border-border/40 bg-sky-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-sky-600">{stats.totalPods}</div>
              <div className="text-[10px] text-muted-foreground">Total Pods</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-teal-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-teal-600">{stats.totalIndividuals}</div>
              <div className="text-[10px] text-muted-foreground">Individuals</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-violet-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-violet-600">{stats.vocalizingCount}</div>
              <div className="text-[10px] text-muted-foreground">Vocalizing</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-amber-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-amber-600">{stats.avgSpeed}</div>
              <div className="text-[10px] text-muted-foreground">Avg km/h</div>
            </div>
          </div>

          {/* Species filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select
              value={whaleMigration.speciesFilter}
              onValueChange={(v) =>
                setWhaleMigration({
                  speciesFilter: v as WhaleMigrationState['speciesFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Filter species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                {speciesList.map((species) => (
                  <SelectItem key={species} value={species}>
                    {species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-1.5">
            {toggles.map(({ key, label, icon: Icon }) => {
              const active = whaleMigration[key]
              return (
                <Button
                  key={key}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 text-[10px] gap-1 ${
                    active
                      ? 'bg-sky-600 hover:bg-sky-700 text-white'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setWhaleMigration({ [key]: !active })}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              )
            })}
          </div>

          {/* Whale pods list */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground font-medium">
              Whale Pods ({filteredPods.length})
            </div>
            <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredPods.map((pod) => {
                const isActive = activePodId === pod.id
                return (
                  <div
                    key={pod.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-sky-500/50 bg-sky-500/5'
                        : 'border-border/40 hover:border-sky-500/20 hover:bg-sky-500/5'
                    }`}
                    onClick={() => {
                      const newId = isActive ? null : pod.id
                      setSelectedId(newId)
                      setWhaleMigration({ activePodId: newId })
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium truncate mr-2">{pod.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {pod.vocalizing ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-sky-500 text-sky-500 bg-sky-500/10 animate-pulse"
                          >
                            <Volume2 className="h-2.5 w-2.5 mr-0.5" />
                            VOCAL
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-gray-400 text-gray-400 bg-gray-400/10"
                          >
                            SILENT
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                      <div>
                        Species:{' '}
                        <span className="text-foreground">{pod.species}</span>
                      </div>
                      <div>
                        Pod Size:{' '}
                        <span className="text-foreground">{pod.podSize}</span>
                      </div>
                      <div>
                        Heading:{' '}
                        <span className="text-foreground">
                          {pod.heading}° {headingToDirection(pod.heading)}
                        </span>
                      </div>
                      {whaleMigration.showSpeed && (
                        <div>
                          Speed:{' '}
                          <span className="text-foreground">{pod.speed} km/h</span>
                        </div>
                      )}
                      {whaleMigration.showDepth && (
                        <div>
                          Depth:{' '}
                          <span className="text-foreground">{pod.depth} m</span>
                        </div>
                      )}
                      <div className={whaleMigration.showSpeed && whaleMigration.showDepth ? '' : 'col-span-2'}>
                        Last Seen:{' '}
                        <span className="text-foreground">{pod.lastSighting}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredPods.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No pods match the selected filter.
                </div>
              )}
            </div>
          </div>

          {/* Selected pod details */}
          {selectedPod && (
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <Fish className="h-3 w-3 text-sky-500" />
                  {selectedPod.name}
                </div>
                {selectedPod.vocalizing ? (
                  <Badge className="text-[10px] h-5 bg-sky-500 text-white border-0 animate-pulse">
                    <Volume2 className="h-3 w-3 mr-0.5" />
                    Vocalizing
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] h-5 border-gray-400 text-gray-400 bg-gray-400/10">
                    Silent
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <Fish className="h-3 w-3 text-sky-500" />
                  <span className="text-muted-foreground">Species:</span>
                  <span className="font-medium">{selectedPod.species}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-teal-500" />
                  <span className="text-muted-foreground">Pod Size:</span>
                  <span className="font-medium">{selectedPod.podSize} individuals</span>
                </div>
                <div className="flex items-center gap-1">
                  <Compass className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Heading:</span>
                  <span className="font-medium">
                    {selectedPod.heading}° ({headingToDirection(selectedPod.heading)})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Compass className="h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="font-medium">{selectedPod.speed} km/h</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-violet-500" />
                  <span className="text-muted-foreground">Depth:</span>
                  <span className="font-medium">{selectedPod.depth} m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Volume2 className={`h-3 w-3 ${selectedPod.vocalizing ? 'text-sky-500' : 'text-gray-400'}`} />
                  <span className="text-muted-foreground">Vocalizing:</span>
                  <span className="font-medium">{selectedPod.vocalizing ? 'Yes' : 'No'}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {selectedPod.latitude.toFixed(2)}°, {selectedPod.longitude.toFixed(2)}°
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <span className="text-muted-foreground">Last Sighting:</span>
                  <span className="font-medium">{selectedPod.lastSighting}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
