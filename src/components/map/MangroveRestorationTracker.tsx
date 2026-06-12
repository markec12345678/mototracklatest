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
import { useMapStore, type MangroveRestorationState, type MangroveRestorationSite } from '@/lib/map-store'
import { TreeDeciduous as TreeDeciduousIcon2, X, MapPin, Leaf, Shield, Fish, Filter } from 'lucide-react'

const DEMO_SITES: MangroveRestorationSite[] = [
  {
    id: 'mr-sundarbans',
    name: 'Sundarbans',
    latitude: 21.95,
    longitude: 89.18,
    area: 4200,
    speciesCount: 34,
    carbonSequestration: 12.8,
    coastalProtection: 85,
    fisheryBoost: 72,
    restorationStage: 'mature',
  },
  {
    id: 'mr-madagascar',
    name: 'Madagascar',
    latitude: -16.25,
    longitude: 49.95,
    area: 1800,
    speciesCount: 19,
    carbonSequestration: 8.4,
    coastalProtection: 68,
    fisheryBoost: 55,
    restorationStage: 'planting',
  },
  {
    id: 'mr-vietnam',
    name: 'Vietnam Mekong',
    latitude: 10.23,
    longitude: 106.68,
    area: 950,
    speciesCount: 22,
    carbonSequestration: 6.2,
    coastalProtection: 74,
    fisheryBoost: 61,
    restorationStage: 'established',
  },
  {
    id: 'mr-florida',
    name: 'Florida Everglades',
    latitude: 25.32,
    longitude: -80.93,
    area: 1200,
    speciesCount: 12,
    carbonSequestration: 5.1,
    coastalProtection: 79,
    fisheryBoost: 48,
    restorationStage: 'nursery',
  },
  {
    id: 'mr-kenya',
    name: 'Kenya Gazi',
    latitude: -4.42,
    longitude: 39.51,
    area: 620,
    speciesCount: 16,
    carbonSequestration: 7.6,
    coastalProtection: 62,
    fisheryBoost: 58,
    restorationStage: 'established',
  },
  {
    id: 'mr-indonesia',
    name: 'Indonesia Bali',
    latitude: -8.35,
    longitude: 115.17,
    area: 340,
    speciesCount: 21,
    carbonSequestration: 4.3,
    coastalProtection: 55,
    fisheryBoost: 42,
    restorationStage: 'planned',
  },
]

const STAGE_CONFIG: Record<
  MangroveRestorationSite['restorationStage'],
  { label: string; color: string; bgClass: string }
> = {
  planned: { label: 'Planned', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  nursery: { label: 'Nursery', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  planting: { label: 'Planting', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  established: { label: 'Established', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  mature: { label: 'Mature', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
}

export function MangroveRestorationTracker() {
  const mangroveRestoration = useMapStore((s) => s.mangroveRestoration)
  const setMangroveRestoration = useMapStore((s) => s.setMangroveRestoration)

  const sites = useMemo(
    () => (mangroveRestoration.sites.length > 0 ? mangroveRestoration.sites : DEMO_SITES),
    [mangroveRestoration.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (mangroveRestoration.stageFilter !== 'all' && s.restorationStage !== mangroveRestoration.stageFilter) return false
      return true
    })
  }, [sites, mangroveRestoration.stageFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { totalArea: 0, establishedMatureCount: 0, avgCarbon: 0 }
    }
    const totalArea = filteredSites.reduce((sum, s) => sum + s.area, 0)
    const establishedMatureCount = filteredSites.filter(
      (s) => s.restorationStage === 'established' || s.restorationStage === 'mature'
    ).length
    const avgCarbon =
      filteredSites.reduce((sum, s) => sum + s.carbonSequestration, 0) / filteredSites.length
    return { totalArea, establishedMatureCount, avgCarbon: Math.round(avgCarbon * 10) / 10 }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === mangroveRestoration.activeSiteId) ?? null,
    [sites, mangroveRestoration.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!mangroveRestoration.open) return null

  const overlayToggles: { key: keyof MangroveRestorationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showArea', label: 'Area', icon: MapPin },
    { key: 'showCarbon', label: 'Carbon', icon: Leaf },
    { key: 'showCoastalProtection', label: 'Coastal Protection', icon: Shield },
    { key: 'showFishery', label: 'Fishery', icon: Fish },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TreeDeciduousIcon2 className="h-4 w-4 text-emerald-500" />
              Mangrove Restoration Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMangroveRestoration({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Stage Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Restoration Stage
            </Label>
            <Select
              value={mangroveRestoration.stageFilter}
              onValueChange={(v) =>
                setMangroveRestoration({
                  stageFilter: v as MangroveRestorationState['stageFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="nursery">Nursery</SelectItem>
                <SelectItem value="planting">Planting</SelectItem>
                <SelectItem value="established">Established</SelectItem>
                <SelectItem value="mature">Mature</SelectItem>
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
                  checked={mangroveRestoration[key] as boolean}
                  onCheckedChange={(checked) => setMangroveRestoration({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Area</div>
              <div className="text-sm font-semibold text-emerald-500">{summary.totalArea.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">hectares</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Est./Mature</div>
              <div className="text-sm font-semibold text-green-500">{summary.establishedMatureCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Carbon</div>
              <div className="text-sm font-semibold">{summary.avgCarbon}</div>
              <div className="text-[9px] text-muted-foreground">tCO₂/ha/yr</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Restoration Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = mangroveRestoration.activeSiteId === site.id
                  const stageCfg = STAGE_CONFIG[site.restorationStage]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                      }`}
                      onClick={() =>
                        setMangroveRestoration({
                          activeSiteId: isActive ? null : site.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: stageCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${stageCfg.bgClass}`}
                        >
                          {stageCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {mangroveRestoration.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-foreground font-medium">
                              {site.area.toLocaleString()} ha
                            </span>
                          </div>
                        )}
                        {mangroveRestoration.showCarbon && (
                          <div>
                            Carbon:{' '}
                            <span className="text-foreground font-medium">
                              {site.carbonSequestration} tCO₂/ha/yr
                            </span>
                          </div>
                        )}
                        {mangroveRestoration.showCoastalProtection && (
                          <div>
                            Coastal Prot.:{' '}
                            <span className="text-foreground font-medium">
                              {site.coastalProtection}%
                            </span>
                          </div>
                        )}
                        {mangroveRestoration.showFishery && (
                          <div>
                            Fishery Boost:{' '}
                            <span className="text-foreground font-medium">
                              {site.fisheryBoost}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STAGE_CONFIG[activeSite.restorationStage].bgClass}`}
                  >
                    {STAGE_CONFIG[activeSite.restorationStage].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSite.latitude.toFixed(2)}, {activeSite.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeSite.area.toLocaleString()} ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Species Count: </span>
                    <span className="font-medium">{activeSite.speciesCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon Seq.: </span>
                    <span className="font-medium">{activeSite.carbonSequestration} tCO₂/ha/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coastal Prot.: </span>
                    <span className="font-medium">{activeSite.coastalProtection}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fishery Boost: </span>
                    <span className="font-medium">{activeSite.fisheryBoost}%</span>
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
