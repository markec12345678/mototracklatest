'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StickyNote,
  Plus,
  Trash2,
  Search,
  Filter,
  Download,
  MapPin,
  X,
  Edit3,
  Flag,
  Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useMapStore,
  type MapNote,
  type NotePriority,
} from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const NOTE_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
]

const NOTE_ICONS = ['StickyNote', 'Flag', 'MapPin', 'Star', 'AlertTriangle', 'Info', 'Heart', 'Bookmark']

function generateId() {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function MapNotes() {
  const mapNotes = useMapStore((s) => s.mapNotes)
  const addMapNote = useMapStore((s) => s.addMapNote)
  const updateMapNote = useMapStore((s) => s.updateMapNote)
  const deleteMapNote = useMapStore((s) => s.deleteMapNote)
  const setToolMode = useMapStore((s) => s.setToolMode)
  const toolMode = useMapStore((s) => s.toolMode)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterColor, setFilterColor] = useState<string>('all')
  const [editingNote, setEditingNote] = useState<MapNote | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    color: '#f59e0b',
    icon: 'StickyNote',
    priority: 'medium' as NotePriority,
  })

  const filteredNotes = useMemo(() => {
    return mapNotes.filter((note) => {
      const matchesSearch = searchQuery === '' ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPriority = filterPriority === 'all' || note.priority === filterPriority
      const matchesColor = filterColor === 'all' || note.color === filterColor
      return matchesSearch && matchesPriority && matchesColor
    })
  }, [mapNotes, searchQuery, filterPriority, filterColor])

  const handleAddNote = useCallback(() => {
    if (!newNote.title.trim()) {
      toast.error('Please enter a title for the note')
      return
    }

    // Use current map center for the note location
    const state = useMapStore.getState()
    const [lng, lat] = state.center

    const note: MapNote = {
      id: generateId(),
      title: newNote.title.trim(),
      content: newNote.content,
      latitude: lat,
      longitude: lng,
      color: newNote.color,
      icon: newNote.icon,
      priority: newNote.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addMapNote(note)
    setNewNote({ title: '', content: '', color: '#f59e0b', icon: 'StickyNote', priority: 'medium' })
    setIsAdding(false)
    toast.success(`Note "${note.title}" added`)
  }, [newNote, addMapNote])

  const handleAddNoteAtLocation = useCallback(() => {
    // Switch to notes tool mode so user can click on map
    setToolMode('notes')
    setIsAdding(true)
    toast.info('Click on the map to add a note')
  }, [setToolMode])

  const handleExportGeoJSON = useCallback(() => {
    const geojson = {
      type: 'FeatureCollection' as const,
      features: mapNotes.map((note) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [note.longitude, note.latitude] as [number, number],
        },
        properties: {
          title: note.title,
          content: note.content,
          color: note.color,
          icon: note.icon,
          priority: note.priority,
          createdAt: note.createdAt,
        },
      })),
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'map-notes.geojson'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${mapNotes.length} notes as GeoJSON`)
  }, [mapNotes])

  const handleSaveEdit = useCallback(() => {
    if (editingNote) {
      updateMapNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        color: editingNote.color,
        icon: editingNote.icon,
        priority: editingNote.priority,
      })
      setEditingNote(null)
      toast.success('Note updated')
    }
  }, [editingNote, updateMapNote])

  const priorityConfig: Record<NotePriority, { label: string; color: string; bg: string }> = {
    low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-500/10' },
    medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-500/10' },
    high: { label: 'High', color: 'text-red-600', bg: 'bg-red-500/10' },
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <StickyNote className="h-3.5 w-3.5" />
          Map Notes
        </h3>
        <div className="flex items-center gap-1">
          {mapNotes.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1"
              onClick={handleExportGeoJSON}
              title="Export as GeoJSON"
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={handleAddNoteAtLocation}
          >
            <MapPin className="h-3 w-3" />
            Pin
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      {mapNotes.length > 0 && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs pl-8"
            />
          </div>
          <div className="flex gap-1.5">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-7 text-[10px] flex-1">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterColor} onValueChange={setFilterColor}>
              <SelectTrigger className="h-7 text-[10px] flex-1">
                <Palette className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {NOTE_COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.value }} />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Add Note Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-lg bg-accent/20 border border-border/50 space-y-2">
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))}
                className="h-8 text-xs"
                autoFocus
              />
              <Textarea
                placeholder="Note content..."
                value={newNote.content}
                onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))}
                className="min-h-[60px] text-xs"
              />
              <div className="flex items-center gap-2">
                <Select value={newNote.priority} onValueChange={(v) => setNewNote((p) => ({ ...p, priority: v as NotePriority }))}>
                  <SelectTrigger className="h-7 text-[10px] flex-1">
                    <Flag className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  {NOTE_COLORS.slice(0, 5).map((c) => (
                    <button
                      key={c.value}
                      className={cn(
                        'h-6 w-6 rounded-full border-2 transition-all',
                        newNote.color === c.value ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c.value }}
                      onClick={() => setNewNote((p) => ({ ...p, color: c.value }))}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs flex-1" onClick={handleAddNote}>
                  Add Note
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Note Form */}
      <AnimatePresence>
        {editingNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-lg bg-accent/20 border border-primary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Edit Note</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingNote(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={editingNote.title}
                onChange={(e) => setEditingNote((n) => n ? { ...n, title: e.target.value } : null)}
                className="h-8 text-xs"
              />
              <Textarea
                value={editingNote.content}
                onChange={(e) => setEditingNote((n) => n ? { ...n, content: e.target.value } : null)}
                className="min-h-[60px] text-xs"
              />
              <div className="flex items-center gap-2">
                <Select value={editingNote.priority} onValueChange={(v) => setEditingNote((n) => n ? { ...n, priority: v as NotePriority } : null)}>
                  <SelectTrigger className="h-7 text-[10px] flex-1">
                    <Flag className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  {NOTE_COLORS.slice(0, 5).map((c) => (
                    <button
                      key={c.value}
                      className={cn(
                        'h-6 w-6 rounded-full border-2 transition-all',
                        editingNote.color === c.value ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c.value }}
                      onClick={() => setEditingNote((n) => n ? { ...n, color: c.value } : null)}
                    />
                  ))}
                </div>
              </div>
              <Button size="sm" className="h-7 text-xs w-full" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      {filteredNotes.length === 0 && !isAdding && (
        <div className="text-center py-6 text-xs text-muted-foreground">
          <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>{mapNotes.length === 0 ? 'No notes yet' : 'No notes match your filters'}</p>
          <p className="mt-1">Click the map or use Add to create notes</p>
        </div>
      )}

      <ScrollArea className="max-h-64">
        <div className="space-y-1.5">
          {filteredNotes.map((note) => {
            const pConfig = priorityConfig[note.priority]
            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="group rounded-lg border border-border/50 bg-card p-2.5 hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-start gap-2">
                  {/* Color indicator */}
                  <div
                    className="h-8 w-1.5 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: note.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium truncate">{note.title}</span>
                      <Badge variant="secondary" className={cn('text-[9px] px-1.5 py-0 h-4', pConfig.bg, pConfig.color)}>
                        {pConfig.label}
                      </Badge>
                    </div>
                    {note.content && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {note.content}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5" />
                      {note.latitude.toFixed(4)}, {note.longitude.toFixed(4)}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
                          if (flyTo) flyTo(note.longitude, note.latitude, 14)
                        }
                      }}
                    >
                      <MapPin className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setEditingNote(note)}
                    >
                      <Edit3 className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={() => deleteMapNote(note.id)}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Note count */}
      {mapNotes.length > 0 && (
        <div className="text-[10px] text-muted-foreground text-center">
          {filteredNotes.length} of {mapNotes.length} notes
        </div>
      )}
    </div>
  )
}

// Note pins layer that renders on the map
export function MapNotesLayer() {
  const mapNotes = useMapStore((s) => s.mapNotes)
  const toolMode = useMapStore((s) => s.toolMode)
  const addMapNote = useMapStore((s) => s.addMapNote)
  const setToolMode = useMapStore((s) => s.setToolMode)
  const selectedMarker = useMapStore((s) => s.selectedMarker)
  const setSelectedMarker = useMapStore((s) => s.setSelectedMarker)

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (toolMode !== 'notes') return
    // Only handle clicks on the map background, not on note pins
    if ((e.target as HTMLElement).closest('[data-note-pin]')) return

    // We can't easily get coordinates from this, so we'll skip the map click
    // and rely on the sidebar form instead
  }, [toolMode])

  return (
    <>
      {/* Note pins rendered as map markers */}
      {mapNotes.map((note) => (
        <div
          key={note.id}
          data-note-pin
          className="absolute z-10 cursor-pointer pointer-events-auto"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -100%)',
          }}
          onClick={() => {
            setSelectedMarker(selectedMarker === note.id ? null : note.id)
            if (typeof window !== 'undefined') {
              const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
              if (flyTo) flyTo(note.longitude, note.latitude, 14)
            }
          }}
        >
          {/* Note pin marker */}
          <div className="relative group">
            <div
              className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: note.color }}
            >
              <StickyNote className="h-3 w-3 text-white" />
            </div>
            {/* Pin tip */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent"
              style={{ borderTop: `6px solid ${note.color}` }}
            />
            {/* Priority indicator */}
            {note.priority === 'high' && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border border-white animate-pulse" />
            )}
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-popover text-popover-foreground text-[10px] shadow-lg border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {note.title}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
