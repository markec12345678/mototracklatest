'use client'

import { useMemo } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MangroveForest, type MangroveMonitorState } from '@/lib/map-store'
import { TreePine, X, Leaf, Shield, Filter, MapPin, Info } from 'lucide-react'

const STATUS_COLORS: Record<MangroveForest['restorationStatus'], string> = {
  pristine: '#22c55e',
  degraded: '#ef4444',
  restoring: '#eab308',
  lost: '#6b7280',
}

const STATUS_LABELS: Record<MangroveForest['restorationStatus'], string> = {
  pristine: 'Pristine',
  degraded: 'Degraded',
  restoring: 'Restoring',
  lost: 'Lost',
}

const HEALTH_FILTER_LABELS: Record<MangroveMonitorState['healthFilter'], string> = {
  all: 'All Status',
  pristine: 'Pristine',
  degraded: 'Degraded',
  restoring: 'Restoring',
  lost: 'Lost',
}

const SAMPLE_MANGROVES: MangroveForest[] = [
  {
    id: 'mf1',
    name: 'Sundarbans',
    latitude: 21.95,
    longitude: 89.18,
    area: 10200,
    carbonSequestration: 1840,
    species: ['Rhizophora mucronata', 'Avicennia marina', 'Sonneratia apetala', 'Heritiera fomes'],
    healthIndex: 0.78,
    restorationStatus: 'pristine',
    tidalRange: 3.5,
  },
  {
    id: 'mf2',
    name: 'Ras Mohammed',
    latitude: 27.73,
    longitude: 34.25,
    area: 480,
    carbonSequestration: 92,
    species: ['Avicennia marina', 'Rhizophora mucronata'],
    healthIndex: 0.85,
    restorationStatus: 'pristine',
    tidalRange: 0.6,
  },
  {
    id: 'mf3',
    name: 'Everglades',
    latitude: 25.32,
    longitude: -80.93,
    area: 2900,
    carbonSequestration: 510,
    species: ['Rhizophora mangle', 'Avicennia germinans', 'Laguncularia racemosa', 'Conocarpus erectus'],
    healthIndex: 0.52,
    restorationStatus: 'degraded',
    tidalRange: 1.2,
  },
  {
    id: 'mf4',
    name: 'Can Gio Biosphere',
    latitude: 10.41,
    longitude: 106.85,
    area: 750,
    carbonSequestration: 168,
    species: ['Avicennia alba', 'Rhizophora apiculata', 'Sonneratia caseolaris'],
    healthIndex: 0.68,
    restorationStatus: 'restoring',
    tidalRange: 2.8,
  },
  {
    id: 'mf5',
    name: 'Mekong Delta',
    latitude: 9.53,
    longitude: 105.88,
    area: 1850,
    carbonSequestration: 290,
    species: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia alba', 'Bruguiera parviflora'],
    healthIndex: 0.45,
    restorationStatus: 'degraded',
    tidalRange: 3.2,
  },
  {
    id: 'mf6',
    name: 'Queensland Coast',
    latitude: -19.26,
    longitude: 146.78,
    area: 4600,
    carbonSequestration: 720,
    species: ['Rhizophora stylosa', 'Avicennia marina', 'Ceriops tagal', 'Bruguiera gymnorhiza'],
    healthIndex: 0.91,
    restorationStatus: 'pristine',
    tidalRange: 2.4,
  },
  {
    id: 'mf7',
    name: 'Ganges-Brahmaputra Delta',
    latitude: 22.35,
    longitude: 89.72,
    area: 5800,
    carbonSequestration: 960,
    species: ['Heritiera fomes', 'Excoecaria agallocha', 'Avicennia officinalis'],
    healthIndex: 0.35,
    restorationStatus: 'lost',
    tidalRange: 4.1,
  },
  {
    id: 'mf8',
    name: 'Madagascar West Coast',
    latitude: -18.95,
    longitude: 44.28,
    area: 3200,
    carbonSequestration: 540,
    species: ['Rhizophora mucronata', 'Avicennia marina', 'Sonneratia alba', 'Bruguiera gymnorhiza', 'Ceriops tagal'],
    healthIndex: 0.61,
    restorationStatus: 'restoring',
    tidalRange: 2.9,
  },
]

type Update = Partial<MangroveMonitorState>

