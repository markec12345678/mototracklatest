'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  MapPin,
  FileText,
  Download,
  ChevronDown,
  ChevronRight,
  X,
  Navigation,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  useMapStore,
  type TripPlan,
  type TripDay,
  type TripStop,
} from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function generateId() {
  return `tp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function TripPlanner() {
  const tripPlans = useMapStore((s) => s.tripPlans)
  const addTripPlan = useMapStore((s) => s.addTripPlan)
  const deleteTripPlan = useMapStore((s) => s.deleteTripPlan)
  const addTripStop = useMapStore((s) => s.addTripStop)
  const removeTripStop = useMapStore((s) => s.removeTripStop)
  const updateTripStop = useMapStore((s) => s.updateTripStop)
  const reorderTripStops = useMapStore((s) => s.reorderTripStops)
  const addTripDay = useMapStore((s) => s.addTripDay)
  const removeTripDay = useMapStore((s) => s.removeTripDay)

  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null)
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null)
  const [newPlanName, setNewPlanName] = useState('')
  const [showNewPlan, setShowNewPlan] = useState(false)
  const [editingStopId, setEditingStopId] = useState<string | null>(null)
  const [dragStopId, setDragStopId] = useState<string | null>(null)

  const handleCreatePlan = useCallback(() => {
    const name = newPlanName.trim() || `Trip ${tripPlans.length + 1}`
    const today = new Date().toISOString().split('T')[0]
    const plan: TripPlan = {
      id: generateId(),
      name,
      days: [{
        id: generateId(),
        date: today,
        stops: [],
      }],
      createdAt: new Date().toISOString(),
    }
    addTripPlan(plan)
    setNewPlanName('')
    setShowNewPlan(false)
    setExpandedPlanId(plan.id)
    toast.success(`Trip "${name}" created`)
  }, [newPlanName, tripPlans.length, addTripPlan])

  const handleAddDay = useCallback((planId: string) => {
    const plan = tripPlans.find((p) => p.id === planId)
    if (!plan) return
    const lastDay = plan.days[plan.days.length - 1]
    const nextDate = lastDay
      ? new Date(new Date(lastDay.date).getTime() + 86400000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    const day: TripDay = { id: generateId(), date: nextDate, stops: [] }
    addTripDay(planId, day)
    toast.success(`Day added: ${nextDate}`)
  }, [tripPlans, addTripDay])

  const handleAddStop = useCallback((planId: string, dayId: string) => {
    const plan = tripPlans.find((p) => p.id === planId)
    const day = plan?.days.find((d) => d.id === dayId)
    if (!day) return
    const order = day.stops.length
    const stop: TripStop = {
      id: generateId(),
      name: `Stop ${order + 1}`,
      latitude: 0,
      longitude: 0,
      arrivalTime: null,
      departureTime: null,
      notes: '',
      order,
    }
    addTripStop(planId, dayId, stop)
    setEditingStopId(stop.id)
  }, [tripPlans, addTripStop])

  const handleDragStart = useCallback((stopId: string) => {
    setDragStopId(stopId)
  }, [])

  const handleDrop = useCallback((planId: string, dayId: string, targetIndex: number) => {
    const plan = tripPlans.find((p) => p.id === planId)
    const day = plan?.days.find((d) => d.id === dayId)
    if (!day || !dragStopId) return

    const stops = [...day.stops]
    const dragIndex = stops.findIndex((s) => s.id === dragStopId)
    if (dragIndex === -1 || dragIndex === targetIndex) {
      setDragStopId(null)
      return
    }

    const [moved] = stops.splice(dragIndex, 1)
    stops.splice(targetIndex, 0, moved)
    const reordered = stops.map((s, i) => ({ ...s, order: i }))
    reorderTripStops(planId, dayId, reordered)
    setDragStopId(null)
  }, [tripPlans, dragStopId, reorderTripStops])

  const handleExportItinerary = useCallback((plan: TripPlan) => {
    let text = `🗺️ ${plan.name}\n${'='.repeat(40)}\n\n`
    let totalDistance = 0

    plan.days.forEach((day, dayIdx) => {
      text += `📅 Day ${dayIdx + 1} - ${day.date}\n${'-'.repeat(30)}\n`
      day.stops.forEach((stop, stopIdx) => {
        text += `  ${stopIdx + 1}. ${stop.name}\n`
        if (stop.arrivalTime) text += `     Arrive: ${stop.arrivalTime}\n`
        if (stop.departureTime) text += `     Depart: ${stop.departureTime}\n`
        if (stop.notes) text += `     Notes: ${stop.notes}\n`
        text += `     📍 ${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}\n`

        if (stopIdx > 0) {
          const prev = day.stops[stopIdx - 1]
          totalDistance += haversineDistance(prev.latitude, prev.longitude, stop.latitude, stop.longitude)
        }
      })
      text += '\n'
    })

    text += `${'='.repeat(40)}\n`
    text += `Total estimated distance: ${totalDistance.toFixed(1)} km\n`

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      toast.success('Itinerary copied to clipboard')
    }
  }, [])

  const planStats = useMemo(() => {
    const stats: Record<string, { stops: number; distance: number }> = {}
    tripPlans.forEach((plan) => {
      let stops = 0
      let distance = 0
      plan.days.forEach((day) => {
        stops += day.stops.length
        day.stops.forEach((s, i) => {
          if (i > 0) {
            const prev = day.stops[i - 1]
            distance += haversineDistance(prev.latitude, prev.longitude, s.latitude, s.longitude)
          }
        })
      })
      stats[plan.id] = { stops, distance }
    })
    return stats
  }, [tripPlans])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Trip Planner
        </h3>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={() => setShowNewPlan(true)}
        >
          <Plus className="h-3 w-3" />
          New Trip
        </Button>
      </div>

      {/* New Trip Form */}
      <AnimatePresence>
        {showNewPlan && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 p-2 rounded-lg bg-accent/30 border border-border/50">
              <Input
                placeholder="Trip name..."
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlan()}
                className="h-8 text-xs"
                autoFocus
              />
              <Button size="sm" className="h-8 text-xs shrink-0" onClick={handleCreatePlan}>
                Create
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs shrink-0" onClick={() => setShowNewPlan(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tripPlans.length === 0 && !showNewPlan && (
        <div className="text-center py-6 text-xs text-muted-foreground">
          <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No trips planned yet</p>
          <p className="mt-1">Create a trip to plan day-by-day stops</p>
        </div>
      )}

      {/* Trip Plans List */}
      <ScrollArea className="max-h-96">
        <div className="space-y-2">
          {tripPlans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id
            const stats = planStats[plan.id]

            return (
              <motion.div
                key={plan.id}
                layout
                className="rounded-lg border border-border/50 bg-card overflow-hidden"
              >
                {/* Plan Header */}
                <button
                  className="w-full flex items-center gap-2 p-3 hover:bg-accent/20 transition-colors text-left"
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{plan.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                        {plan.days.length} day{plan.days.length !== 1 ? 's' : ''}
                      </Badge>
                      {stats && stats.stops > 0 && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                          {stats.stops} stops · {stats.distance.toFixed(1)}km
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExportItinerary(plan)
                      }}
                      title="Export itinerary"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTripPlan(plan.id)
                        if (expandedPlanId === plan.id) setExpandedPlanId(null)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-2">
                        {plan.days.map((day, dayIdx) => {
                          const isDayExpanded = expandedDayId === day.id
                          return (
                            <div key={day.id} className="rounded-md bg-accent/10 p-2">
                              <button
                                className="w-full flex items-center gap-2 text-left"
                                onClick={() => setExpandedDayId(isDayExpanded ? null : day.id)}
                              >
                                {isDayExpanded ? (
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                )}
                                <span className="text-xs font-medium">Day {dayIdx + 1}</span>
                                <span className="text-[10px] text-muted-foreground">{day.date}</span>
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 ml-auto">
                                  {day.stops.length}
                                </Badge>
                                {plan.days.length > 1 && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5 text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeTripDay(plan.id, day.id)
                                    }}
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </Button>
                                )}
                              </button>

                              <AnimatePresence>
                                {isDayExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-2 space-y-1"
                                  >
                                    {/* Timeline View */}
                                    {day.stops.length > 0 && (
                                      <div className="relative pl-4 mb-2">
                                        {/* Timeline line */}
                                        <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-border" />
                                        {day.stops.map((stop, stopIdx) => {
                                          const isEditing = editingStopId === stop.id
                                          const nextStop = day.stops[stopIdx + 1]
                                          const dist = nextStop
                                            ? haversineDistance(stop.latitude, stop.longitude, nextStop.latitude, nextStop.longitude)
                                            : 0

                                          return (
                                            <motion.div
                                              key={stop.id}
                                              layout
                                              className={cn(
                                                'relative mb-1 group',
                                                dragStopId === stop.id && 'opacity-50'
                                              )}
                                              draggable
                                              onDragStart={() => handleDragStart(stop.id)}
                                              onDragOver={(e) => e.preventDefault()}
                                              onDrop={() => handleDrop(plan.id, day.id, stopIdx)}
                                            >
                                              {/* Timeline dot */}
                                              <div className="absolute left-[-12px] top-2 h-3 w-3 rounded-full border-2 border-primary bg-background" />

                                              <div className="rounded-md bg-background border border-border/50 p-2">
                                                {isEditing ? (
                                                  <div className="space-y-1.5">
                                                    <Input
                                                      value={stop.name}
                                                      onChange={(e) => updateTripStop(plan.id, day.id, stop.id, { name: e.target.value })}
                                                      className="h-7 text-xs"
                                                      placeholder="Stop name"
                                                    />
                                                    <div className="flex gap-1.5">
                                                      <div className="flex items-center gap-1 flex-1">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        <Input
                                                          type="time"
                                                          value={stop.arrivalTime || ''}
                                                          onChange={(e) => updateTripStop(plan.id, day.id, stop.id, { arrivalTime: e.target.value || null })}
                                                          className="h-6 text-[10px]"
                                                        />
                                                      </div>
                                                      <div className="flex items-center gap-1 flex-1">
                                                        <Navigation className="h-3 w-3 text-muted-foreground" />
                                                        <Input
                                                          type="time"
                                                          value={stop.departureTime || ''}
                                                          onChange={(e) => updateTripStop(plan.id, day.id, stop.id, { departureTime: e.target.value || null })}
                                                          className="h-6 text-[10px]"
                                                        />
                                                      </div>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                      <Input
                                                        type="number"
                                                        value={stop.latitude || ''}
                                                        onChange={(e) => updateTripStop(plan.id, day.id, stop.id, { latitude: parseFloat(e.target.value) || 0 })}
                                                        className="h-6 text-[10px]"
                                                        placeholder="Lat"
                                                        step="0.0001"
                                                      />
                                                      <Input
                                                        type="number"
                                                        value={stop.longitude || ''}
                                                        onChange={(e) => updateTripStop(plan.id, day.id, stop.id, { longitude: parseFloat(e.target.value) || 0 })}
                                                        className="h-6 text-[10px]"
                                                        placeholder="Lng"
                                                        step="0.0001"
                                                      />
                                                    </div>
                                                    <Textarea
                                                      value={stop.notes}
                                                      onChange={(e) => updateTripStop(plan.id, day.id, stop.id, { notes: e.target.value })}
                                                      className="min-h-[40px] text-xs"
                                                      placeholder="Notes..."
                                                    />
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="h-6 text-xs w-full"
                                                      onClick={() => setEditingStopId(null)}
                                                    >
                                                      Done
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  <div>
                                                    <div className="flex items-center gap-1">
                                                      <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                                                      <span className="text-xs font-medium">{stop.name}</span>
                                                      {stop.arrivalTime && (
                                                        <span className="text-[10px] text-muted-foreground ml-auto">
                                                          {stop.arrivalTime}
                                                          {stop.departureTime && ` → ${stop.departureTime}`}
                                                        </span>
                                                      )}
                                                    </div>
                                                    {stop.latitude !== 0 && (
                                                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                                        <MapPin className="h-2.5 w-2.5" />
                                                        {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                                                      </div>
                                                    )}
                                                    {stop.notes && (
                                                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                                        <FileText className="h-2.5 w-2.5" />
                                                        {stop.notes}
                                                      </div>
                                                    )}
                                                    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-5 w-5"
                                                        onClick={() => setEditingStopId(stop.id)}
                                                      >
                                                        <FileText className="h-2.5 w-2.5" />
                                                      </Button>
                                                      <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-5 w-5 text-destructive"
                                                        onClick={() => removeTripStop(plan.id, day.id, stop.id)}
                                                      >
                                                        <Trash2 className="h-2.5 w-2.5" />
                                                      </Button>
                                                      {stop.latitude !== 0 && (
                                                        <Button
                                                          size="icon"
                                                          variant="ghost"
                                                          className="h-5 w-5"
                                                          onClick={() => {
                                                            if (typeof window !== 'undefined') {
                                                              const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
                                                              if (flyTo) flyTo(stop.longitude, stop.latitude, 14)
                                                            }
                                                          }}
                                                        >
                                                          <MapPin className="h-2.5 w-2.5" />
                                                        </Button>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              {/* Distance to next stop */}
                                              {nextStop && dist > 0 && (
                                                <div className="flex items-center gap-1 my-1 ml-2">
                                                  <div className="w-px h-3 bg-border" />
                                                  <span className="text-[9px] text-muted-foreground">
                                                    {dist.toFixed(1)} km
                                                  </span>
                                                </div>
                                              )}
                                            </motion.div>
                                          )
                                        })}
                                      </div>
                                    )}

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full h-7 text-xs gap-1"
                                      onClick={() => handleAddStop(plan.id, day.id)}
                                    >
                                      <Plus className="h-3 w-3" />
                                      Add Stop
                                    </Button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full h-7 text-xs gap-1"
                          onClick={() => handleAddDay(plan.id)}
                        >
                          <Plus className="h-3 w-3" />
                          Add Day
                        </Button>

                        {/* Trip Summary */}
                        {stats && stats.stops > 0 && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>Total: {stats.stops} stops</span>
                              <span>~{stats.distance.toFixed(1)} km</span>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
