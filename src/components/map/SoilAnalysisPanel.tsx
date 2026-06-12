'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type SoilSample, type SoilAnalysisState } from '@/lib/map-store'
import {
  Sprout,
  X,
  Download,
  Droplets,
  FlaskConical,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  AlertTriangle,
  Leaf,
  Palette,
} from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'

// Demo soil data
const DEMO_SAMPLES: SoilSample[] = [
  {
    id: 'soil1',
    latitude: 48.8566,
    longitude: 2.3522,
    soilType: 'loam',
    ph: 6.8,
    moisture: 42,
    organicMatter: 5.2,
    nitrogen: 45,
    phosphorus: 28,
    potassium: 180,
    erosionRisk: 'low',
    agriculturalSuitability: 'excellent',
    depth: 30,
    color: '#8B6914',
    lastTested: '2024-08-15',
  },
  {
    id: 'soil2',
    latitude: 51.5074,
    longitude: -0.1278,
    soilType: 'clay',
    ph: 5.5,
    moisture: 65,
    organicMatter: 3.1,
    nitrogen: 30,
    phosphorus: 15,
    potassium: 120,
    erosionRisk: 'medium',
    agriculturalSuitability: 'moderate',
    depth: 45,
    color: '#8B4513',
    lastTested: '2024-07-20',
  },
  {
    id: 'soil3',
    latitude: 40.7128,
    longitude: -74.006,
    soilType: 'sand',
    ph: 7.2,
    moisture: 18,
    organicMatter: 1.5,
    nitrogen: 12,
    phosphorus: 8,
    potassium: 60,
    erosionRisk: 'high',
    agriculturalSuitability: 'poor',
    depth: 20,
    color: '#F4A460',
    lastTested: '2024-09-01',
  },
  {
    id: 'soil4',
    latitude: 35.6762,
    longitude: 139.6503,
    soilType: 'silt',
    ph: 6.2,
    moisture: 55,
    organicMatter: 4.0,
    nitrogen: 38,
    phosphorus: 22,
    potassium: 150,
    erosionRisk: 'low',
    agriculturalSuitability: 'good',
    depth: 35,
    color: '#A0926B',
    lastTested: '2024-06-10',
  },
  {
    id: 'soil5',
    latitude: -33.8688,
    longitude: 151.2093,
    soilType: 'peat',
    ph: 4.2,
    moisture: 82,
    organicMatter: 35,
    nitrogen: 20,
    phosphorus: 10,
    potassium: 45,
    erosionRisk: 'severe',
    agriculturalSuitability: 'unsuitable',
    depth: 60,
    color: '#3D2B1F',
    lastTested: '2024-05-22',
  },
  {
    id: 'soil6',
    latitude: 52.52,
    longitude: 13.405,
    soilType: 'chalk',
    ph: 8.1,
    moisture: 25,
    organicMatter: 2.8,
    nitrogen: 25,
    phosphorus: 35,
    potassium: 200,
    erosionRisk: 'none',
    agriculturalSuitability: 'good',
    depth: 25,
    color: '#E8DCC8',
    lastTested: '2024-08-30',
  },
]

const TYPE_LABELS: Record<string, string> = {
  clay: 'Clay',
  sand: 'Sand',
  silt: 'Silt',
  loam: 'Loam',
  peat: 'Peat',
  chalk: 'Chalk',
  gravel: 'Gravel',
}

const TYPE_COLORS: Record<string, string> = {
  clay: '#8B4513',
  sand: '#F4A460',
  silt: '#A0926B',
  loam: '#8B6914',
  peat: '#3D2B1F',
  chalk: '#E8DCC8',
  gravel: '#808080',
}

const EROSION_STYLES: Record<string, { bg: string; color: string }> = {
  none: { bg: 'bg-green-500/10', color: 'text-green-600 dark:text-green-400' },
  low: { bg: 'bg-teal-500/10', color: 'text-teal-600 dark:text-teal-400' },
  medium: { bg: 'bg-yellow-500/10', color: 'text-yellow-600 dark:text-yellow-400' },
  high: { bg: 'bg-orange-500/10', color: 'text-orange-600 dark:text-orange-400' },
  severe: { bg: 'bg-red-500/10', color: 'text-red-600 dark:text-red-400' },
}

