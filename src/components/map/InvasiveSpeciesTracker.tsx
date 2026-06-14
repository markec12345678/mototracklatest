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
import { useMapStore, type InvasiveSpeciesState, type InvasiveSpecies } from '@/lib/map-store'
import { Bug, X, TrendingUp, ShieldAlert, MapPin, ClipboardCheck, Filter } from 'lucide-react'

const DEMO_SPECIES: InvasiveSpecies[] = [
  {
    id: 'is-kudzu',
    name: 'Kudzu Vine',
    scientificName: 'Pueraria montana',
    latitude: 33.75,
    longitude: -84.39,
    speciesType: 'plant',
    spreadRate: 48,
    impactLevel: 'high',
    firstDetected: '1876',
    affectedArea: 12500,
    nativeRange: 'East Asia',
    controlStatus: 'partially_controlled',
  },
  {
    id: 'is-cane',
    name: 'Cane Toad',
    scientificName: 'Rhinella marina',
    latitude: -19.26,
    longitude: 146.78,
    speciesType: 'animal',
    spreadRate: 35,
    impactLevel: 'critical',
    firstDetected: '1935',
    affectedArea: 8500,
    nativeRange: 'Central/South America',
    controlStatus: 'uncontrolled',
  },
  {
    id: 'is-emerald',
    name: 'Emerald Ash Borer',
    scientificName: 'Agrilus planipennis',
    latitude: 42.33,
    longitude: -83.05,
    speciesType: 'insect',
    spreadRate: 22,
    impactLevel: 'high',
    firstDetected: '2002',
    affectedArea: 4200,
    nativeRange: 'East Asia',
    controlStatus: 'partially_controlled',
  },
  {
    id: 'is-zebra',
    name: 'Zebra Mussel',
    scientificName: 'Dreissena polymorpha',
    latitude: 41.88,
    longitude: -87.63,
    speciesType: 'aquatic',
    spreadRate: 15,
    impactLevel: 'moderate',
    firstDetected: '1988',
    affectedArea: 6800,
    nativeRange: 'Eurasia',
    controlStatus: 'contained',
  },
  {
    id: 'is-chytrid',
    name: 'Chytrid Fungus',
    scientificName: 'Batrachochytrium dendrobatidis',
    latitude: -16.50,
    longitude: -68.15,
    speciesType: 'fungus',
    spreadRate: 8,
    impactLevel: 'critical',
    firstDetected: '1998',
    affectedArea: 3100,
    nativeRange: 'Unknown',
    controlStatus: 'uncontrolled',
  },
  {
    id: 'is-giant',
    name: 'Giant Hogweed',
    scientificName: 'Heracleum mantegazzianum',
    latitude: 51.51,
    longitude: -0.13,
    speciesType: 'plant',
    spreadRate: 12,
    impactLevel: 'moderate',
    firstDetected: '19th Century',
    affectedArea: 2800,
    nativeRange: 'Caucasus Region',
    controlStatus: 'partially_controlled',
  },
]

