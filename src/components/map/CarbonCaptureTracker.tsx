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
import { useMapStore, type CarbonCaptureState, type CarbonCaptureFacility } from '@/lib/map-store'
import { Factory as FactoryIcon2, X, Gauge, Cog, Activity, Database, Filter, MapPin } from 'lucide-react'

const DEMO_FACILITIES: CarbonCaptureFacility[] = [
  {
    id: 'cc-boundarydam',
    name: 'Boundary Dam',
    latitude: 49.11,
    longitude: -102.99,
    captureCapacity: 1.0,
    currentCapture: 0.8,
    technology: 'Post-combustion',
    status: 'operational',
    storageType: 'Geological',
    co2Stored: 4.5,
  },
  {
    id: 'cc-petranova',
    name: 'Petra Nova',
    latitude: 29.38,
    longitude: -95.61,
    captureCapacity: 1.4,
    currentCapture: 0,
    technology: 'Post-combustion',
    status: 'paused',
    storageType: 'EOR',
    co2Stored: 3.8,
  },
  {
    id: 'cc-northernlights',
    name: 'Northern Lights',
    latitude: 60.45,
    longitude: 5.32,
    captureCapacity: 5.0,
    currentCapture: 2.1,
    technology: 'Ship transport',
    status: 'operational',
    storageType: 'Saline Aquifer',
    co2Stored: 1.2,
  },
  {
    id: 'cc-gorgon',
    name: 'Gorgon CCS',
    latitude: -21.89,
    longitude: 114.42,
    captureCapacity: 4.0,
    currentCapture: 2.8,
    technology: 'Pre-combustion',
    status: 'operational',
    storageType: 'Geological',
    co2Stored: 6.5,
  },
  {
    id: 'cc-quest',
    name: 'Quest Facility',
    latitude: 53.73,
    longitude: -113.73,
    captureCapacity: 1.2,
    currentCapture: 1.0,
    technology: 'Amine scrubbing',
    status: 'operational',
    storageType: 'Saline Aquifer',
    co2Stored: 7.2,
  },
  {
    id: 'cc-porthos',
    name: 'Porthos Project',
    latitude: 51.92,
    longitude: 4.49,
    captureCapacity: 2.5,
    currentCapture: 0,
    technology: 'Post-combustion',
    status: 'construction',
    storageType: 'Empty Gas Field',
    co2Stored: 0,
  },
]

const STATUS_CONFIG: Record<
  CarbonCaptureFacility['status'],
  { label: string; color: string; bgClass: string }
> = {
  planned: { label: 'Planned', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  construction: { label: 'Construction', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  operational: { label: 'Operational', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  paused: { label: 'Paused', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
}

export function CarbonCaptureTracker() {
  const carbonCapture = useMapStore((s) => s.carbonCapture)
  const setCarbonCapture = useMapStore((s) => s.setCarbonCapture)

  const facilities = useMemo(
    () => (carbonCapture.facilities.length > 0 ? carbonCapture.facilities : DEMO_FACILITIES),
    [carbonCapture.facilities]
  )

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (carbonCapture.statusFilter !== 'all' && f.status !== carbonCapture.statusFilter) return false
      return true
    })
  }, [facilities, carbonCapture.statusFilter])

  const summary = useMemo(() => {
    if (filteredFacilities.length === 0) {
      return { totalCapacity: 0, operationalCount: 0, totalCo2Stored: 0 }
    }
    const totalCapacity = filteredFacilities.reduce((sum, f) => sum + f.captureCapacity, 0)
    const operationalCount = filteredFacilities.filter((f) => f.status === 'operational').length
    const totalCo2Stored = filteredFacilities.reduce((sum, f) => sum + f.co2Stored, 0)
    return {
      totalCapacity: Math.round(totalCapacity * 10) / 10,
      operationalCount,
      totalCo2Stored: Math.round(totalCo2Stored * 10) / 10,
    }
  }, [filteredFacilities])

  const activeFacility = useMemo(
    () => facilities.find((f) => f.id === carbonCapture.activeFacilityId) ?? null,
    [facilities, carbonCapture.activeFacilityId]
  )

  if (typeof window === 'undefined') return null
  if (!carbonCapture.open) return null

  const overlayToggles: { key: keyof CarbonCaptureState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCapacity', label: 'Capacity', icon: Gauge },
    { key: 'showTechnology', label: 'Technology', icon: Cog },
    { key: 'showStatus', label: 'Status', icon: Activity },
    { key: 'showStorage', label: 'Storage', icon: Database },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FactoryIcon2 className="h-4 w-4 text-teal-500" />
              Carbon Capture Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCarbonCapture({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={carbonCapture.statusFilter}
              onValueChange={(v) =>
                setCarbonCapture({
                  statusFilter: v as CarbonCaptureState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
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
                  checked={carbonCapture[key] as boolean}
                  onCheckedChange={(checked) => setCarbonCapture({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Capacity</div>
              <div className="text-sm font-semibold">{summary.totalCapacity}</div>
              <div className="text-[9px] text-muted-foreground">Mtpa</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Operational</div>
              <div className="text-sm font-semibold text-green-500">{summary.operationalCount}</div>
              <div className="text-[9px] text-muted-foreground">facilities</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">CO2 Stored</div>
              <div className="text-sm font-semibold text-teal-500">{summary.totalCo2Stored}</div>
              <div className="text-[9px] text-muted-foreground">Mt</div>
            </div>
          </div>

          <Separator />

          {/* Facility List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Capture Facilities ({filteredFacilities.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFacilities.map((facility) => {
                  const isActive = carbonCapture.activeFacilityId === facility.id
                  const statusCfg = STATUS_CONFIG[facility.status]
                  return (
                    <div
                      key={facility.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setCarbonCapture({
                          activeFacilityId: isActive ? null : facility.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium">{facility.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {carbonCapture.showCapacity && (
                          <div>
                            Capacity:{' '}
                            <span className="text-foreground font-medium">
                              {facility.captureCapacity} Mtpa
                            </span>
                          </div>
                        )}
                        {carbonCapture.showTechnology && (
                          <div>
                            Tech:{' '}
                            <span className="text-foreground font-medium">
                              {facility.technology}
                            </span>
                          </div>
                        )}
                        {carbonCapture.showStatus && (
                          <div>
                            Current:{' '}
                            <span className="text-foreground font-medium">
                              {facility.currentCapture} Mtpa
                            </span>
                          </div>
                        )}
                        {carbonCapture.showStorage && (
                          <div>
                            Storage:{' '}
                            <span className="text-foreground font-medium">
                              {facility.storageType}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFacilities.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No facilities match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Facility Details */}
          {activeFacility && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-500" />
                  <span className="text-xs font-semibold">{activeFacility.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeFacility.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeFacility.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeFacility.latitude.toFixed(2)}, {activeFacility.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity: </span>
                    <span className="font-medium">{activeFacility.captureCapacity} Mtpa</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Capture: </span>
                    <span className="font-medium">{activeFacility.currentCapture} Mtpa</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Technology: </span>
                    <span className="font-medium">{activeFacility.technology}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Storage Type: </span>
                    <span className="font-medium">{activeFacility.storageType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CO2 Stored: </span>
                    <span className="font-medium">{activeFacility.co2Stored} Mt</span>
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
