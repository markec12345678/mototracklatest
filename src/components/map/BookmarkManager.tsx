'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark,
  FolderPlus,
  Trash2,
  Edit3,
  Search,
  Check,
  X,
  MapPin,
  Folder,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMapStore, type BookmarkFolder } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const FOLDER_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
]

const FOLDER_EMOJIS = [
  '📁', '🌍', '⭐', '❤️', '🏠', '✈️', '🏔️', '🏖️',
  '🗺️', '📍', '🌆', '🏰', '🍣', '🍷', '🛒', '🎯',
]

interface BookmarkManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookmarkManager({ open, onOpenChange }: BookmarkManagerProps) {
  const {
    bookmarkFolders,
    savedLocations,
    addBookmarkFolder,
    deleteBookmarkFolder,
    updateBookmarkFolder,
    addLocationToFolder,
    removeLocationFromFolder,
  } = useMapStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null)
  const [moveLocationId, setMoveLocationId] = useState<string | null>(null)

  // New folder form state
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const [newFolderEmoji, setNewFolderEmoji] = useState(FOLDER_EMOJIS[0])

  // Edit folder form state
  const [editFolderName, setEditFolderName] = useState('')
  const [editFolderColor, setEditFolderColor] = useState('')
  const [editFolderEmoji, setEditFolderEmoji] = useState('')

  // Filter locations by search
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return savedLocations
    const q = searchQuery.toLowerCase()
    return savedLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q) ||
        loc.description?.toLowerCase().includes(q)
    )
  }, [savedLocations, searchQuery])

  // Locations not in any folder
  const unassignedLocations = useMemo(() => {
    const assignedIds = new Set(bookmarkFolders.flatMap((f) => f.locationIds))
    return filteredLocations.filter((loc) => !assignedIds.has(loc.id))
  }, [filteredLocations, bookmarkFolders])

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }, [])

  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required')
      return
    }
    const folder: BookmarkFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newFolderName.trim(),
      color: newFolderColor,
      emoji: newFolderEmoji,
      locationIds: [],
    }
    addBookmarkFolder(folder)
    setNewFolderName('')
    setNewFolderColor(FOLDER_COLORS[0])
    setNewFolderEmoji(FOLDER_EMOJIS[0])
    setIsCreatingFolder(false)
    toast.success(`Folder "${folder.name}" created`)
  }, [newFolderName, newFolderColor, newFolderEmoji, addBookmarkFolder])

  const handleStartEdit = useCallback((folder: BookmarkFolder) => {
    setEditingFolderId(folder.id)
    setEditFolderName(folder.name)
    setEditFolderColor(folder.color)
    setEditFolderEmoji(folder.emoji)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingFolderId || !editFolderName.trim()) return
    updateBookmarkFolder(editingFolderId, {
      name: editFolderName.trim(),
      color: editFolderColor,
      emoji: editFolderEmoji,
    })
    setEditingFolderId(null)
    toast.success('Folder updated')
  }, [editingFolderId, editFolderName, editFolderColor, editFolderEmoji, updateBookmarkFolder])

  const handleDeleteFolder = useCallback(() => {
    if (!deleteFolderId) return
    const folder = bookmarkFolders.find((f) => f.id === deleteFolderId)
    deleteBookmarkFolder(deleteFolderId)
    setDeleteFolderId(null)
    if (folder) toast.success(`Folder "${folder.name}" deleted`)
  }, [deleteFolderId, bookmarkFolders, deleteBookmarkFolder])

  const handleMoveLocation = useCallback((locationId: string, folderId: string) => {
    addLocationToFolder(folderId, locationId)
    setMoveLocationId(null)
    toast.success('Location moved to folder')
  }, [addLocationToFolder])

  const handleJumpToLocation = useCallback((lat: number, lng: number) => {
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) {
      flyTo(lng, lat, 14)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-red-600/10 border-b border-border/50 px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Bookmark className="h-4 w-4 text-white" />
              </div>
              Bookmark Manager
            </DialogTitle>
            <DialogDescription>
              Organize your saved locations into folders for quick access.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[55vh]">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="pl-9 rounded-xl text-sm"
            />
          </div>

          {/* Create Folder Button */}
          <Button
            variant="outline"
            className="w-full rounded-xl border-dashed gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsCreatingFolder(true)}
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>

          {/* Create Folder Form */}
          <AnimatePresence>
            {isCreatingFolder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-border/50 p-4 space-y-3 bg-muted/20">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Folder Name</Label>
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="e.g. Travel Plans"
                      className="rounded-xl text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Color</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {FOLDER_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setNewFolderColor(c)}
                          className={cn(
                            'w-7 h-7 rounded-lg transition-all hover:scale-110',
                            newFolderColor === c && 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110'
                          )}
                          style={{ backgroundColor: c }}
                          aria-label={`Select color ${c}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Emoji</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {FOLDER_EMOJIS.map((e) => (
                        <button
                          key={e}
                          onClick={() => setNewFolderEmoji(e)}
                          className={cn(
                            'w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all hover:scale-110',
                            newFolderEmoji === e && 'bg-primary/10 ring-1 ring-primary scale-110'
                          )}
                          aria-label={`Select emoji ${e}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl flex-1"
                      onClick={() => setIsCreatingFolder(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                      onClick={handleCreateFolder}
                    >
                      <FolderPlus className="h-3.5 w-3.5 mr-1" />
                      Create
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Folders */}
          <div className="space-y-2">
            {bookmarkFolders.length === 0 && !isCreatingFolder && (
              <div className="text-center py-6 text-muted-foreground">
                <Folder className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No folders yet</p>
                <p className="text-xs mt-1">Create a folder to organize your bookmarks</p>
              </div>
            )}

            {bookmarkFolders.map((folder) => {
              const isExpanded = expandedFolders.has(folder.id)
              const isEditing = editingFolderId === folder.id
              const folderLocations = folder.locationIds
                .map((id) => savedLocations.find((l) => l.id === id))
                .filter(Boolean)

              return (
                <motion.div
                  key={folder.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="rounded-xl border border-border/50 overflow-hidden"
                >
                  {/* Folder Header */}
                  <div
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors',
                      'hover:bg-muted/50'
                    )}
                    style={{ borderLeftWidth: 3, borderLeftColor: folder.color }}
                    onClick={() => toggleFolder(folder.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-base leading-none shrink-0">{folder.emoji}</span>

                    {isEditing ? (
                      <Input
                        value={editFolderName}
                        onChange={(e) => setEditFolderName(e.target.value)}
                        className="h-7 rounded-lg text-sm flex-1"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') setEditingFolderId(null)
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium flex-1 truncate">{folder.name}</span>
                    )}

                    <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                      {folder.locationIds.length}
                    </span>

                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 rounded-md hover:bg-emerald-500/20 text-emerald-600 transition-colors"
                            aria-label="Save changes"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingFolderId(null)}
                            className="p-1 rounded-md hover:bg-destructive/20 text-destructive transition-colors"
                            aria-label="Cancel editing"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(folder)}
                            className="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                            aria-label="Edit folder"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setDeleteFolderId(folder.id)}
                            className="p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Delete folder"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Folder Content (expanded) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-2 space-y-1">
                          {isEditing && (
                            <div className="flex gap-2 mb-2">
                              <div className="flex gap-1 flex-wrap">
                                {FOLDER_COLORS.map((c) => (
                                  <button
                                    key={c}
                                    onClick={() => setEditFolderColor(c)}
                                    className={cn(
                                      'w-5 h-5 rounded-md transition-all hover:scale-110',
                                      editFolderColor === c && 'ring-2 ring-foreground ring-offset-1 ring-offset-background'
                                    )}
                                    style={{ backgroundColor: c }}
                                    aria-label={`Select color ${c}`}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-0.5 flex-wrap ml-auto">
                                {FOLDER_EMOJIS.slice(0, 8).map((e) => (
                                  <button
                                    key={e}
                                    onClick={() => setEditFolderEmoji(e)}
                                    className={cn(
                                      'w-6 h-6 rounded-md text-xs flex items-center justify-center transition-all hover:scale-110',
                                      editFolderEmoji === e && 'bg-primary/10 ring-1 ring-primary'
                                    )}
                                  >
                                    {e}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {folderLocations.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              No locations in this folder. Add from unassigned below.
                            </p>
                          ) : (
                            folderLocations.map((loc) => (
                              <div
                                key={loc!.id}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors group"
                              >
                                <MapPin className="h-3 w-3 shrink-0" style={{ color: loc!.color }} />
                                <button
                                  onClick={() => handleJumpToLocation(loc!.latitude, loc!.longitude)}
                                  className="text-xs font-medium truncate flex-1 text-left hover:text-primary transition-colors"
                                >
                                  {loc!.name}
                                </button>
                                <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                                  {loc!.latitude.toFixed(2)}°, {loc!.longitude.toFixed(2)}°
                                </span>
                                <button
                                  onClick={() => removeLocationFromFolder(folder.id, loc!.id)}
                                  className="p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                                  aria-label="Remove from folder"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* Unassigned Locations */}
          {unassignedLocations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Unassigned ({unassignedLocations.length})
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-border/30 p-2">
                {unassignedLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <MapPin className="h-3 w-3 shrink-0" style={{ color: loc.color }} />
                    <button
                      onClick={() => handleJumpToLocation(loc.latitude, loc.longitude)}
                      className="text-xs font-medium truncate flex-1 text-left hover:text-primary transition-colors"
                    >
                      {loc.name}
                    </button>
                    {bookmarkFolders.length > 0 && (
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {moveLocationId === loc.id ? (
                          <div className="flex items-center gap-1">
                            {bookmarkFolders.map((f) => (
                              <button
                                key={f.id}
                                onClick={() => handleMoveLocation(loc.id, f.id)}
                                className="text-xs px-1.5 py-0.5 rounded-md border border-border/50 hover:bg-primary/10 transition-colors"
                                style={{ borderLeftWidth: 2, borderLeftColor: f.color }}
                                title={`Move to ${f.name}`}
                              >
                                {f.emoji}
                              </button>
                            ))}
                            <button
                              onClick={() => setMoveLocationId(null)}
                              className="p-0.5 rounded-md hover:bg-muted text-muted-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setMoveLocationId(loc.id)}
                            className="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                            aria-label="Move to folder"
                            title="Move to folder"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All saved locations count */}
          <div className="text-center text-xs text-muted-foreground/60 pt-1">
            {savedLocations.length} saved location{savedLocations.length !== 1 ? 's' : ''} in {bookmarkFolders.length} folder{bookmarkFolders.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteFolderId} onOpenChange={(v) => !v && setDeleteFolderId(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the folder but won&apos;t delete the saved locations.
                Locations will return to the unassigned list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteFolder}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
