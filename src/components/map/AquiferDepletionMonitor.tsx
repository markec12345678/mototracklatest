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
import { useMapStore, type AquiferSite, type AquiferDepletionState } from '@/lib/map-store'
import {
  Droplets,
  X,
  TrendingDown,
  Shield,
  Filter,
  MapPin,
} from 'lucide-react'

const DEMO_SITES: AquiferSite[] = [
  {
    id: 'aq1',
    name: 'Ogallala Aquifer',
    latitude: 37.5,
    longitude: -101.0,
    waterLevel: 45.2,
    depletionRate: 0.45,
    rechargeRate: 0.08,
    storageVolume: 3690,
    wellDepth: 120,
    status: 'declining',
  },
  {
    id: 'aq2',
    name: 'Central Valley CA',
    latitude: 37.0,
    longitude: -120.5,
    waterLevel: 28.7,
    depletionRate: 0.62,
    rechargeRate: 0.12,
    storageVolume: 1450,
    wellDepth: 200,
    status: 'critical',
  },
  {
    id: 'aq3',
    name: 'Arabian Aquifer',
    latitude: 24.0,
    longitude: 45.0,
    waterLevel: 120.5,
    depletionRate: 3.8,
    rechargeRate: 0.02,
    storageVolume: 191000,
    wellDepth: 350,
    status: 'critical',
  },
  {
    id: 'aq4',
    name: 'Guarani Aquifer',
    latitude: -22.0,
    longitude: -52.0,
    waterLevel: 250.0,
    depletionRate: 0.05,
    rechargeRate: 0.35,
    storageVolume: 40000,
    wellDepth: 80,
    status: 'stable',
  },
  {
    id: 'aq5',
    name: 'Nubian Sandstone',
    latitude: 23.0,
    longitude: 25.0,
    waterLevel: 300.0,
    depletionRate: 1.2,
    rechargeRate: 0.01,
    storageVolume: 150000,
    wellDepth: 450,
    status: 'declining',
  },
  {
    id: 'aq6',
    name: 'Ganges-Brahmaputra',
    latitude: 25.5,
    longitude: 85.0,
    waterLevel: 18.3,
    depletionRate: 0.55,
    rechargeRate: 0.42,
    storageVolume: 6800,
    wellDepth: 60,
    status: 'recovering',
  },
  {
    id: 'aq7',
    name: 'High Plains Aquifer (South)',
    latitude: 34.2,
    longitude: -102.3,
    waterLevel: 32.8,
    depletionRate: 0.78,
    rechargeRate: 0.06,
    storageVolume: 1050,
    wellDepth: 150,
    status: 'critical',
  },
]

const STATUS_COLORS: Record<AquiferSite['status'], string> = {
  stable: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/25',
  declining: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/25',
  critical: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25',
  recovering: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25',
}

const STATUS_DOT_COLORS: Record<AquiferSite['status'], string> = {
  stable: 'bg-green-500',
  declining: 'bg-yellow-500',
  critical: 'bg-red-500',
  recovering: 'bg-blue-500',
}

const STATUS_LABELS: Record<AquiferSite['status'], string> = {
  stable: 'Stable',
  declining: 'Declining',
  critical: 'Critical',
  recovering: 'Recovering',
}

const FILTER_LABELS: Record<string, string> = {
  all: 'All Statuses',
  stable: 'Stable',
  declining: 'Declining',
  critical: 'Critical',
  recovering: 'Recovering',
}

