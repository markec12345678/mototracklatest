'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type BiomeRegion } from '@/lib/map-store'
import {
  X,
  TreePine,
  Leaf,
  Eye,
  AlertTriangle,
  BarChart3,
  MapPin,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
} from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts'

// Demo biome data
const DEMO_BIOMES: BiomeRegion[] = [
  { id: 'b1', name: 'Tropical Rainforest', latitude: -3.46, longitude: -62.22, type: 'terrestrial', biodiversityIndex: 0.95, speciesCount: 85000, endangeredSpecies: 1243, area: 12500000 },
  { id: 'b2', name: 'Temperate Deciduous Forest', latitude: 46.23, longitude: 6.05, type: 'terrestrial', biodiversityIndex: 0.72, speciesCount: 32000, endangeredSpecies: 567, area: 10400000 },
  { id: 'b3', name: 'Boreal Forest', latitude: 55.75, longitude: 85.12, type: 'terrestrial', biodiversityIndex: 0.38, speciesCount: 8500, endangeredSpecies: 142, area: 17000000 },
  { id: 'b4', name: 'Tropical Grassland', latitude: -1.29, longitude: 36.82, type: 'terrestrial', biodiversityIndex: 0.65, speciesCount: 28000, endangeredSpecies: 389, area: 14200000 },
  { id: 'b5', name: 'Desert', latitude: 23.42, longitude: 25.66, type: 'terrestrial', biodiversityIndex: 0.22, speciesCount: 4200, endangeredSpecies: 98, area: 27700000 },
  { id: 'b6', name: 'Tundra', latitude: 71.29, longitude: -156.79, type: 'terrestrial', biodiversityIndex: 0.12, speciesCount: 1700, endangeredSpecies: 34, area: 11500000 },
  { id: 'b7', name: 'Coral Reef', latitude: -18.29, longitude: 147.70, type: 'aquatic', biodiversityIndex: 0.88, speciesCount: 65000, endangeredSpecies: 1876, area: 284000 },
  { id: 'b8', name: 'Mangrove', latitude: 9.05, longitude: -78.45, type: 'transitional', biodiversityIndex: 0.74, speciesCount: 15000, endangeredSpecies: 423, area: 150000 },
  { id: 'b9', name: 'Wetland', latitude: 29.15, longitude: -89.25, type: 'transitional', biodiversityIndex: 0.68, speciesCount: 21000, endangeredSpecies: 312, area: 5700000 },
]

const REALM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  terrestrial: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', label: 'Terrestrial' },
  aquatic: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', label: 'Aquatic' },
  transitional: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'Transitional' },
}

const CLASSIFICATION_OPTIONS: { value: 'whittaker' | 'holdridge' | 'olson'; label: string }[] = [
  { value: 'whittaker', label: 'Whittaker' },
  { value: 'holdridge', label: 'Holdridge' },
  { value: 'olson', label: 'Olson' },
]

const FOCUS_REALMS: { value: 'all' | 'terrestrial' | 'aquatic' | 'transitional'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'terrestrial', label: 'Terrestrial' },
  { value: 'aquatic', label: 'Aquatic' },
  { value: 'transitional', label: 'Transitional' },
]

function formatArea(km2: number): string {
  if (km2 >= 1000000) return `${(km2 / 1000000).toFixed(1)}M km²`
  if (km2 >= 1000) return `${(km2 / 1000).toFixed(0)}K km²`
  return `${km2} km²`
}

