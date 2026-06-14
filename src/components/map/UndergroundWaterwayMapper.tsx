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
import { useMapStore, type UndergroundWaterwayState, type UndergroundWaterway } from '@/lib/map-store'
import { Droplets as DropletsIcon4, X, MapPin, Filter, ArrowDown, Ruler, Leaf } from 'lucide-react'

const DEMO_WATERWAYS: UndergroundWaterway[] = [
  {
    id: 'uw-loch',
    name: 'Loch Ness Subsurface Channel',
    latitude: 57.32,
    longitude: -4.45,
    waterwayType: 'river',
    flowRate: 420,
    depth: 230,
    length: 36,
    waterQuality: 'pristine',
    accessibility: 'partially',
    ecosystem: 'moderate',
  },
  {
    id: 'uw-florida',
    name: 'Floridan Aquifer Channel',
    latitude: 29.65,
    longitude: -82.32,
    waterwayType: 'aquifer_channel',
    flowRate: 850,
    depth: 120,
    length: 280,
    waterQuality: 'good',
    accessibility: 'accessible',
    ecosystem: 'rich',
  },
  {
    id: 'uw-mammoth',
    name: 'Mammoth Cave Karst System',
    latitude: 37.18,
    longitude: -86.10,
    waterwayType: 'karst_conduit',
    flowRate: 310,
    depth: 85,
    length: 680,
    waterQuality: 'good',
    accessibility: 'accessible',
    ecosystem: 'rich',
  },
  {
    id: 'uw-greenland',
    name: 'Greenland Glacial Moulin',
    latitude: 72.58,
    longitude: -38.47,
    waterwayType: 'glacial_moulin',
    flowRate: 1500,
    depth: 320,
    length: 12,
    waterQuality: 'pristine',
    accessibility: 'inaccessible',
    ecosystem: 'sparse',
  },
  {
    id: 'uw-lava',
    name: 'Kazumura Lava Tube',
    latitude: 19.41,
    longitude: -155.15,
    waterwayType: 'lava_tube',
    flowRate: 45,
    depth: 35,
    length: 65,
    waterQuality: 'moderate',
    accessibility: 'partially',
    ecosystem: 'sparse',
  },
  {
    id: 'uw-oxbowow',
    name: 'Oxbowow Underground River',
    latitude: 15.35,
    longitude: 104.85,
    waterwayType: 'karst_conduit',
    flowRate: 620,
    depth: 150,
    length: 92,
    waterQuality: 'poor',
    accessibility: 'unexplored',
    ecosystem: 'moderate',
  },
]

const WATER_QUALITY_CONFIG: Record<
  UndergroundWaterway['waterQuality'],
  { label: string; color: string; bgClass: string }
