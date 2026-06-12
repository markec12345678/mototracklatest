'use client'

import { useMemo, useState } from 'react'
import { useMapStore, type SpaceDebrisState, type DebrisObject } from '@/lib/map-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Satellite, X, Gauge, Filter, MapPin, Orbit } from 'lucide-react'

const SAMPLE_DEBRIS: DebrisObject[] = [
  {
    id: 'sd-1',
    name: 'ISS (International Space Station)',
    latitude: 28.5746,
    longitude: -80.6512,
    altitude: 420,
    objectType: 'satellite',
    size: 10900,
    velocity: 7.66,
    inclination: 51.6,
    decayRate: 0.002,
  },
  {
    id: 'sd-2',
    name: 'Hubble Space Telescope',
    latitude: 28.5383,
    longitude: -80.6481,
    altitude: 540,
    objectType: 'satellite',
    size: 1360,
    velocity: 7.59,
    inclination: 28.5,
    decayRate: 0.001,
  },
  {
    id: 'sd-3',
    name: 'Starlink Cluster (Group 6-40)',
    latitude: 33.0,
    longitude: -117.0,
    altitude: 550,
    objectType: 'satellite',
    size: 260,
    velocity: 7.58,
    inclination: 43.0,
    decayRate: 0.003,
  },
  {
    id: 'sd-4',
    name: 'Fengyun-1C Debris Field',
    latitude: 32.0,
    longitude: 108.0,
    altitude: 850,
    objectType: 'debris',
    size: 15,
    velocity: 7.42,
    inclination: 98.8,
    decayRate: 0.0001,
  },
  {
    id: 'sd-5',
    name: 'Delta II Rocket Body',
    latitude: 34.2,
    longitude: -118.5,
    altitude: 890,
    objectType: 'rocket_body',
    size: 950,
    velocity: 7.41,
    inclination: 98.2,
    decayRate: 0.0005,
  },
  {
    id: 'sd-6',
    name: 'Cosmos 2251 Debris',
    latitude: 55.0,
    longitude: 38.0,
    altitude: 790,
    objectType: 'debris',
    size: 8,
    velocity: 7.47,
    inclination: 74.0,
    decayRate: 0.0002,
  },
  {
    id: 'sd-7',
    name: 'Ariane 5 Upper Stage',
    latitude: 5.2,
    longitude: -52.8,
    altitude: 640,
    objectType: 'rocket_body',
    size: 1200,
    velocity: 7.54,
    inclination: 5.9,
    decayRate: 0.0015,
  },
]

