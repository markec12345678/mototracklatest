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
import { useMapStore, type CaveSystemState, type CaveSystem } from '@/lib/map-store'
import { Mountain as MountainIcon3, X, Ruler, ArrowDown, Shield, Bug, MapPin, Filter } from 'lucide-react'

const DEMO_CAVES: CaveSystem[] = [
  {
    id: 'cave-mammoth',
    name: 'Mammoth Cave',
    latitude: 37.19,
    longitude: -86.10,
    depth: 141,
    length: 685.6,
    passages: 6300,
    maxChamberHeight: 30,
    caveType: 'limestone',
    difficulty: 'beginner',
    features: 'stalactites, stalagmites, underground rivers',
    biodiversity: 'exceptional',
  },
  {
    id: 'cave-krubera',
    name: 'Krubera-Voronya',
    latitude: 43.42,
    longitude: 40.35,
    depth: 2197,
    length: 16.6,
    passages: 420,
    maxChamberHeight: 45,
    caveType: 'limestone',
    difficulty: 'expert',
    features: 'deep shafts, sumps, narrow passages',
    biodiversity: 'moderate',
  },
  {
    id: 'cave-waitomo',
    name: 'Waitomo Caves',
    latitude: -38.26,
    longitude: 175.10,
    depth: 118,
    length: 14.2,
    passages: 350,
    maxChamberHeight: 22,
    caveType: 'limestone',
    difficulty: 'beginner',
    features: 'glowworms, limestone formations, underground streams',
    biodiversity: 'exceptional',
  },
  {
    id: 'cave-thurston',
    name: 'Thurston Lava Tube',
    latitude: 19.41,
    longitude: -155.24,
    depth: 22,
    length: 1.8,
    passages: 15,
    maxChamberHeight: 8,
    caveType: 'lava',
    difficulty: 'beginner',
    features: 'lava formations, tree molds, lava shelves',
    biodiversity: 'low',
  },
  {
    id: 'cave-eisriesenwelt',
    name: 'Eisriesenwelt',
    latitude: 47.53,
    longitude: 13.19,
    depth: 407,
    length: 42.6,
    passages: 1200,
    maxChamberHeight: 35,
    caveType: 'limestone',
    difficulty: 'intermediate',
    features: 'ice formations, frozen waterfalls, ice palaces',
    biodiversity: 'moderate',
  },
  {
    id: 'cave-cueva',
    name: 'Cueva del Guácharo',
    latitude: 10.17,
    longitude: -63.78,
    depth: 280,
    length: 10.2,
    passages: 200,
    maxChamberHeight: 28,
    caveType: 'sandstone',
    difficulty: 'intermediate',
    features: 'oilbird colony, stalactites, large chambers',
    biodiversity: 'high',
  },
]

const DIFFICULTY_CONFIG: Record<
  CaveSystem['difficulty'],
  { label: string; color: string; bgClass: string }