const SUITABILITY_STYLES: Record<string, { bg: string; color: string }> = {
  excellent: { bg: 'bg-green-500/10', color: 'text-green-600 dark:text-green-400' },
  good: { bg: 'bg-teal-500/10', color: 'text-teal-600 dark:text-teal-400' },
  moderate: { bg: 'bg-yellow-500/10', color: 'text-yellow-600 dark:text-yellow-400' },
  poor: { bg: 'bg-orange-500/10', color: 'text-orange-600 dark:text-orange-400' },
  unsuitable: { bg: 'bg-red-500/10', color: 'text-red-600 dark:text-red-400' },
}

const MODE_COLORS: Record<string, { min: string; max: string; label: string }> = {
  type: { min: '#8B4513', max: '#F4A460', label: 'Soil Type' },
  moisture: { min: '#fef9c3', max: '#1d4ed8', label: 'Moisture %' },
  ph: { min: '#ef4444', max: '#22c55e', label: 'pH Level' },
  nutrients: { min: '#fef3c7', max: '#16a34a', label: 'Nutrients' },
  erosion: { min: '#dcfce7', max: '#991b1b', label: 'Erosion Risk' },
}

function exportCSV(samples: SoilSample[]) {
  const headers = ['Soil Type', 'pH', 'Moisture %', 'Organic Matter %', 'Nitrogen (mg/kg)', 'Phosphorus (mg/kg)', 'Potassium (mg/kg)', 'Erosion Risk', 'Suitability', 'Depth (cm)', 'Latitude', 'Longitude', 'Last Tested']
  const rows = samples.map(s => [
    s.soilType, s.ph, s.moisture, s.organicMatter,
    s.nitrogen, s.phosphorus, s.potassium,
    s.erosionRisk, s.agriculturalSuitability, s.depth,
    s.latitude, s.longitude, s.lastTested,
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'soil_data.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function SoilAnalysisPanel() {
  const soilAnalysis = useMapStore((s) => s.soilAnalysis)
  const setSoilAnalysis = useMapStore((s) => s.setSoilAnalysis)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Use demo data if store is empty
  const samples = soilAnalysis.samples.length > 0 ? soilAnalysis.samples : DEMO_SAMPLES

  const radarData = useMemo(() => {
    const activeSample = expandedId ? samples.find(s => s.id === expandedId) : null
    const s = activeSample || samples[0]
    if (!s) return []
    return [
      { nutrient: 'Nitrogen', value: Math.min(s.nitrogen / 1.2, 100), fullMark: 100 },
      { nutrient: 'Phosphorus', value: Math.min(s.phosphorus / 0.8, 100), fullMark: 100 },
      { nutrient: 'Potassium', value: Math.min(s.potassium / 4, 100), fullMark: 100 },
      { nutrient: 'Org. Matter', value: Math.min(s.organicMatter * 5, 100), fullMark: 100 },
    ]
  }, [samples, expandedId])

  const phDistributionData = useMemo(() => {
    return samples.map(s => ({
      name: `${s.soilType} (${s.id.slice(-1)})`,
      ph: s.ph,
      color: s.ph < 5.5 ? '#ef4444' : s.ph < 6.5 ? '#f97316' : s.ph < 7.5 ? '#22c55e' : '#3b82f6',
    }))
  }, [samples])

  const mode = soilAnalysis.analysisMode

  if (!soilAnalysis.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25 }}
        className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sprout className="h-4 w-4 text-green-500" />
                Soil Analysis
                <Badge variant="outline" className="text-[10px] font-normal">
                  {samples.length} samples
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSoilAnalysis({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Analysis Mode Tabs */}
              <Tabs
                value={mode}
                onValueChange={(v) => setSoilAnalysis({ analysisMode: v as SoilAnalysisState['analysisMode'] })}
              >
                <TabsList className="w-full h-8">
                  <TabsTrigger value="type" className="text-[10px] flex-1 gap-1">
                    <Layers className="h-3 w-3" /> Type
                  </TabsTrigger>
                  <TabsTrigger value="moisture" className="text-[10px] flex-1 gap-1">
                    <Droplets className="h-3 w-3" /> Moisture
                  </TabsTrigger>
                  <TabsTrigger value="ph" className="text-[10px] flex-1 gap-1">
                    <FlaskConical className="h-3 w-3" /> pH
                  </TabsTrigger>
                  <TabsTrigger value="nutrients" className="text-[10px] flex-1 gap-1">
                    <Leaf className="h-3 w-3" /> Nutrients
                  </TabsTrigger>
                  <TabsTrigger value="erosion" className="text-[10px] flex-1 gap-1">
                    <AlertTriangle className="h-3 w-3" /> Erosion
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Color Legend */}
              <div className="rounded-lg border border-border/50 p-2.5 space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Palette className="h-3 w-3" /> {MODE_COLORS[mode].label} Legend
                </div>
                {mode === 'type' && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-1 text-[9px]">
                        <span className="w-3 h-3 rounded-sm border border-border/30" style={{ backgroundColor: TYPE_COLORS[key] }} />
                        {label}
                      </div>
                    ))}
                  </div>
                )}
                {mode === 'moisture' && (
                  <>
                    <div className="h-3 rounded-full overflow-hidden flex">
                      <div className="flex-1" style={{ backgroundColor: '#fef9c3' }} />
                      <div className="flex-1" style={{ backgroundColor: '#86efac' }} />
                      <div className="flex-1" style={{ backgroundColor: '#4ade80' }} />
                      <div className="flex-1" style={{ backgroundColor: '#22c55e' }} />
                      <div className="flex-1" style={{ backgroundColor: '#16a34a' }} />
                      <div className="flex-1" style={{ backgroundColor: '#15803d' }} />
                      <div className="flex-1" style={{ backgroundColor: '#1d4ed8' }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground">
                      <span>0%</span><span>50%</span><span>100%</span>
                    </div>
                  </>
                )}
                {mode === 'ph' && (
                  <>
                    <div className="h-3 rounded-full overflow-hidden flex">
                      <div className="flex-1" style={{ backgroundColor: '#ef4444' }} />
                      <div className="flex-1" style={{ backgroundColor: '#f97316' }} />
                      <div className="flex-1" style={{ backgroundColor: '#eab308' }} />
                      <div className="flex-1" style={{ backgroundColor: '#22c55e' }} />
                      <div className="flex-1" style={{ backgroundColor: '#3b82f6' }} />
                      <div className="flex-1" style={{ backgroundColor: '#6366f1' }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground">
                      <span>Acidic (0)</span><span>Neutral (7)</span><span>Alkaline (14)</span>
                    </div>
                  </>
                )}
                {mode === 'nutrients' && (
                  <>
                    <div className="h-3 rounded-full overflow-hidden flex">
                      <div className="flex-1" style={{ backgroundColor: '#fef3c7' }} />
                      <div className="flex-1" style={{ backgroundColor: '#fde68a' }} />
                      <div className="flex-1" style={{ backgroundColor: '#a3e635' }} />
                      <div className="flex-1" style={{ backgroundColor: '#65a30d' }} />
                      <div className="flex-1" style={{ backgroundColor: '#16a34a' }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground">
                      <span>Deficient</span><span>Adequate</span><span>Rich</span>
                    </div>
                  </>
                )}
                {mode === 'erosion' && (
                  <div className="flex gap-2">
                    {Object.entries(EROSION_STYLES).map(([key, style]) => (
                      <div key={key} className="flex items-center gap-1 text-[9px]">
                        <Badge className={`${style.bg} ${style.color} border-0 text-[8px] px-1 py-0 capitalize`}>
                          {key}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Overlay Toggles */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Visual Overlays
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={soilAnalysis.showTypeOverlay}
                      onCheckedChange={(v) => setSoilAnalysis({ showTypeOverlay: v })}
                    />
                    <span className="text-xs">Soil Type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={soilAnalysis.showMoistureOverlay}
                      onCheckedChange={(v) => setSoilAnalysis({ showMoistureOverlay: v })}
                    />
                    <span className="text-xs">Moisture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={soilAnalysis.showPHOverlay}
                      onCheckedChange={(v) => setSoilAnalysis({ showPHOverlay: v })}
                    />
                    <span className="text-xs">pH Gradient</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={soilAnalysis.showErosionRisk}
                      onCheckedChange={(v) => setSoilAnalysis({ showErosionRisk: v })}
                    />
                    <span className="text-xs">Erosion Risk</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Nutrient Balance Radar */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Leaf className="h-3 w-3" /> Nutrient Balance (N/P/K/OM)
                </Label>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="nutrient" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                    />
                    <Radar
                      name="Nutrient Level"
                      dataKey="value"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* pH Distribution */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <FlaskConical className="h-3 w-3" /> pH Distribution
                </Label>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={phDistributionData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 14]} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [value.toFixed(1), 'pH']}
                    />
                    <Bar dataKey="ph" radius={[3, 3, 0, 0]}>
                      {phDistributionData.map((entry, index) => (
                        <Cell key={`ph-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Separator />

              {/* Sample List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Sample Points</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={() => exportCSV(samples)}
                  >
                    <Download className="h-3 w-3" /> CSV
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {samples.map(sample => {
                    const erosionStyle = EROSION_STYLES[sample.erosionRisk]
                    const suitStyle = SUITABILITY_STYLES[sample.agriculturalSuitability]
                    const isExpanded = expandedId === sample.id
                    return (
                      <div
                        key={sample.id}
                        className="rounded-lg border border-border/50 p-2.5 hover:bg-accent/30 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : sample.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-5 h-5 rounded-sm border border-border/30 shrink-0"
                              style={{ backgroundColor: sample.color }}
                            />
                            <span className="text-xs font-medium capitalize">{sample.soilType}</span>
                            <Badge className={`${suitStyle.bg} ${suitStyle.color} border-0 text-[9px] px-1.5 py-0 capitalize`}>
                              {sample.agriculturalSuitability}
                            </Badge>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        {isExpanded && (
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">pH</span>
                              <span className="font-medium" style={{ color: sample.ph < 5.5 ? '#ef4444' : sample.ph > 7.5 ? '#3b82f6' : '#22c55e' }}>
                                {sample.ph.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Moisture</span>
                              <span className="font-medium">{sample.moisture}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Organic Matter</span>
                              <span className="font-medium">{sample.organicMatter}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Depth</span>
                              <span className="font-medium">{sample.depth} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nitrogen</span>
                              <span className="font-medium">{sample.nitrogen} mg/kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Phosphorus</span>
                              <span className="font-medium">{sample.phosphorus} mg/kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Potassium</span>
                              <span className="font-medium">{sample.potassium} mg/kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Erosion Risk</span>
                              <Badge className={`${erosionStyle.bg} ${erosionStyle.color} border-0 text-[9px] px-1.5 py-0 capitalize`}>
                                {sample.erosionRisk}
                              </Badge>
                            </div>
                            <div className="col-span-2 flex justify-between">
                              <span className="text-muted-foreground">Last Tested</span>
                              <span className="font-medium">{sample.lastTested}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Toggle button for the map toolbar
export function SoilAnalysisToggle() {
  const soilAnalysis = useMapStore((s) => s.soilAnalysis)
  const setSoilAnalysis = useMapStore((s) => s.setSoilAnalysis)

  return (
    <Button
      variant={soilAnalysis.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setSoilAnalysis({ open: !soilAnalysis.open })}
      title="Soil Analysis"
    >
      <Sprout className="h-4 w-4" />
    </Button>
  )
}
