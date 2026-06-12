'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMapStore, type TimelineEvent } from '@/lib/map-store'
import {
  Calendar,
  Clock,
  MapPin,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type TimelineZoom = 'day' | 'week' | 'month'

const EVENT_COLORS: Record<TimelineEvent['type'], string> = {
  added: 'bg-emerald-500',
  visited: 'bg-sky-500',
  edited: 'bg-amber-500',
  deleted: 'bg-red-500',
}

const EVENT_BORDER_COLORS: Record<TimelineEvent['type'], string> = {
  added: 'border-emerald-500',
  visited: 'border-sky-500',
  edited: 'border-amber-500',
  deleted: 'border-red-500',
}

const EVENT_TEXT_COLORS: Record<TimelineEvent['type'], string> = {
  added: 'text-emerald-600 dark:text-emerald-400',
  visited: 'text-sky-600 dark:text-sky-400',
  edited: 'text-amber-600 dark:text-amber-400',
  deleted: 'text-red-600 dark:text-red-400',
}

const EVENT_LABELS: Record<TimelineEvent['type'], string> = {
  added: 'Added',
  visited: 'Visited',
  edited: 'Edited',
  deleted: 'Deleted',
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatDayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekKey(ts: number): string {
  const d = new Date(ts)
  const start = new Date(d)
  start.setDate(d.getDate() - d.getDay())
  return formatDayKey(start.getTime())
}

function getMonthKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function LocationVisitTimeline() {
  const visitTimelineOpen = useMapStore((s) => s.visitTimelineOpen)
  const setVisitTimelineOpen = useMapStore((s) => s.setVisitTimelineOpen)
  const timelineEvents = useMapStore((s) => s.timelineEvents)
  const savedLocations = useMapStore((s) => s.savedLocations)
  const geofenceEvents = useMapStore((s) => s.geofenceEvents)

  const [zoom, setZoom] = useState<TimelineZoom>('day')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  // Derive timeline events from saved locations and geofence events
  const allEvents = useMemo(() => {
    const derived: TimelineEvent[] = []

    // Create "added" events from saved locations
    for (const loc of savedLocations) {
      const createdTs = new Date(loc.createdAt).getTime()
      derived.push({
        id: `derived-added-${loc.id}`,
        type: 'added',
        locationId: loc.id,
        locationName: loc.name,
        timestamp: createdTs,
        latitude: loc.latitude,
        longitude: loc.longitude,
      })

      // If updatedAt differs from createdAt, add "edited" event
      const updatedTs = new Date(loc.updatedAt).getTime()
      if (updatedTs - createdTs > 60000) {
        derived.push({
          id: `derived-edited-${loc.id}`,
          type: 'edited',
          locationId: loc.id,
          locationName: loc.name,
          timestamp: updatedTs,
          latitude: loc.latitude,
          longitude: loc.longitude,
        })
      }
    }

    // Create "visited" events from geofence enter events
    for (const ge of geofenceEvents) {
      if (ge.type === 'enter') {
        derived.push({
          id: `derived-visited-${ge.id}`,
          type: 'visited',
          locationId: ge.geofenceId,
          locationName: ge.geofenceName,
          timestamp: ge.timestamp,
          latitude: ge.latitude,
          longitude: ge.longitude,
        })
      }
    }

    // Merge with manually added timeline events
    const merged = [...derived, ...timelineEvents]

    // Deduplicate by id
    const seen = new Set<string>()
    return merged.filter((e) => {
      if (seen.has(e.id)) return false
      seen.add(e.id)
      return true
    }).sort((a, b) => b.timestamp - a.timestamp)
  }, [savedLocations, geofenceEvents, timelineEvents])

  // Group events by zoom level
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {}
    const keyFn = zoom === 'day' ? formatDayKey : zoom === 'week' ? getWeekKey : getMonthKey

    for (const event of allEvents) {
      const key = keyFn(event.timestamp)
      if (!groups[key]) groups[key] = []
      groups[key].push(event)
    }
    return groups
  }, [allEvents, zoom])

  const sortedGroups = useMemo(() =>
    Object.entries(groupedEvents).sort((a, b) => b[0].localeCompare(a[0])),
    [groupedEvents]
  )

  // Statistics
  const stats = useMemo(() => {
    if (allEvents.length === 0) {
      return { total: 0, mostActiveDay: 'N/A', avgPerDay: 0 }
    }

    const dayCounts: Record<string, number> = {}
    for (const e of allEvents) {
      const key = formatDayKey(e.timestamp)
      dayCounts[key] = (dayCounts[key] || 0) + 1
    }

    const days = Object.keys(dayCounts)
    const mostActiveDay = days.reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b, days[0])
    const avgPerDay = allEvents.length / Math.max(days.length, 1)

    return {
      total: allEvents.length,
      mostActiveDay,
      avgPerDay: Math.round(avgPerDay * 10) / 10,
    }
  }, [allEvents])

  // Activity heatmap data (last 52 weeks like GitHub)
  const heatmapData = useMemo(() => {
    const now = new Date()
    const data: { date: string; count: number; dayOfWeek: number }[] = []

    for (let i = 364; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = formatDayKey(d.getTime())
      const count = allEvents.filter((e) => formatDayKey(e.timestamp) === key).length
      data.push({ date: key, count, dayOfWeek: d.getDay() })
    }
    return data
  }, [allEvents])

  // Calendar view data
  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days: { date: string; day: number; count: number; isCurrentMonth: boolean }[] = []

    // Previous month padding
    const prevMonthLast = new Date(year, month, 0).getDate()
    for (let i = startPad - 1; i >= 0; i--) {
      const d = prevMonthLast - i
      const date = new Date(year, month - 1, d)
      const key = formatDayKey(date.getTime())
      const count = allEvents.filter((e) => formatDayKey(e.timestamp) === key).length
      days.push({ date: key, day: d, count, isCurrentMonth: false })
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d)
      const key = formatDayKey(date.getTime())
      const count = allEvents.filter((e) => formatDayKey(e.timestamp) === key).length
      days.push({ date: key, day: d, count, isCurrentMonth: true })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d)
      const key = formatDayKey(date.getTime())
      const count = allEvents.filter((e) => formatDayKey(e.timestamp) === key).length
      days.push({ date: key, day: d, count, isCurrentMonth: false })
    }

    return days
  }, [calendarMonth, allEvents])

  const navigateCalendar = useCallback((dir: number) => {
    setCalendarMonth((prev) => {
      let newMonth = prev.month + dir
      let newYear = prev.year
      if (newMonth < 0) { newMonth = 11; newYear-- }
      if (newMonth > 11) { newMonth = 0; newYear++ }
      return { year: newYear, month: newMonth }
    })
  }, [])

  const navigateToLocation = useCallback((lat: number, lng: number) => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (map) {
      map.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 })
    }
  }, [])

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return []
    return allEvents.filter((e) => formatDayKey(e.timestamp) === selectedDay).sort((a, b) => b.timestamp - a.timestamp)
  }, [selectedDay, allEvents])

  const maxHeatmapCount = useMemo(() =>
    Math.max(...heatmapData.map((d) => d.count), 1),
    [heatmapData]
  )

  const getHeatmapColor = useCallback((count: number) => {
    if (count === 0) return 'bg-muted/50'
    const ratio = count / maxHeatmapCount
    if (ratio < 0.25) return 'bg-emerald-200 dark:bg-emerald-900'
    if (ratio < 0.5) return 'bg-emerald-400 dark:bg-emerald-700'
    if (ratio < 0.75) return 'bg-emerald-500 dark:bg-emerald-600'
    return 'bg-emerald-700 dark:bg-emerald-500'
  }, [maxHeatmapCount])

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <Dialog open={visitTimelineOpen} onOpenChange={setVisitTimelineOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-emerald-500" />
            Location Visit Timeline
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Zoom:</span>
            {(['day', 'week', 'month'] as TimelineZoom[]).map((z) => (
              <Button
                key={z}
                size="sm"
                variant={zoom === z ? 'default' : 'outline'}
                className="h-7 text-xs px-3 capitalize"
                onClick={() => setZoom(z)}
              >
                {z}
              </Button>
            ))}
          </div>

          {/* Statistics cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.total}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Total Events</div>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 truncate px-1">{stats.mostActiveDay}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Most Active Day</div>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{stats.avgPerDay}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Avg Events/Day</div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-500" />
              Activity Heatmap
            </h3>
            <div className="overflow-x-auto">
              <div className="flex gap-[3px] min-w-[720px]" style={{ flexWrap: 'wrap', flexDirection: 'column', height: '112px' }}>
                {heatmapData.map((d, i) => (
                  <div
                    key={i}
                    className={`w-[11px] h-[11px] rounded-sm cursor-pointer transition-colors hover:ring-1 hover:ring-foreground/30 ${getHeatmapColor(d.count)}`}
                    title={`${d.date}: ${d.count} event${d.count !== 1 ? 's' : ''}`}
                    onClick={() => d.count > 0 && setSelectedDay(d.date)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-muted/50" />
              <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
              <div className="w-3 h-3 rounded-sm bg-emerald-700 dark:bg-emerald-500" />
              <span>More</span>
            </div>
          </div>

          {/* Calendar View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-sky-500" />
                Calendar View
              </h3>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => navigateCalendar(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[140px] text-center">
                  {monthNames[calendarMonth.month]} {calendarMonth.year}
                </span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => navigateCalendar(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
              ))}
              {calendarDays.map((d, i) => (
                <button
                  key={i}
                  className={`relative h-9 rounded-lg text-xs transition-all hover:bg-accent ${
                    d.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'
                  } ${selectedDay === d.date ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                  onClick={() => {
                    setSelectedDay(d.date === selectedDay ? null : d.date)
                    setSelectedEvent(null)
                  }}
                >
                  <span className="relative z-10">{d.day}</span>
                  {d.count > 0 && (
                    <div
                      className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full ${
                        d.count > 3 ? 'bg-emerald-500' : d.count > 1 ? 'bg-emerald-400' : 'bg-emerald-300 dark:bg-emerald-700'
                      }`}
                      style={{ width: Math.min(4 + d.count * 2, 20), height: 3 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline / Event List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500" />
              {selectedDay ? `Events on ${selectedDay}` : 'Timeline'}
            </h3>

            {selectedDay ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedDayEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No events on this day</p>
                ) : (
                  selectedDayEvents.map((event) => (
                    <button
                      key={event.id}
                      className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg border transition-all hover:bg-accent ${
                        selectedEvent?.id === event.id ? 'ring-1 ring-primary bg-accent/50' : ''
                      }`}
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${EVENT_COLORS[event.type]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${EVENT_TEXT_COLORS[event.type]}`}>
                            {EVENT_LABELS[event.type]}
                          </Badge>
                          <span className="text-xs font-medium truncate">{event.locationName}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{formatTime(event.timestamp)}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {sortedGroups.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No timeline events yet. Add locations and visit geofences to see activity here.
                  </p>
                ) : (
                  sortedGroups.map(([groupKey, events]) => (
                    <div key={groupKey}>
                      <div className="text-xs font-semibold text-muted-foreground mb-1.5 sticky top-0 bg-background py-0.5">
                        {zoom === 'month'
                          ? new Date(groupKey + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                          : zoom === 'week'
                            ? `Week of ${formatDate(new Date(groupKey).getTime())}`
                            : formatDate(new Date(groupKey + 'T00:00:00').getTime())
                        }
                        <span className="ml-2 text-muted-foreground/60">({events.length})</span>
                      </div>
                      {/* Horizontal timeline for this group */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <div className="flex items-center">
                          <div className="w-2 h-0.5 bg-border" />
                          {events.map((event, idx) => (
                            <div key={event.id} className="flex items-center">
                              <button
                                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                                  EVENT_BORDER_COLORS[event.type]
                                } ${selectedEvent?.id === event.id ? 'scale-125 ring-2 ring-primary' : ''}`}
                                style={{ background: 'var(--background)' }}
                                onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                                title={`${EVENT_LABELS[event.type]}: ${event.locationName}`}
                              >
                                <div className={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS[event.type]}`} />
                              </button>
                              {idx < events.length - 1 && <div className="w-4 h-0.5 bg-border" />}
                            </div>
                          ))}
                          <div className="w-2 h-0.5 bg-border" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Event detail panel */}
          {selectedEvent && (
            <div className="rounded-xl border p-4 space-y-3 bg-accent/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${EVENT_COLORS[selectedEvent.type]}`} />
                  <Badge variant="secondary" className={EVENT_TEXT_COLORS[selectedEvent.type]}>
                    {EVENT_LABELS[selectedEvent.type]}
                  </Badge>
                  <span className="text-sm font-medium">{selectedEvent.locationName}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(selectedEvent.timestamp)} {formatTime(selectedEvent.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{selectedEvent.latitude.toFixed(4)}, {selectedEvent.longitude.toFixed(4)}</span>
                </div>
              </div>
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  navigateToLocation(selectedEvent.latitude, selectedEvent.longitude)
                  setVisitTimelineOpen(false)
                }}
              >
                <MapPin className="h-3 w-3" />
                Navigate to Location
              </Button>
            </div>
          )}

          {/* Event type legend */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {(['added', 'visited', 'edited', 'deleted'] as TimelineEvent['type'][]).map((type) => (
              <div key={type} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${EVENT_COLORS[type]}`} />
                <span>{EVENT_LABELS[type]}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
