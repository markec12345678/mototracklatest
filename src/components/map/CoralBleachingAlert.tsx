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
import { useMapStore, type CoralSite } from '@/lib/map-store'
import {
  X,
  Waves,
  Eye,
  EyeOff,
  Thermometer,
  Activity,
  Globe,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const DEMO_SITES: CoralSite[] = [
  {
    id: 'cs1',
    name: 'Great Barrier Reef',
    latitude: -18.29,
    longitude: 147.7,
    bleachingLevel: 'severe',
    sstAnomaly: 1.8,
    reefArea: 34850,
    recoveryPotential: 25,
  },
  {
    id: 'cs2',
    name: 'Caribbean',
    latitude: 18.0,
    longitude: -66.0,
    bleachingLevel: 'moderate',
    sstAnomaly: 1.2,
    reefArea: 26000,
    recoveryPotential: 42,
  },
  {
    id: 'cs3',
    name: 'Maldives',
    latitude: 3.2,
    longitude: 73.22,
    bleachingLevel: 'extreme',
    sstAnomaly: 2.3,
    reefArea: 4510,
    recoveryPotential: 15,
  },
  {
    id: 'cs4',
    name: 'Red Sea',
    latitude: 22.0,
    longitude: 38.0,
    bleachingLevel: 'none',
    sstAnomaly: 0.4,
    reefArea: 15600,
    recoveryPotential: 78,
  },
  {
    id: 'cs5',
    name: 'Hawaiian',
    latitude: 20.5,
    longitude: -156.5,
    bleachingLevel: 'mild',
    sstAnomaly: 0.7,
    reefArea: 4110,
    recoveryPotential: 55,
  },
  {
    id: 'cs6',
    name: 'Coral Triangle',
    latitude: -2.5,
    longitude: 124.0,
    bleachingLevel: 'moderate',
    sstAnomaly: 1.1,
    reefArea: 85700,
    recoveryPotential: 48,
  },
]

const SST_ANOMALY_DATA = [
  { month: 'Jan', gbr: 0.6, caribbean: 0.4, maldives: 0.8, redSea: 0.1, hawaiian: 0.3, coralTriangle: 0.5 },
  { month: 'Feb', gbr: 0.8, caribbean: 0.5, maldives: 0.9, redSea: 0.2, hawaiian: 0.3, coralTriangle: 0.6 },
  { month: 'Mar', gbr: 1.1, caribbean: 0.7, maldives: 1.2, redSea: 0.3, hawaiian: 0.5, coralTriangle: 0.8 },
  { month: 'Apr', gbr: 1.4, caribbean: 0.9, maldives: 1.5, redSea: 0.4, hawaiian: 0.6, coralTriangle: 1.0 },
  { month: 'May', gbr: 1.7, caribbean: 1.1, maldives: 1.8, redSea: 0.5, hawaiian: 0.7, coralTriangle: 1.1 },
  { month: 'Jun', gbr: 1.8, caribbean: 1.2, maldives: 2.1, redSea: 0.4, hawaiian: 0.7, coralTriangle: 1.1 },
  { month: 'Jul', gbr: 1.6, caribbean: 1.0, maldives: 2.3, redSea: 0.3, hawaiian: 0.6, coralTriangle: 0.9 },
  { month: 'Aug', gbr: 1.3, caribbean: 0.8, maldives: 2.0, redSea: 0.3, hawaiian: 0.5, coralTriangle: 0.8 },
  { month: 'Sep', gbr: 1.0, caribbean: 0.6, maldives: 1.6, redSea: 0.2, hawaiian: 0.4, coralTriangle: 0.6 },
  { month: 'Oct', gbr: 0.7, caribbean: 0.5, maldives: 1.2, redSea: 0.1, hawaiian: 0.3, coralTriangle: 0.5 },
  { month: 'Nov', gbr: 0.5, caribbean: 0.4, maldives: 0.9, redSea: 0.1, hawaiian: 0.3, coralTriangle: 0.4 },
  { month: 'Dec', gbr: 0.5, caribbean: 0.3, maldives: 0.8, redSea: 0.1, hawaiian: 0.2, coralTriangle: 0.4 },
]

const RECOVERY_DATA = DEMO_SITES.map((s) => ({
  name: s.name.length > 12 ? s.name.substring(0, 12) + '…' : s.name,
  recovery: s.recoveryPotential,
}))

const BLEACHING_COLORS: Record<string, string> = {
  none: '#a3e635',
  mild: '#facc15',
  moderate: '#fb923c',
  severe: '#f43f5e',
  extreme: '#be123c',
}

const BLEACHING_LABELS: Record<string, string> = {
  none: 'No Bleaching',
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
  extreme: 'Extreme',
}

const ALERT_LABELS: Record<string, string> = {
  all: 'All Levels',
  watch: 'Watch',
  warning: 'Warning',
  alert_level_1: 'Alert Level 1',
  alert_level_2: 'Alert Level 2',
}

const REGION_LABELS: Record<string, string> = {
  all: 'All Regions',
  pacific: 'Pacific',
  atlantic: 'Atlantic',
  indian: 'Indian Ocean',
  red_sea: 'Red Sea',
}

// Map sites to regions for filtering
const SITE_REGIONS: Record<string, string> = {
  cs1: 'pacific',
  cs2: 'atlantic',
  cs3: 'indian',
  cs4: 'red_sea',
  cs5: 'pacific',
  cs6: 'pacific',
}

// Map bleaching levels to alert levels for filtering
const BLEACHING_ALERT_MAP: Record<string, string[]> = {
  all: ['none', 'mild', 'moderate', 'severe', 'extreme'],
  watch: ['mild', 'moderate', 'severe', 'extreme'],
  warning: ['moderate', 'severe', 'extreme'],
  alert_level_1: ['severe', 'extreme'],
  alert_level_2: ['extreme'],
}

const SST_LINE_COLORS = ['#f43f5e', '#fb923c', '#be123c', '#22d3ee', '#facc15', '#a855f7']

export function CoralBleachingAlert() {
  const coralBleaching = useMapStore((s) => s.coralBleaching)
  const setCoralBleaching = useMapStore((s) => s.setCoralBleaching)

  if (typeof window === 'undefined') return null
  if (!coralBleaching.open) return null

  const sites =
    coralBleaching.sites.length > 0 ? coralBleaching.sites : DEMO_SITES

  // Filter by alert level and region
  const filteredSites = sites.filter((s) => {
    const alertLevels = BLEACHING_ALERT_MAP[coralBleaching.alertLevel]
    if (!alertLevels.includes(s.bleachingLevel)) return false
    if (coralBleaching.region !== 'all') {
      const siteRegion = SITE_REGIONS[s.id]
      if (siteRegion !== coralBleaching.region) return false
    }
    return true
  })

  const filteredRecoveryData = filteredSites.map((s) => ({
    name: s.name.length > 12 ? s.name.substring(0, 12) + '…' : s.name,
    recovery: s.recoveryPotential,
  }))

  const overlayToggles = [
    { key: 'showBleachingAlert' as const, label: 'Bleaching Alert', icon: AlertTriangle },
    { key: 'showSSTAnomaly' as const, label: 'SST Anomaly', icon: Thermometer },
    { key: 'showReefExtent' as const, label: 'Reef Extent', icon: Globe },
    { key: 'showRecovery' as const, label: 'Recovery Potential', icon: RefreshCw },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Waves className="h-4 w-4 text-pink-500" />
              Coral Bleaching Alert
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCoralBleaching({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Alert Level & Region filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Alert Level</Label>
              <Select
                value={coralBleaching.alertLevel}
                onValueChange={(v) =>
                  setCoralBleaching({
                    alertLevel: v as CoralBleachingAlert['alertLevel'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="alert_level_1">Alert Level 1</SelectItem>
                  <SelectItem value="alert_level_2">Alert Level 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Region</Label>
              <Select
                value={coralBleaching.region}
                onValueChange={(v) =>
                  setCoralBleaching({
                    region: v as CoralBleachingAlert['region'],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="pacific">Pacific</SelectItem>
                  <SelectItem value="atlantic">Atlantic</SelectItem>
                  <SelectItem value="indian">Indian Ocean</SelectItem>
                  <SelectItem value="red_sea">Red Sea</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Overlay toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Overlays</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-pink-500" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {coralBleaching[key] ? (
                    <Eye className="h-3 w-3 text-pink-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Switch
                    checked={coralBleaching[key]}
                    onCheckedChange={(checked) =>
                      setCoralBleaching({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* SST anomaly line chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Sea Surface Temperature Anomaly (°C)
            </Label>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SST_ANOMALY_DATA}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                    unit="°C"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(244,63,94,0.3)',
                    }}
                  />
                  {['gbr', 'caribbean', 'maldives', 'redSea', 'hawaiian', 'coralTriangle'].map(
                    (key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={SST_LINE_COLORS[i]}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    )
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {['GBR', 'Caribbean', 'Maldives', 'Red Sea', 'Hawaiian', 'Coral Triangle'].map(
                (name, i) => (
                  <div key={name} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: SST_LINE_COLORS[i] }}
                    />
                    {name}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Recovery potential bar chart */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Recovery Potential (%)
            </Label>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredRecoveryData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    unit="%"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(244,63,94,0.3)',
                    }}
                  />
                  <Bar dataKey="recovery" radius={[4, 4, 0, 0]}>
                    {filteredRecoveryData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={['#f43f5e', '#fb7185', '#be123c', '#fda4af', '#e11d48', '#f472b6'][i % 6]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Coral sites list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Coral Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = coralBleaching.activeSiteId === site.id
                  const bleachColor = BLEACHING_COLORS[site.bleachingLevel]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-pink-500/50 bg-pink-500/5'
                          : 'border-border/40 hover:border-pink-500/20 hover:bg-pink-500/5'
                      }`}
                      onClick={() =>
                        setCoralBleaching({
                          activeSiteId: isActive ? null : site.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{site.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: bleachColor,
                            color: bleachColor,
                          }}
                        >
                          {BLEACHING_LABELS[site.bleachingLevel]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        <div>
                          SST:{' '}
                          <span className="text-foreground">
                            +{site.sstAnomaly}°C
                          </span>
                        </div>
                        <div>
                          Reef:{' '}
                          <span className="text-foreground">
                            {site.reefArea.toLocaleString()} km²
                          </span>
                        </div>
                        <div>
                          Recovery:{' '}
                          <span className="text-foreground">
                            {site.recoveryPotential}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type CoralBleachingAlert = ReturnType<typeof useMapStore.getState>['coralBleaching']