export function BiomeClassifier() {
  const biome = useMapStore((s) => s.biome)
  const setBiome = useMapStore((s) => s.setBiome)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // All hooks must be before early returns
  const biomes = biome.biomes.length > 0 ? biome.biomes : DEMO_BIOMES

  const filteredBiomes = useMemo(() => {
    if (biome.focusRealm === 'all') return biomes
    return biomes.filter((b) => b.type === biome.focusRealm)
  }, [biomes, biome.focusRealm])

  const radarData = useMemo(() => {
    const avgBio = filteredBiomes.reduce((s, b) => s + b.biodiversityIndex, 0) / Math.max(filteredBiomes.length, 1)
    const avgSpecies = filteredBiomes.reduce((s, b) => s + b.speciesCount, 0) / Math.max(filteredBiomes.length, 1)
    const avgEndangered = filteredBiomes.reduce((s, b) => s + b.endangeredSpecies, 0) / Math.max(filteredBiomes.length, 1)
    const avgArea = filteredBiomes.reduce((s, b) => s + b.area, 0) / Math.max(filteredBiomes.length, 1)

    return [
      { metric: 'Biodiversity', value: +(avgBio * 100).toFixed(1), fullMark: 100 },
      { metric: 'Species', value: +(avgSpecies / 850).toFixed(1), fullMark: 100 },
      { metric: 'Endemism', value: +(avgEndangered / 20).toFixed(1), fullMark: 100 },
      { metric: 'Area', value: +(avgArea / 170000).toFixed(1), fullMark: 100 },
      { metric: 'Richness', value: +(avgBio * 85).toFixed(1), fullMark: 100 },
      { metric: 'Threat Level', value: +(avgEndangered / filteredBiomes.length / 5).toFixed(1), fullMark: 100 },
    ]
  }, [filteredBiomes])

  const barData = useMemo(() => {
    return filteredBiomes
      .map((b) => ({
        name: b.name.length > 18 ? b.name.slice(0, 18) + '…' : b.name,
        species: Math.round(b.speciesCount / 1000),
        color: REALM_COLORS[b.type]?.bg.includes('green') ? '#22c55e' : REALM_COLORS[b.type]?.bg.includes('cyan') ? '#06b6d4' : '#10b981',
      }))
      .sort((a, b) => b.species - a.species)
  }, [filteredBiomes])

  if (typeof window === 'undefined') return null
  if (!biome.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-16 right-4 z-30 w-[380px] max-h-[80vh] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-background/90 border shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TreePine className="h-4 w-4 text-emerald-500" />
                Biome Classifier
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredBiomes.length} biomes
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setBiome({ open: false })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Classification system selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Classification</p>
              <div className="flex gap-1">
                {CLASSIFICATION_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={biome.classification === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-7 flex-1"
                    onClick={() => setBiome({ classification: opt.value })}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Focus realm selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Realm</p>
              <div className="flex flex-wrap gap-1">
                {FOCUS_REALMS.map((r) => (
                  <Badge
                    key={r.value}
                    variant={biome.focusRealm === r.value ? 'default' : 'outline'}
                    className="text-[10px] cursor-pointer"
                    onClick={() => setBiome({ focusRealm: r.value })}
                  >
                    {r.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Overlay toggles */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showBiomes' as const, label: 'Biomes', icon: TreePine },
                  { key: 'showBiodiversity' as const, label: 'Biodiversity', icon: Leaf },
                  { key: 'showTransitions' as const, label: 'Transitions', icon: TrendingUp },
                  { key: 'showEndangered' as const, label: 'Endangered', icon: Shield },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={biome[key]}
                      onCheckedChange={(checked) => setBiome({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Radar chart: biodiversity metrics */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Biodiversity Metrics</p>
              <div className="h-44 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid strokeDasharray="3 3" opacity={0.3} />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8 }} />
                    <PolarRadiusAxis tick={{ fontSize: 7 }} domain={[0, 100]} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Horizontal bar chart: species count by biome */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Species Count (thousands)</p>
              <div className="h-36 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" tick={{ fontSize: 8 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 7 }} width={80} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value}K`, 'Species']}
                    />
                    <Bar dataKey="species" radius={[0, 4, 4, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Biome list */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {filteredBiomes.map((b) => {
                  const realmStyle = REALM_COLORS[b.type] || REALM_COLORS.terrestrial
                  const isExpanded = expandedId === b.id

                  return (
                    <div
                      key={b.id}
                      className="rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <TreePine className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{b.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatArea(b.area)} · {b.speciesCount.toLocaleString()} spp.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={`${realmStyle.bg} ${realmStyle.text} text-[9px] border-0`}>
                            {realmStyle.label}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 pb-2 space-y-1.5">
                              <Separator />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Leaf className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Biodiversity:</span>
                                  <span className="font-medium">{(b.biodiversityIndex * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Species:</span>
                                  <span className="font-medium">{b.speciesCount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Shield className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Endangered:</span>
                                  <span className="font-medium text-red-500">{b.endangeredSpecies}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Area:</span>
                                  <span className="font-medium">{formatArea(b.area)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Coords:</span>
                                  <span className="font-medium">{b.latitude.toFixed(1)}, {b.longitude.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Realm:</span>
                                  <Badge className={`${realmStyle.bg} ${realmStyle.text} text-[9px] border-0`}>{realmStyle.label}</Badge>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
