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
import { useMapStore, type WetlandZone, type WetlandMapperState } from '@/lib/map-store'
import {
  X,
  Droplets,
  TreePine,
  Shield,
  Filter,
  MapPin,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const TYPE_COLORS: Record<WetlandZone['type'], string> = {
  marsh: '#22d3ee',
  swamp: '#a3e635',
  bog: '#c084fc',
  fen: '#facc15',
  estuary: '#fb923c',
}

const TYPE_LABELS: Record<WetlandZone['type'], string> = {
  marsh: 'Marsh',
  swamp: 'Swamp',
  bog: 'Bog',
  fen: 'Fen',
  estuary: 'Estuary',
}

const PROTECTION_COLORS: Record<WetlandZone['protectionStatus'], string> = {
  protected: '#22c55e',
  unprotected: '#ef4444',
  partial: '#eab308',
}

const PROTECTION_LABELS: Record<WetlandZone['protectionStatus'], string> = {
  protected: 'Protected',
  unprotected: 'Unprotected',
  partial: 'Partial',
}

export function WetlandMapper() {
  const wetlandMapper = useMapStore((s) => s.wetlandMapper)
  const setWetlandMapper = useMapStore((s) => s.setWetlandMapper)

  const sampleWetlands = useMemo<WetlandZone[]>(() => [
    {
      id: 'w1',
      name: 'Everglades',
      latitude: 25.95,
      longitude: -80.8,
      area: 6100,
      type: 'marsh',
      waterLevel: 1.2,
      biodiversityIndex: 8.7,
      plantSpecies: 1100,
      animalSpecies: 450,
      protectionStatus: 'protected',
    },
    {
      id: 'w2',
      name: 'Okavango Delta',
      latitude: -19.5,
      longitude: 22.5,
      area: 15000,
      type: 'swamp',
      waterLevel: 2.8,
      biodiversityIndex: 9.2,
      plantSpecies: 1300,
      animalSpecies: 530,
      protectionStatus: 'partial',
    },
    {
      id: 'w3',
      name: 'Pantanal',
      latitude: -17.8,
      longitude: -56.7,
      area: 19500,
      type: 'swamp',
      waterLevel: 3.1,
      biodiversityIndex: 9.5,
      plantSpecies: 3500,
      animalSpecies: 680,
      protectionStatus: 'partial',
    },
    {
      id: 'w4',
      name: 'Camargue',
      latitude: 43.55,
      longitude: 4.6,
      area: 930,
      type: 'marsh',
      waterLevel: 0.8,
      biodiversityIndex: 7.1,
      plantSpecies: 600,
      animalSpecies: 260,
      protectionStatus: 'protected',
    },
    {
      id: 'w5',
      name: 'Sundarbans',
      latitude: 21.95,
      longitude: 89.2,
      area: 10600,
      type: 'estuary',
      waterLevel: 2.4,
      biodiversityIndex: 8.9,
      plantSpecies: 450,
      animalSpecies: 380,
      protectionStatus: 'protected',
    },
    {
      id: 'w6',
      name: 'West Siberian Bog',
      latitude: 60.0,
      longitude: 75.0,
      area: 53000,
      type: 'bog',
      waterLevel: 0.5,
      biodiversityIndex: 5.3,
      plantSpecies: 320,
      animalSpecies: 150,
      protectionStatus: 'unprotected',
    },
    {
      id: 'w7',
      name: 'Wicken Fen',
      latitude: 52.3,
      longitude: 0.28,
      area: 8,
      type: 'fen',
      waterLevel: 0.3,
      biodiversityIndex: 7.8,
      plantSpecies: 8000,
      animalSpecies: 7000,
      protectionStatus: 'protected',
    },
    {
      id: 'w8',
      name: 'Kafue Flats',
      latitude: -15.8,
      longitude: 27.0,
      area: 6500,
      type: 'marsh',
      waterLevel: 1.6,
      biodiversityIndex: 7.4,
      plantSpecies: 420,
      animalSpecies: 290,
      protectionStatus: 'partial',
    },
  ], [])

  if (typeof window === 'undefined') return null
  if (!wetlandMapper.open) return null

  const wetlands = wetlandMapper.wetlands.length > 0 ? wetlandMapper.wetlands : sampleWetlands

  const filteredWetlands = wetlands.filter((w) => {
    if (wetlandMapper.typeFilter !== 'all' && w.type !== wetlandMapper.typeFilter) return false
    return true
  })

  const activeWetland = wetlands.find((w) => w.id === wetlandMapper.activeWetlandId) ?? null

  // Summary stats
  const totalArea = filteredWetlands.reduce((sum, w) => sum + w.area, 0)
  const avgBiodiversity =
    filteredWetlands.length > 0
      ? filteredWetlands.reduce((sum, w) => sum + w.biodiversityIndex, 0) / filteredWetlands.length
      : 0
  const protectedCount = filteredWetlands.filter((w) => w.protectionStatus === 'protected').length

  // Water level chart data for selected wetland
  const waterLevelChartData = activeWetland
    ? [
        { month: 'Jan', level: activeWetland.waterLevel * 0.7 },
        { month: 'Feb', level: activeWetland.waterLevel * 0.75 },
        { month: 'Mar', level: activeWetland.waterLevel * 0.9 },
        { month: 'Apr', level: activeWetland.waterLevel * 1.1 },
        { month: 'May', level: activeWetland.waterLevel * 1.2 },
        { month: 'Jun', level: activeWetland.waterLevel * 1.3 },
        { month: 'Jul', level: activeWetland.waterLevel * 1.25 },
        { month: 'Aug', level: activeWetland.waterLevel * 1.1 },
        { month: 'Sep', level: activeWetland.waterLevel * 0.95 },
        { month: 'Oct', level: activeWetland.waterLevel * 0.85 },
        { month: 'Nov', level: activeWetland.waterLevel * 0.75 },
        { month: 'Dec', level: activeWetland.waterLevel * 0.7 },
      ]
    : []

  const toggleKeys = [
    { key: 'showBoundaries' as const, label: 'Boundaries', icon: MapPin },
    { key: 'showWaterLevel' as const, label: 'Water Level', icon: Droplets },
    { key: 'showBiodiversity' as const, label: 'Biodiversity', icon: TreePine },
    { key: 'showProtection' as const, label: 'Protection', icon: Shield },
  ]

  const typeFilterOptions: { value: WetlandMapperState['typeFilter']; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'marsh', label: 'Marsh' },
    { value: 'swamp', label: 'Swamp' },
    { value: 'bog', label: 'Bog' },
    { value: 'fen', label: 'Fen' },
    { value: 'estuary', label: 'Estuary' },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              Wetland Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setWetlandMapper({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Area</div>
              <div className="text-sm font-semibold">{totalArea.toLocaleString()} km²</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Biodiversity</div>
              <div className="text-sm font-semibold">{avgBiodiversity.toFixed(1)}</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Protected</div>
              <div className="text-sm font-semibold text-green-500">{protectedCount}</div>
            </div>
          </div>

          <Separator />

          {/* Type filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Filter by Type
            </Label>
            <Select
              value={wetlandMapper.typeFilter}
              onValueChange={(v) =>
                setWetlandMapper({ typeFilter: v as WetlandMapperState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle overlays */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Overlays</Label>
            {toggleKeys.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={wetlandMapper[key]}
                  onCheckedChange={(checked) => setWetlandMapper({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Wetlands list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Wetlands ({filteredWetlands.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredWetlands.map((wetland) => {
                  const isActive = wetlandMapper.activeWetlandId === wetland.id
                  const typeColor = TYPE_COLORS[wetland.type]
                  const protColor = PROTECTION_COLORS[wetland.protectionStatus]
                  return (
                    <div
                      key={wetland.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setWetlandMapper({
                          activeWetlandId: isActive ? null : wetland.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{wetland.name}</span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{ borderColor: typeColor, color: typeColor }}
                          >
                            {TYPE_LABELS[wetland.type]}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          Area:{' '}
                          <span className="text-foreground">
                            {wetland.area.toLocaleString()} km²
                          </span>
                        </div>
                        <div>
                          Water:{' '}
                          <span className="text-foreground">
                            {wetland.waterLevel}m
                          </span>
                        </div>
                        <div>
                          Biodiv:{' '}
                          <span className="text-foreground">
                            {wetland.biodiversityIndex}
                          </span>
                        </div>
                        <div>
                          <span
                            className="inline-flex items-center gap-0.5"
                            style={{ color: protColor }}
                          >
                            <Shield className="h-2.5 w-2.5" />
                            {PROTECTION_LABELS[wetland.protectionStatus]}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Selected wetland details */}
          {activeWetland && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-cyan-500" />
                  {activeWetland.name} — Details
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border/40 p-2 text-center">
                    <div className="text-[10px] text-muted-foreground">Plant Species</div>
                    <div className="text-sm font-semibold text-green-600">
                      {activeWetland.plantSpecies.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/40 p-2 text-center">
                    <div className="text-[10px] text-muted-foreground">Animal Species</div>
                    <div className="text-sm font-semibold text-amber-600">
                      {activeWetland.animalSpecies.toLocaleString()}
                    </div>
                  </div>
                </div>
                {/* Water level chart */}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Water Level (m) — Seasonal Variation
                  </Label>
                  <div className="h-[120px] w-full mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={waterLevelChartData}>
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={32}
                          unit="m"
                        />
                        <RechartsTooltip
                          contentStyle={{
                            fontSize: 10,
                            borderRadius: 8,
                            border: '1px solid rgba(6,182,212,0.3)',
                          }}
                        />
                        <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                          {waterLevelChartData.map((entry, i) => (
                            <Cell
                              key={i}
                              fill={
                                entry.level >= activeWetland.waterLevel
                                  ? '#06b6d4'
                                  : '#67e8f9'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
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