const IMPACT_CONFIG: Record<
  InvasiveSpecies['impactLevel'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const CONTROL_CONFIG: Record<
  InvasiveSpecies['controlStatus'],
  { label: string; bgClass: string }
> = {
  uncontrolled: { label: 'Uncontrolled', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  partially_controlled: { label: 'Partial', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  contained: { label: 'Contained', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  eradicated: { label: 'Eradicated', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

const TYPE_LABELS: Record<InvasiveSpeciesState['typeFilter'], string> = {
  all: 'All Types',
  plant: 'Plant',
  animal: 'Animal',
  insect: 'Insect',
  aquatic: 'Aquatic',
  fungus: 'Fungus',
}

export function InvasiveSpeciesTracker() {
  const state = useMapStore((s) => s.invasiveSpecies)
  const setState = useMapStore((s) => s.setInvasiveSpecies)

  const speciesList = useMemo(
    () => (state.species.length > 0 ? state.species : DEMO_SPECIES),
    [state.species]
  )

  const filteredSpecies = useMemo(() => {
    return speciesList.filter((s) => {
      if (state.typeFilter !== 'all' && s.speciesType !== state.typeFilter) return false
      return true
    })
  }, [speciesList, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredSpecies.length === 0) {
      return { avgSpreadRate: 0, criticalCount: 0, totalAffectedArea: 0 }
    }
    const avgSpreadRate =
      filteredSpecies.reduce((sum, s) => sum + s.spreadRate, 0) / filteredSpecies.length
    const criticalCount = filteredSpecies.filter((s) => s.impactLevel === 'critical').length
    const totalAffectedArea = filteredSpecies.reduce((sum, s) => sum + s.affectedArea, 0)
    return {
      avgSpreadRate: Math.round(avgSpreadRate * 10) / 10,
      criticalCount,
      totalAffectedArea: Math.round(totalAffectedArea),
    }
  }, [filteredSpecies])

  const activeSpecies = useMemo(
    () => speciesList.find((s) => s.id === state.activeSpeciesId) ?? null,
    [speciesList, state.activeSpeciesId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof InvasiveSpeciesState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSpreadRate', label: 'Spread Rate', icon: TrendingUp },
    { key: 'showImpactLevel', label: 'Impact Level', icon: ShieldAlert },
    { key: 'showAffectedArea', label: 'Affected Area', icon: MapPin },
    { key: 'showControlStatus', label: 'Control Status', icon: ClipboardCheck },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4 text-emerald-500" />
              Invasive Species Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setState({ open: false })}
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
              Species Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as InvasiveSpeciesState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
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
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Spread Rate</div>
              <div className="text-sm font-semibold">{summary.avgSpreadRate}</div>
              <div className="text-[9px] text-muted-foreground">km²/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Critical</div>
              <div className="text-sm font-semibold text-red-500">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">species</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Area</div>
              <div className="text-sm font-semibold text-emerald-500">{summary.totalAffectedArea.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">km²</div>
            </div>
          </div>

          <Separator />

          {/* Species List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Invasive Species ({filteredSpecies.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSpecies.map((sp) => {
                  const isActive = state.activeSpeciesId === sp.id
                  const impactCfg = IMPACT_CONFIG[sp.impactLevel]
                  return (
                    <div
                      key={sp.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeSpeciesId: isActive ? null : sp.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: impactCfg.color }}
                          />
                          <span className="text-xs font-medium">{sp.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${impactCfg.bgClass}`}
                        >
                          {impactCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showSpreadRate && (
                          <div>
                            Spread:{' '}
                            <span className="text-foreground font-medium">
                              {sp.spreadRate} km²/yr
                            </span>
                          </div>
                        )}
                        {state.showImpactLevel && (
                          <div>
                            Impact:{' '}
                            <span className="text-foreground font-medium capitalize">
                              {sp.impactLevel}
                            </span>
                          </div>
                        )}
                        {state.showAffectedArea && (
                          <div>
                            Area:{' '}
                            <span className="text-foreground font-medium">
                              {sp.affectedArea.toLocaleString()} km²
                            </span>
                          </div>
                        )}
                        {state.showControlStatus && (
                          <div>
                            Control:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${CONTROL_CONFIG[sp.controlStatus].bgClass}`}
                            >
                              {CONTROL_CONFIG[sp.controlStatus].label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSpecies.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No species match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Species Details */}
          {activeSpecies && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold">{activeSpecies.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${IMPACT_CONFIG[activeSpecies.impactLevel].bgClass}`}
                  >
                    {IMPACT_CONFIG[activeSpecies.impactLevel].label}
                  </Badge>
                </div>
                <div className="text-[10px] italic text-muted-foreground">{activeSpecies.scientificName}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSpecies.latitude.toFixed(2)}, {activeSpecies.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spread Rate: </span>
                    <span className="font-medium">{activeSpecies.spreadRate} km²/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected Area: </span>
                    <span className="font-medium">{activeSpecies.affectedArea.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">First Detected: </span>
                    <span className="font-medium">{activeSpecies.firstDetected}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Native Range: </span>
                    <span className="font-medium">{activeSpecies.nativeRange}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Control: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 ${CONTROL_CONFIG[activeSpecies.controlStatus].bgClass}`}
                    >
                      {CONTROL_CONFIG[activeSpecies.controlStatus].label}
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