> = {
  pristine: { label: 'Pristine', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  good: { label: 'Good', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  poor: { label: 'Poor', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const ECOSYSTEM_CONFIG: Record<
  UndergroundWaterway['ecosystem'],
  { label: string; bgClass: string }
> = {
  barren: { label: 'Barren', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  sparse: { label: 'Sparse', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  rich: { label: 'Rich', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

export function UndergroundWaterwayMapper() {
  const undergroundWaterway = useMapStore((s) => s.undergroundWaterway)
  const setUndergroundWaterway = useMapStore((s) => s.setUndergroundWaterway)

  const waterways = useMemo(
    () => (undergroundWaterway.waterways.length > 0 ? undergroundWaterway.waterways : DEMO_WATERWAYS),
    [undergroundWaterway.waterways]
  )

  const filteredWaterways = useMemo(() => {
    return waterways.filter((w) => {
      if (undergroundWaterway.typeFilter !== 'all' && w.waterwayType !== undergroundWaterway.typeFilter) return false
      return true
    })
  }, [waterways, undergroundWaterway.typeFilter])

  const summary = useMemo(() => {
    if (filteredWaterways.length === 0) {
      return { totalLength: 0, pristineCount: 0, richEcosystemCount: 0 }
    }
    const totalLength = filteredWaterways.reduce((sum, w) => sum + w.length, 0)
    const pristineCount = filteredWaterways.filter((w) => w.waterQuality === 'pristine').length
    const richEcosystemCount = filteredWaterways.filter((w) => w.ecosystem === 'rich').length
    return {
      totalLength,
      pristineCount,
      richEcosystemCount,
    }
  }, [filteredWaterways])

  const activeWaterway = useMemo(
    () => waterways.find((w) => w.id === undergroundWaterway.activeWaterwayId) ?? null,
    [waterways, undergroundWaterway.activeWaterwayId]
  )

  if (typeof window === 'undefined') return null
  if (!undergroundWaterway.open) return null

  const overlayToggles: { key: keyof UndergroundWaterwayState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowRate', label: 'Flow Rate', icon: DropletsIcon4 },
    { key: 'showDepth', label: 'Depth', icon: ArrowDown },
    { key: 'showWaterQuality', label: 'Water Quality', icon: Ruler },
    { key: 'showEcosystem', label: 'Ecosystem', icon: Leaf },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DropletsIcon4 className="h-4 w-4 text-teal-500" />
              Underground Waterway Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setUndergroundWaterway({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Waterway Type
            </Label>
            <Select
              value={undergroundWaterway.typeFilter}
              onValueChange={(v) =>
                setUndergroundWaterway({
                  typeFilter: v as UndergroundWaterwayState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="river">Underground River</SelectItem>
                <SelectItem value="aquifer_channel">Aquifer Channel</SelectItem>
                <SelectItem value="karst_conduit">Karst Conduit</SelectItem>
                <SelectItem value="glacial_moulin">Glacial Moulin</SelectItem>
                <SelectItem value="lava_tube">Lava Tube</SelectItem>
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
                  <Icon className="h-3 w-3 text-teal-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={undergroundWaterway[key] as boolean}
                  onCheckedChange={(checked) => setUndergroundWaterway({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Length</div>
              <div className="text-sm font-semibold text-teal-500">{summary.totalLength}</div>
              <div className="text-[9px] text-muted-foreground">km</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Pristine</div>
              <div className="text-sm font-semibold text-green-500">{summary.pristineCount}</div>
              <div className="text-[9px] text-muted-foreground">waterways</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Rich Ecosystem</div>
              <div className="text-sm font-semibold text-emerald-500">{summary.richEcosystemCount}</div>
              <div className="text-[9px] text-muted-foreground">waterways</div>
            </div>
          </div>

          <Separator />

          {/* Waterway List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Underground Waterways ({filteredWaterways.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredWaterways.map((waterway) => {
                  const isActive = undergroundWaterway.activeWaterwayId === waterway.id
                  const qualityCfg = WATER_QUALITY_CONFIG[waterway.waterQuality]
                  const ecoCfg = ECOSYSTEM_CONFIG[waterway.ecosystem]
                  return (
                    <div
                      key={waterway.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setUndergroundWaterway({
                          activeWaterwayId: isActive ? null : waterway.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: qualityCfg.color }}
                          />
                          <span className="text-xs font-medium">{waterway.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${qualityCfg.bgClass}`}
                        >
                          {qualityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {undergroundWaterway.showFlowRate && (
                          <div>
                            Flow:{' '}
                            <span className="text-foreground font-medium">
                              {waterway.flowRate} L/s
                            </span>
                          </div>
                        )}
                        {undergroundWaterway.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {waterway.depth} m
                            </span>
                          </div>
                        )}
                        {undergroundWaterway.showWaterQuality && (
                          <div>
                            Quality:{' '}
                            <span className="text-foreground font-medium">
                              {qualityCfg.label}
                            </span>
                          </div>
                        )}
                        {undergroundWaterway.showEcosystem && (
                          <div>
                            Ecosystem:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${ecoCfg.bgClass}`}
                            >
                              {ecoCfg.label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredWaterways.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No waterways match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Waterway Details */}
          {activeWaterway && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-500" />
                  <span className="text-xs font-semibold">{activeWaterway.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${WATER_QUALITY_CONFIG[activeWaterway.waterQuality].bgClass}`}
                  >
                    {WATER_QUALITY_CONFIG[activeWaterway.waterQuality].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeWaterway.latitude.toFixed(2)}, {activeWaterway.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium capitalize">{activeWaterway.waterwayType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flow Rate: </span>
                    <span className="font-medium">{activeWaterway.flowRate} L/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeWaterway.depth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Length: </span>
                    <span className="font-medium">{activeWaterway.length} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accessibility: </span>
                    <span className="font-medium capitalize">{activeWaterway.accessibility.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ecosystem: </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] h-4 px-1 ${ECOSYSTEM_CONFIG[activeWaterway.ecosystem].bgClass}`}
                    >
                      {ECOSYSTEM_CONFIG[activeWaterway.ecosystem].label}
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
