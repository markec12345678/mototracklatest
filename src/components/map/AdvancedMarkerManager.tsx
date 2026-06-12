'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useMapStore, type MapMarker, type MarkerManagerState } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  MapPin,
  Search,
  Filter,
  Trash2,
  Edit3,
  Download,
  CheckSquare,
  Square,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  Move,
  Palette,
  Tag,
  BarChart3,
} from 'lucide-react'

// Predefined icons for markers
const PREDEFINED_ICONS = [
  '📍', '🏠', '☕', '🍔', '⛽', '🏥', '🏫', '🛒', '🌳', '⛺',
  '🚗', '✈️', '🚂', '🏖️', '🏔️', '🎪', '📷', '🎯', '⭐', '❤️',
  '🚩', '🔔', '💎', '🎪', '🎭', '🏛️', '🕌', '🕍', '⛩️', '🕋',
]

// Predefined colors
const PREDEFINED_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
]

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function AdvancedMarkerManager() {
  const markers = useMapStore((s) => s.markers)
  const savedLocations = useMapStore((s) => s.savedLocations)
  const markerManagerState = useMapStore((s) => s.markerManagerState)
  const setMarkerManagerState = useMapStore((s) => s.setMarkerManagerState)
  const markerManagerOpen = useMapStore((s) => s.markerManagerOpen)
  const setMarkerManagerOpen = useMapStore((s) => s.setMarkerManagerOpen)
  const center = useMapStore((s) => s.center)
  const removeMarker = useMapStore((s) => s.removeMarker)
  const setMarkers = useMapStore((s) => s.setMarkers)
  const markerCategories = useMapStore((s) => s.markerCategories)
  const addMarker = useMapStore((s) => s.addMarker)

  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [bulkCategory, setBulkCategory] = useState('')
  const [bulkColor, setBulkColor] = useState('#ef4444')
  const [showBulkPanel, setShowBulkPanel] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [moveOffset, setMoveOffset] = useState(100)

  // Combine markers and saved locations into a unified list
  const allMarkers = useMemo(() => {
    const locationMarkers: MapMarker[] = savedLocations.map((loc) => ({
      id: loc.id,
      longitude: loc.longitude,
      latitude: loc.latitude,
      name: loc.name,
      description: loc.description,
      color: loc.color,
      category: loc.category,
      icon: loc.icon,
    }))
    return [...markers, ...locationMarkers]
  }, [markers, savedLocations])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allMarkers.map((m) => m.category).filter(Boolean))
    return Array.from(cats)
  }, [allMarkers])

  // Filter and sort markers
  const filteredMarkers = useMemo(() => {
    let result = allMarkers

    // Search filter
    if (markerManagerState.searchQuery) {
      const q = markerManagerState.searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q))
      )
    }

    // Category filter
    if (markerManagerState.filterCategory) {
      result = result.filter((m) => m.category === markerManagerState.filterCategory)
    }

    // Sort
    const [centerLng, centerLat] = center
    switch (markerManagerState.sortBy) {
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'date':
        // Use id as proxy for date (newer ids are typically later)
        result = [...result].sort((a, b) => b.id.localeCompare(a.id))
        break
      case 'distance':
        result = [...result].sort((a, b) => {
          const distA = haversineDistance(centerLat, centerLng, a.latitude, a.longitude)
          const distB = haversineDistance(centerLat, centerLng, b.latitude, b.longitude)
          return distA - distB
        })
        break
    }

    return result
  }, [allMarkers, markerManagerState, center])

  // Selected markers
  const selectedMarkers = useMemo(
    () => allMarkers.filter((m) => markerManagerState.selectedMarkerIds.includes(m.id)),
    [allMarkers, markerManagerState.selectedMarkerIds]
  )

  const toggleMarkerSelection = useCallback(
    (id: string) => {
      const current = markerManagerState.selectedMarkerIds
      const newSelected = current.includes(id)
        ? current.filter((sid) => sid !== id)
        : [...current, id]
      setMarkerManagerState({ selectedMarkerIds: newSelected })
    },
    [markerManagerState.selectedMarkerIds, setMarkerManagerState]
  )

  const selectAll = useCallback(() => {
    setMarkerManagerState({ selectedMarkerIds: filteredMarkers.map((m) => m.id) })
  }, [filteredMarkers, setMarkerManagerState])

  const deselectAll = useCallback(() => {
    setMarkerManagerState({ selectedMarkerIds: [] })
  }, [setMarkerManagerState])

  // Bulk delete
  const handleBulkDelete = useCallback(() => {
    const count = markerManagerState.selectedMarkerIds.length
    markerManagerState.selectedMarkerIds.forEach((id) => {
      removeMarker(id)
    })
    setMarkerManagerState({ selectedMarkerIds: [] })
    toast.success(`Deleted ${count} marker${count !== 1 ? 's' : ''}`)
  }, [markerManagerState.selectedMarkerIds, removeMarker, setMarkerManagerState])

  // Bulk category change
  const handleBulkCategoryChange = useCallback(() => {
    if (!bulkCategory) return
    const updatedMarkers = markers.map((m) =>
      markerManagerState.selectedMarkerIds.includes(m.id)
        ? { ...m, category: bulkCategory }
        : m
    )
    setMarkers(updatedMarkers)
    toast.success(`Changed category to "${bulkCategory}" for ${markerManagerState.selectedMarkerIds.length} markers`)
  }, [bulkCategory, markers, markerManagerState.selectedMarkerIds, setMarkers])

  // Bulk color change
  const handleBulkColorChange = useCallback(() => {
    const updatedMarkers = markers.map((m) =>
      markerManagerState.selectedMarkerIds.includes(m.id)
        ? { ...m, color: bulkColor }
        : m
    )
    setMarkers(updatedMarkers)
    toast.success(`Changed color for ${markerManagerState.selectedMarkerIds.length} markers`)
  }, [bulkColor, markers, markerManagerState.selectedMarkerIds, setMarkers])

  // Bulk move
  const handleBulkMove = useCallback(() => {
    const offsetMeters = moveOffset
    const earthRadius = 6371000
    // Move north by offset meters
    const dLat = (offsetMeters / earthRadius) * (180 / Math.PI)
    const updatedMarkers = markers.map((m) =>
      markerManagerState.selectedMarkerIds.includes(m.id)
        ? { ...m, latitude: m.latitude + dLat, longitude: m.longitude }
        : m
    )
    setMarkers(updatedMarkers)
    toast.success(`Moved ${markerManagerState.selectedMarkerIds.length} markers by ${offsetMeters}m`)
  }, [moveOffset, markers, markerManagerState.selectedMarkerIds, setMarkers])

  // Bulk export GeoJSON
  const handleBulkExport = useCallback(() => {
    const selected = markerManagerState.selectedMarkerIds.length > 0 ? selectedMarkers : filteredMarkers
    const geojson = {
      type: 'FeatureCollection' as const,
      features: selected.map((m) => ({
        type: 'Feature' as const,
        properties: {
          name: m.name,
          description: m.description || '',
          category: m.category,
          color: m.color,
          icon: m.icon || '',
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [m.longitude, m.latitude],
        },
      })),
    }
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markers.geojson'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${selected.length} markers as GeoJSON`)
  }, [markerManagerState.selectedMarkerIds, selectedMarkers, filteredMarkers])

  // Area select mode
  const handleAreaSelect = useCallback(() => {
    const map = (window as any).__mainMap
    if (!map) return

    setMarkerManagerState({ areaSelectMode: true })
    toast.info('Draw a rectangle on the map to select markers within it')

    // We'll set up a one-time box selection handler
    const canvas = map.getCanvas()
    let startX = 0
    let startY = 0
    let isDrawing = false

    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX
      startY = e.clientY
      isDrawing = true
    }

    const onMouseUp = (e: MouseEvent) => {
      if (!isDrawing) return
      isDrawing = false

      const endX = e.clientX
      const endY = e.clientY

      const sw = map.unproject([Math.min(startX, endX), Math.max(startY, endY)])
      const ne = map.unproject([Math.max(startX, endX), Math.min(startY, endY)])

      const selectedIds = allMarkers
        .filter((m) => {
          return (
            m.longitude >= sw.lng &&
            m.longitude <= ne.lng &&
            m.latitude >= sw.lat &&
            m.latitude <= ne.lat
          )
        })
        .map((m) => m.id)

      setMarkerManagerState({
        selectedMarkerIds: selectedIds,
        areaSelectMode: false,
      })
      toast.success(`Selected ${selectedIds.length} markers in area`)

      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mouseup', onMouseUp)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mouseup', onMouseUp)
  }, [allMarkers, setMarkerManagerState])

  // Edit marker
  const startEditing = useCallback(
    (marker: MapMarker) => {
      setEditingMarkerId(marker.id)
      setEditName(marker.name)
      setEditDescription(marker.description || '')
      setEditCategory(marker.category)
      setEditColor(marker.color)
      setEditIcon(marker.icon || '📍')
      setEditNotes('')
    },
    []
  )

  const saveEdit = useCallback(() => {
    if (!editingMarkerId) return
    const updatedMarkers = markers.map((m) =>
      m.id === editingMarkerId
        ? {
            ...m,
            name: editName,
            description: editDescription,
            category: editCategory,
            color: editColor,
            icon: editIcon,
          }
        : m
    )
    setMarkers(updatedMarkers)
    setEditingMarkerId(null)
    toast.success('Marker updated')
  }, [editingMarkerId, editName, editDescription, editCategory, editColor, editIcon, markers, setMarkers])

  // Copy coordinates
  const copyCoordinates = useCallback((lat: number, lng: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      toast.success('Coordinates copied to clipboard')
    }
  }, [])

  // Navigate to marker
  const navigateToMarker = useCallback((lng: number, lat: number) => {
    const map = (window as any).__mainMap
    if (map) {
      map.flyTo({ center: [lng, lat], zoom: 15 })
    }
  }, [])

  // Statistics
  const stats = useMemo(() => {
    if (allMarkers.length === 0) return null

    const byCategory: Record<string, number> = {}
    allMarkers.forEach((m) => {
      const cat = m.category || 'Uncategorized'
      byCategory[cat] = (byCategory[cat] || 0) + 1
    })

    // Average distance
    let totalDist = 0
    let pairs = 0
    for (let i = 0; i < allMarkers.length; i++) {
      for (let j = i + 1; j < allMarkers.length; j++) {
        totalDist += haversineDistance(
          allMarkers[i].latitude,
          allMarkers[i].longitude,
          allMarkers[j].latitude,
          allMarkers[j].longitude
        )
        pairs++
      }
    }
    const avgDist = pairs > 0 ? totalDist / pairs : 0

    // Bounding box
    const lats = allMarkers.map((m) => m.latitude)
    const lngs = allMarkers.map((m) => m.longitude)
    const bbox = {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    }

    return { total: allMarkers.length, byCategory, avgDist, bbox }
  }, [allMarkers])

  return (
    <Dialog open={markerManagerOpen} onOpenChange={setMarkerManagerOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" />
            Advanced Marker Manager
            <Badge variant="secondary" className="ml-2 text-xs">
              {allMarkers.length} marker{allMarkers.length !== 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-3">
          {/* Search & Filter Bar */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search markers..."
                value={markerManagerState.searchQuery}
                onChange={(e) => setMarkerManagerState({ searchQuery: e.target.value })}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Select
              value={markerManagerState.filterCategory || 'all'}
              onValueChange={(v) => setMarkerManagerState({ filterCategory: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={markerManagerState.sortBy}
              onValueChange={(v) => setMarkerManagerState({ sortBy: v as MarkerManagerState['sortBy'] })}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action buttons row */}
          <div className="flex gap-1.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={selectAll}
            >
              <CheckSquare className="h-3 w-3" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={deselectAll}
            >
              <Square className="h-3 w-3" />
              Deselect
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleAreaSelect}
            >
              <Filter className="h-3 w-3" />
              Area Select
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setShowBulkPanel(!showBulkPanel)}
            >
              <Edit3 className="h-3 w-3" />
              Bulk Ops
              {showBulkPanel ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleBulkExport}
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart3 className="h-3 w-3" />
              Stats
            </Button>
            {markerManagerState.selectedMarkerIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-3 w-3" />
                Delete ({markerManagerState.selectedMarkerIds.length})
              </Button>
            )}
          </div>

          {/* Bulk Operations Panel */}
          {showBulkPanel && (
            <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
              <div className="text-xs font-medium flex items-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5" />
                Bulk Operations
                {markerManagerState.selectedMarkerIds.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-4">
                    {markerManagerState.selectedMarkerIds.length} selected
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Bulk Category */}
                <div className="flex gap-1.5 items-center">
                  <Select value={bulkCategory} onValueChange={setBulkCategory}>
                    <SelectTrigger className="flex-1 h-7 text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0"
                    onClick={handleBulkCategoryChange}
                    disabled={!bulkCategory || markerManagerState.selectedMarkerIds.length === 0}
                  >
                    Apply
                  </Button>
                </div>
                {/* Bulk Color */}
                <div className="flex gap-1.5 items-center">
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="color"
                      value={bulkColor}
                      onChange={(e) => setBulkColor(e.target.value)}
                      className="h-7 w-7 rounded border cursor-pointer"
                    />
                    <Palette className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0"
                    onClick={handleBulkColorChange}
                    disabled={markerManagerState.selectedMarkerIds.length === 0}
                  >
                    Apply
                  </Button>
                </div>
                {/* Bulk Move */}
                <div className="flex gap-1.5 items-center col-span-2">
                  <Move className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Input
                    type="number"
                    value={moveOffset}
                    onChange={(e) => setMoveOffset(Number(e.target.value))}
                    className="h-7 w-20 text-xs"
                    min={1}
                  />
                  <span className="text-xs text-muted-foreground">meters north</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0"
                    onClick={handleBulkMove}
                    disabled={markerManagerState.selectedMarkerIds.length === 0}
                  >
                    Move
                  </Button>
                </div>
              </div>
              {/* Quick color buttons */}
              <div className="flex gap-1 items-center">
                <span className="text-xs text-muted-foreground mr-1">Quick:</span>
                {PREDEFINED_COLORS.map((c) => (
                  <button
                    key={c}
                    className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: bulkColor === c ? 'white' : 'transparent' }}
                    onClick={() => setBulkColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Statistics Panel */}
          {showStats && stats && (
            <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
              <div className="text-xs font-medium flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Marker Statistics
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="border rounded-md p-2 text-center">
                  <div className="text-lg font-bold text-emerald-600">{stats.total}</div>
                  <div className="text-muted-foreground">Total</div>
                </div>
                <div className="border rounded-md p-2 text-center">
                  <div className="text-lg font-bold text-amber-600">
                    {stats.avgDist > 1000
                      ? `${(stats.avgDist / 1000).toFixed(1)}k`
                      : Math.round(stats.avgDist)}
                  </div>
                  <div className="text-muted-foreground">Avg Dist (m)</div>
                </div>
                <div className="border rounded-md p-2 text-center">
                  <div className="text-lg font-bold text-cyan-600">{Object.keys(stats.byCategory).length}</div>
                  <div className="text-muted-foreground">Categories</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(stats.byCategory).map(([cat, count]) => (
                  <Badge key={cat} variant="secondary" className="text-[10px]">
                    {cat}: {count}
                  </Badge>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Bounding Box: [{stats.bbox.minLat.toFixed(4)}, {stats.bbox.minLng.toFixed(4)}] to [{stats.bbox.maxLat.toFixed(4)}, {stats.bbox.maxLng.toFixed(4)}]
              </div>
            </div>
          )}

          {/* Marker List */}
          <div className="flex-1 overflow-y-auto border rounded-lg min-h-0 max-h-96 custom-scrollbar">
            {filteredMarkers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <MapPin className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No markers found</p>
                <p className="text-xs">Add markers by clicking on the map</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    className={`flex items-start gap-2 p-2.5 hover:bg-accent/50 transition-colors ${
                      markerManagerState.selectedMarkerIds.includes(marker.id) ? 'bg-primary/5' : ''
                    } ${editingMarkerId === marker.id ? 'bg-accent' : ''}`}
                  >
                    <Checkbox
                      checked={markerManagerState.selectedMarkerIds.includes(marker.id)}
                      onCheckedChange={() => toggleMarkerSelection(marker.id)}
                      className="mt-0.5"
                    />
                    <div
                      className="h-3 w-3 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: marker.color || '#6b7280' }}
                    />
                    <div className="flex-1 min-w-0">
                      {editingMarkerId === marker.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-xs"
                            placeholder="Marker name"
                          />
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="min-h-[50px] text-xs"
                            placeholder="Description"
                          />
                          <div className="flex gap-2 items-center">
                            <Select value={editCategory} onValueChange={setEditCategory}>
                              <SelectTrigger className="h-7 text-xs flex-1">
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="h-7 w-7 rounded border cursor-pointer"
                            />
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {PREDEFINED_ICONS.map((icon) => (
                              <button
                                key={icon}
                                className={`h-6 w-6 text-sm flex items-center justify-center rounded transition-colors ${
                                  editIcon === icon ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-accent'
                                }`}
                                onClick={() => setEditIcon(icon)}
                                aria-label={`Select icon ${icon}`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                          <Input
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="h-7 text-xs"
                            placeholder="Notes / Remarks"
                          />
                          <div className="flex gap-1.5">
                            <Button size="sm" className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700" onClick={saveEdit}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px]"
                              onClick={() => setEditingMarkerId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium truncate">{marker.icon || '📍'} {marker.name}</span>
                          </div>
                          {marker.description && (
                            <p className="text-xs text-muted-foreground truncate">{marker.description}</p>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {marker.category && (
                              <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                                {marker.category}
                              </Badge>
                            )}
                            <button
                              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                              onClick={() => copyCoordinates(marker.latitude, marker.longitude)}
                              aria-label="Copy coordinates"
                            >
                              <Copy className="h-2.5 w-2.5" />
                              {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {editingMarkerId !== marker.id && (
                      <div className="flex gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => startEditing(marker)}
                          aria-label="Edit marker"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => navigateToMarker(marker.longitude, marker.latitude)}
                          aria-label="Navigate to marker"
                        >
                          <MapPin className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => {
                            removeMarker(marker.id)
                            toast.success('Marker deleted')
                          }}
                          aria-label="Delete marker"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
