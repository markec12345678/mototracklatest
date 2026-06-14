'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useMapStore,
  type UrbanHeatIslandDetailData,
  type UrbanHeatIslandDetailState,
} from '@/lib/map-store'
import {
  Thermometer as ThermometerIcon4,
  X,
  TreePine,
  ShieldAlert,
  Sun,
  MapPin,
  Filter,
  Wind,
} from 'lucide-react'

// ─── Demo Zones ───────────────────────────────────────────────
const DEMO_ZONES: UrbanHeatIslandDetailData[] = [
  {
    id: 'uhd-phoenix',
    name: 'Phoenix Downtown',
    lat: 33.45,
    lng: -112.07,
    temperatureDelta: 8.5,
    vegetationCover: 5,
    albedo: 0.12,
    vulnerability: 92,
    populationDensity: 1800,
    status: 'severe',
    description: 'Intense urban core with minimal green space and extensive heat-absorbing infrastructure.',
  },
  {
    id: 'uhd-tokyo',
    name: 'Tokyo Central',
    lat: 35.68,
    lng: 139.7,
    temperatureDelta: 6.2,
    vegetationCover: 12,
    albedo: 0.15,
    vulnerability: 78,
    populationDensity: 6200,
    status: 'high',
    description: 'Dense metropolitan center with high building coverage and limited vegetation corridors.',
  },
  {
    id: 'uhd-paris',
    name: 'Paris Central',
    lat: 48.86,
    lng: 2.35,
    temperatureDelta: 4.8,
    vegetationCover: 18,
    albedo: 0.22,
    vulnerability: 62,
    populationDensity: 21000,
    status: 'moderate',
    description: 'Historic urban core with moderate tree canopy and reflective roofing patterns.',
  },
  {
    id: 'uhd-singapore',
    name: 'Singapore CBD',
    lat: 1.29,
    lng: 103.85,
    temperatureDelta: 3.5,
    vegetationCover: 28,
    albedo: 0.18,
    vulnerability: 45,
    populationDensity: 8000,
    status: 'low',
    description: 'Tropical city with active greening policies and vertical garden integration.',
  },
  {
    id: 'uhd-houston',
    name: 'Houston Industrial',
    lat: 29.76,
    lng: -95.37,
    temperatureDelta: 7.2,
    vegetationCover: 8,
    albedo: 0.1,
    vulnerability: 85,
    populationDensity: 1200,
    status: 'high',
    description: 'Industrial zone with extensive impervious surfaces and petrochemical heat emissions.',
  },
  {
    id: 'uhd-berlin',
    name: 'Berlin Suburban',
    lat: 52.52,
    lng: 13.4,
    temperatureDelta: 2.1,
    vegetationCover: 35,
    albedo: 0.28,
    vulnerability: 28,
    populationDensity: 4500,
    status: 'minimal',
    description: 'Suburban area with substantial green belts, parks, and reflective building standards.',
  },
]

// ─── Zone Type Mapping (for filtering) ────────────────────────
const ZONE_TYPE_MAP: Record<string, UrbanHeatIslandDetailState['zoneFilter']> = {
  'uhd-phoenix': 'downtown',
  'uhd-tokyo': 'downtown',
  'uhd-paris': 'residential',
  'uhd-singapore': 'downtown',
  'uhd-houston': 'industrial',
  'uhd-berlin': 'suburban',
}

// ─── Status Config ────────────────────────────────────────────
const STATUS_CONFIG: Record<
  UrbanHeatIslandDetailData['status'],
  { label: string; color: string; bgClass: string; dotClass: string }
> = {
  severe: {
    label: 'Severe',
    color: '#dc2626',
    bgClass: 'bg-red-500/10 text-red-600 border-red-500/30',
    dotClass: 'bg-red-500',
  },
  high: {
    label: 'High',
    color: '#f97316',
    bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    dotClass: 'bg-orange-500',
  },
  moderate: {
    label: 'Moderate',
    color: '#eab308',
    bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    dotClass: 'bg-yellow-500',
  },
  low: {
    label: 'Low',
    color: '#3b82f6',
    bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    dotClass: 'bg-blue-500',
  },
  minimal: {
    label: 'Minimal',
    color: '#22c55e',
    bgClass: 'bg-green-500/10 text-green-600 border-green-500/30',
    dotClass: 'bg-green-500',
  },
}

