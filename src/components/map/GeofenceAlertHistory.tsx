'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type GeofenceEvent, type Geofence } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  BellRing,
  Clock,
  MapPin,
  Filter,
  Trash2,
  BellOff,
  Navigation,
  AlertTriangle,
  LogIn,
  LogOut,
  Plus,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatTimestamp(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleString()
}

export function GeofenceAlertHistory() {
  const geofenceEvents = useMapStore((s) => s.geofenceEvents)
  const addGeofenceEvent = useMapStore((s) => s.addGeofenceEvent)
  const clearGeofenceEvents = useMapStore((s) => s.clearGeofenceEvents)
  const geofenceAlertOpen = useMapStore((s) => s.geofenceAlertOpen)
  const setGeofenceAlertOpen = useMapStore((s) => s.setGeofenceAlertOpen)
  const geofenceAlertsEnabled = useMapStore((s) => s.geofenceAlertsEnabled)
  const setGeofenceAlertsEnabled = useMapStore((s) => s.setGeofenceAlertsEnabled)
  const geofences = useMapStore((s) => s.geofences)
  const geolocation = useMapStore((s) => s.geolocation)
  const addGeofence = useMapStore((s) => s.addGeofence)

  const [filterGeofenceName, setFilterGeofenceName] = useState('')
  const [filterEventType, setFilterEventType] = useState<'all' | 'enter' | 'exit'>('all')
  const [filterDateStart, setFilterDateStart] = useState('')
  const [filterDateEnd, setFilterDateEnd] = useState('')
  const [activeTab, setActiveTab] = useState<'history' | 'status' | 'stats'>('history')

  // Generate geofence events when geofences are monitored
  const prevInsideState = useRef<Record<string, boolean>>({})

  useEffect(() => {
    if (!geofenceAlertsEnabled || !geolocation) return

    const checkGeofences = () => {
      const geo = useMapStore.getState().geolocation
      if (!geo) return

      const fences = useMapStore.getState().geofences
      for (const fence of fences) {
        if (!fence.isActive) continue

        const dist = haversineDistance(geo.latitude, geo.longitude, fence.latitude, fence.longitude)
        const inside = dist <= fence.radius
        const wasInside = prevInsideState.current[fence.id] || false

        if (inside && !wasInside && fence.notifyOnEnter) {
          addGeofenceEvent({
            geofenceId: fence.id,
            geofenceName: fence.name,
            type: 'enter',
            timestamp: Date.now(),
            latitude: geo.latitude,
            longitude: geo.longitude,
          })
        } else if (!inside && wasInside && fence.notifyOnExit) {
          addGeofenceEvent({
            geofenceId: fence.id,
            geofenceName: fence.name,
            type: 'exit',
            timestamp: Date.now(),
            latitude: geo.latitude,
            longitude: geo.longitude,
          })
        }

        prevInsideState.current[fence.id] = inside
      }
    }

    checkGeofences()
    const interval = setInterval(checkGeofences, 5000)
    return () => clearInterval(interval)
  }, [geofenceAlertsEnabled, geolocation, addGeofenceEvent])

  // Filtered events
  const filteredEvents = useMemo(() => {
    let result = [...geofenceEvents].sort((a, b) => b.timestamp - a.timestamp)

    if (filterGeofenceName) {
      const q = filterGeofenceName.toLowerCase()
      result = result.filter((e) => e.geofenceName.toLowerCase().includes(q))
    }

    if (filterEventType !== 'all') {
      result = result.filter((e) => e.type === filterEventType)
    }

    if (filterDateStart) {
      const start = new Date(filterDateStart).getTime()
      result = result.filter((e) => e.timestamp >= start)
    }

    if (filterDateEnd) {
      const end = new Date(filterDateEnd).getTime() + 86400000 // include the end day
      result = result.filter((e) => e.timestamp <= end)
    }

    return result
  }, [geofenceEvents, filterGeofenceName, filterEventType, filterDateStart, filterDateEnd])

  // Active geofence status
  const geofenceStatuses = useMemo(() => {
    return geofences
      .filter((g) => g.isActive)
      .map((g) => {
        const dist = geolocation
          ? haversineDistance(geolocation.latitude, geolocation.longitude, g.latitude, g.longitude)
          : null
        const inside = dist !== null ? dist <= g.radius : false

        // Find last event for this geofence
        const lastEvent = geofenceEvents
          .filter((e) => e.geofenceId === g.id)
          .sort((a, b) => b.timestamp - a.timestamp)[0]

        return {
          geofence: g,
          inside,
          distance: dist,
          lastEvent,
        }
      })
  }, [geofences, geolocation, geofenceEvents])

  // Stats
  const geofenceStats = useMemo(() => {
    if (geofenceEvents.length === 0) return null

    const byGeofence: Record<string, { enters: number; exits: number; events: GeofenceEvent[] }> = {}
    geofenceEvents.forEach((e) => {
      if (!byGeofence[e.geofenceId]) {
        byGeofence[e.geofenceId] = { enters: 0, exits: 0, events: [] }
      }
      byGeofence[e.geofenceId].events.push(e)
      if (e.type === 'enter') byGeofence[e.geofenceId].enters++
      else byGeofence[e.geofenceId].exits++
    })

    // Average time inside each geofence
    const avgTimeByGeofence: Record<string, number> = {}
    Object.entries(byGeofence).forEach(([id, data]) => {
      const events = data.events.sort((a, b) => a.timestamp - b.timestamp)
      let totalTime = 0
      let sessions = 0
      let enterTime: number | null = null

      events.forEach((e) => {
        if (e.type === 'enter') {
          enterTime = e.timestamp
        } else if (e.type === 'exit' && enterTime !== null) {
          totalTime += e.timestamp - enterTime
          sessions++
          enterTime = null
        }
      })

      avgTimeByGeofence[id] = sessions > 0 ? totalTime / sessions : 0
    })

    // Most visited geofence
    let mostVisited = ''
    let maxVisits = 0
    Object.entries(byGeofence).forEach(([id, data]) => {
      if (data.enters > maxVisits) {
        maxVisits = data.enters
        mostVisited = id
      }
    })

    // Time-of-day heatmap data (hour buckets)
    const hourCounts = new Array(24).fill(0)
    geofenceEvents.forEach((e) => {
      const hour = new Date(e.timestamp).getHours()
      hourCounts[hour]++
    })

    return {
      totalEvents: geofenceEvents.length,
      byGeofence,
      avgTimeByGeofence,
      mostVisited,
      mostVisitedName: mostVisited
        ? byGeofence[mostVisited]?.events[0]?.geofenceName || 'Unknown'
        : 'None',
      mostVisitedCount: maxVisits,
      hourCounts,
    }
  }, [geofenceEvents])

  const navigateToGeofence = useCallback((lat: number, lng: number) => {
    const map = (window as any).__mainMap
    if (map) {
      map.flyTo({ center: [lng, lat], zoom: 15 })
    }
  }, [])

  const createGeofenceFromLocation = useCallback(
    (lat: number, lng: number) => {
      addGeofence({
        id: `gf-${Date.now()}`,
        name: `Geofence from Alert`,
        latitude: lat,
        longitude: lng,
        radius: 500,
        color: '#ef4444',
        notifyOnEnter: true,
        notifyOnExit: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      })
      toast.success('New geofence created from alert location')
    },
    [addGeofence]
  )

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  return (
    <Dialog open={geofenceAlertOpen} onOpenChange={setGeofenceAlertOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-amber-500" />
            Geofence Alert History
            <Badge variant="secondary" className="ml-2 text-xs">
              {geofenceEvents.length} event{geofenceEvents.length !== 1 ? 's' : ''}
            </Badge>
            {!geofenceAlertsEnabled && (
              <Badge variant="destructive" className="text-xs gap-1">
                <BellOff className="h-3 w-3" />
                Disabled
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b pb-1">
          {(['history', 'status', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                activeTab === tab
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'history' && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> History
                </span>
              )}
              {tab === 'status' && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Status
                </span>
              )}
              {tab === 'stats' && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Stats
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col gap-3">
          {/* History Tab */}
          {activeTab === 'history' && (
            <>
              {/* Filters */}
              <div className="flex gap-2 items-center flex-wrap">
                <div className="relative flex-1 min-w-[120px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Filter by geofence..."
                    value={filterGeofenceName}
                    onChange={(e) => setFilterGeofenceName(e.target.value)}
                    className="pl-7 h-7 text-xs"
                  />
                </div>
                <Select value={filterEventType} onValueChange={(v) => setFilterEventType(v as typeof filterEventType)}>
                  <SelectTrigger className="w-[100px] h-7 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="enter">Enter</SelectItem>
                    <SelectItem value="exit">Exit</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  className="h-7 text-xs w-[120px]"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                  className="h-7 text-xs w-[120px]"
                  placeholder="To"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    clearGeofenceEvents()
                    toast.success('Alert history cleared')
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              </div>

              {/* Event List */}
              <div className="flex-1 overflow-y-auto border rounded-lg min-h-0 max-h-96 custom-scrollbar">
                {filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <BellRing className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">No alert events</p>
                    <p className="text-xs">Events will appear when you enter or exit geofences</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-2 p-2.5 hover:bg-accent/50 transition-colors"
                      >
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            event.type === 'enter' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
                          }`}
                        >
                          {event.type === 'enter' ? (
                            <LogIn className="h-3 w-3 text-red-600 dark:text-red-400" />
                          ) : (
                            <LogOut className="h-3 w-3 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">
                              {event.type === 'enter' ? 'Entered' : 'Exited'}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[9px] h-4 px-1.5"
                              style={{
                                backgroundColor: geofences.find((g) => g.id === event.geofenceId)?.color + '20',
                                color: geofences.find((g) => g.id === event.geofenceId)?.color,
                              }}
                            >
                              {event.geofenceName}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {formatTimestamp(event.timestamp)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatTimeAgo(event.timestamp)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => navigateToGeofence(event.latitude, event.longitude)}
                            aria-label="Navigate to location"
                          >
                            <Navigation className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => createGeofenceFromLocation(event.latitude, event.longitude)}
                            aria-label="Create geofence here"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <>
              {/* Toggle alerts */}
              <div className="flex items-center justify-between border rounded-lg p-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  {geofenceAlertsEnabled ? (
                    <BellRing className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">
                    Geofence Alerts {geofenceAlertsEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <Button
                  variant={geofenceAlertsEnabled ? 'destructive' : 'default'}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    setGeofenceAlertsEnabled(!geofenceAlertsEnabled)
                    toast.success(geofenceAlertsEnabled ? 'Geofence alerts disabled' : 'Geofence alerts enabled')
                  }}
                >
                  {geofenceAlertsEnabled ? (
                    <>
                      <BellOff className="h-3 w-3" /> Disable
                    </>
                  ) : (
                    <>
                      <BellRing className="h-3 w-3" /> Enable
                    </>
                  )}
                </Button>
              </div>

              {/* Geofence statuses */}
              <div className="flex-1 overflow-y-auto border rounded-lg min-h-0 max-h-96 custom-scrollbar">
                {geofenceStatuses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <MapPin className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">No active geofences</p>
                    <p className="text-xs">Create geofences from the map context menu</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {geofenceStatuses.map(({ geofence, inside, distance, lastEvent }) => (
                      <div
                        key={geofence.id}
                        className="flex items-start gap-2 p-2.5 hover:bg-accent/50 transition-colors"
                      >
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            inside ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
                          }`}
                        >
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              inside ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{geofence.name}</span>
                            <Badge
                              className={`text-[9px] h-4 px-1.5 ${
                                inside
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              } border-0`}
                            >
                              {inside ? 'Inside' : 'Outside'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                            {distance !== null && (
                              <span>
                                {distance > 1000
                                  ? `${(distance / 1000).toFixed(2)} km`
                                  : `${Math.round(distance)} m`}{' '}
                                {inside ? 'inside' : 'from'} boundary
                              </span>
                            )}
                            {lastEvent && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                Last: {formatTimeAgo(lastEvent.timestamp)}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            Radius: {geofence.radius}m
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => navigateToGeofence(geofence.latitude, geofence.longitude)}
                          aria-label="Navigate to geofence"
                        >
                          <Navigation className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <>
              {geofenceStats ? (
                <div className="flex-1 overflow-y-auto space-y-3 max-h-96 custom-scrollbar">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-xl font-bold text-amber-600">{geofenceStats.totalEvents}</div>
                      <div className="text-xs text-muted-foreground">Total Events</div>
                    </div>
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-xl font-bold text-emerald-600">{Object.keys(geofenceStats.byGeofence).length}</div>
                      <div className="text-xs text-muted-foreground">Geofences</div>
                    </div>
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-xl font-bold text-cyan-600">{geofenceStats.mostVisitedName}</div>
                      <div className="text-xs text-muted-foreground">
                        Most Visited ({geofenceStats.mostVisitedCount})
                      </div>
                    </div>
                  </div>

                  {/* Per-geofence stats */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 text-xs font-medium">Per-Geofence Breakdown</div>
                    <div className="divide-y">
                      {Object.entries(geofenceStats.byGeofence).map(([id, data]) => {
                        const avgTime = geofenceStats.avgTimeByGeofence[id]
                        return (
                          <div key={id} className="flex items-center gap-3 px-3 py-2">
                            <div
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: geofences.find((g) => g.id === id)?.color || '#6b7280' }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{data.events[0]?.geofenceName || 'Unknown'}</div>
                              <div className="flex gap-2 text-[10px] text-muted-foreground">
                                <span className="text-red-500">↑{data.enters}</span>
                                <span className="text-green-500">↓{data.exits}</span>
                                <span>Avg inside: {avgTime > 0 ? formatDuration(avgTime) : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time-of-day heatmap */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 text-xs font-medium">Time-of-Day Activity</div>
                    <div className="p-3">
                      <div className="grid grid-cols-12 gap-1">
                        {geofenceStats.hourCounts.map((count, hour) => {
                          const maxCount = Math.max(...geofenceStats.hourCounts, 1)
                          const intensity = count / maxCount
                          return (
                            <div key={hour} className="flex flex-col items-center gap-0.5">
                              <div
                                className="w-full aspect-square rounded-sm transition-colors"
                                style={{
                                  backgroundColor: intensity > 0
                                    ? `rgba(245, 158, 11, ${0.15 + intensity * 0.85})`
                                    : 'rgba(0,0,0,0.05)',
                                }}
                                title={`${hour}:00 - ${count} events`}
                              />
                              {hour % 3 === 0 && (
                                <span className="text-[8px] text-muted-foreground">{hour}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-muted-foreground">0:00</span>
                        <span className="text-[9px] text-muted-foreground">12:00</span>
                        <span className="text-[9px] text-muted-foreground">23:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No statistics available</p>
                  <p className="text-xs">Statistics will appear after geofence events are recorded</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