const OBJECT_TYPE_COLORS: Record<DebrisObject['objectType'], { bg: string; text: string; border: string; label: string }> = {
  satellite: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700', label: 'Satellite' },
  debris: { bg: 'bg-gray-100 dark:bg-gray-800/40', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-600', label: 'Debris' },
  rocket_body: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700', label: 'Rocket Body' },
  unknown: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700', label: 'Unknown' },
}

export default function SpaceDebrisTracker() {
  const spaceDebris = useMapStore((s) => s.spaceDebris)
  const setSpaceDebris = useMapStore((s) => s.setSpaceDebris)

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const debrisObjects = useMemo(() => {
    if (spaceDebris.debrisObjects.length > 0) return spaceDebris.debrisObjects
    return SAMPLE_DEBRIS
  }, [spaceDebris.debrisObjects])

  const filteredObjects = useMemo(() => {
    if (spaceDebris.typeFilter === 'all') return debrisObjects
    return debrisObjects.filter((obj) => obj.objectType === spaceDebris.typeFilter)
  }, [debrisObjects, spaceDebris.typeFilter])

  const selectedObject = useMemo(() => {
    if (!selectedId) return null
    return filteredObjects.find((obj) => obj.id === selectedId) ?? null
  }, [filteredObjects, selectedId])

  const summary = useMemo(() => {
    const total = filteredObjects.length
    const debrisCount = filteredObjects.filter((o) => o.objectType === 'debris').length
    const avgAltitude =
      filteredObjects.length > 0
        ? Math.round(filteredObjects.reduce((sum, o) => sum + o.altitude, 0) / filteredObjects.length)
        : 0
    return { total, debrisCount, avgAltitude }
  }, [filteredObjects])

  if (!spaceDebris.open) return null

  const toggleProp = (key: keyof SpaceDebrisState) => {
    setSpaceDebris({ [key]: !spaceDebris[key] })
  }

  return (
    <div className="fixed top-4 right-4 z-[100] w-[420px] max-h-[calc(100vh-2rem)] overflow-hidden">
      <Card className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Orbit className="h-5 w-5 text-orange-500" />
              Space Debris Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSpaceDebris({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Summary */}
          <div className="flex gap-3 mt-2 text-xs">
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
              <Satellite className="h-3 w-3 text-blue-500" />
              <span className="font-medium">{summary.total}</span>
              <span className="text-muted-foreground">tracked</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
              <span className="font-medium">{summary.debrisCount}</span>
              <span className="text-muted-foreground">debris</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
              <MapPin className="h-3 w-3 text-emerald-500" />
              <span className="font-medium">{summary.avgAltitude}</span>
              <span className="text-muted-foreground">km avg</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Toggles */}
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={spaceDebris.showAltitude ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleProp('showAltitude')}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Altitude
            </Button>
            <Button
              variant={spaceDebris.showVelocity ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleProp('showVelocity')}
            >
              <Gauge className="h-3 w-3 mr-1" />
              Velocity
            </Button>
            <Button
              variant={spaceDebris.showDecay ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleProp('showDecay')}
            >
              Decay
            </Button>
            <Button
              variant={spaceDebris.showType ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleProp('showType')}
            >
              Type
            </Button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select
              value={spaceDebris.typeFilter}
              onValueChange={(val) =>
                setSpaceDebris({ typeFilter: val as SpaceDebrisState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="debris">Debris</SelectItem>
                <SelectItem value="rocket_body">Rocket Body</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Object List */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 styled-scrollbar">
            {filteredObjects.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No objects match the current filter.
              </div>
            ) : (
              filteredObjects.map((obj) => {
                const typeInfo = OBJECT_TYPE_COLORS[obj.objectType]
                const isSelected = selectedId === obj.id

                return (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedId(isSelected ? null : obj.id)}
                    className={`w-full text-left rounded-lg border p-2.5 transition-colors hover:bg-muted/60 ${
                      isSelected ? 'bg-muted border-primary/40 ring-1 ring-primary/20' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Satellite className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="font-medium text-sm truncate">{obj.name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          {spaceDebris.showAltitude && (
                            <span>
                              <span className="font-medium text-foreground">{obj.altitude}</span> km
                            </span>
                          )}
                          {spaceDebris.showVelocity && (
                            <span>
                              <span className="font-medium text-foreground">{obj.velocity}</span> km/s
                            </span>
                          )}
                          {spaceDebris.showDecay && (
                            <span>
                              Decay: <span className="font-medium text-foreground">{obj.decayRate}</span>
                            </span>
                          )}
                          <span>
                            Size: <span className="font-medium text-foreground">{obj.size}</span> cm
                          </span>
                          <span>
                            Inc: <span className="font-medium text-foreground">{obj.inclination}°</span>
                          </span>
                        </div>
                      </div>
                      {spaceDebris.showType && (
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] px-1.5 py-0 h-5 ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}
                        >
                          {typeInfo.label}
                        </Badge>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Selected Object Detail */}
          {selectedObject && (
            <Card className="border-primary/30 bg-primary/5 dark:bg-primary/10">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    <Orbit className="h-4 w-4 text-orange-500" />
                    {selectedObject.name}
                  </h4>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-5 ${OBJECT_TYPE_COLORS[selectedObject.objectType].bg} ${OBJECT_TYPE_COLORS[selectedObject.objectType].text} ${OBJECT_TYPE_COLORS[selectedObject.objectType].border}`}
                  >
                    {OBJECT_TYPE_COLORS[selectedObject.objectType].label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-muted-foreground">Altitude</span>
                    <p className="font-medium">{selectedObject.altitude} km</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Velocity</span>
                    <p className="font-medium">{selectedObject.velocity} km/s</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size</span>
                    <p className="font-medium">{selectedObject.size} cm</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inclination</span>
                    <p className="font-medium">{selectedObject.inclination}°</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Decay Rate</span>
                    <p className="font-medium">{selectedObject.decayRate} km/day</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Position</span>
                    <p className="font-medium">
                      {selectedObject.latitude.toFixed(2)}°, {selectedObject.longitude.toFixed(2)}°
                    </p>
                  </div>
                </div>

                {/* Altitude bar visualization */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>LEO</span>
                    <span>MEO</span>
                    <span>GEO</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                    <div
                      className="absolute top-0 h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-orange-400"
                      style={{ width: `${Math.min(100, (selectedObject.altitude / 2000) * 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-2.5 w-0.5 bg-foreground"
                      style={{ left: `${Math.min(100, (selectedObject.altitude / 2000) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>200 km</span>
                    <span>2,000 km</span>
                    <span>35,786 km</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