const ZONE_FILTER_OPTIONS: { value: UrbanHeatIslandDetailState['zoneFilter']; label: string }[] = [
  { value: 'all', label: 'All Zones' },
  { value: 'downtown', label: 'Downtown' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'residential', label: 'Residential' },
  { value: 'suburban', label: 'Suburban' },
]

// ─── Helper Functions ─────────────────────────────────────────
function formatPopDensity(d: number): string {
  return `${d.toLocaleString()}/km\u00B2`
}

function getVulnerabilityColor(v: number): string {
  if (v >= 80) return '#dc2626'
  if (v >= 60) return '#f97316'
  if (v >= 40) return '#eab308'
  if (v >= 20) return '#3b82f6'
  return '#22c55e'
}

// ─── Component ────────────────────────────────────────────────
export function UrbanHeatIslandDetailMonitor() {
  const state = useMapStore((s) => s.urbanHeatIslandDetail)
  const setState = useMapStore((s) => s.setUrbanHeatIslandDetail)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    if (state.zoneFilter === 'all') return zones
    return zones.filter((z) => ZONE_TYPE_MAP[z.id] === state.zoneFilter)
  }, [zones, state.zoneFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgTempDelta: 0, avgVulnerability: 0, criticalCount: 0 }
    }
    const avgTempDelta =
      filteredZones.reduce((sum, z) => sum + z.temperatureDelta, 0) /
      filteredZones.length
    const avgVulnerability =
      filteredZones.reduce((sum, z) => sum + z.vulnerability, 0) /
      filteredZones.length
    const criticalCount = filteredZones.filter(
      (z) => z.status === 'severe' || z.status === 'high'
    ).length
    return {
      avgTempDelta: Math.round(avgTempDelta * 10) / 10,
      avgVulnerability: Math.round(avgVulnerability * 10) / 10,
      criticalCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  // ─── SSR Guard ────────────────────────────────────────────
  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: {
    key: keyof UrbanHeatIslandDetailState
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { key: 'showTemperatureDelta', label: 'Temperature Delta', icon: ThermometerIcon4 },
    { key: 'showVegetationCover', label: 'Vegetation Cover', icon: TreePine },
    { key: 'showAlbedo', label: 'Albedo', icon: Sun },
    { key: 'showVulnerability', label: 'Vulnerability', icon: ShieldAlert },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-red-950/95 backdrop-blur-xl border border-orange-800/30 rounded-xl shadow-lg shadow-red-900/20 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <ThermometerIcon4 className="h-4 w-4 text-red-400" />
              Urban Heat Island Detail Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-300 hover:text-orange-100 hover:bg-orange-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Zone Filter */}
          <div>
            <Label className="text-xs text-orange-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Zone Type
            </Label>
            <Select
              value={state.zoneFilter}
              onValueChange={(v) =>
                setState({
                  zoneFilter: v as UrbanHeatIslandDetailState['zoneFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 border-orange-700/40 bg-orange-900/20 text-orange-100 focus:ring-orange-600/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZONE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-orange-200">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-orange-800/40"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/20 p-2 text-center">
              <div className="text-[10px] text-orange-300/70">Avg Temp Delta</div>
              <div className="text-sm font-semibold text-red-400">
                +{summary.avgTempDelta}&deg;C
              </div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/20 p-2 text-center">
              <div className="text-[10px] text-orange-300/70">Avg Vulnerability</div>
              <div
                className="text-sm font-semibold"
                style={{ color: getVulnerabilityColor(summary.avgVulnerability) }}
              >
                {summary.avgVulnerability}
              </div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/20 p-2 text-center">
              <div className="text-[10px] text-orange-300/70">Severe+High</div>
              <div className="text-sm font-semibold text-orange-400">
                {summary.criticalCount}
              </div>
            </div>
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
              Monitored Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_CONFIG[zone.status]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-800/20'
                          : 'border-orange-700/25 hover:border-orange-500/30 hover:bg-orange-800/10'
                      }`}
                      onClick={() =>
                        setState({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-orange-100">
                            {zone.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/70">
                        {state.showTemperatureDelta && (
                          <div>
                            Temp Delta:{' '}
                            <span className="text-red-400 font-medium">
                              +{zone.temperatureDelta}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showVegetationCover && (
                          <div>
                            Vegetation:{' '}
                            <span className="text-green-400 font-medium">
                              {zone.vegetationCover}%
                            </span>
                          </div>
                        )}
                        {state.showAlbedo && (
                          <div>
                            Albedo:{' '}
                            <span className="text-amber-400 font-medium">
                              {zone.albedo.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {state.showVulnerability && (
                          <div>
                            Vulnerability:{' '}
                            <span
                              className="font-medium"
                              style={{ color: getVulnerabilityColor(zone.vulnerability) }}
                            >
                              {zone.vulnerability}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-orange-300/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Detail */}
          {activeZone && (
            <>
              <Separator className="bg-orange-800/30" />
              <div className="space-y-3 rounded-lg border border-orange-600/30 bg-orange-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-orange-100">
                    {activeZone.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>

                {/* Vulnerability Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-orange-300/70">Vulnerability Index</span>
                    <span
                      className="font-semibold"
                      style={{ color: getVulnerabilityColor(activeZone.vulnerability) }}
                    >
                      {activeZone.vulnerability}/100
                    </span>
                  </div>
                  <Progress
                    value={activeZone.vulnerability}
                    className="h-1.5 bg-orange-900/40 [&>[data-slot=indicator]]:bg-red-500"
                  />
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-orange-700/25 bg-orange-900/20 p-2">
                    <div className="text-[10px] text-orange-300/60 mb-0.5 flex items-center gap-1">
                      <ThermometerIcon4 className="h-2.5 w-2.5" />
                      Temp Delta
                    </div>
                    <div className="text-sm font-semibold text-red-400">
                      +{activeZone.temperatureDelta}&deg;C
                    </div>
                  </div>
                  <div className="rounded-md border border-orange-700/25 bg-orange-900/20 p-2">
                    <div className="text-[10px] text-orange-300/60 mb-0.5 flex items-center gap-1">
                      <TreePine className="h-2.5 w-2.5" />
                      Vegetation Cover
                    </div>
                    <div className="text-sm font-semibold text-green-400">
                      {activeZone.vegetationCover}%
                    </div>
                  </div>
                  <div className="rounded-md border border-orange-700/25 bg-orange-900/20 p-2">
                    <div className="text-[10px] text-orange-300/60 mb-0.5 flex items-center gap-1">
                      <Sun className="h-2.5 w-2.5" />
                      Albedo
                    </div>
                    <div className="text-sm font-semibold text-amber-400">
                      {activeZone.albedo.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-md border border-orange-700/25 bg-orange-900/20 p-2">
                    <div className="text-[10px] text-orange-300/60 mb-0.5 flex items-center gap-1">
                      <ShieldAlert className="h-2.5 w-2.5" />
                      Vulnerability
                    </div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: getVulnerabilityColor(activeZone.vulnerability) }}
                    >
                      {activeZone.vulnerability}
                    </div>
                  </div>
                </div>

                {/* Population & Coordinates */}
                <div className="text-[10px] text-orange-300/60 space-y-0.5">
                  <div>
                    Pop. Density:{' '}
                    <span className="text-orange-200 font-medium">
                      {formatPopDensity(activeZone.populationDensity)}
                    </span>
                  </div>
                  <div>
                    Coordinates:{' '}
                    <span className="text-orange-200 font-medium">
                      {activeZone.lat.toFixed(2)}, {activeZone.lng.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[10px] text-orange-300/60 leading-relaxed">
                  {activeZone.description}
                </p>

                {/* Air Pollution Dispersion Link */}
                <div className="flex items-center gap-2 rounded-md border border-orange-700/20 bg-orange-900/15 p-2">
                  <Wind className="h-3.5 w-3.5 text-orange-400" />
                  <div className="flex-1">
                    <div className="text-[10px] text-orange-200 font-medium">
                      Air Pollution Dispersion
                    </div>
                    <div className="text-[9px] text-orange-300/50">
                      Cross-reference dispersion patterns for this zone
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 border-orange-700/30 text-orange-400"
                  >
                    Linked
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