export function AquiferDepletionMonitor() {
  const aquiferDepletion = useMapStore((s) => s.aquiferDepletion)
  const setAquiferDepletion = useMapStore((s) => s.setAquiferDepletion)

  const sites = aquiferDepletion.aquiferSites.length > 0 ? aquiferDepletion.aquiferSites : DEMO_SITES

  const filteredSites = useMemo(() => sites.filter((site) => {
    if (aquiferDepletion.statusFilter !== 'all' && site.status !== aquiferDepletion.statusFilter) return false
    return true
  }), [sites, aquiferDepletion.statusFilter])

  const selectedSite = aquiferDepletion.activeAquiferId
    ? sites.find((s) => s.id === aquiferDepletion.activeAquiferId) ?? null
    : null

  const summary = useMemo(() => {
    const avgWaterLevel = filteredSites.length > 0
      ? filteredSites.reduce((sum, s) => sum + s.waterLevel, 0) / filteredSites.length
      : 0
    const criticalCount = filteredSites.filter((s) => s.status === 'critical').length
    const totalStorage = filteredSites.reduce((sum, s) => sum + s.storageVolume, 0)
    return { avgWaterLevel, criticalCount, totalStorage }
  }, [filteredSites])

  if (typeof window === 'undefined') return null
  if (!aquiferDepletion.open) return null

  function handleClose() {
    setAquiferDepletion({ open: false })
  }

  function handleSelectSite(id: string) {
    setAquiferDepletion({
      activeAquiferId: aquiferDepletion.activeAquiferId === id ? null : id,
    })
  }

  function handleToggle(key: keyof AquiferDepletionState, value: boolean) {
    setAquiferDepletion({ [key]: value })
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-[420px] max-h-[calc(100vh-2rem)] flex flex-col">
      <Card className="shadow-xl border-border/60 bg-background/95 backdrop-blur-sm flex flex-col max-h-[calc(100vh-2rem)]">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-600" />
              Aquifer Depletion Monitor
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <Switch
                id="showWaterLevel"
                checked={aquiferDepletion.showWaterLevel}
                onCheckedChange={(v) => handleToggle('showWaterLevel', v)}
              />
              <Label htmlFor="showWaterLevel" className="text-xs cursor-pointer">Water Level</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="showDepletion"
                checked={aquiferDepletion.showDepletion}
                onCheckedChange={(v) => handleToggle('showDepletion', v)}
              />
              <Label htmlFor="showDepletion" className="text-xs cursor-pointer">Depletion Rate</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="showRecharge"
                checked={aquiferDepletion.showRecharge}
                onCheckedChange={(v) => handleToggle('showRecharge', v)}
              />
              <Label htmlFor="showRecharge" className="text-xs cursor-pointer">Recharge Rate</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="showStatus"
                checked={aquiferDepletion.showStatus}
                onCheckedChange={(v) => handleToggle('showStatus', v)}
              />
              <Label htmlFor="showStatus" className="text-xs cursor-pointer">Status Badges</Label>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select
              value={aquiferDepletion.statusFilter}
              onValueChange={(v) => setAquiferDepletion({ statusFilter: v as AquiferDepletionState['statusFilter'] })}
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FILTER_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          {/* Summary */}
          <div className="p-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">Avg Water Level</div>
              <div className="text-sm font-bold">{summary.avgWaterLevel.toFixed(1)} m</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">Critical</div>
              <div className="text-sm font-bold text-red-600 dark:text-red-400">{summary.criticalCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">Total Storage</div>
              <div className="text-sm font-bold">{summary.totalStorage.toLocaleString()} km³</div>
            </div>
          </div>

          <Separator />

          {/* Sites List */}
          <ScrollArea className="flex-1 max-h-[280px]">
            <div className="p-2 space-y-1">
              {filteredSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => handleSelectSite(site.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors hover:bg-muted/60 ${
                    aquiferDepletion.activeAquiferId === site.id
                      ? 'bg-muted ring-1 ring-ring/30'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{site.name}</span>
                    </div>
                    {aquiferDepletion.showStatus && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 h-5 shrink-0 ${STATUS_COLORS[site.status]}`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${STATUS_DOT_COLORS[site.status]}`} />
                        {STATUS_LABELS[site.status]}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    {aquiferDepletion.showWaterLevel && (
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {site.waterLevel} m
                      </span>
                    )}
                    {aquiferDepletion.showDepletion && (
                      <span className="flex items-center gap-1 text-red-500/80">
                        <TrendingDown className="h-3 w-3" />
                        {site.depletionRate} m/yr
                      </span>
                    )}
                    {aquiferDepletion.showRecharge && (
                      <span className="flex items-center gap-1 text-green-600/80 dark:text-green-400/80">
                        <Shield className="h-3 w-3" />
                        {site.rechargeRate} m/yr
                      </span>
                    )}
                    <span>Storage: {site.storageVolume.toLocaleString()} km³</span>
                    <span>Well: {site.wellDepth} m</span>
                  </div>
                </button>
              ))}

              {filteredSites.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No sites match the current filter.
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Selected Site Details */}
          {selectedSite && (
            <>
              <Separator />
              <div className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="h-4 w-4 text-cyan-600" />
                  <h4 className="text-sm font-semibold">{selectedSite.name}</h4>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-5 ml-auto ${STATUS_COLORS[selectedSite.status]}`}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${STATUS_DOT_COLORS[selectedSite.status]}`} />
                    {STATUS_LABELS[selectedSite.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Water Level</div>
                    <div className="font-semibold">{selectedSite.waterLevel} m</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Well Depth</div>
                    <div className="font-semibold">{selectedSite.wellDepth} m</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Depletion Rate</div>
                    <div className="font-semibold text-red-600 dark:text-red-400">
                      <TrendingDown className="h-3 w-3 inline mr-1" />
                      {selectedSite.depletionRate} m/yr
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Recharge Rate</div>
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      <Shield className="h-3 w-3 inline mr-1" />
                      {selectedSite.rechargeRate} m/yr
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Storage Volume</div>
                    <div className="font-semibold">{selectedSite.storageVolume.toLocaleString()} km³</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Coordinates</div>
                    <div className="font-semibold">
                      {selectedSite.latitude.toFixed(2)}, {selectedSite.longitude.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Depletion ratio indicator */}
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground mb-1.5">Depletion / Recharge Ratio</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selectedSite.rechargeRate === 0
                            ? 'bg-red-500 w-full'
                            : selectedSite.depletionRate / selectedSite.rechargeRate > 5
                              ? 'bg-red-500'
                              : selectedSite.depletionRate / selectedSite.rechargeRate > 2
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                        }`}
                        style={{
                          width: selectedSite.rechargeRate === 0
                            ? '100%'
                            : `${Math.min((selectedSite.depletionRate / selectedSite.rechargeRate) * 10, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono font-semibold min-w-[3rem] text-right">
                      {selectedSite.rechargeRate === 0
                        ? '∞'
                        : (selectedSite.depletionRate / selectedSite.rechargeRate).toFixed(1)}×
                    </span>
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
