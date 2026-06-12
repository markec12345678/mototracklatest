'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type CropField, type CropHealthState } from '@/lib/map-store'
import {
  X,
  TreePine,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Gauge,
  AlertTriangle,
  TrendingUp,
  Info,
  Sun,
  RefreshCw,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'

// Demo crop fields
const DEMO_FIELDS: CropField[] = [
  {
    id: 'cf1',
    name: 'Green Valley Wheat',
    latitude: 48.85,
    longitude: 2.35,
    cropType: 'wheat',
    area: 120,
    healthIndex: 82,
    ndvi: 0.72,
    growthStage: 'flowering',
    moistureStress: 'low',
    pestRisk: 'low',
    diseaseRisk: 'moderate',
    yieldPrediction: 7.2,
    plantingDate: '2024-10-01',
    harvestDate: '2025-07-15',
    lastSatellitePass: '2024-12-10',
  },
  {
    id: 'cf2',
    name: 'Prairie Corn Field',
    latitude: 41.88,
    longitude: -87.63,
    cropType: 'corn',
    area: 250,
    healthIndex: 65,
    ndvi: 0.55,
    growthStage: 'vegetative',
    moistureStress: 'moderate',
    pestRisk: 'high',
    diseaseRisk: 'moderate',
    yieldPrediction: 9.8,
    plantingDate: '2024-05-01',
    harvestDate: '2024-10-15',
    lastSatellitePass: '2024-12-12',
  },
  {
    id: 'cf3',
    name: 'Delta Rice Paddy',
    latitude: 10.82,
    longitude: 106.63,
    cropType: 'rice',
    area: 80,
    healthIndex: 91,
    ndvi: 0.81,
    growthStage: 'fruiting',
    moistureStress: 'none',
    pestRisk: 'none',
    diseaseRisk: 'low',
    yieldPrediction: 6.5,
    plantingDate: '2024-07-01',
    harvestDate: '2025-01-15',
    lastSatellitePass: '2024-12-14',
  },
  {
    id: 'cf4',
    name: 'Midwest Soybean',
    latitude: 39.74,
    longitude: -104.99,
    cropType: 'soybean',
    area: 180,
    healthIndex: 45,
    ndvi: 0.35,
    growthStage: 'maturity',
    moistureStress: 'high',
    pestRisk: 'moderate',
    diseaseRisk: 'high',
    yieldPrediction: 2.1,
    plantingDate: '2024-05-15',
    harvestDate: '2024-10-01',
    lastSatellitePass: '2024-12-11',
  },
  {
    id: 'cf5',
    name: 'Napa Vineyard',
    latitude: 38.5,
    longitude: -122.26,
    cropType: 'grape',
    area: 35,
    healthIndex: 88,
    ndvi: 0.76,
    growthStage: 'dormant',
    moistureStress: 'low',
    pestRisk: 'low',
    diseaseRisk: 'low',
    yieldPrediction: 4.8,
    plantingDate: '2024-04-01',
    harvestDate: '2024-10-15',
    lastSatellitePass: '2024-12-13',
  },
  {
    id: 'cf6',
    name: 'Tropical Sugarcane',
    latitude: -23.55,
    longitude: -46.63,
    cropType: 'sugarcane',
    area: 300,
    healthIndex: 73,
    ndvi: 0.63,
    growthStage: 'vegetative',
    moistureStress: 'moderate',
    pestRisk: 'moderate',
    diseaseRisk: 'low',
    yieldPrediction: 75,
    plantingDate: '2024-03-01',
    harvestDate: '2025-02-01',
    lastSatellitePass: '2024-12-14',
  },
]

const CROP_ICONS: Record<CropField['cropType'], string> = {
  wheat: '🌾',
  corn: '🌽',
  rice: '🍚',
  soybean: '🫘',
  cotton: '☁️',
  barley: '🌾',
  sugarcane: '🎋',
  potato: '🥔',
  tomato: '🍅',
  grape: '🍇',
}

const GROWTH_STAGE_COLORS: Record<CropField['growthStage'], { bg: string; text: string }> = {
  emergence: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  vegetative: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  flowering: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
  fruiting: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  maturity: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  harvest: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
  dormant: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400' },
}

const MOISTURE_COLORS: Record<CropField['moistureStress'], { bg: string; text: string }> = {
  none: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  low: { bg: 'bg-lime-500/10', text: 'text-lime-600 dark:text-lime-400' },
  moderate: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  severe: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
}

function getHealthColor(index: number): string {
  if (index >= 80) return '#22c55e'
  if (index >= 60) return '#84cc16'
  if (index >= 40) return '#eab308'
  if (index >= 20) return '#f97316'
  return '#ef4444'
}

function getNDVIColor(ndvi: number): string {
  if (ndvi >= 0.7) return '#22c55e'
  if (ndvi >= 0.5) return '#84cc16'
  if (ndvi >= 0.3) return '#eab308'
  if (ndvi >= 0.1) return '#f97316'
  return '#ef4444'
}

export function CropHealthAnalyzer() {
  const cropHealth = useMapStore((s) => s.cropHealth)
  const setCropHealth = useMapStore((s) => s.setCropHealth)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Use demo data if store is empty
  const fields = cropHealth.fields.length > 0 ? cropHealth.fields : DEMO_FIELDS

  const filteredFields = useMemo(() => {
    let list = fields
    if (cropHealth.filterCropType.length > 0) {
      list = list.filter((f) => cropHealth.filterCropType.includes(f.cropType))
    }
    if (cropHealth.filterGrowthStage.length > 0) {
      list = list.filter((f) => cropHealth.filterGrowthStage.includes(f.growthStage))
    }
    return list
  }, [fields, cropHealth.filterCropType, cropHealth.filterGrowthStage])

  // NDVI distribution chart
  const ndviDistData = useMemo(() => {
    const bins = [
      { range: '<0.2', min: -1, max: 0.2 },
      { range: '0.2-0.4', min: 0.2, max: 0.4 },
      { range: '0.4-0.6', min: 0.4, max: 0.6 },
      { range: '0.6-0.8', min: 0.6, max: 0.8 },
      { range: '>0.8', min: 0.8, max: 2 },
    ]
    return bins.map((bin) => ({
      range: bin.range,
      count: fields.filter((f) => f.ndvi >= bin.min && f.ndvi < bin.max).length,
      fill: getNDVIColor((bin.min + bin.max) / 2),
    }))
  }, [fields])

  // Yield comparison chart
  const yieldData = useMemo(() => {
    return filteredFields.map((f) => ({
      name: f.name.length > 14 ? f.name.slice(0, 14) + '…' : f.name,
      yield: f.yieldPrediction,
      health: f.healthIndex,
      fill: getHealthColor(f.healthIndex),
    }))
  }, [filteredFields])

  const toggleFilterCropType = useCallback(
    (type: string) => {
      const current = cropHealth.filterCropType
      const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
      setCropHealth({ filterCropType: next })
    },
    [cropHealth.filterCropType, setCropHealth]
  )

  const toggleFilterGrowthStage = useCallback(
    (stage: string) => {
      const current = cropHealth.filterGrowthStage
      const next = current.includes(stage) ? current.filter((s) => s !== stage) : [...current, stage]
      setCropHealth({ filterGrowthStage: next })
    },
    [cropHealth.filterGrowthStage, setCropHealth]
  )

  if (!cropHealth.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-4 top-16 z-[40] w-[420px] max-h-[calc(100vh-5rem)]"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base font-semibold">Crop Health Analyzer</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredFields.length} fields
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCropHealth({ open: false })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pb-4">
            {/* Overlay toggles */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showHealthOverlay' as const, label: 'Health Map', icon: Gauge },
                  { key: 'showNDVI' as const, label: 'NDVI', icon: BarChart3 },
                  { key: 'showMoistureStress' as const, label: 'Moisture', icon: RefreshCw },
                  { key: 'showYieldPrediction' as const, label: 'Yield Pred.', icon: TrendingUp },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={cropHealth[key]}
                      onCheckedChange={(checked) => setCropHealth({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Filters */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filters</p>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Crop Type</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(CROP_ICONS).map(([type, emoji]) => (
                    <Badge
                      key={type}
                      variant={cropHealth.filterCropType.includes(type) ? 'default' : 'outline'}
                      className="text-[10px] cursor-pointer"
                      onClick={() => toggleFilterCropType(type)}
                    >
                      {emoji} {type}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Growth Stage</p>
                <div className="flex flex-wrap gap-1">
                  {(['emergence', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvest', 'dormant'] as const).map(
                    (stage) => (
                      <Badge
                        key={stage}
                        variant={cropHealth.filterGrowthStage.includes(stage) ? 'default' : 'outline'}
                        className={`text-[10px] cursor-pointer capitalize ${
                          cropHealth.filterGrowthStage.includes(stage)
                            ? `${GROWTH_STAGE_COLORS[stage].bg} ${GROWTH_STAGE_COLORS[stage].text} border-0`
                            : ''
                        }`}
                        onClick={() => toggleFilterGrowthStage(stage)}
                      >
                        {stage}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* NDVI Distribution */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">NDVI Distribution</p>
              <div className="h-28 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ndviDistData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis dataKey="range" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {ndviDistData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Yield Comparison */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Yield Prediction</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={85} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="yield" radius={[0, 4, 4, 0]}>
                      {yieldData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Field list */}
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2">
                {filteredFields.map((field) => {
                  const isExpanded = expandedId === field.id
                  const stageStyle = GROWTH_STAGE_COLORS[field.growthStage]
                  const moistureStyle = MOISTURE_COLORS[field.moistureStress]
                  const healthColor = getHealthColor(field.healthIndex)

                  return (
                    <div
                      key={field.id}
                      className="rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : field.id)}
                    >
                      <div className="flex items-center justify-between p-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg shrink-0">{CROP_ICONS[field.cropType]}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{field.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {field.area}ha · NDVI {field.ndvi.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Health index badge */}
                          <Badge
                            className="text-[9px] border-0"
                            style={{
                              backgroundColor: healthColor + '1a',
                              color: healthColor,
                            }}
                          >
                            {field.healthIndex}
                          </Badge>
                          <Badge className={`${stageStyle.bg} ${stageStyle.text} text-[9px] border-0 capitalize`}>
                            {field.growthStage}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
                            <div className="px-2.5 pb-2.5 space-y-2">
                              <Separator />
                              {/* Health index gradient bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-muted-foreground">Health Index</span>
                                  <span className="text-[10px] font-medium" style={{ color: healthColor }}>
                                    {field.healthIndex}/100
                                  </span>
                                </div>
                                <div className="h-2 rounded-full overflow-hidden bg-muted">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${field.healthIndex}%`,
                                      background: 'linear-gradient(to right, #ef4444, #eab308, #22c55e)',
                                    }}
                                  />
                                </div>
                              </div>
                              {/* NDVI bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-muted-foreground">NDVI</span>
                                  <span className="text-[10px] font-medium" style={{ color: getNDVIColor(field.ndvi) }}>
                                    {field.ndvi.toFixed(2)}
                                  </span>
                                </div>
                                <div className="h-2 rounded-full overflow-hidden bg-muted">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${((field.ndvi + 1) / 2) * 100}%`,
                                      background: 'linear-gradient(to right, #ef4444, #eab308, #22c55e)',
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <RefreshCw className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Moisture:</span>
                                  <Badge className={`${moistureStyle.bg} ${moistureStyle.text} text-[9px] border-0 capitalize`}>
                                    {field.moistureStress}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Pest:</span>
                                  <span className="font-medium capitalize">{field.pestRisk}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Disease:</span>
                                  <span className="font-medium capitalize">{field.diseaseRisk}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Yield:</span>
                                  <span className="font-medium">{field.yieldPrediction} t/ha</span>
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