> = {
  beginner: { label: 'Beginner', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  intermediate: { label: 'Intermediate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  advanced: { label: 'Advanced', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  expert: { label: 'Expert', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const BIODIVERSITY_CONFIG: Record<
  CaveSystem['biodiversity'],
  { label: string; bgClass: string }
> = {
  low: { label: 'Low', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  high: { label: 'High', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  exceptional: { label: 'Exceptional', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

const CAVE_TYPE_LABELS: Record<CaveSystem['caveType'], string> = {
  limestone: 'Limestone',
  lava: 'Lava',
  glacier: 'Glacier',
  sandstone: 'Sandstone',
  sea: 'Sea',
}

export function CaveSystemExplorer() {
  const caveSystem = useMapStore((s) => s.caveSystem)
  const setCaveSystem = useMapStore((s) => s.setCaveSystem)

  const caves = useMemo(
    () => (caveSystem.caves.length > 0 ? caveSystem.caves : DEMO_CAVES),
    [caveSystem.caves]
  )

  const filteredCaves = useMemo(() => {
    return caves.filter((c) => {
      if (caveSystem.typeFilter !== 'all' && c.caveType !== caveSystem.typeFilter) return false
      return true
    })
  }, [caves, caveSystem.typeFilter])

  const summary = useMemo(() => {
    if (filteredCaves.length === 0) {
      return { deepestCave: 0, totalPassages: 0, exceptionalCount: 0 }
    }
    const deepestCave = Math.max(...filteredCaves.map((c) => c.depth))
    const totalPassages = filteredCaves.reduce((sum, c) => sum + c.passages, 0)
    const exceptionalCount = filteredCaves.filter((c) => c.biodiversity === 'exceptional').length
    return { deepestCave, totalPassages, exceptionalCount }
  }, [filteredCaves])

  const activeCave = useMemo(
    () => caves.find((c) => c.id === caveSystem.activeCaveId) ?? null,
    [caves, caveSystem.activeCaveId]
  )

  if (typeof window === 'undefined') return null
  if (!caveSystem.open) return null

  const overlayToggles: { key: keyof CaveSystemState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: ArrowDown },
    { key: 'showLength', label: 'Length', icon: Ruler },
    { key: 'showDifficulty', label: 'Difficulty', icon: Shield },
    { key: 'showBiodiversity', label: 'Biodiversity', icon: Bug },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MountainIcon3 className="h-4 w-4 text-emerald-500" />
              Cave System Explorer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCaveSystem({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Cave Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Cave Type
            </Label>
            <Select
              value={caveSystem.typeFilter}
              onValueChange={(v) =>
                setCaveSystem({
                  typeFilter: v as CaveSystemState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="limestone">Limestone</SelectItem>
                <SelectItem value="lava">Lava</SelectItem>
                <SelectItem value="glacier">Glacier</SelectItem>
                <SelectItem value="sandstone">Sandstone</SelectItem>
                <SelectItem value="sea">Sea</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-emerald-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={caveSystem[key] as boolean}
                  onCheckedChange={(checked) => setCaveSystem({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Deepest Cave</div>
              <div className="text-sm font-semibold text-emerald-500">{summary.deepestCave}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Passages</div>
              <div className="text-sm font-semibold">{summary.totalPassages.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">passages</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Exceptional Bio</div>
              <div className="text-sm font-semibold text-green-500">{summary.exceptionalCount}</div>
              <div className="text-[9px] text-muted-foreground">caves</div>
            </div>
          </div>

          <Separator />

          {/* Cave List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Cave Systems ({filteredCaves.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCaves.map((cave) => {
                  const isActive = caveSystem.activeCaveId === cave.id
                  const diffCfg = DIFFICULTY_CONFIG[cave.difficulty]
                  return (
                    <div
                      key={cave.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                      }`}
                      onClick={() =>
                        setCaveSystem({
                          activeCaveId: isActive ? null : cave.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: diffCfg.color }}
                          />
                          <span className="text-xs font-medium">{cave.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${diffCfg.bgClass}`}
                        >
                          {diffCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {caveSystem.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {cave.depth} m
                            </span>
                          </div>
                        )}
                        {caveSystem.showLength && (
                          <div>
                            Length:{' '}
                            <span className="text-foreground font-medium">
                              {cave.length} km
                            </span>
                          </div>
                        )}
                        {caveSystem.showDifficulty && (
                          <div>
                            Difficulty:{' '}
                            <span className="text-foreground font-medium">
                              {DIFFICULTY_CONFIG[cave.difficulty].label}
                            </span>
                          </div>
                        )}
                        {caveSystem.showBiodiversity && (
                          <div>
                            Biodiversity:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${BIODIVERSITY_CONFIG[cave.biodiversity].bgClass}`}
                            >
                              {BIODIVERSITY_CONFIG[cave.biodiversity].label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCaves.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No caves match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Cave Details */}
          {activeCave && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold">{activeCave.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${DIFFICULTY_CONFIG[activeCave.difficulty].bgClass}`}
                  >
                    {DIFFICULTY_CONFIG[activeCave.difficulty].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeCave.latitude.toFixed(2)}, {activeCave.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeCave.depth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Length: </span>
                    <span className="font-medium">{activeCave.length} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Passages: </span>
                    <span className="font-medium">{activeCave.passages.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Chamber: </span>
                    <span className="font-medium">{activeCave.maxChamberHeight} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cave Type: </span>
                    <span className="font-medium">{CAVE_TYPE_LABELS[activeCave.caveType]}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Features: </span>
                    <span className="font-medium">{activeCave.features}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biodiversity: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 ${BIODIVERSITY_CONFIG[activeCave.biodiversity].bgClass}`}
                    >
                      {BIODIVERSITY_CONFIG[activeCave.biodiversity].label}
                    </Badge>
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