export function MangroveMonitor() {
  const mangroveMonitor = useMapStore((s) => s.mangroveMonitor)
  const update = useMapStore.getState().setMangroveMonitor

  const sampleData = useMemo(() => SAMPLE_MANGROVES, [])

  if (typeof window === 'undefined') return null
  if (!mangroveMonitor.open) return null

  const mangroves = mangroveMonitor.mangroves.length > 0 ? mangroveMonitor.mangroves : sampleData

  const filteredMangroves = mangroves.filter((m) => {
    if (mangroveMonitor.healthFilter === 'all') return true
    return m.restorationStatus === mangroveMonitor.healthFilter
  })

  const totalArea = filteredMangroves.reduce((sum, m) => sum + m.area, 0)
  const totalCarbon = filteredMangroves.reduce((sum, m) => sum + m.carbonSequestration, 0)
  const avgHealth = filteredMangroves.length > 0
    ? filteredMangroves.reduce((sum, m) => sum + m.healthIndex, 0) / filteredMangroves.length
    : 0

  const selectedMangrove = mangroveMonitor.activeMangroveId
    ? mangroves.find((m) => m.id === mangroveMonitor.activeMangroveId) ?? null
    : null

  const toggleButtons: { key: keyof Update; label: string; icon: typeof TreePine }[] = [
    { key: 'showExtent', label: 'Show Extent', icon: MapPin },
    { key: 'showCarbon', label: 'Carbon Data', icon: Leaf },
    { key: 'showRestoration', label: 'Restoration', icon: Shield },
    { key: 'showSpecies', label: 'Species Info', icon: TreePine },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TreePine className="h-4 w-4 text-green-600" />
              Mangrove Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => update({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Toggle buttons */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Overlays</span>
            <div className="grid grid-cols-2 gap-2">
              {toggleButtons.map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={mangroveMonitor[key] ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs justify-start gap-1.5"
                  onClick={() => update({ [key]: !mangroveMonitor[key] })}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Health filter */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Filter by Health Status</span>
            </div>
            <Select
              value={mangroveMonitor.healthFilter}
              onValueChange={(v) =>
                update({ healthFilter: v as MangroveMonitorState['healthFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HEALTH_FILTER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Area</div>
              <div className="text-sm font-semibold">
                {totalArea.toLocaleString()}
                <span className="text-[10px] text-muted-foreground ml-0.5">km²</span>
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Carbon Seq.</div>
              <div className="text-sm font-semibold">
                {totalCarbon.toLocaleString()}
                <span className="text-[10px] text-muted-foreground ml-0.5">tCO₂/yr</span>
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Health</div>
              <div className="text-sm font-semibold">
                {(avgHealth * 100).toFixed(0)}
                <span className="text-[10px] text-muted-foreground ml-0.5">%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Mangrove list */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">
              Mangrove Forests ({filteredMangroves.length})
            </span>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredMangroves.map((mangrove) => {
                  const isActive = mangroveMonitor.activeMangroveId === mangrove.id
                  const statusColor = STATUS_COLORS[mangrove.restorationStatus]
                  return (
                    <div
                      key={mangrove.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-border/40 hover:border-green-500/20 hover:bg-green-500/5'
                      }`}
                      onClick={() =>
                        update({
                          activeMangroveId: isActive ? null : mangrove.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{mangrove.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: statusColor,
                            color: statusColor,
                          }}
                        >
                          {STATUS_LABELS[mangrove.restorationStatus]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Area:{' '}
                          <span className="text-foreground">
                            {mangrove.area.toLocaleString()} km²
                          </span>
                        </div>
                        <div>
                          Carbon:{' '}
                          <span className="text-foreground">
                            {mangrove.carbonSequestration.toLocaleString()} tCO₂/yr
                          </span>
                        </div>
                        <div>
                          Health:{' '}
                          <span className="text-foreground">
                            {(mangrove.healthIndex * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        Species:{' '}
                        <span className="text-foreground">{mangrove.species.length}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Selected mangrove details */}
          {selectedMangrove && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                <div className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-semibold">{selectedMangrove.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                  <div>
                    <span className="text-muted-foreground">Area:</span>{' '}
                    <span className="text-foreground">{selectedMangrove.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon Seq.:</span>{' '}
                    <span className="text-foreground">{selectedMangrove.carbonSequestration.toLocaleString()} tCO₂/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Health Index:</span>{' '}
                    <span className="text-foreground">{(selectedMangrove.healthIndex * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tidal Range:</span>{' '}
                    <span className="text-foreground">{selectedMangrove.tidalRange} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coordinates:</span>{' '}
                    <span className="text-foreground">
                      {selectedMangrove.latitude.toFixed(2)}, {selectedMangrove.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    <Badge
                      variant="outline"
                      className="text-[10px] h-4 ml-1"
                      style={{
                        borderColor: STATUS_COLORS[selectedMangrove.restorationStatus],
                        color: STATUS_COLORS[selectedMangrove.restorationStatus],
                      }}
                    >
                      {STATUS_LABELS[selectedMangrove.restorationStatus]}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Species:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedMangrove.species.map((sp) => (
                      <Badge key={sp} variant="secondary" className="text-[9px] h-4 italic">
                        {sp}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/* Health bar */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Health Index</span>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${selectedMangrove.healthIndex * 100}%`,
                        backgroundColor: STATUS_COLORS[selectedMangrove.restorationStatus],
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
